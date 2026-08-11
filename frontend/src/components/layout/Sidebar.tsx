"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
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
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload Resume", href: "/dashboard/upload", icon: UploadCloud },
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
    <aside className="w-72 flex-shrink-0 hidden md:flex flex-col border-r border-border glass-panel">
      <div className="h-20 flex items-center px-8 border-b border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
            <span className="text-white font-bold text-sm">AI</span>
          </div>
          <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">
            Resume Pro
          </span>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 scrollbar-none">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="relative block"
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute inset-0 bg-primary/10 border border-primary/20 rounded-xl"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <div
                className={cn(
                  "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm font-medium",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <item.icon className={cn("w-5 h-5 transition-colors", isActive ? "text-primary" : "text-muted-foreground")} />
                {item.name}
              </div>
            </Link>
          );
        })}
      </nav>
      <div className="p-4 border-t border-border/50">
        {user && (
          <div className="flex items-center gap-3 px-4 py-3 mb-2 rounded-xl bg-white/5 border border-white/5">
            {user.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-10 h-10 rounded-full border border-white/10" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                {user.fullName ? user.fullName.charAt(0) : "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user.fullName}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button 
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 px-4 py-3 w-full rounded-xl transition-all text-sm font-medium text-muted-foreground hover:text-red-400 hover:bg-red-400/10"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}
