"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock, ArrowRight, Loader2, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const demoAccounts = [
  { role: "Super Admin", email: "admin@quickserve.io", password: "admin123" },
  { role: "Ops Manager", email: "manager@quickserve.io", password: "manager123" },
  { role: "Support", email: "support@quickserve.io", password: "support123" },
];

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const callbackUrl = params.get("callbackUrl") ?? "/";
  const expired = params.get("expired") === "1";

  const [email, setEmail] = useState("admin@quickserve.io");
  const [password, setPassword] = useState("admin123");
  const [error, setError] = useState(expired ? "Your session expired — please sign in again." : "");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("Invalid credentials, or the API server is not running on :4000.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden lg:block">
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(40rem 30rem at 20% 20%, color-mix(in srgb, var(--primary) 40%, transparent), transparent 60%), radial-gradient(36rem 28rem at 90% 90%, color-mix(in srgb, var(--accent) 35%, transparent), transparent 55%), var(--background)",
          }}
        />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-card-foreground">QuickServe</p>
              <p className="text-xs text-muted-foreground">Admin Console</p>
            </div>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight text-card-foreground">
              Run your entire <span className="gradient-text">marketplace</span> from one console.
            </h1>
            <p className="mt-4 max-w-md text-muted-foreground">
              Bookings, providers, drivers, payments and live operations — secured with
              role-based access and real-time insights.
            </p>
            <div className="mt-8 flex gap-6">
              {[
                ["125", "Cities"],
                ["15.7K", "Providers"],
                ["2.4M", "Customers"],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-bold text-card-foreground">{v}</p>
                  <p className="text-xs text-muted-foreground">{l}</p>
                </div>
              ))}
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 QuickServe. Enterprise admin platform.
          </p>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-surface w-full max-w-md p-8"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)]">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <p className="text-lg font-bold text-card-foreground">QuickServe</p>
          </div>

          <h2 className="text-2xl font-bold text-card-foreground">Welcome back</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Sign in to your admin account to continue.
          </p>

          <form onSubmit={submit} className="mt-6 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Email</label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3 text-sm text-card-foreground focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted-foreground">Password</label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-11 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-3 text-sm text-card-foreground focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                />
              </div>
            </div>

            {error && (
              <p className="rounded-lg bg-rose-500/10 px-3 py-2 text-xs text-rose-400">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 rounded-xl border border-border bg-muted/30 p-3">
            <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" /> Demo accounts (click to fill)
            </p>
            <div className="grid gap-1.5">
              {demoAccounts.map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setEmail(a.email);
                    setPassword(a.password);
                  }}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-[var(--primary)]/10",
                    email === a.email && "bg-[var(--primary)]/10",
                  )}
                >
                  <span className="font-medium text-card-foreground">{a.role}</span>
                  <span className="flex flex-col items-end leading-tight">
                    <code className="text-muted-foreground">{a.email}</code>
                    <code className="text-[10px] text-[var(--accent)]">{a.password}</code>
                  </span>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
