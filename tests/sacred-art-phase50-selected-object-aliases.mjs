import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
// Run from repo root: node tests/sacred-art-phase50-selected-object-aliases.mjs
const load = path => JSON.parse(readFileSync(new URL(path, import.meta.url),'utf8'));
const ledger = load('../data/artwork/canonical-selected-photo-identity-decisions.v1.json');
const aliases = load('../data/artwork/selected-177-physical-object-aliases-phase50.v1.json');
const passports = load('../data/artwork/phase50-institutional-object-passports.v1.json');
const linked = new Set(ledger.verified_object_links.map(x=>x.selected_id+'|'+x.group_id));
assert.equal(linked.size, 14, 'Cross-register relationships remain 14');
assert.equal(new Set(ledger.verified_object_links.map(x=>x.selected_id)).size,13);
assert.equal(aliases.pairs.length,4);
const members = new Map();
for(const p of aliases.pairs){
  assert.equal(p.selected_ids.length,2);
  assert.ok(p.physical_id && p.inventory && p.selected_photo_urls.length===2);
  assert.equal(p.photo_versions_preserved,true);
  for(const id of p.selected_ids){
    assert.match(id,/^RECENT575::\d{3}$/);
    assert.ok(!members.has(id), 'Selection occurs in multiple physical-object alias pairs: '+id);
    members.set(id,p.physical_id);
  }
}
assert.equal(members.size,8);
assert.equal(aliases.counts.proven_row_overcount,4);
assert.equal(aliases.counts.distinct_physical_paintings_upper_bound,173);
assert.equal(passports.passports.length,15);
const ids = new Set();
const passportPhysicalIds = new Set();
for(const p of passports.passports){
  assert.ok(p.official_catalogue?.startsWith('https://'),'No institution link '+p.title);
  assert.ok(p.accession && p.artist && p.institution);
  assert.equal(p.source_photo_changed,false);
  assert.equal(p.release_approved,false);
  assert.equal(p.not_177_to_989_link,true);
  assert.ok(!passportPhysicalIds.has(p.physical_id),'Repeated museum object passport: '+p.physical_id);
  passportPhysicalIds.add(p.physical_id);
  for(const id of p.selected_ids){
    assert.match(id,/^RECENT575::\d{3}$/);
    ids.add(id);
    assert.ok(!ledger.verified_object_links.some(link=>link.selected_id===id),'Passport record already crosslinked to 989: '+id);
  }
}
assert.equal(ids.size,18);
assert.equal(ledger.phase50_research.official_source_passports,15);
assert.equal(ledger.phase50_research.source_selected_records_with_passports,18);
assert.equal(ledger.phase50_research.selected_duplicate_pairs_verified,4);
assert.equal(ledger.phase50_research.selected_177_not_linked_to_989_rows_unchanged,156);
assert.equal(ledger.scope.rejected_research_source_records_kept_excluded,1599);
for(const g of aliases.explicit_non_aliases) {
  assert.equal(g.selected_ids.length,2);
  const [a,b]=g.selected_ids;
  assert.ok(!members.has(a)||members.get(a)!==members.get(b),'Protected distinct artworks merged: '+a+' '+b);
}
console.log('Phase 50 PASS: 4 supported selected-photo duplicate pairs, 15 official passports covering 18 rows; zero releases; unchanged 14 cross-register relationships.');
