import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GlobalWorkout from './models/globalWorkout.model.js';

dotenv.config();

const seedWorkouts = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/pcos_tracker');
        console.log('Connected to MongoDB');
        
        const protocols = [
            {
                title: 'Gentle Endocrine Yoga',
                description: 'Focuses on pituitary and thyroid stimulation through gentle inversions and twists.',
                duration: '30 min',
                intensity: 'Low',
                phases: ['Menstrual', 'Luteal'],
                category: 'Yoga'
            },
            {
                title: 'Metabolic HIIT',
                description: 'Low-impact high intensity intervals designed to improve insulin sensitivity without spiking cortisol.',
                duration: '20 min',
                intensity: 'High',
                phases: ['Follicular', 'Ovulation'],
                category: 'HIIT'
            },
            {
                title: 'Resistance Foundation',
                description: 'Slow, controlled compound movements to build lean muscle mass and boost resting metabolic rate.',
                duration: '45 min',
                intensity: 'Medium',
                phases: ['Follicular', 'Ovulation'],
                category: 'Strength'
            }
        ];

        await GlobalWorkout.deleteMany({}); // Clean start
        await GlobalWorkout.insertMany(protocols);
        
        console.log('Successfully seeded 3 protocols!');
        process.exit(0);
    } catch (error) {
        console.error('Seeding error:', error);
        process.exit(1);
    }
};

seedWorkouts();
