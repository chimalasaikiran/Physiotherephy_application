import { Router } from 'express';
import { PatientController } from '../controllers/patientController.js';
import { authenticateFirebaseToken, requireAdminRole } from '../middleware/authMiddleware.js';

const router = Router();

// ─── Public / No-Auth Endpoints ───────────────────────────────────────────────

/**
 * GET /api/v1/patients
 * List all patients (merged from patient details + users collections).
 * Public — used by Admin Panel real-time fallback and initial load.
 */
router.get('/', PatientController.getAllPatients);

// ─── Authenticated Endpoints ──────────────────────────────────────────────────

/**
 * GET /api/v1/patients/:id
 * Get single patient by Firestore doc ID.
 */
router.get('/:id', authenticateFirebaseToken, PatientController.getPatientById);

/**
 * POST /api/v1/patients
 * Create or upsert a patient record.
 * Called from mobile after profile completion (uid used as doc ID).
 * Also called from Admin Panel "Add Patient" form (admin must be authenticated).
 */
router.post('/', authenticateFirebaseToken, PatientController.createPatient);

/**
 * PUT /api/v1/patients/:id
 * Full or partial update of a patient record.
 */
router.put('/:id', authenticateFirebaseToken, PatientController.updatePatient);

/**
 * DELETE /api/v1/patients/:id
 * Delete a patient record. Requires admin role.
 */
router.delete('/:id', authenticateFirebaseToken, requireAdminRole, PatientController.deletePatient);

/**
 * PUT /api/v1/patients/:id/medical
 * Update only the medicalHistory field of a patient.
 * Called from mobile MedicalInfoScreen on save.
 */
router.put('/:id/medical', authenticateFirebaseToken, PatientController.updateMedicalInfo);

/**
 * POST /api/v1/patients/:id/notes
 * Append a clinical note. Admin / therapist only.
 */
router.post('/:id/notes', authenticateFirebaseToken, PatientController.addClinicalNote);

export default router;
