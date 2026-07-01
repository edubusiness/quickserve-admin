"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  hover?: boolean;
}

/** Floating glass surface used across the dashboard. */
export function Card({ className, hover = false, children, ...props }: CardProps) {
  return (
    <motion.div
      className={cn(
        "card-surface relative overflow-hidden",
        hover &&
          "transition-transform duration-300 will-change-transform hover:-translate-y-1",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function CardHeader({
  title,
  action,
  className,
}: {
  title: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center justify-between gap-3", className)}>
      <h3 className="text-sm font-semibold tracking-tight text-card-foreground">
        {title}
      </h3>
      {action}
    </div>
  );
}
