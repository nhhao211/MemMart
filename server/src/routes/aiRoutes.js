import express from "express";
import { refine, generateDiagram } from "../controllers/aiController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Secure AI routes with auth
router.post("/refine", authMiddleware, refine);
router.post("/generate-diagram", authMiddleware, generateDiagram);

export default router;
