"use client";

import { Sparkles, Briefcase, FileSearch, ArrowRight, CheckCircle2, AlertCircle, TrendingUp, ShieldCheck, HelpCircle } from "lucide-react";
import { useLatestAnalysis } from "@/lib/useAnalysis";
import { matchJobDescription, JDMatchResponse } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import EmptyState from "@/components/EmptyState";

export default function JobMatchPage() {
  const [jobTitle, setJobTitle] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'results' | 'error'>('idle');
  const [matchResult, setMatchResult] = useState<JDMatchResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const { data: latestData, loading: isLoading } = useLatestAnalysis();
  const hasData = !!latestData;

  const handleScan = async () => {
    if (!jobDesc.trim()) return;
    
    setScanState('scanning');
    setErrorMessage('');
    
    try {
      const result = await matchJobDescription(jobTitle, jobDesc, latestData?.id);
      setMatchResult(result);
      setScanState('results');
    } catch (err: any) {
      console.error("Job match error:", err);
      setErrorMessage(err.message || "Failed to analyze job description match.");
      setScanState('error');
    }
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

  const score = matchResult ? Math.round(matchResult.match_score) : 0;
  const strokeDash = Math.round((score / 100) * 301);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
          Job Match Engine <Briefcase className="w-6 h-6 text-primary" />
        </h1>
        <p className="text-muted-foreground mt-1">Paste a job description to run deterministic skill extraction, section verification, and 4-tier match scoring.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Side: Input Form */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-5 p-8 rounded-3xl glass-card border border-white/5 space-y-6 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Job Title (Optional)</label>
              <input 
                type="text" 
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="e.g. Senior Machine Learning Engineer" 
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors" 
                disabled={scanState === 'scanning'}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-white/80">Job Description</label>
              <textarea 
                value={jobDesc}
                onChange={(e) => setJobDesc(e.target.value)}
                placeholder="Paste the target job description or requirements here..." 
                className="w-full h-64 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 transition-colors resize-none"
                disabled={scanState === 'scanning'}
              ></textarea>
            </div>
          </div>

          <button 
            onClick={handleScan}
            disabled={!jobDesc.trim() || scanState === 'scanning'}
            className="w-full py-4 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:hover:bg-primary"
          >
            {scanState === 'scanning' ? 'Running Deterministic Skill Matcher...' : 'Calculate Match Score'} 
            {scanState !== 'scanning' && <ArrowRight className="w-5 h-5" />}
          </button>
        </motion.div>

        {/* Right Side: Dynamic State Panel */}
        <div className="lg:col-span-7 relative min-h-[500px]">
          <AnimatePresence mode="wait">
            
            {/* IDLE STATE */}
            {scanState === 'idle' && (
              <motion.div 
                key="idle"
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-8 rounded-3xl glass-card border border-primary/30 bg-primary/5 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[450px]"
              >
                <div className="w-28 h-28 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                  <div className="absolute inset-0 rounded-full border-4 border-primary border-t-transparent animate-spin opacity-20" style={{ animationDuration: '3s' }}></div>
                  <FileSearch className="w-12 h-12 text-primary opacity-60" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Awaiting Job Description</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto">Paste a job description on the left to extract required skills, verify section evidence, and classify matches into 4 precision tiers.</p>
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
                className="p-8 rounded-3xl glass-card border border-primary/50 bg-primary/10 flex flex-col items-center justify-center text-center space-y-8 h-full min-h-[450px] relative overflow-hidden"
              >
                <motion.div 
                  initial={{ top: '-10%' }}
                  animate={{ top: '110%' }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                  className="absolute left-0 w-full h-1 bg-primary/60 shadow-[0_0_20px_rgba(37,99,235,0.8)] z-0"
                />
                
                <div className="relative z-10 w-28 h-28 flex items-center justify-center">
                  <motion.div 
                    animate={{ rotate: 360 }} 
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="absolute inset-0 rounded-full border-[6px] border-primary border-t-transparent"
                  />
                  <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                </div>
                
                <div className="relative z-10 space-y-2">
                  <h3 className="text-xl font-bold text-white">Extracting & Normalizing Skills</h3>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto animate-pulse">Checking section locations, alias maps, and evidence bullets...</p>
                </div>
              </motion.div>
            )}

            {/* ERROR STATE */}
            {scanState === 'error' && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="p-8 rounded-3xl glass-card border border-rose-500/30 bg-rose-500/5 flex flex-col items-center justify-center text-center space-y-6 h-full min-h-[450px]"
              >
                <AlertCircle className="w-12 h-12 text-rose-400" />
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Matching Failed</h3>
                  <p className="text-rose-300 text-sm max-w-xs mx-auto">{errorMessage}</p>
                </div>
                <button 
                  onClick={() => setScanState('idle')} 
                  className="px-6 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-sm transition-colors"
                >
                  Try Again
                </button>
              </motion.div>
            )}

            {/* RESULTS STATE */}
            {scanState === 'results' && matchResult && (
              <motion.div 
                key="results"
                initial={{ opacity: 0, scale: 0.95 }} 
                animate={{ opacity: 1, scale: 1 }} 
                className="p-8 rounded-3xl glass-card border border-white/10 bg-white/5 flex flex-col h-full space-y-6"
              >
                
                {/* Score & Summary Header */}
                <div className="flex items-center gap-6">
                  <div className="relative w-24 h-24 flex shrink-0 items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                      <motion.circle 
                        initial={{ strokeDasharray: "0 300" }}
                        animate={{ strokeDasharray: `${strokeDash} 300` }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="10" 
                        className={`${score >= 80 ? 'text-emerald-400' : score >= 60 ? 'text-amber-400' : 'text-rose-400'} drop-shadow-[0_0_10px_rgba(37,99,235,0.4)]`}
                        strokeLinecap="round"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white">{score}<span className="text-sm">%</span></span>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
                      {score >= 80 ? 'High Match Alignment' : score >= 60 ? 'Moderate Match Alignment' : 'Partial Match Alignment'}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{matchResult.summary}</p>
                  </div>
                </div>

                <div className="w-full h-px bg-white/10" />

                {/* 4-Tier Match Classification Breakdown */}
                <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2 custom-scrollbar">
                  
                  {/* STRONG MATCHES */}
                  {matchResult.strong_matches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4" /> Strong Matches (Evidenced in Experience / Projects)
                      </h4>
                      <div className="space-y-2">
                        {matchResult.strong_matches.map((item) => (
                          <div key={item.skill} className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-100 text-xs space-y-1">
                            <div className="flex items-center justify-between font-semibold text-emerald-200">
                              <span>✅ {item.skill}</span>
                              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300">Found in: {item.locations.join(", ")}</span>
                            </div>
                            {item.evidence.length > 0 && (
                              <p className="text-[11px] text-emerald-200/80 italic font-mono bg-black/20 p-2 rounded border border-emerald-500/10">
                                "{item.evidence[0]}"
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MATCHES */}
                  {matchResult.matches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Present / Listed Matches
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.matches.map((item) => (
                          <span key={item.skill} className="px-3 py-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-200 text-xs font-medium flex items-center gap-1">
                            <span>{item.skill}</span>
                            <span className="text-[10px] opacity-70">({item.locations.join(", ")})</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* WEAK MATCHES */}
                  {matchResult.weak_matches.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                        <HelpCircle className="w-4 h-4" /> Weak / Secondary Matches (Summary/Education only)
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.weak_matches.map((item) => (
                          <span key={item.skill} className="px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs font-medium">
                            ⚠️ {item.skill} ({item.locations.join(", ")})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* MISSING KEYWORDS */}
                  {matchResult.missing_keywords.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-4 h-4" /> Truly Missing Keywords
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missing_keywords.map((kw) => (
                          <span key={kw} className="px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-200 text-xs font-medium">
                            ❌ {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* RECOMMENDATIONS */}
                  {matchResult.recommendations.length > 0 && (
                    <div className="space-y-2 pt-2">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-primary" /> Tailored Recommendations
                      </h4>
                      <div className="space-y-2">
                        {matchResult.recommendations.map((rec, i) => (
                          <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/5 flex gap-2.5 items-start text-xs text-white/90">
                            <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </div>
    </div>
  );
}
