import { NextResponse } from "next/server";
import { db, logActivity, nowISO } from "@/lib/store";
import type { Requirement } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const r = db().requirements.find((x) => x.id === params.id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ requirement: r });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const idx = db().requirements.findIndex((x) => x.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const patch = (await req.json()) as Partial<Requirement>;
  const updated: Requirement = {
    ...db().requirements[idx],
    ...patch,
    updated_at: nowISO(),
  };
  db().requirements[idx] = updated;
  logActivity(
    "u-002",
    "Updated requirement",
    "Requirement",
    params.id,
    Object.keys(patch).join(", ")
  );
  return NextResponse.json({ requirement: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const before = db().requirements.length;
  db().requirements = db().requirements.filter((x) => x.id !== params.id);
  if (db().requirements.length === before)
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  logActivity("u-001", "Deleted requirement", "Requirement", params.id, "");
  return NextResponse.json({ ok: true });
}
