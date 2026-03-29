import express from 'express';
import { addSymptom, getSymptoms, deleteSymptom } from '../controller/symptom.controller.js';
import { checkToken } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(checkToken); // Protect all symptom routes

router.get('/', getSymptoms);
router.post('/', addSymptom);
router.delete('/:id', deleteSymptom);

export default router;
