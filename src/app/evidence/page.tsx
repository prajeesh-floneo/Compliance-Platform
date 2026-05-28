import { PageHeader } from "@/components/PageHeader";
import { getEvidence, getRequirement, getDocument, userName } from "@/lib/api-server";
import { EvidenceTable } from "./EvidenceTable";

export default function EvidencePage() {
  const items = getEvidence().map((e) => ({
    ...e,
    requirement_code: e.requirement_id ? getRequirement(e.requirement_id)?.requirement_code ?? "" : "",
    document_title: e.document_id ? getDocument(e.document_id)?.title ?? "" : "",
    collected_by_name: userName(e.collected_by),
  }));
  return (
    <div>
      <PageHeader
        title="Evidence Repository"
        subtitle="Screenshots, scan reports, backup logs, audit reports and other artefacts that prove compliance."
        crumbs={[{ label: "Home", href: "/" }, { label: "Evidence" }]}
      />
      <EvidenceTable items={items} />
      <div className="card mt-4">
        <div className="card-header"><h3 className="font-semibold text-slate-800">Scheduled Evidence Collection (placeholder)</h3><span className="text-xs text-slate-500">Future automation hook</span></div>
        <div className="card-body grid grid-cols-2 md:grid-cols-4 gap-3">
          {["Monthly","Quarterly","Annually","Custom"].map((s) => (
            <div key={s} className="rounded border border-dashed border-slate-300 p-4">
              <div className="text-sm font-semibold text-slate-800">{s}</div>
              <p className="text-xs text-slate-500 mt-1">Future: register a script (e.g. backup verification, scan export) to run on this cadence and attach output as evidence automatically.</p>
              <button className="btn-secondary mt-3 w-full" disabled>Register script</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
