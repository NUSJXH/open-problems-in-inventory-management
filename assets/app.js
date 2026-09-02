const state = { records: [], filtered: [] };

const confidenceRank = { High: 0, Medium: 1, Low: 2 };
const trackClass = {
  "Formal candidate": "badge-formal",
  "Research agenda": "badge-agenda",
  "Candidate incubation": "badge-candidate",
  "Resolved archive": "badge-resolved",
};

const elements = {
  search: document.querySelector("#search"),
  track: document.querySelector("#track-filter"),
  domain: document.querySelector("#domain-filter"),
  evidence: document.querySelector("#evidence-filter"),
  sort: document.querySelector("#sort-filter"),
  clear: document.querySelector("#clear-filters"),
  list: document.querySelector("#problem-list"),
  empty: document.querySelector("#empty-state"),
  resultCount: document.querySelector("#result-count"),
  activeFilters: document.querySelector("#active-filters"),
  template: document.querySelector("#problem-card-template"),
};

function option(value, count) {
  const node = document.createElement("option");
  node.value = value;
  node.textContent = `${value} (${count})`;
  return node;
}

function populateSelect(select, values) {
  const counts = new Map();
  values.forEach((value) => counts.set(value, (counts.get(value) || 0) + 1));
  [...counts.entries()].sort(([a], [b]) => a.localeCompare(b)).forEach(([value, count]) => select.append(option(value, count)));
}

function badge(text, className = "") {
  const node = document.createElement("span");
  node.className = `badge ${className}`.trim();
  node.textContent = text;
  return node;
}

function truncate(text, limit = 245) {
  if (!text || text.length <= limit) return text || "";
  return `${text.slice(0, limit).trim()}…`;
}

function workflowSummary(record) {
  const labels = [
    ["EX", record.workflow?.extracted],
    ["SV", record.workflow?.sourceVerified],
    ["LA", record.workflow?.literatureAudited],
    ["EV", record.workflow?.expertVerified],
  ];
  return labels.map(([code, status]) => `${code} ${status || "not-recorded"}`).join(" · ");
}

function render(records) {
  elements.list.replaceChildren();
  const fragment = document.createDocumentFragment();
  records.forEach((record) => {
    const card = elements.template.content.cloneNode(true);
    const article = card.querySelector(".problem-card");
    article.dataset.id = record.id;
    card.querySelector(".card-index").textContent = record.id;
    const badgeRow = card.querySelector(".badge-row");
    badgeRow.append(
      badge(record.track, trackClass[record.track]),
      badge(record.evidenceType, `badge-${record.evidenceType.slice(-1).toLowerCase()}`),
      badge(record.statusCode, `badge-${record.statusCode.toLowerCase()}`),
    );
    if (record.auditFlags?.length) badgeRow.append(badge("Re-audit flag", "badge-candidate"));
    const href = `problem.html?id=${encodeURIComponent(record.id)}`;
    const titleLink = card.querySelector(".problem-link");
    titleLink.href = href;
    titleLink.textContent = record.titleEn;
    card.querySelector(".question-preview").textContent = truncate(record.question);
    card.querySelector(".domain").textContent = record.primaryDomain;
    card.querySelector(".source").textContent = `${record.sourceAuthors} · ${record.journal}`;
    card.querySelector(".audit-date").textContent = `Audited ${record.lastAuditDate}`;
    card.querySelector(".verification").textContent = `${workflowSummary(record)} · Confidence: ${record.confidence}`;
    const detail = card.querySelector(".detail-link");
    detail.href = href;
    fragment.append(card);
  });
  elements.list.append(fragment);
  elements.empty.hidden = records.length !== 0;
  elements.resultCount.textContent = `Showing ${records.length} of ${state.records.length} records`;
}

function readFilters() {
  return {
    query: elements.search.value.trim().toLowerCase(),
    track: elements.track.value,
    domain: elements.domain.value,
    evidence: elements.evidence.value,
    sort: elements.sort.value,
  };
}

function applyFilters() {
  const filters = readFilters();
  let records = state.records.filter((record) => {
    const haystack = [
      record.id, record.titleEn, record.primaryDomain, record.sourceAuthors,
      record.sourceTitle, record.question, record.inventoryObject, record.decision, record.uncertainty,
    ].join(" ").toLowerCase();
    return (!filters.query || haystack.includes(filters.query)) &&
      (!filters.track || record.track === filters.track) &&
      (!filters.domain || record.primaryDomain === filters.domain) &&
      (!filters.evidence || record.evidenceType === filters.evidence);
  });
  if (filters.sort === "confidence") {
    records.sort((a, b) => confidenceRank[a.confidence] - confidenceRank[b.confidence] || a.id.localeCompare(b.id));
  } else if (filters.sort === "audit") {
    records.sort((a, b) => b.lastAuditDate.localeCompare(a.lastAuditDate) || a.id.localeCompare(b.id));
  } else {
    records.sort((a, b) => a.id.localeCompare(b.id));
  }
  state.filtered = records;
  render(records);
  renderActiveFilters(filters);
}

function renderActiveFilters(filters) {
  elements.activeFilters.replaceChildren();
  const labels = [];
  if (filters.query) labels.push(`Search: ${elements.search.value.trim()}`);
  if (filters.track) labels.push(`Track: ${filters.track}`);
  if (filters.domain) labels.push(`Domain: ${filters.domain}`);
  if (filters.evidence) labels.push(`Evidence: ${filters.evidence}`);
  labels.forEach((label) => {
    const chip = document.createElement("span");
    chip.className = "filter-chip";
    chip.textContent = label;
    elements.activeFilters.append(chip);
  });
}

function clearFilters() {
  elements.search.value = "";
  elements.track.value = "";
  elements.domain.value = "";
  elements.evidence.value = "";
  elements.sort.value = "id";
  applyFilters();
}

async function init() {
  try {
    const response = await fetch("data/problems.json?v=2026-09-02");
    if (!response.ok) throw new Error(`Data request failed: ${response.status}`);
    const data = await response.json();
    state.records = data.records;
    populateSelect(elements.track, state.records.map((r) => r.track));
    populateSelect(elements.domain, state.records.map((r) => r.primaryDomain));
    populateSelect(elements.evidence, state.records.map((r) => r.evidenceType));
    document.querySelector("#stat-total").textContent = data.summary.totalRecords;
    document.querySelector("#stat-formal").textContent = data.summary.formalCandidates;
    document.querySelector("#stat-agenda").textContent = data.summary.researchAgendas;
    document.querySelector("#stat-expert").textContent = data.summary.expertVerifiedActive;
    applyFilters();
  } catch (error) {
    elements.resultCount.textContent = "Registry unavailable";
    elements.empty.hidden = false;
    elements.empty.querySelector("h3").textContent = "The data could not be loaded";
    elements.empty.querySelector("p").textContent = "Serve this folder through a local web server or GitHub Pages.";
    console.error(error);
  }
}

[elements.track, elements.domain, elements.evidence, elements.sort].forEach((el) => el.addEventListener("change", applyFilters));
elements.search.addEventListener("input", applyFilters);
elements.clear.addEventListener("click", clearFilters);
init();
