import express from 'express';
import authRoutes from './routes/auth.route.js';
import userroutes from './routes/user.route.js';
import cycleRoutes from './routes/cycle.route.js';
import symptomRoutes from './routes/symptom.route.js';
import dotenv from 'dotenv';
import cors from 'cors';
const app = express();

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'], // Allow frontend dev ports
  credentials: true
}))

app.options(/.*/, cors());

app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

dotenv.config();
app.use('/api/auth', authRoutes);
app.use('/api/user', userroutes);
app.use('/api/cycle', cycleRoutes);
app.use('/api/symptoms', symptomRoutes);


// test route 
app.get("/", (req, res) => {
  res.send("API is running");
});

export default app;
