import express from "express";
import authRoutes from "./authRoutes.js";
import docRoutes from "./docRoutes.js";
import aiRoutes from "./aiRoutes.js";

const router = express.Router();

// API v1 routes
router.use("/v1/auth", authRoutes);
router.use("/v1/docs", docRoutes);
router.use("/v1/ai", aiRoutes);

// Health check
router.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

export default router;
