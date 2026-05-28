// Role -> permission matrix for the Compliance Platform.
// Centralised so UI gating and (future) API checks stay consistent.

import type { Role } from "./types";

export type Permission =
  | "requirements:create"
  | "requirements:edit"
  | "requirements:bulk_import"
  | "documents:create"
  | "documents:edit"
  | "evidence:create"
  | "evidence:edit"
  | "action_plans:create"
  | "action_plans:transition"
  | "approvals:decide"
  | "approvals:sign"
  | "ai_analysis:run"
  | "ai_analysis:review"
  | "reports:export"
  | "settings:view"
  | "users:manage";

const ALL: Permission[] = [
  "requirements:create",
  "requirements:edit",
  "requirements:bulk_import",
  "documents:create",
  "documents:edit",
  "evidence:create",
  "evidence:edit",
  "action_plans:create",
  "action_plans:transition",
  "approvals:decide",
  "approvals:sign",
  "ai_analysis:run",
  "ai_analysis:review",
  "reports:export",
  "settings:view",
  "users:manage",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  Admin: ALL,
  "Compliance Manager": [
    "requirements:create",
    "requirements:edit",
    "requirements:bulk_import",
    "documents:create",
    "documents:edit",
    "evidence:create",
    "evidence:edit",
    "action_plans:create",
    "action_plans:transition",
    "ai_analysis:run",
    "ai_analysis:review",
    "reports:export",
  ],
  "IT/Security Owner": [
    "requirements:edit",
    "documents:create",
    "documents:edit",
    "evidence:create",
    "evidence:edit",
    "action_plans:create",
    "action_plans:transition",
    "ai_analysis:run",
    "reports:export",
  ],
  "Document Author": [
    "documents:create",
    "documents:edit",
    "evidence:create",
    "reports:export",
  ],
  Reviewer: [
    "documents:edit",
    "ai_analysis:run",
    "ai_analysis:review",
    "action_plans:transition",
    "reports:export",
  ],
  Approver: ["approvals:decide", "approvals:sign", "reports:export"],
  Auditor: ["reports:export"],
  "Read-only": [],
};

export function can(role: Role | null | undefined, perm: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(perm) ?? false;
}

export function canAny(
  role: Role | null | undefined,
  perms: Permission[]
): boolean {
  return perms.some((p) => can(role, p));
}
