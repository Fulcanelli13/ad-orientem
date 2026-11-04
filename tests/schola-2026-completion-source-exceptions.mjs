// Check the generated exception disposition against the SAME pinned source
// evidence, including the absence of any new music/publication permission.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {reconcileSchola2026Completion,SCHOLA_2026_CLOSEOUT_SCHEMA}
 from "../scripts/schola/reconcile-2026-completion-exceptions.mjs";

const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const dir=resolve(root,".tmp/schola-1962-selected-annual");
const load=n=>JSON.parse(readFileSync(resolve(dir,n),"utf8"));
const source={
 annual:load("2026-selected-gabc-coverage.json"),
 full:load("2026-selected-full1049-inline-crosswalk.json"),
 pre:load("2026-selected-pregospel-source-queue.json"),
 work:load("2026-score-verification-all-leads.json"),
 first60:load("2026-first60-complete-antiphon-text-audit.json")
};
const checked=reconcileSchola2026Completion(source);
const saved=load("2026-schola-closeout-source-exceptions.json");
assert.deepEqual(saved,checked);
assert.equal(checked.schema,SCHOLA_2026_CLOSEOUT_SCHEMA);
assert.equal(checked.counts.selectedProperDays,365);
// Locked actual source evidence from 4 Nov 2026. If the original selected
// source changes, require a new explicit audit rather than silently hiding a hold.
assert.deepEqual(checked.counts,{
 selectedProperDays:365,readerProjectionHolds:8,
 ordinaryReaderOrationHolds:6,exceptionalRiteProjectionHolds:2,
 missingPinnedSourcePaths:5,affectedDatesMissingPinnedSource:15,
 preGospelDatedOwnershipHolds:128,distinctPreGospelSourceOwners:115,
 preGospelCauseGroups:5,separateSelectedRoleHolds:1,
 sourceUniqueMusicalCandidates:541,sourceScoreOccurrences:889,
 textExactFirst60:50,textVariantsFirst60:10,newApprovedScores:0
});
assert.deepEqual(checked.ordinaryAndSpecialReaderHolds
 .filter(x=>x.classification==="SPECIAL_RITE_NOT_ORDINARY_MASS")
 .map(x=>x.date),["2026-04-03","2026-04-04"]);
assert.ok(checked.ordinaryAndSpecialReaderHolds
 .filter(x=>x.classification==="ORDINARY_MASS_ORATION_READER_PROJECTION_HOLD")
 .every(x=>x.missingEnglish.every(s=>[
  "COLLECT_SET","SECRET_SET","POSTCOMMUNION_SET"].includes(s))));
assert.deepEqual(checked.selectedSourceTreeGaps
 .map(x=>[x.sourcePath,x.dates.length]).sort((a,b)=>a[0].localeCompare(b[0])),[
 ["Commune/C10Pasc",1],["Commune/C10b",2],["Commune/C10c",1],
 ["Commune/C10t",8],["Tempora/Nat1-1",3]].sort((a,b)=>a[0].localeCompare(b[0])));
assert.deepEqual(checked.preGospelCauseGroups.map(x=>
 [x.primary,x.paschal,x.datedHolds]).sort((a,b)=>b[2]-a[2]),[
 ["SECTION_ABSENT","SECTION_ABSENT",99],
 ["PINNED_SOURCE_UNAVAILABLE","PINNED_SOURCE_UNAVAILABLE",15],
 ["PINNED_SOURCE_UNAVAILABLE","SECTION_ABSENT",9],
 ["AUTHENTICATED_SOURCE_SECTION","SECTION_ABSENT",4],
 ["AUTHENTICATED_SOURCE_SECTION","AUTHENTICATED_SOURCE_SECTION",1]
]);
for(const row of checked.ordinaryAndSpecialReaderHolds){
 assert.equal(row.originalReaderReasons.en.length,row.missingEnglish.length,
  "Each English hold must retain the actual reader's reason");
 assert.equal(row.originalReaderReasons.fr.length,row.missingFrench.length,
  "Each French hold must retain the actual reader's reason");
 assert.ok(row.originalReaderReasons.en.every(x=>x.slot&&x.projectionStatus&&x.reason));
 assert.ok(row.originalReaderReasons.sourceOrationGroupCounts&&
  Number.isInteger(row.originalReaderReasons.sourceOrationGroupCounts.COLLECT_SET));
}
assert.equal(checked.publication.scorePromotionPermitted,false);
assert.equal(checked.publication.publicScoreChanges,0);
const tamper=structuredClone(source);
const gap=tamper.full.absentFromPinnedLatinTree[0];
const unrelated=tamper.annual.rows.find(x=>
 x.status==="SOURCE_MATCHED_FOR_REVIEW"&&x.sourcePath!==gap.sourcePath&&
 !gap.dates.includes(x.date));
assert.ok(unrelated,"A selected day outside the missing source must exist");
gap.dates[0]=unrelated.date;
assert.throws(()=>reconcileSchola2026Completion(tamper),
 /SCHOLA_CLOSEOUT_MISSING_PATH_NOT_REAL_SELECTED_DAY/);
const falsePublish=structuredClone(source);
falsePublish.work.counters.newPublicScores=1;
assert.throws(()=>reconcileSchola2026Completion(falsePublish),
 /SCHOLA_CLOSEOUT_SOURCE_SCHEMA_OR_REVIEW_PUBLICATION_CHANGED/);
const missingSpecial=structuredClone(source);
missingSpecial.annual.rows.find(x=>x.date==="2026-04-03").sourcePath="Tempora/Quad6-6r";
assert.throws(()=>reconcileSchola2026Completion(missingSpecial),
 /SCHOLA_CLOSEOUT_SPECIAL_RITE_SOURCE_IDENTITY_DRIFT/);
const forgedDox=structuredClone(source);
forgedDox.pre.records.find(x=>x.status==="SOURCE_TEXT_RESEARCH_ONLY").holds[0].code="APPROVED";
assert.throws(()=>reconcileSchola2026Completion(forgedDox),
 /SCHOLA_CLOSEOUT_PREGOSPEL_HOLD_UNRECOGNIZED/);
console.log("PASS Schola completion source-exception batch: 6 ordinary oration / 2 special-rite holds; 5 paths 15 dates; 128 source holds in 5 groups; 541 score candidates, zero new approval");
