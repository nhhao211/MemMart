import prisma from "../config/db.js";
import { convertMarkdownToDocx } from "../services/aiService.js";
import * as storageService from "../services/storageService.js";

/**
 * Create a new document
 * - Metadata stored in PostgreSQL
 * - Content stored in Firebase Realtime Database
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

    // First create document in PostgreSQL to get the ID
    const document = await prisma.document.create({
      data: {
        title: title || "Untitled",
        contentRef: "", // Will be updated after saving to Firebase
        userId: user.id,
        status: "draft",
        isFavorite: false,
        featureId: req.body.featureId ? parseInt(req.body.featureId) : undefined,
      },
    });

    // Save content to Firebase Realtime Database
    const contentRef = await storageService.saveContent(
      document.id.toString(),
      content
    );

    // Update document with content reference
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: { contentRef },
    });

    return res.status(201).json({
      success: true,
      message: "Document created",
      data: {
        document: {
          ...updatedDocument,
          content, // Return content for immediate use
        },
      },
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
 * Returns metadata only (no content) for list view
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
        status: true,
        isFavorite: true,
        createdAt: true,
        updatedAt: true,
        featureId: true,
        // Not fetching content for list view - saves bandwidth
      },
      orderBy: { updatedAt: "desc" },
    });

    // Add empty content placeholder for list view
    const documentsWithContent = documents.map((doc) => ({
      ...doc,
      content: "", // Content will be fetched when document is opened
    }));

    return res.status(200).json({
      success: true,
      data: { documents: documentsWithContent },
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
 * Fetches content from Firebase Realtime Database
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

    // Fetch content from Firebase Realtime Database
    const content = await storageService.getContent(id);

    return res.status(200).json({
      success: true,
      data: {
        document: {
          ...document,
          content, // Include content from Firebase
        },
      },
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
 * - Metadata updated in PostgreSQL
 * - Content updated in Firebase Realtime Database
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

    // Update content in Firebase if provided
    if (content !== undefined) {
      await storageService.saveContent(id, content);
    }

    // Update metadata in PostgreSQL
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (status !== undefined) updateData.status = status;
    if (status !== undefined) updateData.status = status;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    if (req.body.featureId !== undefined) updateData.featureId = req.body.featureId ? parseInt(req.body.featureId) : null;

    const document = await prisma.document.update({
      where: { id: parseInt(id) },
      data: updateData,
    });

    return res.status(200).json({
      success: true,
      message: "Document updated",
      data: {
        document: {
          ...document,
          content: content !== undefined ? content : undefined,
        },
      },
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
 * - Removes from PostgreSQL and Firebase Realtime Database
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

    // Delete content from Firebase Realtime Database
    await storageService.deleteContent(id);

    // Delete from PostgreSQL
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

/**
 * Delete multiple documents (Batch)
 */
export async function deleteDocuments(req, res) {
  try {
    const { ids } = req.body; // Array of IDs
    const userId = req.user.uid;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No document IDs provided",
      });
    }

    const user = await prisma.user.findUnique({
      where: { firebaseUid: userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Convert IDs to integers
    const docIds = ids.map((id) => parseInt(id)).filter((id) => !isNaN(id));

    if (docIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid document IDs",
      });
    }

    // Verify ownership and get valid docs to delete
    const documentsToDelete = await prisma.document.findMany({
      where: {
        id: { in: docIds },
        userId: user.id,
      },
    });

    if (documentsToDelete.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No matching documents found to delete",
      });
    }

    // Delete content from Firebase for each doc
    // We do this in parallel but catch errors so one failure doesn't stop others
    await Promise.allSettled(
      documentsToDelete.map((doc) => storageService.deleteContent(doc.id.toString()))
    );

    // Delete from PostgreSQL
    const deletedCount = await prisma.document.deleteMany({
      where: {
        id: { in: documentsToDelete.map((d) => d.id) },
      },
    });

    return res.status(200).json({
      success: true,
      message: `${deletedCount.count} documents deleted`,
    });
  } catch (error) {
    console.error("Batch delete documents error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete documents",
      error: error.message,
    });
  }
}

/**
 * Export document as DOCX
 */
export async function exportDocumentAsDocx(req, res) {
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

    // Verify document exists and user owns it
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

    // Convert to DOCX (this function will fetch content from Firebase)
    console.log(`[Export] Starting export for document ${id}`);
    const result = await convertMarkdownToDocx(id);

    if (!result || !result.buffer) {
      throw new Error("Failed to generate document");
    }
    const { buffer } = result;

    console.log(`[Export] Buffer generated, size: ${buffer.length} bytes`);

    // Set response headers for file download
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${encodeURIComponent(
        document.title || `document-${id}`
      )}.docx"`
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader("Content-Length", buffer.length);

    // Send the buffer
    return res.status(200).send(buffer);
  } catch (error) {
    console.error("Export document error:", error);
    // If headers haven't been sent, we can send a JSON error
    if (!res.headersSent) {
      return res.status(500).json({
        success: false,
        message: "Failed to export document",
        error: error.message,
      });
    } else {
      res.end();
    }
  }
}
