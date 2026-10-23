import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const root="data/scripture/catena/research/full-corpus-pass-20261021/";
const dossier=read(root+"mark-ten-ai-editorial-adjudication.v1.json");
const works=read(root+"mark-ten-original-work-crosswalk.v1.json");
const catena=read("data/scripture/catena/mark.json");
assert.equal(dossier.schema,"ao.catena.mark-ten-ai-editorial-adjudication.v1");
assert.equal(dossier.state,"AI_assisted_contextual_grade_not_an_independent_human_peer_review");
assert.equal(dossier.sourceCrosswalk,root+"mark-ten-original-work-crosswalk.v1.json");
assert.equal(dossier.rows.length,10);
assert.equal(dossier.negatives.length,13);
assert.deepEqual(dossier.counts,{contextualAIReviews:10,provisionalDirect:8,provisionalUsefulContext:2,negativeProbes:13,oneEditorApprovals:0,twoEditorAdjudications:0,publicationApprovals:0});
const source=new Map(works.rows.map(r=>[r.sourcePointer,r]));
const pericope=new Map(catena.pericopes.map(p=>[p.id,p]));
const seen=new Set(),questionIds=new Set();
for(const r of dossier.rows){
 assert.ok(!seen.has(r.sourcePointer));seen.add(r.sourcePointer);
 const x=source.get(r.sourcePointer);assert.ok(x);
 const id=r.sourcePointer.slice(0,r.sourcePointer.lastIndexOf(":"));
 const segment=pericope.get(id)?.segments[Number(r.sourcePointer.split(":")[1])];
 assert.ok(segment);
 assert.equal(segment.father,r.inheritedFatherLabel);
 assert.equal(segment.text.length,r.sourceCharLength);
 assert.equal(x.editorialQuestion,r.editorialQuestion);
 assert.equal(x.inheritedFatherLabel,r.inheritedFatherLabel);
 assert.equal(x.canonicalCharLength,r.sourceCharLength);
 assert.equal(x.independentWorkTextInspected,r.independentWorkTextInspected);
 assert.ok([2,3].includes(r.contextualGradeAIAssessment));
 assert.equal(r.gradeMeaning,r.contextualGradeAIAssessment===3?
  "AI_assessed_direct_arguments_with_caveats":
  "AI_assessed_useful_context_requires_nonstandalone_handling");
 assert.ok(r.editorialScope.length>55);
 assert.ok(r.negativeProbe.endsWith("?"));
 assert.equal(r.negativeExpected,"no_certified_direct_answer");
 for(const f of ["criticalEditionChecked","independentHumanReviewerOne","independentHumanReviewerTwo","adjudicatedByHuman"])
  assert.equal(r[f],false);
 assert.equal(r.publicationEligibility,"blocked_research_only");
}
assert.deepEqual(seen,new Set(source.keys()));
assert.equal(dossier.rows.filter(r=>r.contextualGradeAIAssessment===3).length,8);
assert.equal(dossier.rows.filter(r=>r.contextualGradeAIAssessment===2).length,2);
for(const n of dossier.negatives){
 assert.ok(!questionIds.has(n.id));questionIds.add(n.id);
 assert.ok(seen.has(n.sourcePointer));assert.equal(n.expected,"no_certified_direct_answer");
 assert.ok(n.question.endsWith("?"));assert.ok(n.reason.length>=30);
 assert.equal(n.pericopeId,n.sourcePointer.split(":")[0]);
}
assert.equal(dossier.rows.find(x=>x.sourcePointer==="catena.mark.16.14:3").contextualGradeAIAssessment,2);
assert.equal(dossier.rows.find(x=>x.sourcePointer==="catena.mark.14.17:2").contextualGradeAIAssessment,2);
const augustine=works.rows.find(x=>x.sourcePointer==="catena.mark.16.14:3");
assert.match(augustine.originalWorkLocus,/83/);
assert.match(augustine.contextFinding,/favors/);
assert.match(augustine.readerGuard,/pre-Ascension/);
assert.equal(dossier.counts.publicationApprovals,0);
console.log("PASS Mark editorial dossier: 10 AI-only contextual assessments, 13 negative probes, original Catena pointers intact, zero independent approvals");
