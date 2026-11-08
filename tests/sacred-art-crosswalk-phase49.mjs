import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Research-only crosswalk integrity check. Run: node tests/sacred-art-crosswalk-phase49.mjs
const load = (path) => JSON.parse(readFileSync(new URL(path, import.meta.url), 'utf8'));
const ledger = load('../data/artwork/canonical-selected-photo-identity-decisions.v1.json');
const catalog = load('../data/artwork/research-semantic-candidates-989.v1.json');

assert.equal(catalog.artworks.length, 989, 'Expected 989 source research groups');
const groupIds = new Set(catalog.artworks.map(item => item.workGroupId));
assert.equal(groupIds.size, 989, 'Research group IDs must be unique');

const pairKey = item => `${item.selected_id}::${item.group_id}`;
const joined = new Set();
for (const link of ledger.verified_object_links) {
  assert.match(link.selected_id, /^RECENT575::\d{3}$/);
  assert.ok(groupIds.has(link.group_id), `Unknown group ${link.group_id}`);
  assert.ok(!joined.has(pairKey(link)), `Duplicate object link: ${pairKey(link)}`);
  joined.add(pairKey(link));
  assert.equal(link.owner_photo_replaced, false, 'Selected photographs must be preserved');
  assert.equal(link.release_approved, false, 'Object identity is not image-release permission');
}
for (const guard of ledger.blocked_false_merges) {
  assert.ok(groupIds.has(guard.group_id), `Unknown guarded group ${guard.group_id}`);
  assert.ok(!joined.has(pairKey(guard)), `A prohibited merge was resurrected: ${pairKey(guard)}`);
}
const uniqueSelected = new Set(ledger.verified_object_links.map(link => link.selected_id));
assert.equal(joined.size, 14, 'Phase 49 should have 14 verified relationships');
assert.equal(uniqueSelected.size, 13, '14 relationships concern 13 selected photographs');
assert.equal(ledger.blocked_false_merges.length, 6, 'Six false-merge guards required');
assert.equal(ledger.scope.unlinked_museum_identified_selections, 156);
assert.equal(ledger.next.museum_identity_holds, 8);
assert.equal(ledger.scope.rejected_research_source_records_kept_excluded, 1599);
assert.equal(ledger.scope.selected_handpicked_images, 177);
assert.equal(ledger.scope.selected_handpicked_images, uniqueSelected.size + 156 + 8);
assert.equal(ledger.hard_guards.do_not_admit_unapproved_commons_images, true);
assert.equal(ledger.hard_guards.selected_owner_photographs_preserved, true);
const linked = (selected, group) => joined.has(`${selected}::${group}`);
assert.ok(linked('RECENT575::262', 'REVIEW::kmska:zmaloe'));
assert.ok(linked('RECENT575::262', 'CANONICAL::ART-nthony-van-yck-he-ance-hrust'));
assert.ok(linked('RECENT575::220', 'REVIEW::commons:65879554'));
assert.ok(linked('RECENT575::369', 'REVIEW::commons:163857133'));
assert.ok(ledger.blocked_false_merges.some(item => item.selected_id === 'RECENT575::262' && item.group_id === 'REVIEW::kmska:d7e5gq'));
assert.ok(ledger.blocked_false_merges.some(item => item.selected_id === 'RECENT575::076' && item.group_id === 'CANONICAL::ART-eter-aul-ubens-courging-at-the-illar-ntwerp-osary-cycle'));
console.log('Sacred Art Phase 49: 989 groups; 14 relationships; 13 selections linked; 6 guards; 156 unlinked; 8 holds. PASS');
