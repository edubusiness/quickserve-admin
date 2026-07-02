"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  FileText,
  FileSpreadsheet,
  FileDown,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { exportCsv, exportExcel, exportPdf } from "@/lib/export";

export interface Column<T> {
  /** A data field, or any synthetic string for action/utility columns. */
  key: keyof T | (string & {});
  header: string;
  sortable?: boolean;
  align?: "left" | "right" | "center";
  className?: string;
  /** Set false to omit from CSV/Excel/PDF export (e.g. action columns). */
  exportable?: boolean;
  render?: (row: T) => ReactNode;
  /** Value used for sorting/exporting when render returns JSX. */
  value?: (row: T) => string | number;
}

export interface BulkAction {
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  tone?: "default" | "danger";
  onClick: (ids: string[]) => void;
}

/** A field-specific search/filter control shown in the advanced Filters panel. */
export type FilterField<T> =
  | { key: keyof T; label: string; type: "select"; options: string[] }
  | { key: keyof T; label: string; type: "text" }
  | { key: keyof T; label: string; type: "numberRange" }
  | { key: keyof T; label: string; type: "dateRange" };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FilterValue = any;

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  getRowId: (row: T) => string;
  searchKeys?: (keyof T)[];
  searchPlaceholder?: string;
  pageSize?: number;
  bulkActions?: BulkAction[];
  exportName?: string;
  toolbarExtra?: ReactNode;
  renderCard?: (row: T) => ReactNode;
  /** Field-specific filters shown behind a "Filters" button. */
  filterFields?: FilterField<T>[];
  /**
   * Server-driven mode: `data` is treated as the current page (already
   * searched/filtered/sorted/paginated by the API). Provide `totalCount` and
   * `onServerQueryChange`; the table emits query params instead of filtering locally.
   */
  serverMode?: boolean;
  totalCount?: number;
  loading?: boolean;
  onServerQueryChange?: (params: Record<string, string>) => void;
}

function filterHasValue(v: FilterValue): boolean {
  if (v == null) return false;
  if (typeof v === "object") return Object.values(v).some((x) => x !== "" && x != null);
  return v !== "";
}

function rowPassesFilter<T>(row: T, field: FilterField<T>, v: FilterValue): boolean {
  if (!filterHasValue(v)) return true;
  const cell = row[field.key];
  switch (field.type) {
    case "select":
      return String(cell) === String(v);
    case "text":
      return String(cell ?? "").toLowerCase().includes(String(v).toLowerCase());
    case "numberRange": {
      const n = Number(cell);
      if (v.min !== "" && v.min != null && n < Number(v.min)) return false;
      if (v.max !== "" && v.max != null && n > Number(v.max)) return false;
      return true;
    }
    case "dateRange": {
      const t = new Date(cell as string).getTime();
      if (v.from && t < new Date(v.from).getTime()) return false;
      if (v.to && t > new Date(v.to).getTime() + 86_400_000) return false;
      return true;
    }
  }
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  searchKeys = [],
  searchPlaceholder = "Search...",
  pageSize = 8,
  bulkActions = [],
  exportName = "export",
  toolbarExtra,
  renderCard,
  filterFields = [],
  serverMode = false,
  totalCount = 0,
  loading = false,
  onServerQueryChange,
}: DataTableProps<T>) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<keyof T | string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, FilterValue>>({});

  const cellValue = (row: T, col: Column<T>) =>
    col.value
      ? col.value(row)
      : ((row as Record<string, unknown>)[col.key as string] as string | number);

  const activeFilterCount = filterFields.filter((f) =>
    filterHasValue(filterValues[f.key as string]),
  ).length;

  const setFilter = (key: string, value: FilterValue) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
    setPage(0);
  };
  const clearFilters = () => {
    setFilterValues({});
    setPage(0);
  };

  // Serialize the current query into API params (prefixed advanced filters).
  const serverParams = useMemo(() => {
    const p: Record<string, string> = { page: String(page + 1), limit: String(pageSize) };
    if (query.trim()) p.search = query.trim();
    if (sortKey) {
      p.sort = String(sortKey);
      p.order = sortDir;
    }
    for (const f of filterFields) {
      const v = filterValues[f.key as string];
      if (!filterHasValue(v)) continue;
      const k = String(f.key);
      if (f.type === "select") p[`eq_${k}`] = String(v);
      else if (f.type === "text") p[`like_${k}`] = String(v);
      else if (f.type === "numberRange") {
        if (v.min !== "" && v.min != null) p[`min_${k}`] = String(v.min);
        if (v.max !== "" && v.max != null) p[`max_${k}`] = String(v.max);
      } else if (f.type === "dateRange") {
        if (v.from) p[`from_${k}`] = String(v.from);
        if (v.to) p[`to_${k}`] = String(v.to);
      }
    }
    return p;
  }, [query, sortKey, sortDir, page, pageSize, filterFields, filterValues]);

  // In server mode, emit params (debounced) instead of filtering locally.
  useEffect(() => {
    if (!serverMode || !onServerQueryChange) return;
    const id = setTimeout(() => onServerQueryChange(serverParams), 200);
    return () => clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverMode, serverParams]);

  // Text search + advanced field filters (client mode only)
  const filtered = useMemo(() => {
    if (serverMode) return data;
    const q = query.trim().toLowerCase();
    return data.filter((row) => {
      if (q && !searchKeys.some((k) => String(row[k]).toLowerCase().includes(q))) return false;
      for (const f of filterFields) {
        if (!rowPassesFilter(row, f, filterValues[f.key as string])) return false;
      }
      return true;
    });
  }, [serverMode, data, query, searchKeys, filterFields, filterValues]);

  // Sort (client mode only; server mode is pre-sorted)
  const sorted = useMemo(() => {
    if (serverMode || !sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const av = cellValue(a, col);
      const bv = cellValue(b, col);
      if (av === bv) return 0;
      const cmp = av > bv ? 1 : -1;
      return sortDir === "asc" ? cmp : -cmp;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverMode, filtered, sortKey, sortDir, columns]);

  // Paginate
  const totalRows = serverMode ? totalCount : sorted.length;
  const pageCount = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const rows = serverMode ? data : sorted.slice(safePage * pageSize, safePage * pageSize + pageSize);

  const toggleSort = (key: keyof T | string) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
    if (serverMode) setPage(0);
  };

  const allOnPageSelected =
    rows.length > 0 && rows.every((r) => selected.has(getRowId(r)));

  const toggleAllOnPage = () => {
    const next = new Set(selected);
    if (allOnPageSelected) rows.forEach((r) => next.delete(getRowId(r)));
    else rows.forEach((r) => next.add(getRowId(r)));
    setSelected(next);
  };

  const toggleRow = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const exportCols = columns.filter((c) => c.exportable !== false && c.header);
  const exportColumns = exportCols.map((c) => ({
    key: c.key as string,
    header: c.header,
  }));
  const exportRows = (sorted as Record<string, unknown>[]).map((row) => {
    const out: Record<string, unknown> = {};
    exportCols.forEach((c) => {
      out[c.key as string] = c.value
        ? c.value(row as T)
        : (row as Record<string, unknown>)[c.key as string];
    });
    return out;
  });

  return (
    <Card className="overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder={searchPlaceholder}
              className="h-9 w-full rounded-lg border border-border bg-muted/40 pl-9 pr-3 text-sm text-card-foreground placeholder:text-muted-foreground/70 focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
            />
          </div>

          {filterFields.length > 0 && (
            <div className="relative">
              <button
                onClick={() => setFilterPanelOpen((v) => !v)}
                className={cn(
                  "inline-flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors",
                  activeFilterCount > 0
                    ? "border-[var(--primary)]/50 bg-[var(--primary)]/10 text-card-foreground"
                    : "border-border text-muted-foreground hover:text-card-foreground",
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[var(--primary)] px-1 text-[10px] font-bold text-primary-foreground">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {filterPanelOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setFilterPanelOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="absolute left-0 top-11 z-50 w-72 space-y-3 rounded-xl border border-border bg-card p-4 shadow-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-card-foreground">Filter by</p>
                        {activeFilterCount > 0 && (
                          <button onClick={clearFilters} className="text-xs font-medium text-[var(--accent)] hover:underline">
                            Clear all
                          </button>
                        )}
                      </div>
                      {filterFields.map((f) => (
                        <FilterInput
                          key={String(f.key)}
                          field={f}
                          value={filterValues[f.key as string]}
                          onChange={(v) => setFilter(f.key as string, v)}
                        />
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          )}
          {toolbarExtra}
        </div>

        {/* Export */}
        <div className="flex items-center gap-1.5">
          <ExportButton
            icon={FileText}
            label="CSV"
            onClick={() => exportCsv(exportRows, exportColumns, `${exportName}.csv`)}
          />
          <ExportButton
            icon={FileSpreadsheet}
            label="Excel"
            onClick={() => exportExcel(exportRows, exportColumns, `${exportName}.xls`)}
          />
          <ExportButton
            icon={FileDown}
            label="PDF"
            onClick={() => exportPdf(exportRows, exportColumns, exportName)}
          />
        </div>
      </div>

      {/* Bulk action bar */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex items-center gap-3 border-b border-border bg-[var(--primary)]/10 px-4 py-2.5"
          >
            <span className="text-sm font-medium text-card-foreground">
              {selected.size} selected
            </span>
            <div className="flex flex-wrap gap-2">
              {bulkActions.map((a) => {
                const Icon = a.icon;
                return (
                  <button
                    key={a.label}
                    onClick={() => {
                      a.onClick([...selected]);
                      setSelected(new Set());
                    }}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                      a.tone === "danger"
                        ? "bg-rose-500/15 text-rose-400 hover:bg-rose-500/25"
                        : "bg-card text-card-foreground hover:bg-muted",
                    )}
                  >
                    {Icon && <Icon className="h-3.5 w-3.5" />}
                    {a.label}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setSelected(new Set())}
              className="ml-auto grid h-7 w-7 place-items-center rounded-lg text-muted-foreground hover:bg-card"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop table */}
      <div className="no-scrollbar hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
            <tr className="border-b border-border text-left">
              {bulkActions.length > 0 && (
                <th className="w-10 px-4 py-3">
                  <Checkbox checked={allOnPageSelected} onChange={toggleAllOnPage} />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  className={cn(
                    "whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
                    col.align === "right" && "text-right",
                    col.align === "center" && "text-center",
                  )}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => toggleSort(col.key)}
                      className="inline-flex items-center gap-1 transition-colors hover:text-card-foreground"
                    >
                      {col.header}
                      {sortKey === col.key ? (
                        sortDir === "asc" ? (
                          <ChevronUp className="h-3.5 w-3.5" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5" />
                        )
                      ) : (
                        <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const id = getRowId(row);
              const isSel = selected.has(id);
              return (
                <tr
                  key={id}
                  className={cn(
                    "border-b border-border/60 transition-colors hover:bg-muted/40",
                    isSel && "bg-[var(--primary)]/5",
                  )}
                >
                  {bulkActions.length > 0 && (
                    <td className="px-4 py-3">
                      <Checkbox checked={isSel} onChange={() => toggleRow(id)} />
                    </td>
                  )}
                  {columns.map((col) => (
                    <td
                      key={String(col.key)}
                      className={cn(
                        "px-4 py-3 text-card-foreground",
                        col.align === "right" && "text-right",
                        col.align === "center" && "text-center",
                        col.className,
                      )}
                    >
                      {col.render
                        ? col.render(row)
                        : String((row as Record<string, unknown>)[col.key as string])}
                    </td>
                  ))}
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={columns.length + (bulkActions.length ? 1 : 0)}
                  className="px-4 py-12 text-center text-sm text-muted-foreground"
                >
                  No results found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile card view — custom renderer if provided, else auto-built from columns */}
      <div className="space-y-3 p-4 md:hidden">
        {rows.map((row) => {
          const id = getRowId(row);
          if (renderCard) return <div key={id}>{renderCard(row)}</div>;
          const labelled = columns.filter((c) => c.header);
          const actions = columns.filter((c) => !c.header);
          return (
            <div key={id} className="rounded-xl border border-border bg-card/40 p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-2">
                  {labelled.map((col, i) => {
                    const value = col.render
                      ? col.render(row)
                      : String((row as Record<string, unknown>)[col.key as string] ?? "—");
                    // First labelled column renders prominently as the card title.
                    if (i === 0) return <div key={String(col.key)} className="min-w-0 text-sm font-medium text-card-foreground">{value}</div>;
                    return (
                      <div key={String(col.key)} className="flex items-start justify-between gap-3">
                        <span className="shrink-0 text-xs font-medium uppercase tracking-wide text-muted-foreground">{col.header}</span>
                        <span className="min-w-0 break-words text-right text-sm text-card-foreground">{value}</span>
                      </div>
                    );
                  })}
                </div>
                {bulkActions.length > 0 && (
                  <Checkbox checked={selected.has(id)} onChange={() => toggleRow(id)} />
                )}
              </div>
              {actions.length > 0 && (
                <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/60 pt-3">
                  {actions.map((col) => (
                    <div key={String(col.key)}>{col.render ? col.render(row) : null}</div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            No results found.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-4 py-3 sm:flex-row">
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="font-medium text-card-foreground">
            {totalRows === 0 ? 0 : safePage * pageSize + 1}–
            {serverMode
              ? safePage * pageSize + rows.length
              : Math.min((safePage + 1) * pageSize, totalRows)}
          </span>{" "}
          of <span className="font-medium text-card-foreground">{totalRows}</span>
          {loading && <span className="ml-2 animate-pulse">· updating…</span>}
        </p>
        <div className="flex items-center gap-1">
          <PagerButton
            label="Previous page"
            disabled={safePage === 0}
            onClick={() => setPage(safePage - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </PagerButton>
          {Array.from({ length: pageCount }).slice(0, 6).map((_, i) => (
            <button
              key={i}
              onClick={() => setPage(i)}
              className={cn(
                "h-8 min-w-8 rounded-lg px-2 text-sm font-medium transition-colors",
                i === safePage
                  ? "bg-[var(--primary)] text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted",
              )}
            >
              {i + 1}
            </button>
          ))}
          {pageCount > 6 && (
            <span className="px-1 text-muted-foreground">…</span>
          )}
          <PagerButton
            label="Next page"
            disabled={safePage >= pageCount - 1}
            onClick={() => setPage(safePage + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </PagerButton>
        </div>
      </div>
    </Card>
  );
}

const filterInputCls =
  "h-9 w-full rounded-lg border border-border bg-muted/40 px-2.5 text-sm text-card-foreground focus:border-[var(--primary)]/40 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20";

function FilterInput<T>({
  field,
  value,
  onChange,
}: {
  field: FilterField<T>;
  value: FilterValue;
  onChange: (v: FilterValue) => void;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-muted-foreground">{field.label}</label>
      {field.type === "select" && (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className={cn(filterInputCls, "capitalize")}>
          <option value="">Any</option>
          {field.options.map((o) => (
            <option key={o} value={o} className="bg-card capitalize">
              {o}
            </option>
          ))}
        </select>
      )}
      {field.type === "text" && (
        <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={`Search ${field.label.toLowerCase()}`} className={filterInputCls} />
      )}
      {field.type === "numberRange" && (
        <div className="flex items-center gap-2">
          <input type="number" placeholder="Min" value={value?.min ?? ""} onChange={(e) => onChange({ ...value, min: e.target.value })} className={filterInputCls} />
          <span className="text-muted-foreground">–</span>
          <input type="number" placeholder="Max" value={value?.max ?? ""} onChange={(e) => onChange({ ...value, max: e.target.value })} className={filterInputCls} />
        </div>
      )}
      {field.type === "dateRange" && (
        <div className="flex items-center gap-2">
          <input type="date" value={value?.from ?? ""} onChange={(e) => onChange({ ...value, from: e.target.value })} className={filterInputCls} />
          <span className="text-muted-foreground">–</span>
          <input type="date" value={value?.to ?? ""} onChange={(e) => onChange({ ...value, to: e.target.value })} className={filterInputCls} />
        </div>
      )}
    </div>
  );
}

function Checkbox({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      role="checkbox"
      aria-checked={checked}
      onClick={onChange}
      className={cn(
        "grid h-4.5 w-4.5 place-items-center rounded-[5px] border transition-colors",
        checked
          ? "border-[var(--primary)] bg-[var(--primary)] text-primary-foreground"
          : "border-muted-foreground/40 hover:border-[var(--primary)]",
      )}
    >
      {checked && (
        <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none">
          <path d="M2.5 6.5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

function ExportButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card/60 px-2.5 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-[var(--primary)]/10 hover:text-card-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function PagerButton({
  children,
  disabled,
  onClick,
  label,
}: {
  children: ReactNode;
  disabled?: boolean;
  onClick: () => void;
  label?: string;
}) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
