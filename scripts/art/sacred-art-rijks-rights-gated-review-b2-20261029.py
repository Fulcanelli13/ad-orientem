#!/usr/bin/env python3
"""Create a rights-gated, whole-image visual review of Rijksmuseum sacred-art leads.
Never archives originals, never awards an aesthetic grade, never changes production.
"""
from __future__ import annotations
import argparse,io,json,re,time,urllib.request,urllib.parse
from collections import Counter
from pathlib import Path
from PIL import Image,ImageDraw,ImageOps

ROOT=Path(__file__).resolve().parents[2]
IN=ROOT/'data/calendar/sacred-art-museum-work-intake-and-aesthetic-gates-20261029.v1.json'
OUT=ROOT/'data/calendar/sacred-art-rijks-rights-gated-review-b2-20261029.v1.json'
MD=ROOT/'docs/SACRED_ART_RIJKS_RIGHTS_GATED_REVIEW_B2_20261029.md'
ASSET=ROOT/'assets/staged/sacred-art-rijks-b2-20261029'
UA='AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)'
def ls(x):return x if isinstance(x,list) else []
def ob(x):return x if isinstance(x,dict) else {}
def clean(s,n=38):
 s=str(s or '').replace('\n',' ')
 return s[:n-1]+'…' if len(s)>n else s
def request(url,timeout=20,image=False):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname not in ('data.rijksmuseum.nl','iiif.micr.io'):raise ValueError('SOURCE_HOST_NOT_ALLOWED')
 if image and p.hostname!='iiif.micr.io':raise ValueError('IMAGE_SOURCE_NOT_IIIF')
 if not image and p.hostname=='iiif.micr.io' and not p.path.endswith('/info.json'):raise ValueError('IIIF_METADATA_ONLY')
 q=urllib.request.Request(url,headers={'User-Agent':UA,'Accept':'image/jpeg' if image else 'application/json'})
 with urllib.request.urlopen(q,timeout=timeout) as r:
  data=r.read((3_000_000 if image else 7_000_000)+1)
  typ=r.headers.get('Content-Type','')
 if len(data)>(3_000_000 if image else 7_000_000):raise ValueError('RESPONSE_TOO_LARGE')
 if image:
  if not typ.startswith('image/'):raise ValueError('IMAGE_CONTENT_TYPE_REQUIRED')
  return data
 return json.loads(data.decode('utf-8'))
def object_record(id,timeout):
 if not re.fullmatch('[0-9]{4,15}',id):raise ValueError('INVALID_RIJKSMUSEUM_ID')
 return request('https://data.rijksmuseum.nl/'+id+'?_profile=la-framed',timeout)
def rights(d):
 values=[]
 for right in ls(ob(d).get('subject_to')):
  for t in ls(ob(right).get('classified_as')):
   values.append(str(ob(t).get('id','')).lower())
 for key in ('rights','license','licence'):
  v=ob(d).get(key)
  if isinstance(v,str):values.append(v.lower())
 if any(('creativecommons.org/publicdomain/zero/1.0' in s or 'creativecommons.org/publicdomain/mark/1.0' in s) for s in values):return ('CC0_OR_PDM',values)
 if values:return ('NON_CC0_OR_UNKNOWN',values)
 return ('UNDECLARED',values)
def accession(d):
 for x in ls(ob(d).get('identified_by')):
  if ob(x).get('type')=='Identifier':
   v=str(ob(x).get('content',''))
   if v.startswith(('SK-','RP-','NG-')):return v
 return None
def image_source(id,timeout):
 d=object_record(id,timeout)
 for v in ls(d.get('shows'))[:3]:
  visualid=str(ob(v).get('id','')).rsplit('/',1)[-1]
  if not visualid.isdigit():continue
  visual=object_record(visualid,timeout)
  for ref in ls(visual.get('digitally_shown_by'))[:3]:
   did=str(ob(ref).get('id','')).rsplit('/',1)[-1]
   if not did.isdigit():continue
   digital=object_record(did,timeout)
   state,assertions=rights(digital)
   for a in ls(digital.get('access_point')):
    uri=str(ob(a).get('id',''))
    m=re.match(r'^https://iiif\.micr\.io/([A-Za-z0-9_-]{3,32})/full/',uri)
    if not m:continue
    return {'status':'CC0_IMAGE' if state=='CC0_OR_PDM' else 'IMAGE_RIGHTS_HOLD',
            'imageRights':state,'rightsUris':assertions[:6],'imageService':'https://iiif.micr.io/'+m.group(1),
            'visualId':visualid,'digitalId':did,'accession':accession(d)}
 return {'status':'NO_IIIF_DIGITAL_OBJECT','accession':accession(d)}
def compose(pics):
 if not pics:return []
 ASSET.mkdir(parents=True,exist_ok=True)
 paths=[]
 for st in range(0,len(pics),24):
  sheet=Image.new('RGB',(1200,2620),'#faf8f5');draw=ImageDraw.Draw(sheet)
  draw.text((16,10),'AD ORIENTEM | SOURCE-IMAGE RIGHTS VERIFIED | RESEARCH PREVIEW, NOT APPROVAL',fill='#393530')
  for j,(row,img) in enumerate(pics[st:st+24]):
   x=(j%4)*300;y=(j//4)*430+40
   draw.rectangle((x+6,y,x+293,y+416),outline='#ddd6ce',width=1)
   img.thumbnail((282,322),Image.Resampling.LANCZOS)
   sheet.paste(img,(x+150-img.width//2,y+166-img.height//2))
   for line,t in enumerate([clean(row['title']),clean(row['artist']),row['sourceObjectId']+' '+str(row.get('accession') or '')]):
    draw.text((x+12,y+343+line*22),t,fill='#252322' if line==0 else '#746e67')
  path=ASSET/('contact-%02d.jpg'%(1+st//24))
  sheet.save(path,'JPEG',quality=86,optimize=True)
  paths.append(str(path.relative_to(ROOT)))
 return paths
def main():
 p=argparse.ArgumentParser()
 p.add_argument('--offline-smoke',action='store_true')
 p.add_argument('--max-objects',type=int,default=140)
 p.add_argument('--max-images',type=int,default=70)
 p.add_argument('--timeout',type=int,default=18)
 p.add_argument('--delay',type=float,default=.10)
 a=p.parse_args()
 if a.offline_smoke:
  assert rights({'subject_to':[{'classified_as':[{'id':'https://creativecommons.org/publicdomain/zero/1.0/'}]}]})[0]=='CC0_OR_PDM'
  assert rights({'subject_to':[{'classified_as':[{'id':'https://creativecommons.org/licenses/by-nc/4.0/'}]}]})[0]!='CC0_OR_PDM'
  assert rights({})[0]=='UNDECLARED'
  assert accession({'identified_by':[{'type':'Identifier','content':'SK-A-123'}]})=='SK-A-123'
  print('OFFLINE_RIGHTS_GATES_PASS');return
 assert 0<a.max_objects<=200 and 0<=a.max_images<=100
 data=json.loads(IN.read_text(encoding='utf-8'))
 assert data['institutionCount']==186 and len(data['canonicalArtworkRecords'])==383
 candidates=[x for x in data['museumB1MetadataLeads'] if x['sourceProvider']=='rijks'
  and x['sacredSubjectMetadataPreflight']=='SACRED_ICONOGRAPHY_TITLE_MATCH'
  and x['eligibleForAffirmativeNewShortlist']]
 weights={'P1_REFERENCE_ARTIST':0,'P2_STRONG_RELATED_ARTIST':1,'P3_BAROQUE_CORPUS':2,'P4_OTHER_ART_HISTORICAL':3}
 candidates.sort(key=lambda x:(weights.get(x['artistBasedDiscoveryPriority'],9),-len(x['title']),x['sourceOriginalId']))
 rows=[];pictures=[];errors=[]
 for candidate in candidates[:a.max_objects]:
  id=str(candidate['sourceOriginalId'])
  r={'sourceObjectId':id,'title':candidate['title'],'artist':candidate['artist'],
     'museumObjectPage':'https://id.rijksmuseum.nl/'+id,
     'knownCanonicalMatches':candidate.get('possibleCanonicalMatches',[]),
     'existingHumanRating':candidate.get('priorUserRating'),
     'artistBasedResearchPriority':candidate['artistBasedDiscoveryPriority'],
     'aestheticGrade':None,'visuallyEvaluated':False,'humanApproved':False,
     'exactPhysicalObjectSameAsCanonical383':False,'sourceOriginalArchived':False,
     'fullNativePhotoQA':False,'productionPublished':False}
  try:
   meta=image_source(id,a.timeout)
   r.update(meta)
   if meta['status']!='CC0_IMAGE':r['disposition']='HOLD_MISSING_EXACT_DIGITAL_PHOTO_CC0'
   else:
    info=request(meta['imageService']+'/info.json',a.timeout)
    w,h=int(info.get('width') or 0),int(info.get('height') or 0)
    r['nativeSourceDimensions']={'width':w,'height':h}
    if min(w,h)<1800:r['disposition']='LOW_NATIVE_RESOLUTION_HOLD'
    elif len(pictures)>=a.max_images:r['disposition']='PREVIEW_COUNT_CAP'
    else:
     url=meta['imageService']+'/full/420,/0/default.jpg'
     blob=request(url,a.timeout,image=True)
     im=ImageOps.exif_transpose(Image.open(io.BytesIO(blob))).convert('RGB')
     r['previewURL']=url;r['disposition']='CC0_RESEARCH_CONTACT_SHEET_ONLY'
     pictures.append((r,im))
  except Exception as e:
   r['disposition']='SOURCE_OR_FORMAT_ERROR';r['error']=type(e).__name__+': '+str(e)[:150]
   errors.append({'sourceObjectId':id,'error':r['error']})
  rows.append(r);time.sleep(a.delay)
 sheet_paths=compose(pictures);c=Counter(x['disposition'] for x in rows)
 report={'schema':'ad-orientem-rijks-rights-gated-visual-b2-v1','date':'2026-10-29',
  'scope':{'registeredSourceProgrammes':186,'baselineCanonicalArtworks':383,
           'rijksSacredTitleEligible':len(candidates),'recordsScreened':len(rows)},
  'counts':{'sourceImageCC0PreviewCount':len(pictures),'imageHoldsAndOther':len(rows)-len(pictures),
            'newImageAestheticRatings':0,'nativePhotographsCertified':0,
            'productionReleases':0,'byDisposition':dict(c)},
  'restrictions':{'sourcePhotoImageRightsRequired':'EXPLICIT_DIGITAL_OBJECT_CC0_OR_PUBLIC_DOMAIN_MARK',
                  'noPhotoOriginalsDownloaded':True,'contactSheetsAreOriginalAspectResizedThumbnails':True,
                  'aestheticGradesProhibitedUntilVisualReview':True,
                  'museumArtApprovalNotInheritedFromRights':True},
  'contactSheets':sheet_paths,'sourceErrors':errors[:80],'records':rows}
 OUT.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
 lines=['# Rijksmuseum sacred art — B2 rights-gated visual review','',
 '29 October 2026 | €0 | source-original downloads 0 | production releases 0','',
 'Eligible source-title candidates: **'+str(len(candidates))+'**; source IDs screened: **'+str(len(rows))+'**.',
 'Image-specific CC0/PDM research thumbnails staged: **'+str(len(pictures))+'**.',
 'These thumbnails are not actual original-image QA, aesthetic grades, or artist approvals.','',
 '## Per-file rights/source gates']
 for key,val in sorted(c.items()):lines.append('- '+key+': '+str(val))
 lines.extend(['','## Contact sheets — full depicted field (never cropped)',''])
 for f in sheet_paths:lines.append('- ['+Path(f).name+'](../'+f+')')
 lines.extend(['','## First 40 reviewed metadata identities','',
 '| Rijks ID | Painting candidate title | Artist attribution | Photo gate |',
 '|---|---|---|---|'])
 for r in rows[:40]:
  lines.append('| '+ ' | '.join([r['sourceObjectId'],clean(r['title'],65).replace('|','/'),
    clean(r['artist']).replace('|','/'),r['disposition']])+' |')
 lines.extend(['','The original source and its photograph rights are different legal subjects. No public-domain or CC0 claim inferred from the museum name. No visual beauty grade inferred from artist/title.'])
 MD.write_text('\n'.join(lines)+'\n',encoding='utf-8')
 print(json.dumps({'scope':report['scope'],'counts':report['counts'],'contactSheets':sheet_paths},indent=2))
if __name__=='__main__':main()
