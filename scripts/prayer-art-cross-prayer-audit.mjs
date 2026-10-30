// Editorial Prayer artwork integrity check. Run: node scripts/prayer-art-cross-prayer-audit.mjs
// A passing result is NOT publication clearance or live-card image parity.
import { readFileSync } from 'node:fs';
import assert from 'node:assert/strict';

const dir = 'data/prayer/artwork-editorial-20261030/';
const read = (name) => JSON.parse(readFileSync(dir + name, 'utf8'));
const registry = read('balanced-reuse-20261030-assignments.v2.json');
const overlay = read('cross-prayer-inheritance-20261030.v1.json');
const decisions = read('decision-ledger-b01-b05.v1.json');
const approvals = read('missing-art-approved-only-20261030.v1.json');
const slots = new Map(registry.slots.map(s => [s.slot_id, s]));

assert.equal(registry.slots.length, 267, 'Editorial source denominator changed: investigate, do not silently redefine');
assert.equal(slots.size, 267, 'Duplicate editorial slot IDs');
assert.equal(decisions.counts.accepted_for_prayer, 114);
assert.equal(approvals.approved.length, 25);
assert.ok(approvals.approved.every(a => a.answer === 'approve'));
assert.equal(overlay.summary.production_images_published, 0);
assert.equal(registry.stats.publication_ready_images_verified, 0);
assert.equal(registry.stats.runtime_reader_stage_parity_verified, false);
assert.equal(registry.stats.luminous_optional_stable_runtime_card_mapping, 0);
for (const slot of registry.slots) {
  assert.ok(slot.works.some(w => w.eligible), 'No editorial image candidate: ' + slot.slot_id);
}
for (const edge of overlay.inherited_reuse_edges) {
  assert.ok(slots.get(edge.target_slot)?.works.some(w => w.id === edge.artwork_id),
    'Cross-prayer inheritance missing from active editorial registry: ' + edge.target_slot + ' / ' + edge.artwork_id);
}
for (const removed of overlay.scope_guardrail_corrections.removed_from_active_candidates) {
  assert.ok(!slots.get(removed.slot_id)?.works.some(w => w.id === removed.artwork_id),
    'User-only restriction violated: ' + removed.slot_id + ' / ' + removed.artwork_id);
}
const restricted = {
  'PRAYER::w1-kazimirowski': ['COV-pray.divine_mercy', 'STG-pray.divine_mercy-01', 'STG-pray.five_wounds-05'],
  'CANONICAL::W07-007': ['COV-prayer.lection'],
  'PRAYER::historic:giovanni lanfranco:miracle of loaves and fishes': ['COV-foundations_grace_before_meals','COV-foundations_grace_after_meals','COV-foundations_our_father'],
  'CANONICAL::ART-iovanni-anfranco-iracle-of-oaves-and-ishes': ['COV-foundations_grace_before_meals','COV-foundations_grace_after_meals','COV-foundations_our_father']
};
for (const s of registry.slots) {
  for (const w of s.works) {
    if (restricted[w.id]) assert.ok(restricted[w.id].includes(s.slot_id), 'Forbidden scope: ' + w.id + ' in ' + s.slot_id);
    if (s.slot_id.startsWith('STG-pray.angelus-')) {
      assert.ok(!['CANONICAL::ART-eter-aul-ubens-esurrection-of-hrist','PRAYER::regina--primary'].includes(w.id),
      'Regina Caeli Resurrection picture shown within ordinary Angelus: ' + s.slot_id);
    }
  }
}
assert.equal(overlay.optional_luminous_mysteries.with_approved_art, 5);
assert.equal(overlay.optional_luminous_mysteries.stable_runtime_card_ids, 0,
  'After runtime join, update test to validate stable runtime IDs rather than leaving this hold');
assert.ok(slots.get('STG-pray.benediction-03').works.some(w => w.id === 'PRAYER::adoration--primary'));
assert.ok(overlay.remaining_gates.some(g => g.type === 'EXACT_RITE_ARTWORK_MISSING'));
assert.ok(overlay.remaining_gates.some(g => g.type === 'ACTUAL_RUNTIME_CARD_PARITY_UNVERIFIED'));
console.log(JSON.stringify({
  status: 'EDITORIAL_ONLY_PASS',
  editorial_slots: slots.size,
  inherited_edges: overlay.inherited_reuse_edges.length,
  forbidden_placements_removed: overlay.scope_guardrail_corrections.removed_count,
  luminous_mysteries_with_user_approved_art: 5,
  publish_ready: false,
  reader_runtime_parity_certified: false
}, null, 2));
