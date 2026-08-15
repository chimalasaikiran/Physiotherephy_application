import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { TherapistService } from '../services/therapistService.js';

export class TherapistController {
  /**
   * GET /api/v1/therapists
   * Get all therapists. Public endpoint for Admin Panel listing.
   */
  static async getAllTherapists(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const therapists = await TherapistService.getAllTherapists();
      res.status(200).json({
        success: true,
        count: therapists.length,
        data: therapists,
      });
    } catch (error: any) {
      console.error('TherapistController.getAllTherapists Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch therapists.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/therapists/:id
   * Get a single therapist by Firestore document ID.
   */
  static async getTherapistById(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const therapist = await TherapistService.getTherapistById(id);

      if (!therapist) {
        res.status(404).json({ success: false, error: `Therapist with ID '${id}' not found.` });
        return;
      }

      res.status(200).json({ success: true, data: therapist });
    } catch (error: any) {
      console.error('TherapistController.getTherapistById Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch therapist record.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/therapists
   * Create a new therapist. Requires admin auth.
   */
  static async createTherapist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const data = req.body || {};

      if (!data.name) {
        res.status(400).json({ success: false, error: 'Therapist name is required.' });
        return;
      }
      if (!data.email) {
        res.status(400).json({ success: false, error: 'Therapist email is required.' });
        return;
      }

      const docId = await TherapistService.createTherapist({
        name: data.name,
        degree: data.degree || '',
        experience: data.experience || '',
        email: data.email,
        phone: data.phone || '',
        specializations: Array.isArray(data.specializations) ? data.specializations : [],
        availability: data.availability || 'Available Today',
        status: data.status || 'ACTIVE',
        patientsCount: 0,
        rating: 5.0,
        location: data.location || '',
        bio: data.bio || '',
        workingHours: data.workingHours || '',
        avatarUrl: data.avatarUrl || '',
        initials: data.initials || '',
        assignedPatientIds: [],
      });

      res.status(201).json({
        success: true,
        message: 'Therapist created successfully.',
        data: { id: docId },
      });
    } catch (error: any) {
      console.error('TherapistController.createTherapist Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create therapist.',
        message: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/therapists/:id
   * Update an existing therapist. Requires auth.
   */
  static async updateTherapist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const updateData = req.body || {};

      const updated = await TherapistService.updateTherapist(id, updateData);

      if (!updated) {
        res.status(404).json({ success: false, error: `Therapist with ID '${id}' not found.` });
        return;
      }

      res.status(200).json({
        success: true,
        message: 'Therapist updated successfully.',
        data: updated,
      });
    } catch (error: any) {
      console.error('TherapistController.updateTherapist Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update therapist.',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/therapists/:id
   * Delete a therapist. Requires admin auth.
   */
  static async deleteTherapist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const id = String(req.params.id);
      const deleted = await TherapistService.deleteTherapist(id);

      if (!deleted) {
        res.status(500).json({ success: false, error: 'Failed to delete therapist.' });
        return;
      }

      res.status(200).json({ success: true, message: 'Therapist deleted successfully.' });
    } catch (error: any) {
      console.error('TherapistController.deleteTherapist Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete therapist.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/therapists/:id/assign
   * Assign a patient to this therapist. Body: { patientId: string }
   */
  static async assignPatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const therapistId = String(req.params.id);
      const { patientId } = req.body || {};

      if (!patientId) {
        res.status(400).json({ success: false, error: 'patientId is required.' });
        return;
      }

      await TherapistService.assignPatient(therapistId, patientId);

      res.status(200).json({
        success: true,
        message: `Patient '${patientId}' assigned to therapist '${therapistId}'.`,
      });
    } catch (error: any) {
      console.error('TherapistController.assignPatient Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign patient.',
        message: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/therapists/:id/assign/:patientId
   * Unassign a patient from this therapist.
   */
  static async unassignPatient(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const therapistId = String(req.params.id);
      const patientId = String(req.params.patientId);

      await TherapistService.unassignPatient(therapistId, patientId);

      res.status(200).json({
        success: true,
        message: `Patient '${patientId}' unassigned from therapist '${therapistId}'.`,
      });
    } catch (error: any) {
      console.error('TherapistController.unassignPatient Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to unassign patient.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/therapists/seed
   * Seed demo therapist data if collection is empty. Admin only.
   */
  static async seedTherapists(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const result = await TherapistService.seedDemoTherapists();
      res.status(200).json({
        success: true,
        ...result,
        message: result.skipped
          ? 'Therapists collection already has data — seed skipped.'
          : `Seeded ${result.seeded} demo therapists successfully.`,
      });
    } catch (error: any) {
      console.error('TherapistController.seedTherapists Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to seed therapists.',
        message: error.message,
      });
    }
  }
}
