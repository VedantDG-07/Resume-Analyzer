"use client";

import { Sparkles, Wand2, Copy, Check, ArrowRight } from "lucide-react";
import { useLatestAnalysis } from "@/lib/useAnalysis";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";
import { PremiumButton } from "@/components/animations/PremiumButton";

const MOCK_REWRITES = [
  [
    { verb: "Spearheaded", text: "a cross-functional team of 5 engineers to deliver critical project milestones 2 weeks ahead of schedule." },
    { verb: "Architected and deployed", text: "robust scalable REST APIs using Python and FastAPI, handling 10k+ daily requests." },
    { verb: "Catalyzed", text: "a 24% revenue increase over Q3 by optimizing the checkout flow and reducing latency by 40%." },
    { verb: "Resolved", text: "50+ critical production bugs, increasing overall system stability and reducing downtime by 99%." }
  ],
  [
    { verb: "Mentored and led", text: "a high-performing squad of 5 software developers, improving team velocity by 30% through agile methodologies." },
    { verb: "Engineered", text: "high-throughput backend APIs in Python, decreasing response latency by 200ms for core services." },
    { verb: "Drove", text: "a 15% boost in quarterly sales by implementing a new recommendation engine that increased user conversion." },
    { verb: "Debugged and eliminated", text: "30+ long-standing codebase defects, resulting in a 40% drop in customer support tickets." }
  ],
  [
    { verb: "Directed", text: "a team of 5 software engineers in a fast-paced environment, fostering a culture of continuous integration and code quality." },
    { verb: "Built and maintained", text: "mission-critical backend APIs with Python and Django, supporting over 50,000 active monthly users." },
    { verb: "Accelerated", text: "company revenue growth by 20% year-over-year through strategic feature rollouts and performance tuning." },
    { verb: "Overhauled", text: "legacy codebase by resolving critical issues, which slashed application crash rates by 85%." }
  ]
];

export default function RewritePage() {
  const [copied, setCopied] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [currentRewriteIndex, setCurrentRewriteIndex] = useState(0);

  const { data: latestData, loading: isLoading } = useLatestAnalysis();
  const hasData = !!latestData;

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRewrite = () => {
    setIsRewriting(true);
    setTimeout(() => {
      setCurrentRewriteIndex((prev) => {
        const length = latestData?.bullet_suggestions?.length || MOCK_REWRITES.length;
        return (prev + 1) % length;
      });
      setIsRewriting(false);
    }, 1000);
  };

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
          AI Resume Rewrite <Wand2 className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Transform your bullet points into high-impact achievements.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Original Text */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
          <h3 className="text-lg font-medium text-white px-2">Original Content</h3>
          <div className="p-6 rounded-3xl glass-card border border-white/5 bg-white/5 min-h-[300px]">
            <p className="text-muted-foreground leading-relaxed line-through decoration-red-500/50">
              {latestData?.bullet_suggestions && latestData.bullet_suggestions.length > 0 
                ? latestData.bullet_suggestions[currentRewriteIndex]?.original 
                : "- Responsible for managing a team of 5 developers.\n\n- Worked on the backend API using Python."}
            </p>
          </div>
        </motion.div>

        {/* AI Rewritten Text */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-lg font-medium text-primary flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> AI Rewritten
            </h3>
            <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-muted-foreground hover:text-white transition-colors bg-white/5 px-3 py-1 rounded-full">
              {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <div className="p-6 rounded-3xl glass-card border border-primary/30 bg-primary/5 min-h-[300px] relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full pointer-events-none" />
            {isRewriting ? (
              <div className="flex items-center justify-center h-full absolute inset-0 z-20 bg-primary/5 backdrop-blur-sm">
                 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : null}
            <ul className="text-white leading-relaxed space-y-4 list-disc list-inside relative z-10 marker:text-primary">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentRewriteIndex}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {latestData?.bullet_suggestions && latestData.bullet_suggestions.length > 0 ? (
                    <>
                      <li className="list-none mb-2 font-medium">
                        {latestData.bullet_suggestions[currentRewriteIndex]?.improved.split("").map((char, index) => (
                          <motion.span
                            key={index}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: index * 0.01 }}
                          >
                            {char}
                          </motion.span>
                        ))}
                      </li>
                      <motion.li 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="list-none text-sm text-primary/70 mt-4 border-t border-primary/20 pt-4"
                      >
                        <span className="font-semibold text-primary">Why it's better:</span> {latestData.bullet_suggestions[currentRewriteIndex]?.reason}
                      </motion.li>
                    </>
                  ) : (
                    MOCK_REWRITES[currentRewriteIndex].map((item, i) => (
                      <motion.li 
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                      >
                        <span className="font-semibold">{item.verb}</span> {item.text}
                      </motion.li>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>
            </ul>
          </div>
        </motion.div>
      </div>
      
      <div className="flex justify-center pt-8">
         <PremiumButton 
           variant="primary"
           onClick={handleRewrite}
           disabled={isRewriting}
         >
          {isRewriting ? "Rewriting..." : "Rewrite Another Section"} <Wand2 className="w-4 h-4" />
        </PremiumButton>
      </div>
    </div>
  );
}

