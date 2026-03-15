// app.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes); // public routes
app.use("/api/user", userRoutes); // protected routes inside router

export default app;
