import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { Evidence } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ evidence: db().evidence });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Evidence>;
  if (!body.title || !body.evidence_type) {
    return NextResponse.json(
      { error: "title and evidence_type are required" },
      { status: 400 }
    );
  }
  const id = nextId("ev");
  const e: Evidence = {
    id,
    title: body.title,
    evidence_type: body.evidence_type,
    file_url: body.file_url ?? `/mock/${id}.bin`,
    requirement_id: body.requirement_id ?? null,
    document_id: body.document_id ?? null,
    collected_by: body.collected_by ?? null,
    collection_date: body.collection_date ?? new Date().toISOString().slice(0, 10),
    retention_period: body.retention_period ?? "2 years",
    expiry_date: body.expiry_date ?? null,
    status: body.status ?? "Valid",
    notes: body.notes ?? "",
    created_at: nowISO(),
  };
  db().evidence.push(e);
  logActivity("u-003", "Uploaded evidence", "Evidence", id, e.title);
  return NextResponse.json({ evidence: e }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id: string } & Partial<Evidence>;
  const idx = db().evidence.findIndex((e) => e.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  db().evidence[idx] = { ...db().evidence[idx], ...body };
  logActivity("u-002", "Updated evidence", "Evidence", body.id, Object.keys(body).join(", "));
  return NextResponse.json({ evidence: db().evidence[idx] });
}
