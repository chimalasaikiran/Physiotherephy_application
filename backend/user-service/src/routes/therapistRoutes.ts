import { Router } from 'express';
import { TherapistController } from '../controllers/therapistController.js';
import { authenticateFirebaseToken, requireAdminRole } from '../middleware/authMiddleware.js';

const router = Router();

// ─── Authenticated Listing Endpoints ──────────────────────────────────────────

/**
 * GET /api/v1/therapists
 * List all therapists. Requires valid Firebase token (mobile + admin).
 */
router.get('/', authenticateFirebaseToken, TherapistController.getAllTherapists);

/**
 * GET /api/v1/therapists/:id
 * Get single therapist by Firestore doc ID. Requires valid Firebase token.
 */
router.get('/:id', authenticateFirebaseToken, TherapistController.getTherapistById);

// ─── Admin-Authenticated Endpoints ────────────────────────────────────────────

/**
 * POST /api/v1/therapists
 * Create a new therapist. Admin auth required.
 */
router.post('/', authenticateFirebaseToken, requireAdminRole, TherapistController.createTherapist);

/**
 * PUT /api/v1/therapists/:id
 * Update therapist record. Admin auth required.
 */
router.put('/:id', authenticateFirebaseToken, requireAdminRole, TherapistController.updateTherapist);

/**
 * DELETE /api/v1/therapists/:id
 * Delete a therapist. Admin auth required.
 */
router.delete('/:id', authenticateFirebaseToken, requireAdminRole, TherapistController.deleteTherapist);

/**
 * POST /api/v1/therapists/:id/assign
 * Assign a patient to this therapist. Admin only.
 */
router.post('/:id/assign', authenticateFirebaseToken, requireAdminRole, TherapistController.assignPatient);

/**
 * DELETE /api/v1/therapists/:id/assign/:patientId
 * Remove patient assignment from therapist. Admin only.
 */
router.delete('/:id/assign/:patientId', authenticateFirebaseToken, requireAdminRole, TherapistController.unassignPatient);

/**
 * POST /api/v1/therapists/seed
 * Seed demo data into empty therapists collection. Admin only.
 */
router.post('/seed', authenticateFirebaseToken, requireAdminRole, TherapistController.seedTherapists);

export default router;
