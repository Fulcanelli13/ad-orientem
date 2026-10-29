#!/usr/bin/env python3
"""B10: one bulk Rijksmuseum sacred oil painting source discovery pass.

Search official 2026 image-bearing painting API with English/Dutch religious
iconographic terms. No artwork images downloaded, zero production changes.
"""
import json,re,time,urllib.parse,urllib.request,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b10-rijks-bulk-discovery-20261029.v1.json'
BASE='https://data.rijksmuseum.nl/search/collection'
TERMS=[
 'Christ','Christus','Jesus','Jezus','Maria','Mary','Madonna','Madonna and Child',
 'Holy Family','Heilige Familie','Maagd','Virgin','saint','heilige','heilige familie',
 'Sint','Saint','apostle','apostel','evangelist','evangelist Johannes',
 'Peter','Petrus','Paulus','Paul','Joannes','Johannes','St.','Magdalena',
 'Maria Magdalena','Magdalene','Joachim','Joseph','Jozef','Josef',
 'John the Baptist','Johannes de Doper','Johannes de evangelist',
 'Baptism','doop','kruisiging','kruis','crucifixion','crucified',
 'Passion','lijden','opstanding','verrijzenis','resurrection',
 'Deposition','kruisafneming','entombment','graflegging',
 'Adoration','aanbidding','Magi','driekoningen','wijzen',
 'nativity','geboorte','herders','annunciation','aankondiging','boodschap',
 'visitation','visitatie','hemelvaart','ascension','heilige geest',
 'Pentecost','pinksteren','Christus op de koude steen','ecce homo',
 'besnijdenis','circumcision','Adam en Eva','Adam','Eve','Eva',
 'Abraham','Isaac','Izaäk','Moses','Mozes','David','Saul',
 'Salomo','Solomon','Judith','Susanna','Tobias','Tobit',
 'Joseph in Egypt','Jozef in Egypte','Daniel','Daniël','Elia',
 'Elijah','Noah','Noach','Samson','Simson','Jonah','Jona',
 'Ruth','Esther','Job','Apocalypse','laatste oordeel','Last Judgment',
 'Saint Sebastian','Sebastiaan','Saint Jerome','Hieronymus',
 'Saint Francis','Franciscus','Benedictus','Catharina','Catherine',
 'Agnes','Ursula','Theresa','Teresa','Antonius','Nicolaas',
 'heilige Antonius','Heilige Maagd','Kerkvaders','heilige drie-eenheid',
 'Veronica','Rosary','Rozenkrans','Sacrifice','offer','Gethsemane',
 'Pilate','Pilatus','Salome','Salomé','martyr','martelaar',
 'altar piece','altaarstuk','altarpiece','wederkomst','paradijs',
 'ten geboden','bijbel','biblical'
]
UA='AdOrientem-SacredArt-B10-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
def get(url):
 u=urllib.parse.urlparse(url)
 if u.hostname!='data.rijksmuseum.nl' or u.scheme!='https' or not u.path.startswith('/search/collection'):
  raise ValueError('untrusted collection search URL')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
 for attempt in range(3):
  try:
   with urllib.request.urlopen(req,timeout=30) as r:
    raw=r.read(1800000)
   return json.loads(raw)
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
   if attempt==2:raise
   time.sleep(1.2*(attempt+1))
def main():
 ids=[];seen=set();terms={};errors=[];count=0
 for ix,term in enumerate(TERMS):
  url=BASE+'?'+urllib.parse.urlencode({'description':term,'type':'painting',
     'imageAvailable':'true','material':'oil paint'})
  total=0;page=0;added=0
  for p in range(6):
   try: j=get(url)
   except Exception as e:
    errors.append({'term':term,'page':page,'error':type(e).__name__+': '+str(e)[:160]});break
   page+=1;count+=1
   total=int((j.get('partOf') or {}).get('totalItems') or 0)
   for x in j.get('orderedItems',[]):
    v=x.get('id','')
    m=re.fullmatch(r'https://id\.rijksmuseum\.nl/(\d+)',v)
    if not m:continue
    sid='rijks:'+m.group(1)
    if sid not in seen:seen.add(sid);ids.append(sid);added+=1
   nxt=(j.get('next') or {}).get('id')
   if not nxt:break
   url=nxt;time.sleep(.06)
  terms[term]={'total':total,'pages':page,'newIDs':added}
  if ix%25==0:
   print('RIJKS_DISCOVERY_PROGRESS',json.dumps({'term':ix+1,'uniqueIDs':len(ids),'pages':count}),flush=True)
 out={'schema':'AO_SACRED_ART_RIJKS_B10_BULK_DISCOVERY_V1','date':'2026-10-29',
  'count':{'searchTerms':len(TERMS),'successfulTerms':len(terms),'pages':count,
   'uniqueSourceIds':len(ids),'searchErrors':len(errors),'photosSaved':0},
  'terms':terms,'errors':errors,'ids':ids}
 OUT.write_text(json.dumps(out,indent=2,ensure_ascii=False)+'\n')
 print('RIJKS_B10_DISCOVERY',json.dumps(out['count']),flush=True)
if __name__=='__main__':main()
