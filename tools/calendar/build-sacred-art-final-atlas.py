#!/usr/bin/env python3
"""Build the ONE complete, portable sacred-art editorial review HTML.
Requires the actual 2026 full-year association report and hashed original images.
The page records negative exceptions only. It does not certify rights, crop or app release.
"""
import argparse, base64, hashlib, io, json, re
from collections import defaultdict
from pathlib import Path
from PIL import Image, ImageOps

ROOT=Path(__file__).resolve().parents[2]
SHA=re.compile(r"^[0-9a-f]{64}$")
def read(path):
    return json.loads(path.read_text(encoding="utf-8"))
def create(args):
    reg=read(args.registry)
    indexed=read(args.associations)
    assert reg["schema"]=="AO_SACRED_ART_CANDIDATES_V1"
    assert indexed["schema"]=="AO_SACRED_ART_FULL_YEAR_MULTIPLE_ASSOCIATIONS_V1"
    assert len(indexed["days"])==365
    acquired=[a for a in reg["artworks"] if SHA.fullmatch((a.get("acquisition") or {}).get("originalSha256") or "")
              and (a.get("acquisition") or {}).get("archiveOriginal")]
    assert len({a["id"] for a in acquired})==len(acquired)
    assert len({a["acquisition"]["originalSha256"] for a in acquired})==len(acquired)
    images={}
    for root in args.images_root:
        if root.exists():
            for f in root.rglob("*"):
                if f.is_file() and f.suffix.lower() in (".jpg",".jpeg",".png",".webp"):
                    images.setdefault(f.stem,f)
    uses=defaultdict(list)
    dates=[]
    for d in indexed["days"]:
        dates.append({"date":d["date"],"name":d["observedTitle"],"rank":d["class"],
                      "principal":d["observedPrincipalId"],"coverage":d["coverage"]})
        for alt in d.get("alternatives",[]):
            uses[alt["artworkId"]].append({
              "date":d["date"],"name":d["observedTitle"],"rank":d["class"],
              "principal":d["observedPrincipalId"],
              "tier":alt["tier"],"evidence":alt.get("evidence") or ""})
    decisions=read(args.decisions) if args.decisions is not None else None
    subject_index=read(args.subject_index) if args.subject_index and args.subject_index.is_file() else None
    if subject_index:
        assert subject_index["schema"]=="AO_SACRED_ART_CONSOLIDATED_SUBJECT_REVIEW_INDEX_V1"
        assert len(subject_index["subjects"])==235
        assert subject_index["counts"]["userSelectedSubjectPlacements"]==101

    selections_by_id=defaultdict(list)
    refusals_by_id=defaultdict(list)
    if decisions is not None:
        assert decisions["schema"]=="AO_SACRED_ART_CURATOR_RECONCILIATION_V1"
        assert decisions["status"]=="USER_EDITORIAL_REVIEW_ONLY_NOT_PUBLISHED"
        canonical={a["id"]:a for a in reg["artworks"]}
        for record in decisions["selections"]:
            a=canonical.get(record["artworkId"])
            assert a and a.get("acquisition",{}).get("originalSha256")==record["originalSha256"], "Stale selected artwork SHA"
            selections_by_id[a["id"]].append(record["targetId"])
        for record in decisions["refusals"]:
            a=canonical.get(record["artworkId"])
            assert a and a.get("acquisition",{}).get("originalSha256")==record["originalSha256"], "Stale refused artwork SHA"
            refusals_by_id[a["id"]].append(record["targetId"])
    missing=[];items=[]
    metadata_only=[]
    acquired_ids={a["id"] for a in acquired}
    for a in reg["artworks"]:
        if a["id"] not in acquired_ids:
            metadata_only.append({"id":a["id"],"title":a.get("title"),"artist":a.get("artist"),
              "museum":a.get("museum"),"source":(a.get("source") or {}).get("objectUrl"),
              "rights":(a.get("source") or {}).get("rights"),"reason":"ORIGINAL_NOT_ACQUIRED"})
    primary=ROOT/"data/calendar/sacred-art-primary-museum-leads-20261011.v1.json"
    additional_leads=[]
    if primary.is_file():
        for a in read(primary).get("items",[]):
            additional_leads.append({"id":a.get("id"),"title":a.get("title"),"artist":a.get("artist"),
              "museum":a.get("museum"),"source":a.get("museumObjectUrl"),
              "rights":a.get("reproductionRights"),"reason":"PRIMARY_MUSEUM_LEAD_NOT_ACQUIRED"})
    for a in acquired:
        sha=a["acquisition"]["originalSha256"]
        f=images.get(a["id"])
        preview=None
        if f is not None:
            raw=f.read_bytes()
            if hashlib.sha256(raw).hexdigest()!=sha:
                raise ValueError("Hash mismatch for "+a["id"]+" file "+str(f))
            with Image.open(io.BytesIO(raw)) as im:
                im.load()
                thumbnail=ImageOps.exif_transpose(im).convert("RGB")
                thumbnail.thumbnail((650,820),Image.Resampling.LANCZOS)
                buf=io.BytesIO()
                thumbnail.save(buf,format="WEBP",quality=76,method=5)
            preview="data:image/webp;base64,"+base64.b64encode(buf.getvalue()).decode("ascii")
        else:
            missing.append(a["id"])
        items.append({
          "id":a["id"],"sha":sha,"title":a.get("title"),"artist":a.get("artist"),
          "museum":a.get("museum"),"dateCreated":a.get("dated"),
          "source":(a.get("source") or {}).get("objectUrl"),
          "rights":(a.get("source") or {}).get("rights"),
          "subjectTags":(a.get("association") or {}).get("subjectKeys") or [],
          "prayerKeys":(a.get("association") or {}).get("prayerKeys") or [],
          "preview":preview,"uses":uses.get(a["id"],[]),
          "selectedSubjectKeys":selections_by_id[a["id"]],
          "refusedSubjectKeys":refusals_by_id[a["id"]],
          "policyExcluded":bool(re.search(r"\b(?:el[ -]?greco|fra[ -]?angelico)\b",a.get("artist") or "",re.I)),
          "publicationApproved":False
        })
    if args.strict_images and missing:
        raise ValueError("Complete atlas requires all originals; preview absent for "+str(len(missing))+" artworks (first: "+",".join(missing[:8])+")")
    # Stable fingerprints prevent a saved exception-only review from silently
    # applying to new originals or changed date associations on a later build.
    source_fingerprints={
        "originalsSha256":hashlib.sha256("\n".join(sorted(a["id"]+":"+a["acquisition"]["originalSha256"]
             for a in acquired)).encode()).hexdigest(),
        "dateAssociationsSha256":hashlib.sha256(json.dumps(indexed["days"],
             sort_keys=True,separators=(",",":"),ensure_ascii=False).encode()).hexdigest()
    }
    payload={"schema":"AO_SACRED_ART_FULL_YEAR_NEGATIVE_EXCEPTION_REVIEW_V1","year":2026,
             "policy":{"unflagged":"DRAFT_UNTIL_COMPLETION_CONFIRMED",
                       "afterCompletion":"UNFLAGGED_EDITORIAL_ONLY",
                       "legalCropAndRelease":"SEPARATE_GATES",
                       "noPublicationCertification":True},
             "sourceFingerprints":source_fingerprints,
             "priorCuratorReview":{"selectionCount":sum(map(len,selections_by_id.values())),
                                   "refusalCount":sum(map(len,refusals_by_id.values())),
                                   "status":decisions["status"] if decisions else "NOT_IMPORTED"},
             "summary":{"acquired":len(acquired),"records":len(reg["artworks"]),
                        "yearDates":len(dates),"sourceAlternatives":sum(len(a["uses"]) for a in items),
                        "previewMissing":len(missing),"fullYearCoverage":indexed.get("summary",{})},
             "items":items,"days":dates,"pendingSourceLinks":metadata_only+additional_leads,
             "subjectInventory":subject_index}
    safe=json.dumps(payload,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
    html=PAGE.replace("__PAYLOAD__",safe)
    args.output.parent.mkdir(parents=True,exist_ok=True)
    args.output.write_text(html,encoding="utf-8")
    (args.output.parent/"build-stats.json").write_text(json.dumps({
        "artworks":len(items),"calendarDates":len(dates),
        "linkedArtworkDayAssociations":sum(len(x["uses"]) for x in items),
        "missingPreviews":missing,"strictImageGate":args.strict_images
    },indent=2)+"\n",encoding="utf-8")
    print("SACRED_ART_SINGLE_REVIEW="+str(args.output))
    print("REVIEW_ARTWORKS="+str(len(items))+" MISSING_PREVIEWS="+str(len(missing)))

PAGE=r'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Sacred Art — Complete Editorial Atlas</title>
<style>
:root{color-scheme:dark;--bg:#080c12;--panel:#111924;--line:#304053;--text:#eee7da;--muted:#a6abb5;--gold:#bea374;--warn:#dbad79}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,Arial,sans-serif}
header{padding:19px clamp(16px,3vw,42px);border-bottom:1px solid var(--line);background:#0d141e;position:sticky;top:0;z-index:5}
h1{font:normal clamp(24px,3vw,36px) Georgia,serif;margin:2px 0}h2{font:normal 21px Georgia,serif;margin:6px 0 9px}p{margin:5px 0;color:var(--muted)}
small{color:var(--muted)}.eyebrow{font-size:11px;color:var(--gold);letter-spacing:.17em;text-transform:uppercase}
nav{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 0}.filters{display:flex;gap:8px;flex-wrap:wrap;align-items:center}
button,input,select,textarea{font:inherit;color:var(--text);background:#172331;border:1px solid #495566;border-radius:5px}
button{cursor:pointer;padding:8px 12px;min-height:38px}button:hover,button:focus-visible{border-color:var(--gold)}
button.primary{background:#705f41;border-color:#af9463}input,select{padding:8px;min-height:38px}input[type=search]{width:min(320px,90vw)}
input[type=checkbox]{min-height:0;accent-color:var(--gold)}label{font-size:12px;color:var(--muted)}
main{max-width:1500px;margin:auto;padding:20px 18px 80px}.note{padding:14px 0 20px;color:#b9bdc5}
.stat{display:flex;gap:20px;flex-wrap:wrap;padding:8px 0}.stat strong{color:var(--gold)}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(315px,1fr));gap:16px}
.card{border:1px solid var(--line);background:var(--panel);border-radius:8px;overflow:hidden}
.image{height:315px;background:#05080d;display:grid;place-items:center}.image img{max-height:100%;max-width:100%;object-fit:contain;cursor:zoom-in}
.notloaded{padding:15px;color:var(--warn)}.info{padding:15px}.muted{color:var(--muted)}.rights{font-size:11px;color:var(--gold);letter-spacing:.035em}
a{color:#dbc99f}.tags{font-size:12px;margin:9px 0;color:var(--muted)}.actions{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0}
.flag.active{border-color:#d99a88;background:#673e3d}.approve{border-color:#487b6b;color:#b6e1cf}.approve.active{background:#173e35;border-color:#78af95;color:#d3fae6}.pending{padding:12px 14px;border:1px solid var(--line);border-radius:8px;margin:9px 0}.pending a,.source-url{overflow-wrap:anywhere;font-size:11px;display:block;margin-top:5px}.meta-label{font-size:11px;color:var(--warn)}.investigate.active{border-color:#e6c081;background:#645333}
textarea{width:100%;min-height:52px;resize:vertical;padding:8px;font-size:12px}
details{border-top:1px solid var(--line);margin-top:14px;padding-top:11px}summary{cursor:pointer;color:var(--gold)}
.use{display:grid;grid-template-columns:90px minmax(0,1fr);column-gap:9px;padding:10px 0;border-bottom:1px solid #26323e}
.use strong{font-size:12px}.use .evidence{color:var(--muted);font-size:11px;margin:4px 0}
.tier{font-size:11px;color:var(--gold)}.use button{grid-column:2;justify-self:start;margin-top:5px;font-size:12px;min-height:30px}
#calendar{display:none}.day{padding:16px 0;border-bottom:1px solid var(--line)}.day h2{margin:0 0 5px}.day .artref{display:inline-block;margin:5px 6px 3px 0;padding:7px 9px;border:1px solid var(--line);border-radius:5px}
.review-confirm{display:flex;align-items:center;gap:8px;max-width:540px;padding:5px 9px;border:1px solid var(--line);border-radius:6px}.review-confirm input{flex:none}.review-policy-block{color:#efad96;border-left:3px solid #d78d77;padding-left:8px;margin:8px 0}.prior-selection{color:#c9d4bb;font-size:12px;margin:8px 0}.prior-refusal{color:#d7b596;font-size:11px;margin:5px 0}.more{color:var(--muted);font-size:12px}.warning{color:var(--warn)}dialog{max-width:95vw;max-height:96vh;background:#070b10;color:var(--text);border:1px solid #666}dialog img{max-width:87vw;max-height:85vh;object-fit:contain}
@media(max-width:650px){header{position:relative}.grid{grid-template-columns:1fr}main{padding:14px}.stat{gap:8px 15px}}
</style></head><body>
<header><div class="eyebrow">1962 Calendar · Complete Sacred Art Review</div><h1>Artwork &amp; liturgical placement</h1>
<p>One complete exception-only editorial review. Flag unsuitable artwork or incorrect uses; unflagged items count as editorially accepted only after you explicitly mark the entire gallery reviewed. Rights, cropping, edition and publication remain separate.</p>
<div class="stat" id="stats"></div>
<nav><button id="showArt">Artworks</button><button id="showSubjects">235 subjects</button><button id="showCalendar">Calendar</button><button id="showPending">Unacquired source links</button>
<input id="search" type="search" placeholder="Find artwork, artist, feast or Gospel" aria-label="Search">
<select id="rank"><option value="">Every class</option><option value="1">Class I</option><option value="2">Class II</option><option value="3">Class III</option><option value="4">Class IV</option></select>
<select id="tier"><option value="specific">Specific/event proposals</option><option value="all">All associations, including seasonal &amp; generic</option></select>
<select id="rights"><option value="">All rights labels</option><option value="CC0">CC0 only</option><option value="held">Rights held</option></select>
<button class="primary" id="export">Export review JSON</button>
<label class="review-confirm"><input id="reviewComplete" type="checkbox"> I have reviewed every displayed source original and all proposed day placements (not merely the filtered view)</label>
<button id="importBtn">Import previous review</button><input type="file" id="importFile" accept=".json,application/json" hidden>
</nav>
</header>
<main><p class="note">One source original per card, with museum URL and every proposed Calendar use. Flag a globally unsuitable painting, a misplaced date or an item needing investigation. Existing subject-scoped selections are shown but do not approve unrelated uses. The export remains a draft until the full, unfiltered review is explicitly completed.</p>
<p class="warning" id="completionStatus" role="status">Draft review: no broad editorial acceptance is implied.</p>
<section id="art"><div class="grid" id="gallery"></div></section>
<section id="subjects" style="display:none"><h2>Complete subject inventory · 235 requirements</h2><p>Each earlier selection is preserved. The preview is displayed only when its exact acquired original is present in this atlas. A missing preview does not constitute artistic rejection.</p>
<div class="filters"><select id="subjectCategory" aria-label="Subject category"><option value="">All subjects</option><option>Rosary</option><option>Stations</option><option>Devotions</option><option>Calendar saints</option><option>Bible Atlas</option></select>
<select id="subjectStatus" aria-label="Editorial status"><option value="">Any status</option><option value="selected">Earlier selection</option><option value="research">Research in progress</option><option value="unlinked">Selected, original not linked</option></select></div>
<div class="grid" id="subjectCards"></div></section>
<section id="calendar"><div id="days"></div></section>
<section id="pending" style="display:none"><h2>Unacquired artworks and museum leads</h2><p>These source records lack acquired and checksum-verified image previews; open their museum URLs before making artistic decisions.</p><div id="pendingList"></div></section>
</main>
<dialog id="zoom"><button id="closeZoom">Close</button><div><img id="zoomImg" alt="Artwork enlarged"></div></dialog>
<script id="dataset" type="application/json">__PAYLOAD__</script>
<script>
(function(){
"use strict";
const data=JSON.parse(document.getElementById("dataset").textContent);
const $=id=>document.getElementById(id);
const catalog=new Map(data.items.map(x=>[x.id,x]));
const acceptedTiers=new Set(["STRICT_DAY_SOURCE_LINK","VERIFIED_CONTEXTUAL_LEDGER","OBSERVED_ID_TAG_UNREVIEWED","TITULAR_PERSON_OR_EVENT_CANDIDATE","APPOINTED_GOSPEL_SCENE_CANDIDATE"]);
const exceptions=new Map();
const approvals=new Map();
const fingerprint=data.sourceFingerprints?.originalsSha256||"unknown";
const storageKey="ao-sacred-art-exceptions-2026-"+fingerprint;
const approvalStorageKey="ao-sacred-art-approvals-2026-"+fingerprint;
const escape=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const key=(id,date,principal,type)=>[id,date||"*",principal||"*",type].join("|");
function restore(){
 try{const stored=JSON.parse(localStorage.getItem(storageKey)||"[]");
 for(const x of stored) if(catalog.has(x.artworkId)&&catalog.get(x.artworkId).sha===x.originalSha256)
 exceptions.set(key(x.artworkId,x.date,x.observedPrincipalId,x.kind),x);
 const approved=JSON.parse(localStorage.getItem(approvalStorageKey)||"[]");
 for(const x of approved) if(catalog.has(x.artworkId)&&catalog.get(x.artworkId).sha===x.originalSha256)
 approvals.set(x.artworkId,x);
 }catch(e){console.warn("Could not restore local editorial flags");}
}
function save(){try{localStorage.setItem(storageKey,JSON.stringify([...exceptions.values()]));
 localStorage.setItem(approvalStorageKey,JSON.stringify([...approvals.values()]));}catch(e){}}
function toggle(kind,a,u){
 if(kind==="APPROVE_ARTWORK_EDITORIALLY"){
  if(approvals.has(a.id))approvals.delete(a.id);
  else{approvals.set(a.id,{artworkId:a.id,originalSha256:a.sha,status:"EDITORIALLY_APPROVED_ONLY"});
   exceptions.delete(key(a.id,null,null,"REJECT_ARTWORK_GLOBALLY"));
   exceptions.delete(key(a.id,null,null,"INVESTIGATE_FURTHER"));}
  save();draw();return;
 }
 if(kind==="REJECT_ARTWORK_GLOBALLY")approvals.delete(a.id);
 const date=u?.date||null,principal=u?.principal||null;
 const k=key(a.id,date,principal,kind);
 if(exceptions.has(k))exceptions.delete(k);
 else exceptions.set(k,{kind,artworkId:a.id,originalSha256:a.sha,
   date,observedPrincipalId:principal,
   observedTitle:u?.name||null,relationshipTier:u?.tier||null,notes:""});
 save();draw();
}
function has(kind,a,u){return exceptions.has(key(a.id,u?.date,u?.principal,kind))}
function relevant(u){return $("tier").value==="all"||acceptedTiers.has(u.tier)}
function filtered(x){
 const q=$("search").value.trim().toLowerCase();
 const uses=x.uses.filter(relevant);
 const searchText=[x.id,x.title,x.artist,x.museum,x.subjectTags.join(" "),x.prayerKeys.join(" "),
 ...uses.flatMap(u=>[u.date,u.name,u.evidence])].join(" ").toLowerCase();
 if(q&&!searchText.includes(q))return false;
 if($("rights").value==="CC0"&&x.rights!=="CC0")return false;
 if($("rights").value==="held"&&x.rights==="CC0")return false;
 if($("rank").value&&!uses.some(u=>String(u.rank)===$("rank").value))return false;
 return true;
}
function flags(a,u){
 return '<button class="flag '+(has("REJECT_ARTWORK_GLOBALLY",a)?"active":"")+'" data-kind="REJECT_ARTWORK_GLOBALLY">Reject globally</button>'+
 '<button class="investigate '+(has("INVESTIGATE_FURTHER",a,u)?"active":"")+'" data-kind="INVESTIGATE_FURTHER"'+(u?' data-date="'+escape(u.date)+'" data-principal="'+escape(u.principal)+'"':'')+'>Investigate</button>';
}
function draw(){
 const gallery=$("gallery");
 const openCards=new Set([...gallery.querySelectorAll("article.card")].filter(c=>c.querySelector("details[open]")).map(c=>c.dataset.id));
 const view=data.items.filter(filtered);
 gallery.replaceChildren();
 for(const a of view){
  const card=document.createElement("article");card.className="card";
  card.dataset.id=a.id;
  const matches=a.uses.filter(relevant);
  const activeReject=has("REJECT_ARTWORK_GLOBALLY",a);
  const phot=a.preview?'<img loading="lazy" decoding="async" class="preview" alt="'+escape(a.title)+'" src="'+a.preview+'">'
   :'<div class="notloaded">Original preview missing — technical hold. Source must be acquired before final audit.</div>';
  let html='<div class="image">'+phot+'</div><div class="info">'+
    '<div class="eyebrow">'+escape(a.museum)+'</div><h2>'+escape(a.title)+'</h2>'+
    '<div class="muted">'+escape(a.artist)+' · '+escape(a.dateCreated)+'</div>'+
    '<div class="rights">'+escape(a.rights)+(a.rights==="CC0"?"":" · SEPARATE RIGHTS REVIEW")+'</div>'+
    '<div class="tags">'+escape(a.subjectTags.slice(0,8).join(" · "))+'</div>'+
    (a.selectedSubjectKeys.length?'<div class="prior-selection">Previously selected for: '+escape(a.selectedSubjectKeys.join(" · "))+' (subject only)</div>':'')+
    (a.refusedSubjectKeys.length?'<div class="prior-refusal">Previously unsuitable for: '+escape(a.refusedSubjectKeys.join(" · "))+'</div>':'')+
    (a.policyExcluded?'<div class="review-policy-block">Excluded artist: do not publish or infer approval from an old subject selection; replacement requires a separate source review.</div>':'')+
    '<a class="source-url" target="_blank" rel="noopener noreferrer" href="'+escape(a.source)+'">'+escape(a.source)+'</a>'+
    '<div class="actions">'+flags(a,null)+'</div>'+
    '<label>Notes on this artwork <textarea data-note="'+escape(a.id)+'" placeholder="Only needed when flagging"></textarea></label>'+
    '<details><summary>'+matches.length+' matching date assignments'+(activeReject?" · globally rejected":"")+'</summary>';
  if(!matches.length)html+='<p>No specific 2026 calendar placement recorded; module art or unassigned.</p>';
  for(const u of matches){
    const flagged=has("MISPLACED_ON_DAY",a,u);
    html+='<div class="use"><strong>'+escape(u.date)+'</strong><div>'+escape(u.name)+
      '<div class="tier">'+escape(u.tier.replaceAll("_"," "))+' · Class '+escape(u.rank)+'</div>'+
      '<div class="evidence">'+escape(u.evidence)+'</div></div>'+
      '<button class="flag '+(flagged?"active":"")+'" data-kind="MISPLACED_ON_DAY" data-date="'+escape(u.date)+'" data-principal="'+escape(u.principal)+'">'+
      (flagged?"Unflag misplacement":"Flag misplaced on this date")+'</button></div>';
  }
  html+='</details><small>SHA-256 '+escape(a.sha.slice(0,15))+'…</small></div>';
  card.innerHTML=html;gallery.append(card);
  if(openCards.has(a.id))card.querySelector("details").open=true;
  const img=card.querySelector("img.preview");if(img)img.onclick=()=>{$("zoomImg").src=a.preview;$("zoom").showModal()};
  card.querySelectorAll("button[data-kind]").forEach(btn=>btn.onclick=()=>{
   const u=btn.dataset.date?a.uses.find(u=>u.date===btn.dataset.date&&u.principal===btn.dataset.principal):null;
   toggle(btn.dataset.kind,a,u);
  });
  const note=card.querySelector("textarea");
  const stored=exceptions.get(key(a.id,null,null,"INVESTIGATE_FURTHER"))||exceptions.get(key(a.id,null,null,"REJECT_ARTWORK_GLOBALLY"));
  note.value=stored?.notes||"";
  note.oninput=()=>{
    const obj=exceptions.get(key(a.id,null,null,"INVESTIGATE_FURTHER"))||exceptions.get(key(a.id,null,null,"REJECT_ARTWORK_GLOBALLY"));
    if(obj){obj.notes=note.value;save()}
  };
 }
 const count=[...exceptions.values()].length;
 const approved=approvals.size;
 $("stats").innerHTML="<span><strong>"+data.summary.acquired+"</strong> originals</span>"+
 "<span><strong>"+data.summary.sourceAlternatives+"</strong> proposed date uses</span>"+
 "<span><strong>"+data.summary.previewMissing+"</strong> missing previews</span>"+
 "<span><strong>"+count+"</strong> flagged exceptions</span>"+
 "<span><strong>"+data.priorCuratorReview.selectionCount+"</strong> pre-reviewed subject choices</span>"+
 "<span><strong>"+approved+"</strong> legacy image approvals</span>"+
 "<span><strong>"+view.length+"</strong> shown</span>";
}
function drawDays(){
 const el=$("days");el.replaceChildren();
 const q=$("search").value.trim().toLowerCase();
 for(const d of data.days){
  if($("rank").value&&String(d.rank)!==$ ("rank").value)continue;
  const art=data.items.filter(a=>a.uses.some(u=>u.date===d.date&&u.principal===d.principal&&relevant(u)));
  if(q&&![d.date,d.name,...art.flatMap(a=>[a.title,a.artist])].join(" ").toLowerCase().includes(q))continue;
  const row=document.createElement("article");row.className="day";
  row.innerHTML='<div class="eyebrow">'+escape(d.date)+' · Class '+escape(d.rank)+'</div><h2>'+escape(d.name)+'</h2>'+
    '<p>'+escape(d.coverage.replaceAll("_"," "))+' · '+art.length+' paintings shown</p>'+
    art.map(a=>'<button class="artref" data-id="'+escape(a.id)+'">'+escape(a.title)+'</button>').join("");
  el.append(row);
  row.querySelectorAll("button").forEach(btn=>btn.onclick=()=>{
    $("showArt").click();$("search").value=btn.dataset.id;draw();
    window.scrollTo({top:0,behavior:"smooth"});
  });
 }
}
function drawSubjects(){
 const root=$("subjectCards");root.replaceChildren();
 const idx=data.subjectInventory;
 if(!idx){root.textContent="Subject inventory missing from this build.";return;}
 const cat=$("subjectCategory").value,status=$("subjectStatus").value,q=$("search").value.toLowerCase().trim();
 const picked=new Map(idx.selectedEditorialArtworks.map(x=>[x.editorialArtworkId,x]));
 for(const s of idx.subjects){
  const selected=picked.get(s.selectedEditorialArtworkId);
  const source=(s.selectedRegistryArtworkIds||[]).map(id=>catalog.get(id)).find(Boolean);
  if(cat&&s.category!==cat)continue;
  if(status==="selected"&&s.editorialDecision!=="selected")continue;
  if(status==="research"&&s.editorialDecision==="selected")continue;
  if(status==="unlinked"&&!(s.editorialDecision==="selected"&&!source))continue;
  if(q&&![s.subjectId,s.title,s.category,selected?.title,selected?.artist].join(" ").toLowerCase().includes(q))continue;
  const card=document.createElement("article");card.className="card";
  const fig=source?.preview?'<img loading="lazy" class="preview" alt="'+escape(source.title)+'" src="'+source.preview+'">':
   '<div class="notloaded">No exact verified acquisition preview in this atlas</div>';
  card.innerHTML='<div class="image">'+fig+'</div><div class="info">'+
   '<div class="eyebrow">'+escape(s.category)+' · '+escape(s.subjectId)+'</div>'+
   '<h2>'+escape(s.title)+'</h2>'+
   (selected?'<p><strong>Earlier selection:</strong> '+escape(selected.artist)+' — '+escape(selected.title)+'</p>':'<p>Research in progress; no painting newly chosen.</p>')+
   '<p class="muted">'+escape(s.layeredResearchStatus||s.editorialDecision)+' · '+s.acquiredReuse.length+' acquired reuse possibilities · '+s.layeredResearchArtworkIds.length+' research leads</p>'+
   (s.exactSceneMismatch?'<div class="review-policy-block">Earlier option depicts a different biblical event.</div>':'')+
   (s.optionalNoImage?'<p>Text/map/timeline coverage is acceptable without painting.</p>':'')+
   (selected?.sourceUrl?'<a class="source-url" target="_blank" rel="noopener noreferrer" href="'+escape(selected.sourceUrl)+'">Selected artwork reference</a>':'')+
   (source?'<p>Verified registry original: '+escape(source.id)+'</p>':'')+'</div>';
  root.appendChild(card);
 }
}
function update(){draw();if($("calendar").style.display==="block")drawDays();if($("subjects").style.display==="block")drawSubjects()}
function drawPending(){
 const list=$("pendingList");list.replaceChildren();
 for(const p of data.pendingSourceLinks||[]){
  const card=document.createElement("article");card.className="pending";
  card.innerHTML='<div class="meta-label">'+escape(p.reason)+'</div><h2>'+escape(p.title)+'</h2>'+
   '<p>'+escape(p.artist)+' · '+escape(p.museum)+' · '+escape(p.rights)+'</p>'+
   (p.source?'<a target="_blank" rel="noopener noreferrer" href="'+escape(p.source)+'">'+escape(p.source)+'</a>':'<p>Source URL unavailable</p>');
  list.append(card);
 }
}
for(const id of ["search","rank","tier","rights"])$(id).addEventListener("input",update);
for(const id of ["subjectCategory","subjectStatus"])$(id).addEventListener("change",drawSubjects);
$("showArt").onclick=()=>{$("art").style.display="block";$("subjects").style.display="none";$("calendar").style.display="none";$("pending").style.display="none"};
$("showSubjects").onclick=()=>{$("art").style.display="none";$("subjects").style.display="block";$("calendar").style.display="none";$("pending").style.display="none";drawSubjects()};
$("showCalendar").onclick=()=>{$("art").style.display="none";$("subjects").style.display="none";$("calendar").style.display="block";$("pending").style.display="none";drawDays()};
$("showPending").onclick=()=>{$("art").style.display="none";$("subjects").style.display="none";$("calendar").style.display="none";$("pending").style.display="block";drawPending()};
$("closeZoom").onclick=()=>$("zoom").close();
function completionState(){
 const requested=$("reviewComplete").checked;
 const hasAllPreviews=data.summary.previewMissing===0;
 const hasAssociations=data.days.length===365&&data.summary.sourceAlternatives>0;
 const allSelectedAvailable=data.subjectInventory?.counts?.selectedJoin?.selectedMatchedToAcquiredOriginal===101;
 const complete=requested&&hasAllPreviews&&hasAssociations&&allSelectedAvailable;
 const excluded=data.items.filter(a=>a.policyExcluded).map(a=>a.id);
 $("completionStatus").textContent=complete
  ?"Full-gallery editorial review confirmed. Exceptions apply; publication rights and crop gates remain closed."
  :requested&&!hasAllPreviews?"Cannot complete: one or more original-image previews are missing."
  :requested&&!allSelectedAvailable?"Cannot complete: the 101 subject selections are not all present in the acquired original library."
  :"Draft review only. Existing subject selections remain scoped; all new artwork/date associations are still unreviewed.";
 return {complete,excluded};
}
$("reviewComplete").addEventListener("change",completionState);
$("export").onclick=()=>{
 const {complete,excluded}=completionState();
 const payload={schema:"AO_SACRED_ART_CURATOR_NEGATIVE_REVIEW_V3",
  reviewYear:data.year,exportedAt:new Date().toISOString(),
  reviewCompleted:complete,
  reviewScope:"ALL_ACQUIRED_ORIGINALS_AND_ALL_2026_DATED_ASSOCIATIONS",
  rule:complete?"UNFLAGGED_EDITORIALLY_ACCEPTED_EXCEPT_POLICY_EXCLUSIONS":"DRAFT_NO_INFERRED_APPROVAL",
  publicationApproved:false,technicalRightsAndCropCertification:false,
  sourceFingerprints:data.sourceFingerprints,
  reviewedCounts:{artworks:data.summary.acquired,dates:data.days.length,proposedUses:data.summary.sourceAlternatives,missingPreviews:data.summary.previewMissing},
  excludedArtworkIds:excluded,
  priorCuratorReview:data.priorCuratorReview,
  baselineUniqueSHA:data.summary.acquired,
  approvals:[...approvals.values()],exceptions:[...exceptions.values()]};
 const url=URL.createObjectURL(new Blob([JSON.stringify(payload,null,2)],{type:"application/json"}));
 const link=document.createElement("a");link.href=url;link.download="sacred-art-curator-review.json";link.click();
 setTimeout(()=>URL.revokeObjectURL(url),1500);
};
$("importBtn").onclick=()=>$("importFile").click();
$("importFile").onchange=async e=>{
 try{
  const imported=JSON.parse(await e.target.files[0].text());
  if(!["AO_SACRED_ART_NEGATIVE_EXCEPTIONS_V1","AO_SACRED_ART_CURATOR_REVIEW_V2","AO_SACRED_ART_CURATOR_NEGATIVE_REVIEW_V3"].includes(imported.schema))throw Error("Wrong format");
  if(imported.schema==="AO_SACRED_ART_CURATOR_NEGATIVE_REVIEW_V3"&&
    (imported.sourceFingerprints?.originalsSha256!==data.sourceFingerprints.originalsSha256||
     imported.sourceFingerprints?.dateAssociationsSha256!==data.sourceFingerprints.dateAssociationsSha256))
    throw Error("Source originals or date assignments changed; review cannot be reused without reinspection");
  exceptions.clear();approvals.clear();
  $("reviewComplete").checked=imported.schema==="AO_SACRED_ART_CURATOR_NEGATIVE_REVIEW_V3"&&imported.reviewCompleted===true;
  for(const x of imported.approvals||[])if(catalog.has(x.artworkId)&&catalog.get(x.artworkId).sha===x.originalSha256)
    approvals.set(x.artworkId,x);
  for(const x of imported.exceptions||[])if(catalog.has(x.artworkId)&&catalog.get(x.artworkId).sha===x.originalSha256)
    exceptions.set(key(x.artworkId,x.date,x.observedPrincipalId,x.kind),x);
  save();draw();completionState();if($("calendar").style.display==="block")drawDays();
 }catch(err){alert("Review import rejected: "+err.message)}
};
restore();draw();completionState();
})();
</script></body></html>'''
if __name__=="__main__":
    parser=argparse.ArgumentParser()
    parser.add_argument("--registry",type=Path,default=ROOT/"data/calendar/sacred-art-candidates.v1.json")
    parser.add_argument("--associations",type=Path,default=ROOT/"artifacts/sacred-art-coverage/full-year-multiple-associations.v1.json")
    parser.add_argument("--images-root",type=Path,action="append",default=[])
    parser.add_argument("--output",type=Path,default=ROOT/"artifacts/sacred-art-final-atlas/index.html")
    parser.add_argument("--strict-images",action="store_true")
    parser.add_argument("--decisions",type=Path,default=None,
                        help="Existing subject-scoped curator decisions; does not grant full-year review approval")
    parser.add_argument("--subject-index",type=Path,
                        default=ROOT/"data/calendar/sacred-art-consolidated-subject-review-index-20261013.v1.json",
                        help="All 235 subject requirements, linked to canonical original IDs")
    create(parser.parse_args())
