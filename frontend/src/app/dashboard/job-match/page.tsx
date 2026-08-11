"use client";

import { Sparkles, Briefcase, FileSearch, ArrowRight, CheckCircle2, AlertCircle, TrendingUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import EmptyState from "@/components/EmptyState";

export default function JobMatchPage() {
  const [hasData, setHasData] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form State
  const [jobTitle, setJobTitle] = useState("");
  const [jobDesc, setJobDesc] = useState("");
  
  // Scanning State
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'results'>('idle');

  useEffect(() => {
    const data = sessionStorage.getItem("latestAnalysis");
    if (data) {
      setHasData(true);
    }
    setIsLoading(false);
  }, []);

  const handleScan = () => {
    if (!jobDesc.trim()) return; // Don't scan empty description
    
    setScanState('scanning');
    
    // Simulate API call and scanning delay
    setTimeout(() => {
      setScanState('results');
    }, 2500);
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
          Upload Job Description <Briefcase className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Paste a job description to see how well your resume matches.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left Side: Input Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="p-8 rounded-3xl glass-card border border-white/5 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Job Title (Optional)</label>
            <input 
              type="text" 
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g. Senior Frontend Engineer" 
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" 
              disabled={scanState === 'scanning'}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-white/80">Job Description</label>
            <textarea 
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job requirements here..." 
              className="w-full h-48 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
              disabled={scanState === 'scanning'}
            ></textarea>
          </div>
          <button 
            onClick={handleScan}
            disabled={!jobDesc.trim() || scanState === 'scanning'}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-primary"
          >
            {scanState === 'scanning' ? 'Analyzing Resume...' : 'Calculate Match Score'} 
            {!scanState.includes('scanning') && <ArrowRight className="w-5 h-5" />}
          </button>
        </motion.div>

        {/* Right Side: Dynamic State Panel */}
        <div className="relative">
          <AnimatePresence mode="wait">
            
            {/* IDLE STATE */}
            {scanState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl glass-card border border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[400px]"
              >
                <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20" style={{ animationDuration: '3s' }}></div>
                  <FileSearch className="w-12 h-12 text-primary opacity-50" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Awaiting Input</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">Paste a job description on the left to see your personalized match analysis and missing keywords.</p>
                </div>
              </motion.div>
            )}

            {/* SCANNING STATE */}
            {scanState === 'scanning' && (
              <motion.div 
                key="scanning"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl glass-card border border-primary/50 bg-primary/10 flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[400px] relative overflow-hidden"
              >
                {/* Scanning Laser Effect */}
                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 w-full h-1 bg-primary/60 shadow-[0_0_20px_rgba(37,99,235,0.8)] z-0"
                />
                
                <div className="relative z-10 w-32 h-32 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent"
                  />
                  <Sparkles className="w-12 h-12 text-primary animate-pulse" />
                </div>
                
                <div className="relative z-10">
                  <h3 className="text-xl font-bold text-white mb-2">Cross-Referencing Skills</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto animate-pulse">Running semantic analysis on job requirements...</p>
                </div>
              </motion.div>
            )}

            {/* RESULTS STATE */}
            {scanState === 'results' && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="p-8 rounded-3xl glass-card border border-white/10 bg-white/5 flex flex-col h-full space-y-8"
              >
                
                {/* Score Header */}
                <div className="flex items-center gap-6">
                  {/* Progress Ring */}
                  <div className="relative w-28 h-28 flex shrink-0 items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                      <motion.circle 
                        initial={{ strokeDasharray: "0 300" }}
                        animate={{ strokeDasharray: "250 300" }} // Approx 82% of circumference (2 * pi * 48 = 301)
                        transition={{ duration: 1.5, ease: "easeOut" }}
                        cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="12" 
                        className="text-primary drop-shadow-[0_0_10px_rgba(37,99,235,0.6)]"
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-bold text-white">82<span className="text-lg">%</span></span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-1">Strong Match!</h3>
                    <p className="text-sm text-muted-foreground">Your resume covers the core requirements for this role, but there is room for improvement.</p>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* Missing Keywords */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-white flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-400" /> Missing Keywords
                    </h4>
                    <span className="text-xs text-muted-foreground">Impact: High</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {["GraphQL", "AWS", "CI/CD", "Agile", "TypeScript"].map((kw) => (
                      <span key={kw} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm font-medium">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="space-y-3 flex-1">
                  <h4 className="font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-400" /> Recommendations
                  </h4>
                  <div className="space-y-3">
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-white/80"><strong className="text-white">Highlight Cloud Experience:</strong> The JD heavily emphasizes AWS. Try to weave any AWS services you've used into your recent work experience bullets.</p>
                    </div>
                    <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-3 items-start">
                      <CheckCircle2 className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
                      <p className="text-sm text-white/80"><strong className="text-white">Add TypeScript:</strong> While you mentioned Javascript, explicitly listing TypeScript will help you bypass automated ATS filters.</p>
                    </div>
                  </div>
                </div>
                
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
