import { Schema, model } from "mongoose";

const globalWorkoutSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    duration: {
        type: String, // e.g. "30 min"
        required: true
    },
    intensity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    phases: [{
        type: String, // e.g. ['Menstrual', 'Follicular']
    }],
    category: {
        type: String, // e.g. 'Yoga', 'Strength', 'Cardio'
        required: true
    },
    thumbnail: {
        type: String // Optional image URL
    }
}, { timestamps: true });

const GlobalWorkout = model('GlobalWorkout', globalWorkoutSchema);
export default GlobalWorkout;
