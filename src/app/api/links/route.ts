import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { RequirementDocumentLink } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ links: db().requirementDocuments });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<RequirementDocumentLink>;
  if (!body.requirement_id || !body.document_id) {
    return NextResponse.json(
      { error: "requirement_id and document_id are required" },
      { status: 400 }
    );
  }
  const link: RequirementDocumentLink = {
    id: nextId("rd"),
    requirement_id: body.requirement_id,
    document_id: body.document_id,
    relation_type: body.relation_type ?? "Primary",
    mandatory_or_optional: body.mandatory_or_optional ?? "Mandatory",
    linked_by: body.linked_by ?? "u-002",
    linked_at: nowISO(),
  };
  db().requirementDocuments.push(link);
  logActivity(
    "u-002",
    "Linked document to requirement",
    "Requirement",
    body.requirement_id,
    `→ ${body.document_id}`
  );
  return NextResponse.json({ link }, { status: 201 });
}

export async function DELETE(req: Request) {
  const { id } = (await req.json()) as { id: string };
  db().requirementDocuments = db().requirementDocuments.filter((x) => x.id !== id);
  return NextResponse.json({ ok: true });
}
