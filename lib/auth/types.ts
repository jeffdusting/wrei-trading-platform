/**
 * Authentication types for the WREI Trading Platform.
 */

export type UserRole = 'admin' | 'broker' | 'trader' | 'compliance' | 'readonly';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organisationId: string | null;
  organisationName: string | null;
  isActive: boolean;
}

export interface AuthSession {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export type AuthMethod = 'session' | 'api_key';

export interface AuthResult {
  authenticated: boolean;
  user: AuthUser | null;
  method: AuthMethod | null;
  error?: string;
}

export interface AuthOptions {
  roles?: UserRole[];
  optional?: boolean;
}
