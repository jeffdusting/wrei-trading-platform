import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * SSO Middleware Stub
 *
 * In development: auto-authenticates with a test user (no redirect).
 * In production: checks for a Bearer token or session cookie.
 *   - When SAML_METADATA_URL is set, real SSO integration kicks in.
 *   - Without it, logs a warning and allows access (dev mode).
 *
 * SSO stub — production integration requires SAML_METADATA_URL
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Allow auth callback routes through
  if (pathname.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // Allow cron routes with secret verification
  if (pathname.startsWith('/api/cron')) {
    const cronSecret = request.headers.get('x-cron-secret')
    if (cronSecret === process.env.CRON_SECRET) {
      return NextResponse.next()
    }
    return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
  }

  // Allow static assets and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico')
  ) {
    return NextResponse.next()
  }

  // Development mode: auto-authenticate
  const isDev = process.env.NODE_ENV === 'development' || process.env.AUTH_PROVIDER === 'stub'
  if (isDev) {
    const response = NextResponse.next()
    // Inject test user headers for downstream consumption
    response.headers.set('x-enterprise-user', 'dev.user@downer.com.au')
    response.headers.set('x-enterprise-role', 'admin')
    response.headers.set('x-enterprise-division', 'Downer Rail')
    return response
  }

  // Production: check for session/token
  const sessionToken = request.cookies.get('enterprise-session')?.value
  const bearerToken = request.headers.get('authorization')?.replace('Bearer ', '')

  if (!sessionToken && !bearerToken) {
    // No valid session — redirect to auth
    const samlUrl = process.env.SAML_METADATA_URL
    if (samlUrl) {
      return NextResponse.redirect(new URL('/api/auth/login', request.url))
    }
    // No SAML configured — warn and allow (degraded mode)
    console.warn('SSO stub — production integration requires SAML_METADATA_URL')
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
