import User from "../models/user.model.js";
import Symptom from "../models/symptom.model.js";
import Cycle from "../models/cycle.model.js";
import GlobalWorkout from "../models/globalWorkout.model.js";
import Workout from "../models/workout.model.js";

export const getDashboardStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalSymptoms = await Symptom.countDocuments();
        const totalCycles = await Cycle.countDocuments();
        const totalWorkouts = await GlobalWorkout.countDocuments();

        // Get registration trend for last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const users = await User.find({ createdAt: { $gte: sevenDaysAgo } });
        
        const trend = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            const dateStr = date.toISOString().split('T')[0];
            const count = users.filter(u => u.createdAt.toISOString().startsWith(dateStr)).length;
            return { date: dateStr, users: count };
        });

        res.json({
            stats: {
                totalUsers,
                totalSymptoms,
                totalCycles,
                totalWorkouts
            },
            registrationTrend: trend
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select("-password").sort("-createdAt");
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Global Workout CRUD
export const createGlobalWorkout = async (req, res) => {
    try {
        const workout = new GlobalWorkout(req.body);
        await workout.save();
        res.status(201).json(workout);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const getGlobalWorkouts = async (req, res) => {
    try {
        const workouts = await GlobalWorkout.find().sort("-createdAt");
        res.json(workouts);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const updateGlobalWorkout = async (req, res) => {
    try {
        const workout = await GlobalWorkout.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(workout);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

export const deleteGlobalWorkout = async (req, res) => {
    try {
        await GlobalWorkout.findByIdAndDelete(req.params.id);
        res.json({ message: "Workout deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Patient Progress
export const getUserFullProfile = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId).select("-password");
        const symptoms = await Symptom.find({ userId }).sort("-date");
        const cycles = await Cycle.find({ userId }).sort("-startDate");
        const workouts = await Workout.find({ userId }).sort("-date");

        res.json({
            user,
            history: {
                symptoms,
                cycles,
                workouts
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
