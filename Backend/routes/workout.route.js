import express from 'express';
import { logWorkout, getWorkouts } from '../controller/workout.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/log', protect, logWorkout);
router.get('/history', protect, getWorkouts);

export default router;
