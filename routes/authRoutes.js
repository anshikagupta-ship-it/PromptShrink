import { Router } from "express";
import { AuthController } from "../controllers/authController.js";

const router = Router();

// POST /api/auth/google
router.post("/google", AuthController.googleAuth);

// GET /api/auth/me
router.get("/me", AuthController.getMe);

// POST /api/auth/logout
router.post("/logout", AuthController.logout);

export default router;
