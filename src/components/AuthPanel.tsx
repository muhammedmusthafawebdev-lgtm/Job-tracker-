import React, { useState, useRef, FormEvent } from 'react'
import { AuthMode, UserProfile } from '../types'
import { DEMO_USER } from '../lib/storage'
import { supabase, supabaseConfigured, getAuthRedirectUrl } from '../lib/supabase'
import { Icon } from './Icon'

interface AuthPanelProps {
  mode: AuthMode
  onModeChange: (mode: AuthMode) => void
  onLocalLogin: (user: UserProfile) => void
}

function friendlyError(message: string) {
  if (/invalid login credentials/i.test(message)) return 'That email or password is not correct.'
  if (/email not confirmed/i.test(message)) return 'Check your email to confirm your account before signing in.'
  if (/rate limit|too many requests/i.test(message)) return 'Too many attempts. Please wait a moment and try again.'
  if (/network|fetch/i.test(message)) return 'We could not reach the server. Check your connection and try again.'
  return 'Something went wrong. Please try again.'
}

export function AuthPanel({ mode, onModeChange, onLocalLogin }: AuthPanelProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)
  const busyRef = useRef(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busyRef.current) return
    setError('')
    setNotice('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail) || normalizedEmail.length > 254) {
      setError('Please enter a valid email address.')
      return
    }

    if (mode !== 'forgot' && (password.length < 8 || password.length > 128)) {
      setError('Password must be at least 8 characters long.')
      return
    }

    busyRef.current = true
    setBusy(true)

    // If Supabase is connected and active:
    if (supabase && supabaseConfigured) {
      try {
        if (mode === 'forgot') {
          const { error: resetError } = await supabase.auth.resetPasswordForEmail(normalizedEmail, {
            redirectTo: getAuthRedirectUrl(),
          })
          if (resetError) throw resetError
          setNotice('If an account exists for that email, a reset link is on its way.')
        } else if (mode === 'signup') {
          const { data, error: signupError } = await supabase.auth.signUp({
            email: normalizedEmail,
            password,
            options: { emailRedirectTo: getAuthRedirectUrl() },
          })
          if (signupError && /already registered/i.test(signupError.message)) {
            setNotice('An account already exists for that email. Please sign in.')
          } else if (signupError) {
            throw signupError
          } else {
            setNotice(data.session ? 'Your account is ready.' : 'Check your email to verify your account, then sign in.')
          }
        } else {
          const { error: loginError } = await supabase.auth.signInWithPassword({
            email: normalizedEmail,
            password,
          })
          if (loginError) throw loginError
        }
      } catch (caught) {
        setError(friendlyError(caught instanceof Error ? caught.message : 'Something went wrong.'))
      } finally {
        busyRef.current = false
        setBusy(false)
      }
      return
    }

    // In Frontend-Only / Local Demo Mode:
    setTimeout(() => {
      busyRef.current = false
      setBusy(false)

      if (mode === 'forgot') {
        setNotice('Recovery instructions sent. In demo mode, you can sign in directly.')
        return
      }

      // Generate local profile
      const namePart = normalizedEmail.split('@')[0].replace(/[._-]+/g, ' ')
      const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1)
      const user: UserProfile = {
        id: `usr_${normalizedEmail.replace(/[^a-zA-Z0-9]/g, '_')}`,
        email: normalizedEmail,
        name: formattedName || 'Member',
        createdAt: new Date().toISOString(),
      }
      onLocalLogin(user)
    }, 400)
  }

  function handleDemoUserLogin() {
    onLocalLogin(DEMO_USER)
  }

  const isForgot = mode === 'forgot'

  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <button
          className="brand auth-brand"
          type="button"
          onClick={() => onModeChange('login')}
        >
          <span className="brand-mark">J</span>
          <span className="brand-name">JobTrack</span>
          <span className="brand-badge">Frontend Edition</span>
        </button>

        <div className="auth-statement">
          <p className="eyebrow">Your next move, clearly.</p>
          <h1>
            Make space for the work that matters<span className="period">.</span>
          </h1>
          <p>
            Keep every application, interview stage, and offer in view, without adding more noise to your day.
          </p>
        </div>

        <div className="auth-footer-note">
          Designed with Swiss typographic restraint · Private by default
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-header">
          <p className="eyebrow">
            {isForgot ? 'Account recovery' : mode === 'login' ? 'Welcome back' : 'Create your space'}
          </p>
          <h2>
            {isForgot
              ? 'Reset your password'
              : mode === 'login'
              ? 'Sign in to JobTrack'
              : 'Start tracking'}
          </h2>
          <p>
            {isForgot
              ? 'We’ll send a secure recovery link.'
              : mode === 'login'
              ? 'Pick up where you left off.'
              : 'A clear, focused record for every opportunity.'}
          </p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="auth-email">
            Email address
            <input
              id="auth-email"
              type="email"
              autoComplete="email"
              required
              maxLength={254}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </label>

          {!isForgot && (
            <label htmlFor="auth-password">
              Password
              <span className="password-field">
                <input
                  id="auth-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                  required
                  minLength={8}
                  maxLength={128}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </span>
            </label>
          )}

          {error && (
            <p className="form-error" role="alert">
              {error}
            </p>
          )}
          {notice && (
            <p className="form-success" role="status">
              {notice}
            </p>
          )}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy
              ? 'Please wait…'
              : isForgot
              ? 'Send reset link'
              : mode === 'login'
              ? 'Continue'
              : 'Create account'}
            {!busy && <Icon name="arrow" size={16} />}
          </button>
        </form>

        <div className="auth-switch">
          {mode === 'login' && (
            <>
              <span>Forgot your password?</span>
              <button
                type="button"
                onClick={() => {
                  onModeChange('forgot')
                  setError('')
                  setNotice('')
                }}
              >
                Reset it
              </button>
            </>
          )}
          {mode === 'forgot' && (
            <>
              <span>Remember your password?</span>
              <button
                type="button"
                onClick={() => {
                  onModeChange('login')
                  setError('')
                  setNotice('')
                }}
              >
                Sign in
              </button>
            </>
          )}
          {mode === 'signup' && (
            <>
              <span>Already have an account?</span>
              <button
                type="button"
                onClick={() => {
                  onModeChange('login')
                  setError('')
                  setNotice('')
                }}
              >
                Sign in
              </button>
            </>
          )}
          {mode === 'login' && (
            <span style={{ display: 'inline-flex', gap: '5px', marginLeft: '10px' }}>
              <span>New to JobTrack?</span>
              <button
                type="button"
                onClick={() => {
                  onModeChange('signup')
                  setError('')
                  setNotice('')
                }}
              >
                Create an account
              </button>
            </span>
          )}
        </div>

        {/* Demo Mode Quick Access */}
        <div className="auth-demo-banner">
          <p>
            <strong>Previewing the Frontend?</strong> Instant access with sample applications (Linear, Stripe, Vercel).
          </p>
          <button
            type="button"
            className="demo-login-btn"
            onClick={handleDemoUserLogin}
          >
            <Icon name="check" size={14} /> Explore as Demo User (Alex Morgan)
          </button>
        </div>

        <p className="local-note">
          {supabaseConfigured
            ? 'Connected to Supabase authentication.'
            : 'Frontend test mode · Data safely stored in browser localStorage.'}
        </p>
      </div>
    </div>
  )
}
