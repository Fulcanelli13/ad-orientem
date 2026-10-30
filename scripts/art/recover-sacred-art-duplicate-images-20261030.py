#!/usr/bin/env python3
"""Recovery and QA for single-page Sacred Art duplicate review.

No substitute images: only exact supplied Commons File or museum object pages.
Review thumbnails are embedded, not certified production originals. Incomplete
groups are held and omitted from the reviewable gallery.
"""
from __future__ import annotations
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from html import unescape
from io import BytesIO
from pathlib import Path
import base64, hashlib, json, re, time, urllib.parse as U, urllib.request as Q
from PIL import Image, ImageOps

PAGE=Path("docs/SACRED_ART_DUPLICATE_REVIEW_20261030.html")
MANIFEST=Path("data/calendar/sacred-art-master-v2/duplicate-review-page-manifest-20261030.v1.json")
PROOF=Path("data/calendar/sacred-art-master-v2/duplicate-review-image-recovery-20261030.v1.json")
AGENT="AdOrientemSacredArtReview/1.0 (research project; source images)"
raw=PAGE.read_text(encoding="utf-8")
m=re.search(r"const payload=(\{[\s\S]*?\});\s*const groups=",raw)
if not m:raise ValueError("Embedded source gallery payload unavailable")
payload=json.loads(m.group(1))
groups=payload["groups"]
assert len(groups)>=10 and payload["reviewedCards"]==444
UA={"User-Agent":AGENT,"Accept":"image/jpeg,image/png,image/webp,image/*;q=0.9,text/html;q=0.6,application/json;q=0.6"}
def fetch(url,maxbytes=18_000_000):
    request=Q.Request(url,headers=UA)
    with Q.urlopen(request,timeout=22) as response:
        typ=response.headers.get("Content-Type","")
        body=response.read(maxbytes+1)
        if len(body)>maxbytes:raise ValueError("RESOURCE_TOO_LARGE")
        return body,response.geturl(),typ
def retry(url,rounds=2):
    err=None
    for k in range(rounds):
        try:return fetch(url)
        except Exception as e:err=e;time.sleep(1.1*(k+1))
    raise err
def as_thumb(data):
    with Image.open(BytesIO(data)) as im:
        im=ImageOps.exif_transpose(im)
        width,height=im.size
        if min(width,height)<240:raise ValueError("IMAGE_TOO_SMALL")
        if width/height>5 or height/width>5:raise ValueError("IMAGE_ASPECT_IMPLAUSIBLE")
        im.thumbnail((840,840),Image.Resampling.LANCZOS)
        if im.mode!="RGB":im=im.convert("RGB")
        buf=BytesIO();im.save(buf,format="JPEG",quality=83,optimize=True,progressive=True)
        small=buf.getvalue()
        if len(small)<3500:raise ValueError("THUMBNAIL_SUSPICIOUSLY_SMALL")
        return "data:image/jpeg;base64,"+base64.b64encode(small).decode("ascii"),{
          "originalDimensions":[width,height],"reviewDimensions":list(im.size),
          "downloadSha256":hashlib.sha256(data).hexdigest(),
          "thumbnailSha256":hashlib.sha256(small).hexdigest(),
          "thumbnailBytes":len(small)}
def commons_name(url):
    p=U.urlparse(url)
    path=U.unquote(p.path)
    if "/wiki/File:" not in path:return ""
    return path.split("/wiki/File:",1)[1].replace("_"," ")
def exact_candidate_urls(source,title="",artist=""):
    urls=[]
    parts=U.urlsplit(source);host=(parts.hostname or "").lower()
    name=commons_name(source)
    if name:
        fn=name.replace(" ","_")
        quoted=U.quote(fn,safe="(),-!._~")
        md=hashlib.md5(fn.encode("utf-8")).hexdigest()
        urls.extend([
            "https://commons.wikimedia.org/wiki/Special:Redirect/file/"+quoted+"?width=840",
            "https://upload.wikimedia.org/wikipedia/commons/thumb/"+md[0]+"/"+md[:2]+"/"+quoted+"/640px-"+quoted,
            "https://upload.wikimedia.org/wikipedia/commons/thumb/"+md[0]+"/"+md[:2]+"/"+quoted+"/330px-"+quoted,
            "https://upload.wikimedia.org/wikipedia/commons/"+md[0]+"/"+md[:2]+"/"+quoted
        ])
        # Ask Commons for this exact File's actual thumbnail to handle redirects/renames
        query=U.urlencode({"action":"query","format":"json","prop":"imageinfo","iiprop":"url|size",
          "iiurlwidth":840,"titles":"File:"+name})
        try:
            data,_,_=retry("https://commons.wikimedia.org/w/api.php?"+query,1)
            result=json.loads(data)
            for pg in result.get("query",{}).get("pages",{}).values():
                for img in pg.get("imageinfo",[]):
                    if img.get("thumburl"):urls.insert(0,img["thumburl"])
                    elif img.get("url"):urls.append(img["url"])
        except Exception:pass
    met=re.search(r"metmuseum\.org/art/collection/search/(\d+)",source)
    if met:
        try:
            blob,_,_=retry("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+met.group(1))
            ob=json.loads(blob)
            if str(ob.get("objectID"))==met.group(1) and ob.get("isPublicDomain"):
                urls.extend(x for x in (ob.get("primaryImageSmall"),ob.get("primaryImage")) if x)
        except Exception:pass
    artic=re.search(r"artic\.edu/artworks/(\d+)",source)
    if artic:
        try:
            blob,_,_=retry("https://api.artic.edu/api/v1/artworks/"+artic.group(1)+"?fields=id,image_id,is_public_domain")
            item=json.loads(blob).get("data",{})
            if str(item.get("id"))==artic.group(1) and item.get("is_public_domain") and item.get("image_id"):
                urls.insert(0,"https://www.artic.edu/iiif/2/"+item["image_id"]+"/full/840,/0/default.jpg")
        except Exception:pass
    # For non-API object pages, accept only the original object page's OG image.
    # Filtering excludes generic institution logos and unrelated gallery recommendations.
    if source and not name:
        try:
            blob,realurl,typ=retry(source,1)
            if "html" in typ or blob[:100].lstrip().startswith(b"<!"):
                html=blob[:7_000_000].decode("utf-8","replace")
                tags=re.findall(r"<meta\b[^>]+>",html,re.I)
                for tag in tags:
                    if re.search(r'\b(?:property|name)\s*=\s*["\'](?:og:image|twitter:image)["\']',tag,re.I):
                        match=re.search(r'\bcontent\s*=\s*["\']([^"\']+)["\']',tag,re.I)
                        if not match:continue
                        link=U.urljoin(realurl,unescape(match.group(1)))
                        low=link.lower()
                        # Page social-card metadata is frequently unrelated to the
                        # specified object (Christie's redirected to another lot).
                        # No third-party/generic social image may masquerade as
                        # an exact-source artwork photograph.
                        tokens=[x.lower() for x in re.findall(r"[A-Za-z]{5,}",title+" "+artist)
                                if x.lower() not in {"painting","saint","jesus","christ","master","school"}]
                        if (tokens and any(t in U.unquote(low) for t in tokens) and
                            not re.search(r"logo|avatar|favicon|placeholder|sprite|default-image|logo-social",low)):
                            urls.append(link)
        except Exception:pass
    return list(dict.fromkeys(u for u in urls if u.startswith("https://")))
# Preserve every already-embedded image and its source mapping.
cache={}
for g in groups:
    for item in g["members"]:
        p=item.get("preview","")
        if p.startswith("data:image/") and item.get("sourceUrl"):
            cache[item["sourceUrl"]]=p
# Same physical works independently identified by museum accession / institutional
# inventory. The Commons file is an ALTERNATE photo, not automatically the
# selected original and never a production-rights clearance.
VERIFIED_ALTERNATE_PAGES={
 "https://emuseum.mfah.org/objects/64360/madonna-and-child-with-souls-in-purgatory":
   "https://commons.wikimedia.org/wiki/File:Luca_Giordano_-_Madonna_and_Child_with_Souls_in_Purgatory_-_BF.2004.1_-_Museum_of_Fine_Arts.jpg",
 "https://catalogo.fondazionezeri.unibo.it/scheda/opera/47818/Lotto%20Lorenzo%2C%20Madonna%20del%20Rosario":
   "https://commons.wikimedia.org/wiki/File:Lorenzo_lotto,_madonna_del_rosario,_1539,_01.jpg",
 "https://www.wallraf.museum/2017-11-17-honthorst/":
   "https://commons.wikimedia.org/wiki/File:Adoration_of_the_shepherds,_by_Gerard_van_Honthorst.jpg",
 "https://artuk.org/discover/artworks/the-prayer-19241":
   "https://commons.wikimedia.org/wiki/File:Pierre_Edouard_Fr%C3%A8re_(1819-1886)_-_The_Prayer_-_OP6_-_Wolverhampton_Art_Gallery.jpg",
 "https://www.nga.gov/artworks/34956-return-prodigal-son":
   "https://commons.wikimedia.org/wiki/File:Return_of_the_Prodigal_Son_1667-1670_Murillo.jpg",
 "https://www.artic.edu/artworks/94841/the-song-of-the-lark":
   "https://commons.wikimedia.org/wiki/File:Song_of_the_Lark_-_Jules_Breton.png",
}
# Christie's URL for the Benson hero appears to identify a different lot.
# Do not quietly recover from a different item. No-source Van Dyck alias
# likewise remains held until independent exact-photo provenance exists.

def acquire(item):
    source=item.get("sourceUrl","")
    if not source:return None,{"reason":"NO_EXACT_PHOTO_SOURCE"}
    if source in cache:return cache[source],{"reason":"PREVIOUS_EMBED_EXACT_SOURCE"}
    urls=exact_candidate_urls(source,item.get("title",""),item.get("artist",""))
    errors=[]
    for u in urls[:9]:
        try:
            blob,resolved,contenttype=retry(u)
            thumb,metadata=as_thumb(blob)
            return thumb,{"reason":"RECOVERED_EXACT_SOURCE","imageUrl":resolved,"sourceUrl":source,**metadata}
        except Exception as e:errors.append(str(e)[:100])
    alternate=VERIFIED_ALTERNATE_PAGES.get(source)
    if alternate:
        mirror_urls=exact_candidate_urls(alternate,item.get("title",""),item.get("artist",""))
        for u in mirror_urls[:5]:
            try:
                data,real,content_type=retry(u)
                thumb,meta=as_thumb(data)
                return thumb,{"reason":"VERIFIED_SAME_WORK_ALTERNATE_NOT_ORIGINAL_PHOTO",
                   "sourceUrl":source,"alternatePhotoSourceUrl":alternate,
                   "imageUrl":real,**meta}
            except Exception as e:errors.append(str(e)[:100])
    return None,{"reason":"EXACT_SOURCE_IMAGE_NOT_RECOVERED","sourceUrl":source,
                 "attempted":len(urls),"alternateTried":bool(alternate),
                 "lastErrors":errors[-3:]}
missing={}
for g in groups:
    for mem in g["members"]:
        if not mem.get("preview","").startswith("data:image/"):
            missing.setdefault(mem.get("sourceUrl",""),[]).append(mem)
print("MISSING ITEMS",sum(len(v) for v in missing.values()),"SOURCE_URLS",len(missing),flush=True)
to_do=[{"sourceUrl":src,"title":items[0].get("title",""),
         "artist":items[0].get("artist","")} for src,items in missing.items() if src]
with ThreadPoolExecutor(max_workers=4) as pool:
    result=list(pool.map(acquire,to_do))
by_url={row["sourceUrl"]:value for row,value in zip(to_do,result)}
proof={"schema":"AO_SACRED_ART_DUPLICATE_RECOVERY_V1","asOf":datetime.now(timezone.utc).isoformat(),
 "sourcePagesAttempted":len(to_do),"images":[],"noSource":len(missing.get("",[])),
 "queue1Promotions":0,"licenceCertifications":0,"publicationMutations":0,"feeEur":0}
for src,items in missing.items():
    result=by_url.get(src,(None,{"reason":"NO_EXACT_PHOTO_SOURCE"}))
    thumb,details=result
    if thumb:
        cache[src]=thumb
        for item in items:
            item["preview"]=thumb
            if details.get("alternatePhotoSourceUrl"):
                item["reviewImageSourceUrl"]=details["alternatePhotoSourceUrl"]
                item["reviewImageSourceNote"]="Confirmed same physical artwork; alternate Commons photograph shown (not original selected photo)"
    proof["images"].append({"sourceUrl":src,"memberIds":[x["id"] for x in items],
        "recovered":bool(thumb),**details})
for g in groups:
    g["fullyEmbedded"]=all(x.get("preview","").startswith("data:image/") for x in g["members"])
payload["readyGroups"]=sum(g["fullyEmbedded"] for g in groups)
payload["heldGroups"]=len(groups)-payload["readyGroups"]
payload["incompleteGroupsHidden"]=True
new=json.dumps(payload,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
raw=raw[:m.start(1)]+new+raw[m.end(1):]
# Filter incomplete groups in the on-screen review, retaining all audit data inside the document.
PAGE.write_text(raw,encoding="utf-8")
summary=json.loads(MANIFEST.read_text())
summary.update({
 "groupsFullyEmbedded":payload["readyGroups"],
 "groupsHeldIncomplete":payload["heldGroups"],
 "previewMembers":sum(x.get("preview","").startswith("data:image/") for g in groups for x in g["members"]),
 "embeddedPreviewMembers":sum(x.get("preview","").startswith("data:image/") for g in groups for x in g["members"]),
 "remotePreviewMembers":0,
 "missingPreviewMembers":sum(not x.get("preview","").startswith("data:image/") for g in groups for x in g["members"]),
 "attemptedMissingSources":len(to_do),
 "recoveredExactSources":sum(v[0] is not None for v in by_url.values()),
 "incompleteGroupsHidden":True})
MANIFEST.write_text(json.dumps(summary,indent=2)+"\n")
# Keep a source-bound record of the ACTUAL displayed photo in every candidate
# so importing a visual preference cannot silently refer to a different file.
INDEX=Path("data/calendar/sacred-art-master-v2/duplicate-review-groups-20261030.v1.json")
index=json.loads(INDEX.read_text())
by_review_id={x["id"]:x for g in groups for x in g["members"]}
for g in index["groups"]:
    for x in g["members"]:
        shown=by_review_id.get(x["id"])
        if not shown:raise ValueError("Missing index member after image recovery")
        x["reviewImageSourceUrl"]=shown.get("reviewImageSourceUrl") or x["sourceUrl"]
        x["reviewImageSourceNote"]=shown.get("reviewImageSourceNote") or ""
INDEX.write_text(json.dumps(index,ensure_ascii=False,indent=2)+"\n")
PROOF.write_text(json.dumps(proof,indent=2)+"\n")
print(json.dumps({"reviewableGroups":payload["readyGroups"],
 "heldIncompleteGroups":payload["heldGroups"],"recoveredSourcePhotos":summary["recoveredExactSources"],
 "missingMembers":summary["missingPreviewMembers"]}),flush=True)
