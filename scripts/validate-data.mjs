import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const registryPath = path.join(rootDir, "data", "registry.json");
const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));

const requiredTopLevel = ["schemaVersion", "dataVersion", "auditThrough", "openItems", "statusUpdates", "literaturePath", "bibliometrics"];
for (const field of requiredTopLevel) {
  if (!(field in registry)) throw new Error(`Missing top-level field: ${field}`);
}

const ids = new Set();
for (const item of registry.openItems) {
  for (const field of ["id", "evidenceClass", "topic", "title", "statement", "paperEstablishes", "scopeBoundary", "source"]) {
    if (!item[field]) throw new Error(`${item.id || "Unknown item"} is missing ${field}`);
  }
  if (ids.has(item.id)) throw new Error(`Duplicate record ID: ${item.id}`);
  ids.add(item.id);
  for (const field of ["authors", "year", "title", "outlet", "location", "url"]) {
    if (!item.source[field]) throw new Error(`${item.id} source is missing ${field}`);
  }
}

const serialized = JSON.stringify(registry);
if (/\p{Script=Han}/u.test(serialized)) throw new Error("The public registry contains Han characters.");

for (const [index, item] of registry.statusUpdates.entries()) {
  for (const field of ["status", "topic", "title", "summary", "citation", "url"]) {
    if (!item[field]) throw new Error(`Status update ${index + 1} is missing ${field}`);
  }
}

for (const [index, item] of registry.literaturePath.entries()) {
  for (const field of ["year", "dataRegime", "policyBenchmark", "paper", "result", "boundary", "url"]) {
    if (!item[field]) throw new Error(`Literature-path entry ${index + 1} is missing ${field}`);
  }
}

const bibliometrics = registry.bibliometrics;
for (const field of ["database", "exportDate", "timespan", "journalScope", "totalRecords", "inventoryScopeRecords", "series", "note"]) {
  if (bibliometrics[field] === undefined || bibliometrics[field] === "") throw new Error(`Bibliometrics is missing ${field}`);
}
if (!Array.isArray(bibliometrics.series) || bibliometrics.series.length === 0) {
  throw new Error("Bibliometrics series must be a nonempty array.");
}
const trendYears = ["2021", "2022", "2023", "2024", "2025"];
for (const series of bibliometrics.series) {
  if (!series.category || !series.values) throw new Error("A bibliometric series is missing its category or values.");
  for (const year of trendYears) {
    if (!Number.isInteger(series.values[year]) || series.values[year] < 0) {
      throw new Error(`Invalid bibliometric count for ${series.category}, ${year}.`);
    }
  }
}
if (bibliometrics.inventoryScopeRecords > bibliometrics.totalRecords) {
  throw new Error("Inventory-scope records cannot exceed total records.");
}

const publicTrends = JSON.parse(await fs.readFile(path.join(rootDir, "data", "openalex-trends.json"), "utf8"));
if (/\p{Script=Han}/u.test(JSON.stringify(publicTrends))) throw new Error("Public trend data contain Han characters.");
if (publicTrends.years.length !== 27 || publicTrends.incompleteYear !== 2026) throw new Error("Unexpected historical coverage.");
let allCount = 0;
let inventoryCount = 0;
let abstractCount = 0;
for (const [index, row] of publicTrends.years.entries()) {
  if (row.year !== 2000 + index) throw new Error("Historical years must be contiguous and ordered.");
  if (row.incomplete !== (row.year === 2026)) throw new Error("The 2026 row must be marked incomplete.");
  for (const count of [row.totalRecords, row.inventoryScopeRecords, row.recordsWithAbstract, ...Object.values(row.values)]) {
    if (!Number.isInteger(count) || count < 0) throw new Error("Invalid historical count.");
  }
  if (row.inventoryScopeRecords > row.totalRecords || row.recordsWithAbstract > row.totalRecords) throw new Error("Historical subset exceeds its denominator.");
  for (const category of publicTrends.categories) {
    if (row.values[category] === undefined || row.values[category] > row.inventoryScopeRecords) throw new Error(`Invalid count for ${category}.`);
  }
  allCount += row.totalRecords;
  inventoryCount += row.inventoryScopeRecords;
  abstractCount += row.recordsWithAbstract;
}
if (allCount !== publicTrends.totalRecords || inventoryCount !== publicTrends.inventoryScopeRecords || abstractCount !== publicTrends.recordsWithAbstract) throw new Error("Historical annual sums do not match the source totals.");

const urls = [];
for (const item of registry.openItems) urls.push(item.source.url);
for (const item of registry.statusUpdates) urls.push(item.url);
for (const item of registry.literaturePath) urls.push(item.url);
for (const url of urls) {
  if (!/^https:\/\//.test(url)) throw new Error(`Non-HTTPS source URL: ${url}`);
}

console.log(`Validated ${registry.openItems.length} source-stated items, ${registry.statusUpdates.length} status updates, ${registry.literaturePath.length} literature-path entries, and ${registry.bibliometrics.series.length} bibliometric series.`);
console.log(`Validated ${publicTrends.years.length} OpenAlex annual rows covering ${allCount} source records.`);
