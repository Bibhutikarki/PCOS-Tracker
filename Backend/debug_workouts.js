import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GlobalWorkout from './models/globalWorkout.model.js';

dotenv.config();

const checkDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcos_tracker');
        console.log('Connected to MongoDB');
        
        const count = await GlobalWorkout.countDocuments();
        console.log('Total Global Workouts:', count);
        
        const workouts = await GlobalWorkout.find();
        console.log('Workouts:', JSON.stringify(workouts, null, 2));
        
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

checkDB();
