const params = new URLSearchParams(window.location.search);
const recordId = params.get("id");

const publicRules = {
  "Formal candidate": "Display only as a provisional formal candidate until the exact source passage is stored and the literature audit is complete. Add Expert-Verified only after EV.",
  "Research agenda": "Display as a source-backed research challenge. Do not call it an unsolved theorem or conjecture.",
  "Candidate incubation": "Display as synthesized by editors. Do not attribute the exact formulation to the anchor-source authors.",
  "Resolved archive": "Display the resolution and map its assumptions and scope back to the historical open question.",
};

function setText(id, value, fallback = "Not yet recorded") {
  document.querySelector(`#${id}`).textContent = value || fallback;
}

function addBadge(container, text, className) {
  const badge = document.createElement("span");
  badge.className = `badge ${className}`;
  badge.textContent = text;
  container.append(badge);
}

function trackClass(track) {
  return {
    "Formal candidate": "badge-formal",
    "Research agenda": "badge-agenda",
    "Candidate incubation": "badge-candidate",
    "Resolved archive": "badge-resolved",
  }[track] || "";
}

function workflowSummary(record) {
  return [
    ["EX", record.workflow?.extracted],
    ["SV", record.workflow?.sourceVerified],
    ["LA", record.workflow?.literatureAudited],
    ["EV", record.workflow?.expertVerified],
  ].map(([code, status]) => `${code}: ${status || "not-recorded"}`).join(" · ");
}

function render(record) {
  document.title = `${record.id}: ${record.titleEn} · Open Problems in Inventory Management`;
  setText("record-id", record.id);
  setText("record-title", record.titleEn);
  const source = document.querySelector("#record-source");
  const link = document.createElement("a");
  link.href = record.doiUrl;
  link.target = "_blank";
  link.rel = "noreferrer";
  link.textContent = record.sourceTitle;
  source.append(link, document.createTextNode(` · ${record.sourceAuthors} · ${record.journal}`));

  const badges = document.querySelector("#record-badges");
  addBadge(badges, record.track, trackClass(record.track));
  addBadge(badges, record.evidenceType, `badge-${record.evidenceType.slice(-1).toLowerCase()}`);
  addBadge(badges, record.statusCode, `badge-${record.statusCode.toLowerCase()}`);
  if (record.auditFlags?.length) addBadge(badges, "Re-audit flag", "badge-candidate");

  setText("fact-class", record.imClass);
  setText("fact-domain", record.primaryDomain);
  setText("fact-layer", record.cohenLayer);
  setText("fact-audit", record.lastAuditDate);
  setText("fact-confidence", record.confidence);
  setText("fact-stage", workflowSummary(record));
  setText("record-question", record.question);
  setText("record-object", record.inventoryObject);
  setText("record-decision", record.decision);
  setText("record-uncertainty", record.uncertainty);
  setText("record-progress", record.knownProgress);
  setText("record-assessment", record.currentAssessment);
  setText("record-evidence", record.sourceEvidence);
  setText("record-next", record.nextVerificationAction);
  const notes = [...(record.auditFlags || []), record.notes].filter(Boolean).join(" ");
  setText("record-note", notes, "No additional audit note is recorded.");
  setText("record-public-rule", publicRules[record.track]);

  const warning = document.querySelector("#detail-warning");
  warning.textContent = record.track === "Resolved archive"
    ? "Resolved control: the archive must show the closing result and its precise scope."
    : "Provisional record: this page does not certify that the problem remains open.";
  document.querySelector("#record-loading").hidden = true;
  document.querySelector("#record-content").hidden = false;
}

async function init() {
  if (!recordId) {
    document.querySelector("#record-loading").hidden = true;
    document.querySelector("#missing-record").hidden = false;
    return;
  }
  try {
    const response = await fetch("data/problems.json?v=2026-09-02");
    if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
    const data = await response.json();
    const record = data.records.find((item) => item.id === recordId);
    if (!record) throw new Error("Record not found");
    render(record);
  } catch (error) {
    document.querySelector("#record-loading").hidden = true;
    document.querySelector("#missing-record").hidden = false;
    console.error(error);
  }
}

init();

