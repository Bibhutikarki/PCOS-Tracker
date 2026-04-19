// routes/user.route.js

import { Router } from "express";
import { getAllUsers, updateUserSettings } from "../controller/user.controller.js";

const router = Router();

router.get('/users', getAllUsers); // you can remove verifyToken if you want it public
router.put('/:id/settings', updateUserSettings);

export default router;