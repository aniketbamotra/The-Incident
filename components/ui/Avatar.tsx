import { cn } from "@/lib/utils";

// Deterministic monogram avatar — no images, derives a hue from the name.
function hueFromString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) % 360;
  return h;
}

const SIZES = {
  sm: "h-7 w-7 text-[11px]",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-base",
};

export function Avatar({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: keyof typeof SIZES;
  className?: string;
}) {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
  const hue = hueFromString(name || "?");

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full border-[0.5px] border-line font-medium text-ink",
        SIZES[size],
        className
      )}
      style={{ backgroundColor: `hsl(${hue} 30% 18%)` }}
    >
      {initials || "?"}
    </span>
  );
}
