"use client";

import { useEffect, useState } from "react";
import { Sparkles, AlertCircle, FileText, CheckCircle2, TrendingUp, Target, Copy, Check, ArrowRight, Zap, ListChecks, ShieldCheck, Tag, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ScoreRing } from "@/components/ui/ScoreRing";

interface BulletSuggestion {
  original: string;
  improved: string;
  reason: string;
}

interface AnalysisData {
  id: number;
  filename: string;
  overall_score: number;
  ats_score: number;
  skill_match: number;
  issues_found: number;
  ai_summary?: string;
  ats_feedback?: string;
  action_verb_feedback?: string;
  bullet_suggestions?: BulletSuggestion[];
  missing_keywords?: string[];
  strengths?: string[];
  improvements?: string[];
  created_at: string;
}

export default function AnalyzePage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [copiedKeyword, setCopiedKeyword] = useState<string | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem("latestAnalysis");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored analysis", e);
      }
    }
    setLoading(false);
  }, []);

  const handleCopyBullet = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  const handleCopyKeyword = (kw: string) => {
    navigator.clipboard.writeText(kw);
    setCopiedKeyword(kw);
    setTimeout(() => setCopiedKeyword(null), 1500);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin glow-cyan" />
        <p className="text-xs font-mono-tech text-cyan-300">Retrieving AI Insights...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6 text-center">
        <div className="w-20 h-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <FileText className="w-10 h-10 text-slate-400" />
        </div>
        <div className="space-y-2 max-w-sm">
          <h2 className="text-2xl font-bold text-white">No Analysis Recorded</h2>
          <p className="text-xs text-slate-400 font-mono-tech">Upload a resume to execute the LangChain + Gemini RAG analysis engine.</p>
        </div>
        <Link 
          href="/dashboard/upload"
          className="gradient-btn-primary py-3 px-8 rounded-2xl text-xs font-mono-tech font-bold text-white shadow-xl glow-purple"
        >
          Upload Resume File
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans text-slate-100 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-tech mb-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>LANGCHAIN RAG INTELLIGENCE REPORT</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Resume AI Analysis <Sparkles className="w-6 h-6 text-purple-400" />
          </h1>
          <p className="text-xs text-slate-400 font-mono-tech mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-cyan-400" /> {data.filename}
          </p>
        </div>

        <Link 
          href="/dashboard/upload"
          className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-mono-tech text-cyan-300 border border-white/10 hover:border-cyan-400/40 transition-all flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Analyze Another Resume
        </Link>
      </div>

      {/* 3 Main HUD Score Rings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Overall Score */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col items-center justify-center glow-purple">
          <ScoreRing score={data.overall_score} size={150} strokeWidth={12} label="Overall Match" sublabel="MARKET READINESS" glowColor="purple" />
          <p className="text-[11px] text-slate-400 font-mono-tech text-center mt-3">
            Composite score based on structure, keywords, and impact verbs.
          </p>
        </div>

        {/* ATS Score */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col items-center justify-center glow-cyan">
          <ScoreRing score={data.ats_score} size={150} strokeWidth={12} label="ATS Parser Score" sublabel="PARSER COMPLIANCE" glowColor="cyan" />
          <p className="text-[11px] text-slate-400 font-mono-tech text-center mt-3">
            Formatting compatibility with enterprise ATS filters.
          </p>
        </div>

        {/* Skill Match Score */}
        <div className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col items-center justify-center">
          <ScoreRing score={data.skill_match} size={150} strokeWidth={12} label="Skill Depth" sublabel="KEYWORD DENSITY" glowColor="emerald" />
          <p className="text-[11px] text-slate-400 font-mono-tech text-center mt-3">
            Technical terminology and domain skill presence.
          </p>
        </div>

      </div>

      {/* AI Executive Summary Card */}
      {data.ai_summary && (
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 rounded-3xl glass-card border border-white/10 relative overflow-hidden glow-purple"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center glow-purple">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Executive AI Evaluation</h3>
              <p className="text-xs text-slate-400 font-mono-tech">Deep candidate assessment generated by Gemini RAG pipeline</p>
            </div>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-mono-tech bg-slate-950/40 p-5 rounded-2xl border border-white/5">
            "{data.ai_summary}"
          </p>
        </motion.div>
      )}

      {/* Strengths & Improvements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Strengths */}
        <div className="p-6 rounded-3xl glass-card border border-emerald-500/20 space-y-4">
          <div className="flex items-center gap-2 text-emerald-400">
            <CheckCircle2 className="w-5 h-5" />
            <h3 className="text-sm font-bold font-mono-tech uppercase tracking-wide">Key Resume Strengths</h3>
          </div>
          <div className="space-y-2.5">
            {data.strengths && data.strengths.length > 0 ? (
              data.strengths.map((str, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span>{str}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-mono-tech">Solid overall structural organization.</p>
            )}
          </div>
        </div>

        {/* Priority Improvements */}
        <div className="p-6 rounded-3xl glass-card border border-purple-500/20 space-y-4">
          <div className="flex items-center gap-2 text-purple-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-sm font-bold font-mono-tech uppercase tracking-wide">High-Priority Improvements</h3>
          </div>
          <div className="space-y-2.5">
            {data.improvements && data.improvements.length > 0 ? (
              data.improvements.map((imp, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-xl bg-purple-500/5 border border-purple-500/15 text-xs text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 mt-1.5 flex-shrink-0" />
                  <span>{imp}</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 font-mono-tech">Ensure all bullet points include quantifiable results.</p>
            )}
          </div>
        </div>

      </div>

      {/* Interactive LLM Bullet Point Rewrites */}
      {data.bullet_suggestions && data.bullet_suggestions.length > 0 && (
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-300">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">AI-Rewritten High-Impact Bullet Points</h3>
                <p className="text-xs text-slate-400 font-mono-tech">Real before-and-after improvements tailored directly to your resume lines</p>
              </div>
            </div>
            <span className="text-[10px] font-mono-tech px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
              {data.bullet_suggestions.length} Tailored Rewrites
            </span>
          </div>

          <div className="space-y-4">
            {data.bullet_suggestions.map((bullet, idx) => (
              <div key={idx} className="p-5 rounded-2xl bg-slate-900/60 border border-white/5 space-y-4">
                
                {/* Original (Weak) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono-tech uppercase text-red-400 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    Original Text from Resume
                  </span>
                  <p className="text-xs text-slate-400 font-mono-tech italic bg-slate-950/60 p-3 rounded-xl border border-red-500/10">
                    "{bullet.original}"
                  </p>
                </div>

                {/* AI Improved */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono-tech uppercase text-cyan-300 font-bold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                      AI High-Impact Transformation
                    </span>
                    <button
                      onClick={() => handleCopyBullet(bullet.improved, idx)}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono-tech border border-cyan-400/30 transition-all"
                    >
                      {copiedIdx === idx ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied to Clipboard</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy Rewrite</span>
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs font-medium text-white font-mono-tech bg-cyan-950/30 p-3.5 rounded-xl border border-cyan-500/30 leading-relaxed">
                    "{bullet.improved}"
                  </p>
                  {bullet.reason && (
                    <p className="text-[11px] text-cyan-400/80 font-mono-tech pt-1">
                      💡 <strong>Why this works:</strong> {bullet.reason}
                    </p>
                  )}
                </div>

              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Missing Keywords */}
      {data.missing_keywords && data.missing_keywords.length > 0 && (
        <div className="p-8 rounded-3xl glass-card border border-white/10 space-y-4">
          <div className="flex items-center gap-2 text-cyan-400">
            <Tag className="w-5 h-5" />
            <h3 className="text-sm font-bold font-mono-tech uppercase tracking-wide">Recommended Missing ATS Keywords</h3>
          </div>
          <p className="text-xs text-slate-400 font-mono-tech">
            Adding these industry-relevant terms to your experience and skills sections will increase your ATS keyword match index. Click any keyword to copy:
          </p>
          <div className="flex flex-wrap gap-2.5 pt-2">
            {data.missing_keywords.map((kw, idx) => (
              <button
                key={idx}
                onClick={() => handleCopyKeyword(kw)}
                className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 text-xs font-mono-tech border border-cyan-500/30 hover:border-cyan-400 transition-all flex items-center gap-1.5"
              >
                <span>{kw}</span>
                {copiedKeyword === kw ? (
                  <Check className="w-3 h-3 text-emerald-400" />
                ) : (
                  <Copy className="w-3 h-3 text-cyan-400 opacity-60" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ATS & Action Verb Detailed Feedback */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {data.ats_feedback && (
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
            <h3 className="text-sm font-bold font-mono-tech text-white uppercase flex items-center gap-2">
              <Target className="w-4 h-4 text-cyan-400" /> ATS Readability & Formatting
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono-tech bg-slate-900/60 p-4 rounded-xl border border-white/5">
              {data.ats_feedback}
            </p>
          </div>
        )}

        {data.action_verb_feedback && (
          <div className="p-6 rounded-3xl glass-card border border-white/10 space-y-3">
            <h3 className="text-sm font-bold font-mono-tech text-white uppercase flex items-center gap-2">
              <Zap className="w-4 h-4 text-purple-400" /> Action Verb Velocity
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-mono-tech bg-slate-900/60 p-4 rounded-xl border border-white/5">
              {data.action_verb_feedback}
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
