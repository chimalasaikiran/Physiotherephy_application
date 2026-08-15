import { User } from 'firebase/auth';
import { UserProfileData } from '../config/firebase';


/**
 * Key used for saving auth session metadata in AsyncStorage
 */
export const AUTH_SESSION_STORAGE_KEY = '@physio_auth_session';

/**
 * Session validity constant: 10 days in milliseconds
 */
export const TEN_DAYS_IN_MS = 10 * 24 * 60 * 60 * 1000;

export interface StoredAuthSession {
  loginTimestamp: number;
  uid: string;
  phone?: string;
  profileCompleted: boolean;
}

export type AuthRoute = '/explore' | '/complete-profile' | '/login';

/**
 * Checks whether a given login timestamp is still within the 10-day validity window.
 */
export function isSessionValid(loginTimestamp: number | null | undefined): boolean {
  if (!loginTimestamp || typeof loginTimestamp !== 'number') {
    return false;
  }
  const elapsedTime = Date.now() - loginTimestamp;
  return elapsedTime >= 0 && elapsedTime < TEN_DAYS_IN_MS;
}

/**
 * Determines the target route based on authentication, session validity, and profile completion state.
 *
 * Rules:
 * - If user is not authenticated or 10-day session expired -> '/login'
 * - If user is authenticated & session valid & profile completed -> '/explore' (Home)
 * - If user is authenticated & session valid & profile incomplete -> '/complete-profile'
 */
export function getAuthNavigationRoute(params: {
  isAuthenticated: boolean;
  isProfileComplete: boolean;
  isSessionValid: boolean;
}): AuthRoute {
  const { isAuthenticated, isProfileComplete, isSessionValid: sessionValid } = params;

  if (!isAuthenticated || !sessionValid) {
    return '/login';
  }

  if (isProfileComplete) {
    return '/explore';
  }

  return '/complete-profile';
}
