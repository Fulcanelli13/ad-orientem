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


// First 64-family conversation evidence coverage; source matching is NOT answer approval.
const coverage = JSON.parse(readFileSync('data/learn/research/pius-x-64-family-evidence-screen-20261019.v1.json','utf8'));
assert.equal(coverage.schema,'AO_PIUS_X_INITIAL_64_CONVERSATION_FAMILY_EVIDENCE_SCREEN_V1');
assert.equal(coverage.status,'RESEARCH_ONLY_COVERAGE_NOT_ANSWER_APPROVAL');
assert.equal(coverage.records.length,64);
assert.deepEqual(coverage.records.map(x=>x.id),seeds.map(x=>x.id));
const sourceReviews=new Map(directReviews.map(x=>[x.id,x]));
const sourcesBySeed=new Map();
for(const row of wave.records){
  if(!sourcesBySeed.has(row.id))sourcesBySeed.set(row.id,[]);
  sourcesBySeed.get(row.id).push(row);
}
const tiers=new Map();
for(const row of coverage.records){
  const review=sourceReviews.get(row.id);
  const historical=sourcesBySeed.get(row.id)||[];
  assert.equal(row.first_cohort_source_id,row.id);
  assert.equal(row.short_digital_review_classification,review.classification);
  assert.deepEqual(row.short_candidate_qids,[...new Set(review.candidate_references.map(x=>x.qid))]);
  assert.deepEqual(row.additional_source_anchors.map(x=>x.locator),historical.map(x=>x.source_locator));
  assert.deepEqual(row.additional_source_anchors.map(x=>x.content_match),historical.map(x=>x.content_match));
  const direct=review.classification==='DIRECT_CATECHISM_QUESTION'||
      historical.some(x=>x.content_match==='DIRECT');
  const partial=review.classification==='PARTIAL_ANSWER_TO_BROADER_QUESTION'||
      historical.some(x=>x.content_match==='PARTIAL');
  const expected=direct?'DIRECT_PASSAGE_ANCHOR':partial?'PARTIAL_PASSAGE_ANCHOR':'RELATED_OR_UNRESOLVED';
  assert.equal(row.evidence_tier,expected);
  assert.equal(row.semantically_deduplicated,false);
  assert.equal(row.complete_visitor_answer_certified,false);
  assert.equal(row.historical_first_person_voice_certified,false);
  tiers.set(expected,(tiers.get(expected)||0)+1);
}
for(const tier of ['DIRECT_PASSAGE_ANCHOR','PARTIAL_PASSAGE_ANCHOR','RELATED_OR_UNRESOLVED']){
 assert.equal(coverage.summary[tier],tiers.get(tier)||0);
}
assert.deepEqual([tiers.get('DIRECT_PASSAGE_ANCHOR'),tiers.get('PARTIAL_PASSAGE_ANCHOR'),tiers.get('RELATED_OR_UNRESOLVED')],[48,11,5]);
assert.equal(coverage.summary.initial_families,64);
assert.equal(coverage.summary.approved_distinct_conversation_intents,0);
assert.equal(coverage.summary.certified_visitor_answers_in_this_screen,0);
assert.ok(coverage.records.find(x=>x.id==='SPX-057').edition_holds.length>0,'actual/sacramental grace confusion must stay held');
for(const id of ['SPX-028','SPX-044']){
 assert.ok(coverage.records.find(x=>x.id===id).edition_holds.length>0,'civil marriage witness caveat retained');
}
assert.deepEqual(coverage.records.filter(x=>x.evidence_tier==='RELATED_OR_UNRESOLVED').map(x=>x.id),
 ['SPX-039','SPX-040','SPX-042','SPX-046','SPX-050']);
console.log('Pius X initial 64-family evidence screen: 48 direct passage matches, 11 partial, 5 related-only; 0 answers certified');


// Research-only exact-question review and expansion of topical coverage.
const exactWordedPairs=JSON.parse(readFileSync('data/learn/research/pius-x-26-exact-pairs-reviewed-20261019.v1.json','utf8'));
assert.equal(exactWordedPairs.status,'RESEARCH_PROVISIONAL_NO_SEMANTIC_MERGE');
assert.equal(exactWordedPairs.records.length,26);
assert.equal(exactWordedPairs.counts.question_pairs_reviewed,26);
assert.equal(exactWordedPairs.counts.provisional_same_question_intentions,26);
assert.equal(exactWordedPairs.counts.approved_semantic_merges,0);
assert.equal(exactWordedPairs.counts.certified_visitor_answers,0);
const longNumbers=[25,35,152,192,226,227,228,229,230,231,513,522,537,539,553,554,615,628,697,743,800,801,906,946,948,949];
const shortNumbers=[44,57,112,113,125,126,127,128,129,130,250,286,271,272,291,292,333,335,359,373,388,389,243,137,139,140];
assert.deepEqual(exactWordedPairs.records.map(x=>x.long_qid),longNumbers.map(n=>'PX1905-Q'+String(n).padStart(3,'0')));
assert.deepEqual(exactWordedPairs.records.map(x=>x.short_qid),shortNumbers.map(n=>'PX1912-Q'+String(n).padStart(3,'0')));
assert.equal(new Set(exactWordedPairs.records.map(x=>x.long_qid)).size,26);
assert.equal(new Set(exactWordedPairs.records.map(x=>x.short_qid)).size,26);
for (const pair of exactWordedPairs.records){
 assert.equal(pair.question_wording_relation,'IDENTICAL_NORMALIZED_ITALIAN_QUESTION');
 assert.equal(pair.research_intent_assessment,'SAME_INTENT_RESEARCH_SCREEN');
 assert.equal(pair.evidence_checked,'BOTH_FULL_QUESTION_AND_ANSWER_PASSAGES_REVIEWED');
 assert.ok(pair.answer_witness_relation&&pair.rationale);
 assert.ok(pair.long_source_url.startsWith('https://www.museosanpiox.it/'));
 assert.ok(pair.short_digital_witness_url.startsWith('https://github.com/gustavo-depaula/ember/'));
 assert.equal(pair.approved_semantic_merge,false);
 assert.equal(pair.edition_print_collated,false);
 assert.equal(pair.certified_for_first_person_dialogue,false);
}
assert.equal(exactWordedPairs.records.filter(x=>x.answer_witness_relation==='IDENTICAL_NORMALIZED_ANSWER').length,1);
assert.equal(exactWordedPairs.records.find(x=>x.long_qid==='PX1905-Q628').answer_witness_relation,'HISTORICAL_DISCIPLINE_HOLD');
assert.equal(exactWordedPairs.records.find(x=>x.long_qid==='PX1905-Q537').answer_witness_relation,'SACRAMENTAL_VS_ACTUAL_GRACE_SCOPE_LOCK');
assert.deepEqual(exactWordedPairs.critical_false_duplicate.source_qids,['PX1905-Q915','PX1905-Q922']);
assert.equal(exactWordedPairs.critical_false_duplicate.classification,'DIFFERENT_THEOLOGICAL_INTENT_DO_NOT_MERGE');

const expansion=JSON.parse(readFileSync('data/learn/research/pius-x-conversation-expansion-48-20261019.v1.json','utf8'));
assert.equal(expansion.status,'PROVISIONAL_NEW_SEEDS_NO_ANSWER_APPROVAL_OR_DEDUP');
assert.equal(expansion.records.length,48);
assert.deepEqual(expansion.records.map(x=>x.id),Array.from({length:48},(_,i)=>'SPX-EXP-'+String(i+1).padStart(3,'0')));
assert.equal(expansion.counts.raw_research_idea_worklist_total,112);
assert.equal(expansion.counts.verified_new_distinct_intents,null);
assert.equal(expansion.counts.certified_answers,0);
for(const [domain,total] of Object.entries(expansion.counts.by_domain)){
 assert.equal(expansion.records.filter(x=>x.domain===domain).length,total);
}
for(const seed of expansion.records){
 assert.ok(seed.question_en&&/^https:\/\//.test(seed.suggested_document.url));
 assert.equal(seed.source_state,'DOCUMENT_LOCATED_PASSAGE_NOT_YET_COLLATED_FOR_THIS_QUESTION');
 assert.equal(seed.intent_state,'NEW_CANDIDATE_POSSIBLE_EXISTING_OVERLAP');
 assert.equal(seed.approved_distinct_intent,false);
 assert.equal(seed.doctrinal_reviewed,false);
 assert.equal(seed.certified_historical_first_person,false);
 assert.equal(seed.visitor_dialogue_published,false);
}
console.log('Pius X 26 cross-edition research comparisons and 48 expanded idea seeds verified; zero answer approvals');


const expandedPassages=JSON.parse(readFileSync('data/learn/research/pius-x-expansion-48-passage-review-20261019.v1.json','utf8'));
assert.equal(expandedPassages.schema,'AO_PIUS_X_EXPANDED_48_PASSAGE_SCREEN_V1');
assert.equal(expandedPassages.status,'RESEARCH_PASSAGE_SCREEN_NOT_PUBLISHED_DIALOGUE');
assert.equal(expandedPassages.records.length,48);
assert.deepEqual(expandedPassages.records.map(x=>x.id),expansion.records.map(x=>x.id));
const screens=new Map();
const reviewedOriginal=new Map(expansion.records.map(x=>[x.id,x]));
for(const rec of expandedPassages.records){
 const raw=reviewedOriginal.get(rec.id);
 assert.equal(rec.question_en,raw.question_en);
 assert.equal(rec.domain,raw.domain);
 assert.ok(/^https:\/\//.test(rec.verified_source_url));
 assert.equal(rec.verified_source_url,raw.suggested_document.url);
 assert.ok(rec.section_or_question_locator && rec.source_locus_summary);
 assert.ok(['BIOGRAPHY_FACTS_ONLY','PRIMARY_DIRECT','PRIMARY_PARTIAL'].includes(rec.passage_support_screen));
 const biography=rec.passage_support_screen==='BIOGRAPHY_FACTS_ONLY';
 assert.equal(rec.source_witness_class==='SECONDARY_BIOGRAPHY',biography);
 assert.equal(rec.first_person_attribution_eligibility==='NO_FIRST_PERSON_MEMORY_PROVEN',biography);
 assert.equal(rec.source_passage_found,true);
 for(const k of ['complete_answer_approved','semantic_merge_approved','voice_approved','runtime_published']) assert.equal(rec[k],false);
 if(rec.existing_family_overlap) {
   assert.ok(familySet.has(rec.existing_family_overlap.id));
   assert.equal(rec.overlap_review_status,'PROVISIONAL_NOT_MERGED');
 } else {
   assert.equal(rec.overlap_review_status,'NONE_IDENTIFIED_WITHIN_INITIAL_64_NOT_FULL_CORPUS');
 }
 screens.set(rec.passage_support_screen,(screens.get(rec.passage_support_screen)||0)+1);
}
assert.equal(screens.get('BIOGRAPHY_FACTS_ONLY'),9);
assert.equal(screens.get('PRIMARY_DIRECT'),31);
assert.equal(screens.get('PRIMARY_PARTIAL'),8);
for(const [tier,count] of screens)assert.equal(expandedPassages.counts[tier],count);
assert.equal(expandedPassages.counts.provisional_same_intent_links,2);
assert.equal(expandedPassages.counts.initial_64_overlaps_or_followups_flagged,17);
assert.equal(expandedPassages.counts.distinct_new_user_intents_verified,null);
assert.equal(expandedPassages.counts.verified_complete_avatar_answers,0);
assert.deepEqual(
  expandedPassages.records.filter(x=>x.existing_family_overlap?.relation==='SAME_INTENT_REVIEW_CANDIDATE')
      .map(x=>[x.id,x.existing_family_overlap.id]),
  [['SPX-EXP-035','SPX-053'],['SPX-EXP-045','SPX-014']]
);
assert.equal(expandedPassages.records.find(x=>x.id==='SPX-EXP-010').passage_support_screen,'PRIMARY_DIRECT');
assert.equal(expandedPassages.records.find(x=>x.id==='SPX-EXP-042').passage_support_screen,'PRIMARY_PARTIAL');
console.log('Pius X passage review: 31 direct primary, 8 partial primary, 9 third-person biography; 0 answers certified');


const snapshot=JSON.parse(readFileSync('data/learn/research/pius-x-112-cohort-coverage-baseline-20261019.v1.json','utf8'));
assert.equal(snapshot.schema,'AO_PIUS_X_112_IDEA_EVIDENCE_PROGRESS_SNAPSHOT_V1');
assert.equal(snapshot.status,'RESEARCH_SCOPED_SCREEN_ONLY_NOT_TOTAL_ANSWERABLE_QUESTIONS');
assert.equal(snapshot.cohort_totals.original_64,coverage.records.length);
assert.equal(snapshot.cohort_totals.expansion_48,expandedPassages.records.length);
assert.equal(snapshot.cohort_totals.all_topic_idea_seeds,coverage.records.length+expandedPassages.records.length);
assert.equal(snapshot.evidence_buckets.direct_passage_indicated,coverage.summary.DIRECT_PASSAGE_ANCHOR+expandedPassages.counts.PRIMARY_DIRECT);
assert.equal(snapshot.evidence_buckets.partial_passage_indicated,coverage.summary.PARTIAL_PASSAGE_ANCHOR+expandedPassages.counts.PRIMARY_PARTIAL);
assert.equal(snapshot.evidence_buckets.related_only_initial64,coverage.summary.RELATED_OR_UNRESOLVED);
assert.equal(snapshot.evidence_buckets.secondary_biographical_context_only_expansion48,expandedPassages.counts.BIOGRAPHY_FACTS_ONLY);
assert.equal(Object.values(snapshot.evidence_buckets).reduce((a,b)=>a+b,0),112);
assert.equal(snapshot.cross_cohort_links.potential_overlaps_or_followups,expandedPassages.counts.initial_64_overlaps_or_followups_flagged);
assert.equal(snapshot.cross_cohort_links.strong_same_intent_candidates_without_merge.length,2);
assert.equal(snapshot.certified_unique_answerable_intentions,null);
assert.equal(snapshot.certified_historically_attributed_visitor_replies,0);
console.log('Pius X bounded 112-topic evidence dashboard: 79 direct, 19 partial, 9 biography-only, 5 related; no answerability certification');
