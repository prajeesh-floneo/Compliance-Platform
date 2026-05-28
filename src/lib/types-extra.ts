// Additional types: approvals, AI analyses, activity logs

export type ApprovalItemType =
  | "Document"
  | "Evidence"
  | "Compliance Status"
  | "Action Plan Closure";

export type ApprovalStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Changes Requested";

export interface Approval {
  id: string;
  item_type: ApprovalItemType;
  item_id: string;
  item_name: string;
  requested_by: string | null;
  approver_id: string | null;
  status: ApprovalStatus;
  comments: string;
  signed_at: string | null;
  signature_hash: string | null;
  requested_date: string;
  due_date: string | null;
  created_at: string;
}

export interface AIAnalysis {
  id: string;
  requirement_id: string;
  document_id: string | null;
  evidence_id: string | null;
  suggested_status:
    | "Compliant"
    | "Not Compliant"
    | "Partially Compliant"
    | "Insufficient Data";
  missing_items: string[];
  matched_sections: string[];
  recommended_action: string;
  confidence_score: number; // 0–100
  human_review_status: "Required" | "Approved" | "Rejected" | "Pending";
  human_reviewer_decision?: string;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  user_id: string | null;
  action: string;
  item_type:
    | "Requirement"
    | "Document"
    | "Evidence"
    | "ActionPlan"
    | "Approval"
    | "AIAnalysis"
    | "System";
  item_id: string;
  timestamp: string;
  details: string;
}

export interface DocumentVersion {
  id: string;
  document_id: string;
  version: string;
  changed_by: string | null;
  changed_at: string;
  change_summary: string;
}

export interface DocumentComment {
  id: string;
  document_id: string;
  author_id: string | null;
  author_name: string;
  body: string;
  created_at: string;
}
