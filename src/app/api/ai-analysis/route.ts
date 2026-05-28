import { NextResponse } from "next/server";
import { db, logActivity, nextId, nowISO } from "@/lib/store";
import type { AIAnalysis } from "@/lib/types-extra";

export async function GET() {
  return NextResponse.json({ analyses: db().aiAnalyses });
}

// Mock rule-based AI analysis: combines requirement metadata, linked
// documents, and linked evidence to produce a suggested status, missing
// items and a recommended action plan. NOT a final compliance decision —
// the human reviewer remains accountable.
export async function POST(req: Request) {
  const body = (await req.json()) as {
    requirement_id: string;
    document_id?: string | null;
    evidence_id?: string | null;
  };
  const req_ = db().requirements.find((r) => r.id === body.requirement_id);
  if (!req_)
    return NextResponse.json({ error: "Requirement not found" }, { status: 404 });

  const links = db().requirementDocuments.filter(
    (l) => l.requirement_id === req_.id
  );
  const docs = links
    .map((l) => db().documents.find((d) => d.id === l.document_id))
    .filter(Boolean);
  const evidences = db().evidence.filter((e) => e.requirement_id === req_.id);

  const chosenDoc =
    db().documents.find((d) => d.id === body.document_id) ?? docs[0];
  const chosenEv =
    db().evidence.find((e) => e.id === body.evidence_id) ?? evidences[0];

  const missing: string[] = [];
  const matched: string[] = [];

  if (!chosenDoc) missing.push("No primary document linked to this requirement.");
  else {
    matched.push(`Document: ${chosenDoc.title} (v${chosenDoc.version})`);
    if (chosenDoc.signature_status !== "Signed")
      missing.push("Primary document is not digitally signed by the Approver.");
    if (chosenDoc.status === "Draft" || chosenDoc.status === "Under Review")
      missing.push(`Document is in '${chosenDoc.status}' status, not Active.`);
    if (chosenDoc.review_date && new Date(chosenDoc.review_date) < new Date())
      missing.push("Document review date has passed.");
  }

  if (!chosenEv) missing.push("No evidence files linked to this requirement.");
  else {
    matched.push(`Evidence: ${chosenEv.title} (${chosenEv.evidence_type})`);
    if (chosenEv.status === "Expired") missing.push("Linked evidence is expired.");
    if (chosenEv.status === "Pending Update")
      missing.push("Linked evidence is flagged Pending Update.");
  }

  // crude keyword coverage: ensure all words in evaluation_criteria appear
  // somewhere in document/evidence titles or notes
  const keywords = req_.evaluation_criteria
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 5)
    .slice(0, 8);
  const corpus = [
    chosenDoc?.title ?? "",
    chosenDoc?.notes ?? "",
    chosenEv?.title ?? "",
    chosenEv?.notes ?? "",
  ].join(" ").toLowerCase();
  const uncovered = keywords.filter((k) => !corpus.includes(k));
  if (uncovered.length)
    missing.push(`Criteria keywords not evidenced: ${uncovered.slice(0, 5).join(", ")}.`);

  let suggested: AIAnalysis["suggested_status"];
  if (!chosenDoc || !chosenEv) suggested = "Insufficient Data";
  else if (missing.length === 0) suggested = "Compliant";
  else if (missing.length <= 2) suggested = "Partially Compliant";
  else suggested = "Not Compliant";

  const confidence = Math.max(
    20,
    Math.min(95, 95 - missing.length * 8 - (chosenDoc ? 0 : 15) - (chosenEv ? 0 : 10))
  );

  const recommended =
    suggested === "Compliant"
      ? "No corrective action required. Submit to Approver for sign-off."
      : `Address the ${missing.length} gap(s) listed; if document/evidence gaps remain, attach updated artefacts and re-run analysis.`;

  const a: AIAnalysis = {
    id: nextId("ai"),
    requirement_id: req_.id,
    document_id: chosenDoc?.id ?? null,
    evidence_id: chosenEv?.id ?? null,
    suggested_status: suggested,
    missing_items: missing,
    matched_sections: matched,
    recommended_action: recommended,
    confidence_score: confidence,
    human_review_status: "Required",
    created_at: nowISO(),
  };
  db().aiAnalyses.unshift(a);
  logActivity(
    "u-002",
    "Ran AI analysis",
    "AIAnalysis",
    a.id,
    `${req_.requirement_code} → ${suggested} (${confidence}%)`
  );
  return NextResponse.json({ analysis: a }, { status: 201 });
}

export async function PATCH(req: Request) {
  const body = (await req.json()) as {
    id: string;
    human_review_status: AIAnalysis["human_review_status"];
    decision?: string;
  };
  const idx = db().aiAnalyses.findIndex((a) => a.id === body.id);
  if (idx < 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
  db().aiAnalyses[idx] = {
    ...db().aiAnalyses[idx],
    human_review_status: body.human_review_status,
    human_reviewer_decision: body.decision,
  };
  return NextResponse.json({ analysis: db().aiAnalyses[idx] });
}
