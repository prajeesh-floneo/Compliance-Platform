import { PageHeader } from "@/components/PageHeader";
import { getApprovals, userName } from "@/lib/api-server";
import { ApprovalsList } from "./ApprovalsList";

export default function ApprovalsPage() {
  const items = getApprovals().map((a) => ({
    ...a,
    requested_by_name: userName(a.requested_by),
    approver_name: userName(a.approver_id),
  }));
  return (
    <div>
      <PageHeader
        title="Approvals"
        subtitle="Approve, reject or sign documents, evidence, compliance status updates and action plan closures."
        crumbs={[{ label: "Home", href: "/" }, { label: "Approvals" }]}
      />
      <ApprovalsList items={items} />
    </div>
  );
}
