import { Router } from "express";
import {upload} from "../middleware/upload.js";
import { register, verify, login } from "../controller/authController.js";

const router = Router();
router.post("/register", upload.single("profileImage"), register);
router.get("/verify/:code", verify);
router.post("/login", login);

export default router;