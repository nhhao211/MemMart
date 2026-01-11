import express from "express";
import { authMiddleware } from "../middlewares/auth.js";
import {
  createProject,
  listProjects,
  getProject,
  updateProject,
  deleteProject,
  createColumn,
  updateColumn,
  deleteColumn,
} from "../controllers/projectController.js";
import {
  createTask,
  updateTask,
  batchUpdateTasks,
  deleteTask,
} from "../controllers/taskController.js";

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Project routes
router.post("/", createProject);
router.get("/", listProjects);
router.get("/:id", getProject);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);

// Column routes
router.post("/:projectId/columns", createColumn);
router.put("/columns/:columnId", updateColumn);
router.delete("/columns/:columnId", deleteColumn);

// Task routes
router.post("/columns/:columnId/tasks", createTask);
router.put("/tasks/:taskId", updateTask);
router.put("/tasks/batch", batchUpdateTasks);
router.delete("/tasks/:taskId", deleteTask);

export default router;
