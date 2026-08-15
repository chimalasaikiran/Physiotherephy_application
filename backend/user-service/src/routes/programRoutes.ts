import { Router, Request, Response } from 'express';
import { ProgramService } from '../services/programService.js';

const router = Router();

// GET /api/v1/programs
router.get('/', async (_req: Request, res: Response) => {
  try {
    const programs = await ProgramService.getAllPrograms();
    res.json({ success: true, count: programs.length, data: programs });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/programs/:id
router.get('/:id', async (req: Request, res: Response) => {
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

// POST /api/v1/programs
router.post('/', async (req: Request, res: Response) => {
  try {
    const programId = await ProgramService.createProgram(req.body);
    const created = await ProgramService.getProgramById(programId);
    res.status(201).json({ success: true, data: created });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/v1/programs/:id
router.put('/:id', async (req: Request, res: Response) => {
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

// DELETE /api/v1/programs/:id
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const id = Array.isArray(req.params.id) ? req.params.id[0] : String(req.params.id);
    const success = await ProgramService.deleteProgram(id);
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
