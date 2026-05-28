import Link from "next/link";
import { PageHeader } from "@/components/PageHeader";
import {
  ActionStatusBadge,
  ComplianceBadge,
  RiskBadge,
} from "@/components/Badges";
import {
  dashboardStats,
  getActionPlans,
  getActivityLogs,
  getEvidence,
  getRequirements,
  isOverdue,
  userName,
} from "@/lib/api-server";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileWarning,
  ListChecks,
  ShieldAlert,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { StatusBarChart, OwnerBarChart, DueDateBarChart } from "@/components/Charts";

export default function DashboardPage() {
  const s = dashboardStats();
  const reqs = getRequirements();
  const aps = getActionPlans();
  const evs = getEvidence();

  const bySection = Object.entries(
    reqs.reduce<Record<string, { total: number; compliant: number }>>((acc, r) => {
      acc[r.section] ??= { total: 0, compliant: 0 };
      acc[r.section].total++;
      if (r.compliance_status === "Compliant") acc[r.section].compliant++;
      return acc;
    }, {})
  ).map(([section, v]) => ({
    section,
    pct: Math.round((v.compliant / v.total) * 100),
    ...v,
  }));

  const byStatus = ["Compliant","Partially Compliant","Not Compliant","Under Review","Pending"].map(
    (st) => ({ label: st, count: reqs.filter((r) => r.compliance_status === st).length })
  );

  const evByReq = new Set(evs.map((e) => e.requirement_id));
  const missingByOwner = Object.entries(
    reqs.filter((r) => !evByReq.has(r.id)).reduce<Record<string, number>>((acc, r) => {
      const k = userName(r.owner_id);
      acc[k] = (acc[k] ?? 0) + 1;
      return acc;
    }, {})
  ).map(([owner, count]) => ({ owner, count }));

  const actionBuckets = [
    { label: "Overdue", count: aps.filter((a) => isOverdue(a.due_date) && a.status !== "Completed" && a.status !== "Verified").length },
    { label: "Next 7d", count: aps.filter((a) => { const d = (new Date(a.due_date).getTime() - Date.now()) / 86400000; return d >= 0 && d <= 7; }).length },
    { label: "Next 30d", count: aps.filter((a) => { const d = (new Date(a.due_date).getTime() - Date.now()) / 86400000; return d > 7 && d <= 30; }).length },
    { label: "Later", count: aps.filter((a) => { const d = (new Date(a.due_date).getTime() - Date.now()) / 86400000; return d > 30; }).length },
  ];

  const recent = getActivityLogs().slice(0, 8);
  const kpis = [
    { label: "Total Requirements", value: s.total, icon: ListChecks, color: "text-slate-700" },
    { label: "Compliant", value: s.compliant, icon: CheckCircle2, color: "text-emerald-600" },
    { label: "Not Compliant", value: s.notCompliant, icon: XCircle, color: "text-red-600" },
    { label: "Partially Compliant", value: s.partial, icon: ShieldAlert, color: "text-amber-600" },
    { label: "Pending Review", value: s.pending, icon: Clock, color: "text-slate-500" },
    { label: "Missing Evidence", value: s.missingEvidence, icon: FileWarning, color: "text-red-600" },
    { label: "High Risk Gaps", value: s.highRiskGaps, icon: AlertTriangle, color: "text-amber-700" },
    { label: "Overdue Action Plans", value: s.overdueActions, icon: ShieldCheck, color: "text-red-700" },
  ];

  return (
    <div>
      <PageHeader
        title="Compliance Dashboard"
        subtitle="Real-time view of regulatory and information-security compliance posture across the organisation."
      />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((k) => (
          <div key={k.label} className="kpi">
            <div className="flex items-center justify-between">
              <span className="kpi-label">{k.label}</span>
              <k.icon className={`h-4 w-4 ${k.color}`} />
            </div>
            <div className="kpi-value">{k.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
        <div className="card"><div className="card-header"><div><h3 className="font-semibold text-slate-800">Compliance by Section</h3><p className="text-xs text-slate-500">% requirements marked Compliant per section.</p></div></div>
          <div className="card-body space-y-3">
            {bySection.map((s) => (
              <div key={s.section}>
                <div className="flex justify-between text-sm mb-1"><span className="font-medium text-slate-700">{s.section}</span><span className="text-slate-500">{s.compliant}/{s.total} · {s.pct}%</span></div>
                <div className="h-2 bg-slate-100 rounded overflow-hidden"><div className="h-full bg-brand-500" style={{ width: `${s.pct}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="card"><div className="card-header"><div><h3 className="font-semibold text-slate-800">Requirements by Status</h3></div></div>
          <div className="card-body"><StatusBarChart data={byStatus} /></div>
        </div>
        <div className="card"><div className="card-header"><div><h3 className="font-semibold text-slate-800">Missing Evidence by Owner</h3></div></div>
          <div className="card-body"><OwnerBarChart data={missingByOwner} /></div>
        </div>
        <div className="card"><div className="card-header"><div><h3 className="font-semibold text-slate-800">Action Plans by Due Date</h3></div></div>
          <div className="card-body"><DueDateBarChart data={actionBuckets} /></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
        <div className="card lg:col-span-2"><div className="card-header"><h3 className="font-semibold text-slate-800">High-risk requirements not yet Compliant</h3><Link href="/requirements" className="text-sm text-brand-700 hover:underline">View all →</Link></div>
          <div className="table-wrap rounded-none border-0"><table className="compliance"><thead><tr><th>Code</th><th>Title</th><th>Risk</th><th>Status</th><th>Owner</th></tr></thead><tbody className="divide-y divide-slate-100">
            {reqs.filter((r) => (r.risk_level === "High" || r.risk_level === "Critical") && r.compliance_status !== "Compliant").slice(0, 8).map((r) => (
              <tr key={r.id}><td className="font-mono text-xs"><Link href={`/requirements/${r.id}`} className="text-brand-700 hover:underline">{r.requirement_code}</Link></td><td className="wrap max-w-md">{r.title}</td><td><RiskBadge level={r.risk_level} /></td><td><ComplianceBadge status={r.compliance_status} /></td><td>{userName(r.owner_id)}</td></tr>
            ))}
          </tbody></table></div>
        </div>
        <div className="card"><div className="card-header"><h3 className="font-semibold text-slate-800">Recent activity</h3></div>
          <ul className="divide-y divide-slate-100">{recent.map((l) => (
            <li key={l.id} className="px-5 py-2.5 text-sm"><div className="flex justify-between gap-3"><span className="text-slate-700"><span className="font-medium">{userName(l.user_id)}</span> · {l.action}</span><span className="text-[11px] text-slate-400">{new Date(l.timestamp).toLocaleDateString()}</span></div><div className="text-xs text-slate-500 truncate">{l.details}</div></li>
          ))}</ul>
        </div>
        <div className="card lg:col-span-3"><div className="card-header"><h3 className="font-semibold text-slate-800">Overdue / urgent action plans</h3><Link href="/action-plans" className="text-sm text-brand-700 hover:underline">View all →</Link></div>
          <div className="table-wrap rounded-none border-0"><table className="compliance"><thead><tr><th>Code</th><th>Requirement</th><th>Issue</th><th>Owner</th><th>Due</th><th>Status</th></tr></thead><tbody className="divide-y divide-slate-100">
            {aps.filter((a) => isOverdue(a.due_date) || a.status === "Overdue").slice(0, 6).map((a) => { const r = reqs.find((x) => x.id === a.requirement_id); return (
              <tr key={a.id}><td className="font-mono text-xs">{a.action_code}</td><td className="wrap max-w-xs"><Link href={`/requirements/${a.requirement_id}`} className="text-brand-700 hover:underline">{r?.requirement_code}</Link><div className="text-xs text-slate-500">{r?.title}</div></td><td className="wrap max-w-md">{a.issue_description}</td><td>{userName(a.owner_id)}</td><td>{a.due_date}</td><td><ActionStatusBadge status={a.status} /></td></tr>);})}
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
}
