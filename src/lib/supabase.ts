import { createClient } from '@supabase/supabase-js'

// Free Supabase public credentials (can be configured via settings or env)
const DEFAULT_URL = 'https://demo-placeholder.supabase.co'
const DEFAULT_ANON_KEY = 'demo-placeholder-key'

const savedUrl = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL || DEFAULT_URL
const savedKey = localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_ANON_KEY

export const supabase = createClient(savedUrl, savedKey)

export function updateSupabaseConfig(url: string, key: string) {
  localStorage.setItem('supabase_url', url)
  localStorage.setItem('supabase_key', key)
  window.location.reload()
}

export function isSupabaseConfigured() {
  const url = localStorage.getItem('supabase_url') || import.meta.env.VITE_SUPABASE_URL
  const key = localStorage.getItem('supabase_key') || import.meta.env.VITE_SUPABASE_ANON_KEY
  return !!(url && key && url !== DEFAULT_URL)
}
