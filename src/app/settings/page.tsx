import { PageHeader } from "@/components/PageHeader";
import { getUsers } from "@/lib/api-server";
import { ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { can } from "@/lib/permissions";

export default function SettingsPage() {
  const me = getCurrentUser();
  if (!can(me?.role, "settings:view")) redirect("/");
  const users = getUsers();
  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Users, roles and system information."
        crumbs={[{ label: "Home", href: "/" }, { label: "Settings" }]}
      />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="card lg:col-span-2">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">Users & Roles</h3>
            <span className="text-xs text-slate-500">
              {users.length} active
            </span>
          </div>
          <div className="table-wrap rounded-none border-0">
            <table className="compliance">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td className="text-xs text-slate-600">{u.email}</td>
                    <td>
                      <span className="badge-blue">{u.role}</span>
                    </td>
                    <td>{u.department}</td>
                    <td>
                      <span
                        className={
                          u.status === "Active" ? "badge-green" : "badge-gray"
                        }
                      >
                        {u.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-brand-600" /> System
            </h3>
          </div>
          <div className="card-body text-sm space-y-3 text-slate-700">
            <Row k="Version" v="MVP v0.1" />
            <Row k="Data store" v="In-memory (resets on server restart)" />
            <Row k="AI engine" v="Mock rule-based · pluggable" />
            <Row
              k="Digital signature"
              v="Internal metadata · pluggable (WebSec / e.firma)"
            />
            <Row k="Bulk import" v="CSV paste · JSON paste · CSV file upload" />
            <Row
              k="Roles"
              v="Admin, Compliance Manager, IT/Security Owner, Document Author, Reviewer, Approver, Auditor, Read-only"
            />
          </div>
        </div>

        <div className="card lg:col-span-3">
          <div className="card-header">
            <h3 className="font-semibold text-slate-800">
              Compliance categories
            </h3>
          </div>
          <div className="card-body grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            {[
              "Security Governance",
              "Incident Response",
              "Malware Protection",
              "Vulnerability Management",
              "Security Testing",
              "Secure Software Development",
              "Logging and Monitoring",
              "Backup and Continuity",
              "Business Continuity",
            ].map((s) => (
              <div
                key={s}
                className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700"
              >
                {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-slate-100 pb-2 last:border-0">
      <span className="text-xs uppercase tracking-wide text-slate-500 font-semibold">
        {k}
      </span>
      <span className="text-right text-sm">{v}</span>
    </div>
  );
}
