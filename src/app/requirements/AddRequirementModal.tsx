"use client";

import { useState } from "react";
import { Modal } from "@/components/Modal";

const fields: { name: string; label: string; type?: string; full?: boolean; options?: string[] }[] = [
  { name: "requirement_code", label: "Requirement Code" },
  { name: "section", label: "Section" },
  { name: "title", label: "Title", full: true },
  { name: "evaluation_element", label: "Evaluation Element", type: "textarea", full: true },
  { name: "evaluation_criteria", label: "Evaluation Criteria", type: "textarea", full: true },
  { name: "expected_document_type", label: "Expected Document Type", full: true },
  { name: "compliance_status", label: "Compliance Status", options: ["Pending","Compliant","Partially Compliant","Not Compliant","Not Applicable","Under Review"] },
  { name: "risk_level", label: "Risk Level", options: ["Low","Medium","High","Critical"] },
  { name: "owner", label: "Owner (name or email)" },
  { name: "reviewer", label: "Reviewer (name or email)" },
  { name: "due_date", label: "Due Date", type: "date" },
  { name: "methodology", label: "Methodology", type: "textarea", full: true },
  { name: "criteria_for_compliance", label: "Criteria for Granting Compliance", type: "textarea", full: true },
  { name: "observations", label: "Observations", type: "textarea", full: true },
  { name: "actions_to_perform", label: "Actions to Perform", type: "textarea", full: true },
];

export function AddRequirementModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const [data, setData] = useState<Record<string, string>>({
    compliance_status: "Pending",
    risk_level: "Medium",
  });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true); setError(null);
    // post via bulk-import to get owner/reviewer name resolution for free
    const res = await fetch("/api/requirements/bulk-import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rows: [data] }),
    });
    const json = await res.json();
    setBusy(false);
    if (!res.ok) { setError(json.error ?? "Error"); return; }
    const skipped = json.rows.find((r: { errors: string[] }) => r.errors.length);
    if (skipped) { setError(skipped.errors.join("; ")); return; }
    onCreated(); onClose();
    setData({ compliance_status: "Pending", risk_level: "Medium" });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add Requirement"
      size="lg"
      footer={<>
        <button className="btn-secondary" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save Requirement"}</button>
      </>}
    >
      {error && <div className="mb-3 rounded border border-red-200 bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {fields.map((f) => (
          <div key={f.name} className={f.full || f.type === "textarea" ? "md:col-span-2" : ""}>
            <label className="label">{f.label}</label>
            {f.type === "textarea" ? (
              <textarea className="input min-h-[70px]" value={data[f.name] ?? ""} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} />
            ) : f.options ? (
              <select className="input" value={data[f.name] ?? ""} onChange={(e) => setData({ ...data, [f.name]: e.target.value })}>
                {f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            ) : (
              <input className="input" type={f.type ?? "text"} value={data[f.name] ?? ""} onChange={(e) => setData({ ...data, [f.name]: e.target.value })} />
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
}
