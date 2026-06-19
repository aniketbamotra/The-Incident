"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "ghost" | "green" | "red" | "redOutline" | "purple";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-white text-black hover:bg-white/90 disabled:bg-white/40 disabled:text-black/50",
  ghost:
    "bg-transparent text-ink-secondary hover:text-ink hover:bg-white/[0.04] hairline",
  green: "bg-green text-white hover:bg-green/90",
  red: "bg-red text-white hover:bg-red/90",
  redOutline:
    "bg-transparent text-red hover:bg-red/[0.08] border-[0.5px] border-red/50",
  purple: "bg-purple text-white hover:bg-purple/90",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm rounded-[10px]",
  md: "h-11 px-5 text-sm rounded-[10px]",
  lg: "h-12 px-6 text-base rounded-[12px]",
};

interface Props extends HTMLMotionProps<"button"> {
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  disabled,
  ...props
}: Props) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{ duration: 0.08 }}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center gap-2 font-medium transition-colors",
        "disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none",
        VARIANTS[variant],
        SIZES[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    />
  );
}
