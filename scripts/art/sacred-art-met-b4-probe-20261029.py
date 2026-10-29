#!/usr/bin/env python3
"""Test official 2026 MET v1.1 search, object, and public-domain image preview."""
import json,urllib.request,urllib.parse
from pathlib import Path
out=Path('data/calendar/sacred-art-met-b4-availability-probe-20261029.v1.json')
base='https://collectionapi.metmuseum.org/public/collection'
rows=[]
for subject in ('Saint Jerome','Crucifixion','Madonna and Child'):
 query=base+'/v1.1/search?'+urllib.parse.urlencode({'q':subject,'hasImages':'true','departmentId':'11','limit':'5'})
 row={'subject':subject,'url':query,'status':'UNTESTED','objects':[]}
 try:
  req=urllib.request.Request(query,headers={'User-Agent':'AdOrientem-MET-CC0-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=20) as rsp: j=json.loads(rsp.read(250000))
  row['total']=j.get('total');row['ids']=j.get('objectIDs',[])[:5];row['status']='OK'
  for id in row['ids'][:2]:
   try:
    u=base+'/v1/objects/'+str(id)
    req=urllib.request.Request(u,headers={'User-Agent':'AdOrientem-MET-CC0-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'application/json'})
    with urllib.request.urlopen(req,timeout=18) as rsp: d=json.loads(rsp.read(450000))
    image=d.get('primaryImageSmall') or ''
    obj={'id':id,'isPublicDomain':d.get('isPublicDomain'),'title':d.get('title'),
       'classification':d.get('classification'),'medium':d.get('medium'),
       'image':image,'artist':d.get('artistDisplayName')}
    if image.startswith('https://images.metmuseum.org/') and obj['isPublicDomain'] is True:
     req=urllib.request.Request(image,headers={'User-Agent':'AdOrientem-MET-CC0-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Range':'bytes=0-15'})
     with urllib.request.urlopen(req,timeout=18) as rsp:
      obj['previewStatus']=rsp.status;obj['mime']=rsp.headers.get('Content-Type')
      obj['validJpeg']=rsp.read(16).startswith(bytes.fromhex('ffd8'))
    row['objects'].append(obj)
   except Exception as e:row['objects'].append({'id':id,'error':type(e).__name__+': '+str(e)[:170]})
 except Exception as e:row['status']='SOURCE_ERROR';row['error']=type(e).__name__+': '+str(e)[:210]
 rows.append(row)
out.write_text(json.dumps({'schema':'AO_MET_2026_V11_ACCESS_PROBE','imageOriginalsDownloaded':0,'results':rows},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(rows,ensure_ascii=False)[:6500])
