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


const first24 = JSON.parse(readFileSync('data/learn/research/pius-x-p1-first24-italian-text-review-20261019.v1.json','utf8'));
const next40 = JSON.parse(readFileSync('data/learn/research/pius-x-p1-next40-italian-text-review-20261019.v1.json','utf8'));
const editionHold = JSON.parse(readFileSync('data/learn/research/pius-x-1912-catechism-edition-discrepancy-hold-20261019.v1.json','utf8'));
const directReviews = [...first24.records,...next40.records];
assert.equal(first24.records.length,24);
assert.equal(next40.records.length,40);
assert.deepEqual(directReviews.map(x=>x.id),seeds.map(x=>x.id), 'every existing SPX seed retains an ordered review');
const classifications = new Map();
for (const row of directReviews) {
  const candidateIds = row.candidate_references.map(x=>x.qid);
  assert.ok(candidateIds.every(q=>known.has(q)), 'full-text review must link only existing short Catechism identities');
  assert.equal(candidateIds.length, new Set(candidateIds).size);
  assert.equal(row.classification_is_provisional ?? row.provisional, true);
  assert.equal(row.published_answer_approved ?? row.answered_for_visitors, false);
  assert.equal(row.original_print_facsimile_collated ?? row.facsimile_1912_verified, false);
  classifications.set(row.classification,(classifications.get(row.classification)||0)+1);
}
assert.deepEqual(Object.fromEntries([...classifications].sort()), {
  DIRECT_CATECHISM_QUESTION:29,
  MISMATCHED_DOCTRINAL_DISTINCTION:1,
  NO_DIRECT_MATCH_IN_REVIEWED_CANDIDATES:10,
  PARTIAL_ANSWER_TO_BROADER_QUESTION:8,
  RELATED_DOCTRINE_NOT_SAME_QUESTION:16
});
assert.equal(next40.records.find(x=>x.id==='SPX-057').classification, 'MISMATCHED_DOCTRINAL_DISTINCTION');
assert.equal(editionHold.status,'HOLD_SOURCE_WITNESS_REQUIRES_EDITION_COLLATION');
assert.ok(editionHold.confirmed_text_questions.some(x=>x.qid==='PX1912-Q409'));
assert.ok(editionHold.confirmed_text_questions.some(x=>x.qid==='PX1912-Q410'));
assert.equal(editionHold.independent_source_review_required,true);


const wave = JSON.parse(readFileSync('data/learn/research/pius-x-p1-original-source-support-wave1-20261019.v1.json','utf8'));
const salzanoHold = JSON.parse(readFileSync('data/learn/research/pius-x-salzano-editorial-numbering-hold-20261019.v1.json','utf8'));
assert.equal(wave.records.length,25);
assert.equal(wave.counts.reviewed_family_source_anchors,25);
assert.equal(wave.counts.DIRECT,20);
assert.equal(wave.counts.PARTIAL,5);
const familySet = new Set(seeds.map(x=>x.id));
assert.equal(new Set(wave.records.map(x=>x.id)).size,25);
for(const rec of wave.records){
 assert.ok(familySet.has(rec.id), 'support must refer to established research families');
 assert.ok(rec.source_locator && /^https:\/\//.test(rec.source_url));
 assert.ok(['DIRECT','PARTIAL'].includes(rec.content_match));
 assert.equal(rec.original_print_facsimile_collated,false);
 assert.equal(rec.authorial_voice_approved,false);
 assert.equal(rec.answer_doctrinally_certified,false);
 assert.equal(rec.published_in_app,false);
}
const formerlyUnmatched=['SPX-003','SPX-004','SPX-010','SPX-011','SPX-012','SPX-023','SPX-024','SPX-030','SPX-038','SPX-045'];
for(const id of formerlyUnmatched)assert.ok(wave.records.some(x=>x.id===id),'missing previously unmatched source '+id);
assert.equal(formerlyUnmatched.filter(id=>wave.records.find(r=>r.id===id).content_match==='DIRECT').length,8);
const actualGrace=wave.records.find(x=>x.id==='SPX-057');
assert.match(actualGrace.source_locator,/1905 longer Catechism Q527/);
assert.match(actualGrace.evidence_summary,/actual grace/);
assert.equal(salzanoHold.state,'LOCATOR_CROSSCHECK_REQUIRED_BEFORE_MACHINE_IMPORT');
assert.equal(salzanoHold.observed_anomalies.length,2);
assert.ok(salzanoHold.observed_anomalies.some(x=>x.likely_intended==='322'));
assert.ok(salzanoHold.observed_anomalies.some(x=>x.likely_intended==='446'));


const census = JSON.parse(readFileSync('data/learn/research/pius-x-source-question-census-20261019.v1.json','utf8'));
const part1 = JSON.parse(readFileSync('data/learn/research/pius-x-1912-digital-question-fingerprints-part1-20261019.v1.json','utf8'));
const part2 = JSON.parse(readFileSync('data/learn/research/pius-x-1912-digital-question-fingerprints-part2-20261019.v1.json','utf8'));
const fingerprints = [...part1.entries,...part2.entries];
assert.equal(part1.sections.length+part2.sections.length,21);
assert.equal(fingerprints.length,433);
assert.equal(new Set(fingerprints.map(r=>r.qid)).size,433);
assert.equal(new Set(fingerprints.map(r=>r.fingerprint)).size,433);
assert.deepEqual(fingerprints.map(r=>r.qid).sort(),own.questionRefs.slice().sort());
for(const section of [...part1.sections,...part2.sections]){
  assert.equal(section.expected,section.matched);
  assert.deepEqual(section.missing,[]);
  assert.deepEqual(section.extra,[]);
}
const collections = census.source_collection_counts;
assert.equal(collections.catechismo_maggiore_1905.numbered_questions,993);
const ordered = collections.catechismo_maggiore_1905.verified_sequential_ranges;
assert.equal(ordered.length,6);
assert.equal(ordered[0].from,1);
assert.equal(ordered.at(-1).to,993);
for(let i=1;i<ordered.length;i++)assert.equal(ordered[i].from,ordered[i-1].to+1);
assert.equal(ordered.reduce((sum,r)=>sum+r.numbered_question_count,0),993);
assert.equal(collections.instruction_on_feasts.numbered_questions,219);
assert.equal(collections.instruction_on_feasts.numbered_range_verified_individually,false);
assert.equal(collections.shorter_catechism_1912.distinct_normalized_full_question_fingerprints,433);
assert.equal(collections.shorter_catechism_1912.authenticated_unmodified_1912_print,false);
assert.equal(collections.salzano_manuscript.editorial_question_labels,577);
assert.equal(collections.salzano_manuscript.manuscript_question_numbered_by_sarto,false);
assert.equal(census.reference_sum_all_four,2222);
assert.equal(census.separately_preserved_conversation_family_seeds,64);
assert.equal(census.strict_distinct_question_intents_verified,null);
assert.equal(census.provisional_1912_plus_spx_topic_units_if_all_29_direct_families_collapse_and_remaining_35_add_distinct,468);


const calibrations = JSON.parse(readFileSync('data/learn/research/pius-x-1905-1912-calibration-crosswalk-20261019.v1.json','utf8'));
assert.equal(calibrations.records.length,6);
assert.equal(calibrations.counts.sampled_pairs,6);
assert.equal(calibrations.counts.same_intent_candidates,2);
assert.equal(calibrations.counts.approved_semantic_merges,0);
const relations = new Map();
for(const v of calibrations.records){
  assert.ok(/^PX1905-Q\d{3}$/.test(v.long_1905));
  assert.ok(/^https:\/\//.test(v.long_source_url));
  assert.ok(v.short_1912.every(q=>known.has(q)), 'calibration QID must exist');
  assert.equal(v.dedup_approved,false);
  relations.set(v.long_1905,v.relation);
}
assert.equal(relations.get('PX1905-Q527'),'RELATED_NOT_SAME_DISTINCTION');
assert.equal(relations.get('PX1905-Q855'),'EDITION_DATE_CONFLICT_NO_AUTOMERGE');
assert.equal(relations.get('PX1905-Q669'),'NOT_FOUND_IN_REVIEWED_SHORT_EUCHARIST_SECTION');

console.log('Pius X P0/P1 research-only bridge: 433 canonical QIDs, 64 provisional seeds, no content approval');
