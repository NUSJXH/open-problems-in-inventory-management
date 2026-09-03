"""Build aggregate inventory-topic counts from a Web of Science Excel export.

The script writes aggregate statistics only. It does not redistribute titles,
abstracts, author information, or other row-level licensed data.
"""

from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import pandas as pd


TEXT_FIELDS = ["Article Title", "Abstract", "Author Keywords", "Keywords Plus"]
YEAR_FIELD = "Publication Year"
ID_FIELD = "UT (Unique WOS ID)"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path, help="Web of Science .xlsx export")
    parser.add_argument("output", type=Path, help="Destination aggregate .json file")
    return parser.parse_args()


def contains(text: pd.Series, pattern: str) -> pd.Series:
    return text.str.contains(pattern, case=False, regex=True, na=False)


def main() -> None:
    args = parse_args()
    frame = pd.read_excel(args.input, sheet_name=0)
    required = [*TEXT_FIELDS, YEAR_FIELD, ID_FIELD, "Source Title", "Cited References", "Date of Export"]
    missing = [field for field in required if field not in frame.columns]
    if missing:
        raise ValueError(f"Missing required fields: {', '.join(missing)}")

    if frame[ID_FIELD].isna().any():
        raise ValueError("Every record must have a Web of Science accession number.")
    frame = frame.drop_duplicates(subset=[ID_FIELD], keep="first").copy()
    frame[YEAR_FIELD] = pd.to_numeric(frame[YEAR_FIELD], errors="coerce").astype("Int64")

    text = frame[TEXT_FIELDS[0]].fillna("").astype(str)
    for field in TEXT_FIELDS[1:]:
        text = text.str.cat(frame[field].fillna("").astype(str), sep=" ")
    text = text.str.lower().str.replace(r"\s+", " ", regex=True)

    inventory_scope = contains(
        text,
        r"\binventor(?:y|ies)\b|\bstockout(?:s)?\b|\blost[- ]sales\b|"
        r"\breplenish(?:ment|ing|ed)?\b|\bnewsvendor\b|\bbase[- ]stock\b|"
        r"\border[- ]up[- ]to\b|\bsafety stock\b",
    )
    categories = {
        "Lost sales": contains(text, r"\blost[- ]sales\b|\blost sale\b"),
        "Data-driven inventory": inventory_scope
        & contains(text, r"\bdata[- ]driven\b|\boffline learning\b|\bmachine learning\b|\blearning\b"),
        "Nonstationarity": inventory_scope
        & contains(text, r"\bnon[- ]?stationar\w*\b|\bdemand drift\b|\bregime change\b|\bstructural break\b"),
        "Censored demand": inventory_scope
        & contains(text, r"\bcensor(?:ed|ing) demand\b|\bsales censor(?:ing|ed)\b|\bcensored sales\b"),
        "Perishability": inventory_scope
        & contains(text, r"\bperishab\w*\b|\bshelf li(?:fe|ves)\b|\boutdat(?:e|ed|ing)\w*\b"),
        "Supply uncertainty": inventory_scope
        & contains(
            text,
            r"\bsupply disruption\w*\b|\bsupply uncertaint\w*\b|\brandom yield\w*\b|"
            r"\byield uncertaint\w*\b|\brandom suppl(?:y|ies)\b|\bstochastic suppl(?:y|ies)\b",
        ),
    }

    years = sorted(int(year) for year in frame[YEAR_FIELD].dropna().unique())
    series = []
    for category, mask in categories.items():
        values = {
            str(year): int((frame[YEAR_FIELD].eq(year) & mask).sum())
            for year in years
        }
        series.append({"category": category, "values": values})

    export_dates = sorted(str(value) for value in frame["Date of Export"].dropna().unique())
    payload = {
        "database": "Web of Science Core Collection",
        "sourceFile": args.input.name,
        "sourceSha256": hashlib.sha256(args.input.read_bytes()).hexdigest().upper(),
        "exportDates": export_dates,
        "timespan": [min(years), max(years)],
        "deduplication": "Web of Science accession number",
        "totalRecords": int(len(frame)),
        "inventoryScopeRecords": int(inventory_scope.sum()),
        "citedReferencesNonempty": int(
            frame["Cited References"].fillna("").astype(str).str.strip().ne("").sum()
        ),
        "series": series,
        "notes": [
            "Counts are discovery statistics, not counts of open problems.",
            "Categories overlap and must not be added.",
            "Full-text and forward-status verification is required before an open-problem record is published.",
        ],
    }

    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
