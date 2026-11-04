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
// Source-corrected 6 March 2026 must graduate from the old research-only
// English reader hold. The 2026 source IDs/hashes and score shortlist remain
// independently pinned by schola-2026-pinned-review-queue-lock.mjs.
assert.equal(checked.counts.readerProjectionHolds,7);
assert.equal(checked.counts.ordinaryReaderOrationHolds,5);
assert.equal(checked.counts.exceptionalRiteProjectionHolds,2);
assert.deepEqual(checked.ordinaryAndSpecialReaderHolds.map(x=>x.date).sort(),[
 "2026-03-27","2026-04-03","2026-04-04","2026-05-04",
 "2026-10-08","2026-12-26","2026-12-28"].sort());
assert.equal(checked.ordinaryAndSpecialReaderHolds.some(x=>x.date==="2026-03-06"),false,
 "Named March 6 English reader regression not restored");
assert.equal(checked.counts.missingPinnedSourcePaths,5);
assert.equal(checked.counts.affectedDatesMissingPinnedSource,15);
assert.equal(checked.counts.separateSelectedRoleHolds,1);
assert.ok(checked.counts.sourceUniqueMusicalCandidates>=541,
 "Source-correcting a formerly held day cannot silently erase vetted score leads");
assert.ok(checked.counts.sourceScoreOccurrences>=889,
 "Source-correcting a formerly held day cannot silently erase dated uses");
assert.equal(checked.counts.textExactFirst60,50);
assert.equal(checked.counts.textVariantsFirst60,10);
assert.equal(checked.counts.newApprovedScores,0);
assert.equal(checked.preGospelCauseGroups.reduce((n,x)=>n+x.datedHolds,0),
 checked.counts.preGospelDatedOwnershipHolds);
assert.ok(checked.preGospelCauseGroups.every(x=>x.datedHolds>0&&
 x.distinctSourcePaths>=1));
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
console.log("PASS Schola 2026 source repair: March 6 returned to reader; 5 ordinary holds plus 2 distinct Triduum rites; original 365-day source and first60 score locks preserved; no new score approval");
