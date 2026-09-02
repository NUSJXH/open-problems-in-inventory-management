# Open Problems in Inventory Management

This repository hosts a source-led, English-language inventory-management research registry on GitHub Pages:

https://nusjxh.github.io/open-problems-in-inventory-management/

## Public editorial rule

The paper list contains only:

- explicit conjectures;
- explicit open questions;
- limitations or extensions stated by the source authors; and
- status updates that retire or narrow earlier open labels.

The site does not publish editor-created research ideas as open problems. Each record reports what the source states, what it establishes, and the scope boundary that should be preserved.

## Current release

- Four source-stated items.
- Three status updates.
- A nine-paper descriptive path from offline sample-based inventory to capped base-stock learning and nonstationary lost-sales control.
- A reproducible Web of Science query and classification protocol. Bibliometric counts are withheld until a Core Collection export is archived.
- A light, list-based interface inspired by research bibliography sites rather than the visual identity of Open Problems in OR.

## Maintainers

- Xianghua Jiang — xianghuaj@u.nus.edu
- Xiting Gong — xtgong@cuhk.edu.hk

Corrections should be submitted through the repository's public issue tracker with the primary-source link and the relevant page or section.

## Local preview

Run a static server from the repository root:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

## Validate the public data

```powershell
node scripts/validate-data.mjs
```

The validator checks required fields, duplicate record IDs, HTTPS source links, and the English-only public-data rule.

## Web of Science import

The methodology page specifies the fields and topic queries required for a reproducible trend analysis. Do not publish hand-entered counts. Archive the export date, collection, timespan, document types, query strings, and deduplication rule with every update.

## License

Website code is available under the MIT License. Original editorial text and the curated dataset are available under CC BY 4.0. Third-party article titles, citations, and links remain subject to their respective rights.
