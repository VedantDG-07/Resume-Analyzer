import mongoose from "mongoose";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import { generateInterviewQuestions } from "../services/aiService.js";

function queryAnalysisById(analysisId, userId) {
  const query = { user_id: userId.toString() };
  if (mongoose.Types.ObjectId.isValid(analysisId)) {
    query.$or = [{ _id: analysisId }, { id: analysisId }];
  } else {
    query.id = analysisId;
  }
  return ResumeAnalysis.findOne(query);
}

export async function generateInterview(req, res) {
  try {
    const { analysis_id } = req.body;
    if (!analysis_id) {
      return res.status(400).json({ detail: "analysis_id is required" });
    }

    const dbAnalysis = await queryAnalysisById(analysis_id, req.user.id);
    if (!dbAnalysis) {
      return res.status(404).json({ detail: "Resume analysis not found" });
    }

    const questions = await generateInterviewQuestions(dbAnalysis.toJSON());
    return res.json(questions);
  } catch (error) {
    console.error("Interview Generation Error:", error);
    return res.status(500).json({ detail: error.message || "Failed to generate interview questions" });
  }
}

export default {
  generateInterview,
};
