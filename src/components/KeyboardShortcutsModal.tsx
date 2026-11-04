import React, { useEffect } from 'react'
import { Icon } from './Icon'

interface KeyboardShortcutsModalProps {
  onClose: () => void
}

export function KeyboardShortcutsModal({ onClose }: KeyboardShortcutsModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

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
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-dialog-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Quick navigation</p>
            <h2 id="shortcuts-dialog-title">Keyboard Shortcuts</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close shortcuts"
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="shortcut-list">
          <div className="shortcut-row">
            <span>New application</span>
            <span className="shortcut-key">N</span>
          </div>
          <div className="shortcut-row">
            <span>Focus search bar</span>
            <span className="shortcut-key">/</span>
          </div>
          <div className="shortcut-row">
            <span>Switch to Timeline view</span>
            <span className="shortcut-key">1</span>
          </div>
          <div className="shortcut-row">
            <span>Switch to Kanban board</span>
            <span className="shortcut-key">2</span>
          </div>
          <div className="shortcut-row">
            <span>Switch to Table list</span>
            <span className="shortcut-key">3</span>
          </div>
          <div className="shortcut-row">
            <span>Switch to Analytics</span>
            <span className="shortcut-key">4</span>
          </div>
          <div className="shortcut-row">
            <span>Close dialog / drawer</span>
            <span className="shortcut-key">Esc</span>
          </div>
        </div>

        <div className="modal-actions" style={{ marginTop: '24px' }}>
          <button
            type="button"
            className="primary-button"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  )
}
