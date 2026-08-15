import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRoutes from './routes/userRoutes.js';
import patientRoutes from './routes/patientRoutes.js';
import therapistRoutes from './routes/therapistRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import programRoutes from './routes/programRoutes.js';

const app = express();

// Security and middleware setup
app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/v1/users', userRoutes);
app.use('/api/v1', userRoutes);

// Patients Service Routes
// GET/POST/PUT/DELETE /api/v1/patients and sub-routes
app.use('/api/v1/patients', patientRoutes);

// Therapists Service Routes
// GET/POST/PUT/DELETE /api/v1/therapists and sub-routes
app.use('/api/v1/therapists', therapistRoutes);

// Appointments & Schedules Routes
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/schedules', appointmentRoutes);

// Programs Service Routes
app.use('/api/v1/programs', programRoutes);


// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
  });
});

// Centralized Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

export default app;
