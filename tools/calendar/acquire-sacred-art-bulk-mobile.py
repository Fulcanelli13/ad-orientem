#!/usr/bin/env python3
"""Research-only bulk mobile art sourcing. Never changes curator scores or app files.
Inspect source painting vs site-thumbnail crop before declaring acquisition.
"""
import re,io,hashlib,json,html
from pathlib import Path
from urllib.parse import urljoin,unquote
import requests
from bs4 import BeautifulSoup
from PIL import Image,ImageOps,ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SPEC=ROOT/"data/calendar/sacred-art-review-uploads/20261016-bulk-mobile-source-recovery.v1.json"
OUT=ROOT/"artifacts/sacred-art-bulk-mobile-source-recovery"
S=requests.Session()
S.headers.update({"User-Agent":"Mozilla/5.0 (compatible; AdOrientemArtResearch/1.0)","Accept":"image/jpeg,image/webp,image/png,text/html,*/*"})
Image.MAX_IMAGE_PIXELS=100_000_000
def fetch(url,limit=30_000_000):
    if not url.startswith("https://"):raise ValueError("Only https URLs supported")
    r=S.get(url,timeout=(12,32),allow_redirects=True)
    r.raise_for_status()
    if len(r.content)>limit:raise ValueError("File over research limit")
    return r.content,r.url
def save(row,raw,url,prefix,basis):
    with Image.open(io.BytesIO(raw)) as im:im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        image=ImageOps.exif_transpose(im).convert("RGB")
        w,h=image.size
        mobile=image.copy();mobile.thumbnail((390,500),Image.Resampling.LANCZOS)
        review=image.copy();review.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    sha=hashlib.sha256(raw).hexdigest()
    stem=f"{prefix}-{row['categoryIndex']}-{sha[:12]}"
    original=stem+".original";small=stem+"-phone.png";preview=stem+".webp"
    (OUT/original).write_bytes(raw)
    mobile.save(OUT/small,format="PNG")
    review.save(OUT/preview,format="WEBP",quality=88,method=4)
    expected=row.get("expectedNaturalAspect")
    return dict(categoryIndex=row["categoryIndex"],subject=row["subject"],
      sourceImage=url,sourcePage=row.get("sourcePage",row.get("url")),
      targetOriginal=row.get("physicalOriginal",""),identityClass=row.get("identityClass","IMAGE_LEAD_ONLY"),
      bytes=len(raw),width=w,height=h,sourceSHA256=sha,originalFile=original,phonePreview=small,reviewPreview=preview,
      basis=basis,relativeRatioError=(round(abs((w/h)/expected-1),4) if expected else None),
      visualEdgeVerification="REQUIRES_VISUAL_CHECK",rights="NOT_CLEARED_FOR_PUBLIC_APP",
      selectedWorkUnchanged=True,humanRatingsUnchanged=True)
def candidates_from_html(raw,base,needle):
    source=html.unescape(raw.decode("utf-8","ignore"))
    source=source.replace("\\/","/").replace("\\u002F","/").replace("\\u003A",":")
    soup=BeautifulSoup(source,"html.parser")
    pool=[]
    for elt in soup.select("img"):
        for attr in ("src","data-src","data-original","data-lazy-src","srcset","data-srcset"):
            v=elt.get(attr)
            if v:
                v=v.split(",")[-1].strip().split(" ")[0] if "srcset" in attr else v
                pool.append((urljoin(base,v),str(elt.get("alt",""))[:120],"img"))
    for e in soup.select("meta"):
        if "image" in str(e.get("name",""))+str(e.get("property","")):
            pool.append((urljoin(base,e.get("content","")),"OG image","meta"))
    regexp=r'https?://[^\s\\"\'<>]+?(?:\.(?:jpg|jpeg|png|webp)|/dms3rep/multi/opt/[^\s\\"\'<>]+)'
    for m in re.finditer(regexp,source,re.I):
        pool.append((m.group(0).strip("');,}"),"HTML embedded URL", "raw-html"))
    matches=[]
    used=set()
    for url,caption,basis in pool:
        url=url.replace("&amp;","&").replace("\\/","/")
        if not url.startswith("https://") or url in used:continue
        used.add(url)
        if not re.search(r"\.(jpg|jpeg|png|webp)(?:[?#]|$)|cdn-website\.com",url,re.I):continue
        if re.search(r"favicon|logo|brand|sprite|icon[-_.]|placeholder|whatsapp|facebook",url,re.I):continue
        weight=0
        if re.search("effr|efrem|sant.?eff|netti",url+" "+caption,re.I):weight+=25
        if re.search("painting|opera|opere|art|full|original",url+" "+caption,re.I):weight+=2
        if url.startswith("https://lirp.cdn-website.com"):weight+=4
        pos=source.lower().find(needle.lower())
        if pos>=0 and (near:=source.lower().find(url.lower()))>=0:weight+=int(max(0,10000-abs(near-pos))//2500)
        matches.append((weight,url,caption,basis))
    return sorted(matches,key=lambda x:x[0],reverse=True)[:14]
def contact_sheet(rows):
    good=[r for r in rows if r.get("phonePreview")]
    if not good:return
    tw,th=900,540
    canvas=Image.new("RGB",(tw,th*len(good)),(8,15,24))
    draw=ImageDraw.Draw(canvas)
    for i,row in enumerate(good):
        pic=Image.open(OUT/row["phonePreview"]).convert("RGB")
        canvas.paste(pic,((410-pic.width)//2, i*th+10+(505-pic.height)//2))
        for n,text in enumerate([row["subject"],row["targetOriginal"][:60],f"{row['width']} × {row['height']}px",row["basis"],row["visualEdgeVerification"],"NOT app-licensed; do not infer from research copy"]):
            draw.text((420,i*th+20+n*65),text[:74],fill=(245,229,208))
        draw.line((0,(i+1)*th-1,tw,(i+1)*th-1),fill="#55616e")
    canvas.save(OUT/"bulk-phone-contact-sheet.jpg",quality=88)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    manifest=json.loads(SPEC.read_text(encoding="utf-8"))
    records=[];sites=[]
    for row in manifest["imageSources"]:
        try:
            raw,url=fetch(row["url"])
            rec=save(row,raw,url,"exact-or-alternative","direct-provider")
            records.append(rec)
            print("DIRECT_IMAGE",row["categoryIndex"],rec["width"],rec["height"],flush=True)
        except Exception as e:
            records.append({"categoryIndex":row["categoryIndex"],"subject":row["subject"],"status":"SOURCE_HOLD","error":str(e)[:180]})
            print("DIRECT_HOLD",row["categoryIndex"],str(e)[:120],flush=True)
    for row in manifest["siteImageProbes"]:
        try:
            raw,actual=fetch(row["url"],8_000_000)
            matches=candidates_from_html(raw,actual,row.get("needle",""))
            site=dict(categoryIndex=row["categoryIndex"],subject=row["subject"],site=row["url"],candidates=[{"url":a,"score":sc,"label":c,"context":b} for sc,a,c,b in matches])
            sites.append(site)
            for score,url,caption,basis in matches[:8]:
                try:
                    imagebytes,actualurl=fetch(url,12_000_000)
                    rec=save(row,imagebytes,actualurl,"site-lead",basis+":"+caption)
                    rec["identityClass"]="SITE_MEDIA_UNVERIFIED_MAY_NOT_SHOW_THE_PAINTING"
                    records.append(rec)
                    print("SITE_IMAGE",row["categoryIndex"],rec["width"],rec["height"],round(score),flush=True)
                except Exception as exc:site.setdefault("fetchHolds",[]).append({"url":url,"error":str(exc)[:135]})
        except Exception as exc:
            sites.append(dict(categoryIndex=row["categoryIndex"],site=row["url"],error=str(exc)[:200]))
            print("SITE_HOLD",row["categoryIndex"],str(exc)[:100],flush=True)
    contact_sheet(records)
    counts={"directImagesAttempted":len(manifest["imageSources"]),
      "downloadedImageFiles":sum(bool(r.get("phonePreview")) for r in records),
      "siteImageCandidates":sum(len(r.get("candidates",[])) for r in sites),
      "newProductionApprovals":0}
    (OUT/"bulk-acquisition-QA.json").write_text(json.dumps({"schema":"AO_BULK_MOBILE_SOURCE_RESULTS_V1",
      "counts":counts,"images":records,"websiteProbes":sites,
      "notProofOfPermissionOrExactOriginal":True},ensure_ascii=False,indent=2)+"\n")
    print("BULK_COMPLETE",json.dumps(counts),flush=True)
if __name__=="__main__":main()
