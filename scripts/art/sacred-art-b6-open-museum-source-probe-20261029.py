#!/usr/bin/env python3
"""Metadata-only probes for Walters CSV and Mia collection JSON source. No photos."""
import csv,io,json,urllib.request,urllib.error
from pathlib import Path
OUT=Path('data/calendar/sacred-art-b6-walters-mia-source-probe-20261029.v1.json')
UA='AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
S=[
('walters-art','https://raw.githubusercontent.com/WaltersArtMuseum/api-thewalters-org/main/art.csv','csv'),
('walters-media','https://raw.githubusercontent.com/WaltersArtMuseum/api-thewalters-org/main/media.csv','csv'),
('mia-european-dept','https://raw.githubusercontent.com/artsmia/collection/main/departments/2.json','json'),
('mia-v10','https://search.artsmia.org/search/Christ?size=5','json'),
('mia-photo','https://images.artsmia.org/17.jpg','image')]
res=[]
for name,url,fmt in S:
 row={'source':name,'url':url,'state':'UNTESTED','imageOriginalsDownloaded':0}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json,text/csv,image/jpeg','Range':'bytes=0-15' if fmt=='image' else 'bytes=0-200000'})
  with urllib.request.urlopen(req,timeout=35) as r:
   row['httpStatus']=r.status;row['mime']=r.headers.get('Content-Type')
   if fmt=='image':
    row['firstBytes']=r.read(16).hex()
   elif fmt=='csv':
    content=r.read(500000)
    lines=content.decode('utf-8-sig','replace').splitlines()
    row['header']=next(csv.reader([lines[0]]))
    row['samples']=[next(csv.reader([l]))[:8] for l in lines[1:4]]
   else:
    data=json.loads(r.read(1000000))
    row['dataKeys']=list(data.keys())[:20] if isinstance(data,dict) else ['array']
    row['valueSnippet']=json.dumps(data,ensure_ascii=False)[:1250]
  row['state']='ACCESSIBLE'
 except Exception as e:row['state']='HOLD';row['error']=type(e).__name__+': '+str(e)[:180]
 res.append(row)
OUT.write_text(json.dumps({'schema':'AO_B6_SOURCE_INTERFACES_V1','photosSaved':0,'sources':res},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'source':x['source'],'state':x['state'],'header':x.get('header'),
 'sample':x.get('samples',[])[:1],'dataKeys':x.get('dataKeys'),'error':x.get('error')} for x in res],ensure_ascii=False)[:6000])
