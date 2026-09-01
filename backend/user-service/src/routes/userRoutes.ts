import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import {
  authenticateFirebaseToken,
  requireAdminRole,
} from '../middleware/authMiddleware.js';

const router = Router();

// Public Health Check Endpoint
router.get('/health', UserController.getHealth);

// Admin-Only Patient & User Listing Endpoint
router.get('/users', authenticateFirebaseToken, requireAdminRole, UserController.getAllUsers);
router.get('/patients', authenticateFirebaseToken, requireAdminRole, UserController.getAllUsers);

// Authenticated Routes
router.post('/users/sync', authenticateFirebaseToken, UserController.syncUser);
router.get('/users/me', authenticateFirebaseToken, UserController.getMyProfile);
router.put('/users/me/profile', authenticateFirebaseToken, UserController.updateMyProfile);
router.get('/users/:uid', authenticateFirebaseToken, UserController.getUserById);

export default router;
