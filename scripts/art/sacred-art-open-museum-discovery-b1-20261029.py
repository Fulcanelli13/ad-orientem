#!/usr/bin/env python3
"""Bounded source-metadata discovery; never downloads photos or modifies approved art."""
import argparse, difflib, html, json, re, time, unicodedata, urllib.parse, urllib.request
import xml.etree.ElementTree as ET
from pathlib import Path
from collections import Counter

BASE=Path(__file__).resolve().parents[2]
SRC=BASE/'data/calendar/sacred-art-licence-first-383-exact-source-audit-20261029.v1.json'
DST=BASE/'data/calendar/sacred-art-open-museum-discovery-b1-20261029.v1.json'
MD=BASE/'docs/SACRED_ART_OPEN_MUSEUM_DISCOVERY_B1_20261029.md'
RIJKS='https://data.rijksmuseum.nl/search/collection'
KMSKA='https://datahub.vlaamsekunstcollectie.be/oai/'
UA='AdOrientem-Museum-Metadata-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
TERMS=['Christus','Maria','Madonna','Heilige','Kruisiging','Kruisafneming','Aanbidding',
'Geboorte','Hemelvaart','Verrijzenis','Pinksteren','Aankondiging','Johannes','Petrus',
'Paulus','Magdalena','Driekoningen','Sacrament','Doop','Laatste Avondmaal',
'Christ','Virgin','Saint','Annunciation','Crucifixion','Resurrection','Pentecost']
SUBJECTS=('christ','jezus','jesus','virgin','madonna','maria','mary','marie','saint','sint',
'heilig','petr','peter','paul','cross','kruis','crucif','passie','passion','nativity',
'geboort','adoration','aanbid','resurrect','verrijz','hemel','ascens','annunc',
'aankond','pentecost','pinkster','trinit','magdal','baptist','doop','eucharist',
'last supper','avondmaal','holy family','heilige familie','lazarus','joseph','jozef',
'apost','engel','angel','immaculat','sacred heart','heilig hart','ecce homo',
'lament','bewen','assumpt','martyr','martela','pieta','abraham','moses','mozes',
'tobias','tobit','david','salomon','elias','profeet','prophet','samarit','prodigal')
PREFERRED=('rubens','van dyck','caravaggio','champaigne','guido reni','murillo',
'zurbaran','ribera','jordaens','tintoretto','tiepolo','carracci','poussin',
'la tour','strozzi','guercino','honthorst','tanner','lotto','bouguereau','saraceni')

def norm(s):
 t=unicodedata.normalize('NFKD',html.unescape(str(s or '')))
 return re.sub('[^a-z0-9]+',' ',''.join(c for c in t if not unicodedata.combining(c)).lower()).strip()
def clean(s):
 return re.sub(r'\s+',' ',re.sub(r'<[^>]*>',' ',html.unescape(str(s or '')))).strip()[:260]
def fetch(url,timeout,xml=False):
 if not url.startswith(('https://data.rijksmuseum.nl/','https://datahub.vlaamsekunstcollectie.be/')):
  raise ValueError('Non-allowlisted metadata endpoint')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/xml' if xml else 'application/json'})
 with urllib.request.urlopen(req,timeout=timeout) as resp:blob=resp.read(10000001)
 if len(blob)>10000000:raise ValueError('Metadata exceeds 10 MB bound')
 return ET.fromstring(blob) if xml else json.loads(blob)
def tag(n):return n.tag.split('}')[-1]
def vals(node,name,maxn=1):
 out=[]
 if node is None:return out
 for e in node.iter():
  if tag(e)==name and e.text and e.text.strip():
   v=clean(e.text)
   if v and v not in out:out.append(v)
   if len(out)>=maxn:break
 return out
def rijks_record(id,o):
 names=[clean(x.get('content')) for x in o.get('identified_by',[]) if x.get('type')=='Name' and x.get('content')]
 prod=o.get('produced_by') or {};artists=[]
 for part in [prod]+prod.get('part',[]):
  for a in part.get('carried_out_by',[]):
   artist=next((x.get('@value') for x in a.get('notation',[]) if x.get('@language') in ('nl','en') and x.get('@value')),None)
   artist=artist or a.get('_label') or a.get('label')
   if artist:artists.append(clean(artist))
 return {'provider':'rijks','museum':'Rijksmuseum','objectId':id.rsplit('/',1)[-1],
 'objectUrl':id,'title':names[0] if names else clean(o.get('_label') or o.get('label')),
 'artist':'; '.join(dict.fromkeys(artists)),'photographLicence':'UNVERIFIED',
 'sourceApi':'https://data.rijksmuseum.nl/docs/search'}
def kmska_record(rec):
 h=next((n for n in rec if tag(n)=='header'),None)
 m=next((n for n in rec if tag(n)=='metadata'),None)
 if m is None:return None
 oai=vals(h,'identifier');lid=vals(m,'recordID') or vals(m,'lidoRecID')
 identity=oai[0] if oai else (lid[0] if lid else '')
 url=KMSKA+'?'+urllib.parse.urlencode({'verb':'GetRecord','metadataPrefix':'oai_lido','identifier':identity}) if oai else KMSKA
 names=vals(m,'appellationValue');artists=vals(m,'displayActorInRole',4)
 return {'provider':'kmska','museum':'KMSKA / Flemish Art Collection','objectId':lid[0] if lid else identity,
 'objectUrl':url,'title':names[0] if names else '', 'artist':'; '.join(artists),
 'photographLicence':'UNVERIFIED','sourceApi':KMSKA}
def rank(o):
 t=norm(o['title']);a=norm(o['artist'])
 if not t or 'el greco' in a or 'fra angelico' in a:return 0
 n=sum(s in t for s in SUBJECTS)
 return (10+3*min(n,10)+(35 if any(p in a for p in PREFERRED) else 0)) if n else 0
def match(o,canon):
 t=norm(o['title']);a=norm(o['artist'])
 if not a or not t:return []
 result=[]
 for c in canon:
  ct=norm(c['title']);ca=norm(c['artist'])
  if not ct or not ca or ca in ('anonymous','unknown'):continue
  if not (a in ca or ca in a):continue
  sim=difflib.SequenceMatcher(None,t,ct).ratio()
  if sim>=.81:result.append({'artworkId':c['artwork_id'],'score':round(sim,3),'status':'POSSIBLE_NOT_PHYSICALLY_IDENTIFIED'})
 return sorted(result,key=lambda z:-z['score'])[:3]
def rijks(a,errors):
 ids=[];seen=set();log=[];out=[]
 for term in TERMS[:a.queries]:
  url=RIJKS+'?'+urllib.parse.urlencode({'type':'painting','imageAvailable':'true','title':term})
  try:
   o=fetch(url,a.timeout)
   vals_=[v['id'] for v in o.get('orderedItems',[]) if str(v.get('id','')).startswith('https://id.rijksmuseum.nl/')]
   log.append({'term':term,'firstPage':len(vals_),'totalReported':(o.get('partOf') or {}).get('totalItems'),'url':url})
   for id in vals_:
    if id not in seen:seen.add(id);ids.append(id)
  except Exception as exc:errors.append({'source':'rijks-query','term':term,'error':str(exc)[:160]})
  time.sleep(a.delay)
 for id in ids[:a.resolves]:
  try:
   o=rijks_record(id,fetch('https://data.rijksmuseum.nl/'+id.rsplit('/',1)[-1]+'?_profile=la-framed',a.timeout))
   s=rank(o)
   if s:o['editorialSignal']=s;out.append(o)
  except Exception as exc:errors.append({'source':'rijks-resolve','id':id,'error':str(exc)[:160]})
  time.sleep(a.delay)
 return out,{'queryAttempts':min(a.queries,len(TERMS)),'querySuccess':len(log),
             'uniqueFirstPageIdentifiers':len(ids),'resolvedAttempts':min(len(ids),a.resolves),
             'relevantLeads':len(out),'exhaustive':False,'queryLog':log}
def kmska(a,errors):
 out=[];n=0;pages=0;token=None;seen=set()
 while pages<a.kmska_pages:
  q={'verb':'ListRecords','resumptionToken':token} if token else {'verb':'ListRecords','metadataPrefix':'oai_lido'}
  try:root=fetch(KMSKA+'?'+urllib.parse.urlencode(q),a.timeout,xml=True)
  except Exception as exc:
   errors.append({'source':'kmska-oai','page':pages+1,'error':str(exc)[:160]});break
  records=[x for x in root.iter() if tag(x)=='record']
  if not records:
   errors.append({'source':'kmska-oai','page':pages+1,'error':'No records returned; inspect API schema'});break
  for rec in records:
   item=kmska_record(rec)
   if item is None:continue
   n+=1;key=item['objectId']
   if not key or key in seen:continue
   seen.add(key);s=rank(item)
   if s:item['editorialSignal']=s;out.append(item)
  pages+=1
  token=next((x.text.strip() for x in root.iter() if tag(x)=='resumptionToken' and x.text and x.text.strip()),None)
  if not token:break
  time.sleep(a.delay)
 return out,{'pagesScanned':pages,'metadataRecordsScanned':n,'relevantLeads':len(out),
             'exhaustive':bool(pages and not token),'stop':('page_limit' if token and pages>=a.kmska_pages else ('feed_end' if pages and not token else 'error'))}
def smoke():
 sample=rijks_record('https://id.rijksmuseum.nl/123',{'identified_by':[{'type':'Name','content':'The Crucifixion of Christ'}],
 'produced_by':{'part':[{'carried_out_by':[{'notation':[{'@language':'en','@value':'Peter Paul Rubens'}]}]}]}})
 assert sample['title']=='The Crucifixion of Christ' and rank(sample)>20
 assert rank({'title':'The Annunciation','artist':'El Greco'})==0
 sample_xml=ET.fromstring('<record><header><identifier>oai:test:123</identifier></header><metadata><lido><recordID>123</recordID><titleSet><appellationValue>Maria en Christus</appellationValue></titleSet></lido></metadata></record>')
 assert kmska_record(sample_xml)['title']=='Maria en Christus'
 assert match(sample,[{'artwork_id':'TEST','title':'The Crucifixion of Christ','artist':'Peter Paul Rubens'}])
 print('OFFLINE_SMOKE_PASS')
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--offline-smoke',action='store_true')
 p.add_argument('--queries',type=int,default=25);p.add_argument('--resolves',type=int,default=300)
 p.add_argument('--kmska-pages',type=int,default=80);p.add_argument('--timeout',type=int,default=18)
 p.add_argument('--delay',type=float,default=.25);a=p.parse_args()
 if a.offline_smoke:smoke();return
 canon=json.loads(SRC.read_text(encoding='utf-8'))['records']
 assert len(canon)==383 and len({c['artwork_id'] for c in canon})==383
 errors=[];r,rs=rijks(a,errors);k,ks=kmska(a,errors);items=r+k
 for x in items:
  x['possibleCanonicalMatches']=match(x,canon);x['photoSha256']=None
  x['photoLicenceVerified']=False;x['photoQualityPassed']=False
  x['editorialApproved']=False;x['productionPublished']=False
 items.sort(key=lambda x:(-x['editorialSignal'],x['provider'],x['objectId']))
 counts=Counter(x['provider'] for x in items)
 stats={'metadataLeads':len(items),'bySource':dict(counts),
        'possibleTitleArtistMatches':sum(bool(x['possibleCanonicalMatches']) for x in items),
        'unmatchedMetadataLeads':sum(not x['possibleCanonicalMatches'] for x in items),
        'verifiedPhotoLicences':0,'photoQualityPassed':0,'editorialApprovals':0,'productionReleases':0}
 result={'schema':'ao-sacred-art-museum-discovery-b1','date':'2026-10-29',
 'status':'METADATA_COLLECTED' if items else 'NO_LIVE_METADATA_COLLECTED',
 'baseline':{'artworks':383,'institutionalSourcePrograms':186},
 'metadataOnly':True,'downloadedImages':0,'exhaustive':False,
 'sourceStats':{'rijks':rs,'kmska':ks},
 'heldSources':{'parisMusees':'Free API token required',
 'belvedere':'CC0 Open Content confirmed, compliant bulk API not yet established',
 'artInFlanders':'Rights-filtered catalog bulk endpoint not yet established'},
 'stats':stats,'errors':errors[:100],'errorsOmitted':max(0,len(errors)-100),'leads':items}
 DST.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 lines=['# Sacred Art — first museum metadata discovery: Rijksmuseum and KMSKA','',
 '29 October 2026 · metadata only · €0 · 0 original photographs downloaded','',
 '- Status: **'+result['status']+'**; 383 canonical artwork approvals and licences unchanged.',
 '- Rijks queries: '+str(rs['querySuccess'])+'/'+str(rs['queryAttempts'])+' succeeded; '+str(rs['uniqueFirstPageIdentifiers'])+' first-page IDs; '+str(rs['resolvedAttempts'])+' detail attempts.',
 '- KMSKA pages: '+str(ks['pagesScanned'])+'; records scanned: '+str(ks['metadataRecordsScanned'])+'; '+ks['stop']+'.',
 '- Subject-filtered metadata leads: **'+str(len(items))+'** (Rijks '+str(counts['rijks'])+', KMSKA '+str(counts['kmska'])+').',
 '- Possible title/artist matches to existing 383: '+str(stats['possibleTitleArtistMatches'])+' (not identical physical works verified).',
 '- Source errors: '+str(len(errors))+'; check JSON.','',
 'These leads are not approved artworks, not verified photographs and not production-ready. Both scans are bounded.','',
 '## Highest-scoring potential leads (not approvals)','',
 '| Source | Title | Artist metadata | Possible existing artwork ID |','|---|---|---|---|']
 for x in items[:40]:
  row=[x['museum'],x['title'],x['artist'] or 'not supplied',
       ', '.join(m['artworkId'] for m in x['possibleCanonicalMatches']) or 'none flagged']
  lines.append('| '+' | '.join(clean(t).replace('|','/') for t in row)+' |')
 lines+=['','## No false rights or exhaustion claims','',
 '- The Rijks search samples first pages of the selected titles and caps detailed object lookups.',
 '- KMSKA follows official OAI-LIDO metadata pages, bounded by a page limit; source failures stay explicit.',
 '- Paris Musées requires a token; Belvedere and Art in Flanders bulk interfaces remain unvalidated.',
 '- 0 photo bytes, 0 verified hashes, 0 licence clearances, 0 quality passes, 0 production changes.',
 '- Sources: https://data.rijksmuseum.nl/docs/search and https://datahub.kmska.be/',
 '','Full metadata and source query logs are in '+str(DST.relative_to(BASE))+'.']
 MD.write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(json.dumps({'status':result['status'],'stats':stats,'sourceScans':{
 'rijks':{k:v for k,v in rs.items() if k!='queryLog'},'kmska':ks},'errors':len(errors)},indent=2))
if __name__=='__main__':main()
