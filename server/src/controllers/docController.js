import prisma from "../config/db.js";

/**
 * Create a new document
 */
export async function createDocument(req, res) {
  try {
    const { title, content = "" } = req.body;
    const userId = req.user.uid;

    // Get user by Firebase UID
    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const document = await prisma.document.create({
      data: {
        title: title || "Untitled",
        content,
        userId: user.id,
        status: "draft",
        isFavorite: false,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Document created",
      data: { document },
    });
  } catch (error) {
    console.error("Create document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create document",
      error: error.message,
    });
  }
}

/**
 * Get all documents for current user
 */
export async function listDocuments(req, res) {
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

    const documents = await prisma.document.findMany({
      where: { userId: user.id },
      select: {
        id: true,
        title: true,
        content: true,
        status: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
    });

    return res.status(200).json({
      success: true,
      data: { documents },
    });
  } catch (error) {
    console.error("List documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to list documents",
      error: error.message,
    });
  }
}

/**
 * Get a specific document by ID
 */
export async function getDocument(req, res) {
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

    const document = await prisma.document.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { document },
    });
  } catch (error) {
    console.error("Get document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get document",
      error: error.message,
    });
  }
}

/**
 * Update a document
 */
export async function updateDocument(req, res) {
  try {
    const { id } = req.params;
    const { title, content, status, isFavorite } = req.body;
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
    const existingDoc = await prisma.document.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (status !== undefined) updateData.status = status;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;

    const document = await prisma.document.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Document updated",
      data: { document },
    });
  } catch (error) {
    console.error("Update document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update document",
      error: error.message,
    });
  }
}

/**
 * Delete a document
 */
export async function deleteDocument(req, res) {
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
    const existingDoc = await prisma.document.findFirst({
      where: {
        id: parseInt(id),
        userId: user.id,
      },
    });

    if (!existingDoc) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
      });
    }

    await prisma.document.delete({
      where: { id: parseInt(id) },
    });

    return res.status(200).json({
      success: true,
      message: "Document deleted",
    });
  } catch (error) {
    console.error("Delete document error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete document",
      error: error.message,
    });
  }
}
