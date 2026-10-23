#!/usr/bin/env python3
from pathlib import Path
import argparse, hashlib, json, re

TARGETS = {
    "kek_vrt19_100dpi_little": {
        "label": "DECterm Little Font 100dpi 10pt",
        "xlfd": "-DEC-Terminal-Medium-R-Normal--14-100-100-100-C-80-ISO8859-1",
        "expected": {
            "foundry":"dec","family":"terminal","weight":"medium","slant":"r","setwidth":"normal",
            "pixelSize":14,"pointSize":100,"resolutionX":100,"resolutionY":100,
            "spacing":"c","averageWidth":80,"registry":"iso8859","encoding":"1"
        },
        "cell":[8,15]
    },
    "kek_75dpi_normal": {
        "label": "DECterm Little Font 75dpi 14pt",
        "xlfd": "-DEC-Terminal-Medium-R-Normal--14-140-75-75-C-80-ISO8859-1",
        "expected": {
            "foundry":"dec","family":"terminal","weight":"medium","slant":"r","setwidth":"normal",
            "pixelSize":14,"pointSize":140,"resolutionX":75,"resolutionY":75,
            "spacing":"c","averageWidth":80,"registry":"iso8859","encoding":"1"
        },
        "cell":[8,15]
    },
    "kek_100dpi_big": {
        "label": "DECterm 100dpi Big 14pt",
        "xlfd": "-Bitstream-Terminal-Medium-R-Normal--18-140-100-100-C-110-ISO8859-1",
        "expected": {
            "foundry":"bitstream","family":"terminal","weight":"medium","slant":"r","setwidth":"normal",
            "pixelSize":18,"pointSize":140,"resolutionX":100,"resolutionY":100,
            "spacing":"c","averageWidth":110,"registry":"iso8859","encoding":"1"
        },
        "cell":[11,18]
    }
}

def parse_xlfd(name):
    if not name.startswith("-"):
        return None
    p = name.split("-")
    if len(p) < 15:
        return None
    def iv(i):
        try: return int(p[i])
        except: return 0
    return {
        "foundry":p[1],"family":p[2],"weight":p[3],"slant":p[4],
        "setwidth":p[5],"addstyle":p[6],"pixelSize":iv(7),"pointSize":iv(8),
        "resolutionX":iv(9),"resolutionY":iv(10),"spacing":p[11],
        "averageWidth":iv(12),"registry":p[13],"encoding":p[14]
    }

def compare(parsed,target):
    if not parsed:
        return {"score":0,"status":"UNREADABLE","differences":["FONT is not XLFD"]}
    diffs=[]; matched=0
    for k,v in target["expected"].items():
        a=parsed.get(k)
        if isinstance(v,str):
            ok=str(a).lower()==v.lower()
        else:
            ok=a==v
        if ok: matched+=1
        else: diffs.append(f"{k}: loaded={a} expected={v}")
    total=len(target["expected"])
    score=matched/total
    status=("EXACT METADATA MATCH" if score==1 else
            "NEAR MATCH" if score>=0.83 else
            "PARTIAL MATCH" if score>=0.58 else "MISMATCH")
    return {"score":score,"matched":matched,"total":total,
            "status":status,"differences":diffs}

def inspect_bdf(path):
    data=path.read_bytes()
    text=data.decode("utf-8","replace")
    font=""
    bbox=[0,0,0,0]
    ascent=descent=0
    encodings=[]
    dwidths=[]
    for raw in text.splitlines():
        line=raw.strip()
        if line.startswith("FONT "): font=line[5:].strip()
        elif line.startswith("FONTBOUNDINGBOX "):
            try: bbox=list(map(int,line.split()[1:5]))
            except: pass
        elif line.startswith("FONT_ASCENT "):
            try: ascent=int(line.split()[1])
            except: pass
        elif line.startswith("FONT_DESCENT "):
            try: descent=int(line.split()[1])
            except: pass
        elif line.startswith("ENCODING "):
            try: encodings.append(int(line.split()[1]))
            except: pass
        elif line.startswith("DWIDTH "):
            try: dwidths.append(int(line.split()[1]))
            except: pass
    ascii_widths=[w for w in dwidths if w>0]
    cell_w=max(ascii_widths) if ascii_widths else bbox[0]
    cell_h=max(ascent+descent,bbox[1])
    parsed=parse_xlfd(font)
    comps=[]
    for k,t in TARGETS.items():
        r=compare(parsed,t)
        comps.append({"id":k,"label":t["label"],**r})
    comps.sort(key=lambda x:x["score"],reverse=True)
    missing_ascii=[cp for cp in range(32,127) if cp not in encodings]
    return {
        "path":str(path),
        "sha256":hashlib.sha256(data).hexdigest(),
        "size_bytes":len(data),
        "font":font,
        "xlfd":parsed,
        "font_bounding_box":bbox,
        "font_ascent":ascent,
        "font_descent":descent,
        "glyph_count":len(encodings),
        "ascii_complete":not missing_ascii,
        "missing_ascii":missing_ascii,
        "cell_width_estimate":cell_w,
        "cell_height_estimate":cell_h,
        "best_match":comps[0] if comps else None,
        "all_matches":comps
    }

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("bdf")
    ap.add_argument("-o","--output")
    ns=ap.parse_args()
    report=inspect_bdf(Path(ns.bdf))
    out=json.dumps(report,ensure_ascii=False,indent=2)
    if ns.output:
        Path(ns.output).write_text(out,encoding="utf-8")
        print(ns.output)
    else:
        print(out)

if __name__=="__main__":
    main()
