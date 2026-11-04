export type ApplicationStatus = 'Applied' | 'Under Review' | 'Interview' | 'Offer' | 'Rejected'

export interface Application {
  id: string
  company: string
  title: string
  appliedDate: string // YYYY-MM-DD
  appliedTime: string // HH:MM or ''
  status: ApplicationStatus
  location?: string
  salary?: string
  url?: string
  notes?: string
  createdAt?: string
  updatedAt?: string
}

export type ApplicationDraft = Omit<Application, 'id' | 'createdAt' | 'updatedAt'>

export type ModalMode = 'new' | 'edit'
export type AuthMode = 'login' | 'signup' | 'forgot'
export type AuthScreen = AuthMode | 'reset'

export type ViewMode = 'timeline' | 'kanban' | 'table' | 'analytics'

export interface UserProfile {
  id: string
  email: string
  name: string
  avatarUrl?: string
  createdAt: string
}

export interface AppSettings {
  defaultView: ViewMode
  timeFormat24h: boolean
  compactView: boolean
  notifyDeadlines: boolean
  autoFillCurrentTime: boolean
}

export interface FilterState {
  search: string
  status: ApplicationStatus | 'All'
  sortBy: 'date-desc' | 'date-asc' | 'company-asc' | 'company-desc' | 'status'
}
