// Server-side session helpers. Demo build uses a single httpOnly cookie
// holding the user id; no password validation beyond a shared demo secret
// (see /api/auth/login). Replace with NextAuth / iron-session when this app
// moves off the in-memory store.

import { cookies } from "next/headers";
import { db } from "./store";
import type { User } from "./types";

export const SESSION_COOKIE = "cp_uid";
export const DEMO_PASSWORD = "demo";

export function getCurrentUser(): User | null {
  const uid = cookies().get(SESSION_COOKIE)?.value;
  if (!uid) return null;
  return db().users.find((u) => u.id === uid) ?? null;
}

export function requireUser(): User {
  const u = getCurrentUser();
  if (!u) throw new Error("Not authenticated");
  return u;
}

export function sessionUserId(): string {
  return getCurrentUser()?.id ?? "u-001";
}
