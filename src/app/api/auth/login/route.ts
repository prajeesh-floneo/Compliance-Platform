import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db, logActivity } from "@/lib/store";
import { DEMO_PASSWORD, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    user_id?: string;
    email?: string;
    password?: string;
  };

  if (!body.password || body.password !== DEMO_PASSWORD) {
    return NextResponse.json(
      { error: "Invalid credentials." },
      { status: 401 },
    );
  }

  const u = db().users.find(
    (x) =>
      (body.user_id && x.id === body.user_id) ||
      (body.email && x.email.toLowerCase() === body.email.toLowerCase()),
  );
  if (!u) {
    return NextResponse.json({ error: "User not found." }, { status: 401 });
  }
  if (u.status !== "Active") {
    return NextResponse.json(
      { error: "User account is inactive." },
      { status: 403 },
    );
  }

  cookies().set(SESSION_COOKIE, u.id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  logActivity(u.id, "Signed in", "System", u.id, `${u.name} (${u.role})`);
  return NextResponse.json({ user: u });
}
