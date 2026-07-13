#!/usr/bin/env python3
"""Legislative Markdown spike: convert WA bill XML to redline Markdown plus a
W3C-shaped standoff annotation sidecar. Prototype per the 2026-07-13 spike report.

Two XML front-ends (the 2012 namespace schema and the older LSC DTD schema)
parse into one intermediate form; one emitter writes bill.md, recording section
offsets as it goes; the sidecar carries provenance, rule-generated RCW citation
annotations, and one manual annotation. Before/after views and a derived patch
model are generated from the Markdown.

Usage: convert.py <bill.xml> <outdir>
"""
import re, os, sys, json, html
import xml.etree.ElementTree as ET

REPO = "/home/user/wa-bills"

# ---------------- shared: RCW cite classification (from the validated extractor) ----
_idx = json.load(open(os.path.join(REPO, "rcw/rcw-full.json")))
RCW_SECTIONS = set(x["Cite"] for x in _idx if x["Type"] == "S")
RCW_CHAPTERS = set(x["Cite"] for x in _idx if x["Type"] == "C")
CITE = r'\d{1,2}[A-Za-z]?\.\d{1,3}[A-Za-z]?\.\d+[A-Za-z]?'
CITE_RE = re.compile(r'\b(' + CITE + r')\b')
_SEP = r'(?:\s*(?:,|;|and|or|through|RCW|&|\(\d+\))\s*)+'
RUN_RE = re.compile(r'\b(?:RCW|sections?)\s+(' + CITE + r'(?:' + _SEP + CITE + r')*)', re.I)

# ---------------- intermediate form ----------------
# doc = {"meta": {...}, "blocks": [block]}
# block = {"kind": "title"|"enacted"|"heading"|"caption"|"para"|"note",
#          "section": int|None, "runs": [(style, text)]}   style in "", "ins", "del", "b"

def _local(tag):
    return tag.split('}')[-1]

# ---------------- front-end: 2012 namespace schema (X2) ----------------
def parse_x2(root):
    meta, blocks = {}, []
    def runs_of(el, style=""):
        out = []
        def walk(e, st):
            t = _local(e.tag)
            s = st
            if t == "TextRun":
                a = e.get("amendingStyle", "")
                if a == "add": s = "ins"
                elif a.startswith("strike"): s = "del"
                elif e.get("fontWeight") == "bold": s = "b"
            if e.text: out.append((s, e.text))
            for c in e:
                walk(c, s)
                if c.tail: out.append((st, c.tail))
        if el.text: out.append((style, el.text))
        for c in el:
            walk(c, style)
            if c.tail: out.append((style, c.tail))
        return out

    head = root.find(".//{*}BillHeading")
    def txt(tag):
        e = head.find(".//{*}" + tag) if head is not None else None
        return re.sub(r'\s+', ' ', ''.join(e.itertext())).strip() if e is not None else None
    meta = {"id": txt("ShortBillId"), "longId": txt("LongBillId"),
            "legislature": txt("Legislature"), "session": txt("Session"),
            "sponsors": txt("Sponsors"), "brief": txt("BriefDescription"),
            "requestNumber": txt("RequestNumber"),
            "history": re.sub(r'\s+', ' ', ' '.join(
                ''.join(e.itertext()) for e in head.findall(".//{*}BillHistory/*"))).strip() or None}

    body = root.find(".//{*}BillBody")
    secno = 0
    for el in body:
        t = _local(el.tag)
        if t == "BillTitle":
            blocks.append({"kind": "title", "section": None, "runs": runs_of(el)})
        elif t == "EnactedClause":
            blocks.append({"kind": "enacted", "section": None,
                           "runs": [("", "BE IT ENACTED BY THE LEGISLATURE OF THE STATE OF WASHINGTON:")]})
        elif t == "BillSection":
            secno += 1
            hdr = el.find("{*}BillSectionHeader")
            hruns, caption, hpara = [], None, None
            if hdr is not None:
                for c in hdr:
                    ct = _local(c.tag)
                    if ct == "Caption":
                        caption = runs_of(c)
                    elif ct == "P":
                        hpara = runs_of(c)
                    else:
                        hruns += runs_of(c)
                    if c.tail and c.tail.strip():
                        hruns.append(("", c.tail))
            blocks.append({"kind": "heading", "section": secno, "runs": hruns,
                           "sectype": el.get("type"), "secaction": el.get("action")})
            if caption: blocks.append({"kind": "caption", "section": secno, "runs": caption})
            if hpara: blocks.append({"kind": "para", "section": secno, "runs": hpara})
            for c in el:
                ct = _local(c.tag)
                if ct == "P":
                    r = runs_of(c)
                    if any(x[1].strip() for x in r):
                        blocks.append({"kind": "para", "section": secno, "runs": r})
                elif ct == "RCWNoteSection":
                    for np in c.iter():
                        if _local(np.tag) == "NoteP":
                            blocks.append({"kind": "note", "section": secno, "runs": runs_of(np)})
    return meta, blocks

# ---------------- front-end: old LSC DTD schema (X1) ----------------
def parse_x1(root):
    meta, blocks = {}, []
    head = root.find(".//IntroducedBillHeader")
    def txt(tag):
        e = head.find(".//" + tag) if head is not None else None
        return re.sub(r'\s+', ' ', ''.join(e.itertext())).strip() if e is not None else None
    brief = root.find(".//BriefDescription")
    meta = {"id": root.get("docName"), "longId": txt("BillNumber"),
            "legislature": txt("Legislature"), "session": txt("Session"),
            "sponsors": txt("Sponsors"),
            "brief": re.sub(r'\s+', ' ', ''.join(brief.itertext())).strip() if brief is not None else None,
            "requestNumber": None, "history": txt("ReadDate")}

    def runs_of(el, style=""):
        """Serialize mixed content: LineNumber -> space, hyphen -> '-' or soft join,
        paraend -> paragraph split marker, PageNumberFooter -> dropped."""
        out = []
        def emit(s, txt):
            if txt: out.append((s, txt))
        def walk(e, st):
            emit(st, e.text)
            kids = list(e)
            for i, c in enumerate(kids):
                t = _local(c.tag)
                if t == "LineNumber":
                    emit(st, " ")
                elif t == "PageNumberFooter":
                    pass  # print apparatus; footer tail may continue a word: no space
                elif t == "hyphen":
                    nxt = kids[i + 1] if i + 1 < len(kids) else None
                    soft = (nxt is not None and _local(nxt.tag) == "LineNumber") or \
                           (c.tail is None and nxt is None)
                    if not soft: emit(st, "-")
                elif t == "breakwordnohyphen":
                    pass
                elif t == "paraend":
                    emit(st, "\u2029")  # U+2029 PARAGRAPH SEPARATOR as split sentinel (cannot occur in bill text)
                elif t == "add":
                    walk(c, "ins"); emit(st, c.tail); continue
                elif t == "strike":
                    walk(c, "del"); emit(st, c.tail); continue
                else:
                    walk(c, st)
                emit(st, c.tail)
        walk(el, style)
        return out

    def split_paras(runs, section):
        cur = []
        for s, t in runs:
            parts = t.split("\u2029")
            for j, p in enumerate(parts):
                if j > 0:
                    if any(x[1].strip() for x in cur):
                        blocks.append({"kind": "para", "section": section, "runs": cur})
                    cur = []
                if p: cur.append((s, p))
        if any(x[1].strip() for x in cur):
            blocks.append({"kind": "para", "section": section, "runs": cur})

    body = root.find(".//BillBody")
    secno = 0
    for el in body:
        t = _local(el.tag)
        if t == "BillTitle":
            blocks.append({"kind": "title", "section": None, "runs": runs_of(el)})
        elif t == "EnactingClause":
            blocks.append({"kind": "enacted", "section": None,
                           "runs": [("", re.sub(r'\s+', ' ', ''.join(el.itertext())).strip() or
                                     "BE IT ENACTED BY THE LEGISLATURE OF THE STATE OF WASHINGTON:")]})
        elif t == "BillSection":
            secno += 1
            hruns = []
            for tag in ("BegSecAmd", "BegSecNew", "BegSec"):
                h = el.find(tag)
                if h is not None:
                    hruns = runs_of(h)
                    break
            # supply the sequential number print adds: "Sec. " -> "Sec. N. "
            # (also put a space after a NEW SECTION. marker so the heading reads)
            fixed, done = [], False
            for s, txt2 in hruns:
                if not done and "Sec. " in txt2:
                    txt2 = txt2.replace("Sec. ", f"Sec. {secno}. ", 1)
                    done = True
                if txt2 == "NEW SECTION.":
                    txt2 = "NEW SECTION. "
                fixed.append((s, txt2))
            blocks.append({"kind": "heading", "section": secno, "runs": fixed,
                           "sectype": el.get("type"), "secaction": None})
            for tag in ("RCWSLText", "NewSecText"):
                for b in el.findall(tag):
                    if b is not None and (b.text or list(b)):
                        split_paras(runs_of(b), secno)
    return meta, blocks

# ---------------- emitter ----------------
def esc(t):
    t = t.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    return t.replace("*", "\\*").replace("_", "\\_")

def runs_to_md(runs):
    # merge adjacent same-style, wrap
    merged = []
    for s, t in runs:
        if merged and merged[-1][0] == s: merged[-1][1] += t
        else: merged.append([s, t])
    out = []
    for s, t in merged:
        t = re.sub(r'[ \t\r\n]+', ' ', t)
        if not t: continue
        e = esc(t)
        if s == "ins": out.append(f"<ins>{e.strip()}</ins>" if e.strip() else e)
        elif s == "del": out.append(f"<del>{e.strip()}</del>" if e.strip() else e)
        elif s == "b": out.append(f"**{e.strip()}**" if e.strip() else e)
        else: out.append(e)
    md = "".join(out)
    # old-schema literal parens around deletions: <del> carries the semantics
    md = re.sub(r'\(\(\s*<del>', '<del>', md)
    md = re.sub(r'</del>\s*\)\)', '</del>', md)
    # the old schema closes and reopens styled runs at every print line; rejoin them
    md = re.sub(r'</ins>(\s+)<ins>', r'\1', md)
    md = re.sub(r'</del>(\s+)<del>', r'\1', md)
    return re.sub(r'  +', ' ', md).strip()

def emit(meta, blocks, source_rel):
    lines = ["---"]
    for k in ("id", "longId", "legislature", "session", "sponsors", "brief",
              "requestNumber", "history"):
        v = meta.get(k)
        if v: lines.append(f'{k}: "{v}"')
    lines.append(f'source: "{source_rel}"')
    lines.append('format: "legislative-markdown v0.1; amendments inline as HTML ins and del '
                 'elements; deletion parens (( )) not reproduced, regenerable on render"')
    lines.append("---")
    lines.append("")
    lines.append(f"# {meta.get('longId') or meta.get('id')}")
    lines.append("")
    md = "\n".join(lines) + "\n"
    section_spans = {}   # secno -> [start, end, headinginfo]
    cur = None
    for b in blocks:
        text = runs_to_md(b["runs"])
        if not text: continue
        if b["kind"] == "heading":
            if cur is not None: section_spans[cur][1] = len(md)
            cur = b["section"]
            section_spans[cur] = [len(md), None,
                                  {"type": b.get("sectype"), "action": b.get("secaction")}]
            chunk = f"## {text}\n\n"
        elif b["kind"] == "caption":
            chunk = f"*{text}*\n\n"
        elif b["kind"] == "note":
            chunk = f"> {text}\n\n"
        elif b["kind"] == "title":
            chunk = f"{text}\n\n"
        elif b["kind"] == "enacted":
            chunk = f"{text}\n\n"
        else:
            chunk = f"{text}\n\n"
        md += chunk
    if cur is not None: section_spans[cur][1] = len(md)
    return md, section_spans

# ---------------- annotations ----------------
def marker_path(md, pos, section_spans):
    sec = None
    for n, (a, b, _i) in section_spans.items():
        if a <= pos < b: sec = n; break
    # nearest preceding paragraph markers like (5)(b)(i) at paragraph start
    para_start = md.rfind("\n\n", 0, pos) + 2
    m = re.match(r'((?:\((?:\d+|[a-z]{1,4}|[A-Z]{1,4})\))+)', md[para_start:para_start+30])
    return sec, (m.group(1) if m else None)

def build_annotations(md, section_spans, meta, source_rel):
    items = []
    # provenance: one per section
    for n, (a, b, info) in sorted(section_spans.items()):
        items.append({
            "id": f"prov-sec-{n}",
            "motivation": "provenance",
            "body": {"type": "source-provenance", "sourceElement": f"BillSection[{n}]",
                     "sectionType": info.get("type"), "sectionAction": info.get("action")},
            "target": {"source": "bill.md",
                       "selector": [
                           {"type": "TextPositionSelector", "start": a, "end": b},
                           {"type": "SectionSelector", "section": n}]}})
    # rule-generated: RCW citations with occurrence-level selectors
    anchored = set()
    for m in RUN_RE.finditer(md):
        for cm in CITE_RE.finditer(m.group(1)):
            anchored.add(cm.group(1))
    k = 0
    for m in CITE_RE.finditer(md):
        c = m.group(1)
        if c in RCW_SECTIONS: status = "current"
        elif c in RCW_CHAPTERS: status = "chapter"
        elif c in anchored: status = "historical"
        else: continue
        k += 1
        sec, markers = marker_path(md, m.start(), section_spans)
        sel = [{"type": "TextPositionSelector", "start": m.start(), "end": m.end()},
               {"type": "TextQuoteSelector", "exact": c,
                "prefix": md[max(0, m.start()-48):m.start()],
                "suffix": md[m.end():m.end()+48]}]
        if sec: sel.append({"type": "SectionSelector", "section": sec, "markers": markers})
        items.append({
            "id": f"rcw-{k}",
            "motivation": "identifying",
            "body": {"type": "statutory-citation", "cite": c, "status": status},
            "target": {"source": "bill.md", "selector": sel},
            "generatedBy": {"type": "RegexRule", "id": "rcw-cite-rule", "version": "1.0",
                            "pattern": CITE_RE.pattern,
                            "note": "validated 100% recall vs 17,899 drafter hyperlinks, 2015-2026"}})
    return {"@context": "http://www.w3.org/ns/anno.jsonld",
            "source": {"xml": source_rel, "markdown": "bill.md",
                       "normalization": "UTF-8, LF, offsets count raw bill.md characters"},
            "items": items}

# ---------------- views and patch ----------------
INSRX = re.compile(r'<ins>(.*?)</ins>', re.S)
DELRX = re.compile(r'<del>(.*?)</del>', re.S)

def view_before(md):
    s = INSRX.sub('', md)
    s = DELRX.sub(lambda m: m.group(1), s)
    return re.sub(r'  +', ' ', s)

def view_after(md):
    s = DELRX.sub('', md)
    s = INSRX.sub(lambda m: m.group(1), s)
    return re.sub(r'  +', ' ', s)

def derive_patch(md, section_spans):
    ops = []
    pat = re.compile(r'<del>(.*?)</del>(\s*)<ins>(.*?)</ins>|<del>(.*?)</del>|<ins>(.*?)</ins>', re.S)
    for m in pat.finditer(md):
        sec, markers = marker_path(md, m.start(), section_spans)
        if m.group(1) is not None:
            ops.append({"op": "replace", "old": m.group(1), "new": m.group(3),
                        "section": sec, "markers": markers})
        elif m.group(4) is not None:
            ops.append({"op": "delete", "old": m.group(4), "section": sec, "markers": markers})
        else:
            ops.append({"op": "insert", "new": m.group(5), "section": sec, "markers": markers})
    return ops

# ---------------- validation ----------------
def validate(md, xml_text, schema):
    ins_md = "".join(INSRX.findall(md))
    del_md = "".join(DELRX.findall(md))
    def squash(s): return re.sub(r'\W+', '', s)
    if schema == "x2":
        add_src = "".join(re.findall(r'<TextRun amendingStyle="add"[^>]*>([^<]*)</TextRun>', xml_text))
        del_src = "".join(re.findall(r'<TextRun amendingStyle="strike[^"]*"[^>]*>([^<]*)</TextRun>', xml_text))
    else:
        add_src = "".join(re.findall(r'<add>(.*?)</add>', xml_text, re.S))
        del_src = "".join(re.findall(r'<strike>(.*?)</strike>', xml_text, re.S))
        add_src = re.sub(r'<[^>]+>', ' ', add_src); del_src = re.sub(r'<[^>]+>', ' ', del_src)
        add_src = html.unescape(add_src); del_src = html.unescape(del_src)
    ins_md2 = html.unescape(ins_md.replace('\\*','*').replace('\\_','_'))
    del_md2 = html.unescape(del_md.replace('\\*','*').replace('\\_','_'))
    return {"ins_chars_md": len(squash(ins_md2)), "ins_chars_src": len(squash(add_src)),
            "del_chars_md": len(squash(del_md2)), "del_chars_src": len(squash(del_src)),
            "ins_ok": squash(ins_md2) == squash(add_src),
            "del_ok": squash(del_md2) == squash(del_src)}

# ---------------- main ----------------
def main(xml_path, outdir):
    raw = open(xml_path, encoding="utf-8-sig", errors="replace").read()
    root = ET.fromstring(raw)
    schema = "x2" if "leg.wa.gov/2012/document" in raw[:400] else "x1"
    meta, blocks = (parse_x2 if schema == "x2" else parse_x1)(root)
    source_rel = os.path.relpath(xml_path, REPO)
    md, spans = emit(meta, blocks, source_rel)
    os.makedirs(outdir, exist_ok=True)
    open(os.path.join(outdir, "bill.md"), "w").write(md)
    ann = build_annotations(md, spans, meta, source_rel)
    json.dump(ann, open(os.path.join(outdir, "annotations.json"), "w"), indent=1)
    open(os.path.join(outdir, "before.md"), "w").write(view_before(md))
    open(os.path.join(outdir, "after.md"), "w").write(view_after(md))
    json.dump(derive_patch(md, spans), open(os.path.join(outdir, "patch.json"), "w"), indent=1)
    v = validate(md, raw, schema)
    print(f"{os.path.basename(xml_path)} [{schema}]: {len(md)} chars md, "
          f"{len(spans)} sections, {len(ann['items'])} annotations | "
          f"ins {'OK' if v['ins_ok'] else 'MISMATCH'} ({v['ins_chars_md']}/{v['ins_chars_src']}), "
          f"del {'OK' if v['del_ok'] else 'MISMATCH'} ({v['del_chars_md']}/{v['del_chars_src']})")

if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
