"use client";

import { useState } from "react";
import { Download, FileText, Printer } from "lucide-react";
import { toCSV } from "@/lib/csv";

const REPORTS = [
  { key: "matrix", label: "Compliance Matrix Report", desc: "Full traceability matrix — element, criteria, requirement, documents, evidence, actions, owner, reviewer, approval." },
  { key: "missing", label: "Missing Evidence Report", desc: "Requirements that have no evidence attached." },
  { key: "actions", label: "Action Plan Report", desc: "All corrective actions with status, owners and overdue flags." },
  { key: "docs", label: "Document Status Report", desc: "Status, version and signatures of every controlled document." },
  { key: "auditor", label: "Auditor Submission Report", desc: "Auditor-friendly export of compliance matrix for external review." },
  { key: "mgmt", label: "Management Summary Report", desc: "Aggregate compliance KPIs for senior management." },
] as const;

type RowMap = Record<string, unknown>[];

export function ReportsClient({ matrix, missingEv, actions, docStatus, auditor, summary }: {
  matrix: RowMap; missingEv: RowMap; actions: RowMap; docStatus: RowMap; auditor: RowMap; summary: RowMap;
}) {
  const [active, setActive] = useState<typeof REPORTS[number]["key"]>("matrix");
  const data: Record<string, RowMap> = {
    matrix, missing: missingEv, actions, docs: docStatus, auditor, mgmt: summary,
  };
  const rows = data[active] ?? [];
  const columns = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];

  const download = (format: "csv" | "pdf") => {
    if (format === "csv") {
      const csv = toCSV(rows);
      const blob = new Blob([csv], { type: "text/csv" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `${active}-report.csv`; a.click();
    } else {
      window.print(); // PDF placeholder — use browser Print → Save as PDF
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-1 card">
        <div className="card-header"><h3 className="font-semibold text-slate-800">Available Reports</h3></div>
        <ul className="divide-y divide-slate-100">
          {REPORTS.map((r) => (
            <li key={r.key}>
              <button onClick={() => setActive(r.key)} className={`w-full text-left px-5 py-3 hover:bg-slate-50 ${active === r.key ? "bg-brand-50/60 border-l-2 border-brand-600" : ""}`}>
                <div className="text-sm font-medium text-slate-800 flex items-center gap-2"><FileText className="h-4 w-4 text-slate-400" />{r.label}</div>
                <div className="text-xs text-slate-500 mt-0.5">{r.desc}</div>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="lg:col-span-3 card print:shadow-none print:border-0">
        <div className="card-header print:hidden">
          <div>
            <h3 className="font-semibold text-slate-800">{REPORTS.find((r) => r.key === active)?.label}</h3>
            <p className="text-xs text-slate-500">{rows.length} row(s) — generated live from the database.</p>
          </div>
          <div className="flex gap-2">
            <button className="btn-secondary" onClick={() => download("csv")}><Download className="h-4 w-4" /> Export CSV</button>
            <button className="btn-secondary" onClick={() => download("pdf")}><Printer className="h-4 w-4" /> Export PDF (Print)</button>
          </div>
        </div>
        <div className="hidden print:block px-5 pt-5"><h2 className="text-xl font-semibold">{REPORTS.find((r) => r.key === active)?.label}</h2><p className="text-xs text-slate-500">Generated {new Date().toLocaleString()}</p></div>
        <div className="overflow-auto">
          {rows.length === 0 ? <p className="px-5 py-6 text-sm text-slate-500">No data.</p> : (
            <table className="compliance text-xs">
              <thead><tr>{columns.map((c) => <th key={c}>{c.replace(/_/g, " ")}</th>)}</tr></thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row, i) => (
                  <tr key={i}>{columns.map((c) => <td key={c} className="wrap align-top max-w-xs">{String((row as Record<string, unknown>)[c] ?? "—")}</td>)}</tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
