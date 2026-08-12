import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || supabaseAnonKey

export function isSupabaseConfigured() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project') &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('dummy')
  )
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`,
    supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Component ignore
          }
        },
      },
    }
  )
}

export function createServiceClient() {
  return createServerClient(
    supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`,
    supabaseServiceKey,
    {
      cookies: {
        getAll() { return [] },
        setAll() {},
      },
    }
  )
}
