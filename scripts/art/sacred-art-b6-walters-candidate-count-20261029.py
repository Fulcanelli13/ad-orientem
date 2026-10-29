#!/usr/bin/env python3
"""Walters B6 exact artwork/media paintings assessment, metadata only, zero images."""
import csv,io,json,re,urllib.request
from pathlib import Path
out=Path('data/calendar/sacred-art-b6-walters-exact-candidate-count-20261029.v1.json')
URL='https://raw.githubusercontent.com/WaltersArtMuseum/api-thewalters-org/main/'
UA='AdOrientem-SacredArt-Metadata/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
WORDS=('christ','jesus','virgin','madonna','saint ','st. ','saints','apostle',
'annunc','nativity','adoration','crucifix','magdalen','resurrection','assumption',
'ascension','pieta','pietà','ecce homo','pentecost','martyr','baptism','holy family',
'john the baptist','visitation','lamentation','deposition','holy trinity')
BLOCK=('saint louis','saint tropez','view of','church at','city of','square of','columbus',
'christie','christopher','christs church','st. peter\\'s square')
def csvsource(name):
 req=urllib.request.Request(URL+name,headers={'User-Agent':UA,'Accept':'text/csv'})
 f=urllib.request.urlopen(req,timeout=60)
 return f,csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig',newline=''))
def lo(x):return str(x or '').strip().lower()
f,rows=csvsource('art.csv')
cand=[];counter={};examples=[]
try:
 for o in rows:
  kind=o.get('Classification','')
  medium=lo(o.get('Medium'))
  title=lo(o.get('Title'))
  counter[kind]=counter.get(kind,0)+1
  if 'painting' not in lo(kind):continue
  if not any(k in title for k in WORDS):continue
  if any(k in title for k in BLOCK):continue
  if not any(k in medium for k in ('oil','tempera','acrylic','distemper')):continue
  if any(k in medium for k in ('manuscript','paper','parchment','print','vellum','watercolor')):continue
  cand.append({'id':o.get('ObjectID'),'acc':o.get('AccessionNumber'),'title':o.get('Title'),
    'class':kind,'medium':o.get('Medium'),'begin':o.get('DateBeginYear'),
    'resource':o.get('ResourceURL'),'creators':str(o.get('Creators'))[:200]})
finally:f.close()
ids={c['id'] for c in cand}
f,rows=csvsource('media.csv')
media={};src=0
try:
 for o in rows:
  src+=1
  id=o.get('ObjectID')
  if id not in ids:continue
  if lo(o.get('MediaType')) not in ('image',''):continue
  u=o.get('ImageURL','')
  if not u.startswith('https://art.thewalters.org/images/'):continue
  pri=lo(o.get('IsPrimary')) in ('1','true')
  if id not in media or (pri and not media[id]['isPrimary']):
   media[id]={'url':u,'isPrimary':pri,'view':o.get('MediaView')}
finally:f.close()
eligible=[x for x in cand if x['id'] in media]
result={'schema':'AO_B6_WALTERS_CANDIDATE_COUNTS_V1','photosDownloaded':0,
 'candidatePaintings':len(cand),'withExactImageURL':len(eligible),
 'sourceMediaRows':src,'classificationCounts':counter,
 'samples':[{**o,'image':media[o['id']]} for o in eligible[:25]]}
out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'paintings':len(cand),'pictured':len(eligible),'classification':sorted(counter.items(),key=lambda x:-x[1])[:10],
 'sample':result['samples'][:4]},ensure_ascii=False)[:3800])
