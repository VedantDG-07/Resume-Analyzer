"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ScoreRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  gradientId?: string;
  glowColor?: "cyan" | "purple" | "emerald";
}

export function ScoreRing({
  score,
  size = 140,
  strokeWidth = 10,
  label,
  sublabel,
  gradientId = "scoreGradient",
  glowColor = "cyan"
}: ScoreRingProps) {
  const [displayScore, setDisplayScore] = useState(0);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  useEffect(() => {
    let start = 0;
    const duration = 1500;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start * 10) / 10);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  const glowShadow = 
    glowColor === "purple" 
      ? "drop-shadow(0 0 12px rgba(139, 92, 246, 0.6))"
      : glowColor === "emerald"
      ? "drop-shadow(0 0 12px rgba(16, 185, 129, 0.6))"
      : "drop-shadow(0 0 12px rgba(6, 182, 212, 0.6))";

  return (
    <div className="flex flex-col items-center justify-center relative">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
              {glowColor === "purple" ? (
                <>
                  <stop offset="0%" stopColor="#C084FC" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </>
              ) : glowColor === "emerald" ? (
                <>
                  <stop offset="0%" stopColor="#34D399" />
                  <stop offset="100%" stopColor="#10B981" />
                </>
              ) : (
                <>
                  <stop offset="0%" stopColor="#38BDF8" />
                  <stop offset="50%" stopColor="#06B6D4" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </>
              )}
            </linearGradient>
          </defs>

          {/* Background Track Circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Animated Glowing Score Circle */}
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={`url(#${gradientId})`}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            strokeLinecap="round"
            style={{ filter: glowShadow }}
          />
        </svg>

        {/* Center Text Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span 
            className="text-3xl font-extrabold font-mono-tech tracking-tight text-white"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            {displayScore}
          </motion.span>
          <span className="text-[10px] uppercase font-mono-tech text-slate-400 tracking-wider">
            / 100
          </span>
        </div>
      </div>

      {label && (
        <span className="mt-2 text-sm font-semibold text-slate-200 tracking-wide">
          {label}
        </span>
      )}
      {sublabel && (
        <span className="text-xs text-slate-400 font-mono-tech">
          {sublabel}
        </span>
      )}
    </div>
  );
}
