import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(scriptDir, "..");
const workspaceRoot = path.resolve(siteRoot, "..");
const inputPath = path.join(workspaceRoot, "_review_tmp", "workbook_render", "Problem_Audit.ndjson");
const outputPath = path.join(siteRoot, "data", "problems.json");

const ndjson = (await fs.readFile(inputPath, "utf8")).trim().split(/\r?\n/).map(JSON.parse);
const table = ndjson.find((item) => item.kind === "table");
if (!table?.values?.length) throw new Error("Problem_Audit table data not found");

const headers = table.values[3];
const index = Object.fromEntries(headers.map((name, i) => [name, i]));
const get = (row, name) => row[index[name]] ?? "";

const auditFlags = {
  "IM-008": [
    "Normalize the bibliographic year: the article was published online in 2024 and appears in Management Science volume 71(1) in 2025.",
    "Store the exact no-balance-assumption passage and page before public Type A release.",
  ],
  "IM-011": [
    "Use the full official source title and preserve the exact one-warehouse multistore model scope.",
  ],
  "IM-029": [
    "Reclassification required: the anchor paper itself proves sampling-complexity and groupwise-synchronization results; isolate a genuinely remaining gap before retaining Type A/OF.",
  ],
};

function deriveTrack(recommendation) {
  if (recommendation.includes("Formal")) return "Formal candidate";
  if (recommendation.includes("Research Agenda")) return "Research agenda";
  if (recommendation.includes("Candidate")) return "Candidate incubation";
  if (recommendation.includes("Resolved")) return "Resolved archive";
  return "Unassigned";
}

function deriveWorkflow(sourceLabel) {
  const label = String(sourceLabel || "").toUpperCase();
  const provisional = label.includes("PROVISIONAL");
  const statusFor = (code) => {
    if (!new RegExp(`(^|[-\\s])${code}($|[-\\s(])`).test(label)) return "not-recorded";
    return provisional ? "provisional" : "complete";
  };
  return {
    extracted: "complete",
    sourceVerified: statusFor("SV"),
    literatureAudited: statusFor("LA"),
    expertVerified: statusFor("EV"),
    sourceLabel: sourceLabel || "",
  };
}

const records = table.values.slice(4).filter((row) => row[0]).map((row) => {
  const id = get(row, "ID");
  const inclusionRecommendation = get(row, "Inclusion Recommendation");
  const verificationStage = get(row, "Verification Stage");
  return {
    id,
    titleZh: get(row, "中文问题标题"),
    titleEn: get(row, "English Short Title"),
    imClass: get(row, "IM Classification"),
    evidenceType: get(row, "Evidence Type"),
    primaryDomain: get(row, "Primary Domain"),
    cohenLayer: get(row, "Cohen Layer"),
    inventoryObject: get(row, "Inventory Object/System"),
    decision: get(row, "Decision"),
    uncertainty: get(row, "Uncertainty"),
    question: get(row, "Open Gap / Research Question"),
    sourceAuthors: get(row, "Anchor Source (Author-Year)"),
    sourceTitle: get(row, "Anchor Source Title"),
    journal: get(row, "Journal"),
    doiUrl: get(row, "DOI / URL"),
    sourceEvidence: get(row, "Source Support / Evidence"),
    knownProgress: get(row, "Known & Partial Progress"),
    currentAssessment: get(row, "Current Assessment (2026-08-31)"),
    statusCode: get(row, "Status Code"),
    inclusionRecommendation,
    track: deriveTrack(inclusionRecommendation),
    confidence: get(row, "Confidence"),
    expertVerificationRequired: get(row, "Expert Verification Required"),
    nextVerificationAction: get(row, "Next Verification Action"),
    lastAuditDate: get(row, "Last Audit Date"),
    notes: get(row, "Additional Sources / Notes"),
    verificationStage,
    workflow: deriveWorkflow(verificationStage),
    auditFlags: auditFlags[id] || [],
  };
});

const active = records.filter((r) => r.track !== "Resolved archive");
const data = {
  schemaVersion: "1.0",
  dataVersion: "2026-08-31",
  generatedForPrototype: "2026-09-01",
  disclaimer: "No active record is expert-verified. Open status is bounded by the documented search scope and audit date.",
  summary: {
    totalRecords: records.length,
    activeCandidates: active.length,
    formalCandidates: records.filter((r) => r.track === "Formal candidate").length,
    researchAgendas: records.filter((r) => r.track === "Research agenda").length,
    candidateIncubation: records.filter((r) => r.track === "Candidate incubation").length,
    resolvedArchive: records.filter((r) => r.track === "Resolved archive").length,
    expertVerifiedActive: active.filter((r) => r.workflow.expertVerified === "complete").length,
  },
  records,
};

await fs.mkdir(path.dirname(outputPath), { recursive: true });
await fs.writeFile(outputPath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
console.log(`Wrote ${records.length} records to ${outputPath}`);
