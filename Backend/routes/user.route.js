import { Router } from "express";
import { getAllUsers } from "../controller/user.controller.js";
import { checkToken } from "../middleware/auth.middleware.js";

const router = Router();

// Protected route
router.get("/users", checkToken, getAllUsers);

export default router;
