#!/usr/bin/env python3
"""B12: next 250 new Commons public-domain Baroque sacred oil painting images.

Discover from NEW author/scene categories and relevant direct subcategories;
verify exact file PD/CC0 rights, full image size, title/artist quality, and
real thumbnail. Exclude 1,955 B1–B11 source cards and title/artist variants.
Never import production images or download originals. €0.
"""
from __future__ import annotations
import concurrent.futures,hashlib,html,importlib.util,json,re,time,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b12-commons-250-reviewed-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_B12_250_SOURCE_QA_20261029.md'
GALLERY=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B12_20261029.html'
B11='sacred-art-b11-final-250-merged-verified-20261029.v1.json'
spec=importlib.util.spec_from_file_location('ao_b11_research',ROOT/'scripts/art/sacred-art-b11-commons-250-review-20261029.py')
M=importlib.util.module_from_spec(spec);spec.loader.exec_module(M)
UA='AdOrientem-SacredArt-B12-ReuseSourceResearch/1.0'
ROOT_CATEGORIES=[
 'Baroque religious paintings',
 '17th-century religious paintings',
 'Religious paintings',
 'Religious paintings by artist',
 'Paintings of Jesus Christ',
 'Paintings of biblical scenes',
 'Paintings of Christian saints',
 'Religious paintings of the 17th century',
 'Baroque paintings of the Virgin Mary',
 'Paintings of religious subjects by artist',
 'Paintings of the Holy Family',
 'Paintings of the Passion of Christ',
 'Paintings of the Adoration of the Magi',
 'Paintings of the Adoration of the Shepherds',
 'Paintings of the Nativity of Jesus Christ',
 'Paintings of the Crucifixion of Jesus Christ',
 'Paintings of Saint Mary Magdalene',
 'Paintings of Saint John the Baptist',
]
DIRECT=[
 'Baroque paintings of the Flight into Egypt',
 'Baroque paintings of the Resurrection of Christ',
 'Baroque paintings of the Annunciation',
 'Baroque paintings of the Flagellation of Christ',
 'Baroque paintings of the Deposition of Christ',
 'Baroque paintings of the Lamentation of Christ',
 'Baroque paintings of the Virgin and Child',
 'Baroque paintings of the Holy Family',
 'Baroque paintings of saints',
 'Baroque paintings of biblical scenes',
 'Baroque paintings of the Baptism of Christ',
 'Baroque paintings of the Ascension',
 'Baroque paintings of David and Goliath',
 '17th-century paintings of the Holy Family',
 '17th-century paintings of the Crucifixion of Jesus Christ',
 '17th-century paintings of the Adoration of the Shepherds',
 '17th-century paintings of the Annunciation',
 '17th-century paintings of the Magi',
 '17th-century paintings of the Madonna and Child',
 '17th-century paintings of Saint John the Baptist',
 '17th-century paintings of the Massacre of the Innocents',
 'Paintings of Saint Joseph by artist',
 'Religious paintings by Peter Paul Rubens',
 'Religious paintings by Peter Paul Rubens in museums',
 'Religious paintings by Anthony van Dyck',
 'Religious paintings by Bartolomé Esteban Murillo',
 'Religious paintings by Nicolas Poussin',
 'Religious paintings by Rembrandt',
 'Religious paintings by Andrea del Sarto',
 'Religious paintings by Caravaggio',
 'Religious paintings by Artemisia Gentileschi',
 'Religious paintings by Giovanni Lanfranco',
 'Religious paintings by Simon Vouet',
 'Religious paintings by Sébastien Bourdon',
 'Religious paintings by Nicolas Régnier',
 'Religious paintings by Charles Le Brun',
 'Religious paintings by Orazio Gentileschi',
 'Religious paintings by Mattia Preti',
 'Religious paintings by Jusepe de Ribera',
 'Religious paintings by Bartolomeo Manfredi',
 'Religious paintings by José de Ribera',
 'Religious paintings by Daniele Crespi',
 'Religious paintings by Bernardo Cavallino',
 'Religious paintings by Francesco Trevisani',
 'Religious paintings by Bartolomeo Schedoni',
 'Religious paintings by Massimo Stanzione',
 'Religious paintings by Guido Reni',
 'Religious paintings by Guercino',
 'Religious paintings by Domenichino',
 'Religious paintings by Annibale Carracci',
 'Religious paintings by Ludovico Carracci',
 'Religious paintings by Correggio',
 'Religious paintings by Federico Barocci',
 'Religious paintings by Luca Giordano',
 'Religious paintings by Alessandro Turchi',
 'Religious paintings by Francesco Solimena',
 'Religious paintings by Guido Cagnacci',
 'Religious paintings by Francisco de Zurbarán',
 'Religious paintings by Francisco Pacheco',
 'Religious paintings by Diego Velázquez',
 'Religious paintings by Alonso Cano',
 'Religious paintings by Juan de Valdés Leal',
 'Religious paintings by Alonso Sánchez Coello',
 'Religious paintings by Francesco Furini',
 'Religious paintings by Carlo Dolci',
 'Religious paintings by Ciro Ferri',
 'Religious paintings by Giovanni Battista Tiepolo',
 'Religious paintings by Giovanni Domenico Tiepolo',
 'Religious paintings by Sebastiano Ricci',
 'Religious paintings by Giovanni Battista Piazzetta',
 'Religious paintings by Gerard van Honthorst',
 'Religious paintings by Matthias Stom',
 'Religious paintings by Hendrick ter Brugghen',
 'Religious paintings by Gerrit van Honthorst',
 'Religious paintings by Jacob Jordaens',
 'Religious paintings by Pieter Lastman',
 'Religious paintings by Aert de Gelder',
 'Religious paintings by Benjamin Gerritsz. Cuyp',
 'Religious paintings by Jan Lievens',
 'Religious paintings by Ferdinand Bol',
 'Religious paintings by Peter Paul Rubens in the 17th century',
 'Religious paintings by Theodoor van Loon',
 'Religious paintings by Frans Francken the Younger',
 'Religious paintings by David Teniers the Younger',
 'Religious paintings by Simon de Vos',
 'Religious paintings by Anthony van Dyck in the 17th century',
 'Religious paintings by Pierre Subleyras',
 'Religious paintings by Georges de La Tour',
 'Religious paintings by Philippe de Champaigne',
 'Religious paintings by Charles Poërson',
 'Religious paintings by Jean Jouvenet',
 'Religious paintings by Laurent de La Hyre',
 'Religious paintings by Eustache Le Sueur',
 'Religious paintings by Jean-Baptiste de Champaigne',
 'Religious paintings by Michael Willmann',
 'Religious paintings by Adam Elsheimer',
 'Religious paintings by Johann Carl Loth',
 'Religious paintings by Johann Liss',
 'Religious paintings by Bernardo Strozzi',
 'Religious paintings by Giovanni Francesco Barbieri',
 'Religious paintings by Pietro da Cortona',
 'Religious paintings by Orazio Borgianni',
 'Paintings of saints by Jusepe de Ribera',
 'Paintings of saints by Bartolomé Esteban Murillo',
 'Paintings of saints by Francisco de Zurbarán',
 'Paintings of saints by Guido Reni',
 'Paintings of saints by Guercino',
 'Paintings of saints by Luca Giordano',
 'Paintings of saints by Peter Paul Rubens',
 'Paintings of saints by Anthony van Dyck',
 'Paintings of saints by Andrea Sacchi',
 'Paintings of saints by Giovanni Lanfranco',
 'Paintings of saints by Paolo Veronese',
 'Paintings of saints by Titian',
 'Paintings of saints by Tintoretto',
 'Paintings of saints by Palma il Giovane',
 'Paintings of saints by Jusepe de Ribera in museums',
 'Paintings of Jesus Christ by Titian',
 'Paintings of Jesus Christ by Veronese',
 'Paintings of Jesus Christ by Tintoretto',
 'Paintings of Jesus Christ by Rubens',
 'Paintings of Jesus Christ by Guido Reni',
 'Paintings of Jesus Christ by Anthony van Dyck',
 'Paintings of Jesus Christ by Jusepe de Ribera',
 'Paintings of Jesus Christ by Nicolas Poussin',
 'Paintings of Jesus Christ by Caravaggio',
 'Paintings of Jesus Christ by Paolo Veronese',
 'Paintings of Jesus Christ by Rembrandt',
 'Paintings of Jesus Christ by Guercino',
 'Paintings of the life of Jesus by Peter Paul Rubens',
 'Paintings of the life of Jesus by Bartolomé Esteban Murillo',
 'Paintings of Saint Peter by Guido Reni',
 'Paintings of Saint Sebastian by Guido Reni',
 'Paintings of Saint Mary Magdalene by Guido Reni',
 'Paintings of Saint Mary Magdalene by Bartolomé Esteban Murillo',
 'Paintings of Saint Mary Magdalene by Jusepe de Ribera',
 'Paintings of Saint Peter by Jusepe de Ribera',
 'Paintings of Saint Jerome by Jusepe de Ribera',
 'Paintings of Saint John the Baptist by Guido Reni',
 'Paintings of Saint Francis of Assisi by Bartolomé Esteban Murillo',
 'Paintings of Saint Francis of Assisi by Francisco de Zurbarán',
 'Paintings of Saint Teresa of Ávila by Peter Paul Rubens',
 'Paintings of biblical scenes by Peter Paul Rubens',
 'Paintings of biblical scenes by Guido Reni',
 'Paintings of biblical scenes by Rembrandt',
 'Paintings of biblical scenes by Guercino',
 'Paintings of biblical scenes by Nicolas Poussin',
]
# Exclude B11 categories only if exact same subject collection; a new photo
# of a B11 artwork is blocked by work+artist identity instead.
BAD_PHOTO=re.compile(r'(?:\bdetail\b|\bclose[\s-]?up\b|\bcropped\b|\bcrop\b|\bframed\b|\bframe\b|\bin rahmen\b|\bdescriptive photo\b|\binterior of church\b|\bchurch interior\b|\balterpiece interior\b|\bvolta\b|\bstudy of\b|\bpreparatory\b|\bdrawing\b|\bsketch\b|\bphotograph of\b|\bpostcard\b|\btapestry\b|\bmosaic\b|\bmanuscript\b|\bengraving\b|\betching\b|\bportrait photo\b|\bhajj\b|\bkhalili\b|\bkrishna\b|\bbuddha\b|\bsaint bernard dog\b|\bsailko\b|\bpinotto\b|\bdaderot\b|\bdsc\d{3,}\b)',re.I)
BAD_ARTISTS=('el greco','fra angelico','prado','sailko','pinotto','khalili collection','wmpearl','own work','daderot')
SACRED_PATTERNS=tuple(re.compile(p,re.I) for p in [
 r'\bchrist\b',r'\bchristus\b',r'\bjesus\b',r'\bvirgin\b',r'\bmadonna\b',r'\bholy family\b',
 r'\bsaint\b',r'\bsaints\b',r'\bst[. ]\b',r'\bheilige\b',r'\bmaria\b',r'\bmagdalen\b',
 r'\bcrucifix\b',r'\bpassion\b',r'\badoration\b',r'\bannunciation\b',r'\bnativity\b',
 r'\bresurrection\b',r'\bascension\b',r'\bassumption\b',r'\bpiet[aà]\b',
 r'\blamentation\b',r'\bdeposition\b',r'\becce homo\b',r'\blord\b',
 r'\bapostle\b',r'\bdisciples\b',r'\bbaptism\b',r'\bpeter\b',r'\bpaul\b',
 r'\bsebastian\b',r'\bjerome\b',r'\bfrancis\b',r'\bjo[hs]n\b',
 r'\bjacob\b',r'\bisaac\b',r'\babraham\b',r'\bmoses\b',r'\bdavid\b',
 r'\bjudith\b',r'\bsamson\b',r'\bdelilah\b',r'\bsalom[eé]\b',r'\bblessed\b',
 r'\btrinity\b',r'\bcoronation\b',r'\bvisitation\b',r'\bparadise\b',r'\bsamaritan\b',
 r'\bprodigal\b',r'\bsusanna\b',r'\btobit\b',r'\btobias\b',r'\bnoah\b',
 r'\barchangel\b',r'\bmartyr\b',r'\bchrist-child\b',r'\binfant jesus\b',
 r'\bjoachim\b',r'\bcatherine\b',r'\bcecilia\b',r'\btheresa\b',r'\bteresa\b',
 r'\bch[aâ]timent\b',r'\bv[ié]rgen\b',r'\bsaints?\b',r'\bkreuzigung\b',
 r'\bheiligen\b',r'\bveronica\b',r'\blazarus\b',
])
def norm(s):return M.norm(s)
def prior():
 ids,works,breakdown=M.previous()
 b11=json.loads((D/B11).read_text())
 assert b11['batchReady'] and len(b11['rows'])==250
 assert not {x['id'] for x in b11['rows']}&ids
 for r in b11['rows']:
  ids.add(r['id']);works.add(M.workkey(r.get('title'),r.get('artist')))
 assert len(ids)>=1955
 canon=json.loads((D/'sacred-art-curator-queues-383-20261029.v1.json').read_text())
 for x in canon['main_records']:
  if x.get('title') and x.get('artist'):
   works.add(M.workkey(x['title'],x['artist']))
 return ids,works,breakdown
def priority_cat(c):
 lo=c.lower()
 return (0 if any(x in lo for x in ('baroque','religious paintings by','christ by','saints by')) else 1,
  0 if any(x in lo for x in ('rubens','van dyck','reni','guercino','carracci','murillo',
    'champaigne','ribera','zurbar','poussin','caravaggio','strozzi','jordaens','lanfranco')) else 1,
  0 if '17th-century' in lo else 1,lo)
def discover_subcats(root):
 try:
  q=M.api({'action':'query','list':'categorymembers','cmtitle':'Category:'+root,
   'cmtype':'subcat','cmlimit':500})
  out=[x['title'][9:] for x in (q.get('query') or {}).get('categorymembers',[])
   if x.get('title','').startswith('Category:')]
 except Exception as exc:
  return [],str(exc)[:150]
 accept=[]
 for c in out:
  lo=c.lower()
  if any(z in lo for z in ('by century','by year','by country','by city','by location',
    'in churches','orthodox icons','greek icons','buddhist','hindu','religious artifacts',
    'illuminated manuscripts','religious objects','paintings of buddha','dante',
    'folk art','aztec','sikh','shiva','jain','islamic','heraldry','polyptych details')):
   continue
  if ('painting' in lo or 'saint' in lo or 'jesus' in lo or 'christ' in lo or
    'baroque' in lo or 'biblical' in lo or 'virgin' in lo or 'rubens' in lo):
   accept.append(c)
 return accept,None
def photo_qualifies(x):
 raw=' '.join(str(x.get(k) or '') for k in ('title','fileTitle','artist','sourceCredit','sourceOriginal'))
 lo=raw.lower()
 if BAD_PHOTO.search(raw):return False
 if any(z in lo for z in BAD_ARTISTS):return False
 if len(str(x['title']))<8 or len(str(x['title']))>155:return False
 if not any(p.search(x['title']+' '+x['fileTitle']) for p in SACRED_PATTERNS):return False
 if re.search(r'\b(?:photograph|photo by|photo of|statue|sculpture|drawing|fresco|mural|panel detail|cartoon|a woman weeping|costume|portrait of a (?:man|woman)|church exterior)\b',x['title'],re.I):return False
 native=x['nativeSourceDimensions']
 if min(native['height'],native['width'])<1600:return False
 return True
def check_slow(x):
 # Wikimedia limits are enforced; do not route through other services or
 # retry at unsafe rates. A distinct 429 is a failed verification.
 time.sleep(1.05)
 return M.validate_preview(x)
def gallery(rows,digest):
 s=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B11_FINAL_20261029.html').read_text()
 payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 s,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
  lambda m:m.group(1)+payload+m.group(2),s,count=1,flags=re.S)
 assert n==1
 s,n=re.subn(r'const batchHash="[0-9a-f]+";',
  lambda m:'const batchHash="'+digest+'";',s,count=1)
 assert n==1
 s=re.sub(r'<title>.*?</title>',f'<title>Ad Orientem | Sacred Art Batch 12 ({len(rows)})</title>',
  s,count=1,flags=re.S)
 s=s.replace('Sacred Art · Batch 11 · 250 public-domain paintings',
   'Sacred Art · Batch 12 · Old Master Paintings')
 s=s.replace("batchId:'B11'","batchId:'B12'")
 s=s.replace('ao-sacred-art-b11-commons-import-','ao-sacred-art-b12-commons-import-')
 s=s.replace('ad-orientem-sacred-art-b11-commons-','ad-orientem-sacred-art-b12-commons-')
 assert "batchId:'B12'" in s and 'const PAGE_SIZE=50;' in s
 GALLERY.write_text(s,encoding='utf8')
def main():
 ids,works,breakdown=prior()
 categories=set(DIRECT)
 subcat_stats={}
 for root in ROOT_CATEGORIES:
  subs,err=discover_subcats(root)
  subcat_stats[root]={'found':len(subs),'error':err}
  categories.update(subs)
 cats=sorted(categories,key=priority_cat)
 # Bound largest nested source categories; ensure 120+ possible sources.
 cats=cats[:220]
 print('B12_CATEGORY_PLAN',json.dumps({'total':len(cats),'roots':subcat_stats}),flush=True)
 pool=[];catevidence={}
 for i,c in enumerate(cats):
  arr,stat=M.image_cards(c,maxPages=3)
  catevidence[c]=stat
  for item in arr:
   if photo_qualifies(item):pool.append(item)
  if i%20==0:
   print('B12_DISCOVERY',json.dumps({'category':i+1,'name':c,'qualifiedRaw':len(pool)}),flush=True)
 # Exact source IDs, prior title+artist, and within-batch identity.
 distinct=[];seenids=set();seenwork=set();reasons=Counter()
 for x in sorted(pool,key=M.score):
  if x['id'] in ids:
   reasons['prior_source_id']+=1;continue
  wk=M.workkey(x['title'],x['artist'])
  if wk in works:
   reasons['prior_work_artist']+=1;continue
  if x['id'] in seenids:
   reasons['within_batch_source_photo']+=1;continue
  if wk in seenwork:
   reasons['within_batch_work_artist']+=1;continue
  seenids.add(x['id']);seenwork.add(wk);distinct.append(x)
 print('B12_DISTINCT',json.dumps({'raw':len(pool),'uniqueEligible':len(distinct),'excluded':dict(reasons)}),flush=True)
 # Single-worker request pacing. Preserve any 429 as a failure; stop if
 # limit begins repeated so no abusive traffic.
 verified=[];errors=[];checks=0;limited=0
 for item in distinct:
  if len(verified)==250:break
  if checks>=650:break
  ok,why=check_slow(item);checks+=1
  if not ok:
   errors.append({'id':item['id'],'error':why})
   if '429' in why:
    limited+=1
    if limited>=3:
     print('B12_429_CIRCUIT_BREAKER',json.dumps({'checked':checks,'verified':len(verified)}),flush=True)
     break
  else:verified.append(item)
  if checks%30==0:
   print('B12_PREVIEW_CHECK',json.dumps({'checked':checks,'verified':len(verified),
     'failures':len(errors)}),flush=True)
 digest=hashlib.sha256(json.dumps([x['id'] for x in verified],separators=(',',':')).encode()).hexdigest()
 if verified:gallery(verified,digest)
 count={'target':250,'reviewable':len(verified),'totalCategoriesScanned':len(cats),
  'sourceImageCandidates':len(pool),'newDistinctWorksQualified':len(distinct),
  'previousReviewCardsExcluded':1955,'reviewedPastBatchesThrough':'B11',
  'previewHTTPRequests':checks,'previewFailures':len(errors),'rateLimit429':limited,
  'originalImageDownloads':0,'productionImports':0}
 report={'schema':'AO_SACRED_ART_B12_SOURCE_VERIFIED_REVIEW_V1','batchId':'B12',
  'date':'2026-10-29','completeBatchReady':len(verified)==250,
  'batchHash':digest,'counts':count,'sourceCatalogRoots':subcat_stats,
  'excluded':dict(reasons),'catalogueCategories':catevidence,
  'errors':errors,'rows':verified,
  'qualityLimit':'Image rights, file dimensions, image bytes and automated sacred subject gating are verified. Artwork attribution, reproduction aesthetic, frames and true-color still require human editorial inspection.'}
 OUT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 REPORT.write_text('# Sacred Art Batch 12 — new Old Master sacred painting images\n\n'
  f"**{len(verified)}** verified public-domain/CC0 preview images from {len(cats)} categories, "
  f"after {len(pool)} metadata-qualified leads and {len(distinct)} unique new work candidates.\n\n"
  f"Previously shown 1,955 B1–B11 artwork source cards excluded, with additional work/artist keys. "
  f"Original image downloads 0, production imports 0, no paid storage.\n\n"
  f"Thumbnail HTTP checks {checks}, failures {len(errors)}, rate-limited {limited}. "
  "Exact source file Public Domain/CC0 and ≥1,600 pixel short side were checked. "
  "Visual quality, artwork classification, attribution, absence of physical frame and best original are NOT certified.\n\n"
  f"SHA256 source ID identity {digest}.\n",encoding='utf8')
 print('B12_FINAL',json.dumps({'counts':count,'excluded':dict(reasons),'first':
  [(x['title'],x['artist'],x['sourceCategory']) for x in verified[:15]]},ensure_ascii=False)[:6500],flush=True)
if __name__=='__main__':main()
