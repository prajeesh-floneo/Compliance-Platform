import { NextResponse } from "next/server";
import { db, logActivity, nowISO } from "@/lib/store";
import type { DocumentRecord } from "@/lib/types";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const d = db().documents.find((x) => x.id === params.id);
  if (!d) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ document: d });
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  const idx = db().documents.findIndex((x) => x.id === params.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const patch = (await req.json()) as Partial<DocumentRecord>;
  const updated: DocumentRecord = {
    ...db().documents[idx],
    ...patch,
    updated_at: nowISO(),
  };
  db().documents[idx] = updated;
  logActivity("u-002", "Updated document", "Document", params.id, Object.keys(patch).join(", "));
  return NextResponse.json({ document: updated });
}
