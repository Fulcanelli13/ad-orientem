#!/usr/bin/env python3
import base64, io, json, re, sys
from pathlib import Path
from urllib.parse import urlencode, quote
import requests
from PIL import Image, ImageOps

S=requests.Session()
S.headers.update({'User-Agent':'AdOrientemReferenceResearch/0.1 (contact via github.com/Fulcanelli13/ad-orientem)','Accept':'application/json,image/*'})
GROUPS=[["nave","Brompton Oratory nave",[["Nave, 2022","Brompton Oratory (Interior) - London, UK 2022-09-18 08-41-37.jpg"],["Nave, 2016","2016 Brompton Oratory, interior 01.jpg"]]],["sanctuary","Brompton Oratory high altar and side chapels",[["High altar, view 1","The Oratory of S Philip Neri, High Altar 1.jpg"],["High altar, view 2","The Oratory of S Philip Neri, High Altar 2.jpg"],["Lady altar","The Oratory of S Philip Neri, The Lady Altar.jpg"],["Sacred Heart chapel","The Oratory of S Philip Neri, Sacred Heart Chapel.jpg"]]],["mass","Documented 1962 TLM action photography",[["Prayers at the foot of altar","Confiteor at Tridentine Mass.jpg"],["Elevation in the traditional Mass","Traditional Latin Mass - Elevation.jpg"],["Ecce Agnus Dei","Ecce Agnus Dei.jpg"]]],["detail","Liturgical object photographs",[["Chalice and paten, Metropolitan Museum","Chalice and paten MET 20268.jpg"],["Altar card, Benzinger","Benzinger altar card center HD.jpg"]]]]

names=list(dict.fromkeys(f for k,t,lst in GROUPS for label,f in lst))
info={}
for offset in range(0,len(names),35):
 batch=names[offset:offset+35]
 p={'action':'query','format':'json','formatversion':'2','prop':'imageinfo','iiprop':'url|mime|extmetadata',
    'iiurlwidth':2400,'titles':'|'.join('File:'+n for n in batch)}
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
   im=ImageOps.exif_transpose(im).convert('RGB');im.thumbnail((2400,1800),Image.Resampling.LANCZOS)
   b=io.BytesIO();im.save(b,format='JPEG',quality=83,optimize=True)
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
if total<7:raise RuntimeError('Insufficient verified photographs for visitor experience.')
page=r'''<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Visible Mass — Curated reference photographs</title>
<style>:root{color-scheme:dark}*{box-sizing:border-box}body{margin:0;background:#080d12;color:#e9e3d9;font:15px Georgia,serif}header{padding:18px;position:sticky;top:0;background:#080d12ed;border-bottom:1px solid #48505a;z-index:5}h1{font-size:21px;letter-spacing:.05em;font-weight:normal;margin:0 0 8px}p,small{color:#b2b6ba}main{max-width:1520px;margin:auto;padding:14px}section{margin:15px 0 35px}h2{font-size:18px;font-weight:normal}.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(275px,1fr));gap:14px}.card{background:#151d26;border:1px solid #3e4954;border-radius:9px;overflow:hidden}.image{height:255px;background:black}.image img{width:100%;height:100%;object-fit:contain;cursor:zoom-in}.info{padding:12px}.info h3{font-size:15px;margin:0 0 6px}.row{display:flex;flex-wrap:wrap;gap:6px;margin:10px 0}.score{background:#232d37;border:1px solid #586370;color:#eee;border-radius:5px;cursor:pointer;padding:7px 10px}.score.sel{background:#d0b081;color:#111}select,button,textarea{font:13px system-ui,sans-serif}select,textarea{background:#202b37;color:#eee;border:1px solid #566270;border-radius:6px;padding:8px}textarea{width:100%;height:50px;resize:vertical;margin-top:7px}a{color:#d9bd93}.meta{font:11px/1.5 system-ui,sans-serif;color:#b3bbc5}.controls{display:flex;gap:8px;flex-wrap:wrap}.controls select,.controls button{border:1px solid #53606b;background:#1b2631;color:#eee;border-radius:5px;padding:8px;cursor:pointer}.controls span{font:12px system-ui,sans-serif;color:#b3bbc5;align-self:center}#overlay{position:fixed;inset:0;background:#000e;z-index:20;display:none;align-items:center;justify-content:center}#overlay.visible{display:flex}#overlay img{max-width:98vw;max-height:95vh;object-fit:contain}#overlay button{position:absolute;top:12px;right:12px;padding:10px}</style></head><body>
<header><h1>The Visible Mass · Authentic Church Research</h1><small>Real Catholic church photographs: inspecting a possible coherent environment before final selection. Source credits in each card.</small>
<div class="controls"><select id="filter"><option value="all">All categories</option></select><select id="order"><option value="source">Source order</option><option value="rank">Your priority rank</option><option value="score">Your highest scores</option></select><select id="rated"><option value="all">All photographs</option><option value="unrated">Unrated only</option><option value="rated">Rated only</option></select><button id="json">Export JSON</button><button id="csv">Export CSV</button><span id="progress"></span></div></header>
<main id="main"></main><div id="overlay"><img id="enlarged"><button id="close">Close</button></div>
<script type="application/json" id="payload">__PAYLOAD__</script><script>
const D=JSON.parse(document.getElementById('payload').textContent);
const ALL=D.flatMap(g=>g.items);
const STORAGE='ao_visible_mass_real_church_v1';let R={};try{R=JSON.parse(localStorage.getItem(STORAGE)||'{}')}catch(e){}
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
el('json').onclick=()=>download('visible-mass-real-church-ratings.json',JSON.stringify({format:'AO_VISIBLE_MASS_TLM_RANKINGS_V1',ratings:R,images:D.map(g=>({category:g.key,items:g.items.map(it=>({id:it.id,title:it.title,source:it.url,license:it.license}))}))},null,2),'application/json');
el('csv').onclick=()=>{let lines=[['category','image','score','rank','fit','notes','url']];D.forEach(g=>g.items.forEach(it=>{let r=R[it.id]||{};lines.push([g.title,it.title,r.score??'',r.rank??'',r.fit??'',r.notes??'',it.url])}));let q=x=>'"'+String(x).replace(/"/g,'""')+'"';download('visible-mass-real-church-ratings.csv',lines.map(r=>r.map(q).join(',')).join('\n'),'text/csv')};draw();
</script></body></html>'''
out=Path('dist/visible-mass');out.mkdir(parents=True,exist_ok=True)
f=out/'Visible_Mass_Authentic_Church_Hires.html';f.write_text(page.replace('__PAYLOAD__',json.dumps(payload,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')),encoding='utf8')
(out/'church-hires-report.json').write_text(json.dumps({'requested':len(names),'verified':total,'missing':missing,'categories':{g['key']:len(g['items']) for g in payload}},indent=2),encoding='utf8')
print('BUILT',f,f.stat().st_size,flush=True)
