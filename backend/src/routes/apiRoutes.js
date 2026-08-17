import { Router } from "express";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
import authController from "../controllers/authController.js";
import analysisController from "../controllers/analysisController.js";
import interviewController from "../controllers/interviewController.js";
import roadmapController from "../controllers/roadmapController.js";
import jobMatchController from "../controllers/jobMatchController.js";

const router = Router();

// Multer memory storage configuration for file uploads (max 10MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Authentication routes
router.post("/auth/google", authController.googleAuth);

// Resume Analysis routes
router.post("/analyze", authMiddleware, upload.single("file"), analysisController.analyzeResume);
router.get("/analyses", authMiddleware, analysisController.getAnalyses);
router.delete("/analyses/:id", authMiddleware, analysisController.deleteAnalysis);

// Interview Prep routes
router.post("/interview/generate", authMiddleware, interviewController.generateInterview);

// Skill Roadmap routes
router.post("/roadmap/generate", authMiddleware, roadmapController.generateRoadmap);
router.get("/roadmap/:analysis_id", authMiddleware, roadmapController.getRoadmap);
router.post("/roadmap/progress", authMiddleware, roadmapController.updateRoadmapProgress);

// Job Description Match route
router.post("/job-match", authMiddleware, jobMatchController.jobMatch);

export default router;
