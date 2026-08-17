import mongoose from "mongoose";

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    priority: { type: String, enum: ["HIGH", "MEDIUM", "LOW"], default: "MEDIUM" },
    status: {
      type: String,
      enum: ["Not Started", "In Progress", "Completed"],
      default: "Not Started",
    },
    rationale: { type: String, default: "" },
    prerequisites: { type: [String], default: [] },
    estimated_time: { type: String, default: "" },
    project_suggestion: { type: String, default: "" },
  },
  { _id: false }
);

const roadmapPhaseSchema = new mongoose.Schema(
  {
    phase: { type: Number, required: true },
    title: { type: String, required: true },
    skills: { type: [skillSchema], default: [] },
  },
  { _id: false }
);

const skillRoadmapSchema = new mongoose.Schema(
  {
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    analysis_id: {
      type: String,
      required: true,
      index: true,
    },
    target_role: {
      type: String,
      default: "Software Engineer",
    },
    match_score: {
      type: Number,
      default: 0,
    },
    phases: {
      type: [roadmapPhaseSchema],
      default: [],
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id ? ret._id.toString() : ret.id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const SkillRoadmap =
  mongoose.models.SkillRoadmap ||
  mongoose.model("SkillRoadmap", skillRoadmapSchema, "skill_roadmaps");

export default SkillRoadmap;
