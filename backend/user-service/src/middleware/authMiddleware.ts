import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebase.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    uid: string;
    phone?: string;
    email?: string;
    name?: string;
    admin?: boolean;
    role?: string;
  };
}

/**
 * Express Middleware to verify Firebase Auth ID Tokens in Request Headers
 * Authorization: Bearer <Firebase_ID_Token>
 */
export const authenticateFirebaseToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Missing or invalid Authorization header. Expected Bearer token.',
    });
    return;
  }

  const idToken = authHeader.split('Bearer ')[1]?.trim();

  if (!idToken) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Bearer token is empty.',
    });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    req.user = {
      uid: decodedToken.uid,
      phone: decodedToken.phone_number,
      email: decodedToken.email,
      name: decodedToken.name,
      admin: decodedToken.admin as boolean | undefined,
      role: decodedToken.role as string | undefined,
    };
    next();
  } catch (error: any) {
    console.error('Error verifying Firebase ID Token in user-service:', error.message || error);

    res.status(401).json({
      success: false,
      error: 'Unauthorized: Invalid or expired authentication token.',
      code: error.code || 'auth/invalid-token',
    });
  }
};

/**
 * Middleware to require Admin privileges (role === 'admin' || role === 'superadmin' || custom claim admin === true)
 */
export const requireAdminRole = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      error: 'Unauthorized: Authentication required.',
    });
    return;
  }

  const isSuperOrAdmin =
    req.user.admin === true ||
    req.user.role === 'superadmin' ||
    req.user.role === 'admin';

  if (!isSuperOrAdmin) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: Insufficient privileges. Admin role required.',
    });
    return;
  }

  next();
};

/**
 * Middleware to verify a patient can only access their own record (or is an admin).
 * Must be used after authenticateFirebaseToken.
 * Checks req.params.id against req.user.uid.
 */
export const requireOwnerOrAdmin = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized: Authentication required.' });
    return;
  }

  const resourceId = req.params.id;
  const isOwner = req.user.uid === resourceId;
  const isAdmin =
    req.user.admin === true ||
    req.user.role === 'superadmin' ||
    req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    res.status(403).json({
      success: false,
      error: 'Forbidden: You do not have permission to access this resource.',
    });
    return;
  }

  next();
};
