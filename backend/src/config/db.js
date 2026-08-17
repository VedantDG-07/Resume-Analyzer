import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const DATABASE_URL =
  process.env.DATABASE_URL ||
  process.env.MONGODB_URI ||
  "mongodb://localhost:27017/ai_resume_analyzer";

const DB_NAME = process.env.MONGODB_DB_NAME || "ai_resume_analyzer";

export async function connectDB() {
  try {
    const opts = {
      dbName: DB_NAME,
      serverSelectionTimeoutMS: 8000,
    };

    await mongoose.connect(DATABASE_URL, opts);
    console.log(`[MongoDB] Connected successfully to database: ${mongoose.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Connection error:`, error.message);
  }
}

export default connectDB;
