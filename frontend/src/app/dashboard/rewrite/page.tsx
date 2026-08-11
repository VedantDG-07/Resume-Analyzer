"use client";

import { Sparkles, Wand2, Copy, Check, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";

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
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRewriting, setIsRewriting] = useState(false);
  const [currentRewriteIndex, setCurrentRewriteIndex] = useState(0);

  useEffect(() => {
    const data = sessionStorage.getItem("latestAnalysis");
    if (data) {
      setHasData(true);
    }
    setIsLoading(false);
  }, []);

  const copyToClipboard = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRewrite = () => {
    setIsRewriting(true);
    setTimeout(() => {
      setCurrentRewriteIndex((prev) => (prev + 1) % MOCK_REWRITES.length);
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
              - Responsible for managing a team of 5 developers.<br/><br/>
              - Worked on the backend API using Python.<br/><br/>
              - Helped increase the overall sales of the company.<br/><br/>
              - Fixed bugs and issues in the codebase.
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
              {MOCK_REWRITES[currentRewriteIndex].map((item, i) => (
                <li key={i}><span className="font-semibold">{item.verb}</span> {item.text}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
      
      <div className="flex justify-center pt-8">
         <button 
           onClick={handleRewrite}
           disabled={isRewriting}
           className="px-8 py-3 rounded-xl bg-primary text-white font-medium hover:-translate-y-0.5 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-70 disabled:hover:translate-y-0"
         >
          {isRewriting ? "Rewriting..." : "Rewrite Another Section"} <Wand2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

