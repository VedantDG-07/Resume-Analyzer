"use client";

import { Sparkles, Lightbulb, ArrowRight, CheckCircle2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { useLatestAnalysis } from "@/lib/useAnalysis";


const suggestions = [
  { id: 1, type: 'impact', title: "Quantify Your Impact", desc: "You mentioned 'Improved sales'. Try changing this to 'Increased regional sales by 24% over 6 months' to give recruiters a concrete metric.", category: "High Priority" },
  { id: 2, type: 'action', title: "Use Stronger Action Verbs", desc: "Replace passive phrases like 'Responsible for managing' with active verbs like 'Directed', 'Orchestrated', or 'Spearheaded'.", category: "Medium Priority" },
  { id: 3, type: 'format', title: "Consistent Date Formatting", desc: "Your dates jump between 'Jan 2020' and '01/2020'. Stick to a single format (e.g., MM/YYYY) for better ATS parsing.", category: "Low Priority" },
];

export default function SuggestionsPage() {
  const { data: latestData, loading: isLoading } = useLatestAnalysis();
  const hasData = !!latestData;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasData) {
    return <EmptyState />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            AI Suggestions <Sparkles className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Actionable feedback to elevate your resume</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {(latestData?.improvements && latestData.improvements.length > 0 ? latestData.improvements.map((desc, idx) => ({ id: idx, title: "Resume Enhancement", desc, category: idx === 0 ? "High Priority" : "Medium Priority" })) : suggestions).map((s, i) => (
          <motion.div 
            key={s.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col md:flex-row gap-6 items-start group hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-3xl rounded-full group-hover:opacity-100 opacity-0 transition-opacity" />
            <div className="p-4 rounded-xl bg-primary/10 text-primary">
              <Lightbulb className="w-6 h-6" />
            </div>
            <div className="flex-1 space-y-2 relative z-10">
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-semibold text-white">{s.title}</h3>
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${s.category === 'High Priority' ? 'bg-red-500/10 text-red-400' : s.category === 'Medium Priority' ? 'bg-yellow-500/10 text-yellow-400' : 'bg-green-500/10 text-green-400'}`}>
                  {s.category}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
            <div className="hidden md:flex items-center self-center relative z-10">
              <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all text-muted-foreground">
                <ChevronRight className="w-5 h-5" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
      
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        className="p-8 rounded-3xl bg-primary/10 border border-primary/20 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div>
          <h3 className="text-xl font-bold text-white mb-2">Want us to fix these for you?</h3>
          <p className="text-primary-foreground/80">Try our AI Resume Rewrite tool to automatically apply these suggestions.</p>
        </div>
        <Link href="/dashboard/rewrite">
          <button className="px-6 py-3 rounded-xl bg-primary text-white font-medium hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-lg shadow-primary/25 whitespace-nowrap">
            Rewrite Resume <ArrowRight className="w-4 h-4" />
          </button>
        </Link>
      </motion.div>
    </div>
  );
}

