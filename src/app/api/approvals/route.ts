import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { Approval } from "@/lib/types-extra";

export async function GET() {
  return NextResponse.json({ approvals: db().approvals });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Approval>;
  if (!body.item_type || !body.item_id || !body.item_name) {
    return NextResponse.json(
      { error: "item_type, item_id and item_name are required" },
      { status: 400 }
    );
  }
  const id = nextId("app");
  const a: Approval = {
    id,
    item_type: body.item_type,
    item_id: body.item_id,
    item_name: body.item_name,
    requested_by: body.requested_by ?? "u-002",
    approver_id: body.approver_id ?? "u-007",
    status: body.status ?? "Pending",
    comments: body.comments ?? "",
    signed_at: null,
    signature_hash: null,
    requested_date: nowISO(),
    due_date: body.due_date ?? null,
    created_at: nowISO(),
  };
  db().approvals.push(a);
  logActivity("u-002", "Requested approval", "Approval", id, body.item_name);
  return NextResponse.json({ approval: a }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id: string;
    action: "approve" | "reject" | "changes" | "sign" | "comment";
    comments?: string;
    signer_name?: string;
    signer_role?: string;
  };
  const idx = db().approvals.findIndex((a) => a.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const a = db().approvals[idx];
  if (body.comments) a.comments = body.comments;
  if (body.action === "approve") a.status = "Approved";
  if (body.action === "reject") a.status = "Rejected";
  if (body.action === "changes") a.status = "Changes Requested";
  if (body.action === "sign") {
    a.status = "Approved";
    a.signed_at = nowISO();
    a.signature_hash = `0x${a.id.toUpperCase()}${Math.random()
      .toString(16)
      .slice(2, 8)
      .toUpperCase()}`;
    if (a.item_type === "Document") {
      const d = db().documents.find((x) => x.id === a.item_id);
      if (d) {
        d.signature_status = "Signed";
        d.signature_hash = a.signature_hash;
        d.signer_name = body.signer_name ?? "Ricardo Núñez";
        d.signer_role = body.signer_role ?? "Approver";
        d.signed_at = a.signed_at;
        d.status = "Digitally Signed";
      }
    }
  }
  db().approvals[idx] = a;
  logActivity("u-007", `Approval: ${body.action}`, "Approval", a.id, a.item_name);
  return NextResponse.json({ approval: a });
}
