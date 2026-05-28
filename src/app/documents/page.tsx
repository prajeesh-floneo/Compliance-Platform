import { PageHeader } from "@/components/PageHeader";
import {
  getDocuments,
  getLinksForDocument,
  userName,
} from "@/lib/api-server";
import { DocumentsTable } from "./DocumentsTable";

export default function DocumentsPage() {
  const docs = getDocuments().map((d) => ({
    ...d,
    ownerName: userName(d.owner_id),
    authorName: userName(d.author_id),
    reviewerName: userName(d.reviewer_id),
    approverName: userName(d.approver_id),
    linked_requirements: getLinksForDocument(d.id).length,
  }));
  return (
    <div>
      <PageHeader
        title="Document Repository"
        subtitle="Policies, procedures, guides, letters and working plans that support compliance traceability."
        crumbs={[{ label: "Home", href: "/" }, { label: "Documents" }]}
      />
      <DocumentsTable docs={docs} />
    </div>
  );
}
