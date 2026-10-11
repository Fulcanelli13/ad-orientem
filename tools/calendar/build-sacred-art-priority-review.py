#!/usr/bin/env python3
"""Create a subject-first, compact sacred-art review from the full self-contained atlas.

Every acquired master remains available on demand. The page initially shows
only one source candidate per major feast, Rosary mystery or devotional subject.
It does not turn museum discovery into image-release permission.
"""
import argparse,html,json,re
from pathlib import Path

ROOT=Path(__file__).resolve().parents[2]
IDS={
 "Calendar":["christmas","epiphany","annunciation","candlemas","palm-sunday","holy-thursday","good-friday","holy-saturday","easter","ascension","pentecost","trinity","corpus-christi","sacred-heart","assumption","immaculate-conception","all-saints","all-souls","christ-king","transfiguration","holy-rosary","our-lady-sorrows","saint-joseph","st-john-baptist","holy-innocents"],
 "Rosary":["joy1","joy2","joy3","joy4","joy5","sor1","sor2","sor3","sor4","sor5","glo1","glo2","glo3","glo4","glo5"],
 "Devotions":["angelus","regina-caeli","adoration","confession","sacred-heart","immaculate-heart","holy-souls","st-joseph","our-lady-perpetual-help","st-therese"],
 "Saints":["peter","paul","benedict","dominic","francis-assisi","catherine-siena","cecilia","lucy","anthony-padua","michael"],
 "Gospel":["healing-paralytic","keys-to-peter","raising-widows-son","talents","tribute-money","wise-foolish-virgins"]
}
PREFIX={"Calendar":"calendar.","Rosary":"rosary.","Devotions":"devotion.","Saints":"person.","Gospel":"scripture."}
def read(path):return json.loads(Path(path).read_text(encoding="utf-8"))
def parse_atlas(path):
 source=Path(path).read_text(encoding="utf-8")
 m=re.search(r'<script id="dataset" type="application/json">(.+?)</script>',source,re.S)
 if not m:raise ValueError("Complete artwork atlas data not present")
 return json.loads(m.group(1))
def build(args):
 original=parse_atlas(args.atlas)
 works=read(ROOT/"data/calendar/sacred-art-candidates.v1.json")
 targets=read(ROOT/"data/calendar/sacred-art-subject-targets.v2.json")["targets"]
 mapping=read(ROOT/"data/calendar/sacred-art-editorial-crosswalk.v1.json")["exactIconography"]
 visually=read(ROOT/"data/calendar/sacred-art-visual-shortlist.v1.json")["artworks"]
 grades={a["id"]:a["visualGrade"] for a in visually}
 by_id={a["id"]:a for a in works["artworks"]}
 images={a["id"]:a for a in original["items"]}
 target_by_id={t["id"]:t for t in targets}
 output=[]
 for section,ids in IDS.items():
  for token in ids:
   key=PREFIX[section]+token
   t=target_by_id.get(key)
   if t is None:raise ValueError("No canonical subject target for "+key)
   terms=set(mapping.get(key,[]))
   candidates=[]
   for a in images.values():
    canonical=by_id[a["id"]]
    tags=canonical.get("tags") or {}
    icons=set(tags.get("iconography") or [])
    links=set(tags.get("prayerKeys") or [])
    if not terms.intersection(icons) and not (
      (section=="Rosary" and key in links) or
      (section=="Devotions" and token in links) or
      (section=="Saints" and tags.get("portraitSubjectId")==token) or
      (section=="Gospel" and token in set(tags.get("scriptureIdentityKeys") or []))
    ):continue
    grade=grades.get(a["id"],"")
    score={"A+":110,"A":70,"B":-20}.get(grade,0)
    score+=25 if a["rights"]=="CC0" else -60
    score+=10 if terms.intersection(icons) else 0
    score+=8 if token in canonical.get("association",{}).get("observedIds",[]) else 0
    if section=="Saints" and tags.get("portraitSubjectId")==token:score+=35
    if a["preview"] is None:score-=1000
    candidates.append((score,a["id"]))
   candidates.sort(key=lambda x:(-x[0],x[1]))
   leads=[{"title":p.get("title"),"artist":p.get("artist"),"url":p.get("source"),"status":p.get("reason")} 
          for p in original.get("pendingSourceLinks",[])
          if any(q.get("targetId")==key and q.get("id")==p.get("id")
             for q in read(ROOT/"data/calendar/sacred-art-primary-museum-leads-20261011.v1.json")["items"])]
   output.append({"id":key,"section":section,"title":t["title"],
                  "candidates":[id for score,id in candidates],
                  "leads":leads,
                  "scope":"ONE_RECOMMENDED_ORIGINAL_THEN_ON_DEMAND_ALTERNATIVES",
                  "sourceOnly":True})
 assert len(output)==sum(len(x) for x in IDS.values())
 payload={"schema":"AO_SACRED_ART_PRIORITY_REVIEW_V1","year":2026,
          "subjectCount":len(output),"originals":len(original["items"]),
          "observedDays":len(original["days"]),"dateUses":original["summary"]["sourceAlternatives"],
          "reviewPolicy":"Subject-first shortlist, not 2,467 individual reviews; no production approval.",
          "groups":output,"items":original["items"],"days":original["days"]}
 dataset=json.dumps(payload,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
 out=PAGE.replace("__PAYLOAD__",dataset)
 args.output.parent.mkdir(parents=True,exist_ok=True)
 args.output.write_text(out,encoding="utf-8")
 stats={"subjectCards":len(output),"subjectsWithCandidates":sum(bool(g["candidates"]) for g in output),
  "subjectsWithoutAcquiredCandidates":sum(not g["candidates"] for g in output),
  "originalsAvailableOnDemand":len(original["items"]),
  "datedUsesHiddenUntilExpanded":original["summary"]["sourceAlternatives"],
  "htmlBytes":args.output.stat().st_size}
 (args.output.parent/"priority-review-stats.json").write_text(json.dumps(stats,indent=2)+"\n",encoding="utf-8")
 print("SACRED_ART_PRIORITY_REVIEW="+json.dumps(stats))

PAGE=r'''<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem — Sacred Art Selection</title>
<style>
:root{color-scheme:dark;--bg:#080d14;--panel:#111923;--line:#334050;--ink:#eae5dd;--dim:#a5b0bb;--gold:#d6b781;--red:#d5a39a;--green:#a9d6bb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:14px/1.55 system-ui,-apple-system,Segoe UI,sans-serif}
header{padding:22px max(18px,calc((100vw - 1240px)/2));border-bottom:1px solid var(--line);background:#0e1620}
h1,h2{font-family:Georgia,serif;font-weight:normal}h1{font-size:clamp(26px,4vw,37px);margin:4px 0}h2{font-size:20px;margin:5px 0 8px}
label,small{color:var(--dim)}.kicker{letter-spacing:.16em;color:var(--gold);text-transform:uppercase;font-size:11px}
p{color:var(--dim);margin:7px 0 10px}nav{display:flex;flex-wrap:wrap;gap:7px;margin:12px 0}
button,select,input,textarea{color:var(--ink);background:#1a2938;border:1px solid #526073;border-radius:6px;font:inherit}
button{cursor:pointer;padding:8px 11px;min-height:36px}button:hover,button:focus-visible{border-color:var(--gold)}
button.active{background:#554933;border-color:var(--gold)}button.good{border-color:#4e8e74;color:var(--green)}button.good.active{background:#1e4536}
button.bad{border-color:#89594f;color:var(--red)}button.bad.active{background:#572e2a}
button.primary{background:#6b5738;border-color:#bc9a63}input,select{padding:8px}
main{max-width:1280px;margin:auto;padding:18px 16px 80px}.stats{display:flex;gap:20px;flex-wrap:wrap}
.stats strong{font-size:21px;color:var(--gold);display:block}.tools{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-bottom:14px}
#query{width:min(340px,96vw)}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(350px,1fr));gap:16px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:9px;overflow:hidden;min-width:0}
.hdr{padding:14px 15px 7px}.hdr h2{margin:2px 0}.num{color:var(--gold);font-size:11px;text-transform:uppercase;letter-spacing:.1em}
.art{background:#05080d;min-height:290px;display:flex;justify-content:center;align-items:center;padding:8px}
.art img{max-width:100%;max-height:420px;object-fit:contain;cursor:zoom-in}.body{padding:14px}
.meta{color:var(--dim);font-size:12px}.subject{font-size:12px;color:var(--gold)}
a{color:#e4c89b;overflow-wrap:anywhere}.url{display:block;font-size:12px;margin-top:8px}
.actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:12px}.actions button{font-size:12px}
.alt{margin-top:14px;border-top:1px solid var(--line);padding-top:12px}.muted{color:var(--dim);font-size:12px}
.expanded{margin-top:13px;border-top:1px solid var(--line);padding-top:10px}
.choices{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:9px}.choice{cursor:pointer;text-align:left;padding:7px}
.choice img{width:100%;height:126px;object-fit:contain;background:#060b10}.choice strong{display:block;font-size:11px;line-height:1.3;overflow-wrap:anywhere}
details{margin-top:12px;padding-top:8px;border-top:1px solid var(--line)}summary{cursor:pointer;color:var(--gold)}
.note{border:1px solid var(--line);padding:11px 14px;margin-bottom:18px}.status{color:var(--gold);margin-top:7px;font-size:12px}
#fullCatalogue{display:none;margin-top:20px}.catalogue{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:11px}
.smallart{background:var(--panel);border:1px solid var(--line);border-radius:7px;overflow:hidden;padding:9px}
.smallart img{width:100%;height:160px;object-fit:contain;background:#06090d}.smallart strong{display:block;margin:5px 0;font-size:12px}
textarea{width:100%;padding:7px;min-height:45px}dialog{background:#080e16;color:var(--ink);border:1px solid #68798d;max-width:96vw;max-height:96vh}
dialog img{max-height:82vh;max-width:89vw;object-fit:contain}
footer{font-size:12px;color:var(--dim);margin-top:25px}
@media(max-width:580px){.grid{grid-template-columns:1fr}.stats{gap:10px 19px}header{padding:17px}.art{min-height:220px}}
</style></head><body>
<header><div class="kicker">Ad Orientem · 1962 liturgical calendar</div>
<h1>Sacred Art — Curator's Selection</h1>
<p>One proposed painting per subject. Approve it, ask for an alternative, or reject it. The much larger archive stays hidden unless you choose to explore it.</p>
<div id="stats" class="stats"></div>
<nav><button id="export" class="primary">Export my decisions</button><button id="import">Import earlier review</button><input type="file" id="upload" accept=".json" hidden>
<button id="fullToggle">Browse complete collection (optional)</button></nav></header>
<main>
<div class="note">This is an <b>editorial artwork review</b>, not a publication licence. A painting may be attractive but unsuitable for a particular saint, prayer or liturgical day. Your approval never overrides image rights, historical identity, mobile crop or 1962 Proper verification.</div>
<div class="tools"><select id="section"><option value="">All priority subjects</option><option>Calendar</option><option>Rosary</option><option>Devotions</option><option>Saints</option><option>Gospel</option></select><input id="query" type="search" placeholder="Search feast, saint, prayer or artist"><button id="next" class="primary">Show more subjects</button><span id="remaining" class="muted"></span></div>
<section class="grid" id="cards"></section>
<section id="fullCatalogue"><h2>Complete collection — optional</h2><p>All source-acquired paintings. This area is not required for the priority review.</p><div class="catalogue" id="catalogue"></div></section>
<footer>Reviews are saved locally in this browser and can be exported to JSON. Do not delete the exported file. Museum links require internet access; the painting previews are embedded.</footer>
</main><dialog id="zoom"><button id="closeZoom">Close image</button><div><img id="zoomImage" alt="Enlarged painting"></div></dialog>
<script id="payload" type="application/json">__PAYLOAD__</script>
<script>
(()=>{
"use strict";
const data=JSON.parse(document.getElementById("payload").textContent);
const byId=new Map(data.items.map(a=>[a.id,a])),groups=data.groups;
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const approvals=new Map(),selections=new Map(),refusals=new Map(),exceptions=new Map(),indexes=new Map();
const storage="ao-sacred-art-priority-review-v1";
let shown=12;
const lookup=(gid,aid)=>gid+"|"+aid;
function restore(){try{const o=JSON.parse(localStorage.getItem(storage)||"{}");for(const x of o.approvals||[])if(byId.get(x.artworkId)?.sha===x.originalSha256)approvals.set(x.artworkId,x);for(const x of o.selections||[])if(byId.get(x.artworkId)?.sha===x.originalSha256)selections.set(x.targetId,x);for(const x of o.refusals||[])refusals.set(lookup(x.targetId,x.artworkId),x);for(const x of o.exceptions||[])exceptions.set(x.kind+"|"+x.artworkId+"|"+(x.date||"*"),x);}catch(e){console.warn("No saved review loaded",e)}}
function save(){try{localStorage.setItem(storage,JSON.stringify({approvals:[...approvals.values()],selections:[...selections.values()],refusals:[...refusals.values()],exceptions:[...exceptions.values()]}))}catch(e){}}
function rejected(aid){return exceptions.has("REJECT_ARTWORK_GLOBALLY|"+aid+"|*")}
function candidates(g){return g.candidates.filter(id=>!rejected(id)&&!refusals.has(lookup(g.id,id)))}
function chosen(g){const selected=selections.get(g.id);if(selected&&!rejected(selected.artworkId)&&!refusals.has(lookup(g.id,selected.artworkId)))return selected.artworkId;const a=candidates(g);return a[Math.min(indexes.get(g.id)||0,Math.max(0,a.length-1))]||null}
function choose(g,a){approvals.set(a.id,{artworkId:a.id,originalSha256:a.sha,status:"EDITORIALLY_APPROVED_ONLY"});selections.set(g.id,{targetId:g.id,artworkId:a.id,originalSha256:a.sha,status:"SELECTED_FOR_SUBJECT_EDITORIALLY_ONLY"});save();draw()}
function reject(g,a){exceptions.set("REJECT_ARTWORK_GLOBALLY|"+a.id+"|*",{kind:"REJECT_ARTWORK_GLOBALLY",artworkId:a.id,originalSha256:a.sha,date:null,observedPrincipalId:null,notes:""});approvals.delete(a.id);for(const [key,val] of selections)if(val.artworkId===a.id)selections.delete(key);save();draw()}
function skip(g,a){refusals.set(lookup(g.id,a.id),{targetId:g.id,artworkId:a.id,originalSha256:a.sha,kind:"NOT_SUITABLE_FOR_SUBJECT"});if(selections.get(g.id)?.artworkId===a.id)selections.delete(g.id);save();draw()}
function inspect(g,a){const k="INVESTIGATE_FURTHER|"+a.id+"|*";if(exceptions.has(k))exceptions.delete(k);else exceptions.set(k,{kind:"INVESTIGATE_FURTHER",artworkId:a.id,originalSha256:a.sha,date:null,observedPrincipalId:null,notes:""});save();draw()}
function preview(a){return a.preview?'<img loading="lazy" alt="'+esc(a.title)+'" src="'+a.preview+'">':'<div class="muted">Verified source preview unavailable</div>'}
function makeCard(g,i){
 const a=byId.get(chosen(g));const el=document.createElement("article");el.className="card";
 let h='<div class="hdr"><div class="num">'+esc(g.section)+' · '+(i+1)+' / '+data.subjectCount+'</div><h2>'+esc(g.title)+'</h2><div class="subject">'+esc(g.id)+'</div></div>';
 if(!a){h+='<div class="body"><p>There is no acquired exact-subject painting left in this shortlist. Check the source record, or leave this subject unresolved.</p>';
 for(const lead of g.leads)h+='<p><b>'+esc(lead.title)+'</b> · '+esc(lead.artist)+'<a class="url" href="'+esc(lead.url)+'" target="_blank" rel="noopener noreferrer">'+esc(lead.url)+'</a></p>';
 h+='</div>';el.innerHTML=h;return el;}
 const approved=selections.get(g.id)?.artworkId===a.id;
 h+='<div class="art">'+preview(a)+'</div><div class="body"><h2>'+esc(a.title)+'</h2><div class="meta">'+esc(a.artist)+' · '+esc(a.museum)+' · '+esc(a.dateCreated)+'</div><div class="status">'+esc(a.rights)+(approved?" · SELECTED FOR THIS SUBJECT":" · Proposed first choice")+'</div>';
 h+='<a class="url" href="'+esc(a.source)+'" target="_blank" rel="noopener noreferrer">'+esc(a.source)+'</a>';
 h+='<div class="actions"><button data-act="choose" class="good '+(approved?"active":"")+'">'+(approved?"Approved ✓":"Approve for this subject")+'</button>';
 h+='<button data-act="skip">Not suitable here → next</button><button data-act="reject" class="bad">Reject image everywhere</button><button data-act="inspect">Investigate</button></div>';
 const pool=g.candidates.filter(id=>id!==a.id&&!rejected(id));
 if(pool.length)h+='<button data-act="alternatives">Show other paintings ('+pool.length+')</button>';
 if(a.uses.length){h+='<details><summary>'+a.uses.length+' proposed Calendar placements (optional)</summary>';
 for(const u of a.uses.slice(0,12))h+='<p class="muted">'+esc(u.date)+' · '+esc(u.name)+' · '+esc(u.tier)+'</p>';
 if(a.uses.length>12)h+='<p class="muted">'+(a.uses.length-12)+' additional placements in the complete audit</p>';
 h+='</details>';}
 h+='<div class="expanded" hidden></div></div>';el.innerHTML=h;
 const img=el.querySelector(".art img");if(img)img.onclick=()=>{$("zoomImage").src=a.preview;$("zoom").showModal()};
 const actions=el.querySelectorAll("button[data-act]");
 for(const btn of actions)btn.onclick=()=>{
  if(btn.dataset.act==="choose")choose(g,a);
  if(btn.dataset.act==="skip")skip(g,a);
  if(btn.dataset.act==="reject")reject(g,a);
  if(btn.dataset.act==="inspect")inspect(g,a);
  if(btn.dataset.act==="alternatives"){
   const box=el.querySelector(".expanded");box.hidden=!box.hidden;if(!box.hidden){
    let html='<p class="muted">Alternative candidates for this subject. Selecting one changes only this subject.</p><div class="choices">';
    for(const aid of pool){const b=byId.get(aid);if(!b)continue;
      html+='<button class="choice" data-alt="'+esc(b.id)+'">'+preview(b)+'<strong>'+esc(b.title)+'</strong><small>'+esc(b.artist)+'</small></button>';}
    box.innerHTML=html+'</div>';box.querySelectorAll("button[data-alt]").forEach(button=>button.onclick=()=>{
     const id=button.dataset.alt; indexes.set(g.id,Math.max(0,candidates(g).indexOf(id)));draw();
    });
   }
  }
 };
 return el;
}
function draw(){
 const sec=$("section").value,q=$("query").value.trim().toLowerCase();
 const filtered=groups.filter(g=>(!sec||g.section===sec)&&(!q||[g.title,g.id,g.section,...g.candidates.flatMap(id=>{const a=byId.get(id);return a?[a.title,a.artist]:[]})].join(" ").toLowerCase().includes(q)));
 const display=filtered.slice(0,shown),list=$("cards");list.replaceChildren();
 for(const [i,g] of display.entries())list.append(makeCard(g,groups.indexOf(g)));
 $("remaining").textContent=display.length+" of "+filtered.length+" subjects shown";
 $("next").disabled=shown>=filtered.length;
 $("stats").innerHTML='<div><strong>'+data.subjectCount+'</strong> priority subjects</div><div><strong>'+selections.size+'</strong> selections saved</div><div><strong>'+data.originals+'</strong> unique acquired paintings (on demand)</div><div><strong>'+data.dateUses+'</strong> placements hidden by default</div>';
}
function allCatalogue(){
 const el=$("catalogue");if(el.childElementCount)return;
 for(const a of data.items){const card=document.createElement("div");card.className="smallart";card.innerHTML=preview(a)+'<strong>'+esc(a.title)+'</strong><small>'+esc(a.artist)+'</small><a class="url" href="'+esc(a.source)+'" target="_blank" rel="noopener noreferrer">Museum source</a>';
 el.append(card);}
}
$("section").onchange=()=>{shown=12;draw()};$("query").oninput=()=>{shown=12;draw()};
$("next").onclick=()=>{shown+=12;draw()};
$("fullToggle").onclick=()=>{const el=$("fullCatalogue");el.style.display=el.style.display==="block"?"none":"block";if(el.style.display==="block")allCatalogue()};
$("closeZoom").onclick=()=>$("zoom").close();
$("export").onclick=()=>{
 const obj={schema:"AO_SACRED_ART_CURATOR_REVIEW_V2",reviewYear:2026,exportedAt:new Date().toISOString(),
 baselineUniqueSHA:data.originals,
 rule:"Editorial selections only. No rights, crop or 1962-date publication certification.",
 approvals:[...approvals.values()],selections:[...selections.values()],
 refusals:[...refusals.values()],exceptions:[...exceptions.values()]};
 const url=URL.createObjectURL(new Blob([JSON.stringify(obj,null,2)],{type:"application/json"}));
 const l=document.createElement("a");l.href=url;l.download="sacred-art-curator-priority-decisions.json";l.click();setTimeout(()=>URL.revokeObjectURL(url),2500);
};
$("import").onclick=()=>$("upload").click();
$("upload").onchange=async e=>{
 try{const o=JSON.parse(await e.target.files[0].text());
 if(!["AO_SACRED_ART_CURATOR_REVIEW_V2","AO_SACRED_ART_NEGATIVE_EXCEPTIONS_V1"].includes(o.schema))throw Error("Unrecognized review JSON");
 approvals.clear();selections.clear();refusals.clear();exceptions.clear();
 for(const x of o.approvals||[])if(byId.get(x.artworkId)?.sha===x.originalSha256)approvals.set(x.artworkId,x);
 for(const x of o.selections||[])if(byId.get(x.artworkId)?.sha===x.originalSha256)selections.set(x.targetId,x);
 for(const x of o.refusals||[])if(byId.get(x.artworkId)?.sha===x.originalSha256)refusals.set(lookup(x.targetId,x.artworkId),x);
 for(const x of o.exceptions||[])if(byId.get(x.artworkId)?.sha===x.originalSha256)exceptions.set(x.kind+"|"+x.artworkId+"|"+(x.date||"*"),x);
 save();draw()}catch(err){alert("Review import unsuccessful: "+err.message)}
};
restore();draw();
})();
</script></body></html>'''
if __name__=="__main__":
 parser=argparse.ArgumentParser()
 parser.add_argument("--atlas",type=Path,default=ROOT/"artifacts/sacred-art-final-atlas/index.html")
 parser.add_argument("--output",type=Path,default=ROOT/"reviews/sacred-art-curator-priority.html")
 build(parser.parse_args())
