#!/usr/bin/env python3
"""Reconcile 3 exact user-selected Prado/Louvre masterworks with Commons originals.
Private QA artifacts only: Wikimedia PD-Art assessments do NOT prove global app image rights.
"""
import hashlib, io, json, re, html, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse
import requests
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-commons-evidence"
OUT.mkdir(parents=True,exist_ok=True)
(OUT/"images").mkdir(exist_ok=True)
(OUT/"previews").mkdir(exist_ok=True)
s=requests.Session()
s.headers.update({"User-Agent":"AdOrientem-CuratorialResearch/1.0 (source evidence; slow requests)","Accept":"application/json, image/jpeg, */*"})
TARGETS=[
{"subjectId":"BIB-G01","file":"La adoración de los Reyes Magos (Rubens, Prado).jpg","source":"https://www.museodelprado.es/en/the-collection/art-work/adoration-of-the-magi/b6440da1-0c0c-4ead-84b7-f5a017e2fd17","museum":"Prado","inventory":"P001638","expectedMinLong":3000},
{"subjectId":"DEV-06","file":"Peter Paul Rubens - Immaculate Conception (Prado).jpg","source":"https://www.museodelprado.es/en/the-collection/art-work/the-immaculate-conception/abea9a48-3712-4068-a0dd-c669005430d5","museum":"Prado","inventory":"P01627","expectedMinLong":3100},
{"subjectId":"ROS-13","file":"Restout - La Pentecôte 01.jpg","source":"https://collections.louvre.fr/ark:/53355/cl010062538","museum":"Louvre","inventory":"INV 20303","expectedMinLong":4000}
]
API="https://commons.wikimedia.org/w/api.php"

def get(url,json_result=False):
  if not url.startswith("https://"): raise ValueError("HTTPS required")
  last=None
  for n in range(3):
    try:
      with s.get(url, timeout=(15,90),stream=not json_result) as r:
        r.raise_for_status()
        if json_result: return r.json(),r.url
        if r.headers.get("Content-Length") and int(r.headers["Content-Length"])>30000000: raise ValueError("Too many image bytes")
        data=bytearray()
        for chunk in r.iter_content(1048576):
          if chunk: data.extend(chunk)
          if len(data)>30000000: raise ValueError("Too many image bytes")
        return bytes(data),r.url
    except (requests.RequestException,ValueError) as exc:
      last=exc
      if n<2: time.sleep(3+3*n)
  raise RuntimeError(type(last).__name__+" "+str(last)[:200])

def main():
  decisions=json.loads((ROOT/"data/calendar/sacred-art-user-235-subject-decisions-20261012.v1.json").read_text())
  triage=json.loads((ROOT/"data/calendar/sacred-art-masterpiece-selected-source-triage-20261012.v1.json").read_text())
  picked={x["subject_id"]:x for x in decisions["decisions"] if x["decision"]=="selected"}
  objectrows={x["subjectId"]:x for x in triage["selectedAnchorSourceReconciliations"]}
  results=[]
  for item in TARGETS:
    rec=picked[item["subjectId"]]
    row={"subjectId":item["subjectId"],"artist":rec["selected_artwork"]["artist"],"title":rec["selected_artwork"]["title"],
         "selectionId":rec["selected_artwork_id"],"museumSource":item["source"],"inventory":item["inventory"],"commonsFile":item["file"],
         "publicationApproved":False,"cropApproved":False,"commerceRightsCleared":False,"status":"PENDING_SOURCE_AUDIT"}
    try:
      assert rec["selected_artwork"].get("source_url") and rec["selected_artwork"]["source_url"]==item["source"]
      assert item["source"]==objectrows[item["subjectId"]]["verifiedSourceUrl"]
      assert not re.search("El Greco|Fra Angelico",row["artist"],re.I)
      js,_=get(API+"?action=query&format=json&prop=imageinfo&iiprop=url%7Csize%7Csha1%7Cextmetadata&titles=File%3A"+requests.utils.quote(item["file"],safe=""),True)
      pages=list(js["query"]["pages"].values())
      if len(pages)!=1 or "imageinfo" not in pages[0]: raise ValueError("Commons returns no single exact image")
      inf=pages[0]["imageinfo"][0]
      original=inf.get("url","")
      if urlparse(original).hostname!="upload.wikimedia.org": raise ValueError("Image outside Wikimedia")
      width,height=int(inf["width"]),int(inf["height"])
      if max(width,height)<item["expectedMinLong"]: raise ValueError("Image too small for priority review")
      meta=inf.get("extmetadata",{})
      license_short=(meta.get("LicenseShortName") or {}).get("value","")
      license_url=(meta.get("LicenseUrl") or {}).get("value","")
      usage=(meta.get("UsageTerms") or {}).get("value","")
      # PD-Mark and PD-Art are not the same as museum-issued CC0. Flag global commercial rights.
      row.update(commonsDescriptionPage="https://commons.wikimedia.org/wiki/File:"+requests.utils.quote(item["file"],safe=""),
                 commonsDeclaredLicense=license_short,commonsLicenseUrl=license_url,commonsUsageTerms=usage,
                 licensingGate="PD_ART_CROSS_JURISDICTION_AND_SOURCE_PHOTO_REVIEW_PENDING",
                 originalWidth=width,originalHeight=height,sourceUrl=original)
      content,actual=get(original)
      if urlparse(actual).hostname!="upload.wikimedia.org": raise ValueError("Unexpected redirect for source file")
      if hashlib.sha1(content).hexdigest()!=inf.get("sha1"): raise ValueError("Wikimedia API and acquired byte SHA1 differ")
      with Image.open(io.BytesIO(content)) as check: check.verify()
      with Image.open(io.BytesIO(content)) as check:
        assert check.size==(width,height)
        check=ImageOps.exif_transpose(check).convert("RGB")
        check.thumbnail((1100,1100),Image.Resampling.LANCZOS)
        preview_name=item["subjectId"]+"-full-fit.webp"
        check.save(OUT/"previews"/preview_name,quality=84,method=5)
      fn=item["subjectId"]+".jpg"
      (OUT/"images"/fn).write_bytes(content)
      row.update(status="COMMONS_ORIGINAL_ACQUIRED_FOR_REVIEW",bytes=len(content),sha256=hashlib.sha256(content).hexdigest(),
                 sha1=inf["sha1"],imageFilename="images/"+fn,previewFilename="previews/"+preview_name,
                 imageOriginalOrDerivative="COMMONS_HOSTED_ORIGINAL_FILE_NOT_MUSEUM_API",
                 sourceFileRightsNotAppCleared=True)
    except Exception as exc:
      row.update(status="REVIEW_HOLD_SOURCE_OR_TRANSPORT",holdReason=f"{type(exc).__name__}: {str(exc)[:350]}")
    results.append(row)
  report={"schema":"AO_SELECTED_COMMONS_IMAGE_PROVENANCE_V1","createdUtc":datetime.now(timezone.utc).isoformat(),
          "policy":"Privately downloaded user-selected exact-work Commons evidence only. License metadata and Wikimedia PD-Art are not museum CC0; no worldwide commercial release claims, no human crop or frame-free certification.",
          "summary":{"requested":3,"acquired":sum(x["status"]=="COMMONS_ORIGINAL_ACQUIRED_FOR_REVIEW" for x in results),
                     "pending":sum(x["status"]!="COMMONS_ORIGINAL_ACQUIRED_FOR_REVIEW" for x in results),"published":0},
          "results":results}
  (OUT/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
  def esc(x):return html.escape(str(x or ""))
  body=['<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{background:#080c12;color:#f1e7d7;font:16px Georgia;max-width:1100px;margin:auto;padding:22px}section{border-bottom:1px solid #333;padding:25px 0}p{color:#aaa}img{max-width:96%;max-height:520px;object-fit:contain}a{color:#bca37e}</style></head><body><h1>Selected masterpieces — Commons source review</h1><p>Research image originals only; subject selection is not image/crop/reuse approval.</p>']
  for r in results:
    body.append(f'<section><h2>{esc(r["artist"])} — {esc(r["title"])}</h2><p>{esc(r["subjectId"])} · {esc(r["status"])} · {esc(r.get("originalWidth","?"))}×{esc(r.get("originalHeight","?"))} · {esc(r.get("commonsDeclaredLicense","?"))}</p>')
    if r.get("previewFilename"):body.append(f'<img alt="{esc(r["title"])}" src="{esc(r["previewFilename"])}">')
    body.append(f'<p><a href="{esc(r["museumSource"])}">Official museum object</a> · <a href="{esc(r.get("commonsDescriptionPage",""))}">File license/source</a></p><p>Rights, glare, frame and composition still require acceptance.</p></section>')
  (OUT/"review-gallery.html").write_text("".join(body)+"</body></html>")
  print("SELECTED_COMMONS_EVIDENCE",json.dumps(report["summary"]))
  for r in results:print(r["subjectId"],r["status"],r.get("originalWidth"),r.get("originalHeight"),r.get("holdReason",""))
  if report["summary"]["acquired"]==0: raise SystemExit("All Commons evidence downloads failed. See artifact report.")

if __name__=="__main__":main()
