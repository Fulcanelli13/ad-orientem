#!/usr/bin/env python3
"""Produce a single-file, offline visual acceptance gallery for existing CC0 originals.
This build only previews museum thumbnail images; it NEVER approves or ships artwork.
"""
import base64,html,io,json,sys,time
from pathlib import Path
from urllib.request import urlopen,Request
from PIL import Image,ImageOps
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/"data/calendar/sacred-art-priority-review-shortlist.v1.json"
OUT=ROOT/"artifacts/sacred-art-priority-review"
OUT.mkdir(parents=True,exist_ok=True)
manifest=json.loads(INPUT.read_text(encoding="utf-8"))
assert manifest["schema"]=="AO_SACRED_ART_PRIORITY_REVIEW_V1"
assert len({row["id"] for row in manifest["items"]})==len(manifest["items"])
def get(url,maxbytes=13000000):
    req=Request(url,headers={"User-Agent":"AdOrientem-PublicDomain-Art-Review/1.0","Accept":"application/json,image/*,*/*"})
    with urlopen(req,timeout=35) as response:
        size=int(response.headers.get("Content-Length","0") or "0")
        if size>maxbytes: raise ValueError("Museum response above byte limit")
        data=response.read(maxbytes+1)
        if len(data)>maxbytes:raise ValueError("Museum response exceeds byte limit")
        return data
rows=[]
errors=[]
for item in manifest["items"]:
    row=dict(item)
    row["thumbnailDataUri"]=None
    oid=item["id"].removeprefix("met-")
    assert oid.isdigit() and item["sourceObjectUrl"].endswith("/"+oid)
    try:
        meta=json.loads(get("https://collectionapi.metmuseum.org/public/collection/v1/objects/"+oid,2000000))
        if meta.get("objectID")!=int(oid) or meta.get("isPublicDomain") is not True or meta.get("classification")!="Paintings":
            raise ValueError("API ID / public-domain / painting classification mismatch")
        url=meta.get("primaryImageSmall") or meta.get("primaryImage")
        if not url or not url.startswith("https://"):
            raise ValueError("No official source image")
        data=get(url)
        with Image.open(io.BytesIO(data)) as opened:
            opened.load()
            im=ImageOps.exif_transpose(opened).convert("RGB")
            width,height=im.size
            if max(width,height)<450:raise ValueError("Preview image too small")
            im.thumbnail((760,920),Image.Resampling.LANCZOS)
            buf=io.BytesIO()
            im.save(buf,format="WEBP",quality=81,method=5)
        row["thumbnailDataUri"]="data:image/webp;base64,"+base64.b64encode(buf.getvalue()).decode("ascii")
        row["museumPreviewDimensions"]=[width,height]
        row["museumVerifiedInGalleryBuild"]=True
        print("OK",row["id"],width,height,flush=True)
    except Exception as exc:
        row["museumVerifiedInGalleryBuild"]=False
        row["previewError"]=str(exc)
        errors.append({"artworkId":row["id"],"error":str(exc)})
        print("UNAVAILABLE",row["id"],str(exc),flush=True)
    rows.append(row)
    time.sleep(.18)
payload=json.dumps({"schema":"AO_SACRED_ART_VISUAL_REVIEW_GALLERY_V1","generatedOn":"2026-10-10","items":rows},
 ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
page=r'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · Sacred Art Review</title>
<style>
:root{color-scheme:dark;--bg:#080c12;--panel:#111923;--line:#2c3641;--muted:#a5a9b0;--txt:#efe9dc;--accent:#c6ad79}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:15px/1.5 system-ui,Arial,sans-serif}
header{padding:26px max(20px,calc((100vw - 1300px)/2));border-bottom:1px solid var(--line);background:#0c121b;position:sticky;top:0;z-index:3}
h1{font:normal clamp(27px,3.5vw,40px) Georgia,serif;letter-spacing:.02em;margin:3px 0}
h2{font:normal 21px Georgia,serif;margin:9px 0}p{margin:6px 0;color:var(--muted)}
.eyebrow{font-size:11px;letter-spacing:.18em;color:var(--accent)}
.bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-top:18px}
button,select,input,textarea{font:inherit;color:var(--txt);background:#1b2732;border:1px solid #48505a;border-radius:6px}
button{cursor:pointer;padding:9px 14px;min-height:39px}button:hover{border-color:var(--accent)}
select{padding:9px 11px;min-height:39px}input[type=search]{padding:9px;min-width:180px}button.primary{background:#796944;border-color:#af9868;color:#fff}
.summary{font-size:13px;color:var(--accent);margin-left:auto}
main{max-width:1340px;padding:22px 20px 45px;margin:auto}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:19px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:10px;overflow:hidden}
.art{height:335px;display:grid;place-items:center;background:#06090d}
.art img{max-width:100%;max-height:100%;object-fit:contain;cursor:zoom-in}
.missing{font-size:12px;color:#dbad81;padding:25px;text-align:center}
.info{padding:17px}.date,.category{font-size:11px;text-transform:uppercase;letter-spacing:.1em;color:var(--accent)}
small,.source{font-size:12px;color:var(--muted)}.source{display:flex;gap:8px;flex-wrap:wrap}
a{color:#d6c9a3}.subject{font-size:13px;margin:8px 0;color:#bec4c9}
.controls{display:flex;gap:5px;margin-top:16px}.controls button{flex:1;padding:8px 2px;font-size:12px}
.controls button.selected{background:#566a54;border-color:#a2c296}.controls button.reject.selected{background:#753f40;border-color:#e5a1a1}.controls button.hold.selected{background:#806a42;border-color:#dbc18e}
.phone{height:220px;width:124px;border:2px solid #606a75;border-radius:10px;overflow:hidden;margin:13px auto;background:#000}
.phone img{height:100%;width:100%;object-fit:cover;object-position:var(--pos,50% 50%)}
.crop{margin-top:10px;font-size:12px}.crop label{display:flex;align-items:center;gap:8px;margin:5px 0}.crop input{flex:1;accent-color:#c6ad79}
textarea{width:100%;min-height:55px;margin-top:9px;padding:8px;font-size:12px;resize:vertical}
.badge{color:#c2d5c4;border:1px solid #657866;padding:2px 6px;border-radius:3px;display:inline-block;font-size:11px}
.badge.context{color:#e4cba3;border-color:#826b4c}
.help{padding:10px 0 18px;font-size:13px;max-width:1050px}
.dialog{border:1px solid #555;background:#080c12;color:var(--txt);max-width:95vw;max-height:96vh;padding:12px}
.dialog img{max-height:88vh;max-width:90vw;object-fit:contain}
@media(max-width:700px){header{position:static;padding:20px}.summary{margin-left:0}.grid{grid-template-columns:1fr}main{padding:14px}}
</style></head><body>
<header><div class="eyebrow">SACRED ART · FIRST RELEASE REVIEW</div><h1>Major feast paintings</h1>
<p>Choose Accept, Hold or Reject, preview the phone crop, then export your decisions. No image is automatically published.</p>
<div class="bar"><select id="category" aria-label="Category"><option value="">All categories</option></select>
<select id="status" aria-label="Decision"><option value="">All decisions</option><option value="accept">Accepted</option><option value="hold">Held</option><option value="reject">Rejected</option></select>
<input id="search" type="search" placeholder="Search feast or artist">
<button class="primary" id="export">Export review JSON</button><button id="importButton">Import previous JSON</button><input type="file" id="import" accept=".json,application/json" hidden>
<span class="summary" id="summary"></span></div></header>
<main><p class="help">Museum source is independently identified and public-domain/CC0 on the source ledger. Acceptance here is your <strong>artistic choice only</strong>. Image integrity, licencing evidence, accurate liturgical assignment, 9:16 crop and app testing remain independent publication gates. Contextual pictures cannot be described as exact Gospel events.</p><div class="grid" id="grid"></div></main>
<dialog class="dialog" id="zoom"><button id="close">Close preview</button><img id="large" alt=""></dialog>
<script id="catalog" type="application/json">__DATA__</script>
<script>
(() => {
const items=JSON.parse(document.getElementById("catalog").textContent).items;
const byId=new Map(items.map(x=>[x.id,x]));
const decisions=new Map(items.map(x=>[x.id,{decision:"hold",focalX:50,focalY:50,notes:""}]));
const grid=document.getElementById("grid"),cat=document.getElementById("category"),
  status=document.getElementById("status"),search=document.getElementById("search"),
  summary=document.getElementById("summary");
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
for(const name of [...new Set(items.map(x=>x.category))]){const opt=document.createElement("option");opt.value=opt.textContent=name;cat.append(opt)}
function draw(){
 const visible=items.filter(x=>(!cat.value||x.category===cat.value)&&
 (!status.value||decisions.get(x.id).decision===status.value)&&
 (!search.value||[x.feast,x.artist,x.title,x.id].join(" ").toLowerCase().includes(search.value.toLowerCase())));
 grid.replaceChildren();
 for(const x of visible){
  const d=decisions.get(x.id),card=document.createElement("article");card.className="card";card.dataset.artworkId=x.id;
  const photo=x.thumbnailDataUri
   ?'<img data-full alt="'+escape(x.title)+'" src="'+x.thumbnailDataUri+'">'
   :'<div class="missing">Museum preview unavailable. Use source link; do not approve without seeing it.</div>';
  card.innerHTML='<div class="art">'+photo+'</div><div class="info">'+
   '<span class="category">'+escape(x.category)+'</span><h2>'+escape(x.feast)+'</h2>'+
   '<div class="date">'+escape(x.observedDate2026)+'</div>'+
   '<div class="subject"><strong>'+escape(x.title)+'</strong><div>'+escape(x.artist)+'</div></div>'+
   '<div class="badge '+(x.association==="EXACT_SUBJECT_RESEARCH"?"":"context")+'">'+escape(x.association.replaceAll("_"," "))+'</div>'+
   '<div class="source"><a href="'+escape(x.sourceObjectUrl)+'" target="_blank" rel="noreferrer">Museum original record</a><span>'+escape(x.id)+'</span></div>'+
   '<div class="controls">'+["accept","hold","reject"].map(v=>'<button data-choice="'+v+'" class="'+v+' '+(d.decision===v?"selected":"")+'" aria-pressed="'+(d.decision===v)+'">'+v.toUpperCase()+'</button>').join("")+'</div>'+
   (x.thumbnailDataUri?'<div class="crop"><small>Phone crop preview — move focus</small><div class="phone"><img src="'+x.thumbnailDataUri+'" alt="Phone crop preview"></div><label>Horizontal <input type="range" name="x" min="0" max="100" value="'+d.focalX+'"></label><label>Vertical <input type="range" name="y" min="0" max="100" value="'+d.focalY+'"></label></div>':"")+
   '<textarea placeholder="Notes about beauty, correctness or composition">'+escape(d.notes)+'</textarea></div>';
  grid.append(card);
  const image=card.querySelector("img[data-full]");
  if(image)image.addEventListener("click",()=>{document.getElementById("large").src=x.thumbnailDataUri;document.getElementById("zoom").showModal()});
  card.querySelectorAll("[data-choice]").forEach(btn=>btn.addEventListener("click",()=>{d.decision=btn.dataset.choice;draw()}));
  const p=card.querySelector(".phone img");
  if(p){const move=()=>{p.style.objectPosition=d.focalX+"% "+d.focalY+"%"};move();
   card.querySelectorAll('input[type="range"]').forEach(inp=>inp.addEventListener("input",()=>{d[inp.name==="x"?"focalX":"focalY"]=Number(inp.value);move()}))}
  card.querySelector("textarea").addEventListener("input",e=>d.notes=e.target.value);
 }
 const count=k=>[...decisions.values()].filter(x=>x.decision===k).length;
 summary.textContent=items.length+" total · "+count("accept")+" accepted · "+count("hold")+" held · "+count("reject")+" rejected";
}
function exportDecisions(){
 const payload={schema:"AO_SACRED_ART_HUMAN_REVIEW_EXPORT_V1",reviewedOn:new Date().toISOString(),
 warning:"Human artistic preference only. Does not by itself authorize production release.",
 items:items.map(x=>({artworkId:x.id,archiveOriginalSha256:x.archiveOriginalSha256,
  sourceObjectUrl:x.sourceObjectUrl,observedDate2026:x.observedDate2026,
  observedPrincipalId:x.observedPrincipalId,association:x.association,...decisions.get(x.id)}))};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)+"\n"],{type:"application/json"}));
 const link=document.createElement("a");link.href=url;link.download="ad-orientem-art-review.json";
 document.body.append(link);link.click();link.remove();setTimeout(()=>URL.revokeObjectURL(url),1200);
}
document.getElementById("export").addEventListener("click",exportDecisions);
document.getElementById("importButton").addEventListener("click",()=>document.getElementById("import").click());
document.getElementById("import").addEventListener("change",async e=>{
 try{const imported=JSON.parse(await e.target.files[0].text());
 if(imported.schema!=="AO_SACRED_ART_HUMAN_REVIEW_EXPORT_V1")throw Error("Unexpected review schema");
 for(const x of imported.items||[]){if(!byId.has(x.artworkId))continue;
 const original=byId.get(x.artworkId);if(x.archiveOriginalSha256!==original.archiveOriginalSha256)continue;
 if(!["accept","hold","reject"].includes(x.decision))continue;
 decisions.set(x.artworkId,{decision:x.decision,focalX:Math.max(0,Math.min(100,Number(x.focalX)||0)),
 focalY:Math.max(0,Math.min(100,Number(x.focalY)||0)),notes:String(x.notes||"")});}
 draw();}catch(error){alert("Review JSON could not be imported: "+error.message)}
});
document.getElementById("close").addEventListener("click",()=>document.getElementById("zoom").close());
[cat,status,search].forEach(node=>node.addEventListener(node===search?"input":"change",draw));
draw();
})();
</script></body></html>'''
page=page.replace("__DATA__",payload)
(OUT/"sacred-art-priority-review.html").write_text(page,encoding="utf8")
(OUT/"gallery-preview-provenance.json").write_text(json.dumps({"selected":len(rows),"thumbnailsFetched":sum(bool(x["thumbnailDataUri"]) for x in rows),"errors":errors},indent=2)+"\n",encoding="utf8")
print("GALLERY",len(rows),"previews",len(rows)-len(errors),"missing",len(errors),flush=True)
if len(rows)-len(errors)<12:sys.exit("Fewer than 12 source-verified previews; refusing successful build")
