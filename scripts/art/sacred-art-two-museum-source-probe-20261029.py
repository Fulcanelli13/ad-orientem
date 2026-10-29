#!/usr/bin/env python3
"""Read-only KMSKA and Belvedere source-interface probe: no images or bypasses."""
import json,urllib.request,urllib.error,urllib.parse,xml.etree.ElementTree as ET,re
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'data/calendar/sacred-art-two-museum-access-probe-20261029.v1.json'
SOURCES=[
 ('kmska-rest','https://datahub.kmska.be/api/v1/data.json?limit=2&offset=0','application/json'),
 ('kmska-oai-identify','https://datahub.kmska.be/oai/?verb=Identify','application/xml'),
 ('kmska-oai-sets','https://datahub.kmska.be/oai/?verb=ListSets','application/xml'),
 ('belvedere-opencontent','https://sammlung.belvedere.at/opencontent/images','text/html'),
 ('belvedere-collection','https://sammlung.belvedere.at/','text/html')]
result=[]
for name,url,accept in SOURCES:
 row={'name':name,'url':url,'status':'NOT_TESTED','imageBytesDownloaded':0}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-SacredArtResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':accept})
  with urllib.request.urlopen(req,timeout=16) as resp:
   payload=resp.read(1000001)
   if len(payload)>1000000:raise ValueError('RESPONSE_EXCEEDS_PROBE_LIMIT')
   row['httpStatus']=resp.status;row['contentType']=resp.headers.get('Content-Type','')
  data=payload.decode('utf8','replace')
  row['bytes']=len(payload)
  if 'json' in row['contentType']:
   j=json.loads(data)
   row['jsonTopLevel']=list(j.keys())[:20] if isinstance(j,dict) else 'array'
   row['jsonSnippet']=json.dumps(j,ensure_ascii=False)[:1700]
  elif 'xml' in row['contentType']:
   tree=ET.fromstring(data)
   row['xmlRoot']=tree.tag;row['xmlLeafSample']=[{'tag':e.tag.split('}')[-1],'text':(e.text or '').strip()[:140]} for e in tree.iter() if e.text and e.text.strip()][:15]
  else:
   row['htmlTitle']=re.findall(r'<title[^>]*>(.*?)</title',data,re.I|re.S)[:1]
   row['htmlLinkSample']=list(dict.fromkeys(re.findall(r'href=["\\x27]([^"\\x27]+)',data)))[:12]
  row['status']='ACCESSIBLE'
 except Exception as e:
  row['status']='HOLD_SOURCE_ACCESS_OR_FORMAT'
  row['error']=type(e).__name__+': '+str(e)[:260]
 result.append(row)
OUT.write_text(json.dumps({'schema':'AO_SACRED_ART_TWO_MUSEUM_INTERFACE_PROBE_V1','date':'2026-10-29',
 'rightsClearanceNotAssumed':True,'contentDownloaded':'metadata_or_web_page_only','imageBytesDownloaded':0,
 'sources':result},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'name':r['name'],'status':r['status'],'type':r.get('contentType'),
 'sample':r.get('jsonSnippet','')[:350],'error':r.get('error')} for r in result],ensure_ascii=False))
