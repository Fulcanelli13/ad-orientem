#!/usr/bin/env python3
"""NGA Washington Sacred Art B5: 250 paintings from image-level openaccess CSV.
No original image downloads, no repeat from 250 B3, 123 B4R, 60 earlier decisions.
"""
import argparse,csv,io,json,re,time,urllib.request,urllib.parse
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/calendar'
OUT=D/'sacred-art-nga-open-250-b5r-20261029.v1.json'
REPORT=ROOT/'docs/SACRED_ART_NGA_250_B5R_SOURCE_QA_20261029.md'
BASE='https://raw.githubusercontent.com/NationalGalleryOfArt/opendata/main/data/'
UA='AdOrientem-SacredArt-OpenAccessResearch/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
SUBJECTS=('christ','jesus','crucifix','nativity','adoration','annunciat','holy family','madonna',
'virgin','st. ','saint','saints','apostle','magdalen','baptism','resurrection','ascension',
'assumption','pentecost','pieta','pietà','lamentation','deposition','visitation','sacred heart',
'ecce homo','last supper','transfigur','immaculate','holy trinity','holy spirit','martyr',
'john the baptist','penitent','archangel','supper at emmaus')
NEGATIVE=('saint louis','st. louis','st. paul city','saint tropez','st petersburg',
'view of the church','view of saint','landscape near saint','saint paul boulevard',
'st. george island','saint cloud','krishna','shiva','vishnu','buddha','ganesha',
'hindu','quran','mosque','islamic','christmas cards')
BAD_MEDIUM=('engraving','etching','print','photograph','stoneware','manuscript','drawing',
'bronze','sculpture','vellum','parchment','terracotta','ceramic','silkscreen','ink on paper',
'watercolor','lithograph','book','illuminated','porcelain')
FAVORITE=('rubens','van dyck','champaigne','caravaggio','murillo','ribera','zurbar',
'carracci','guido reni','giordano','guercino','gentileschi','jordaens',
'strozzi','lanfranco','tintoretto','veronese','de crayer','cavallino',
'cossiers','seghers','tiepolo','rigaud','dolci','barocci','velázquez',
'velazquez','preti','solimena','vouet','le brun','de la tour')
def norm(x):return re.sub(r'\s+',' ',str(x or '').strip()).lower()
def table(name):
 url=BASE+name
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='raw.githubusercontent.com':raise ValueError('BAD_CSV_URL')
 req=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'text/csv','Accept-Encoding':'identity'})
 f=urllib.request.urlopen(req,timeout=90)
 return f,csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig',newline=''))
def pick(row,*names):
 for n in names:
  if n in row:return row.get(n)
 return ''
def is_paint(row):
 classification=norm(pick(row,'classification','visualBrowserClassification'))
 medium=norm(pick(row,'medium'))
 title=norm(pick(row,'title'))
 attr=norm(pick(row,'attribution','attributionInverted'))
 if 'painting' not in classification:return False
 if not any(x in medium for x in ('oil on','tempera on','distemper on','acrylic on')):return False
 if any(x in medium for x in BAD_MEDIUM):return False
 if not any(x in title for x in SUBJECTS):return False
 if any(x in title for x in NEGATIVE):return False
 if any(x in attr for x in ('el greco','fra angelico')):return False
 if pick(row,'isVirtual')=='1':return False
 return True
def score(row):
 artist=norm(pick(row,'attribution'));title=norm(pick(row,'title'))
 yr=str(pick(row,'beginYear') or '0')
 year=int(yr) if yr.lstrip('-').isdigit() else 0
 med=norm(pick(row,'medium'))
 return (0 if any(x in artist for x in FAVORITE) else 1,
  0 if 1500<=year<=1820 else 1 if 1300<=year<=1890 else 2,
  0 if 'oil on canvas' in med else 1,
  0 if any(x in title for x in ('crucifix','christ','madonna','saint','virgin','nativity')) else 1,
  title,int(pick(row,'objectID') or '0'))
def preview_url(image):
 base=pick(image,'iiifURL')
 p=urllib.parse.urlparse(base)
 if p.scheme!='https' or p.hostname!='api.nga.gov' or not re.fullmatch(r'/iiif/[A-Za-z0-9-]{12,80}/?',p.path):return None
 return base.rstrip('/')+'/full/!560,560/0/default.jpg'
def check(url,timeout=18):
 try:
  p=urllib.parse.urlparse(url)
  if p.scheme!='https' or p.hostname!='api.nga.gov':return False,'BAD_HOST'
  r=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg','Range':'bytes=0-15'})
  with urllib.request.urlopen(r,timeout=timeout) as rsp:
   first=rsp.read(16)
   return (rsp.status in (200,206) and rsp.headers.get('Content-Type','').startswith('image/')
     and first.startswith(bytes.fromhex('ffd8'))),'HTTP_'+str(rsp.status)
 except Exception as e:return False,type(e).__name__+':'+str(e)[:130]
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--target',type=int,default=250)
 p.add_argument('--max-previews',type=int,default=410)
 p.add_argument('--delay',type=float,default=.10)
 a=p.parse_args()
 assert 200<=a.target<=300 and 200<=a.max_previews<=650
 files={
  'b3':D/'sacred-art-250-review-source-b3-20261029.v1.json',
  'user':D/'sacred-art-b3-final-user-decisions-20261029.v1.json',
  'old60':D/'sacred-art-20261029-user-60-import-reject-ledger.v1.json',
  'b4':D/'sacred-art-b4-multimuseum-working-review-20261029.v1.json',
  'canon':D/'sacred-art-curator-queues-383-20261029.v1.json'}
 ds={k:json.loads(v.read_text(encoding='utf8')) for k,v in files.items()}
 assert len(ds['b3']['rows'])==250 and ds['user']['sourceCardCount']==250
 assert len(ds['b4']['rows'])==123 and ds['old60']['sourceRecordCount']==60
 assert len(ds['canon']['main_records'])==383
 excluded=(set(ds['user']['imports'])|set(ds['user']['rejects'])|set(ds['user']['withCorrections'])
  |{x['sourceId'] for z in ('imports','rejects') for x in ds['old60'][z]}
  |{x['id'] for x in ds['b4']['rows']})
 assert len(excluded)==433 and {x['id'] for x in ds['b3']['rows']}<=excluded
 canonical_nga=set()
 for x in ds['canon']['main_records']:
  blob=json.dumps(x,ensure_ascii=False)
  for pat in (r'nga\.gov/(?:collection/)?art-object-page[./](\d+)',r'nga\.gov/artworks/(\d+)'):
   for m in re.finditer(pat,blob,re.I):canonical_nga.add(int(m.group(1)))
 images={};image_count=0;restricted=0
 f,rows=table('published_images.csv');img_headers=rows.fieldnames
 try:
  for x in rows:
   image_count+=1
   if norm(pick(x,'openaccess')) not in ('1','true'):restricted+=1;continue
   if norm(pick(x,'viewtype')) not in ('primary',''):continue
   key=pick(x,'depictstmsobjectid')
   if not key or not key.isdigit() or key in images:continue
   url=preview_url(x)
   if url:images[key]={'url':url,'uuid':x['uuid'],'base':x['iiifURL']}
 finally:f.close()
 f,rows=table('objects.csv');obj_headers=rows.fieldnames
 objects=0;matches=[]
 try:
  for x in rows:
   objects+=1
   id=pick(x,'objectID')
   if not id or id not in images or not id.isdigit():continue
   if int(id) in canonical_nga or 'nga:'+id in excluded:continue
   if not is_paint(x):continue
   matches.append({k:pick(x,k) for k in ('objectID','accessionNum','title','displayDate',
     'attribution','classification','medium','beginYear')})
 finally:f.close()
 matches.sort(key=score)
 selected=[];errors=[];seen_img=set();checked=0
 for x in matches[:a.max_previews]:
  if len(selected)>=a.target:break
  id=x['objectID'];img=images[id]
  if img['uuid'] in seen_img:continue
  checked+=1
  ok,why=check(img['url'])
  if not ok:
   errors.append({'objectID':id,'issue':why});continue
  seen_img.add(img['uuid'])
  selected.append({'id':'nga:'+id,'provider':'NGA',
    'sourceInstitution':'National Gallery of Art, Washington','objectId':id,
    'accession':x['accessionNum'],'title':x['title'],'artist':x['attribution'],
    'medium':x['medium'],'date':x['displayDate'],
    'objectUrl':'https://www.nga.gov/artworks/'+id,
    'previewURL':img['url'],
    'rightsBasis':'NGA_EXACT_PUBLISHED_IMAGE_OPENACCESS_1',
    'rightsHold':False,'imageUUID':img['uuid'],
    'sourceImageService':img['base'],'productionImported':False})
  time.sleep(a.delay)
 ids={x['id'] for x in selected}
 assert len(ids)==len(selected) and not ids&excluded
 payload={'schema':'AO_NGA_250_NEW_SACRED_PAINTINGS_REVIEW_B5R_V1',
   'date':'2026-10-29','batchId':'B5R','targetSize':a.target,
   'batchReady':len(selected)>=200,
   'counts':{'reviewableNewPaintings':len(selected),'publishedImagesScanned':image_count,
    'imageServicesOpenAccess':len(images),'restrictedImagesExcluded':restricted,
    'catalogueObjectsScanned':objects,'religiousPaintingMetadataCandidates':len(matches),
    'previewHeadersChecked':checked,'imageIssues':len(errors),
    'priorReviewedSourceIdsExcluded':433,
    'previouslyCataloguedNgaIDsExcluded':len(canonical_nga),
    'newUserApprovals':0,'newRejections':0,'productionImports':0},
   'gates':{'exactObjectImageJoin':True,'imageOpenaccessFlagEquals1':True,
    'paintingClassificationAndPaintedMedium':True,'originalImageBytesArchived':0,
    'allIncludedPreviewJPEGHeadersVerified':True,'noPreviousReviewReoffered':True,
    'noAestheticGradesAssigned':True,'nativePhotoQAOutstanding':True},
   'sourceHeaders':{'objects':obj_headers,'published_images':img_headers},
   'errors':errors[:100],'rows':selected}
 OUT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
 REPORT.write_text('# Sacred Art B5R — NGA Washington\n\n'
  '- Verified distinct painting previews: **'+str(len(selected))+'**; target '+str(a.target)+'.\n'
  '- Images require exact-object published_images.openaccess=1.\n'
  '- Objects checked: '+str(objects)+'; religious painting metadata matches '+str(len(matches))+'.\n'
  '- Excludes all 433 earlier review IDs, including B4R, B3 and original 60.\n'
  '- Only preview headers checked; original images NOT downloaded, no photo QA or production imports.\n'
  '- Cost: €0.\n',encoding='utf8')
 print(json.dumps({'counts':payload['counts'],'ready':payload['batchReady'],
   'sample':[(x['id'],x['title'],x['artist']) for x in selected[:6]],
   'errors':errors[:6]},ensure_ascii=False)[:4500])
if __name__=='__main__':main()
