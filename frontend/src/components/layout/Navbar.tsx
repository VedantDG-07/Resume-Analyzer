"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, User, Zap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const [showNotifications, setShowNotifications] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    import("@/lib/auth").then((mod) => {
      setUser(mod.getUser());
    });
  }, []);

  return (
    <header className="h-20 flex items-center justify-between px-8 border-b border-white/10 glass-panel sticky top-0 z-40 backdrop-blur-xl">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-xs font-mono-tech text-cyan-300">
          <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>AI ENGINE ACTIVE</span>
        </div>
      </div>

      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white border border-white/5 relative"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-2 left-2 h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl hover:bg-white/10 transition-colors text-slate-400 hover:text-white border border-white/5"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-3 w-72 glass-card border border-white/10 rounded-2xl p-4 shadow-2xl z-50 glow-purple"
              >
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                  <h4 className="text-xs font-mono-tech uppercase text-white font-bold flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Notifications
                  </h4>
                  <span className="text-[10px] font-mono-tech text-cyan-400">1 New</span>
                </div>
                <div className="space-y-3">
                  <div className="text-xs text-slate-300 flex items-start gap-2.5 p-2 rounded-lg bg-white/5 border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 mt-1 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-white">Analysis Ready!</p>
                      <p className="text-[11px] text-slate-400">Your latest resume scored 88/100 ATS match.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/dashboard/settings">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-purple-600 to-cyan-500 p-[1px] cursor-pointer hover:scale-105 transition-transform glow-purple">
            <div className="w-full h-full rounded-[11px] bg-slate-900 flex items-center justify-center overflow-hidden">
              {user?.profilePicture ? (
                <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : user?.fullName ? (
                <span className="text-sm font-bold text-white font-mono-tech">{user.fullName.charAt(0).toUpperCase()}</span>
              ) : (
                <User className="h-4 w-4 text-cyan-400" />
              )}
            </div>
          </div>
        </Link>
      </div>
    </header>
  );
}
