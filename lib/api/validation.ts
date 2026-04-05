/**
 * Request validation utilities for the WREI public REST API.
 */

import type { InstrumentType } from '@/lib/trading/instruments/types';

// ---------------------------------------------------------------------------
// Validation result
// ---------------------------------------------------------------------------

export interface ValidationError {
  field: string;
  message: string;
}

// ---------------------------------------------------------------------------
// Required fields
// ---------------------------------------------------------------------------

export function validateRequired(
  body: Record<string, unknown>,
  fields: string[],
): ValidationError[] {
  const errors: ValidationError[] = [];
  for (const field of fields) {
    if (body[field] === undefined || body[field] === null || body[field] === '') {
      errors.push({ field, message: `${field} is required` });
    }
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Instrument type
// ---------------------------------------------------------------------------

const VALID_INSTRUMENT_TYPES: Set<string> = new Set([
  'ESC', 'VEEC', 'PRC', 'ACCU', 'LGC', 'STC', 'WREI_CC', 'WREI_ACO',
]);

export function validateInstrumentType(
  type: string,
): { valid: true; type: InstrumentType } | { valid: false; error: ValidationError } {
  if (VALID_INSTRUMENT_TYPES.has(type)) {
    return { valid: true, type: type as InstrumentType };
  }
  return {
    valid: false,
    error: {
      field: 'instrument',
      message: `Invalid instrument type "${type}". Valid types: ${Array.from(VALID_INSTRUMENT_TYPES).join(', ')}`,
    },
  };
}

// ---------------------------------------------------------------------------
// Pagination
// ---------------------------------------------------------------------------

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

export interface PaginationParams {
  page: number;
  limit: number;
  offset: number;
}

export function validatePagination(
  searchParams: URLSearchParams,
): { valid: true; params: PaginationParams } | { valid: false; error: ValidationError } {
  const rawPage = searchParams.get('page');
  const rawLimit = searchParams.get('limit');

  const page = rawPage ? parseInt(rawPage, 10) : DEFAULT_PAGE;
  const limit = rawLimit ? parseInt(rawLimit, 10) : DEFAULT_LIMIT;

  if (isNaN(page) || page < 1) {
    return { valid: false, error: { field: 'page', message: 'page must be a positive integer' } };
  }
  if (isNaN(limit) || limit < 1) {
    return { valid: false, error: { field: 'limit', message: 'limit must be a positive integer' } };
  }
  if (limit > MAX_LIMIT) {
    return { valid: false, error: { field: 'limit', message: `limit cannot exceed ${MAX_LIMIT}` } };
  }

  return {
    valid: true,
    params: { page, limit, offset: (page - 1) * limit },
  };
}
