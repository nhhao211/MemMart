import prisma from "../config/db.js";

/**
 * Create a new project with default columns
 */
export async function createProject(req, res) {
  try {
    const { title, description } = req.body;
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

    // Create project with default columns
    const project = await prisma.project.create({
      data: {
        title: title || "Untitled Project",
        description,
        userId: user.id,
        columns: {
          create: [
            { title: "To Do", order: 0 },
            { title: "In Progress", order: 1 },
            { title: "Fix Bug", order: 2 },
            { title: "Done", order: 3 },
          ],
        },
      },
      include: {
        columns: {
          include: {
            tasks: true,
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return res.status(201).json({
      success: true,
      message: "Project created",
      data: { project },
    });
  } catch (error) {
    console.error("Create project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create project",
      error: error.message,
    });
  }
}

/**
 * Get all projects for current user
 */
export async function listProjects(req, res) {
  try {
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

    const projects = await prisma.project.findMany({
      where: { userId: user.id },
      include: {
        columns: {
          include: {
            _count: {
              select: { tasks: true },
            },
          },
          orderBy: { order: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add task count to each project
    const projectsWithStats = projects.map((project) => ({
      ...project,
      taskCount: project.columns.reduce(
        (acc, col) => acc + col._count.tasks,
        0
      ),
    }));

    return res.status(200).json({
      success: true,
      data: { projects: projectsWithStats },
    });
  } catch (error) {
    console.error("List projects error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list projects",
      error: error.message,
    });
  }
}

/**
 * Get a specific project with all columns and tasks
 */
export async function getProject(req, res) {
  try {
    const { id } = req.params;
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

    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { project },
    });
  } catch (error) {
    console.error("Get project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get project",
      error: error.message,
    });
  }
}

/**
 * Update a project
 */
export async function updateProject(req, res) {
  try {
    const { id } = req.params;
    const { title, description, status } = req.body;
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

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;

    const project = await prisma.project.update({
      where: { id: parseInt(id) },
      data: updateData,
      include: {
        columns: {
          include: {
            tasks: {
              orderBy: { order: "asc" },
            },
          },
          orderBy: { order: "asc" },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Project updated",
      data: { project },
    });
  } catch (error) {
    console.error("Update project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update project",
      error: error.message,
    });
  }
}

/**
 * Delete a project (cascades to columns and tasks)
 */
export async function deleteProject(req, res) {
  try {
    const { id } = req.params;
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

    // Verify ownership
    const existingProject = await prisma.project.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingProject) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    await prisma.project.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Project deleted",
    });
  } catch (error) {
    console.error("Delete project error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
      error: error.message,
    });
  }
}

/**
 * Add a new column to a project
 */
export async function createColumn(req, res) {
  try {
    const { projectId } = req.params;
    const { title } = req.body;
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

    // Verify project ownership
    const project = await prisma.project.findFirst({
      where: {
        id: parseInt(projectId),
        userId: user.id,
      },
      include: {
        columns: true,
      },
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found",
      });
    }

    // Get the next order value
    const maxOrder = project.columns.reduce(
      (max, col) => Math.max(max, col.order),
      -1
    );

    const column = await prisma.column.create({
      data: {
        title: title || "New Column",
        order: maxOrder + 1,
        projectId: parseInt(projectId),
      },
      include: {
        tasks: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Column created",
      data: { column },
    });
  } catch (error) {
    console.error("Create column error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create column",
      error: error.message,
    });
  }
}

/**
 * Update column (title or order)
 */
export async function updateColumn(req, res) {
  try {
    const { columnId } = req.params;
    const { title, order } = req.body;
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
      },
    });

    if (!column || column.project.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (order !== undefined) updateData.order = order;

    const updatedColumn = await prisma.column.update({
      where: { id: parseInt(columnId) },
      data: updateData,
      include: {
        tasks: {
          orderBy: { order: "asc" },
        },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Column updated",
      data: { column: updatedColumn },
    });
  } catch (error) {
    console.error("Update column error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update column",
      error: error.message,
    });
  }
}

/**
 * Delete a column
 */
export async function deleteColumn(req, res) {
  try {
    const { columnId } = req.params;
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
      },
    });

    if (!column || column.project.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: "Column not found",
      });
    }

    await prisma.column.delete({
      where: { id: parseInt(columnId) },
    });

    return res.status(200).json({
      success: true,
      message: "Column deleted",
    });
  } catch (error) {
    console.error("Delete column error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete column",
      error: error.message,
    });
  }
}
