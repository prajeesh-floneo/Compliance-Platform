"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ComplianceBadge } from "@/components/Badges";
import { Sparkles, AlertOctagon, CheckCircle2, Brain } from "lucide-react";
import type { DocumentRecord, Evidence, Requirement } from "@/lib/types";
import type { AIAnalysis } from "@/lib/types-extra";

type HistoryRow = AIAnalysis & { requirement_code: string; requirement_title: string };

export function AIWorkbench({
  requirements, documents, evidence, history, defaultRequirementId,
}: {
  requirements: Requirement[];
  documents: DocumentRecord[];
  evidence: Evidence[];
  history: HistoryRow[];
  defaultRequirementId?: string;
}) {
  const router = useRouter();
  const [reqId, setReqId] = useState(defaultRequirementId ?? "");
  const [docId, setDocId] = useState("");
  const [evId, setEvId] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AIAnalysis | null>(null);

  const req_ = requirements.find((r) => r.id === reqId);

  const run = async () => {
    if (!reqId) return;
    setBusy(true);
    const res = await fetch("/api/ai-analysis", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requirement_id: reqId, document_id: docId || null, evidence_id: evId || null }) });
    const j = await res.json();
    setBusy(false); setResult(j.analysis); router.refresh();
  };

  const reviewerDecision = async (analysisId: string, status: AIAnalysis["human_review_status"], decision: string) => {
    await fetch("/api/ai-analysis", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: analysisId, human_review_status: status, decision }) });
    router.refresh();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-1 card"><div className="card-header"><h3 className="font-semibold text-slate-800 flex items-center gap-2"><Brain className="h-4 w-4 text-brand-600" /> Run analysis</h3></div><div className="card-body space-y-3">
        <div><label className="label">Requirement</label><select className="input" value={reqId} onChange={(e) => setReqId(e.target.value)}><option value="">Select…</option>{requirements.map((r) => <option key={r.id} value={r.id}>{r.requirement_code} — {r.title}</option>)}</select></div>
        <div><label className="label">Linked document (optional override)</label><select className="input" value={docId} onChange={(e) => setDocId(e.target.value)}><option value="">Auto-pick linked document</option>{documents.map((d) => <option key={d.id} value={d.id}>{d.title} (v{d.version})</option>)}</select></div>
        <div><label className="label">Linked evidence (optional override)</label><select className="input" value={evId} onChange={(e) => setEvId(e.target.value)}><option value="">Auto-pick linked evidence</option>{evidence.map((e) => <option key={e.id} value={e.id}>{e.title}</option>)}</select></div>
        <button className="btn-primary w-full" onClick={run} disabled={!reqId || busy}><Sparkles className="h-4 w-4" />{busy ? "Analyzing…" : "Run AI Analysis"}</button>
        {req_ && <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-xs space-y-1"><div className="font-semibold text-slate-800">{req_.requirement_code}</div><div className="text-slate-600">{req_.title}</div><div className="text-slate-500">{req_.evaluation_criteria}</div></div>}
      </div></div>

      <div className="lg:col-span-2 card"><div className="card-header"><h3 className="font-semibold text-slate-800">Latest result</h3>{result && <span className="text-xs text-slate-500">Confidence {result.confidence_score}%</span>}</div><div className="card-body">
        {!result && <p className="text-sm text-slate-500">Choose a requirement and click <strong>Run AI Analysis</strong>.</p>}
        {result && (
          <div className="space-y-3 text-sm">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Pane title="Requirement Summary">{req_ ? <><div className="font-mono text-xs">{req_.requirement_code}</div><div className="text-slate-700">{req_.title}</div><div className="text-xs text-slate-500 mt-1">{req_.evaluation_element}</div></> : "—"}</Pane>
              <Pane title="Document Analyzed">{result.document_id ? documents.find((d) => d.id === result.document_id)?.title ?? "—" : <span className="text-slate-400">None</span>}</Pane>
              <Pane title="Evidence Analyzed">{result.evidence_id ? evidence.find((e) => e.id === result.evidence_id)?.title ?? "—" : <span className="text-slate-400">None</span>}</Pane>
              <Pane title="Suggested Status">{result.suggested_status === "Compliant" ? <span className="badge-green">{result.suggested_status}</span> : result.suggested_status === "Not Compliant" ? <span className="badge-red">{result.suggested_status}</span> : result.suggested_status === "Insufficient Data" ? <span className="badge-gray">{result.suggested_status}</span> : <span className="badge-yellow">{result.suggested_status}</span>}</Pane>
            </div>
            <Pane title="Matched Sections">{result.matched_sections.length ? <ul className="list-disc pl-5 text-emerald-700 space-y-0.5">{result.matched_sections.map((m, i) => <li key={i}>{m}</li>)}</ul> : <span className="text-slate-400">No matches.</span>}</Pane>
            <Pane title="Missing Items">{result.missing_items.length ? <ul className="space-y-1">{result.missing_items.map((m, i) => <li key={i} className="flex items-start gap-1.5 text-red-700"><AlertOctagon className="h-3.5 w-3.5 mt-0.5" />{m}</li>)}</ul> : <span className="text-emerald-700 flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5" /> None.</span>}</Pane>
            <Pane title="Recommended Action">{result.recommended_action}</Pane>
            <Pane title="Human Reviewer Decision">
              <div className="flex flex-wrap gap-2">
                <button className="btn-secondary" onClick={() => reviewerDecision(result.id, "Approved", "Accepted AI suggestion")}>Accept suggestion</button>
                <button className="btn-secondary" onClick={() => reviewerDecision(result.id, "Rejected", "Overrode AI suggestion")}>Override</button>
                <button className="btn-secondary" onClick={() => reviewerDecision(result.id, "Required", "Needs deeper human review")}>Flag for review</button>
              </div>
            </Pane>
          </div>
        )}
      </div></div>

      <div className="lg:col-span-3 card"><div className="card-header"><h3 className="font-semibold text-slate-800">Analysis history</h3></div>
        <div className="table-wrap rounded-none border-0"><table className="compliance"><thead><tr><th>Date</th><th>Requirement</th><th>Suggested</th><th>Confidence</th><th>Reviewer</th><th>Missing</th></tr></thead><tbody className="divide-y divide-slate-100">
          {history.map((h) => (
            <tr key={h.id}>
              <td className="text-xs">{new Date(h.created_at).toLocaleString()}</td>
              <td className="font-mono text-xs"><Link href={`/requirements/${h.requirement_id}`} className="text-brand-700 hover:underline">{h.requirement_code}</Link><div className="text-xs text-slate-500">{h.requirement_title}</div></td>
              <td>{h.suggested_status}</td>
              <td className="tabular-nums">{h.confidence_score}%</td>
              <td>{h.human_review_status}</td>
              <td className="wrap max-w-md text-xs text-slate-600">{h.missing_items.slice(0, 2).join("; ")}{h.missing_items.length > 2 ? "…" : ""}</td>
            </tr>
          ))}
          {history.length === 0 && <tr><td colSpan={6} className="text-center text-sm text-slate-500 py-6">No analyses yet.</td></tr>}
        </tbody></table></div>
      </div>
    </div>
  );
}

function Pane({ title, children }: { title: string; children: React.ReactNode }) {
  return (<div className="rounded border border-slate-200 bg-slate-50 p-3"><div className="label">{title}</div><div className="text-sm text-slate-800">{children}</div></div>);
}
