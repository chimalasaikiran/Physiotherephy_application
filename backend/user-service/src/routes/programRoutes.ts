import { Router } from 'express';
import { Request, Response } from 'express';
import { ProgramService } from '../services/programService.js';
import {
  authenticateFirebaseToken,
  requireAdminRole,
  AuthenticatedRequest,
} from '../middleware/authMiddleware.js';

const router = Router();

// GET /api/v1/programs — Authenticated (mobile + admin)
router.get('/', authenticateFirebaseToken, async (_req: AuthenticatedRequest, res: Response) => {
  try {
    const programs = await ProgramService.getAllPrograms();
    res.json({ success: true, count: programs.length, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/programs/:id — Authenticated (mobile + admin)
router.get('/:id', authenticateFirebaseToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const program = await ProgramService.getProgramById(id);
    if (!program) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    res.json({ success: true, data: program });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/programs — Admin only
router.post('/', authenticateFirebaseToken, requireAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const programId = await ProgramService.createProgram(req.body);
    const created = await ProgramService.getProgramById(programId);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/programs/:id — Admin only
router.put('/:id', authenticateFirebaseToken, requireAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const updated = await ProgramService.updateProgram(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Program not found' });
    }
    res.json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/v1/programs/:id — Admin only
router.delete('/:id', authenticateFirebaseToken, requireAdminRole, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const success = await ProgramService.deleteProgram(id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
