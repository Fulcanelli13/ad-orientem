#!/usr/bin/env python3
import base64, io, json, re, sys
from pathlib import Path
from urllib.parse import urlencode, quote
import requests
from PIL import Image, ImageOps

S=requests.Session()
S.headers.update({'User-Agent':'AdOrientemReferenceResearch/0.1 (contact via github.com/Fulcanelli13/ad-orientem)','Accept':'application/json,image/*'})
GROUPS=[["G404","High altar",[["Santissima Trinità, Rome: High altar","TrinitaAltare.jpg"],["High altar at Pascha","Santissima Trinità dei Pellegrini - Altare Maggiore - Pasqua.jpg"]]],["G080","Tabernacle",[["Sacré-Cœur Paris: Tabernacle close-up","Basilique du Sacré-Cœur tabernacle with golden angels - detail 2026-01-03-1.jpg"]]],["G190","Chalice",[["17th-century silver-gilt chalice and paten, Met","Chalice and paten MET 20268.jpg"],["Renaissance chalice and paten, Coimbra","Chalice and paten, from the Moseiro de Santa Clara, 1500-1520, 1 of 2 - Museu Nacional de Machado de Castro - Coimbra, Portugal - DSC00050.jpg"]]],["G191","Paten",[["17th-century chalice and paten, Met","Chalice and paten MET 20268.jpg"],["Renaissance chalice and paten, Coimbra","Chalice and paten, from the Moseiro de Santa Clara, 1500-1520, 1 of 2 - Museu Nacional de Machado de Castro - Coimbra, Portugal - DSC00050.jpg"]]],["G192","Ciborium — vessel",[["Portuguese silver-gilt ciborium, Met","Ciborium MET 13446.jpg"],["Silver-gilt ciborium, Vannes","Ciboire Cathedrale de Vannes 19082012.jpg"]]],["G193","Cruets",[["1830 altar cruets and tray, Notre-Dame treasure","Ciborium Morlot Notre-Dame NDP7 Cat91.jpg"],["Historic glass altar cruets, Milan","2929a - Ampolline, 1680-1720 - Museo Poldi Pezzoli, Milano, foto di Giovanni Dall'Orto, 10 Mag 2025.jpg"]]],["G189","Pall",[["17th-century linen pall, Met","Pall (chalice cover) MET 664.jpg"],["Embroidered Agnus Dei pall, Carmelite collection","Abbeville (80), carmel, pale orné de l'Agnus Dei et de motifs floraux, fin XIXe siècle, soie, coton et fil métallique, don en 1998.jpg"]]],["G211","Chalice veil",[["Antique chalice veil and burse diagram, 1868","Chalice Veil and Burse - Dolby 1868 Church Vestments Plate 28.jpg"],["NGA design drawing of burse and veil, 1940","Josephine C. Romano and Hal Blakeley, Burse and Chalice Veil, c. 1940, NGA 26326.jpg"]]],["G212","Burse",[["Chalice veil and burse plate, 1868","Chalice Veil and Burse - Dolby 1868 Church Vestments Plate 28.jpg"],["NGA design drawing of burse and veil, 1940","Josephine C. Romano and Hal Blakeley, Burse and Chalice Veil, c. 1940, NGA 26326.jpg"]]],["G213","Altar cards",[["Benzinger central altar card — previously rated 5/5","Benzinger altar card center HD.jpg"],["Complete traditional three-card arrangement","Catholic Picture Dictionary (Pfeiffer) - Altar cards.jpg"],["Ornate Venetian altar card set — previously rated 3/5","Arte veneziana, corredo di cartegloria, 1678-1736 ca.jpg"]]],["G214","Roman Missal",[["Roman Missal on altar (in context)","TrinitaAltare.jpg"],["Historical Roman Missal (not the 1962 edition)","Roman missal (15th century).jpg"]]],["G215","Missal stand",[["Missal and stand visible on Roman high altar","TrinitaAltare.jpg"]]],["G194","Thurible",[["Traditional metal thurible in liturgical use","Thurible.jpg"],["Incense boat and thurible in use","ThuribleAndBoat.jpg"]]],["G195","Incense boat",[["Metal incense boat with spoon","IncenseBoat.jpg"],["Incense boat shown with thurible","ThuribleAndBoat.jpg"]]],["G218","Sanctuary lamp",[["Gilt sanctuary lamp by Pugin, c.1855","Sanctuary Lamp, designed by A.W.N. Pugin, manufactured by J. Hardman & Co., c. 1855, gilt brass - Huntington Art Museum - San Marino, CA - DSC01810.jpg"],["Italian silver sanctuary lamp, Met","Sanctuary lamp MET 130215.jpg"]]],["G184","Credence table",[["Credence at Epistle side of traditional altar","TrinitaAltare.jpg"]]],["G186","Communion rail",[["Catholic high altar seen from communion rail, Somerset Ohio","Holy Trinity Catholic Church (Somerset, Ohio) - high altar, view from communion rail.jpg"]]],["G200","Chasuble",[["Italian chasuble, stole and maniple, 1704, Met","Chasuble, stole and maniple MET 27.341a-c front CP4.jpg"],["18th-century chasuble and maniple, Met","Chasuble and maniple MET 44.61.7a-b back CP4.jpg"]]],["G182","Maniple",[["Roman maniple from Clement VIII's vestments","Maniple, with Instruments of the Passion, 1593-1597, silk, gilt silver - Mass vestments of Pope Clement VIII Aldobrandini - Sala degli Indirizzi di Pio IX - Vatican Museums - DSC00675.jpg"],["17th-century matching chasuble, stole and maniple, Cleveland","Italy, Genoa, 17th century - Chasuble, Stole, Burse(Corporal Case), and Maniple - 1916.1443 - Cleveland Museum of Art.jpg"]]],["G199","Stole",[["17th-century matching chasuble, stole and maniple, Cleveland","Italy, Genoa, 17th century - Chasuble, Stole, Burse(Corporal Case), and Maniple - 1916.1443 - Cleveland Museum of Art.jpg"],["Italian stole with chasuble and maniple, Met","Chasuble, stole and maniple MET 27.341a-c front CP4.jpg"]]]]

names=list(dict.fromkeys(f for k,t,lst in GROUPS for label,f in lst))
info={}
for offset in range(0,len(names),35):
 batch=names[offset:offset+35]
 p={'action':'query','format':'json','formatversion':'2','prop':'imageinfo','iiprop':'url|mime|extmetadata',
    'iiurlwidth':600,'titles':'|'.join('File:'+n for n in batch)}
 u='https://commons.wikimedia.org/w/api.php?'+urlencode(p)
 res=S.get(u,timeout=45)
 res.raise_for_status()
 packet=res.json()
 if 'query' not in packet:raise RuntimeError('Commons API error: '+str(packet)[:250])
 info.update({x.get('title','').removeprefix('File:'):(x.get('imageinfo')or[{}])[0]
              for x in packet['query']['pages'] if 'missing' not in x})
 print('API batch matched',len(info),'of',len(names),flush=True)
print('API matched',len(info),'of',len(names),flush=True)
def value(thing):
 return re.sub('<[^>]*>','',thing.get('value','')) if isinstance(thing,dict) else ''
images={};missing=[]
for n in names:
 item=info.get(n)
 if not item:
  print('MISSING title',n,flush=True);missing.append([n,'missing API title']);continue
 for url in [item.get('thumburl'),item.get('url')]:
  if not url:continue
  try:
   rr=S.get(url,timeout=28);rr.raise_for_status()
   im=Image.open(io.BytesIO(rr.content));im.load()
   if im.width<120 or im.height<120:raise ValueError('small image')
   im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((720,650),Image.Resampling.LANCZOS)
   b=io.BytesIO();im.save(b,format='JPEG',quality=74,optimize=True)
   ext=item.get('extmetadata')or{}
   images[n]={'data':'data:image/jpeg;base64,'+base64.b64encode(b.getvalue()).decode(),
      'url':'https://commons.wikimedia.org/wiki/File:'+quote(n.replace(' ','_'),safe='()'),
      'license':value(ext.get('LicenseShortName',{})),'artist':value(ext.get('Artist',{}))[:100],
      'size':list(im.size),'filename':n}
   print('OK',n,len(b.getvalue()),flush=True)
   break
  except Exception as e:
   err=str(e);print('URL failure',n,err[:150],flush=True)
 if n not in images:missing.append([n,err])
payload=[]
for k,title,items in GROUPS:
 c=[{'id':k+'/'+name,'title':label,**images[name]} for label,name in items if name in images]
 if c:payload.append({'key':k,'title':title,'items':c})
total=sum(len(x['items']) for x in payload)
print('TOTAL VERIFIED',total,'FAILURES',len(missing),flush=True)
if total<15:raise RuntimeError('Insufficient verified object photos for review.')
page=r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visible Mass — Curated reference photographs</title>
<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#080d12;color:#e9e3d9;font:15px Georgia,serif}header{padding:18px;position:sticky;top:0;background:#080d12ed;border-bottom:1px solid #48505a;z-index:5}h1{font-size:21px;letter-spacing:.05em;font-weight:normal;margin:0 0 8px}p,small{color:#b2b6ba}main{max-width:1520px;margin:auto;padding:14px}section{margin:15px 0 35px}h2{font-size:18px;font-weight:normal}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:14px}.card{background:#151d26;border:1px solid #3e4954;border-radius:9px;overflow:hidden}.image{height:255px;background:black}.image img{width:100%;height:100%;object-fit:contain;cursor:zoom-in}.info{padding:12px}.info h3{font-size:15px;margin:0 0 6px}.row{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.score{background:#232d37;border:1px solid #586370;color:#eee;border-radius:5px;cursor:pointer;padding:7px 10px}.score.sel{background:#d0b081;color:#111}select,button,textarea{font:13px system-ui,sans-serif}select,textarea{background:#202b37;color:#eee;border:1px solid #566270;border-radius:6px;padding:8px}textarea{width:100%;height:50px;resize:vertical;margin-top:7px}a{color:#d9bd93}.meta{font:11px/1.5 system-ui,sans-serif;color:#b3bbc5}.controls{display:flex;gap:8px;flex-wrap:wrap}.controls select,.controls button{border:1px solid #53606b;background:#1b2631;color:#eee;border-radius:5px;padding:8px;cursor:pointer}.controls span{font:12px system-ui,sans-serif;color:#b3bbc5;align-self:center}#overlay{position:fixed;inset:0;background:#000e;z-index:20;display:none;align-items:center;justify-content:center}#overlay.visible{display:flex}#overlay img{max-width:98vw;max-height:95vh;object-fit:contain}#overlay button{position:absolute;top:12px;right:12px;padding:10px}</style></head><body>
<header><h1>The Visible Mass · Living glossary object candidates</h1><small>Close-up sacred objects, reference illustrations and traditional Roman Mass settings. Historical museum objects are not necessarily 1962 examples; verify usage before publishing.</small>
<div class="controls"><select id="filter"><option value="all">All categories</option></select><select id="order"><option value="source">Source order</option><option value="rank">Your priority rank</option><option value="score">Your highest scores</option></select><select id="rated"><option value="all">All photographs</option><option value="unrated">Unrated only</option><option value="rated">Rated only</option></select><button id="json">Export JSON</button><button id="csv">Export CSV</button><span id="progress"></span></div></header>
<main id="main"></main><div id="overlay"><img id="enlarged"><button id="close">Close</button></div>
<script type="application/json" id="payload">__PAYLOAD__</script><script>
const D=JSON.parse(document.getElementById('payload').textContent);
const ALL=D.flatMap(g=>g.items);
const STORAGE='ao_visible_mass_living_objects_v1';let R={};try{R=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(e){}
const el=id=>document.getElementById(id), E=x=>String(x||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
function save(){try{localStorage.setItem(STORAGE,JSON.stringify(R))}catch(e){}progress()}
function progress(){let n=D.reduce((a,c)=>a+c.items.length,0);el('progress').textContent=Object.values(R).filter(v=>v.score!==undefined).length+' / '+n+' rated'}
function makeCard(it){let r=R[it.id]||{};let art=document.createElement('article');art.className='card';
let imgbox=document.createElement('div');imgbox.className='image';let img=new Image();img.src=it.data;img.loading='lazy';img.alt=it.title;
img.onclick=()=>{el('enlarged').src=it.data;el('overlay').classList.add('visible')};imgbox.append(img);art.append(imgbox);
let info=document.createElement('div');info.className='info';let h=document.createElement('h3');h.textContent=it.title;info.append(h);
let scores=document.createElement('div');scores.className='row';[0,1,2,3,4,5].forEach(n=>{let b=document.createElement('button');b.textContent=n;b.className='score'+(r.score===n?' sel':'');b.onclick=()=>{R[it.id]??={};R[it.id].score=n;save();scores.querySelectorAll('button').forEach(bb=>bb.classList.toggle('sel',bb===b))};scores.append(b)});info.append(scores);
let priority=document.createElement('label');priority.className='meta';priority.textContent='Your overall priority rank (1 = highest): ';let pn=document.createElement('input');pn.type='number';pn.min=1;pn.max=999;pn.placeholder='–';pn.style.cssText='width:68px;background:#202b37;color:white;border:1px solid #566270;border-radius:5px;padding:6px;';pn.value=r.rank??'';pn.onchange=()=>{R[it.id]??={};if(pn.value) R[it.id].rank=Number(pn.value);else delete R[it.id].rank;save()};priority.append(pn);info.append(priority);
let fit=document.createElement('select');[['this','Suitable here'],['elsewhere','Useful elsewhere'],['reject','Reject']].forEach(x=>{let o=document.createElement('option');o.value=x[0];o.textContent=x[1];fit.append(o)});fit.value=r.fit||'this';fit.onchange=()=>{R[it.id]??={};R[it.id].fit=fit.value;save()};info.append(fit);
let notes=document.createElement('textarea');notes.placeholder='Notes';notes.value=r.notes||'';notes.oninput=()=>{R[it.id]??={};R[it.id].notes=notes.value;save()};info.append(notes);
let meta=document.createElement('div');meta.className='meta';meta.textContent=(it.artist||'Commons contributor')+' · '+(it.license||'Check licence')+' · ';let link=document.createElement('a');link.href=it.url;link.textContent='Open original & licence';link.target='_blank';link.rel='noopener';meta.append(link);info.append(meta);art.append(info);return art}
function draw(){let k=el('filter').value, order=el('order').value, rated=el('rated').value;el('main').replaceChildren();D.filter(g=>k==='all'||g.key===k).forEach(g=>{let items=g.items.filter(it=>rated==='all'||(rated==='rated')===(R[it.id]?.score!==undefined));if(order==='rank')items.sort((a,b)=>(R[a.id]?.rank||9999)-(R[b.id]?.rank||9999));if(order==='score')items.sort((a,b)=>(R[b.id]?.score??-1)-(R[a.id]?.score??-1));if(!items.length)return;let sec=document.createElement('section');let h=document.createElement('h2');h.textContent=g.title+' ('+items.length+')';sec.append(h);let gr=document.createElement('div');gr.className='grid';items.forEach(it=>gr.append(makeCard(it)));sec.append(gr);el('main').append(sec)});progress()}
D.forEach(g=>{let o=document.createElement('option');o.value=g.key;o.textContent=g.title+' ('+g.items.length+')';el('filter').append(o)});el('filter').onchange=draw;el('order').onchange=draw;el('rated').onchange=draw;
el('close').onclick=()=>el('overlay').classList.remove('visible');el('overlay').onclick=e=>{if(e.target===el('overlay'))el('close').click()};document.addEventListener('keydown',e=>{if(e.key==='Escape')el('close').click()});
function download(name,body,type){let u=URL.createObjectURL(new Blob([body],{type}));let a=document.createElement('a');a.href=u;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(u),2000)}
el('json').onclick=()=>download('visible-mass-living-object-ratings.json',JSON.stringify({format:'AO_VISIBLE_MASS_OBJECTS_V1',ratings:R,images:D.map(g=>({category:g.key,items:g.items.map(it=>({id:it.id,title:it.title,source:it.url,license:it.license}))}))},null,2),'application/json');
el('csv').onclick=()=>{let lines=[['category','image','score','rank','fit','notes','url']];D.forEach(g=>g.items.forEach(it=>{let r=R[it.id]||{};lines.push([g.title,it.title,r.score??'',r.rank??'',r.fit??'',r.notes??'',it.url])}));let q=x=>'"'+String(x).replace(/"/g,'""')+'"';download('visible-mass-living-object-ratings.csv',lines.map(r=>r.map(q).join(',')).join('\n'),'text/csv')};draw();
</script></body></html>'''
out=Path('dist/visible-mass');out.mkdir(parents=True,exist_ok=True)
f=out/'Visible_Mass_Living_Glossary_Objects.html';f.write_text(page.replace('__PAYLOAD__',json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')),encoding='utf8')
(out/'living-objects-acquisition-report.json').write_text(json.dumps({'requested':len(names),'verified':total,'missing':missing,'categories':{g['key']:len(g['items']) for g in payload}},indent=2),encoding='utf8')
print('BUILT',f,f.stat().st_size,flush=True)
