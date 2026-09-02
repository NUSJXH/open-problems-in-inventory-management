# Open Problems in Inventory Management

This folder is a standalone, static website designed for GitHub Pages. It intentionally does not require a database, a backend, or a JavaScript build step.

Live URL after Pages is enabled: https://nusjxh.github.io/open-problems-in-inventory-management/

## What is included

- A searchable and filterable registry of 35 audited records.
- Four public tracks: formal candidates, research agendas, candidate incubation, and resolved archive.
- Evidence, status, confidence, audit-date, and verification-stage badges.
- EX, SV, LA, and EV are emitted as four separate workflow fields while the workbook's original composite label is retained for provenance.
- A detail page for every record.
- A methodology page explaining the two-gate boundary test and verification protocol.
- Explicit warnings that no active record is expert-verified yet.
- An original social-preview image at `assets/open-graph.png`.
- A public contribution workflow through GitHub Issues.
- An English-only public dataset and interface.
- A documented comparison with Open Problems in OR and a targeted 2024-2026 UTD-journal update.

## Maintainers

- Xianghua Jiang — xianghuaj@u.nus.edu
- Xiting Gong — xtgong@cuhk.edu.hk

For corrections and candidate submissions, use the repository's Issues page so that the editorial record remains public and versioned.

## Local preview

From this folder, run a static web server. For example:

```powershell
python -m http.server 8000
```

Then open `http://localhost:8000/`.

Opening `index.html` directly from the file system will not load the JSON data because browsers block that cross-file request.

## Curate the data

Public copy is maintained in an explicit English editorial layer. After revising that layer, rebuild the versioned JSON with:

```powershell
node scripts/build-data.mjs
```

## Publish on GitHub Pages

1. Create a new public GitHub repository, for example `open-problems-in-inventory-management`.
2. Make this folder the repository root and push it to the `main` branch.
3. In the repository, open **Settings → Pages**.
4. Under **Build and deployment**, choose **Deploy from a branch**.
5. Select `main` and `/ (root)`, then save.
6. The site will appear at `https://<github-username>.github.io/open-problems-in-inventory-management/`.

No GitHub password, personal access token, or API key should be placed in this folder. Authentication should happen through GitHub's normal browser or credential-manager flow.

## License

Website code is available under the MIT License. Original editorial text and the curated dataset are available under CC BY 4.0. Third-party article titles, citations, quotations, and links remain subject to their respective rights.

## Editorial priorities

- Finish exact source-quote and page-location fields for every Type A candidate.
- Complete conflict-free expert review for active records.
- Maintain assumption-level mappings when a later paper may resolve an earlier problem.
- Preserve EX, SV, LA, and EV as separate workflow fields.

