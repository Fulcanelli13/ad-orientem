#!/usr/bin/env python3
"""Build standalone, offline-data visual rating dashboard for rights-cleared research thumbnails."""
import html,json,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
SRC=ROOT/'data/calendar/sacred-art-rijks-rights-gated-review-b2-20261029.v1.json'
OUT=ROOT/'docs/SACRED_ART_RIJKS_B2_AESTHETIC_REVIEW_20261029.html'
data=json.loads(SRC.read_text(encoding='utf-8'))
assert data['scope']['baselineCanonicalArtworks']==383 and data['scope']['registeredSourceProgrammes']==186
safe=[]
for r in data['records']:
 if r['disposition']!='CC0_RESEARCH_CONTACT_SHEET_ONLY':continue
 proof=r['edmImageRightsProof']
 assert proof['status']=='CC0_OR_PDM' and proof['sameObject'] and proof['sameImageService'] and proof['explicitOpenRights']
 assert r['previewURL'].startswith('https://iiif.micr.io/')
 safe.append({k:r.get(k) for k in ('sourceObjectId','title','artist','accession','previewURL','museumObjectPage',
     'nativeSourceDimensions','artistBasedResearchPriority','existingEditorialStatus','existingHumanRating')})
assert len(safe)==data['counts']['sourceImageCC0PreviewCount']
json_text=json.dumps(safe,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
head="""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem · Rijksmuseum Sacred Art Review</title>
<style>
:root{color-scheme:dark;--bg:#111816;--panel:#1d2623;--line:#37463f;--txt:#ecede5;--muted:#b2c0b8;--accent:#c0a46c}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:14px/1.5 system-ui,-apple-system,sans-serif}
header{position:sticky;z-index:2;top:0;background:#101715ee;backdrop-filter:blur(14px);border-bottom:1px solid var(--line);padding:14px max(16px,calc((100vw - 1280px)/2))}
main{max-width:1280px;margin:auto;padding:20px 16px 70px}.brand{font-size:11px;letter-spacing:.18em;color:var(--accent);text-transform:uppercase}
h1{font:clamp(25px,3vw,39px)/1.1 Georgia,serif;margin:5px 0 8px}.sub{color:var(--muted);max-width:900px}
.toolbar{display:flex;flex-wrap:wrap;gap:9px;align-items:center;margin-top:12px}input,select,button{font:inherit;color:var(--txt);background:var(--panel);border:1px solid var(--line);padding:9px 12px;border-radius:8px}
button{cursor:pointer}button:hover{border-color:var(--accent)}button:focus-visible,input:focus-visible,select:focus-visible{outline:2px solid var(--accent)}
input[type=search]{width:min(350px,90vw)}.count{margin-left:auto;color:var(--muted)}
.policy{border-left:3px solid var(--accent);background:#1d2623;padding:12px 15px;border-radius:0 8px 8px 0;margin:0 0 20px}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:20px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;overflow:hidden;display:flex;flex-direction:column}
.pic{height:310px;background:#111411;display:flex;align-items:center;justify-content:center;padding:10px}
.pic img{max-width:100%;max-height:100%;object-fit:contain}
.body{padding:15px;flex:1}.id{font-size:11px;color:var(--accent);letter-spacing:.05em}
.name{font:20px/1.2 Georgia,serif;margin:7px 0}.by{color:var(--muted);margin:0 0 8px}
.technical{color:var(--muted);font-size:12px}.links a{color:#c5d3c9;margin-right:12px}
.choices{margin:10px 0 2px;display:flex;flex-wrap:wrap;gap:5px}
.choices button{min-width:36px;padding:6px 8px;border-radius:6px}
.choices button.selected{background:var(--accent);color:#101713;border-color:var(--accent);font-weight:700}
.note{margin:12px 0 0}.note input{width:100%}
.help{max-width:1050px;color:var(--muted);margin-bottom:20px}
footer{color:var(--muted);font-size:12px;margin-top:30px}
@media(max-width:600px){header{position:static}.pic{height:330px}.count{margin-left:0}.grid{grid-template-columns:1fr}}
</style></head><body>
<header><div class="brand">Ad Orientem · Sacred Art · Research only</div>
<h1>Rijksmuseum / Curatorial Review</h1>
<div class="sub">Exact-image rights checked against the official Europeana aggregation and IIIF resource. These are research previews, never production-approved originals.</div>
<div class="toolbar">
<input id="search" type="search" placeholder="Search title, painter or accession" aria-label="Search paintings">
<select id="filter" aria-label="Filter ratings"><option value="all">All cleared images</option><option value="unrated">Not rated</option><option value="high">Rated 4–5</option><option value="low">Rated 0–2</option></select>
<button id="export">Export my ratings (JSON)</button>
<button id="reset">Clear local ratings</button>
<span id="count" class="count"></span>
</div></header><main>
<div class="policy"><strong>Review sequence:</strong> (1) exceptional pictorial beauty; (2) Catholic devotional intensity; (3) accurate subject; (4) faithful, frameless, high-quality photograph. Zero means rejected, 3 means worth revisiting, 4–5 means strong candidates. No rating here changes the canonical Ad Orientem app or existing historical decisions.</div>
<p class="help">Only images with an exact object-level Public Domain Mark / CC0 matched to the same IIIF image are included. Images are displayed in full, never centre-cropped. Ratings and notes stay in this browser until you explicitly export them. Source photos are not stored or modified in this page.</p>
<div id="cards" class="grid"></div>
<footer>Source: Rijksmuseum Collection Online; source-image rights: official EDM Aggregation. No visual aesthetics or quality certifications were automatically assigned. No cookies, accounts, analytics or external submission. Images load from the museum IIIF service.</footer>
</main>
<script id="review-data" type="application/json">"""
tail="""</script>
<script>
const DATA=JSON.parse(document.getElementById('review-data').textContent);
const KEY='ao-sacred-art-rijks-b2-ratings-20261029-v1';
let stored={};try{stored=JSON.parse(localStorage.getItem(KEY)||'{}')}catch(_){}
function el(tag,cls,txt){const n=document.createElement(tag);if(cls)n.className=cls;if(txt!==undefined)n.textContent=String(txt);return n}
function save(){try{localStorage.setItem(KEY,JSON.stringify(stored))}catch(_){/* In-memory ratings still exportable when file:// storage is blocked */}}
function review(id){return stored[id]||{}}
function render(){
 const query=document.querySelector('#search').value.toLowerCase(),f=document.querySelector('#filter').value;
 const root=document.querySelector('#cards');root.replaceChildren();let visible=0,rated=0;
 DATA.forEach(item=>{
  let r=review(item.sourceObjectId);if(r.rating!==undefined)rated++;
  if(![item.title,item.artist,item.accession,item.sourceObjectId].join(' ').toLowerCase().includes(query))return;
  if(f==='unrated'&&r.rating!==undefined)return;if(f==='high'&&!(r.rating>=4))return;if(f==='low'&&!(r.rating<=2))return;
  visible++;
  const card=el('article','card');
  const pic=el('div','pic');const img=el('img');img.src=item.previewURL;img.alt='Whole artwork: '+item.title;img.loading='lazy';pic.append(img);card.append(pic);
  const body=el('div','body');body.append(el('div','id','RIJKSMUSEUM · '+(item.accession||item.sourceObjectId)));
  body.append(el('h2','name',item.title));body.append(el('p','by',item.artist||'Artist not supplied'));
  const dims=item.nativeSourceDimensions||{};
  body.append(el('div','technical',String(dims.width||'?')+' × '+String(dims.height||'?')+' px • Full-image preview • PDM'));
  const lk=el('p','links');const link=el('a','', 'Museum object and provenance');link.href=item.museumObjectPage;link.target='_blank';link.rel='noopener noreferrer';lk.append(link);body.append(lk);
  body.append(el('div','technical','Your review (0–5), not an app approval:'));
  const choices=el('div','choices');for(let score=0;score<=5;score++){
   const b=el('button',r.rating===score?'selected':'',score);b.type='button';b.setAttribute('aria-label','Rate '+item.title+' '+score+' out of five');
   b.addEventListener('click',()=>{stored[item.sourceObjectId]={...review(item.sourceObjectId),rating:score};save();render()});choices.append(b)
  }body.append(choices);
  const note=el('label','note');note.append(el('span','technical','Note: framing / palette / devotion / iconographic match'));
  const input=el('input');input.value=r.note||'';input.placeholder='Optional short review';input.addEventListener('change',()=>{
   stored[item.sourceObjectId]={...review(item.sourceObjectId),note:input.value};save()
  });note.append(input);body.append(note);card.append(body);root.append(card);
 });
 document.querySelector('#count').textContent=visible+' shown · '+rated+' rated / '+DATA.length+' images'
}
document.querySelector('#search').addEventListener('input',render);
document.querySelector('#filter').addEventListener('change',render);
document.querySelector('#export').addEventListener('click',()=>{
 const result={schema:'AO_RIJKS_REVIEW_USER_RATINGS_V1',date:'2026-10-29',researchOnly:true,
  source:'sacred-art-rijks-rights-gated-review-b2-20261029.v1.json',
  ratings:DATA.filter(x=>stored[x.sourceObjectId]&&stored[x.sourceObjectId].rating!==undefined)
    .map(x=>({sourceObjectId:x.sourceObjectId,accession:x.accession,title:x.title,artist:x.artist,
              rating:stored[x.sourceObjectId].rating,note:stored[x.sourceObjectId].note||''}))};
 const blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='ad-orientem-rijks-b2-user-ratings.json';
 a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
});
document.querySelector('#reset').addEventListener('click',()=>{
 if(window.confirm('Clear only ratings saved in this browser for this research sheet?')){stored={};save();render()}
});
render();
</script></body></html>"""
OUT.write_text(head+json_text+tail,encoding='utf-8')
print(json.dumps({'file':str(OUT.relative_to(ROOT)),'rightsClearedImages':len(safe),
 'browserRatingExport':True,'productionChanges':0}))
