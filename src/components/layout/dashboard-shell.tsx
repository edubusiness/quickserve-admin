"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AiAssistant } from "./ai-assistant";
import { cn } from "@/lib/utils";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[78px]" : "lg:pl-[260px]",
        )}
      >
        <Header
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
        <main className="flex-1 px-4 py-5 lg:px-6">{children}</main>
      </div>

      <AiAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </div>
  );
}
