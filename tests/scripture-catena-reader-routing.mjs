import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const dir="data/scripture/catena/research/full-corpus-pass-20261021/";
const read=n=>JSON.parse(readFileSync(dir+n,"utf8"));
const index=read("matthew-index.v1.json"),c=read("matthew-reader-catalogue.v1.json"),g=read("matthew-reader-comparison-routes.v1.json"),q=read("matthew-entire-book-review-queue.v1.json");
const src=new Map(index.rows.map(x=>[x[0]+":"+x[1],x]));
assert.equal(src.size,4825);assert.equal(c.records.length,192);assert.equal(g.records.length,31);assert.equal(q.records.length,4633);
const checked=new Set();let reviews=0;
for(const x of c.records){assert.ok(src.has(x.sourcePointer)&&!checked.has(x.sourcePointer));checked.add(x.sourcePointer);assert.equal(x.inheritedFatherLabel,src.get(x.sourcePointer)[2]);assert.equal(x.originalCharacterCount,src.get(x.sourcePointer)[5]);assert.equal(x.humanApproved,false);assert.equal(x.publicationEligibility,"blocked_research_only");assert.ok(x.editorialQuestions.every(v=>v.endsWith("?")));assert.ok(!Object.hasOwn(x,"FatherAnswer"));reviews+=x.AIReviews.length;}
assert.equal(reviews,211);
for(const x of q.records){assert.ok(src.has(x.sourcePointer)&&!checked.has(x.sourcePointer));checked.add(x.sourcePointer);assert.equal(x.publicationEligibility,"blocked_research_only");}
assert.equal(checked.size,4825);assert.equal(q.records.filter(x=>x.previousCoverage==="indexed_only").length,3925);assert.equal(q.records.filter(x=>x.previousCoverage==="source_screened_only").length,708);
for(const x of g.records){assert.ok(x.modernEditorialReaderQuestion.endsWith("?"));assert.ok(x.sourcePointers.every(p=>c.records.some(y=>y.sourcePointer===p)));assert.deepEqual(x.separateInheritedAuthorLabels,x.sourcePointers.map(p=>src.get(p)[2]));assert.equal(x.publicationEligibility,"blocked_research_only");}
for(const p of ["catena.matthew.26.26:12","catena.matthew.27.45:1"])assert.equal(c.records.find(x=>x.sourcePointer===p).confirmedIntraFragmentAuthorSplit,true);
assert.equal(c.records.filter(x=>x.AIReviewerDisagreement).length,4);
console.log("PASS: 4,825 partitioned Matthew pointers; 192 AI reviews; 31 distinct source-comparison leads; publication blocked");
