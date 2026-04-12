import express from 'express';
import { addSymptom, getSymptoms, deleteSymptom } from '../controller/symptom.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // Protect all symptom routes

router.get('/', getSymptoms);
router.post('/', addSymptom);
router.delete('/:id', deleteSymptom);

export default router;
