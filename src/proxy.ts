import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder-project.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy'

const isConfigured =
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project') &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('dummy')

export async function proxy(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const isLoginPage = request.nextUrl.pathname === '/login'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const isPublicAsset =
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.startsWith('/blueprint.png') ||
    request.nextUrl.pathname.includes('.')

  // Allow API routes and public assets through
  if (isApiRoute || isPublicAsset) {
    return supabaseResponse
  }

  let isAuthenticated = false

  // Check demo session cookie first
  const demoSession = request.cookies.get('safetynet_session')?.value
  if (demoSession) {
    isAuthenticated = true
  } else if (isConfigured) {
    try {
      const supabase = createServerClient(
        supabaseUrl.startsWith('http') ? supabaseUrl : `https://${supabaseUrl}`,
        supabaseAnonKey,
        {
          cookies: {
            getAll() {
              return request.cookies.getAll()
            },
            setAll(cookiesToSet) {
              cookiesToSet.forEach(({ name, value }) =>
                request.cookies.set(name, value)
              )
              supabaseResponse = NextResponse.next({ request })
              cookiesToSet.forEach(({ name, value, options }) =>
                supabaseResponse.cookies.set(name, value, options)
              )
            },
          },
        }
      )

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        isAuthenticated = true
      }
    } catch {
      // Fallback
    }
  }

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login page
  if (isAuthenticated && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Redirect root to dashboard if authenticated, or login if not
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = isAuthenticated ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
