import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { Requirement } from "@/lib/types";
import { csvToObjects } from "@/lib/csv";

const REQUIRED = [
  "requirement_code",
  "section",
  "title",
  "evaluation_element",
  "evaluation_criteria",
  "expected_document_type",
];

const OPTIONAL = [
  "compliance_status",
  "risk_level",
  "owner_id",
  "reviewer_id",
  "due_date",
  "methodology",
  "criteria_for_compliance",
  "observations",
  "actions_to_perform",
  "notes",
  "linked_documents", // ignored on create — informational
  "owner", // accepted as text alias for owner_id when no user match
  "reviewer",
];

interface ImportRow {
  index: number;
  data: Record<string, string>;
  errors: string[];
}

function normalizeRow(raw: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(raw)) {
    const key = k.trim().toLowerCase().replace(/\s+/g, "_");
    out[key] = (v ?? "").trim();
  }
  return out;
}

function resolveUser(text: string): string | null {
  if (!text) return null;
  const t = text.toLowerCase();
  const u = db().users.find(
    (u) => u.id === text || u.name.toLowerCase() === t || u.email.toLowerCase() === t
  );
  return u ? u.id : null;
}

function validate(rows: Record<string, string>[]): ImportRow[] {
  return rows.map((data, index) => {
    const errors: string[] = [];
    for (const k of REQUIRED) {
      if (!data[k]) errors.push(`Missing required field: ${k}`);
    }
    if (
      data.compliance_status &&
      !["Compliant","Not Compliant","Partially Compliant","Not Applicable","Pending","Under Review"].includes(
        data.compliance_status
      )
    ) errors.push(`Invalid compliance_status: ${data.compliance_status}`);
    if (
      data.risk_level &&
      !["Low","Medium","High","Critical"].includes(data.risk_level)
    ) errors.push(`Invalid risk_level: ${data.risk_level}`);
    return { index, data, errors };
  });
}

export async function POST(req: Request) {
  const body = (await req.json()) as {
    csv?: string;
    json?: string;
    rows?: Record<string, string>[];
    preview?: boolean;
  };

  let rawRows: Record<string, string>[] = [];
  if (body.rows) rawRows = body.rows;
  else if (body.csv) rawRows = csvToObjects(body.csv);
  else if (body.json) {
    try {
      const parsed = JSON.parse(body.json);
      if (!Array.isArray(parsed))
        return NextResponse.json({ error: "JSON must be an array of rows" }, { status: 400 });
      rawRows = parsed;
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON: " + (e as Error).message }, { status: 400 });
    }
  } else {
    return NextResponse.json({ error: "Provide csv, json, or rows" }, { status: 400 });
  }

  const normalized = rawRows.map(normalizeRow);
  const validated = validate(normalized);

  if (body.preview) {
    return NextResponse.json({
      total: validated.length,
      valid: validated.filter((r) => r.errors.length === 0).length,
      invalid: validated.filter((r) => r.errors.length > 0).length,
      rows: validated,
      acceptedFields: [...REQUIRED, ...OPTIONAL],
    });
  }

  const created: Requirement[] = [];
  for (const v of validated) {
    if (v.errors.length) continue;
    const d = v.data;
    const id = nextId("req");
    const r: Requirement = {
      id,
      requirement_code: d.requirement_code,
      section: d.section,
      title: d.title,
      evaluation_element: d.evaluation_element,
      evaluation_criteria: d.evaluation_criteria,
      expected_document_type: d.expected_document_type,
      compliance_status: (d.compliance_status as Requirement["compliance_status"]) || "Pending",
      risk_level: (d.risk_level as Requirement["risk_level"]) || "Medium",
      owner_id: resolveUser(d.owner_id || d.owner || ""),
      reviewer_id: resolveUser(d.reviewer_id || d.reviewer || ""),
      due_date: d.due_date || null,
      methodology: d.methodology || "",
      criteria_for_compliance: d.criteria_for_compliance || "",
      observations: d.observations || "",
      actions_to_perform: d.actions_to_perform || "",
      notes: d.notes || "",
      human_review_required: false,
      created_at: nowISO(),
      updated_at: nowISO(),
    };
    db().requirements.push(r);
    created.push(r);
  }
  logActivity("u-001", "Bulk imported requirements", "Requirement", "bulk", `Created ${created.length}`);

  return NextResponse.json({
    created: created.length,
    skipped: validated.filter((r) => r.errors.length > 0).length,
    rows: validated,
  });
}
