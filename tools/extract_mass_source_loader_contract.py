"""Extract Mass source-loader construction and URL/base-path evidence.

Diagnostic only. This captures how the production monolith constructs the Proper
fetcher and which source roots/revisions it contains, so file:// preview failures
can be repaired at the loader rather than hidden at the UI.
"""
from pathlib import Path
import json, re

SRC = Path("index.html")
OUT = Path("data/mass-source-loader-contract.json")
s = SRC.read_text(encoding="utf-8")

def contexts(pattern, radius=900, limit=30, flags=re.I):
    rx = re.compile(pattern, flags)
    out=[]; seen=set()
    for m in rx.finditer(s):
        a=max(0,m.start()-radius); b=min(len(s),m.end()+radius)
        c=s[a:b].replace("\r","")
        sig=re.sub(r"\s+"," ",c)[:260]
        if sig in seen: continue
        seen.add(sig)
        out.append({"offset":m.start(),"match":m.group(0),"context":c})
        if len(out)>=limit: break
    return out

patterns = {
    "memoryTextFetcher": r"class\s+MemoryTextFetcher|new\s+[^;\n]*MemoryTextFetcher",
    "mapTextFetcher": r"class\s+MapTextFetcher|new\s+[^;\n]*MapTextFetcher",
    "createDayResolver": r"createDayResolver|new\s+DayResolver",
    "sourceRevisions": r"SOURCE_REVISIONS",
    "sourceRoots": r"SOURCE_(?:ROOTS?|BASE|URLS?)|MASS_(?:ROOTS?|BASE|URLS?)|DIVINUM|divinumofficium",
    "fetchConstruction": r"fetch\.bind\(globalThis\)|globalThis\.fetch|window\.fetch|fetch\)",
    "sanctiPaths": r"Sancti/[A-Za-z0-9_-]+",
    "temporaPaths": r"Tempora/[A-Za-z0-9_-]+",
    "absoluteUrls": r"https://[^\"'\\\s)]+",
}

payload={
    "schema":"ad-orientem.mass-source-loader-contract.v1",
    "source":"index.html",
    "evidence":{k:contexts(v) for k,v in patterns.items()},
}
OUT.parent.mkdir(parents=True,exist_ok=True)
OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

for k,v in payload["evidence"].items():
    print(k, len(v), "hits")
if not payload["evidence"]["memoryTextFetcher"]:
    raise SystemExit("MemoryTextFetcher construction/class evidence not found")
if not payload["evidence"]["createDayResolver"]:
    raise SystemExit("createDayResolver evidence not found")
