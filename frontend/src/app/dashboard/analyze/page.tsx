"use client";

import { useEffect, useState } from "react";
import { Sparkles, AlertCircle, FileText, CheckCircle2, TrendingUp, BarChart3, Target } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface AnalysisData {
  id: number;
  filename: string;
  overall_score: number;
  ats_score: number;
  skill_match: number;
  issues_found: number;
  created_at: string;
}

export default function AnalyzePage() {
  const [data, setData] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check sessionStorage for latest analysis
    const stored = sessionStorage.getItem("latestAnalysis");
    if (stored) {
      setData(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center">
          <FileText className="w-12 h-12 text-muted-foreground" />
        </div>
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-white">No Analysis Found</h2>
          <p className="text-muted-foreground">Upload a resume to get started with your first analysis.</p>
        </div>
        <Link 
          href="/dashboard/upload"
          className="py-3 px-8 rounded-xl bg-primary text-white font-semibold shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 transition-all"
        >
          Upload Resume
        </Link>
      </div>
    );
  }

  const ScoreCard = ({ title, score, icon: Icon, color, delay }: { title: string, score: number, icon: any, color: string, delay: number }) => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      className="p-6 rounded-2xl glass-card border border-white/5 relative overflow-hidden group"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${color} opacity-10 blur-3xl rounded-full group-hover:opacity-20 transition-opacity`} />
      <div className="flex justify-between items-start mb-4 relative z-10">
        <div className="p-3 rounded-xl bg-white/5">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <span className="text-3xl font-bold text-white">{score.toFixed(1)}<span className="text-lg text-muted-foreground">/100</span></span>
      </div>
      <div className="relative z-10">
        <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
        <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${score}%` }}
            transition={{ delay: delay + 0.2, duration: 1, ease: "easeOut" }}
            className={`h-full rounded-full ${color.replace('bg-', 'bg-gradient-to-r from-')}-500 to-${color.replace('bg-', '')}-400`}
            style={{ backgroundColor: color === 'bg-blue' ? '#3b82f6' : color === 'bg-green' ? '#22c55e' : color === 'bg-purple' ? '#a855f7' : '#eab308' }}
          />
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            Analysis Results <Sparkles className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1 flex items-center gap-2">
            <FileText className="w-4 h-4" /> {data.filename}
          </p>
        </div>
        <Link 
          href="/dashboard/upload"
          className="py-2 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all flex items-center gap-2"
        >
          Analyze Another
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <ScoreCard title="Overall Score" score={data.overall_score} icon={Target} color="bg-blue" delay={0.1} />
        <ScoreCard title="ATS Compatibility" score={data.ats_score} icon={BarChart3} color="bg-green" delay={0.2} />
        <ScoreCard title="Skill Match" score={data.skill_match} icon={TrendingUp} color="bg-purple" delay={0.3} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <div className="lg:col-span-2 p-8 rounded-3xl glass-card border border-white/5 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-green-400" /> AI Feedback Summary
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <h3 className="font-medium text-white mb-1">Impact & Formatting</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your resume demonstrates good structure. To improve your ATS score further, ensure all dates follow a consistent format (MM/YYYY) and avoid complex tables or graphics that ATS parsers might struggle to read.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/5 border border-white/5">
              <h3 className="font-medium text-white mb-1">Action Verbs</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Try to start more bullet points with strong action verbs (e.g., "Spearheaded", "Optimized", "Engineered") instead of passive phrases (e.g., "Responsible for"). This increases the impact of your achievements.
              </p>
            </div>
          </div>
        </div>

        <div className="p-8 rounded-3xl glass-card border border-white/5 space-y-6 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-red-500/10 blur-3xl rounded-full" />
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-red-400" /> Issues Found
          </h2>
          <div className="flex items-end gap-2">
            <span className="text-6xl font-bold text-white">{data.issues_found}</span>
            <span className="text-muted-foreground mb-2">critical issues</span>
          </div>
          <p className="text-sm text-muted-foreground">
            We found {data.issues_found} potential issues that might be hurting your chances with recruiters and ATS systems.
          </p>
          <Link href="/dashboard/suggestions" className="w-full">
            <button className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium border border-white/10 transition-all flex items-center justify-center gap-2">
              View Details
            </button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
