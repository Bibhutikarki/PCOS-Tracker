import { Schema, model } from "mongoose";

const userSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    workoutReminderTime: {
        type: String, // format "HH:MM"
        default: null
    },
    workoutReminderEnabled: {
        type: Boolean,
        default: false
    },
    weight: {
        type: Number, // in kg
        default: null
    },
    height: {
        type: Number, // in cm
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const User = model('User', userSchema);
export default User;



