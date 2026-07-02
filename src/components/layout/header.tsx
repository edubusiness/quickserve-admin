"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, UserCircle, Settings as SettingsIcon } from "lucide-react";
import {
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sparkles,
  Bell,
  MessageSquare,
  Maximize2,
  Minimize2,
  Globe,
  Sun,
  Moon,
  ChevronDown,
  Check,
  CornerDownLeft,
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/types";

const themeSwatches: { name: ThemeName; label: string; color: string }[] = [
  { name: "blue", label: "Professional Blue", color: "#2563eb" },
  { name: "purple", label: "Royal Purple", color: "#7c3aed" },
  { name: "emerald", label: "Emerald Green", color: "#059669" },
];

const languages = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी (Hindi)" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "ar", label: "العربية" },
  { code: "zh", label: "中文" },
];

const notifications = [
  { title: "New emergency (SOS) request", meta: "Koramangala · just now", href: "/emergency" },
  { title: "12 support tickets awaiting reply", meta: "Support queue · 4m ago", href: "/support" },
  { title: "Provider payout batch settled", meta: "Finance · 20m ago", href: "/settlements" },
  { title: "Refund approved for BK-12458", meta: "Payments · 1h ago", href: "/refunds" },
];

const messages = [
  { name: "Rahul (Driver)", text: "Reached the pickup point.", href: "/support" },
  { name: "Aisha (Provider)", text: "Can I reschedule my slot?", href: "/support" },
  { name: "Ops Team", text: "Surge pricing enabled in HSR.", href: "/support" },
];

function IconButton({
  children,
  badge,
  label,
  onClick,
}: {
  children: React.ReactNode;
  badge?: number;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground"
    >
      {children}
      {badge ? (
        <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );
}

/** Flatten the sidebar tree into a searchable list of destinations. */
function useDestinations() {
  return useMemo(() => {
    const out: { label: string; href: string }[] = [];
    for (const section of navigation) {
      for (const item of section.items) {
        if (item.href) out.push({ label: item.label, href: item.href });
        if (item.children) {
          for (const c of item.children) out.push({ label: `${item.label} › ${c.label}`, href: c.href });
        }
      }
    }
    return out;
  }, []);
}

export function Header({
  collapsed,
  onToggleCollapse,
  onOpenMobile,
  onOpenAssistant,
}: {
  collapsed: boolean;
  onToggleCollapse: () => void;
  onOpenMobile: () => void;
  onOpenAssistant: () => void;
}) {
  const router = useRouter();
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const { data: session } = useSession();
  const [isFull, setIsFull] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);
  const [langMenu, setLangMenu] = useState(false);
  const [notifMenu, setNotifMenu] = useState(false);
  const [msgMenu, setMsgMenu] = useState(false);
  const [lang, setLang] = useState("en");
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const searchRef = useRef<HTMLDivElement>(null);

  const destinations = useDestinations();
  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return destinations.filter((d) => d.label.toLowerCase().includes(q)).slice(0, 6);
  }, [query, destinations]);

  const user = session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user as any)?.role as string | undefined;
  const roleLabel = role
    ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Administrator";

  const go = (href: string) => {
    setSearchOpen(false);
    setNotifMenu(false);
    setMsgMenu(false);
    setProfileMenu(false);
    setQuery("");
    router.push(href);
  };

  const onSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, matches.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter") {
      const target = matches[highlight] ?? matches[0];
      if (target) go(target.href);
    } else if (e.key === "Escape") {
      setSearchOpen(false);
    }
  };

  const chooseLanguage = (code: string) => {
    setLang(code);
    setLangMenu(false);
    try {
      window.localStorage.setItem("qs.lang", code);
    } catch {}
    document.documentElement.lang = code;
  };

  // Clear the session, then hard-navigate so middleware re-runs and gates the
  // user out. `redirect: false` avoids the App Router client-redirect quirk.
  const handleSignOut = async () => {
    setProfileMenu(false);
    try {
      await signOut({ redirect: false });
    } finally {
      window.location.href = "/login";
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFull(true);
    } else {
      document.exitFullscreen?.();
      setIsFull(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/70 px-4 backdrop-blur-xl lg:px-6">
      {/* Mobile menu */}
      <button
        onClick={onOpenMobile}
        aria-label="Open menu"
        className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-[var(--primary)]/10 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Collapse toggle (desktop) */}
      <button
        onClick={onToggleCollapse}
        aria-label="Toggle sidebar"
        className="hidden h-10 w-10 place-items-center rounded-xl text-muted-foreground hover:bg-[var(--primary)]/10 hover:text-card-foreground lg:grid"
      >
        {collapsed ? (
          <PanelLeftOpen className="h-5 w-5" />
        ) : (
          <PanelLeftClose className="h-5 w-5" />
        )}
      </button>

      {/* Search */}
      <div ref={searchRef} className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
            setHighlight(0);
          }}
          onFocus={() => setSearchOpen(true)}
          onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
          onKeyDown={onSearchKey}
          placeholder="Search anything... (Bookings, Users, Services)"
          className="h-10 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-12 text-sm text-card-foreground placeholder:text-muted-foreground/70 focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:block">
          ⌘K
        </kbd>
        {searchOpen && query.trim() && (
          <div className="absolute left-0 top-12 w-full overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
            {matches.length === 0 ? (
              <p className="px-3 py-3 text-sm text-muted-foreground">
                No matches for “{query.trim()}”.
              </p>
            ) : (
              matches.map((m, i) => (
                <button
                  key={m.href}
                  onMouseDown={() => go(m.href)}
                  onMouseEnter={() => setHighlight(i)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-left text-sm text-card-foreground transition-colors",
                    i === highlight ? "bg-[var(--primary)]/10" : "hover:bg-[var(--primary)]/10",
                  )}
                >
                  <span className="truncate">{m.label}</span>
                  {i === highlight && (
                    <CornerDownLeft className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  )}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      <div className="flex-1 sm:hidden" />

      {/* Mobile search trigger */}
      <button
        onClick={() => setMobileSearchOpen(true)}
        aria-label="Search"
        className="grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground sm:hidden"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile full-screen search */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[70] flex flex-col bg-background sm:hidden">
          <div className="flex items-center gap-2 border-b border-border p-3">
            <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search pages, sections…"
              className="h-11 min-w-0 flex-1 bg-transparent text-base text-card-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            />
            <button
              onClick={() => { setMobileSearchOpen(false); setQuery(""); }}
              className="shrink-0 rounded-lg px-3 py-2 text-sm font-medium text-[var(--accent)]"
            >
              Cancel
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {!query.trim() ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">Type to search across the app.</p>
            ) : matches.length === 0 ? (
              <p className="px-3 py-4 text-sm text-muted-foreground">No matches for “{query.trim()}”.</p>
            ) : (
              matches.map((m) => (
                <button
                  key={m.href}
                  onClick={() => { go(m.href); setMobileSearchOpen(false); }}
                  className="flex w-full items-center justify-between gap-2 rounded-lg px-3 py-3 text-left text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10"
                >
                  <span className="truncate">{m.label}</span>
                  <CornerDownLeft className="h-4 w-4 shrink-0 text-muted-foreground" />
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* AI Assistant */}
      <button
        onClick={onOpenAssistant}
        className="hidden items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-3.5 py-2 text-sm font-medium text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 sm:flex"
      >
        <Sparkles className="h-4 w-4" />
        AI Assistant
      </button>

      <div className="flex items-center gap-1">
        {/* Theme quick switcher */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setThemeMenu((v) => !v)}
            onBlur={() => setTimeout(() => setThemeMenu(false), 150)}
            aria-label="Switch theme"
            className="flex h-10 items-center gap-1.5 rounded-xl px-2.5 text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground"
          >
            <span
              className="h-4 w-4 rounded-full ring-2 ring-white/20"
              style={{
                background: themeSwatches.find((t) => t.name === theme)?.color,
              }}
            />
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {themeMenu && (
            <div className="absolute right-0 top-12 w-52 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
              {themeSwatches.map((t) => (
                <button
                  key={t.name}
                  onMouseDown={() => setTheme(t.name)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10",
                    theme === t.name && "bg-[var(--primary)]/10",
                  )}
                >
                  <span
                    className="h-4 w-4 rounded-full ring-2 ring-white/20"
                    style={{ background: t.color }}
                  />
                  {t.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark/Light */}
        <IconButton label="Toggle dark mode" onClick={toggleMode}>
          {mode === "dark" ? (
            <Sun className="h-5 w-5" />
          ) : (
            <Moon className="h-5 w-5" />
          )}
        </IconButton>

        {/* Language */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setLangMenu((v) => !v)}
            onBlur={() => setTimeout(() => setLangMenu(false), 150)}
            aria-label="Language"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground"
          >
            <Globe className="h-5 w-5" />
          </button>
          {langMenu && (
            <div className="absolute right-0 top-12 w-48 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
              {languages.map((l) => (
                <button
                  key={l.code}
                  onMouseDown={() => chooseLanguage(l.code)}
                  className={cn(
                    "flex w-full items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10",
                    lang === l.code && "bg-[var(--primary)]/10",
                  )}
                >
                  {l.label}
                  {lang === l.code && <Check className="h-4 w-4 text-[var(--primary)]" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <span className="hidden sm:inline">
          <IconButton label="Fullscreen" onClick={toggleFullscreen}>
            {isFull ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </IconButton>
        </span>

        {/* Messages */}
        <div className="relative hidden sm:block">
          <button
            onClick={() => setMsgMenu((v) => !v)}
            onBlur={() => setTimeout(() => setMsgMenu(false), 150)}
            aria-label="Messages"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground"
          >
            <MessageSquare className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {messages.length}
            </span>
          </button>
          {msgMenu && (
            <div className="absolute right-0 top-12 w-72 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Messages
              </p>
              {messages.map((m, i) => (
                <button
                  key={i}
                  onMouseDown={() => go(m.href)}
                  className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--primary)]/10"
                >
                  <span className="text-sm font-medium text-card-foreground">{m.name}</span>
                  <span className="w-full truncate text-xs text-muted-foreground">{m.text}</span>
                </button>
              ))}
              <button
                onMouseDown={() => go("/support")}
                className="mt-1 w-full rounded-lg border-t border-border px-3 py-2 text-center text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
              >
                Go to Support
              </button>
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifMenu((v) => !v)}
            onBlur={() => setTimeout(() => setNotifMenu(false), 150)}
            aria-label="Notifications"
            className="relative grid h-10 w-10 place-items-center rounded-xl text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
              {notifications.length}
            </span>
          </button>
          {notifMenu && (
            <div className="absolute right-0 top-12 w-80 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
              <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notifications
              </p>
              {notifications.map((n, i) => (
                <button
                  key={i}
                  onMouseDown={() => go(n.href)}
                  className="flex w-full flex-col items-start rounded-lg px-3 py-2 text-left transition-colors hover:bg-[var(--primary)]/10"
                >
                  <span className="text-sm font-medium text-card-foreground">{n.title}</span>
                  <span className="text-xs text-muted-foreground">{n.meta}</span>
                </button>
              ))}
              <button
                onMouseDown={() => go("/marketing/notifications")}
                className="mt-1 w-full rounded-lg border-t border-border px-3 py-2 text-center text-xs font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/10"
              >
                View all notifications
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Profile */}
      <div className="relative ml-1">
        <button
          onClick={() => setProfileMenu((v) => !v)}
          onBlur={() => setTimeout(() => setProfileMenu(false), 150)}
          className="flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 py-1.5 pl-1.5 pr-3 transition-colors hover:bg-[var(--primary)]/10"
        >
          <img
            src={user?.image ?? "https://i.pravatar.cc/80?img=68"}
            alt={user?.name ?? "Admin"}
            className="h-8 w-8 rounded-lg object-cover"
          />
          <div className="hidden text-left leading-tight md:block">
            <p className="text-xs font-semibold text-card-foreground">
              {user?.name ?? "Admin"}
            </p>
            <p className="text-[11px] text-muted-foreground">{roleLabel}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-muted-foreground md:block" />
        </button>
        {profileMenu && (
          <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-2xl">
            <div className="border-b border-border px-3 py-2.5">
              <p className="text-sm font-semibold text-card-foreground">
                {user?.name ?? "Admin"}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email ?? "admin@quickserve.io"}
              </p>
            </div>
            <button
              onMouseDown={() => go("/settings")}
              className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10"
            >
              <UserCircle className="h-4 w-4" /> Profile
            </button>
            <button
              onMouseDown={() => go("/settings")}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10"
            >
              <SettingsIcon className="h-4 w-4" /> Settings
            </button>
            <button
              onMouseDown={handleSignOut}
              className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-rose-400 transition-colors hover:bg-rose-500/10"
            >
              <LogOut className="h-4 w-4" /> Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
