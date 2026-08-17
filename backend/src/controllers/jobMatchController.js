import mongoose from "mongoose";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import { matchJobDescription } from "../services/aiService.js";

function queryAnalysisById(analysisId, userId) {
  const query = { user_id: userId.toString() };
  if (mongoose.Types.ObjectId.isValid(analysisId)) {
    query.$or = [{ _id: analysisId }, { id: analysisId }];
  } else {
    query.id = analysisId;
  }
  return ResumeAnalysis.findOne(query);
}

export async function jobMatch(req, res) {
  try {
    const { job_title, job_description, analysis_id } = req.body;
    if (!job_description || !job_description.trim()) {
      return res.status(400).json({ detail: "job_description is required" });
    }

    let dbAnalysis;
    if (analysis_id) {
      dbAnalysis = await queryAnalysisById(analysis_id, req.user.id);
    } else {
      dbAnalysis = await ResumeAnalysis.findOne({ user_id: req.user.id.toString() }).sort({
        created_at: -1,
      });
    }

    if (!dbAnalysis) {
      return res.status(404).json({
        detail: "No resume analysis found. Please upload and analyze a resume first.",
      });
    }

    const result = await matchJobDescription(
      dbAnalysis.toJSON(),
      job_title || "",
      job_description
    );

    return res.json(result);
  } catch (error) {
    console.error("Job Match Error:", error);
    return res.status(500).json({ detail: error.message || "Failed to match job description" });
  }
}

export default {
  jobMatch,
};
