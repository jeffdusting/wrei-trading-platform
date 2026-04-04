/**
 * POST /api/auth/register — Create a new user account.
 *
 * Body: { email, password, name, role?, organisationName? }
 * Returns: { user, apiKey }
 */

import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@/lib/db/connection';
import { hashPassword } from '@/lib/auth/password';
import { generateApiKey } from '@/lib/auth/api-key';
import type { UserRole } from '@/lib/auth/types';

const VALID_ROLES: UserRole[] = ['admin', 'broker', 'trader', 'compliance', 'readonly'];

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { email, password, name, role, organisationName } = body as {
    email?: string;
    password?: string;
    name?: string;
    role?: string;
    organisationName?: string;
  };

  if (!email || !password || !name) {
    return NextResponse.json(
      { error: 'Missing required fields: email, password, name' },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    );
  }

  const userRole: UserRole = (role && VALID_ROLES.includes(role as UserRole))
    ? (role as UserRole)
    : 'trader';

  try {
    // Check for existing user
    const { rows: existing } = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const passwordHash = await hashPassword(password);
    const apiKey = generateApiKey();

    const { rows } = await sql`
      INSERT INTO users (email, password_hash, name, role, organisation_name, api_key, api_key_created_at)
      VALUES (${email}, ${passwordHash}, ${name}, ${userRole}, ${organisationName || null}, ${apiKey}, NOW())
      RETURNING
        id, email, name, role,
        organisation_id AS "organisationId",
        organisation_name AS "organisationName",
        is_active AS "isActive",
        created_at AS "createdAt"
    `;

    return NextResponse.json({ user: rows[0], apiKey }, { status: 201 });
  } catch (err) {
    console.error('Registration error:', err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
