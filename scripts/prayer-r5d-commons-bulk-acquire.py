#!/usr/bin/env python3
"""Commons source-file acquisition for 20 approved works; NEVER publication clearance."""
import hashlib,html,json,re,sys,time
from urllib.error import HTTPError
from pathlib import Path
from urllib.parse import urlencode,unquote,urlparse
from urllib.request import Request,urlopen
from io import BytesIO
from PIL import Image
ROOT=Path(__file__).resolve().parent.parent
master=json.loads((ROOT/"data/pray/artwork-r5c-bulk-acquisition-73-source-groups-20261103.v1.json").read_text())
batch=sys.argv[1] if len(sys.argv)>1 else 'a'
if batch not in ('a','b'):raise SystemExit('Batch a or b')
candidates=[g for g in master['groups'] if (g.get('sourcePage') or '').startswith('https://commons.wikimedia.org/wiki/File:') and 'Prado' not in (g.get('sourcePage') or '')]
selected=candidates[:20]
assert len(selected)==20
items=selected[:10] if batch=='a' else selected[10:]
OUT=ROOT/f'r5d-commons-{batch}';OUT.mkdir(exist_ok=True)
HEADERS={'User-Agent':'AdOrientemSourceAudit/1.0 (source verification, not public release)','Accept':'application/json,image/*'}
def get(url,limit=36*1024*1024):
    parsed=urlparse(url)
    if parsed.scheme!='https' or parsed.hostname not in ('commons.wikimedia.org','upload.wikimedia.org','thumb.wikimedia.org'):
        raise ValueError('Unapproved Commons host: '+url)
    # Respect Wikimedia throttling. One bounded retry honoring Retry-After, no rapid retries.
    try:
        stream=urlopen(Request(url,headers=HEADERS),timeout=65)
    except HTTPError as e:
        if e.code!=429: raise
        try: delay=min(45,max(10,int(e.headers.get('Retry-After','15'))))
        except ValueError: delay=15
        print(f"Wikimedia 429: waiting {delay}s once before retry",file=sys.stderr)
        time.sleep(delay)
        stream=urlopen(Request(url,headers=HEADERS),timeout=65)
    with stream as r:
        final=urlparse(r.geturl())
        if final.scheme!='https' or final.hostname not in ('commons.wikimedia.org','upload.wikimedia.org'):
            raise ValueError('Unapproved redirect: '+r.geturl())
        data=r.read(limit+1)
        if len(data)>limit:raise ValueError('Image exceeds 36 MB research limit')
        return data
def normalize(s):return re.sub(r'<[^>]+>',' ',html.unescape(s or '')).strip()
results=[]
for g in items:
    page=g['sourcePage']
    title='File:'+unquote(page.split('/wiki/File:',1)[1]).replace('_',' ')
    if results: time.sleep(2.5)  # Wikimedia considerate pacing between files
    row={'source_page':page,'master_artist':g['artist'],'master_title':g['title'],
         'approved_slots':[s for s in g['slots'] if s not in g.get('rosaryDeferred',[])],
         'rosary_deferred':g.get('rosaryDeferred',[]),'publication_authorized':False,
         'visual_qa':'PENDING','reader_qa':'PENDING'}
    try:
        params=urlencode({'action':'query','format':'json','titles':title,'prop':'imageinfo',
                          'iiprop':'url|size|extmetadata','iiurlwidth':2400})
        resp=json.loads(get('https://commons.wikimedia.org/w/api.php?'+params))
        pages=resp.get('query',{}).get('pages',{})
        if len(pages)!=1:raise ValueError('Nonunique Commons page response')
        obj=next(iter(pages.values()))
        if 'missing' in obj or not obj.get('imageinfo'):raise ValueError('Commons file page missing imageinfo')
        info=obj['imageinfo'][0]
        meta=info.get('extmetadata') or {}
        license_short=normalize(meta.get('LicenseShortName',{}).get('value'))
        license_url=meta.get('LicenseUrl',{}).get('value')
        usage=normalize(meta.get('UsageTerms',{}).get('value'))
        credit=normalize(meta.get('Artist',{}).get('value'))
        row.update(commons_title=obj.get('title'),license_short=license_short,
                   license_url=license_url,usage_terms=usage,commons_artist=credit,
                   original_file_url=info.get('url'),original_width=info.get('width'),
                   original_height=info.get('height'))
        # No automatic release. Even PD-Art and CC0 require exact-file and national-rule review.
        allowed=any(tag in (license_short+' '+str(license_url)+' '+usage).lower() for tag in
                    ('public domain','pd-art','pd-old','cc0','creative commons cc0'))
        if not allowed:raise ValueError('Rights evidence requires manual review: '+license_short)
        url=info.get('thumburl') or info.get('url')
        if not url:raise ValueError('No image URL')
        binary=get(url)
        im=Image.open(BytesIO(binary));im.verify()
        im=Image.open(BytesIO(binary))
        if min(im.size)<1000:raise ValueError('Insufficient dimensions for source-stage QA: '+str(im.size))
        if im.format not in ('JPEG','PNG','TIFF'):raise ValueError('Unsupported format: '+str(im.format))
        extension={'JPEG':'.jpg','PNG':'.png','TIFF':'.tif'}[im.format]
        filename='commons-'+hashlib.sha256(page.encode()).hexdigest()[:15]+extension
        (OUT/filename).write_bytes(binary)
        row.update(status='ACQUIRED_FOR_QA',research_image_file=filename,research_image_url=url,
                   resolution=list(im.size),sha256=hashlib.sha256(binary).hexdigest(),bytes=len(binary),
                   image_format=im.format,source_rendition=bool(info.get('thumburl')))
    except Exception as e:
        row.update(status='HOLD',hold_reason=str(e))
    results.append(row)
report={'schema':'AO_PRAYER_R5D_COMMONS_BULK_RESEARCH_V1','batch':batch,'groups':len(results),
        'acquired':sum(x['status']=='ACQUIRED_FOR_QA' for x in results),
        'holds':sum(x['status']=='HOLD' for x in results),
        'approved_nonrosary_slots':sum(len(x['approved_slots']) for x in results),
        'publication_authorized':False,'records':results}
(OUT/'evidence.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'batch':batch,'acquired':report['acquired'],'holds':report['holds'],
                  'results':[{'title':x['master_title'],'status':x['status'],'hold':x.get('hold_reason')} for x in results]},indent=2))
# Holds are evidence, not a reason to discard independently successful files.
