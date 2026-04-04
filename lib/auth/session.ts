/**
 * Session management — create, validate, and delete user sessions.
 *
 * Sessions are stored in the `sessions` table and expire after 24 hours.
 * Tokens are random UUIDs.
 */

import { randomUUID } from 'crypto';
import { sql } from '@/lib/db/connection';
import type { AuthUser } from './types';

const SESSION_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

export async function createSession(
  userId: string
): Promise<{ token: string; expiresAt: Date }> {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;

  return { token, expiresAt };
}

export async function validateSession(
  token: string
): Promise<AuthUser | null> {
  const { rows } = await sql`
    SELECT
      u.id,
      u.email,
      u.name,
      u.role,
      u.organisation_id AS "organisationId",
      u.organisation_name AS "organisationName",
      u.is_active AS "isActive"
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token = ${token}
      AND s.expires_at > NOW()
      AND u.is_active = true
  `;

  if (rows.length === 0) return null;

  return rows[0] as AuthUser;
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}
