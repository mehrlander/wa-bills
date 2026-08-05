#!/usr/bin/env python3
"""Extract each bill's declared metadata and the citations in its body.

Why this and not a model. A 150-bill probe (recorded in web-tools
`tools/concept-lab/findings.md`, 2026-08-04) measured the alternative: a named
entity recognizer over bill body text returns 767 organization names of which
2% are confirmable against the state's own agency tables, headed by `RCW`,
`Sec`, and `SHB`, which are citation machinery rather than organizations. That
is roughly fourteen hours of model time across this corpus for a worse answer.

Two things carry essentially all of the value at a tiny fraction of the cost:

  declared   the bill XML already tags what it is. <BillNumber>, <Sponsors>
             (including "by request of Department of Agriculture"), <Session>,
             and <Legislature> are present on effectively every bill. Parsing
             beats recognizing whenever the publisher has already marked up
             the thing you want.
  cited      the body is dense with statutory references that regexes read
             exactly: the same 150 bills yielded 3,865 RCW citations, 2,715
             session laws, and 879 bill references.

The citations are the point. An RCW chapter cited here and also named in
budget-wa, fn-data, and home is a join across repos that nothing in the estate
can currently make.

Output is one JSON Lines file per biennium, sharded at the source's own grain
so a re-extraction of one session rewrites one file. Plus `citation-index.json`,
the small distilled aggregate: which bills cite each RCW chapter.

    python3 tools/extract-citations.py                 # every biennium
    python3 tools/extract-citations.py 2023-24 2025-26 # named ones
    python3 tools/extract-citations.py --out-dir bills/index/citations
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEXTS = ROOT / "bills" / "texts"

# The citation patterns. These mirror web-tools `tools/concept-lab/entitylab.py`
# PATTERNS, and are restated here rather than imported: a build tool that needs
# a sibling checkout (or the network) to run is a build tool that stops working.
# Six regexes are a tolerable duplication where a whole script would not be; if
# they ever disagree, that file is the origin.
RCW = re.compile(r"\b(?:chapter\s+)?RCW\s+(\d+[A-Z]?\.\d+(?:\.\d+)?)\b"
                 r"|\bchapter\s+(\d+[A-Z]?\.\d+)\s+RCW\b", re.I)
SESSION_LAW = re.compile(r"\b(\d{4})\s+c\s+(\d+)\b|\bLaws of (\d{4})\b")
BILL_REF = re.compile(r"\b((?:E?[2-9]?S?[HS]B|SHB|ESHB|ESSB|SSB|EHB)\s?\d{4})\b")

TAG = re.compile(r"<[^>]+>")
FIELD = re.compile(r"<(BillNumber|Session|Legislature|Sponsors|RequestNumber)>(.*?)</\1>",
                   re.S | re.I)


def strip_tags(raw: str) -> str:
    return re.sub(r"\s+", " ", TAG.sub(" ", raw))


def rcw_key(m: re.Match) -> str:
    return "RCW " + (m.group(1) or m.group(2)).rstrip(".")


def extract(path: Path) -> dict | None:
    try:
        raw = path.read_text(encoding="utf-8", errors="replace")
    except OSError:
        return None

    declared = {}
    for m in FIELD.finditer(raw):
        key = m.group(1)[0].lower() + m.group(1)[1:]
        value = re.sub(r"\s+", " ", strip_tags(m.group(2))).strip()
        if value and key not in declared:
            declared[key] = value

    body = strip_tags(raw)
    rcw = Counter(rcw_key(m) for m in RCW.finditer(body))
    laws = Counter(
        f"{m.group(1)} c {m.group(2)}" if m.group(1) else f"Laws of {m.group(3)}"
        for m in SESSION_LAW.finditer(body)
    )
    bills = Counter(re.sub(r"\s+", " ", m.group(1)).replace(" ", " ")
                    for m in BILL_REF.finditer(body))

    return {
        "path": str(path.relative_to(ROOT)),
        "biennium": path.relative_to(TEXTS).parts[0],
        "chamber": path.parent.name,
        **declared,
        "rcw": dict(rcw.most_common()),
        "sessionLaws": dict(laws.most_common()),
        "billRefs": dict(bills.most_common()),
    }


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("biennia", nargs="*", help="default: every biennium found")
    ap.add_argument("--out-dir", type=Path, default=ROOT / "bills" / "index" / "citations")
    a = ap.parse_args()

    biennia = a.biennia or sorted(
        p.name for p in TEXTS.iterdir() if p.is_dir() and re.fullmatch(r"\d{4}-\d{2}", p.name))
    a.out_dir.mkdir(parents=True, exist_ok=True)

    # chapter -> {bill id: mentions}. Sections roll up to their chapter, since
    # the chapter is the unit other repos actually name.
    index: dict[str, dict[str, int]] = defaultdict(dict)
    totals = Counter()

    for bien in biennia:
        files = sorted((TEXTS / bien).rglob("*.xml"))
        if not files:
            print(f"  {bien}: no xml", file=sys.stderr)
            continue
        out = a.out_dir / f"{bien}.jsonl"
        n = 0
        with out.open("w", encoding="utf-8") as fh:
            for path in files:
                rec = extract(path)
                if not rec:
                    continue
                fh.write(json.dumps(rec, separators=(",", ":")) + "\n")
                n += 1
                # A qualified key, because a bare number collides: House 1000
                # exists in every biennium. <BillNumber> is present on most but
                # not all bills (85 of 150 in the probe), so the filename stem
                # is the fallback and it is the bill number by construction.
                num = (rec.get("billNumber") or "").replace("SENATE BILL", "SB") \
                                                  .replace("HOUSE BILL", "HB").strip()
                bill = f'{rec["biennium"]} {rec["chamber"]} {num or Path(rec["path"]).stem}'
                for cite, count in rec["rcw"].items():
                    chapter = " ".join(cite.split()[:1] + [".".join(cite.split()[1].split(".")[:2])])
                    index[chapter][bill] = index[chapter].get(bill, 0) + count
                totals["rcw"] += sum(rec["rcw"].values())
                totals["sessionLaws"] += sum(rec["sessionLaws"].values())
                totals["billRefs"] += sum(rec["billRefs"].values())
        totals["bills"] += n
        print(f"  {bien}: {n} bills -> {out.relative_to(ROOT)} "
              f"({out.stat().st_size / 1048576:.1f} MB)", file=sys.stderr)

    idx_path = a.out_dir.parent / "citation-index.json"
    payload = {
        "note": "RCW chapter -> the bills citing it, counted. Sections roll up to "
                "their chapter, since the chapter is the unit other repos name. "
                "Built by tools/extract-citations.py; the per-bill shards under "
                "citations/ are gitignored, this aggregate is the committed join.",
        "biennia": biennia,
        "bills": totals["bills"],
        "citations": {k: totals[k] for k in ("rcw", "sessionLaws", "billRefs")},
        "chapters": len(index),
        # Distilled, not complete. The full chapter-to-every-bill mapping is
        # 15.8 MB, which is a bulk artifact rather than a committable one; it
        # stays in the gitignored shards and rebuilds in six minutes. What is
        # committed answers the question the estate actually asks ("which bills
        # touch RCW 41.40, and how heavily") with the ten heaviest citers and
        # the totals, at a twentieth of the size.
        "index": {
            k: {
                "bills": len(v),
                "citations": sum(v.values()),
                "topBills": dict(sorted(v.items(), key=lambda kv: -kv[1])[:10]),
            }
            for k, v in sorted(index.items(), key=lambda kv: -sum(kv[1].values()))
        },
    }
    idx_path.write_text(json.dumps(payload, indent=1), encoding="utf-8")
    print(f"\n{totals['bills']} bills, {totals['rcw']} RCW / {totals['sessionLaws']} session-law "
          f"/ {totals['billRefs']} bill citations, {len(index)} chapters",
          file=sys.stderr)
    print(f"wrote {idx_path.relative_to(ROOT)} ({idx_path.stat().st_size / 1048576:.1f} MB)",
          file=sys.stderr)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
