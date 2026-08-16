"use client";

import { Sparkles, History, FileText, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useLatestAnalysis } from "@/lib/useAnalysis";
import EmptyState from "@/components/EmptyState";

const history = [
  { id: 1, name: "software_engineer_resume_v2.pdf", date: "Oct 24, 2023", score: 85 },
  { id: 2, name: "frontend_dev_resume.pdf", date: "Oct 15, 2023", score: 72 },
  { id: 3, name: "old_resume_2022.docx", date: "Jan 10, 2023", score: 45 },
];

export default function HistoryPage() {
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
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Analysis History <History className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">View your past resume analysis and track your improvement.</p>
      </div>

      <div className="space-y-4">
        {history.map((item, idx) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-6 rounded-2xl glass-card border border-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/30 transition-all cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-white font-medium">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-auto justify-between md:justify-end">
              <div className="flex flex-col items-end">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className={`font-bold text-lg ${item.score >= 80 ? 'text-green-400' : item.score >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
                  {item.score}/100
                </span>
              </div>
              <button className="text-primary hover:text-white transition-colors">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

