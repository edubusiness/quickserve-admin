"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";

type Variant = "success" | "error" | "info";

interface Toast {
  id: number;
  title: string;
  description?: string;
  variant: Variant;
}

interface ToastInput {
  title: string;
  description?: string;
  variant?: Variant;
}

const ToastContext = createContext<{ toast: (t: ToastInput) => void } | null>(null);

const config: Record<Variant, { icon: typeof CheckCircle2; ring: string; tint: string }> = {
  success: { icon: CheckCircle2, ring: "ring-emerald-500/30", tint: "text-emerald-400" },
  error: { icon: XCircle, ring: "ring-rose-500/30", tint: "text-rose-400" },
  info: { icon: Info, ring: "ring-sky-500/30", tint: "text-sky-400" },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = "success" }: ToastInput) => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, title, description, variant }]);
      setTimeout(() => remove(id), 4000);
    },
    [remove],
  );

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex w-full max-w-sm flex-col gap-2.5">
        <AnimatePresence initial={false}>
          {toasts.map((t) => {
            const { icon: Icon, ring, tint } = config[t.variant];
            return (
              <motion.div
                key={t.id}
                layout
                initial={{ opacity: 0, x: 40, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 40, scale: 0.95 }}
                transition={{ type: "spring", damping: 24, stiffness: 320 }}
                className={cn(
                  "card-surface pointer-events-auto flex items-start gap-3 p-3.5 ring-1",
                  ring,
                )}
              >
                <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", tint)} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-card-foreground">{t.title}</p>
                  {t.description && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{t.description}</p>
                  )}
                </div>
                <button
                  onClick={() => remove(t.id)}
                  aria-label="Dismiss"
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
