"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export function Background() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#0B1220] pointer-events-none">
      {/* Soft Glowing Blue Radial Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full bg-primary/15 blur-[150px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-secondary/15 blur-[150px]" />
      
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Faint neural network abstract lines (SVG pattern) */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.05]">
        <pattern id="neural" width="120" height="120" patternUnits="userSpaceOnUse">
          <circle cx="30" cy="30" r="2.5" fill="white" />
          <circle cx="90" cy="50" r="2.5" fill="white" />
          <circle cx="50" cy="90" r="2.5" fill="white" />
          <line x1="30" y1="30" x2="90" y2="50" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="90" y1="50" x2="50" y2="90" stroke="white" strokeWidth="1" opacity="0.5" />
          <line x1="50" y1="90" x2="30" y2="30" stroke="white" strokeWidth="1" opacity="0.5" />
        </pattern>
        <rect width="100%" height="100%" fill="url(#neural)" />
      </svg>

      {/* Tiny Animated Particles */}
      {Array.from({ length: 30 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/30 rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]"
          initial={{
            x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
            y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
            opacity: Math.random() * 0.5 + 0.2,
            scale: Math.random() * 0.8 + 0.2,
          }}
          animate={{
            y: [null, Math.random() * -100 - 50],
            x: [null, (Math.random() - 0.5) * 50],
            opacity: [null, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.04] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />
    </div>
  );
}
