#!/usr/bin/env python3
"""B11: 250 newly-reviewed source-specific PD religious oil-painting reproductions.

Wikimedia Commons public-domain original file photo with direct media info,
image dimensions, file licence, artist/title and JPEG thumbnail checked.
Excludes original 1705 prior museum review IDs and known prior works by title
+ artist, and avoids framed photographs where metadata reveals them.
Never downloads native originals, never edits/merges any production code.
"""
from __future__ import annotations
import concurrent.futures,hashlib,html,importlib.util,json,re,time,urllib.parse,urllib.request,urllib.error
from collections import Counter
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
OUT=D/'sacred-art-b11-commons-250-verified-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B11_20261029.html'
QA=ROOT/'docs/SACRED_ART_B11_COMMONS_250_SOURCE_QA_20261029.md'
API='https://commons.wikimedia.org/w/api.php'
UA='AdOrientem-SacredArtOpenSourceResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
CATEGORIES=(
 'Baroque religious paintings','Religious paintings by Peter Paul Rubens',
 'Religious paintings by Luca Giordano','Baroque paintings of saints',
 'Baroque paintings of Bible stories','Baroque paintings of Judith',
 'Paintings of saints by Guercino','Saints by Guido Reni',
 'Paintings of saints by Peter Paul Rubens',
 'Paintings of saints by Anthony van Dyck',
 'Baroque paintings of Virgin Mary','Religious paintings by Rembrandt',
 'Religious paintings by Francisco de Zurbarán',
 'Religious paintings by José de Ribera','Religious paintings by Diego Velázquez',
 'Religious paintings by Simon Vouet',
 'Paintings of saints by Nicolas Poussin',
 'Religious paintings by Caravaggio',
 '17th-century religious paintings',
 'Baroque paintings of Saint Michael',
 'Baroque paintings of Saint Sebastian',
 'Paintings of saints by Bartolomé Esteban Murillo',
 'Paintings of Christian saints in the 17th century',
 'Paintings of Madonna and Child with Saints',
 'Saints by Giovanni Lanfranco',
 'Paintings of saints by Annibale Carracci',
 'Religious paintings by Nicolas Poussin',
 'Baroque paintings of the Crucifixion of Jesus',
 'Baroque paintings of the Adoration of the Magi',
 'Biblical paintings by Rembrandt',
 'Religious paintings by Guido Reni',
 'Paintings of Jesus Christ by Guido Reni',
 'Old Testament paintings by Guido Reni',
 'Religious paintings by Guido Reni in the National Gallery, London',
 'Religious paintings by Anthony van Dyck',
 'Religious paintings by Bartolomé Esteban Murillo',
 'Religious paintings by Bernardo Strozzi',
 'Religious paintings by Giovanni Lanfranco',
 'Religious paintings by Sebastiano Ricci',
 'Paintings of Jesus Christ by Peter Paul Rubens',
 'Religious paintings by Guercino',
 'Religious paintings by Domenichino',
 'Religious paintings by Artemisia Gentileschi',
 'Religious paintings by Gerard van Honthorst',
 'Religious paintings by Giovanni Battista Tiepolo',
 'Baroque paintings of the Passion of Jesus Christ',
 'Baroque paintings of Jesus Christ',
 'Paintings of Saint Jerome by Guercino',
 'Religious paintings by Cigoli',
 '17th-century religious paintings in the Louvre',
 'Paintings of Jesus Christ by Caravaggio',
 'Paintings of saints by Cigoli',
 'Saints by Bartolomé Esteban Murillo',
)
FAVORITES=('peter paul rubens','anthony van dyck','bartolomé esteban murillo',
 'francisco de zurbarán','jusepe de ribera','guido reni','guercino',
 'luca giordano','jacob jordaens','annibale carracci','philippe de champaigne',
 'bernardo strozzi','nicolas poussin','domenichino','simon vouet',
 'giovanni lanfranco','luca giordano','caravaggio','giovanni battista')
BAD=('el greco','fra angelico','museo del prado','museo nacional del prado',
 'prado museum','museum del prado','prado.es','christopher columbus',
 'orthodox icon','byzantine icon','golden background','illuminated manuscript')
BAD_FILE=('detail','close-up','cropped','crop from','preliminary drawing',
 'iconograph','sketch','study for','photograph of church','fresco','fresko',
 'framed','with frame','in frame','detail of','watermark','drawing',
 'portrait photograph','stained glass','statue','sculpture','relief',
 'etching','woodcut','engraving','lithograph','church interior',
 'interior of the','christmas card','postage','protestant church',
 'statue of','tapestry','mosaic','textile','manuscript','icon.')
LABEL_BAD=('portrait of a man','portrait of a woman','still life','landscape only',
 'photo','christmas ornament')
def norm(s):return re.sub(r'[^a-z0-9]+',' ',str(s or '').lower()).strip()
def api(params):
 q={'format':'json','formatversion':2,'formatversiontext':'2','maxlag':5,**params}
 q.pop('formatversiontext',None)
 url=API+'?'+urllib.parse.urlencode(q)
 for attempt in range(4):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'application/json'})
   with urllib.request.urlopen(req,timeout=40) as resp:raw=resp.read(10000000)
   data=json.loads(raw)
   if 'error' in data:
    code=str(data['error'].get('code') or '')
    if code=='maxlag':time.sleep(2*(attempt+1));continue
    raise ValueError('COMMONS_API_'+code)
   return data
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as exc:
   if attempt==3:raise
   time.sleep(1.5*(attempt+1))
 raise RuntimeError('API_RETRY_EXHAUSTED')
def plain(x):
 x=re.sub(r'(?is)<(?:div|span)[^>]*style="[^"]*display\s*:\s*none[^"]*"[^>]*>.*?</(?:div|span)>','',str(x or ''))
 x=re.sub(r'(?is)<br\s*/?>',' | ',x)
 x=re.sub(r'(?is)<[^>]+>',' ',x)
 x=html.unescape(x)
 return re.sub(r'\s+',' ',x).strip()
def artist(s):
 a=plain(s).split('|')[0]
 a=re.sub(r'\(\s*\d{3,4}\s*[–\-].*?\)','',a)
 a=re.sub(r'\b(?:artist|painter|pintor|creator)\b\s*$','',a,flags=re.I)
 return a.strip(' -–:;,.') or 'Unattributed'
def title(x):
 t=plain(x.get('ObjectName') or x.get('ImageDescription') or '')
 t=re.sub(r'\b(?:title QS|label QS):\w+.*$','',t,flags=re.I).strip(' ;')
 if not t or len(t)>160:
  t=x.get('fileTitle') or ''
 return re.sub(r'\s+',' ',t).strip()
def short_artist(a):
 # Does not treat "Peter Paul Rubens" and "Rubens, Sir Peter Paul" as
 # distinct painters. Sorted non-honorific name tokens normalize ordering.
 a=norm(re.sub(r'\([^)]*\)','',str(a or '')))
 words=[w for w in a.split() if w not in {'sir','the','a','of','attributed','workshop',
 'school','after','follower','by','painter','unknown','anonymous','circle','of','and',
 'spanish','italian','flemish','dutch','german','artist'}]
 return ' '.join(sorted(words[:5]))
def workkey(t,a):
 t=norm(t);t=re.sub(r'\b(?:the|a|an|of|by|from|saint|st|the|with)\b',' ',t)
 t=re.sub(r'\s+',' ',t).strip()
 return (t,short_artist(a))
def previous():
 spec=importlib.util.spec_from_file_location('b11 museum review',ROOT/'scripts/art/sacred-art-b11-cma-nga-250-review-20261029.py')
 mod=importlib.util.module_from_spec(spec);spec.loader.exec_module(mod)
 sourceIDs,counts=mod.old_ids()
 assert len(sourceIDs)>=1705
 rows=[]
 old=json.loads((D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json').read_text())
 for k in ('imports','rejects'):
  rows +=[x for x in old[k] if isinstance(x,dict)]
 for path in (
 'sacred-art-250-review-source-b3-20261029.v1.json',
 'sacred-art-b4-multimuseum-working-review-20261029.v1.json',
 'sacred-art-nga-open-250-b5r-20261029.v1.json',
 'sacred-art-walters-250-b6-20261029.v1.json',
 'sacred-art-b7-official-museum-candidates-20261029.v1.json',
 'sacred-art-b8-smk-250-source-20261029.v1.json',
 'sacred-art-b9-met-250-review-source-20261029.v1.json',
 'sacred-art-b10-final-250-combined-20261029.v1.json',
 ):
  data=json.loads((D/path).read_text())
  rows+=data['rows']
 assert len(rows)==1705,(len(rows),'prior rows incomplete')
 oldkeys={workkey(x.get('title'),x.get('artist')) for x in rows}
 return sourceIDs,oldkeys,counts
def image_cards(cat,maxPages=4):
 cards=[];token=None;pages=0;err=[];checked=0
 while pages<maxPages:
  p={'action':'query','generator':'categorymembers',
   'gcmtitle':'Category:'+cat,'gcmtype':'file','gcmlimit':350,
   'prop':'imageinfo','iiprop':'url|size|extmetadata|mime',
   'iiurlwidth':1000}
  if token:p['gcmcontinue']=token
  try:obj=api(p)
  except Exception as e:
   err.append({'category':cat,'page':pages,'error':type(e).__name__+': '+str(e)[:160]});break
  pages+=1;arr=(obj.get('query') or {}).get('pages') or []
  checked+=len(arr)
  for page in arr:
   filename=str(page.get('title') or '')
   if not filename.startswith('File:'):continue
   base=filename[5:]
   if not base.lower().endswith(('.jpg','.jpeg','.png')):continue
   if any(z in base.lower() for z in BAD_FILE):continue
   i=(page.get('imageinfo') or [{}])[0];meta=i.get('extmetadata') or {}
   if i.get('mime') not in ('image/jpeg','image/png'):continue
   w=int(i.get('width') or 0);h=int(i.get('height') or 0)
   if min(w,h)<1400:continue
   license=plain((meta.get('LicenseShortName') or {}).get('value') or '')
   usage=plain((meta.get('UsageTerms') or {}).get('value') or '')
   if not (license.lower().startswith('public domain') or license.lower().startswith('cc0')):
    continue
   if usage and not (usage.lower().startswith('public domain') or usage.lower().startswith('cc0')):
    continue
   v={k:((meta.get(k) or {}).get('value') or '') for k in
       ('ObjectName','ImageDescription','Artist','Credit','Source')}
   v['fileTitle']=re.sub(r'\.(?:jpe?g|png)$','',base,flags=re.I)
   t=title(v);a=artist(v['Artist'])
   if any(z in (base+' '+t+' '+a+' '+plain(v['Credit'])+' '+plain(v['Source'])).lower() for z in BAD):continue
   if not t or len(t)>160:continue
   if any(z in t.lower() for z in LABEL_BAD):continue
   if len(t)<4:continue
   if (t.count(' ')<1 and not re.search(r'\b(?:piet[aà]|crucifixion|nativity|annunciation|magdalene|madonna|resurrection)\b',t,re.I)):
    continue
   # Source category must be explicitly sacred. Reject unrelated landscape
   # photos by filenames even if someone filed them under the wrong category.
   low=(t+' '+base).lower()
   if any(z in low for z in ('harbour','landscape without','landscape near','photo of',
     'photograph','painting in museum','portrait of the painter','general view of',
     'university','town hall','panorama','mountain landscape','admiral','duchess',
     'warship','river bank','saint petersburg','sainte adresse','saint tropez')):
     continue
   thumb=str(i.get('thumburl') or '');orig=str(i.get('url') or '')
   pp=urllib.parse.urlparse(thumb);po=urllib.parse.urlparse(orig)
   if pp.scheme!='https' or pp.hostname not in ('thumb.wikimedia.org','upload.wikimedia.org'):
    continue
   if po.scheme!='https' or po.hostname!='upload.wikimedia.org':continue
   cards.append({'id':'commons:'+str(page['pageid']),
     'provider':'Commons','sourceInstitution':'Wikimedia Commons — public-domain artwork photograph',
     'objectId':str(page['pageid']),'accession':None,'title':t,'artist':a,
     'sourceCategory':cat,'fileTitle':filename,'objectUrl':'https://commons.wikimedia.org/wiki/'+urllib.parse.quote(filename.replace(' ','_'),safe='/:_()'),
     'previewURL':thumb,'nativeImageURL':orig,
     'nativeSourceDimensions':{'width':w,'height':h},
     'sourceRights':'WIKIMEDIA_COMMONS_EXACT_FILE_PUBLIC_DOMAIN_OR_CC0',
     'licenseShortName':license,'usageTerms':usage,
     'sourceCredit':plain(v['Credit'])[:400],'sourceOriginal':plain(v['Source'])[:400],
     'imageRightsVerified':True,'rightsConflict':None,
     'productionOriginalImageQA':False,'productionImported':False})
  token=(obj.get('continue') or {}).get('gcmcontinue')
  if not token:break
  time.sleep(.10)
 return cards,{'pages':pages,'fileRecords':checked,'candidateCards':len(cards),'errors':err}
def score(x):
 a=x['artist'].lower();t=x['title'].lower()
 w,h=x['nativeSourceDimensions']['width'],x['nativeSourceDimensions']['height']
 f=x['fileTitle'].lower()
 return (0 if any(z in a for z in FAVORITES) else 1,
   0 if any(z in f for z in ('google art project','national gallery','louvre','museum',
      'wikimedia','web gallery of art','york','art institute','rkd','gemäldegalerie')) else 1,
   0 if re.search(r'\b(?:christ|virgin|jesus|madonna|crucifix|saint|magdalene|pieta|nativity|baptism|assumption|annunciation)\b',t) else 1,
   0 if 'baroque' in x['sourceCategory'].lower() else 1,
   -(min(w,h)),t)
def validate_preview(x):
 url=x['previewURL'];p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('thumb.wikimedia.org','upload.wikimedia.org'):
  return False,'UNTRUSTED_PREVIEW'
 for retry in range(3):
  try:
   req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg,image/png','Range':'bytes=0-32'})
   with urllib.request.urlopen(req,timeout=25) as resp:
    b=resp.read(16);mime=str(resp.headers.get('Content-Type') or '').lower()
   isjpg=b.startswith(bytes.fromhex('ffd8'))
   ispng=b.startswith(bytes.fromhex('89504e470d0a1a0a'))
   return (isjpg or ispng) and mime.startswith('image/'),'HTTP_OK'
  except (urllib.error.HTTPError,urllib.error.URLError,TimeoutError) as e:
   if retry==2:return False,type(e).__name__+': '+str(e)[:150]
   time.sleep(.5*(retry+1))
def gallery(rows,digest):
 src=(ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B10_20261029.html').read_text()
 payload=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 src,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
   lambda m:m.group(1)+payload+m.group(2),src,count=1,flags=re.S)
 assert n==1
 src,n=re.subn(r'const batchHash="[0-9a-f]+";',lambda m:'const batchHash="'+digest+'";',src,count=1)
 assert n==1
 src=re.sub(r'<title>.*?</title>',
  '<title>Ad Orientem | Sacred Art Batch 11 ('+str(len(rows))+')</title>',src,count=1,flags=re.S)
 src=src.replace('Rijksmuseum + Metropolitan Museum of Art · Batch 10',
  'Baroque Sacred Art · Batch 11 (public-domain images)')
 src,n=re.subn(r'<select id="museum"[^>]*>.*?</select>',
  '<select id="museum" aria-label="Source"><option value="all">All paintings</option><option value="Commons">Wikimedia Commons</option></select>',
  src,count=1,flags=re.S)
 assert n==1
 src=src.replace("batchId:'B10'","batchId:'B11'")
 src=src.replace("ao-sacred-art-b10-import-","ao-sacred-art-b11-commons-import-")
 src=src.replace("ad-orientem-sacred-art-b10-","ad-orientem-sacred-art-b11-commons-")
 src=src.replace('No changes to the 107 historic approvals or rating archive.',
                 'All historic approvals and rejections remain frozen.')
 assert "batchId:'B11'" in src and "const PAGE_SIZE=50;" in src
 HTML.write_text(src,encoding='utf8')
def main():
 oldIDs,oldWorks,priorBreakdown=previous()
 cards=[];categoryQA={}
 for i,c in enumerate(CATEGORIES):
  rs,stat=image_cards(c,maxPages=4)
  categoryQA[c]=stat;cards.extend(rs)
  print('B11_COMMONS_DISCOVERY',json.dumps({'category':i+1,'name':c,'candidates':len(rs),'cumulative':len(cards)}),flush=True)
 unique=[];seenIDs=set();seenArt=set();sourceDuplicated=0;historicWorks=0
 for x in sorted(cards,key=score):
  if x['id'] in seenIDs:
   sourceDuplicated+=1;continue
  wk=workkey(x['title'],x['artist'])
  if wk in oldWorks:
   historicWorks+=1;continue
  if wk in seenArt:
   sourceDuplicated+=1;continue
  seenIDs.add(x['id']);seenArt.add(wk);unique.append(x)
 print('B11_COMMONS_QUEUE',json.dumps({'rawCandidates':len(cards),'distinctNewWorks':len(unique),
  'seenExactSourceDuplicates':sourceDuplicated,'excludedPreviouslyReviewedWork':historicWorks}),flush=True)
 accepted=[];checks=0;errs=[]
 for start in range(0,min(len(unique),900),42):
  part=unique[start:start+42]
  with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
   verdicts=list(pool.map(validate_preview,part))
  for x,(ok,why) in zip(part,verdicts):
   checks+=1
   if not ok:
    if len(errs)<150:errs.append({'id':x['id'],'why':why})
    continue
   accepted.append(x)
   if len(accepted)==250:break
  print('B11_COMMONS_IMAGE_QA',json.dumps({'checked':checks,'passed':len(accepted),'failed':len(errs)}),flush=True)
  if len(accepted)>=250:break
 digest=hashlib.sha256(json.dumps([x['id'] for x in accepted],separators=(',',':')).encode()).hexdigest()
 if accepted:gallery(accepted,digest)
 counts={'reviewable':len(accepted),'sourceCategoriesChecked':len(CATEGORIES),
  'rawPDImagesFound':len(cards),'distinctNewArtworks':len(unique),
  'previousReviewIDsExcluded':1705,
  'previouslyReviewedWorkImagesExcluded':historicWorks,
  'sameWorkPhotoVariantsExcluded':sourceDuplicated,
  'previewHeadersChecked':checks,'previewFailures':len(errs),
  'noProductionImports':0,'originalImagesDownloaded':0}
 report={'schema':'AO_B11_COMMONS_PUBLIC_DOMAIN_PAINTING_REVIEW_V1',
  'date':'2026-10-29','batchId':'B11','targetSize':250,
  'completeBatchReady':len(accepted)==250,'batchHash':digest,
  'counts':counts,'sourceCategoryEvidence':categoryQA,'imageErrors':errs,
  'sourcePolicy':'exact Wikimedia Commons file Public domain or CC0, verified JPEG/PNG thumbnail, min 1400x1400 shorter native side, original Wikimedia source and per-file metadata',
  'limits':'Category assignment and metadata do not independently certify artwork is oil on canvas, unframed, or true-colour: human visual review required. Exact file rights recorded, no production imports.',
  'rows':accepted}
 OUT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
 QA.write_text('# Sacred Art B11 — Baroque Public-Domain Image Collection\n\n'
  f"Official Commons PD/CC0 Baroque religious categories {len(CATEGORIES)}. "
  f"Per-file open-rights candidates {len(cards)}, deduplicated new art works {len(unique)}, "
  f"visible preview images {len(accepted)} of target 250. "
  f"Photographic JPEG/PNG headers checked {checks}, errors {len(errs)}.\n\n"
  f"**1,705** earlier reviewed source IDs blocked (original 60, B3–B10). "
  f"Additional repeated work title-artist combinations blocked {historicWorks}, "
  f"same-work or photo variants {sourceDuplicated}.\n\n"
  'Every proposed source retains exact Commons file page, file-level Public Domain or CC0 license, original image URL and verified thumbnail image bytes; native original 1400px minimum short side. '
  'Human approval is mandatory and original image quality/framing/colour-fidelity cannot be inferred from metadata.\n\n'
  'Research only, no production images, zero payment or asset storage.\n\n'
  f'Batch identity hash: {digest}.\n',encoding='utf8')
 print('B11_COMMONS_FINAL',json.dumps({'counts':counts,'hash':digest,
  'first':[(x['title'],x['artist'],x['sourceCategory']) for x in accepted[:10]]},ensure_ascii=False)[:6000],flush=True)
if __name__=='__main__':main()
