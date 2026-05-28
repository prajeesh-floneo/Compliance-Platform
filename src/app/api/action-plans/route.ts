import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { ActionPlan } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ actionPlans: db().actionPlans });
}

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<ActionPlan>;
  if (!body.requirement_id || !body.issue_description) {
    return NextResponse.json(
      { error: "requirement_id and issue_description are required" },
      { status: 400 }
    );
  }
  const id = nextId("ap");
  const code = `AP-${String(db().actionPlans.length + 1).padStart(3, "0")}`;
  const a: ActionPlan = {
    id,
    action_code: code,
    requirement_id: body.requirement_id,
    issue_description: body.issue_description,
    corrective_action: body.corrective_action ?? "",
    owner_id: body.owner_id ?? null,
    priority: body.priority ?? "Medium",
    risk_level: body.risk_level ?? "Medium",
    due_date: body.due_date ?? new Date().toISOString().slice(0, 10),
    status: body.status ?? "Open",
    closure_evidence_id: body.closure_evidence_id ?? null,
    reviewer_comments: body.reviewer_comments ?? "",
    completed_at: null,
    created_at: nowISO(),
  };
  db().actionPlans.push(a);
  logActivity("u-002", "Created action plan", "ActionPlan", id, `${code} for ${body.requirement_id}`);
  return NextResponse.json({ actionPlan: a }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as { id: string } & Partial<ActionPlan>;
  const idx = db().actionPlans.findIndex((a) => a.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const updated = { ...db().actionPlans[idx], ...body };
  if (updated.status === "Completed" && !updated.completed_at)
    updated.completed_at = nowISO();
  db().actionPlans[idx] = updated;
  logActivity("u-002", "Updated action plan", "ActionPlan", body.id, Object.keys(body).join(", "));
  return NextResponse.json({ actionPlan: updated });
}
