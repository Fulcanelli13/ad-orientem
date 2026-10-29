#!/usr/bin/env python3
"""B13: French-museum-first source-grade public-domain sacred oil-painting gallery.

Uses Wikimedia Commons exact file Public Domain or CC0 evidence and physically
linked French museums (Louvre, Petit Palais, Lille, Musée Fabre, Lyon, etc.).
The Paris Musées authenticated API isn't accessed or scraped. Museum linkage
is category provenance rather than institution-issued asset authorization.
Every thumbnail must pass image bytes; gallery depends on 250 unique sources.
No prod imports, no paid APIs, no original photo downloads.
"""
import collections,hashlib,html,importlib.util,json,re,time,urllib.error,urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUTPUT=D/'sacred-art-b13-french-museums-250-20261029.v1.json'
QA=ROOT/'docs/SACRED_ART_B13_FRENCH_MUSEUMS_250_SOURCE_QA_20261029.md'
GALLERY=ROOT/'docs/SACRED_ART_B13_FRENCH_MUSEUMS_250_IMPORT_REVIEW_20261029.html'
spec=importlib.util.spec_from_file_location('b12',ROOT/'scripts/art/sacred-art-b12-commons-250-review-20261029.py')
B=importlib.util.module_from_spec(spec);spec.loader.exec_module(B)
M=B.M
FRENCH_MUSEUMS=[
 ('Louvre, Paris',['Religious paintings in the Louvre','Baroque religious paintings in the Louvre','Paintings of Jesus Christ in the Louvre','Paintings of Christian saints in the Louvre']),
 ('Palais des Beaux-Arts de Lille',['Religious paintings in the Palais des Beaux-Arts de Lille','Paintings of Madonna and Child in the Palais des Beaux-Arts de Lille','Paintings by Rubens in the Palais des beaux-arts de Lille']),
 ('Musée Fabre, Montpellier',['Religious paintings in the Musée Fabre','Old Testament paintings in the Musée Fabre','Paintings of Madonna and Child in the Musée Fabre']),
 ('Petit Palais, Paris',['Religious paintings in the Petit Palais','Religious paintings in the Petit Palais, Paris','Paintings in the Petit Palais','Paintings in the Petit Palais (Paris)']),
 ('Musée des Beaux-Arts de Lyon',['Religious paintings in the Musée des Beaux-Arts de Lyon','Paintings in the Musée des Beaux-Arts de Lyon']),
 ('Musée des Beaux-Arts de Rouen',['Religious paintings in the Musée des Beaux-Arts de Rouen','Paintings in the Musée des Beaux-Arts de Rouen']),
 ('Musée des Beaux-Arts de Dijon',['Religious paintings in the Musée des Beaux-Arts de Dijon','Paintings in the Musée des Beaux-Arts de Dijon']),
 ('Musée des Beaux-Arts de Bordeaux',['Religious paintings in the Musée des Beaux-Arts de Bordeaux','Paintings in the Musée des Beaux-Arts de Bordeaux']),
 ('Musée des Beaux-Arts de Nantes',['Religious paintings in the Musée des Beaux-Arts de Nantes','Paintings in the Musée des Beaux-Arts de Nantes','Religious paintings in Musée d’arts de Nantes']),
 ('Musée des Beaux-Arts de Rennes',['Religious paintings in the Musée des Beaux-Arts de Rennes','Paintings in the Musée des Beaux-Arts de Rennes']),
 ('Musée des Beaux-Arts de Caen',['Religious paintings in the Musée des Beaux-Arts de Caen','Paintings in the Musée des Beaux-Arts de Caen']),
 ('Musée des Beaux-Arts de Nancy',['Religious paintings in the Musée des Beaux-Arts de Nancy','Paintings in the Musée des Beaux-Arts de Nancy']),
 ('Musée des Beaux-Arts de Tours',['Religious paintings in the Musée des Beaux-Arts de Tours','Paintings in the Musée des Beaux-Arts de Tours']),
 ('Musée des Beaux-Arts de Valenciennes',['Religious paintings in the Musée des Beaux-Arts de Valenciennes','Paintings in the Musée des Beaux-Arts de Valenciennes']),
 ('Musée des Beaux-Arts de Reims',['Religious paintings in the Musée des Beaux-Arts de Reims','Paintings in the Musée des Beaux-Arts de Reims']),
 ('Musée des Beaux-Arts d’Orléans',['Religious paintings in the Musée des Beaux-Arts d’Orléans','Paintings in the Musée des Beaux-Arts d’Orléans']),
 ('Musée des Beaux-Arts de Strasbourg',['Religious paintings in the Musée des Beaux-Arts de Strasbourg','Paintings in the Musée des Beaux-Arts de Strasbourg']),
 ('Musée de Grenoble',['Religious paintings in the Musée de Grenoble','Paintings in the Musée de Grenoble']),
 ('Musée de Picardie, Amiens',['Religious paintings in the Musée de Picardie','Paintings in the Musée de Picardie']),
 ('Musée des Augustins, Toulouse',['Religious paintings in the Musée des Augustins','Paintings in the Musée des Augustins']),
 ('Musée des Beaux-Arts de Marseille',['Religious paintings in the Musée des Beaux-Arts de Marseille','Paintings in the Musée des Beaux-Arts de Marseille']),
 ('Musée des Beaux-Arts de Besançon',['Religious paintings in the Musée des Beaux-Arts de Besançon','Paintings in the Musée des Beaux-Arts de Besançon']),
 ('Musée de l’Hospice Saint-Roch, Issoudun',['Religious paintings in the Musée de l’Hospice Saint-Roch']),
 ('Musée du Château de Fontainebleau',['Religious paintings in the Palace of Fontainebleau','Religious paintings in the Musée du château de Fontainebleau']),
]
# New complementary sacred themes from museum-specific categories and painter
# religious portfolios. Not one generic 250-image Commons keyword search.
FALLBACK=[
 'Religious paintings by Valentin de Boulogne',
 'Religious paintings by Philippe de Champaigne',
 'Religious paintings by Jean Jouvenet',
 'Religious paintings by Laurent de La Hyre',
 'Religious paintings by Pierre Puget',
 'Religious paintings by Nicolas Régnier',
 'Religious paintings by Eustache Le Sueur',
 'Religious paintings by Pierre Subleyras',
 'Religious paintings by Sébastien Bourdon',
 'Religious paintings by Pierre Mignard',
 'Religious paintings by François Lemoyne',
 'Religious paintings by Jean-Baptiste Jouvenet',
 'Religious paintings by Charles de La Fosse',
 'Religious paintings by François Boucher',
 'Religious paintings by Joseph-Marie Vien',
 'Religious paintings by Antoine Coypel',
 'Religious paintings by Noël Coypel',
 'Religious paintings by Charles Le Brun',
 'Religious paintings by Simon Vouet',
 'Religious paintings by Jacques Blanchard',
 'Religious paintings by Georges de La Tour',
 'Religious paintings by Jacques Stella',
 'Religious paintings by Nicolas Poussin',
 'Religious paintings by Claude Vignon',
 'Religious paintings by Jean François de Troy',
 'Religious paintings by Jean Restout',
 'Religious paintings by Louis Gauffier',
 'Religious paintings by Jean-Baptiste-Marie Pierre',
 'Religious paintings by Jacques-Louis David',
 'Religious paintings by Marie-Guillemine Benoist',
 'Religious paintings by Charles-Antoine Coypel',
 'Religious paintings by Jacques Réattu',
 'Religious paintings by Pierre-Paul Prud’hon',
 'Religious paintings by Jean-Baptiste Deshays',
 'Religious paintings by Guillaume Guillon-Lethière',
 'Religious paintings by Antoine-Jean Gros',
 'Religious paintings by Eugène Delacroix',
 'Religious paintings by Henry Ossawa Tanner',
 'Religious paintings by Andrea del Sarto',
 'Religious paintings by Giambattista Pittoni',
 'Religious paintings by Carlo Maratta',
 'Religious paintings by Carlo Dolci',
 'Religious paintings by Francesco Solimena',
 'Religious paintings by Felice Ficherelli',
 'Religious paintings by Andrea Sacchi',
 'Religious paintings by Carlo Saraceni',
 'Religious paintings by Giovanni Francesco Romanelli',
 'Religious paintings by Francesco Trevisani',
 'Religious paintings by Ciro Ferri',
 'Religious paintings by Johann Carl Loth',
 'Religious paintings by Adam Elsheimer',
 'Religious paintings by Jan Lievens',
 'Religious paintings by Dirck van Baburen',
 'Religious paintings by Francesco Furini',
 'Religious paintings by Massimo Stanzione',
 'Religious paintings by Pietro da Cortona',
 'Religious paintings by Giovanni Battista Gaulli',
 'Religious paintings by Giovanni Battista Tiepolo',
 'Religious paintings by Luca Giordano',
 'Religious paintings by Luigi Crespi',
 'Religious paintings by Bernardo Cavallino',
 'Religious paintings by Bartolomeo Schedoni',
 'Religious paintings by Francesco Albani',
 'Religious paintings by Giovanni Benedetto Castiglione',
 'Religious paintings by Carlo Francesco Nuvolone',
 'Religious paintings by Guido Cagnacci',
 'Religious paintings by Giuseppe Maria Crespi',
 'Religious paintings by Alessandro Turchi',
 'Religious paintings by Orazio Gentileschi',
 'Religious paintings by Simon de Vos',
 'Religious paintings by Erasmus Quellinus (II)',
 'Religious paintings by Frans Francken the Younger',
 'Religious paintings by Bonifacio Veronese',
 'Religious paintings by Sebastiano Ricci',
 'Religious paintings by Giovanni Battista Piazzetta',
 'Religious paintings by Francesco Guardi',
 'Religious paintings by Abraham Bloemaert',
 'Religious paintings by Aert de Gelder',
 'Religious paintings by Gerbrand van den Eeckhout',
 'Religious paintings by Johann Liss',
 'Religious paintings by Alonso Cano',
 'Religious paintings by Antonio de Pereda',
 'Religious paintings by Francisco de Zurbarán',
 'Religious paintings by Jusepe de Ribera',
 'Religious paintings by Bartolomé Esteban Murillo',
 'Religious paintings by Juan de Valdés Leal',
 'Religious paintings by Hendrick ter Brugghen',
 'Religious paintings by Matthias Stom',
 'Religious paintings by Gerard van Honthorst',
 'Religious paintings by Jacob Jordaens',
 'Religious paintings by Peter Paul Rubens',
 'Religious paintings by Anthony van Dyck',
 'Religious paintings by Artemisia Gentileschi',
 'Religious paintings by Guido Reni',
 'Religious paintings by Guercino',
 'Religious paintings by Annibale Carracci',
 'Religious paintings by Ludovico Carracci',
 'Religious paintings by Domenichino',
 'Religious paintings by Giovanni Lanfranco',
 'Religious paintings by Matteo Rosselli',
 'Religious paintings by Denys Calvaert',
 'Religious paintings by Daniele Crespi',
 'Religious paintings by Orazio Borgianni',
 'Religious paintings by Bernardo Strozzi',
 'Religious paintings by Giuseppe Cesari',
 'Religious paintings by Jacopo Ligozzi',
 'Religious paintings by Bartholomeus Spranger',
 'Religious paintings by Peter Lastman',
 'Religious paintings by Willem Drost',
 'Religious paintings by Ferdinand Bol',
 'Religious paintings by Jan Victors',
 'Religious paintings by Giovanni Francesco Barbieri',
]
FRENCH_FOCUS=('louvre','petit palais','musée fabre','palais des beaux-arts de lille',
 'musée des beaux-arts','musée de grenoble','musée de picardie','musée des augustins')
BAD_PHOTO=re.compile(r'(?:\bdetail\b|\bextrait\b|\bclose[\s-]?up\b|\bzoom\b|\bcropped\b|\bcrop\b|\bframed\b|\bframe\b|\bin rahmen\b|\bphoto by\b|\bphoto of\b|\bchurch interior\b|\bcathedral interior\b|\bmuseum interior\b|\bphotograph\b|\bstatue\b|\bsculpture\b|\btapestry\b|\bmosaic\b|\bmanuscript\b|\bengraving\b|\betching\b|\bsketch\b|\bdrawing\b|\bfresco\b|\bwatercolor\b|\blithograph\b|\bpostcard\b|\bpeinturesmusée\b|\bpeinturesmusee\b|\bexpo\.\b|\binstallation\b|\bstudy for\b|\bstudio of\b|\bbozzetto\b|\bmaquette\b|\bphoto du\b|\bphotographie\b|\bdescriptive photo\b|\bkrishna\b|\bbuddha\b|\bprado\b|\bel greco\b|\bfra angelico\b|\bsailko\b|\bdaderot\b|\bpinotto\b|\bdsc\d{3,}\b)',re.I)
BAD_SUBJECT=re.compile(r'(?:\bportrait of a (?:man|woman)\b|\bview of\b|\bchurch of\b|\bcathedral\b|\bpeinture d.ecole\b|\blandscape near\b|\bstill life\b|\bmarine\b|\bparis street\b|\bcastle\b|\bmonument\b|\bhindu\b|\bbuddhist\b|\borthodox icon\b)',re.I)
def old():
 ids,works,_=B.prior()
 b12=json.loads((D/'sacred-art-b12-final-250-quality-corrected-20261029.v2.json').read_text())
 assert b12['batchReady'] and len(b12['rows'])==250
 for r in b12['rows']:
  assert r['id'] not in ids
  ids.add(r['id']);works.add(M.workkey(r['title'],r['artist']))
 assert len(ids)>=2205
 return ids,works
def get_subcats(root):
 try:
  resp=M.api({'action':'query','list':'categorymembers',
   'cmtitle':'Category:'+root,'cmtype':'subcat','cmlimit':500})
  arr=(resp.get('query') or {}).get('categorymembers') or []
  return [x['title'][9:] for x in arr if x.get('title','').startswith('Category:')],None
 except Exception as exc:return [],f'{type(exc).__name__}: {str(exc)[:140]}'
def approve_category(n,root):
 lo=n.lower()
 if any(s in lo for s in ('icon','drawing','photograph','sculpture','portraits','manuscript','monument',
 'church buildings','furniture','tapestry','postcard','detail','frescoes','church interiors',
 'modern art','engravings','etchings','polychrome sculpture','restoration','stained glass',
 'biblical manuscripts','holy relics','cathedral')):
  return False
 if root in n:return False
 return any(z in lo for z in ('painting','sacred','christ','jesus','virgin','saint','adoration',
  'louvre','lille','fabre','musée','baptism','crucifix','magdalene','mary','resurrection',
  'annunciation','piet','entombment','passion','old testament','new testament','holy family',
  'jacob','peter','john','rubens','jordaens','poussin','ribera','angel','apostle'))
def is_sacred(x):
 t=str(x['title']);f=str(x.get('fileTitle') or '');a=str(x.get('artist') or '')
 c=str(x.get('sourceCredit') or '')
 blob=t+' '+f+' '+a
 if BAD_PHOTO.search(blob):return False
 if BAD_SUBJECT.search(t+' '+f):return False
 if len(t)<7 or len(t)>155:return False
 if not any(p.search(t+' '+f) for p in B.SACRED_PATTERNS):return False
 if re.fullmatch(r'(?i)(painting|untitled|saint|religious painting|image|a prophet|apostle|the holy family)',t.strip(' "')):
  return False
 dims=x['nativeSourceDimensions']
 if min(int(dims['width']),int(dims['height']))<1600:return False
 if x['licenseShortName'].lower() not in ('public domain','cc0','cc0 1.0'):return False
 return True
def fetch_cards(c,museum,seen):
 a,stat=M.image_cards(c,maxPages=3)
 out=[]
 for x in a:
  if x['id'] in seen or not is_sacred(x):continue
  y=dict(x)
  y['sourceCategory']=c
  y['museumAssociation']=museum
  y['museumEvidence']='WIKIMEDIA_COMMONS_CATEGORY_ASSOCIATION' if museum else None
  y['country']='France' if museum else None
  y['imageRightsVerified']=True
  y['sourcePhotoQuality']='METADATA_AND_PREVIEW_PENDING'
  out.append(y)
 return out,stat
def priority(x):
 a=x['artist'].lower()
 t=x['title'].lower()
 d=x['nativeSourceDimensions']
 return (0 if x.get('museumAssociation') else 1,
  0 if any(n in a for n in M.FAVORITES) else 1,
  0 if 'oil' in x.get('title','').lower() or any(z in x.get('fileTitle','').lower() for z in ('google art project','louvre','petit palais','museum','musée','musée fabre','musée des beaux-arts')) else 1,
  -min(d['width'],d['height']),
  0 if any(z in t for z in ('crucifixion','resurrection','christ','virgin','saint','magdalene','holy family','annunciation')) else 1,
  t,x['id'])
def check(x):
 # Reuse existing B12 verified probe, but observe backend rate limits.
 time.sleep(0.70)
 return M.validate_preview(x)
def gallery(rows,sha):
 s=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B12_FINAL_20261029.html').read_text()
 contents=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 s,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
  lambda m:m.group(1)+contents+m.group(2),s,count=1,flags=re.S)
 assert n==1
 s,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+sha+'";',s,count=1)
 assert n==1
 s=re.sub(r'<title>.*?</title>',
  '<title>Ad Orientem | Sacred Art Batch 13 — French Museums and Masters</title>',
  s,count=1,flags=re.S)
 s=s.replace("batchId:'B12'","batchId:'B13'")
 s=s.replace("ao-sacred-art-b12-commons-import-","ao-sacred-art-b13-french-import-")
 s=s.replace("ad-orientem-sacred-art-b12-commons-","ad-orientem-sacred-art-b13-french-")
 assert "batchId:'B13'" in s and 'const PAGE_SIZE=50;' in s
 GALLERY.write_text(s,encoding='utf8')
def main():
 oldids,oldworks=old()
 # French first, including 2-level Louvre (subject categories) and 1-level
 # French regional fine-art museum religious-painting collections.
 sources=[];source_seen=set();profiles={};cats_seen=set()
 for museum,roots in FRENCH_MUSEUMS:
  candidates=[]
  for root in roots:
   if root not in cats_seen:
    cats_seen.add(root);candidates.append(root)
   subs,err=get_subcats(root)
   profiles.setdefault(museum,[]).append({'root':root,'subcategories':len(subs),'error':err})
   for c in subs:
    if approve_category(c,root) and c not in cats_seen:
     cats_seen.add(c);candidates.append(c)
  print('B13_FRENCH_MUSEUM',json.dumps({'museum':museum,'categories':len(candidates)}),flush=True)
  for category in candidates[:55]:
   rs,stat=fetch_cards(category,museum,source_seen)
   for x in rs:
    source_seen.add(x['id']);sources.append(x)
  print('B13_FRENCH_COUNTS',json.dumps({'museum':museum,'soFar':len(sources)}),flush=True)
 # Need 250 qualified art works (roughly >=100 French-museum linked). Fill
 # from remaining fresh religious-painting masters if museum supply is low.
 french_raw=len(sources)
 categories=[x for x in FALLBACK if x not in cats_seen]
 # Broaden via root religious-paintings by individual painter categories,
 # without counting categories already covered.
 for root in ['Religious paintings by artist','Religious paintings in France',
              'Religious paintings by French artists','Religious paintings in French museums']:
  subs,_=get_subcats(root)
  for c in subs[:300]:
   if approve_category(c,root) and c not in cats_seen:
    categories.append(c);cats_seen.add(c)
 for i,category in enumerate(categories[:240]):
  if category in cats_seen and category not in FALLBACK:continue
  rs,stat=fetch_cards(category,None,source_seen)
  for x in rs:
   source_seen.add(x['id']);sources.append(x)
  if i%25==0:print('B13_MASTERS',json.dumps({'category':i+1,'raw':len(sources),'frenchRaw':french_raw}),flush=True)
  # Continue through 240 categories to discover best possible paintings
 # compare all previous exact source IDs, titles+artists, and within-batch.
 distinct=[];seenwork=set();excluded=collections.Counter()
 for x in sorted(sources,key=priority):
  if x['id'] in oldids:
   excluded['priorExactSourceId']+=1;continue
  wk=M.workkey(x['title'],x['artist'])
  if wk in oldworks:
   excluded['priorTitleArtistMatch']+=1;continue
  if wk in seenwork:
   excluded['sameTitleArtistInBatch']+=1;continue
  seenwork.add(wk);distinct.append(x)
 french=[x for x in distinct if x['museumAssociation']]
 other=[x for x in distinct if not x['museumAssociation']]
 queue=french+other
 print('B13_UNIQUE',json.dumps({'raw':len(sources),'unique':len(distinct),'frenchMuseumLinked':len(french),'other':len(other),'excluded':dict(excluded)}),flush=True)
 verified=[];failed=[];throttled=0
 for i,x in enumerate(queue[:700]):
  if len(verified)>=250:break
  ok,reason=check(x)
  if not ok:
   failed.append({'id':x['id'],'issue':reason})
   if '429' in reason:
    throttled+=1
    if throttled>=3:
     print('B13_RATE_LIMIT_STOP',json.dumps({'verified':len(verified)}),flush=True)
     break
  else:
   x['sourcePhotoQuality']='JPEG_HEADER_VERIFIED'
   verified.append(x)
  if i%30==0:
   print('B13_CHECK',json.dumps({'index':i+1,'verified':len(verified),'french':sum(bool(y['museumAssociation']) for y in verified),'failed':len(failed)}),flush=True)
 batch_sha=hashlib.sha256(json.dumps([x['id'] for x in verified],separators=(',',':')).encode()).hexdigest()
 if verified:gallery(verified,batch_sha)
 counts={'target':250,'reviewable':len(verified),
  'frenchMuseumAssociated':sum(bool(x['museumAssociation']) for x in verified),
  'otherOpenAccess':sum(not x['museumAssociation'] for x in verified),
  'totalScannedSourceCategories':len(cats_seen),
  'sourceCandidatesBeforeDedup':len(sources),
  'novelSubjectWorkCandidates':len(distinct),
  'priorBatchesSourceIdsExcluded':2205,
  'failedThumbnailChecks':len(failed),
  'rateLimitResponses':throttled,
  'originalImagesAcquired':0,'productionImports':0}
 result={'schema':'AO_SACRED_ART_B13_FRENCH_MUSEUMS_PUBLIC_DOMAIN_CANDIDATES_V1',
  'date':'2026-10-29','batchId':'B13','batchReady':len(verified)==250,
  'batchSha256':batch_sha,'counts':counts,
  'museumCategorySources':profiles,'excludedDuplicates':dict(excluded),
  'imageErrors':failed[:140],
  'sourcePolicy':'Only Commons per-file Public Domain or CC0 photographs; museumAssociation indicates Wikimedia category evidence, not confirmation of museum-licensed source. Paris Musees authenticated API not used.',
  'qualityLimit':'Original media and photographic composition not independently approved for framing, color fidelity, historical painting identity or artistic worth. Human editorial screening mandatory.',
  'rows':verified}
 OUTPUT.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 QA.write_text('# Sacred Art B13 — French museum collections and masterpieces\n\n'
 f"**{len(verified)}** new reviewed source image candidates of target 250, "
 f"including **{counts['frenchMuseumAssociated']} French museum category-linked works**, "
 f"from {len(sources)} original candidates and {len(distinct)} distinct new title/artist entities. "
 f"Expanded from {len(cats_seen)} museum-linked and artist collections.\n\n"
 "French museum association is derived from public Wikimedia Commons location categories. "
 "Official French museum photo reuse terms have NOT been inferred; individual Commons Public Domain/CC0 "
 "licences and actual image headers are the gate. Paris Musées separately provides CC0 images "
 "but requires registration for routine API use. POP/Joconde metadata does not itself "
 "grant media image reuse rights.\n\n"
 f"Excludes 2,205 earlier B1–B12 exact source gallery IDs, "
 f"additional prior work matches {excluded.get('priorTitleArtistMatch',0)}. "
 "Production imports 0, originals saved 0, money spent €0.\n\n"
 f"Batch review hash: {batch_sha}.\n")
 print('B13_DONE',json.dumps({'counts':counts,'hash':batch_sha,
  'sampleFrench':[(x['title'],x['artist'],x['museumAssociation']) for x in verified[:10]],
  'errors':failed[:3]},ensure_ascii=False)[:7000],flush=True)
if __name__=='__main__':main()
