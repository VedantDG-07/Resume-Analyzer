"use client";

import { useTheme } from "next-themes";
import { Moon, Sun, Bell, User } from "lucide-react";
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
    <header className="h-20 flex items-center justify-between px-8 border-b border-border/50 glass-panel sticky top-0 z-10">
      <div className="flex-1" />
      <div className="flex items-center gap-4 relative">
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground relative"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute top-2 left-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </button>
        
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-full hover:bg-white/5 transition-colors text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error" />
          </button>
          
          <AnimatePresence>
            {showNotifications && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-64 glass-card border border-white/10 rounded-2xl p-4 shadow-xl shadow-black/50 z-50"
              >
                <h4 className="text-sm font-semibold text-white mb-2">Notifications</h4>
                <div className="space-y-3">
                  <div className="text-xs text-muted-foreground flex items-center gap-2 pb-2 border-b border-white/5">
                    <div className="w-1.5 h-1.5 rounded-full bg-error" />
                    <span>Your latest resume score is ready!</span>
                  </div>
                  <div className="text-xs text-muted-foreground/60 text-center pt-1">
                    No other new notifications
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <Link href="/dashboard/settings">
          <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white font-medium cursor-pointer shadow-lg shadow-primary/20 ml-2 hover:scale-105 transition-transform overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : user?.fullName ? (
              <span className="text-lg font-bold">{user.fullName.charAt(0).toUpperCase()}</span>
            ) : (
              <User className="h-5 w-5" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
}
