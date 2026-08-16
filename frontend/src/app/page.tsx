"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, User, Lock, ArrowRight, CheckCircle2, ShieldCheck, Zap, BarChart2, Target, FileText, Star, Cpu, ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import { useGoogleLogin } from "@react-oauth/google";
import { ScoreRing } from "@/components/ui/ScoreRing";
import { BulletOptimizer } from "@/components/ui/BulletOptimizer";
import { Background } from "@/components/layout/Background";

export default function LandingPage() {
  const router = useRouter();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("password123");
  const [activeTab, setActiveTab] = useState<"before" | "after">("after");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "admin" && password === "password123") {
      setIsLoading(true);
      setError("");

      if (typeof window !== "undefined") {
        localStorage.setItem("authToken", "mock_admin_token");
        localStorage.setItem("user", JSON.stringify({
          id: 0, email: "admin@example.com", fullName: "Admin User", profilePicture: null, provider: "Local"
        }));
      }

      setTimeout(() => {
        router.push("/dashboard");
      }, 800);
    } else {
      setError("Invalid credentials. Try: admin / password123");
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsGoogleLoading(true);
      try {
        const res = await fetch("http://127.0.0.1:8000/api/auth/google", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenResponse.access_token })
        });

        if (!res.ok) throw new Error("Auth failed");

        const data = await res.json();

        if (typeof window !== "undefined") {
          localStorage.setItem("authToken", data.access_token);
          localStorage.setItem("user", JSON.stringify(data.user));
        }
        router.push("/dashboard");
      } catch (err) {
        setError("Failed to authenticate with Google");
        setIsGoogleLoading(false);
      }
    },
    onError: () => {
      setError("Google authentication cancelled");
      setIsGoogleLoading(false);
    }
  });

  return (
    <div className="min-h-screen relative text-slate-100 selection:bg-purple-500/30 selection:text-white">
      <Background />

      {/* Sticky Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl border-b border-white/10 glass-panel">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-cyan-500 to-pink-500 flex items-center justify-center glow-purple group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <span className="font-extrabold text-2xl tracking-tight text-white flex items-center gap-1">
                Resum<span className="gradient-text">AI</span>
              </span>
              <span className="text-[10px] font-mono-tech text-cyan-400 tracking-widest uppercase block -mt-1">
                Pulse Engine 2.0
              </span>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-mono-tech">
            <a href="#features" className="text-slate-300 hover:text-white transition-colors">Features</a>
            <a href="#demo" className="text-slate-300 hover:text-white transition-colors">AI Demo</a>
            <a href="#stats" className="text-slate-300 hover:text-white transition-colors">Results</a>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 text-xs font-mono-tech font-semibold text-slate-200 hover:text-white transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => setShowAuthModal(true)}
              className="gradient-btn-primary px-5 py-2.5 rounded-xl text-xs font-mono-tech font-bold text-white shadow-lg glow-purple flex items-center gap-2"
            >
              Analyze My Resume <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

          {/* Left Column: Headlines & CTAs */}
          <motion.div
            className="lg:col-span-7 space-y-8"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 text-xs font-mono-tech text-cyan-300 glow-purple">
              <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>NEXT-GEN RESUME ATS INTELLIGENCE</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
              AI-Powered Resume <br />
              <span className="gradient-text">Optimization</span> to Land Your Dream Job
            </h1>

            <p className="text-lg text-slate-300 leading-relaxed max-w-2xl">
              Bypass ATS algorithms with instant bullet-point rewrites, keyword density matching, and deep structural feedback powered by precision heuristics.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="gradient-btn-primary px-8 py-4 rounded-2xl text-sm font-mono-tech font-bold text-white shadow-xl glow-purple flex items-center gap-3 text-base"
              >
                <span>Analyze My Resume Free</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="#demo"
                className="px-6 py-4 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-mono-tech font-semibold text-slate-200 transition-all flex items-center gap-2 hover:border-cyan-500/40"
              >
                <span>Try Live Demo</span>
                <ArrowUpRight className="w-4 h-4 text-cyan-400" />
              </a>
            </div>

            {/* Social trust badge */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10 text-xs text-slate-400 font-mono-tech">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Confidential & Secure</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400" />
                <span>PDF & DOCX Support</span>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Floating 3D HUD Score Card */}
          <motion.div
            className="lg:col-span-5 relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            {/* Outer Glow backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-tr from-purple-600/30 to-cyan-500/30 rounded-3xl blur-2xl opacity-50 animate-pulse-glow" />

            <div className="relative glass-card rounded-3xl p-8 border border-white/15 shadow-2xl space-y-6 animate-float">

              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
                  <span className="text-xs font-mono-tech text-slate-300 uppercase tracking-widest">
                    Real-time ATS HUD
                  </span>
                </div>
                <span className="text-xs font-mono-tech px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ResumAI Scan
                </span>
              </div>

              {/* Main Score Ring & HUD metrics */}
              <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-2">
                <ScoreRing
                  score={88}
                  size={150}
                  strokeWidth={12}
                  label="Overall Score"
                  sublabel="TOP 5% APPLICANT"
                  glowColor="purple"
                />

                <div className="space-y-4 w-full sm:w-auto">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex justify-between text-xs font-mono-tech">
                      <span className="text-slate-400">ATS Match</span>
                      <span className="text-cyan-400 font-bold">94%</span>
                    </div>
                    <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[94%] h-full bg-gradient-to-r from-purple-500 to-cyan-400 rounded-full" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex justify-between text-xs font-mono-tech">
                      <span className="text-slate-400">Action Impact</span>
                      <span className="text-emerald-400 font-bold">86%</span>
                    </div>
                    <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[86%] h-full bg-emerald-400 rounded-full" />
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-white/5 space-y-1">
                    <div className="flex justify-between text-xs font-mono-tech">
                      <span className="text-slate-400">Keyword Density</span>
                      <span className="text-purple-400 font-bold">91%</span>
                    </div>
                    <div className="w-36 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className="w-[91%] h-full bg-purple-500 rounded-full" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status pill footer */}
              <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs font-mono-tech text-cyan-300">
                <span>✨ 3 Critical Bullet Fixes Found</span>
                <span className="font-bold underline cursor-pointer hover:text-white" onClick={() => setShowAuthModal(true)}>
                  Fix Now →
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Interactive AI Bullet Optimizer Showcase */}
      <section id="demo" className="py-20 px-6 max-w-6xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl font-extrabold text-white">
            Experience the <span className="gradient-text">Interactive AI Enhancer</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm font-mono-tech">
            Click below to see how ResumAI automatically re-writes passive bullet points into high-impact metric statements.
          </p>
        </div>

        <BulletOptimizer />
      </section>

      {/* Crazy Interactive Feature Grid */}
      <section id="features" className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center space-y-4 mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-mono-tech text-purple-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" />
            ENGINE FEATURES
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Built to Outperform Standard ATS Filters
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

          {/* Card 1 */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">ATS Parsing Check</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Verifies if your layout, headers, and font choices can be properly parsed by Taleo, Workday, and Greenhouse.
            </p>
            <span className="text-[10px] font-mono-tech text-cyan-400 block pt-2">
              → PARSING ACCURACY: 99.4%
            </span>
          </div>

          {/* Card 2 */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <BarChart2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Keyword Gap Analysis</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Compares your resume text against targeted Job Descriptions to highlight missing technical skills and terminology.
            </p>
            <span className="text-[10px] font-mono-tech text-purple-400 block pt-2">
              → MATCH RATE OPTIMIZER
            </span>
          </div>

          {/* Card 3 */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-pink-500/15 border border-pink-500/30 flex items-center justify-center text-pink-400 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Action Verb Enhancer</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Replaces weak verbs with high-velocity action terminology ('Spearheaded', 'Orchestrated', 'Architected').
            </p>
            <span className="text-[10px] font-mono-tech text-pink-400 block pt-2">
              → HEURISTIC REWRITE ENGINE
            </span>
          </div>

          {/* Card 4 */}
          <div className="glass-card glass-card-hover rounded-2xl p-6 border border-white/10 space-y-4 relative group">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white">Instant Export & History</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Store multiple resume versions in your personal dashboard database and track score improvements over time.
            </p>
            <span className="text-[10px] font-mono-tech text-emerald-400 block pt-2">
              → SQLITE PERSISTENCE
            </span>
          </div>

        </div>
      </section>

      {/* Stats Counters */}
      <section id="stats" className="py-16 px-6 border-y border-white/10 bg-slate-950/40">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center font-mono-tech">
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-white gradient-text">100,000+</p>
            <p className="text-xs text-slate-400">Resumes Processed</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-white gradient-text-cyan">94%</p>
            <p className="text-xs text-slate-400">Interview Callback Rate</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-white gradient-text-purple">3.5x</p>
            <p className="text-xs text-slate-400">More Employer Invites</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-400">&lt; 3 Sec</p>
            <p className="text-xs text-slate-400">Analysis Speed</p>
          </div>
        </div>
      </section>

      {/* Auth Modal */}
      <AnimatePresence>
        {showAuthModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-md relative glass-card rounded-3xl p-8 border border-white/15 shadow-2xl glow-purple"
            >
              <button
                onClick={() => setShowAuthModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white text-sm font-mono-tech"
              >
                ✕
              </button>

              <div className="text-center mb-6">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 flex items-center justify-center mx-auto mb-3 glow-purple">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Access ResumAI Dashboard</h3>
                <p className="text-xs text-slate-400 font-mono-tech mt-1">
                  Login with admin bypass or Google OAuth
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                {error && (
                  <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-300 text-xs font-mono-tech text-center">
                    {error}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-mono-tech text-slate-300 ml-1">Username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm font-mono-tech focus:outline-none focus:border-cyan-400"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-mono-tech text-slate-300 ml-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full mt-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-white/10 text-white text-sm font-mono-tech focus:outline-none focus:border-cyan-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl gradient-btn-primary text-white font-mono-tech font-bold text-sm shadow-lg flex items-center justify-center gap-2"
                >
                  {isLoading ? "Logging in..." : "Enter Dashboard (admin / password123)"}
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="relative flex items-center my-2">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="mx-3 text-[10px] font-mono-tech text-slate-500 uppercase">or</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button
                  type="button"
                  onClick={() => googleLogin()}
                  disabled={isGoogleLoading}
                  className="w-full py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono-tech text-xs flex items-center justify-center gap-2 transition-all"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  {isGoogleLoading ? "Connecting..." : "Continue with Google"}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
