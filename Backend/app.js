import express from 'express';
import authRoutes from './routes/auth.route.js';
import userroutes from './routes/user.route.js';
import cycleRoutes from './routes/cycle.route.js';
import symptomRoutes from './routes/symptom.route.js';
import workoutRoutes from './routes/workout.route.js';
import adminRoutes from './routes/admin.route.js';
import dotenv from 'dotenv';
import cors from 'cors';
const app = express();

app.use(cors({
  origin: true, // Reflects the request origin, effectively allowing any origin that sends credentials
  credentials: true
}))



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
app.use('/api/workout', workoutRoutes);
app.use('/api/admin', adminRoutes);


// test route
app.get("/", (req, res) => {
  res.send("API is running");
});

app.get('/test', (req, res) => {
  res.json({ message: "Test route is working" });
});

// test error route
app.get("/test-error", (req, res) => {
  throw new Error("This is a test error!");
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error("Critical Server Error:", err.stack);
  res.status(500).json({
    success: false,
    error: "Internal Server Error",
    message: err.message || "An unexpected error occurred on the server."
  });
});

export default app;
