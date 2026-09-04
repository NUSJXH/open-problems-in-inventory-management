const registryUrl = "data/registry.json?v=2.4.0";

const openList = document.querySelector("#open-list");
const statusList = document.querySelector("#status-list");
const pathList = document.querySelector("#path-list");
const resultCount = document.querySelector("#result-count");
const topicFilters = document.querySelector("#topic-filters");
const searchInput = document.querySelector("#search");
const emptyState = document.querySelector("#empty-state");

const state = { query: "", topic: "All topics" };
let registry = null;

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function externalLink(label, url, className = "") {
  const link = el("a", className, label);
  link.href = url;
  link.target = "_blank";
  link.rel = "noreferrer";
  return link;
}

function tagClass(label) {
  if (label === "Explicit conjecture") return "tag tag-conjecture";
  if (label === "Explicit open question") return "tag tag-open";
  if (label === "Source-stated extension") return "tag tag-extension";
  return "tag tag-resolved";
}

function searchableText(item) {
  return [
    item.id,
    item.evidenceClass,
    item.topic,
    item.title,
    item.statement,
    item.paperEstablishes,
    item.scopeBoundary,
    item.source.authors,
    item.source.title,
    item.source.outlet,
  ].join(" ").toLowerCase();
}

function renderOpenItems() {
  const query = state.query.trim().toLowerCase();
  const visible = registry.openItems.filter((item) => {
    const topicMatch = state.topic === "All topics" || item.topic === state.topic;
    return topicMatch && (!query || searchableText(item).includes(query));
  });

  openList.replaceChildren();
  visible.forEach((item, index) => {
    const article = el("article", "paper-row");
    const number = el("div", "paper-number", String(index + 1).padStart(2, "0"));
    const body = el("div", "paper-body");
    const tags = el("div", "paper-tags");
    tags.append(el("span", tagClass(item.evidenceClass), item.evidenceClass));
    tags.append(el("span", "tag tag-topic", item.topic));
    body.append(tags, el("h3", "paper-title", item.title), el("p", "paper-statement", item.statement));

    const established = el("p", "paper-detail");
    established.append(el("strong", "", "Paper establishes. "), document.createTextNode(item.paperEstablishes));
    const boundary = el("p", "paper-detail paper-boundary");
    boundary.append(el("strong", "", "Recorded boundary. "), document.createTextNode(item.scopeBoundary));

    const citation = el("p", "paper-citation");
    citation.append(
      externalLink(
        `${item.source.authors} (${item.source.year}). ${item.source.title}. ${item.source.outlet}.`,
        item.source.url,
      ),
      document.createTextNode(` Source location: ${item.source.location}.`),
    );
    body.append(established, boundary, citation);
    article.append(number, body);
    openList.append(article);
  });

  resultCount.textContent = `Showing ${visible.length} of ${registry.openItems.length} source-stated items`;
  emptyState.hidden = visible.length !== 0;
}

function renderTopicFilters() {
  const topics = ["All topics", ...new Set(registry.openItems.map((item) => item.topic))];
  topicFilters.replaceChildren();
  topics.forEach((topic) => {
    const button = el("button", "topic-button", topic);
    button.type = "button";
    button.setAttribute("aria-pressed", String(topic === state.topic));
    button.addEventListener("click", () => {
      state.topic = topic;
      topicFilters.querySelectorAll("button").forEach((candidate) => {
        candidate.setAttribute("aria-pressed", String(candidate.textContent === topic));
      });
      renderOpenItems();
    });
    topicFilters.append(button);
  });
}

function renderStatusUpdates() {
  statusList.replaceChildren();
  registry.statusUpdates.forEach((item) => {
    const article = el("article", "status-row");
    const header = el("div", "status-header");
    header.append(el("span", "tag tag-resolved", item.status), el("span", "status-topic", item.topic));
    article.append(header, el("h3", "", item.title), el("p", "", item.summary));
    article.append(externalLink(item.citation, item.url, "citation-link"));
    statusList.append(article);
  });
}

function renderLiteraturePath() {
  pathList.replaceChildren();
  registry.literaturePath.forEach((item) => {
    const article = el("article", "path-row");
    const year = el("div", "path-year", String(item.year));
    const body = el("div", "path-body");
    const meta = el("div", "path-meta");
    meta.append(el("span", "tag tag-topic", item.dataRegime), el("span", "tag tag-benchmark", item.policyBenchmark));
    body.append(meta, externalLink(item.paper, item.url, "path-paper"), el("p", "", item.result));
    const boundary = el("p", "path-boundary");
    boundary.append(el("strong", "", "Scope. "), document.createTextNode(item.boundary));
    body.append(boundary);
    article.append(year, body);
    pathList.append(article);
  });
}

function updateStats() {
  document.querySelector("#stat-open").textContent = registry.openItems.length;
  document.querySelector("#stat-topics").textContent = new Set(registry.openItems.map((item) => item.topic)).size;
  document.querySelector("#stat-updates").textContent = registry.statusUpdates.length;
  document.querySelector("#stat-audit").textContent = registry.auditThrough;
  document.querySelector("#footer-version").textContent = `${registry.releaseVersion} · ${registry.dataVersion}`;
}

async function init() {
  try {
    const response = await fetch(registryUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    registry = await response.json();
    updateStats();
    renderTopicFilters();
    renderOpenItems();
    renderStatusUpdates();
    renderLiteraturePath();
  } catch (error) {
    resultCount.textContent = "The registry could not be loaded.";
    openList.replaceChildren(el("p", "load-error", "Please reload the page or report the problem through the public issue tracker."));
    console.error(error);
  }
}

searchInput?.addEventListener("input", (event) => {
  state.query = event.target.value;
  if (registry) renderOpenItems();
});

init();
