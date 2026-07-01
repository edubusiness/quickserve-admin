"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const baseInput =
  "h-10 w-full rounded-xl border border-border bg-muted/40 px-3.5 text-sm text-card-foreground placeholder:text-muted-foreground/70 focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20";

function Wrapper({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
    </div>
  );
}

export const TextField = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }
>(function TextField({ label, error, className, ...props }, ref) {
  return (
    <Wrapper label={label} error={error}>
      <input ref={ref} className={cn(baseInput, error && "border-rose-500/40", className)} {...props} />
    </Wrapper>
  );
});

export const SelectField = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement> & { label: string; error?: string; options: string[] }
>(function SelectField({ label, error, options, className, ...props }, ref) {
  return (
    <Wrapper label={label} error={error}>
      <select ref={ref} className={cn(baseInput, "capitalize", error && "border-rose-500/40", className)} {...props}>
        {options.map((o) => (
          <option key={o} value={o} className="bg-card capitalize">
            {o}
          </option>
        ))}
      </select>
    </Wrapper>
  );
});
