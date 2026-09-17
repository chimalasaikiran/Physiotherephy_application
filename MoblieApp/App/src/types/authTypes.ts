export const AUTH_SESSION_STORAGE_KEY = '@auth_session_key';

export const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000; // 10 days in milliseconds

export interface StoredAuthSession {
  loginTimestamp: number;
  uid: string;
  phone?: string;
  profileCompleted?: boolean;
}

export type AuthRoute = '/login' | '/explore' | '/complete-profile';

/**
 * Checks if a given session login timestamp is within the valid threshold (10 days).
 */
export function isSessionValid(loginTimestamp: number | null | undefined): boolean {
  if (!loginTimestamp) {
    return false;
  }
  return Date.now() - loginTimestamp < TEN_DAYS_IN_MS;
}
