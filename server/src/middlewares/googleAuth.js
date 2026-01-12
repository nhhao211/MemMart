import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Middleware to verify Google ID token
 * Extracts user info and attaches to request object
 */
export async function googleAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Missing or invalid authorization header',
      });
    }

    const idToken = authHeader.substring(7); // Remove "Bearer " prefix

    // Verify the ID token with Google
    const ticket = await client.verifyIdToken({
      idToken: idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token payload',
      });
    }

    // Attach user info to request object
    req.user = {
      uid: payload.sub, // Google's unique user ID
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      emailVerified: payload.email_verified,
      googleToken: idToken,
    };

    next();
  } catch (error) {
    console.error('Google auth middleware error:', error.message);
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
  console.error('Error:', err);

  const status = err.status || 500;
  const message = err.message || 'Internal server error';

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { error: err }),
  });
}
