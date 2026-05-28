import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getCurrentUser, SESSION_COOKIE } from "@/lib/auth";
import { logActivity } from "@/lib/store";

export async function POST() {
  const u = getCurrentUser();
  cookies().delete(SESSION_COOKIE);
  if (u) logActivity(u.id, "Signed out", "System", u.id, u.name);
  return NextResponse.json({ ok: true });
}
