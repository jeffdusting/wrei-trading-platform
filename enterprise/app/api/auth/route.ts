import { NextResponse } from 'next/server'

/**
 * Auth stub — development login endpoint.
 * In production, this would handle SAML/OIDC callback from Downer IdP.
 */

// GET /api/auth/login — returns dev user info (stub)
export async function GET() {
  const isDev = process.env.NODE_ENV === 'development' || process.env.AUTH_PROVIDER === 'stub'

  if (isDev) {
    return NextResponse.json({
      authenticated: true,
      user: {
        email: 'dev.user@downer.com.au',
        name: 'Development User',
        role: 'admin',
        division: 'Downer Rail',
      },
      provider: 'stub',
      message: 'SSO stub — production integration requires SAML_METADATA_URL',
    })
  }

  // Production — would redirect to SAML IdP
  const samlUrl = process.env.SAML_METADATA_URL
  if (!samlUrl) {
    return NextResponse.json(
      { error: 'SSO not configured', message: 'Set SAML_METADATA_URL environment variable' },
      { status: 503 }
    )
  }

  // Placeholder for real SAML redirect
  return NextResponse.json({
    authenticated: false,
    loginUrl: '/api/auth/saml/login',
    provider: 'saml',
  })
}
