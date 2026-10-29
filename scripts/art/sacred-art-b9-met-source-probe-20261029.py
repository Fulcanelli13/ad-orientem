#!/usr/bin/env python3
"""Probe Met 2026-10 API schema and host access, without downloading images."""
import json,urllib.request,urllib.parse,time
from pathlib import Path
BASE='https://collectionapi.metmuseum.org/public/collection/'
out={'schema':'AO_B9_MET_SOURCE_PROBE_V1','date':'2026-10-29','records':[]}
tests=[
 'v1/departments',
 'v1.1/search?'+urllib.parse.urlencode({'q':'Crucifixion','hasImages':'true','departmentId':11,'limit':5}),
 'v1.1/search?'+urllib.parse.urlencode({'q':'Madonna','hasImages':'true','departmentId':11,'limit':5}),
 'v1.1/search?'+urllib.parse.urlencode({'q':'Saint Jerome','hasImages':'true','departmentId':11,'limit':5}),
 'v1/objects/436105',
]
for suffix in tests:
 rec={'url':BASE+suffix}
 try:
  req=urllib.request.Request(rec['url'],headers={'User-Agent':'AdOrientem-SacredArt-Research/1.0','Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=22) as r:
   b=r.read(1300000);rec['http']=r.status;rec['mime']=r.headers.get('Content-Type')
  obj=json.loads(b)
  rec['keys']=list(obj)[:35]
  for key in ('total','limit','offset','objectID','title','isPublicDomain','primaryImage','primaryImageSmall','department','objectName','medium'):
   if key in obj:rec[key]=obj[key]
  if isinstance(obj.get('objectIDs'),list):rec['ids']=obj['objectIDs'][:15]
  if isinstance(obj.get('departments'),list):rec['departments']=obj['departments'][:20]
 except Exception as exc:rec['error']=type(exc).__name__+': '+str(exc)[:150]
 out['records'].append(rec);time.sleep(.25)
p=Path('data/calendar/sacred-art-b9-met-source-probe-20261029.v1.json')
p.write_text(json.dumps(out,indent=2)+'\n')
print(json.dumps(out)[:8500])
