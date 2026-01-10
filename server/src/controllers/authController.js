import prisma from "../config/db.js";

/**
 * Login / Sync user with database
 * Called after Firebase authentication
 */
export async function login(req, res) {
  try {
    const { uid, email, name, picture } = req.user;

    // Check if user exists in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: uid },
    });

    // If not, create new user
    if (!user) {
      user = await prisma.user.create({
        data: {
          firebaseUid: uid,
          email,
          name: name || "Guest",
          picture: picture || null,
        },
      });
    } else {
      // Update user info if it changed
      user = await prisma.user.update({
        where: { firebaseUid: uid },
        data: {
          email,
          name: name || user.name,
          picture: picture || user.picture,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: {
          id: user.id,
          firebaseUid: user.firebaseUid,
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message,
    });
  }
}

/**
 * Get current user profile
 */
export async function getProfile(req, res) {
  try {
    const user = await prisma.user.findUnique({
      where: { firebaseUid: req.user.uid },
      select: {
        id: true,
        firebaseUid: true,
        email: true,
        name: true,
        picture: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get profile",
      error: error.message,
    });
  }
}
