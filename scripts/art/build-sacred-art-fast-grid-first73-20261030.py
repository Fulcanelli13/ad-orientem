#!/usr/bin/env python3
"""Prepare self-contained photo-grid reviewer: local embedded 640px JPEG previews.

The source is the frozen first 73 review. Photo preview generation does not
certify the photo is pristine or fit for production. Keep failures in Queue 2.
"""
from __future__ import annotations
import base64
import csv
import hashlib
import io
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path
from PIL import Image, ImageOps, UnidentifiedImageError

ROOT=Path("data/calendar/sacred-art-master-v1")
INPUT=ROOT/"first-pristine-photo-review.csv"
OUT=Path("docs/SACRED_ART_FAST_GRID_REVIEW_BATCH01_20261030.html")
LEDGER=ROOT/"fast-grid-first73-previews-20261030.v1.json"
AGENT="AdOrientemSacredArtReview/2026-10-30 (+https://github.com/Fulcanelli13/ad-orientem)"
def openurl(url, maxbytes=22_000_000):
    req=urllib.request.Request(url,headers={"User-Agent":AGENT,
      "Accept":"image/avif,image/webp,image/jpeg,image/png,image/*;q=0.8,application/json;q=0.5,*/*;q=0.2"})
    with urllib.request.urlopen(req,timeout=25) as resp:
        data=resp.read(maxbytes+1)
        if len(data)>maxbytes:
            raise RuntimeError("MAX_BYTES_EXCEEDED")
        return data,resp.geturl(),resp.headers.get("Content-Type","")
def attempt(url):
    last=None
    for i in range(3):
        try:return openurl(url)
        except Exception as e:last=e;time.sleep(0.5*(i+1))
    raise last
with INPUT.open(encoding="utf-8-sig",newline="") as f:
    rows=list(csv.DictReader(f))
assert len(rows)==73
def commons_file(url):
    if "/wiki/File:" not in url:return None
    s=url.split("/wiki/",1)[1].split("?",1)[0]
    try:s=urllib.parse.unquote(s)
    except Exception:pass
    return s.replace("_"," ")
def commons_thumbs(rows):
    titles=[commons_file(x["source_url"]) for x in rows]
    titles=[t for t in titles if t]
    result={}
    for start in range(0,len(titles),20):
        subset=titles[start:start+20]
        params=urllib.parse.urlencode({"action":"query","format":"json","redirects":"1",
          "prop":"imageinfo","iiprop":"url|sha1|size","iiurlwidth":"690",
          "titles":"|".join(subset)})
        try:
            raw,_,_=attempt("https://commons.wikimedia.org/w/api.php?"+params)
            jsondata=json.loads(raw)
            mapping={s["from"].lower():s["to"] for s in
              jsondata.get("query",{}).get("normalized",[])+
              jsondata.get("query",{}).get("redirects",[])}
            for p in jsondata.get("query",{}).get("pages",{}).values():
                item=(p.get("imageinfo") or [{}])[0]
                if item.get("url"):
                    result[p["title"].lower()]=item
            for original,corrected in mapping.items():
                if corrected.lower() in result:
                    result[original.lower()]=result[corrected.lower()]
            print("Commons metadata", min(start+20,len(titles)),len(titles),flush=True)
        except Exception as e:
            print("COMMONS_METADATA_FAILURE",start,str(e)[:150],flush=True)
    return result
commons=commons_thumbs(rows)
def museum_candidates(row):
    url=row["source_url"]
    m=re.search(r"/art/collection/search/(\d+)",url)
    if m:
        n=m.group(1)
        try:
            content,_,_=attempt("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+n)
            data=json.loads(content)
            if int(data.get("objectID",0))==int(n) and data.get("isPublicDomain"):
                return [x for x in [data.get("primaryImageSmall"),data.get("primaryImage")] if x]
        except Exception as e:
            print("MET_API_FAILURE",n,str(e)[:100],flush=True)
    c=re.search(r"clevelandart.org/art/([\w.]+)",url)
    if c:
        number=c.group(1)
        # Exact accession here, not provider's numeric internal id
        try:
            data=json.loads(attempt("https://openaccess-api.clevelandart.org/api/artworks/?accession_number="+urllib.parse.quote(number))[0])
            rec=data.get("data",[])
            if isinstance(rec,dict):rec=[rec]
            for item in rec:
                if item.get("accession_number")==number and item.get("share_license_status")=="CC0":
                    return [item.get("images",{}).get(key,{}).get("url")
                            for key in ("web","print") if item.get("images",{}).get(key,{}).get("url")]
        except Exception as e:
            print("CMA_API_FAILURE",number,str(e)[:100],flush=True)
        # Official CDN predictable accession from authoritative source path, not a different work
        return ["https://openaccess-cdn.clevelandart.org/"+number+"/"+number+"_web.jpg",
                "https://openaccess-cdn.clevelandart.org/"+number+"/"+number+"_print.jpg"]
    return []
def make_data_uri(content):
    with Image.open(io.BytesIO(content)) as im:
        im=ImageOps.exif_transpose(im)
        if im.width<150 or im.height<150:raise ValueError("IMAGE_TOO_SMALL")
        original_shape=[im.width,im.height]
        im.thumbnail((700,700),Image.Resampling.LANCZOS)
        if im.mode not in ("RGB","L"):im=im.convert("RGB")
        stream=io.BytesIO()
        im.save(stream,"JPEG",quality=79,optimize=True,progressive=True)
        img=stream.getvalue()
        return "data:image/jpeg;base64,"+base64.b64encode(img).decode(),\
          {"originalImageDimensions":original_shape,"reviewPreviewDimensions":[im.width,im.height],
           "previewBytes":len(img),"previewSha256":hashlib.sha256(img).hexdigest()}
cards=[];image_meta=[]
for index,row in enumerate(rows,1):
    url=row["source_url"]
    attempts=[]
    if title:=commons_file(url):
        c=commons.get(title.lower(),{})
        attempts=[c.get("thumburl"),c.get("url")]
        if not attempts[0]:
            # fallback Commons redirect (metadata fetch can fail)
            attempts.append("https://commons.wikimedia.org/wiki/Special:Redirect/file/"+
               urllib.parse.quote(title.removeprefix("File:"))+"?width=690")
    else:attempts=museum_candidates(row)
    attempts=[x for x in dict.fromkeys(attempts) if x]
    preview=None;details={};error=""
    for imageurl in attempts:
        try:
            data,resolved,ctype=attempt(imageurl)
            preview,details=make_data_uri(data)
            details.update({"imageSourceUrl":imageurl,"imageResolvedUrl":resolved,
             "downloadBytes":len(data),"downloadSha256":hashlib.sha256(data).hexdigest(),
             "originalSourcePhotoFingerprint":row["selected_photo_file_fingerprint"],
             "sourceOriginalSha256":row["original_sha256"],
             "reproducedPreviewNotAReleaseMaster":True})
            break
        except Exception as e:
            error=str(e)[:160]
    card={"id":row["physical_work_group"],"title":row["title"] or "Untitled source record",
       "artist":row["artist"] or "Unattributed","sourceUrl":url,
       "module":row["module_targets"],"priorRightsEvidence":row["rights_evidence"],
       "rightsLabel":row["rights_label"],"sourcePhotoFingerprint":row["selected_photo_file_fingerprint"],
       "sourceOriginalSha256":row["original_sha256"],"preview":preview,
       "available":preview is not None,"error":error if not preview else ""}
    cards.append(card)
    image_meta.append({"id":card["id"],"loaded":card["available"],
      "error":card["error"],"source":url,**details})
    print("REVIEW_IMAGE",index, "OK" if preview else "FAILED",
      row["title"][:45], "bytes="+str(details.get("previewBytes",0)), flush=True)
assert len({x["id"] for x in cards})==73
count=sum(x["available"] for x in cards)
manifest={"schema":"AO_FAST_REVIEW73_EMBEDDED_PREVIEW_QA_20261030_V1",
 "source":"data/calendar/sacred-art-master-v1/first-pristine-photo-review.csv",
 "total":73,"previewsEmbedded":count,"previewsMissing":73-count,
 "first73Locked":True,"userPhotoQualityApprovalsGranted":0,
 "productionPhotoApprovalsGranted":0,
 "rightsAndFileBytePublicationChecksBypassed":False,"originalSourcePhotosAltered":False,
 "previewEvidence":image_meta}
LEDGER.write_text(json.dumps(manifest,indent=2)+"\n",encoding="utf-8")
payload=json.dumps(cards,ensure_ascii=False).replace("<","\\u003c").replace(">","\\u003e")
HTML=r'''<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · One-click Sacred Art Review · Batch 01</title>
<style>
:root{color-scheme:dark;background:#10161c;color:#edf1f3;font-family:system-ui,-apple-system,sans-serif}
*{box-sizing:border-box}body{margin:0}
header{background:#151f29;border-bottom:1px solid #34414d;padding:24px max(18px,4vw)}
h1{font:normal clamp(26px,3.3vw,39px) Georgia,serif;margin:5px 0}
p{line-height:1.5}button,input,select{font:inherit;border:1px solid #566575;border-radius:9px;padding:10px 13px;background:#263543;color:#edf3f5}
button{cursor:pointer}button:hover{filter:brightness(1.16)}
button:focus-visible{outline:3px solid #aecde0}
button.primary{background:#dde7ee;color:#18252f;font-weight:650}
small,.muted{color:#a4b4c0}
main{padding:21px max(18px,4vw);max-width:1600px;margin:auto}
.toolbar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin-bottom:18px}
.toolbar input{flex:1;min-width:170px;max-width:360px}
.count{font-variant-numeric:tabular-nums}
.gallery{display:grid;grid-template-columns:repeat(auto-fill,minmax(188px,1fr));gap:13px}
.card{border:1px solid #40505d;border-radius:12px;background:#1b2731;overflow:hidden;display:flex;flex-direction:column}
.card.ready{border-color:#518d73;background:#172c27}
.photo{height:215px;display:flex;justify-content:center;align-items:center;background:#111a22;padding:7px}
.photo img{height:100%;max-width:100%;object-fit:contain}
.unavailable{padding:12px;text-align:center;font-size:13px;color:#e7c9a9}
.card-body{padding:13px;display:flex;flex-direction:column;gap:5px;flex:1}
.card-body strong{font:normal 19px/1.16 Georgia,serif}
.card-body small{font-size:12px}.status{font-size:12px;font-weight:600;display:block;margin-top:auto;padding:9px 0}
.ready .status{color:#a5e4bd}.pending .status{color:#9cbdcf}
.card button{width:100%;border-radius:7px;margin-top:10px;font-size:13px;font-weight:600}
.card button.move{background:#235b46;border:1px solid #659a7d}
.card button.revert{background:#385364}
.card button:disabled{opacity:.6;cursor:not-allowed}
.links{display:flex;gap:12px;flex-wrap:wrap;margin-top:5px}
.links a{font-size:12px;color:#a7d7ef}
.alert{margin-top:18px;font-size:13px;color:#b9c8d0}
@media(max-width:700px){.gallery{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}.photo{height:160px}.card-body{padding:10px}.card-body strong{font-size:17px}.card button{padding:9px 5px}}
</style></head><body>
<header><small>AD ORIENTEM · SACRED ART · BATCH 01</small>
<h1>One-click painting review</h1>
<p class="muted">See the painting. If pristine, click <b>Approve → Queue 1</b>. Everything else stays in Queue 2. No side panels, explanations or extra forms. Unavailable images cannot be approved until they display.</p>
<div class="toolbar">
<button class="primary" id="download">Export Queue 1 approvals (.csv)</button>
<button id="upload">Import earlier review CSV</button><input type="file" id="import" accept=".csv,text/csv" hidden>
<button id="clear">Reset local approvals</button>
</div>
</header><main><div class="toolbar">
<input id="search" placeholder="Search by painting, artist or module" aria-label="Search artworks">
<select id="filter" aria-label="Filter by queue"><option value="ALL">All paintings</option><option value="QUEUE2">Queue 2 — awaiting/repair</option><option value="QUEUE1">Queue 1 — approved for final gate</option><option value="MISSING">Missing image</option></select>
<strong class="count" id="counter"></strong></div>
<div class="gallery" id="gallery"></div>
<p class="alert">“Queue 1” here means you have approved the visible photograph for the publication pipeline. The original-file checksum, image rights and final crop still undergo automatic release checks. Approvals are saved in this browser and can be exported to update the canonical Git register; this standalone HTML cannot silently write to GitHub.</p>
</main><script>
const data=__DATA__;
const KEY="ao-sacred-art-fast-grid-b01-v1";
let approved={};
try{approved=JSON.parse(localStorage.getItem(KEY)||"{}")}catch{}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(approved))}catch{}}
function safe(x){return String(x??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]))}
function mark(id){const x=data.find(d=>d.id===id);if(!x||!x.available)return;approved[id]=true;persist();render()}
function undo(id){delete approved[id];persist();render()}
function render(){
const filter=document.querySelector("#filter").value,term=document.querySelector("#search").value.toLowerCase().trim();
let accepted=data.filter(x=>approved[x.id]&&x.available).length,miss=data.filter(x=>!x.available).length;
document.querySelector("#counter").textContent=accepted+" / "+data.length+" selected · "+miss+" missing previews";
const matches=data.filter(x=>(!term||(x.title+" "+x.artist+" "+x.module).toLowerCase().includes(term))&&(
 filter==="ALL"||(filter==="QUEUE1"&&approved[x.id]&&x.available)||
 (filter==="QUEUE2"&&(!approved[x.id]||!x.available))||(filter==="MISSING"&&!x.available)));
document.querySelector("#gallery").innerHTML=matches.map(x=>{
 const yes=approved[x.id]&&x.available;
 return '<article class="card '+(yes?"ready":"pending")+'">'+
  '<div class="photo">'+(x.available?'<img src="'+x.preview+'" alt="'+safe(x.title)+'">':
   '<div class="unavailable">Image could not be retrieved.<p>Remains in Queue 2.</p></div>')+'</div>'+
  '<div class="card-body"><strong>'+safe(x.title)+'</strong><small>'+safe(x.artist)+'</small>'+
  '<small>'+safe(x.module||"Sacred Art")+'</small>'+
  '<div class="links">'+(x.sourceUrl?'<a href="'+safe(x.sourceUrl)+'" target="_blank" rel="noopener">Source image</a>':"")+'</div>'+
  '<span class="status">'+(yes?"Approved for final publication gate":"Queue 2 — retain for research")+'</span>'+
  (yes?'<button class="revert" data-action="undo" data-id="'+safe(x.id)+'">Return to Queue 2</button>':
    '<button class="move" data-action="approve" data-id="'+safe(x.id)+'" '+(!x.available?"disabled":"")+
    '>Approve → Queue 1</button>')+'</div></article>'
}).join("");
document.querySelectorAll("#gallery button[data-action]").forEach(b=>b.onclick=()=>{
if(b.dataset.action==="approve")mark(b.dataset.id);else undo(b.dataset.id);
});
}
document.querySelector("#filter").onchange=render;
document.querySelector("#search").oninput=render;
document.querySelector("#download").onclick=()=>{
const rows=[["work_group","title","artist","review_decision","source_url","source_photo_fingerprint","historical_original_sha256","review_batch"].join(",")];
const esc=x=>'"'+String(x??"").replace(/"/g,'""')+'"';
for(const x of data.filter(x=>approved[x.id]&&x.available))rows.push([
 x.id,x.title,x.artist,"APPROVE_VISIBLE_PHOTO_FOR_PUBLICATION_GATE",
 x.sourceUrl,x.sourcePhotoFingerprint,x.sourceOriginalSha256,"01"].map(esc).join(","));
const blob=new Blob(["\uFEFF"+rows.join("\r\n")+"\r\n"],{type:"text/csv;charset=utf-8"});
const url=URL.createObjectURL(blob);const a=document.createElement("a");a.href=url;
a.download="sacred-art-queue1-reviewed-approvals-batch01.csv";a.click();
setTimeout(()=>URL.revokeObjectURL(url),1500);
};
document.querySelector("#upload").onclick=()=>document.querySelector("#import").click();
document.querySelector("#import").onchange=async e=>{
const file=e.target.files[0];if(!file)return;
const text=await file.text();
const lines=text.replace(/^\uFEFF/,"").split(/\r?\n/).filter(Boolean);
function cells(s){const res=[];let c="",q=false;for(let i=0;i<s.length;i++){
 const v=s[i];if(v==='"'){if(q&&s[i+1]==='"'){c+='"';i++}else q=!q}
 else if(v===","&&!q){res.push(c);c=""}else c+=v}res.push(c);return res}
const headers=cells(lines.shift()).map(s=>s.toLowerCase());let imported=0;
for(const line of lines){const row=cells(line),val=k=>row[headers.indexOf(k)]||"";
 const id=val("work_group")||val("physical_work_group");
 const state=val("review_decision")||val("decision");
 if(!id||!/(PRISTINE|APPROVE)/i.test(state))continue;
 const x=data.find(a=>a.id===id);
 if(x&&x.available){approved[id]=true;imported++}
}
persist();render();alert(imported+" previous visual approvals imported; missing pictures remain held.");
e.target.value="";
};
document.querySelector("#clear").onclick=()=>{if(confirm("Clear all locally approved images for this review batch?")){
approved={};persist();render()}};
render();
</script></body></html>'''
OUT.write_text(HTML.replace("__DATA__",payload),encoding="utf-8")
assert all(x["available"]==bool(x["preview"]) for x in cards)
assert manifest["productionPhotoApprovalsGranted"]==0
print("SUMMARY",count,"embedded previews /",len(cards)-count,"missing", "bytes",OUT.stat().st_size,flush=True)
