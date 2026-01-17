import express from "express";
import { 
    createFeature, 
    getFeatures, 
    getFeatureById, 
    updateFeature, 
    deleteFeature 
} from "../controllers/featureController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// Apply auth middleware to all routes
router.use(authMiddleware);

// Routes
router.post("/", createFeature);
router.get("/", getFeatures);
router.get("/:id", getFeatureById);
router.put("/:id", updateFeature);
router.delete("/:id", deleteFeature);

export default router;
