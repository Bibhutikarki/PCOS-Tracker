import express from "express";
import { 
    getDashboardStats, 
    getAllUsers, 
    createGlobalWorkout, 
    getGlobalWorkouts, 
    updateGlobalWorkout, 
    deleteGlobalWorkout,
    getUserFullProfile
} from "../controller/admin.controller.js";
import { protect, admin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Stats & Users
router.get("/stats", protect, admin, getDashboardStats);
router.get("/users", protect, admin, getAllUsers);
router.get("/patient/:id", protect, admin, getUserFullProfile);

// Workout Library
router.get("/workouts", protect, getGlobalWorkouts); // Public for logged in users
router.post("/workouts", protect, admin, createGlobalWorkout);
router.put("/workouts/:id", protect, admin, updateGlobalWorkout);
router.delete("/workouts/:id", protect, admin, deleteGlobalWorkout);

export default router;
