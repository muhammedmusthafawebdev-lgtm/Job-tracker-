import React, { useState, useEffect, useRef, FormEvent } from 'react'
import { Application, ApplicationDraft, ApplicationStatus, ModalMode } from '../types'
import { formatDateInput, formatTimeInput, isValidDateString, isValidTimeString, monthLabel } from '../utils/date'
import { Icon } from './Icon'

interface ApplicationModalProps {
  mode: ModalMode
  application: Application | null
  onClose: () => void
  onSave: (draft: ApplicationDraft) => Promise<void>
}

const STATUSES: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Interview',
  'Offer',
  'Rejected',
]

export function ApplicationModal({
  mode,
  application,
  onClose,
  onSave,
}: ApplicationModalProps) {
  const [company, setCompany] = useState(application?.company ?? '')
  const [title, setTitle] = useState(application?.title ?? '')
  const [status, setStatus] = useState<ApplicationStatus>(application?.status ?? 'Applied')
  const [appliedDate, setAppliedDate] = useState(
    application?.appliedDate ?? formatDateInput(new Date())
  )
  const [appliedTime, setAppliedTime] = useState(application?.appliedTime ?? '')
  const [location, setLocation] = useState(application?.location ?? '')
  const [salary, setSalary] = useState(application?.salary ?? '')
  const [url, setUrl] = useState(application?.url ?? '')
  const [notes, setNotes] = useState(application?.notes ?? '')

  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const savingRef = useRef(false)
  const dialogRef = useRef<HTMLDivElement>(null)
  const firstFieldRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    firstFieldRef.current?.focus()

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = [
        ...dialogRef.current.querySelectorAll<HTMLElement>(
          'button, input, textarea, select'
        ),
      ].filter((el) => !el.hasAttribute('disabled'))
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleSetTimeToNow() {
    setAppliedTime(formatTimeInput(new Date()))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (savingRef.current) return
    setError('')

    const trimmedCompany = company.trim()
    const trimmedTitle = title.trim()

    if (!trimmedCompany || trimmedCompany.length > 120) {
      setError('Please enter a company name (1 to 120 characters).')
      return
    }

    if (!trimmedTitle || trimmedTitle.length > 140) {
      setError('Please enter a job title (1 to 140 characters).')
      return
    }

    if (!isValidDateString(appliedDate)) {
      setError('Please choose a valid application date.')
      return
    }

    if (!isValidTimeString(appliedTime)) {
      setError('Please choose a valid application time (HH:MM) or leave it empty.')
      return
    }

    if (url.trim() && !/^https?:\/\//i.test(url.trim())) {
      setError('Job link must start with http:// or https://')
      return
    }

    savingRef.current = true
    setSaving(true)

    try {
      await onSave({
        company: trimmedCompany,
        title: trimmedTitle,
        status,
        appliedDate,
        appliedTime,
        location: location.trim(),
        salary: salary.trim(),
        url: url.trim(),
        notes: notes.trim(),
      })
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'The application could not be saved. Please try again.'
      )
    } finally {
      savingRef.current = false
      setSaving(false)
    }
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !saving) onClose()
      }}
    >
      <div
        className="modal modal-wide"
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="application-modal-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">{mode === 'new' ? 'New entry' : 'Edit entry'}</p>
            <h2 id="application-modal-title">
              {mode === 'new' ? 'Add job application' : 'Update application'}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            disabled={saving}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </div>

        <form className="application-form" onSubmit={submit}>
          <div className="form-grid">
            <label className="span-2" htmlFor="application-company">
              Company name <span className="optional">*Required</span>
              <input
                id="application-company"
                ref={firstFieldRef}
                required
                maxLength={120}
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="e.g. Linear, Stripe, Figma"
              />
            </label>

            <label className="span-2" htmlFor="application-title">
              Job title <span className="optional">*Required</span>
              <input
                id="application-title"
                required
                maxLength={140}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Senior Frontend Engineer"
              />
            </label>

            <div className="span-2">
              <label>Application status</label>
              <div className="status-radio-grid" role="radiogroup" aria-label="Status selection">
                {STATUSES.map((st) => (
                  <button
                    key={st}
                    type="button"
                    role="radio"
                    aria-checked={status === st}
                    className={`status-radio-btn ${status === st ? 'selected' : ''}`}
                    onClick={() => setStatus(st)}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <label htmlFor="application-date">
              Application date <span className="optional">*Required</span>
              <input
                id="application-date"
                type="date"
                required
                value={appliedDate}
                onChange={(event) => setAppliedDate(event.target.value)}
              />
            </label>

            <label htmlFor="application-time">
              Application time{' '}
              <span className="optional">
                Optional ·{' '}
                <button
                  type="button"
                  onClick={handleSetTimeToNow}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    color: 'inherit',
                  }}
                >
                  Set to now
                </button>
              </span>
              <input
                id="application-time"
                type="time"
                value={appliedTime}
                onChange={(event) => setAppliedTime(event.target.value)}
              />
            </label>

            <label htmlFor="application-location">
              Location / Workplace <span className="optional">Optional</span>
              <input
                id="application-location"
                maxLength={100}
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                placeholder="e.g. Remote (US), San Francisco, Hybrid"
              />
            </label>

            <label htmlFor="application-salary">
              Compensation / Salary <span className="optional">Optional</span>
              <input
                id="application-salary"
                maxLength={80}
                value={salary}
                onChange={(event) => setSalary(event.target.value)}
                placeholder="e.g. $160,000 - $185,000"
              />
            </label>

            <label className="span-2" htmlFor="application-url">
              Job posting or portal link <span className="optional">Optional</span>
              <input
                id="application-url"
                type="url"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                placeholder="https://company.com/careers/role"
              />
            </label>

            <label className="span-2" htmlFor="application-notes">
              Notes & Next steps <span className="optional">Optional</span>
              <textarea
                id="application-notes"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Recruiter contact, interview dates, key questions asked, or referral notes..."
                style={{ resize: 'vertical' }}
              />
            </label>
          </div>

          {appliedDate && (
            <p className="derived-date">
              <Icon name="calendar" size={15} /> Organizes under{' '}
              <strong>{monthLabel(appliedDate)}</strong> in your timeline.
            </p>
          )}

          {error && (
            <p className="form-error" role="alert" style={{ marginTop: '16px' }}>
              {error}
            </p>
          )}

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? 'Saving…'
                : mode === 'new'
                ? 'Save application'
                : 'Save changes'}
              {!saving && <Icon name="arrow" size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
