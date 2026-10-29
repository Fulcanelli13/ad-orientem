#!/usr/bin/env python3
"""P87 — ONE worldwide 385-source visual-preview quality gate.

Reads the checksum-pinned P86 research queue; checks current Commons source
claims, downloads SMALL thumbnail bytes (never originals), and records
technical image quality, perceptual duplication and cross-site risks.
Only the final offline research ZIP carries images. No auto site identity,
visual subject certification, rights clearance, or production app writes.
"""
import argparse, collections, hashlib, html, importlib.util, io, json, math
import pathlib, re, time, urllib.error, urllib.parse, urllib.request, zipfile
from PIL import Image, ImageFilter, ImageOps, ImageStat, UnidentifiedImageError

ROOT=pathlib.Path(__file__).resolve().parents[2]
P86_QUEUE_SHA="088ed95f549dbd9ad8ff2669d8365cec29a8287dbc83b8ed7564f1ed8fc5acd0"
P86_SCHEMA="AO_P86_FINAL_SINGLE_WORLDWIDE_PHOTO_REVIEW_V1"
SCHEMA="AO_P87_385_SOURCE_VISUAL_PREVIEW_QA_V1"
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
SHARDS=3
API="https://commons.wikimedia.org/w/api.php"
UA="AdOrientemResearchP87VisualPreviews/1.0 (https://github.com/Fulcanelli13/ad-orientem)"
MAX_IMAGE_BYTES=1_300_000
Image.MAX_IMAGE_PIXELS=24_000_000

def sha(v):
    return hashlib.sha256(pathlib.Path(v).read_bytes()).hexdigest()
def guard(v,why):
    if not v:raise ValueError(why)
def safe_title(t):
    return (isinstance(t,str) and t.startswith("File:") and
            6<len(t)<=260 and not any(x in t for x in ("\r","\n","\0","..","|","?","#")))
def canon(s):
    return " ".join(str(s).replace("_"," ").casefold().split())
def checked_url(url,allowed):
    u=urllib.parse.urlsplit(str(url or ""))
    if (u.scheme!="https" or u.hostname not in allowed or
        u.username or u.password or u.port not in (None,443)):
        raise ValueError("Unsafe network host for preview")
    return url
def lineage(queue,audit):
    q=pathlib.Path(queue)
    a=json.loads(pathlib.Path(audit).read_text(encoding="utf8"))
    guard(a["schema"]==P86_SCHEMA and a["review_source_queue_sha256"]==sha(q)==P86_QUEUE_SHA
          and a["one_final_reviewer_candidates"]==385 and
          a["original_p83_reviewer_candidates"]==301 and
          a["p85_research_candidates_recovered"]==84 and
          a["p85_remaining_source_holds"]==7316 and
          a["original_image_bytes_downloaded"]==a["subject_verified"]==
              a["rights_approved"]==a["photos_published"]==0,
          "P87 input must be exactly the immutable P86 385-source research review")
    rows=[json.loads(s) for s in q.read_text(encoding="utf8").splitlines() if s.strip()]
    guard(len(rows)==385,"P86 source queue truncated")
    ids=set()
    for r in rows:
        guard(re.fullmatch(r"RG-[A-F0-9-]{10,30}",r["physical_anchor_id"]) is not None
              and safe_title(r["file_title"])
              and r["publication"]==HOLD and r["published"] is False
              and r["exact_site_verified"] is False and
              r["rights_independently_cleared"] is False and
              r["original_bytes_verified"] is False,
              "Previously approved, unsafe or malformed P86 research source")
        key=(r["physical_anchor_id"],canon(r["file_title"]))
        guard(key not in ids,"P87 duplicate original source venue/file")
        ids.add(key)
    rows.sort(key=lambda r:(r["country"],r["place_name"].casefold(),r["physical_anchor_id"],canon(r["file_title"])))
    return rows,a

def source_token(row):
    return "p87-"+hashlib.sha256((row["physical_anchor_id"]+"\0"+row["file_title"]).encode()).hexdigest()[:20]
def commons_query(titles):
    p=urllib.parse.urlencode({"action":"query","format":"json","formatversion":"2",
        "prop":"imageinfo","iiprop":"url|sha1|size|mime|extmetadata",
        "titles":"|".join(titles),"iiurlwidth":"480"})
    return API+"?"+p

def fetch_bytes(url,allowed,limit,timeout=40,retries=2):
    checked_url(url,allowed)
    last=None
    for attempt in range(retries+1):
        try:
            req=urllib.request.Request(url,headers={"User-Agent":UA,"Accept":"*/*","Accept-Encoding":"identity"})
            with urllib.request.urlopen(req,timeout=timeout) as h:
                checked_url(h.geturl(),allowed)
                b=h.read(limit+1)
            if len(b)>limit:raise ValueError("Oversized or original-sized preview response")
            return b,None
        except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError,ValueError,OSError) as e:
            last=type(e).__name__+":"+str(e)[:100]
            if attempt<retries:time.sleep(2.5*(attempt+1))
    return None,last

def query_pages(titles):
    data,error=fetch_bytes(commons_query(titles),{"commons.wikimedia.org"},5_000_000)
    if error:return {},error
    try:
        o=json.loads(data)
        pages=o["query"]["pages"]
        guard(isinstance(pages,list) and len(pages)<=len(titles),"Invalid Wikimedia page batch")
        return {canon(p.get("title")):p for p in pages},None
    except (TypeError,ValueError,KeyError,UnicodeError) as e:
        return {},"INVALID_COMMONS_JSON_"+type(e).__name__

def source_check(page,row):
    if not page or page.get("missing") or not page.get("imageinfo"):
        return None,"HOLD_MISSING_COMMONS_SOURCE"
    if canon(page.get("title"))!=canon(row["file_title"]):
        return None,"HOLD_MOVED_OR_DIFFERENT_COMMONS_TITLE"
    if row.get("commons_page_id") is not None and page.get("pageid")!=row["commons_page_id"]:
        return None,"HOLD_CHANGED_COMMONS_PAGE_ID"
    info=page["imageinfo"][0]
    value=str(info.get("sha1") or "").lower()
    if not re.fullmatch("[a-f0-9]{40}",value):
        return None,"HOLD_SOURCE_SHA1_MISSING"
    if row.get("original_sha1_claim") and value!=row["original_sha1_claim"]:
        return None,"HOLD_SOURCE_SHA1_REVISION_CHANGED"
    if (info.get("mime") not in ("image/jpeg","image/png","image/webp")
        or int(info.get("width",0))<650 or int(info.get("height",0))<650
        or int(info.get("size",0))<1000 or int(info.get("size",0))>16_000_000):
        return None,"HOLD_IMAGE_SIZE_OR_FORMAT"
    uri=info.get("thumburl")
    try:checked_url(uri,{"upload.wikimedia.org","thumb.wikimedia.org"})
    except ValueError:return None,"HOLD_NO_TRUSTED_THUMBNAIL_URL"
    return {"current_original_sha1":value,
            "current_page_id":page.get("pageid"),
            "original_width":info["width"],"original_height":info["height"],
            "original_bytes_metadata":info["size"],
            "thumb_url":uri},None

def d_hash(im):
    small=ImageOps.grayscale(im).resize((9,8),Image.Resampling.LANCZOS)
    v=list(small.getdata());key=0
    for y in range(8):
        for x in range(8):
            key=(key<<1)|(1 if v[y*9+x]>v[y*9+x+1] else 0)
    return f"{key:016x}"

def make_preview(raw):
    try:
        with Image.open(io.BytesIO(raw)) as src:
            if getattr(src,"is_animated",False):raise ValueError("animated source")
            src.verify()
        with Image.open(io.BytesIO(raw)) as src:
            src=ImageOps.exif_transpose(src)
            guard(src.width>70 and src.height>70 and src.width*src.height<=24_000_000,
                  "Not enough visual preview pixels or decompression bomb")
            im=src.convert("RGB")
    except (UnidentifiedImageError,OSError,ValueError,Image.DecompressionBombError) as exc:
        raise ValueError("Unusable preview format: "+str(exc)[:70]) from exc
    im.thumbnail((420,420),Image.Resampling.LANCZOS)
    gray=ImageOps.grayscale(im)
    stat=ImageStat.Stat(gray)
    contrast=round(stat.stddev[0],2)
    entropy=round(gray.entropy(),2)
    edges=gray.filter(ImageFilter.FIND_EDGES)
    edge_score=round(ImageStat.Stat(edges).stddev[0],2)
    flags=[]
    if contrast<22:flags.append("CHECK_LOW_CONTRAST")
    if entropy<4.5:flags.append("CHECK_LOW_VISUAL_DETAIL")
    if edge_score<12:flags.append("CHECK_POSSIBLY_SOFT_OR_TEXTURELESS")
    # These are PRELIMINARY heuristic flags; low-light interiors and smooth
    # façades can score badly without being unsuitable photos.
    buf=io.BytesIO();im.save(buf,format="WEBP",quality=76,method=4)
    encoded=buf.getvalue()
    guard(100<len(encoded)<120_000,"Preview derivative unsuitable for permanent research bank")
    qa={"preview_width":im.width,"preview_height":im.height,
        "gray_contrast_sd":contrast,"gray_entropy":entropy,
        "edge_variation":edge_score,"dhash":d_hash(im),
        "technical_review_flags":flags,
        "preview_derivative_sha256":hashlib.sha256(encoded).hexdigest(),
        "preview_derivative_bytes":len(encoded)}
    return encoded,qa

def run_shard(queue,audit,out,shard,delay=.4,source_loader=query_pages,preview_loader=None):
    guard(shard in range(SHARDS) and .2<=delay<=4,"Three strictly bounded technical shards")
    rows,_=lineage(queue,audit)
    selected=[r for i,r in enumerate(rows) if i%SHARDS==shard]
    root=pathlib.Path(out)
    guard(not root.exists(),"Never overwrite an existing P87 shard")
    root.mkdir(parents=True)
    thumbs=root/"thumbs";thumbs.mkdir()
    bytitle=collections.defaultdict(list)
    for r in selected:bytitle[canon(r["file_title"])].append(r)
    ordered=sorted(bytitle)
    outcomes=[]
    api_calls=0;image_requests=0
    preview_loader=preview_loader or (lambda url:fetch_bytes(url,{"upload.wikimedia.org","thumb.wikimedia.org"},MAX_IMAGE_BYTES))
    for pos in range(0,len(ordered),16):
        titles=ordered[pos:pos+16]
        pages,error=source_loader([bytitle[x][0]["file_title"] for x in titles])
        api_calls+=1
        for title in titles:
            for row in bytitle[title]:
                result={"review_id":source_token(row),
                    "physical_anchor_id":row["physical_anchor_id"],"country":row["country"],
                    "place_name":row["place_name"],"file_title":row["file_title"],
                    "source_url":row["source_url"],
                    "original_sha1_claim":row.get("original_sha1_claim"),
                    "publication":HOLD,"published":False,"rights_approved":False,
                    "subject_verified":False,"image_approved":False,
                    "original_bytes_downloaded":False}
                if error: result["status"]="HOLD_COMMONS_METADATA_QUERY_FAILED";result["reason"]=error
                else:
                    metadata,hold=source_check(pages.get(title),row)
                    if hold: result["status"]=hold
                    else:
                        image_requests+=1
                        data,err=preview_loader(metadata["thumb_url"])
                        if err or not data:
                            result["status"]="HOLD_THUMBNAIL_DOWNLOAD_FAILED"
                            result["reason"]=str(err)[:180]
                        else:
                            try:derivative,qa=make_preview(data)
                            except ValueError as e:
                                result["status"]="HOLD_INVALID_PREVIEW_BYTES"
                                result["reason"]=str(e)[:180]
                            else:
                                dest=thumbs/(result["review_id"]+".webp")
                                dest.write_bytes(derivative)
                                result.update({"status":"PREVIEW_CAPTURED_REQUIRES_HUMAN_SUBJECT_CHECK",
                                               "source_metadata":metadata,**qa,
                                               "thumbnail_sha256":hashlib.sha256(data).hexdigest(),
                                               "thumbnail_download_bytes":len(data),
                                               "local_preview":"thumbs/"+dest.name})
                outcomes.append(result)
                if image_requests and image_requests%15==0:time.sleep(delay)
        if pos+16<len(ordered):time.sleep(delay)
    guard(len(outcomes)==len(selected) and len({x["review_id"] for x in outcomes})==len(outcomes),
          "All P87 shard source identities required")
    stats=collections.Counter(x["status"] for x in outcomes)
    info={"schema":SCHEMA,"shard":shard,"shard_count":SHARDS,
          "input_p86_queue_sha256":sha(queue),
          "input_p86_audit_sha256":sha(audit),
          "source_assignments":len(outcomes),"distinct_commons_file_titles":len(ordered),
          "commons_metadata_requests":api_calls,"thumbnail_requests":image_requests,
          "previews_captured":stats["PREVIEW_CAPTURED_REQUIRES_HUMAN_SUBJECT_CHECK"],
          "status_counts":dict(sorted(stats.items())),"originals_downloaded":0,
          "rights_approved":0,"subject_verified":0,"published":0}
    (root/f"p87-shard-{shard}.json").write_text(
        json.dumps({"summary":info,"records":outcomes},ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
    print("P87_WORLD_PREVIEW_SHARD="+json.dumps(info,sort_keys=True),flush=True)
    return info

def hamming(a,b):
    return (int(a,16)^int(b,16)).bit_count()

def contact_sheets(root,rows):
    # Contact sheets are for human/assistant visual inspection; no automated
    # semantic building identification is inferred from them.
    sheets=root/"contact-sheets";sheets.mkdir()
    per=48
    for start in range(0,len(rows),per):
        section=rows[start:start+per];cols=6;w=192;h=168
        canvas=Image.new("RGB",(cols*w,math.ceil(len(section)/cols)*h),(24,32,42))
        from PIL import ImageDraw
        d=ImageDraw.Draw(canvas)
        for i,r in enumerate(section):
            x=(i%cols)*w;y=(i//cols)*h
            path=root/(r.get("local_preview") or "missing")
            if path.is_file():
                with Image.open(path) as im:
                    im=im.convert("RGB")
                    im.thumbnail((182,120),Image.Resampling.LANCZOS)
                    canvas.paste(im,(x+(w-im.width)//2,y+4))
            d.text((x+5,y+126),f"{start+i+1:03d} "+str(r["country"])+" "+r["physical_anchor_id"][-6:],fill=(238,238,238))
            d.text((x+5,y+143),str(r["place_name"])[:25],fill=(196,200,205))
        dest=sheets/f"contact-{start//per+1:02d}.jpg"
        canvas.save(dest,format="JPEG",quality=77,optimize=True)

def consolidate(queue,audit,shards,out):
    rows,p86=lineage(queue,audit)
    expected={source_token(r):r for r in rows}
    guard(len(expected)==385,"Review identifier collision")
    root=pathlib.Path(out)
    guard(not root.exists(),"Refuse overwrite of P87 complete preview campaign")
    root.mkdir(parents=True)
    (root/"thumbs").mkdir()
    found={};reports=[];source_hashes=set()
    for sh in range(SHARDS):
        base=pathlib.Path(shards)/f"shard-{sh}"
        payload=json.loads((base/f"p87-shard-{sh}.json").read_text(encoding="utf8"))
        meta=payload["summary"]
        guard(meta["schema"]==SCHEMA and meta["shard"]==sh and meta["shard_count"]==SHARDS
              and meta["input_p86_queue_sha256"]==sha(queue)
              and meta["input_p86_audit_sha256"]==sha(audit)
              and meta["source_assignments"]==len(payload["records"]) and
              meta["originals_downloaded"]==meta["rights_approved"]==
              meta["subject_verified"]==meta["published"]==0,
              "P87 shard source drift or accidental rights/media promotion")
        reports.append(meta)
        for r in payload["records"]:
            k=r["review_id"]
            guard(k in expected and k not in found and
                  r["physical_anchor_id"]==expected[k]["physical_anchor_id"] and
                  r["file_title"]==expected[k]["file_title"] and
                  r["published"] is False and r["rights_approved"] is False and
                  r["subject_verified"] is False and r["original_bytes_downloaded"] is False,
                  "P87 missing, repeated or approved image")
            idx=rows.index(expected[k])
            guard(idx%SHARDS==sh,"P87 source assigned to incorrect technical shard")
            path=r.get("local_preview")
            if path:
                guard(path=="thumbs/"+k+".webp" and r["status"]=="PREVIEW_CAPTURED_REQUIRES_HUMAN_SUBJECT_CHECK",
                      "Unsafe preview path")
                source=base/path
                guard(source.exists() and sha(source)==r["preview_derivative_sha256"]
                      and source.stat().st_size==r["preview_derivative_bytes"],
                      "P87 preview binary missing or has changed")
                dest=root/path
                guard(not dest.exists(),"Cross-shard preview file collision")
                dest.write_bytes(source.read_bytes())
            found[k]=r
    guard(set(found)==set(expected) and len(found)==385,"Incomplete P87 385-image review")
    allrows=[found[source_token(row)] for row in rows]
    hashes=collections.defaultdict(list)
    for r in allrows:
        if r.get("dhash"):hashes[r["dhash"]].append(r)
    # Near duplicates are REVIEW WARNINGS, NOT automatically false sites.
    downloadable=[r for r in allrows if r.get("dhash")]
    duplicates=[]
    for i,r in enumerate(downloadable):
        for other in downloadable[i+1:]:
            if r["physical_anchor_id"]!=other["physical_anchor_id"] and hamming(r["dhash"],other["dhash"])<=4:
                duplicates.append({"source_a":r["review_id"],"source_b":other["review_id"],
                    "distance":hamming(r["dhash"],other["dhash"]),"same_physical_site":False})
                r.setdefault("cross_site_image_similar_to",[]).append(other["review_id"])
                other.setdefault("cross_site_image_similar_to",[]).append(r["review_id"])
    flags=collections.Counter(f for r in allrows for f in r.get("technical_review_flags",[]))
    status=collections.Counter(r["status"] for r in allrows)
    sites={r["physical_anchor_id"] for r in rows}
    captured_sites={r["physical_anchor_id"] for r in allrows if r.get("local_preview")}
    summary={"schema":"AO_P87_COMPLETE_WORLDWIDE_PREVIEW_QUALITY_GATE_V1",
        "p86_queue_sha256":sha(queue),"p86_audit_sha256":sha(audit),
        "photographic_assignments":385,"review_site_ids":len(sites),
        "countries":len({r["country"] for r in rows}),
        "previews_captured":len(downloadable),"sites_with_captured_preview":len(captured_sites),
        "previews_unavailable_or_held":385-len(downloadable),
        "unique_file_titles":len({canon(r["file_title"]) for r in rows}),
        "source_metadata_requests":sum(m["commons_metadata_requests"] for m in reports),
        "thumbnail_requests":sum(m["thumbnail_requests"] for m in reports),
        "source_statuses":dict(sorted(status.items())),
        "quality_flags_for_human_review":dict(sorted(flags.items())),
        "possible_duplicate_pairs_across_sites":len(duplicates),
        "no_automatic_semantic_subject_validation":True,
        "rights_cleared":0,"original_image_bytes_downloaded":0,
        "photos_approved":0,"photos_published":0,
        "publication":HOLD}
    (root/"audit.json").write_text(json.dumps(summary,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    (root/"evidence.json").write_text(json.dumps({"schema":SCHEMA,"records":allrows,
          "duplicate_warnings":duplicates},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    contact_sheets(root,allrows)
    # Reuse the one P84/P86 reviewer, keeping stable IDs and STORAGE decisions.
    mod=importlib.util.spec_from_file_location("p87_canonical_renderer",
        ROOT/"tools/directory/build-p84-worldwide-bulk-photo-review.py")
    renderer=importlib.util.module_from_spec(mod);mod.loader.exec_module(renderer)
    preview_rows=renderer.read(queue, pathlib.Path(queue).with_name("reviewer-input.json"))
    mapping={r["review_id"].replace("p87-","p84-"):r for r in allrows}
    guard(len(preview_rows)==len(mapping)==385,"P84/P87 canonical review IDs differ")
    for item in preview_rows:
        match=mapping.get(item["id"])
        guard(match is not None,"P87 must retain prior P86 review state IDs")
        item["preview"]=match.get("local_preview") or ""
        item["qa"]=" | ".join(
            ([match["status"]] if match["status"]!="PREVIEW_CAPTURED_REQUIRES_HUMAN_SUBJECT_CHECK" else ["Captured low-res research preview"])
            +match.get("technical_review_flags",[])
            +(["POSSIBLE_DUPLICATE_IMAGE_DIFFERENT_CHURCH"] if match.get("cross_site_image_similar_to") else []))
        item["preview_sha256"]=match.get("preview_derivative_sha256","")
    encode=lambda v:json.dumps(v,ensure_ascii=False,separators=(",",":")).replace("<",r"\u003c").replace(">",r"\u003e").replace("&",r"\u0026")
    page=renderer.PAGE.replace("__DATA__",encode(preview_rows)).replace("__SOURCE_SHA__",encode(sha(queue)))
    page=page.replace("One worldwide photo review — 250 or 500 at a time",
        "One worldwide photo review — visually inspect 385 actual thumbnails")
    page=page.replace("Screen the entire P83 source-eligible review queue in one interface.",
        "Screen 385 source-image PREVIEWS (not original files) across 183 church IDs.")
    page=page.replace("img.src=r.preview;img.loading", "if(r.preview)img.src=r.preview;img.loading")
    page=page.replace('body.appendChild(make("div","meta",r.title));',
        'body.appendChild(make("div","meta",r.title));body.appendChild(make("div","meta warning",r.qa));')
    page=page.replace("Research metadata only · No originals downloaded · No images approved or published",
        "P87 captured research previews only · No originals downloaded · Exact site and rights still NOT verified · No images approved")
    page=page.replace('"AO_DIRECTORY_P84_BULK_RESEARCH_REVIEW_V1"',
        '"AO_DIRECTORY_P87_WORLDWIDE_PREVIEW_REVIEW_V1"')
    (root/"index.html").write_text(page,encoding="utf8")
    guard(page.count("<script>")==page.count("</script>")==1 and
          "Export complete review JSON" in page and
          len(page.encode())<9_000_000,"Unsafe P87 canonical reviewer")
    guide="P87 AD ORIENTEM: ONE OFFLINE WORLDWIDE PHOTO REVIEW\n\n"
    guide+="Unzip this complete research package. Open index.html in a browser. Thumbnails live in thumbs/ and require no network.\n"
    guide+="This is the SAME 385-source P86 review with stable review IDs and the existing decisions storage namespace.\n"
    guide+="Every image is a small transform of a Wikimedia Commons source, NOT a verified image of the exact listed building.\n"
    guide+="Heuristic technical flags, source conflicts, blurred/low contrast images and cross-site visual matches need human visual inspection.\n"
    guide+="DO NOT treat a Keep decision as approval, rights clearance, building identity certification or permission to publish.\n"
    guide+="Do not treat failed downloads as rejection; they remain holds. No original files or approved image derivatives are in this ZIP.\n"
    guide+="The contact-sheets/ folder contains whole-world visual sheets for rapid internal inspection.\n"
    guide+="Export all decisions once from the single review HTML. Keep localStorage and preserve all prior Keep/Reject/Hold decisions.\n"
    (root/"README.txt").write_text(guide)
    archive=pathlib.Path(str(root)+".zip")
    guard(not archive.exists(),"No overwriting worldwide immutable visual review ZIP")
    with zipfile.ZipFile(archive,"w",compression=zipfile.ZIP_DEFLATED,compresslevel=6) as z:
        for path in sorted(root.rglob("*")):
            if path.is_file():z.write(path,path.relative_to(root).as_posix())
    guard(archive.stat().st_size<=32_000_000,"P87 repository-sized free research archive budget exceeded")
    print("P87_ALL_385_PREVIEWS="+json.dumps({**summary,"zip_bytes":archive.stat().st_size,
          "zip_sha256":sha(archive)},sort_keys=True),flush=True)
    return summary

def main():
    p=argparse.ArgumentParser()
    p.add_argument("--queue",type=pathlib.Path,required=True)
    p.add_argument("--audit",type=pathlib.Path,required=True)
    p.add_argument("--out",type=pathlib.Path,required=True)
    p.add_argument("--shard",type=int)
    p.add_argument("--source-shards",type=pathlib.Path)
    p.add_argument("--delay",type=float,default=.4)
    a=p.parse_args()
    if a.source_shards:consolidate(a.queue,a.audit,a.source_shards,a.out)
    else:guard(a.shard is not None,"P87 shard number or source-shards required");run_shard(a.queue,a.audit,a.out,a.shard,a.delay)
if __name__=="__main__":main()
