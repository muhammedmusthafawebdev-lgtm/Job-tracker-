import React, { useState, useRef, FormEvent } from 'react'
import { supabase } from '../lib/supabase'
import { Icon } from './Icon'

interface ResetPasswordPanelProps {
  onComplete: () => void
}

export function ResetPasswordPanel({ onComplete }: ResetPasswordPanelProps) {
  const [password, setPassword] = useState('')
  const [confirmation, setConfirmation] = useState('')
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

    if (password.length < 8 || password.length > 128) {
      setError('Password must be at least 8 characters.')
      return
    }

    if (password !== confirmation) {
      setError('Passwords do not match.')
      return
    }

    busyRef.current = true
    setBusy(true)

    try {
      if (supabase) {
        const { error: updateError } = await supabase.auth.updateUser({ password })
        if (updateError) throw updateError
        await supabase.auth.signOut()
      }
      setNotice('Your password has been updated. You can now sign in.')
      window.setTimeout(onComplete, 1200)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to update password.')
    } finally {
      busyRef.current = false
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-intro">
        <div className="brand auth-brand">
          <span className="brand-mark">J</span>
          <span className="brand-name">JobTrack</span>
        </div>
        <div className="auth-statement">
          <p className="eyebrow">Account recovery</p>
          <h1>
            Make space for the work that matters<span className="period">.</span>
          </h1>
          <p>Choose a new password to return to your applications.</p>
        </div>
      </div>

      <div className="auth-form-wrap">
        <div className="auth-form-header">
          <p className="eyebrow">Secure reset</p>
          <h2>Choose a new password</h2>
          <p>Use a password with at least 8 characters.</p>
        </div>

        <form className="auth-form" onSubmit={submit}>
          <label htmlFor="reset-password">
            New password
            <span className="password-field">
              <input
                id="reset-password"
                type={showPassword ? 'text' : 'password'}
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
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </span>
          </label>

          <label htmlFor="reset-confirmation">
            Confirm password
            <input
              id="reset-confirmation"
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              placeholder="Repeat your new password"
            />
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}
          {notice && <p className="form-success" role="status">{notice}</p>}

          <button
            className="primary-button auth-submit"
            type="submit"
            disabled={busy}
          >
            {busy ? 'Please wait…' : 'Update password'}{' '}
            {!busy && <Icon name="arrow" size={16} />}
          </button>
        </form>

        <div className="auth-switch" style={{ marginTop: '20px' }}>
          <button type="button" onClick={onComplete}>
            ← Back to sign in
          </button>
        </div>
      </div>
    </div>
  )
}
