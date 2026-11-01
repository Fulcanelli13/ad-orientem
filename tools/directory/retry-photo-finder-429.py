#!/usr/bin/env python3
"""One shot: retry exactly eight previous HTTP-429 first-choice Commons sources, research only."""
import csv,datetime as dt,importlib.util,json,os,pathlib,shutil,tempfile,time,hashlib
ROOT=pathlib.Path(__file__).resolve().parents[2]
DIR=ROOT/'data/geography/research/photo-finder-20261030'
LEDGER=DIR/'releases/unpublished-selected-112-recovery-audit-20261101.v1.json'
REPORT=DIR/'releases/retry-429-source-verification-20261101.v1.json'
OUTPUT=DIR/'recovered-429'
spec=importlib.util.spec_from_file_location('existing_source_verifier',ROOT/'tools/directory/release-photo-finder-decisions.py')
adapter=importlib.util.module_from_spec(spec);spec.loader.exec_module(adapter)
def prepared():
 audit=json.loads(LEDGER.read_text(encoding='utf-8'))
 assert audit['schema']=='AO_UNPUBLISHED_SELECTED_PLACE_PHOTO_RECOVERY_V1'
 held=[x for x in audit['items'] if x['disposition']=='source_access_429']
 assert len(held)==8 and len(set(x['place_id'] for x in held))==8
 assert all(x['source_batch'] in (4,7,9) and '429' in x['exception_reason'] for x in held)
 with adapter.CREDITS.open(encoding='utf-8-sig',newline='') as f:rows=list(csv.DictReader(f))
 cover=adapter.load_json(adapter.COVERS);gallery=adapter.load_json(adapter.GALLERY)
 origin,origin_gallery=adapter.frozen_original_schedule(cover,gallery)
 plan=adapter.source_status(rows,adapter.load_json(adapter.DECISIONS),adapter.load_json(adapter.PLACES),origin,origin_gallery)
 choices={x['place_id']:x for x in plan['tasks'] if x['role']=='cover' and x['rank']==1}
 tasks=[]
 for h in held:
  pid=h['place_id']
  assert not any(x['place_id']==pid for x in cover['items'])
  x=choices[pid]
  assert x['title']==h['selected_file'] and x['sha1']==h['source_sha1_claim']
  assert x['license']==adapter.POLICY[h['claimed_licence']]
  tasks.append(x)
 return tasks
def main():
 tasks=prepared()
 if os.getenv('AO_429_DRY_RUN')=='1':
  print('PASS exact eight frozen HTTP 429 retries selected without network')
  return
 assert not REPORT.exists() and not OUTPUT.exists(),'Do not overwrite previous verification'
 last=[0.0]
 def polite(f,*args):
  delay=12-(time.monotonic()-last[0])
  if last[0] and delay>0:time.sleep(delay)
  last[0]=time.monotonic()
  return f(*args)
 with tempfile.TemporaryDirectory(prefix='ao-frozen-429-') as td:
  result=adapter.verify_and_stage(tasks,pathlib.Path(td)/'verified',
   apply=False,metadata_loader=lambda x:polite(adapter.stage.api_metadata,x),
   downloader=lambda u,cap:polite(adapter.stage.fetch,u,cap))
  assert result['attempted']==8 and result['verified_visible_in_running_app']==0
  assert result['new_files_in_app_tree']==0
  assert len(result['media_records'])+len(result['exceptions'])==8
  if result['media_records']:OUTPUT.mkdir()
  for record in result['media_records']:
   src=pathlib.Path(record.pop('local'))
   assert src.name==pathlib.Path(record['item']['asset_path']).name
   dst=OUTPUT/src.name
   assert not dst.exists()
   shutil.copyfile(src,dst)
   assert hashlib.sha256(dst.read_bytes()).hexdigest()==record['item']['derivative_sha256']
   record['research_blob_path']=dst.relative_to(ROOT).as_posix()
   record['publication_status']='RESEARCH_ONLY_NOT_APPROVED_FOR_MAIN'
  payload={'schema':'AO_PHOTO_FINDER_429_RETRY_RESEARCH_V1',
   'as_of':dt.datetime.now(dt.timezone.utc).isoformat(),
   'source_ledger':LEDGER.relative_to(ROOT).as_posix(),
   'attempted':8,'verified_research_only':len(result['media_records']),
   'still_held':len(result['exceptions']),'staged':result['media_records'],
   'exceptions':result['exceptions'],'verified_visible_in_running_app':0,
   'no_new_editorial_decisions':True,'no_automatic_substitutions':True,
   'no_approved_media_or_gallery_registry_changes':True}
  REPORT.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
  print('RESEARCH_RESULT',json.dumps({'attempted':8,
   'verified':payload['verified_research_only'],'held':payload['still_held']}))
if __name__=='__main__':main()
