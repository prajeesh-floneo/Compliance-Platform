import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { DocStatusBadge } from "@/components/Badges";
import {
  getApprovalsForItem,
  getDocComments,
  getDocVersions,
  getDocument,
  getEvidenceForDocument,
  getLinksForDocument,
  getRequirement,
  userName,
} from "@/lib/api-server";
import { DocumentViewer } from "./DocumentViewer";

export default function DocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const d = getDocument(params.id);
  if (!d) return notFound();
  const links = getLinksForDocument(d.id);
  const requirements = links
    .map((l) => ({ link: l, req: getRequirement(l.requirement_id)! }))
    .filter((x) => x.req)
    .map((x) => ({ ...x.req, relation_type: x.link.relation_type, mandatory_or_optional: x.link.mandatory_or_optional }));
  const evidence = getEvidenceForDocument(d.id);
  const versions = getDocVersions(d.id);
  const approvals = getApprovalsForItem(d.id);
  const comments = getDocComments(d.id);
  return (
    <div>
      <PageHeader
        title={`${d.title}`}
        subtitle={`${d.category} · ${d.document_type} · v${d.version}`}
        crumbs={[
          { label: "Home", href: "/" },
          { label: "Documents", href: "/documents" },
          { label: d.title },
        ]}
        actions={<DocStatusBadge status={d.status} />}
      />
      <DocumentViewer
        doc={{
          ...d,
          ownerName: userName(d.owner_id),
          authorName: userName(d.author_id),
          reviewerName: userName(d.reviewer_id),
          approverName: userName(d.approver_id),
        }}
        requirements={requirements}
        evidence={evidence}
        versions={versions}
        approvals={approvals}
        comments={comments}
      />
    </div>
  );
}
