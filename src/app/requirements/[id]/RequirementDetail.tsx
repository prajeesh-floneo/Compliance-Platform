"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionStatusBadge,
  ApprovalBadge,
  ComplianceBadge,
  DocStatusBadge,
  RiskBadge,
} from "@/components/Badges";
import { Modal } from "@/components/Modal";
import { TraceabilityView } from "@/components/TraceabilityView";
import { MissingItemsPanel } from "@/components/MissingItemsPanel";
import type {
  ActionPlan,
  ComplianceStatus,
  DocumentRecord,
  Evidence,
  Requirement,
} from "@/lib/types";
import type { AIAnalysis, ActivityLog, Approval } from "@/lib/types-extra";
import { CheckCircle2, ClipboardEdit, FileText, Link as LinkIcon, MessageSquare, ShieldQuestion, Sparkles } from "lucide-react";

type LinkedDoc = DocumentRecord & { relation_type: string; mandatory_or_optional: string; link_id: string };
type ActivityRow = ActivityLog & { user_name: string };

export function RequirementDetail({
  requirement,
  ownerName,
  reviewerName,
  documents,
  evidence,
  actionPlans,
  activity,
  analyses,
  approvals,
  missing,
}: {
  requirement: Requirement;
  ownerName: string;
  reviewerName: string;
  documents: LinkedDoc[];
  evidence: Evidence[];
  actionPlans: ActionPlan[];
  activity: ActivityRow[];
  analyses: AIAnalysis[];
  approvals: Approval[];
  missing: { label: string; level: "red" | "yellow" }[];
}) {
  const [tab, setTab] = useState<"overview" | "docs" | "ev" | "review" | "ap" | "log">("overview");
  const router = useRouter();
  const [actionOpen, setActionOpen] = useState(false);

  const tabs = [
    { key: "overview", label: "Overview", icon: ShieldQuestion },
    { key: "docs", label: `Linked Documents (${documents.length})`, icon: FileText },
    { key: "ev", label: `Linked Evidence (${evidence.length})`, icon: LinkIcon },
    { key: "review", label: "Compliance Review", icon: ClipboardEdit },
    { key: "ap", label: `Action Plans (${actionPlans.length})`, icon: CheckCircle2 },
    { key: "log", label: "Activity History", icon: MessageSquare },
  ] as const;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
      <div className="lg:col-span-3">
        <div className="card mb-4">
          <div className="border-b border-slate-200 px-2 flex gap-1 overflow-x-auto">
            {tabs.map((t) => (
              <button key={t.key} onClick={() => setTab(t.key)} className={`tab-btn flex items-center gap-1.5 ${tab === t.key ? "active" : ""}`}>
                <t.icon className="h-4 w-4" /> {t.label}
              </button>
            ))}
          </div>
          <div className="p-5">
            {tab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-sm">
                <KV label="Requirement ID" value={requirement.requirement_code} mono />
                <KV label="Section" value={requirement.section} />
                <KV label="Title" value={requirement.title} full />
                <KV label="Evaluation Element" value={requirement.evaluation_element} full multiline />
                <KV label="Evaluation Criteria" value={requirement.evaluation_criteria} full multiline />
                <KV label="Expected Document Type" value={requirement.expected_document_type} full />
                <KV label="Compliance Status" value={<ComplianceBadge status={requirement.compliance_status} />} />
                <KV label="Risk Level" value={<RiskBadge level={requirement.risk_level} />} />
                <KV label="Owner" value={ownerName} />
                <KV label="Reviewer" value={reviewerName} />
                <KV label="Due Date" value={requirement.due_date ?? "—"} />
                <KV label="Last Updated" value={requirement.updated_at.slice(0, 10)} />
                {requirement.observations && <KV label="Observations / Notes" value={requirement.observations} full multiline />}
                {requirement.notes && <KV label="Internal Notes" value={requirement.notes} full multiline />}
              </div>
            )}
            {tab === "docs" && <DocsTab requirementId={requirement.id} documents={documents} onChange={() => router.refresh()} />}
            {tab === "ev" && <EvidenceTab requirementId={requirement.id} evidence={evidence} onChange={() => router.refresh()} />}
            {tab === "review" && <ReviewTab requirement={requirement} onSaved={() => router.refresh()} onCreateAction={() => setActionOpen(true)} />}
            {tab === "ap" && <ActionPlansTab requirementId={requirement.id} plans={actionPlans} onChange={() => router.refresh()} openCreate={actionOpen} setOpenCreate={setActionOpen} />}
            {tab === "log" && <ActivityTab rows={activity} />}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-800">Traceability View</h3><span className="text-xs text-slate-500">Requirement → Required Document → Uploaded Document → Evidence → Status → Action Plan → Approval</span></div>
          <div className="card-body"><TraceabilityView requirement={requirement} documents={documents} evidence={evidence} actionPlans={actionPlans} approvals={approvals} /></div>
        </div>

        <div className="card mt-4">
          <div className="card-header"><h3 className="font-semibold text-slate-800 flex items-center gap-2"><Sparkles className="h-4 w-4 text-brand-600" /> AI Analyses for this requirement</h3><Link href={`/ai-analysis?requirement=${requirement.id}`} className="text-sm text-brand-700 hover:underline">Run new analysis →</Link></div>
          {analyses.length === 0 ? <p className="px-5 py-4 text-sm text-slate-500">No AI analysis run yet for this requirement.</p> : (
            <ul className="divide-y divide-slate-100">{analyses.map((a) => (
              <li key={a.id} className="px-5 py-3 text-sm">
                <div className="flex justify-between"><span className="font-medium">{a.suggested_status}</span><span className="text-xs text-slate-500">{new Date(a.created_at).toLocaleString()} · {a.confidence_score}%</span></div>
                <div className="text-xs text-slate-500 mt-1">{a.recommended_action}</div>
              </li>
            ))}</ul>
          )}
        </div>
      </div>

      <div className="lg:col-span-1 space-y-4">
        <MissingItemsPanel items={missing} />
        <div className="card">
          <div className="card-header"><h3 className="font-semibold text-slate-800">Approvals</h3></div>
          <ul className="divide-y divide-slate-100">
            {approvals.length === 0 && <li className="px-5 py-4 text-sm text-slate-500">No approvals requested.</li>}
            {approvals.map((a) => (
              <li key={a.id} className="px-5 py-3 text-sm flex justify-between"><span>{a.item_name}</span><ApprovalBadge status={a.status} /></li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function KV({ label, value, full, multiline, mono }: { label: string; value: React.ReactNode; full?: boolean; multiline?: boolean; mono?: boolean }) {
  return (
    <div className={full ? "md:col-span-2" : ""}>
      <div className="label">{label}</div>
      <div className={`${mono ? "font-mono text-xs" : ""} ${multiline ? "whitespace-pre-wrap" : ""} text-slate-800`}>{value || <span className="text-slate-400">—</span>}</div>
    </div>
  );
}

import { DocsTab, EvidenceTab, ReviewTab, ActionPlansTab, ActivityTab } from "./DetailTabs";
