#!/usr/bin/env python3
"""Finish unrendered Rijks B2 previews from already rights-verified exact IIIF references."""
from pathlib import Path
import io,json,urllib.request,urllib.parse,time
from collections import Counter
from PIL import Image,ImageOps,ImageDraw
ROOT=Path(__file__).resolve().parents[2]
P=ROOT/'data/calendar/sacred-art-rijks-rights-gated-review-b2-20261029.v1.json'
DOC=ROOT/'docs/SACRED_ART_RIJKS_RIGHTS_GATED_REVIEW_B2_20261029.md'
DEST=ROOT/'assets/staged/sacred-art-rijks-b2-20261029'
data=json.loads(P.read_text(encoding='utf8'))
assert data['scope']['recordsScreened']==140 and len(data['records'])==140
assert data['counts']['sourceImageCC0PreviewCount']>=70
assert all(not x['humanApproved'] and not x['productionPublished'] for x in data['records'])
def short(s,n=39):
 s=str(s or '').replace('\n',' ')
 return s[:n-1]+'…' if len(s)>n else s
def get(url):
 p=urllib.parse.urlparse(url)
 if p.scheme!='https' or p.hostname!='iiif.micr.io' or not p.path.endswith('/full/420,/0/default.jpg'):
  raise ValueError('NOT_VERIFIED_IIIF_PREVIEW')
 req=urllib.request.Request(url,headers={'User-Agent':'AdOrientem-SacredArt-Research/1.0 (+https://github.com/Fulcanelli13/ad-orientem)','Accept':'image/jpeg'})
 with urllib.request.urlopen(req,timeout=20) as r:
  if not r.headers.get('Content-Type','').startswith('image/'):raise ValueError('BAD_IMAGE_CONTENT_TYPE')
  b=r.read(3000001)
 if len(b)>3000000:raise ValueError('PREVIEW_TOO_LARGE')
 im=Image.open(io.BytesIO(b))
 return ImageOps.exif_transpose(im).convert('RGB')
todo=[x for x in data['records'] if x['disposition']=='PREVIEW_COUNT_CAP']
errors=[];pictures=[]
for x in todo:
 proof=x['edmImageRightsProof']
 assert (proof['sameObject'] and proof['sameImageService'] and proof['explicitOpenRights']
         and proof['status']=='CC0_OR_PDM' and x['imageRights']=='CC0_OR_PDM'
         and x['status']=='CC0_IMAGE')
 assert min(x['nativeSourceDimensions'].values())>=1800
 url=x['imageService']+'/full/420,/0/default.jpg'
 try:
  im=get(url)
  x['previewURL']=url
  x['disposition']='CC0_RESEARCH_CONTACT_SHEET_ONLY'
  pictures.append((x,im))
 except Exception as e:
  x['disposition']='PREVIEW_FETCH_ERROR_RIGHTS_VERIFIED'
  x['previewError']=type(e).__name__+': '+str(e)[:140]
  errors.append({'sourceObjectId':x['sourceObjectId'],'reason':x['previewError']})
 time.sleep(.14)
pathlist=[]
for start in range(0,len(pictures),24):
 selection=pictures[start:start+24];sheet=Image.new('RGB',(1200,2620),'#faf8f5')
 draw=ImageDraw.Draw(sheet)
 draw.text((15,10),'AD ORIENTEM | VERIFIED RIJKSMUSEUM PDM | WHOLE-IMAGE RESEARCH PREVIEWS ONLY',fill='#342c2c')
 for i,(r,im) in enumerate(selection):
  x=(i%4)*300;y=(i//4)*430+40
  draw.rectangle((x+6,y,x+293,y+416),outline='#ddd5cf',width=1)
  im.thumbnail((282,322),Image.Resampling.LANCZOS)
  sheet.paste(im,(x+150-im.width//2,y+166-im.height//2))
  for j,t in enumerate([short(r['title']),short(r['artist']),r['sourceObjectId']+' '+str(r.get('accession') or '')]):
   draw.text((x+12,y+343+j*22),t,fill='#262322' if j==0 else '#756c62')
 name='contact-%02d.jpg'%(start//24+4)
 file=DEST/name;sheet.save(file,'JPEG',quality=86,optimize=True)
 pathlist.append(str(file.relative_to(ROOT)))
data['contactSheets']+=pathlist
count=Counter(x['disposition'] for x in data['records'])
data['counts']={'sourceImageCC0PreviewCount':count['CC0_RESEARCH_CONTACT_SHEET_ONLY'],
 'imageHoldsAndOther':len(data['records'])-count['CC0_RESEARCH_CONTACT_SHEET_ONLY'],
 'newImageAestheticRatings':0,'nativePhotographsCertified':0,'productionReleases':0,
 'byDisposition':dict(count)}
data['extension']={'batch':'B2_67_UNRENDERED','newRendered':len(pictures),
 'previewErrors':len(errors),'newContactSheets':pathlist,'imageOriginalBytesAcquired':0,
 'newEditorialApprovals':0,'sourceIdentityOrLicenceChanged':False}
data['sourceErrors']+=errors
P.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
base=DOC.read_text(encoding='utf8') if DOC.exists() else '# Rijks visual review B2'
base+='\n\n## Supplementary B2 research previews\n\n'
base+='- Rights-verified additional previews: **'+str(len(pictures))+'**; failures: '+str(len(errors))+'.\n'
base+='- Total rights-verified research previews: **'+str(data['counts']['sourceImageCC0PreviewCount'])+' / 140**.\n'
base+='- Aesthetic and final native photographic certification: **0**. No app release or selection changes.\n\n'
base+='\n'.join('- ['+Path(x).name+'](../'+x+')' for x in pathlist)+'\n'
DOC.write_text(base,encoding='utf8')
print(json.dumps({'additional':len(pictures),'errors':errors,'totalPreview':data['counts']['sourceImageCC0PreviewCount'],
 'sourceHolds':dict(count),'sheets':pathlist},ensure_ascii=False)[:6000])
