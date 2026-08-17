"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { MagneticWrapper } from "@/components/animations/MagneticWrapper";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  UploadCloud,
  FileText,
  Target,
  BarChart,
  Lightbulb,
  Edit3,
  Briefcase,
  Mic,
  PieChart,
  History,
  Settings,
  LogOut,
  Sparkles,
  Zap
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, badge: "Live" },
  { name: "Upload Resume", href: "/dashboard/upload", icon: UploadCloud, highlight: true },
  { name: "Upload JD", href: "/dashboard/job-match", icon: Briefcase },
  { name: "Analysis", href: "/dashboard/analyze", icon: FileText },
  { name: "ATS Score", href: "/dashboard/ats", icon: Target },
  { name: "Skill Gap", href: "/dashboard/skills", icon: BarChart },
  { name: "AI Suggestions", href: "/dashboard/suggestions", icon: Lightbulb },
  { name: "Rewrite", href: "/dashboard/rewrite", icon: Edit3 },
  { name: "Interview Prep", href: "/dashboard/interview", icon: Mic },
  { name: "Reports", href: "/dashboard/reports", icon: PieChart },
  { name: "History", href: "/dashboard/history", icon: History },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    import("@/lib/auth").then((mod) => {
      setUser(mod.getUser());
    });
  }, []);

  const handleLogout = async () => {
    const mod = await import("@/lib/auth");
    mod.logout();
  };

  return (
    <aside className="w-72 flex-shrink-0 hidden md:flex flex-col border-r border-white/10 glass-panel">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-white/10">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 via-cyan-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white flex items-center gap-1">
              Resume <span className="gradient-text">Analyzer</span>
            </span>
            <span className="text-[10px] font-mono-tech text-cyan-400 block tracking-widest uppercase">
              PULSE v2.0
            </span>
          </div>
        </Link>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <MagneticWrapper key={item.name} className="block">
              <Link
                href={item.href}
                className="relative block group"
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 bg-gradient-to-r from-purple-600/30 to-cyan-500/20 border border-purple-500/40 rounded-xl glow-purple"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <div
                  className={cn(
                    "relative flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 text-sm font-medium overflow-hidden",
                    isActive
                      ? "text-white font-bold"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400, damping: 10 }}
                    >
                      <item.icon className={cn("w-4 h-4 transition-colors", isActive ? "text-cyan-400" : "text-slate-400 group-hover:text-cyan-300")} />
                    </motion.div>
                    <span className="font-mono-tech text-xs tracking-wide">{item.name}</span>
                  </div>

                  {item.highlight && !isActive && (
                    <span className="text-[10px] font-mono-tech px-2 py-0.5 rounded-full bg-gradient-to-r from-purple-500 to-cyan-500 text-white font-bold animate-pulse">
                      AI
                    </span>
                  )}
                  {item.badge && isActive && (
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                  )}
                </div>
              </Link>
            </MagneticWrapper>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-white/10 bg-slate-950/40">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2.5 mb-2 rounded-xl bg-white/5 border border-white/10">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-9 h-9 rounded-full border border-purple-500/50" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center text-white font-bold text-sm">
                {user.fullName ? user.fullName.charAt(0) : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.fullName || "Pro User"}</p>
              <p className="text-[10px] font-mono-tech text-cyan-400 truncate">PRO ACCOUNT</p>
            </div>
          </div>
        )}

        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-4 py-2 w-full rounded-xl transition-all text-xs font-mono-tech text-slate-400 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
        >
          <LogOut className="w-4 h-4" />
          Logout Session
        </button>
      </div>
    </aside>
  );
}
