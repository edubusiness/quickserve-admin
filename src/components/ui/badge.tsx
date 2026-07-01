import { cn } from "@/lib/utils";

const tones = {
  success: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/25",
  warning: "bg-amber-500/15 text-amber-400 ring-amber-500/25",
  danger: "bg-rose-500/15 text-rose-400 ring-rose-500/25",
  info: "bg-sky-500/15 text-sky-400 ring-sky-500/25",
  primary: "bg-[var(--primary)]/15 text-[var(--accent)] ring-[var(--primary)]/25",
  neutral: "bg-muted-foreground/10 text-muted-foreground ring-muted-foreground/20",
} as const;

export type BadgeTone = keyof typeof tones;

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: BadgeTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
