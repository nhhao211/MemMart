import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Middleware to verify Google ID token
 * Extracts user info and attaches to request object
 */
export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
      });
    }

    const idToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Check if it's a Google Token or our Custom JWT
    // Google tokens usually have many dots, but let's just try verification.
    
    try {
      // 1. Try Google Verify first
      const ticket = await client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
      const payload = ticket.getPayload();
      
      if (!payload) throw new Error('Invalid Google payload');

      req.user = {
        uid: payload.sub,
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        emailVerified: payload.email_verified,
        googleToken: idToken,
        provider: 'google'
      };
    } catch (googleError) {
      // 2. If Google fails, try Custom JWT (Admin)
      try {
        const decoded = jwt.verify(idToken, process.env.JWT_SECRET);
        req.user = {
          uid: decoded.uid,
          email: decoded.email,
          name: decoded.name,
          picture: decoded.picture || null,
          isAdmin: true,
          provider: 'jwt'
        };
      } catch (jwtError) {
        // Both failed
        throw new Error('Invalid token');
      }
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token',
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
