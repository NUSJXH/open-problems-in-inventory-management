import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const archive = path.resolve(process.argv[2] || path.join(siteRoot, "..", "source_data", "public", "openalex", "core6_2000_2026"));
const sourceBytes = await readFile(path.join(archive, "manifest.json"));
const source = JSON.parse(sourceBytes);
const screen = JSON.parse(await readFile(path.join(archive, "derived", "screen_manifest.json"), "utf8"));
const trends = JSON.parse(await readFile(path.join(archive, "derived", "topic_trends_2000_2026.json"), "utf8"));
const labels = {
  "Lost sales": "Lost sales / stockouts",
  "Data-driven inventory": "Data-driven / robust inventory",
  "Nonstationarity": "Nonstationarity",
  "Censored demand": "Censored demand",
  "Perishability": "Perishability",
  "Supply uncertainty": "Supply uncertainty"
};
const years = Array.from({ length: 27 }, (_, index) => String(2000 + index));
const payload = {
  database: "OpenAlex",
  retrievedAt: source.retrievedAt,
  asOfDate: "2026-09-04",
  timespan: "2000–2026",
  incompleteYear: 2026,
  sourceManifestSha256: createHash("sha256").update(sourceBytes).digest("hex"),
  sourceField: source.coverage.sourceField,
  journalScope: source.sources.map((journal) => journal.journal || journal.name || journal.display_name),
  totalRecords: screen.totalRecordsRead,
  recordsWithAbstract: screen.recordsWithAbstract,
  inventoryScopeRecords: screen.inventoryScopeRecords,
  openLanguageCandidates: screen.openLanguageCandidates,
  categories: Object.values(labels),
  years: years.map((year) => ({
    year: Number(year),
    incomplete: Number(year) === 2026,
    totalRecords: screen.annualCoverage[year]?.records || 0,
    recordsWithAbstract: screen.annualCoverage[year]?.recordsWithAbstract || 0,
    inventoryScopeRecords: trends[year]?.["Inventory scope"] || 0,
    values: Object.fromEntries(Object.entries(labels).map(([key, label]) => [label, trends[year]?.[key] || 0]))
  })),
  inventoryPattern: screen.inventoryPattern,
  categoryPatterns: Object.fromEntries(Object.entries(labels).map(([key, label]) => [label, screen.categoryPatterns[key]])),
  categoriesOverlap: true,
  note: "Counts use titles, available abstracts, and OpenAlex keywords. The broad discovery screen differs from the WoS screen and should not be pooled with it. Topic categories overlap. Abstract availability and database coverage vary by year. The 2026 column is an incomplete indexing-year snapshot and can include papers assigned to later 2026 issues; it is not a full-year total or a forecast. Keyword hits and open-language candidates do not establish that a problem remains open."
};
if (payload.journalScope.some((journal) => !journal)) throw new Error("Missing journal name in source manifest");
await writeFile(path.join(siteRoot, "data", "openalex-trends.json"), JSON.stringify(payload, null, 2) + "\n");
console.log(`Published aggregate input: ${payload.totalRecords} records, ${payload.years.length} annual rows.`);
