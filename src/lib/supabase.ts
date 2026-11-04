import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
const configuredRedirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL

export const supabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_PUBLISHABLE_KEY') &&
  supabaseUrl.startsWith('http'),
)

export const supabase = supabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null

export function getAuthRedirectUrl() {
  if (configuredRedirectUrl) {
    try {
      const url = new URL(configuredRedirectUrl)
      if (url.protocol === 'https:' || url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
        return url.toString().replace(/\/$/, '')
      }
    } catch {
      // Fall back to the current origin when a local configuration is malformed.
    }
  }
  return window.location.origin
}
