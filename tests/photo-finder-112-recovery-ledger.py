import json,csv,collections,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
base=root/'data/geography/research/photo-finder-20261030'
ledger=json.loads((base/'releases/unpublished-selected-112-recovery-audit-20261101.v1.json').read_text(encoding='utf-8'))
decisions=json.loads((base/'decisions.json').read_text(encoding='utf-8'))['decisions']
with (base/'credits.csv').open(encoding='utf-8-sig',newline='') as f:
 credits={(r['place_id'],r['rank']):r for r in csv.DictReader(f)}
assert ledger['schema']=='AO_UNPUBLISHED_SELECTED_PLACE_PHOTO_RECOVERY_V1'
assert len(ledger['items'])==112 and ledger['unpublished_selected_places']==112
assert ledger['approved_covers_baseline']==301
assert len(decisions)==451 and sum(bool(x['files']) for x in decisions.values())==395
assert sum(x['none'] is True for x in decisions.values())==56
assert len({x['place_id'] for x in ledger['items']})==112
counts=collections.Counter(x['disposition'] for x in ledger['items'])
expected={'author_attribution':4,'licence_verification':29,'no_persisted_exception':9,'source_access_429':8,'source_metadata_mismatch':22,'source_size_format':26,'unverified_public_domain_claim':13,'visual_watermark_hold':1}
assert dict(counts)==expected and ledger['counts_by_disposition']==expected
exceptions={}
for n in range(2,19):
 report=json.loads((base/f'releases/b{n}-verification-report.json').read_text(encoding='utf-8'))
 for x in report['exceptions']:
  assert x['place_id'] not in exceptions
  exceptions[x['place_id']]=(n,x)
assert len(exceptions)==89
for x in ledger['items']:
 pid=x['place_id'];choice=decisions[pid]
 assert not choice['none'] and choice['files'][0]==x['selected_file']
 credit=credits[(pid,'1')]
 assert credit['commons_file']==x['selected_file']
 assert credit['original_sha1']==x['source_sha1_claim']
 assert credit['licence']==x['claimed_licence']
 assert credit['author']==x['claimed_author']
 assert [int(credit['width']),int(credit['height'])]==x['claimed_dimensions']
 kind=x['disposition']
 if pid in exceptions:
  n,h=exceptions[pid];reason=h['reason']
  assert x['source_batch']==n and x['exception_reason']==reason
  if kind=='source_access_429':assert '429' in reason
  elif kind=='licence_verification':assert 'licence' in reason
  elif kind=='source_metadata_mismatch':assert 'Decoded original differs' in reason
  elif kind=='source_size_format':assert 'original' in reason
  elif kind=='author_attribution':assert 'author attribution' in reason
  else:raise AssertionError('Unexpected exception '+kind)
 else:
  assert x['source_batch'] is None and x['exception_reason'] is None
  if kind=='unverified_public_domain_claim':assert credit['licence']=='Public domain'
  elif kind=='visual_watermark_hold':assert pid=='place:CU:el-cobre-caridad-basilica'
  else:assert kind=='no_persisted_exception'
hold=json.loads((base/'releases/b8-el-cobre-visual-hold-correction-20261101.v1.json').read_text(encoding='utf-8'))
assert hold['visual_hold']['place_id']=='place:CU:el-cobre-caridad-basilica'
print('PASS 112 selected-unpublished historical ledger; 89 verified exception records + 13 PD holds + 9 unrecorded + one visual hold')
