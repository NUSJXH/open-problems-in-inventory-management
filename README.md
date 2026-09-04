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

- Version 3.0.0 uses three primary pages: **Problems**, **Research Trends**, and **About**. The homepage supports keyword, topic, progress, and record-type filters, with expandable source evidence and chronological literature paths. Methods and collection coverage accompany the trends rather than occupying a separate primary page.
- The catalogue presents 13 records: seven with status review pending, two with partial resolution reported, and four with resolution reported in the stated scope. These are descriptive progress labels, not 13 certified open problems. One of the six underlying status updates is integrated into its corresponding question rather than listed twice.
- A supplementary coauthor view on About uses five selected papers, 15 author identities, and 18 shared-byline edges. ORCID identifies cross-paper matches; names without ORCID remain paper-specific. This illustration is not a field-wide collaboration network.
- Eight source-stated items, including the explicitly stated joint-growth PIL question in Moradi, Arts, and Drent (2025, arXiv v4). Its forward-citation audit remains incomplete.
- Six status updates.
- A fourteen-paper descriptive path covering offline sample-based inventory, fixed-cost and capped base-stock learning, nonstationary control, PIL, and the 2026 version of Xie, Ma, and Xin's VC analysis. Nonstationarity within an offline demand trajectory is distinguished from online adaptation and distribution shift.
- Separate acquisition bars for eight overlapping WoS search sets: 6,328 distinct records, including 6,016 outside the six-journal snapshot. Seven query sets are complete; perishability remains partial at 1,999 distinct records out of 3,911 reported results. Exact query definitions and limitations accompany the chart.
- An eight-anchor forward-citation chart with 142 distinct citing records and 224 DOI-matched links, including self-citations. Counts describe the archived set, not live citation totals or resolution of an open question. Preprint-specific citation audits remain incomplete.
- Interactive annual and small-multiple line charts, a topic heatmap, and accessible count tables. Source, year range, and count/share controls use locally hosted SVG and aggregate JSON. The 2026 incomplete year is excluded by default and dashed when included.
- Reproducible, overlapping keyword-screening counts from 16,819 Web of Science Core Collection records across six journals and 2000–2026. The screen finds 2,407 inventory matches. Licensed row-level exports remain local. The six-journal archive has 537 record-level reference-count discrepancies; the separate supplementary archive has 42. The bounded anchor-citation analysis does not assert a complete citation network.
- A separate, downloadable OpenAlex historical table covering 20,854 records from the same six journals over 2000–2026, with 27 annual rows and explicit incomplete-year labeling. Its 2,174 broad inventory-scope records and 59 open-language candidates are discovery inputs rather than open-problem counts. Its broader definitions are not pooled with the WoS series.
- The older 6,105-record, 2021–2025 aggregate is retained as a separate snapshot. Accession-number reconciliation finds 5,567 common five-year records, 532 old-cohort records now assigned to 2026, six absent from the new archive, and 142 new-cohort additions. The snapshots are not spliced.
- A public discovery supplement archives 14,824 distinct OpenAlex records from ten completed queries, with 6,925 local inventory keyword matches. Five topic and eight anchor-citation queries remain incomplete after provider backoff. The supplement is not merged into the six-journal trend denominator.
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
node --test scripts/test-trends.mjs scripts/test-evidence.mjs scripts/test-catalogue.mjs
```

The validators check source fields, English-only public files, count identities, share denominators, incomplete-year behavior, chart controls, and local links. They do not substitute for browser visual review or a scholarly proof audit.

## Web of Science import

The expandable methods section on Research Trends records fields, topic definitions, journal scope, export dates, source checksums, cohort reconciliation, and chart denominators. Do not interpret keyword-screening counts as counts of open problems. Previously shared methodology and problem URLs redirect to their corresponding sections.

The current long-run aggregate is built by `source_data/wos/build_verified_trends.py` in the private parent workspace. It verifies the native release checksums and writes aggregate JSON only to this repository. The licensed inputs are deliberately not vendored here.

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
