/**
 * API key generation and validation.
 *
 * Keys are 64-char hex strings prefixed with `wrei_`.
 * They don't expire but can be revoked by setting is_active = false on the user.
 */

import { randomBytes } from 'crypto';
import { sql } from '@/lib/db/connection';
import type { AuthUser } from './types';

const API_KEY_PREFIX = 'wrei_';

export function generateApiKey(): string {
  // Total length: 64 characters — "wrei_" (5) + 59 hex chars
  const hex = randomBytes(30).toString('hex').slice(0, 59);
  return `${API_KEY_PREFIX}${hex}`;
}

export async function validateApiKey(
  key: string
): Promise<AuthUser | null> {
  if (!key.startsWith(API_KEY_PREFIX)) return null;

  const { rows } = await sql`
    SELECT
      id,
      email,
      name,
      role,
      organisation_id AS "organisationId",
      organisation_name AS "organisationName",
      is_active AS "isActive"
    FROM users
    WHERE api_key = ${key}
      AND is_active = true
  `;

  if (rows.length === 0) return null;

  return rows[0] as AuthUser;
}
