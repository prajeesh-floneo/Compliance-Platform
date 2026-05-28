"use client";

import { useEffect, useState } from "react";
import { Modal } from "@/components/Modal";
import type { Requirement, User } from "@/lib/types";

const CATEGORIES = ["General","Policies","Guides & Standards","Procedures","Letters","Evidence","Working Plans"];

export function UploadModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [users, setUsers] = useState<User[]>([]);
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [data, setData] = useState<Record<string, string>>({
    category: "Policies",
    version: "1.0",
    language: "EN",
    department: "Information Security",
  });
  const [linkedReqs, setLinkedReqs] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/users").then((r) => r.json()).then((j) => setUsers(j.users));
    fetch("/api/requirements").then((r) => r.json()).then((j) => setReqs(j.requirements));
  }, [open]);

  const submit = async () => {
    setBusy(true); setError(null);
    const res = await fetch("/api/documents", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, requirement_ids: linkedReqs }),
    });
    const j = await res.json();
    setBusy(false);
    if (!res.ok) { setError(j.error ?? "Error"); return; }
    onCreated(); onClose();
    setData({ category: "Policies", version: "1.0", language: "EN", department: "Information Security" });
    setLinkedReqs([]);
  };

  const ufield = (key: string, label: string) => (
    <div>
      <label className="label">{label}</label>
      <select className="input" value={data[key] ?? ""} onChange={(e) => setData({ ...data, [key]: e.target.value })}>
        <option value="">—</option>{users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}
      </select>
    </div>
  );

  return (
    <Modal open={open} onClose={onClose} title="Upload Document" size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={busy || !data.title || !data.document_type}>{busy ? "Saving…" : "Upload"}</button>
      </>}
    >
      {error && <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="md:col-span-2"><label className="label">Document Title</label><input className="input" value={data.title ?? ""} onChange={(e) => setData({ ...data, title: e.target.value })} /></div>
        <div><label className="label">Category</label><select className="input" value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select></div>
        <div><label className="label">Document Type</label><input className="input" placeholder="Policy, Procedure, Report…" value={data.document_type ?? ""} onChange={(e) => setData({ ...data, document_type: e.target.value })} /></div>
        <div><label className="label">Version Number</label><input className="input" value={data.version} onChange={(e) => setData({ ...data, version: e.target.value })} /></div>
        <div><label className="label">Language</label><input className="input" value={data.language} onChange={(e) => setData({ ...data, language: e.target.value })} /></div>
        <div><label className="label">Department</label><input className="input" value={data.department} onChange={(e) => setData({ ...data, department: e.target.value })} /></div>
        {ufield("owner_id", "Owner")}
        {ufield("author_id", "Author")}
        {ufield("reviewer_id", "Reviewer")}
        {ufield("approver_id", "Approver")}
        <div><label className="label">Effective Date</label><input type="date" className="input" value={data.effective_date ?? ""} onChange={(e) => setData({ ...data, effective_date: e.target.value })} /></div>
        <div><label className="label">Review Date</label><input type="date" className="input" value={data.review_date ?? ""} onChange={(e) => setData({ ...data, review_date: e.target.value })} /></div>
        <div className="md:col-span-2">
          <label className="label">Related Requirements</label>
          <select multiple className="input min-h-[120px]" value={linkedReqs} onChange={(e) => setLinkedReqs(Array.from(e.target.selectedOptions, (o) => o.value))}>
            {reqs.map((r) => <option key={r.id} value={r.id}>{r.requirement_code} — {r.title}</option>)}
          </select>
          <p className="text-[11px] text-slate-500 mt-1">Hold Ctrl / ⌘ to select multiple requirements.</p>
        </div>
        <div className="md:col-span-2"><label className="label">Notes</label><textarea className="input min-h-[60px]" value={data.notes ?? ""} onChange={(e) => setData({ ...data, notes: e.target.value })} /></div>
        <div className="md:col-span-2 rounded border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center">
          <p className="text-sm text-slate-600">📎 File upload UI is shown but no real file is stored in this MVP.</p>
          <p className="text-xs text-slate-500 mt-1">Drag a file or click to browse — the platform records metadata so traceability is intact.</p>
          <input type="file" className="mt-2" disabled />
        </div>
      </div>
    </Modal>
  );
}
