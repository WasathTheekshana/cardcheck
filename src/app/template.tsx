"use client";

import { MotionConfig, motion } from "motion/react";

/** A template remounts on every navigation, which is what lets each page fade in. */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.2, 0.7, 0.2, 1] }}
      >
        {children}
      </motion.div>
    </MotionConfig>
  );
}
