"use client";

import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { cn } from "@/lib/utils";

interface HoverCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "purple" | "cyan" | "emerald" | "pink" | "default";
  delay?: number;
}

export function HoverCard({ children, className, glowColor = "default", delay = 0 }: HoverCardProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const glowStyles = {
    purple: "rgba(139, 92, 246, 0.15)",
    cyan: "rgba(6, 182, 212, 0.15)",
    emerald: "rgba(16, 185, 129, 0.15)",
    pink: "rgba(236, 72, 153, 0.15)",
    default: "rgba(255, 255, 255, 0.05)",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ y: -5, scale: 1.01 }}
      className={cn(
        "relative rounded-2xl glass-card overflow-hidden border border-white/10 transition-all duration-300",
        className
      )}
    >
      {isHovered && (
        <div
          className="absolute inset-0 pointer-events-none transition-opacity duration-300"
          style={{
            background: `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${glowStyles[glowColor]}, transparent 40%)`,
          }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}
