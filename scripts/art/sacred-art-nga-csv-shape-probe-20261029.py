#!/usr/bin/env python3
import csv,io,json,urllib.request
from pathlib import Path
out=Path('data/calendar/sacred-art-nga-csv-shape-probe-20261029.v1.json')
result={}
for file in ('published_images.csv','objects.csv'):
 u='https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/'+file
 q=urllib.request.Request(u,headers={'User-Agent':'AdOrientem-NGA-SchemaProbe/1.0','Accept':'text/csv'})
 with urllib.request.urlopen(q,timeout=35) as r:
  rows=csv.DictReader(io.TextIOWrapper(r,encoding='utf-8-sig',newline=''))
  preview=[];examples=[];n=0
  for x in rows:
   n+=1
   if len(examples)<2:examples.append(x)
   if file=='published_images.csv' and str(x.get('openaccess'))=='1' and len(preview)<8:
    preview.append({k:x.get(k) for k in ('uuid','iiifURL','iiifThumbURL','openaccess','viewtype','depictstmsobjectid')})
   if file=='objects.csv' and str(x.get('classification','')).lower().startswith('painting') and len(preview)<8:
    preview.append({k:x.get(k) for k in ('objectID','title','medium','classification','attribution')})
   if n>=1000:break
  result[file]={'headers':rows.fieldnames,'examples':examples,'relevant':preview}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({k:{'headers':v['headers'],'relevant':v['relevant'][:3]} for k,v in result.items()})[:4900])
