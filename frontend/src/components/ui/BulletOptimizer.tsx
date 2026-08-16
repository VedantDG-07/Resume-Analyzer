"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Check, Copy, ArrowRight, RefreshCw, Zap } from "lucide-react";

interface SampleBullet {
  id: number;
  role: string;
  original: string;
  enhanced: string;
  metricsAdded: string;
}

const SAMPLE_BULLETS: SampleBullet[] = [
  {
    id: 1,
    role: "Full Stack Developer",
    original: "Built a web app for user authentication and stored data in database.",
    enhanced: "Architected scalable OAuth 2.0 auth system & PostgreSQL pipeline, reducing login latency by 42% and serving 50k+ active users.",
    metricsAdded: "+42% speed improvement, 50k+ users metrics"
  },
  {
    id: 2,
    role: "Product Manager",
    original: "Managed team meetings and tracked project tasks every week.",
    enhanced: "Spearheaded Agile cross-functional sprints across 8 engineers, boosting on-time feature delivery from 65% to 94%.",
    metricsAdded: "Quantified throughput & delivery rate"
  },
  {
    id: 3,
    role: "Data Analyst",
    original: "Analyzed customer data and created charts for management.",
    enhanced: "Engineered automated Tableau dashboards analyzing \$1.2M customer transactions, identifying churn drivers to boost retention by 18%.",
    metricsAdded: "\$1.2M business impact & +18% retention"
  }
];

export function BulletOptimizer() {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const current = SAMPLE_BULLETS[selectedIdx];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.enhanced);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setSelectedIdx((prev) => (prev + 1) % SAMPLE_BULLETS.length);
      setIsOptimizing(false);
    }, 600);
  };

  return (
    <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/10">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center glow-purple">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              AI Bullet Point Optimizer
              <span className="text-[10px] uppercase font-mono-tech px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Live AI Enhancer
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Transform passive descriptions into high-impact action bullets
            </p>
          </div>
        </div>

        <button
          onClick={handleReOptimize}
          disabled={isOptimizing}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-mono-tech text-cyan-400 border border-cyan-500/30 transition-all hover:glow-cyan"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isOptimizing ? "animate-spin" : ""}`} />
          Try Another Role
        </button>
      </div>

      {/* Before / After Container */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-4"
        >
          {/* Before Card */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-red-500/20 relative">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono-tech uppercase text-red-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                Original Bullet (Weak)
              </span>
              <span className="text-[11px] font-mono-tech text-slate-500">
                Score: 45/100
              </span>
            </div>
            <p className="text-sm text-slate-300 italic font-mono-tech">
              "{current.original}"
            </p>
            <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-2 text-[11px] text-red-400/80">
              ⚠️ Missing action verbs & quantifiable results
            </div>
          </div>

          {/* After Card (AI Enhanced) */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-purple-900/40 via-cyan-900/20 to-slate-900/80 border border-cyan-500/40 relative glow-cyan">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono-tech uppercase text-cyan-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                AI High-Impact Revision
              </span>
              <span className="text-xs font-mono-tech text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                Score: 96/100 (+51 pts)
              </span>
            </div>

            <p className="text-sm text-white font-medium font-mono-tech leading-relaxed">
              "{current.enhanced}"
            </p>

            <div className="mt-3 pt-2 border-t border-cyan-500/20 flex items-center justify-between">
              <span className="text-[11px] text-cyan-300 flex items-center gap-1 font-mono-tech">
                ✨ {current.metricsAdded}
              </span>
              
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 text-xs font-mono-tech border border-cyan-400/30 transition-all"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copy Bullet
                  </>
                )}
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Role Dots Selector */}
      <div className="mt-4 flex items-center justify-center gap-2">
        {SAMPLE_BULLETS.map((item, idx) => (
          <button
            key={item.id}
            onClick={() => setSelectedIdx(idx)}
            className={`h-2 rounded-full transition-all ${
              idx === selectedIdx
                ? "w-8 bg-gradient-to-r from-purple-500 to-cyan-400"
                : "w-2 bg-white/20 hover:bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
