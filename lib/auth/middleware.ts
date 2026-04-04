/**
 * Auth middleware for Next.js API routes.
 *
 * Wraps a route handler to enforce authentication via session tokens
 * or API keys. Returns 401/403/503 as appropriate.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from './session';
import { validateApiKey } from './api-key';
import type { AuthUser, AuthOptions, AuthResult } from './types';

// Extend NextRequest to carry auth context via headers (Next.js doesn't
// support req.user natively, so we pass the user as a serialised header).
const AUTH_USER_HEADER = 'x-auth-user';

export function getAuthUser(request: NextRequest): AuthUser | null {
  const raw = request.headers.get(AUTH_USER_HEADER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

type RouteHandler = (
  request: NextRequest,
  context?: unknown
) => Promise<NextResponse> | NextResponse;

export function withAuth(
  handler: RouteHandler,
  options: AuthOptions = {}
): RouteHandler {
  return async (request: NextRequest, context?: unknown) => {
    let result: AuthResult;

    try {
      result = await authenticate(request);
    } catch {
      return NextResponse.json(
        { error: 'Service temporarily unavailable' },
        { status: 503 }
      );
    }

    if (!result.authenticated) {
      if (options.optional) {
        return handler(request, context);
      }
      return NextResponse.json(
        { error: result.error || 'Authentication required' },
        { status: 401 }
      );
    }

    // Role check
    if (options.roles && options.roles.length > 0 && result.user) {
      if (!options.roles.includes(result.user.role)) {
        return NextResponse.json(
          { error: 'Insufficient permissions' },
          { status: 403 }
        );
      }
    }

    // Attach user to request via cloned headers
    const headers = new Headers(request.headers);
    headers.set(AUTH_USER_HEADER, JSON.stringify(result.user));
    const authedRequest = new NextRequest(request.url, {
      method: request.method,
      headers,
      body: request.body,
      // @ts-expect-error duplex is required for streams but not in the type
      duplex: 'half',
    });

    return handler(authedRequest, context);
  };
}

async function authenticate(request: NextRequest): Promise<AuthResult> {
  // 1. Check Bearer token (session)
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const user = await validateSession(token);
    if (user) {
      return { authenticated: true, user, method: 'session' };
    }
    return {
      authenticated: false,
      user: null,
      method: null,
      error: 'Invalid or expired session token',
    };
  }

  // 2. Check API key
  const apiKey = request.headers.get('x-api-key');
  if (apiKey) {
    const user = await validateApiKey(apiKey);
    if (user) {
      return { authenticated: true, user, method: 'api_key' };
    }
    return {
      authenticated: false,
      user: null,
      method: null,
      error: 'Invalid API key',
    };
  }

  // No credentials provided
  return {
    authenticated: false,
    user: null,
    method: null,
    error: 'Authentication required',
  };
}
