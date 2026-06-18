import { cn } from "@/lib/utils";

type Tone = "neutral" | "green" | "red" | "amber" | "purple";

const TONES: Record<Tone, string> = {
  neutral: "bg-white/[0.06] text-ink-secondary",
  green: "bg-green/[0.12] text-green",
  red: "bg-red/[0.12] text-red",
  amber: "bg-amber/[0.12] text-amber",
  purple: "bg-purple/[0.12] text-purple",
};

export function Badge({
  tone = "neutral",
  children,
  className,
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium tracking-wide",
        TONES[tone],
        className
      )}
    >
      {children}
    </span>
  );
}
