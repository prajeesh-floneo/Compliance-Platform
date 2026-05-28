"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";
import { AlertCircle, CheckCircle2, FileText } from "lucide-react";

interface ValidatedRow {
  index: number;
  data: Record<string, string>;
  errors: string[];
}

const EXAMPLE_CSV = `requirement_code,section,title,evaluation_element,evaluation_criteria,expected_document_type,compliance_status,risk_level,owner,reviewer,due_date
EX-001,Security Governance,Sample requirement,Documented role description,Confirm sign-off by senior management,Policy,Pending,High,Sofía Castillo,Laura Iglesias,2026-12-31`;

const EXAMPLE_JSON = JSON.stringify(
  [{
    requirement_code: "EX-001",
    section: "Security Governance",
    title: "Sample requirement",
    evaluation_element: "Documented role description",
    evaluation_criteria: "Confirm sign-off by senior management",
    expected_document_type: "Policy",
    compliance_status: "Pending",
    risk_level: "High",
    owner: "Sofía Castillo",
    reviewer: "Laura Iglesias",
    due_date: "2026-12-31",
  }],
  null,
  2
);

export function BulkImportModal({
  open,
  onClose,
  onImported,
}: {
  open: boolean;
  onClose: () => void;
  onImported: () => void;
}) {
  const [tab, setTab] = useState<"csv" | "json" | "file">("csv");
  const [csv, setCsv] = useState("");
  const [json, setJson] = useState("");
  const [preview, setPreview] = useState<ValidatedRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [summary, setSummary] = useState<{ created: number; skipped: number } | null>(null);

  const handlePreview = async () => {
    setBusy(true); setError(null); setSummary(null);
    const payload: { csv?: string; json?: string; preview: true } = { preview: true };
    if (tab === "csv") payload.csv = csv;
    if (tab === "json") payload.json = json;
    const res = await fetch("/api/requirements/bulk-import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) { setError(j.error ?? "Error"); return; }
    setPreview(j.rows);
  };

  const handleImport = async () => {
    setBusy(true); setError(null);
    const payload: { csv?: string; json?: string } = {};
    if (tab === "csv") payload.csv = csv;
    if (tab === "json") payload.json = json;
    const res = await fetch("/api/requirements/bulk-import", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) { setError(j.error ?? "Error"); return; }
    setSummary({ created: j.created, skipped: j.skipped });
    setPreview(j.rows);
    onImported();
  };

  const onFile = async (file: File) => {
    const text = await file.text();
    setCsv(text); setTab("csv");
  };

  return (
    <Modal open={open} onClose={onClose} title="Bulk Requirement Import" size="xl"
      footer={<>
        <button className="btn-secondary" onClick={onClose}>Close</button>
        <button className="btn-secondary" onClick={handlePreview} disabled={busy}>{busy ? "…" : "Preview"}</button>
        <button className="btn-primary" onClick={handleImport} disabled={busy || (!csv && !json)}>{busy ? "Importing…" : "Import valid rows"}</button>
      </>}
    >
      <p className="text-sm text-slate-600 mb-3">Paste <strong>CSV</strong> or <strong>JSON</strong> requirement data, or upload a CSV/Excel-exported CSV file. Required columns: <code className="text-xs bg-slate-100 px-1 py-0.5 rounded">requirement_code, section, title, evaluation_element, evaluation_criteria, expected_document_type</code>.</p>
      <div className="flex gap-2 border-b border-slate-200 mb-3">
        <button className={`tab-btn ${tab === "csv" ? "active" : ""}`} onClick={() => setTab("csv")}>Paste CSV</button>
        <button className={`tab-btn ${tab === "json" ? "active" : ""}`} onClick={() => setTab("json")}>Paste JSON</button>
        <button className={`tab-btn ${tab === "file" ? "active" : ""}`} onClick={() => setTab("file")}>Upload CSV/Excel</button>
      </div>
      {tab === "csv" && (
        <div>
          <textarea className="input font-mono text-xs min-h-[160px]" placeholder={EXAMPLE_CSV} value={csv} onChange={(e) => setCsv(e.target.value)} />
          <button className="mt-2 text-xs text-brand-700 hover:underline" onClick={() => setCsv(EXAMPLE_CSV)}>Insert example</button>
        </div>
      )}
      {tab === "json" && (
        <div>
          <textarea className="input font-mono text-xs min-h-[160px]" placeholder={EXAMPLE_JSON} value={json} onChange={(e) => setJson(e.target.value)} />
          <button className="mt-2 text-xs text-brand-700 hover:underline" onClick={() => setJson(EXAMPLE_JSON)}>Insert example</button>
        </div>
      )}
      {tab === "file" && (
        <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center">
          <FileText className="h-8 w-8 mx-auto text-slate-400" />
          <p className="text-sm text-slate-600 mt-2">Drop a CSV file here, or</p>
          <input type="file" accept=".csv,.tsv,.txt" className="mt-2" onChange={(e) => e.target.files && onFile(e.target.files[0])} />
          <p className="text-[11px] text-slate-500 mt-3">Excel: export your sheet as <em>CSV (Comma delimited)</em> and upload it here. Native .xlsx parsing is not enabled in this MVP.</p>
        </div>
      )}
      {error && <div className="mt-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2 flex items-start gap-2"><AlertCircle className="h-4 w-4 mt-0.5" />{error}</div>}
      {summary && <div className="mt-3 rounded border border-emerald-200 bg-emerald-50 text-emerald-800 text-sm px-3 py-2 flex items-start gap-2"><CheckCircle2 className="h-4 w-4 mt-0.5" />Imported {summary.created} requirement(s). Skipped {summary.skipped} invalid row(s).</div>}
      {preview && (
        <div className="mt-4">
          <div className="text-xs text-slate-500 mb-1">Preview ({preview.length} row{preview.length !== 1 ? "s" : ""})</div>
          <div className="table-wrap max-h-[300px] overflow-auto">
            <table className="compliance"><thead><tr><th>#</th><th>Code</th><th>Title</th><th>Section</th><th>Status</th><th>Risk</th><th>Validation</th></tr></thead><tbody className="divide-y divide-slate-100">
              {preview.map((r) => (
                <tr key={r.index} className={r.errors.length ? "bg-red-50/40" : ""}>
                  <td className="text-xs">{r.index + 1}</td>
                  <td className="font-mono text-xs">{r.data.requirement_code || <span className="text-red-500">—</span>}</td>
                  <td className="wrap max-w-xs">{r.data.title}</td>
                  <td>{r.data.section}</td>
                  <td>{r.data.compliance_status || "Pending"}</td>
                  <td>{r.data.risk_level || "Medium"}</td>
                  <td className="wrap max-w-sm">{r.errors.length === 0 ? <span className="badge-green">Valid</span> : <ul className="text-xs text-red-700 list-disc pl-4">{r.errors.map((e, i) => <li key={i}>{e}</li>)}</ul>}</td>
                </tr>
              ))}
            </tbody></table>
          </div>
        </div>
      )}
    </Modal>
  );
}
