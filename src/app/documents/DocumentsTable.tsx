"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { DocStatusBadge } from "@/components/Badges";
import { Modal } from "@/components/Modal";
import { Plus, Search, Upload } from "lucide-react";
import type { DocumentRecord } from "@/lib/types";

type Row = DocumentRecord & {
  ownerName: string;
  authorName: string;
  reviewerName: string;
  approverName: string;
  linked_requirements: number;
};

const CATEGORIES = ["General","Policies","Guides & Standards","Procedures","Letters","Evidence","Working Plans"];
const STATUSES = ["Draft","Under Review","Changes Requested","Approved","Digitally Signed","Active","Archived","Expired"];

export function DocumentsTable({ docs }: { docs: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [st, setSt] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(
    () => docs.filter((d) =>
      (!q || `${d.title} ${d.document_type}`.toLowerCase().includes(q.toLowerCase())) &&
      (!cat || d.category === cat) && (!st || d.status === st)
    ),
    [docs, q, cat, st]
  );

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body grid grid-cols-1 md:grid-cols-5 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input className="input pl-9" placeholder="Search documents…" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <select className="input" value={cat} onChange={(e) => setCat(e.target.value)}>
            <option value="">All categories</option>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <select className="input" value={st} onChange={(e) => setSt(e.target.value)}>
            <option value="">All statuses</option>{STATUSES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <button className="btn-primary justify-self-end" onClick={() => setOpen(true)}><Upload className="h-4 w-4" /> Upload Document</button>
        </div>
      </div>
      <div className="table-wrap">
        <table className="compliance">
          <thead><tr><th>Document</th><th>Category</th><th>Type</th><th>Version</th><th>Status</th><th>Owner</th><th>Author</th><th>Reviewer</th><th>Approver</th><th>Signature</th><th>Linked Req.</th><th>Updated</th><th>Next Review</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((d) => (
              <tr key={d.id}>
                <td className="wrap max-w-xs"><Link href={`/documents/${d.id}`} className="text-brand-700 hover:underline font-medium">{d.title}</Link></td>
                <td>{d.category}</td>
                <td>{d.document_type}</td>
                <td>v{d.version}</td>
                <td><DocStatusBadge status={d.status} /></td>
                <td>{d.ownerName}</td><td>{d.authorName}</td><td>{d.reviewerName}</td><td>{d.approverName}</td>
                <td>{d.signature_status}</td>
                <td className="text-center tabular-nums">{d.linked_requirements}</td>
                <td className="text-xs text-slate-500">{d.updated_at.slice(0, 10)}</td>
                <td className="text-xs">{d.review_date ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <UploadModal open={open} onClose={() => setOpen(false)} onCreated={() => router.refresh()} />
    </div>
  );
}

import { UploadModal } from "./UploadModal";
