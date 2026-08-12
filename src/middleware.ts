import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const isLoginPage = request.nextUrl.pathname === '/login'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  const isPublicAsset =
    request.nextUrl.pathname.startsWith('/_next/') ||
    request.nextUrl.pathname.startsWith('/favicon.ico') ||
    request.nextUrl.pathname.includes('.')

  // Allow API routes and public assets
  if (isApiRoute || isPublicAsset) {
    return NextResponse.next()
  }

  const demoSession = request.cookies.get('safetynet_session')?.value
  const isAuthenticated = !!demoSession

  // Redirect unauthenticated users to login
  if (!isAuthenticated && !isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login
  if (isAuthenticated && isLoginPage) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Root path redirect
  if (request.nextUrl.pathname === '/') {
    const url = request.nextUrl.clone()
    url.pathname = isAuthenticated ? '/dashboard' : '/login'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
