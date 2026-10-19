import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const bridge = JSON.parse(readFileSync('data/learn/research/pius-x-p0-p1-intent-evidence-bridge-20261019.v1.json', 'utf8'));
const it = JSON.parse(readFileSync('data/learn/ltfaith-pius-x-it-witness-index.v1.json', 'utf8'));
const en = JSON.parse(readFileSync('data/learn/ltfaith-pius-x-en-witness-index.v1.json', 'utf8'));
const own = bridge.canonical_existing_question_index;
const num = records => records.map(x => x.q).sort((a,b)=>a-b);
const index = Array.from({length:433},(_,i)=>i+1);
assert.deepEqual(num(it.entries), index, 'Italian owner question numbering changed');
assert.deepEqual(num(en.entries), index, 'English witness numbering changed');
assert.equal(own.count, 433);
assert.deepEqual(own.questionRefs, index.map(n => 'PX1912-Q' + String(n).padStart(3,'0')));
const seeds = bridge.provisional_mined_families;
assert.equal(seeds.length, 64);
assert.deepEqual(seeds.map(x => x.id),Array.from({length:64},(_,i)=>'SPX-'+String(i+1).padStart(3,'0')));
assert.equal(new Set(seeds.map(x=>x.id)).size, 64);
for (const s of seeds) {
  assert.ok(s.title_en && s.reported_source_anchor);
  assert.equal(s.source_verification,'RESEARCH_PASS_REPORTED_NOT_RECOLLATED');
  assert.equal(s.answer_sufficiency,'UNASSESSED');
  assert.equal(s.human_doctrinal_review,false);
  assert.equal(s.voice_approved,false);
  assert.equal(s.app_published,false);
  assert.equal(s.distinct_from_1912_qids,'UNRESOLVED');
}
const norm=s=>s.toLowerCase().replace(/[^a-z0-9]/g,' ').replace(/\s+/g,' ').trim();
const byStem = new Map();
for (const rec of en.entries) {
  const k = norm(rec.q_stem);
  if (!byStem.has(k)) byStem.set(k,[]);
  byStem.get(k).push(rec.q);
}
const apparent = Array.from(byStem.values()).filter(xs=>xs.length>1).length;
assert.equal(own.truncated_english_stem_collisions.length, apparent);
for (const group of own.truncated_english_stem_collisions) {
  assert.equal(group.do_not_merge,true);
  assert.deepEqual(group.question_numbers, byStem.get(group.truncated_stem));
}
assert.equal(bridge.counts.raw_unreconciled_candidate_pointers,497);
assert.equal(bridge.counts.verified_unique_question_intents,null);
assert.equal(bridge.counts.published_answer_count,0);
assert.equal(bridge.status,'RESEARCH_ONLY_NOT_APP_CONTENT');
assert.equal(own.italian_original_1912_print_collated,false);
assert.equal(own.english_is_historical_translation,false);

const topicReview = JSON.parse(readFileSync('data/learn/research/pius-x-p1-short-catechism-topical-review-20261019.v1.json','utf8'));
assert.equal(topicReview.records.length, 64);
assert.deepEqual(topicReview.records.map(x=>x.spx_family_id), seeds.map(x=>x.id));
const known = new Set(own.questionRefs);
let hits = 0;
for (const row of topicReview.records) {
  assert.equal(row.same_intent_approved, false);
  assert.equal(row.answer_sufficiency, 'NOT_ASSESSED');
  assert.ok(row.possible_same_topic_qids.every(q=>known.has(q)));
  if (row.possible_same_topic_qids.length) hits++;
}
assert.equal(hits, topicReview.counts.with_possible_short_catechism_topic_overlap);
assert.equal(topicReview.counts.approved_same_intent_merges, 0);

console.log('Pius X P0/P1 research-only bridge: 433 canonical QIDs, 64 provisional seeds, no content approval');
