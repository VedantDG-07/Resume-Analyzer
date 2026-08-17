import axios from "axios";
import User from "../models/User.js";
import { createAccessToken } from "../middleware/authMiddleware.js";

export async function googleAuth(req, res) {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ detail: "Token is required" });
    }

    // Verify Google access token by fetching user profile
    let idInfo;
    try {
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
      idInfo = response.data;
    } catch (err) {
      console.error("Google token verification failed:", err.response?.data || err.message);
      return res.status(400).json({ detail: "Invalid Google token" });
    }

    const googleId = idInfo.sub;
    const email = idInfo.email;
    const name = idInfo.name || "User";
    const picture = idInfo.picture || "";
    const emailVerified = idInfo.email_verified || false;

    if (!googleId || !email) {
      return res.status(400).json({ detail: "Incomplete profile data from Google" });
    }

    const now = new Date();
    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({
        googleId,
        email,
        fullName: name,
        profilePicture: picture,
        emailVerified,
        provider: "Google",
        last_login: now,
        created_at: now,
        updated_at: now,
      });
    } else {
      user.last_login = now;
      user.updated_at = now;
      user.profilePicture = picture;
      user.fullName = name;
      await user.save();
    }

    const userJson = user.toJSON();
    const accessToken = createAccessToken(user._id);

    return res.json({
      access_token: accessToken,
      token_type: "bearer",
      user: userJson,
    });
  } catch (error) {
    console.error("Google auth error:", error);
    return res.status(500).json({ detail: "Authentication failed" });
  }
}

export default {
  googleAuth,
};
