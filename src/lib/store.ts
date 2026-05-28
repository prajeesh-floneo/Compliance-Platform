import type {
  User,
  Requirement,
  DocumentRecord,
  RequirementDocumentLink,
  Evidence,
  ActionPlan,
} from "./types";
import type {
  Approval,
  AIAnalysis,
  ActivityLog,
  DocumentVersion,
  DocumentComment,
} from "./types-extra";
import { seedUsers } from "./seed-users";
import { seedRequirements } from "./seed-requirements";
import { seedDocuments, seedRequirementDocuments } from "./seed-documents";
import { seedEvidence, seedActionPlans } from "./seed-rest";
import {
  seedApprovals,
  seedAIAnalyses,
  seedActivityLogs,
  seedDocumentVersions,
  seedDocumentComments,
} from "./seed-workflow";

interface Store {
  users: User[];
  requirements: Requirement[];
  documents: DocumentRecord[];
  requirementDocuments: RequirementDocumentLink[];
  evidence: Evidence[];
  actionPlans: ActionPlan[];
  approvals: Approval[];
  aiAnalyses: AIAnalysis[];
  activityLogs: ActivityLog[];
  documentVersions: DocumentVersion[];
  documentComments: DocumentComment[];
}

const g = globalThis as unknown as { __compliance_store?: Store };

function makeStore(): Store {
  return {
    users: [...seedUsers],
    requirements: [...seedRequirements],
    documents: [...seedDocuments],
    requirementDocuments: [...seedRequirementDocuments],
    evidence: [...seedEvidence],
    actionPlans: [...seedActionPlans],
    approvals: [...seedApprovals],
    aiAnalyses: [...seedAIAnalyses],
    activityLogs: [...seedActivityLogs],
    documentVersions: [...seedDocumentVersions],
    documentComments: [...seedDocumentComments],
  };
}

export function db(): Store {
  if (!g.__compliance_store) g.__compliance_store = makeStore();
  return g.__compliance_store;
}

export function nextId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function nowISO(): string {
  return new Date().toISOString();
}

export function logActivity(
  user_id: string | null,
  action: string,
  item_type: ActivityLog["item_type"],
  item_id: string,
  details: string
) {
  db().activityLogs.unshift({
    id: nextId("log"),
    user_id,
    action,
    item_type,
    item_id,
    timestamp: nowISO(),
    details,
  });
}

export function userName(id: string | null | undefined): string {
  if (!id) return "—";
  return db().users.find((u) => u.id === id)?.name ?? "—";
}

export function isOverdue(dateISO: string | null | undefined): boolean {
  if (!dateISO) return false;
  return new Date(dateISO) < new Date();
}
