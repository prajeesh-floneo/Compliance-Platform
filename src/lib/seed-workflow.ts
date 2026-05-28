import type {
  Approval,
  AIAnalysis,
  ActivityLog,
  DocumentVersion,
  DocumentComment,
} from "./types-extra";

export const seedApprovals: Approval[] = [
  { id: "app-001", item_type: "Document", item_id: "doc-003",
    item_name: "Security Incident Response Procedure", requested_by: "u-005",
    approver_id: "u-007", status: "Pending",
    comments: "Procedure updated after Q1 phishing drill. Needs Approver signature.",
    signed_at: null, signature_hash: null,
    requested_date: "2026-04-25T08:00:00Z", due_date: "2026-05-10",
    created_at: "2026-04-25T08:00:00Z" },
  { id: "app-002", item_type: "Document", item_id: "doc-007",
    item_name: "Secure SDLC Procedure", requested_by: "u-005",
    approver_id: "u-006", status: "Changes Requested",
    comments: "Add release-gate criteria and pen-test sign-off in section 5.",
    signed_at: null, signature_hash: null,
    requested_date: "2026-04-20T08:00:00Z", due_date: "2026-05-15",
    created_at: "2026-04-20T08:00:00Z" },
  { id: "app-003", item_type: "Compliance Status", item_id: "req-007",
    item_name: "Penetration Testing — status: Compliant", requested_by: "u-002",
    approver_id: "u-008", status: "Pending",
    comments: "Independent specialist review pending sign-off.",
    signed_at: null, signature_hash: null,
    requested_date: "2026-04-28T10:00:00Z", due_date: "2026-05-12",
    created_at: "2026-04-28T10:00:00Z" },
  { id: "app-004", item_type: "Action Plan Closure", item_id: "ap-001",
    item_name: "AP-001 — Sign-off of Incident Response Procedure", requested_by: "u-003",
    approver_id: "u-007", status: "Pending",
    comments: "Awaiting closure review after signature.",
    signed_at: null, signature_hash: null,
    requested_date: "2026-04-29T09:00:00Z", due_date: "2026-05-20",
    created_at: "2026-04-29T09:00:00Z" },
];

export const seedAIAnalyses: AIAnalysis[] = [
  { id: "ai-001", requirement_id: "req-003", document_id: "doc-003", evidence_id: "ev-006",
    suggested_status: "Partially Compliant",
    missing_items: [
      "Procedure lacks current approver signature.",
      "Escalation matrix not included.",
      "No reference to authority-reporting timelines.",
    ],
    matched_sections: [
      "Section 2 — Roles & responsibilities",
      "Section 4 — Communication channels",
      "Section 6 — Post-incident review",
    ],
    recommended_action:
      "Add escalation matrix and external reporting timelines; obtain Approver signature; bump to v2.2.",
    confidence_score: 78, human_review_status: "Required",
    created_at: "2026-04-28T13:00:00Z" },
  { id: "ai-002", requirement_id: "req-006", document_id: "doc-005", evidence_id: "ev-004",
    suggested_status: "Partially Compliant",
    missing_items: [
      "Two criticals open beyond defined SLA.",
      "Compensating-control documentation not attached.",
    ],
    matched_sections: [
      "Patch cadence — quarterly",
      "Scanning tools and coverage",
      "Risk acceptance workflow",
    ],
    recommended_action:
      "Close pending criticals or document compensating controls and risk acceptance.",
    confidence_score: 82, human_review_status: "Required",
    created_at: "2026-04-29T09:00:00Z" },
  { id: "ai-003", requirement_id: "req-009", document_id: "doc-007", evidence_id: null,
    suggested_status: "Not Compliant",
    missing_items: [
      "No section on encryption key lifecycle.",
      "Electronic-signature controls not described.",
      "No reference to non-repudiation mechanism.",
    ],
    matched_sections: ["Authentication — section 3"],
    recommended_action:
      "Extend secure design document with key management, signing and non-repudiation controls. Validate in staging.",
    confidence_score: 64, human_review_status: "Required",
    created_at: "2026-04-30T10:00:00Z" },
];

export const seedActivityLogs: ActivityLog[] = [
  { id: "log-001", user_id: "u-002", action: "Created requirement",
    item_type: "Requirement", item_id: "req-001",
    timestamp: "2026-04-01T09:00:00Z", details: "Imported from regulatory matrix." },
  { id: "log-002", user_id: "u-005", action: "Uploaded document",
    item_type: "Document", item_id: "doc-003",
    timestamp: "2026-04-25T08:00:00Z", details: "Uploaded v2.1 for review." },
  { id: "log-003", user_id: "u-006", action: "Requested changes",
    item_type: "Approval", item_id: "app-002",
    timestamp: "2026-04-26T10:00:00Z", details: "Add release-gate criteria." },
  { id: "log-004", user_id: "u-003", action: "Linked evidence",
    item_type: "Evidence", item_id: "ev-004",
    timestamp: "2026-03-28T16:30:00Z", details: "Linked Q1 scan to VULN-MGMT-001." },
  { id: "log-005", user_id: "u-002", action: "Ran AI analysis",
    item_type: "AIAnalysis", item_id: "ai-001",
    timestamp: "2026-04-28T13:01:00Z", details: "Confidence 78%." },
];

export const seedDocumentVersions: DocumentVersion[] = [
  { id: "dv-001", document_id: "doc-001", version: "3.0",
    changed_by: "u-005", changed_at: "2025-06-01T09:00:00Z", change_summary: "Annual revision." },
  { id: "dv-002", document_id: "doc-001", version: "3.1",
    changed_by: "u-005", changed_at: "2025-11-15T09:00:00Z", change_summary: "Updated DLP section." },
  { id: "dv-003", document_id: "doc-001", version: "3.2",
    changed_by: "u-005", changed_at: "2026-01-10T09:00:00Z", change_summary: "Added cloud workload controls." },
  { id: "dv-004", document_id: "doc-003", version: "2.0",
    changed_by: "u-005", changed_at: "2025-09-10T09:00:00Z", change_summary: "New incident taxonomy." },
  { id: "dv-005", document_id: "doc-003", version: "2.1",
    changed_by: "u-005", changed_at: "2026-04-25T08:00:00Z", change_summary: "Post-drill updates." },
];

export const seedDocumentComments: DocumentComment[] = [
  { id: "dc-001", document_id: "doc-003", author_id: "u-006",
    author_name: "Laura Iglesias",
    body: "Please add an escalation matrix in Section 4.",
    created_at: "2026-04-26T10:05:00Z" },
  { id: "dc-002", document_id: "doc-007", author_id: "u-006",
    author_name: "Laura Iglesias",
    body: "Release-gate criteria are missing — flagging for v1.3.",
    created_at: "2026-04-26T10:10:00Z" },
];
