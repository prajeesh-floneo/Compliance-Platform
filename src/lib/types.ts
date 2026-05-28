// Shared TypeScript types for the Compliance Documentation Automation Platform

export type Role =
  | "Admin"
  | "Compliance Manager"
  | "IT/Security Owner"
  | "Document Author"
  | "Reviewer"
  | "Approver"
  | "Auditor"
  | "Read-only";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  department: string;
  status: "Active" | "Inactive";
}

export type ComplianceStatus =
  | "Compliant"
  | "Not Compliant"
  | "Partially Compliant"
  | "Not Applicable"
  | "Pending"
  | "Under Review";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export interface Requirement {
  id: string;
  requirement_code: string;
  section: string;
  title: string;
  evaluation_element: string;
  evaluation_criteria: string;
  expected_document_type: string;
  compliance_status: ComplianceStatus;
  risk_level: RiskLevel;
  owner_id: string | null;
  reviewer_id: string | null;
  due_date: string | null;
  methodology: string;
  criteria_for_compliance: string;
  observations: string;
  actions_to_perform: string;
  notes: string;
  human_review_required: boolean;
  created_at: string;
  updated_at: string;
}

export type DocumentCategory =
  | "General"
  | "Policies"
  | "Guides & Standards"
  | "Procedures"
  | "Letters"
  | "Evidence"
  | "Working Plans";

export type DocumentStatus =
  | "Draft"
  | "Under Review"
  | "Changes Requested"
  | "Approved"
  | "Digitally Signed"
  | "Active"
  | "Archived"
  | "Expired";

export interface DocumentRecord {
  id: string;
  title: string;
  category: DocumentCategory;
  document_type: string;
  version: string;
  status: DocumentStatus;
  file_url: string;
  language: string;
  department: string;
  owner_id: string | null;
  author_id: string | null;
  reviewer_id: string | null;
  approver_id: string | null;
  signature_status: "Unsigned" | "Pending" | "Signed";
  signature_hash?: string | null;
  signer_name?: string | null;
  signer_role?: string | null;
  signed_at?: string | null;
  effective_date: string | null;
  review_date: string | null;
  expiry_date?: string | null;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RequirementDocumentLink {
  id: string;
  requirement_id: string;
  document_id: string;
  relation_type: "Primary" | "Supporting" | "Reference";
  mandatory_or_optional: "Mandatory" | "Optional";
  linked_by: string;
  linked_at: string;
}

export type EvidenceType =
  | "Screenshot"
  | "Security Scan Report"
  | "Penetration Test Report"
  | "Backup Log"
  | "Audit Report"
  | "Incident Report"
  | "System Configuration Export"
  | "Script Output"
  | "Attestation Letter"
  | "Other";

export interface Evidence {
  id: string;
  title: string;
  evidence_type: EvidenceType;
  file_url: string;
  requirement_id: string | null;
  document_id: string | null;
  collected_by: string | null;
  collection_date: string;
  retention_period: "1 year" | "2 years" | "5 years" | "7 years" | "Permanent";
  expiry_date: string | null;
  status: "Valid" | "Expired" | "Pending Update" | "Rejected";
  notes: string;
  created_at: string;
}

export type ActionStatus =
  | "Open"
  | "In Progress"
  | "Waiting for Evidence"
  | "Completed"
  | "Verified"
  | "Overdue";

export interface ActionPlan {
  id: string;
  action_code: string;
  requirement_id: string;
  issue_description: string;
  corrective_action: string;
  owner_id: string | null;
  priority: "Low" | "Medium" | "High" | "Critical";
  risk_level: RiskLevel;
  due_date: string;
  status: ActionStatus;
  closure_evidence_id: string | null;
  reviewer_comments: string;
  completed_at: string | null;
  created_at: string;
}
