/**
 * WREI API Helpers - Shared utilities for API endpoints
 *
 * Provides authentication, validation, response envelopes, and rate limiting
 * for the External API Integration (Milestone 2.2)
 */

import { NextRequest } from 'next/server';
import { sanitiseInput } from './defence';
import type { WREITokenType } from './types';

// =============================================================================
// API AUTHENTICATION & RATE LIMITING
// =============================================================================

// Simple in-memory rate limiting for demo (resets on Vercel deploy)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

/**
 * Validates API key from X-WREI-API-Key header
 */
export function validateApiKey(request: NextRequest): { valid: boolean; error?: string } {
  // Skip validation in development/test when env var not set
  const expectedApiKey = process.env.WREI_API_KEY;
  if (!expectedApiKey) {
    return { valid: true }; // Allow through for development/testing
  }

  const providedApiKey = request.headers.get('X-WREI-API-Key');
  if (!providedApiKey) {
    return { valid: false, error: 'Missing X-WREI-API-Key header' };
  }

  if (providedApiKey !== expectedApiKey) {
    return { valid: false, error: 'Invalid API key' };
  }

  return { valid: true };
}

/**
 * Simple rate limiting check (per API key)
 */
export function checkRateLimit(
  apiKey: string = 'anonymous',
  maxRequests: number = 100,
  windowMs: number = 60000 // 1 minute
): boolean {
  const now = Date.now();
  const windowStart = now - windowMs;

  // Get current rate limit record
  const record = rateLimitMap.get(apiKey);

  if (!record || record.resetTime <= now) {
    // New window or expired window
    rateLimitMap.set(apiKey, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }

  if (record.count >= maxRequests) {
    return false; // Rate limit exceeded
  }

  // Increment count
  record.count++;
  return true;
}

/**
 * Cleanup old rate limit entries periodically
 */
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (record.resetTime <= now) {
      rateLimitMap.delete(key);
    }
  }
}

// Clean up every 5 minutes
setInterval(cleanupRateLimitMap, 5 * 60 * 1000);

// =============================================================================
// API RESPONSE UTILITIES
// =============================================================================

export interface ApiMetadata {
  timestamp: string;
  source: string;
  apiVersion: string;
  requestId: string;
}

/**
 * Standard API response envelope
 */
export function apiResponse<T>(
  data: T,
  metadata?: Partial<ApiMetadata>,
  status: number = 200
): Response {
  const responseMetadata: ApiMetadata = {
    timestamp: new Date().toISOString(),
    source: 'WREI_TRADING_PLATFORM',
    apiVersion: '2.2.0',
    requestId: generateRequestId(),
    ...metadata
  };

  return Response.json({
    success: true,
    data,
    metadata: responseMetadata
  }, { status });
}

/**
 * Standard API error response
 */
export function apiError(
  message: string,
  status: number = 400,
  details?: any
): Response {
  const responseMetadata: ApiMetadata = {
    timestamp: new Date().toISOString(),
    source: 'WREI_TRADING_PLATFORM',
    apiVersion: '2.2.0',
    requestId: generateRequestId()
  };

  return Response.json({
    success: false,
    error: message,
    details,
    metadata: responseMetadata
  }, { status });
}

/**
 * Generate unique request ID for tracking
 */
function generateRequestId(): string {
  return `wrei_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// INPUT VALIDATION UTILITIES
// =============================================================================

/**
 * Validate required fields are present in request body
 */
export function validateRequiredFields(body: any, required: string[]): string[] {
  const missing: string[] = [];

  for (const field of required) {
    if (body[field] === undefined || body[field] === null) {
      missing.push(field);
    }
  }

  return missing;
}

/**
 * Validate numeric value is within acceptable range
 */
export function validateNumericRange(
  value: any,
  min: number,
  max: number,
  fieldName: string
): string | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return `${fieldName} must be a valid number`;
  }

  if (value < min || value > max) {
    return `${fieldName} must be between ${min} and ${max}`;
  }

  return null;
}

/**
 * Validate token type against known types
 */
export function validateTokenType(tokenType: string): tokenType is WREITokenType {
  const validTypes: WREITokenType[] = [
    'carbon_credit',
    'asset_co',
    'dual_token',
    'infrastructure_reit'
  ];

  return validTypes.includes(tokenType as WREITokenType);
}

/**
 * Validate value against enum of allowed values
 */
export function validateEnum<T>(
  value: string,
  allowed: T[],
  fieldName: string
): string | null {
  if (!allowed.includes(value as T)) {
    return `${fieldName} must be one of: ${allowed.join(', ')}`;
  }

  return null;
}

/**
 * Validate and sanitise free-text input
 */
export function validateAndSanitiseText(
  text: string,
  maxLength: number = 1000,
  fieldName: string = 'text'
): { sanitised: string; error?: string } {
  if (typeof text !== 'string') {
    return { sanitised: '', error: `${fieldName} must be a string` };
  }

  if (text.length > maxLength) {
    return {
      sanitised: '',
      error: `${fieldName} must be ${maxLength} characters or less`
    };
  }

  const sanitiseResult = sanitiseInput(text);
  return { sanitised: sanitiseResult.cleaned };
}

/**
 * Validate investment amount
 */
export function validateInvestmentAmount(
  amount: any,
  minAmount: number = 1000,
  maxAmount: number = 1_000_000_000
): string | null {
  return validateNumericRange(amount, minAmount, maxAmount, 'investmentAmount');
}

/**
 * Validate time horizon
 */
export function validateTimeHorizon(timeHorizon: any): string | null {
  return validateNumericRange(timeHorizon, 1, 30, 'timeHorizon');
}

/**
 * Validate discount rate
 */
export function validateDiscountRate(discountRate: any): string | null {
  return validateNumericRange(discountRate, 0.01, 0.50, 'discountRate');
}

// =============================================================================
// API REQUEST HELPERS
// =============================================================================

/**
 * Extract and validate query parameters for GET requests
 */
export function getQueryParam(
  request: NextRequest,
  param: string,
  required: boolean = false
): string | null {
  const url = new URL(request.url);
  const value = url.searchParams.get(param);

  if (required && !value) {
    throw new Error(`Missing required query parameter: ${param}`);
  }

  return value;
}

/**
 * Parse and validate JSON body for POST requests
 */
export async function parseJsonBody(request: NextRequest): Promise<any> {
  try {
    const text = await request.text();

    if (!text.trim()) {
      throw new Error('Request body is empty');
    }

    return JSON.parse(text);
  } catch (error) {
    throw new Error(`Invalid JSON in request body: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// =============================================================================
// DATA FEED TYPE VALIDATION
// =============================================================================

export type DataFeedType = 'carbon_pricing' | 'rwa_market' | 'regulatory_alerts' | 'market_sentiment';
export type TimeRange = '1h' | '4h' | '12h' | '24h' | '3d' | '7d' | '30d' | '90d' | '1y';
export type UpdateFrequency = 'real_time' | 'high' | 'medium' | 'low' | 'daily';

/**
 * Validate data feed type
 */
export function validateDataFeedType(feedType: string): feedType is DataFeedType {
  const validTypes: DataFeedType[] = [
    'carbon_pricing',
    'rwa_market',
    'regulatory_alerts',
    'market_sentiment'
  ];

  return validTypes.includes(feedType as DataFeedType);
}

/**
 * Validate time range for historical data
 */
export function validateTimeRange(timeRange: string): timeRange is TimeRange {
  const validRanges: TimeRange[] = [
    '1h', '4h', '12h', '24h', '3d', '7d', '30d', '90d', '1y'
  ];

  return validRanges.includes(timeRange as TimeRange);
}

// =============================================================================
// LOGGING UTILITIES
// =============================================================================

/**
 * Log API request with consistent format
 */
export function logApiRequest(
  method: string,
  endpoint: string,
  action: string,
  requestId: string,
  success: boolean,
  processingTime?: number
): void {
  const timestamp = new Date().toISOString();
  const status = success ? 'SUCCESS' : 'ERROR';
  const time = processingTime ? ` (${processingTime}ms)` : '';

  console.log(`[WREI API] ${timestamp} ${method} ${endpoint}?action=${action} ${status} [${requestId}]${time}`);
}

/**
 * Log API error with details
 */
export function logApiError(
  endpoint: string,
  action: string,
  requestId: string,
  error: any,
  additionalContext?: any
): void {
  const timestamp = new Date().toISOString();
  console.error(`[WREI API Error] ${timestamp} ${endpoint}?action=${action} [${requestId}]`, error);

  if (additionalContext) {
    console.error(`[WREI API Error Context] [${requestId}]`, additionalContext);
  }
}