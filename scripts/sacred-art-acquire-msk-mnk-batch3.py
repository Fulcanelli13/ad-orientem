#!/usr/bin/env python3
"""Research-only single-source artwork acquisition, MSK Gent + National Museum Krakow.

Strict official-source checks; no Commons, paid image providers, remote auth,
production asset imports or new artwork placements.
"""
import argparse, hashlib, io, json, re, urllib.parse, urllib.request
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from PIL import Image, ImageStat

MAX_BYTES=32*1024*1024
MAX_OBJECT_PIXELS=100_000_000
HOST_MSK="imagehub.mskgent.be"
HOST_MNK="zbiory.mnk.pl"
MIN_RESEARCH_WIDTH=1170

def get(url,host,accept,limit=MAX_BYTES):
    p=urllib.parse.urlparse(url)
    if p.scheme!="https" or p.hostname!=host or p.username or p.password:
        raise ValueError("not expected museum host: "+url)
    req=urllib.request.Request(url,headers={"User-Agent":"AdOrientemSacredArtResearch/1.0","Accept":accept})
    with urllib.request.urlopen(req,timeout=25) as response:
        final=response.geturl()
        resolved=urllib.parse.urlparse(final)
        if resolved.scheme!="https" or resolved.hostname!=host:
            raise ValueError("untrusted museum redirect: "+final)
        content_type=response.headers.get("Content-Type","").lower()
        data=response.read(limit+1)
    if not data or len(data)>limit:
        raise ValueError("bounded source response empty/oversized")
    return data,final,content_type

def official_json(url,host):
    raw,final,mime=get(url,host,"application/json",4*1024*1024)
    if "json" not in mime and raw[:1] not in (b"{",b"["):
        raise ValueError("source does not return JSON")
    return json.loads(raw.decode("utf-8")),final

def find_service_urls(obj):
    found=[]
    if isinstance(obj,dict):
        if (obj.get("type") or obj.get("@type")) in ("ImageService2","ImageService3"):
            candidate=obj.get("id") or obj.get("@id")
            if isinstance(candidate,str):found.append(candidate)
        for val in obj.values():
            found.extend(find_service_urls(val))
    elif isinstance(obj,list):
        for entry in obj:found.extend(find_service_urls(entry))
    return found

def msk_image_source(row):
    if row["sourceManifest"]!="https://imagehub.mskgent.be/iiif/3/6344/manifest.json":
        raise ValueError("unexpected MSK image manifest")
    doc,url=official_json(row["sourceManifest"],HOST_MSK)
    if not doc.get("items") or doc.get("type")!="Manifest":
        raise ValueError("expected IIIF Presentation 3 manifest with canvases")
    service_urls=list(dict.fromkeys(find_service_urls(doc.get("items"))))
    pinned=row.get("iiifManifestConfirmed",{}).get("imageServiceId")
    expected="https://imagehub.mskgent.be/iiif/2/public%2F6344.tif"
    if pinned!=expected:
        raise ValueError("source manifest photo service must match independently documented S-43 record")
    if service_urls and service_urls!=[expected]:
        raise ValueError("current manifest refers to different service, do not substitute")
    # IIIF Presentation manifests may declare an ImageService2 in a noncanonical
    # nesting shape; the item-specific source has been independently recorded.
    service=(service_urls[0] if service_urls else pinned).rstrip("/")
    resolution="CURRENT_MANIFEST_DECLARED" if service_urls else "PRIOR_INDEPENDENTLY_VERIFIED_PINNED_IMAGE_SERVICE"
    p=urllib.parse.urlparse(service)
    if p.scheme!="https" or p.hostname!=HOST_MSK or not p.path.startswith("/iiif/"):
        raise ValueError("manifest service not official MSK IIIF image host")
    if urllib.parse.unquote(p.path)!="/iiif/2/public/6344.tif":
        raise ValueError("manifest refers to wrong source TIFF photo 6344")
    return service+"/full/2000,/0/default.jpg",{"manifestUrl":url,"imageServiceUrl":service,"imageServiceResolution":resolution}

class MetaParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.metas={}
    def handle_starttag(self,tag,attrs):
        if tag.lower()!="meta":return
        d=dict(attrs)
        k=d.get("property") or d.get("name")
        if isinstance(k,str) and isinstance(d.get("content"),str):
            self.metas[k.lower()]=d["content"]

def mnk_source_image(row):
    raw,url,mime=get(row["sourceObject"],HOST_MNK,"text/html",3*1024*1024)
    if "html" not in mime:
        raise ValueError("museum object did not return HTML")
    parser=MetaParser();parser.feed(raw.decode("utf-8",errors="replace"))
    image=parser.metas.get("og:image") or parser.metas.get("twitter:image")
    if not image:
        raise ValueError("no exact object-linked og:image on museum page")
    photo=urllib.parse.urljoin(url,image)
    p=urllib.parse.urlparse(photo)
    if p.scheme!="https" or p.hostname!=HOST_MNK:
        raise ValueError("image is not hosted by museum")
    if not re.search(r"\.(?:jpeg|jpg)(?:$)",p.path,re.I):
        raise ValueError("museum meta image not direct JPEG")
    if re.search(r"(logo|placeholder|fallback|default[-_]?photo)",p.path,re.I):
        raise ValueError("museum metadata links generic site image")
    return photo,{"museumSourceObjectUrl":url,"pageImageEvidence":"og:image or twitter:image (exact object page)","pageTitle":parser.metas.get("og:title")}

def analyse(original,key,dest):
    if len(original)<1024 or not original.startswith(b"\xff\xd8\xff"):
        raise ValueError("not JPEG bytes")
    with Image.open(io.BytesIO(original)) as im:im.verify()
    with Image.open(io.BytesIO(original)) as im:
        im.load()
        width,height=im.size
        if width*height>MAX_OBJECT_PIXELS:raise ValueError("excessive source pixels")
        rgb=im.convert("RGB")
        sample=rgb.copy();sample.thumbnail((300,300),Image.Resampling.LANCZOS)
        sat=round(ImageStat.Stat(sample.convert("HSV").getchannel("S")).mean[0],2)
        filename=key.replace(":","_").replace("/","_")+".jpg"
        orig=dest/"original"/filename;orig.parent.mkdir(parents=True,exist_ok=True)
        orig.write_bytes(original)
        thumbnail=rgb.copy();thumbnail.thumbnail((700,900),Image.Resampling.LANCZOS)
        thumb=dest/"review"/filename;thumb.parent.mkdir(parents=True,exist_ok=True)
        thumbnail.save(thumb,"JPEG",quality=86)
        r=width/height
        return {"filename":str(orig),"thumbnail":str(thumb),
                "sha256":hashlib.sha256(original).hexdigest(),
                "bytes":len(original),"pixelWidth":width,"pixelHeight":height,
                "imageMode":im.mode,"imageFormat":im.format,
                "iccEmbedded":bool(im.info.get("icc_profile")),
                "saturation":sat,"measurableColour":sat>=5,
                "minimumSourceWidthPass":width>=MIN_RESEARCH_WIDTH,
                "wide390x240RetainedAreaPct":round(100*min(r/(390/240),(390/240)/r),1),
                "portrait390x520RetainedAreaPct":round(100*min(r/(390/520),(390/520)/r),1)}

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--manifest",required=True)
    parser.add_argument("--output",required=True)
    args=parser.parse_args()
    doc=json.loads(Path(args.manifest).read_text("utf-8"))
    expected={"MSKGent:S-43","MNK:II-a-448","MNK:II-a-9"}
    items=doc["candidates"]
    if len(items)!=3 or {x["workKey"] for x in items}!=expected:
        raise ValueError("exact three artwork identity guards failed")
    if any(x["ownerApproved"] or x["releaseReady"] for x in items):
        raise ValueError("release flag unexpectedly true")
    dest=Path(args.output);dest.mkdir(parents=True,exist_ok=True)
    report={"schema":"AO_SACRED_ART_MSK_MNK_BATCH3_ACTUAL_ACQUISITION_V1",
            "dateUtc":datetime.now(timezone.utc).isoformat(),
            "researchOnly":True,"publicAssetWrites":0,
            "ownerApprovals":0,"sourceAcquired":0,"sourceTechnicalPass":0,"records":[]}
    for row in items:
        key=row["workKey"]
        result={"workKey":key,"museumRecordUrl":row["sourceObject"],
                "rightsEvidence":row["rightsEvidence"],"releaseApproved":False,
                "photoLicenceFinalForProduction":False,
                "status":"SOURCE_NOT_RETRIEVED"}
        try:
            if row["sourceMethod"]=="MSK_GHENT_IIIF_MANIFEST_CANVAS_SERVICE":
                url,trail=msk_image_source(row)
                host=HOST_MSK
            elif row["sourceMethod"]=="MNK_OBJECT_HTML_EXACT_PHOTO_METADATA_ONLY":
                url,trail=mnk_source_image(row)
                host=HOST_MNK
            else:raise ValueError("unknown source acquisition method")
            raw,final,mime=get(url,host,"image/jpeg")
            if not ("jpeg" in mime or "octet-stream" in mime):
                raise ValueError("expected JPEG media type, got "+mime)
            details=analyse(raw,key,dest)
            result.update(trail)
            result.update(details)
            result["sourceUrl"]=url;result["verifiedUrl"]=final
            result["status"]="RETRIEVED_TECHNICAL_PASS_RESEARCH_ONLY" if details["measurableColour"] and details["minimumSourceWidthPass"] else "RETRIEVED_TECHNICAL_HOLD"
        except Exception as exc:
            result["error"]=type(exc).__name__+": "+str(exc)[:350]
        report["records"].append(result)
        print(key+": "+result["status"],flush=True)
    report["sourceAcquired"]=sum(x["status"].startswith("RETRIEVED") for x in report["records"])
    report["sourceTechnicalPass"]=sum(x["status"]=="RETRIEVED_TECHNICAL_PASS_RESEARCH_ONLY" for x in report["records"])
    (dest/"report.json").write_text(json.dumps(report,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")
    print("Actual source photos:",report["sourceAcquired"],"of 3. A successful workflow proves only that probes executed.")
    return 0
if __name__=="__main__":
    raise SystemExit(main())
