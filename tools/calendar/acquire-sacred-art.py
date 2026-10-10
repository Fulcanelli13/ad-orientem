#!/usr/bin/env python3
"""Download CC0 originals from the Met API into review-only GitHub Actions artifacts."""
import csv, hashlib, io, json, re, time
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen
from PIL import Image, ImageOps, ImageDraw
import numpy as np

ROOT = Path(__file__).resolve().parents[2]
REGISTRY = ROOT / "data/calendar/sacred-art-candidates.v1.json"
OUT = ROOT / "artifacts/sacred-art-review"
ORIGINALS = OUT / "museum-originals"
LIMIT = 32 * 1024 * 1024
USER_AGENT = "AdOrientem-sacred-art-review/1.0"

def download(url, size_limit=LIMIT):
    if not url.startswith("https://"):
        raise ValueError("Non-HTTPS source")
    last = None
    for attempt in range(4):
        try:
            request = Request(url, headers={"User-Agent":USER_AGENT, "Accept":"application/json,image/jpeg,*/*"})
            with urlopen(request, timeout=40) as res:
                length = res.headers.get("Content-Length")
                if length and int(length) > size_limit:
                    raise ValueError("Source exceeds size limit")
                raw = res.read(size_limit+1)
                if len(raw) > size_limit:
                    raise ValueError("Excessive source bytes")
                return raw
        except (HTTPError, URLError, TimeoutError, ConnectionError) as exc:
            last = str(exc)
            if isinstance(exc, HTTPError) and exc.code not in (403,429,500,502,503,504):
                break
            time.sleep(min(4 * (attempt+1), 15))
    raise RuntimeError("Download failed: "+str(last))

def verify_image(raw):
    with Image.open(io.BytesIO(raw)) as image:
        image.load()
        image = ImageOps.exif_transpose(image)
        width, height = image.size
        if max(width, height) < 2500:
            raise ValueError("Original too small (%s x %s)" % (width,height))
        if image.format not in ("JPEG",None):
            raise ValueError("Unexpected source image encoding")
        thumb=image.convert("RGB")
        thumb.thumbnail((240,240))
        pixels=np.asarray(thumb,dtype=np.int16)
        chroma=np.max(pixels,axis=2)-np.min(pixels,axis=2)
        colour_fraction=float(np.mean(chroma > 18))
        if colour_fraction < .07:
            raise ValueError("Grayscale/near-monochrome artwork")
        return width,height,round(colour_fraction,4)

def contact_sheets(rows):
    good=[r for r in rows if r["result"]=="TECHNICAL_SCREEN_PASS"]
    good.sort(key=lambda r:r["id"])
    for off in range(0,len(good),8):
        sheet=Image.new("RGB",(1600,2040),(238,234,227))
        draw=ImageDraw.Draw(sheet)
        for n,rec in enumerate(good[off:off+8]):
            x=(n%4)*400
            y=(n//4)*1020
            with Image.open(ORIGINALS/rec["filename"]) as orig:
                preview=ImageOps.exif_transpose(orig).convert("RGB")
                preview.thumbnail((370,870),Image.Resampling.LANCZOS)
                sheet.paste(preview,(x+(400-preview.width)//2,y+10+(870-preview.height)//2))
            draw.text((x+12,y+895),rec["id"]+" — "+str(rec.get("apiArtist",""))[:30],fill=(25,25,25))
            draw.text((x+12,y+923),str(rec.get("apiTitle",""))[:45],fill=(25,25,25))
            draw.text((x+12,y+950),str(rec["width"])+" × "+str(rec["height"]),fill=(65,65,65))
        sheet.save(OUT/("contact-sheet-%02d.jpg"%(1+off//8)),quality=90,optimize=True)


def prepare_editorial_previews(rows):
    """Create frametrimmed, compact *unpublished* variants for manual mobile QA."""
    shortlist=json.loads((ROOT/"data/calendar/sacred-art-visual-shortlist.v1.json").read_text(encoding="utf-8"))
    by_id={row["id"]:row for row in rows}
    target=OUT/"editorial-previews"
    target.mkdir(parents=True,exist_ok=True)
    report=[]
    for item in shortlist["artworks"]:
        key=item["id"]
        raw=by_id.get(key)
        finding={"id":key,"status":"NOT_AVAILABLE"}
        if not raw or raw["result"]!="TECHNICAL_SCREEN_PASS":
            finding["reason"]=raw.get("rejectionReason","Not acquired") if raw else "Missing source"
            report.append(finding)
            continue
        try:
            bounds=item["cropFractionLTRB"]
            if len(bounds)!=4 or not (0 <= bounds[0] < bounds[2] <= 1 and 0 <= bounds[1] < bounds[3] <= 1):
                raise ValueError("Invalid image crop")
            with Image.open(ORIGINALS/raw["filename"]) as original:
                original=ImageOps.exif_transpose(original).convert("RGB")
                w,h=original.size
                crop=(round(bounds[0]*w),round(bounds[1]*h),round(bounds[2]*w),round(bounds[3]*h))
                display=original.crop(crop)
                display.thumbnail((2100,2100),Image.Resampling.LANCZOS)
                output=target/(key+".webp")
                display.save(output,"WEBP",quality=89,method=4)
            finding.update(status="EDITORIAL_PREVIEW_ONLY",file=str(output.relative_to(OUT)),
                           pixelCrop=crop,outputDimensions=list(display.size),
                           sha256=hashlib.sha256(output.read_bytes()).hexdigest(),
                           originalSha256=raw["sha256"],visualGrade=item["visualGrade"],
                           museumObjectUrl=raw["objectUrl"],originalImageUrl=raw["originalImageUrl"])
        except Exception as exc:
            finding.update(status="FAILED",reason=str(exc))
        report.append(finding)
    (OUT/"editorial-previews-manifest.json").write_text(json.dumps({
        "schema":"AO_SACRED_ART_EDITORIAL_PREVIEWS_V1",
        "rights":"CC0 from Met API for originals only",
        "warning":"Review-only frametrimmed copies, not user-facing or approved app assets.",
        "artworks":report},indent=2)+"\n",encoding="utf-8")

def main():
    candidates=json.loads(REGISTRY.read_text(encoding="utf-8"))["artworks"]
    assert len({x["id"] for x in candidates})==len(candidates), "Duplicate candidate IDs"
    ORIGINALS.mkdir(parents=True,exist_ok=True)
    rows=[]
    for idx,art in enumerate(candidates,1):
        key=art["id"]
        rec={"id":key,"candidateTitle":art["title"],"candidateArtist":art["artist"],
             "objectUrl":art["source"]["objectUrl"],"result":"REJECTED",
             "artisticApproved":False,"cropApproved":False}
        try:
            obj_id=str(art["source"]["objectId"])
            if key!="met-"+obj_id:
                raise ValueError("Candidate identifier inconsistency")
            api_url="https://collectionapi.metmuseum.org/public/collection/v1/objects/"+obj_id
            metadata=json.loads(download(api_url,size_limit=1_500_000))
            rec.update(apiObjectUrl=api_url,apiTitle=metadata.get("title"),
                       apiArtist=metadata.get("artistDisplayName"),
                       apiDate=metadata.get("objectDate"),
                       classification=metadata.get("classification"),
                       isPublicDomain=metadata.get("isPublicDomain"),
                       accession=metadata.get("accessionNumber"))
            if metadata.get("objectID") != int(obj_id) or metadata.get("isPublicDomain") is not True:
                raise ValueError("Museum API public-domain status not confirmed")
            if metadata.get("classification") != "Paintings":
                raise ValueError("Museum record is not classified as a painting")
            image_url=metadata.get("primaryImage") or ""
            if not re.fullmatch(r"https://images\.metmuseum\.org/CRDImages/[a-z]{2}/original/[^?#]+\.jpg",image_url,re.I):
                raise ValueError("No authenticated Met original-image URL")
            rec["originalImageUrl"]=image_url
            original=download(image_url)
            width,height,colour=verify_image(original)
            filename=key+".jpg"
            (ORIGINALS/filename).write_bytes(original)
            rec.update(width=width,height=height,colourFraction=colour,bytes=len(original),
                       sha256=hashlib.sha256(original).hexdigest(),
                       filename=filename,result="TECHNICAL_SCREEN_PASS")
        except Exception as exc:
            rec["rejectionReason"]=str(exc)
        rows.append(rec)
        print("[%d/%d] %s: %s %s"%(idx,len(candidates),key,rec["result"],rec.get("rejectionReason","")),flush=True)
        time.sleep(.7)
    contact_sheets(rows)
    prepare_editorial_previews(rows)
    report={"schema":"AO_SACRED_ART_ACQUISITION_REPORT_V1",
            "warning":"Technical/source screening only. No curatorial, glare, frame, crop or app approval.",
            "entries":rows}
    (OUT/"acquisition-manifest.v1.json").write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    fields=["id","candidateTitle","apiTitle","apiArtist","classification","isPublicDomain",
            "width","height","result","rejectionReason","originalImageUrl","sha256"]
    with (OUT/"acquisition-summary.csv").open("w",newline="",encoding="utf-8") as file:
        writer=csv.DictWriter(file,fieldnames=fields,extrasaction="ignore")
        writer.writeheader()
        writer.writerows(rows)
    passed=sum(r["result"]=="TECHNICAL_SCREEN_PASS" for r in rows)
    print("ACQUISITION: %d/%d passed automated image screening. Human approval still required."%(passed,len(rows)))
    if passed==0:
        raise SystemExit("No originals downloaded — inspect API/network/rejection report")
if __name__=="__main__":
    main()
