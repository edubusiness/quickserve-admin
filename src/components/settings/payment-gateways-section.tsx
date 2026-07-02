"use client";

import { useEffect, useState } from "react";
import { CreditCard, Plus, Eye, EyeOff, Copy, Check, Trash2, Pencil, Loader2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Modal } from "@/components/ui/modal";
import { TextField, SelectField } from "@/components/ui/form-field";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";

const KEY = "payment-gateways";

const providers = ["Razorpay", "Stripe", "PayPal", "Paytm", "Cashfree", "PhonePe"];

const seedRows = [
  { id: "PG-1", provider: "Razorpay", apiKey: "rzp_live_R4nd0mKey1234", secretKey: "rzp_sec_9f8a7b6c5d4e3f21", mode: "live", webhook: "https://api.quickserve.io/webhooks/razorpay", enabled: true },
  { id: "PG-2", provider: "Stripe", apiKey: "pk_live_51QsRvZ2eZvKYlo2C", secretKey: "sk_live_51QsRvZ2eZvKYlo2C7h", mode: "live", webhook: "https://api.quickserve.io/webhooks/stripe", enabled: true },
  { id: "PG-3", provider: "Paytm", apiKey: "PAYTM_MID_9823471", secretKey: "ptm_sec_a1b2c3d4e5f6", mode: "test", webhook: "https://api.quickserve.io/webhooks/paytm", enabled: false },
];

interface GatewayRow {
  id: string;
  provider: string;
  apiKey: string;
  secretKey: string;
  mode: string;
  webhook: string;
  enabled: boolean;
}

const blank = { provider: "Razorpay", apiKey: "", secretKey: "", mode: "test", webhook: "", enabled: true };

function mask(v: string) {
  if (!v) return "—";
  if (v.length <= 8) return "••••";
  return `${v.slice(0, 6)}${"•".repeat(8)}${v.slice(-4)}`;
}

export function PaymentGatewaysSection() {
  const { data: gateways = [], isLoading } = useModuleCollection(KEY, seedRows);
  const { create, update, remove } = useModuleMutations(KEY);
  const { toast } = useToast();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GatewayRow | null>(null);
  const [form, setForm] = useState(blank);
  const [reveal, setReveal] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (modalOpen) setForm(editing ? { ...blank, ...editing } : blank);
  }, [modalOpen, editing]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (g: GatewayRow) => { setEditing(g); setModalOpen(true); };

  const copy = async (g: GatewayRow) => {
    try {
      await navigator.clipboard.writeText(g.apiKey);
      setCopied(g.id);
      setTimeout(() => setCopied((c) => (c === g.id ? null : c)), 1500);
    } catch {
      toast({ title: "Couldn't copy", variant: "error" });
    }
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.apiKey.trim() || !form.secretKey.trim()) {
      toast({ title: "API key and secret are required", variant: "error" });
      return;
    }
    const body = { provider: form.provider, apiKey: form.apiKey.trim(), secretKey: form.secretKey.trim(), mode: form.mode, webhook: form.webhook.trim(), enabled: form.enabled };
    if (editing) {
      update.mutate({ id: editing.id, body }, {
        onSuccess: () => { setModalOpen(false); toast({ title: "Gateway updated", description: `${form.provider} saved.` }); },
        onError: () => toast({ title: "Update failed", variant: "error" }),
      });
    } else {
      create.mutate(body, {
        onSuccess: () => { setModalOpen(false); toast({ title: "Gateway added", description: `${form.provider} configured.` }); },
        onError: () => toast({ title: "Create failed", variant: "error" }),
      });
    }
  };

  const toggleEnabled = (g: GatewayRow) =>
    update.mutate({ id: g.id, body: { enabled: !g.enabled } }, {
      onSuccess: () => toast({ title: g.enabled ? "Gateway disabled" : "Gateway enabled", description: g.provider }),
    });

  const del = (g: GatewayRow) =>
    remove.mutate(g.id, {
      onSuccess: () => toast({ title: "Gateway removed", description: `${g.provider} deleted.` }),
      onError: () => toast({ title: "Delete failed", variant: "error" }),
    });

  return (
    <Card className="p-5">
      <CardHeader
        title="Payment Gateways"
        action={
          <button onClick={openCreate} className="inline-flex items-center gap-1.5 rounded-xl bg-[var(--primary)]/15 px-3 py-1.5 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--primary)]/25">
            <Plus className="h-3.5 w-3.5" /> Add Gateway
          </button>
        }
      />
      <p className="mt-1 text-xs text-muted-foreground">Configure providers used to collect payments and issue payouts.</p>

      {isLoading ? (
        <div className="mt-4 space-y-2">{[0, 1].map((i) => <div key={i} className="skeleton h-20 rounded-xl" />)}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {(gateways as GatewayRow[]).map((g) => (
            <div key={g.id} className="rounded-xl border border-border p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)]/15 text-[var(--accent)]">
                    <CreditCard className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="flex items-center gap-2 text-sm font-medium text-card-foreground">
                      {g.provider}
                      <Badge tone={g.mode === "live" ? "success" : "neutral"} className="uppercase">{g.mode}</Badge>
                      <Badge tone={g.enabled ? "success" : "danger"}>{g.enabled ? "enabled" : "disabled"}</Badge>
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{g.webhook || "No webhook set"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={g.enabled} onChange={() => toggleEnabled(g)} label={`Enable ${g.provider}`} />
                  <button onClick={() => openEdit(g)} title="Edit" aria-label={`Edit ${g.provider}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => del(g)} title="Delete" aria-label={`Delete ${g.provider}`} className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">API Key</span>
                  <code className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{reveal[g.id] ? g.apiKey : mask(g.apiKey)}</code>
                  <button onClick={() => setReveal((s) => ({ ...s, [g.id]: !s[g.id] }))} aria-label="Reveal" className="text-muted-foreground hover:text-card-foreground">
                    {reveal[g.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button onClick={() => copy(g)} aria-label="Copy API key" className="text-muted-foreground hover:text-card-foreground">
                    {copied === g.id ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground">Secret</span>
                  <code className="truncate rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">{reveal[g.id] ? g.secretKey : mask(g.secretKey)}</code>
                </div>
              </div>
            </div>
          ))}
          {gateways.length === 0 && <p className="py-6 text-center text-sm text-muted-foreground">No payment gateways configured yet.</p>}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.provider}` : "Add Payment Gateway"}
        description="Enter the provider credentials and webhook endpoint."
        footer={
          <>
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-sm text-muted-foreground transition-colors hover:text-card-foreground">Cancel</button>
            <button type="submit" form="gateway-form" disabled={create.isPending || update.isPending} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5 disabled:opacity-70">
              {(create.isPending || update.isPending) && <Loader2 className="h-4 w-4 animate-spin" />}
              Save
            </button>
          </>
        }
      >
        <form id="gateway-form" onSubmit={submit} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField label="Provider" options={providers} value={form.provider} onChange={(e) => setForm({ ...form, provider: e.target.value })} />
          <SelectField label="Mode" options={["test", "live"]} value={form.mode} onChange={(e) => setForm({ ...form, mode: e.target.value })} />
          <div className="sm:col-span-2">
            <TextField label="API Key / Key ID" required placeholder="rzp_live_..." value={form.apiKey} onChange={(e) => setForm({ ...form, apiKey: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <TextField label="Secret Key" required placeholder="••••••••" value={form.secretKey} onChange={(e) => setForm({ ...form, secretKey: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <TextField label="Webhook URL" placeholder="https://api.quickserve.io/webhooks/..." value={form.webhook} onChange={(e) => setForm({ ...form, webhook: e.target.value })} />
          </div>
          <label className="flex items-center gap-2.5 sm:col-span-2">
            <Switch checked={form.enabled} onChange={(v) => setForm({ ...form, enabled: v })} label="Enabled" />
            <span className="text-sm text-card-foreground">Enable this gateway</span>
          </label>
        </form>
      </Modal>
    </Card>
  );
}
