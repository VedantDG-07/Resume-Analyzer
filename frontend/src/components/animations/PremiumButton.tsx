"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PremiumButtonProps extends HTMLMotionProps<"button"> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger" | "ghost";
}

export function PremiumButton({ children, className, variant = "primary", ...props }: PremiumButtonProps) {
  const baseStyles = "relative flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-mono-tech text-xs font-bold transition-all overflow-hidden";
  
  const variants = {
    primary: "gradient-btn-primary text-white shadow-lg shadow-purple-500/25 border border-purple-400/30",
    secondary: "bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200",
    danger: "bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400",
    ghost: "bg-transparent hover:bg-white/5 text-slate-300 hover:text-white"
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {/* Ripple/Shine effect on hover */}
      <motion.div
        className="absolute inset-0 bg-white/20 blur-[10px] rounded-xl opacity-0"
        whileHover={{ opacity: 1, scale: 1.2 }}
        transition={{ duration: 0.2 }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}
