#!/usr/bin/env python3
"""Build KMSKA continued B4 independent 250-work import/corrections review, and explicit finalization."""
import json, hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/'data/calendar/sacred-art-kmska-next-250-b4-20261029.v1.json'
OUTPUT=ROOT/'docs/SACRED_ART_KMSKA_NEXT_250_IMPORT_REVIEW_B4_20261029.html'
d=json.loads(INPUT.read_text(encoding='utf8'))
assert d['counts']['B3IdsExcluded']==250 and d['counts']['earlierFinalizedIDsExcluded']==60 and d['counts']['productionImports']==0
review=[]
for x in d['rows']:
 assert x['previewURL'].startswith('https://')
 assert not x['productionImported']
 assert x['provider']=='KMSKA'
 assert x['rightsForProduction']=='HOLD_UNTIL_EXACT_SOURCE_PHOTOGRAPH_RIGHTS_RESOLVED'
 assert x['rightsBasis']=='KMSKA_OFFICIAL_IIIF_UNDETERMINED_LICENSE__RESEARCH_VIEW_ONLY'
 conflict="Official KMSKA IIIF source-image rights remain undetermined. This choice is editorial research only, not a licence or production import."
 review.append({
  'id':x['id'],'provider':x['provider'],'sourceInstitution':x['museum'],
  'objectId':x['objectId'],'objectUrl':x['objectUrl'],'accession':x.get('accession'),
  'title':x['title'],'artist':x['artist'],'technique':x['medium'],
  'sourceImageRights':x['rightsBasis'],'previewURL':x['previewURL'],
  'rightsConflict':conflict,'productionImageRightsCleared':False,
  'manifestRightsURL':x.get('manifestUrl')})
assert 200<=len(review)<=300 and len(review)==d['counts']['distinctReviewPaintings']
assert len({x['id'] for x in review})==len(review)
# Preserve source priority and source listing rather than reshuffle IDs on each rebuild.
frozen=hashlib.sha256(json.dumps([r['id'] for r in review],separators=(',',':')).encode()).hexdigest()
data=json.dumps(review,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
head="""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem | KMSKA 250 Sacred Paintings · Batch B4</title>
<style>
:root{color-scheme:dark;--bg:#101816;--card:#192620;--line:#34483e;--muted:#aebfb4;--txt:#e9ebe4;--accent:#ccb47b}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--txt);font:14px/1.55 system-ui,-apple-system,sans-serif}
header{background:#0e1513;position:sticky;top:0;z-index:5;border-bottom:1px solid var(--line)}
.top,main{max-width:1260px;padding:17px 20px;margin:auto}
.brand{color:var(--accent);text-transform:uppercase;font-weight:650;letter-spacing:.16em;font-size:11px}
h1{font:33px/1.05 Georgia,serif;margin:6px 0 7px}.lead,.sub{color:var(--muted)}
.controls{display:flex;gap:10px;flex-wrap:wrap;margin-top:14px;align-items:center}
input,select,textarea,button{background:var(--card);border:1px solid var(--line);border-radius:7px;color:var(--txt);font:inherit;padding:8px 11px}
button{cursor:pointer}button:hover{border-color:var(--accent)}
input[type=search]{min-width:230px}.stats{margin-left:auto;color:var(--muted)}
main{padding-bottom:100px}.notice{border-left:3px solid var(--accent);padding:12px 17px;margin:0 0 21px;background:#1c2722;color:#d7ddd4}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(265px,1fr));gap:16px}
.card{background:var(--card);border:1px solid var(--line);border-radius:11px;overflow:hidden;display:flex;flex-direction:column}
.media{height:325px;background:#0b120f;display:flex;align-items:center;justify-content:center;padding:12px}
.media img{max-width:100%;max-height:100%;object-fit:contain}
.body{padding:14px;flex:1}.museum{font-size:11px;color:var(--accent);text-transform:uppercase}
h2{font:21px/1.25 Georgia,serif;margin:7px 0}.artist{color:var(--muted)}.meta{font-size:12px;color:var(--muted)}
.actions{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin:13px 0 5px}
.actions button{padding:10px 6px;font-weight:630}.actions button.active{background:#bb9e67;color:#111915;border-color:#d4be8c}
.corrections{width:100%;min-height:75px;margin:6px 0;resize:vertical}
.clear{padding:3px 0;background:transparent;border:none;text-decoration:underline;font-size:12px;color:var(--muted)}
a{color:#cfdbc9}.actions a{color:inherit}.status{display:inline-block;padding:1px 6px;border:1px solid var(--line);border-radius:4px;color:#c7d9cc;font-size:11px;margin-top:7px}
.actions button:focus-visible,button:focus-visible,input:focus-visible,textarea:focus-visible{outline:2px solid var(--accent)}
.bottom{margin-top:30px;border-top:1px solid var(--line);padding-top:25px}
.bottom button{background:#bb9e67;color:#111915;font-weight:700;border:0}.bottom button.secondary{background:transparent;color:var(--txt);border:1px solid var(--line)}
.small{font-size:12px;color:var(--muted)}
@media(max-width:650px){header{position:static}h1{font-size:28px}.media{height:370px}.grid{grid-template-columns:1fr}.stats{margin-left:0}}
</style></head><body><header><div class="top">
<div class="brand">Ad Orientem · Sacred Art curation</div>
<h1>250 Sacred Paintings · Batch 4</h1>
<div class="lead">Keep only paintings you wish to use. All unselected works in the <strong>completed, verified-image batch</strong> are rejected. No numerical ratings.</div>
<div class="controls">
<input id="q" type="search" placeholder="Search paintings or artists" aria-label="Search" />
<select id="museum" aria-label="Museum"><option value="all">All paintings</option><option value="KMSKA">KMSKA Antwerp</option></select>
<select id="state" aria-label="Selection"><option value="all">All</option><option value="unselected">Unselected</option><option value="selected">Selected to import</option></select>
<span id="stats" class="stats"></span>
</div></div></header><main>
<div class="notice">
<strong>Import</strong> = keep exactly as presented, subject to final original-image and licensing QA.
<strong>Import with corrections</strong> = keep, but specify precisely what needs changing (frame, colour, source image, attribution, or crop).
Unselected images become <strong>Reject</strong> only when you finalise all pages of the batch. You will review 50 artworks at a time.
The search or museum filter does not shrink that final batch; records without a confirmed preview are excluded.
</div>
<div class="controls" style="margin:5px 0 20px"><button id="prev">Previous 50</button><strong id="pageLabel">Page 1</strong><button id="next">Next 50</button><span id="seenCount" class="small"></span></div><div id="gallery" class="grid"></div><div class="controls" style="margin:5px 0 20px"><button id="prevB">Previous 50</button><strong id="pageLabelB">Page 1</strong><button id="nextB">Next 50</button><span id="seenCountB" class="small"></span></div>
<section class="bottom"><h2>Complete this review batch</h2>
<p id="completeSummary">No decision has been exported yet.</p>
<label><input id="complete" type="checkbox"> I have finished reviewing all images in this batch, not just the filtered results.</label>
<p><button id="finish">Finalize and export decisions</button>
<button class="secondary" id="draft">Export selected-only draft (no automatic rejections)</button></p>
<p class="small">This is a research-review file. It never imports images into Ad Orientem automatically. You can reopen the HTML file and continue selecting, and exported decisions retain the museum source IDs. No changes to the 107 historic approvals or rating archive.</p>
</section></main>
<script id="catalog-data" type="application/json">"""
tail="""</script><script>
const works=JSON.parse(document.getElementById('catalog-data').textContent);
const batchHash=REPLACE_BATCH_HASH;
const key='ao-sacred-art-kmska-B4-250-import-'+batchHash;
const PAGE_SIZE=50;
const TOTAL_PAGES=Math.ceil(works.length/PAGE_SIZE);
let page=0;
let seenPages=[];
try{seenPages=JSON.parse(localStorage.getItem(key+'-seen')||'[]')}catch(e){seenPages=[]}
let choices={};
try {choices=JSON.parse(localStorage.getItem(key)||'{}')} catch(e){choices={}}
const $=s=>document.querySelector(s);
function save(){try{localStorage.setItem(key,JSON.stringify(choices))}catch(e){}}
function saveSeen(){try{localStorage.setItem(key+'-seen',JSON.stringify(seenPages))}catch(e){}}
function goPage(n){page=Math.max(0,Math.min(TOTAL_PAGES-1,n));render();window.scrollTo(0,0)}
function cur(id){return choices[id]||{decision:'UNSELECTED',corrections:''}}
function text(n,c,s){const el=document.createElement(n);if(c)el.className=c;if(s!==undefined)el.textContent=String(s);return el}
function select(id,decision){
 const old=cur(id);choices[id]={decision:old.decision===decision?'UNSELECTED':decision,corrections:old.corrections||''};
 save();render();
}
function count(){
 const total=works.length;
 const a=works.filter(w=>cur(w.id).decision==='IMPORT').length;
 const b=works.filter(w=>cur(w.id).decision==='IMPORT_WITH_CORRECTIONS').length;
 $('#stats').textContent=a+' import · '+b+' corrections · '+(total-a-b)+' unselected / '+total;
 $('#completeSummary').textContent='Batch: '+total+' visually available artworks. '+(a+b)+' selected. '+(total-a-b)+' will be marked Reject only after you finalize.';
}
function render(){
 const filter=$('#museum').value,state=$('#state').value,query=$('#q').value.toLowerCase();
 const gallery=$('#gallery');gallery.replaceChildren();
 const unfiltered=$('#museum').value==='all'&&$('#state').value==='all'&&!query;
 if(unfiltered&&!seenPages.includes(page)){seenPages.push(page);saveSeen()}
 const filtered=works.filter(work=>(filter==='all'||work.provider===filter)&&
 (state==='all'||(state==='unselected'?cur(work.id).decision==='UNSELECTED':cur(work.id).decision!=='UNSELECTED'))&&
 [work.title,work.artist,work.objectId,work.accession].join(' ').toLowerCase().includes(query));
 const filteredPages=Math.max(1,Math.ceil(filtered.length/PAGE_SIZE));
 if(page>=filteredPages)page=filteredPages-1;
 const shown=filtered.slice(page*PAGE_SIZE,(page+1)*PAGE_SIZE);
 for(const work of shown){
  const decision=cur(work.id).decision;
  if(filter!=='all'&&work.provider!==filter)continue;
  if(state==='unselected'&&decision!=='UNSELECTED')continue;
  if(state==='selected'&&decision==='UNSELECTED')continue;
  if(![work.title,work.artist,work.objectId,work.accession].join(' ').toLowerCase().includes(query))continue;
  const card=text('article','card');const pic=text('div','media');
  const im=text('img');im.src=work.previewURL;im.alt=work.title+' — entire composition';im.loading='lazy';pic.append(im);card.append(pic);
  const body=text('div','body');
  body.append(text('div','museum',work.sourceInstitution));
  body.append(text('h2','',work.title));body.append(text('div','artist',work.artist||'Attribution not recorded'));
  body.append(text('div','meta',work.accession||work.objectId));
  if(work.rightsConflict)body.append(text('div','meta',work.rightsConflict));
  const source=text('p');const link=text('a','', 'Official museum record');link.href=work.objectUrl;link.target='_blank';link.rel='noopener noreferrer';source.append(link);body.append(source);
  const actions=text('div','actions');
  for(const [key,label] of [['IMPORT','Import'],['IMPORT_WITH_CORRECTIONS','Import with corrections']]){
   const btn=text('button',decision===key?'active':'',label);btn.type='button';
   btn.setAttribute('aria-pressed',String(decision===key));
   btn.addEventListener('click',()=>select(work.id,key));actions.append(btn);
  }
  body.append(actions);
  if(decision==='IMPORT_WITH_CORRECTIONS'){
   const lab=text('label','meta','Required correction instructions:');
   const ta=text('textarea','corrections');ta.placeholder='Example: remove visible gilt frame, find faithful-colour image, correct artist attribution…';
   ta.value=cur(work.id).corrections||'';
   ta.addEventListener('input',()=>{choices[work.id]={...cur(work.id),corrections:ta.value};save()});
   lab.append(ta);body.append(lab)
  }
  if(decision!=='UNSELECTED'){
   const clear=text('button','clear','Undo selection');clear.addEventListener('click',()=>select(work.id,decision));body.append(clear)
  }
  card.append(body);gallery.append(card);
 }
 count();
 for(const suffix of ['', 'B']){
  $('#pageLabel'+suffix).textContent='Page '+(page+1)+' / '+filteredPages+' · '+shown.length+' artworks';
  $('#seenCount'+suffix).textContent='Pages reviewed: '+seenPages.length+' / '+TOTAL_PAGES;
  $('#prev'+suffix).disabled=page<=0;
  $('#next'+suffix).disabled=page>=filteredPages-1;
 }
}
function exportDecisions(finalize){
 const invalid=works.filter(x=>cur(x.id).decision==='IMPORT_WITH_CORRECTIONS'&&!cur(x.id).corrections.trim());
 if(invalid.length){alert('Add correction instructions for '+invalid.length+' selected artworks first.');return}
 if(finalize&&!$('#complete').checked){alert('Confirm that the complete image-visible batch has been reviewed.');return}
 if(finalize&&seenPages.length<TOTAL_PAGES){alert('Review all '+TOTAL_PAGES+' pages before finalising. Pages visited: '+seenPages.length+'.');return}
 if(finalize&&!confirm('Finalize all '+works.length+' image-visible works? Every unselected work will be marked REJECT. Hidden or filtered works are included.'))return;
 const decisions=works.filter(w=>finalize||cur(w.id).decision!=='UNSELECTED').map(w=>{
  const c=cur(w.id);
  return {museum:w.provider,sourceObjectId:w.objectId,sourceId:w.id,accession:w.accession||null,
   title:w.title,artist:w.artist||null,decision:c.decision==='UNSELECTED'?'REJECT':c.decision,
   corrections:c.decision==='IMPORT_WITH_CORRECTIONS'?c.corrections.trim():null,
   imageRightsVerified:!w.rightsConflict,rightsHold:!!w.rightsConflict,productionImported:false}
 });
 const payload={schema:'AO_SACRED_ART_USER_IMPORT_CHOICES_V1',date:'2026-10-29',
   batchSha256:batchHash,completeBatch:finalize,reviewedVisibleArtworkCount:works.length,batchId:'B4',pageSize:PAGE_SIZE,pagesVisited:seenPages.length,totalPages:TOTAL_PAGES,
   unreviewableSourceRecordsExcluded:true,noProductionMutation:true,decisions};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download='ad-orientem-sacred-art-b4-kmska-250-'+(finalize?'final':'draft')+'-choices.json';
 a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
$('#q').addEventListener('input',()=>{page=0;render()});$('#museum').addEventListener('change',()=>{page=0;render()});
for(const suffix of ['', 'B']){$('#prev'+suffix).addEventListener('click',()=>goPage(page-1));$('#next'+suffix).addEventListener('click',()=>goPage(page+1));}
$('#state').addEventListener('change',()=>{page=0;render()});
$('#finish').addEventListener('click',()=>exportDecisions(true));
$('#draft').addEventListener('click',()=>exportDecisions(false));
render();
</script></body></html>"""
tail=tail.replace('REPLACE_BATCH_HASH',json.dumps(frozen))
OUTPUT.write_text(head+data+tail,encoding='utf8')
print(json.dumps({'reviewable':len(review),'KMSKA':sum(x['provider']=='KMSKA' for x in review),'batchHash':frozen,
 'html':str(OUTPUT.relative_to(ROOT)),'productionImports':0}))
