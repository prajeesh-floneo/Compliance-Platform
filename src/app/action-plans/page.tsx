import { PageHeader } from "@/components/PageHeader";
import { getActionPlans, getRequirement, userName, isOverdue } from "@/lib/api-server";
import { ActionPlansTable } from "./ActionPlansTable";

export default function ActionPlansPage() {
  const items = getActionPlans().map((a) => {
    const r = getRequirement(a.requirement_id);
    const overdue = isOverdue(a.due_date) && a.status !== "Completed" && a.status !== "Verified";
    return {
      ...a,
      requirement_code: r?.requirement_code ?? "—",
      requirement_title: r?.title ?? "",
      owner_name: userName(a.owner_id),
      isOverdue: overdue,
      status: overdue ? "Overdue" : a.status,
    };
  });
  return (
    <div>
      <PageHeader
        title="Action Plans"
        subtitle="Corrective actions raised for non-compliant or partially-compliant requirements."
        crumbs={[{ label: "Home", href: "/" }, { label: "Action Plans" }]}
      />
      <ActionPlansTable items={items} />
    </div>
  );
}
