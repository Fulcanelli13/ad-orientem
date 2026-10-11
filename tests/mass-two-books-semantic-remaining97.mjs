import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = path => JSON.parse(readFileSync(new URL("../data/"+path,import.meta.url),"utf8"));
const full = read("mass/alphonsus-fortescue-direct-book-evidence-batch02.v1.json");
const previous = read("mass/alphonsus-fortescue-low-sung-differences-adjudicated.v1.json");
const batch = read("mass/alphonsus-fortescue-semantic-reconciliation-remaining97.v1.json");
const latin = read("presentation/reader-text-sung.v1.json");
const low = read("presentation/reader-text-low.v1.json");
const corpus = d=>new Set(d.blocks.flatMap(b=>b.units).map(u=>u.cue_id).filter(c=>/^AO\.SM\.C\d{4}$/.test(c)));
const s=corpus(latin), l=corpus(low);
const fullMap=new Map(full.items.map(x=>[x.id,x]));
const priorIds=new Set(previous.items.map(x=>x.evidenceRecordId));
assert.equal(s.size,279); assert.equal(l.size,275);
assert.equal(fullMap.size,113); assert.equal(priorIds.size,16);
assert.equal(batch.items.length,97); 
assert.equal(batch.scope.priorReviewedRecords,16);
assert.equal(batch.scope.totalBookEvidenceRecords,113);
assert.equal(batch.invariants.noNewSources,true);
assert.equal(batch.invariants.noRuntimeChanges,true);
assert.equal(batch.invariants.bookEvidenceDoesNotEstablish1962Rubric,true);
const expected={
 REANCHOR_REQUIRED:6,
 PASS_HISTORIC_SEMANTIC:41,
 PASS_WITH_EXPLICIT_CAVEAT:30,
 PASS_AFTER_CORRECTED_PASSAGE:8,
 RESEARCH_SUMMARY_INCOMPLETE:1,
 EXCLUDE_STRICT_1962:1,
 HISTORICAL_VARIANT_NOT_CERTIFIED:9,
 REJECT_POSITIVE_ACTION:1
};
assert.deepEqual(batch.counts,expected);
const ids=new Set();
for(const e of batch.items){
 assert(!ids.has(e.evidenceRecordId),"duplicate semantic assessment "+e.id);
 ids.add(e.evidenceRecordId);
 assert(!priorIds.has(e.evidenceRecordId),"revisited prior 16 "+e.id);
 const source=fullMap.get(e.evidenceRecordId);
 assert(source,e.id+" not in historic book register");
 assert.equal(e.cueId,source.cueId);
 assert.equal(e.actor,source.actor);
 assert.equal(e.bookPage,source.alphonsusEvidence.printedPage);
 assert.equal(e.originalEvidenceExcerpt,source.alphonsusEvidence.evidenceWindow);
 assert(s.has(e.cueId)&&l.has(e.cueId),e.id+" unknown canonical cue");
 assert.equal(e.exactRuntimeTriggerCertified,false);
 assert.equal(e.runtimeChanged,false);
 assert.equal(e.requiresExisting1962FormGate,true);
 assert(e.reviewFinding?.length>40,"no substantive assessment "+e.id);
}
assert.equal(new Set([...ids,...priorIds]).size,113,"113 historical records not fully accounted for");
const at=id=>batch.items.find(x=>x.evidenceRecordId==="ALPH.BK2."+id);
assert.equal(at("047").semanticStatus,"REANCHOR_REQUIRED");
assert.match(at("047").reviewFinding,/AFTER petimus|after petimus/i);
assert.equal(at("042").semanticStatus,"PASS_AFTER_CORRECTED_PASSAGE");
assert.equal(at("070").semanticStatus,"RESEARCH_SUMMARY_INCOMPLETE");
assert.equal(at("070").canonicalCorrectionNeeded,false);
assert.equal(at("070").researchOnlyDescriptionCorrectionNeeded,true);
assert.match(at("070").reviewFinding,/five|5|two more/i);
assert.equal(at("108").semanticStatus,"REJECT_POSITIVE_ACTION");
assert.match(at("108").reviewFinding,/OMITTED|omitted/i);
assert.equal(at("085").semanticStatus,"EXCLUDE_STRICT_1962");
assert.equal(at("087").semanticStatus,"PASS_AFTER_CORRECTED_PASSAGE");
assert.equal(at("063").semanticStatus,"REANCHOR_REQUIRED");
console.log("PASS two-book semantic review: 97 records + 16 previously reviewed = 113; source-gated, 6 reanchors, 8 excerpt repairs, 1 rejected bishop action.");
