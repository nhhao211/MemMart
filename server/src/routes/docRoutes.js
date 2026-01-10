import express from "express";
import {
  createDocument,
  listDocuments,
  getDocument,
  updateDocument,
  deleteDocument,
} from "../controllers/docController.js";
import { authMiddleware } from "../middlewares/auth.js";

const router = express.Router();

// All document routes require authentication
router.use(authMiddleware);

/**
 * @route   POST /api/v1/docs
 * @desc    Create a new document
 * @access  Private
 */
router.post("/", createDocument);

/**
 * @route   GET /api/v1/docs
 * @desc    Get all documents for current user
 * @access  Private
 */
router.get("/", listDocuments);

/**
 * @route   GET /api/v1/docs/:id
 * @desc    Get a specific document by ID
 * @access  Private
 */
router.get("/:id", getDocument);

/**
 * @route   PUT /api/v1/docs/:id
 * @desc    Update a document
 * @access  Private
 */
router.put("/:id", updateDocument);

/**
 * @route   DELETE /api/v1/docs/:id
 * @desc    Delete a document
 * @access  Private
 */
router.delete("/:id", deleteDocument);

export default router;
