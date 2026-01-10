import { auth } from "../config/firebase.js";

/**
 * Middleware to verify Firebase ID token
 * Extracts user info and attaches to request object
 */
export async function authMiddleware(req, res, next) {
  try {
    // If Firebase not initialized, return error
    if (!auth) {
      return res.status(401).json({
        success: false,
        message: "Firebase not configured. Please set up Firebase credentials.",
      });
    }

    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Missing or invalid authorization header",
      });
    }

    const idToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the ID token with Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);

    // Attach user info to request object
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name,
      picture: decodedToken.picture,
      firebaseToken: idToken,
    };

    next();
  } catch (error) {
    console.error("Auth middleware error:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
}

/**
 * Middleware for error handling
 */
export function errorMiddleware(err, req, res, next) {
  console.error("Error:", err);

  const status = err.status || 500;
  const message = err.message || "Internal server error";

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === "development" && { error: err }),
  });
}
