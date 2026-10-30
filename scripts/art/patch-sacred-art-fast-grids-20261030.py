#!/usr/bin/env python3
"""Finalize fast one-click visual-review interface for three batches.

Never substitutes rendered remote images as rights/quality clearances. The 73
first-batch and 211 second-wave local embedded previews remain unchanged.
For failed Wikimedia bulk downloads, a remote browser-side preview may enable
review *only if it actually loads*. No automatic approval, import or publication.
"""
from pathlib import Path
import csv, json, re
ROOT=Path("docs")
FILES=[ROOT/f"SACRED_ART_FAST_GRID_REVIEW_BATCH{b}_20261030.html" for b in ("01","02","03")]
V2=Path("data/calendar/sacred-art-master-v2")
SOURCES={}
for b in ("02","03"):
 with (V2/f"first-look-photo-review-batch-{b}.csv").open(encoding="utf-8-sig",newline="") as f:
  SOURCES[b]={r["physical_work_group"]:r for r in csv.DictReader(f)}
report={"schema":"AO_SACRED_ART_FAST_GRID_USER_CLICK_AND_REMOTE_FALLBACK_V1",
        "batches":{},"photoApprovals":0,"productionMutations":0,
        "previousEmbeddedImagesPreserved":True,"feeEur":0}
for b,path in zip(("01","02","03"),FILES):
 source=path.read_text(encoding="utf-8")
 match=re.search(r"const data=(\[[\s\S]*?\]);\s*const KEY=",source)
 if not match:raise ValueError("Gallery JSON not found "+str(path))
 rows=json.loads(match.group(1))
 embeddedBefore=sum(r["available"] for r in rows)
 newUrls=0
 for item in rows:
  if b in SOURCES and not item["available"]:
   row=SOURCES[b].get(item["id"])
   if not row:raise ValueError("Unmatched photo "+item["id"])
   url=row.get("official_image_preview") or row.get("official_image_original")
   if url and url.startswith("https://"):
    item["remotePreview"]=url
    newUrls+=1
 payload=json.dumps(rows,ensure_ascii=False).replace("<","\\u003c").replace(">","\\u003e")
 source=source[:match.start(1)]+payload+source[match.end(1):]
 # one-click bulk for an already inspected grid, including current search filter;
 # only successfully displayed and loaded preview images are eligible.
 if 'id="approveVisible"' not in source:
  needle='<button class="primary" id="download">Export Queue 1 approvals (.csv)</button>'
  if needle not in source:raise ValueError("Export control changed "+str(path))
  source=source.replace(needle,'<button class="primary" id="approveVisible">Approve all displayed</button>'+needle,1)
  js='document.querySelector("#download").onclick=()=>{'
  if js not in source:raise ValueError("Gallery export hook changed "+str(path))
  script="""document.querySelector("#approveVisible").onclick=()=>{
  const filter=document.querySelector("#filter").value,term=document.querySelector("#search").value.toLowerCase().trim();
  for(const x of data){
   if(!x.available)continue;
   if(term && !(x.title+" "+x.artist+" "+x.module).toLowerCase().includes(term))continue;
   if(filter==="MISSING" || filter==="QUEUE1" && !approved[x.id])continue;
   approved[x.id]=true;
  }
  persist();render();
};
"""
  source=source.replace(js,script+js,1)
 # Browser fallback only for second-wave images without an embedded data URI.
 # Approval only unlocks after <img> successfully loads and has nonzero pixels.
 needle="""'<div class="unavailable">Image could not be retrieved.<p>Remains in Queue 2.</p></div>'"""
 replace="""'<div class="unavailable">'+
     (x.remotePreview?'<img class="remote-preview" data-remote-id="'+safe(x.id)+'" loading="lazy" src="'+safe(x.remotePreview)+'" alt="'+safe(x.title)+'" style="display:block;max-height:185px;max-width:100%;margin:auto">':'')+
     '<p>Image not cached. If it loads, approval unlocks; otherwise stays in Queue 2.</p></div>'"""
 if needle not in source and 'data-remote-id' not in source:
  raise ValueError("Missing image control absent in "+str(path))
 source=source.replace(needle,replace,1)
 if 'document.querySelectorAll("img[data-remote-id]")' not in source:
  target='document.querySelectorAll("#gallery button[data-action]").forEach(b=>b.onclick=()=>{'
  onload="""document.querySelectorAll("img[data-remote-id]").forEach(img=>{
  const id=img.dataset.remoteId;
  const accept=()=>{
   const row=data.find(x=>x.id===id);
   if(row&&!row.available&&img.naturalWidth>0){
    row.available=true;row.preview=img.src;render();
   }
  };
  img.addEventListener("load",accept,{once:true});
  img.addEventListener("error",()=>{img.style.display="none"},{once:true});
  if(img.complete && img.naturalWidth>0)accept();
});
"""
  if target not in source:raise ValueError("Render binding absent "+str(path))
  source=source.replace(target,onload+target,1)
 path.write_text(source,encoding="utf-8")
 assert "<aside" not in source and "Approve → Queue 1" in source
 assert source.count('id="approveVisible"')==1
 assert "APPROVE_VISIBLE" not in source
 assert source.count("data-remote-id")>=1
 assert sum(r["available"] for r in rows)==embeddedBefore
 report["batches"][b]={"total":len(rows),"previewsEmbedded":embeddedBefore,
    "browserRemoteFallbacks":newUrls,"unloadedNotApproved":len(rows)-embeddedBefore,
    "sourceHTML":str(path)}
print(json.dumps(report,indent=2))
(V2/"fast-grid-click-review-ui-proof-20261030.v1.json").write_text(
 json.dumps(report,indent=2)+"\n",encoding="utf-8")
