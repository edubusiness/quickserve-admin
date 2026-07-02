"use client";

import { useMemo, useState } from "react";
import {
  ShieldCheck,
  Clock,
  BadgeCheck,
  XCircle,
  Phone,
  FileCheck2,
  CheckCircle2,
  Ban,
  Eye,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { Modal } from "@/components/ui/modal";
import { TableSkeleton } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { useModuleCollection, useModuleMutations } from "@/hooks/use-module-collection";

const KEY = "agent-verifications";

type DocStatus = "verified" | "pending" | "rejected";
type KycStatus = "pending" | "under_review" | "verified" | "rejected";

interface Verification {
  id: string;
  name: string;
  avatar: string;
  phone: string;
  email: string;
  role: "Service Provider" | "Driver" | "Delivery Partner";
  category: string;
  aadhaarNo: string;
  aadhaarStatus: DocStatus;
  panNo: string;
  panStatus: DocStatus;
  licenseNo: string;
  licenseStatus: DocStatus | "na";
  rcNo: string;
  rcStatus: DocStatus | "na";
  tradeCert: string;
  tradeStatus: DocStatus | "na";
  bankAcc: string;
  bankIfsc: string;
  bankStatus: DocStatus;
  policeStatus: DocStatus;
  selfieStatus: DocStatus;
  kycStatus: KycStatus;
  submittedAt: string;
}

const docTone: Record<string, BadgeTone> = {
  verified: "success",
  pending: "warning",
  rejected: "danger",
  under_review: "info",
  na: "neutral",
};
const kycLabel: Record<KycStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  verified: "Verified",
  rejected: "Rejected",
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86400e3).toISOString();
const maskAadhaar = (v: string) => (v ? `XXXX XXXX ${v.slice(-4)}` : "—");

const seed: Verification[] = [
  { id: "VER-1001", name: "Ramesh Kulkarni", avatar: "https://i.pravatar.cc/80?img=11", phone: "+91 98450 11234", email: "ramesh.k@example.com", role: "Service Provider", category: "Electrician", aadhaarNo: "3921 7742 8891", aadhaarStatus: "verified", panNo: "ABCPK1234F", panStatus: "verified", licenseNo: "", licenseStatus: "na", rcNo: "", rcStatus: "na", tradeCert: "ITI-EL-2019-4471", tradeStatus: "pending", bankAcc: "50100XXXXXX221", bankIfsc: "HDFC0001234", bankStatus: "verified", policeStatus: "pending", selfieStatus: "verified", kycStatus: "under_review", submittedAt: daysAgo(1) },
  { id: "VER-1002", name: "Anita Sharma", avatar: "https://i.pravatar.cc/80?img=45", phone: "+91 99001 55678", email: "anita.s@example.com", role: "Driver", category: "Sedan", aadhaarNo: "7712 9983 1120", aadhaarStatus: "verified", panNo: "FGHPS9821K", panStatus: "pending", licenseNo: "KA0120180012345", licenseStatus: "verified", rcNo: "KA01MJ4477", rcStatus: "verified", tradeCert: "", tradeStatus: "na", bankAcc: "3312XXXXXX887", bankIfsc: "ICIC0004421", bankStatus: "pending", policeStatus: "pending", selfieStatus: "verified", kycStatus: "under_review", submittedAt: daysAgo(2) },
  { id: "VER-1003", name: "Faisal Khan", avatar: "https://i.pravatar.cc/80?img=33", phone: "+91 90080 33221", email: "faisal.k@example.com", role: "Delivery Partner", category: "Bike", aadhaarNo: "5540 1122 7788", aadhaarStatus: "pending", panNo: "LMNPK4410J", panStatus: "pending", licenseNo: "KA0520210099821", licenseStatus: "pending", rcNo: "KA05HK2299", rcStatus: "pending", tradeCert: "", tradeStatus: "na", bankAcc: "9910XXXXXX004", bankIfsc: "SBIN0009912", bankStatus: "pending", policeStatus: "pending", selfieStatus: "pending", kycStatus: "pending", submittedAt: daysAgo(0) },
  { id: "VER-1004", name: "Priya Menon", avatar: "https://i.pravatar.cc/80?img=20", phone: "+91 97411 88123", email: "priya.m@example.com", role: "Service Provider", category: "Beautician", aadhaarNo: "1290 4471 5560", aadhaarStatus: "verified", panNo: "QRSPM7781L", panStatus: "verified", licenseNo: "", licenseStatus: "na", rcNo: "", rcStatus: "na", tradeCert: "BEAUTY-CERT-2020", tradeStatus: "verified", bankAcc: "4410XXXXXX556", bankIfsc: "AXIS0004410", bankStatus: "verified", policeStatus: "verified", selfieStatus: "verified", kycStatus: "verified", submittedAt: daysAgo(5) },
  { id: "VER-1005", name: "Suresh Reddy", avatar: "https://i.pravatar.cc/80?img=52", phone: "+91 96322 44190", email: "suresh.r@example.com", role: "Driver", category: "SUV", aadhaarNo: "8801 3345 9021", aadhaarStatus: "verified", panNo: "TUVPR2210M", panStatus: "verified", licenseNo: "KA0320170045512", licenseStatus: "rejected", rcNo: "KA03PP8890", rcStatus: "pending", tradeCert: "", tradeStatus: "na", bankAcc: "2201XXXXXX773", bankIfsc: "KKBK0002201", bankStatus: "verified", policeStatus: "pending", selfieStatus: "verified", kycStatus: "rejected", submittedAt: daysAgo(3) },
  { id: "VER-1006", name: "Divya Nair", avatar: "https://i.pravatar.cc/80?img=8", phone: "+91 90190 77345", email: "divya.n@example.com", role: "Service Provider", category: "Cleaning", aadhaarNo: "6612 8890 1123", aadhaarStatus: "verified", panNo: "WXYPN5540N", panStatus: "pending", licenseNo: "", licenseStatus: "na", rcNo: "", rcStatus: "na", tradeCert: "HK-TRAIN-2021", tradeStatus: "pending", bankAcc: "7788XXXXXX221", bankIfsc: "UTIB0007788", bankStatus: "pending", policeStatus: "pending", selfieStatus: "pending", kycStatus: "pending", submittedAt: daysAgo(0) },
];

const statusBadge = (s: string) => (
  <Badge tone={docTone[s] ?? "neutral"} className="capitalize">
    {s === "na" ? "N/A" : s === "under_review" ? "Review" : s}
  </Badge>
);

export default function AgentVerificationPage() {
  const { data: rows = [], isLoading } = useModuleCollection(KEY, seed as unknown as Record<string, unknown>[]);
  const { update } = useModuleMutations(KEY);
  const { toast } = useToast();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const list = rows as unknown as Verification[];
  const current = useMemo(() => list.find((r) => r.id === selectedId) ?? null, [list, selectedId]);

  const stats = useMemo(() => {
    const by = (s: KycStatus) => list.filter((r) => r.kycStatus === s).length;
    return { pending: by("pending"), review: by("under_review"), verified: by("verified"), rejected: by("rejected") };
  }, [list]);

  // Which document fields apply to a given role.
  const docsFor = (v: Verification) => {
    const base = [
      { key: "aadhaarStatus", label: "Aadhaar Card", value: maskAadhaar(v.aadhaarNo) },
      { key: "panStatus", label: "PAN Card", value: v.panNo },
      { key: "selfieStatus", label: "Selfie / Face Match", value: "Photo vs Aadhaar" },
      { key: "bankStatus", label: "Bank Account", value: `${v.bankAcc} · ${v.bankIfsc}` },
      { key: "policeStatus", label: "Police Verification", value: "Background check" },
    ];
    if (v.role === "Service Provider") base.splice(2, 0, { key: "tradeStatus", label: "Trade / Skill Certificate", value: v.tradeCert || "—" });
    else {
      base.splice(2, 0, { key: "licenseStatus", label: "Driving License", value: v.licenseNo });
      base.splice(3, 0, { key: "rcStatus", label: "Vehicle RC", value: v.rcNo });
    }
    return base as { key: keyof Verification; label: string; value: string }[];
  };

  const setDoc = (v: Verification, field: keyof Verification, status: DocStatus) =>
    update.mutate(
      { id: v.id, body: { [field]: status, kycStatus: "under_review" } },
      { onError: () => toast({ title: "Update failed", variant: "error" }) },
    );

  const approve = (v: Verification) => {
    const patch: Record<string, unknown> = { kycStatus: "verified" };
    for (const d of docsFor(v)) patch[d.key] = "verified";
    update.mutate({ id: v.id, body: patch }, {
      onSuccess: () => { setSelectedId(null); toast({ title: "Agent verified", description: `${v.name} is approved and can go live.` }); },
      onError: () => toast({ title: "Approval failed", variant: "error" }),
    });
  };

  const reject = (v: Verification) =>
    update.mutate({ id: v.id, body: { kycStatus: "rejected" } }, {
      onSuccess: () => { setSelectedId(null); toast({ title: "Application rejected", description: `${v.name} was not approved.`, variant: "error" }); },
      onError: () => toast({ title: "Rejection failed", variant: "error" }),
    });

  const columns: Column<Verification>[] = [
    {
      key: "name", header: "Applicant", sortable: true,
      render: (v) => (
        <div className="flex items-center gap-2.5">
          <img src={v.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
          <div>
            <p className="font-medium text-card-foreground">{v.name}</p>
            <p className="text-xs text-muted-foreground">{v.role} · {v.category}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone", header: "Phone",
      render: (v) => (
        <a href={`tel:${v.phone.replace(/[^\d+]/g, "")}`} className="inline-flex items-center gap-1 whitespace-nowrap font-medium text-[var(--accent)] hover:underline">
          <Phone className="h-3.5 w-3.5" />{v.phone}
        </a>
      ),
    },
    { key: "aadhaarStatus", header: "Aadhaar", sortable: true, render: (v) => statusBadge(v.aadhaarStatus) },
    { key: "panStatus", header: "PAN", sortable: true, render: (v) => statusBadge(v.panStatus) },
    { key: "bankStatus", header: "Bank", sortable: true, render: (v) => statusBadge(v.bankStatus) },
    { key: "policeStatus", header: "Background", sortable: true, render: (v) => statusBadge(v.policeStatus) },
    {
      key: "kycStatus", header: "KYC Status", sortable: true,
      render: (v) => <Badge tone={docTone[v.kycStatus]}>{kycLabel[v.kycStatus]}</Badge>,
    },
    {
      key: "__actions", header: "", exportable: false,
      render: (v) => (
        <div className="flex justify-end gap-1">
          <button onClick={() => setSelectedId(v.id)} aria-label={`Review ${v.name}`} title="Review documents" className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-card-foreground">
            <Eye className="h-4 w-4" />
          </button>
          {v.kycStatus !== "verified" && (
            <button onClick={() => approve(v)} aria-label={`Approve ${v.name}`} title="Approve" className="grid h-8 w-8 place-items-center rounded-lg text-emerald-400 transition-colors hover:bg-emerald-500/10">
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
          {v.kycStatus !== "rejected" && (
            <button onClick={() => reject(v)} aria-label={`Reject ${v.name}`} title="Reject" className="grid h-8 w-8 place-items-center rounded-lg text-rose-400 transition-colors hover:bg-rose-500/10">
              <Ban className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Agent Verification (KYC)"
        subtitle="Verify identity, eligibility and background of new service providers, drivers and delivery partners before they go live."
      />

      <StatCards
        stats={[
          { label: "Pending", value: stats.pending, tone: "warning", icon: Clock },
          { label: "Under Review", value: stats.review, tone: "primary", icon: FileCheck2 },
          { label: "Verified", value: stats.verified, tone: "success", icon: BadgeCheck },
          { label: "Rejected", value: stats.rejected, tone: "danger", icon: XCircle },
        ]}
      />

      {isLoading ? (
        <TableSkeleton />
      ) : (
        <DataTable
          data={list}
          columns={columns}
          getRowId={(v) => v.id}
          pageSize={10}
          searchKeys={["id", "name", "role", "category", "phone", "aadhaarNo", "panNo"]}
          filterFields={[
            { key: "kycStatus", label: "KYC Status", type: "select", options: ["pending", "under_review", "verified", "rejected"] },
            { key: "role", label: "Role", type: "select", options: ["Service Provider", "Driver", "Delivery Partner"] },
          ]}
          searchPlaceholder="Search applicants, Aadhaar, PAN..."
          exportName="agent-verifications"
          renderCard={(v) => (
            <Card className="p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <img src={v.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{v.name}</p>
                    <p className="text-xs text-muted-foreground">{v.role} · {v.category}</p>
                  </div>
                </div>
                <Badge tone={docTone[v.kycStatus]}>{kycLabel[v.kycStatus]}</Badge>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-muted-foreground">Aadhaar</span>{statusBadge(v.aadhaarStatus)}
                <span className="ml-1 text-muted-foreground">PAN</span>{statusBadge(v.panStatus)}
                <span className="ml-1 text-muted-foreground">Bank</span>{statusBadge(v.bankStatus)}
              </div>
              <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
                <button onClick={() => setSelectedId(v.id)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-[var(--accent)] hover:bg-[var(--primary)]/10">Review</button>
                {v.kycStatus !== "verified" && <button onClick={() => approve(v)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10">Approve</button>}
                {v.kycStatus !== "rejected" && <button onClick={() => reject(v)} className="rounded-lg px-2.5 py-1.5 text-xs font-medium text-rose-400 hover:bg-rose-500/10">Reject</button>}
              </div>
            </Card>
          )}
        />
      )}

      {/* Review drawer */}
      <Modal
        open={!!current}
        onClose={() => setSelectedId(null)}
        title={current ? `Verify ${current.name}` : ""}
        description={current ? `${current.role} · ${current.category} · submitted ${new Date(current.submittedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}` : ""}
        footer={
          current && (
            <>
              <button onClick={() => reject(current)} className="inline-flex items-center gap-2 rounded-xl border border-rose-500/40 px-4 py-2.5 text-sm font-medium text-rose-400 transition-colors hover:bg-rose-500/10">
                <Ban className="h-4 w-4" /> Reject
              </button>
              <button onClick={() => approve(current)} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[var(--primary)]/30 transition-transform hover:-translate-y-0.5">
                <ShieldCheck className="h-4 w-4" /> Approve &amp; Verify
              </button>
            </>
          )
        }
      >
        {current && (
          <div className="space-y-2.5">
            {docsFor(current).map((d) => {
              const status = current[d.key] as string;
              return (
                <div key={String(d.key)} className="flex flex-col gap-2 rounded-xl border border-border p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-card-foreground">{d.label}</p>
                    <p className="truncate font-mono text-xs text-muted-foreground">{d.value}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {statusBadge(status)}
                    {status !== "na" && (
                      <div className="flex gap-1">
                        <button onClick={() => setDoc(current, d.key, "verified")} className="rounded-lg px-2 py-1 text-xs font-medium text-emerald-400 hover:bg-emerald-500/10">Verify</button>
                        <button onClick={() => setDoc(current, d.key, "rejected")} className="rounded-lg px-2 py-1 text-xs font-medium text-rose-400 hover:bg-rose-500/10">Reject</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Modal>
    </div>
  );
}
