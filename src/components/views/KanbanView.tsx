import React from 'react'
import { Application, ApplicationStatus } from '../../types'
import { shortDateLabel } from '../../utils/date'
import { Icon } from '../Icon'

interface KanbanViewProps {
  applications: Application[]
  onSelectApplication: (application: Application) => void
  onAddInStage: (stage: ApplicationStatus) => void
  onStatusChange: (id: string, newStatus: ApplicationStatus) => void
}

const COLUMNS: { status: ApplicationStatus; label: string }[] = [
  { status: 'Applied', label: 'Applied' },
  { status: 'Under Review', label: 'Under Review' },
  { status: 'Interview', label: 'Interviewing' },
  { status: 'Offer', label: 'Offer Received' },
  { status: 'Rejected', label: 'Archived / Rejected' },
]

export function KanbanView({
  applications,
  onSelectApplication,
  onAddInStage,
  onStatusChange,
}: KanbanViewProps) {
  function getNextStatus(curr: ApplicationStatus): ApplicationStatus | null {
    switch (curr) {
      case 'Applied':
        return 'Under Review'
      case 'Under Review':
        return 'Interview'
      case 'Interview':
        return 'Offer'
      default:
        return null
    }
  }

  function getPrevStatus(curr: ApplicationStatus): ApplicationStatus | null {
    switch (curr) {
      case 'Offer':
        return 'Interview'
      case 'Interview':
        return 'Under Review'
      case 'Under Review':
        return 'Applied'
      case 'Rejected':
        return 'Applied'
      default:
        return null
    }
  }

  return (
    <div className="kanban-board" role="region" aria-label="Application pipeline board">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((app) => app.status === col.status)
        return (
          <div className="kanban-col" key={col.status}>
            <div className="kanban-col-header">
              <div className="kanban-col-title">
                <span>{col.label}</span>
                <span className="kanban-col-count">{colApps.length}</span>
              </div>
              <button
                type="button"
                className="kanban-col-add"
                onClick={() => onAddInStage(col.status)}
                title={`Add application directly to ${col.status}`}
                aria-label={`Add application to ${col.status}`}
              >
                <Icon name="plus" size={15} />
              </button>
            </div>

            <div className="kanban-col-body">
              {colApps.length === 0 ? (
                <div
                  style={{
                    padding: '28px 12px',
                    textAlign: 'center',
                    color: 'var(--soft-muted)',
                    fontSize: '11px',
                    border: '1px dashed var(--line-strong)',
                    borderRadius: '8px',
                  }}
                >
                  No opportunities in this stage
                </div>
              ) : (
                colApps.map((app) => {
                  const next = getNextStatus(app.status)
                  const prev = getPrevStatus(app.status)
                  return (
                    <div
                      key={app.id}
                      className="kanban-card"
                      onClick={() => onSelectApplication(app)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') onSelectApplication(app)
                      }}
                    >
                      <div>
                        <div className="kanban-card-title">{app.title}</div>
                        <div className="kanban-card-company">{app.company}</div>
                      </div>

                      <div className="kanban-card-meta">
                        <span>{shortDateLabel(app.appliedDate)}</span>
                        {app.location && <span>{app.location}</span>}
                      </div>

                      <div className="kanban-card-quick-move" onClick={(e) => e.stopPropagation()}>
                        {prev && (
                          <button
                            type="button"
                            className="kanban-move-btn"
                            onClick={() => onStatusChange(app.id, prev)}
                            title={`Move back to ${prev}`}
                          >
                            ← Back
                          </button>
                        )}
                        {next && (
                          <button
                            type="button"
                            className="kanban-move-btn"
                            style={{ marginLeft: 'auto' }}
                            onClick={() => onStatusChange(app.id, next)}
                            title={`Advance to ${next}`}
                          >
                            Advance →
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
