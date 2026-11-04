import React, { useMemo } from 'react'
import { Application } from '../../types'
import { localDate, monthLabel, shortDateLabel, timeLabel } from '../../utils/date'
import { StatusBadge } from '../StatusBadge'
import { Icon } from '../Icon'

interface TimelineViewProps {
  applications: Application[]
  timeFormat24h?: boolean
  onSelectApplication: (application: Application) => void
  onEdit: (application: Application) => void
  onDelete: (application: Application) => void
}

export function TimelineView({
  applications,
  timeFormat24h = false,
  onSelectApplication,
  onEdit,
  onDelete,
}: TimelineViewProps) {
  const grouped = useMemo(() => {
    const sorted = [...applications].sort((a, b) =>
      `${b.appliedDate}${b.appliedTime || ''}`.localeCompare(
        `${a.appliedDate}${a.appliedTime || ''}`
      )
    )
    const groups = new Map<string, Application[]>()
    sorted.forEach((application) => {
      const key = application.appliedDate.slice(0, 7)
      groups.set(key, [...(groups.get(key) ?? []), application])
    })
    return [...groups.entries()]
  }, [applications])

  return (
    <div className="timeline">
      {grouped.map(([month, items]) => (
        <div className="month-group" key={month}>
          <div className="month-label">{monthLabel(`${month}-01`)}</div>
          <div className="timeline-items">
            {items.map((application) => (
              <article
                className="application-row"
                key={application.id}
                onClick={() => onSelectApplication(application)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelectApplication(application)
                  }
                }}
                aria-label={`View details for ${application.title} at ${application.company}`}
              >
                <div className="application-date">
                  <strong>{localDate(application.appliedDate).getDate()}</strong>
                  <span>
                    {localDate(application.appliedDate).toLocaleDateString(
                      undefined,
                      { weekday: 'short' }
                    )}
                  </span>
                </div>
                <div className="application-marker" />
                <div className="application-content">
                  <div className="application-main">
                    <div>
                      <h3>{application.title}</h3>
                      <p>{application.company}</p>
                    </div>
                    <div className="application-meta">
                      {application.appliedTime && (
                        <span>
                          <Icon name="clock" size={13} />{' '}
                          {timeLabel(application.appliedTime, timeFormat24h)}
                        </span>
                      )}
                      {application.location && (
                        <span>• {application.location}</span>
                      )}
                      <StatusBadge status={application.status} />
                    </div>
                  </div>
                  <div className="application-actions">
                    <span>{shortDateLabel(application.appliedDate)}</span>
                    <button
                      type="button"
                      className="row-action"
                      onClick={(e) => {
                        e.stopPropagation()
                        onEdit(application)
                      }}
                      aria-label={`Edit ${application.title}`}
                      title="Edit application"
                    >
                      <Icon name="edit" size={15} />
                    </button>
                    <button
                      type="button"
                      className="row-action danger"
                      onClick={(e) => {
                        e.stopPropagation()
                        onDelete(application)
                      }}
                      aria-label={`Delete ${application.title}`}
                      title="Delete application"
                    >
                      <Icon name="trash" size={15} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
