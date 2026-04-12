import mongoose from 'mongoose';
import User from './models/user.model.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '.env') });

const promoteToAdmin = async (email) => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/pcos_tracker');
        const user = await User.findOneAndUpdate({ email }, { role: 'admin' }, { new: true });
        if (user) {
            console.log(`User ${email} promoted to admin successfully.`);
        } else {
            console.log(`User ${email} not found.`);
        }
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error promoting user:', error);
    }
};

const email = process.argv[2];
if (!email) {
    console.log('Please provide an email: node promoteAdmin.js <email>');
    process.exit(1);
}

promoteToAdmin(email);
