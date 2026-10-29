#!/usr/bin/env python3
"""Probe Wikimedia Commons category graph + per-file licence, source, thumbnail bytes."""
import json,urllib.parse,urllib.request,urllib.error,time
from pathlib import Path
API='https://commons.wikimedia.org/w/api.php'
UA='AdOrientemSacredArtResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
queries=[
 {'action':'query','list':'categorymembers','cmtitle':'Category:Baroque religious paintings','cmtype':'file|subcat','cmlimit':25,'format':'json'},
 {'action':'query','generator':'categorymembers','gcmtitle':'Category:Religious paintings by Peter Paul Rubens','gcmtype':'file','gcmlimit':4,'prop':'imageinfo','iiprop':'url|size|extmetadata|mime','iiurlwidth':900,'format':'json','formatversion':2},
 {'action':'query','generator':'categorymembers','gcmtitle':'Category:Baroque religious paintings','gcmtype':'file','gcmlimit':4,'prop':'imageinfo','iiprop':'url|size|extmetadata|mime','iiurlwidth':900,'format':'json','formatversion':2}
]
out={'schema':'AO_B11_COMMONS_MEDIA_SOURCE_PROBE_V1','date':'2026-10-29','tests':[]}
for q in queries:
 url=API+'?'+urllib.parse.urlencode(q)
 t={'params':q}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
  with urllib.request.urlopen(req,timeout=24) as r:raw=r.read(400000)
  j=json.loads(raw)
  t['keys']=list(j)
  t['continue']=j.get('continue')
  if 'categorymembers' in j.get('query',{}):
   t['members']=j['query']['categorymembers'][:10]
  else:
   pages=j.get('query',{}).get('pages',[])
   t['examples']=[{'title':x.get('title'),
      'url':(x.get('imageinfo') or [{}])[0].get('url'),
      'thumburl':(x.get('imageinfo') or [{}])[0].get('thumburl'),
      'width':(x.get('imageinfo') or [{}])[0].get('width'),
      'height':(x.get('imageinfo') or [{}])[0].get('height'),
      'metadata':{k:v.get('value') for k,v in ((x.get('imageinfo') or [{}])[0].get('extmetadata') or {}).items() if k in ('LicenseShortName','UsageTerms','ObjectName','Artist','Credit','ImageDescription','LicenseUrl')}} for x in pages[:4]]
 except Exception as e:t['error']=type(e).__name__+': '+str(e)[:190]
 out['tests'].append(t)
p=Path('data/calendar/sacred-art-b11-commons-access-probe-20261029.v1.json')
p.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
print(json.dumps(out,ensure_ascii=False)[:9000])
