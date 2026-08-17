import mongoose from "mongoose";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import SkillRoadmap from "../models/SkillRoadmap.js";
import { generateSkillRoadmapData } from "../services/aiService.js";

function queryAnalysisById(analysisId, userId) {
  const query = { user_id: userId.toString() };
  if (mongoose.Types.ObjectId.isValid(analysisId)) {
    query.$or = [{ _id: analysisId }, { id: analysisId }];
  } else {
    query.id = analysisId;
  }
  return ResumeAnalysis.findOne(query);
}

function queryRoadmapById(roadmapId, userId) {
  const query = { user_id: userId.toString() };
  if (mongoose.Types.ObjectId.isValid(roadmapId)) {
    query.$or = [{ _id: roadmapId }, { id: roadmapId }];
  } else {
    query.id = roadmapId;
  }
  return SkillRoadmap.findOne(query);
}

export async function generateRoadmap(req, res) {
  try {
    const { analysis_id, target_role } = req.body;
    if (!analysis_id) {
      return res.status(400).json({ detail: "analysis_id is required" });
    }

    const dbAnalysis = await queryAnalysisById(analysis_id, req.user.id);
    if (!dbAnalysis) {
      return res.status(404).json({ detail: "Resume analysis not found" });
    }

    const roleToTarget = target_role || "Software Engineer";
    const roadmapData = await generateSkillRoadmapData(dbAnalysis.toJSON(), roleToTarget);

    const now = new Date();
    const analysisIdStr = dbAnalysis._id.toString();

    let dbRoadmap = await SkillRoadmap.findOne({
      $or: [{ analysis_id: analysisIdStr }, { analysis_id: analysis_id.toString() }],
      user_id: req.user.id.toString(),
    });

    const phases = roadmapData.phases || [];

    if (dbRoadmap) {
      dbRoadmap.target_role = roleToTarget;
      dbRoadmap.match_score = roadmapData.match_score || 0;
      dbRoadmap.phases = phases;
      dbRoadmap.updated_at = now;
      await dbRoadmap.save();
    } else {
      dbRoadmap = await SkillRoadmap.create({
        user_id: req.user.id.toString(),
        analysis_id: analysisIdStr,
        target_role: roleToTarget,
        match_score: roadmapData.match_score || 0,
        phases,
        created_at: now,
        updated_at: now,
      });
    }

    return res.json(dbRoadmap.toJSON());
  } catch (error) {
    console.error("Roadmap Generation Error:", error);
    return res.status(500).json({ detail: error.message || "Failed to generate skill roadmap" });
  }
}

export async function getRoadmap(req, res) {
  try {
    const { analysis_id } = req.params;
    const queryOr = [{ analysis_id: analysis_id.toString() }];
    if (mongoose.Types.ObjectId.isValid(analysis_id)) {
      queryOr.push({ analysis_id: new mongoose.Types.ObjectId(analysis_id) });
    }

    const dbRoadmap = await SkillRoadmap.findOne({
      $or: queryOr,
      user_id: req.user.id.toString(),
    }).sort({ created_at: -1 });

    if (!dbRoadmap) {
      return res.status(404).json({ detail: "Roadmap not found" });
    }

    return res.json(dbRoadmap.toJSON());
  } catch (error) {
    console.error("Get Roadmap Error:", error);
    return res.status(500).json({ detail: "Failed to fetch roadmap" });
  }
}

export async function updateRoadmapProgress(req, res) {
  try {
    const { roadmap_id, skill_name, new_status } = req.body;
    if (!roadmap_id || !skill_name || !new_status) {
      return res.status(400).json({ detail: "roadmap_id, skill_name, and new_status are required" });
    }

    const dbRoadmap = await queryRoadmapById(roadmap_id, req.user.id);
    if (!dbRoadmap) {
      return res.status(404).json({ detail: "Roadmap not found" });
    }

    let updated = false;
    for (const phase of dbRoadmap.phases) {
      for (const skill of phase.skills) {
        if (skill.name === skill_name) {
          skill.status = new_status;
          updated = true;
          break;
        }
      }
      if (updated) break;
    }

    if (updated) {
      dbRoadmap.updated_at = new Date();
      await dbRoadmap.save();
    }

    return res.json(dbRoadmap.toJSON());
  } catch (error) {
    console.error("Update Roadmap Progress Error:", error);
    return res.status(500).json({ detail: "Failed to update roadmap progress" });
  }
}

export default {
  generateRoadmap,
  getRoadmap,
  updateRoadmapProgress,
};
