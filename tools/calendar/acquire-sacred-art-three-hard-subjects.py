#!/usr/bin/env python3
"""Single batch for 3 hard Sacred Art subjects; preserves master ledger and scores.
Image bytes and 390px images go only to private GitHub workflow artifact.
"""
import io, re, json, hashlib, requests, importlib.util
from pathlib import Path
from urllib.parse import urljoin
from bs4 import BeautifulSoup
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/calendar/sacred-art-review-uploads/20261016-final-three-hard-image-sources.v1.json"
OUT=ROOT/"artifacts/sacred-art-three-hard-subjects"
spec=importlib.util.spec_from_file_location("ao_acq",ROOT/"tools/calendar/acquire-sacred-art-unified-curator.py")
lib=importlib.util.module_from_spec(spec);spec.loader.exec_module(lib)
Image.MAX_IMAGE_PIXELS=100_000_000
def fetch(url):
    return lib.fetch(url,limit=30_000_000)
def verify_save(row,raw,final,reason):
    with Image.open(io.BytesIO(raw)) as im:im.verify()
    with Image.open(io.BytesIO(raw)) as im:
        im=ImageOps.exif_transpose(im).convert("RGB")
        w,h=im.size
        phone=im.copy();phone.thumbnail((390,500),Image.Resampling.LANCZOS)
        view=im.copy();view.thumbnail((1600,1600),Image.Resampling.LANCZOS)
    sha=hashlib.sha256(raw).hexdigest()
    root=f"3gap-{row['categoryIndex']}-{sha[:12]}"
    source=root+".original";preview=root+".webp";mobile=root+"-mobile.png"
    (OUT/source).write_bytes(raw)
    view.save(OUT/preview,"WEBP",quality=87,method=4)
    phone.save(OUT/mobile,"PNG")
    return dict(categoryIndex=row["categoryIndex"],title=row["title"],physicalOriginalId=row["physicalOriginalId"],
        sourceUrl=final,sourcePage=row["catalogueUrl"],rights=row["rights"],identity=row["originalMatch"],
        reason=reason,sourceBytes=len(raw),sourceSHA256=sha,sourceDimensions=[w,h],
        phoneDimensions=list(phone.size),originalFile=source,reviewFile=preview,phoneFile=mobile,
        status="SOURCE_IMAGE_ACQUIRED_VISUAL_CHECK_PENDING",publishable=False,ratingsChanged=False)
def page_leads(url):
    raw,resolved=fetch(url)
    html=raw.decode("utf8","ignore")
    doc=BeautifulSoup(html,"html.parser")
    found=[]
    for img in doc.find_all("img"):
        for attr in ("src","data-src","data-original","data-lazy-src","data-zoom","srcset"):
            s=img.get(attr)
            if s:
                if attr=="srcset":s=s.split(",")[-1].strip().split()[0]
                found.append(urljoin(resolved,s))
    for pat in [r'https?://[^\s\\"<>]+?\.(?:jpg|jpeg|png|webp)',r'/(?:images|media|upload|uploads)/[^\s\\"<>]+?\.(?:jpg|jpeg|png|webp)']:
        found.extend(urljoin(resolved,x) for x in re.findall(pat,html,re.I))
    filtered=[];seen=set()
    for x in found:
        x=x.replace("&amp;","&").replace("\\/","/")
        if x in seen or not x.startswith("https://"):continue
        seen.add(x)
        if re.search(r"favicon|logo|sprite|tracking|cookie|instagram|facebook|brand|pixel\.",x,re.I):continue
        if not re.search("sigecweb|beniculturali|iccd|jpg|jpeg|png|webp",x,re.I):continue
        filtered.append(x)
    def score(x):
        s=0
        for v in ("0900117888","cirillo","cyrill","fullsize","original","media"):
            if v in x.lower():s+=4
        return -s
    return sorted(filtered,key=score)[:16]
def sheet(rows):
    ready=[r for r in rows if r.get("phoneFile")]
    if not ready:return
    cw,ch=850,525
    output=Image.new("RGB",(cw,ch*len(ready)),(9,15,23))
    d=ImageDraw.Draw(output)
    for i,row in enumerate(ready):
        im=Image.open(OUT/row["phoneFile"]).convert("RGB")
        output.paste(im,((415-im.width)//2,i*ch+10+(500-im.height)//2))
        lines=[str(row["categoryIndex"])+" / "+row["title"],row["physicalOriginalId"],
          str(row["sourceDimensions"])+" source pixels",row["status"],
          "Physical artwork and license gates are independent"]
        for k,x in enumerate(lines):d.text((430,i*ch+30+k*70),x[:60],fill=(239,229,206))
    output.save(OUT/"three-hard-phone-proof.jpg",quality=88)
def main():
    OUT.mkdir(parents=True,exist_ok=True)
    spec=json.loads(INPUT.read_text())
    attempts=[];records=[]
    for row in spec["items"]:
        urls=list(row.get("candidateImageUrls",[]))
        if row.get("commonsFile"):
            try:
                v=lib.commons_info(row["commonsFile"])
                urls.extend([v["url"],v["display"]])
                attempts.append({"category":row["categoryIndex"],"commonsRightsMetadata":v["license"],"photoPage":v["sourcePage"]})
            except Exception as e:attempts.append({"category":row["categoryIndex"],"commonsHold":str(e)[:180]})
        if row["categoryIndex"]==41:
            try:
                institutional=page_leads(row["catalogueUrl"])
                urls.extend(institutional)
                attempts.append({"category":41,"institutionalImageLeads":institutional})
            except Exception as e:attempts.append({"category":41,"htmlProbeError":str(e)[:180]})
        ok=0
        for url in dict.fromkeys(urls):
            try:
                raw,final=fetch(url)
                rec=verify_save(row,raw,final,"DIRECT_FILE" if row["categoryIndex"]!=41 else "ICCD_SOURCE_IMAGE_LEAD")
                records.append(rec);ok+=1
                print("ACQUIRED",row["categoryIndex"],rec["sourceDimensions"],final[:100],flush=True)
                if ok>=3:break
            except Exception as e:
                attempts.append({"category":row["categoryIndex"],"url":url,"error":str(e)[:170]})
        if not ok:records.append({"categoryIndex":row["categoryIndex"],"physicalOriginalId":row["physicalOriginalId"],
            "status":"NO_QUALIFYING_SOURCE_FILE_RETRIEVED","publishable":False})
    sheet(records)
    counts={"categoryTargets":len(spec["items"]),"imageFilesDownloaded":sum(bool(r.get("phoneFile")) for r in records),
        "categoriesWithImageFiles":len({r["categoryIndex"] for r in records if r.get("phoneFile")}),
        "newStrictlyCertifiedCategories":0}
    report={"schema":"AO_SACRED_ART_THREE_HARD_SOURCE_QA_V1","counts":counts,"records":records,
        "discovery":attempts,"baselineStrictCoverage":"146/168","noCuratorChanges":True}
    (OUT/"three-hard-results.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n")
    print("THREE_HARD_COMPLETE",json.dumps(counts),flush=True)
if __name__=="__main__":main()
