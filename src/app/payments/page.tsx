"use client";

import { useMemo, useState } from "react";
import { IndianRupee, Wallet, Clock, RotateCcw, Download, Receipt } from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DataTable, type Column } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatCards } from "@/components/ui/stat-cards";
import { type Payment, type PaymentStatus } from "@/data/finance";
import { usePayments, usePaginatedResource } from "@/hooks/use-resources";
import { useResourceMutations } from "@/hooks/use-mutations";
import { TableSkeleton, ErrorState } from "@/components/ui/table-skeleton";
import { useToast } from "@/components/ui/toast";
import { exportPdf } from "@/lib/export";
import { formatCurrency } from "@/lib/utils";

const statusTone: Record<PaymentStatus, BadgeTone> = {
  success: "success",
  pending: "warning",
  failed: "danger",
  refunded: "info",
};

export default function PaymentsPage() {
  const [params, setParams] = useState<Record<string, string>>({});
  // Full set (stat cards + receipt export) + server-driven page (table).
  const { data: payments = [] } = usePayments();
  const paged = usePaginatedResource<Payment>("payments", "/api/payments", params);
  const rows = paged.data?.items ?? [];
  const { update, bulk } = useResourceMutations<Payment>("payments", "/api/payments");
  const { toast } = useToast();

  const refund = (p: Payment) =>
    update.mutate(
      { id: p.id, body: { status: "refunded" } },
      {
        onSuccess: () => toast({ title: "Refund issued", description: `${formatCurrency(p.amount)} refunded to ${p.customer}.` }),
        onError: () => toast({ title: "Refund failed", variant: "error" }),
      },
    );

  const bulkRefund = (ids: string[]) =>
    bulk.mutate(
      { ids, action: "update", patch: { status: "refunded" } },
      {
        onSuccess: () => toast({ title: "Refunds issued", description: `${ids.length} transaction(s) refunded.` }),
        onError: () => toast({ title: "Bulk refund failed", variant: "error" }),
      },
    );

  const downloadReceipts = (ids: string[]) => {
    const rows = payments.filter((p) => ids.includes(p.id));
    exportPdf(
      rows as unknown as Record<string, unknown>[],
      [
        { key: "id", header: "Txn" },
        { key: "customer", header: "Customer" },
        { key: "service", header: "Service" },
        { key: "method", header: "Method" },
        { key: "amount", header: "Amount" },
        { key: "fee", header: "Fee" },
        { key: "status", header: "Status" },
        { key: "date", header: "Date" },
      ],
      "payment-receipts",
    );
    toast({ title: "Receipts downloaded", description: `${rows.length} receipt(s) exported.`, variant: "info" });
  };

  const paymentSummary = useMemo(() => {
    const success = payments.filter((p) => p.status === "success");
    const gross = success.reduce((a, p) => a + p.amount, 0);
    const fees = success.reduce((a, p) => a + p.fee, 0);
    return {
      gross,
      net: gross - fees,
      fees,
      pending: payments.filter((p) => p.status === "pending").length,
      failed: payments.filter((p) => p.status === "failed").length,
      refunded: payments.filter((p) => p.status === "refunded").length,
    };
  }, [payments]);

  const columns: Column<Payment>[] = [
    {
      key: "id",
      header: "Transaction",
      sortable: true,
      render: (p) => (
        <span className="font-mono text-xs font-medium text-[var(--accent)]">#{p.id}</span>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      sortable: true,
      render: (p) => (
        <div className="flex items-center gap-2.5">
          <img src={p.avatar} alt="" className="h-8 w-8 rounded-full object-cover" />
          <div>
            <p className="font-medium text-card-foreground">{p.customer}</p>
            <p className="text-xs text-muted-foreground">{p.service}</p>
          </div>
        </div>
      ),
    },
    { key: "method", header: "Method", sortable: true },
    {
      key: "amount",
      header: "Amount",
      sortable: true,
      align: "right",
      render: (p) => (
        <span className="font-medium text-card-foreground">{formatCurrency(p.amount)}</span>
      ),
    },
    {
      key: "fee",
      header: "Fee",
      sortable: true,
      align: "right",
      render: (p) => <span className="text-muted-foreground">{formatCurrency(p.fee)}</span>,
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (p) => (
        <Badge tone={statusTone[p.status]} className="capitalize">
          {p.status}
        </Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      sortable: true,
      value: (p) => p.date,
      render: (p) => (
        <span className="whitespace-nowrap text-muted-foreground">
          {new Date(p.date).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      ),
    },
    {
      key: "__actions",
      header: "",
      exportable: false,
      render: (p) =>
        p.status === "success" ? (
          <button
            onClick={() => refund(p)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-rose-500/40 hover:text-rose-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Refund
          </button>
        ) : null,
    },
  ];

  return (
    <div className="mx-auto max-w-[1600px] space-y-5">
      <PageHeader
        title="Payments"
        subtitle="Monitor every transaction, settlement and platform fee in real time."
      />

      <StatCards
        stats={[
          {
            label: "Gross Volume",
            value: paymentSummary.gross,
            display: formatCurrency(paymentSummary.gross, true),
            tone: "primary",
            icon: IndianRupee,
          },
          {
            label: "Net Revenue",
            value: paymentSummary.net,
            display: formatCurrency(paymentSummary.net, true),
            tone: "success",
            icon: Wallet,
          },
          { label: "Pending", value: paymentSummary.pending, tone: "warning", icon: Clock },
          { label: "Refunded", value: paymentSummary.refunded, tone: "danger", icon: RotateCcw },
        ]}
      />

      {paged.isError ? (
        <ErrorState message="Couldn't load payments." onRetry={() => paged.refetch()} />
      ) : paged.isLoading ? (
        <TableSkeleton />
      ) : (
      <DataTable
        data={rows}
        columns={columns}
        getRowId={(p) => p.id}
        serverMode
        totalCount={paged.data?.total ?? 0}
        loading={paged.isFetching}
        onServerQueryChange={setParams}
        pageSize={10}
        searchKeys={["id", "customer", "service", "method"]}
        filterFields={[
          { key: "status", label: "Status", type: "select", options: ["success", "pending", "failed", "refunded"] },
          { key: "method", label: "Method", type: "select", options: ["UPI", "Credit Card", "Debit Card", "Net Banking", "Wallet"] },
          { key: "service", label: "Service", type: "text" },
          { key: "amount", label: "Amount (₹)", type: "numberRange" },
          { key: "fee", label: "Fee (₹)", type: "numberRange" },
          { key: "date", label: "Date", type: "dateRange" },
        ]}
        searchPlaceholder="Search transactions..."
        exportName="payments"
        bulkActions={[
          { label: "Download Receipts", icon: Download, onClick: downloadReceipts },
          { label: "Issue Refund", icon: RotateCcw, tone: "danger", onClick: bulkRefund },
        ]}
        renderCard={(p) => (
          <Card className="p-3.5">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <img src={p.avatar} alt="" className="h-9 w-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-card-foreground">{p.customer}</p>
                  <p className="font-mono text-[11px] text-[var(--accent)]">#{p.id}</p>
                </div>
              </div>
              <Badge tone={statusTone[p.status]} className="capitalize">
                {p.status}
              </Badge>
            </div>
            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Receipt className="h-3.5 w-3.5" />
                {p.method} · {p.service}
              </span>
              <span className="font-medium text-card-foreground">{formatCurrency(p.amount)}</span>
            </div>
          </Card>
        )}
      />
      )}
    </div>
  );
}
