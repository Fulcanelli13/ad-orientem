#!/usr/bin/env python3
"""P75: visually review 150 existing P70 Commons assignments in one bounded audit.
Never writes to the approved Place gallery or production asset directory.
"""
import argparse,hashlib,html,importlib.util,io,json,os,re,time
from pathlib import Path
from urllib.parse import urlencode
from PIL import Image,ImageDraw,ImageOps
ROOT=Path(__file__).resolve().parents[1]
MANIFEST=ROOT/"data/geography/research/p75-existing-commons-150-image-review.v1.json"
OUT=ROOT/"data/geography/research/p75-review-artifacts"
P72=ROOT/"tools/verify-priority-commons-p72.py"
spec=importlib.util.spec_from_file_location("p72_helpers",P72)
helper=importlib.util.module_from_spec(spec);spec.loader.exec_module(helper)
Image.MAX_IMAGE_PIXELS=32_000_000
MAX_BYTES=15*1024*1024
UA="AdOrientemCommonsP75/1.0 (github.com/Fulcanelli13/ad-orientem; research-only exact-photo auditing)"
def norm(x):
    return re.sub(r"[^a-z0-9]","",str(x or "").lower())
def clean(x):
    return " ".join(html.unescape(re.sub(r"<[^>]*>"," ",str(x or ""))).split())
def require(v,msg):
    if not v:raise ValueError(msg)

def load():
    d=json.loads(MANIFEST.read_text(encoding="utf8"))
    rows=d["candidates"]
    require(d["schema"]=="AO_P75_EXISTING_P70_150_IMAGE_REVIEW_V1" and len(rows)==150,"Frozen P75 manifest invalid")
    require(len({r["place_id"] for r in rows})>=90,"Too few Places")
    require([r["index"] for r in rows]==list(range(1,151)),"Noncontiguous index")
    require(len({r["frozen_original_sha1"] for r in rows})==len(rows),"Duplicate originals")
    for r in rows:
        require(r["segment"]==(r["index"]-1)//50+1,"Invalid segment")
        require(r["place_id"].startswith("place:") and r["file_title"].startswith("File:"),"Wrong source identity")
        require(re.fullmatch("[0-9a-f]{40}",r["frozen_original_sha1"]) is not None,"Bad frozen SHA1")
        require(r["approved"] is False and r["published"] is False,"Premature approval")
        require(r["editorial_state"]=="NEEDS_VISUAL_AND_SUBJECT_REVIEW","Candidate promoted in research")
    return rows

def metadata(rows):
    query=urlencode({"action":"query","format":"json","formatversion":"2",
      "prop":"imageinfo","iiprop":"sha1|size|url|mime|extmetadata","titles":"|".join(r["file_title"] for r in rows)})
    d=helper.get_url_json("https://commons.wikimedia.org/w/api.php?"+query)
    pages=d["query"]["pages"]
    vals=pages.values() if isinstance(pages,dict) else pages
    return {p["title"]:p for p in vals if "missing" not in p}

def validate_claim(row,info):
    ext=info.get("extmetadata",{})
    def get(k):return clean((ext.get(k) or {}).get("value"))
    claim=norm(row["license_claim"])
    current=norm(get("LicenseShortName"))
    if claim in ("cc0","cc010"):require(current in ("cc0","cc010"),"CC0 grant changed")
    elif claim=="publicdomain":require(current in ("publicdomain","pdbecauseold","pdold"),"Public domain rights are not independently settled")
    else: require(current==claim,"Creative Commons licence changed")
    require(get("Artist") and get("Artist").lower() not in ("unknown","anonymous"),"Author absent")
    require(info["sha1"].lower()==row["frozen_original_sha1"],"Commons original SHA1 changed")
    require(info["mime"]=="image/jpeg" and info["size"]<=MAX_BYTES,"Unexpected original type/size")
    require((info["width"],info["height"])==(row["width"],row["height"]),"Image dimensions changed")
    require(min(info["width"],info["height"])>=900,"Image too small")
    # We keep the licence as an unapproved claim; other depicted-work rights
    # still need editorial checking, even if Commons labels look permissible.
    return {"current_license":get("LicenseShortName"),"current_artist":get("Artist")[:300],
      "license_url":get("LicenseUrl"),"metadata_sha1":info["sha1"]}

def create_sheet(records,segment):
    w,h=350,270
    board=Image.new("RGB",(w*5,h*10),"#f6f4ef")
    draw=ImageDraw.Draw(board)
    for n,item in enumerate(records):
        col=n%5;row=n//5;x=col*w;y=row*h
        im=item.pop("_thumbnail",None)
        if im is not None:
            board.paste(im,(x+(w-im.width)//2,y+(204-im.height)//2))
        else:
            draw.rectangle((x+12,y+8,x+w-12,y+203),outline="#c5b9aa",width=2)
            draw.text((x+20,y+75),"NO VERIFIED PREVIEW",fill="#a43b36")
        draw.text((x+9,y+210),f'{item["index"]:03d} {item["status"][:22]}',fill="#222222")
        draw.text((x+9,y+226),str(item["place_label"])[:49],fill="#363636")
        draw.text((x+9,y+243),str(item["file_title"]).removeprefix("File:")[:49],fill="#666666")
    file=OUT/f"p75-contact-sheet-{segment:02d}.jpg"
    board.save(file,quality=84)
    return str(file)

def run(rows,delay):
    require(1.2<=delay<=8,"Rate-limiting delay must be 1.2-8 seconds")
    OUT.mkdir(parents=True,exist_ok=True)
    results=[]
    for segment in (1,2,3):
        group=rows[(segment-1)*50:segment*50]
        try: pages=metadata(group);api_error=None
        except Exception as exc:pages={};api_error=type(exc).__name__+": "+str(exc)[:220]
        batch=[]
        for r in group:
            outcome={"index":r["index"],"segment":segment,"place_id":r["place_id"],
              "place_label":r["place_label"],"file_title":r["file_title"],
              "source_url":r["source_url"],"expected_sha1":r["frozen_original_sha1"],
              "claimed_license":r["license_claim"],"status":"HOLD",
              "original_sha1_verified":False,"source_licence_metadata_matches":False,
              "visual_contact_preview":False,"subject_approved":False,
              "rights_cleared":False,"approved":False,"published":False}
            try:
                require(api_error is None,"Commons API request: "+str(api_error))
                p=pages.get(r["file_title"])
                require(p is not None and p.get("pageid")==r["commons_page_id"],"Commons file page mismatch")
                info=p["imageinfo"][0]
                current=validate_claim(r,info)
                outcome.update(current);outcome["source_licence_metadata_matches"]=True
                original,observed_sha1=helper.download_original(info["url"])
                require(observed_sha1==r["frozen_original_sha1"],"Downloaded original SHA1 mismatch")
                with Image.open(io.BytesIO(original)) as img:
                    require(img.format=="JPEG" and img.size==(r["width"],r["height"]),"Original failed decoding/size checks")
                    thumb=ImageOps.exif_transpose(img)
                    thumb.thumbnail((330,200),Image.Resampling.LANCZOS)
                    outcome["_thumbnail"]=thumb.convert("RGB").copy()
                outcome["original_sha1_verified"]=True
                outcome["visual_contact_preview"]=True
                outcome["bytes_verified"]=len(original)
                outcome["status"]="HASH_VERIFIED_REVIEW_SUBJECT"
            except Exception as exc:
                outcome["status"]="HOLD_NEEDS_REVIEW"
                outcome["block_reason"]=type(exc).__name__+": "+str(exc)[:250]
            batch.append(outcome)
            print("P75_FILE="+json.dumps({k:v for k,v in outcome.items() if k!="_thumbnail"},ensure_ascii=False),flush=True)
            if r["index"]<150:time.sleep(delay)
        file=create_sheet(batch,segment)
        results.extend(batch)
        print("P75_SEGMENT="+json.dumps({"segment":segment,"attempted":50,
          "verified":sum(z["original_sha1_verified"] for z in batch),"preview":file,
          "holds":sum(not z["original_sha1_verified"] for z in batch)}),flush=True)
        if api_error:
            print("P75_RATE_LIMIT_HOLD="+api_error,flush=True)
            # Don't issue additional API calls after a metadata service outage.
            # Remaining segments still get explicit rows/contact sheets.
    with (OUT/"p75-150-candidate-hash-audit.jsonl").open("w",encoding="utf8") as f:
        for z in results:
            f.write(json.dumps({k:v for k,v in z.items() if k!="_thumbnail"},ensure_ascii=False)+"\n")
    summary={"candidate_assignments":len(results),"distinct_places":len({x["place_id"] for x in results}),
      "sha1_verified":sum(x["original_sha1_verified"] for x in results),
      "held":sum(not x["original_sha1_verified"] for x in results),
      "images_approved":0,"published":0}
    (OUT/"p75-summary.json").write_text(json.dumps(summary,indent=2)+"\n",encoding="utf8")
    print("P75_SUMMARY="+json.dumps(summary),flush=True)
    if not summary["sha1_verified"]:
        raise RuntimeError("P75 no verified originals: closed without any approval")
if __name__=="__main__":
    ap=argparse.ArgumentParser()
    ap.add_argument("--dry-run",action="store_true")
    ap.add_argument("--delay",type=float,default=1.6)
    args=ap.parse_args()
    rows=load()
    if args.dry_run:print("P75_OFFLINE_PASS="+json.dumps({"assignments":len(rows),"places":len({r["place_id"] for r in rows}),"segments":3,"approved":0}))
    else:run(rows,args.delay)
