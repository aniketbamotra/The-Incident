"use client";

import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

interface Props {
  open: boolean;
  onClose?: () => void;
  title?: string;
  children: React.ReactNode;
  /** Fills the viewport — used for the vote modal and character reveal. */
  fullScreen?: boolean;
  dismissable?: boolean;
}

export function Modal({
  open,
  onClose,
  title,
  children,
  fullScreen,
  dismissable = true,
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && dismissable) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose, dismissable]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4"
          onClick={() => dismissable && onClose?.()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={cn(
              "w-full overflow-y-auto bg-surface border-[0.5px] border-line",
              fullScreen
                ? "h-full rounded-none sm:h-auto sm:max-h-[90vh] sm:max-w-md sm:rounded-[12px]"
                : "max-h-[88vh] max-w-md rounded-t-[16px] sm:rounded-[12px]"
            )}
            onClick={(e) => e.stopPropagation()}
          >
            {title && (
              <div className="border-b-[0.5px] border-line px-5 py-4">
                <h2 className="text-lg font-semibold text-ink">{title}</h2>
              </div>
            )}
            <div className="p-5">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
