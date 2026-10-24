import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const argument=read(root+"chrysostom-24-argument-research-hypotheses.v1.json");
const focus=read("dist/schaff-chrysostom-focused-parallels/focused-chrysostom-source-parallels.v1.json");
const lexical=read("dist/schaff-chrysostom-catena-overlap/literal-overlap-source-evidence.v1.json");
assert.equal(argument.schema,"ao.catena.chrysostom-focused-parallel-argument-research-hypotheses.v1");
assert.equal(argument.sourceOfTruth,"dist/schaff-chrysostom-focused-parallels/focused-chrysostom-source-parallels.v1.json");
assert.equal(argument.rows.length,24);
assert.equal(focus.packets.length,24);
assert.equal(argument.counts.sourceComparisons,24);
assert.equal(argument.counts.likely_same_original_work_argument,16);
assert.equal(argument.counts.shared_scriptural_language_context_differs,6);
assert.equal(argument.counts.insufficient_printed_context_for_argument,2);
const missing=new Set(focus.packets.map(p=>p.id));
const seen=new Set();
for(const row of argument.rows){
 assert.ok(missing.has(row.sourceId),"Editorial research may only analyze actual print-text parallels");
 assert.ok(!seen.has(row.sourceId),"No duplicate research classification");
 seen.add(row.sourceId);missing.delete(row.sourceId);
 assert.ok(["likely_same_original_work_argument",
  "shared_scriptural_language_context_differs",
  "insufficient_printed_context_for_argument"].includes(row.comparisonHypothesis));
 assert.ok(row.researchReason.length>=85&&row.researchReason.length<=1000);
 assert.equal(row.comparisonUsesExactAvailableOCRContext,true);
 assert.equal(row.researchOpinionOnlyNotAQuoteFromFather,true);
 assert.equal(row.originalGreekOrLatinCriticallyChecked,false);
 assert.equal(row.sourceSpeakerAuthenticationPending,true);
 assert.equal(row.semanticEquivalenceIndependentlyConfirmed,false);
 assert.equal(row.publicationEligible,false);
 assert.equal(Object.hasOwn(row,"FatherAnswer"),false);
 assert.equal(Object.hasOwn(row,"newMessengerRoute"),false);
 assert.equal(Object.hasOwn(row,"authoritativeTheologicalSummary"),false);
 const source=focus.packets.find(x=>x.id===row.sourceId);
 assert.ok(source.exactOriginalOCREnsuingProse.length>20);
 assert.ok(source.catenaParallels.some(x=>x.inheritedFatherLabel==="Chrysostom"));
 assert.equal(source.publicationApproval,false);
 if(row.comparisonHypothesis==="shared_scriptural_language_context_differs")
  assert.ok(source.catenaParallels.length>=1);
}
assert.equal(missing.size,0);
for(const key of ["acceptedAsNewPatristicAnswers","verifiedDuplicateArguments",
 "humanEditorsInvolved","publicationApprovals"])assert.equal(argument[key],0);
assert.equal(lexical.rows.length+lexical.pinnedWitnesses.length,184);
assert.equal(focus.summary.validatedTheologicalDuplicates,0);
console.log("PASS: 24 Chrysostom source-grounded preliminary argument hypotheses (16 likely same, 6 shared source language, 2 unresolved) stay separate from certified Father words and the Messenger");
