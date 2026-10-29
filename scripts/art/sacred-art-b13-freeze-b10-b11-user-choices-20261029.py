#!/usr/bin/env python3
"""Freeze full B10 and B11 user choices by restoring 250 source IDs each.

The two compact uploads retain exactly all positive source IDs, and every
correction string; full reject complement is derived from immutable original
batch source IDs after comparing batch identity SHA256.
"""
import base64,collections,hashlib,json,zlib
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2];D=ROOT/'data/calendar'
BATCHES=[
 ('B10','sacred-art-b10-final-250-combined-20261029.v1.json',
 'sacred-art-b10-user-choice-bundle-20261029.b64.txt',
 '29d632cf085efe00effd3997f63430509f048407aa23561b143f8ab675949936',
 {'IMPORT':97,'IMPORT_WITH_CORRECTIONS':4,'REJECT':149}),
 ('B11','sacred-art-b11-final-250-merged-verified-20261029.v1.json',
 'sacred-art-b11-user-choice-bundle-20261029.b64.txt',
 'cfb1ede9d289936a61b8ed1a0eebfd205b97410cba371e44d55cc2706ea6c1b7',
 {'IMPORT':115,'IMPORT_WITH_CORRECTIONS':1,'REJECT':134}),
]
for b,src,pickfile,userfile_sha,expected in BATCHES:
 source=json.loads((D/src).read_text())
 raw=base64.b64decode((D/pickfile).read_text().strip())
 choices=json.loads(zlib.decompress(raw))
 assert choices['batch']==b
 src_hash=source['batchSha256'] if b=='B10' else source['batchHash']
 assert src_hash==choices['batchSha256']
 srcids=[x['id'] for x in source['rows']]
 assert len(srcids)==250 and len(set(srcids))==250
 imps=set(choices['import']);corrections=choices['corrections']
 assert not imps.intersection(corrections) and set(corrections).issubset(srcids)
 assert imps.issubset(srcids)
 records=[]
 for x in source['rows']:
  sid=x['id']
  action=('IMPORT' if sid in imps else 'IMPORT_WITH_CORRECTIONS' if sid in corrections else 'REJECT')
  records.append({'sourceId':sid,'decision':action,
   'corrections':corrections.get(sid),'title':x.get('title'),
   'artist':x.get('artist'),'sourceInstitution':x.get('sourceInstitution'),
   'productionImported':False})
 counts=dict(collections.Counter(x['decision'] for x in records))
 assert counts==expected,(b,counts)
 result={'schema':'AO_SACRED_ART_VERIFIED_USER_DECISIONS_V2',
  'batchId':b,'date':'2026-10-29','completeBatch':True,
  'originalUploadedFileSha256':userfile_sha,
  'originalBatchSha256':src_hash,'sourceRowCount':250,
  'counts':counts,
  'note':'Full all-250 selections reconstructed from uploaded user import IDs and correction strings against immutable original gallery source. Any absent source ID is REJECT only because user uploaded completeBatch=true. Original user file integrity SHA256 stored separately.',
  'noProductionImports':True,'decisions':records}
 out=D/f'sacred-art-{b.lower()}-user-final-decisions-20261029.v2.json'
 out.write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
 print('USER_DECISIONS_FROZEN',b,counts,'fileSha',userfile_sha)
