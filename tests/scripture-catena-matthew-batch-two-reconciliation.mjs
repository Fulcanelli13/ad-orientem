/*
 * Living Catena Matthew 300–600: two overlapping AI research registers.
 * Preserve provenance, review differences and source-owned author boundaries.
 * Neither register establishes independent human approval.
 */
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const base="data/scripture/catena/research/full-corpus-pass-20261021/";
const source=read("data/scripture/catena/matthew.json");
const ps=new Map(source.pericopes.map(x=>[x.id,x]));
const idx=read(base+"matthew-index.v1.json");
const a=read(base+"matthew-batch-02-47-meaning-checks.v1.json");
const b=read(base+"matthew-batch-02-curated-review.v1.json");
const triage=read(base+"matthew-batch-02-300-question-triage.v1.json");
const mixed=read(base+"matthew-batch-02-mixed-owner-anomaly.v1.json");
const concordance=read(base+"matthew-batch-02-parallel-review-reconciliation.v1.json");
assert.equal(triage.records.length,300);
assert.equal(idx.reviewBatches300[1].rowIndexes.length,300);
const all=new Set(triage.records.map(r=>r.sourcePointer));
assert.equal(all.size,300);
for(let n=0;n<300;n++){
 const t=triage.records[n],v=idx.rows[idx.reviewBatches300[1].rowIndexes[n]];
 assert.equal(t.sourcePointer,v[0]+":"+v[1]);
 assert.equal(t.reviewRank,n+1);
 assert.equal(t.sourceIndex,idx.reviewBatches300[1].rowIndexes[n]);
 const src=ps.get(v[0]).segments[v[1]];
 assert.equal(src.father,t.inheritedFatherLabel);
 assert.equal(src.text.length,t.sourceLength);
 assert.equal((src.text.match(/\?/g)||[]).length,t.questionMarkCount);
 assert.equal(t.questionWindows.length,t.questionMarkCount);
 for(const x of t.questionWindows)assert.equal(src.text[x.offset],"?");
 assert.equal(t.publicationState,"blocked_pending_contextual_and_attribution_verification");
}
assert.equal(b.records.length,58);
assert.equal(b.status,"research_only__AI_assisted_source_review_human_approval_pending");
const bptr=new Set();
for(const r of b.records){
 assert.ok(all.has(r.sourcePointer));
 assert.ok(!bptr.has(r.sourcePointer));bptr.add(r.sourcePointer);
 const split=r.sourcePointer.lastIndexOf(":"),id=r.sourcePointer.slice(0,split),i=Number(r.sourcePointer.slice(split+1));
 assert.equal(ps.get(id).segments[i].father,r.inheritedFatherLabel);
 assert.equal(ps.get(id).segments[i].text.length,r.originalExcerptLength);
 assert.equal(r.readyForMessenger,false);
 assert.equal(r.reviewTier,"AI_assisted_semantic_spot_review__requires_human_editor_approval");
 assert.equal(r.readerQuestionVoice,"modern_editorial_navigation_not_patristic_quote");
 assert.ok(r.readerQuestionEditorial.endsWith("?"));
}
const statuses={};for(const r of b.records)statuses[r.relationToExistingCatenaText]=(statuses[r.relationToExistingCatenaText]||0)+1;
assert.deepEqual(statuses,{supported_within_excerpt:45,needs_adjacent_context:3,multiple_explanations_in_excerpt:9,mixed_author_blocked:1});
assert.equal(b.comparisonGroups.length,6);
for(const x of b.comparisonGroups)for(const ptr of x.sourcePointers)assert.ok(bptr.has(ptr));
const aPtr=new Set(a.records.map(x=>x.pointer));
assert.equal(aPtr.size,47);
const union=new Set([...aPtr,...bptr]);
assert.equal(union.size,86);
const overlap=[...aPtr].filter(x=>bptr.has(x));
assert.equal(overlap.length,19);
assert.equal(concordance.coverage.uniqueAISpotReviewed,86);
assert.equal(concordance.coverage.remainingOnlyMachineTriaged,214);
assert.equal(concordance.coverage.overlap,19);
assert.equal(concordance.coverage.categoryDiscrepancies,4);
assert.deepEqual(new Set(concordance.reviewCoveragePointers),union);
const conflicts=concordance.assessmentDiscrepancies;
assert.ok(conflicts.some(x=>x.pointer==="catena.matthew.12.25:7"&&x.conservativeStatus==="needs_context"));
assert.ok(conflicts.some(x=>x.pointer==="catena.matthew.12.31:3"&&x.conservativeStatus==="needs_context"));
assert.equal(concordance.status,"research_only_parallel_AI_reviews_not_independent_human_certification");
const disagreement=b.comparisonGroups.find(x=>x.status==="substantive_divergence");
assert.deepEqual(disagreement.sourcePointers,["catena.matthew.19.16:1","catena.matthew.19.16:2"]);
assert.equal(ps.get("catena.matthew.19.16").segments[1].father,"Jerome");
assert.equal(ps.get("catena.matthew.19.16").segments[2].father,"Chrysostom");
const orig=ps.get("catena.matthew.26.26").segments[12];
assert.equal(orig.father,"Lanfranc");
assert.equal(orig.text.length,mixed.fullFragmentCharacterLength);
assert.equal(mixed.splitCharacterOffset,215);
assert.equal(mixed.units[0].range.endExclusive,mixed.units[1].range.start);
assert.equal(mixed.units[1].range.endExclusive,orig.text.length);
for(const unit of mixed.units){
 const s=orig.text.slice(unit.range.start,unit.range.endExclusive);
 assert.ok(s.startsWith(unit.firstWords));
 assert.ok(s.trimEnd().endsWith(unit.lastWords));
 assert.ok(unit.publicationStatus.startsWith("blocked"));
}
assert.ok(orig.text.slice(215).startsWith("PSEUDO-DIONYSIUS."));
console.log("PASS: second 300 Matthew passages; 47 + 58 parallel AI readings = 86 distinct; four decisions require reconciliation; mixed Lanfranc/Pseudo-Dionysius author break blocked");
