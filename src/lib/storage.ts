import { Application, ApplicationDraft, AppSettings, UserProfile } from '../types'
import { generateInitialApplications } from '../data/mockData'

const DEFAULT_SETTINGS: AppSettings = {
  defaultView: 'timeline',
  timeFormat24h: false,
  compactView: false,
  notifyDeadlines: true,
  autoFillCurrentTime: true,
}

export const DEMO_USER: UserProfile = {
  id: 'usr_demo_01',
  email: 'alex.morgan@work.co',
  name: 'Alex Morgan',
  avatarUrl: '',
  createdAt: '2026-01-15T08:00:00.000Z',
}

const SESSION_KEY = 'jobtrack_session'
const SETTINGS_KEY = 'jobtrack_settings'

function getStorageKey(userId: string) {
  return `jobtrack_apps_${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

export function loadUserSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    return JSON.parse(raw) as UserProfile
  } catch {
    return null
  }
}

export function saveUserSession(user: UserProfile | null) {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_KEY)
    } else {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))
    }
  } catch (err) {
    console.error('Failed to save session:', err)
  }
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(settings: AppSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  } catch (err) {
    console.error('Failed to save settings:', err)
  }
}

export function loadApplications(userId: string): Application[] {
  try {
    const key = getStorageKey(userId)
    const raw = localStorage.getItem(key)
    if (!raw) {
      // Initialize with realistic mock items
      const initial = generateInitialApplications()
      localStorage.setItem(key, JSON.stringify(initial))
      return initial
    }
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed)) {
      return parsed
    }
    return []
  } catch {
    return generateInitialApplications()
  }
}

export function persistApplications(userId: string, applications: Application[]): void {
  try {
    const key = getStorageKey(userId)
    localStorage.setItem(key, JSON.stringify(applications))
  } catch (err) {
    console.error('Failed to persist applications:', err)
  }
}

export function resetToSampleData(userId: string): Application[] {
  const initial = generateInitialApplications()
  persistApplications(userId, initial)
  return initial
}

export function clearAllApplications(userId: string): Application[] {
  persistApplications(userId, [])
  return []
}

export function exportApplicationsJson(userId: string, userEmail: string): string {
  const apps = loadApplications(userId)
  const payload = {
    exportedAt: new Date().toISOString(),
    user: userEmail,
    version: '1.0',
    total: apps.length,
    applications: apps,
  }
  return JSON.stringify(payload, null, 2)
}

export function importApplicationsJson(userId: string, rawJson: string): { success: boolean; count?: number; error?: string } {
  try {
    const parsed = JSON.parse(rawJson)
    const items = Array.isArray(parsed) ? parsed : parsed.applications
    if (!Array.isArray(items)) {
      return { success: false, error: 'Invalid JSON format: missing applications list' }
    }

    const validated: Application[] = items.map((item: any, idx: number) => ({
      id: item.id || `imported_${Date.now()}_${idx}`,
      company: String(item.company || item.company_name || 'Unknown Company').slice(0, 120),
      title: String(item.title || item.job_title || 'Role').slice(0, 140),
      appliedDate: typeof item.appliedDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(item.appliedDate)
        ? item.appliedDate
        : item.applied_date || new Date().toISOString().slice(0, 10),
      appliedTime: typeof item.appliedTime === 'string' ? item.appliedTime : (item.applied_time || ''),
      status: ['Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'].includes(item.status)
        ? item.status
        : 'Applied',
      location: item.location || '',
      salary: item.salary || '',
      url: item.url || '',
      notes: item.notes || '',
      createdAt: item.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    persistApplications(userId, validated)
    return { success: true, count: validated.length }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Invalid JSON file' }
  }
}
