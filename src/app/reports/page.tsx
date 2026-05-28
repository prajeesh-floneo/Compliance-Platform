import { PageHeader } from "@/components/PageHeader";
import {
  getRequirements,
  getLinksForRequirement,
  getDocument,
  getEvidenceForRequirement,
  getActionPlansForRequirement,
  getApprovalsForItem,
  getActionPlans,
  getDocuments,
  getEvidence,
  userName,
  isOverdue,
} from "@/lib/api-server";
import { ReportsClient } from "./ReportsClient";

export default function ReportsPage() {
  const reqs = getRequirements();

  // Compliance Matrix Report rows: a fully denormalised view of every
  // requirement with linked documents, evidence, actions and approval state.
  const matrix = reqs.map((r) => {
    const docs = getLinksForRequirement(r.id).map((l) => getDocument(l.document_id)).filter(Boolean) as ReturnType<typeof getDocument>[];
    const ev = getEvidenceForRequirement(r.id);
    const aps = getActionPlansForRequirement(r.id);
    const apprs = getApprovalsForItem(r.id);
    return {
      element_reviewed: r.evaluation_element,
      criteria: r.evaluation_criteria,
      requirement_id: r.requirement_code,
      compliance_level: r.compliance_status,
      methodology_used: r.methodology || "—",
      criteria_for_granting_compliance: r.criteria_for_compliance || "—",
      linked_documents: docs.map((d) => `${d!.title} (v${d!.version}, ${d!.status})`).join(" | ") || "—",
      linked_evidence: ev.map((e) => `${e.title} [${e.status}]`).join(" | ") || "—",
      observations: r.observations || "—",
      actions_to_perform: aps.map((a) => `${a.action_code}: ${a.corrective_action} [${a.status}]`).join(" | ") || r.actions_to_perform || "—",
      owner: userName(r.owner_id),
      reviewer: userName(r.reviewer_id),
      due_date: r.due_date ?? "—",
      approval_status: apprs[0]?.status ?? "—",
    };
  });

  const missingEv = reqs
    .filter((r) => getEvidenceForRequirement(r.id).length === 0)
    .map((r) => ({
      requirement_id: r.requirement_code,
      title: r.title,
      section: r.section,
      owner: userName(r.owner_id),
      risk_level: r.risk_level,
      compliance_status: r.compliance_status,
      due_date: r.due_date ?? "—",
    }));

  const actions = getActionPlans().map((a) => {
    const r = reqs.find((x) => x.id === a.requirement_id);
    return {
      action_code: a.action_code,
      requirement_id: r?.requirement_code ?? "—",
      issue: a.issue_description,
      corrective_action: a.corrective_action,
      owner: userName(a.owner_id),
      priority: a.priority,
      due_date: a.due_date,
      status: a.status,
      overdue: isOverdue(a.due_date) && a.status !== "Completed" && a.status !== "Verified" ? "Yes" : "No",
    };
  });

  const docStatus = getDocuments().map((d) => ({
    title: d.title, category: d.category, type: d.document_type, version: d.version,
    status: d.status, signature_status: d.signature_status, review_date: d.review_date ?? "—",
    owner: userName(d.owner_id), reviewer: userName(d.reviewer_id), approver: userName(d.approver_id),
  }));

  const auditor = matrix; // same as matrix for MVP

  const summary = [
    { metric: "Total requirements", value: reqs.length },
    { metric: "Compliant", value: reqs.filter((r) => r.compliance_status === "Compliant").length },
    { metric: "Partially Compliant", value: reqs.filter((r) => r.compliance_status === "Partially Compliant").length },
    { metric: "Not Compliant", value: reqs.filter((r) => r.compliance_status === "Not Compliant").length },
    { metric: "Pending / Under Review", value: reqs.filter((r) => r.compliance_status === "Pending" || r.compliance_status === "Under Review").length },
    { metric: "Documents on file", value: getDocuments().length },
    { metric: "Evidence on file", value: getEvidence().length },
    { metric: "Open action plans", value: getActionPlans().filter((a) => a.status !== "Completed" && a.status !== "Verified").length },
    { metric: "Overdue action plans", value: getActionPlans().filter((a) => isOverdue(a.due_date) && a.status !== "Completed" && a.status !== "Verified").length },
  ];

  return (
    <div>
      <PageHeader
        title="Reports"
        subtitle="Auditor-ready exports built from live compliance data."
        crumbs={[{ label: "Home", href: "/" }, { label: "Reports" }]}
      />
      <ReportsClient
        matrix={matrix}
        missingEv={missingEv}
        actions={actions}
        docStatus={docStatus}
        auditor={auditor}
        summary={summary}
      />
    </div>
  );
}
