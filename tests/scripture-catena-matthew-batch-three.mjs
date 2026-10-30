/*
 * Living Catena Matthew batch 03: 300 source screens + 80 AI-assisted
 * contextual mappings + 14 nuanced comparisons + explicit mixed author
 * split at Pseudo-Dionysius. These are not published Father replies.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const dir="data/scripture/catena/research/full-corpus-pass-20261021/";
const index=load(dir+"matthew-index.v1.json");
const triage=load(dir+"matthew-batch-03-300-source-screen.v1.json");
const meaning=load(dir+"matthew-batch-03-contextual-reader-questions.v1.json");
const comparisons=load(dir+"matthew-batch-03-14-comparison-leads.v1.json");
const anomaly=load(dir+"matthew-batch-03-mixed-owner-anomaly.v1.json");
const source=load("data/scripture/catena/matthew.json");
const pericopes=new Map(source.pericopes.map(p=>[p.id,p]));
const sourceAt=pointer=>{
  const i=pointer.lastIndexOf(":");
  const p=pericopes.get(pointer.slice(0,i)),n=Number(pointer.slice(i+1));
  assert.ok(p&&Number.isInteger(n)&&n>=0&&n<p.segments.length,"unresolved source pointer "+pointer);
  return {p,n,s:p.segments[n]};
};
assert.equal(triage.schema,"ao.catena.matthew-batch03-300-source-screen.v1");
assert.equal(triage.gospel,"matthew");
assert.equal(triage.batchNumber,3);
assert.equal(triage.recordCount,300);
assert.equal(triage.records.length,300);
assert.deepEqual(triage.machineClassification,{
  question_punctuation_must_identify_speaker:21,
  reported_objection_signal_without_question_mark:13,
  editorial_gloss_or_abbreviated_reference:82,
  declarative_dependent_or_alternative_commentary:184
});
const selected=index.reviewBatches300[2].rowIndexes;
assert.equal(selected.length,300);
const seen=new Set();let qRows=0;
for(let k=0;k<300;k++){
  const r=triage.records[k], originalIndexRow=index.rows[selected[k]];
  const [id,ordinal,father,tags,flags,length,marks]=originalIndexRow;
  const ptr=id+":"+ordinal,{p,s}=sourceAt(ptr);
  assert.equal(r.sourcePointer,ptr);
  assert.equal(r.reviewRank,k+1);
  assert.equal(r.sourceIndexRow,selected[k]);
  assert.equal(r.biblicalPassage,p.citation);
  assert.deepEqual(r.canonicalVerseKeys,p.verse_keys);
  assert.equal(r.inheritedFatherLabel,s.father);
  assert.equal(s.father,father);
  assert.equal(r.sourceTextCharacterCount,s.text.length);
  assert.equal(s.text.length,length);
  assert.equal(r.originalQuestionMarkCount,marks);
  assert.deepEqual(r.lexicalTopicLeads,tags);
  assert.deepEqual(r.originalMachineFlags,flags);
  assert.equal(r.speakerOwnership,"undetermined_pending_close_reading");
  assert.equal(r.answerScope,"source_excerpt_only__not_rewritten_or_summarized_as_Father_speech");
  assert.equal(r.readerQuestion,"none_until_individual_grounded_editorial_review");
  assert.equal(r.releaseStatus,"blocked__do_not_publish_Messenger");
  assert.ok(!("generatedFatherAnswer" in r));
  if(marks>0)qRows++;
  const marksAt=[...s.text.matchAll(/\?/g)].map(x=>x.index);
  assert.equal(marksAt.length,marks);
  assert.deepEqual(r.questionContextWindows.map(x=>x.atOffset),marksAt);
  assert.ok(!seen.has(ptr));seen.add(ptr);
}
assert.equal(qRows,21);
assert.equal(seen.size,300);
assert.equal(meaning.schema,"ao.catena.matthew-batch03-contextual-reader-questions.v1");
assert.equal(meaning.selectedExcerpts,80);
assert.equal(meaning.records.length,80);
assert.deepEqual(meaning.outcomeCounts,{
  argument_in_excerpt:68,
  partial_context_required:4,
  competing_interpretations_in_excerpt:5,
  attribution_uncertain:2,
  attribution_mixed_inside_fragment:1
});
const mSeen=new Set();
for(const r of meaning.records){
  assert.ok(!mSeen.has(r.sourcePointer));mSeen.add(r.sourcePointer);
  assert.ok(seen.has(r.sourcePointer),"reviewed item outside its batch");
  const base=triage.records.find(x=>x.sourcePointer===r.sourcePointer);
  const {p,s}=sourceAt(r.sourcePointer);
  assert.equal(r.reviewRank,base.reviewRank);
  assert.equal(r.inheritedFatherLabel,s.father);
  assert.equal(r.biblicalPassage,p.citation);
  assert.equal(r.sourceExcerptEvidence,r.sourcePointer);
  assert.equal(r.originalExcerptHasLiteralQuestion,s.text.includes("?"));
  assert.equal(r.readerQuestionOrigin,"modern_editorial_not_a_Father_quotation");
  assert.equal(r.excerptOriginalWords,"read_by_source_pointer_from_canonical_Catena__not_copied_into_research_file");
  assert.equal(r.reviewMethod,"AI_assisted_same_excerpt_context_check__not_external_critical_edition_collation");
  assert.equal(r.humanSecondReaderApproval,false);
  assert.equal(r.MessengerEligibility,"blocked_until_attribution_context_and_translation_signoff");
  assert.ok(r.modernReaderQuestion.endsWith("?")&&r.modernReaderQuestion.length>25);
  assert.ok(r.interpretativeAndAttributionCaveat.length>18);
  assert.ok(!("FatherAnswerText" in r));
}
assert.equal(mSeen.size,80);
const multi=meaning.records.find(r=>r.sourcePointer==="catena.matthew.27.45:1");
assert.equal(multi.claimScope,"attribution_mixed_inside_fragment");
const unknown=meaning.records.filter(r=>r.claimScope==="attribution_uncertain");
assert.equal(unknown.length,2);
assert.ok(unknown.every(r=>r.interpretativeAndAttributionCaveat.includes("attribution")||r.interpretativeAndAttributionCaveat.includes("authorship")));
assert.equal(comparisons.schema,"ao.catena.matthew-batch03-comparison-leads.v1");
assert.equal(comparisons.groupCount,14);
assert.equal(comparisons.records.length,14);
for(const g of comparisons.records){
  assert.ok(g.sourcePointers.length>=2);
  assert.equal(g.sourcePointers.length,g.reviewRanks.length);
  assert.ok(g.editorialRelationshipNotes.length>40);
  assert.equal(g.releaseStatus,"research_only_not_a_verified_dialogue_exchange");
  for(let i=0;i<g.sourcePointers.length;i++){
    assert.ok(mSeen.has(g.sourcePointers[i]),"comparison cites unreviewed excerpt");
    const review=meaning.records.find(r=>r.sourcePointer===g.sourcePointers[i]);
    assert.equal(review.reviewRank,g.reviewRanks[i]);
  }
}
assert.equal(anomaly.schema,"ao.catena.mixed-excerpt-speaker-ownership.v1");
assert.equal(anomaly.sourcePointer,"catena.matthew.27.45:1");
const {s}=sourceAt(anomaly.sourcePointer);
assert.equal(s.father,"Origen");
assert.equal(s.text.length,1239);
assert.equal(anomaly.splitCharacterOffset,726);
assert.equal(s.text.indexOf("PSEUDO-DIONYSIUS."),726);
assert.equal(anomaly.fullFragmentCharacterLength,s.text.length);
assert.equal(anomaly.units.length,2);
assert.deepEqual(anomaly.units.map(u=>u.printedAttribution),["Origen","Pseudo-Dionysius"]);
assert.deepEqual(anomaly.units.map(u=>[u.range.start,u.range.endExclusive]),[[0,726],[726,1239]]);
for(const u of anomaly.units){
  const x=s.text.slice(u.range.start,u.range.endExclusive);
  assert.ok(x.startsWith(u.startPhrase));
  assert.ok(x.trimEnd().endsWith(u.endPhrase));
  assert.ok(u.publicationStatus.startsWith("blocked"));
}
console.log("PASS: Matthew batch03 300/300 original excerpts screened, 80 AI-assisted interpretations, 14 distinct comparison leads, and split Origen/Pseudo-Dionysius provenance");
