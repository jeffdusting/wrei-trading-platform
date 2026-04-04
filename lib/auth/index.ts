/**
 * Auth module barrel export.
 */

export type {
  AuthUser,
  AuthSession,
  UserRole,
  AuthResult,
  AuthMethod,
  AuthOptions,
} from './types';

export { hashPassword, verifyPassword } from './password';
export { createSession, validateSession, deleteSession } from './session';
export { generateApiKey, validateApiKey } from './api-key';
export { withAuth, getAuthUser } from './middleware';
