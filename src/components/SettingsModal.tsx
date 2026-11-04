import React, { useState, useRef } from 'react'
import { AppSettings, ViewMode } from '../types'
import { Icon } from './Icon'

interface SettingsModalProps {
  settings: AppSettings
  onUpdateSettings: (newSettings: AppSettings) => void
  onClose: () => void
  onExport: () => void
  onImport: (jsonString: string) => void
  onResetSampleData: () => void
  onClearAllData: () => void
}

type SettingsTab = 'preferences' | 'data' | 'about'

export function SettingsModal({
  settings,
  onUpdateSettings,
  onClose,
  onExport,
  onImport,
  onResetSampleData,
  onClearAllData,
}: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>('preferences')
  const [importStatus, setImportStatus] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function toggle24h() {
    onUpdateSettings({ ...settings, timeFormat24h: !settings.timeFormat24h })
  }

  function toggleAutoFill() {
    onUpdateSettings({
      ...settings,
      autoFillCurrentTime: !settings.autoFillCurrentTime,
    })
  }

  function toggleReminders() {
    onUpdateSettings({
      ...settings,
      notifyDeadlines: !settings.notifyDeadlines,
    })
  }

  function handleDefaultViewChange(view: ViewMode) {
    onUpdateSettings({ ...settings, defaultView: view })
  }

  function handleFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        onImport(content)
        setImportStatus('Applications imported successfully!')
        setTimeout(() => setImportStatus(''), 3000)
      }
    }
    reader.onerror = () => {
      setImportStatus('Failed to read file.')
    }
    reader.readAsText(file)
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
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        <div className="modal-header">
          <div>
            <p className="eyebrow">Configuration</p>
            <h2 id="settings-title">App Settings</h2>
          </div>
          <button
            type="button"
            className="icon-button"
            onClick={onClose}
            aria-label="Close settings"
          >
            <Icon name="close" />
          </button>
        </div>

        {/* Tab navigation */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--line)',
            paddingBottom: '12px',
            marginBottom: '20px',
          }}
        >
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'preferences' ? 'active' : ''}`}
            onClick={() => setActiveTab('preferences')}
          >
            <Icon name="settings" size={14} /> Preferences
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'data' ? 'active' : ''}`}
            onClick={() => setActiveTab('data')}
          >
            <Icon name="download" size={14} /> Data & Backup
          </button>
          <button
            type="button"
            className={`nav-tab-btn ${activeTab === 'about' ? 'active' : ''}`}
            onClick={() => setActiveTab('about')}
          >
            <Icon name="help-circle" size={14} /> About
          </button>
        </div>

        {/* Tab 1: Preferences */}
        {activeTab === 'preferences' && (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#3f3f3f',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  fontFamily: 'DM Mono',
                }}
              >
                Default Application View
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '8px',
                }}
              >
                {(['timeline', 'kanban', 'table', 'analytics'] as ViewMode[]).map(
                  (v) => (
                    <button
                      key={v}
                      type="button"
                      className={`status-radio-btn ${
                        settings.defaultView === v ? 'selected' : ''
                      }`}
                      onClick={() => handleDefaultViewChange(v)}
                    >
                      {v.charAt(0).toUpperCase() + v.slice(1)}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="toggle-row">
              <div className="toggle-copy">
                <strong>24-Hour Time Format</strong>
                <p>Display application times in 24h clock (e.g., 14:30 instead of 2:30 PM).</p>
              </div>
              <button
                type="button"
                className={`switch ${settings.timeFormat24h ? 'on' : ''}`}
                onClick={toggle24h}
                role="switch"
                aria-checked={settings.timeFormat24h}
                aria-label="Toggle 24-hour time format"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-copy">
                <strong>Auto-fill Current Time</strong>
                <p>Pre-populate the current local time when adding a new opportunity.</p>
              </div>
              <button
                type="button"
                className={`switch ${settings.autoFillCurrentTime ? 'on' : ''}`}
                onClick={toggleAutoFill}
                role="switch"
                aria-checked={settings.autoFillCurrentTime}
                aria-label="Toggle auto-fill current time"
              >
                <span className="switch-thumb" />
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-copy">
                <strong>Interview & Timeline Indicators</strong>
                <p>Highlight pending follow-ups and active stages in timeline view.</p>
              </div>
              <button
                type="button"
                className={`switch ${settings.notifyDeadlines ? 'on' : ''}`}
                onClick={toggleReminders}
                role="switch"
                aria-checked={settings.notifyDeadlines}
                aria-label="Toggle interview reminders"
              >
                <span className="switch-thumb" />
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Data & Backup */}
        {activeTab === 'data' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div
              style={{
                padding: '16px',
                background: 'var(--wash)',
                borderRadius: '12px',
                border: '1px solid var(--line)',
              }}
            >
              <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700 }}>
                Export Applications (JSON)
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--muted)' }}>
                Download a clean, structured JSON file of all your applications, interview notes, and timeline records.
              </p>
              <button
                type="button"
                className="secondary-button"
                onClick={onExport}
              >
                <Icon name="download" size={15} /> Export JSON File
              </button>
            </div>

            <div
              style={{
                padding: '16px',
                background: 'var(--wash)',
                borderRadius: '12px',
                border: '1px solid var(--line)',
              }}
            >
              <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700 }}>
                Import Applications
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--muted)' }}>
                Restore or load applications from a previous JobTrack JSON export file.
              </p>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                style={{ display: 'none' }}
                onChange={handleFileSelected}
              />
              <button
                type="button"
                className="secondary-button"
                onClick={() => fileInputRef.current?.click()}
              >
                <Icon name="upload" size={15} /> Select JSON File
              </button>
              {importStatus && (
                <p
                  style={{
                    margin: '10px 0 0',
                    fontSize: '12px',
                    color: importStatus.includes('Failed') ? 'var(--danger)' : '#2e6930',
                    fontWeight: 600,
                  }}
                >
                  {importStatus}
                </p>
              )}
            </div>

            <div
              style={{
                padding: '16px',
                border: '1px dashed var(--line-strong)',
                borderRadius: '12px',
              }}
            >
              <h4 style={{ margin: '0 0 6px', fontSize: '14px', fontWeight: 700 }}>
                Sample Data & Reset
              </h4>
              <p style={{ margin: '0 0 14px', fontSize: '12px', color: 'var(--muted)' }}>
                Reset to sample opportunities across various stages (Linear, Stripe, Vercel, etc.) or wipe the test database.
              </p>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="secondary-button"
                  onClick={onResetSampleData}
                >
                  <Icon name="refresh" size={14} /> Reset Sample Data
                </button>
                <button
                  type="button"
                  className="row-action danger"
                  style={{ width: 'auto', padding: '0 12px', borderRadius: '999px', fontSize: '12px', height: '36px' }}
                  onClick={onClearAllData}
                >
                  <Icon name="trash" size={14} /> Clear All Applications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: About */}
        {activeTab === 'about' && (
          <div style={{ padding: '8px 0', fontSize: '13px', lineHeight: 1.6 }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
              JobTrack
            </h3>
            <p style={{ color: 'var(--muted)', marginBottom: '16px' }}>
              A high-precision, distraction-free platform for ambitious professionals to track every opportunity with clarity.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--muted)', fontSize: '12px' }}>
              <div><strong>Design System:</strong> Swiss Monochromatic typography (Manrope & DM Mono)</div>
              <div><strong>Data Privacy:</strong> Fully local client-side persistence by default with Supabase compatibility</div>
              <div><strong>Views Supported:</strong> Chronological Timeline, Multi-Stage Kanban Pipeline, Structured Data Table, and Pipeline Analytics</div>
              <div><strong>Version:</strong> 0.1.0 (Phase 2 Frontend Release)</div>
            </div>
          </div>
        )}

        <div className="modal-actions">
          <button
            type="button"
            className="primary-button"
            onClick={onClose}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
