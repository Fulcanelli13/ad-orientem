#!/usr/bin/env python3
"""Verify exact KMSKA official CC0 manifests for sourced sacred paintings only."""
import json,urllib.request
from pathlib import Path
out=Path('data/calendar/sacred-art-kmska-verified-sacred-manifest-probe-20261029.v1.json')
refs=[
 ('313','tcasyd','307','The Incredulity of Thomas','Peter Paul Rubens','https://vlaamsekunstcollectie.be/en/collection/307'),
 ('1121','65m0to','847','The Adoration of the Magi','unattributed','https://vlaamsekunstcollectie.be/en/collection/847'),
 ('24381','ulznvi','303','Saint John','Peter Paul Rubens','https://vlaamsekunstcollectie.be/en/collection/303')]
records=[]
for manifest_id,purl,inventory,title,artist,page in refs:
 url='https://iiif.kmska.be/iiif/2/'+manifest_id+'/manifest.json'
 obj={'manifest':url,'purl':'http://kmska.be/collection/work/data/'+purl,'inventory':inventory,
  'title':title,'artist':artist,'officialMuseumPage':page,'sourcePageStatesCC0':True,
  'manifestRightsVerified':False,'imageURL':None}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=14) as res:
   data=res.read(500001)
   if len(data)>500000:raise ValueError('size bound')
  j=json.loads(data)
  obj['keys']=list(j.keys())[:18]
  obj['manifestRights']=j.get('license') or j.get('rights')
  obj['label']=j.get('label')
  can=(j.get('sequences') or [{}])[0].get('canvases') or []
  rep=(can[0].get('images') or [{}])[0].get('resource') or {} if can else {}
  url=rep.get('@id') or rep.get('id') or ''
  obj['imageURLCandidate']=url
  obj['manifestRightsVerified']=bool(obj['manifestRights'] and any(x in str(obj['manifestRights']) for x in ('creativecommons.org/publicdomain/','creativecommons.org/licenses/by/4.0')) and url.startswith('https://'))
  if obj['manifestRightsVerified']:obj['imageURL']=url
 except Exception as e:obj['error']=type(e).__name__+': '+str(e)[:150]
 records.append(obj)
out.write_text(json.dumps({'schema':'AO_KMSKA_EXACT_IIIF_MANIFEST_SEED_V1','date':'2026-10-29','imageDownloads':0,'records':records},ensure_ascii=False,indent=2)+'\n')
print(json.dumps(records,ensure_ascii=False)[:5500])
