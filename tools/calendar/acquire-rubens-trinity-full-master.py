#!/usr/bin/env python3
"""Source-lock and recover the FULL original of user's Rubens Trinity (KMSKA 314).
This is a private image QA artifact, not an app release or permission statement.
"""
import hashlib, io, json, time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import quote, urlparse
import requests
from PIL import Image, ImageOps
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/"artifacts/sacred-art-kmska-trinity-full"
OUT.mkdir(parents=True,exist_ok=True)
FILE="Peter Paul Rubens - Heilige Drievuldigheid - 314 - Royal Museum of Fine Arts Antwerp.jpg"
API="https://commons.wikimedia.org/w/api.php"
MUSEUM="https://vlaamsekunstcollectie.be/en/collection/314"
IIIF="https://iiif.kmska.be/iiif/2/28958/manifest.json"
s=requests.Session()
s.headers.update({"User-Agent":"AdOrientem-SacredArtFullQuality/1.0 (museum CC0 object QA)","Accept":"application/json, image/jpeg, */*"})
def get(url,json_mode=False):
    error=None
    for n in range(3):
      try:
        with s.get(url,timeout=(15,160),stream=not json_mode) as r:
          r.raise_for_status()
          if json_mode:return r.json()
          if r.headers.get("Content-Length") and int(r.headers["Content-Length"])>100_000_000:raise ValueError("Unexpected size")
          data=bytearray()
          for chunk in r.iter_content(1<<20):
            if chunk:data.extend(chunk)
            if len(data)>100_000_000:raise ValueError("Unexpected image size")
          return bytes(data)
      except (requests.RequestException,ValueError) as exc:
        error=exc
        if n<2:time.sleep(3+3*n)
    raise RuntimeError(str(error))
def main():
    rows=json.loads((ROOT/"data/calendar/sacred-art-masterpiece-selected-source-triage-20261012.v1.json").read_text())
    row=next(x for x in rows["selectedAnchorSourceReconciliations"] if x["subjectId"]=="DEV-18")
    assert row["verifiedInventory"]=="KMSKA 314" and row["verifiedSourceUrl"]==MUSEUM
    assert row["iiif"]["manifestUrl"]==IIIF
    assert row["userChosenArtist"]=="Peter Paul Rubens"
    data={
      "schema":"AO_KMSKA_TRINITY_FULL_MASTER_REVIEW_V1",
      "createdUtc":datetime.now(timezone.utc).isoformat(),
      "artist":row["userChosenArtist"],"title":row["userChosenTitle"],
      "userSubjectId":"DEV-18","userSelectedArtId":row["userSelectionId"],
      "museumObjectUrl":MUSEUM,"museumManifestUrl":IIIF,
      "filePage":"https://commons.wikimedia.org/wiki/File:"+quote(FILE,safe=""),
      "publishedToApp":False,"cropApproved":False,
      "aestheticHomeMasterpieceApproved":False,
      "status":"NOT_YET_ACQUIRED"
    }
    try:
        j=get(API+"?action=query&format=json&prop=imageinfo&iiprop=url%7Csize%7Csha1%7Cextmetadata&titles=File%3A"+quote(FILE,safe=""),True)
        p=list(j["query"]["pages"].values())
        if len(p)!=1 or "imageinfo" not in p[0]:raise ValueError("No exact Commons file match")
        inf=p[0]["imageinfo"][0]
        assert (int(inf["width"]),int(inf["height"]))==(19178,19721)
        url=inf["url"]
        if urlparse(url).hostname!="upload.wikimedia.org":raise ValueError("Source image host mismatch")
        meta=inf.get("extmetadata") or {}
        license_=(meta.get("LicenseShortName") or {}).get("value","")
        license_url=(meta.get("LicenseUrl") or {}).get("value","")
        if "cc0" not in license_.lower() and "publicdomain/zero" not in license_url.lower():
            raise ValueError("No specific Commons CC0 assertion for sourced museum image")
        raw=get(url)
        digest=hashlib.sha256(raw).hexdigest()
        if hashlib.sha1(raw).hexdigest()!=inf["sha1"]:raise ValueError("Acquired original differs from MediaWiki file SHA-1")
        Image.MAX_IMAGE_PIXELS=450_000_000
        with Image.open(io.BytesIO(raw)) as im:
          if im.format!="JPEG":raise ValueError("Expected source JPEG")
          assert im.size==(19178,19721)
          im.draft("RGB",(1400,1400))
          image=ImageOps.exif_transpose(im)
          image.thumbnail((1200,1200),Image.Resampling.LANCZOS)
          image.convert("RGB").save(OUT/"review-master-fit.webp",format="WEBP",quality=84,method=5)
        (OUT/"kmska-314-full-original.jpg").write_bytes(raw)
        data.update(status="FULL_MUSEUM_DERIVED_COMMONS_ORIGINAL_ACQUIRED_FOR_REVIEW",
             sourceFileUrl=url,sha256=digest,commonsSha1=inf["sha1"],
             width=19178,height=19721,bytes=len(raw),declaredCommonsLicense=license_,
             declaredCommonsLicenseUrl=license_url,
             sourceRightsEvidence="KMSKA first party collection says Image CC0; Wikimedia Commons file licenses CC0; original from official KMSKA IIIF service",
             scope="FULL_SOURCED_ORIGINAL_BYTES_ARCHIVED_FOR_REVIEW_ONLY",
             publicationRightsApproved=False,paintingFrameFreeVerified=False)
    except Exception as exc:
        data.update(status="REVIEW_HOLD",holdReason=f"{type(exc).__name__}: {str(exc)[:380]}")
    (OUT/"report.json").write_text(json.dumps(data,ensure_ascii=False,indent=2)+"\n")
    print("KMSKA_FULL_MASTER_STATUS",data["status"],data.get("sha256",""),data.get("bytes",""),data.get("holdReason",""))
    if data["status"]=="REVIEW_HOLD":raise SystemExit("High-res master acquisition held; see JSON report")
if __name__=="__main__":main()
