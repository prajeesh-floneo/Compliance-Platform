"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ApprovalBadge } from "@/components/Badges";
import { Modal } from "@/components/Modal";
import { CheckCircle2, MessageSquare, PenLine, ShieldX } from "lucide-react";
import type { Approval } from "@/lib/types-extra";

type Row = Approval & { requested_by_name: string; approver_name: string };

export function ApprovalsList({ items }: { items: Row[] }) {
  const router = useRouter();
  const [tab, setTab] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [active, setActive] = useState<Row | null>(null);
  const [mode, setMode] = useState<"approve" | "reject" | "changes" | "comment" | "sign" | null>(null);
  const [comments, setComments] = useState("");
  const filtered = useMemo(() => items.filter((a) => tab === "all" ? true : tab === "pending" ? a.status === "Pending" || a.status === "Changes Requested" : tab === "approved" ? a.status === "Approved" : a.status === "Rejected"), [items, tab]);

  const doAction = async () => {
    if (!active || !mode) return;
    await fetch("/api/approvals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: active.id, action: mode, comments }) });
    setActive(null); setMode(null); setComments(""); router.refresh();
  };

  const tabs = [
    { key: "pending", label: `Pending (${items.filter((i) => i.status === "Pending" || i.status === "Changes Requested").length})` },
    { key: "approved", label: `Approved (${items.filter((i) => i.status === "Approved").length})` },
    { key: "rejected", label: `Rejected (${items.filter((i) => i.status === "Rejected").length})` },
    { key: "all", label: `All (${items.length})` },
  ] as const;

  return (
    <div>
      <div className="card mb-4">
        <div className="border-b border-slate-200 px-2 flex gap-1">
          {tabs.map((t) => (
            <button key={t.key} className={`tab-btn ${tab === t.key ? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
          ))}
        </div>
        <div className="table-wrap rounded-none border-0">
          <table className="compliance"><thead><tr><th>Item Type</th><th>Item</th><th>Requested By</th><th>Approver</th><th>Status</th><th>Requested</th><th>Due</th><th>Comments</th><th>Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>{a.item_type}</td>
                <td className="wrap max-w-xs">{a.item_name}</td>
                <td>{a.requested_by_name}</td>
                <td>{a.approver_name}</td>
                <td><ApprovalBadge status={a.status} /></td>
                <td className="text-xs">{new Date(a.requested_date).toLocaleDateString()}</td>
                <td className="text-xs">{a.due_date ?? "—"}</td>
                <td className="wrap max-w-md text-slate-600 text-xs">{a.comments}</td>
                <td className="text-xs space-y-1">
                  <button className="block text-emerald-700 hover:underline flex items-center gap-1" onClick={() => { setActive(a); setMode("approve"); setComments(""); }}><CheckCircle2 className="h-3 w-3" /> Approve</button>
                  <button className="block text-red-700 hover:underline flex items-center gap-1" onClick={() => { setActive(a); setMode("reject"); setComments(""); }}><ShieldX className="h-3 w-3" /> Reject</button>
                  <button className="block text-amber-700 hover:underline flex items-center gap-1" onClick={() => { setActive(a); setMode("changes"); setComments(""); }}><MessageSquare className="h-3 w-3" /> Request Changes</button>
                  {a.item_type === "Document" && a.status !== "Approved" && (
                    <button className="block text-brand-700 hover:underline flex items-center gap-1" onClick={() => { setActive(a); setMode("sign"); setComments(""); }}><PenLine className="h-3 w-3" /> Sign Document</button>
                  )}
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={9} className="text-center text-slate-500 text-sm py-8">No approvals in this tab.</td></tr>}
          </tbody></table>
        </div>
      </div>

      <Modal open={!!active} onClose={() => { setActive(null); setMode(null); }} title={mode === "sign" ? "Sign Document" : mode === "approve" ? "Approve" : mode === "reject" ? "Reject" : "Request Changes"} footer={<><button className="btn-secondary" onClick={() => { setActive(null); setMode(null); }}>Cancel</button><button className="btn-primary" onClick={doAction}>{mode === "sign" ? "Sign & Approve" : "Confirm"}</button></>}>
        <p className="text-sm text-slate-600 mb-3"><strong>{active?.item_type}:</strong> {active?.item_name}</p>
        {mode === "sign" && <p className="text-xs text-slate-500 mb-2">Records signer name, role, timestamp and signature hash on the document. Placeholder for integration with WebSec / e.firma.</p>}
        <label className="label">Comments</label>
        <textarea className="input min-h-[80px]" value={comments} onChange={(e) => setComments(e.target.value)} />
      </Modal>
    </div>
  );
}
