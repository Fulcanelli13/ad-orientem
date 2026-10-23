#!/usr/bin/env python3
"""Ad Orientem research-only original-image acquisition from reviewed source leads.

Independent gates: source identity, verified licence metadata, technical acquisition,
visual inspection, Scripture placement, editorial publication. Never auto-publishes.
"""
import argparse, csv, hashlib, json, os, pathlib, re, time
from datetime import datetime, timezone
from urllib.parse import urlencode, urlsplit, quote
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError
from PIL import Image, ImageFile

USER_AGENT = 'AdOrientem-SacredArtResearch/1.0 (https://github.com/Fulcanelli13/ad-orientem)'
DEFAULT_LIMIT = 45
DEFAULT_BYTE_BUDGET = 650 * 1024 * 1024
MAX_SINGLE_BYTES = 95 * 1024 * 1024
Image.MAX_IMAGE_PIXELS = 165_000_000
FIELDS = ['asset_source_id','record_id','source_sheet','source_row','title','artist','source_type','rights_claim_unverified','metadata_status','metadata_license','metadata_license_url','institution_public_domain','resolved_original_url','reported_width','reported_height','reported_bytes','download_status','bytes_acquired','sha256','decoded_width','decoded_height','format','resolution_gate','rights_gate','editorial_gate','failure','source_url','source_evidence_link','related_records','checked_utc']

def now():return datetime.now(timezone.utc).isoformat(timespec='seconds')
def request_json(url):
    req=Request(url,headers={'User-Agent':USER_AGENT,'Accept':'application/json','Accept-Encoding':'identity'})
    with urlopen(req,timeout=35) as response:
        return json.load(response)
def safe_url(url):
    if not isinstance(url,str) or urlsplit(url).scheme!='https':
        raise ValueError('https source required')
    host=urlsplit(url).hostname or ''
    if host not in ('upload.wikimedia.org','images.metmuseum.org','openaccess-cdn.clevelandart.org','openaccess-cdn.clevelandart.org', 'www.clevelandart.org','clevelandart.org') and not host.endswith('.clevelandart.org'):
        raise ValueError('image CDN host not approved: '+host)
    return url

def license_ok(name):
    n=re.sub(r'\s+',' ',(name or '').strip().lower().replace('-', ' '))
    return n.startswith(('cc0','cc by','public domain','pd art','public domain mark')) and ' nc ' not in (' '+n+' ') and ' nd ' not in (' '+n+' ')

def get_str(obj,key):
    val=obj.get(key,{}) if isinstance(obj,dict) else {}
    if isinstance(val,dict):return str(val.get('value',''))
    return str(val or '')

def batch_commons_metadata(records):
    result={}
    commons=[r for r in records if r['api_type']=='commons' and r['download_gate']=='METADATA_FIRST']
    # All titles are directly from the existing artwork workbook; no image-name inventions.
    for start in range(0,len(commons),12):
        group=commons[start:start+12]
        ids='|'.join(r['commons_title'] for r in group)
        params=urlencode({'action':'query','prop':'imageinfo','iiprop':'url|size|mime|extmetadata','iiextmetadatafilter':'LicenseShortName|LicenseUrl|Copyrighted','format':'json','formatversion':2,'titles':ids})
        url='https://commons.wikimedia.org/w/api.php?'+params
        try:
            payload=request_json(url)
            by_title={str(p.get('title','')).casefold():p for p in payload.get('query',{}).get('pages',[])}
            for rec in group:
                page=by_title.get(rec['commons_title'].casefold())
                # Name normalization/redirects may alter capitalization: fall back to title without case.
                if page is None:
                    page=next((p for p in payload.get('query',{}).get('pages',[]) if p.get('title','').replace('_',' ').casefold()==rec['commons_title'].replace('_',' ').casefold()),None)
                info=(page or {}).get('imageinfo',[None])[0] if page else None
                if not info:
                    result[rec['asset_source_id']]={'metadata_status':'COMMONS_FILE_UNRESOLVED','failure':'Commons imageinfo did not identify source file'}
                    continue
                ext=info.get('extmetadata') or {}
                lic=get_str(ext,'LicenseShortName')
                result[rec['asset_source_id']]={'metadata_status':'SOURCE_METADATA_VERIFIED','metadata_license':lic,'metadata_license_url':get_str(ext,'LicenseUrl'), 'resolved_original_url':info.get('url',''), 'reported_width':info.get('width',''), 'reported_height':info.get('height',''), 'reported_bytes':info.get('size',''), 'institution_public_domain':'COMMONS_FILE_METADATA', 'rights_gate':('OPEN_LICENSE_FILE_METADATA_RECORDED' if license_ok(lic) else 'RIGHTS_REVIEW_NO_AUTO_DOWNLOAD')}
        except Exception as exc:
            for rec in group:result[rec['asset_source_id']]={'metadata_status':'COMMONS_API_FAILED','failure':str(exc)[:250]}
    return result

def museum_metadata(rec):
    url=rec['source_url']
    if rec['api_type']=='met':
        match=re.search(r'/search/(\d+)',url)
        if not match:raise ValueError('Met object number missing')
        data=request_json('https://collectionapi.metmuseum.org/public/collection/v1/objects/'+match.group(1))
        lic='Met Public Domain' if data.get('isPublicDomain') is True else 'Met copyright not certified'
        img=data.get('primaryImage') or ''
        return dict(metadata_status='SOURCE_METADATA_VERIFIED',metadata_license=lic,institution_public_domain='YES' if data.get('isPublicDomain') is True else 'NO',resolved_original_url=img,rights_gate='OPEN_INSTITUTION_EVIDENCE' if data.get('isPublicDomain') is True else 'RIGHTS_REVIEW_NO_AUTO_DOWNLOAD',source_evidence_link='https://www.metmuseum.org/about-the-met/policies-and-documents/open-access')
    if rec['api_type']=='cleveland':
        match=re.search(r'/art/([0-9.]+)',url)
        if not match:raise ValueError('Cleveland accession missing')
        data=request_json('https://openaccess-api.clevelandart.org/api/artworks/'+match.group(1)+'/?cc0').get('data') or {}
        license_name=str(data.get('share_license_status') or '')
        image=data.get('images') or {}
        full=image.get('full') or image.get('print') or image.get('web') or {}
        img=full.get('url') if isinstance(full,dict) else ''
        ok='CC0' in license_name.upper()
        return dict(metadata_status='SOURCE_METADATA_VERIFIED',metadata_license=license_name,institution_public_domain='YES' if ok else 'NO',resolved_original_url=img or '',rights_gate='OPEN_INSTITUTION_EVIDENCE' if ok else 'RIGHTS_REVIEW_NO_AUTO_DOWNLOAD',source_evidence_link='https://www.clevelandart.org/open-access')
    raise ValueError('Institutional original-image route requires research')

def download(rec, out_dir, budget):
    url=safe_url(rec['resolved_original_url'])
    name=rec['asset_source_id']
    base=out_dir/name
    for old in out_dir.glob(name+'.*'):
        if old.suffix in ('.jpg','.png','.tiff','.webp'):
            with old.open('rb') as f: sha=hashlib.sha256(f.read()).hexdigest()
            with Image.open(old) as im:im.load();w,h=im.size;fmt=im.format
            return {'download_status':'ALREADY_PRESENT_REVERIFIED','bytes_acquired':old.stat().st_size,'sha256':sha,'decoded_width':w,'decoded_height':h,'format':fmt,'resolution_gate':('LONG_EDGE_2400_PASS' if max(w,h)>=2400 else 'RESOLUTION_REVIEW')},0
    temp=base.with_suffix('.partial')
    sha=hashlib.sha256(); size=0
    try:
        req=Request(url,headers={'User-Agent':USER_AGENT,'Accept':'image/*','Accept-Encoding':'identity'})
        with urlopen(req,timeout=65) as response, temp.open('wb') as dest:
            ct=response.headers.get('Content-Type','').lower()
            if ct and not (ct.startswith('image/') or ct=='application/octet-stream'):
                raise ValueError('Not an image content-type: '+ct)
            while True:
                block=response.read(1024*1024)
                if not block:break
                size+=len(block)
                if size>MAX_SINGLE_BYTES:raise ValueError('over individual size cap')
                if size>budget:raise ValueError('over wave byte budget')
                sha.update(block);dest.write(block)
        if size<10000:raise ValueError('downloaded response too small')
        with Image.open(temp) as im:
            im.load();w,h=im.size;fmt=(im.format or '').upper()
        ext={'JPEG':'.jpg','PNG':'.png','TIFF':'.tiff','WEBP':'.webp'}.get(fmt)
        if ext is None: raise ValueError('unsupported format '+fmt)
        final=base.with_suffix(ext);temp.rename(final)
        return {'download_status':'ACQUIRED_DECODED_SHA256','bytes_acquired':size,'sha256':sha.hexdigest(),'decoded_width':w,'decoded_height':h,'format':fmt,'resolution_gate':('LONG_EDGE_2400_PASS' if max(w,h)>=2400 else 'RESOLUTION_REVIEW')},size
    finally:
        temp.unlink(missing_ok=True)

def main():
    parser=argparse.ArgumentParser()
    parser.add_argument('--manifest',required=True)
    parser.add_argument('--output',default='artifacts/art-wave150')
    parser.add_argument('--max-files',type=int,default=DEFAULT_LIMIT)
    parser.add_argument('--max-bytes',type=int,default=DEFAULT_BYTE_BUDGET)
    parser.add_argument('--metadata-only',action='store_true')
    parser.add_argument('--prior-audit',default='data/research/sacred-art-b20-wave150.audit.csv')
    args=parser.parse_args()
    out=pathlib.Path(args.output);out.mkdir(parents=True,exist_ok=True)
    image_dir=out/'originals';image_dir.mkdir(exist_ok=True)
    manifest=json.loads(pathlib.Path(args.manifest).read_text(encoding='utf-8'))
    sources=manifest['records']
    commons_metadata=batch_commons_metadata(sources)
    prior={}
    if args.prior_audit and pathlib.Path(args.prior_audit).is_file():
        with pathlib.Path(args.prior_audit).open(encoding='utf-8',newline='') as file:
            prior={r['asset_source_id']:r for r in csv.DictReader(file) if r.get('download_status') in ('ACQUIRED_DECODED_SHA256','VERIFIED_PRIOR_BATCH20')}
    downloaded=0;bytes_used=0;results=[];commons_rate_limited=False
    for i,rec in enumerate(sources,1):
        id=rec['asset_source_id']
        entry={k:'' for k in FIELDS}
        entry.update(asset_source_id=id,record_id=rec['record_id'],source_sheet=rec['source_sheet'],source_row=rec['source_row'],title=rec['title'],artist=rec['artist'],source_type=rec['api_type'],rights_claim_unverified=rec.get('recorded_rights',''),source_url=rec['source_url'],related_records=' | '.join(rec.get('related_records',[])),metadata_status='NOT_CHECKED',download_status='NOT_ATTEMPTED',editorial_gate='NOT_APPROVED',rights_gate='PENDING',checked_utc=now())
        gate=rec['download_gate']
        if id in prior and not args.metadata_only:
            previous=prior[id]
            entry.update(metadata_status='PRIOR_B20_AUDIT_VERIFIED',download_status='VERIFIED_PRIOR_BATCH20',sha256=previous.get('sha256',''),resolved_original_url=previous.get('resolved_original_url',''),bytes_acquired=previous.get('bytes_acquired',''),decoded_width=previous.get('decoded_width',''),decoded_height=previous.get('decoded_height',''),format=previous.get('format',''),rights_gate='PRIOR_OPEN_SOURCE_EVIDENCE_RETAINED')
        elif gate=='MANUAL_HOLD':entry.update(metadata_status='MANUAL_HOLD_PRESERVED',download_status='SKIPPED_HOLD',rights_gate='MANUAL_HOLD')
        elif gate=='SKIP_PREVIOUSLY_ACQUIRED':entry.update(metadata_status='PREVIOUS_BATCH19_VERIFIED',download_status='VERIFIED_PRIOR_BATCH19',sha256=rec.get('prior_sha256',''),rights_gate='RETAIN_B19_RESEARCH_EVIDENCE')
        else:
            if rec['api_type']=='commons': entry.update(commons_metadata.get(id,{'metadata_status':'COMMONS_METADATA_UNAVAILABLE'}))
            else:
                try:entry.update(museum_metadata(rec))
                except Exception as exc:entry.update(metadata_status='MUSEUM_API_FAILED',failure=str(exc)[:260],rights_gate='METADATA_NOT_VERIFIED')
            lic=str(entry.get('metadata_license',''))
            permissible=(entry.get('rights_gate') in ('OPEN_LICENSE_FILE_METADATA_RECORDED','OPEN_INSTITUTION_EVIDENCE'))
            if not permissible:entry['download_status']='SKIPPED_RIGHTS_OR_METADATA_GATE'
            elif not entry.get('resolved_original_url'):entry['download_status']='ORIGINAL_ROUTE_UNAVAILABLE'
            elif args.metadata_only:entry['download_status']='METADATA_ONLY'
            elif rec['api_type']=='commons' and commons_rate_limited:entry['download_status']='DEFERRED_COMMONS_RATE_LIMIT'
            elif downloaded>=args.max_files:entry['download_status']='QUEUED_AFTER_FILE_LIMIT'
            elif bytes_used>=args.max_bytes:entry['download_status']='QUEUED_AFTER_BYTE_BUDGET'
            else:
                try:
                    data,delta=download(entry,image_dir,args.max_bytes-bytes_used)
                    entry.update(data);bytes_used+=delta;downloaded+=1
                except (HTTPError,URLError,ValueError,OSError,Image.DecompressionBombError) as exc:
                    if isinstance(exc,HTTPError) and exc.code==429 and rec['api_type']=='commons':
                        commons_rate_limited=True
                        entry.update(download_status='DEFERRED_COMMONS_RATE_LIMIT',failure=str(exc)[:260])
                    else:
                        entry.update(download_status='DOWNLOAD_OR_DECODE_FAILED',failure=str(exc)[:260])
        results.append(entry)
        if i%10==0 or i==len(sources):print(f'PROGRESS {i}/{len(sources)} acquired={downloaded} bytes={bytes_used}',flush=True)
        with (out/'Acquisition_results.csv').open('w',newline='',encoding='utf-8') as f:
            w=csv.DictWriter(f,fieldnames=FIELDS);w.writeheader();w.writerows(results)
    stats={key:sum(r['download_status']==key for r in results) for key in sorted(set(r['download_status'] for r in results))}
    summary={'manifest_count':len(sources),'source_screened':len(results),'metadata_verified':sum(r['metadata_status']=='SOURCE_METADATA_VERIFIED' for r in results),'downloaded_in_this_run':downloaded,'bytes_acquired':bytes_used,'status_counts':stats,'visual_qa_completed':0,'new_publication_approvals':0,'timestamp':now()}
    (out/'Acquisition_summary.json').write_text(json.dumps(summary,indent=2),encoding='utf-8')
    print('SUMMARY '+json.dumps(summary,sort_keys=True),flush=True)

if __name__=='__main__':main()