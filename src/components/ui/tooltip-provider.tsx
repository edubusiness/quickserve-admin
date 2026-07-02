"use client";

import { useEffect, useRef, useState } from "react";

/**
 * App-wide auto tooltip. Renders a single styled tooltip for any interactive
 * element (button / link / [role=button] / [data-tooltip]) that carries an
 * accessible label via `data-tooltip`, `aria-label`, or `title`. This gives
 * every icon button a hover/focus tooltip without wrapping each one, and it
 * suppresses the browser's native (unstyled) title tooltip while shown.
 */
type Tip = { text: string; x: number; y: number; placement: "top" | "bottom" } | null;

const INTERACTIVE = "button, a, [role='button'], input, select, textarea, summary";

function labelFor(el: HTMLElement): string {
  const explicit = (
    el.getAttribute("data-tooltip") ||
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    ""
  ).trim();
  if (explicit) return explicit;
  // Fallback: the control's own visible text (covers plain text buttons/links).
  const text = (el.textContent || "").replace(/\s+/g, " ").trim();
  return text.length > 80 ? `${text.slice(0, 80)}…` : text;
}

export function TooltipProvider() {
  const [tip, setTip] = useState<Tip>(null);
  const timer = useRef<number | null>(null);
  const active = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const candidate = (target: EventTarget | null): HTMLElement | null => {
      const el = (target as HTMLElement)?.closest?.(
        "button, a, [role='button'], summary, [data-tooltip], [aria-label], [title]",
      ) as HTMLElement | null;
      if (!el) return null;
      // Every interactive control qualifies (label falls back to its text);
      // non-interactive elements only qualify with an explicit data-tooltip.
      if (!el.matches(INTERACTIVE) && !el.hasAttribute("data-tooltip")) return null;
      if (el.getAttribute("aria-disabled") === "true" || (el as HTMLButtonElement).disabled) return null;
      return el;
    };

    const clearTimer = () => {
      if (timer.current) {
        clearTimeout(timer.current);
        timer.current = null;
      }
    };

    const show = (el: HTMLElement) => {
      const text = labelFor(el);
      if (!text) return;
      // Suppress the native title tooltip while ours is visible.
      const native = el.getAttribute("title");
      if (native) {
        el.setAttribute("data-native-title", native);
        el.removeAttribute("title");
      }
      const r = el.getBoundingClientRect();
      const placement: "top" | "bottom" = r.top > 56 ? "top" : "bottom";
      active.current = el;
      setTip({
        text,
        x: Math.round(r.left + r.width / 2),
        y: Math.round(placement === "top" ? r.top : r.bottom),
        placement,
      });
    };

    const hide = () => {
      clearTimer();
      const el = active.current;
      if (el) {
        const native = el.getAttribute("data-native-title");
        if (native) {
          el.setAttribute("title", native);
          el.removeAttribute("data-native-title");
        }
        active.current = null;
      }
      setTip(null);
    };

    const onOver = (e: MouseEvent) => {
      const el = candidate(e.target);
      if (!el || el === active.current) return;
      hide();
      clearTimer();
      timer.current = window.setTimeout(() => show(el), 350);
    };
    const onOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (active.current && related && active.current.contains(related)) return;
      hide();
    };
    const onFocusIn = (e: FocusEvent) => {
      const el = candidate(e.target);
      if (el) {
        clearTimer();
        show(el);
      }
    };

    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", hide);
    document.addEventListener("click", hide, true);
    window.addEventListener("scroll", hide, true);
    window.addEventListener("resize", hide);
    return () => {
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", hide);
      document.removeEventListener("click", hide, true);
      window.removeEventListener("scroll", hide, true);
      window.removeEventListener("resize", hide);
      clearTimer();
    };
  }, []);

  if (!tip) return null;

  return (
    <div
      role="tooltip"
      className="pointer-events-none fixed z-[100] max-w-[240px] rounded-md bg-[var(--card-foreground)] px-2 py-1 text-xs font-medium leading-tight text-[var(--card)] shadow-lg ring-1 ring-black/10"
      style={{
        left: tip.x,
        top: tip.y,
        transform: `translate(-50%, ${tip.placement === "top" ? "calc(-100% - 8px)" : "8px"})`,
      }}
    >
      {tip.text}
    </div>
  );
}
