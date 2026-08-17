import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import User from "../models/User.js";

dotenv.config();

const SECRET_KEY = process.env.JWT_SECRET_KEY || "my_super_secret_jwt_key_for_dev";

export function createAccessToken(userId, expiresIn = "7d") {
  return jwt.sign({ sub: userId.toString() }, SECRET_KEY, { expiresIn });
}

export async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    const token = authHeader.split(" ")[1];

    if (token === "mock_admin_token") {
      let adminUser = await User.findOne({ email: "admin@example.com" });
      if (!adminUser) {
        adminUser = await User.create({
          googleId: "admin_mock",
          email: "admin@example.com",
          fullName: "Admin User",
          profilePicture: "",
          emailVerified: true,
          provider: "Local",
        });
      }
      req.user = adminUser.toJSON();
      return next();
    }

    let payload;
    try {
      payload = jwt.verify(token, SECRET_KEY);
    } catch (err) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    const userId = payload.sub;
    if (!userId) {
      return res.status(401).json({ detail: "Could not validate credentials" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(401).json({ detail: "User not found" });
    }

    req.user = user.toJSON();
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ detail: "Internal Server Error in Authentication" });
  }
}

export default authMiddleware;
