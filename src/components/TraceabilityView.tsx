import type {
  ActionPlan,
  DocumentRecord,
  Evidence,
  Requirement,
} from "@/lib/types";
import type { Approval } from "@/lib/types-extra";
import {
  ComplianceBadge,
  DocStatusBadge,
  ActionStatusBadge,
  ApprovalBadge,
} from "./Badges";
import {
  ArrowRight,
  CheckCircle2,
  FileText,
  ListChecks,
  Paperclip,
  ShieldCheck,
  XCircle,
} from "lucide-react";

type LinkedDoc = DocumentRecord & {
  relation_type?: string;
  mandatory_or_optional?: string;
};

export function TraceabilityView({
  requirement,
  documents,
  evidence,
  actionPlans,
  approvals,
}: {
  requirement: Requirement;
  documents: LinkedDoc[];
  evidence: Evidence[];
  actionPlans: ActionPlan[];
  approvals: Approval[];
}) {
  const hasDoc = documents.length > 0;
  const hasEv = evidence.length > 0;
  const hasAp = actionPlans.length > 0;
  const hasAppr = approvals.length > 0;
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
        <Node
          title="Requirement"
          icon={<ListChecks className="h-4 w-4" />}
          tone="brand"
          body={
            <>
              <div className="font-mono text-xs text-slate-600">
                {requirement.requirement_code}
              </div>
              <div className="text-xs text-slate-700 line-clamp-2">
                {requirement.title}
              </div>
            </>
          }
        />
        <Arrow />
        <Node
          title="Required document"
          icon={<FileText className="h-4 w-4" />}
          tone="gray"
          body={
            <div className="text-xs text-slate-700 line-clamp-3">
              {requirement.expected_document_type || "—"}
            </div>
          }
        />
        <Arrow />
        <Node
          title={`Uploaded documents (${documents.length})`}
          icon={<FileText className="h-4 w-4" />}
          tone={hasDoc ? "ok" : "bad"}
          body={
            hasDoc ? (
              <ul className="space-y-1">
                {documents.slice(0, 3).map((d) => (
                  <li key={d.id} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate">{d.title}</span>
                    <DocStatusBadge status={d.status} />
                  </li>
                ))}
                {documents.length > 3 && (
                  <li className="text-[11px] text-slate-500">
                    + {documents.length - 3} more
                  </li>
                )}
              </ul>
            ) : (
              <span className="text-xs text-red-600">No document linked</span>
            )
          }
        />
        <Arrow />
        <Node
          title={`Evidence (${evidence.length})`}
          icon={<Paperclip className="h-4 w-4" />}
          tone={hasEv ? "ok" : "bad"}
          body={
            hasEv ? (
              <ul className="space-y-1">
                {evidence.slice(0, 3).map((e) => (
                  <li key={e.id} className="text-xs truncate">{e.title}</li>
                ))}
                {evidence.length > 3 && (
                  <li className="text-[11px] text-slate-500">+ {evidence.length - 3} more</li>
                )}
              </ul>
            ) : (
              <span className="text-xs text-red-600">No evidence linked</span>
            )
          }
        />
        <Arrow />
        <Node
          title="Compliance status"
          icon={<ShieldCheck className="h-4 w-4" />}
          tone={
            requirement.compliance_status === "Compliant"
              ? "ok"
              : requirement.compliance_status === "Not Compliant"
              ? "bad"
              : "warn"
          }
          body={<ComplianceBadge status={requirement.compliance_status} />}
        />
        <Arrow />
        <Node
          title={`Action plans (${actionPlans.length})`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone={hasAp ? "warn" : "gray"}
          body={
            hasAp ? (
              <ul className="space-y-1">
                {actionPlans.slice(0, 2).map((a) => (
                  <li key={a.id} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate font-mono">{a.action_code}</span>
                    <ActionStatusBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-slate-500">None</span>
            )
          }
        />
        <Arrow />
        <Node
          title={`Approvals (${approvals.length})`}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone={hasAppr ? "ok" : "gray"}
          body={
            hasAppr ? (
              <ul className="space-y-1">
                {approvals.slice(0, 2).map((a) => (
                  <li key={a.id} className="text-xs flex items-center justify-between gap-2">
                    <span className="truncate">{a.item_name}</span>
                    <ApprovalBadge status={a.status} />
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-xs text-slate-500">None</span>
            )
          }
        />
      </div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="flex items-center text-slate-400 shrink-0">
      <ArrowRight className="h-4 w-4" />
    </div>
  );
}

function Node({ title, icon, tone, body }: { title: string; icon: React.ReactNode; tone: "brand" | "ok" | "warn" | "bad" | "gray"; body: React.ReactNode }) {
  const tones: Record<string, string> = {
    brand: "border-brand-300 bg-brand-50",
    ok: "border-emerald-300 bg-emerald-50",
    warn: "border-amber-300 bg-amber-50",
    bad: "border-red-300 bg-red-50",
    gray: "border-slate-200 bg-slate-50",
  };
  return (
    <div className={`shrink-0 w-52 rounded-md border ${tones[tone]} p-3 flex flex-col gap-1.5`}>
      <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-600">{icon}{title}</div>
      <div>{body}</div>
    </div>
  );
}
