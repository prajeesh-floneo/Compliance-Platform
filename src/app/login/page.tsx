import { getUsers } from "@/lib/api-server";
import { DEMO_PASSWORD } from "@/lib/auth";
import { LoginForm } from "./LoginForm";
import { ShieldCheck } from "lucide-react";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { next?: string };
}) {
  const users = getUsers().filter((u) => u.status === "Active");
  return (
    <div className="min-h-screen flex bg-slate-50">
      <div className="hidden md:flex md:w-1/2 bg-slate-900 text-slate-100 p-12 flex-col justify-between">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-brand-600 flex items-center justify-center">
            <ShieldCheck className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="text-lg font-semibold text-white">
              Compliance Platform
            </div>
            <div className="text-xs text-slate-400">
              Documentation Automation
            </div>
          </div>
        </div>
        <div className="space-y-4 max-w-md">
          <h1 className="text-3xl font-semibold text-white leading-tight">
            Audit-ready compliance, from requirement to signature.
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Manage regulatory requirements, controlled documents, evidence,
            corrective actions, approvals and AI-assisted gap analysis &mdash;
            all linked through a single traceability matrix.
          </p>
          <ul className="text-sm text-slate-300 space-y-1.5 pt-2">
            <li>&middot; 12 seeded regulatory requirements</li>
            <li>&middot; CSV / JSON bulk requirement import</li>
            <li>&middot; Document lifecycle with digital signatures</li>
            <li>&middot; Mock AI compliance analysis &mdash; human-approved</li>
            <li>&middot; Auditor submission &amp; management reports</li>
          </ul>
        </div>
        <div className="text-[11px] text-slate-500">
          MVP v0.1 &middot; In-memory data &middot; Session resets on redeploy
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="h-9 w-9 rounded-md bg-brand-600 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-white" />
            </div>
            <div className="text-base font-semibold text-slate-900">
              Compliance Platform
            </div>
          </div>
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-7">
            <h2 className="text-xl font-semibold text-slate-900">Sign in</h2>
            <p className="text-sm text-slate-500 mt-1">
              Choose a seeded user to explore the platform with that role.
            </p>
            <div className="mt-4 rounded border border-amber-200 bg-amber-50 text-amber-900 text-xs px-3 py-2">
              <strong>Demo build:</strong> any active user signs in with the
              shared password <code className="font-mono">{DEMO_PASSWORD}</code>
              . Permissions and audit trail still reflect the chosen role.
            </div>
            <LoginForm users={users} next={searchParams.next} />
          </div>
          <p className="text-[11px] text-slate-400 text-center mt-4">
            Internal demo &middot; do not use real credentials.
          </p>
        </div>
      </div>
    </div>
  );
}
