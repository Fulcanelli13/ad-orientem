#!/usr/bin/env python3
"""B10 quick zero-fee institution access probe. No gallery objects or photos saved."""
import json,urllib.request,urllib.parse
from pathlib import Path
out={'schema':'AO_B10_FRESH_SOURCE_PROBE_V1','date':'2026-10-29','requests':[]}
endpoints={
'getty_sparql':'https://data.getty.edu/museum/collection/sparql?'+urllib.parse.urlencode({'query':'SELECT * WHERE { ?s ?p ?o } LIMIT 1'}),
'met_full_dept':'https://collectionapi.metmuseum.org/public/collection/v1.1/search?'+urllib.parse.urlencode({'departmentId':11,'hasImages':'true','limit':10}),
'met_filter_only_plus_type':'https://collectionapi.metmuseum.org/public/collection/v1.1/search?'+urllib.parse.urlencode({'departmentId':11,'hasImages':'true','medium':'Paintings','limit':10}),
'getty_collection_ui':'https://www.getty.edu/art/collection/search/?q=Christ',
'mia_picture_sample':'https://1.api.artsmia.org/1578/medium.jpg',
'mia_picture_old_host':'https://api.artsmia.org/images/1578/medium.jpg',
'rijks_all_oil':'https://data.rijksmuseum.nl/search/collection?type=painting&material=oil+paint&imageAvailable=true',
'rijks_christ':'https://data.rijksmuseum.nl/search/collection?type=painting&imageAvailable=true&description=Christ',
'rijks_maria':'https://data.rijksmuseum.nl/search/collection?type=painting&imageAvailable=true&description=Maria',
'rijks_saint':'https://data.rijksmuseum.nl/search/collection?type=painting&imageAvailable=true&description=saint',
}
for name,url in endpoints.items():
 row={'name':name,'url':url}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-SacredArt-Research/1.0','Accept':'application/sparql-results+json' if name=='getty_sparql' else '*/*'})
  with urllib.request.urlopen(req,timeout=20) as r:
   chunk=r.read(12000);row['http']=r.status;row['mime']=r.headers.get('Content-Type');row['previewBytes']=len(chunk)
  if row['mime'] and ('json' in row['mime']):
   obj=json.loads(chunk)
   row['total']=obj.get('total') or obj.get('count') or (obj.get('partOf') or {}).get('totalItems')
   row['orderedIDs']=[x.get('id') for x in obj.get('orderedItems',[])[:6]]
   row['ids']=obj.get('objectIDs',[])[:6]
   row['keys']=list(obj)[:10]
  elif row['mime'] and 'image' in row['mime']:
   row['validJpeg']=chunk.startswith(bytes.fromhex('ffd8'))
  else:row['head']=chunk.decode('utf8','replace')[:180]
 except Exception as e:row['error']=type(e).__name__+': '+str(e)[:160]
 out['requests'].append(row)
p=Path('data/calendar/sacred-art-b10-open-source-access-probe-20261029.v1.json')
p.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(out,ensure_ascii=False)[:5000])
