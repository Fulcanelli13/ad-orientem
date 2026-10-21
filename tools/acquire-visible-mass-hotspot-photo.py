from pathlib import Path
from io import BytesIO
from urllib.parse import urlencode
import json,time,requests
from PIL import Image,ImageOps
name='The High Altar - geograph.org.uk - 6213275.jpg'
api='https://commons.wikimedia.org/w/api.php'
s=requests.Session();s.headers['User-Agent']='AdOrientemVisibleMass/0.4 (github.com/Fulcanelli13/ad-orientem)'
params={'action':'query','format':'json','formatversion':'2','prop':'imageinfo','iiprop':'url|extmetadata','iiurlwidth':2200,'titles':'File:'+name}
r=s.get(api,params=params,timeout=60);r.raise_for_status()
p=r.json()['query']['pages'][0];assert 'missing' not in p,p
info=p['imageinfo'][0]; print('source',info.get('thumburl'))
im=None
for url in dict.fromkeys([info.get('thumburl'),info.get('url')]):
 if not url:continue
 for n in range(3):
  try:
   t=s.get(url,timeout=80);t.raise_for_status();im=Image.open(BytesIO(t.content));im.load();break
  except Exception as e:
   print('retry',str(e)[:140],flush=True);time.sleep(3*(n+1))
 if im:break
assert im is not None
assert im.width/im.height > 1.2
out=Path('dist/visible-mass-altar-pilot');out.mkdir(parents=True,exist_ok=True)
im=ImageOps.exif_transpose(im).convert('RGB')
im.thumbnail((2200,2200),Image.Resampling.LANCZOS)
im.save(out/'sanctuary-geograph.jpg',quality=86,optimize=True)
print('OK',im.size,(out/'sanctuary-geograph.jpg').stat().st_size)
metadata=info.get('extmetadata',{})
plain=lambda k:metadata.get(k,{}).get('value','')
(out/'sanctuary-metadata.json').write_text(json.dumps({'name':name,'source':'https://commons.wikimedia.org/wiki/File:'+name.replace(' ','_'),'artist':plain('Artist'),'license':plain('LicenseShortName'),'licenseUrl':plain('LicenseUrl'),'photoCoordinatesInPilot':True},indent=2))
