"use client";

import { Sparkles, MessageSquare, UserCircle, PlayCircle, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";
import { useLatestAnalysis } from "@/lib/useAnalysis";

type QuestionType = "resume_project" | "technical" | "job_role";

interface QuestionItem {
  type: QuestionType;
  question: string;
  reason: string;
}

export default function InterviewPage() {
  const { data: latestData, loading: isLoading } = useLatestAnalysis();
  const hasData = !!latestData;

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    if (!latestData?.id) return;
    
    setIsGenerating(true);
    setError(null);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("authToken") : null;
      const headers: Record<string, string> = {
        "Content-Type": "application/json"
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch("http://127.0.0.1:8000/api/interview/generate", {
        method: "POST",
        headers,
        body: JSON.stringify({ analysis_id: latestData.id }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate questions. Please try again.");
      }

      const data = await response.json();
      if (data.questions && data.questions.length === 3) {
        setQuestions(data.questions);
      } else {
        throw new Error("Invalid response format from server.");
      }
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsGenerating(false);
    }
  };

  useEffect(() => {
    if (hasData && questions.length === 0 && !isGenerating && !error) {
      fetchQuestions();
    }
  }, [hasData, latestData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!hasData) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            AI Interview Prep <MessageSquare className="w-6 h-6 text-primary" />
          </h1>
          <p className="text-muted-foreground mt-1">Personalized interview questions based on your resume and target role.</p>
        </div>
        <div className="p-8 rounded-3xl glass-card border border-white/5 flex flex-col items-center justify-center text-center">
           <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
           <h3 className="text-xl font-medium text-white mb-2">Please upload your resume first to generate personalized interview questions.</h3>
           <Link href="/dashboard/upload">
             <button className="mt-4 px-6 py-2 bg-primary text-white rounded-xl font-medium hover:bg-primary/90 transition">
                Go to Upload
             </button>
           </Link>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (type: string) => {
    switch(type) {
      case "resume_project": return "RESUME / PROJECT";
      case "technical": return "TECHNICAL";
      case "job_role": return "JOB / ROLE";
      default: return type.toUpperCase();
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          AI Interview Prep <MessageSquare className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Personalized interview questions based on your resume and target role.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          
          <AnimatePresence mode="wait">
            {isGenerating ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 space-y-4"
              >
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground animate-pulse">Analyzing profile and crafting personalized questions...</p>
              </motion.div>
            ) : error ? (
              <motion.div 
                key="error"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-6 rounded-3xl bg-red-500/10 border border-red-500/20 text-center space-y-4"
              >
                <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
                <p className="text-red-200">{error}</p>
                <button 
                  onClick={fetchQuestions}
                  className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 rounded-lg transition"
                >
                  Retry Generation
                </button>
              </motion.div>
            ) : (
              <motion.div key="questions" className="space-y-6">
                {questions.map((q, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.15 }}
                    className="p-6 rounded-3xl glass-card border border-white/5 space-y-4 group hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-primary/10 text-primary">
                          <UserCircle className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-bold tracking-wider px-3 py-1 bg-white/5 rounded-full text-primary border border-primary/20">
                          {getCategoryLabel(q.type)}
                        </span>
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Question 0{i + 1}</span>
                    </div>
                    
                    <p className="text-lg text-white font-medium pl-14">
                      {q.question}
                    </p>
                    
                    <div className="pl-14 pt-2">
                      <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2">
                        <p className="text-xs font-semibold text-primary uppercase tracking-wider">Why this question?</p>
                        <p className="text-sm text-muted-foreground italic">"{q.reason}"</p>
                      </div>
                    </div>
                  </motion.div>
                ))}

                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                  className="flex justify-center pt-4"
                >
                  <button 
                    onClick={fetchQuestions}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-all"
                  >
                    <RefreshCw className="w-4 h-4" /> Generate New Questions
                  </button>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

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

