// routes/user.route.js

import { Router } from "express";
import { getAllUsers } from "../controller/user.controller.js";

const router = Router();

router.get('/users', getAllUsers); // you can remove verifyToken if you want it public

export default router;