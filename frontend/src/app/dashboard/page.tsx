"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { UploadCloud, CheckCircle, AlertTriangle, Sparkles, Target, BarChart, History } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

// Animated counter component
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
    overall: 0,
    ats: 0,
    skill: 0,
    issues: 0
  });

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem("latestAnalysis");
      if (stored) {
        const data = JSON.parse(stored);
        setStats({
          overall: data.overall_score || 0,
          ats: data.ats_score || 0,
          skill: data.skill_match || 0,
          issues: data.issues_found || 0
        });
      }
    } catch (err) {
      console.error("Failed to parse local stats", err);
    }
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Welcome Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-8 rounded-3xl glass-card relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            <span>AI Powered Analysis</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">AI Resume Analyzer</h1>
          <div className="flex flex-wrap gap-4 pt-2">
            <Link href="/dashboard/upload">
              <button className="px-6 py-3 rounded-xl bg-primary text-white font-medium shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all hover:-translate-y-0.5 relative overflow-hidden group">
                <span className="relative z-10">Upload Resume</span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </button>
            </Link>
            <Link href="/dashboard/job-match">
              <button className="px-6 py-3 rounded-xl glass-panel text-white font-medium hover:bg-white/5 transition-all hover:-translate-y-0.5">
                Match Job Description
              </button>
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Overall Score", value: stats.overall, suffix: "/100", icon: CheckCircle, color: "text-success", stroke: "#22C55E", bg: "bg-success/10", border: "border-success/20" },
          { label: "ATS Compatibility", value: stats.ats, suffix: "%", icon: Target, color: "text-primary", stroke: "#2563EB", bg: "bg-primary/10", border: "border-primary/20" },
          { label: "Skill Match", value: stats.skill, suffix: "%", icon: BarChart, color: "text-secondary", stroke: "#06B6D4", bg: "bg-secondary/10", border: "border-secondary/20" },
          { label: "Issues Found", value: stats.issues, suffix: "", icon: AlertTriangle, color: "text-warning", stroke: "#F59E0B", bg: "bg-warning/10", border: "border-warning/20" },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 + 0.2 }}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl glass-card flex items-center justify-between group hover:border-white/20 transition-all shadow-lg"
          >
            <div>
              <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
              <h2 className="text-3xl font-bold mt-2 text-white flex items-baseline">
                <AnimatedCounter value={stat.value} />
                <span className="text-xl ml-1 opacity-70">{stat.suffix}</span>
              </h2>
            </div>
            <div className={`relative flex items-center justify-center p-3 rounded-full ${stat.bg}`}>
              <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/5" />
                <motion.circle
                  cx="50"
                  cy="50"
                  r="45"
                  fill="none"
                  stroke={stat.stroke}
                  strokeWidth="4"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: stat.value / 100 }}
                  transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
                />
              </svg>
              <stat.icon className={`w-8 h-8 ${stat.color} relative z-10`} />
            </div>
          </motion.div>
        ))}
      </div>

      {/* Upload & History */}
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => { e.preventDefault(); setIsDragging(false); }}
          className={`relative p-8 rounded-3xl glass-card border flex flex-col justify-center items-center text-center group cursor-pointer transition-all duration-300 ${
            isDragging ? "border-primary bg-primary/5 scale-[1.02]" : "hover:border-primary/50 hover:-translate-y-1 shadow-lg"
          }`}
        >
          {/* Animated dashed border */}
          <div className="absolute inset-4 rounded-2xl border-2 border-dashed border-white/10 group-hover:border-primary/30 transition-colors pointer-events-none" />
          
          <motion.div 
            className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6"
            animate={isDragging ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
          >
            <UploadCloud className="w-10 h-10 text-primary" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-2 text-white">Drag & Drop Resume</h3>
          <p className="text-muted-foreground mb-6 max-w-sm">or click <span className="text-primary font-medium">Browse Files</span><br/>Supports PDF and DOCX</p>
          <Link href="/dashboard/upload">
            <button className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-all cursor-pointer shadow-lg active:scale-95">
              Browse Files
            </button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
          className="p-8 rounded-3xl glass-card flex flex-col h-[350px]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Recent Analyses</h3>
            <Link href="/dashboard/history" className="text-sm text-primary hover:underline font-medium">View all</Link>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center text-center bg-white/5 rounded-2xl border border-white/5">
            <motion.div 
              whileHover={{ rotate: -15, scale: 1.1 }}
              className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 cursor-pointer"
            >
              <History className="w-8 h-8 text-muted-foreground" />
            </motion.div>
            <p className="text-muted-foreground max-w-xs">No recent analyses found. Upload a resume to see your history here.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
