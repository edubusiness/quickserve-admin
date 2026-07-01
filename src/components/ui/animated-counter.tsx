"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

/**
 * Counts up to a target when scrolled into view.
 * Falls back to the formatted display string for non-numeric values.
 */
export function AnimatedCounter({
  value,
  display,
  duration = 1200,
  className,
}: {
  value: number;
  display: string;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [text, setText] = useState(display);

  useEffect(() => {
    if (!inView) return;
    // Derive prefix/suffix from the display string so currency & units survive.
    const match = display.match(/^([^\d]*)([\d.,]+)(.*)$/);
    if (!match) {
      setText(display);
      return;
    }
    const [, prefix, , suffix] = match;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const current = value * eased;
      const formatted =
        value >= 1000
          ? Math.round(current).toLocaleString("en-IN")
          : current.toFixed(value % 1 === 0 ? 0 : 1);
      setText(`${prefix}${formatted}${suffix}`);
      if (p < 1) raf = requestAnimationFrame(tick);
      else setText(display);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, display, duration]);

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  );
}
