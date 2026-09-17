import {
  AUTH_SESSION_STORAGE_KEY,
  TEN_DAYS_IN_MS,
  StoredAuthSession,
  AuthRoute,
  isSessionValid,
} from '../types/authTypes';

export {
  AUTH_SESSION_STORAGE_KEY,
  TEN_DAYS_IN_MS,
  StoredAuthSession,
  AuthRoute,
  isSessionValid,
};

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
