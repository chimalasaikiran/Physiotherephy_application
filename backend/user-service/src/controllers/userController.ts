import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { UserService } from '../services/userService.js';

export class UserController {
  /**
   * Health Check Handler
   */
  static async getHealth(_req: AuthenticatedRequest, res: Response): Promise<void> {
    res.status(200).json({
      status: 'UP',
      service: 'user-service',
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Sync User Profile after Firebase OTP Verification
   * POST /api/v1/users/sync
   */
  static async syncUser(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;
      const phone = req.user?.phone || req.body?.phone || '';

      if (!uid) {
        res.status(400).json({
          success: false,
          error: 'Missing user ID in request context.',
        });
        return;
      }

      const userProfile = await UserService.syncUserOnLogin(uid, phone);

      res.status(200).json({
        success: true,
        message: 'User session synchronized successfully.',
        data: userProfile,
      });
    } catch (error: any) {
      console.error('UserController.syncUser Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to synchronize user session.',
        message: error.message,
      });
    }
  }

  /**
   * Get Current Authenticated User Profile
   * GET /api/v1/users/me
   */
  static async getMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: 'Missing user ID in request context.',
        });
        return;
      }

      let profile = await UserService.getUserProfile(uid);

      if (!profile) {
        // Fallback sync if profile does not exist yet
        profile = await UserService.syncUserOnLogin(uid, req.user?.phone || '');
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('UserController.getMyProfile Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve user profile.',
        message: error.message,
      });
    }
  }

  /**
   * Update Current Authenticated User Profile
   * PUT /api/v1/users/me/profile
   */
  static async updateMyProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const uid = req.user?.uid;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: 'Missing user ID in request context.',
        });
        return;
      }

      const updateData = req.body || {};
      const updatedProfile = await UserService.updateUserProfile(uid, updateData);

      res.status(200).json({
        success: true,
        message: 'User profile updated successfully.',
        data: updatedProfile,
      });
    } catch (error: any) {
      console.error('UserController.updateMyProfile Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update user profile.',
        message: error.message,
      });
    }
  }

  /**
   * Get User Profile By UID (Internal / Admin microservice route)
   * GET /api/v1/users/:uid
   */
  static async getUserById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const rawUid = req.params.uid;
      const uid = Array.isArray(rawUid) ? rawUid[0] : rawUid;

      if (!uid) {
        res.status(400).json({
          success: false,
          error: 'User ID param is required.',
        });
        return;
      }

      const profile = await UserService.getUserProfile(uid);

      if (!profile) {
        res.status(404).json({
          success: false,
          error: 'User not found.',
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error: any) {
      console.error('UserController.getUserById Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user.',
        message: error.message,
      });
    }
  }

  /**
   * Get All Users and Patient Records (Admin / Service Endpoint)
   * GET /api/v1/users or GET /api/v1/patients
   */
  static async getAllUsers(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const usersList = await UserService.getAllUsersAndPatients();
      res.status(200).json({
        success: true,
        count: usersList.length,
        data: usersList,
      });
    } catch (error: any) {
      console.error('UserController.getAllUsers Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch all users and patients.',
        message: error.message,
      });
    }
  }
}

