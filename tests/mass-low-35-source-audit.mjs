import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {validateGuideRegistry} from "../src/mass/reader-guide.js";
import {LOW_GUIDE_EXPLICIT_APPLICABILITY_IDS,validateLowGuideResearch,
  lowGuideForActiveCue} from "../src/mass/reader-low-guide.js";

const file=(name)=>JSON.parse(readFileSync(new URL("../"+name,import.meta.url),"utf8"));
const audit=file("data/learn/research/mass-low-35-guide-full-source-audit-20261016.v1.json");
const original=file("data/learn/research/mass-low-35-guide-legacy-index-20261016.v1.json");
const corpus=file("data/presentation/reader-text-low.v1.json");
const publicGuides=file("data/presentation/guide-registry.v1.json");
validateLowGuideResearch(original);validateGuideRegistry(publicGuides);
assert.equal(audit.schema,"ao-low-mass-35-full-editorial-source-audit-v1");
assert.equal(audit.comparisonCounts.historicalEntries,35);
assert.equal(audit.comparisonCounts.proposedShortCorrections,18);
assert.equal(audit.comparisonCounts.retainedResearchShort,17);
assert.equal(audit.comparisonCounts.sourceCueAnchors,33);
assert.equal(audit.comparisonCounts.nontextObservationalStages,2);
assert.equal(audit.comparisonCounts.explicitApplicabilityGates,9);
assert.equal(audit.comparisonCounts.publicationApproved,0);
assert.equal(audit.records.length,35);
assert.deepEqual([...LOW_GUIDE_EXPLICIT_APPLICABILITY_IDS],[
  "LOW.003","LOW.008","LOW.014","LOW.028","LOW.029","LOW.030",
  "LOW.033","LOW.034","LOW.035"
]);
const map=new Map(corpus.blocks.flatMap(b=>b.units.map(u=>[u.cue_id,{...u,macro:b.Macro_ID,block:b.Block_ID}])));
const ids=new Set(),priority=new Set();
let changed=0,retained=0,anchored=0,observational=0,high=0;
for(const rec of audit.records){
 const source=original.entries[rec.id];
 assert(source && !ids.has(rec.id),"missing or duplicate audit identity");
 ids.add(rec.id);
 assert.equal(rec.sourceStatus,"RESEARCH_LEGACY_NOT_PUBLISHED");
 assert.equal(rec.previousShort,source.short,"original 1962 Guide witness overwritten");
 assert.equal(rec.originalWorkbookSha256,original.frozenUltraMasterSha256);
 assert.equal(rec.sourceWorkbookRow,source.originalWorkbookRow);
 assert.equal(rec.sourceCueId,source.anchorCueCandidate);
 assert.equal(rec.publicationApproved,false);
 assert.equal(rec.researchPreviewOnly,true);
 assert.equal(rec.originalTextPreserved,true);
 assert(rec.ritusEnglishTranslationUrl.startsWith("https://"));
 if(rec.sourceCueId){
   anchored++;const u=map.get(rec.sourceCueId);
   assert(u,"audit target absent from canonical Low corpus");
   assert.equal(rec.sourceBlockId,u.block);
   assert.equal(rec.sourceMacroId,u.macro);
   assert.equal(rec.anchoredTextKind,u.type||"NO_FIXED_CUE");
   assert.equal(rec.sourceLatinOpening,u.latin?.slice(0,160)||null);
 }else {observational++;assert(["LOW.001","LOW.028"].includes(rec.id));}
 assert.equal(rec.requiresExplicitApplicability,LOW_GUIDE_EXPLICIT_APPLICABILITY_IDS.includes(rec.id));
 if(rec.changeDecision==="CORRECTION_CANDIDATE"){
   changed++;assert.notEqual(rec.proposedShort,rec.previousShort,"invalid unmodified correction");
   assert(rec.sourceComparison.length>30,"meaningful reason required");
 }else {retained++;assert.equal(rec.changeDecision,"RETAIN_RESEARCH_COPY_NOT_SOURCE_CERTIFIED");
   assert.equal(rec.proposedShort,rec.previousShort);}
 if(rec.auditPriority==="P0"){high++;priority.add(rec.id);}
}
assert.deepEqual([ids.size,changed,retained,anchored,observational,high],[35,18,17,33,2,7]);
for(const id of ["LOW.023","LOW.024","LOW.025","LOW.026","LOW.028","LOW.033","LOW.034"]){
 assert(priority.has(id),"high priority source mismatch missing "+id);
}
for(const id of ["LOW.020","LOW.022","LOW.023","LOW.024"]){
 const originalCue=original.entries[id].anchorCueCandidate;
 const g=lowGuideForActiveCue(original,{
   massForm:"LOW_1962",allowResearchPreview:true,
   activeCueId:originalCue,lowCorpus:corpus,
 });
 assert.equal(g?.key,id,"mandatory Canon stage erroneously gated: "+id);
 assert.equal(g?.releaseApproved,false);
}
for(const id of LOW_GUIDE_EXPLICIT_APPLICABILITY_IDS){
 if(id==="LOW.028")continue;
 const cue=original.entries[id].anchorCueCandidate;
 const g=lowGuideForActiveCue(original,{
   massForm:"LOW_1962",allowResearchPreview:true,
   activeCueId:cue,lowCorpus:corpus
 });
 assert.equal(g,null,"conditional stage shown without positive applicability: "+id);
}
assert.equal(audit.records.find(x=>x.id==="LOW.023").sourceLatinOpening,"HOC EST ENIM CORPUS MEUM.");
assert.equal(audit.records.find(x=>x.id==="LOW.026").sourceLatinOpening?.includes("UNCOVERS CHALICE"),true);
assert(!audit.records.find(x=>x.id==="LOW.023").proposedShort.includes("exactly at the elevation"));
assert(audit.records.find(x=>x.id==="LOW.028").proposedShort.includes("server gives a warning bell"));
assert.equal(Object.keys(publicGuides.entries).length,32);
console.log("PASS: 35/35 source-audited Low Guides, 18 corrections and 17 holds, 9 explicit applicability stages, exact 1962 cue+macro alignment, no public release.");
