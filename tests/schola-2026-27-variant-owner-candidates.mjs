import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {reconcile27SelectedVariants,SCHEMA}
 from "../scripts/schola/reconcile-2026-27-variant-source-candidates.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const load=p=>JSON.parse(readFileSync(resolve(root,p),"utf8"));
const src={
 manifest:load("data/research/schola-2026-27-selected-variant-owner-candidates.v1.json"),
 prior:load(".tmp/schola-1962-selected-annual/2026-schola-seven-common-and-ember-source-review.json"),
 annual:load(".tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json"),
 inventory:load("data/research/mass-music-1962-pinned-full-source-universe.v1.json")
};
const verified=reconcile27SelectedVariants(src);
const stored=load(".tmp/schola-1962-selected-annual/2026-schola-27-variant-owner-candidates.json");
assert.deepEqual(stored,verified);
assert.equal(verified.schema,SCHEMA);
assert.deepEqual(verified.counts,{
 datedHistoricalOpeningDifferences:27,
 exactSelectedLatinReviewGroups:10,
 alternateHistoricalSectionTextualCandidates:23,
 remainingDateSpecificSourceHolds:4,
 secondaryDated1962SelectedTextConflicts:3,
 scoreApprovals:0,sourceAliasesApproved:0
});
assert.equal(verified.sourceRows.length,27);
assert.equal(new Set(verified.sourceRows.map(x=>x.date)).size,27);
assert.equal(verified.sourceRows.filter(x=>
 x.reviewDisposition==="ALTERNATE_OBSOLETE_SECTION_TEXTUAL_MATCH_RESEARCH_ONLY").length,23);
assert.equal(verified.sourceRows.filter(x=>
 x.reviewDisposition!=="ALTERNATE_OBSOLETE_SECTION_TEXTUAL_MATCH_RESEARCH_ONLY").length,4);
assert.equal(verified.completeSelectedLatinGroups.length,10);
assert.equal(verified.completeSelectedLatinGroups.reduce((n,x)=>n+x.dates.length,0),27);
assert.ok(verified.completeSelectedLatinGroups.every(x=>x.status===
 "FULL_SELECTED_LATIN_TEXT_MATCH_ONLY_NO_MELODY_ID"));
assert.ok(verified.sourceRows.every(x=>
 x.original1962AppointedSourceCertified===false&&
 x.original1961MelodicSettingCertified===false&&
 x.publicScoreApproved===false));
assert.deepEqual(verified.sourceRows
 .filter(x=>x.reviewDisposition==="DATED_1962_SECONDARY_PROPERS_CONFLICT_WITH_SELECTED_LATIN")
 .map(x=>x.date),["2026-04-13","2026-04-29"]);
const expected=new Map([
 ["Commune/C5b:Graduale",6],
 ["Commune/C6b:Graduale",7],
 ["Commune/C2:GradualeP",2],
 ["Commune/C2:Graduale",1],
 ["Commune/C4:Graduale",2],
 ["Commune/C4c:Graduale",5]
]);
for(const [path,n] of expected)
 assert.equal(verified.sourceRows.filter(x=>x.sourceOriginalSectionCandidate===path).length,n,path);
assert.equal(verified.sourceRows.filter(x=>
 x.reviewDisposition==="PRINTED_1962_PASCHAL_MIXED_GRADUAL_AND_ALLELUIAS_CONFLICT")[0]?.date,"2026-04-14");
assert.equal(verified.sourceRows.filter(x=>
 ["DATED_1962_SECONDARY_PROPERS_CONFLICT_WITH_SELECTED_LATIN",
 "PRINTED_1962_PASCHAL_MIXED_GRADUAL_AND_ALLELUIAS_CONFLICT"].includes(x.reviewDisposition)).length,3);
assert.equal(verified.sourceRows.filter(x=>
 x.reviewDisposition==="NAMED_1962_SAINT_PROPER_SECONDARY_CORROBORATION_NO_HISTORICAL_BLOB_ALIAS")[0]?.date,"2026-07-07");
assert.deepEqual(verified.publication,{
 publicGregorianScores:0,newSourceAliases:0,
 readerRuntimeMutations:false,pitchNeumeAndUnderlayVerified:false
});
const tamper=mod=>{const x=structuredClone(src);mod(x);
 return ()=>reconcile27SelectedVariants(x);};
assert.throws(tamper(x=>x.manifest.pinnedHistoricalTextCandidates[0].sourceGitBlobSha="0".repeat(40)),
 /SCHOLA_27_VARIANTS_HISTORICAL_SOURCE_PROPOSAL_UNVERIFIED/);
assert.throws(tamper(x=>x.manifest.pinnedHistoricalTextCandidates[0].sourceAliasAuthorized=true),
 /SCHOLA_27_VARIANTS_HISTORICAL_SOURCE_PROPOSAL_UNVERIFIED/);
assert.throws(tamper(x=>x.annual.rows.find(r=>r.date==="2026-04-24").selectedGradualLatin="Entirely unrelated different selected Mass chant that has no Gregorian correspondence anywhere"),
 /SCHOLA_27_VARIANTS_PROPOSED_HISTORICAL_OPENING_NOT_IN_SELECTED_2026_LATIN/);
assert.throws(tamper(x=>x.annual.rows.find(r=>r.date==="2026-04-13").selectedGradualLatin += "\\nConfitebuntur caeli mirabilia tua Domine"),
 /SCHOLA_27_VARIANTS_DATED_PASCHAL_SELECTION_CONFLICT_NOT_REAL/);
assert.throws(tamper(x=>x.manifest.boundaries.properScoresApproved=1),
 /SCHOLA_27_VARIANTS_MANIFEST_INVALID/);
console.log("PASS 27 historical Common selection holds: 23 old text-section leads, four date-specific holds including THREE independently printed-1962 Paschal source conflicts (Apr 13, 14, 29), 10 complete-Latin groups, zero aliases or scores");
