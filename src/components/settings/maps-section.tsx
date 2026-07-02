"use client";

import { useEffect, useState } from "react";
import { MapPin, Eye, EyeOff, Copy, Check, Pencil, CheckCircle2, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { TextField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";

export const MAP_PROVIDERS_KEY = "map-providers";

export const mapProviderSeed = [
  { id: "MP-1", provider: "OpenStreetMap", apiKey: "", tileUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", attribution: "© OpenStreetMap contributors", keyless: true, active: true },
  { id: "MP-2", provider: "Google Maps", apiKey: "", tileUrl: "https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}", attribution: "© Google", keyless: false, active: false },
  { id: "MP-3", provider: "Mapbox", apiKey: "", tileUrl: "https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token={key}", attribution: "© Mapbox © OpenStreetMap", keyless: false, active: false },
];

interface ProviderRow {
  id: string;
  provider: string;
  apiKey: string;
  tileUrl: string;
  attribution: string;
  keyless: boolean;
  active: boolean;
}

function mask(v: string) {
  if (!v) return "";
  if (v.length <= 8) return "••••";
  return `${v.slice(0, 4)}${"•".repeat(8)}${v.slice(-4)}`;
}

export function MapsSection() {
  const { data: rows = [], isLoading } = useModuleCollection(MAP_PROVIDERS_KEY, mapProviderSeed);
  const { update } = useModuleMutations(MAP_PROVIDERS_KEY);
  const { toast } = useToast();

  const [editing, setEditing] = useState<ProviderRow | null>(null);
  const [form, setForm] = useState({ apiKey: "", tileUrl: "" });
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (editing) setForm({ apiKey: editing.apiKey ?? "", tileUrl: editing.tileUrl ?? "" });
  }, [editing]);

  const providers = rows as ProviderRow[];

  const setActive = (row: ProviderRow) => {
    if (!row.keyless && !row.apiKey) {
      toast({ title: `${row.provider} needs an API key first`, variant: "error" });
      return;
    }
    // Single active provider — flip this on, others off.
    Promise.all(
      providers.map((p) =>
        p.active === (p.id === row.id)
          ? Promise.resolve()
          : update.mutateAsync({ id: p.id, body: { active: p.id === row.id } }),
      ),
    ).then(() => toast({ title: "Active map provider set", description: row.provider }));
  };

  const copy = async (row: ProviderRow) => {
    try {
      await navigator.clipboard.writeText(row.apiKey);
      setCopied(row.id);
      setTimeout(() => setCopied((c) => (c === row.id ? null : c)), 1500);
    } catch {
      toast({ title: "Couldn't copy", variant: "error" });
    }
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    update.mutate(
      { id: editing.id, body: { apiKey: form.apiKey.trim(), tileUrl: form.tileUrl.trim() } },
      {
        onSuccess: () => { setEditing(null); toast({ title: "Provider updated", description: editing.provider }); },
        onError: () => toast({ title: "Update failed", variant: "error" }),
      },
    );
  };

  return (
    <Card className="p-5">
      <CardHeader title="Maps & Location" />
      <p className="mt-1 text-xs text-muted-foreground">
        Map provider for Live Tracking &amp; dispatch. OpenStreetMap works with no key; Google Maps &amp; Mapbox need an API key.
      </p>

      {isLoading ? (
        <div className="mt-4 space-y-2">{[0, 1, 2].map((i) => <div key={i} className="skeleton h-16 rounded-xl" />)}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {providers.map((row) => (
            <div key={row.id} className={`rounded-xl border p-4 transition-colors ${row.active ? "border-[var(--primary)]/50 bg-[var(--primary)]/5" : "border-border"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--accent)]">
                    <MapPin className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      {row.provider}
                      {row.active && <Badge tone="success">active</Badge>}
                      {row.keyless ? <Badge tone="info">no key needed</Badge> : !row.apiKey && <Badge tone="warning">key required</Badge>}
                    </p>
                    <p className="mt-0.5 max-w-md truncate font-mono text-[11px] text-muted-foreground">{row.tileUrl}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {row.active ? (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400"><CheckCircle2 className="h-4 w-4" /> In use</span>
                  ) : (
                    <button onClick={() => setActive(row)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--primary)]/10">
                      Use this
                    </button>
                  )}
                  <button onClick={() => setEditing(row)} title="Edit" aria-label={`Edit ${row.provider}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                </div>
              </div>
              {!row.keyless && (
                <div className="mt-3 flex items-center gap-2 pl-11">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">API Key</span>
                  <code className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
                    {row.apiKey ? (reveal[row.id] ? row.apiKey : mask(row.apiKey)) : "not set"}
                  </code>
                  {row.apiKey && (
                    <>
                      <button onClick={() => setReveal((s) => ({ ...s, [row.id]: !s[row.id] }))} aria-label="Reveal" className="text-muted-foreground hover:text-card-foreground">
                        {reveal[row.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button onClick={() => copy(row)} aria-label="Copy" className="text-muted-foreground hover:text-card-foreground">
                        {copied === row.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title={editing ? `Configure ${editing.provider}` : ""}
        description="Set the API key and tile URL for this map provider."
        footer={
          <>
            <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">Cancel</button>
            <button type="submit" form="map-provider-form" disabled={update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70">
              {update.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </>
        }
      >
        <form id="map-provider-form" onSubmit={save} className="grid grid-cols-1 gap-4">
          {editing && !editing.keyless && (
            <TextField label="API Key / Access Token" placeholder="Paste provider API key" value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
          )}
          <TextField label="Tile URL Template" value={form.tileUrl} onChange={(e) => setForm({ ...form, tileUrl: e.target.value })} />
        </form>
      </Modal>
    </Card>
  );
}
