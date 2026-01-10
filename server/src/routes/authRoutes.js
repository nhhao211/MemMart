import express from "express";
import { login, getProfile } from "../controllers/authController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login with Firebase token, sync user to database
 * @access  Public (token in Authorization header)
 */
router.post("/login", authMiddleware, login);

/**
 * @route   GET /api/v1/auth/profile
 * @desc    Get current user profile
 * @access  Private
 */
router.get("/profile", authMiddleware, getProfile);

export default router;
