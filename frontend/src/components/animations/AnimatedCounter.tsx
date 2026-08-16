"use client";

import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
}

export function AnimatedCounter({ value, duration = 1.5 }: AnimatedCounterProps) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);
  
  useEffect(() => {
    const animation = animate(count, value, { duration, ease: "easeOut" });
    return animation.stop;
  }, [value, count, duration]);

  return <motion.span>{rounded}</motion.span>;
}
