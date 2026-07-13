#!/usr/bin/env python3
"""Spike steps 4-6: add one manual annotation, then edit the Markdown and test
whether annotations relocate via their TextQuoteSelectors."""
import json, re, sys, os

d = sys.argv[1] if len(sys.argv) > 1 else "1003-S"
md = open(os.path.join(d, "bill.md")).read()
ann = json.load(open(os.path.join(d, "annotations.json")))

# ---- one manual annotation: classify the tuition-fee provision ----
probe = "The maximum per college credit tuition fee"
pos = md.find(probe)
if pos > 0 and not any(a["id"] == "manual-1" for a in ann["items"]):
    ann["items"].append({
        "id": "manual-1",
        "motivation": "classifying",
        "body": {"type": "policy-topic", "value": "dual-credit tuition subsidy",
                 "note": "manual example annotation per spike step 4"},
        "target": {"source": "bill.md", "selector": [
            {"type": "TextPositionSelector", "start": pos, "end": pos + len(probe)},
            {"type": "TextQuoteSelector", "exact": probe,
             "prefix": md[max(0, pos-32):pos], "suffix": md[pos+len(probe):pos+len(probe)+32]},
            {"type": "SectionSelector", "section": 5, "markers": "(b)(i)"}]},
        "creator": "manual"})
    json.dump(ann, open(os.path.join(d, "annotations.json"), "w"), indent=1)

# ---- simulate an edit: insert a paragraph after the enacting clause ----
anchor = "BE IT ENACTED BY THE LEGISLATURE OF THE STATE OF WASHINGTON:"
edited = md.replace(anchor, anchor + "\n\n<!-- editorial note inserted to test annotation relocation -->", 1)
shift_from = md.find(anchor) + len(anchor)

def section_span(newdoc, n):
    """Locate section n in the edited doc by its heading line."""
    heads = [(m.start(), m.group(0)) for m in
             re.finditer(r'^## .*$', newdoc, re.M)]
    for i, (pos, line) in enumerate(heads):
        if re.search(r'\bSec\.\s*' + str(n) + r'\b', line):
            end = heads[i+1][0] if i+1 < len(heads) else len(newdoc)
            return pos, end
    return None

def relocate(item, newdoc):
    """Selector cascade: position if still valid, then quote (context-scored),
    then section-scoped quote, then section span alone for structural targets."""
    sels = item["target"]["selector"]
    quote = next((s for s in sels if s["type"] == "TextQuoteSelector"), None)
    posl = next((s for s in sels if s["type"] == "TextPositionSelector"), None)
    sect = next((s for s in sels if s["type"] == "SectionSelector"), None)

    def try_quote(lo=0, hi=None):
        hi = hi if hi is not None else len(newdoc)
        cands = [m.start() for m in re.finditer(re.escape(quote["exact"]), newdoc)
                 if lo <= m.start() < hi]
        if not cands: return None, "exact-not-found"
        if len(cands) == 1: return cands[0], "unique-exact"
        scored = []
        for c in cands:
            score = 0
            if newdoc[max(0, c-len(quote.get("prefix",""))):c] == quote.get("prefix"): score += 1
            e = c + len(quote["exact"])
            if newdoc[e:e+len(quote.get("suffix",""))] == quote.get("suffix"): score += 1
            scored.append((score, c))
        scored.sort(key=lambda x: (-x[0], x[1]))
        if scored[0][0] > 0 and (len(scored) == 1 or scored[0][0] > scored[1][0]):
            return scored[0][1], "context-disambiguated"
        return None, f"ambiguous({len(cands)})"

    if quote:
        if posl and newdoc[posl["start"]:posl["end"]] == quote["exact"]:
            return posl["start"], "position-still-valid"
        pos, how = try_quote()
        if pos is not None: return pos, how
        if sect:
            span = section_span(newdoc, sect["section"])
            if span:
                pos, how2 = try_quote(*span)
                if pos is not None: return pos, "section-scoped-" + how2
        return None, how
    if sect:
        span = section_span(newdoc, sect["section"])
        if span: return span[0], "section-selector"
        return None, "section-not-found"
    return None, "no-usable-selector"

results = {}
fails = []
moved = same = 0
for item in ann["items"]:
    posl = next((s for s in item["target"]["selector"] if s["type"] == "TextPositionSelector"), None)
    new, how = relocate(item, edited)
    results[how] = results.get(how, 0) + 1
    if new is None:
        fails.append(item["id"])
    elif posl:
        if new != posl["start"]: moved += 1
        else: same += 1

n = len(ann["items"])
print(f"{d}: {n} annotations; edit inserted at offset {shift_from}")
for how, c in sorted(results.items(), key=lambda x: -x[1]): print(f"  {how}: {c}")
print(f"  relocated with new offset: {moved}; unaffected (before edit point): {same}")
print(f"  FAILED: {len(fails)} {fails[:8]}")
