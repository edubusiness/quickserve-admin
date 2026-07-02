"use client";

import { useState } from "react";
import { Key, Plus, Copy, Eye, EyeOff, RefreshCw, Trash2, Check, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";

const KEY = "api-keys";

// A random opaque token, e.g. qs_live_9f3c2a7b1e8d4056.
const randToken = (env: string) => {
  const hex = Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join("");
  return `qs_${env === "live" ? "live" : "test"}_${hex}`;
};

const seedRows = [
  { id: "AK-1", name: "Mobile App (Android/iOS)", scope: "read-write", environment: "live", token: "qs_live_a17f9c2b40e8d3516a9c77b2", status: "active", createdAt: new Date(Date.now() - 86400e3 * 40).toISOString() },
  { id: "AK-2", name: "Partner Portal", scope: "read-write", environment: "live", token: "qs_live_5b2e91c7d0a34f6688ab1023", status: "active", createdAt: new Date(Date.now() - 86400e3 * 21).toISOString() },
  { id: "AK-3", name: "Analytics Pipeline", scope: "read", environment: "live", token: "qs_live_77c0a9b3e1f24d508c6b45aa", status: "active", createdAt: new Date(Date.now() - 86400e3 * 12).toISOString() },
  { id: "AK-4", name: "Webhook Receiver", scope: "write", environment: "live", token: "qs_live_e3417b8c9d02a5f61240ffab", status: "active", createdAt: new Date(Date.now() - 86400e3 * 7).toISOString() },
  { id: "AK-5", name: "Staging / QA", scope: "read-write", environment: "test", token: "qs_test_9a0f13c7b2e845d0aa61c399", status: "revoked", createdAt: new Date(Date.now() - 86400e3 * 60).toISOString() },
];

const scopeTone: Record<string, BadgeTone> = { read: "info", write: "warning", "read-write": "primary", admin: "danger" };

function mask(token: string) {
  if (token.length <= 12) return token;
  const head = token.slice(0, token.lastIndexOf("_") + 1);
  return `${head}${"•".repeat(12)}${token.slice(-4)}`;
}

interface KeyRow {
  id: string;
  name: string;
  scope: string;
  environment: string;
  token: string;
  status: string;
  createdAt: string;
}

export function ApiKeysSection() {
  const { data: keys = [], isLoading } = useModuleCollection(KEY, seedRows);
  const { create, update, remove } = useModuleMutations(KEY);
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: "", scope: "read-write", environment: "live" });
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (row: KeyRow) => {
    try {
      await navigator.clipboard.writeText(row.token);
      setCopied(row.id);
      setTimeout(() => setCopied((c) => (c === row.id ? null : c)), 1500);
    } catch {
      toast({ title: "Couldn't copy", variant: "error" });
    }
  };

  const generate = () => {
    if (!form.name.trim()) return;
    create.mutate(
      { name: form.name.trim(), scope: form.scope, environment: form.environment, token: randToken(form.environment), status: "active", createdAt: new Date().toISOString() },
      {
        onSuccess: () => {
          setModalOpen(false);
          setForm({ name: "", scope: "read-write", environment: "live" });
          toast({ title: "API key generated", description: "Copy it now — store it securely." });
        },
        onError: () => toast({ title: "Failed to generate key", variant: "error" }),
      },
    );
  };

  const rotate = (row: KeyRow) =>
    update.mutate(
      { id: row.id, body: { token: randToken(row.environment), status: "active" } },
      {
        onSuccess: () => { setRevealed((s) => ({ ...s, [row.id]: true })); toast({ title: "Key rotated", description: `${row.name} has a new secret.` }); },
        onError: () => toast({ title: "Rotate failed", variant: "error" }),
      },
    );

  const toggleStatus = (row: KeyRow) =>
    update.mutate(
      { id: row.id, body: { status: row.status === "active" ? "revoked" : "active" } },
      { onSuccess: () => toast({ title: row.status === "active" ? "Key revoked" : "Key re-activated", description: row.name }) },
    );

  const del = (row: KeyRow) =>
    remove.mutate(row.id, {
      onSuccess: () => toast({ title: "Key deleted", description: `${row.name} removed.` }),
      onError: () => toast({ title: "Delete failed", variant: "error" }),
    });

  return (
    <Card className="p-5">
      <CardHeader
        title="API Keys"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--primary)]/25"
          >
            <Plus className="h-3.5 w-3.5" /> Generate Key
          </button>
        }
      />
      <p className="mt-1 text-xs text-muted-foreground">
        Programmatic access tokens used across QuickServe apps &amp; services.
      </p>

      {isLoading ? (
        <div className="mt-4 space-y-2">
          {[0, 1, 2].map((i) => <div key={i} className="skeleton h-14 rounded-xl" />)}
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {(keys as KeyRow[]).map((row) => {
            const isOn = row.status === "active";
            return (
              <li key={row.id} className="flex flex-col gap-3 py-3.5 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--accent)]">
                      <Key className="h-4 w-4" />
                    </span>
                    <p className="text-sm font-medium text-card-foreground">{row.name}</p>
                    <Badge tone={scopeTone[row.scope] ?? "neutral"} className="capitalize">{row.scope}</Badge>
                    <Badge tone={row.environment === "live" ? "success" : "neutral"} className="uppercase">{row.environment}</Badge>
                    {!isOn && <Badge tone="danger">revoked</Badge>}
                  </div>
                  <div className="mt-2 flex items-center gap-2 pl-10">
                    <code className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                      {revealed[row.id] ? row.token : mask(row.token)}
                    </code>
                    <button onClick={() => setRevealed((s) => ({ ...s, [row.id]: !s[row.id] }))} aria-label="Reveal key" className="text-muted-foreground hover:text-card-foreground">
                      {revealed[row.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                    <button onClick={() => copy(row)} aria-label="Copy key" className="text-muted-foreground hover:text-card-foreground">
                      {copied === row.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-1 pl-10 sm:pl-0">
                  <button onClick={() => rotate(row)} title="Rotate key" aria-label="Rotate key" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                  <button onClick={() => toggleStatus(row)} className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors ${isOn ? "text-amber-400 hover:bg-amber-500/10" : "text-emerald-400 hover:bg-emerald-500/10"}`}>
                    {isOn ? "Revoke" : "Activate"}
                  </button>
                  <button onClick={() => del(row)} title="Delete key" aria-label="Delete key" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Generate API Key"
        description="Create a new access token for an app or integration."
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">
              Cancel
            </button>
            <button type="submit" form="api-key-form" disabled={create.isPending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70">
              {create.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Generate
            </button>
          </>
        }
      >
        <form
          id="api-key-form"
          onSubmit={(e) => { e.preventDefault(); generate(); }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          <div className="sm:col-span-2">
            <TextField label="Key Name" required placeholder="e.g. Mobile App" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <SelectField label="Scope" options={["read", "write", "read-write", "admin"]} value={form.scope} onChange={(e) => setForm({ ...form, scope: e.target.value })} />
          <SelectField label="Environment" options={["live", "test"]} value={form.environment} onChange={(e) => setForm({ ...form, environment: e.target.value })} />
        </form>
      </Modal>
    </Card>
  );
}
