import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();

// Parse the private key (handle escaped newlines)
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

// Firebase project ID for database URL
const projectId = process.env.FIREBASE_PROJECT_ID;

// Initialize Firebase Admin SDK
// Note: In development, skip initialization if no valid credentials are provided
try {
  if (!admin.apps.length) {
    if (privateKey && projectId && process.env.FIREBASE_CLIENT_EMAIL) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        databaseURL:
          process.env.FIREBASE_DATABASE_URL ||
          `https://${projectId}-default-rtdb.firebaseio.com`,
      });
      console.log("Firebase Admin SDK initialized with Realtime Database");
    } else {
      console.warn(
        "Firebase Admin SDK not initialized. Set Firebase credentials in .env to enable authentication."
      );
    }
  }
} catch (error) {
  console.warn("Firebase initialization error:", error.message);
  console.warn(
    "Continuing without Firebase. Configure .env with valid Firebase credentials for production."
  );
}

export const firebaseAdmin = admin;
export const auth = admin.apps.length > 0 ? admin.auth() : null;
export const database = admin.apps.length > 0 ? admin.database() : null;
