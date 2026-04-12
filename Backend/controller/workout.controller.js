import Workout from "../models/workout.model.js";

export async function logWorkout(req, res) {
    try {
        const { type, duration, intensity, notes, cyclePhase } = req.body;
        const newWorkout = new Workout({
            userId: req.user.id,
            type,
            duration,
            intensity,
            notes,
            cyclePhase
        });

        await newWorkout.save();
        res.status(201).json({ message: "Workout logged successfully", workout: newWorkout });
    } catch (error) {
        console.error("Error logging workout:", error);
        res.status(500).json({ message: "Error logging workout", error: error.message });
    }
}

export async function getWorkouts(req, res) {
    try {
        const workouts = await Workout.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json(workouts);
    } catch (error) {
        console.error("Error fetching workouts:", error);
        res.status(500).json({ message: "Error fetching workouts", error: error.message });
    }
}
