import React from 'react'
import { Application } from '../../types'
import { shortDateLabel, timeLabel } from '../../utils/date'
import { StatusBadge } from '../StatusBadge'
import { Icon } from '../Icon'

interface TableViewProps {
  applications: Application[]
  timeFormat24h?: boolean
  onSelectApplication: (application: Application) => void
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
}

export function TableView({
  applications,
  timeFormat24h = false,
  onSelectApplication,
  onEdit,
  onDelete,
}: TableViewProps) {
  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '35%' }}>Company & Role</th>
            <th style={{ width: '18%' }}>Status</th>
            <th style={{ width: '18%' }}>Date Applied</th>
            <th style={{ width: '19%' }}>Workplace / Comp</th>
            <th style={{ width: '10%', textAlign: 'right' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applications.map((app) => (
            <tr
              key={app.id}
              className="clickable"
              onClick={() => onSelectApplication(app)}
            >
              <td>
                <div className="table-company">{app.company}</div>
                <div className="table-role">{app.title}</div>
              </td>
              <td>
                <StatusBadge status={app.status} />
              </td>
              <td>
                <div style={{ fontWeight: 600 }}>{shortDateLabel(app.appliedDate)}</div>
                {app.appliedTime && (
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--soft-muted)',
                      fontFamily: 'DM Mono',
                    }}
                  >
                    {timeLabel(app.appliedTime, timeFormat24h)}
                  </div>
                )}
              </td>
              <td>
                <div style={{ color: 'var(--ink)' }}>{app.location || '—'}</div>
                {app.salary && (
                  <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                    {app.salary}
                  </div>
                )}
              </td>
              <td style={{ textAlign: 'right' }}>
                <div
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    className="row-action"
                    onClick={() => onEdit(app)}
                    title={`Edit ${app.title}`}
                    aria-label={`Edit ${app.title}`}
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    type="button"
                    className="row-action danger"
                    onClick={() => onDelete(app)}
                    title={`Delete ${app.title}`}
                    aria-label={`Delete ${app.title}`}
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
