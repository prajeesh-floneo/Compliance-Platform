import type {
  DocumentRecord,
  RequirementDocumentLink,
} from "./types";

const now = "2026-04-15T10:00:00Z";

function d(
  id: string,
  title: string,
  category: DocumentRecord["category"],
  document_type: string,
  version: string,
  status: DocumentRecord["status"],
  owner_id: string | null,
  author_id: string | null,
  reviewer_id: string | null,
  approver_id: string | null,
  signature_status: DocumentRecord["signature_status"],
  effective_date: string | null,
  review_date: string | null,
  extra: Partial<DocumentRecord> = {}
): DocumentRecord {
  return {
    id,
    title,
    category,
    document_type,
    version,
    status,
    file_url: `/mock/${id}.pdf`,
    language: "EN",
    department: "Information Security",
    owner_id,
    author_id,
    reviewer_id,
    approver_id,
    signature_status,
    signature_hash: signature_status === "Signed" ? `0x${id.toUpperCase()}A91F` : null,
    signer_name: signature_status === "Signed" ? "Ricardo Núñez" : null,
    signer_role: signature_status === "Signed" ? "Approver" : null,
    signed_at: signature_status === "Signed" ? "2026-04-20T15:30:00Z" : null,
    effective_date,
    review_date,
    expiry_date: null,
    notes: "",
    created_at: now,
    updated_at: now,
    ...extra,
  };
}

export const seedDocuments: DocumentRecord[] = [
  d("doc-001","Information Security Policy v3.2","Policies","Policy","3.2","Digitally Signed",
    "u-002","u-005","u-006","u-007","Signed","2026-01-15","2027-01-15"),
  d("doc-002","Information Security Roles & Responsibilities","Policies","Organizational Role Document","1.4","Active",
    "u-003","u-005","u-006","u-007","Signed","2025-11-01","2026-11-01"),
  d("doc-003","Security Incident Response Procedure","Procedures","Procedure","2.1","Under Review",
    "u-003","u-005","u-006","u-007","Pending","2025-09-10","2026-09-10"),
  d("doc-004","Antivirus & Malware Protection Procedure","Procedures","Procedure","1.7","Active",
    "u-004","u-005","u-006","u-007","Signed","2025-12-01","2026-12-01"),
  d("doc-005","Vulnerability Management Policy","Policies","Policy","2.0","Approved",
    "u-003","u-005","u-006","u-007","Pending","2026-02-01","2027-02-01"),
  d("doc-006","Penetration Testing Report 2025","Evidence","Report","1.0","Active",
    "u-003","u-008","u-006","u-007","Signed","2025-10-30","2027-10-30"),
  d("doc-007","Secure SDLC Procedure","Procedures","Procedure","1.2","Draft",
    "u-005","u-005","u-006","u-007","Unsigned","2026-03-01","2027-03-01"),
  d("doc-008","Logging & Monitoring Procedure","Procedures","Procedure","1.5","Active",
    "u-004","u-005","u-006","u-007","Signed","2026-01-10","2027-01-10"),
  d("doc-009","Backup & Restore Procedure","Procedures","Procedure","2.3","Changes Requested",
    "u-004","u-005","u-006","u-007","Unsigned","2025-08-15","2026-08-15"),
  d("doc-010","Business Continuity Plan","Working Plans","Plan","1.0","Draft",
    "u-002","u-005","u-006","u-007","Unsigned","2026-04-01","2027-04-01"),
];

function link(
  id: string,
  requirement_id: string,
  document_id: string,
  relation_type: RequirementDocumentLink["relation_type"] = "Primary",
  mandatory_or_optional: RequirementDocumentLink["mandatory_or_optional"] = "Mandatory"
): RequirementDocumentLink {
  return {
    id,
    requirement_id,
    document_id,
    relation_type,
    mandatory_or_optional,
    linked_by: "u-002",
    linked_at: now,
  };
}

export const seedRequirementDocuments: RequirementDocumentLink[] = [
  link("rd-001","req-001","doc-002"),
  link("rd-002","req-002","doc-001"),
  link("rd-003","req-003","doc-003"),
  link("rd-004","req-005","doc-004"),
  link("rd-005","req-006","doc-005"),
  link("rd-006","req-007","doc-006"),
  link("rd-007","req-008","doc-007"),
  link("rd-008","req-010","doc-008"),
  link("rd-009","req-011","doc-009"),
  link("rd-010","req-012","doc-010"),
  link("rd-011","req-009","doc-007","Supporting","Optional"),
];
