import { Request, Response } from 'express';
import { AppointmentService } from '../services/appointmentService.js';

export class AppointmentController {
  /**
   * GET /api/v1/appointments/services
   * Fetch available services
   */
  static async getServices(_req: Request, res: Response): Promise<void> {
    try {
      const services = await AppointmentService.getServices();
      res.status(200).json({
        success: true,
        data: services,
      });
    } catch (error: any) {
      console.error('AppointmentController.getServices Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch services.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/appointments/therapists
   * Fetch available physiotherapists
   */
  static async getTherapists(req: Request, res: Response): Promise<void> {
    try {
      const serviceId = req.query.serviceId as string | undefined;
      const therapists = await AppointmentService.getTherapists(serviceId);
      res.status(200).json({
        success: true,
        data: therapists,
      });
    } catch (error: any) {
      console.error('AppointmentController.getTherapists Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch therapists.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/appointments/therapists/:id
   * Fetch single therapist details
   */
  static async getTherapistById(req: Request, res: Response): Promise<void> {
    try {
      const rawId = req.params.id;
      const id = Array.isArray(rawId) ? rawId[0]! : String(rawId);
      const therapist = await AppointmentService.getTherapistById(id);
      if (!therapist) {
        res.status(404).json({
          success: false,
          error: 'Therapist not found.',
        });
        return;
      }
      res.status(200).json({
        success: true,
        data: therapist,
      });
    } catch (error: any) {
      console.error('AppointmentController.getTherapistById Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch therapist details.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/appointments/slots
   * Fetch available and booked slots for a doctor & date
   */
  static async getSlots(req: Request, res: Response): Promise<void> {
    try {
      const doctorId = (req.query.doctorId as string) || 'doc_1';
      const fullDate = (req.query.fullDate as string) || 'Oct 24, 2026';

      const slotsInfo = await AppointmentService.getAvailableSlots(doctorId, fullDate);
      res.status(200).json({
        success: true,
        data: slotsInfo,
      });
    } catch (error: any) {
      console.error('AppointmentController.getSlots Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch available slots.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/appointments/book
   * Validate time slot and create appointment atomically
   */
  static async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const body = req.body;
      if (!body.doctorId || !body.fullDate || !body.timeSlot || !body.serviceTitle) {
        res.status(400).json({
          success: false,
          error: 'Missing required appointment parameters (doctorId, fullDate, timeSlot, serviceTitle).',
        });
        return;
      }

      const result = await AppointmentService.createAppointmentWithValidation({
        id: body.id,
        userId: body.userId || 'user_demo_123',
        userName: body.userName || 'Patient',
        userPhone: body.userPhone || '',
        doctorId: body.doctorId,
        doctorName: body.doctorName || 'Dr. Ananya Iyer',
        doctorSpecialty: body.doctorSpecialty || 'Senior Physiotherapist',
        doctorAvatar: body.doctorAvatar,
        avatarImageName: body.avatarImageName || 'doctor_ananya',
        clinicName: body.clinicName || 'Spine & Wellness Center',
        clinicAddress: body.clinicAddress || 'Indiranagar, Bengaluru',
        serviceTitle: body.serviceTitle,
        placeId: body.placeId || 'clinic',
        placeTitle: body.placeTitle || body.clinicName || 'Clinic Visit',
        fullDate: body.fullDate,
        dateId: body.dateId || 'd1',
        timeSlot: body.timeSlot,
        feeStr: body.feeStr || '₹800',
        numericFee: Number(body.numericFee) || 800,
        paymentMode: body.paymentMode === 'clinic' ? 'clinic' : 'online',
        paymentMethodName: body.paymentMethodName || 'Online Payment',
      });

      res.status(201).json({
        success: true,
        message: 'Appointment booked successfully.',
        data: result,
      });
    } catch (error: any) {
      console.error('AppointmentController.createBooking Error:', error);
      if (error?.code === 'SLOT_ALREADY_BOOKED' || error?.message === 'SLOT_ALREADY_BOOKED') {
        res.status(409).json({
          success: false,
          error: 'SLOT_ALREADY_BOOKED',
          message: 'The selected time slot is no longer available. Please select another slot.',
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Failed to create appointment.',
        message: error.message,
      });
    }
  }

  /**
   * GET /api/v1/appointments/user/:userId
   * Fetch appointments for a user
   */
  static async getUserAppointments(req: Request, res: Response): Promise<void> {
    try {
      const rawUserId = req.params.userId;
      const userId = Array.isArray(rawUserId) ? rawUserId[0]! : String(rawUserId);
      const appointments = await AppointmentService.getUserAppointments(userId);
      res.status(200).json({
        success: true,
        data: appointments,
      });
    } catch (error: any) {
      console.error('AppointmentController.getUserAppointments Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user appointments.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/appointments/:id/cancel
   * Cancel appointment
   */
  static async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const rawApptId = req.params.id;
      const appointmentId = Array.isArray(rawApptId) ? rawApptId[0]! : String(rawApptId);
      const { doctorId, fullDate, timeSlot } = req.body;

      if (!doctorId || !fullDate || !timeSlot) {
        res.status(400).json({
          success: false,
          error: 'Missing doctorId, fullDate, or timeSlot to cancel booking.',
        });
        return;
      }

      await AppointmentService.cancelAppointment(appointmentId, doctorId, fullDate, timeSlot);

      res.status(200).json({
        success: true,
        message: 'Appointment cancelled successfully.',
      });
    } catch (error: any) {
      console.error('AppointmentController.cancelBooking Error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to cancel appointment.',
        message: error.message,
      });
    }
  }

  /**
   * POST /api/v1/appointments/:id/reschedule
   * Reschedule appointment
   */
  static async rescheduleBooking(req: Request, res: Response): Promise<void> {
    try {
      const rawApptId = req.params.id;
      const appointmentId = Array.isArray(rawApptId) ? rawApptId[0]! : String(rawApptId);
      const { doctorId, oldDate, oldTimeSlot, newDate, newTimeSlot, newDateId } = req.body;

      if (!doctorId || !oldDate || !oldTimeSlot || !newDate || !newTimeSlot) {
        res.status(400).json({
          success: false,
          error: 'Missing required parameters for rescheduling (doctorId, oldDate, oldTimeSlot, newDate, newTimeSlot).',
        });
        return;
      }

      await AppointmentService.rescheduleAppointment(
        appointmentId,
        doctorId,
        oldDate,
        oldTimeSlot,
        newDate,
        newTimeSlot,
        newDateId
      );

      res.status(200).json({
        success: true,
        message: 'Appointment rescheduled successfully.',
      });
    } catch (error: any) {
      console.error('AppointmentController.rescheduleBooking Error:', error);
      if (error?.code === 'SLOT_ALREADY_BOOKED' || error?.message === 'SLOT_ALREADY_BOOKED') {
        res.status(409).json({
          success: false,
          error: 'SLOT_ALREADY_BOOKED',
          message: 'The requested time slot is no longer available.',
        });
        return;
      }
      res.status(500).json({
        success: false,
        error: 'Failed to reschedule appointment.',
        message: error.message,
      });
    }
  }
}

