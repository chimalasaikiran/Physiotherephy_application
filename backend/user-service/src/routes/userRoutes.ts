import { Router } from 'express';
import { UserController } from '../controllers/userController.js';
import { authenticateFirebaseToken } from '../middleware/authMiddleware.js';

const router = Router();

// Public Health Check Endpoint
router.get('/health', UserController.getHealth);

// Public / Admin Patient & User Listing Endpoint
router.get('/users', UserController.getAllUsers);
router.get('/patients', UserController.getAllUsers);

// Authenticated Routes
router.post('/users/sync', authenticateFirebaseToken, UserController.syncUser);
router.get('/users/me', authenticateFirebaseToken, UserController.getMyProfile);
router.put('/users/me/profile', authenticateFirebaseToken, UserController.updateMyProfile);
router.get('/users/:uid', authenticateFirebaseToken, UserController.getUserById);

export default router;

