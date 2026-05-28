import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import {
  ComplianceBadge,
  RiskBadge,
} from "@/components/Badges";
import {
  getRequirement,
  getLinksForRequirement,
  getDocument,
  getEvidenceForRequirement,
  getActionPlansForRequirement,
  getActivityLogs,
  getAIAnalysesForRequirement,
  getApprovalsForItem,
  userName,
  missingItemsForRequirement,
} from "@/lib/api-server";
import { RequirementDetail } from "./RequirementDetail";

export default function RequirementDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const r = getRequirement(params.id);
  if (!r) return notFound();
  const links = getLinksForRequirement(r.id);
  const documents = links
    .map((l) => ({ link: l, doc: getDocument(l.document_id)! }))
    .filter((x) => x.doc);
  const evidence = getEvidenceForRequirement(r.id);
  const actionPlans = getActionPlansForRequirement(r.id);
  const activity = getActivityLogs(r.id);
  const analyses = getAIAnalysesForRequirement(r.id);
  const approvals = getApprovalsForItem(r.id);
  const missing = missingItemsForRequirement(r.id);

  return (
    <div>
      <PageHeader
        title={`${r.requirement_code} · ${r.title}`}
        subtitle={r.evaluation_element}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Requirements", href: "/requirements" },
          { label: r.requirement_code },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <ComplianceBadge status={r.compliance_status} />
            <RiskBadge level={r.risk_level} />
          </div>
        }
      />
      <RequirementDetail
        requirement={r}
        ownerName={userName(r.owner_id)}
        reviewerName={userName(r.reviewer_id)}
        documents={documents.map((x) => ({
          ...x.doc,
          relation_type: x.link.relation_type,
          mandatory_or_optional: x.link.mandatory_or_optional,
          link_id: x.link.id,
        }))}
        evidence={evidence}
        actionPlans={actionPlans}
        activity={activity.map((a) => ({ ...a, user_name: userName(a.user_id) }))}
        analyses={analyses}
        approvals={approvals}
        missing={missing}
      />
    </div>
  );
}
