"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { Header } from "./header";
import { AiAssistant } from "./ai-assistant";
import { TooltipProvider } from "@/components/ui/tooltip-provider";
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
          "flex min-h-screen min-w-0 flex-col transition-[padding] duration-300",
          collapsed ? "lg:pl-[78px]" : "lg:pl-[260px]",
        )}
      >
        <Header
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed((c) => !c)}
          onOpenMobile={() => setMobileOpen(true)}
          onOpenAssistant={() => setAssistantOpen(true)}
        />
        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden px-4 py-5 lg:px-6">{children}</main>
      </div>

      <AiAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />
      <TooltipProvider />
    </div>
  );
}
