import { Router } from 'express';
import { AppointmentController } from '../controllers/appointmentController.js';

const router = Router();

// Services routes
router.get('/services', AppointmentController.getServices);

// Therapists routes
router.get('/therapists', AppointmentController.getTherapists);
router.get('/therapists/:id', AppointmentController.getTherapistById);

// Slots route
router.get('/slots', AppointmentController.getSlots);

// Booking routes
router.post('/book', AppointmentController.createBooking);
router.get('/user/:userId', AppointmentController.getUserAppointments);
router.post('/:id/cancel', AppointmentController.cancelBooking);
router.post('/:id/reschedule', AppointmentController.rescheduleBooking);

export default router;

