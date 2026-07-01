"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, Headset, Sparkles } from "lucide-react";
import { navigation } from "@/data/navigation";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function Sidebar({
  collapsed,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    Bookings: true,
  });

  const toggleGroup = (label: string) =>
    setOpenGroups((s) => ({ ...s, [label]: !s[label] }));

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onMobileClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card/80 backdrop-blur-xl transition-all duration-300 lg:translate-x-0",
          collapsed ? "w-[78px]" : "w-[260px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Brand */}
        <div className="flex h-16 shrink-0 items-center gap-3 border-b border-border px-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] shadow-lg shadow-[var(--primary)]/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-sm font-bold tracking-tight text-card-foreground">
                QuickServe
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                All Services At Your Doorstep
              </p>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav className="no-scrollbar flex-1 space-y-5 overflow-y-auto px-3 py-4">
          {navigation.map((section, si) => (
            <div key={si}>
              {section.title && !collapsed && (
                <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  {section.title}
                </p>
              )}
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const active = item.href === pathname;
                  const Icon = item.icon;
                  const hasChildren = !!item.children?.length;
                  const groupOpen = openGroups[item.label];

                  if (hasChildren) {
                    return (
                      <li key={item.label}>
                        <button
                          onClick={() => toggleGroup(item.label)}
                          className={cn(
                            "group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground",
                            collapsed && "justify-center",
                          )}
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          {!collapsed && (
                            <>
                              <span className="flex-1 text-left">{item.label}</span>
                              {item.badge && <Badge tone="danger">{item.badge}</Badge>}
                              <ChevronDown
                                className={cn(
                                  "h-4 w-4 transition-transform",
                                  groupOpen && "rotate-180",
                                )}
                              />
                            </>
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {groupOpen && !collapsed && (
                            <motion.ul
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-5 mt-1 space-y-1 overflow-hidden border-l border-border pl-3"
                            >
                              {item.children!.map((child) => (
                                <li key={child.href}>
                                  <Link
                                    href={child.href}
                                    onClick={onMobileClose}
                                    className={cn(
                                      "flex items-center gap-2 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:text-card-foreground",
                                      pathname === child.href &&
                                        "text-[var(--accent)]",
                                    )}
                                  >
                                    <ChevronRight className="h-3 w-3" />
                                    {child.label}
                                  </Link>
                                </li>
                              ))}
                            </motion.ul>
                          )}
                        </AnimatePresence>
                      </li>
                    );
                  }

                  return (
                    <li key={item.label}>
                      <Link
                        href={item.href ?? "#"}
                        onClick={onMobileClose}
                        title={collapsed ? item.label : undefined}
                        className={cn(
                          "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          collapsed && "justify-center",
                          active
                            ? "bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-primary-foreground shadow-lg shadow-[var(--primary)]/30"
                            : "text-muted-foreground hover:bg-[var(--primary)]/10 hover:text-card-foreground",
                        )}
                      >
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!collapsed && <span className="flex-1">{item.label}</span>}
                        {!collapsed && item.badge && (
                          <Badge tone={active ? "neutral" : "danger"}>
                            {item.badge}
                          </Badge>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Support CTA */}
        <div className="shrink-0 p-3">
          <Link
            href="/support"
            onClick={onMobileClose}
            className={cn(
              "flex items-center gap-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-3 py-3 text-primary-foreground shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5",
              collapsed && "justify-center",
            )}
          >
            <Headset className="h-5 w-5 shrink-0" />
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-sm font-semibold">Need Help?</p>
                <p className="truncate text-[11px] opacity-80">Contact Support</p>
              </div>
            )}
          </Link>
        </div>
      </aside>
    </>
  );
}
