import { PageHeader } from "@/components/PageHeader";
import { getAIAnalyses, getDocuments, getEvidence, getRequirement, getRequirements } from "@/lib/api-server";
import { AIWorkbench } from "./AIWorkbench";

export default function AIAnalysisPage({
  searchParams,
}: {
  searchParams: { requirement?: string };
}) {
  const reqs = getRequirements();
  const docs = getDocuments();
  const evs = getEvidence();
  const history = getAIAnalyses().map((a) => {
    const r = getRequirement(a.requirement_id);
    return { ...a, requirement_code: r?.requirement_code ?? "—", requirement_title: r?.title ?? "" };
  });
  return (
    <div>
      <PageHeader
        title="AI Compliance Analysis"
        subtitle="Mock rule-based analysis assistant. AI assists only — final compliance decisions remain with the human reviewer / auditor."
        crumbs={[{ label: "Home", href: "/" }, { label: "AI Analysis" }]}
      />
      <div className="mb-4 rounded border border-amber-200 bg-amber-50 text-amber-900 text-sm px-3 py-2">
        <strong>Disclaimer:</strong> AI suggestions are advisory only. They do not replace regulatory or legal judgement. A qualified reviewer must approve, reject or override every AI suggestion.
      </div>
      <AIWorkbench requirements={reqs} documents={docs} evidence={evs} history={history} defaultRequirementId={searchParams.requirement} />
    </div>
  );
}
