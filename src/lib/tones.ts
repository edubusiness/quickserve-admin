export type Tone = "primary" | "accent" | "success" | "warning" | "danger";

/** CSS var for a tone, used for inline color / gradients. */
export const toneVar: Record<Tone, string> = {
  primary: "var(--primary)",
  accent: "var(--accent)",
  success: "var(--success)",
  warning: "var(--warning)",
  danger: "var(--danger)",
};

/** Soft tinted icon-chip classes per tone. */
export const toneChip: Record<Tone, string> = {
  primary: "bg-[var(--primary)]/15 text-[var(--accent)]",
  accent: "bg-[var(--accent)]/15 text-[var(--accent)]",
  success: "bg-emerald-500/15 text-emerald-400",
  warning: "bg-amber-500/15 text-amber-400",
  danger: "bg-rose-500/15 text-rose-400",
};
