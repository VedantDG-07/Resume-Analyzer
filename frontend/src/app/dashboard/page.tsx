"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { UploadCloud, CheckCircle, AlertTriangle, Sparkles, Target, BarChart, History, ArrowRight, Zap, RefreshCw, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BulletOptimizer } from "@/components/ui/BulletOptimizer";

function AnimatedCounter({ value }: { value: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    const animation = animate(count, value, { duration: 1.5, ease: "easeOut" });
    return animation.stop;
  }, [value, count]);

  return <motion.span>{rounded}</motion.span>;
}

export default function DashboardPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [stats, setStats] = useState({
    overall: 85,
    ats: 92,
    skill: 78,
    issues: 3
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("latestAnalysis");
      if (stored) {
        const data = JSON.parse(stored);
        setStats({
          overall: data.overall_score || 85,
          ats: data.ats_score || 92,
          skill: data.skill_match || 78,
          issues: data.issues_found || 3
        });
      }
    } catch (err) {
      console.error("Failed to parse local stats", err);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8 font-sans text-slate-100">
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 p-8 rounded-3xl glass-card relative overflow-hidden border border-white/10 glow-purple"
      >
        <div className="absolute -top-10 -right-10 w-72 h-72 bg-gradient-to-tr from-purple-600/30 to-cyan-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-mono-tech">
            <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>PULSE HUD ENGINE ONLINE</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Resume Intelligence Dashboard
          </h1>
          <p className="text-slate-300 text-sm">
            Analyze your resume against ATS filters, generate high-impact bullet point rewrites, and optimize target keywords.
          </p>

          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard/upload">
              <button className="gradient-btn-primary px-6 py-3 rounded-xl text-xs font-mono-tech font-bold text-white shadow-lg glow-purple flex items-center gap-2">
                <UploadCloud className="w-4 h-4" />
                Upload New Resume
              </button>
            </Link>
            <Link href="/dashboard/job-match">
              <button className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono-tech font-semibold text-slate-200 transition-all flex items-center gap-2">
                <Target className="w-4 h-4 text-cyan-400" />
                Match Job Description
              </button>
            </Link>
          </div>
        </div>

        {/* Quick HUD Overall Ring */}
        <div className="relative z-10 flex items-center justify-center p-4 rounded-2xl bg-slate-900/60 border border-white/10">
          <ScoreRing score={stats.overall} size={130} strokeWidth={10} label="Overall Score" sublabel="HIGH MATCH" glowColor="purple" />
        </div>
      </motion.div>

      {/* Stats Cards Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Overall Resume Score", value: stats.overall, suffix: "/100", icon: CheckCircle, color: "text-purple-400", glow: "glow-purple" },
          { label: "ATS Compatibility", value: stats.ats, suffix: "%", icon: Target, color: "text-cyan-400", glow: "glow-cyan" },
          { label: "Skill Gap Match Rate", value: stats.skill, suffix: "%", icon: BarChart, color: "text-emerald-400", glow: "" },
          { label: "Critical Fixes Needed", value: stats.issues, suffix: " items", icon: AlertTriangle, color: "text-pink-400", glow: "" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.1 }}
            className={`p-6 rounded-2xl glass-card border border-white/10 flex items-center justify-between group hover:border-cyan-500/40 transition-all ${stat.glow}`}
          >
            <div>
              <p className="text-xs font-mono-tech uppercase text-slate-400 tracking-wider">{stat.label}</p>
              <h2 className="text-3xl font-extrabold mt-2 text-white font-mono-tech flex items-baseline">
                <AnimatedCounter value={stat.value} />
                <span className="text-sm font-normal text-slate-400 ml-1">{stat.suffix}</span>
              </h2>
            </div>

            <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Interactive AI Bullet Optimizer */}
      <BulletOptimizer />

      {/* Upload Zone & History Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        
        {/* Upload Card with Scanner */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={`relative p-8 rounded-3xl glass-card border flex flex-col justify-center items-center text-center group cursor-pointer transition-all duration-300 overflow-hidden ${
            isDragging ? "border-cyan-400 bg-cyan-500/10 scale-[1.02]" : "border-white/10 hover:border-purple-500/50"
          }`}
        >
          {/* Scanning Beam */}
          <div className="scanner-beam" />

          {/* Animated dashed border */}
          <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-white/10 group-hover:border-cyan-400/40 transition-colors pointer-events-none" />
          
          <motion.div 
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center mb-4 glow-cyan"
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          >
            <UploadCloud className="w-8 h-8 text-white" />
          </motion.div>

          <h3 className="text-xl font-bold mb-2 text-white">Drag & Drop Resume File</h3>
          <p className="text-xs text-slate-400 mb-6 max-w-sm font-mono-tech">
            Drop your latest resume file to run heuristic scoring and ATS analysis.<br/>
            Supported Formats: <span className="text-cyan-300 font-bold">.PDF, .DOCX</span>
          </p>

          <Link href="/dashboard/upload">
            <button className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/15 text-xs font-mono-tech text-cyan-300 hover:bg-white/10 hover:border-cyan-400 transition-all shadow-lg active:scale-95 flex items-center gap-2">
              <span>Browse Local File</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </motion.div>

        {/* History / Recent Analyses Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-3xl glass-card border border-white/10 flex flex-col justify-between"
        >
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono-tech uppercase text-white">Recent Analyses</h3>
            </div>
            <Link href="/dashboard/history" className="text-xs font-mono-tech text-cyan-400 hover:underline">
              View Database →
            </Link>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 bg-slate-900/60 rounded-2xl border border-white/5">
            <FileText className="w-10 h-10 text-slate-500 mb-3" />
            <p className="text-xs text-slate-400 font-mono-tech">
              Recent resume uploads and database history will be logged here automatically.
            </p>
            <Link href="/dashboard/upload" className="mt-4">
              <button className="px-4 py-2 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono-tech border border-cyan-500/30">
                Run First Analysis
              </button>
            </Link>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
