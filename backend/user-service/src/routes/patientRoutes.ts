import { Router } from 'express';
import { PatientController } from '../controllers/patientController.js';
import {
  authenticateFirebaseToken,
  requireAdminRole,
  requireOwnerOrAdmin,
} from '../middleware/authMiddleware.js';

const router = Router();

// ─── Admin-Only Listing Endpoint ─────────────────────────────────────────────

/**
 * GET /api/v1/patients
 * List all patients — Admin Panel only. Requires valid Firebase token + admin role.
 */
router.get('/', authenticateFirebaseToken, requireAdminRole, PatientController.getAllPatients);

// ─── Authenticated Endpoints ──────────────────────────────────────────────────

/**
 * GET /api/v1/patients/:id
 * Get single patient by UID. Only the patient themselves or an admin may access.
 */
router.get('/:id', authenticateFirebaseToken, requireOwnerOrAdmin, PatientController.getPatientById);

/**
 * POST /api/v1/patients
 * Create or upsert a patient record.
 * Called from mobile after profile completion (uid used as doc ID).
 * Also called from Admin Panel "Add Patient" form (admin must be authenticated).
 */
router.post('/', authenticateFirebaseToken, PatientController.createPatient);

/**
 * PUT /api/v1/patients/:id
 * Full or partial update of a patient record. Owner or admin only.
 */
router.put('/:id', authenticateFirebaseToken, requireOwnerOrAdmin, PatientController.updatePatient);

/**
 * DELETE /api/v1/patients/:id
 * Delete a patient record. Requires admin role.
 */
router.delete('/:id', authenticateFirebaseToken, requireAdminRole, PatientController.deletePatient);

/**
 * PUT /api/v1/patients/:id/medical
 * Update only the medicalHistory field of a patient. Owner or admin only.
 */
router.put('/:id/medical', authenticateFirebaseToken, requireOwnerOrAdmin, PatientController.updateMedicalInfo);

/**
 * POST /api/v1/patients/:id/notes
 * Append a clinical note. Admin / therapist only.
 */
router.post('/:id/notes', authenticateFirebaseToken, requireAdminRole, PatientController.addClinicalNote);

export default router;
