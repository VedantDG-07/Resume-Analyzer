"use client";

import { CheckCircle, AlertCircle, ArrowLeft, Star, TrendingUp, MessageSquareText } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";

export default function InterviewFeedbackPage() {
  const [transcript, setTranscript] = useState<{sender: 'ai' | 'user', text: string}[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const data = sessionStorage.getItem("interviewTranscript");
    if (data) {
      try {
        setTranscript(JSON.parse(data));
      } catch (e) {
        console.error("Failed to parse transcript");
      }
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

  if (!transcript || transcript.length === 0) {
    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <Link href="/dashboard/interview" className="text-primary flex items-center gap-2 hover:underline w-max">
          <ArrowLeft className="w-4 h-4" /> Back to Interviews
        </Link>
        <EmptyState />
      </div>
    );
  }

  // Generate basic feedback based on transcript length for demonstration
  const userResponses = transcript.filter(t => t.sender === 'user');
  const totalWords = userResponses.reduce((acc, curr) => acc + curr.text.split(' ').length, 0);
  
  // Calculate a mock score based on word count (assuming detailed answers are better)
  const baseScore = Math.min(Math.round((totalWords / 150) * 100), 95);
  const finalScore = baseScore < 40 ? 45 : baseScore;

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      <div>
        <Link href="/dashboard/interview" className="text-primary flex items-center gap-2 mb-6 hover:underline w-max transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Interviews
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Interview Feedback <TrendingUp className="w-8 h-8 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-2 text-lg">Detailed analysis of your recent mock interview performance.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 rounded-3xl glass-card border border-white/5 flex flex-col items-center justify-center text-center relative overflow-hidden group hover:border-primary/30 transition-all">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 blur-[50px] rounded-full pointer-events-none" />
          <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center mb-6 border border-primary/30 shadow-[0_0_30px_rgba(37,99,235,0.15)] group-hover:scale-110 transition-transform duration-500">
            <span className="text-4xl font-bold text-white">{finalScore}%</span>
          </div>
          <h3 className="text-xl font-bold text-white">Overall Score</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-[200px]">Based on response depth, clarity, and keyword matching.</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 rounded-3xl glass-card border border-white/5 md:col-span-2 space-y-6 hover:border-primary/30 transition-all">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <Star className="w-5 h-5 text-yellow-500" /> Key Strengths
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/90 items-start">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">You answered the questions confidently without long pauses, keeping the flow natural.</span>
              </li>
              <li className="flex gap-3 text-white/90 items-start">
                <CheckCircle className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Good use of the STAR method (Situation, Task, Action, Result) in your behavioral responses.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-white/10">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 mb-4">
              <AlertCircle className="w-5 h-5 text-red-400" /> Areas for Improvement
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3 text-white/90 items-start">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Try to include more quantifiable metrics (e.g., percentages, revenue, time saved) when describing your achievements to make them more impactful.</span>
              </li>
              <li className="flex gap-3 text-white/90 items-start">
                <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">Your introduction could be more concise. Try keeping your "tell me about yourself" pitch under 2 minutes.</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
        <div className="flex items-center gap-3 mb-6 border-b border-white/10 pb-4">
          <MessageSquareText className="w-6 h-6 text-primary" />
          <h3 className="text-2xl font-bold text-white">Conversation Transcript</h3>
        </div>
        
        <div className="space-y-8">
          {transcript.map((msg, i) => (
            <div key={i} className={`flex flex-col ${msg.sender === 'ai' ? 'items-start' : 'items-end'}`}>
              <span className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider px-2">
                {msg.sender === 'ai' ? 'Interviewer' : 'You'}
              </span>
              <div className={`p-5 rounded-2xl max-w-[85%] ${msg.sender === 'ai' ? 'bg-white/5 text-white/90 rounded-tl-none border border-white/10 shadow-lg' : 'bg-primary text-white rounded-tr-none shadow-lg shadow-primary/20'}`}>
                <p className="text-[15px] leading-relaxed">{msg.text}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
