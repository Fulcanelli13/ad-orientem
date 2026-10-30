#!/usr/bin/env python3
"""Editorial many-to-many prayer-slot review, first 50 *actual Queue 2* records.

Source: frozen Queue 2 order + original four offline photo galleries.
This is a Prayer *relevance/matching* review. It DOES NOT approve photographs,
change rights, replace prior artwork decisions, move the release queue, or ship.
"""
import csv,json,re,hashlib,collections
from datetime import datetime,timezone
from pathlib import Path

ROOT=Path("data/calendar/sacred-art-master-v2")
SOURCE=ROOT/"queue-photo-qa-or-repair.csv"
PHOTO_PAGES=[Path("docs/SACRED_ART_FAST_GRID_REVIEW_BATCH%02d_20261030.html"%i) for i in range(1,5)]
PAGE=Path("docs/AO_PRAYER_ART_Q2_MATCHING_REVIEW_BATCH01_50_20261030.html")
MANIFEST=ROOT/"prayer-q2-matching-batch01-50-proposals-20261030.v1.json"
SCHEMA="AO_PRAYER_Q2_SLOT_REVIEW_BATCH01_V1"
# Every assignment is an editorial proposal, not an approval.
# Exact IDs below are from the 275-slot Prayer Art Matching Map.
SUGGESTIONS={
1:["HERO-03","DOOR-D6","COV-pray.adoration"],
2:["DOOR-D5","COV-pray.adoration","COV-pray.adoration.four_ends","COV-benediction_divine_praises"],
3:["COV-novena.st_michael","COV-devotion_prayer_st_michael","DOOR-D8"],
4:["COV-pray.divine_mercy","STG-pray.divine_mercy-01"],
5:["COV-pray.rosary","STG-pray.rosary-01","DOOR-D3","COV-pray.rosary_methods"],
6:["STG-prayer.communion-01","COV-adoration_lord_i_am_not_worthy","HERO-18"],
7:["DOOR-D7","STG-pray.angelus-08"],
8:["HERO-14","STG-pray.rosary-14","COV-sacrament_come_holy_spirit"],
9:["HERO-12","STG-pray.rosary-12","STG-pray.angelus_regina-02","COV-pray.angelus_regina"],
10:["HERO-12","STG-pray.rosary-12","STG-pray.angelus_regina-02","COV-pray.angelus_regina"],
11:["DOOR-D8","COV-daily.personal_rule"],
12:["HERO-22","DOOR-D6"],
13:["HERO-22","DOOR-D6"],
14:["COV-pray.angelus","STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.rosary-02","HERO-01"],
15:["COV-pray.angelus","STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.rosary-02","HERO-01"],
16:["COV-pray.angelus","STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.rosary-02","HERO-01"],
17:["COV-pray.angelus","STG-pray.angelus-05","STG-pray.angelus-06","STG-pray.rosary-02","HERO-01"],
18:["COV-novena.st_joseph","HERO-01"],
19:["COV-novena.st_joseph","HERO-01"],
20:["COV-foundations_guardian_angel","STG-pray.adoration.night-06","DOOR-D8"],
21:["COV-foundations_guardian_angel","STG-pray.adoration.night-06","DOOR-D8"],
22:["COV-foundations_guardian_angel","STG-pray.adoration.night-06","DOOR-D8"],
23:["COV-prayer.sacred_heart","COV-novena.sacred_heart","HERO-17","COV-sacred_heart_short_prayer"],
24:["COV-prayer.sacred_heart","COV-novena.sacred_heart","HERO-17","COV-sacred_heart_short_prayer"],
25:["COV-novena.immaculate_heart","COV-marian_consecration_immaculate_heart","DOOR-D7"],
26:["COV-novena.immaculate_heart","COV-marian_consecration_immaculate_heart","DOOR-D7"],
27:["HERO-12","STG-pray.rosary-12","STG-pray.angelus_regina-02","COV-pray.angelus_regina"],
28:["HERO-12","STG-pray.rosary-12","STG-pray.angelus_regina-02","COV-pray.angelus_regina"],
29:["COV-pray.adoration","COV-prayer.communion","COV-adoration_spiritual_communion","STG-prayer.communion-02"],
30:["HERO-02","STG-pray.rosary-04"],
31:["STG-pray.rosary-07","STG-pray.precious_blood-02","STG-pray.adoration.night-02","HERO-06"],
32:["DOOR-D8"],
33:["HERO-03","DOOR-D6","COV-pray.adoration"],
34:["HERO-02","STG-pray.rosary-04"],
35:["STG-pray.rosary-07","STG-pray.precious_blood-02","STG-pray.adoration.night-02","HERO-06"],
36:["DOOR-D8"],
37:["DOOR-D8"],
38:["DOOR-D8"],
39:["DOOR-D8"],
40:["HERO-13","STG-pray.rosary-13"],
41:["STG-pray.rosary-06","HERO-04"],
42:["HERO-07","STG-pray.rosary-10","COV-pray.stations","STG-pray.stations-02"],
43:["DOOR-D8"],
44:["HERO-18","STG-pray.adoration.four_ends-04","COV-adoration_lord_i_am_not_worthy"],
45:["DOOR-D8"],
46:["DOOR-D8","COV-daily.nightly_examen"],
47:["HERO-01","DOOR-D2"],
48:["DOOR-D9","COV-daily.personal_rule"],
49:["HERO-11","STG-pray.stations-13","COV-pray.five_wounds"],
50:["DOOR-D8","COV-daily.personal_rule"]
}
RATIONALE={
1:"Exact Epiphany subject; Eucharistic adoration is an optional thematic parallel rather than a literal sacramental scene.",
2:"The Lamb and heavenly worship speak to Eucharistic adoration, benediction and liturgical praise.",
3:"Direct Saint Michael subject. Can recur in saint/angel prayers and his novena.",
4:"Direct historical Divine Mercy image; assess whether devotional style suits the module and note separate photo-rights questions.",
5:"Rosary devotion and its opening, not a specific Gospel mystery. Earlier Lotto final cover approval is preserved.",
6:"Multiplication of loaves offers a broad Eucharistic and providence parallel, not an image of Communion itself.",
7:"Our Lady as intercessor. This reproduction should be judged carefully for poster-like presentation and rights.",
8:"Direct Pentecost subject for feast, Glorious mystery and invocation of the Holy Ghost.",
9:"Direct Resurrection; one photograph may serve the Regina Cæli and the Glorious mystery.",
10:"Same subject/source as another separate record. Review independently; duplicates are not merged.",
11:"Saint Jerome as scriptural meditation and learned prayer; no direct Rosary mystery.",
12:"Christ as Savior and King. Historically approved artwork identity for Christ the King; photograph remains release-gated.",
13:"Savior/King theme; potential alternative to Benson rather than a replacement for his historical approval.",
14:"Annunciation: Angelus and first Joyful mystery. Dawn/noon/dusk cover variants require a separate light-and-mood choice.",
15:"Annunciation: Angelus and first Joyful mystery. Art-specific time-of-day choice is optional.",
16:"Annunciation: Angelus and first Joyful mystery. Art-specific time-of-day choice is optional.",
17:"Annunciation: Angelus and first Joyful mystery. Prado source is disfavoured under existing image preferences.",
18:"Joseph's dream naturally suits Joseph devotion and Advent expectation; no need to force an Angelus-stage scene.",
19:"Joseph's dream naturally suits Joseph devotion and Advent expectation. Parallel source record kept distinct.",
20:"Guardian Angel for foundational prayer, evening entrustment and angels door.",
21:"Guardian Angel for foundational prayer, evening entrustment and angels door.",
22:"Guardian Angel for foundational prayer, evening entrustment and angels door.",
23:"Sacred Heart iconography: Sacred Heart devotion, first Friday, reparation and feast.",
24:"Same Heart of Jesus subject as another source record; keep choices independent pending deduplication.",
25:"Immaculate Heart devotion and consecration; no assumption of specific prayer-card position.",
26:"Immaculate Heart devotion and consecration; source alias remains distinct.",
27:"Resurrection image suitable for Paschaltide, Regina Cæli and the Glorious mystery.",
28:"Resurrection image suitable for Paschaltide, Regina Cæli and the Glorious mystery.",
29:"Virgin adoring the Host is a strong bridge between Marian devotion and Eucharistic prayer.",
30:"Shepherds' adoration is the Nativity mystery and Christmas seasonal hero.",
31:"Gethsemane maps directly to first Sorrowful mystery, Precious Blood episode and reparation at night.",
32:"Martyrdom of Saint Andrew belongs to the saints, not to the Twelfth Station of CHRIST'S Passion.",
33:"Magi/Christ Child subject for Epiphany; optional typological adoration link.",
34:"Shepherds' adoration: Nativity mystery and Christmas; earlier approved Christmas hero identity is preserved.",
35:"Gethsemane episode within Sorrowful mystery, Blood chaplet and night adoration.",
36:"Saint Ambrose can enter saints/Doctors imagery; no specific matching novena in the present slot catalogue.",
37:"Saint Peter portrait fits saints and apostles collections; does not by itself depict Peter's repentance.",
38:"Apostle Jude Thaddeus fits saints and apostles prayers; no forced Rosary mystery.",
39:"Apostle Philip fits saints and apostles prayers; no forced Rosary mystery.",
40:"Ascension directly matches the Glorious mystery and feast hero.",
41:"Christ among doctors directly matches fifth Joyful mystery.",
42:"Christ bearing the Cross directly fits the fourth Sorrowful mystery and the second Station.",
43:"Christ embracing Saint Bernard is an excellent contemplative scene but only a broad saints-door fit here.",
44:"Healing the sick can illustrate intercession and Christ's mercy, not the Eucharistic rite literally.",
45:"Saint Ambrose fits saints and Doctors imagery; avoid inventing a dedicated prayer slot.",
46:"Conversion of Saint Paul fits saints and an examination/repentance theme, not a precise Passion stage.",
47:"Daniel in the lions' den signals fidelity, trust and biblical expectation; weakly linked to broad Prayer slots.",
48:"David and Goliath can connote courage/trials in a daily rule; the current Prayer map lacks a direct narrative slot.",
49:"Deposition aligns with Station XIII and Holy Saturday; the Five Wounds link is optional meditation.",
50:"Luke painting the Crucified Christ can fit evangelists and meditative study; not identical to the Crucifixion scene."
}
HERO={1:"Advent",2:"Christmastide",3:"Epiphany",4:"Time after Epiphany",6:"Lent",7:"Passiontide",11:"Holy Saturday",12:"Easter/Paschaltide",13:"Ascension",14:"Pentecost",17:"Sacred Heart",18:"Time after Pentecost",22:"Christ the King"}
DOORS={"D2":"Essential Prayers","D3":"Rosary and Chaplets","D5":"Holy Eucharist","D6":"Our Lord","D7":"Our Lady","D8":"Saints and Angels","D9":"Life and Intentions"}
ROSARY={"01":"Opening prayers","02":"The Annunciation","04":"The Nativity","06":"Finding in the Temple","07":"Agony in the Garden","10":"Carrying of the Cross","12":"The Resurrection","13":"The Ascension","14":"Descent of the Holy Ghost"}
REGINA={"02":"He Is Risen"}
ANGELUS={"05":"Announcement","06":"Mary's Fiat","08":"Intercession"}
MODULES={
"pray.adoration":"Adoration / Visit", "pray.adoration.four_ends":"Four Ends of Adoration",
"pray.divine_mercy":"Divine Mercy Chaplet","pray.rosary":"Holy Rosary",
"pray.rosary_methods":"Rosary Methods","pray.angelus":"Angelus",
"pray.angelus_regina":"Regina Cæli","pray.stations":"Stations of the Cross",
"pray.five_wounds":"Chaplet of Five Wounds","prayer.sacred_heart":"Sacred Heart",
"prayer.communion":"Communion Preparation","novena.st_joseph":"Novena to Saint Joseph",
"novena.st_michael":"Novena to Saint Michael","novena.sacred_heart":"Novena to Sacred Heart",
"novena.immaculate_heart":"Novena to Immaculate Heart",
"daily.personal_rule":"Personal Prayer Rule","daily.nightly_examen":"Nightly Examination",
}
def display_slot(code):
    if code.startswith("HERO-"):
        try:return "Pray Home · "+HERO.get(int(code.split("-")[1]),"seasonal hero")
        except:return code
    if code.startswith("DOOR-"):return "Prayer doors · "+DOORS.get(code.split("-")[1],"other door")
    if code.startswith("COV-"):
        mod=code[4:]
        if mod in MODULES:return MODULES[mod]+" · cover"
        text=mod.replace("_"," ").replace("."," · ")
        return text[0].upper()+text[1:]+" · "+("cover" if mod.startswith(("pray.","novena.")) else "prayer card")
    if code.startswith("STG-"):
        m=re.match(r"STG-(.*)-(\d\d)$",code)
        if m:
            mod,num=m.groups()
            if mod=="pray.rosary":return "Rosary · "+ROSARY.get(num,"mystery "+num)
            if mod=="pray.angelus_regina":return "Regina Cæli · "+REGINA.get(num,"part "+num)
            if mod=="pray.angelus":return "Angelus · "+ANGELUS.get(num,"part "+num)
            return MODULES.get(mod,mod)+" · scene "+num
    return code

def read_gallery_cards():
    results={}
    for file in PHOTO_PAGES:
        source=file.read_text(encoding="utf-8")
        start=source.find("const data=")
        if start<0:raise RuntimeError("Missing embedded cards in "+str(file))
        opening=start+len("const data=")
        end=source.find(";\nconst KEY=",opening)
        if end<0:raise RuntimeError("Missing exact data terminator in "+str(file))
        cards=json.loads(source[opening:end])
        for x in cards:
            if x.get("available") and (x.get("preview") or "").startswith("data:image/"):
                old=results.get(x["id"])
                if old and old.get("preview")!=x.get("preview"):
                    # First embedded reviewer takes precedence; never merge source IDs.
                    continue
                results[x["id"]]=x
    return results

with SOURCE.open(encoding="utf-8-sig",newline="") as f:
    selected=list(csv.DictReader(f))[:50]
assert len(selected)==50 and len({r["physical_work_group"] for r in selected})==50
assert sorted(SUGGESTIONS)==list(range(1,51))
assert sorted(RATIONALE)==list(range(1,51))
photos=read_gallery_cards()
rows=[]
for i,rec in enumerate(selected,1):
    p=photos.get(rec["physical_work_group"])
    if not p:raise RuntimeError("Missing already embedded source image for "+str(i)+" "+rec["physical_work_group"])
    rows.append({"n":i,"id":rec["physical_work_group"],"title":rec["title"],
       "artist":rec["artist"],"source":rec["source_url"],"sourceFingerprint":rec["selected_photo_file_fingerprint"],
       "originalSha":rec["original_sha256"],"rightsEvidence":rec["rights_evidence"],
       "moduleTargets":rec["module_targets"],"image":p["preview"],"imageAvailable":True,
       "proposals":[{"id":v,"label":display_slot(v)} for v in SUGGESTIONS[i]],
       "rationale":RATIONALE[i],"reviewBasis":"Prayer relevance only — not photo quality or publication clearance"})
assert len(rows)==50 and all(x["image"].startswith("data:image/") for x in rows)
source_map=collections.defaultdict(list)
for c in rows:source_map[c["source"].split("?")[0]].append(c["n"])
for c in rows:
    same=source_map[c["source"].split("?")[0]]
    c["otherSourceRows"]=[i for i in same if i!=c["n"]]
proof=[{"n":c["n"],"workGroup":c["id"],"title":c["title"],
        "artist":c["artist"],"proposedSlots":c["proposals"],
        "reason":c["rationale"],"sourceUrl":c["source"],
        "sourcePhotoFingerprint":c["sourceFingerprint"],"samePhotoAs":c["otherSourceRows"],
        "reviewStatus":"PROPOSED_NOT_ACCEPTED","released":False} for c in rows]
manifest={"schema":SCHEMA,"createdUtc":datetime.now(timezone.utc).isoformat(),
 "batch":1,"firstQueue2RecordIndex":1,"lastQueue2RecordIndex":50,
 "queue2MasterPath":str(SOURCE),"reviewCount":50,
 "sourceImageCardsEmbedded":50,"paintingMatchingProposals":sum(len(x["proposals"]) for x in rows),
 "queue1ReleasePromotions":0,"artworkQualityCertifications":0,"rightsReleaseCertifications":0,
 "historicalArtworkApprovalsChanged":0,"sourceRecordsMergedOrDeleted":0,
 "editorialReviewStatus":"AWAITING_USER_REVIEW",
 "userChoices":["ACCEPT_SELECTED_SLOTS","REPLACE_OR_ADD_OWN_ASSIGNMENT","REJECT_FOR_PRAYER_ONLY","UNDECIDED"],
 "note":"Accepting a prayer assignment does not certify the exact image for release.",
 "items":proof}
MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+"\n",encoding="utf-8")

html=r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · Prayer Art Matching · Queue 2 · Batch 01 (50)</title>
<style>
:root{font-family:Inter,system-ui,-apple-system,Segoe UI,sans-serif;color:#efebdf;background:#10151b}
*{box-sizing:border-box}body{margin:0;background:#10151b;color:#efece3}
header{position:sticky;top:0;z-index:9;background:#10151bf7;border-bottom:1px solid #334049;backdrop-filter:blur(12px)}
.bar{max-width:1440px;padding:16px 22px;margin:auto;display:flex;gap:14px;align-items:center;flex-wrap:wrap}
h1{font-family:Georgia,serif;font-size:27px;font-weight:400;letter-spacing:.02em;margin:2px 0}
small,.muted{color:#aeb5bc}p{line-height:1.5}strong{font-weight:700}
h2{font-size:19px;margin:0 0 5px;font-family:Georgia,serif;font-weight:400}
.stat{font-variant-numeric:tabular-nums;color:#d8c298}
.progress{height:6px;background:#303944;border-radius:9px;overflow:hidden}
.fill{height:100%;width:0;background:#a58b57;transition:width .3s}
main{max-width:1440px;padding:22px;margin:auto}
.intro{max-width:1060px;border-bottom:1px solid #354049;padding-bottom:15px}
button,select,input,textarea{font:inherit}
button{cursor:pointer;border:1px solid #57616b;background:#232e38;color:#f2eee4;border-radius:8px;padding:9px 12px}
button:hover{border-color:#d8c08b}button.primary{background:#877149;color:white;border-color:#af9461}
button.selected{background:#3c6454;border-color:#78bd91}button.reject.selected{background:#754b52;border-color:#cc8b8e}
select,input,textarea{background:#161e26;color:#f2eee4;border:1px solid #4a5864;border-radius:7px;padding:9px}
select{max-width:100%}input[type=search]{min-width:230px}
.controls{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin-top:14px}
#grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(550px,100%),1fr));gap:18px;margin-top:20px}
article{background:#1b232b;border:1px solid #34404b;border-radius:13px;overflow:hidden}
article.ok{border-color:#668b76}article.no{border-color:#9a676d}
.photo{height:360px;display:flex;justify-content:center;align-items:center;background:#0c1014}
.photo img{height:100%;width:100%;object-fit:contain}
.content{padding:17px}
.sub{font-size:12px;color:#aeb4bd;margin:5px 0 12px}
.reason{font-size:13px;color:#d5d5cc;margin:9px 0 12px}
.proposals{display:grid;gap:5px;margin:12px 0}
.proposal{display:flex;align-items:center;gap:9px;font-size:13px;background:#25303a;padding:8px;border-radius:6px;cursor:pointer}
.proposal:has(input:checked){background:#283f39}
.proposal input{accent-color:#9cbf98}
.code{font-family:ui-monospace,monospace;color:#b7bdbf;font-size:11px;display:block;margin-top:2px}
.custom{display:grid;gap:6px;margin:13px 0}
.custom textarea{min-height:54px;resize:vertical}
.actions{display:flex;flex-wrap:wrap;gap:7px;margin-top:12px}
.foot{font-size:11px;margin-top:10px;color:#aaa}
a{color:#cdb486}a:hover{color:#f9dea6}
.tag{display:inline-block;border:1px solid #566579;border-radius:50px;padding:3px 7px;font-size:11px;color:#ced7d5}
.notice{color:#e1c286;font-size:12px}
@media(max-width:680px){.bar,main{padding:13px}.photo{height:300px}header h1{font-size:21px}}
</style></head>
<body><header><div class="bar">
<div style="flex:1"><h1>Prayer artwork · Batch 01</h1><div class="muted" style="font-size:12px">50 Queue 2 paintings · proposed many-to-many placements · no publication rights decided</div></div>
<div><b id="count" class="stat">0 / 50 reviewed</b><div class="progress" style="width:176px"><div id="fill" class="fill"></div></div></div>
<button class="primary" id="export">Export my decisions · JSON</button>
</div></header>
<main><div class="intro">
<p>Review <b>the relevance of each painting to Prayer</b>, not its photographic release quality. Multiple checked placements are allowed. Accept the proposal, uncheck unsuitable placements, type your own alternatives (separate by commas or lines), or reject this artwork <em>for Prayer use only</em>. Rejection does not remove the artwork from Sacred Art or reverse historical approvals.</p>
<div class="controls"><input id="search" type="search" placeholder="Search painting, artist or placement"><select id="status"><option value="all">All 50</option><option value="pending">Undecided</option><option value="accepted">Assigned</option><option value="rejected">Not for Prayer</option><option value="custom">With my alternatives</option></select><button id="export2">Export decisions</button></div>
<p class="notice">Decisions save in this browser automatically. Download the JSON and send it back here to record your exact choices in the master registry. This offline file does not write to GitHub or publish images.</p>
</div><div id="grid"></div></main>
<script>
const CARDS=__DATA__;
const SCHEMA="AO_PRAYER_Q2_MATCH_REVIEW_DECISIONS_V1";
const KEY="ao-q2-prayer-match-batch01-20261030-v1";
let state={};try{state=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){state={}}
const escapeHtml=v=>String(v==null?"":v).replace(/[&<>"']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[ch]));
const rowState=c=>{let r=state[c.id];return r&&r.kind?r:null};
const selectedIds=c=>{let r=rowState(c);return r&&Array.isArray(r.slots)?r.slots:c.proposals.map(x=>x.id)};
function save(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}updateCounter()}
function updateCounter(){const reviewed=CARDS.filter(c=>rowState(c)&&rowState(c).kind!=="undecided").length;
document.getElementById("count").textContent=reviewed+" / 50 reviewed";
document.getElementById("fill").style.width=(reviewed/50*100)+"%"}
function capture(c){const box=document.getElementById("card-"+c.n);
return {slots:[...box.querySelectorAll(".proposal input:checked")].map(e=>e.value),
alternatives:box.querySelector("textarea").value.trim(),
notes:box.querySelector(".notes").value.trim()}}
function assign(c,kind){const val=capture(c);
if(kind==="accepted"&&!val.slots.length&&!val.alternatives){alert("Select a proposal or enter an alternative assignment.");return;}
state[c.id]={kind,slots:val.slots,alternatives:val.alternatives,notes:val.notes};
save();render();}
function updateDraft(c){if(!rowState(c))return;const v=capture(c);const r=state[c.id];Object.assign(r,v);save()}
function exportFile(){const decisions=CARDS.filter(c=>rowState(c)).map(c=>{let r=rowState(c);return {
workGroup:c.id,sourcePhotoFingerprint:c.sourceFingerprint,originalSha256:c.originalSha||null,sourceUrl:c.source,
title:c.title,artist:c.artist,decision:r.kind==="accepted"?"ACCEPT_PRAYER_MATCHING":r.kind==="rejected"?"NOT_RELEVANT_TO_PRAYER":"UNDECIDED",
proposedSlotIds:c.proposals.map(x=>x.id),chosenSlotIds:r.kind==="accepted"?r.slots:[],userAlternativeAssignments:r.kind==="accepted"?r.alternatives:"",
notes:r.notes||"",photoPublicationApproval:false,rightsReleaseApproval:false};});
const out={schema:SCHEMA,batch:1,sourceReviewCount:50,decided:decisions.filter(x=>x.decision!=="UNDECIDED").length,
sourceRegistrySnapshot:"71537a018e39e7",intent:"Prayer artwork placement only; not release or photographic approval",decisions};
const blob=new Blob([JSON.stringify(out,null,2)],{type:"application/json"});
const url=URL.createObjectURL(blob),a=document.createElement("a");
a.href=url;a.download="ao_prayer_art_q2_batch01_decisions.json";a.click();URL.revokeObjectURL(url);}
function render(){const term=document.getElementById("search").value.toLowerCase().trim(),filter=document.getElementById("status").value;
const list=CARDS.filter(c=>{const r=rowState(c),kind=r?r.kind:"undecided";
const hit=!term||(c.title+" "+c.artist+" "+c.proposals.map(p=>p.label+" "+p.id).join(" ")).toLowerCase().includes(term);
return hit&&(filter==="all"||filter==="pending"&&kind==="undecided"||filter==="accepted"&&kind==="accepted"||filter==="rejected"&&kind==="rejected"||filter==="custom"&&r&&!!r.alternatives)});
document.getElementById("grid").innerHTML=list.map(c=>{
const r=rowState(c),kind=r?r.kind:"undecided",ids=selectedIds(c),custom=r?r.alternatives||"":"",notes=r?r.notes||"":"";
const choices=c.proposals.map(p=>'<label class="proposal"><input type="checkbox" value="'+escapeHtml(p.id)+'" '+(ids.includes(p.id)?"checked":"")+'><span><b>'+escapeHtml(p.label)+'</b><small class="code">'+escapeHtml(p.id)+'</small></span></label>').join("");
return '<article id="card-'+c.n+'" class="'+(kind==="accepted"?"ok":kind==="rejected"?"no":"")+'"><div class="photo"><img loading="lazy" src="'+c.image+'" alt="'+escapeHtml(c.title)+'"></div><div class="content"><small class="muted">QUEUE 2 · '+c.n+' / 50</small><h2>'+escapeHtml(c.title)+'</h2><div class="sub">'+escapeHtml(c.artist)+'</div>'+(c.otherSourceRows.length?'<div class="notice">Same photographic source also appears at #'+c.otherSourceRows.join(", #")+'; keep records separate for now.</div>':'')+'<div class="reason">'+escapeHtml(c.rationale)+'</div><b style="font-size:12px">Proposed placements (select any number)</b><div class="proposals">'+choices+'</div><div class="custom"><label for="alternative-'+c.n+'">Your alternative assignments / other prayer slots</label><textarea id="alternative-'+c.n+'" placeholder="e.g. Angelus noon cover; Rosary Joyful mystery 1; or your own idea">'+escapeHtml(custom)+'</textarea><label>Optional note</label><input class="notes" value="'+escapeHtml(notes)+'" placeholder="e.g. beautiful but not the right image for this module"></div><div class="actions"><button data-act="accept" class="'+(kind==="accepted"?"selected":"primary")+'">✓ Accept my assignments</button><button data-act="reject" class="reject '+(kind==="rejected"?"selected":"")+'">Not relevant to Prayer</button><button data-act="reset">Undecided</button><a style="align-self:center;margin-left:auto;font-size:12px" href="'+escapeHtml(c.source)+'" target="_blank" rel="noopener">Original source</a></div><div class="foot">Prayer fit only · separate original photo / rights gates</div></div></article>';
}).join("");
document.querySelectorAll("#grid article").forEach(article=>{const n=Number(article.id.split("-")[1]),c=CARDS[n-1];
article.querySelector('[data-act="accept"]').addEventListener("click",()=>assign(c,"accepted"));
article.querySelector('[data-act="reject"]').addEventListener("click",()=>assign(c,"rejected"));
article.querySelector('[data-act="reset"]').addEventListener("click",()=>{delete state[c.id];save();render()});
article.querySelectorAll("textarea,input.notes,.proposal input").forEach(input=>input.addEventListener("change",()=>updateDraft(c)))});
updateCounter()}
document.getElementById("search").addEventListener("input",render);
document.getElementById("status").addEventListener("change",render);
document.getElementById("export").addEventListener("click",exportFile);
document.getElementById("export2").addEventListener("click",exportFile);
render();
</script></body></html>"""
payload=json.dumps(rows,ensure_ascii=False,separators=(",",":")).replace("<","\\u003c")
assert html.count("__DATA__")==1
html=html.replace("__DATA__",payload)
PAGE.write_text(html,encoding="utf-8")
assert PAGE.stat().st_size>100000 and len(re.findall("data:image/",html))>=50
assert all(x["id"] in html for x in rows)
print(json.dumps({"items":len(rows),"proposals":sum(len(c["proposals"]) for c in rows),
"imageAllEmbedded":True,"sourceAliasPairs":sum(bool(c["otherSourceRows"]) for c in rows)//2,
"htmlBytes":PAGE.stat().st_size,"manifest":str(MANIFEST),"gallery":str(PAGE),
"autoPublicationChanges":0}))
