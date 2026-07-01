"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import type { ModuleColumn } from "@/data/modules";

interface Field {
  key: string;
  label: string;
  kind: "text" | "number" | "select" | "date";
  options?: string[];
}

const labelize = (k: string) =>
  k.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function distinct(rows: Record<string, any>[], key: string): string[] {
  return Array.from(new Set(rows.map((r) => String(r[key])).filter(Boolean)));
}

/** Derives editable form fields from a module's column definitions. */
function buildFields(
  columns: ModuleColumn[],
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[],
): Field[] {
  const fields: Field[] = [];
  const seen = new Set<string>();
  const add = (key: string, label: string, kind: Field["kind"], options?: string[]) => {
    if (!key || key === "id" || seen.has(key)) return;
    seen.add(key);
    fields.push({ key, label, kind, options });
  };
  for (const c of columns) {
    if (!c.header) continue; // skip pure action columns
    switch (c.type) {
      case "currency":
      case "number":
      case "rating":
        add(c.key, c.header, "number");
        break;
      case "date":
        add(c.key, c.header, "date");
        break;
      case "badge":
        add(c.key, c.header, "select", distinct(rows, c.key));
        break;
      case "avatar":
        add(c.key, c.header, "text");
        if (c.sub) add(c.sub, labelize(c.sub), "text");
        break;
      case "bool":
        add(c.key, c.header, "select", ["true", "false"]);
        break;
      default:
        add(c.key, c.header, "text");
    }
  }
  return fields;
}

export function GenericFormModal({
  open,
  onClose,
  title,
  columns,
  rows,
  initial,
  pending,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  columns: ModuleColumn[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rows: Record<string, any>[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  initial?: Record<string, any> | null;
  pending?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onSubmit: (values: Record<string, any>) => void;
}) {
  const fields = buildFields(columns, rows);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      const init: Record<string, string> = {};
      for (const f of fields) {
        if (initial && initial[f.key] !== undefined && initial[f.key] !== null) {
          init[f.key] =
            f.kind === "date"
              ? new Date(initial[f.key]).toISOString().slice(0, 10)
              : String(initial[f.key]);
        } else {
          init[f.key] = f.kind === "select" ? (f.options?.[0] ?? "") : f.kind === "number" ? "0" : "";
        }
      }
      setValues(init);
      setSaving(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, initial]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const out: Record<string, any> = {};
    for (const f of fields) {
      const raw = values[f.key] ?? "";
      if (f.kind === "number") out[f.key] = Number(raw) || 0;
      else if (f.kind === "date") out[f.key] = raw ? new Date(raw).toISOString() : new Date().toISOString();
      else if (f.kind === "select" && (raw === "true" || raw === "false")) out[f.key] = raw === "true";
      else out[f.key] = raw;
    }
    onSubmit(out);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description="Fill in the details below to add a new record."
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="generic-form"
            disabled={pending ?? saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70"
          >
            {(pending ?? saving) && <Loader2 className="h-4 w-4 animate-spin" />}
            Save
          </button>
        </>
      }
    >
      <form id="generic-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {fields.map((f) =>
          f.kind === "select" ? (
            <SelectField
              key={f.key}
              label={f.label}
              options={f.options ?? []}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          ) : (
            <TextField
              key={f.key}
              label={f.label}
              type={f.kind === "number" ? "number" : f.kind === "date" ? "date" : "text"}
              required={f.kind === "text"}
              value={values[f.key] ?? ""}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            />
          ),
        )}
      </form>
    </Modal>
  );
}
