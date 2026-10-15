import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const root=new URL("../data/calendar/", import.meta.url);
const w68=JSON.parse(readFileSync(new URL("sacred-art-w68-w67-r1-explicit-user-scores-20261015.v1.json",root),"utf8"));
const w70=JSON.parse(readFileSync(new URL("sacred-art-w70-six-more-source-flags-exact-file-evidence-20261015.v1.json",root),"utf8"));
const byID=new Map(w68.records.map(r=>[r.recordId,r]));
let n=0;const check=(c,msg)=>{assert.ok(c,msg);n++};
check(w70.schema==="AO_SACRED_ART_W70_SIX_REMAINING_W68_USER_SOURCE_FLAGS_SOURCE_CHECK_V1","W70 schema");
check(w70.records.length===6&&new Set(w70.records.map(r=>r.candidateId)).size===6,"six distinct record IDs");
check(w68.records.filter(r=>r.review.flags.sourceIssue).length===8,"eight W68 user flags");
for(const r of w70.records){
 const p=byID.get(r.candidateId);
 check(!!p&&p.review.flags.sourceIssue,"W68 flagged "+r.candidateId);
 check(r.reviewedCommonsSourceFile===p.sourceFilePage,"exact original file "+r.candidateId);
 check(r.ratedScorePreserved===p.review.numericScore,"rating never altered "+r.candidateId);
 check(!r.productionImageReleaseAllowed&&!r.photoOriginalVerified&&!r.clearUserSourceIssue,"publication hold "+r.candidateId);
 check(r.licenseURL.startsWith("https://creativecommons.org/"),"published Commons photo licence "+r.candidateId);
}
check(w70.records.filter(r=>r.ratedScorePreserved===4).length===3,"three new 4/5 file checks");
check(w70.records.filter(r=>r.ratedScorePreserved===3).length===3,"three new 3/5 file checks");
check(w70.records.filter(r=>r.actualPhysicalOriginalAccessionConfirmed).length===1,"one institution accession confirmed");
check(w70.records.find(r=>r.officialAccession==="PM31001527")?.paintingMakerAsFile.includes("attributed to"),"official attribution qualified");
check(w70.records.every(r=>r.notAPortrait),"narrative and multiple-subject image hold");
check(w70.counts.uniqueFlaggedIdsInvestigatedAfterThisPass===8 && w70.counts.sourceFlagsResolvedByThisBatch===0,"8/8 metadata reviewed, 0/8 cleared");
check(w70.guards.some(s=>s.includes("No permission requests")),"no contact");
console.log("W70 source file gate checks "+n+"/"+n+" PASS");
