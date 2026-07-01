"use client";

import { motion } from "framer-motion";
import { Check, Moon, Sun, RotateCcw, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Card, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/types";

const themes: {
  name: ThemeName;
  label: string;
  desc: string;
  tokens: { primary: string; secondary: string; bg: string; card: string; accent: string };
}[] = [
  {
    name: "blue",
    label: "Professional Blue",
    desc: "Calm, trustworthy, enterprise default.",
    tokens: { primary: "#2563EB", secondary: "#1E40AF", bg: "#0F172A", card: "#1E293B", accent: "#3B82F6" },
  },
  {
    name: "purple",
    label: "Royal Purple",
    desc: "Premium, bold, creative energy.",
    tokens: { primary: "#7C3AED", secondary: "#5B21B6", bg: "#111827", card: "#1F2937", accent: "#A855F7" },
  },
  {
    name: "emerald",
    label: "Emerald Green",
    desc: "Fresh, growth-focused, vibrant.",
    tokens: { primary: "#059669", secondary: "#047857", bg: "#071A12", card: "#0F2D22", accent: "#10B981" },
  },
];

function ThemePreview({ tokens }: { tokens: (typeof themes)[number]["tokens"] }) {
  return (
    <div
      className="relative h-28 overflow-hidden rounded-xl p-3"
      style={{ background: tokens.bg }}
    >
      <div className="flex gap-2">
        <div className="h-full w-1/4 rounded-lg" style={{ background: tokens.card }}>
          <div className="m-1.5 h-2 w-2 rounded-full" style={{ background: tokens.primary }} />
          <div className="mx-1.5 mt-2 h-1 rounded" style={{ background: tokens.accent, opacity: 0.6 }} />
          <div className="mx-1.5 mt-1.5 h-1 rounded" style={{ background: tokens.accent, opacity: 0.4 }} />
        </div>
        <div className="flex-1 space-y-2">
          <div className="flex gap-2">
            <div className="h-9 flex-1 rounded-lg" style={{ background: tokens.card }} />
            <div className="h-9 flex-1 rounded-lg" style={{ background: tokens.card }} />
          </div>
          <div className="h-8 rounded-lg" style={{ background: `linear-gradient(90deg, ${tokens.primary}, ${tokens.secondary})` }} />
        </div>
      </div>
    </div>
  );
}

export default function AppearancePage() {
  const { theme, mode, setTheme, setMode, reset } = useTheme();

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-card-foreground">
            <Palette className="h-5 w-5 text-[var(--accent)]" />
            Appearance & Theme
          </h1>
          <p className="text-sm text-muted-foreground">
            Personalize the dashboard. Changes apply instantly and persist on this device.
          </p>
        </div>
        <button
          onClick={reset}
          className="flex items-center gap-2 rounded-xl border border-border bg-card/60 px-3.5 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10"
        >
          <RotateCcw className="h-4 w-4" />
          Reset to Default
        </button>
      </div>

      <Card className="p-5">
        <CardHeader title="Color Theme" />
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
          {themes.map((t) => {
            const active = theme === t.name;
            return (
              <motion.button
                key={t.name}
                whileHover={{ y: -4 }}
                onClick={() => setTheme(t.name)}
                className={cn(
                  "relative rounded-2xl border p-3 text-left transition-colors",
                  active
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40"
                    : "border-border hover:border-[var(--primary)]/40",
                )}
              >
                {active && (
                  <span className="absolute right-3 top-3 z-10 grid h-6 w-6 place-items-center rounded-full bg-[var(--primary)] text-primary-foreground">
                    <Check className="h-3.5 w-3.5" />
                  </span>
                )}
                <ThemePreview tokens={t.tokens} />
                <div className="mt-3">
                  <div className="flex items-center gap-2">
                    {Object.values(t.tokens).slice(0, 3).map((c) => (
                      <span
                        key={c}
                        className="h-4 w-4 rounded-full ring-2 ring-white/10"
                        style={{ background: c }}
                      />
                    ))}
                  </div>
                  <p className="mt-2 text-sm font-semibold text-card-foreground">{t.label}</p>
                  <p className="text-xs text-muted-foreground">{t.desc}</p>
                </div>
              </motion.button>
            );
          })}
        </div>
      </Card>

      <Card className="p-5">
        <CardHeader title="Mode" />
        <div className="mt-4 grid grid-cols-2 gap-4 sm:max-w-md">
          {(["dark", "light"] as const).map((m) => {
            const active = mode === m;
            const Icon = m === "dark" ? Moon : Sun;
            return (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  "flex items-center gap-3 rounded-2xl border p-4 capitalize transition-colors",
                  active
                    ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/40"
                    : "border-border hover:border-[var(--primary)]/40",
                )}
              >
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-[var(--primary)]/15 text-[var(--accent)]">
                  <Icon className="h-5 w-5" />
                </span>
                <div className="text-left">
                  <p className="text-sm font-semibold text-card-foreground">{m} Mode</p>
                  <p className="text-xs text-muted-foreground">
                    {m === "dark" ? "Easy on the eyes" : "Bright & crisp"}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
