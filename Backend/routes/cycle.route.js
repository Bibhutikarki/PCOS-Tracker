import express from 'express';
import { getCycles, addCycle, updateCycle, deleteCycle } from '../controller/cycle.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Protect all cycle routes

router.get('/', getCycles);
router.post('/', addCycle);
router.put('/:id', updateCycle);
router.delete('/:id', deleteCycle);

export default router;
