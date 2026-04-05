/**
 * Standardised API response helpers for the WREI public REST API.
 *
 * All v1 endpoints return one of two shapes:
 *   Success: { data: T, meta?: { page, limit, total, pages } }
 *   Error:   { error: { code: string, message: string } }
 */

import { NextResponse } from 'next/server';

// ---------------------------------------------------------------------------
// Error codes
// ---------------------------------------------------------------------------

export type ApiErrorCode =
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation_error'
  | 'rate_limited'
  | 'internal_error';

// ---------------------------------------------------------------------------
// Response types
// ---------------------------------------------------------------------------

export interface ApiMeta {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

// ---------------------------------------------------------------------------
// Success responses
// ---------------------------------------------------------------------------

export function apiSuccess<T>(data: T, meta?: ApiMeta): NextResponse {
  return NextResponse.json(meta ? { data, meta } : { data }, { status: 200 });
}

export function apiCreated<T>(data: T): NextResponse {
  return NextResponse.json({ data }, { status: 201 });
}

export function apiPaginated<T>(
  data: T[],
  page: number,
  limit: number,
  total: number,
): NextResponse {
  return NextResponse.json({
    data,
    meta: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
}

// ---------------------------------------------------------------------------
// Error responses
// ---------------------------------------------------------------------------

export function apiError(
  code: ApiErrorCode,
  message: string,
  status: number,
): NextResponse {
  return NextResponse.json({ error: { code, message } }, { status });
}
