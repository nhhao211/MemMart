import prisma from "../config/db.js";

/**
 * Create a new task in a column
 */
export async function createTask(req, res) {
  try {
    const { columnId } = req.params;
    const { title, description, priority, dueDate, startDate, estimatedTime, actualTime, tags, checklist } = req.body;
    const userId = req.user.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify column ownership through project
    const column = await prisma.column.findFirst({
      where: {
        id: parseInt(columnId),
      },
      include: {
        project: true,
        tasks: true,
      },
    });

    if (!column || column.project.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    // Get the next order value
    const maxOrder = column.tasks.reduce(
      (max, task) => Math.max(max, task.order),
      -1
    );

    const task = await prisma.task.create({
      data: {
        title: title || "New Task",
        description,
        priority: priority || "medium",
        order: maxOrder + 1,
        dueDate: dueDate ? new Date(dueDate) : null,
        startDate: startDate ? new Date(startDate) : null,
        estimatedTime: estimatedTime ? parseInt(estimatedTime) : null,
        actualTime: actualTime ? parseInt(actualTime) : null,
        tags: tags ? JSON.stringify(tags) : "[]",
        checklist: checklist ? JSON.stringify(checklist) : "[]",
        columnId: parseInt(columnId),
      },
    });

    return res.status(201).json({
      success: true,
      message: "Task created",
      data: { task },
    });
  } catch (error) {
    console.error("Create task error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create task",
      error: error.message,
    });
  }
}

/**
 * Update a task (including moving to different column)
 */
export async function updateTask(req, res) {
  try {
    const { taskId } = req.params;
    const { title, description, priority, dueDate, startDate, estimatedTime, actualTime, tags, checklist, columnId, order } = req.body;
    const userId = req.user.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify task ownership through column -> project
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
      },
      include: {
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task || task.column.project.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    // If moving to a new column, verify that column belongs to the same project
    if (columnId !== undefined && columnId !== task.columnId) {
      const targetColumn = await prisma.column.findFirst({
        where: {
          id: parseInt(columnId),
          projectId: task.column.project.id,
        },
      });

      if (!targetColumn) {
        return res.status(400).json({
          success: false,
          message: "Target column not found in this project",
        });
      }
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
    if (estimatedTime !== undefined) updateData.estimatedTime = estimatedTime ? parseInt(estimatedTime) : null;
    if (actualTime !== undefined) updateData.actualTime = actualTime ? parseInt(actualTime) : null;
    if (tags !== undefined) updateData.tags = JSON.stringify(tags);
    if (checklist !== undefined) updateData.checklist = JSON.stringify(checklist);
    if (columnId !== undefined) updateData.columnId = parseInt(columnId);
    if (order !== undefined) updateData.order = order;

    const updatedTask = await prisma.task.update({
      where: { id: parseInt(taskId) },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Task updated",
      data: { task: updatedTask },
    });
  } catch (error) {
    console.error("Update task error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update task",
      error: error.message,
    });
  }
}

/**
 * Batch update tasks (for drag-and-drop reordering)
 */
export async function batchUpdateTasks(req, res) {
  try {
    const { tasks } = req.body; // Array of { id, columnId, order }
    const userId = req.user.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (!Array.isArray(tasks) || tasks.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Tasks array is required",
      });
    }

    // Verify all tasks belong to user's projects
    const taskIds = tasks.map((t) => t.id);
    const existingTasks = await prisma.task.findMany({
      where: {
        id: { in: taskIds },
      },
      include: {
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    // Check ownership
    const allOwned = existingTasks.every(
      (t) => t.column.project.userId === user.id
    );

    if (!allOwned || existingTasks.length !== tasks.length) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized to update some tasks",
      });
    }

    // Update all tasks in a transaction
    await prisma.$transaction(
      tasks.map((t) =>
        prisma.task.update({
          where: { id: t.id },
          data: {
            columnId: t.columnId,
            order: t.order,
          },
        })
      )
    );

    return res.status(200).json({
      success: true,
      message: "Tasks updated",
    });
  } catch (error) {
    console.error("Batch update tasks error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update tasks",
      error: error.message,
    });
  }
}

/**
 * Delete a task
 */
export async function deleteTask(req, res) {
  try {
    const { taskId } = req.params;
    const userId = req.user.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Verify task ownership through column -> project
    const task = await prisma.task.findFirst({
      where: {
        id: parseInt(taskId),
      },
      include: {
        column: {
          include: {
            project: true,
          },
        },
      },
    });

    if (!task || task.column.project.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Task not found",
      });
    }

    await prisma.task.delete({
      where: { id: parseInt(taskId) },
    });

    return res.status(200).json({
      success: true,
      message: "Task deleted",
    });
  } catch (error) {
    console.error("Delete task error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete task",
      error: error.message,
    });
  }
}
