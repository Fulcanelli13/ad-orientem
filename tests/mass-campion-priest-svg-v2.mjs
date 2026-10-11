import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const names = [
  'priest_memento_hands',
  'priest_hands_over_oblations',
  'priest_raises_eyes',
  'priest_minor_elevation',
  'priest_raises_eyes_hands',
];
const ledger = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/presentation/mass-icon-campion17-grouped-review-20261011.v1.json'), 'utf8'));
const expected = new Set(names);
const matched = new Set();
for (const name of names) {
  const file = path.join(ROOT, 'assets/review', `mass-campion-${name}-candidate-v2.svg`);
  const svg = fs.readFileSync(file, 'utf8');
  assert.match(svg, /^<svg\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/);
  assert.match(svg, /viewBox="0 0 256 256"/);
  assert.match(svg, /fill="currentColor"/);
  assert.match(svg, /fill-rule="evenodd"/);
  assert.match(svg, /data-ao-status="REVIEW_ONLY"/);
  assert.match(svg, /<title\s+id="/);
  assert.match(svg, /aria-labelledby="title-/);
  assert.equal((svg.match(/<path\b/g) || []).length, 1, `${name}: expected exactly one vector shape`);
  assert.doesNotMatch(svg, /<(?:image|mask|filter|foreignObject|script|use|pattern)\b|data:image|\.png|\.jpe?g|#[0-9a-f]{3,8}\b|rgb\(/i);
  assert.doesNotMatch(svg, /<style\b|onload=|onclick=/i);
  const corresponding = ledger.groups.find(g => g.visualCandidate?.path === `assets/review/mass-campion-${name}-candidate-v2.svg`);
  assert.ok(corresponding, `${name}: not linked from source triage`);
  assert.equal(corresponding.visualCandidate.status, 'REVIEW_ONLY_VECTOR_PASS_VISUAL_APPROVAL_PENDING');
  matched.add(name);
}
assert.equal(matched.size, expected.size);
assert.equal(ledger.visualArtworkDraft.approvedCandidates, 0);
assert.equal(ledger.visualArtworkDraft.productionRuntimeBindingsChanged, 0);
assert.equal(ledger.groups.reduce((n, g) => n + g.rows.length, 0), 17);
const html = fs.readFileSync(path.join(ROOT, ledger.visualArtworkDraft.html), 'utf8');
assert.equal((html.match(/class="block"/g) || []).length, 5, 'five review cards must appear');
assert.equal((html.match(/class="sample"/g) || []).length, 25, 'five responsive previews per card');
assert.match(html, /--lit/);
console.log('Mass Campion priest v2 native SVG checks: PASS — 5 path-only icons, 25 previews, 17 source cues, 0 live mappings changed.');
