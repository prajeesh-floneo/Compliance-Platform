// Server-side helpers that read directly from the in-memory store —
// used by RSC pages so we don't make HTTP calls to ourselves.

import { db, userName, isOverdue } from "./store";
import type {
  Requirement,
  DocumentRecord,
  Evidence,
  ActionPlan,
  RequirementDocumentLink,
} from "./types";
import type { Approval, AIAnalysis, ActivityLog } from "./types-extra";

export function getRequirements(): Requirement[] {
  return db().requirements;
}
export function getRequirement(id: string): Requirement | undefined {
  return db().requirements.find((r) => r.id === id);
}
export function getDocuments(): DocumentRecord[] {
  return db().documents;
}
export function getDocument(id: string): DocumentRecord | undefined {
  return db().documents.find((d) => d.id === id);
}
export function getLinksForRequirement(req_id: string): RequirementDocumentLink[] {
  return db().requirementDocuments.filter((l) => l.requirement_id === req_id);
}
export function getLinksForDocument(doc_id: string): RequirementDocumentLink[] {
  return db().requirementDocuments.filter((l) => l.document_id === doc_id);
}
export function getEvidence(): Evidence[] {
  return db().evidence;
}
export function getEvidenceForRequirement(req_id: string): Evidence[] {
  return db().evidence.filter((e) => e.requirement_id === req_id);
}
export function getEvidenceForDocument(doc_id: string): Evidence[] {
  return db().evidence.filter((e) => e.document_id === doc_id);
}
export function getActionPlans(): ActionPlan[] {
  return db().actionPlans;
}
export function getActionPlansForRequirement(req_id: string): ActionPlan[] {
  return db().actionPlans.filter((a) => a.requirement_id === req_id);
}
export function getApprovals(): Approval[] {
  return db().approvals;
}
export function getApprovalsForItem(item_id: string): Approval[] {
  return db().approvals.filter((a) => a.item_id === item_id);
}
export function getAIAnalyses(): AIAnalysis[] {
  return db().aiAnalyses;
}
export function getAIAnalysesForRequirement(req_id: string): AIAnalysis[] {
  return db().aiAnalyses.filter((a) => a.requirement_id === req_id);
}
export function getActivityLogs(item_id?: string): ActivityLog[] {
  const all = db().activityLogs;
  return item_id ? all.filter((l) => l.item_id === item_id) : all;
}
export function getUsers() {
  return db().users;
}
export function getDocVersions(document_id: string) {
  return db().documentVersions.filter((v) => v.document_id === document_id);
}
export function getDocComments(document_id: string) {
  return db().documentComments.filter((c) => c.document_id === document_id);
}

export { userName, isOverdue };

// Aggregate dashboard counts.
export function dashboardStats() {
  const reqs = getRequirements();
  const aps = getActionPlans();
  const evList = getEvidence();
  const evByReq = new Set(evList.map((e) => e.requirement_id));
  return {
    total: reqs.length,
    compliant: reqs.filter((r) => r.compliance_status === "Compliant").length,
    notCompliant: reqs.filter((r) => r.compliance_status === "Not Compliant").length,
    partial: reqs.filter((r) => r.compliance_status === "Partially Compliant").length,
    pending: reqs.filter(
      (r) => r.compliance_status === "Pending" || r.compliance_status === "Under Review"
    ).length,
    missingEvidence: reqs.filter((r) => !evByReq.has(r.id)).length,
    highRiskGaps: reqs.filter(
      (r) =>
        (r.risk_level === "High" || r.risk_level === "Critical") &&
        r.compliance_status !== "Compliant" &&
        r.compliance_status !== "Not Applicable"
    ).length,
    overdueActions: aps.filter(
      (a) =>
        a.status !== "Completed" &&
        a.status !== "Verified" &&
        isOverdue(a.due_date)
    ).length,
  };
}

// Detect "missing items" for a single requirement — used by detail page.
export function missingItemsForRequirement(req_id: string) {
  const links = getLinksForRequirement(req_id);
  const docs = links
    .map((l) => getDocument(l.document_id))
    .filter(Boolean) as DocumentRecord[];
  const ev = getEvidenceForRequirement(req_id);
  const aps = getActionPlansForRequirement(req_id);
  const req_ = getRequirement(req_id);
  const items: { label: string; level: "red" | "yellow" }[] = [];
  if (docs.length === 0) items.push({ label: "Missing document", level: "red" });
  if (ev.length === 0) items.push({ label: "Missing evidence", level: "red" });
  if (!docs.some((d) => d.signature_status === "Signed"))
    items.push({ label: "Missing signature", level: "yellow" });
  const hasApproved = docs.some(
    (d) => d.status === "Approved" || d.status === "Digitally Signed" || d.status === "Active"
  );
  if (!hasApproved) items.push({ label: "Missing approval", level: "yellow" });
  if (
    req_?.compliance_status === "Not Compliant" &&
    !aps.some((a) => a.status !== "Completed" && a.status !== "Verified")
  )
    items.push({ label: "Missing action plan", level: "red" });
  if (
    docs.some(
      (d) => d.review_date && new Date(d.review_date) < new Date()
    )
  )
    items.push({ label: "Expired document", level: "red" });
  if (req_?.due_date && new Date(req_.due_date) < new Date())
    items.push({ label: "Overdue review", level: "red" });
  return items;
}
