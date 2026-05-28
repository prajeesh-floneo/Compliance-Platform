"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ApprovalBadge,
  ComplianceBadge,
  DocStatusBadge,
} from "@/components/Badges";
import {
  FileText,
  MessageSquare,
  History,
  ShieldCheck,
  ClipboardList,
  BookOpen,
  Paperclip,
} from "lucide-react";
import type { DocumentRecord, Evidence, Requirement } from "@/lib/types";
import type {
  Approval,
  DocumentComment,
  DocumentVersion,
} from "@/lib/types-extra";
import { useCan } from "@/components/UserProvider";

type Doc = DocumentRecord & {
  ownerName: string;
  authorName: string;
  reviewerName: string;
  approverName: string;
};
type LinkedReq = Requirement & {
  relation_type: string;
  mandatory_or_optional: string;
};

export function DocumentViewer({
  doc,
  requirements,
  evidence,
  versions,
  approvals,
  comments,
}: {
  doc: Doc;
  requirements: LinkedReq[];
  evidence: Evidence[];
  versions: DocumentVersion[];
  approvals: Approval[];
  comments: DocumentComment[];
}) {
  const [tab, setTab] = useState<
    "preview" | "details" | "req" | "ev" | "ver" | "appr" | "com"
  >("preview");
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const canEdit = useCan("documents:edit");
  const canRequestSig = useCan("approvals:sign") || useCan("documents:edit");

  const transition = async (status: DocumentRecord["status"]) => {
    setBusy(true);
    await fetch(`/api/documents/${doc.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusy(false);
    router.refresh();
  };

  const requestSig = async () => {
    setBusy(true);
    await fetch("/api/approvals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        item_type: "Document",
        item_id: doc.id,
        item_name: doc.title,
        approver_id: doc.approver_id,
      }),
    });
    setBusy(false);
    router.refresh();
  };

  const tabs = [
    { key: "preview", label: "Preview", icon: BookOpen },
    { key: "details", label: "Details", icon: FileText },
    {
      key: "req",
      label: `Linked Requirements (${requirements.length})`,
      icon: ClipboardList,
    },
    { key: "ev", label: `Evidence (${evidence.length})`, icon: Paperclip },
    {
      key: "ver",
      label: `Version History (${versions.length})`,
      icon: History,
    },
    {
      key: "appr",
      label: `Approval History (${approvals.length})`,
      icon: ShieldCheck,
    },
    { key: "com", label: `Comments (${comments.length})`, icon: MessageSquare },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3 card">
        <div className="border-b border-slate-200 px-2 flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`tab-btn flex items-center gap-1.5 ${tab === t.key ? "active" : ""}`}
            >
              <t.icon className="h-4 w-4" />
              {t.label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "preview" && (
            <div className="rounded border border-slate-200 bg-slate-50 p-10 text-center">
              <FileText className="h-12 w-12 mx-auto text-slate-400" />
              <p className="mt-2 text-sm text-slate-600">
                Document preview placeholder
              </p>
              <p className="text-xs text-slate-500">{doc.file_url}</p>
              <p className="text-[11px] text-slate-400 mt-4">
                In the production build this area renders a PDF/HTML preview.
              </p>
            </div>
          )}
          {tab === "details" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
              {[
                ["Title", doc.title],
                ["Category", doc.category],
                ["Document Type", doc.document_type],
                ["Version", `v${doc.version}`],
                ["Status", <DocStatusBadge key="s" status={doc.status} />],
                ["Language", doc.language],
                ["Department", doc.department],
                ["Owner", doc.ownerName],
                ["Author", doc.authorName],
                ["Reviewer", doc.reviewerName],
                ["Approver", doc.approverName],
                ["Signature Status", doc.signature_status],
                ["Signer", doc.signer_name ?? "—"],
                ["Signed At", doc.signed_at ?? "—"],
                ["Signature Hash", doc.signature_hash ?? "—"],
                ["Effective Date", doc.effective_date ?? "—"],
                ["Review Date", doc.review_date ?? "—"],
                ["Expiry Date", doc.expiry_date ?? "—"],
              ].map(([k, v]) => (
                <div key={k as string}>
                  <div className="label">{k}</div>
                  <div className="text-slate-800 break-words">
                    {v as React.ReactNode}
                  </div>
                </div>
              ))}
            </div>
          )}
          {tab === "req" &&
            (requirements.length === 0 ? (
              <p className="text-sm text-slate-500">No requirements linked.</p>
            ) : (
              <div className="table-wrap">
                <table className="compliance">
                  <thead>
                    <tr>
                      <th>Code</th>
                      <th>Title</th>
                      <th>Section</th>
                      <th>Status</th>
                      <th>Relation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {requirements.map((r) => (
                      <tr key={r.id}>
                        <td className="font-mono text-xs">
                          <Link
                            href={`/requirements/${r.id}`}
                            className="text-brand-700 hover:underline"
                          >
                            {r.requirement_code}
                          </Link>
                        </td>
                        <td className="wrap max-w-xs">{r.title}</td>
                        <td>{r.section}</td>
                        <td>
                          <ComplianceBadge status={r.compliance_status} />
                        </td>
                        <td>
                          {r.relation_type} · {r.mandatory_or_optional}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          {tab === "ev" &&
            (evidence.length === 0 ? (
              <p className="text-sm text-slate-500">
                No evidence linked to this document.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {evidence.map((e) => (
                  <li key={e.id} className="py-2 text-sm flex justify-between">
                    <span>{e.title}</span>
                    <span className="text-xs text-slate-500">
                      {e.evidence_type} · {e.collection_date}
                    </span>
                  </li>
                ))}
              </ul>
            ))}
          {tab === "ver" && (
            <ol className="relative border-l border-slate-200 ml-3 space-y-3">
              {versions.length === 0 && (
                <li className="text-sm text-slate-500 ml-4">
                  No prior versions recorded.
                </li>
              )}
              {versions.map((v) => (
                <li key={v.id} className="ml-4">
                  <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-500 border-2 border-white" />
                  <div className="text-sm text-slate-800">
                    v{v.version} — {v.change_summary}
                  </div>
                  <div className="text-xs text-slate-500">
                    {new Date(v.changed_at).toLocaleString()}
                  </div>
                </li>
              ))}
            </ol>
          )}
          {tab === "appr" &&
            (approvals.length === 0 ? (
              <p className="text-sm text-slate-500">
                No approval requests yet.
              </p>
            ) : (
              <div className="table-wrap">
                <table className="compliance">
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Comments</th>
                      <th>Signature</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {approvals.map((a) => (
                      <tr key={a.id}>
                        <td className="text-xs">
                          {new Date(a.requested_date).toLocaleDateString()}
                        </td>
                        <td>
                          <ApprovalBadge status={a.status} />
                        </td>
                        <td className="wrap max-w-md text-slate-600">
                          {a.comments}
                        </td>
                        <td className="font-mono text-[10px]">
                          {a.signature_hash ?? "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          {tab === "com" && (
            <div className="space-y-3">
              {comments.length === 0 && (
                <p className="text-sm text-slate-500">No comments yet.</p>
              )}
              {comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded border border-slate-200 p-3 bg-slate-50"
                >
                  <div className="text-xs text-slate-500 mb-1">
                    {c.author_name} · {new Date(c.created_at).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-800">{c.body}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">Lifecycle</h3>
          </div>
          <div className="card-body space-y-2 text-sm">
            {[
              "Draft",
              "Under Review",
              "Changes Requested",
              "Approved",
              "Digitally Signed",
              "Active",
              "Archived",
            ].map((s) => (
              <div
                key={s}
                className={`flex items-center gap-2 ${s === doc.status ? "font-semibold text-brand-700" : "text-slate-600"}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${s === doc.status ? "bg-brand-600" : "bg-slate-300"}`}
                />
                {s}
              </div>
            ))}
            <div className="pt-2 border-t border-slate-200 flex flex-wrap gap-1.5">
              {canEdit ? (
                [
                  "Draft",
                  "Under Review",
                  "Changes Requested",
                  "Approved",
                  "Active",
                  "Archived",
                ].map((s) => (
                  <button
                    key={s}
                    disabled={busy}
                    className="text-xs px-2 py-1 rounded border border-slate-300 hover:bg-slate-50"
                    onClick={() => transition(s as DocumentRecord["status"])}
                  >
                    → {s}
                  </button>
                ))
              ) : (
                <span className="text-xs text-slate-500">
                  Your role cannot transition document status.
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">Digital Signature</h3>
          </div>
          <div className="card-body text-sm">
            <p className="text-slate-600 text-xs mb-3">
              Signature stored as internal approval metadata (signer name, role,
              time, signature hash).{" "}
              <em>
                Integration point for WebSec / e.firma / other
                jurisdiction-specific tools.
              </em>
            </p>
            <div className="space-y-1 text-xs">
              <div>
                <strong>Status:</strong> {doc.signature_status}
              </div>
              {doc.signer_name && (
                <div>
                  <strong>Signer:</strong> {doc.signer_name} ({doc.signer_role})
                </div>
              )}
              {doc.signed_at && (
                <div>
                  <strong>Signed:</strong>{" "}
                  {new Date(doc.signed_at).toLocaleString()}
                </div>
              )}
              {doc.signature_hash && (
                <div className="font-mono text-[10px] break-all">
                  <strong>Hash:</strong> {doc.signature_hash}
                </div>
              )}
            </div>
            {canRequestSig && doc.signature_status !== "Signed" && (
              <button
                className="btn-primary mt-3 w-full"
                onClick={requestSig}
                disabled={busy}
              >
                Request signature
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
