"use client";

import { useState } from "react";
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
} from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";
import type { ThemeName } from "@/types";

const themeSwatches: { name: ThemeName; label: string; color: string }[] = [
  { name: "blue", label: "Professional Blue", color: "#2563eb" },
  { name: "purple", label: "Royal Purple", color: "#7c3aed" },
  { name: "emerald", label: "Emerald Green", color: "#059669" },
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
  const { theme, mode, setTheme, toggleMode } = useTheme();
  const { data: session } = useSession();
  const [isFull, setIsFull] = useState(false);
  const [themeMenu, setThemeMenu] = useState(false);
  const [profileMenu, setProfileMenu] = useState(false);

  const user = session?.user;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const role = (user as any)?.role as string | undefined;
  const roleLabel = role
    ? role.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Administrator";

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
      <div className="relative hidden max-w-md flex-1 sm:block">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search anything... (Bookings, Users, Services)"
          className="h-10 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-12 text-sm text-card-foreground placeholder:text-muted-foreground/70 focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
        />
        <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground md:block">
          ⌘K
        </kbd>
      </div>

      <div className="flex-1 sm:hidden" />

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
        <div className="relative">
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

        <IconButton label="Language" onClick={() => {}}>
          <Globe className="h-5 w-5" />
        </IconButton>

        <span className="hidden sm:inline">
          <IconButton label="Fullscreen" onClick={toggleFullscreen}>
            {isFull ? (
              <Minimize2 className="h-5 w-5" />
            ) : (
              <Maximize2 className="h-5 w-5" />
            )}
          </IconButton>
        </span>

        <IconButton label="Messages" badge={5}>
          <MessageSquare className="h-5 w-5" />
        </IconButton>

        <IconButton label="Notifications" badge={8}>
          <Bell className="h-5 w-5" />
        </IconButton>
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
            <button className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10">
              <UserCircle className="h-4 w-4" /> Profile
            </button>
            <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-card-foreground transition-colors hover:bg-[var(--primary)]/10">
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
