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

- Seven source-stated items.
- Six status updates.
- A twelve-paper descriptive path from offline sample-based inventory to fixed-cost learning, capped base-stock learning, nonstationary lost-sales control, and projected-inventory-level policies for perishable systems.
- Reproducible, overlapping keyword-screening counts from 6,105 Web of Science Core Collection records across six journals and 2021–2025. The licensed export is summarized rather than redistributed; its cited-reference field is empty, so the release does not claim a citation-network analysis.
- A separate, downloadable OpenAlex historical table covering 20,854 records from the same six journals over 2000–2026, with 27 annual rows and explicit incomplete-year labeling. Its 2,174 broad inventory-scope records and 59 open-language candidates are discovery inputs rather than open-problem counts. Its broader definitions are not pooled with the WoS series.
- A long-run licensed WoS acquisition has archived 5,000 of 16,819 query results locally. This incomplete relevance-ordered prefix is not used for trend or citation-network claims.
- A complete audit of the 159-record Open Problems in OR snapshot. The specified filtered page contains no inventory-management record; its one inventory-adjacent reusable-resource item is recorded as resolved in a subsequent working paper rather than copied into the active list.
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

The methodology page records the fields, topic definitions, journal scope, export date, workbook checksum, and classification rules used for the trend table. Do not interpret the keyword-screening counts as counts of open problems.

To reproduce the aggregate table from an authorized export:

```powershell
python scripts/build-wos-trends.py path\to\wos-export.xlsx path\to\aggregate-output.json
```

The script requires `pandas` and `openpyxl` and writes no row-level bibliographic data.

To rebuild the public historical aggregate from the separately archived OpenAlex snapshot:

```powershell
node scripts/build-openalex-trends.mjs path\to\core6_2000_2026
```

The input directory must contain `manifest.json` and the reproducible `derived/screen_manifest.json` and `derived/topic_trends_2000_2026.json` outputs. The public JSON retains exact screening patterns and annual metadata-coverage counts, but no article-level records.

## License

Website code is available under the MIT License. Original editorial text and the curated dataset are available under CC BY 4.0. Third-party article titles, citations, and links remain subject to their respective rights.
