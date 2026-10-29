#!/usr/bin/env python3
"""Bounded P100 exact Commons image-original download test. Image stays in RAM."""
from urllib.parse import urlencode, quote
from urllib.request import urlopen, Request
from urllib.error import URLError, HTTPError
import hashlib, json, time
FILE='File:Church of Our Lady of Lourdes and St Cecilia, Whitecliff Mill Street, Blandford Forum (September 2025) (4).jpg'
KNOWN='https://upload.wikimedia.org/wikipedia/commons/3/39/Church_of_Our_Lady_of_Lourdes_and_St_Cecilia%2C_Whitecliff_Mill_Street%2C_Blandford_Forum_%28September_2025%29_%284%29.jpg'
EXPECTED='d7c7524559edea69e0f3b0b54f2d83e5fde87f3a'
UA='AdOrientemP100PhotoAudit/0.1 (https://github.com/Fulcanelli13/ad-orientem; source verification, no publication)'
params={'action':'query','format':'json','titles':FILE,'prop':'imageinfo','iiprop':'url|sha1|size|mime|timestamp'}
api='https://commons.wikimedia.org/w/api.php?'+urlencode(params)
def load(url,limit=12_000_000):
    with urlopen(Request(url,headers={'User-Agent':UA,'Accept':'application/json,image/jpeg,*/*'}),timeout=30) as r:
        hdr=dict(r.headers)
        buf=r.read(limit+1)
        if len(buf)>limit: raise ValueError('download exceeds bounded limit')
        return buf, hdr, r.geturl()
info=None
try:
    data,_,_=load(api,2000000)
    page=next(iter(json.loads(data)['query']['pages'].values()))
    info=page.get('imageinfo',[None])[0]
    print('P100_API '+json.dumps(info,sort_keys=True))
except Exception as e:print('P100_API_ERROR '+repr(e))
url=info.get('url') if info else KNOWN
try:
    b,h,final=load(url)
    if not b.startswith(b'\\xff\\xd8'): raise ValueError('not JPEG')
    sha1=hashlib.sha1(b).hexdigest()
    sha256=hashlib.sha256(b).hexdigest()
    result={'file':FILE,'url':final,'bytes':len(b),'sha1_computed':sha1,'sha256_computed':sha256,'expected_ledger_sha1':EXPECTED,'matches_ledger':sha1==EXPECTED,'matches_api': sha1==info.get('sha1') if info and info.get('sha1') else None,'content_type':h.get('Content-Type'),'rights_approved':False,'visual_fullres_approved':False,'published':False}
    print('P100_PROBE_RESULT_JSON '+json.dumps(result,sort_keys=True),flush=True)
    if sha1!=EXPECTED:raise ValueError('Original differs from ledger SHA1')
except Exception as e:
    print('P100_DOWNLOAD_ERROR '+repr(e),flush=True)
    raise
