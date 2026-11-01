#!/usr/bin/env python3
import collections,json,pathlib
root=pathlib.Path(__file__).resolve().parents[1]
d=root/'data/geography/research/photo-finder-20261030'
ledger=json.loads((d/'releases/sacred-atlas-530-cover-closure-106-v1.json').read_text())
choices=json.loads((d/'decisions.json').read_text())['decisions']
media=json.loads((root/'data/geography/approved-place-media.v1.json').read_text())
items=[x for x in ledger['items'] if x['disposition'] in (
 'no_persisted_exception','source_metadata_mismatch','source_size_format')]
assert ledger['chosen_pending']==106 and ledger['canonical_places']==530
assert len(items)==59 and len({x['place_id'] for x in items})==59
assert collections.Counter(x['disposition'] for x in items)=={
 'no_persisted_exception':9,'source_metadata_mismatch':24,'source_size_format':26}
existing={x['place_id'] for x in media['items']}
for x in items:
 assert x['place_id'] not in existing
 assert choices[x['place_id']]['files'][0]==x['selected_file']
 assert len(x['source_sha1_claim'])==40
 assert x['claimed_licence']!='Public domain'
print('PASS 59 exact frozen first-choice technical holds')
