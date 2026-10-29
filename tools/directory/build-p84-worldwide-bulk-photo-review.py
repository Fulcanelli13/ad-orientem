#!/usr/bin/env python3
"""One all-queue photo review, paginated at 250/500, with NO publication."""
import argparse
import hashlib
import json
import re
import urllib.parse
from pathlib import Path

HOLD="RESEARCH_ONLY_NEVER_APP_VISIBLE"
SCHEMA="AO_P83_GLOBAL_PHOTO_PREVIEW_SCREEN_V1"

def url(value,title):
    v=urllib.parse.urlsplit(str(value or ""))
    if v.scheme=="https" and v.hostname=="commons.wikimedia.org" and not v.username and not v.password and v.port in (None,443) and urllib.parse.unquote(v.path).replace("_"," ")=="/wiki/"+title:
        return urllib.parse.urlunsplit(("https","commons.wikimedia.org",v.path,"",""))
    return "https://commons.wikimedia.org/wiki/"+urllib.parse.quote(title.replace(" ","_"),safe=":/_(),-")

def thumb(value,title):
    v=urllib.parse.urlsplit(str(value or ""))
    if v.scheme=="https" and v.hostname in ("commons.wikimedia.org","upload.wikimedia.org") and not v.username and not v.password and v.port in (None,443) and not v.fragment:
        return value
    return "https://commons.wikimedia.org/wiki/Special:FilePath/"+urllib.parse.quote(title[5:].replace(" ","_"),safe="/_(),-")+"?width=640"

def read(queue,summary):
    meta=json.loads(Path(summary).read_text(encoding="utf-8"))
    if (meta.get("schema")!=SCHEMA or meta.get("anchors_accounted")!=2579 or meta.get("countries")!=76
        or meta.get("approved_photos")!=0 or meta.get("rights_cleared")!=0
        or meta.get("published_photos")!=0 or meta.get("original_photos_downloaded")!=0):
        raise ValueError("Incorrect, incomplete or published P83 source report")
    raw=[json.loads(s) for s in Path(queue).read_text(encoding="utf-8").splitlines() if s.strip()]
    if len(raw)!=meta.get("review_queue_assignments") or len(raw)>11000:raise ValueError("P83 review queue size mismatch")
    out=[]
    ids=set()
    for r in raw:
        aid=r.get("physical_anchor_id")
        title=r.get("file_title")
        if (not isinstance(aid,str) or not re.fullmatch(r"RG-[A-F0-9-]{10,30}",aid)
            or not isinstance(title,str) or not title.startswith("File:") or not 6<len(title)<=260
            or any(c in title for c in ("\r","\n","\0","..","|","#","?"))
            or not str(r.get("screening_disposition","")).startswith("REVIEW_QUEUE_")
            or r.get("publication")!=HOLD or r.get("published") is not False
            or r.get("exact_site_verified") is not False
            or r.get("rights_independently_cleared") is not False
            or r.get("original_bytes_verified") is not False):
            raise ValueError("Unsafe or approved photo source in P83 queue")
        unique=hashlib.sha256((aid+"\0"+title).encode()).hexdigest()[:20]
        if unique in ids:raise ValueError("Duplicate site/file")
        ids.add(unique)
        out.append({"id":"p84-"+unique,"anchor":aid,"country":str(r.get("country",""))[:3],
            "place":str(r.get("place_name",""))[:160],"city":str(r.get("place_city_hint",""))[:120],
            "title":title,"source":url(r.get("source_url"),title),
            "preview":thumb(r.get("preview_url"),title),
            "rights":str(r.get("rights_metadata_status",""))[:120],
            "evidence":str(r.get("screening_disposition",""))[:120],
            "shared":r.get("same_original_multiple_site_ids") is True,
            "sha1_claim":str(r.get("original_sha1_claim",""))[:40]})
    out.sort(key=lambda x:(x["country"],x["place"].casefold(),x["title"].casefold()))
    return out

PAGE=r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Ad Orientem — Worldwide Directory Photo Review</title>
<style>
:root{color-scheme:dark;font:15px system-ui,sans-serif;background:#0c121a;color:#f2f6fd}
*{box-sizing:border-box}body{margin:0}header{padding:1.5rem max(1rem,calc((100% - 1460px)/2));background:#172131;border-bottom:1px solid #445}
h1{font-size:clamp(1.4rem,2.5vw,2rem);margin:.4rem 0}p{line-height:1.55;color:#c4cfdd}
main{max-width:1460px;margin:auto;padding:1rem}.toolbar,.pager{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem;margin:1rem 0}
button,select,input,textarea{font:inherit;color:#e5edf7;background:#243248;border:1px solid #536983;border-radius:5px;padding:.5rem .6rem}
button{cursor:pointer}button:hover{border-color:#a8caec}button:disabled{opacity:.4;cursor:default}.primary{background:#deeaf9;color:#162235}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,310px),1fr));gap:1rem}
.item{background:#172337;border:1px solid #35465c;border-radius:7px;overflow:hidden}
.image{height:225px;background:#0a0f18;display:grid;place-items:center}
.image img{max-width:100%;max-height:225px;object-fit:contain}
.content{padding:.9rem}.name{font-weight:700;font-size:1.04rem}.meta{font-size:.78rem;color:#a9bacb;overflow-wrap:anywhere;margin:.4rem 0}
.controls{display:flex;gap:.3rem;margin:.7rem 0;flex-wrap:wrap}.controls button{font-size:.75rem}
.controls button[aria-pressed=true]{background:#27605d;border-color:#9fd8d0}
.controls button.reject[aria-pressed=true]{background:#763d42;border-color:#edb6b6}
.note{display:block;width:100%;height:54px;resize:vertical;font-size:.78rem}
.warning{color:#ffd09f}a{color:#abd9fb}.count{margin-right:.4rem;white-space:nowrap}
footer{text-align:center;margin:2rem;color:#8297ad}
</style></head><body>
<header><div style="letter-spacing:.1em;color:#aac2dd">AD ORIENTEM · DIRECTORY · RESEARCH ONLY</div>
<h1>One worldwide photo review — 250 or 500 at a time</h1>
<p>Screen the entire P83 source-eligible review queue in one interface. <strong>Keep</strong> means only “retain for exact-building and rights verification”; it never approves an image. Reject incorrect architecture, wrong churches, historical illustrations, frames or unsuitable photographs. Source names and licences remain claims until independently confirmed.</p>
<div><span class="count">Total <b id="total">0</b></span><span class="count">Keep <b id="keep">0</b></span><span class="count">Reject <b id="reject">0</b></span><span class="count">Hold <b id="hold">0</b></span></div>
</header>
<main>
<div class="toolbar">
<label>Country <select id="country"><option value="">All</option></select></label>
<label>Decision <select id="filter"><option value="">All</option><option value="keep">Keep</option><option value="reject">Reject</option><option value="hold">Hold</option></select></label>
<label>Page size <select id="size"><option value="250">250</option><option value="500">500</option></select></label>
<input id="search" placeholder="Search site, city, filename..." aria-label="Search">
<button class="primary" id="export">Export complete review JSON</button>
<button id="reset">Reset decisions</button>
</div>
<div class="pager"><button id="prev">Previous</button><span id="pages"></span><button id="next">Next</button></div>
<div class="grid" id="grid"></div>
<div class="pager"><button id="prev2">Previous</button><span id="pages2"></span><button id="next2">Next</button></div>
</main><footer>Research metadata only · No originals downloaded · No images approved or published</footer>
<script>
const DATA=__DATA__, SHA=__SOURCE_SHA__;
const STORAGE="ao-worldwide-directory-photo-p84-review";
const $=id=>document.getElementById(id);
let choices={};try{choices=JSON.parse(localStorage.getItem(STORAGE)||"{}")||{}}catch{}
let page=0;const countries=$("country"),filter=$("filter"),size=$("size"),search=$("search");
const status=r=>choices[r.id]?.status||"hold";
for(const c of [...new Set(DATA.map(r=>r.country))].sort()){const op=document.createElement("option");op.value=c;op.textContent=c;countries.appendChild(op)}
function make(tag,cls,txt){const e=document.createElement(tag);if(cls)e.className=cls;if(txt!==undefined)e.textContent=txt;return e}
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(choices))}catch{}}
function current(){const q=search.value.toLowerCase().trim();return DATA.filter(r=>(!countries.value||r.country===countries.value)&&(!filter.value||status(r)===filter.value)&&(!q||(r.place+" "+r.city+" "+r.title+" "+r.country).toLowerCase().includes(q)))}
function render(){
 const counts={keep:0,reject:0,hold:0};for(const r of DATA)counts[status(r)]++;
 $("total").textContent=DATA.length;for(const key of ["keep","reject","hold"])$(key).textContent=counts[key];
 const filtered=current();const pages=Math.max(1,Math.ceil(filtered.length/Number(size.value)));page=Math.max(0,Math.min(page,pages-1));
 $("pages").textContent="Page "+(page+1)+" / "+pages+" · "+filtered.length+" matching leads";$("pages2").textContent=$("pages").textContent;
 for(const id of ["prev","prev2"])$(id).disabled=page<=0;
 for(const id of ["next","next2"])$(id).disabled=page>=pages-1;
 const grid=$("grid");grid.replaceChildren();
 for(const r of filtered.slice(page*Number(size.value),(page+1)*Number(size.value))){
  const card=make("article","item"),image=make("div","image"),img=make("img");
  img.src=r.preview;img.loading="lazy";img.decoding="async";img.referrerPolicy="no-referrer";img.alt="Unverified research source image "+r.title;
  image.appendChild(img);card.appendChild(image);
  const body=make("div","content");body.appendChild(make("div","name",r.place||r.anchor));
  body.appendChild(make("div","meta",r.country+" · "+r.city+" · "+r.anchor));
  body.appendChild(make("div","meta",r.evidence+" · "+r.rights));
  if(r.shared)body.appendChild(make("div","meta warning","Same image assigned to multiple sites. Exact identity NOT established."));
  body.appendChild(make("div","meta",r.title));
  const link=make("a","","Commons source");link.href=r.source;link.target="_blank";link.rel="noopener noreferrer";body.appendChild(link);
  const ctr=make("div","controls");
  for(const [val,label] of [["keep","Keep for verification"],["reject","Reject"],["hold","Hold"]]){
   const btn=make("button",val==="reject"?"reject":"",label);btn.type="button";btn.setAttribute("aria-pressed",String(status(r)===val));
   btn.onclick=()=>{choices[r.id]={...(choices[r.id]||{}),status:val};save();render()};ctr.appendChild(btn);
  }body.appendChild(ctr);
  const note=make("textarea","note");note.placeholder="Wrong building, licence, subject or quality note";
  note.value=choices[r.id]?.note||"";note.onchange=()=>{choices[r.id]={...(choices[r.id]||{}),note:note.value.slice(0,2000)};save()};
  body.appendChild(note);card.appendChild(body);grid.appendChild(card);
 }
 if(!filtered.length)grid.appendChild(make("p","","No matching leads."));
}
for(const id of ["prev","prev2"])$(id).onclick=()=>{page--;render();window.scrollTo(0,0)};
for(const id of ["next","next2"])$(id).onclick=()=>{page++;render();window.scrollTo(0,0)};
for(const e of [countries,filter,size])e.onchange=()=>{page=0;render()};search.oninput=()=>{page=0;render()};
$("export").onclick=()=>{
 const result={schema:"AO_DIRECTORY_P84_BULK_RESEARCH_REVIEW_V1",source_p83_sha256:SHA,
  source_leads:DATA.length,originals_downloaded:0,photos_approved:0,photos_published:0,
  decisions:DATA.map(r=>({review_id:r.id,physical_anchor_id:r.anchor,commons_title:r.title,
     original_sha1_claim:r.sha1_claim,decision:status(r),note:choices[r.id]?.note||"",
     subject_verified:false,rights_approved:false,original_verified:false,published:false}))};
 const file=new Blob([JSON.stringify(result,null,2)],{type:"application/json"});
 const url=URL.createObjectURL(file),link=document.createElement("a");link.href=url;
 link.download="ad-orientem-directory-p84-worldwide-photo-choices.json";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1000);
};
$("reset").onclick=()=>{if(confirm("Reset every local review decision?")){choices={};save();render()}};
render();
</script></body></html>'''

def build(queue,summary,output):
    rows=read(queue,summary)
    encode=lambda v:json.dumps(v,ensure_ascii=False,separators=(",",":")).replace("<",r"\u003c").replace(">",r"\u003e").replace("&",r"\u0026")
    content=PAGE.replace("__DATA__",encode(rows)).replace("__SOURCE_SHA__",encode(hashlib.sha256(Path(summary).read_bytes()).hexdigest()))
    target=Path(output)
    if target.exists():raise ValueError("Refuse overwrite of immutable review")
    target.parent.mkdir(parents=True,exist_ok=True)
    target.write_text(content,encoding="utf-8")
    if target.stat().st_size>10_000_000:raise ValueError("Source metadata review exceeds size cap")
    print(json.dumps({"items":len(rows),"pages_250":(len(rows)+249)//250,
                      "pages_500":(len(rows)+499)//500,
                      "images_downloaded":0,"approved":0,"published":0},sort_keys=True))
    return rows

if __name__=="__main__":
    p=argparse.ArgumentParser()
    p.add_argument("--queue",type=Path,required=True)
    p.add_argument("--summary",type=Path,required=True)
    p.add_argument("--output",type=Path,required=True)
    a=p.parse_args()
    build(a.queue,a.summary,a.output)
