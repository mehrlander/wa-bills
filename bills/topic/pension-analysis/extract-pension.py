#!/usr/bin/env python3
"""Extract RCW cites from all XML bill texts, classify pension bills.

Python port of rcw/pension-rcw.js classifyPensionBill. Emits
pension-sweep.json: one record per (biennium, bill) that touches
pension RCWs, with cites, labels, title, and the path of the longest
version file (proxy for latest) for downstream summarization.
"""
import json, re, sys
from pathlib import Path
from collections import defaultdict

TEXTS = Path('/home/user/wa-bills/bills/texts')
OUT = Path(sys.argv[1] if len(sys.argv) > 1 else 'pension-sweep.json')

SYSTEMS = {
    "JRS":   {"ch": "2.10"},
    "JRF":   {"ch": "2.12"},
    "JRA":   {"ch": "2.14"},
    "LEOFF": {"ch": "41.26", "plans": {"1": (40, 160), "2": (400, 560)}},
    "TRS":   {"ch": "41.32", "plans": {"1": (240, 530), "2": (700, 830), "3": (831, 920)}},
    "SERS":  {"ch": "41.35", "plans": {"2": (30, 299), "3": (500, 650)}},
    "PSERS": {"ch": "41.37"},
    "PERS":  {"ch": "41.40", "plans": {"1": (120, 370), "2": (600, 780), "3": (780, 920)}},
    "WSPRS": {"ch": "43.43", "rcws": (120, 320), "plans": {"1": (120, 200), "2": (200, 320)}},
}
GENERAL = {"41.34": "Plan 3 DC", "41.45": "Funding", "41.50": "DRS", "41.54": "Portability"}
GOVERNANCE = {"41.04": {"label": "SCPP", "rcws": [276, 278, 281]}, "43.33A": "WSIB", "44.44": "OSA / SCPP"}
ADJACENT = {"6.15": "Exempt", "26.16": "Marital", "26.18": "Support", "41.28": "Local fire",
            "41.44": "Local city", "51.08": "L&I defs", "51.32": "L&I ben", "74.20A": "DCS"}
SPECIAL = {"41.40.124": "Judicial Multiplier", "41.40.761": "Judicial Multiplier P2",
           "41.45.0631": "WSPRS Rates", "41.50.770": "DCP", "41.50.780": "DCP Accounts",
           "41.26.130": "Disability Offset", "41.26.470": "Disability Offset",
           "41.37.230": "Disability Offset", "41.40.038": "L&I Service Credit",
           "41.37.060": "L&I Service Credit", "41.26.473": "L&I Service Credit",
           "41.26.048": "Line of Duty Death"}

def secint(sec):
    try: return int(sec)
    except (TypeError, ValueError): return None

def classify(cites):
    pension, adjacent, rcws_p, rcws_a = [], [], [], []
    for cite in cites:
        parts = cite.split('.')
        ch = '.'.join(parts[:2])
        sec = parts[2] if len(parts) > 2 else None
        full = cite
        si = secint(sec)
        if full in SPECIAL:
            pension.append({"label": SPECIAL[full]}); rcws_p.append(cite)
        for sysname, d in SYSTEMS.items():
            if d["ch"] != ch: continue
            r = d.get("rcws")
            if r and (si is None or not (r[0] <= si <= r[1])): continue
            plan = None
            if si is not None and "plans" in d:
                for p, (lo, hi) in d["plans"].items():
                    if lo <= si <= hi: plan = p; break
            pension.append({"sys": sysname, "plan": plan}); rcws_p.append(cite)
        if ch in GENERAL:
            pension.append({"label": GENERAL[ch]}); rcws_p.append(cite)
        if ch in GOVERNANCE:
            g = GOVERNANCE[ch]
            if isinstance(g, str):
                pension.append({"label": g}); rcws_p.append(cite)
            elif si is not None and si in g["rcws"]:
                pension.append({"label": g["label"]}); rcws_p.append(cite)
        if ch in ADJACENT:
            adjacent.append(ADJACENT[ch]); rcws_a.append(cite)
    sys_store, other = defaultdict(set), []
    for m in pension:
        if m.get("sys"):
            if m.get("plan"): sys_store[m["sys"]].add(m["plan"])
            else: sys_store.setdefault(m["sys"], set())
        else: other.append(m["label"])
    labels = [f"{s} {'/'.join(sorted(ps))}" if ps else s for s, ps in sys_store.items()] + other
    return {
        "PensionLabels": sorted(set(labels)),
        "PensionRcws": sorted(set(rcws_p)),
        "AdjacentLabels": sorted(set(adjacent)),
        "AdjacentRcws": sorted(set(rcws_a)),
        "hasPension": bool(pension),
        "hasAdjacent": bool(adjacent),
    }

CITE_RX = re.compile(
    r'<TitleNumber>([0-9]+[A-Za-z]?)</TitleNumber>.{0,40}?'
    r'<ChapterNumber>([0-9]+[A-Za-z]?)</ChapterNumber>.{0,40}?'
    r'<SectionNumber>([0-9]+[A-Za-z]?)</SectionNumber>', re.S)
# new schema, chapter-only ("added to chapter 41.40 RCW"): pair not followed by a section
CHAP_RX = re.compile(
    r'<TitleNumber>([0-9]+[A-Za-z]?)</TitleNumber>.{0,40}?'
    r'<ChapterNumber>([0-9]+[A-Za-z]?)</ChapterNumber>(?!.{0,40}?<SectionNumber>)', re.S)
# old schema (pre-2015): RCW <Cite>41.40.180</Cite> inside amend headers / repeal sections
OLD_AMEND_RX = re.compile(r'<BegSecAmd.*?</BegSecAmd>', re.S)
OLD_REPEAL_RX = re.compile(r'<BillSection type="repeal[^"]*".*?</BillSection>', re.S)
OLD_CITE_RX = re.compile(r'<Cite>([0-9]+[A-Za-z]?)\.([0-9]+[A-Za-z]?)\.([0-9]+[A-Za-z]?)')
OLD_CHAP_RX = re.compile(r'chapter\s*<Cite>([0-9]+[A-Za-z]?)\.([0-9]+[A-Za-z]?)</Cite>\s*RCW')

def extract_cites(text):
    cites = {f"{m.group(1)}.{m.group(2)}.{m.group(3)}" for m in CITE_RX.finditer(text)}
    chaps = {f"{m.group(1)}.{m.group(2)}" for m in CHAP_RX.finditer(text)}
    for block_rx in (OLD_AMEND_RX, OLD_REPEAL_RX):
        for block in block_rx.finditer(text):
            cites |= {f"{m.group(1)}.{m.group(2)}.{m.group(3)}"
                      for m in OLD_CITE_RX.finditer(block.group(0))}
    chaps |= {f"{m.group(1)}.{m.group(2)}" for m in OLD_CHAP_RX.finditer(text)}
    # drop chapter-only cites already covered by a full cite in the same bill
    prefixes = {'.'.join(c.split('.')[:2]) for c in cites}
    return cites | {ch for ch in chaps if ch not in prefixes}
DESC_RX = re.compile(r'<BriefDescription>(.*?)</BriefDescription>', re.S)
ID_RX = re.compile(r'<ShortBillId>(.*?)</ShortBillId>', re.S)

bills = {}
nfiles = 0
for bdir in sorted(TEXTS.iterdir()):
    xml = bdir / 'Xml'
    if not xml.is_dir(): continue
    for chamber in ('House', 'Senate'):
        d = xml / chamber
        if not d.is_dir(): continue
        for f in d.glob('*.xml'):
            nfiles += 1
            num = re.match(r'(\d+)', f.name).group(1)
            key = (bdir.name, chamber, num)
            try:
                text = f.read_text(errors='replace')
            except OSError:
                continue
            cites = extract_cites(text)
            rec = bills.setdefault(key, {"cites": set(), "file": None, "flen": -1,
                                         "desc": "", "shortId": ""})
            rec["cites"] |= cites
            if len(f.name) > rec["flen"]:
                rec["flen"] = len(f.name); rec["file"] = str(f)
                dm, im = DESC_RX.search(text), ID_RX.search(text)
                if dm: rec["desc"] = re.sub(r'<[^>]+>', '', dm.group(1)).strip()
                if im: rec["shortId"] = re.sub(r'<[^>]+>', '', im.group(1)).strip()

out = []
for (b, chamber, num), rec in sorted(bills.items()):
    c = classify(sorted(rec["cites"]))
    if not (c["hasPension"] or c["hasAdjacent"]): continue
    out.append({"biennium": b, "chamber": chamber, "billNumber": num,
                "shortId": rec["shortId"], "brief": rec["desc"],
                "file": rec["file"], **c})

json.dump(out, open(OUT, 'w'), indent=1)
np = sum(1 for r in out if r["hasPension"])
na = sum(1 for r in out if r["hasAdjacent"] and not r["hasPension"])
per_b = defaultdict(lambda: [0, 0])
for r in out:
    per_b[r["biennium"]][0 if r["hasPension"] else 1] += 1
print(f"xml files scanned: {nfiles}; distinct bills: {len(bills)}")
print(f"pension bills: {np}; adjacent-only: {na}")
for b in sorted(per_b): print(f"  {b}: pension {per_b[b][0]}, adjacent-only {per_b[b][1]}")
