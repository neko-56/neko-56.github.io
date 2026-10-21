#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, re

NAMES = ["HTBrowse.c","GridText.c","DefaultStyles.c","HTBrowse.h","GridText.h"]

def sha256(p):
    h=hashlib.sha256()
    with p.open("rb") as f:
        for chunk in iter(lambda:f.read(1<<20),b""): h.update(chunk)
    return h.hexdigest()

def snippets(text, patterns, radius=2):
    lines=text.splitlines()
    hits=[]
    seen=set()
    for i,line in enumerate(lines):
        if any(re.search(p,line,re.I) for p in patterns):
            a=max(0,i-radius); b=min(len(lines),i+radius+1)
            key=(a,b)
            if key not in seen:
                seen.add(key)
                hits.append({"line":i+1,"text":"\n".join(lines[a:b])})
    return hits

def main():
    ap=argparse.ArgumentParser(description="Audit extracted CERN/W3 Line Mode Browser source lineage")
    ap.add_argument("root", help="directory containing extracted source")
    ap.add_argument("-o","--output",default="lmb-source-audit.json")
    ns=ap.parse_args()
    root=Path(ns.root)
    report={"root":str(root.resolve()),"files":[],"warning":
      "Version must be established independently. 2.11/2.12 are later source-lineage references, not the exact 1992-09-30 executable."}
    found=[]
    for name in NAMES:
        found += list(root.rglob(name))
    for p in sorted(set(found)):
        text=p.read_text(errors="replace")
        report["files"].append({
          "path":str(p.relative_to(root)),
          "size":p.stat().st_size,
          "sha256":sha256(p),
          "version_hits":snippets(text,[r"\bversion\b",r"\brevision\b",r"\b1\.2",r"\b2\.\d"]),
          "prompt_hits":snippets(text,[r"RETURN.*more",r"or Help",r"Quit",r"prompt"]),
          "style_hits":snippets(text,[r"Heading",r"spaceBefore",r"spaceAfter",r"indent",r"alignment",r"HT_CENTER",r"HT_RIGHT"]),
          "command_hits":snippets(text,[r"\bBACK\b",r"\bHOME\b",r"\bRECALL\b",r"\bLIST\b",r"\bNEXT\b",r"\bPREVIOUS\b"])
        })
    Path(ns.output).write_text(json.dumps(report,indent=2,ensure_ascii=False),encoding="utf-8")
    print(f"Wrote {ns.output}; files={len(report['files'])}")

if __name__=="__main__":
    main()
