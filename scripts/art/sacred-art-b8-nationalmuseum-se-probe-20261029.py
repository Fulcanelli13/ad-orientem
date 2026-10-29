#!/usr/bin/env python3
"""Public Nationalmuseum Sweden LIDO / PD imagery source probe, research only."""
import urllib.request,tarfile,io,json,xml.etree.ElementTree as ET
from pathlib import Path
BASE='https://raw.githubusercontent.com/NationalmuseumSWE/WikidataCollection/master/'
R=[]
for part in ('1618','1677','1821'):
 entry={'part':part,'url':BASE+'valid_items_transform_'+part+'.tgz'}
 try:
  request=urllib.request.Request(entry['url'],headers={'User-Agent':'AdOrientem-B8-PD-Research/1.0'})
  with urllib.request.urlopen(request,timeout=55) as f:b=f.read(5000000)
  with tarfile.open(fileobj=io.BytesIO(b),mode='r:gz') as tf:
   members=[m for m in tf.getmembers() if m.isfile()]
   entry['filesCount']=len(members);entry['examples']=[m.name for m in members[:6]]
   snippets=[]
   for m in members[:4]:
    content=tf.extractfile(m).read(500000)
    x={'name':m.name,'bytes':len(content),'head':content.decode('utf8','replace')[:2000]}
    try:
     root=ET.fromstring(content)
     x['root']=root.tag
     x['tags']=list(dict.fromkeys(t.tag.split('}')[-1] for t in root.iter()))[:90]
     for tag in ('linkResource','rightsResource','term','appellationValue','objectWorkType'):
      vals=[t.text.strip() for t in root.iter() if t.tag.split('}')[-1]==tag and t.text and t.text.strip()]
      x[tag]=vals[:20]
    except Exception as e:x['parseError']=str(e)[:150]
    snippets.append(x)
   entry['samples']=snippets
   checks=[]
   for sx in snippets[:2]:
    for source in sx.get('linkResource',[]):
     if not source.startswith('http://nationalmuseum.iiifhosting.com/iiif/'):continue
     base=source.replace('http://','https://',1).rstrip('/')
     for suffix in ('/full/!560,560/0/default.jpg','/full/560,/0/default.jpg','/full/full/0/default.jpg'):
      url=base+suffix
      row={'url':url}
      try:
       req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-B8-PD-Research/1.0','Range':'bytes=0-15'})
       with urllib.request.urlopen(req,timeout=10) as resp:
        h=resp.read(16)
        row['status']=resp.status;row['mime']=resp.headers.get('Content-Type')
        row['validJpeg']=h.startswith(bytes.fromhex('ffd8'))
      except Exception as ex:row['error']=type(ex).__name__+':'+str(ex)[:130]
      checks.append(row)
     break
   entry['previewChecks']=checks
 except Exception as e:entry['error']=type(e).__name__+':'+str(e)[:180]
 R.append(entry)
out={'schema':'AO_B8_NATIONALMUSEUM_SWEDEN_DATA_PROBE_V1','date':'2026-10-29','imageDownloads':0,'archives':R}
p=Path('data/calendar/sacred-art-b8-nationalmuseum-se-lido-probe-20261029.v1.json')
p.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(json.dumps({'samples':[{k:v for k,v in x.items() if k not in ('samples',)} for x in R],'example':R[0].get('samples',[])[:1]},ensure_ascii=False)[:5500])
