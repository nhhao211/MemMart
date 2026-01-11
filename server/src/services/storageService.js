import { firebaseAdmin } from "../config/firebase.js";

/**
 * Firebase Realtime Database Storage Service
 * Handles document content storage in Firebase Realtime Database
 */

// Get database reference
const getDatabase = () => {
  if (!firebaseAdmin.apps.length) {
    throw new Error("Firebase Admin SDK not initialized");
  }
  return firebaseAdmin.database();
};

/**
 * Save document content to Firebase Realtime Database
 * @param {string} docId - Document ID (will be used as reference path)
 * @param {string} content - Markdown content to save
 * @returns {Promise<string>} - Reference path
 */
export async function saveContent(docId, content) {
  try {
    const db = getDatabase();
    const refPath = `documents/${docId}/content`;

    // Add timeout to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(
        () => reject(new Error("Firebase operation timed out")),
        10000
      );
    });

    await Promise.race([
      db.ref(refPath).set({
        content: content,
        updatedAt: Date.now(),
      }),
      timeoutPromise,
    ]);

    console.log(`[Firebase Storage] Saved content for doc ${docId}`);
    return refPath;
  } catch (error) {
    console.error("[Firebase Storage] Error saving content:", error);
    throw error;
  }
}

/**
 * Get document content from Firebase Realtime Database
 * @param {string} docId - Document ID
 * @returns {Promise<string>} - Document content
 */
export async function getContent(docId) {
  try {
    const db = getDatabase();
    const refPath = `documents/${docId}/content`;
    const snapshot = await db.ref(refPath).once("value");
    const data = snapshot.val();

    if (!data) {
      console.log(`[Firebase Storage] No content found for doc ${docId}`);
      return "";
    }

    console.log(`[Firebase Storage] Retrieved content for doc ${docId}`);
    return data.content || "";
  } catch (error) {
    console.error("[Firebase Storage] Error getting content:", error);
    throw error;
  }
}

/**
 * Delete document content from Firebase Realtime Database
 * @param {string} docId - Document ID
 */
export async function deleteContent(docId) {
  try {
    const db = getDatabase();
    const refPath = `documents/${docId}`;
    await db.ref(refPath).remove();
    console.log(`[Firebase Storage] Deleted content for doc ${docId}`);
  } catch (error) {
    console.error("[Firebase Storage] Error deleting content:", error);
    throw error;
  }
}

/**
 * Check if Firebase Realtime Database is available
 * @returns {boolean}
 */
export function isStorageAvailable() {
  try {
    getDatabase();
    return true;
  } catch {
    return false;
  }
}
