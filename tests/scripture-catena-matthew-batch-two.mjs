/*
 * Living Catena: Matthew batch 02, rigorous source-pointer audit.
 * Verifies 300/300 original Catena excerpts, observed '?' positions,
 * 47 AI-assisted source readings, and seven unapproved comparisons.
 * No Father answer text is generated or copied to this registry.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const dir="data/scripture/catena/research/full-corpus-pass-20261021/";
const ix=load(dir+"matthew-index.v1.json");
const t=load(dir+"matthew-batch-02-300-voice-triage.v1.json");
const r=load(dir+"matthew-batch-02-47-meaning-checks.v1.json");
const grouped=load(dir+"matthew-batch-02-seven-comparison-leads.v1.json");
const pericopes=new Map(load("data/scripture/catena/matthew.json").pericopes.map(p=>[p.id,p]));
assert.equal(t.schema,"ao.catena.matthew-batch02-voice-triage.v1");
assert.equal(t.status,"research_only_machine_first_screen_not_authorial_decisions");
assert.equal(t.records.length,300);
assert.equal(t.batch,2);
const selected=ix.reviewBatches300[1].rowIndexes;
assert.equal(selected.length,300);
const counts={};
const pointers=new Set(),rankToPointer=new Map();
for(let j=0;j<300;j++){
 const rec=t.records[j],indexed=ix.rows[selected[j]];
 const [id,ordinal,father,, ,len,qm]=indexed;
 const per=pericopes.get(id),source=per?.segments[ordinal];
 assert.ok(source,"missing canonical source");
 assert.equal(rec.reviewRank,j+1);
 assert.equal(rec.indexRow,selected[j]);
 assert.equal(rec.sourcePointer,id+":"+ordinal);
 assert.equal(rec.inheritedFatherLabel,father);
 assert.equal(rec.originalSourceCitation,per.citation);
 assert.deepEqual(rec.scriptureKeys,per.verse_keys);
 assert.equal(source.father,father);
 assert.equal(source.text.length,len);
 assert.equal(rec.originalTextCharacters,len);
 assert.equal(rec.originalQuestionMarkCount,qm);
 const marks=[...source.text.matchAll(/\?/g)].map(x=>x.index);
 assert.equal(marks.length,qm);
 assert.deepEqual(rec.sourceQuestionWindows.map(x=>x.sourceOffset),marks);
 for(const w of rec.sourceQuestionWindows){
  assert.equal(source.text[w.sourceOffset],"?");
  assert.ok(w.verbatimWindow.length>0);
  assert.ok(w.verbatimWindow.length<=215);
 }
 assert.equal(rec.originalAnswerTarget,"source_excerpt_only_not_rewritten");
 assert.equal(rec.reviewStatus,"machine_only_pending_contextual_semantic_and_attribution_review");
 assert.equal(rec.readerQuestionAuthorship,"none_machine_may_not_invent_or_assign_question");
 assert.ok(!pointers.has(rec.sourcePointer),"source repeated in batch");
 pointers.add(rec.sourcePointer);
 rankToPointer.set(j+1,rec.sourcePointer);
 counts[rec.provisionalVoiceCategory]=(counts[rec.provisionalVoiceCategory]||0)+1;
}
assert.deepEqual(counts,t.counts);
assert.equal(r.schema,"ao.catena.matthew-batch02-meaning-review.v1");
assert.equal(r.status,"research_only__47_AI_assisted_meaning_checks_not_human_approved");
assert.equal(r.machineScreened,300);
assert.equal(r.AI_context_reviewed,47);
assert.equal(r.records.length,47);
const checked=new Set();let complex=0,brief=0,alt=0,direct=0;
for(const rec of r.records){
 assert.equal(rec.pointer,rankToPointer.get(rec.rank));
 assert.equal(rec.answerPointer,rec.pointer);
 assert.equal(rec.modernQuestionOrigin,"editorial_navigation_not_an_original_Father_utterance");
 assert.ok(rec.modernReaderQuestion.endsWith("?"));
 assert.equal(rec.reviewedBy,"AI_assisted_close_reading__independent_human_curation_pending");
 assert.equal(rec.releaseStatus,"blocked_not_publication_ready");
 assert.ok(!("fatherAnswer" in rec));
 assert.ok(!("translatedFatherReply" in rec));
 assert.ok(rec.qualification.length>=40);
 assert.ok(!checked.has(rec.rank),"duplicate meaning-review rank");
 checked.add(rec.rank);
 const [id,ord]=[rec.pointer.slice(0,rec.pointer.lastIndexOf(":")),Number(rec.pointer.slice(rec.pointer.lastIndexOf(":")+1))];
 const original=pericopes.get(id)?.segments[ord];
 assert.ok(original);
 assert.equal(original.father,rec.inheritedFatherLabel);
 assert.equal(original.text.length,rec.originalTextCharacters);
 if(rec.argumentCoverage.startsWith("multi_"))complex++;else direct++;
 if(rec.argumentCoverage==="direct_brief")brief++;
 if(rec.argumentCoverage.includes("alternatives"))alt++;
}
assert.deepEqual(r.counts,{spotReviewed:47,multiArgument:complex,directSameExcerpt:direct,briefAnswers:brief,alternatives:alt});
assert.equal(complex,5);
assert.equal(direct,42);
assert.equal(grouped.schema,"ao.catena.matthew-batch02-crossfather-comparison.v1");
assert.equal(grouped.status,"research_comparison_not_authorized_quotes");
assert.equal(grouped.groups.length,7);
let links=0;
for(const g of grouped.groups){
 assert.equal(g.questionVoice,"modern_editorial_prompt_not_historical");
 assert.equal(g.releaseState,"review_lead_not_approved_parallel_dialogue");
 assert.ok(g.originalAnswerPointers.length>=2);
 for(const p of g.originalAnswerPointers){
  assert.ok(r.records.some(x=>x.pointer===p),"comparison lacks explicit source-level review");
  links++;
 }
}
assert.equal(links,21);
assert.equal(grouped.sourceAnchors,21);
console.log("PASS Matthew batch 2: 300/300 exact source-linked interrogative excerpts; 47 AI-assisted source checks, 5 complex arguments, 7 comparison leads; no invented patristic speech");
