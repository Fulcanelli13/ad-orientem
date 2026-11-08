#!/usr/bin/env python3
"""Phase47: compare exact production-main module painting registry to LIVE GitHub Pages.

Build-time/source evidence and HTTP-only verification are separate from a browser-
executed gallery census. No asset changes, no publication, and no invented
physical painting count. Preserve source_sha and each URL/status for reproducibility.
"""
from __future__ import annotations
from collections import Counter,defaultdict
from pathlib import Path
from urllib.parse import urljoin
import csv, json, hashlib, re, subprocess, os
import requests

ROOT=Path("production-main")
OUT=Path("artifacts/sacred-art-phase47-main-gallery-census")
OUT.mkdir(parents=True,exist_ok=True)
BASE_URL="https://fulcanelli13.github.io/ad-orientem/"
MODULE=ROOT/"src/art/released-module-paintings.v1.js"
EXTS={".jpg",".jpeg",".png",".webp",".avif",".gif",".svg",".tif",".tiff"}
DIRS=("active","approved","editorial","home","pray","prayer","recovered","staged","review","stations","generated-inline","generated-sprites","inventory")
UA={"User-Agent":"AdOrientemSacredArtAssetCensus/1.0 (read-only public source verification)","Accept":"text/html,image/avif,image/webp,image/jpeg,image/png,*/*;q=0.2"}

def sha(p):
    return hashlib.sha256(p.read_bytes()).hexdigest()

def released_entries(script):
    # Simple non-executable parser: only declared Object.freeze({ ... }) entries.
    # Avoid treating historical commented-out definitions as registered releases.
    data=[]
    pattern=r'^\s*(?:"([^"]+)"|([A-Za-z][A-Za-z0-9_-]*)):Object\.freeze\(\{(.*?)^\s*\}\)(?:,|$)'
    for m in re.finditer(pattern,script,re.M|re.S):
        key=m.group(1) or m.group(2)
        body=m.group(3)
        def field(name):
            f=re.search(r'^\s*'+re.escape(name)+r':"([^"]*)"',body,re.M)
            if f:return f.group(1)
            f=re.search(r'^\s*'+re.escape(name)+r':(\d+)',body,re.M)
            return int(f.group(1)) if f else None
        data.append({"module_key":key,"painting_title":field("title"),
           "artist":field("artist"),"institution_url":field("source"),
           "image":field("image"),"original":field("original"),
           "photograph_rights_claim":field("photographRights"),"release_pr":field("releasePr")})
    return data

def request_meta(url,method="HEAD"):
    result={"url":url,"method":method,"status":None,"content_type":None,"content_length":None,"error":None,
       "final_url":None}
    try:
        r=requests.request(method,url,headers=UA,timeout=(5,18),allow_redirects=True,stream=True)
        result["status"]=r.status_code
        result["content_type"]=r.headers.get("Content-Type")
        result["content_length"]=r.headers.get("Content-Length")
        result["final_url"]=r.url
        if "github.io/" not in r.url and "github.io" not in r.url.split("/")[2]:
            result["error"]="REDIRECT_TO_UNEXPECTED_HOST"
        r.close()
    except Exception as e:result["error"]=f"{type(e).__name__}: {str(e)[:180]}"
    return result

def main():
    assert ROOT.is_dir() and MODULE.exists()
    script=MODULE.read_text(encoding="utf8")
    entries=released_entries(script)
    assert len(entries)==16,(len(entries),[e["module_key"] for e in entries])
    sha_main=subprocess.run(["git","-C",str(ROOT),"rev-parse","HEAD"],
        check=True,stdout=subprocess.PIPE,text=True).stdout.strip()
    folders={}
    totals=Counter()
    for d in DIRS:
        node=ROOT/"assets"/d
        files=[p for p in node.rglob("*") if p.is_file() and p.suffix.lower() in EXTS] if node.is_dir() else []
        byext=Counter(p.suffix.lower() for p in files)
        folders[d]={"image_files":len(files),"file_extensions":dict(byext),"sample_paths":[p.as_posix() for p in files[:10]]}
        totals.update(byext)
    homepage=request_meta(BASE_URL,"GET")
    # HEAD is sufficient to check served image path, not that it's displayed.
    for e in entries:
        for col in ("image","original"):
            path=e[col]
            if not path:
                e[col+"_exists_in_main"]=False
                continue
            f=ROOT/path
            e[col+"_exists_in_main"]=f.is_file()
            e[col+"_bytes_in_main"]=f.stat().st_size if f.is_file() else 0
        e["public_image_url"]=urljoin(BASE_URL,e["image"])
        e["public_image_http"]=request_meta(e["public_image_url"])
        e["http_reachable_image"]=(e["public_image_http"]["status"]==200 and (e["public_image_http"]["content_type"] or "").lower().startswith("image/"))
        e["image_kind_source"]="EXPLICITLY_REGISTERED_MODULE_RELEASE"
        e["current_viewport_runtime_verified"]=False
    # Static strings from both primary entrypoint and application source, not browser observed.
    scan_files=[ROOT/"index.html"]
    source=ROOT/"src"
    if source.is_dir():
        scan_files.extend(p for p in source.rglob("*") if p.is_file() and p.suffix.lower() in (".js",".mjs",".html",".css") and p.stat().st_size<8_000_000)
    pathpat=re.compile(r'(?<![A-Za-z0-9])(?:\./|/)?assets/[a-zA-Z0-9_./%-]+\.(?:jpg|jpeg|png|webp|svg|avif)\b',re.I)
    matches=defaultdict(set)
    for f in scan_files:
        if not f.exists():continue
        try:
            s=f.read_text(encoding="utf8",errors="replace")
            for m in pathpat.finditer(s):
                clean=m.group(0).lstrip("./")
                rel=clean.lstrip("/")
                matches[rel].add(f.relative_to(ROOT).as_posix())
        except Exception:pass
    ref_rows=[]
    for image_path,source_files in sorted(matches.items()):
        p=ROOT/image_path
        ref_rows.append({"asset_path":image_path,"exists_in_main":p.is_file(),
            "source_ref_count":len(source_files),"example_referencing_code":sorted(source_files)[:15],
            "explicit_live_photo_release":image_path in {e["image"] for e in entries},
            "runtime_reachable":None,
            "notes":"Static code path reference is not proof of live route display."})
    stats={
      "schema":"AO_PHASE47_APP_RELEASED_ARTWORK_EVIDENCE_CENSUS_V1",
      "source_main_sha":sha_main,"source_module_registry_sha256":hashlib.sha256(script.encode()).hexdigest(),
      "public_pages_url_checked":BASE_URL,
      "homepage_status":homepage,
      "module_release_entries":len(entries),
      "module_image_files_exist_in_main":sum(x["image_exists_in_main"] for x in entries),
      "module_live_http_200_image":sum(x["http_reachable_image"] for x in entries),
      "module_http_problem":len(entries)-sum(x["http_reachable_image"] for x in entries),
      "module_original_files_exist_in_main":sum(x["original_exists_in_main"] for x in entries),
      "static_image_files_scanned":sum(x["image_files"] for x in folders.values()),
      "static_image_files_by_extension":dict(totals),
      "static_code_referenced_paths":len(ref_rows),
      "static_code_referenced_existing_paths":sum(x["exists_in_main"] for x in ref_rows),
      "static_code_referenced_missing_paths":sum(not x["exists_in_main"] for x in ref_rows),
      "all_app_gallery_paintings_count_CERTIFIED":None,
      "all_routes_rendered_paintings_count_CERTIFIED":None,
      "editorial_photo_replacements_applied":0,
      "critical_limitation":"Only the 16 explicit module release image paths are tested on public Pages. Scan of source asset paths is not a runtime image census. No claim that all 16 render on every route.",
      "read_only":True
    }
    (OUT/"module_release_16_live_checks.json").write_text(json.dumps(entries,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (OUT/"asset_dir_inventory.json").write_text(json.dumps(folders,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (OUT/"source_referenced_assets.json").write_text(json.dumps(ref_rows,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    (OUT/"summary.json").write_text(json.dumps(stats,ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    with (OUT/"module_release_16_live_checks.csv").open("w",newline="",encoding="utf8") as f:
      fields=["module_key","painting_title","artist","institution_url","image","original",
       "photograph_rights_claim","release_pr","image_exists_in_main","original_exists_in_main",
       "public_image_url","http_reachable_image","http_status","content_type"]
      w=csv.DictWriter(f,fieldnames=fields);w.writeheader()
      for e in entries:
        w.writerow({**{k:e.get(k) for k in fields}, "http_status":e["public_image_http"]["status"],
          "content_type":e["public_image_http"]["content_type"]})
    print(json.dumps(stats,ensure_ascii=False,indent=2),flush=True)

if __name__=="__main__":main()
