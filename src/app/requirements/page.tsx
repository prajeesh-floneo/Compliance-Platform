import { PageHeader } from "@/components/PageHeader";
import {
  getRequirements,
  getLinksForRequirement,
  getEvidenceForRequirement,
  getActionPlansForRequirement,
  userName,
  isOverdue,
} from "@/lib/api-server";
import { RequirementsMatrix } from "./RequirementsMatrix";

export default function RequirementsPage() {
  const reqs = getRequirements();
  const rows = reqs.map((r) => {
    const docs = getLinksForRequirement(r.id);
    const ev = getEvidenceForRequirement(r.id);
    const aps = getActionPlansForRequirement(r.id);
    const openAp = aps.find((a) => a.status !== "Completed" && a.status !== "Verified");
    return {
      ...r,
      ownerName: userName(r.owner_id),
      reviewerName: userName(r.reviewer_id),
      linkedDocsCount: docs.length,
      linkedEvidenceCount: ev.length,
      actionPlanStatus: openAp ? openAp.status : aps[0]?.status ?? "—",
      isOverdue: isOverdue(r.due_date),
    };
  });
  const sections = Array.from(new Set(reqs.map((r) => r.section))).sort();
  const owners = Array.from(new Set(reqs.map((r) => userName(r.owner_id)))).sort();
  return (
    <div>
      <PageHeader
        title="Requirements Matrix"
        subtitle="All regulatory and information-security requirements with their compliance status, owners, linked documents and evidence."
        crumbs={[{ label: "Home", href: "/" }, { label: "Requirements" }]}
      />
      <RequirementsMatrix rows={rows} sections={sections} owners={owners} />
    </div>
  );
}
