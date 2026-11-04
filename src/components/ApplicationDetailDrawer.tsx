import React, { useEffect, useRef } from 'react'
import { Application, ApplicationStatus } from '../types'
import { fullDateLabel, timeLabel } from '../utils/date'
import { StatusBadge } from './StatusBadge'
import { Icon } from './Icon'

interface ApplicationDetailDrawerProps {
  application: Application
  onClose: () => void
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void
  onCopySuccess: () => void
}

const STAGES: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Interview',
  'Offer',
]

export function ApplicationDetailDrawer({
  application,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  onCopySuccess,
}: ApplicationDetailDrawerProps) {
  const drawerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  function handleCopyDetails() {
    const text = `${application.title} at ${application.company}\nStatus: ${application.status}\nApplied: ${application.appliedDate}${application.appliedTime ? ' ' + application.appliedTime : ''}\n${application.location ? 'Location: ' + application.location + '\n' : ''}${application.salary ? 'Salary: ' + application.salary + '\n' : ''}${application.url ? 'Link: ' + application.url + '\n' : ''}${application.notes ? '\nNotes:\n' + application.notes : ''}`
    navigator.clipboard.writeText(text)
    onCopySuccess()
  }

  const currentStageIndex = STAGES.indexOf(application.status)

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="detail-drawer"
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="detail-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Opportunity details</p>
            <h2 id="detail-title">{application.title}</h2>
            <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: '15px', fontWeight: 600 }}>
              {application.company}
            </p>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close details"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Stage Progress tracker */}
        <div className="detail-stage-tracker" aria-label="Pipeline progress">
          {STAGES.map((stage, idx) => {
            const isCompleted = currentStageIndex > idx
            const isActive = currentStageIndex === idx
            return (
              <React.Fragment key={stage}>
                <div
                  className={`stage-step ${isActive ? 'active' : ''} ${
                    isCompleted ? 'completed' : ''
                  }`}
                >
                  <span className="stage-dot" />
                  <span>{stage}</span>
                </div>
                {idx < STAGES.length - 1 && <span className="stage-sep">→</span>}
              </React.Fragment>
            )
          })}
          {application.status === 'Rejected' && (
            <>
              <span className="stage-sep">·</span>
              <div className="stage-step active" style={{ color: 'var(--danger)' }}>
                <span className="stage-dot" />
                <span>Closed</span>
              </div>
            </>
          )}
        </div>

        {/* Status quick select */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 0',
            borderBottom: '1px solid var(--line)',
            marginBottom: '16px',
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)' }}>
            Current Status
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <StatusBadge status={application.status} />
            <select
              value={application.status}
              onChange={(e) => onStatusChange(application.id, e.target.value as ApplicationStatus)}
              style={{
                fontSize: '11px',
                padding: '4px 8px',
                borderRadius: '6px',
                border: '1px solid var(--line)',
                background: '#fff',
                cursor: 'pointer',
              }}
              aria-label="Change status"
            >
              <option value="Applied">Applied</option>
              <option value="Under Review">Under Review</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Detailed Fields */}
        <div className="detail-field-group">
          <div className="detail-field">
            <span className="detail-field-label">Date Applied</span>
            <span className="detail-field-val">
              {fullDateLabel(application.appliedDate)}
            </span>
          </div>

          {application.appliedTime && (
            <div className="detail-field">
              <span className="detail-field-label">Time Logged</span>
              <span className="detail-field-val">
                {timeLabel(application.appliedTime)}
              </span>
            </div>
          )}

          {application.location && (
            <div className="detail-field">
              <span className="detail-field-label">Workplace / Location</span>
              <span className="detail-field-val">{application.location}</span>
            </div>
          )}

          {application.salary && (
            <div className="detail-field">
              <span className="detail-field-label">Compensation</span>
              <span className="detail-field-val">{application.salary}</span>
            </div>
          )}

          {application.url && (
            <div className="detail-field">
              <span className="detail-field-label">Posting Link</span>
              <span className="detail-field-val">
                <a
                  href={application.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    color: 'var(--ink)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    textDecoration: 'underline',
                  }}
                >
                  Visit Portal <Icon name="external-link" size={13} />
                </a>
              </span>
            </div>
          )}
        </div>

        {/* Notes */}
        <div>
          <span className="detail-field-label" style={{ display: 'block', marginBottom: '4px' }}>
            Notes & Next Steps
          </span>
          <div className="detail-notes-box">
            {application.notes ? (
              application.notes
            ) : (
              <span style={{ color: 'var(--soft-muted)', fontStyle: 'italic' }}>
                No notes entered yet. Click "Edit" to record interview feedback, contact details, or follow-ups.
              </span>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '32px',
            paddingTop: '20px',
            borderTop: '1px solid var(--line)',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="secondary-button"
              onClick={handleCopyDetails}
              title="Copy application text to clipboard"
            >
              <Icon name="copy" size={14} /> Copy
            </button>
            <button
              type="button"
              className="row-action danger"
              onClick={() => onDelete(application)}
              title="Delete application"
            >
              <Icon name="trash" size={15} />
            </button>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Done
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                onClose()
                onEdit(application)
              }}
            >
              <Icon name="edit" size={14} /> Edit entry
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
