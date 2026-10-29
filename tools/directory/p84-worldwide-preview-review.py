#!/usr/bin/env python3
"""P84 worldwide Directory photo preview transport and one consolidated review.

Technical shards are not editorial batches. All source/subject/rights controls
stay research-only. Only bounded Commons thumbnails are downloaded, never
original photographs. Main app and approval registries are untouched.
"""
from __future__ import annotations
import argparse, collections, hashlib, html, importlib.util, io, json, re, shutil, time
import urllib.parse
from pathlib import Path
from PIL import Image, ImageDraw

ROOT=Path(__file__).resolve().parents[2]
SPEC=importlib.util.spec_from_file_location("ao_p79_reusable_thumb",ROOT/"tools/screen-all-502-commons-p79.py")
P79=importlib.util.module_from_spec(SPEC);SPEC.loader.exec_module(P79)
TEMPLATE=ROOT/"tools/directory/p84-worldwide-review-template.html"
SHARDS=8
BATCH=20
LIMIT=2579*4
HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
VALID_STATUS={"REVIEW_QUEUE_GEO_SOURCE_PIN_CORROBORATED","REVIEW_QUEUE_LOCALITY_AND_NAME_CORROBORATED"}
LICENSES={"CC0","CC BY 2.0","CC BY 3.0","CC BY 4.0",
          "CC BY SA 2.0","CC BY SA 3.0","CC BY SA 4.0"}

def check(v,msg):
    if not v:raise ValueError(msg)

def sha(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()

def read(path):
    return json.loads(Path(path).read_text(encoding="utf8"))

def canonical(r):
    return (r["physical_anchor_id"],r["file_title"],r.get("original_sha1_claim"))

def queue_rows(path,summary_path):
    summary=read(summary_path)
    check(summary["schema"]=="AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1","Bad P83 summary schema")
    check(summary["anchors_accounted"]==2579 and summary["countries"]==76,"Not whole-world P83 source")
    check(summary["approved_photos"]==summary["rights_cleared"]==summary["original_photos_downloaded"]==summary["published_photos"]==0,
          "P83 source prematurely approved")
    rows=[json.loads(line) for line in Path(path).read_text(encoding="utf8").splitlines() if line.strip()]
    check(len(rows)==summary["review_queue_assignments"] and len(rows)<=LIMIT,
          "P83 preview queue mismatch or unbounded source population")
    check(len({canonical(r) for r in rows})==len(rows),"P83 has duplicate exact source assignment")
    for r in rows:
        check(r["screening_disposition"] in VALID_STATUS,"P83 noneligible source was promoted")
        check(r["publication"]==HOLD and r["published"] is False and
              r["rights_independently_cleared"] is False and
              r["exact_site_verified"] is False and
              r["original_bytes_verified"] is False,"Unapproved media source contract broken")
        check(r["rights_metadata_status"]=="SUPPORTED_LICENSE_METADATA_CLAIM_NOT_INDEPENDENTLY_CLEARED",
              "P83 unverified licensing candidate mistakenly queued")
        check(re.fullmatch(r"[a-f0-9]{40}",str(r.get("original_sha1_claim") or "")),
              "P84 cannot recheck Commons image without SHA1 claim")
        source=urllib.parse.urlsplit(r["source_url"])
        check(source.scheme=="https" and source.hostname=="commons.wikimedia.org" and
              source.username is None and source.password is None,"Non-Commons source URL")
    return rows,summary

def clean(t):
    return P79.clean(t)

def verify_metadata(record,page):
    check(page is not None and not page.get("missing"),"COMMONS_ORIGINAL_FILE_MISSING")
    check(page.get("title")==record["file_title"] and
          int(page.get("pageid",0))==int(record["commons_page_id"]),"COMMONS_PAGE_ID_OR_TITLE_CHANGED")
    info=(page.get("imageinfo") or [None])[0]
    check(isinstance(info,dict),"COMMONS_CURRENT_IMAGEINFO_UNAVAILABLE")
    check(info.get("sha1")==record["original_sha1_claim"],"COMMONS_ORIGINAL_SHA1_METADATA_CHANGED")
    check(info.get("mime") in ("image/jpeg","image/png","image/webp"),"UNSUPPORTED_SOURCE_MIME")
    width,height=int(info.get("width",0)),int(info.get("height",0))
    size=int(info.get("size",0))
    check(min(width,height)>=650 and size<=16_000_000 and width*height<=32_000_000,
          "SOURCE_IMAGE_TOO_LARGE_OR_TOO_SMALL")
    original=urllib.parse.urlsplit(str(info.get("url") or ""))
    check(original.scheme=="https" and original.hostname=="upload.wikimedia.org" and
          not original.username and not original.password,"COMMONS_ORIGINAL_URL_MISSING_OR_UNSAFE")
    meta=info.get("extmetadata") or {}
    fld=lambda field:clean((meta.get(field) or {}).get("value"))
    license_name=fld("LicenseShortName")
    compact=" ".join(license_name.replace("-"," ").split()).upper()
    if compact in ("CC0 1.0","CC 0","CC0"):normalized="CC0"
    else:normalized=compact
    check(normalized in LICENSES,"CURRENT_LICENSE_NOT_SUPPORTED")
    good,reason=P79.legit_license(normalized,fld("LicenseUrl"))
    check(good,"CURRENT_"+reason)
    artist=fld("Artist")
    check(artist and artist.lower() not in ("unknown","anonymous"),"CURRENT_CREDIT_MISSING")
    return info,{"license":normalized,"license_url":fld("LicenseUrl"),
                 "photographer":artist[:320],"current_original_sha1":info["sha1"],
                 "current_width":width,"current_height":height,
                 "source_meta_status":"CURRENT_COMMONS_METADATA_ELIGIBLE_NOT_LICENSE_APPROVED"}

def fallback_url(r):
    link=r.get("preview_url") or ""
    p=urllib.parse.urlsplit(link)
    if p.scheme=="https" and p.hostname in {"upload.wikimedia.org","thumb.wikimedia.org"} and not p.username and not p.password:
        return link
    return ""

def record_hold(r,index,reason):
    return {"row_index":index,"physical_anchor_id":r["physical_anchor_id"],
            "file_title":r["file_title"],"original_sha1_claim":r["original_sha1_claim"],
            "screening_disposition":r["screening_disposition"],
            "source_meta_status":"HOLD_CURRENT_SOURCE_METADATA",
            "hold_reason":str(reason)[:190],"preview_verified":False,
            "preview_local_path":"","preview_url":fallback_url(r),
            "source_subject_verified":False,"rights_cleared":False,
            "original_bytes_verified":False,"published":False}

def screen_group(rows,pages,base,out,delay,thumb_loader=None):
    """Page identity, current SHA1, attribution, licence and tiny preview only."""
    scanned=[]
    for rowindex,r in rows:
        entry=record_hold(r,rowindex,"NOT_SCREENED")
        try:
            info,current=verify_metadata(r,pages.get(r["file_title"]))
            entry.update(current)
            entry["hold_reason"]=""
            entry["preview_url"]=info.get("thumburl") if fallback_url({"preview_url":info.get("thumburl","")}) else fallback_url(r)
            entry["source_meta_status"]="CURRENT_COMMONS_METADATA_ELIGIBLE_NOT_LICENSE_APPROVED"
            try:
                thumb=(thumb_loader or P79.thumbnail)(info)
                check(isinstance(thumb,Image.Image) and min(thumb.size)>60,"PREVIEW_NOT_DECODABLE")
                name="previews/p84-%05d.jpg"%(rowindex+1)
                target=out/name;target.parent.mkdir(parents=True,exist_ok=True)
                thumb.convert("RGB").save(target,format="JPEG",quality=77,optimize=True)
                entry["preview_local_path"]=name
                entry["preview_sha256"]=sha(target)
                entry["preview_verified"]=True
            except Exception as exc:
                entry["hold_reason"]="THUMBNAIL_"+type(exc).__name__+":"+str(exc)[:130]
            if delay:time.sleep(delay)
        except Exception as exc:
            entry["hold_reason"]=type(exc).__name__+":"+str(exc)[:160]
            # QA only: a source-metadata hold must not prevent visual inspection.
            # This thumbnail is a research reference, NOT a verified Commons
            # original, licensed image, or photograph of the correct church.
            link=fallback_url(r)
            if link:
                try:
                    thumb=(thumb_loader or P79.thumbnail)({"thumburl":link})
                    check(isinstance(thumb,Image.Image) and min(thumb.size)>60,
                          "UNVERIFIED_QA_PREVIEW_NOT_DECODABLE")
                    name="previews/p84-%05d.jpg"%(rowindex+1)
                    target=out/name;target.parent.mkdir(parents=True,exist_ok=True)
                    thumb.convert("RGB").save(target,format="JPEG",quality=77,optimize=True)
                    entry["preview_local_path"]=name
                    entry["preview_sha256"]=sha(target)
                    entry["preview_verified"]=True
                    entry["qa_only_thumbnail_metadata_hold"]=True
                except Exception as preview_exc:
                    entry["qa_thumbnail_error"]=type(preview_exc).__name__+":"+str(preview_exc)[:130]
        scanned.append(entry)
    return scanned

def worker(queue,summary,out,shard,delay=0.35,query=None,thumb_loader=None):
    check(0<=shard<SHARDS,"Unexpected P84 transport shard")
    check(0<=delay<=2,"Unbounded Commons pacing")
    rows,_=queue_rows(queue,summary)
    check(not out.exists(),"Refuse to overwrite source worker")
    out.mkdir(parents=True)
    subset=[(i,r) for i,r in enumerate(rows) if i%SHARDS==shard]
    collected=[]
    for start in range(0,len(subset),BATCH):
        group=subset[start:start+BATCH]
        try:
            raw=(query or P79.api_query)([{"source_file":r["file_title"]} for _,r in group])
            check(isinstance(raw,dict),"Invalid Commons metadata batch")
        except Exception as exc:
            raw={}
            error="COMMONS_METADATA_BATCH_"+type(exc).__name__+":"+str(exc)[:130]
            collected.extend(record_hold(r,i,error) for i,r in group)
            continue
        collected.extend(screen_group(group,raw,start,out,delay,thumb_loader))
    result={"schema":"AO_P84_WHOLE_WORLD_PREVIEW_WORKER_V1","shard":shard,
            "total_shards":SHARDS,"p83_queue_sha256":sha(queue),
            "count":len(subset),"preview_verified":sum(r["preview_verified"] for r in collected),
            "source_meta_eligible":sum(r["source_meta_status"].startswith("CURRENT_") for r in collected),
            "approved":0,"published":0,"records":collected}
    target=out/("p84-shard-%02d.json"%shard)
    target.write_text(json.dumps(result,ensure_ascii=False,separators=(",",":"))+"\n",encoding="utf8")
    check(len(collected)==len(subset),"P84 worker silently skipped sources")
    print("P84_PREVIEW_SHARD="+json.dumps({k:v for k,v in result.items() if k!="records"}),flush=True)
    return result

def image_sheet(pictures,root,number):
    if not pictures:return
    w,h=240,202
    board=Image.new("RGB",(w*5,h*5),"#eef1ef")
    dr=ImageDraw.Draw(board)
    for i,r in enumerate(pictures):
        x=(i%5)*w;y=(i//5)*h
        path=root/r["preview_local_path"] if r.get("preview_verified") else None
        if path and path.exists():
            with Image.open(path) as img:
                img.thumbnail((w-12,h-65),Image.Resampling.LANCZOS)
                board.paste(img.convert("RGB"),(x+(w-img.width)//2,y+(h-65-img.height)//2))
        else:
            dr.rectangle((x+7,y+8,x+w-7,y+h-67),outline="#9c6755",width=2)
            dr.text((x+20,y+60),"NO PREVIEW",fill="#a25645")
        dr.text((x+9,y+h-59),"#"+str(r["row_index"]+1)+" "+r["country"],fill="#253338")
        dr.text((x+9,y+h-40),r["place_name"][:31],fill="#283c40")
        dr.text((x+9,y+h-21),r["file_title"].removeprefix("File:")[:30],fill="#68787a")
    path=root/"contact-sheets"/("p84-contact-%03d.jpg"%number)
    path.parent.mkdir(parents=True,exist_ok=True)
    board.save(path,quality=80,optimize=True)

def consolidate(queue,summary,parts,out):
    rows,p83=queue_rows(queue,summary)
    check(not out.exists(),"Refuse to overwrite P84 global visual review")
    paths=sorted(parts.glob("p84-shard-*.json"))
    check({p.name for p in paths}=={"p84-shard-%02d.json"%i for i in range(SHARDS)},
          "Missing/extra P84 technical shard")
    checks={}
    for shard,path in enumerate(paths):
        blob=read(path)
        check(blob["schema"]=="AO_P84_WHOLE_WORLD_PREVIEW_WORKER_V1" and
              blob["shard"]==shard and blob["total_shards"]==SHARDS and
              blob["p83_queue_sha256"]==sha(queue) and
              blob["count"]==len(blob["records"]) and
              blob["approved"]==blob["published"]==0,"Wrong P84 worker lineage")
        for rec in blob["records"]:
            idx=rec["row_index"]
            check(idx not in checks and 0<=idx<len(rows) and idx%SHARDS==shard,
                  "P84 unexpected or duplicate row index")
            original=rows[idx]
            check((rec["physical_anchor_id"],rec["file_title"],rec["original_sha1_claim"])==canonical(original),
                  "P84 worker reassigned image to wrong physical site")
            check(not rec["source_subject_verified"] and not rec["rights_cleared"] and
                  not rec["original_bytes_verified"] and not rec["published"],"P84 auto-approved an image")
            if rec["preview_verified"]:
                name="previews/p84-%05d.jpg"%(idx+1)
                check(rec["preview_local_path"]==name,"Noncanonical P84 preview path")
                source=parts/name
                check(source.is_file() and sha(source)==rec["preview_sha256"],
                      "Missing/tampered original acquired thumbnail")
            checks[idx]=rec
    check(len(checks)==len(rows),"P84 worldwide campaign incomplete")
    out.mkdir(parents=True)
    if (parts/"previews").is_dir():
        shutil.copytree(parts/"previews",out/"previews")
    pictures=[]
    for i,r in enumerate(rows):
        rec=checks[i]
        p={**r,**rec}
        check(p["publication"]==HOLD and not p["published"] and not p["rights_cleared"],
              "P84 visual-review record incorrectly approved")
        pictures.append(p)
    archive_summary={
        "schema":"AO_P84_SINGLE_WORLDWIDE_PREVIEW_REVIEW_V1",
        "anchors_accounted":2579,"countries_accounted":76,
        "p83_source_sha256":sha(queue),
        "p84_screen_sha256":hashlib.sha256(json.dumps([checks[i] for i in sorted(checks)],sort_keys=True,ensure_ascii=False).encode()).hexdigest(),
        "source_screened_assignments":len(rows),
        "preview_verified":sum(r["preview_verified"] for r in pictures),
        "current_source_metadata_eligible":sum(r["source_meta_status"].startswith("CURRENT_") for r in pictures),
        "preview_holds":sum(not r["preview_verified"] for r in pictures),
        "held_assignments":p83["held_assignments"],
        "publication":HOLD,"original_bytes_downloaded":0,
        "original_sha1_bytes_verified":0,"subject_approvals":0,"licence_approvals":0,
        "photo_publications":0,
        "notice":"Research-only source screening, not site identity or photographic rights approval."
    }
    (out/"p84-one-worldwide-review-summary.json").write_text(json.dumps(archive_summary,indent=2,ensure_ascii=False)+"\n",encoding="utf8")
    (out/"p84-one-worldwide-review-source-audit.json").write_text(
        json.dumps({"schema":"AO_P84_ONE_WORLDWIDE_REVIEW_AUDIT_V1",
                    "summary":archive_summary,"records":checks},ensure_ascii=False,indent=2)+"\n",encoding="utf8")
    template=TEMPLATE.read_text(encoding="utf8")
    marker="/*P84_EMBED_REVIEW_DATA*/"
    check(template.count(marker)==1,"Review template lost exact source injection marker")
    data=json.dumps(pictures,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    stat=json.dumps(archive_summary,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    result=template.replace(marker,"const RECORDS="+data+";\nconst SUMMARY="+stat+";")
    (out/"index.html").write_text(result,encoding="utf8")
    for start in range(0,len(pictures),25):
        image_sheet(pictures[start:start+25],out,start//25)
    print("P84_WORLDWIDE_COMPLETE="+json.dumps(archive_summary,sort_keys=True),flush=True)
    return archive_summary

def main():
    ap=argparse.ArgumentParser()
    ap.add_argument("--queue",type=Path,required=True)
    ap.add_argument("--summary",type=Path,required=True)
    ap.add_argument("--out",type=Path,required=True)
    ap.add_argument("--shard",type=int)
    ap.add_argument("--parts",type=Path)
    ap.add_argument("--delay",type=float,default=0.35)
    ap.add_argument("--check",action="store_true")
    a=ap.parse_args()
    rows,info=queue_rows(a.queue,a.summary)
    if a.check:
        print("P84_OFFLINE_ALL_WORLD="+json.dumps({"anchors":info["anchors_accounted"],
              "candidate_assignments":len(rows),"technical_shards":SHARDS,
              "photo_approvals":0,"publication":0}),flush=True)
    elif a.parts is not None:
        consolidate(a.queue,a.summary,a.parts,a.out)
    elif a.shard is not None:
        worker(a.queue,a.summary,a.out,a.shard,delay=a.delay)
    else:raise ValueError("Select --check, --shard or --parts")
if __name__=="__main__":main()
