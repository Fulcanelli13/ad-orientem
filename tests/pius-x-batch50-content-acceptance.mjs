import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const load=p=>JSON.parse(readFileSync(p,"utf8"));
const prefix="data/learn/research/";
const manifest=load(prefix+"pius-x-batch50-production-manifest-20261019.v1.json");
const pieces=manifest.files.map(load);
const rows=pieces.flatMap(x=>x.records);
const expansion=load(prefix+"pius-x-expansion-48-passage-review-20261019.v1.json");
const expansionTopics=load(prefix+"pius-x-conversation-expansion-48-20261019.v1.json");
const wave=load(prefix+"pius-x-p1-original-source-support-wave1-20261019.v1.json");
const baseline=load(prefix+"pius-x-p0-p1-intent-evidence-bridge-20261019.v1.json");
const previous=load(prefix+"pius-x-ten-conversation-content-pilot-20261019.v1.json");
const eBy=new Map(expansion.records.map(x=>[x.id,x]));
const eTitle=new Map(expansionTopics.records.map(x=>[x.id,x.question_en]));
const wBy=new Map(wave.records.map(x=>[x.id,x]));
const wTitle=new Map(baseline.provisional_mined_families.map(x=>[x.id,x.title_en]));
assert.equal(manifest.schema,"AO_SPX_FIFTY_FAMILY_BULK_PRODUCTION_MANIFEST_V1");
assert.equal(manifest.status,"FIFTY_BILINGUAL_TWO_TURN_EDITORIAL_DRAFTS_NOT_APPROVED");
assert.deepEqual(pieces.map(x=>x.part),["A","B","C"]);
assert.deepEqual(pieces.map(x=>x.records.length),[16,15,19]);
assert.equal(rows.length,50);
const seenIds=new Set(),opening=new Set(),stats={expansion:0,initial64:0,turns:0,enFrResponseDrafts:0};
for(const record of rows){
 assert.ok(!seenIds.has(record.id),"Duplicate family ID "+record.id);
 seenIds.add(record.id);
 assert.equal(record.editorialReview,"UNREVIEWED_BILINGUAL_BATCH_DRAFT");
 assert.equal(record.published,false);
 assert.equal(record.independentHistoricalApproval,false);
 assert.equal(record.independentVoiceApproval,false);
 assert.equal(record.independentTranslationApproval,false);
 assert.equal(record.sourceEvidenceState,"SOURCE_PASSAGE_LOCATED_SUBJECT_MATCH_RESEARCH_ONLY");
 assert.equal(record.turns.length,2);
 if(record.id.startsWith("SPX-EXP-")){
  stats.expansion++;
  const original=eBy.get(record.id);
  assert.ok(original,"missing original passage "+record.id);
  assert.equal(original.passage_support_screen,"PRIMARY_DIRECT");
  assert.equal(record.source.url,original.verified_source_url);
  assert.equal(record.source.locus,original.section_or_question_locator);
  assert.equal(record.question.en,eTitle.get(record.id));
 }else{
  stats.initial64++;
  const original=wBy.get(record.id);
  assert.ok(original,"missing original 64-source "+record.id);
  assert.equal(original.content_match,"DIRECT");
  assert.equal(original.passage_checked,true);
  assert.equal(record.source.url,original.source_url);
  assert.equal(record.source.locus,original.source_locator);
  assert.equal(record.question.en,wTitle.get(record.id));
 }
 assert.ok(/^https:\/\/(?:www\.vatican\.va|www\.museosanpiox\.it)\//.test(record.source.url));
 assert.ok(record.source.summary.length>=40);
 assert.ok(record.question.en.length>=20&&record.question.fr.length>=20);
 for(const [i,turn] of record.turns.entries()){
  stats.turns++;stats.enFrResponseDrafts+=2;
  assert.equal(turn.kind,i===0?"opening":"followup");
  if(i===0)assert.deepEqual(turn.question,record.question);
  for(const lang of ["en","fr"]){
   assert.ok(turn.question[lang].length>=20,record.id+": missing "+lang+" question");
   assert.ok(turn.response[lang].length>=80,record.id+": too brief "+lang+" answer");
   assert.ok(!/[“”]/.test(turn.response[lang]),record.id+": unsupported direct quotation");
   assert.ok(!/^(as an ai|je suis une ia)/i.test(turn.response[lang]));
  }
 }
 const norm=s=>s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase()
   .replace(/[^a-z0-9]+/g," ").trim();
 const key=norm(record.question.en);
 assert.ok(!opening.has(key),"Repeated opening question "+record.id);
 opening.add(key);
}
assert.equal(stats.expansion,31);
assert.equal(stats.initial64,19);
assert.equal(stats.turns,100);
assert.equal(stats.enFrResponseDrafts,200);
assert.deepEqual(
 ["draftFamilies","sourceScreenedExpansion","sourceScreenedInitial64","turns","localizedResponseDrafts"].map(k=>manifest.counts[k]),
 [50,31,19,100,200]
);
assert.equal(manifest.counts.independentlyCertifiedFamilies,0);
assert.equal(manifest.counts.voiceApprovedFamilies,0);
assert.equal(manifest.counts.runtimePublishedFamilies,0);
assert.equal(manifest.counts.approvedDistinctIntents,0);
assert.equal(manifest.overlapWithPriorTenPilot.length,12);
for(const overlap of manifest.overlapWithPriorTenPilot){
 assert.ok(seenIds.has(overlap.batchId));
 assert.ok(previous.episodes.some(x=>x.id===overlap.pilotId));
 assert.equal(overlap.approvedMerge,false);
}
for(const cluster of manifest.overlapWithinBatch){
 assert.ok(cluster.ids.length>=2);
 for(const id of cluster.ids)assert.ok(seenIds.has(id));
 assert.ok(cluster.decision.startsWith("PENDING_"));
}
const frozen=Object.freeze({...stats,families:rows.length,knownPilotOverlap:12,
 independentSourceCertifications:0,approvedVoice:0,productionPublished:0});
console.log("PASS Pius X BATCH50_SOURCE_OWNED "+JSON.stringify(frozen));
