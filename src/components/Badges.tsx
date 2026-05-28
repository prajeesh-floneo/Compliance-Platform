import type {
  ComplianceStatus,
  DocumentStatus,
  RiskLevel,
} from "@/lib/types";
import type { ActionStatus } from "@/lib/types";
import type { ApprovalStatus } from "@/lib/types-extra";

export function ComplianceBadge({ status }: { status: ComplianceStatus }) {
  const map: Record<ComplianceStatus, string> = {
    Compliant: "badge-green",
    "Not Compliant": "badge-red",
    "Partially Compliant": "badge-yellow",
    "Not Applicable": "badge-gray",
    Pending: "badge-gray",
    "Under Review": "badge-blue",
  };
  return <span className={map[status]}>{status}</span>;
}

export function RiskBadge({ level }: { level: RiskLevel }) {
  const map: Record<RiskLevel, string> = {
    Low: "badge-gray",
    Medium: "badge-blue",
    High: "badge-yellow",
    Critical: "badge-red",
  };
  return <span className={map[level]}>{level}</span>;
}

export function DocStatusBadge({ status }: { status: DocumentStatus }) {
  const map: Record<DocumentStatus, string> = {
    Draft: "badge-gray",
    "Under Review": "badge-blue",
    "Changes Requested": "badge-yellow",
    Approved: "badge-green",
    "Digitally Signed": "badge-green",
    Active: "badge-green",
    Archived: "badge-gray",
    Expired: "badge-red",
  };
  return <span className={map[status]}>{status}</span>;
}

export function ActionStatusBadge({ status }: { status: ActionStatus }) {
  const map: Record<ActionStatus, string> = {
    Open: "badge-gray",
    "In Progress": "badge-blue",
    "Waiting for Evidence": "badge-yellow",
    Completed: "badge-green",
    Verified: "badge-green",
    Overdue: "badge-red",
  };
  return <span className={map[status]}>{status}</span>;
}

export function ApprovalBadge({ status }: { status: ApprovalStatus }) {
  const map: Record<ApprovalStatus, string> = {
    Pending: "badge-gray",
    Approved: "badge-green",
    Rejected: "badge-red",
    "Changes Requested": "badge-yellow",
  };
  return <span className={map[status]}>{status}</span>;
}

export function OverdueBadge() {
  return <span className="badge-red">Overdue</span>;
}

export function MissingEvidenceBadge() {
  return <span className="badge-red-outline">Missing Evidence</span>;
}
