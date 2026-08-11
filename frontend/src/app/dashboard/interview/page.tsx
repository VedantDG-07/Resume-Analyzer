"use client";

import { Sparkles, MessageSquare, UserCircle, PlayCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

const questions = [
  { id: 1, category: "Experience", q: "Can you elaborate on how you optimized the checkout flow to reduce latency by 40%?" },
  { id: 2, category: "Technical", q: "What challenges did you face while architecting the REST APIs using FastAPI?" },
  { id: 3, category: "Behavioral", q: "Tell me about a time you spearheaded a cross-functional team and faced resistance." },
];

export default function InterviewPage() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("latestAnalysis");
    if (data) {
      setHasData(true);
    }
    setIsLoading(false);
  }, []);

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
          AI Interview Prep <MessageSquare className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Practice tailored interview questions based on your resume.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {questions.map((q, i) => (
            <motion.div 
              key={q.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              className="p-6 rounded-3xl glass-card border border-white/5 space-y-4 group hover:border-primary/30 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-full bg-primary/10 text-primary">
                  <UserCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-medium px-2 py-1 bg-white/5 rounded-full text-white/70 border border-white/10">
                  {q.category} Question
                </span>
              </div>
              <p className="text-lg text-white font-medium pl-14">
                "{q.q}"
              </p>
              <div className="pl-14 pt-2">
                <Link href="/dashboard/interview/session" className="text-sm font-medium text-primary hover:text-white transition-colors flex items-center gap-2">
                  <PlayCircle className="w-4 h-4" /> Practice Answer
                </Link>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="space-y-6">
          <div className="p-8 rounded-3xl glass-card border border-white/5 relative overflow-hidden text-center flex flex-col items-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 relative z-10">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 relative z-10">Mock Interview</h3>
            <p className="text-muted-foreground text-sm mb-6 relative z-10">
              Start a realistic, voice-based AI mock interview session tailored to your exact profile.
            </p>
            <Link href="/dashboard/interview/session" className="w-full relative z-10">
              <button className="w-full py-3 px-4 rounded-xl bg-primary text-white font-medium hover:-translate-y-0.5 transition-all shadow-lg shadow-primary/25">
                Start Session
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

