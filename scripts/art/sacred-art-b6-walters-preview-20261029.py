#!/usr/bin/env python3
"""Probe image HTTP headers on exact Walters JPG and optional smaller view patterns."""
import csv,json,urllib.request,urllib.error,re
from pathlib import Path
p=Path('data/calendar/sacred-art-b6-walters-preview-delivery-20261029.v1.json')
media=[
'https://art.thewalters.org/images/raw/PL7_37.569_Fnt_BW.jpg',
'https://art.thewalters.org/images/raw/PL7_37.497_Fnt_BW.jpg',
'https://art.thewalters.org/images/raw/PL1_37.519_Fnt_TR_T90II.jpg']
data=[]
for base in media:
 for mode in ('raw','web','medium','large','thumb'):
  u=base.replace('/images/raw/','/images/'+mode+'/')
  row={'sourceUrl':base,'mode':mode,'url':u,'validJpeg':False}
  try:
   rq=urllib.request.Request(u,headers={'User-Agent':'AdOrientem-SacredArt/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'image/jpeg','Range':'bytes=0-15'})
   with urllib.request.urlopen(rq,timeout=20) as response:
    b=response.read(16)
    row.update({'status':response.status,'mime':response.headers.get('Content-Type'),
     'contentLength':response.headers.get('Content-Length'),
     'validJpeg':b.startswith(bytes.fromhex('ffd8'))})
  except Exception as e:row['error']=type(e).__name__+': '+str(e)[:110]
  data.append(row)
p.write_text(json.dumps({'schema':'AO_B6_WALTERS_IIIF_PREVIEW_HOST_SMOKE_V1','imageFilesSaved':0,'tests':data},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'mode':z['mode'],'status':z.get('status'),'mime':z.get('mime'),'jpeg':z['validJpeg'],'error':z.get('error')} for z in data],ensure_ascii=False)[:4000])
