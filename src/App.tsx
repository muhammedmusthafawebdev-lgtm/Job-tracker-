import React, { useState, useEffect, useMemo, useRef } from 'react'
import {
  Application,
  ApplicationDraft,
  ApplicationStatus,
  AppSettings,
  AuthScreen,
  FilterState,
  ModalMode,
  UserProfile,
  ViewMode,
} from './types'
import {
  clearAllApplications,
  DEMO_USER,
  exportApplicationsJson,
  importApplicationsJson,
  loadApplications,
  loadSettings,
  loadUserSession,
  persistApplications,
  resetToSampleData,
  saveSettings,
  saveUserSession,
} from './lib/storage'
import { supabase, supabaseConfigured } from './lib/supabase'
import { greeting, localDate } from './utils/date'
import { Icon } from './components/Icon'
import { StatusBadge } from './components/StatusBadge'
import { AuthPanel } from './components/AuthPanel'
import { ResetPasswordPanel } from './components/ResetPasswordPanel'
import { ApplicationModal } from './components/ApplicationModal'
import { ApplicationDetailDrawer } from './components/ApplicationDetailDrawer'
import { DeleteConfirmModal } from './components/DeleteConfirmModal'
import { SettingsModal } from './components/SettingsModal'
import { ProfileModal } from './components/ProfileModal'
import { KeyboardShortcutsModal } from './components/KeyboardShortcutsModal'
import { TimelineView } from './components/views/TimelineView'
import { KanbanView } from './components/views/KanbanView'
import { TableView } from './components/views/TableView'
import { AnalyticsView } from './components/views/AnalyticsView'
import './styles.css'

export default function App() {
  // Session & User
  const [user, setUser] = useState<UserProfile | null>(() => loadUserSession() || DEMO_USER)
  const [authReady, setAuthReady] = useState(false)
  const [authScreen, setAuthScreen] = useState<AuthScreen>('login')

  // Settings
  const [settings, setSettings] = useState<AppSettings>(() => loadSettings())

  // Applications Data
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMessage, setErrorMessage] = useState('')

  // View & Filters
  const [currentView, setCurrentView] = useState<ViewMode>(settings.defaultView || 'timeline')
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: 'All',
    sortBy: 'date-desc',
  })

  // Modals & Drawers
  const [modalMode, setModalMode] = useState<ModalMode | null>(null)
  const [editingApp, setEditingApp] = useState<Application | null>(null)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [deletingApp, setDeletingApp] = useState<Application | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [shortcutsOpen, setShortcutsOpen] = useState(false)

  // Real-time Date & Clock
  const [now, setNow] = useState(() => new Date())
  const [toast, setToast] = useState('')
  const profileMenuRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Supabase Auth Listener (if configured)
  useEffect(() => {
    if (supabase && supabaseConfigured) {
      supabase.auth.getSession().then(({ data }) => {
        if (data.session?.user) {
          const u: UserProfile = {
            id: data.session.user.id,
            email: data.session.user.email || 'user@work.co',
            name: data.session.user.email?.split('@')[0] || 'User',
            createdAt: data.session.user.created_at || new Date().toISOString(),
          }
          setUser(u)
          saveUserSession(u)
        }
        setAuthReady(true)
      })

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        (event, session) => {
          if (session?.user) {
            const u: UserProfile = {
              id: session.user.id,
              email: session.user.email || 'user@work.co',
              name: session.user.email?.split('@')[0] || 'User',
              createdAt: session.user.created_at || new Date().toISOString(),
            }
            setUser(u)
            saveUserSession(u)
          } else if (event === 'SIGNED_OUT') {
            setUser(null)
            saveUserSession(null)
          }
          if (event === 'PASSWORD_RECOVERY') {
            setAuthScreen('reset')
          }
        }
      )

      return () => subscription.unsubscribe()
    } else {
      setAuthReady(true)
    }
  }, [])

  // Load applications for the current user
  useEffect(() => {
    if (!user) {
      setApplications([])
      setLoading(false)
      return
    }

    setLoading(true)
    try {
      const stored = loadApplications(user.id)
      setApplications(stored)
    } catch (err) {
      console.error(err)
      setErrorMessage('Could not load applications from local storage.')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Live clock tick
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 10_000)
    return () => clearInterval(timer)
  }, [])

  // Toast auto-clear
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 3000)
    return () => clearTimeout(timer)
  }, [toast])

  // Profile menu outside-click & escape listener
  useEffect(() => {
    if (!profileOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(e.target as Node)
      ) {
        setProfileOpen(false)
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setProfileOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [profileOpen])

  // Global Keyboard Shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT'
      ) {
        return
      }

      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault()
        openAddModal()
      } else if (e.key === '/') {
        e.preventDefault()
        searchInputRef.current?.focus()
      } else if (e.key === '1') {
        setCurrentView('timeline')
      } else if (e.key === '2') {
        setCurrentView('kanban')
      } else if (e.key === '3') {
        setCurrentView('table')
      } else if (e.key === '4') {
        setCurrentView('analytics')
      } else if (e.key === '?') {
        setShortcutsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // CRUD Operations
  function openAddModal(defaultStage?: ApplicationStatus) {
    setEditingApp(null)
    setModalMode('new')
    if (defaultStage) {
      // If opened from a Kanban column, initialize with that status
      setEditingApp({
        id: '',
        company: '',
        title: '',
        appliedDate: new Date().toISOString().slice(0, 10),
        appliedTime: '',
        status: defaultStage,
      })
    }
  }

  function openEditModal(app: Application) {
    setEditingApp(app)
    setModalMode('edit')
    if (selectedApp?.id === app.id) {
      setSelectedApp(null)
    }
  }

  function closeModal() {
    setModalMode(null)
    setEditingApp(null)
  }

  async function handleSaveApplication(draft: ApplicationDraft) {
    if (!user) return
    const nowIso = new Date().toISOString()

    if (editingApp && editingApp.id) {
      // Update existing
      const updated: Application = {
        ...editingApp,
        ...draft,
        updatedAt: nowIso,
      }
      const nextList = applications.map((item) =>
        item.id === editingApp.id ? updated : item
      )
      setApplications(nextList)
      persistApplications(user.id, nextList)
      if (selectedApp?.id === editingApp.id) {
        setSelectedApp(updated)
      }
      setToast(`Updated application for ${draft.company}`)
    } else {
      // Create new
      const newApp: Application = {
        id: `app_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        ...draft,
        createdAt: nowIso,
        updatedAt: nowIso,
      }
      const nextList = [newApp, ...applications]
      setApplications(nextList)
      persistApplications(user.id, nextList)
      setToast(`Application added: ${draft.title} at ${draft.company}`)
    }
    closeModal()
  }

  function handleStatusChange(id: string, newStatus: ApplicationStatus) {
    if (!user) return
    const nextList = applications.map((item) =>
      item.id === id ? { ...item, status: newStatus, updatedAt: new Date().toISOString() } : item
    )
    setApplications(nextList)
    persistApplications(user.id, nextList)
    if (selectedApp?.id === id) {
      setSelectedApp({ ...selectedApp, status: newStatus })
    }
    setToast(`Status updated to ${newStatus}`)
  }

  function promptDelete(app: Application) {
    setDeletingApp(app)
  }

  function confirmDelete() {
    if (!user || !deletingApp) return
    const nextList = applications.filter((item) => item.id !== deletingApp.id)
    setApplications(nextList)
    persistApplications(user.id, nextList)
    if (selectedApp?.id === deletingApp.id) {
      setSelectedApp(null)
    }
    setToast(`Deleted application for ${deletingApp.company}`)
    setDeletingApp(null)
  }

  function handleUpdateSettings(newSettings: AppSettings) {
    setSettings(newSettings)
    saveSettings(newSettings)
    setToast('Settings saved')
  }

  function handleUpdateUserName(newName: string) {
    if (!user) return
    const updated = { ...user, name: newName }
    setUser(updated)
    saveUserSession(updated)
    setToast('Profile updated')
  }

  function handleLogout() {
    if (supabase && supabaseConfigured) {
      supabase.auth.signOut().catch(console.error)
    }
    setUser(null)
    saveUserSession(null)
    setProfileOpen(false)
    setToast('Signed out')
  }

  function handleExportJson() {
    if (!user) return
    const jsonStr = exportApplicationsJson(user.id, user.email)
    const blob = new Blob([jsonStr], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `jobtrack-applications-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setToast('Applications downloaded as JSON')
  }

  function handleImportJson(jsonStr: string) {
    if (!user) return
    const res = importApplicationsJson(user.id, jsonStr)
    if (res.success) {
      const refreshed = loadApplications(user.id)
      setApplications(refreshed)
      setToast(`Successfully imported ${res.count} applications!`)
    } else {
      setToast(`Import failed: ${res.error}`)
    }
  }

  function handleResetSampleData() {
    if (!user) return
    const reset = resetToSampleData(user.id)
    setApplications(reset)
    setToast('Reset applications to demo sample data')
    setSettingsOpen(false)
  }

  function handleClearAllData() {
    if (!user) return
    const empty = clearAllApplications(user.id)
    setApplications(empty)
    setToast('All application records cleared')
    setSettingsOpen(false)
  }

  // Filtered & Sorted applications
  const filteredApplications = useMemo(() => {
    let result = [...applications]

    // Search filter
    if (filters.search.trim()) {
      const q = filters.search.toLowerCase()
      result = result.filter(
        (app) =>
          app.company.toLowerCase().includes(q) ||
          app.title.toLowerCase().includes(q) ||
          (app.location && app.location.toLowerCase().includes(q)) ||
          (app.notes && app.notes.toLowerCase().includes(q))
      )
    }

    // Status filter
    if (filters.status !== 'All') {
      result = result.filter((app) => app.status === filters.status)
    }

    // Sort order
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'date-desc':
          return `${b.appliedDate}${b.appliedTime || ''}`.localeCompare(
            `${a.appliedDate}${a.appliedTime || ''}`
          )
        case 'date-asc':
          return `${a.appliedDate}${a.appliedTime || ''}`.localeCompare(
            `${b.appliedDate}${b.appliedTime || ''}`
          )
        case 'company-asc':
          return a.company.localeCompare(b.company)
        case 'company-desc':
          return b.company.localeCompare(a.company)
        case 'status':
          return a.status.localeCompare(b.status)
        default:
          return 0
      }
    })

    return result
  }, [applications, filters])

  // Count stats
  const stats = useMemo(() => {
    const thisMonthCount = applications.filter((app) => {
      const d = localDate(app.appliedDate)
      return (
        d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      )
    }).length

    const activeInterviews = applications.filter(
      (app) => app.status === 'Interview'
    ).length

    const offers = applications.filter((app) => app.status === 'Offer').length

    const uniqueDays = new Set(applications.map((app) => app.appliedDate)).size

    return {
      total: applications.length,
      thisMonth: thisMonthCount,
      interviews: activeInterviews,
      offers,
      uniqueDays,
    }
  }, [applications, now])

  // Status counts for filter pills
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {
      All: applications.length,
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

  // Authentication View Flow
  if (!authReady) {
    return <div className="loading-screen" role="status">Loading JobTrack…</div>
  }

  if (authScreen === 'reset') {
    return <ResetPasswordPanel onComplete={() => setAuthScreen('login')} />
  }

  if (!user) {
    return (
      <AuthPanel
        mode={authScreen}
        onModeChange={setAuthScreen}
        onLocalLogin={(localUser) => {
          setUser(localUser)
          saveUserSession(localUser)
          setToast(`Signed in as ${localUser.name}`)
        }}
      />
    )
  }

  return (
    <div className="app-shell">
      {/* Topbar */}
      <header className="topbar">
        <div className="topbar-inner">
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <button
              className="brand"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              aria-label="JobTrack home"
            >
              <span className="brand-mark">J</span>
              <span className="brand-name">JobTrack</span>
              <span className="brand-badge">PRO</span>
            </button>

            {/* Navigation tabs in header for desktop */}
            <nav className="topbar-nav" aria-label="Views">
              <button
                type="button"
                className={`nav-tab-btn ${currentView === 'timeline' ? 'active' : ''}`}
                onClick={() => setCurrentView('timeline')}
              >
                <Icon name="timeline" size={14} /> Timeline
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${currentView === 'kanban' ? 'active' : ''}`}
                onClick={() => setCurrentView('kanban')}
              >
                <Icon name="kanban" size={14} /> Kanban
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${currentView === 'table' ? 'active' : ''}`}
                onClick={() => setCurrentView('table')}
              >
                <Icon name="table" size={14} /> Table
              </button>
              <button
                type="button"
                className={`nav-tab-btn ${currentView === 'analytics' ? 'active' : ''}`}
                onClick={() => setCurrentView('analytics')}
              >
                <Icon name="chart" size={14} /> Insights
              </button>
            </nav>
          </div>

          <div className="topbar-actions">
            {/* Quick add button */}
            <button
              type="button"
              className="primary-button"
              style={{ padding: '8px 14px', fontSize: '11px' }}
              onClick={() => openAddModal()}
            >
              <Icon name="plus" size={14} /> Add
            </button>

            {/* Settings button */}
            <button
              type="button"
              className="icon-button"
              onClick={() => setSettingsOpen(true)}
              title="Settings & Data"
              aria-label="Settings"
            >
              <Icon name="settings" size={16} />
            </button>

            {/* Profile Menu */}
            <div className="profile-wrap" ref={profileMenuRef}>
              <button
                className="profile-button"
                onClick={() => setProfileOpen((prev) => !prev)}
                aria-expanded={profileOpen}
                aria-controls="profile-menu"
                aria-label="Open profile menu"
              >
                <span className="avatar">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="profile-label">{user.name}</span>
                <span className="profile-chevron">
                  <Icon name="chevron-down" size={13} />
                </span>
              </button>

              {profileOpen && (
                <div className="profile-menu" id="profile-menu" role="menu">
                  <div className="profile-menu-header">
                    <div className="profile-menu-name">{user.name}</div>
                    <div className="profile-menu-email">{user.email}</div>
                  </div>
                  <div className="profile-menu-items">
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false)
                        setProfileModalOpen(true)
                      }}
                    >
                      <Icon name="user" size={15} /> Account Profile
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false)
                        setSettingsOpen(true)
                      }}
                    >
                      <Icon name="settings" size={15} /> Preferences & Backup
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false)
                        handleExportJson()
                      }}
                    >
                      <Icon name="download" size={15} /> Export Applications
                    </button>
                    <button
                      role="menuitem"
                      onClick={() => {
                        setProfileOpen(false)
                        setShortcutsOpen(true)
                      }}
                    >
                      <Icon name="keyboard" size={15} /> Keyboard Shortcuts
                    </button>
                    <div className="profile-menu-divider" />
                    <button
                      role="menuitem"
                      className="danger"
                      onClick={handleLogout}
                    >
                      <Icon name="logout" size={15} /> Sign out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Hero Section */}
        <section className="hero-row">
          <div>
            <p className="eyebrow">{greeting(now)}</p>
            <h1>
              Keep moving forward<span className="period">.</span>
            </h1>
            <p className="hero-note">
              A minimalist, high-precision view of every opportunity you're pursuing.
            </p>
          </div>
          <div className="hero-actions">
            <button
              className="primary-button hero-add"
              onClick={() => openAddModal()}
            >
              <Icon name="plus" size={16} /> Add application
            </button>
          </div>
        </section>

        {/* Live Date & Time Strip */}
        <section className="date-strip" aria-label="Current date and time">
          <div className="date-main">
            <span className="live-dot" />
            <strong>
              {now.toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
                second: '2-digit',
                hour12: !settings.timeFormat24h,
              })}
            </strong>
            <span className="date-separator">/</span>
            <span>
              {now.toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
          <div className="date-meta-right">
            <span className="date-year">{now.getFullYear()}</span>
          </div>
        </section>

        {/* Concise Statistics Grid */}
        <section className="stats-grid" aria-label="Application statistics">
          <div className="stat">
            <span>Applications</span>
            <strong>{stats.total}</strong>
            <small>Total tracked</small>
          </div>
          <div className="stat">
            <span>This month</span>
            <strong>{stats.thisMonth}</strong>
            <small>Submitted</small>
          </div>
          <div className="stat">
            <span>Interviews</span>
            <strong>{stats.interviews}</strong>
            <small>In progress</small>
          </div>
          <div className="stat">
            <span>Offers</span>
            <strong>{stats.offers}</strong>
            <small>Received</small>
          </div>
          <div className="stat">
            <span>Days active</span>
            <strong>{stats.uniqueDays}</strong>
            <small>With submissions</small>
          </div>
        </section>

        {/* Controls Toolbar: View Switcher, Search, Filters, Sort */}
        <section className="controls-toolbar" aria-label="Filters and view controls">
          <div className="controls-row-top">
            {/* View Switcher Segmented Control */}
            <div className="view-tabs-segmented" role="tablist" aria-label="View switch">
              <button
                type="button"
                role="tab"
                aria-selected={currentView === 'timeline'}
                className={`view-tab-pill ${currentView === 'timeline' ? 'active' : ''}`}
                onClick={() => setCurrentView('timeline')}
              >
                <Icon name="timeline" size={13} /> Timeline
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={currentView === 'kanban'}
                className={`view-tab-pill ${currentView === 'kanban' ? 'active' : ''}`}
                onClick={() => setCurrentView('kanban')}
              >
                <Icon name="kanban" size={13} /> Kanban
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={currentView === 'table'}
                className={`view-tab-pill ${currentView === 'table' ? 'active' : ''}`}
                onClick={() => setCurrentView('table')}
              >
                <Icon name="table" size={13} /> Table
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={currentView === 'analytics'}
                className={`view-tab-pill ${currentView === 'analytics' ? 'active' : ''}`}
                onClick={() => setCurrentView('analytics')}
              >
                <Icon name="chart" size={13} /> Insights
              </button>
            </div>

            {/* Instant Search Bar */}
            <div className="search-box-wrap">
              <span className="search-icon">
                <Icon name="search" size={14} />
              </span>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                placeholder="Search company, title, notes... (/)"
                value={filters.search}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, search: e.target.value }))
                }
              />
              {filters.search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, search: '' }))
                  }
                  aria-label="Clear search"
                >
                  <Icon name="close" size={12} />
                </button>
              )}
            </div>
          </div>

          <div className="controls-row-filters">
            {/* Status Filter Pills */}
            <div className="status-filters" role="group" aria-label="Filter by status">
              {(['All', 'Applied', 'Under Review', 'Interview', 'Offer', 'Rejected'] as (
                | 'All'
                | ApplicationStatus
              )[]).map((st) => (
                <button
                  key={st}
                  type="button"
                  className={`status-pill ${filters.status === st ? 'active' : ''}`}
                  onClick={() =>
                    setFilters((prev) => ({ ...prev, status: st }))
                  }
                >
                  <span>{st}</span>
                  <span className="count">{statusCounts[st] || 0}</span>
                </button>
              ))}
            </div>

            {/* Sort & Count */}
            <div className="sort-and-meta">
              <div className="sort-wrap">
                <label htmlFor="sort-dropdown">Sort by:</label>
                <select
                  id="sort-dropdown"
                  className="sort-select"
                  value={filters.sortBy}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as any,
                    }))
                  }
                >
                  <option value="date-desc">Date (Newest first)</option>
                  <option value="date-asc">Date (Oldest first)</option>
                  <option value="company-asc">Company (A to Z)</option>
                  <option value="company-desc">Company (Z to A)</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </div>
          </div>

          {/* Active filter notification if filtering */}
          {(filters.search || filters.status !== 'All') && (
            <div className="active-filter-bar">
              <span>
                Showing <strong>{filteredApplications.length}</strong> of{' '}
                {applications.length} applications
                {filters.status !== 'All' && ` in ${filters.status}`}
                {filters.search && ` matching "${filters.search}"`}
              </span>
              <button
                type="button"
                className="filter-reset-btn"
                onClick={() =>
                  setFilters({ search: '', status: 'All', sortBy: 'date-desc' })
                }
              >
                Clear all filters
              </button>
            </div>
          )}
        </section>

        {/* Applications Display Section */}
        <section className="applications-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your records</p>
              <h2>
                {currentView === 'timeline' && 'Application Timeline'}
                {currentView === 'kanban' && 'Stage Pipeline'}
                {currentView === 'table' && 'Detailed List'}
                {currentView === 'analytics' && 'Recruiting Analytics'}
              </h2>
            </div>
            <button
              className="text-button"
              onClick={() => openAddModal()}
            >
              <span>Add opportunity</span> <Icon name="arrow" size={15} />
            </button>
          </div>

          {errorMessage && (
            <div className="form-error" role="alert" style={{ marginBottom: '18px' }}>
              {errorMessage}
            </div>
          )}

          {loading ? (
            <div className="loading-state">Loading applications…</div>
          ) : applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-line" />
              <div className="empty-copy">
                <span className="empty-icon">
                  <Icon name="briefcase" size={24} />
                </span>
                <div>
                  <h3>Nothing tracked yet</h3>
                  <p>
                    Start with the dream company or opportunity you're applying to today.
                  </p>
                </div>
              </div>
              <button
                className="secondary-button"
                onClick={() => openAddModal()}
              >
                <Icon name="plus" size={15} /> Add your first application
              </button>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-line" />
              <div className="empty-copy">
                <span className="empty-icon">
                  <Icon name="search" size={24} />
                </span>
                <div>
                  <h3>No matching applications</h3>
                  <p>
                    Try adjusting your search query or switching the status filter to "All".
                  </p>
                </div>
              </div>
              <button
                className="secondary-button"
                onClick={() =>
                  setFilters({ search: '', status: 'All', sortBy: 'date-desc' })
                }
              >
                Clear filters
              </button>
            </div>
          ) : (
            <>
              {currentView === 'timeline' && (
                <TimelineView
                  applications={filteredApplications}
                  timeFormat24h={settings.timeFormat24h}
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onEdit={openEditModal}
                  onDelete={promptDelete}
                />
              )}

              {currentView === 'kanban' && (
                <KanbanView
                  applications={filteredApplications}
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onAddInStage={(stage) => openAddModal(stage)}
                  onStatusChange={handleStatusChange}
                />
              )}

              {currentView === 'table' && (
                <TableView
                  applications={filteredApplications}
                  timeFormat24h={settings.timeFormat24h}
                  onSelectApplication={(app) => setSelectedApp(app)}
                  onEdit={openEditModal}
                  onDelete={promptDelete}
                />
              )}

              {currentView === 'analytics' && (
                <AnalyticsView
                  applications={applications}
                  onSelectApplication={(app) => setSelectedApp(app)}
                />
              )}
            </>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div>
          <span>JobTrack · Private by default</span>
        </div>
        <div className="footer-links">
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setShortcutsOpen(true)}
          >
            Keyboard Shortcuts (?)
          </button>
          <span>·</span>
          <button
            type="button"
            className="footer-link-btn"
            onClick={() => setSettingsOpen(true)}
          >
            Preferences
          </button>
          <span>·</span>
          <button
            type="button"
            className="footer-link-btn"
            onClick={handleExportJson}
          >
            Backup JSON
          </button>
        </div>
      </footer>

      {/* Modals & Overlays */}
      {modalMode && (
        <ApplicationModal
          mode={modalMode}
          application={editingApp}
          onClose={closeModal}
          onSave={handleSaveApplication}
        />
      )}

      {selectedApp && (
        <ApplicationDetailDrawer
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onEdit={openEditModal}
          onDelete={promptDelete}
          onStatusChange={handleStatusChange}
          onCopySuccess={() => setToast('Copied application details to clipboard!')}
        />
      )}

      {deletingApp && (
        <DeleteConfirmModal
          application={deletingApp}
          onClose={() => setDeletingApp(null)}
          onConfirm={confirmDelete}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
          onClose={() => setSettingsOpen(false)}
          onExport={handleExportJson}
          onImport={handleImportJson}
          onResetSampleData={handleResetSampleData}
          onClearAllData={handleClearAllData}
        />
      )}

      {profileModalOpen && (
        <ProfileModal
          user={user}
          applications={applications}
          onClose={() => setProfileModalOpen(false)}
          onUpdateName={handleUpdateUserName}
          onLogout={handleLogout}
        />
      )}

      {shortcutsOpen && (
        <KeyboardShortcutsModal onClose={() => setShortcutsOpen(false)} />
      )}

      {/* Animated Toast Pill */}
      {toast && (
        <div className="toast" role="status">
          <span className="toast-check">
            <Icon name="check" size={14} />
          </span>
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}
