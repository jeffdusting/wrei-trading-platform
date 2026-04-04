/**
 * POST /api/auth/logout — Invalidate the current session.
 *
 * Requires: Authorization: Bearer <token>
 */

import { NextRequest, NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.startsWith('Bearer ')) {
    return NextResponse.json({ error: 'No session token provided' }, { status: 401 });
  }

  const token = authHeader.slice(7);

  try {
    await deleteSession(token);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Logout error:', err);
    return NextResponse.json({ error: 'Logout failed' }, { status: 500 });
  }
}
