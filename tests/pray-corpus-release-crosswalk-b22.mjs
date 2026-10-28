import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(rel)=>JSON.parse(readFileSync(new URL(rel,import.meta.url),"utf8"));
const original=read("../data/pray/prayer-corpus-editorial-acquisition-master.v1.json");
const cross=read("../data/pray/prayer-corpus-release-crosswalk-b22.v1.json");
const old=original.records;
const rows=cross.records;
assert.equal(old.length,97,"Historical master must still have 97 rows");
assert.equal(rows.length,old.length,"Every historical candidate must have exactly one B22 assessment");
assert.equal(cross.summary.total,97);
assert.equal(new Set(rows.map(x=>x.id)).size,97);
assert.deepEqual(rows.map(x=>x.id),old.map(x=>x.id),"No arbitrary ID or order replacement");
for(let i=0;i<old.length;i++){
 const a=old[i],b=rows[i];
 assert.equal(b.title,a.title);
 assert.equal(b.originalDecision,a.decision,"Historic acceptance decision must not be rewritten");
 assert.equal(b.originalPriority,a.priority);
 assert.equal(b.sourceUrl,a.source_url);
 assert.equal(b.originalRegisteredTextImported,a.text_imported);
 assert.equal(b.currentTextImportedByThisAudit,false);
 assert.ok(["LIVE_EXACT","EXISTING_OWNER","INTENT_COVERED","OTHER_MODULE","DISTINCT_CANDIDATE","SOURCE_BLOCKED","EDITORIAL_DEFER","EXCLUDE"].includes(b.currentAssessment));
 assert.ok(b.assessmentBasis.length>22);
 if(b.currentAssessment==="INTENT_COVERED")assert.equal(b.statusPrecision,"PURPOSE_NOT_EXACT_TEXT");
 if(b.currentAssessment==="EXISTING_OWNER")assert.equal(b.statusPrecision,"OWNERSHIP_NOT_UI_VISIBILITY_CERTIFICATION");
 if(b.currentAssessment==="LIVE_EXACT")assert.ok(Number.isInteger(b.implementationPr)&&b.implementationPr>0);
 if(b.currentAssessment==="DISTINCT_CANDIDATE"){
  assert.ok(b.candidatePriority&&b.candidateNextGate&&b.candidateRank>0);
  assert.equal(b.statusPrecision,"NO_RELEASE_CLAIM");
 }
}
const count={};for(const x of rows)count[x.currentAssessment]=(count[x.currentAssessment]||0)+1;
assert.deepEqual(count,cross.summary.byAssessment);
assert.deepEqual(count,{LIVE_EXACT:6,SOURCE_BLOCKED:12,INTENT_COVERED:21,EXISTING_OWNER:25,EDITORIAL_DEFER:19,DISTINCT_CANDIDATE:5,EXCLUDE:4,OTHER_MODULE:5});
assert.equal(cross.summary.alreadyServedOrOwned,57);
assert.deepEqual(rows.filter(x=>x.candidateRank).sort((a,b)=>a.candidateRank-b.candidateRank).map(x=>x.id),cross.priorityCandidates);
assert.deepEqual(cross.priorityCandidates,["AO-AQ-053","AO-AQ-062","AO-AQ-065","AO-AQ-066","AO-AQ-029"]);
assert.equal(rows.find(x=>x.id==="AO-AQ-078").currentAssessment,"SOURCE_BLOCKED","Longer Lasance before-meditation remains held");
assert.equal(rows.find(x=>x.id==="AO-AQ-060").statusPrecision,"PURPOSE_NOT_EXACT_TEXT","Peace 1857 source must not be equated with 1910 §18");
assert.equal(rows.find(x=>x.id==="AO-AQ-064").currentAssessment,"EXISTING_OWNER","Parallel St Joseph source witness must not be counted as delivered seven-mystery programme");
assert.match(rows.find(x=>x.id==="AO-AQ-065").candidateNextGate,/1987 copyrighted/,"Do not reproduce modern copyrighted Montfort English");
assert.match(rows.find(x=>x.id==="AO-AQ-066").candidateNextGate,/home-vs-Blessed-Sacrament/,"Private home vigil not Eucharistic exposition");
assert.equal(cross.rules.freezeLegacyAcquisitionMaster,true);
assert.equal(cross.rules.notEncyclopaedia,true);
assert.equal(cross.rules.zeroCost,true);
assert.equal(cross.rules.noNewTopLevelModule,true);
console.log("Pray B22: 97/97 exact candidate assessment; 57 owned/served, 5 format gaps, 12 source holds, 19 editorial deferrals, 4 exclusions; original decisions preserved PASS");
