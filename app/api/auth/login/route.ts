/**
 * POST /api/auth/login — Authenticate with email and password.
 *
 * Body: { email, password }
 * Returns: { user, token, expiresAt }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { verifyPassword } from '@/lib/auth/password';
import { createSession } from '@/lib/auth/session';

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password } = body as { email?: string; password?: string };

  if (!email || !password) {
    return NextResponse.json(
      { error: 'Missing required fields: email, password' },
      { status: 400 }
    );
  }

  try {
    const { rows } = await sql`
      SELECT
        id, email, name, role, password_hash,
        organisation_id AS "organisationId",
        organisation_name AS "organisationName",
        is_active AS "isActive"
      FROM users
      WHERE email = ${email}
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const user = rows[0];

    if (!user.isActive) {
      return NextResponse.json({ error: 'Account is deactivated' }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const session = await createSession(user.id);

    // Update last_login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;

    // Strip password_hash from response
    const { password_hash: _, ...safeUser } = user;

    return NextResponse.json({
      user: safeUser,
      token: session.token,
      expiresAt: session.expiresAt,
    });
  } catch (err) {
    console.error('Login error:', err);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}
