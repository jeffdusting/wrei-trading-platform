/**
 * GET /api/auth/me — Return the currently authenticated user.
 *
 * Accepts: Authorization: Bearer <token> or X-API-Key: <key>
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth/session';
import { validateApiKey } from '@/lib/auth/api-key';

export async function GET(request: NextRequest) {
  try {
    // Check session token
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.slice(7);
      const user = await validateSession(token);
      if (user) {
        return NextResponse.json({ user, method: 'session' });
      }
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 });
    }

    // Check API key
    const apiKey = request.headers.get('x-api-key');
    if (apiKey) {
      const user = await validateApiKey(apiKey);
      if (user) {
        return NextResponse.json({ user, method: 'api_key' });
      }
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  } catch (err) {
    console.error('Auth check error:', err);
    return NextResponse.json({ error: 'Service temporarily unavailable' }, { status: 503 });
  }
}
