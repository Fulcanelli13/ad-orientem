#!/usr/bin/env python3
"""Bounded institutional-source discovery, no images, no scraping, no false ownership claims."""
import json,urllib.request,urllib.parse,urllib.error,xml.etree.ElementTree as ET
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
P=ROOT/'data/calendar/sacred-art-kmska-cleveland-interfaces-20261029.v1.json'
sources=[
 ('flemish-sets','https://datahub.vlaamsekunstcollectie.be/oai/?verb=ListSets','xml'),
 ('flemish-formats','https://datahub.vlaamsekunstcollectie.be/oai/?verb=ListMetadataFormats','xml'),
 ('flemish-objects','https://datahub.vlaamsekunstcollectie.be/oai/?verb=ListRecords&metadataPrefix=oai_lido','xml'),
 ('kmska-exact','https://datahub.vlaamsekunstcollectie.be/oai/?verb=GetRecord&metadataPrefix=oai_lido&identifier=oai%3Adatahub.vlaamsekunstcollectie.be%3Akmska.be%3Aah3b99','xml'),
 ('kmska-set','https://datahub.vlaamsekunstcollectie.be/oai/?verb=ListRecords&metadataPrefix=oai_lido&set=institution%3Akmska','xml'),
 ('cleveland','https://openaccess-api.clevelandart.org/api/artworks/?q=annunciation&cc0&has_image=1&limit=3','json')]
def tag(x):return x.tag.split('}')[-1]
result=[]
for name,url,format in sources:
 row={'name':name,'url':url,'status':'NOT_TESTED','imageBytes':0}
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-OpenArtMetadata/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'application/xml,application/json'})
  with urllib.request.urlopen(req,timeout=22) as res:
   data=res.read(5000001)
   row['httpCode']=res.status;row['type']=res.headers.get('Content-Type')
  if len(data)>5000000:raise ValueError('TOO_LARGE')
  if format=='xml':
   root=ET.fromstring(data)
   if name=='flemish-sets':
    row['sets']=[{'setSpec':next((x.text for x in y if tag(x)=='setSpec'),None),
                  'setName':next((x.text for x in y if tag(x)=='setName'),None)} for y in root.iter() if tag(y)=='set'][:350]
   elif name=='flemish-formats':
    row['prefixes']=[x.text for x in root.iter() if tag(x)=='metadataPrefix']
   else:
    row['recordSample']=[]
    for rec in [x for x in root.iter() if tag(x)=='record'][:3]:
     row['recordSample'].append({'identifier':[x.text for x in rec.iter() if tag(x) in ('identifier','lidoRecID','recordID')][:5],
        'institutions':[x.text for x in rec.iter() if tag(x) in ('legalBodyName','repositoryName','appellationValue') and x.text][:12],
        'headerSets':[x.text for x in rec.iter() if tag(x)=='setSpec'][:5]})
    row['oaiErrors']=[{'code':z.attrib.get('code'),'message':z.text} for z in root.iter() if tag(z)=='error']
  else:
   o=json.loads(data)
   row['info']=o.get('info');row['artworks']=[{'id':x.get('id'),'title':x.get('title'),
      'technique':x.get('technique'),'licence':x.get('share_license_status'),
      'imageKeys':list((x.get('images') or {}).keys()),'creators':x.get('creators')} for x in o.get('data',[])[:3]]
  row['status']='ACCESSIBLE'
 except Exception as e:
  row['status']='ERROR';row['error']=type(e).__name__+': '+str(e)[:200]
 result.append(row)
P.write_text(json.dumps({'schema':'AO_SACRED_ART_TWO_OPEN_DATA_SOURCE_PROBE_V1','date':'2026-10-29','imagesDownloaded':0,'sources':result},ensure_ascii=False,indent=2)+'\n')
print(json.dumps([{'source':s['name'],'status':s['status'],'sets':s.get('sets',[])[:10],
 'objects':s.get('recordSample',[]),'artworks':s.get('artworks',[]),'error':s.get('error')} for s in result],ensure_ascii=False)[:10500])
