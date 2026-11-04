import React, { useEffect, useRef } from 'react'
import { Application } from '../types'
import { Icon } from './Icon'

interface DeleteConfirmModalProps {
  application: Application | null
  onClose: () => void
  onConfirm: () => void
}

export function DeleteConfirmModal({
  application,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmBtnRef.current?.focus()
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!application) return null

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div
        className="modal modal-sm"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
        aria-describedby="confirm-modal-desc"
      >
        <div className="confirm-box">
          <div className="confirm-icon">
            <Icon name="trash" size={22} />
          </div>
          <h2 id="confirm-modal-title" className="confirm-title">
            Delete application?
          </h2>
          <p id="confirm-modal-desc" className="confirm-desc">
            Are you sure you want to delete the{' '}
            <strong>{application.title}</strong> application at{' '}
            <strong>{application.company}</strong>? This action cannot be undone.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '12px',
              marginTop: '20px',
            }}
          >
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              ref={confirmBtnRef}
              type="button"
              className="danger-button"
              onClick={onConfirm}
            >
              <Icon name="trash" size={15} /> Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
