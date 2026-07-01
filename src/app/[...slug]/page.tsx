"use client";

import { use, Suspense } from "react";
import { motion } from "framer-motion";
import { Construction, ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { resolveModule } from "@/data/modules";
import { ModuleRenderer } from "@/components/modules/module-renderer";

function titleize(slug: string[]): string {
  return slug
    .join(" / ")
    .split(/[/-]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export default function ModulePlaceholder({
  params,
}: {
  params: Promise<{ slug: string[] }>;
}) {
  const { slug } = use(params);

  // Registered module? Render the real, config-driven page.
  const config = resolveModule(slug);
  if (config)
    return (
      <Suspense fallback={<div className="skeleton h-[60vh] rounded-2xl" />}>
        <ModuleRenderer config={config} moduleKey={slug.join("/")} />
      </Suspense>
    );

  const title = titleize(slug);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-2xl items-center justify-center">
      <Card className="w-full p-10 text-center">
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/30"
        >
          <Construction className="h-9 w-9" />
        </motion.div>
        <h1 className="mt-6 text-2xl font-bold tracking-tight text-card-foreground">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This module is scaffolded and ready for its feature build-out — tables,
          forms, filters and real-time data wire in here following the same design
          system as the dashboard.
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" /> Powered by QuickServe
          </span>
        </div>
      </Card>
    </div>
  );
}
