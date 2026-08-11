"use client";

import { Sparkles, Target, AlertTriangle, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";

export default function SkillsPage() {
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
          Skill Gap Analysis <Target className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Identify missing skills holding you back from your dream roles.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-400" /> Missing Critical Skills
          </h2>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">Docker / Kubernetes</span>
                <span className="text-red-400">0% match</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-red-500 w-0"></div>
              </div>
              <p className="text-xs text-muted-foreground">High demand in your target roles.</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white">AWS / Cloud</span>
                <span className="text-yellow-400">20% match</span>
              </div>
              <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-yellow-500 w-[20%]"></div>
              </div>
              <p className="text-xs text-muted-foreground">Mentioned in passing, needs elaboration.</p>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="p-8 rounded-3xl glass-card border border-primary/30 bg-primary/5 space-y-6">
           <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-400" /> Strong Matches
          </h2>
          <div className="flex flex-wrap gap-3">
            <span className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium border border-green-500/30">React.js</span>
            <span className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium border border-green-500/30">Node.js</span>
            <span className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium border border-green-500/30">TypeScript</span>
            <span className="px-4 py-2 rounded-xl bg-green-500/20 text-green-400 font-medium border border-green-500/30">TailwindCSS</span>
          </div>
          <p className="text-sm text-muted-foreground">You have great coverage of frontend technologies. Consider strengthening your devops knowledge to become a full-stack powerhouse.</p>
        </motion.div>
      </div>
    </div>
  );
}

