# Open Problems in Inventory Management — website prototype

This folder is a standalone, static website designed for GitHub Pages. It intentionally does not require a database, a backend, or a JavaScript build step.

Live URL after Pages is enabled: https://nusjxh.github.io/open-problems-in-inventory-management/

## What is included

- A searchable and filterable registry of 31 audited records.
- Four public tracks: formal candidates, research agendas, candidate incubation, and resolved archive.
- Evidence, status, confidence, audit-date, and verification-stage badges.
- EX, SV, LA, and EV are emitted as four separate workflow fields while the workbook's original composite label is retained for provenance.
- A detail page for every record.
- A methodology page explaining the two-gate boundary test and verification protocol.
- Explicit warnings that no active record is expert-verified yet.
- An original social-preview image at `assets/open-graph.png`.
- A public contribution workflow through GitHub Issues.

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

## Refresh the data

The prototype data was generated from the workbook audit through `scripts/build-data.mjs`. Re-run the script after the workbook extraction is refreshed:

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

## Before public launch

- Replace the prototype maintainer/footer text with the project team and a public contact route.
- Decide the content and code license.
- Finish exact source-quote and page-location fields for every Type A candidate.
- Resolve the IM-029 reclassification flag.
- Replace composite workflow text such as `SV-LA (provisional)` with separate verification-step fields.
- Add a public correction/submission workflow, preferably GitHub Issues for the first release.
