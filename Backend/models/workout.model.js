import { Schema, model } from "mongoose";

const workoutSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        required: true
    },
    duration: {
        type: String,
        required: true
    },
    intensity: {
        type: String,
        enum: ['Low', 'Medium', 'High'],
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String
    },
    cyclePhase: {
        type: String
    }
}, { timestamps: true });

const Workout = model('Workout', workoutSchema);
export default Workout;
