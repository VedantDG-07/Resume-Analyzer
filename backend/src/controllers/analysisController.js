import mongoose from "mongoose";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import SkillRoadmap from "../models/SkillRoadmap.js";
import { extractText } from "../services/fileExtractionService.js";
import { analyzeResumeWithRAG } from "../services/aiService.js";

function queryAnalysisById(analysisId, userId) {
  const query = { user_id: userId.toString() };
  if (mongoose.Types.ObjectId.isValid(analysisId)) {
    query.$or = [{ _id: analysisId }, { id: analysisId }];
  } else {
    query.id = analysisId;
  }
  return ResumeAnalysis.findOne(query);
}

export async function analyzeResume(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ detail: "No file uploaded" });
    }

    const filename = req.file.originalname || "resume.pdf";
    const lowerName = filename.toLowerCase();
    if (!lowerName.endsWith(".pdf") && !lowerName.endsWith(".docx")) {
      return res.status(400).json({ detail: "Only PDF and DOCX files are supported" });
    }

    // 1. Extract text
    const text = await extractText(req.file.buffer, filename);
    if (!text || !text.trim()) {
      return res.status(400).json({
        detail: "Could not extract readable text from uploaded file. Please ensure it is not scanned/empty.",
      });
    }

    // 2. Run Gemini + Heuristic RAG analysis
    const analysisData = await analyzeResumeWithRAG(text);

    // 3. Save to MongoDB
    const newAnalysis = await ResumeAnalysis.create({
      filename,
      overall_score: analysisData.overall_score || 75,
      ats_score: analysisData.ats_score || 80,
      skill_match: analysisData.skill_match || 70,
      issues_found: analysisData.issues_found ?? 2,
      ai_summary: analysisData.ai_summary || "",
      ats_feedback: analysisData.ats_feedback || "",
      action_verb_feedback: analysisData.action_verb_feedback || "",
      bullet_suggestions: analysisData.bullet_suggestions || [],
      missing_keywords: analysisData.missing_keywords || [],
      strengths: analysisData.strengths || [],
      improvements: analysisData.improvements || [],
      parsed_ats_data: analysisData.parsed_ats_data || [],
      user_id: req.user.id.toString(),
    });

    return res.json(newAnalysis.toJSON());
  } catch (error) {
    console.error("Resume Analysis Error:", error);
    return res.status(500).json({ detail: error.message || "Failed to analyze resume" });
  }
}

export async function getAnalyses(req, res) {
  try {
    const skip = parseInt(req.query.skip, 10) || 0;
    const limit = parseInt(req.query.limit, 10) || 10;

    const analyses = await ResumeAnalysis.find({ user_id: req.user.id.toString() })
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);

    return res.json(analyses.map((a) => a.toJSON()));
  } catch (error) {
    console.error("Get Analyses Error:", error);
    return res.status(500).json({ detail: "Failed to retrieve analyses" });
  }
}

export async function deleteAnalysis(req, res) {
  try {
    const { id } = req.params;
    const analysis = await queryAnalysisById(id, req.user.id);

    if (!analysis) {
      return res.status(404).json({ detail: "Analysis not found" });
    }

    const analysisIdStr = analysis._id.toString();

    // Delete analysis document
    await ResumeAnalysis.deleteOne({ _id: analysis._id });

    // Cascade delete related skill roadmaps
    await SkillRoadmap.deleteMany({
      $or: [{ analysis_id: analysisIdStr }, { analysis_id: id }],
      user_id: req.user.id.toString(),
    });

    return res.json({ message: "Analysis deleted successfully" });
  } catch (error) {
    console.error("Delete Analysis Error:", error);
    return res.status(500).json({ detail: "Failed to delete analysis" });
  }
}

export default {
  analyzeResume,
  getAnalyses,
  deleteAnalysis,
};
