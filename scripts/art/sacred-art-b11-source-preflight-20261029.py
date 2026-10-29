#!/usr/bin/env python3
"""Source preflight for B11: official public-domain image APIs only, no user review yet."""
import json,urllib.request,urllib.parse,time
from pathlib import Path
queries=[
 ('cma_all','https://openaccess-api.clevelandart.org/api/artworks/?'+urllib.parse.urlencode({'type':'Painting','has_image':1,'limit':12})+'&cc0'),
 ('cma_christ','https://openaccess-api.clevelandart.org/api/artworks/?'+urllib.parse.urlencode({'q':'Christ','type':'Painting','has_image':1,'limit':12})+'&cc0'),
 ('cma_madonna','https://openaccess-api.clevelandart.org/api/artworks/?'+urllib.parse.urlencode({'q':'Madonna','type':'Painting','has_image':1,'limit':12})+'&cc0'),
 ('cma_biblical','https://openaccess-api.clevelandart.org/api/artworks/?'+urllib.parse.urlencode({'q':'Saint','type':'Painting','has_image':1,'limit':12})+'&cc0'),
 ('cma_oil','https://openaccess-api.clevelandart.org/api/artworks/?'+urllib.parse.urlencode({'type':'Painting','has_image':1,'limit':12,'department':'European Painting and Sculpture'})+'&cc0'),
 ('aic_host','https://www.artic.edu/iiif/2/b2f3e61e-62a4-7788-1aa4-0b1d631e4914/full/843,/0/default.jpg'),
]
out={'schema':'AO_SACRED_ART_B11_SOURCE_ACCESS_PROBE_V1','date':'2026-10-29','tests':[]}
for key,url in queries:
 row={'key':key,'url':url}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-SacredArtOpenMuseumResearch/1.0','Accept':'application/json,image/jpeg'})
  with urllib.request.urlopen(req,timeout=24) as response:
   blob=response.read(1600000);row['http']=response.status;row['contentType']=response.headers.get('Content-Type')
  if 'json' in row['contentType']:
   data=json.loads(blob);row['total']=data.get('info',{}).get('total')
   rows=data.get('data',[])
   row['examples']=[{'id':x.get('id'),'title':x.get('title'),'type':x.get('type'),'department':x.get('department'),'share_license_status':x.get('share_license_status'),
    'technique':x.get('technique'),'web':(x.get('images') or {}).get('web'),'print':(x.get('images') or {}).get('print')} for x in rows[:5]]
   row['keys']=list(rows[0])[:40] if rows else []
  elif 'image/' in row['contentType']:row['jpeg']=blob[:3].hex()
  else:row['head']=blob[:180].decode('utf8','replace')
 except Exception as ex:row['error']=type(ex).__name__+': '+str(ex)[:180]
 out['tests'].append(row);time.sleep(.15)
p=Path('data/calendar/sacred-art-b11-source-access-probe-20261029.v1.json');p.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print(json.dumps(out,ensure_ascii=False)[:12000])
