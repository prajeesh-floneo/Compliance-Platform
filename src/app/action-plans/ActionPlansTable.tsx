"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ActionStatusBadge,
  OverdueBadge,
  RiskBadge,
} from "@/components/Badges";
import { Search } from "lucide-react";
import type { ActionPlan } from "@/lib/types";
import { useCan } from "@/components/UserProvider";

type Row = ActionPlan & {
  requirement_code: string;
  requirement_title: string;
  owner_name: string;
  isOverdue: boolean;
};

const STATUSES = [
  "Open",
  "In Progress",
  "Waiting for Evidence",
  "Completed",
  "Verified",
  "Overdue",
];

export function ActionPlansTable({ items }: { items: Row[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [st, setSt] = useState("");
  const canTransition = useCan("action_plans:transition");
  const filtered = useMemo(
    () =>
      items.filter(
        (a) =>
          (!q ||
            `${a.action_code} ${a.issue_description} ${a.requirement_code}`
              .toLowerCase()
              .includes(q.toLowerCase())) &&
          (!st || a.status === st),
      ),
    [items, q, st],
  );

  const setStatus = async (id: string, status: ActionPlan["status"]) => {
    await fetch("/api/action-plans", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    router.refresh();
  };

  return (
    <div>
      <div className="card mb-4">
        <div className="card-body grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-9"
              placeholder="Search action plans…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
          <select
            className="input"
            value={st}
            onChange={(e) => setSt(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <div className="text-sm text-slate-500 flex items-center justify-end">
            {filtered.length} of {items.length}
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="compliance">
          <thead>
            <tr>
              <th>Code</th>
              <th>Requirement</th>
              <th>Issue / Gap</th>
              <th>Corrective Action</th>
              <th>Owner</th>
              <th>Priority</th>
              <th>Risk</th>
              <th>Due</th>
              <th>Status</th>
              <th>Closure</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((a) => (
              <tr key={a.id}>
                <td className="font-mono text-xs">{a.action_code}</td>
                <td className="wrap max-w-xs">
                  <Link
                    href={`/requirements/${a.requirement_id}`}
                    className="text-brand-700 hover:underline font-mono text-xs"
                  >
                    {a.requirement_code}
                  </Link>
                  <div className="text-xs text-slate-500">
                    {a.requirement_title}
                  </div>
                </td>
                <td className="wrap max-w-sm">{a.issue_description}</td>
                <td className="wrap max-w-sm text-slate-600">
                  {a.corrective_action}
                </td>
                <td>{a.owner_name}</td>
                <td>{a.priority}</td>
                <td>
                  <RiskBadge level={a.risk_level} />
                </td>
                <td>
                  {a.due_date}
                  {a.isOverdue && (
                    <div className="mt-1">
                      <OverdueBadge />
                    </div>
                  )}
                </td>
                <td>
                  <ActionStatusBadge
                    status={a.status as ActionPlan["status"]}
                  />
                </td>
                <td className="text-xs">
                  {a.closure_evidence_id ? "✓ Evidence" : "—"}
                </td>
                <td className="text-xs space-y-1">
                  {canTransition ? (
                    <>
                      {a.status !== "In Progress" && (
                        <button
                          onClick={() => setStatus(a.id, "In Progress")}
                          className="block text-brand-700 hover:underline"
                        >
                          Start
                        </button>
                      )}
                      {a.status !== "Waiting for Evidence" && (
                        <button
                          onClick={() =>
                            setStatus(a.id, "Waiting for Evidence")
                          }
                          className="block text-amber-700 hover:underline"
                        >
                          Awaiting evidence
                        </button>
                      )}
                      {a.status !== "Completed" && (
                        <button
                          onClick={() => setStatus(a.id, "Completed")}
                          className="block text-emerald-700 hover:underline"
                        >
                          Complete
                        </button>
                      )}
                      {a.status !== "Verified" && (
                        <button
                          onClick={() => setStatus(a.id, "Verified")}
                          className="block text-emerald-700 hover:underline"
                        >
                          Verify
                        </button>
                      )}
                    </>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
