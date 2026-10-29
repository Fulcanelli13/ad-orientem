#!/usr/bin/env python3
"""B8 source probe: examine official SMK public-domain painting API safely."""
import json,urllib.request,urllib.parse,time
from pathlib import Path
D=Path('data/calendar')
O=D/'sacred-art-b8-smk-api-probe-20261029.v1.json'
BASE='https://api.smk.dk/api/v1/art/search/'
queries=[
 {'keys':'Christ','offset':'0','rows':'3','lang':'en'},
 {'keys':'*','filters':'[has_image:true],[object_names:maleri],[public_domain:true]','offset':'0','rows':'3','lang':'en'},
 {'keys':'*','filters':'[has_image:true],[public_domain:true]','offset':'0','rows':'3','lang':'en'},
 {'keys':'Jesus','offset':'0','rows':'3','lang':'en'},
 {'keys':'Madonna','offset':'0','rows':'3','lang':'en'},
]
out={'schema':'AO_SACRED_ART_B8_SMK_PROBE_V1','date':'2026-10-29','photosSaved':0,'requests':[]}
for q in queries:
 url=BASE+'?'+urllib.parse.urlencode(q)
 rec={'parameters':q,'url':url}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-Art-SourceProbe/1.0','Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=24) as r:
   body=r.read(2800000);rec['status']=r.status;rec['mime']=r.headers.get('Content-Type')
  data=json.loads(body)
  rec['responseType']=type(data).__name__
  if isinstance(data,dict):
   rec['topKeys']=list(data)
   for k,v in data.items():
    if isinstance(v,list):rec[k+'_length']=len(v)
    elif isinstance(v,(str,int,float,bool)) and len(str(v))<120:rec[k]=v
   arr=next((data[k] for k in ('items','data','results','artworks','objects') if isinstance(data.get(k),list)),[])
   rec['samples']=[{k:v for k,v in x.items() if k in ('id','title','titles','object_number','object_names','object_type','public_domain','rights_url','licence','techniques','image_thumbnail','image_iiif_id','image_width','image_height','creator','production_date','has_image','image_download','year_from') } for x in arr[:2] if isinstance(x,dict)]
  elif isinstance(data,list):
   rec['items']=len(data);rec['samples']=[x for x in data[:1] if isinstance(x,dict)]
 except Exception as e:rec['error']=type(e).__name__+': '+str(e)[:280]
 out['requests'].append(rec)
 time.sleep(.15)
O.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'out':str(O),'responses':out['requests']},ensure_ascii=False)[:9000])
