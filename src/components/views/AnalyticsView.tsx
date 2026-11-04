import React, { useMemo } from 'react'
import { Application, ApplicationStatus } from '../../types'
import { monthLabel } from '../../utils/date'
import { StatusBadge } from '../StatusBadge'

interface AnalyticsViewProps {
  applications: Application[]
  onSelectApplication: (application: Application) => void
}

const STATUS_ORDER: ApplicationStatus[] = [
  'Applied',
  'Under Review',
  'Interview',
  'Offer',
  'Rejected',
]

export function AnalyticsView({ applications, onSelectApplication }: AnalyticsViewProps) {
  const total = applications.length

  const counts = useMemo(() => {
    const map: Record<ApplicationStatus, number> = {
      Applied: 0,
      'Under Review': 0,
      Interview: 0,
      Offer: 0,
      Rejected: 0,
    }
    applications.forEach((app) => {
      if (map[app.status] !== undefined) {
        map[app.status]++
      }
    })
    return map
  }, [applications])

  // Monthly distribution (last 6 months)
  const monthlyData = useMemo(() => {
    const map = new Map<string, number>()
    applications.forEach((app) => {
      const key = app.appliedDate.slice(0, 7)
      map.set(key, (map.get(key) || 0) + 1)
    })
    const entries = [...map.entries()].sort((a, b) => a[0].localeCompare(b[0]))
    return entries.slice(-6)
  }, [applications])

  const maxMonthly = Math.max(...monthlyData.map((d) => d[1]), 1)

  const respondedCount = total - counts['Applied']
  const responseRate = total > 0 ? Math.round((respondedCount / total) * 100) : 0
  const interviewRate = total > 0 ? Math.round(((counts['Interview'] + counts['Offer']) / total) * 100) : 0
  const offerRate = total > 0 ? Math.round((counts['Offer'] / total) * 100) : 0

  return (
    <div className="analytics-grid">
      {/* Status Breakdown Card */}
      <div className="analytics-card">
        <h3>Pipeline Distribution</h3>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '-10px', marginBottom: '20px' }}>
          Conversion across interview stages and outcomes
        </p>

        <div className="progress-list">
          {STATUS_ORDER.map((status) => {
            const count = counts[status]
            const pct = total > 0 ? Math.round((count / total) * 100) : 0
            const getFillColor = (st: ApplicationStatus) => {
              switch (st) {
                case 'Applied': return '#6d8a70'
                case 'Under Review': return '#b8863b'
                case 'Interview': return '#436aa1'
                case 'Offer': return '#298f4f'
                case 'Rejected': return '#8c8c88'
              }
            }
            return (
              <div className="progress-item" key={status}>
                <div className="progress-labels">
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <StatusBadge status={status} />
                  </span>
                  <span style={{ fontFamily: 'DM Mono', color: 'var(--muted)' }}>
                    <strong>{count}</strong> ({pct}%)
                  </span>
                </div>
                <div className="progress-bar-bg">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: getFillColor(status),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Monthly Activity Card */}
      <div className="analytics-card">
        <h3>Application Volume</h3>
        <p style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '-10px', marginBottom: '20px' }}>
          Applications submitted grouped by month
        </p>

        {monthlyData.length === 0 ? (
          <p style={{ fontSize: '12px', color: 'var(--soft-muted)' }}>No monthly history recorded yet.</p>
        ) : (
          <div className="monthly-chart">
            {monthlyData.map(([monthKey, count]) => {
              const heightPct = Math.round((count / maxMonthly) * 85) + 15
              return (
                <div className="chart-col" key={monthKey}>
                  <div
                    style={{
                      fontFamily: 'DM Mono',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: 'var(--ink)',
                      marginBottom: '4px',
                    }}
                  >
                    {count}
                  </div>
                  <div
                    className="chart-bar"
                    style={{ height: `${heightPct}%` }}
                    title={`${count} applications in ${monthLabel(`${monthKey}-01`)}`}
                  />
                  <div className="chart-label">
                    {new Date(`${monthKey}-01T12:00:00`).toLocaleDateString(undefined, {
                      month: 'short',
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Funnel Metrics */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '12px',
            marginTop: '24px',
            textAlign: 'center',
          }}
        >
          <div style={{ padding: '12px', background: 'var(--wash)', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'DM Mono', color: 'var(--soft-muted)', textTransform: 'uppercase' }}>
              Response Rate
            </span>
            <strong style={{ fontSize: '18px', fontWeight: 700 }}>{responseRate}%</strong>
          </div>
          <div style={{ padding: '12px', background: 'var(--wash)', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'DM Mono', color: 'var(--soft-muted)', textTransform: 'uppercase' }}>
              Interview Rate
            </span>
            <strong style={{ fontSize: '18px', fontWeight: 700 }}>{interviewRate}%</strong>
          </div>
          <div style={{ padding: '12px', background: 'var(--wash)', borderRadius: '8px' }}>
            <span style={{ display: 'block', fontSize: '9px', fontFamily: 'DM Mono', color: 'var(--soft-muted)', textTransform: 'uppercase' }}>
              Offer Rate
            </span>
            <strong style={{ fontSize: '18px', fontWeight: 700 }}>{offerRate}%</strong>
          </div>
        </div>
      </div>
    </div>
  )
}
