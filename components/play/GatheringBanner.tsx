"use client";

import { motion } from "framer-motion";

export function GatheringBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      style={{ boxShadow: "0 4px 20px rgba(240,165,0,0.15)" }}
      className="flex items-center gap-3 border-b-[0.5px] border-amber/30 bg-amber/[0.08] px-5 py-3"
    >
      <span className="h-2 w-2 shrink-0 animate-pulse-soft rounded-full bg-amber" />
      <p className="flex-1 text-sm text-amber">
        The group is gathering. Go to the main room.
      </p>
      <button
        onClick={onDismiss}
        className="text-[11px] text-amber/70 hover:text-amber"
      >
        I&apos;m there
      </button>
    </motion.div>
  );
}
