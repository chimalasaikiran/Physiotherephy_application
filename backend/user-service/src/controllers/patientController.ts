import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { PatientService } from '../services/patientService.js';

export class PatientController {
  /**
   * GET /api/v1/patients
   * Get all patients (merged patient details + users collections).
   * Public endpoint — no auth required for Admin Panel listing.
   */
  static async getAllPatients(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patients = await PatientService.getAllPatients();
      res.status(200).json({
        success: true,
        count: patients.length,
        data: patients,
      });
    } catch (error: any) {
      console.error('PatientController.getAllPatients Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch all patients.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/patients/:id
   * Get a single patient by Firestore document ID.
   * Requires valid Firebase token.
   */
  static async getPatientById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);

      const patient = await PatientService.getPatientById(id);

      if (!patient) {
        res.status(404).json({ success: false, error: `Patient with ID '${id}' not found.` });
        return;
      }

      res.status(200).json({ success: true, data: patient });
    } catch (error: any) {
      console.error('PatientController.getPatientById Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch patient record.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/patients
   * Create or upsert a patient record.
   * Called from mobile after profile completion, and from Admin Panel "Add Patient" form.
   * Requires valid Firebase token.
   */
  static async createPatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const patientData = req.body || {};

      // If no explicit id is provided, use the authenticated user's uid
      if (!patientData.id && req.user?.uid) {
        patientData.id = req.user.uid;
      }

      if (!patientData.name && !patientData.fullName) {
        res.status(400).json({ success: false, error: 'Patient name is required.' });
        return;
      }

      const docId = await PatientService.createOrUpsertPatient(patientData);

      res.status(201).json({
        success: true,
        message: 'Patient record created successfully.',
        data: { id: docId },
      });
    } catch (error: any) {
      console.error('PatientController.createPatient Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create patient record.',
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/patients/:id
   * Update an existing patient record.
   * Requires valid Firebase token.
   */
  static async updatePatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updateData = req.body || {};

      if (!id) {
        res.status(400).json({ success: false, error: 'Patient ID is required.' });
        return;
      }

      const updated = await PatientService.updatePatient(id, updateData);

      if (!updated) {
        res.status(404).json({ success: false, error: `Patient with ID '${id}' not found.` });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Patient record updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error('PatientController.updatePatient Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update patient record.',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/patients/:id
   * Delete a patient record.
   * Requires valid Firebase token + admin role.
   */
  static async deletePatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await PatientService.deletePatient(id);


      if (!deleted) {
        res.status(500).json({ success: false, error: 'Failed to delete patient record.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Patient record deleted successfully.' });
    } catch (error: any) {
      console.error('PatientController.deletePatient Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete patient record.',
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/patients/:id/medical
   * Update only the medical history fields of a patient record.
   * Requires valid Firebase token.
   */
  static async updateMedicalInfo(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const medicalData = req.body || {};

      if (!id) {
        res.status(400).json({ success: false, error: 'Patient ID is required.' });
        return;
      }

      await PatientService.updateMedicalInfo(id, medicalData);

      res.status(200).json({
        success: true,
        message: 'Medical information updated successfully.',
      });
    } catch (error: any) {
      console.error('PatientController.updateMedicalInfo Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update medical information.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/patients/:id/notes
   * Append a clinical note to a patient's record.
   * Requires valid Firebase token.
   */
  static async addClinicalNote(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const { text, doctorName, category } = req.body || {};

      if (!id) {
        res.status(400).json({ success: false, error: 'Patient ID is required.' });
        return;
      }

      if (!text) {
        res.status(400).json({ success: false, error: 'Note text is required.' });
        return;
      }

      await PatientService.addClinicalNote(id, {
        text,
        doctorName: doctorName || req.user?.name || 'Admin',
        category: category || 'clinical',
      });

      res.status(201).json({
        success: true,
        message: 'Clinical note added successfully.',
      });
    } catch (error: any) {
      console.error('PatientController.addClinicalNote Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to add clinical note.',
        message: error.message,
      });
    }
  }
}
