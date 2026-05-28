import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { Requirement } from "@/lib/types";

export async function GET() {
  return NextResponse.json({ requirements: db().requirements });
}

const REQUIRED = [
  "requirement_code",
  "section",
  "title",
  "evaluation_element",
  "evaluation_criteria",
  "expected_document_type",
];

export async function POST(req: Request) {
  const body = (await req.json()) as Partial<Requirement>;
  const missing = REQUIRED.filter((k) => !(body as Record<string, unknown>)[k]);
  if (missing.length) {
    return NextResponse.json(
      { error: `Missing required fields: ${missing.join(", ")}` },
      { status: 400 }
    );
  }
  const id = nextId("req");
  const r: Requirement = {
    id,
    requirement_code: body.requirement_code!,
    section: body.section!,
    title: body.title!,
    evaluation_element: body.evaluation_element!,
    evaluation_criteria: body.evaluation_criteria!,
    expected_document_type: body.expected_document_type!,
    compliance_status: (body.compliance_status as Requirement["compliance_status"]) ?? "Pending",
    risk_level: (body.risk_level as Requirement["risk_level"]) ?? "Medium",
    owner_id: body.owner_id ?? null,
    reviewer_id: body.reviewer_id ?? null,
    due_date: body.due_date ?? null,
    methodology: body.methodology ?? "",
    criteria_for_compliance: body.criteria_for_compliance ?? "",
    observations: body.observations ?? "",
    actions_to_perform: body.actions_to_perform ?? "",
    notes: body.notes ?? "",
    human_review_required: body.human_review_required ?? false,
    created_at: nowISO(),
    updated_at: nowISO(),
  };
  db().requirements.push(r);
  logActivity("u-001", "Created requirement", "Requirement", id, `Code ${r.requirement_code}`);
  return NextResponse.json({ requirement: r }, { status: 201 });
}
