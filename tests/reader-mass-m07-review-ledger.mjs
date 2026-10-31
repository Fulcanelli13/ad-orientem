import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditM07ResearchCollection,m07PublicScore}
 from "../src/mass/reader-m07-score-review-ledger.js";
const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const batches=Array.from({length:6},(_,i)=>
 read("data/research/mass-music-m07-gr1961-review-00"+(i+1)+".v1.json"));
const triage=read("data/research/mass-music-m07-342-source-triage.v1.json");
const priority=read("data/research/mass-music-m07-priority-source-queue.v1.json");
const selected=read("data/research/mass-music-m07-selected-2026-text-evidence.v1.json");
const index={schema:"ao-gregobase-graduale1961-research-index-v1",
 screening:{sourceMatchedCoreRows:1254,validStaged:1195,
 transcriptionExceptions:58,duplicateExcluded:1,
 byOfficePart:{al:284,in:229,of:185,co:225,gr:189,tr:83}}};
const audit=auditM07ResearchCollection({batches,triage,priority,index});
assert.equal(audit.status,"RESEARCH_LEDGER_VALID",JSON.stringify(audit));
assert.equal(audit.archivedCandidates,1195);
assert.equal(audit.sourceBatches,6);
assert.deepEqual({...audit.byOfficePart},index.screening.byOfficePart);
assert.equal(audit.textEvidenceCandidates,342);
assert.equal(audit.textStrong,275);
assert.equal(audit.textPartial,39);
assert.equal(audit.textDivergent,28);
assert.equal(audit.textEvidenceOccurrences,506);
assert.equal(audit.sourceReferencedProperCount,91);
assert.equal(audit.noSourceMatchYet,853);
assert.equal(audit.outstandingTranscriptionExceptions,58);
assert.equal(audit.separatelyIndexedPriorityLeads,27);
assert.equal(audit.priorityStatuses.EXACT_GREGOBASE_RECORD_REFERENCE,13);
assert.equal(audit.priorityStatuses.INDEXED_FOLIO_OR_GAP_NO_GABC_ID,14);
assert.equal(audit.sourceSpecificMusicalApprovals,0);
assert.equal(audit.editorialApprovals,0);
assert.equal(audit.publicScores,0);
assert.equal(audit.actualRiteChantAudio,0);
assert.equal(audit.scoresNeverInferredFromIncipit,true);
assert.equal(selected.scope.year,2026);
assert.equal(selected.scope.daysSourceReady,365);
assert.equal(selected.scope.distinctTextMatchedCandidateIds,3);
assert.equal(selected.scope.sourceMatchOccurrences,4);
assert.equal(selected.scope.musicalFacsimileApprovals,0);
assert.equal(selected.scope.editorialPromotions,0);
assert.equal(selected.matches.length,4);
assert.deepEqual([...new Set(selected.matches.map(x=>x.id))].sort(),
 ["GREGOBASE-195","GREGOBASE-346","GREGOBASE-389"]);
assert.ok(selected.matches.every(x=>!x.musicalApproval&&!x.editorialApproval));
assert.ok(selected.matches.every(x=>
 batches.some(b=>b.candidates.some(y=>y.id===x.id))));
const copies=JSON.parse(JSON.stringify(batches));
copies[0].candidates[0].sourceSha256="0".repeat(64);
assert.equal(auditM07ResearchCollection({batches:copies,triage,priority,index}).status,
 "INVALID_SOURCE_LEDGER");
const priorCopy=JSON.parse(JSON.stringify(priority));
priorCopy.leads[0].editorialApproved=true;
assert.equal(auditM07ResearchCollection({batches,triage,priority:priorCopy,index}).reason,
 "PRIORITY_EDITORIAL_GATE_INVALID");
const wrongIndex={...index,screening:{...index.screening,transcriptionExceptions:0}};
assert.equal(auditM07ResearchCollection({batches,triage,priority,index:wrongIndex}).reason,
 "PR1749_SOURCE_INDEX_CONTRADICTION");
assert.equal(m07PublicScore({id:"GREGOBASE-195"},{
 sourcePath:"Sancti/09-14",date:"2026-09-14",verified:true
},{approved:true,personallyApproved:true}),null);
assert.equal(priority.leads.find(x=>x.id==="L07-027").role,"EXCLUDED_FROM_MASS_DISMISSAL");
assert.ok(priority.leads.filter(x=>x.family==="SEQUENCE").length>=5);
assert.ok(priority.leads.some(x=>x.family==="COMPLETE_PATERNOSTER"));
assert.ok(priority.leads.some(x=>x.family==="REQUIEM_DISMISSAL"));
assert.ok(priority.leads.some(x=>x.family==="PROCESSIONAL_DISMISSAL"));
const check=readFileSync(new URL("../src/mass/reader-schola-event-timeline.js",import.meta.url),"utf8");
assert.doesNotMatch(check,/mass-music-m07-gr1961-review|reader-m07-score-review-ledger/);
console.log("PASS M07 complete 1195 chant metadata records, 342 limited text leads, 27 source priorities, source-hash/role guards and zero score publication");
