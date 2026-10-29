#!/usr/bin/env python3
"""Create a selection-only Sacred Art gallery for KMSKA + Cleveland.
No rating controls. Unselected works become rejected only when user explicitly finalizes
the complete visual review batch; unpreviewed works remain held, never auto-rejected.
"""
import json,hashlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
INPUT=ROOT/'data/calendar/sacred-art-kmska-cleveland-first-review-20261029.v1.json'
OUTPUT=ROOT/'docs/SACRED_ART_TWO_MUSEUM_IMPORT_REVIEW_20261029.html'
SEEDS=ROOT/'data/calendar/sacred-art-kmska-3-exact-research-preview-20261029.v1.json'
d=json.loads(INPUT.read_text(encoding='utf-8'))
assert d['imagesDownloaded']==0 and d['productionImports']==0
review=[]
for r in d['records']:
 if not r['previewRightsVerified'] or not r.get('previewURL'):continue
 if any(t in (r.get('title') or '').lower() for t in ('krishna','buddha','shiva','vishnu','ganesha','bodhisattva','hindu')):continue
 if r['provider']=='Cleveland':
  assert r['sourceImageRights']=='CC0'
 if r['provider']=='KMSKA':
  assert r['manifestRightsURL'].startswith('https://iiif.kmska.be/') and r['sourceImageRights']!='UNVERIFIED'
 review.append({k:r.get(k) for k in ('id','provider','sourceInstitution','objectId','objectUrl',
 'accession','title','artist','technique','sourceImageRights','previewURL',
 'manifestRightsURL','sourceMediumIndicators','rightsConflict','productionImageRightsCleared')})
seeded=json.loads(SEEDS.read_text(encoding='utf-8'))['records']
assert len(seeded)==3
for x in seeded:
 assert x['sourcePageStatesCC0'] if 'sourcePageStatesCC0' in x else x['officialObjectPageImageRights']=='CC0'
 assert x['manifestRights']=='https://rightsstatements.org/page/UND/1.0/'
 assert x['reviewOnly'] and not x['productionImageRightsCleared'] and x['exactMuseumSourceAndIIIFLinked']
 assert x['previewURL'].startswith('https://iiif.kmska.be/')
 assert x['objectUrl'].startswith('https://vlaamsekunstcollectie.be/')
 review=[r for r in review if r['id']!=x['sourceId']]
 review.append({'id':x['sourceId'],'provider':'KMSKA','sourceInstitution':'Royal Museum of Fine Arts Antwerp',
 'objectId':x['objectId'],'objectUrl':x['objectUrl'],'accession':x['accession'],
 'title':x['title'],'artist':x['artist'],'technique':x['technique'],
 'sourceImageRights':'OFFICIAL_PAGE_CC0__IIIF_MANIFEST_UND_CONFLICT',
 'previewURL':x['previewURL'],'manifestRightsURL':x['manifestURL'],
 'rightsConflict':x['rightsConflict'],'productionImageRightsCleared':False})
review.sort(key=lambda x:(x['provider']!='KMSKA',x['title'].lower(),x['id']))
assert len(review)<=d['counts']['totalVisuallyReviewable']+len(seeded)
assert sum(x['provider']=='KMSKA' for x in review)==3
frozen=hashlib.sha256(json.dumps([r['id'] for r in review],separators=(',',':')).encode()).hexdigest()
data=json.dumps(review,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
head="""<!DOCTYPE html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Ad Orientem | Two Museum Sacred Art Import Review</title>
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
<h1>KMSKA Antwerp / Cleveland</h1>
<div class="lead">Keep only paintings you wish to use. All unselected paintings in the <strong>completed, image-visible batch</strong> are rejected. No numerical ratings.</div>
<div class="controls">
<input id="q" type="search" placeholder="Search paintings or artists" aria-label="Search" />
<select id="museum" aria-label="Museum"><option value="all">Both museums</option><option value="KMSKA">KMSKA Antwerp</option><option value="Cleveland">Cleveland Museum of Art</option></select>
<select id="state" aria-label="Selection"><option value="all">All</option><option value="unselected">Unselected</option><option value="selected">Selected to import</option></select>
<span id="stats" class="stats"></span>
</div></div></header><main>
<div class="notice">
<strong>Import</strong> = keep exactly as presented, subject to final original-image and licensing QA.
<strong>Import with corrections</strong> = keep, but specify precisely what needs changing (frame, colour, source image, attribution, or crop).
Unselected images become <strong>Reject</strong> only when you finalize the full batch.
The search or museum filter does not shrink that final batch; records without a confirmed preview are excluded.
</div>
<div id="gallery" class="grid"></div>
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
const key='ao-sacred-art-two-museum-import-'+batchHash;
let choices={};
try {choices=JSON.parse(localStorage.getItem(key)||'{}')} catch(e){choices={}}
const $=s=>document.querySelector(s);
function save(){try{localStorage.setItem(key,JSON.stringify(choices))}catch(e){}}
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
 for(const work of works){
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
  if(work.rightsConflict)body.append(text('div','meta','Rights hold: museum item page labels image CC0; IIIF manifest says UND. Research-only selection, no production import.'));
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
}
function exportDecisions(finalize){
 const invalid=works.filter(x=>cur(x.id).decision==='IMPORT_WITH_CORRECTIONS'&&!cur(x.id).corrections.trim());
 if(invalid.length){alert('Add correction instructions for '+invalid.length+' selected artworks first.');return}
 if(finalize&&!$('#complete').checked){alert('Confirm that the complete image-visible batch has been reviewed.');return}
 if(finalize&&!confirm('Finalize all '+works.length+' image-visible works? Every unselected work will be marked REJECT. Hidden or filtered works are included.'))return;
 const decisions=works.filter(w=>finalize||cur(w.id).decision!=='UNSELECTED').map(w=>{
  const c=cur(w.id);
  return {museum:w.provider,sourceObjectId:w.objectId,sourceId:w.id,accession:w.accession||null,
   title:w.title,artist:w.artist||null,decision:c.decision==='UNSELECTED'?'REJECT':c.decision,
   corrections:c.decision==='IMPORT_WITH_CORRECTIONS'?c.corrections.trim():null,
   imageRightsVerified:!w.rightsConflict,rightsHold:!!w.rightsConflict,productionImported:false}
 });
 const payload={schema:'AO_SACRED_ART_USER_IMPORT_CHOICES_V1',date:'2026-10-29',
   batchSha256:batchHash,completeBatch:finalize,reviewedVisibleArtworkCount:works.length,
   unreviewableSourceRecordsExcluded:true,noProductionMutation:true,decisions};
 const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);
 a.download='ad-orientem-kmska-cleveland-'+(finalize?'final':'draft')+'-choices.json';
 a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
$('#q').addEventListener('input',render);$('#museum').addEventListener('change',render);
$('#state').addEventListener('change',render);
$('#finish').addEventListener('click',()=>exportDecisions(true));
$('#draft').addEventListener('click',()=>exportDecisions(false));
render();
</script></body></html>"""
tail=tail.replace('REPLACE_BATCH_HASH',json.dumps(frozen))
OUTPUT.write_text(head+data+tail,encoding='utf8')
print(json.dumps({'reviewable':len(review),'KMSKA':sum(x['provider']=='KMSKA' for x in review),
 'Cleveland':sum(x['provider']=='Cleveland' for x in review),'batchHash':frozen,
 'html':str(OUTPUT.relative_to(ROOT)),'productionImports':0}))
