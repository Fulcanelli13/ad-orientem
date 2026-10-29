#!/usr/bin/env python3
"""Bounded Art Institute Chicago public-domain painting API shape test; no image download."""
import json,urllib.request,urllib.parse
from pathlib import Path
P=Path('data/calendar/sacred-art-artic-b4-interface-probe-20261029.v1.json')
ROOT='https://api.artic.edu/api/v1/artworks/search'
FIELDS='id,title,artist_title,artist_display,classification_title,artwork_type_title,medium_display,image_id,is_public_domain,thumbnail,main_reference_number,date_display'
result=[]
for q in ('saint jerome','madonna and child','crucifixion'):
 args={'q':q,'query[term][is_public_domain]':'true','limit':'5','page':'1','fields':FIELDS}
 url=ROOT+'?'+urllib.parse.urlencode(args)
 row={'term':q,'url':url}
 try:
  req=urllib.request.Request(url,headers={'Accept':'application/json','User-Agent':'AdOrientem-Art-Curation/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'})
  with urllib.request.urlopen(req,timeout=19) as resp: data=json.loads(resp.read(3000000))
  row['pagination']=data.get('pagination',{})
  row['data']=[{k:x.get(k) for k in ('id','title','artist_title','classification_title','artwork_type_title','medium_display','image_id','is_public_domain','thumbnail')} for x in data.get('data',[])]
  row['status']='OK'
 except Exception as e:row['status']='ERROR';row['error']=type(e).__name__+': '+str(e)[:250]
 result.append(row)
P.write_text(json.dumps({'schema':'AO_ARTIC_SOURCE_PROBE_B4_V1','photosDownloaded':0,'searches':result},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'term':x['term'],'status':x['status'],'total':x.get('pagination',{}).get('total'),'data':x.get('data',[])[:2],'error':x.get('error')} for x in result],ensure_ascii=False)[:5000])
