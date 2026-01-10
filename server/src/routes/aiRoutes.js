import express from "express";
import { refine } from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Secure AI routes with auth
router.post("/refine", authMiddleware, refine);

export default router;
