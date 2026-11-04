import React, { useState } from 'react'
import { Application, UserProfile } from '../types'
import { Icon } from './Icon'

interface ProfileModalProps {
  user: UserProfile
  applications: Application[]
  onClose: () => void
  onUpdateName: (name: string) => void
  onLogout: () => void
}

export function ProfileModal({
  user,
  applications,
  onClose,
  onUpdateName,
  onLogout,
}: ProfileModalProps) {
  const [name, setName] = useState(user.name)
  const [editing, setEditing] = useState(false)

  const activeInterviews = applications.filter((a) => a.status === 'Interview').length
  const offers = applications.filter((a) => a.status === 'Offer').length
  const total = applications.length

  function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (name.trim()) {
      onUpdateName(name.trim())
      setEditing(false)
    }
  }

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
        aria-labelledby="profile-dialog-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Account</p>
            <h2 id="profile-dialog-title">Profile</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close profile"
          >
            <Icon name="close" />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'var(--ink)',
              color: '#fff',
              display: 'grid',
              placeItems: 'center',
              fontSize: '24px',
              fontWeight: 700,
              margin: '0 auto 12px',
            }}
          >
            {user.name.slice(0, 1).toUpperCase()}
          </div>

          {!editing ? (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700 }}>
                  {user.name}
                </h3>
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--soft-muted)',
                    padding: '2px',
                  }}
                  title="Edit name"
                >
                  <Icon name="edit" size={14} />
                </button>
              </div>
              <p
                style={{
                  margin: '4px 0 0',
                  color: 'var(--muted)',
                  fontSize: '12px',
                  fontFamily: 'DM Mono',
                }}
              >
                {user.email}
              </p>
            </div>
          ) : (
            <form onSubmit={handleSaveName} style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginTop: '8px' }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                style={{
                  padding: '4px 8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid var(--line-strong)',
                  borderRadius: '6px',
                  textAlign: 'center',
                }}
                autoFocus
              />
              <button type="submit" className="primary-button" style={{ padding: '4px 12px', fontSize: '11px' }}>
                Save
              </button>
            </form>
          )}
        </div>

        {/* Stats summary */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '8px',
            padding: '14px 0',
            borderTop: '1px solid var(--line)',
            borderBottom: '1px solid var(--line)',
            marginBottom: '20px',
            textAlign: 'center',
          }}
        >
          <div>
            <span style={{ fontSize: '10px', color: 'var(--soft-muted)', fontFamily: 'DM Mono', display: 'block' }}>
              TRACKED
            </span>
            <strong style={{ fontSize: '18px', fontWeight: 600 }}>{total}</strong>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--soft-muted)', fontFamily: 'DM Mono', display: 'block' }}>
              INTERVIEWS
            </span>
            <strong style={{ fontSize: '18px', fontWeight: 600 }}>{activeInterviews}</strong>
          </div>
          <div>
            <span style={{ fontSize: '10px', color: 'var(--soft-muted)', fontFamily: 'DM Mono', display: 'block' }}>
              OFFERS
            </span>
            <strong style={{ fontSize: '18px', fontWeight: 600 }}>{offers}</strong>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <button
            type="button"
            className="row-action danger"
            style={{
              width: '100%',
              borderRadius: '999px',
              height: '40px',
              fontSize: '12px',
              fontWeight: 600,
              display: 'flex',
              gap: '8px',
            }}
            onClick={() => {
              onClose()
              onLogout()
            }}
          >
            <Icon name="logout" size={16} /> Sign out of JobTrack
          </button>
        </div>
      </div>
    </div>
  )
}
