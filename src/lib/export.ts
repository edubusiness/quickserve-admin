/**
 * Lightweight, dependency-free exporters.
 * CSV / Excel use a Blob download; PDF uses the browser print pipeline so we
 * avoid shipping a heavy PDF library for the demo. Swap for `xlsx` / `jspdf`
 * in production if richer formatting is required.
 */

type Row = Record<string, unknown>;

function escapeCsv(value: unknown): string {
  const s = value == null ? "" : String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function download(content: BlobPart, filename: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportCsv<T extends Row>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  filename = "export.csv",
) {
  const head = columns.map((c) => escapeCsv(c.header)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(row[c.key])).join(","))
    .join("\n");
  download(`${head}\n${body}`, filename, "text/csv;charset=utf-8;");
}

/** Excel opens CSV with a UTF-8 BOM cleanly; gives a real .xls-friendly file. */
export function exportExcel<T extends Row>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  filename = "export.xls",
) {
  const head = columns.map((c) => escapeCsv(c.header)).join("\t");
  const body = rows
    .map((row) => columns.map((c) => escapeCsv(row[c.key])).join("\t"))
    .join("\n");
  download("﻿" + `${head}\n${body}`, filename, "application/vnd.ms-excel");
}

export function exportPdf<T extends Row>(
  rows: T[],
  columns: { key: keyof T; header: string }[],
  title = "Export",
) {
  const win = window.open("", "_blank", "width=900,height=650");
  if (!win) return;
  const styles = `
    body{font-family:ui-sans-serif,system-ui,sans-serif;padding:32px;color:#0f172a}
    h1{font-size:20px;margin:0 0 4px}
    p{color:#64748b;margin:0 0 20px;font-size:12px}
    table{width:100%;border-collapse:collapse;font-size:12px}
    th{text-align:left;background:#f1f5f9;padding:8px 10px;border-bottom:2px solid #e2e8f0}
    td{padding:8px 10px;border-bottom:1px solid #eef2f7}
    tr:nth-child(even) td{background:#fafbfc}
  `;
  const head = columns.map((c) => `<th>${c.header}</th>`).join("");
  const body = rows
    .map(
      (row) =>
        `<tr>${columns.map((c) => `<td>${row[c.key] ?? ""}</td>`).join("")}</tr>`,
    )
    .join("");
  win.document.write(`
    <html><head><title>${title}</title><style>${styles}</style></head>
    <body>
      <h1>${title}</h1>
      <p>Generated ${new Date().toLocaleString()} · ${rows.length} records</p>
      <table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>
      <script>window.onload=()=>{window.print()}</script>
    </body></html>
  `);
  win.document.close();
}
