import React from 'react'
import { ApplicationStatus } from '../types'

interface StatusBadgeProps {
  status: ApplicationStatus
  className?: string
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const getStatusClass = (st: ApplicationStatus) => {
    switch (st) {
      case 'Applied':
        return 'applied'
      case 'Under Review':
        return 'under-review'
      case 'Interview':
        return 'interview'
      case 'Offer':
        return 'offer'
      case 'Rejected':
        return 'rejected'
      default:
        return 'applied'
    }
  }

  return (
    <span className={`status-badge ${getStatusClass(status)} ${className}`}>
      <span className="status-dot" />
      {status}
    </span>
  )
}
