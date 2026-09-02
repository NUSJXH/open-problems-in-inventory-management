import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(scriptDir, "..");
const registryPath = path.join(rootDir, "data", "registry.json");
const registry = JSON.parse(await fs.readFile(registryPath, "utf8"));

const requiredTopLevel = ["schemaVersion", "dataVersion", "auditThrough", "openItems", "statusUpdates", "literaturePath"];
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

const urls = [];
for (const item of registry.openItems) urls.push(item.source.url);
for (const item of registry.statusUpdates) urls.push(item.url);
for (const item of registry.literaturePath) urls.push(item.url);
for (const url of urls) {
  if (!/^https:\/\//.test(url)) throw new Error(`Non-HTTPS source URL: ${url}`);
}

console.log(`Validated ${registry.openItems.length} source-stated items, ${registry.statusUpdates.length} status updates, and ${registry.literaturePath.length} literature-path entries.`);
