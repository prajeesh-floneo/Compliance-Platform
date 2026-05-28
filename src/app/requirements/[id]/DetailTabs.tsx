"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/Modal";
import { ActionStatusBadge, DocStatusBadge } from "@/components/Badges";
import type {
  ActionPlan,
  DocumentRecord,
  Evidence,
  Requirement,
} from "@/lib/types";
import type { ActivityLog } from "@/lib/types-extra";
import { Plus } from "lucide-react";
import { useCan } from "@/components/UserProvider";

type LinkedDoc = DocumentRecord & {
  relation_type: string;
  mandatory_or_optional: string;
  link_id: string;
};

export function DocsTab({
  requirementId,
  documents,
  onChange,
}: {
  requirementId: string;
  documents: LinkedDoc[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState<DocumentRecord[]>([]);
  const [docId, setDocId] = useState("");
  const canLink = useCan("documents:edit");
  useEffect(() => {
    if (open)
      fetch("/api/documents")
        .then((r) => r.json())
        .then((j) => setAll(j.documents));
  }, [open]);
  const link = async () => {
    if (!docId) return;
    await fetch("/api/links", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        requirement_id: requirementId,
        document_id: docId,
      }),
    });
    setOpen(false);
    setDocId("");
    onChange();
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-slate-800">Linked Documents</h3>
        {canLink && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Link Document
          </button>
        )}
      </div>
      {documents.length === 0 ? (
        <p className="text-sm text-slate-500">No documents linked yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="compliance">
            <thead>
              <tr>
                <th>Title</th>
                <th>Version</th>
                <th>Status</th>
                <th>Relation</th>
                <th>Mandatory</th>
                <th>Signature</th>
                <th></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {documents.map((d) => (
                <tr key={d.id}>
                  <td className="wrap max-w-xs">
                    <Link
                      href={`/documents/${d.id}`}
                      className="text-brand-700 hover:underline font-medium"
                    >
                      {d.title}
                    </Link>
                  </td>
                  <td>v{d.version}</td>
                  <td>
                    <DocStatusBadge status={d.status} />
                  </td>
                  <td>{d.relation_type}</td>
                  <td>{d.mandatory_or_optional}</td>
                  <td>{d.signature_status}</td>
                  <td>
                    <Link
                      href={`/documents/${d.id}`}
                      className="text-sm text-brand-700 hover:underline"
                    >
                      Open →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Link existing document"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button className="btn-primary" onClick={link} disabled={!docId}>
              Link
            </button>
          </>
        }
      >
        <label className="label">Document</label>
        <select
          className="input"
          value={docId}
          onChange={(e) => setDocId(e.target.value)}
        >
          <option value="">Choose…</option>
          {all.map((d) => (
            <option key={d.id} value={d.id}>
              {d.title} (v{d.version})
            </option>
          ))}
        </select>
      </Modal>
    </div>
  );
}

export function EvidenceTab({
  requirementId,
  evidence,
  onChange,
}: {
  requirementId: string;
  evidence: Evidence[];
  onChange: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<Partial<Evidence>>({
    evidence_type: "Other",
    status: "Valid",
    retention_period: "2 years",
  });
  const canUpload = useCan("evidence:create");
  const submit = async () => {
    await fetch("/api/evidence", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, requirement_id: requirementId }),
    });
    setOpen(false);
    setData({
      evidence_type: "Other",
      status: "Valid",
      retention_period: "2 years",
    });
    onChange();
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-slate-800">Linked Evidence</h3>
        {canUpload && (
          <button className="btn-primary" onClick={() => setOpen(true)}>
            <Plus className="h-4 w-4" /> Upload Evidence
          </button>
        )}
      </div>
      {evidence.length === 0 ? (
        <p className="text-sm text-slate-500">No evidence linked yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="compliance">
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Collected</th>
                <th>Status</th>
                <th>Expiry</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {evidence.map((e) => (
                <tr key={e.id}>
                  <td className="wrap max-w-xs">{e.title}</td>
                  <td>{e.evidence_type}</td>
                  <td>{e.collection_date}</td>
                  <td>
                    <span
                      className={
                        e.status === "Valid"
                          ? "badge-green"
                          : e.status === "Expired"
                            ? "badge-red"
                            : "badge-yellow"
                      }
                    >
                      {e.status}
                    </span>
                  </td>
                  <td>{e.expiry_date ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Upload evidence"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={!data.title}
            >
              Upload
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="label">Title</label>
            <input
              className="input"
              value={data.title ?? ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Type</label>
            <select
              className="input"
              value={data.evidence_type}
              onChange={(e) =>
                setData({
                  ...data,
                  evidence_type: e.target.value as Evidence["evidence_type"],
                })
              }
            >
              {[
                "Screenshot",
                "Security Scan Report",
                "Penetration Test Report",
                "Backup Log",
                "Audit Report",
                "Incident Report",
                "System Configuration Export",
                "Script Output",
                "Attestation Letter",
                "Other",
              ].map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Collection Date</label>
            <input
              type="date"
              className="input"
              value={data.collection_date ?? ""}
              onChange={(e) =>
                setData({ ...data, collection_date: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Retention Period</label>
            <select
              className="input"
              value={data.retention_period}
              onChange={(e) =>
                setData({
                  ...data,
                  retention_period: e.target
                    .value as Evidence["retention_period"],
                })
              }
            >
              {["1 year", "2 years", "5 years", "7 years", "Permanent"].map(
                (t) => (
                  <option key={t}>{t}</option>
                ),
              )}
            </select>
          </div>
          <div>
            <label className="label">Expiry Date</label>
            <input
              type="date"
              className="input"
              value={data.expiry_date ?? ""}
              onChange={(e) =>
                setData({ ...data, expiry_date: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Notes</label>
            <textarea
              className="input min-h-[70px]"
              value={data.notes ?? ""}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ReviewTab({
  requirement,
  onSaved,
  onCreateAction,
}: {
  requirement: Requirement;
  onSaved: () => void;
  onCreateAction: () => void;
}) {
  const [data, setData] = useState({
    compliance_status: requirement.compliance_status,
    methodology: requirement.methodology,
    criteria_for_compliance: requirement.criteria_for_compliance,
    observations: requirement.observations,
    notes: requirement.notes,
    human_review_required: requirement.human_review_required,
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const canEdit = useCan("requirements:edit");
  const canCreateAction = useCan("action_plans:create");
  const save = async () => {
    setSaving(true);
    await fetch(`/api/requirements/${requirement.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setSaving(false);
    setMsg("Saved.");
    onSaved();
  };
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-slate-800">Compliance Review</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="label">Status</label>
          <select
            className="input"
            value={data.compliance_status}
            onChange={(e) =>
              setData({
                ...data,
                compliance_status: e.target
                  .value as Requirement["compliance_status"],
              })
            }
          >
            {[
              "Compliant",
              "Not Compliant",
              "Partially Compliant",
              "Not Applicable",
              "Pending",
              "Under Review",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="flex items-end">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={data.human_review_required}
              onChange={(e) =>
                setData({ ...data, human_review_required: e.target.checked })
              }
            />{" "}
            Mark human review required
          </label>
        </div>
        <div className="md:col-span-2">
          <label className="label">Methodology Used</label>
          <textarea
            className="input min-h-[80px]"
            value={data.methodology}
            onChange={(e) => setData({ ...data, methodology: e.target.value })}
            placeholder="Describe how compliance was assessed (interview, document review, system inspection, audit, etc.)"
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Criteria for Granting Compliance</label>
          <textarea
            className="input min-h-[80px]"
            value={data.criteria_for_compliance}
            onChange={(e) =>
              setData({ ...data, criteria_for_compliance: e.target.value })
            }
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Auditor / Reviewer Notes</label>
          <textarea
            className="input min-h-[80px]"
            value={data.observations}
            onChange={(e) => setData({ ...data, observations: e.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className="label">Internal Notes</label>
          <textarea
            className="input min-h-[60px]"
            value={data.notes}
            onChange={(e) => setData({ ...data, notes: e.target.value })}
          />
        </div>
      </div>
      <div className="flex gap-2 justify-end">
        {canCreateAction && data.compliance_status === "Not Compliant" && (
          <button className="btn-secondary" onClick={onCreateAction}>
            Create Action Plan
          </button>
        )}
        {canEdit ? (
          <button className="btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save Review"}
          </button>
        ) : (
          <span className="text-xs text-slate-500">
            Your role cannot edit the compliance review.
          </span>
        )}
      </div>
      {msg && <p className="text-xs text-emerald-700">{msg}</p>}
    </div>
  );
}

export function ActionPlansTab({
  requirementId,
  plans,
  onChange,
  openCreate,
  setOpenCreate,
}: {
  requirementId: string;
  plans: ActionPlan[];
  onChange: () => void;
  openCreate: boolean;
  setOpenCreate: (v: boolean) => void;
}) {
  const [data, setData] = useState<Partial<ActionPlan>>({
    priority: "High",
    risk_level: "High",
    status: "Open",
  });
  const canCreate = useCan("action_plans:create");
  const submit = async () => {
    await fetch("/api/action-plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...data, requirement_id: requirementId }),
    });
    setOpenCreate(false);
    setData({ priority: "High", risk_level: "High", status: "Open" });
    onChange();
  };
  return (
    <div>
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-slate-800">Action Plans</h3>
        {canCreate && (
          <button className="btn-primary" onClick={() => setOpenCreate(true)}>
            <Plus className="h-4 w-4" /> Create Action Plan
          </button>
        )}
      </div>
      {plans.length === 0 ? (
        <p className="text-sm text-slate-500">No action plans yet.</p>
      ) : (
        <div className="table-wrap">
          <table className="compliance">
            <thead>
              <tr>
                <th>Code</th>
                <th>Issue</th>
                <th>Corrective Action</th>
                <th>Priority</th>
                <th>Due</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {plans.map((a) => (
                <tr key={a.id}>
                  <td className="font-mono text-xs">{a.action_code}</td>
                  <td className="wrap max-w-xs">{a.issue_description}</td>
                  <td className="wrap max-w-xs">{a.corrective_action}</td>
                  <td>{a.priority}</td>
                  <td>{a.due_date}</td>
                  <td>
                    <ActionStatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Modal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        title="Create Action Plan"
        footer={
          <>
            <button
              className="btn-secondary"
              onClick={() => setOpenCreate(false)}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={submit}
              disabled={!data.issue_description}
            >
              Create
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="md:col-span-2">
            <label className="label">Issue / Gap Description</label>
            <textarea
              className="input min-h-[70px]"
              value={data.issue_description ?? ""}
              onChange={(e) =>
                setData({ ...data, issue_description: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2">
            <label className="label">Corrective Action</label>
            <textarea
              className="input min-h-[70px]"
              value={data.corrective_action ?? ""}
              onChange={(e) =>
                setData({ ...data, corrective_action: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Priority</label>
            <select
              className="input"
              value={data.priority}
              onChange={(e) =>
                setData({
                  ...data,
                  priority: e.target.value as ActionPlan["priority"],
                })
              }
            >
              {["Low", "Medium", "High", "Critical"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Risk Level</label>
            <select
              className="input"
              value={data.risk_level}
              onChange={(e) =>
                setData({
                  ...data,
                  risk_level: e.target.value as ActionPlan["risk_level"],
                })
              }
            >
              {["Low", "Medium", "High", "Critical"].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Due Date</label>
            <input
              type="date"
              className="input"
              value={data.due_date ?? ""}
              onChange={(e) => setData({ ...data, due_date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Status</label>
            <select
              className="input"
              value={data.status}
              onChange={(e) =>
                setData({
                  ...data,
                  status: e.target.value as ActionPlan["status"],
                })
              }
            >
              {[
                "Open",
                "In Progress",
                "Waiting for Evidence",
                "Completed",
                "Verified",
                "Overdue",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export function ActivityTab({
  rows,
}: {
  rows: (ActivityLog & { user_name: string })[];
}) {
  return (
    <div>
      <h3 className="font-semibold text-slate-800 mb-3">Activity History</h3>
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No activity recorded.</p>
      ) : (
        <ol className="relative border-l border-slate-200 ml-3 space-y-4">
          {rows.map((r) => (
            <li key={r.id} className="ml-4">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-brand-500 border-2 border-white" />
              <div className="text-sm text-slate-800">
                <span className="font-medium">{r.user_name}</span> · {r.action}
              </div>
              <div className="text-xs text-slate-500">
                {new Date(r.timestamp).toLocaleString()} · {r.details}
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
