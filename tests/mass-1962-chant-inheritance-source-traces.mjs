import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load = p => JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const idx=load("data/geography/research/mass-1962-105-source-path-chant-index-20261011.v1.json");
const inh=load("data/geography/research/mass-1962-chant-inheritance-source-traces-20261011.v1.json");
assert.equal(inh.schema,"MASS_CHANT_SOURCE_INHERITANCE_RESOLUTION_V1");
assert.equal(inh.sourceLinkCandidates.length,42);
assert.equal(idx.stats.inheritanceRows,42);
assert.deepEqual(inh.counts,{
 "PARENT_FOUND_BIBLE_NOTES_CANDIDATE":34,
 "PARENT_PATH_OUTSIDE_FOUR_CHANT_INDEX":7,
 "NONSTANDARD_LITURGICAL_SECTION_HOLD":1
});
const masters=new Map(idx.rows.map(r=>[r.sourcePath+"|"+r.sourceSection,r]));
const own=new Map(idx.rows.map(r=>[r.sourcePath+"|"+r.properSlot,r]));
const duplicateKeys=inh.sourceLinkCandidates.map(r=>r.sourcePath+"|"+r.properSlot);
assert.equal(new Set(duplicateKeys).size,42);
assert.ok(inh.sourceLinkCandidates.every(r=>!r.facsimile1962Verified&&!r.bibleEditionVerified&&!r.publishable));
assert.equal(inh.publishable,false);
for(const link of inh.sourceLinkCandidates){
 const target=own.get(link.sourcePath+"|"+link.properSlot);
 assert.ok(target&&target.inheritanceDirectives.includes(link.originalDirective));
 assert.equal(link.provenanceType,"SECONDARY_DIRECT_INHERITANCE_FROM_EXISTING_RAW_SOURCE");
 if(link.lookupStatus==="PARENT_FOUND_BIBLE_NOTES_CANDIDATE"){
   const parent=masters.get(link.parentSourcePath+"|"+link.parentSection);
   assert.ok(parent&&parent.sourceBiblicalAnnotations.length>0,"Direct existing parent required");
   assert.deepEqual(link.parentCandidateAnnotations,parent.sourceBiblicalAnnotations);
   assert.deepEqual(parent.inheritanceDirectives,[],"No silent multi-hop inheritance");
   assert.equal(link.parentSourceUrl,parent.sourceUrl);
 }else {
   assert.deepEqual(link.parentCandidateAnnotations,[],"Do not create Bible references for unavailable parents or special sections");
 }
}
assert.equal(inh.sourceLinkCandidates.filter(x=>x.parentCandidateAnnotations.length).length,34);
const candlemas=inh.sourceLinkCandidates.find(x=>x.sourcePath==="Sancti/02-02"&&x.properSlot==="INTROIT");
assert.equal(candlemas.parentSourcePath,"Tempora/Pent08-0");
assert.ok(candlemas.parentCandidateAnnotations.some(x=>x.includes("Ps 47")));
assert.ok(inh.sourceLinkCandidates.some(x=>x.parentSection==="GradualeL3"&&x.lookupStatus==="NONSTANDARD_LITURGICAL_SECTION_HOLD"));
assert.ok(inh.sourceLinkCandidates.filter(x=>x.originalDirective.startsWith("@Commune/")).every(x=>x.lookupStatus==="PARENT_PATH_OUTSIDE_FOUR_CHANT_INDEX"));
assert.ok(inh.restrictions.some(s=>s.includes("DO NOT increase")||s.includes("do NOT increase")));
console.log("PASS source-owned chant inheritance: 42 directives traced, 34 parent-section Bible source candidates, 8 holds, zero verse or facsimile approvals");
