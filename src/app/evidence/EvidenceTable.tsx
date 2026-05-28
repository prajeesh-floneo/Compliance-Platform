"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/Modal";
import { Plus, Search } from "lucide-react";
import type { Evidence, Requirement, DocumentRecord } from "@/lib/types";

type Row = Evidence & { requirement_code: string; document_title: string; collected_by_name: string };

const TYPES = ["Screenshot","Security Scan Report","Penetration Test Report","Backup Log","Audit Report","Incident Report","System Configuration Export","Script Output","Attestation Letter","Other"];

export function EvidenceTable({ items }: { items: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState(""); const [type, setType] = useState(""); const [status, setStatus] = useState("");
  const [open, setOpen] = useState(false);
  const [reqs, setReqs] = useState<Requirement[]>([]);
  const [docs, setDocs] = useState<DocumentRecord[]>([]);
  const [data, setData] = useState<Partial<Evidence>>({ evidence_type: "Screenshot", status: "Valid", retention_period: "2 years" });

  useEffect(() => { if (open) { fetch("/api/requirements").then((r) => r.json()).then((j) => setReqs(j.requirements)); fetch("/api/documents").then((r) => r.json()).then((j) => setDocs(j.documents)); } }, [open]);

  const filtered = useMemo(() => items.filter((e) =>
    (!q || `${e.title} ${e.notes}`.toLowerCase().includes(q.toLowerCase())) &&
    (!type || e.evidence_type === type) && (!status || e.status === status)), [items, q, type, status]);

  const create = async () => {
    await fetch("/api/evidence", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
    setOpen(false); setData({ evidence_type: "Screenshot", status: "Valid", retention_period: "2 years" }); router.refresh();
  };

  const markStatus = async (id: string, status: Evidence["status"]) => {
    await fetch("/api/evidence", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    router.refresh();
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search evidence…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input" value={type} onChange={(e) => setType(e.target.value)}><option value="">All types</option>{TYPES.map((t) => <option key={t}>{t}</option>)}</select>
          <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{["Valid","Expired","Pending Update","Rejected"].map((t) => <option key={t}>{t}</option>)}</select>
          <button className="btn-primary justify-self-end" onClick={() => setOpen(true)}><Plus className="h-4 w-4" /> Upload Evidence</button>
        </div>
      </div>
      <div className="table-wrap"><table className="compliance"><thead><tr><th>Title</th><th>Type</th><th>Linked Req.</th><th>Linked Doc.</th><th>Collected By</th><th>Collected</th><th>Retention</th><th>Expiry</th><th>Status</th><th>Actions</th></tr></thead><tbody className="divide-y divide-slate-100">
        {filtered.map((e) => (
          <tr key={e.id}>
            <td className="wrap max-w-xs"><div className="font-medium text-slate-900">{e.title}</div><div className="text-xs text-slate-500">{e.notes}</div></td>
            <td>{e.evidence_type}</td>
            <td className="font-mono text-xs">{e.requirement_code || <span className="text-slate-400">—</span>}</td>
            <td className="text-xs">{e.document_title || <span className="text-slate-400">—</span>}</td>
            <td>{e.collected_by_name}</td>
            <td>{e.collection_date}</td>
            <td>{e.retention_period}</td>
            <td>{e.expiry_date ?? "—"}</td>
            <td><span className={e.status === "Valid" ? "badge-green" : e.status === "Expired" ? "badge-red" : "badge-yellow"}>{e.status}</span></td>
            <td className="text-xs space-x-2">
              {e.status !== "Valid" && <button onClick={() => markStatus(e.id, "Valid")} className="text-emerald-700 hover:underline">Mark Valid</button>}
              {e.status !== "Expired" && <button onClick={() => markStatus(e.id, "Expired")} className="text-red-700 hover:underline">Mark Expired</button>}
              {e.status !== "Pending Update" && <button onClick={() => markStatus(e.id, "Pending Update")} className="text-amber-700 hover:underline">Request Update</button>}
            </td>
          </tr>
        ))}
      </tbody></table></div>

      <Modal open={open} onClose={() => setOpen(false)} title="Upload evidence" size="lg" footer={<><button className="btn-secondary" onClick={() => setOpen(false)}>Cancel</button><button className="btn-primary" onClick={create} disabled={!data.title}>Upload</button></>}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2"><label className="label">Title</label><input className="input" value={data.title ?? ""} onChange={(e) => setData({ ...data, title: e.target.value })} /></div>
          <div><label className="label">Type</label><select className="input" value={data.evidence_type} onChange={(e) => setData({ ...data, evidence_type: e.target.value as Evidence["evidence_type"] })}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Status</label><select className="input" value={data.status} onChange={(e) => setData({ ...data, status: e.target.value as Evidence["status"] })}>{["Valid","Expired","Pending Update","Rejected"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div><label className="label">Linked Requirement</label><select className="input" value={data.requirement_id ?? ""} onChange={(e) => setData({ ...data, requirement_id: e.target.value || null })}><option value="">—</option>{reqs.map((r) => <option key={r.id} value={r.id}>{r.requirement_code} — {r.title}</option>)}</select></div>
          <div><label className="label">Linked Document</label><select className="input" value={data.document_id ?? ""} onChange={(e) => setData({ ...data, document_id: e.target.value || null })}><option value="">—</option>{docs.map((d) => <option key={d.id} value={d.id}>{d.title}</option>)}</select></div>
          <div><label className="label">Collection Date</label><input type="date" className="input" value={data.collection_date ?? ""} onChange={(e) => setData({ ...data, collection_date: e.target.value })} /></div>
          <div><label className="label">Retention</label><select className="input" value={data.retention_period} onChange={(e) => setData({ ...data, retention_period: e.target.value as Evidence["retention_period"] })}>{["1 year","2 years","5 years","7 years","Permanent"].map((t) => <option key={t}>{t}</option>)}</select></div>
          <div className="md:col-span-2"><label className="label">Notes</label><textarea className="input min-h-[70px]" value={data.notes ?? ""} onChange={(e) => setData({ ...data, notes: e.target.value })} /></div>
        </div>
      </Modal>
    </div>
  );
}
