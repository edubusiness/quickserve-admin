"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X, Mic, Send, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

const suggestions = [
  "Generate today's revenue report",
  "Predict tomorrow's demand",
  "Which city needs more providers?",
  "Summarize this week's bookings",
];

interface Msg {
  role: "user" | "ai";
  text: string;
}

export function AiAssistant({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "ai",
      text: "Hi! I'm your QuickServe AI assistant. Ask me about revenue, demand forecasts, bookings or anything on the platform.",
    },
  ]);
  const [input, setInput] = useState("");

  const send = (text: string) => {
    if (!text.trim()) return;
    setMessages((m) => [
      ...m,
      { role: "user", text },
      {
        role: "ai",
        text: "Based on current trends, revenue is projected to grow ~12% tomorrow with peak demand in Bangalore (Home Cleaning). I'd recommend onboarding 20+ providers in Koramangala.",
      },
    ]);
    setInput("");
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 260 }}
            className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-border bg-card shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] shadow-lg shadow-[var(--primary)]/30">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-card-foreground">
                    AI Assistant
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Online
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex gap-2.5",
                    m.role === "user" && "flex-row-reverse",
                  )}
                >
                  {m.role === "ai" && (
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--accent)]">
                      <Bot className="h-4 w-4" />
                    </div>
                  )}
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm",
                      m.role === "user"
                        ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-primary-foreground"
                        : "bg-muted text-card-foreground",
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-border p-4">
              <div className="mb-3 flex flex-wrap gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-[12px] text-muted-foreground transition-colors hover:border-[var(--primary)]/40 hover:text-card-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-muted/40 p-1.5">
                <button
                  className="grid h-9 w-9 place-items-center rounded-lg text-muted-foreground hover:bg-muted"
                  aria-label="Voice input"
                >
                  <Mic className="h-4.5 w-4.5" />
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send(input)}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none"
                />
                <button
                  onClick={() => send(input)}
                  className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-white"
                  aria-label="Send"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
