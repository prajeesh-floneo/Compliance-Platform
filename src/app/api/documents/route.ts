import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { DocumentRecord, RequirementDocumentLink } from "@/lib/types";

export async function GET() {
  return NextResponse.json({
    documents: db().documents,
    links: db().requirementDocuments,
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<DocumentRecord> & {
    requirement_ids?: string[];
  };
  if (!body.title || !body.category || !body.document_type) {
    return NextResponse.json(
      { error: "title, category and document_type are required" },
      { status: 400 }
    );
  }
  const id = nextId("doc");
  const d: DocumentRecord = {
    id,
    title: body.title,
    category: body.category,
    document_type: body.document_type,
    version: body.version ?? "1.0",
    status: body.status ?? "Draft",
    file_url: body.file_url ?? `/mock/${id}.pdf`,
    language: body.language ?? "EN",
    department: body.department ?? "Information Security",
    owner_id: body.owner_id ?? null,
    author_id: body.author_id ?? null,
    reviewer_id: body.reviewer_id ?? null,
    approver_id: body.approver_id ?? null,
    signature_status: body.signature_status ?? "Unsigned",
    signature_hash: body.signature_hash ?? null,
    signer_name: body.signer_name ?? null,
    signer_role: body.signer_role ?? null,
    signed_at: body.signed_at ?? null,
    effective_date: body.effective_date ?? null,
    review_date: body.review_date ?? null,
    expiry_date: body.expiry_date ?? null,
    notes: body.notes ?? "",
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  db().documents.push(d);

  if (body.requirement_ids) {
    for (const rid of body.requirement_ids) {
      const link: RequirementDocumentLink = {
        id: nextId("rd"),
        requirement_id: rid,
        document_id: id,
        relation_type: "Primary",
        mandatory_or_optional: "Mandatory",
        linked_by: "u-002",
        linked_at: nowISO(),
      };
      db().requirementDocuments.push(link);
    }
  }
  logActivity("u-005", "Uploaded document", "Document", id, `${d.title} v${d.version}`);
  return NextResponse.json({ document: d }, { status: 201 });
}
