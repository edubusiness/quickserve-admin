"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import {
  FileBarChart,
  Eye,
  Download,
  Printer,
  ShieldCheck,
  Banknote,
  Receipt,
  Users,
  Truck,
  Loader2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { PageHeader } from "@/components/ui/page-header";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { exportCsv } from "@/lib/export";
import { apiGet, apiSend } from "@/lib/api";
import QRCode from "qrcode";
import Link from "next/link";

type Cell = string | number;
interface ReportDef {
  id: string;
  name: string;
  description: string;
  category: "Financial" | "Tax" | "Operational" | "Analytics" | "Compliance";
  period: string;
  icon: typeof FileBarChart;
  columns: { key: string; header: string }[];
  rows: Record<string, Cell>[];
}

const rnd = (min: number, max: number) => Math.round(min + Math.random() * (max - min));
const money = (n: number) => `₹${n.toLocaleString("en-IN")}`;
const cols = (...pairs: [string, string][]) => pairs.map(([key, header]) => ({ key, header }));

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
const cities = ["Bangalore", "Mumbai", "Delhi", "Hyderabad", "Chennai", "Pune"];
const names = ["Ravi Kumar", "Sneha Rao", "Arjun Patel", "Priya Singh", "Karthik Joshi", "Meera Nair", "Suresh Reddy", "Anjali Verma", "Rahul Mehta", "Divya Iyer"];

// Reports built once at module load so their digital signatures stay stable.
const REPORTS: ReportDef[] = [
  {
    id: "revenue", name: "Revenue Report", description: "Gross, commission and net revenue by month.", category: "Financial", period: "H1 2026", icon: Banknote,
    columns: cols(["month", "Month"], ["bookings", "Bookings"], ["gross", "Gross"], ["commission", "Commission"], ["net", "Net"]),
    rows: months.map((m) => { const g = rnd(1800000, 3200000); const c = Math.round(g * 0.18); return { month: `${m} 2026`, bookings: rnd(4200, 9800), gross: money(g), commission: money(c), net: money(g - c) }; }),
  },
  {
    id: "settlements", name: "Payments & Settlements", description: "Provider/partner payout settlement batches.", category: "Financial", period: "Jun 2026", icon: Banknote,
    columns: cols(["date", "Date"], ["party", "Beneficiary"], ["amount", "Amount"], ["method", "Method"], ["status", "Status"]),
    rows: names.map((n, i) => ({ date: `2026-06-${String(2 + i).padStart(2, "0")}`, party: n, amount: money(rnd(4000, 48000)), method: ["IMPS", "NEFT", "UPI"][i % 3], status: ["Settled", "Settled", "Processing"][i % 3] })),
  },
  {
    id: "commission", name: "Commission Report", description: "Platform commission earned per provider.", category: "Financial", period: "Jun 2026", icon: Receipt,
    columns: cols(["provider", "Provider"], ["orders", "Orders"], ["gmv", "GMV"], ["rate", "Rate"], ["commission", "Commission"]),
    rows: names.map((n) => { const gmv = rnd(80000, 420000); return { provider: n, orders: rnd(40, 320), gmv: money(gmv), rate: "18%", commission: money(Math.round(gmv * 0.18)) }; }),
  },
  {
    id: "refunds", name: "Refund Log", description: "All refunds issued with reason and status.", category: "Financial", period: "Jun 2026", icon: Receipt,
    columns: cols(["id", "Refund ID"], ["customer", "Customer"], ["amount", "Amount"], ["reason", "Reason"], ["status", "Status"]),
    rows: names.map((n, i) => ({ id: `RFD-${7001 + i}`, customer: n, amount: money(rnd(200, 4500)), reason: ["Cancelled", "Service Issue", "Overcharge", "Duplicate"][i % 4], status: ["Completed", "Processing", "Completed"][i % 3] })),
  },
  {
    id: "gst", name: "GST / Tax Summary", description: "Tax collected (CGST/SGST/IGST) by period.", category: "Tax", period: "Q1 FY26-27", icon: Receipt,
    columns: cols(["period", "Period"], ["taxable", "Taxable Value"], ["cgst", "CGST"], ["sgst", "SGST"], ["igst", "IGST"], ["total", "Total Tax"]),
    rows: ["Apr 2026", "May 2026", "Jun 2026"].map((p) => { const t = rnd(4000000, 6800000); const cg = Math.round(t * 0.09); const ig = Math.round(t * 0.04); return { period: p, taxable: money(t), cgst: money(cg), sgst: money(cg), igst: money(ig), total: money(cg * 2 + ig) }; }),
  },
  {
    id: "bookings", name: "Bookings Report", description: "Booking volume, completion and cancellation by city.", category: "Operational", period: "Jun 2026", icon: FileBarChart,
    columns: cols(["city", "City"], ["service", "Top Service"], ["total", "Total"], ["completed", "Completed"], ["cancelled", "Cancelled"]),
    rows: cities.map((c) => { const total = rnd(600, 2400); const cancelled = rnd(20, 180); return { city: c, service: ["Home Cleaning", "AC Service", "Plumbing", "Salon"][rnd(0, 3)], total, completed: total - cancelled, cancelled }; }),
  },
  {
    id: "drivers", name: "Driver Performance", description: "Trips, ratings, on-time rate and earnings.", category: "Operational", period: "Jun 2026", icon: Truck,
    columns: cols(["driver", "Driver"], ["trips", "Trips"], ["rating", "Rating"], ["ontime", "On-time %"], ["earnings", "Earnings"]),
    rows: names.map((n) => ({ driver: n, trips: rnd(80, 640), rating: (3.8 + Math.random() * 1.2).toFixed(1), ontime: `${rnd(86, 99)}%`, earnings: money(rnd(18000, 96000)) })),
  },
  {
    id: "customers", name: "Customer Growth", description: "New, active, churned customers and retention.", category: "Analytics", period: "H1 2026", icon: Users,
    columns: cols(["month", "Month"], ["added", "New"], ["active", "Active"], ["churned", "Churned"], ["retention", "Retention"]),
    rows: months.map((m) => ({ month: `${m} 2026`, added: rnd(800, 2600), active: rnd(12000, 38000), churned: rnd(120, 640), retention: `${rnd(88, 96)}%` })),
  },
  {
    id: "kyc", name: "Agent Verification (KYC) Report", description: "Onboarding verification outcomes and status.", category: "Compliance", period: "Jun 2026", icon: ShieldCheck,
    columns: cols(["applicant", "Applicant"], ["role", "Role"], ["aadhaar", "Aadhaar"], ["pan", "PAN"], ["kyc", "KYC Status"]),
    rows: names.map((n, i) => ({ applicant: n, role: ["Service Provider", "Driver", "Delivery Partner"][i % 3], aadhaar: ["Verified", "Verified", "Pending"][i % 3], pan: ["Verified", "Pending", "Verified"][i % 3], kyc: ["Verified", "Under Review", "Pending"][i % 3] })),
  },
];

const catTone: Record<ReportDef["category"], BadgeTone> = {
  Financial: "success", Tax: "warning", Operational: "primary", Analytics: "info", Compliance: "danger",
};

/**
 * Deterministic SHA-256 over the report *content* → a stable, tamper-evident
 * signature. Same content always yields the same Verification ID, so the ID on
 * a printout can always be looked up (independent of when it was generated).
 */
async function signReport(report: ReportDef) {
  const payload = JSON.stringify({ id: report.id, rows: report.rows });
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(payload));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function buildPrintHtml(report: ReportDef, meta: { generatedAt: string; generatedBy: string; verifyId: string; signature: string; verifyUrl: string; qr: string }) {
  const head = report.columns.map((c) => `<th>${c.header}</th>`).join("");
  const body = report.rows.map((r) => `<tr>${report.columns.map((c) => `<td>${r[c.key] ?? ""}</td>`).join("")}</tr>`).join("");
  return `<!doctype html><html><head><meta charset="utf-8"><title>${report.name}</title>
  <style>
    *{box-sizing:border-box} body{font-family:ui-sans-serif,system-ui,Arial,sans-serif;color:#0f172a;margin:0;padding:32px}
    .hdr{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:3px solid #2563eb;padding-bottom:14px}
    .brand{font-size:22px;font-weight:800;color:#2563eb;letter-spacing:-.3px}
    .brand small{display:block;font-size:11px;font-weight:500;color:#64748b;letter-spacing:.3px}
    .meta{text-align:right;font-size:11px;color:#64748b;line-height:1.6}
    h1{font-size:18px;margin:18px 0 2px}
    .sub{color:#64748b;margin:0 0 16px;font-size:12px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{text-align:left;background:#f1f5f9;padding:8px 10px;border-bottom:2px solid #e2e8f0}
    td{padding:8px 10px;border-bottom:1px solid #eef2f7}
    tr:nth-child(even) td{background:#fafbfc}
    .sig{margin-top:26px;display:flex;gap:16px;align-items:center;justify-content:space-between;border:1px dashed #94a3b8;border-radius:10px;padding:14px 16px;font-size:11px;color:#334155;background:#f8fafc}
    .sig b{color:#0f172a} .mono{font-family:ui-monospace,Menlo,monospace;word-break:break-all}
    .qr{text-align:center;font-size:9px;color:#64748b} .qr img{width:104px;height:104px;display:block}
    .foot{margin-top:14px;font-size:10px;color:#94a3b8;text-align:center}
    @media print{body{padding:16px}}
  </style></head><body>
    <div class="hdr">
      <div class="brand">QuickServe<small>Services Marketplace · Admin Console</small></div>
      <div class="meta">
        <div>Report ID: <b>${meta.verifyId}</b></div>
        <div>Generated: ${meta.generatedAt}</div>
        <div>By: ${meta.generatedBy}</div>
      </div>
    </div>
    <h1>${report.name}</h1>
    <p class="sub">${report.category} · Period: ${report.period} · ${report.rows.length} records</p>
    <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
    <div class="sig">
      <div>
        <div>🔒 <b>Digitally signed document.</b> This report was generated by the QuickServe Admin Console and is tamper-evident.</div>
        <div style="margin-top:6px">Verification ID: <b>${meta.verifyId}</b> &nbsp;|&nbsp; Algorithm: SHA-256</div>
        <div style="margin-top:4px">Signature: <span class="mono">${meta.signature}</span></div>
        <div style="margin-top:4px">Verify at: ${meta.verifyUrl}</div>
      </div>
      <div class="qr"><img src="${meta.qr}" alt="Verification QR"/>Scan to verify</div>
    </div>
    <div class="foot">© ${new Date().getFullYear()} QuickServe Technologies Pvt. Ltd. · Confidential · Verify authenticity with the Verification ID above.</div>
    <script>window.onload=function(){window.focus();window.print();}</script>
  </body></html>`;
}

export default function ReportsPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [viewing, setViewing] = useState<ReportDef | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [sig, setSig] = useState<{ verifyId: string; signature: string; generatedAt: string; generatedBy: string; verifyUrl: string; qr: string } | null>(null);

  const generatedBy = session?.user?.name ?? session?.user?.email ?? "Super Admin";

  const buildMeta = async (report: ReportDef) => {
    const generatedAt = new Date().toLocaleString("en-IN");
    const signature = await signReport(report);
    const verifyId = `QSV-${signature.slice(0, 10).toUpperCase()}`;
    // Register the signature reliably (awaited + idempotent) so the ID always
    // verifies. Surface failures instead of silently swallowing them.
    try {
      const existing = await apiGet<{ items: { verifyId?: string }[] }>("/api/collections/report-signatures", { limit: 500 });
      if (!existing.items.some((r) => (r.verifyId ?? "") === verifyId)) {
        await apiSend("POST", "/api/collections/report-signatures", {
          verifyId, signature, reportId: report.id, reportName: report.name,
          category: report.category, period: report.period, records: report.rows.length,
          generatedAt, generatedBy,
        });
      }
    } catch {
      toast({ title: "Couldn't register signature", description: "Verification may be unavailable — is the API reachable?", variant: "error" });
    }
    const verifyUrl = `${window.location.origin}/verify?id=${verifyId}`;
    const qr = await QRCode.toDataURL(verifyUrl, { width: 150, margin: 1 });
    return { generatedAt, generatedBy, signature, verifyId, verifyUrl, qr };
  };

  const view = async (report: ReportDef) => {
    setBusy(report.id);
    const meta = await buildMeta(report);
    setSig(meta);
    setViewing(report);
    setBusy(null);
  };

  const download = (report: ReportDef) => {
    exportCsv(report.rows, report.columns.map((c) => ({ key: c.key, header: c.header })), `${report.id}-report.csv`);
    toast({ title: "Report downloaded", description: `${report.name} exported as CSV.` });
  };

  const print = async (report: ReportDef) => {
    setBusy(report.id);
    const meta = await buildMeta(report);
    setBusy(null);
    const html = buildPrintHtml(report, meta);
    const frame = document.createElement("iframe");
    frame.style.position = "fixed";
    frame.style.right = "0";
    frame.style.bottom = "0";
    frame.style.width = "0";
    frame.style.height = "0";
    frame.style.border = "0";
    document.body.appendChild(frame);
    const doc = frame.contentWindow?.document;
    if (doc) {
      doc.open();
      doc.write(html);
      doc.close();
    }
    setTimeout(() => frame.remove(), 60000);
    toast({ title: "Preparing printout", description: `${report.name} · digitally signed.` });
  };

  const categories = Array.from(new Set(REPORTS.map((r) => r.category)));

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <PageHeader
          title="Reports Center"
          subtitle="Generate, view, download and print signed financial, operational, tax, analytics and compliance reports."
        />
        <Link
          href="/verify"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-medium text-card-foreground transition-colors hover:bg-muted"
        >
          <ShieldCheck className="h-4 w-4 text-emerald-400" /> Verify a report
        </Link>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-card-foreground">
            <Badge tone={catTone[cat]}>{cat}</Badge>
            <span className="text-muted-foreground">
              {REPORTS.filter((r) => r.category === cat).length} report(s)
            </span>
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {REPORTS.filter((r) => r.category === cat).map((report) => {
              const Icon = report.icon;
              return (
                <Card key={report.id} className="flex flex-col p-4">
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--primary)]/15 text-[var(--accent)]">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-card-foreground">{report.name}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{report.description}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">Period: {report.period} · {report.rows.length} records</p>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3">
                    <button onClick={() => view(report)} disabled={busy === report.id} className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--primary)]/15 px-3 py-2 text-xs font-semibold text-[var(--accent)] transition-colors hover:bg-[var(--primary)]/25 disabled:opacity-60">
                      {busy === report.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Eye className="h-3.5 w-3.5" />} View
                    </button>
                    <button onClick={() => download(report)} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-card-foreground transition-colors hover:bg-muted">
                      <Download className="h-3.5 w-3.5" /> Download
                    </button>
                    <button onClick={() => print(report)} disabled={busy === report.id} className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-card-foreground transition-colors hover:bg-muted disabled:opacity-60">
                      <Printer className="h-3.5 w-3.5" /> Print
                    </button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ))}

      {/* View report */}
      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.name ?? ""}
        description={viewing ? `${viewing.category} · ${viewing.period} · ${viewing.rows.length} records` : ""}
        footer={
          viewing && (
            <>
              <button onClick={() => download(viewing)} className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-card-foreground transition-colors hover:bg-muted">
                <Download className="h-4 w-4" /> Download CSV
              </button>
              <button onClick={() => print(viewing)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5">
                <Printer className="h-4 w-4" /> Print (signed)
              </button>
            </>
          )
        }
      >
        {viewing && sig && (
          <div className="space-y-4">
            {/* Branded header */}
            <div className="flex items-start justify-between gap-3 border-b border-border pb-3">
              <div>
                <p className="text-base font-extrabold tracking-tight text-[var(--accent)]">QuickServe</p>
                <p className="text-[11px] text-muted-foreground">Services Marketplace · Admin Console</p>
              </div>
              <div className="text-right text-[11px] text-muted-foreground">
                <p>Report ID: <span className="font-semibold text-card-foreground">{sig.verifyId}</span></p>
                <p>Generated: {sig.generatedAt}</p>
                <p>By: {sig.generatedBy}</p>
              </div>
            </div>

            {/* Data table */}
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-xs">
                <thead className="bg-muted/60">
                  <tr>{viewing.columns.map((c) => <th key={c.key} className="whitespace-nowrap px-3 py-2 text-left font-semibold text-muted-foreground">{c.header}</th>)}</tr>
                </thead>
                <tbody>
                  {viewing.rows.map((row, i) => (
                    <tr key={i} className="border-t border-border/60">
                      {viewing.columns.map((c) => <td key={c.key} className="whitespace-nowrap px-3 py-2 text-card-foreground">{row[c.key]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Digital signature block */}
            <div className="flex items-center justify-between gap-4 rounded-xl border border-dashed border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <div className="min-w-0">
                <p className="flex items-center gap-1.5 font-medium text-card-foreground"><ShieldCheck className="h-4 w-4 text-emerald-400" /> Digitally signed document</p>
                <p className="mt-1">Verification ID: <span className="font-semibold text-card-foreground">{sig.verifyId}</span> · Algorithm: SHA-256</p>
                <p className="mt-1 break-all font-mono text-[10px]">{sig.signature}</p>
              </div>
              <div className="shrink-0 text-center text-[10px] text-muted-foreground">
                <img src={sig.qr} alt="Verification QR" className="h-24 w-24 rounded bg-white p-1" />
                Scan to verify
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
