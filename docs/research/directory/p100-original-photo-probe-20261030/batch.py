#!/usr/bin/env python3
"""Research only: fetch P98 Commons originals ephemerally; hash and decode, no image archive."""
from concurrent.futures import ThreadPoolExecutor
from io import BytesIO
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import urlopen, Request
from datetime import datetime, timezone
import hashlib, json, math

ROOT=Path(__file__).resolve().parents[4]
MANIFEST=ROOT/'docs/research/directory/p98-originals-release-gate-20261029/p98-original-verification-queue.json'
UA='AdOrientemP100PhotoAudit/0.1 (https://github.com/Fulcanelli13/ad-orientem; source verification, no publication)'
CAP=55_000_000
try:
    from PIL import Image, ImageOps
    PIL_AVAILABLE=True
except ImportError:
    PIL_AVAILABLE=False

class Plain(HTMLParser):
    def __init__(self):super().__init__();self.parts=[]
    def handle_data(self, s):self.parts.append(s)
def plaintext(s):
    if not s:return None
    h=Plain()
    try:h.feed(s);return ' '.join(' '.join(h.parts).split())[:1200]
    except Exception:return str(s)[:1200]
def get(url, limit):
    req=Request(url,headers={'User-Agent':UA,'Accept':'application/json,image/jpeg,*/*'})
    with urlopen(req,timeout=45) as response:
        body=response.read(limit+1)
        if len(body)>limit:raise ValueError('original exceeds bounded per-file size cap')
        return body,response.geturl()
def source_info(title):
    params={'action':'query','format':'json','titles':title,'prop':'imageinfo','iiprop':'url|sha1|size|mime|timestamp|extmetadata'}
    api='https://commons.wikimedia.org/w/api.php?'+urlencode(params)
    data,_=get(api,1_500_000)
    page=next(iter(json.loads(data)['query']['pages'].values()))
    if 'missing' in page or not page.get('imageinfo'):raise ValueError('exact imageinfo not returned')
    return page['imageinfo'][0],page.get('title')
def diagnostics(b):
    if not PIL_AVAILABLE:return {'pillow_decoding_available':False,'decoded_full_original':False}
    with Image.open(BytesIO(b)) as i:
        fmt=i.format
        width,height=i.size
        orientation=i.getexif().get(274)
        i.load()
        mode=i.mode
        sample=ImageOps.exif_transpose(i).convert('L')
        sample.thumbnail((768,768))
        hist=sample.histogram()
        total=sum(hist)
        mean=sum(n*v for v,n in enumerate(hist))/total
        dark=sum(hist[:6])/total
        bright=sum(hist[250:])/total
        entropy=-sum(p*math.log2(p) for n in hist if (p:=n/total)>0)
        return {'pillow_decoding_available':True,'decoded_full_original':True,'codec_format':fmt,
                'decoded_original_pixels':{'width':width,'height':height},'mode':mode,
                'exif_orientation':orientation,'sampled_mean_grayscale_0_255':round(mean,2),
                'sampled_dark_clipped_pct':round(dark*100,2),'sampled_bright_clipped_pct':round(bright*100,2),
                'sampled_luminance_entropy_bits':round(entropy,3),
                'diagnostic_scope':'DECODE_VALIDITY_AND_EXPOSURE_INDICATORS_ONLY_NOT_ARTISTIC_APPROVAL'}
def verify(row):
    item={'contact_index':row['contact_index'],'physical_anchor_id':row['physical_anchor_id'],
          'commons_file_title':row['commons_file_title'],'exact_commons_file_page':row['exact_commons_source_url'],
          'prior_ledger_sha1':row['original_sha1_from_prior_ledger_UNVERIFIED'],
          'original_downloaded':False,'sha1_recomputed':None,'sha256_recomputed':None,
          'matches_ledger_sha1':None,'matches_current_commons_sha1':None,
          'full_resolution_decoded':False,'technical_quality_diagnostics_only':True,
          'copyright_clearance_completed':False,'editorial_approved':False,'production_published':False}
    try:
        info,title=source_info(row['commons_file_title'])
        md=info.get('extmetadata') or {}
        getv=lambda k:md.get(k,{}).get('value')
        item['source_imageinfo']={'canonical_page_title':title,'url':info['url'],'sha1':info.get('sha1'),
             'size':info.get('size'),'width':info.get('width'),'height':info.get('height'),
             'mime':info.get('mime'),'timestamp':info.get('timestamp'),
             'license_short_name_observed':plaintext(getv('LicenseShortName')),
             'license_url_observed':getv('LicenseUrl'),'artist_observed':plaintext(getv('Artist')),
             'credit_observed':plaintext(getv('Credit')),
             'attribution_required_claim':plaintext(getv('AttributionRequired')),
             'copyrighted_claim':plaintext(getv('Copyrighted'))}
        data,actual_url=get(info['url'],CAP)
        if not data.startswith(bytes((255,216))):raise ValueError('download is not JPEG')
        sha1=hashlib.sha1(data).hexdigest()
        item.update(original_downloaded=True,original_byte_count=len(data),
                    original_url_after_redirect=actual_url,
                    sha1_recomputed=sha1,sha256_recomputed=hashlib.sha256(data).hexdigest(),
                    matches_ledger_sha1=sha1==row['original_sha1_from_prior_ledger_UNVERIFIED'],
                    matches_current_commons_sha1=sha1==info.get('sha1'),
                    matches_commons_byte_count=len(data)==info.get('size'))
        item['pixel_diagnostics']=diagnostics(data)
        item['full_resolution_decoded']=item['pixel_diagnostics'].get('decoded_full_original',False)
        item['technical_result']='PASS_ORIGINAL_INTEGRITY' if (
            item['matches_ledger_sha1'] and item['matches_current_commons_sha1'] and
            item['matches_commons_byte_count'] and item['full_resolution_decoded']
        ) else 'HOLD_INTEGRITY_OR_DECODING_EXCEPTION'
    except Exception as error:
        item['technical_result']='HOLD_FETCH_OR_SOURCE_EXCEPTION'
        item['error_type']=type(error).__name__
        item['error_message']=str(error)[:500]
    return item
def main():
    rows=json.loads(MANIFEST.read_text(encoding='utf8'))['original_verification_candidate_queue']
    assert len(rows)==31 and len({x['contact_index'] for x in rows})==31
    entries=[]
    with ThreadPoolExecutor(max_workers=2) as pool:
        for item in pool.map(verify,rows):
            entries.append(item)
            print('P100_ITEM',item['contact_index'],item['technical_result'],item.get('original_byte_count'),item.get('error_message',''),flush=True)
    states=['PASS_ORIGINAL_INTEGRITY','HOLD_INTEGRITY_OR_DECODING_EXCEPTION','HOLD_FETCH_OR_SOURCE_EXCEPTION']
    counts={k:sum(x['technical_result']==k for x in entries) for k in states}
    report={'schema':'AO_P100_TRANSIENT_ORIGINAL_BYTE_AND_DECODING_EVIDENCE_V1',
           'generated_at_utc':datetime.now(timezone.utc).isoformat(),
           'run_environment':'GitHub public repository ubuntu-latest ephemeral runner',
           'scope':'Technical original acquisition, hashing and image decoding ONLY; no image archive',
           'candidate_count':len(rows),'pillow_used_for_full_decode':PIL_AVAILABLE,'counts':counts,
           'new_image_files_committed':0,'new_images_published':0,'final_rights_approvals':0,
           'editorial_acceptance':0,'entries':entries}
    print('P100_BATCH_REPORT_JSON '+json.dumps(report,ensure_ascii=False,separators=(',',':')),flush=True)
    print('P100_BATCH_SUMMARY '+json.dumps(counts),flush=True)
    if counts['PASS_ORIGINAL_INTEGRITY']<1:raise SystemExit('No originals verified')
if __name__=='__main__':main()
