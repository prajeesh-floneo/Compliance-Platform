"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ComplianceBadge,
  RiskBadge,
  MissingEvidenceBadge,
  OverdueBadge,
} from "@/components/Badges";
import { Modal } from "@/components/Modal";
import { Download, Plus, Upload, Search, Filter } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Requirement, ComplianceStatus, RiskLevel } from "@/lib/types";
import { toCSV } from "@/lib/csv";
import { useCan } from "@/components/UserProvider";

type Row = Requirement & {
  ownerName: string;
  reviewerName: string;
  linkedDocsCount: number;
  linkedEvidenceCount: number;
  actionPlanStatus: string;
  isOverdue: boolean;
};

export function RequirementsMatrix({
  rows,
  sections,
  owners,
}: {
  rows: Row[];
  sections: string[];
  owners: string[];
}) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("");
  const [section, setSection] = useState<string>("");
  const [owner, setOwner] = useState<string>("");
  const [risk, setRisk] = useState<string>("");
  const [onlyMissing, setOnlyMissing] = useState(false);
  const [onlyOverdue, setOnlyOverdue] = useState(false);
  const [onlyPending, setOnlyPending] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const canCreate = useCan("requirements:create");
  const canImport = useCan("requirements:bulk_import");
  const canExport = useCan("reports:export");

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (
        q &&
        !`${r.requirement_code} ${r.title} ${r.section}`
          .toLowerCase()
          .includes(q.toLowerCase())
      )
        return false;
      if (status && r.compliance_status !== status) return false;
      if (section && r.section !== section) return false;
      if (owner && r.ownerName !== owner) return false;
      if (risk && r.risk_level !== risk) return false;
      if (onlyMissing && r.linkedEvidenceCount > 0) return false;
      if (onlyOverdue && !r.isOverdue) return false;
      if (
        onlyPending &&
        r.compliance_status !== "Pending" &&
        r.compliance_status !== "Under Review"
      )
        return false;
      return true;
    });
  }, [
    rows,
    q,
    status,
    section,
    owner,
    risk,
    onlyMissing,
    onlyOverdue,
    onlyPending,
  ]);

  const exportCSV = () => {
    const csv = toCSV(
      filtered.map((r) => ({
        requirement_code: r.requirement_code,
        section: r.section,
        title: r.title,
        evaluation_element: r.evaluation_element,
        evaluation_criteria: r.evaluation_criteria,
        expected_document_type: r.expected_document_type,
        compliance_status: r.compliance_status,
        risk_level: r.risk_level,
        owner: r.ownerName,
        reviewer: r.reviewerName,
        linked_documents: r.linkedDocsCount,
        linked_evidence: r.linkedEvidenceCount,
        observations: r.observations,
        action_plan_status: r.actionPlanStatus,
        due_date: r.due_date,
      })),
    );
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "requirements-matrix.csv";
    a.click();
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body grid grid-cols-1 md:grid-cols-6 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search code, title, section…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">All statuses</option>
            {[
              "Compliant",
              "Partially Compliant",
              "Not Compliant",
              "Pending",
              "Under Review",
              "Not Applicable",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            value={section}
            onChange={(e) => setSection(e.target.value)}
          >
            <option value="">All sections</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
          >
            <option value="">All owners</option>
            {owners.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            className="input"
            value={risk}
            onChange={(e) => setRisk(e.target.value)}
          >
            <option value="">All risk</option>
            {["Low", "Medium", "High", "Critical"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <div className="px-5 py-3 border-t border-slate-200 bg-slate-50 flex flex-wrap items-center gap-3 text-sm">
          <span className="text-slate-500 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Quick filters:
          </span>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={onlyMissing}
              onChange={(e) => setOnlyMissing(e.target.checked)}
            />{" "}
            Missing evidence
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={onlyOverdue}
              onChange={(e) => setOnlyOverdue(e.target.checked)}
            />{" "}
            Overdue
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={onlyPending}
              onChange={(e) => setOnlyPending(e.target.checked)}
            />{" "}
            Pending review
          </label>
          <div className="ml-auto flex items-center gap-2">
            {canExport && (
              <button className="btn-secondary" onClick={exportCSV}>
                <Download className="h-4 w-4" /> Export CSV
              </button>
            )}
            {canImport && (
              <button
                className="btn-secondary"
                onClick={() => setShowImport(true)}
              >
                <Upload className="h-4 w-4" /> Bulk Import
              </button>
            )}
            {canCreate && (
              <button className="btn-primary" onClick={() => setShowAdd(true)}>
                <Plus className="h-4 w-4" /> Add Requirement
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="text-xs text-slate-500 mb-2">
        {filtered.length} of {rows.length} requirements
      </div>

      <div className="table-wrap">
        <table className="compliance">
          <thead>
            <tr>
              <th>Code</th>
              <th>Section</th>
              <th>Title</th>
              <th>Eval. Element</th>
              <th>Eval. Criteria</th>
              <th>Required Doc Type</th>
              <th>Status</th>
              <th>Risk</th>
              <th>Owner</th>
              <th>Reviewer</th>
              <th>Docs</th>
              <th>Ev.</th>
              <th>Gap / Obs.</th>
              <th>Action</th>
              <th>Due</th>
              <th>Updated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="font-mono text-xs">
                  <Link
                    href={`/requirements/${r.id}`}
                    className="text-brand-700 hover:underline"
                  >
                    {r.requirement_code}
                  </Link>
                </td>
                <td>{r.section}</td>
                <td className="wrap max-w-xs">
                  <Link
                    href={`/requirements/${r.id}`}
                    className="text-slate-900 hover:text-brand-700 font-medium"
                  >
                    {r.title}
                  </Link>
                </td>
                <td className="wrap max-w-sm text-slate-600">
                  {r.evaluation_element}
                </td>
                <td className="wrap max-w-sm text-slate-600">
                  {r.evaluation_criteria}
                </td>
                <td className="wrap max-w-xs">{r.expected_document_type}</td>
                <td>
                  <ComplianceBadge status={r.compliance_status} />
                </td>
                <td>
                  <RiskBadge level={r.risk_level} />
                </td>
                <td>{r.ownerName}</td>
                <td>{r.reviewerName}</td>
                <td className="text-center tabular-nums">
                  {r.linkedDocsCount}
                </td>
                <td className="text-center tabular-nums">
                  {r.linkedEvidenceCount === 0 ? (
                    <MissingEvidenceBadge />
                  ) : (
                    r.linkedEvidenceCount
                  )}
                </td>
                <td className="wrap max-w-xs text-slate-600">
                  {r.observations || <span className="text-slate-400">—</span>}
                </td>
                <td className="text-xs">{r.actionPlanStatus}</td>
                <td>
                  {r.due_date}
                  {r.isOverdue && (
                    <div className="mt-1">
                      <OverdueBadge />
                    </div>
                  )}
                </td>
                <td className="text-xs text-slate-500">
                  {r.updated_at.slice(0, 10)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AddRequirementModal
        open={showAdd}
        onClose={() => setShowAdd(false)}
        onCreated={() => router.refresh()}
      />
      <BulkImportModal
        open={showImport}
        onClose={() => setShowImport(false)}
        onImported={() => router.refresh()}
      />
    </div>
  );
}

import { AddRequirementModal } from "./AddRequirementModal";
import { BulkImportModal } from "./BulkImportModal";
