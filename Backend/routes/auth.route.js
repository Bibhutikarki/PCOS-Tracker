import { Router } from "express";
import { register, login, changePassword } from "../controller/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/change-password', protect, changePassword);

export default router;