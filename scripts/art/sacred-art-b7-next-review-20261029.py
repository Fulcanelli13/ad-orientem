#!/usr/bin/env python3
"""Sacred Art B7: official NGA + Walters verified-preview, distinct editorial review.
No production mutation, no approval inference, no source photograph acquisition.
"""
import csv, hashlib, importlib.util, io, json, re, time, urllib.parse, urllib.request
from pathlib import Path
from collections import Counter

ROOT=Path(__file__).resolve().parents[2]
D=ROOT/'data/calendar'
OUT=D/'sacred-art-b7-official-museum-candidates-20261029.v1.json'
HTML=ROOT/'docs/SACRED_ART_NEXT_250_IMPORT_REVIEW_B7_20261029.html'
QA=ROOT/'docs/SACRED_ART_B7_SOURCE_AND_DUPLICATE_QA_20261029.md'
UA='AdOrientem-SacredArt-Review/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
def load(name):
 p=ROOT/'scripts/art'/name
 spec=importlib.util.spec_from_file_location(name.replace('.py','').replace('-','_'),p)
 m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m)
 return m
nga=load('sacred-art-nga-next-250-b5r-20261029.py')
wal=load('sacred-art-walters-next-b6-20261029.py')
# Broaden beyond B5's Gospel/saint titles to Biblically specified Old Testament
# subjects, sacramental scenes and named holy persons; never broad free-text hits.
nga.SUBJECTS=tuple(nga.SUBJECTS)+(
 'moses','abraham','isaac','jacob','joseph and','joseph of','joseph,','jonah','noah',
 'david and','king david','solomon','bathsheba','samson','delilah','job and',
 'daniel and','daniel in','tobias','tobit','raphael the archangel','archangel michael',
 'judith and','judith with','esther before','susanna and','eve and','adam and',
 'elijah','elisha','ezekiel','isaiah','jeremiah','rebekah','rebecca','ruth and',
 'gideon','joshua','the creation','the fall of man','the expulsion','the deluge',
 'the flood','the prodigal','the good samaritan','the wedding at cana',
 'presentation in the temple','circumcision','the visitation','the shepherds',
 'the three magi','the transfiguration','the communion','the eucharist',
 'the immaculate conception','the coronation of mary','the assumption',
 'adoration of the shepherds','angel gabriel','the evangelist','angel of the lord',
 'paradise','the holy women','the entombment','the scourging','flagellation',
 'deposition from the cross','the carrying of the cross','veronica','saintly')
ALL_SOURCES=[
 ('sacred-art-20261029-user-60-import-reject-ledger.v1.json','original60'),
 ('sacred-art-250-review-source-b3-20261029.v1.json','B3'),
 ('sacred-art-b4-multimuseum-working-review-20261029.v1.json','B4R'),
 ('sacred-art-nga-open-250-b5r-20261029.v1.json','B5R'),
 ('sacred-art-walters-250-b6-20261029.v1.json','B6')]
previous=set()
counts={}
for file,name in ALL_SOURCES:
 src=json.loads((D/file).read_text(encoding='utf8'))
 ids=({x['sourceId'] for bucket in ('imports','rejects') for x in src[bucket]}
      if name=='original60' else {x['id'] for x in src['rows']})
 counts[name]=len(ids)
 assert len(ids)==(60 if name=='original60' else 123 if name=='B4R' else 250),(name,len(ids))
 assert not previous.intersection(ids),(name,'duplicate prior recorded source ids')
 previous.update(ids)
assert len(previous)==933,(len(previous),counts)
canon=json.loads((D/'sacred-art-curator-queues-383-20261029.v1.json').read_text())
assert len(canon['main_records'])==383
canonical_nga=set()
canonical_walters=set()
for x in canon['main_records']:
 s=json.dumps(x,ensure_ascii=False)
 canonical_nga.update(re.findall(r'nga\\.gov/artworks/(\\d+)',s,re.I))
 canonical_walters.update(re.findall(r'walters\\.org/(?:art/|.*?object/)(\\d+)',s,re.I))

def nga_candidates():
 images={};imrows=0;openrows=0
 f, rows=nga.table('published_images.csv')
 try:
  for x in rows:
   imrows+=1
   if nga.norm(nga.pick(x,'openaccess')) not in ('1','true'): continue
   openrows+=1
   if nga.norm(nga.pick(x,'viewtype')) not in ('primary',''):continue
   key=nga.pick(x,'depictstmsobjectid')
   if key and key.isdigit() and key not in images:
    u=nga.preview_url(x)
    if u:images[key]=(u,x.get('uuid'),nga.pick(x,'iiifURL'))
 finally:f.close()
 matches=[];objects=0
 f,rows=nga.table('objects.csv')
 try:
  for x in rows:
   objects+=1
   id=nga.pick(x,'objectID')
   if not id or id not in images or not id.isdigit() or id in canonical_nga or 'nga:'+id in previous:continue
   if not nga.is_paint(x):continue
   matches.append(x)
 finally:f.close()
 matches.sort(key=nga.score)
 result=[]
 for x in matches:
  id=nga.pick(x,'objectID');im=images[id]
  result.append({'id':'nga:'+id,'provider':'NGA','sourceInstitution':'National Gallery of Art, Washington',
   'objectId':id,'accession':nga.pick(x,'accessionNum'),'title':nga.pick(x,'title'),
   'artist':nga.pick(x,'attribution'),'technique':nga.pick(x,'medium'),
   'year':nga.pick(x,'beginYear'),'objectUrl':'https://www.nga.gov/artworks/'+id,
   'previewURL':im[0],'sourceImageRights':'NGA_EXACT_PUBLISHED_IMAGE_OPENACCESS_1',
   'rightsConflict':None,'imageUUID':im[1],'productionImageRightsCleared':False,
   'productionImported':False})
 return result,{'imagesScanned':imrows,'openImages':openrows,'objectsScanned':objects,
  'eligibleNGA':len(matches)}

def walters_candidates():
 creators={}
 f,rows=wal.csvsource('creators.csv')
 try:
  for r in rows:
   k=r.get('id') or ''
   if k:creators[k]=r.get('name') or r.get('sort_name') or ''
 finally:f.close()
 objects=[];scanned=0
 f,rows=wal.csvsource('art.csv')
 try:
  for x in rows:
   scanned+=1
   if not wal.good(x):continue
   id=str(x.get('ObjectID',''))
   if 'walters:'+id in previous or id in canonical_walters:continue
   c=[creators.get(i,'') for i in re.split(r'[\\|,;]',x.get('Creators') or '')]
   artist='; '.join(s for s in c if s)
   if any(w in wal.low(artist) for w in ('el greco','fra angelico')):continue
   objects.append((x,artist))
 finally:f.close()
 ids={x['ObjectID'] for x,_ in objects}
 media={};mrows=0
 f,rows=wal.csvsource('media.csv')
 try:
  for x in rows:
   mrows+=1;id=x.get('ObjectID','');url=x.get('ImageURL','')
   if id not in ids or not url.startswith('https://art.thewalters.org/images/raw/'):continue
   if wal.low(x.get('MediaType')) not in ('','image'):continue
   pri=wal.low(x.get('IsPrimary')) in ('1','true')
   if id not in media or (pri and not media[id][1]):media[id]=(url,pri)
 finally:f.close()
 result=[]
 for o,artist in objects:
  id=o['ObjectID']
  if id not in media:continue
  acc=o.get('AccessionNumber')
  result.append({'id':'walters:'+id,'provider':'Walters',
   'sourceInstitution':'The Walters Art Museum','objectId':id,'accession':acc,
   'title':o.get('Title') or 'Untitled','artist':artist,'technique':o.get('Medium'),
   'year':o.get('DateBeginYear'),
   'objectUrl':o.get('ResourceURL') or 'https://purl.thewalters.org/art/'+str(acc)+'/',
   'previewURL':media[id][0],
   'sourceImageRights':'WALTERS_OPEN_DATA_IMAGE_PUBLIC_DOMAIN_POLICY__EXACT_RIGHTS_QA_PENDING',
   'rightsConflict':'Walters exact source photograph: production rights and image integrity on hold.',
   'productionImageRightsCleared':False,'productionImported':False})
 result.sort(key=lambda x:wal.rank({'artist':x['artist'],'title':x['title'],
  'start':x['year'],'medium':x['technique'],'id':x['id']}))
 return result,{'objectsScanned':scanned,'qualifiedArtRecords':len(objects),
  'mediaScanned':mrows,'imageLinkedNew':len(result)}

def verify(x):
 url=x['previewURL']
 if x['provider']=='NGA':return nga.check(url)
 return wal.image_check(url)

def build_html(rows):
 template=(ROOT/'docs/SACRED_ART_WALTERS_250_IMPORT_REVIEW_B6_20261029.html').read_text(encoding='utf8')
 safe=json.dumps(rows,ensure_ascii=False).replace('<','\\u003c').replace('>','\\u003e').replace('&','\\u0026')
 template,n=re.subn(r'(<script id="catalog-data" type="application/json">).*?(</script><script>)',
  lambda m:m.group(1)+safe+m.group(2),template,count=1,flags=re.S)
 assert n==1
 digest=hashlib.sha256(json.dumps([x['id'] for x in rows],separators=(',',':')).encode()).hexdigest()
 template,n=re.subn(r'const batchHash="[^"]+";',lambda m:'const batchHash='+json.dumps(digest)+';',template,count=1)
 assert n==1
 template=template.replace('Walters Art Museum · Batch 6','Sacred Art · Batch 7')
 template=template.replace('Walters Museum · Batch 6 (250)','Sacred Art · Batch 7 ('+str(len(rows))+')')
 template=template.replace('<option value="Walters">Walters Art Museum</option>',
  '<option value="NGA">National Gallery of Art</option><option value="Walters">Walters Art Museum</option>')
 template=template.replace('ao-sacred-art-walters-b6-import-', 'ao-sacred-art-b7-import-')
 template=template.replace("batchId:'B6'", "batchId:'B7'")
 template=template.replace("ad-orientem-sacred-art-b6-walters-","ad-orientem-sacred-art-b7-")
 template=template.replace('date:\'2026-10-29\'','date:\'2026-10-29\'')
 assert "batchId:'B7'" in template and 'const PAGE_SIZE=50' in template
 assert len(rows)==len({x['id'] for x in rows})
 HTML.write_text(template,encoding='utf8')
 return digest

def main():
 n,ns=nga_candidates()
 w,ws=walters_candidates()
 # NGA first, the model of the stronger B5 review. Walters is a second
 # distinct museum source and explicitly displays a production rights hold.
 queue=n+w
 chosen=[];checked=0;fail=[];urls=set()
 for item in queue:
  if len(chosen)>=250 or checked>=480:break
  if item['id'] in previous or item['previewURL'] in urls:continue
  checked+=1
  good,why=verify(item)
  if not good:
   fail.append({'id':item['id'],'reason':str(why)[:150]});continue
  urls.add(item['previewURL'])
  chosen.append(item)
  time.sleep(.03)
 assert len(chosen)==len({x['id'] for x in chosen})==len({x['previewURL'] for x in chosen})
 assert not ({x['id'] for x in chosen}&previous)
 stats={'batchId':'B7','target':250,'reviewableCount':len(chosen),'priorDistinctReviewIDsExcluded':933,
  'priorCounts':counts,'NGA':sum(x['provider']=='NGA' for x in chosen),
  'Walters':sum(x['provider']=='Walters' for x in chosen),
  'imageChecks':checked,'imageFailures':len(fail),'productionImports':0,
  'imagesDownloaded':0,'sourceImagesNativeQA':False,
  'userB4RSelections':43,'userB4RReviewed':123,'userB5RSelections':108,'userB5RReviewed':250,
  'userB4RB5RDecisionsMutated':False}
 doc={'schema':'AO_SACRED_ART_B7_REVIEW_SOURCE_V1','date':'2026-10-29',
  'batchId':'B7','targetSize':250,'batchReady':len(chosen)==250,
  'sourcePolicy':'Official open image metadata; exact JPEG preview checked. NGA per-image open access=1. Walters photo held.',
  'counts':stats,'NGAInventory':ns,'WaltersInventory':ws,'errors':fail[:120],
  'gates':{'sourceSpecificIDsPreserved':True,'prior933Excluded':True,
   'noAutomaticAestheticApprovals':True,'originalBytesSaved':0,
   'rightsHoldsNotPromoted':True,'galleryNotProduction':True},'rows':chosen}
 OUT.write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\\n',encoding='utf8')
 digest=build_html(chosen) if chosen else None
 QA.write_text('# Sacred Art Batch 7 — source QA and editorial basis\\n\\n'
  f"- **{len(chosen)} verified JPEG review cards**, target 250. NGA: {stats['NGA']}; Walters: {stats['Walters']}.\\n"
  f"- **933 prior distinct review IDs excluded**: {counts}. No B4R/B5R user decisions changed.\\n"
  f"- B4R: 43/123 selected; B5R: 108/250 selected (including corrections). Batch 5 sets the preferred editorial standard.\\n"
  f"- {checked} preview checks, {len(fail)} failures, full native photography QA pending. No frame/crop integrity claimed.\\n"
  "- NGA exact image openaccess=1; Walters held pending per-image rights review.\\n"
  "- Images used only as linked previews. No image files saved, no production imports. Cost €0.\\n"
  f"- Batch hash: {digest}; Ready={len(chosen)==250}.\\n",encoding='utf8')
 print(json.dumps({'counts':stats,'ngaInventory':ns,'waltersInventory':ws,
  'digest':digest,'samples':[(x['id'],x['title']) for x in chosen[:8]]}))
if __name__=='__main__':main()
