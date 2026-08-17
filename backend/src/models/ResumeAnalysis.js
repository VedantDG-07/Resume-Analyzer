import mongoose from "mongoose";

const bulletSuggestionSchema = new mongoose.Schema(
  {
    original: { type: String, default: "" },
    improved: { type: String, default: "" },
    reason: { type: String, default: "" },
  },
  { _id: false }
);

const atsParsedFieldSchema = new mongoose.Schema(
  {
    field: { type: String, default: "" },
    status: { type: String, default: "not_found" },
    value: { type: String, default: "Missing" },
  },
  { _id: false }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    filename: {
      type: String,
      default: "resume.pdf",
    },
    overall_score: {
      type: Number,
      default: 0,
    },
    ats_score: {
      type: Number,
      default: 0,
    },
    skill_match: {
      type: Number,
      default: 0,
    },
    issues_found: {
      type: Number,
      default: 0,
    },
    ai_summary: {
      type: String,
      default: "",
    },
    ats_feedback: {
      type: String,
      default: "",
    },
    action_verb_feedback: {
      type: String,
      default: "",
    },
    bullet_suggestions: {
      type: [bulletSuggestionSchema],
      default: [],
    },
    missing_keywords: {
      type: [String],
      default: [],
    },
    strengths: {
      type: [String],
      default: [],
    },
    improvements: {
      type: [String],
      default: [],
    },
    parsed_ats_data: {
      type: [atsParsedFieldSchema],
      default: [],
    },
    user_id: {
      type: String,
      required: true,
      index: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
      index: true,
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

export const ResumeAnalysis =
  mongoose.models.ResumeAnalysis ||
  mongoose.model("ResumeAnalysis", resumeAnalysisSchema, "resume_analyses");

export default ResumeAnalysis;
