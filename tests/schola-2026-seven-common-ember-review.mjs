// Fail closed on seven historical Common source openings, 56 dated uses,
// and 27 May multi-lesson Pentecost sequence.  No musical or runtime approval.
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {fileURLToPath} from "node:url";
import {buildSevenCommon2026Review,SCHEMA}
 from "../scripts/schola/build-2026-seven-common-ember-review.mjs";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const load=path=>JSON.parse(readFileSync(resolve(root,path),"utf8"));
const source={
 evidence:load("data/research/schola-2026-seven-common-historical-section-evidence.v1.json"),
 owner:load(".tmp/schola-1962-selected-annual/2026-schola-pregospel-original-owner-clusters.json"),
 annual:load(".tmp/schola-1962-selected-annual/2026-selected-gabc-coverage.json"),
 closeout:load(".tmp/schola-1962-selected-annual/2026-schola-closeout-source-exceptions.json"),
 inventory:load("data/research/mass-music-1962-pinned-full-source-universe.v1.json")
};
const actual=buildSevenCommon2026Review(source);
const saved=load(".tmp/schola-1962-selected-annual/2026-schola-seven-common-and-ember-source-review.json");
assert.deepEqual(actual,saved);
assert.equal(actual.schema,SCHEMA);
assert.deepEqual(actual.counts,{
 sourceCandidateFamilies:7,datedCases:56,
 historicalGradualTextAlignments:29,selectedVersusHistoricalOpeningDifferences:27,
 remaining2026PreGospelHolds:128,independentPentecostEmberRoleCases:1,
 sourceAliasesApproved:0,properScoresApproved:0
});
assert.deepEqual(actual.families.map(x=>
 [x.historicalCommon,x.selectedDates,x.incipitAligned,x.incipitDifferent]),[
 ["Commune/C5",19,13,6],
 ["Commune/C4",9,8,1],
 ["Commune/C6a",7,0,7],
 ["Commune/C2a",6,0,6],
 ["Commune/C4a",5,3,2],
 ["Commune/C5b",5,0,5],
 ["Commune/C7a",5,5,0]
]);
assert.equal(actual.allCases.length,56);
assert.equal(new Set(actual.allCases.map(x=>x.date)).size,56);
assert.equal(actual.allCases.every(x=>x.printed1962SectionCertified===false&&
 x.GregorianMelodyCertified===false&&x.publicScoreApproved===false),true);
assert.equal(actual.families.every(x=>x.original1962OwnerApproved===false&&
 x.digitalSourceAliasApproved===false&&x.scorePublicationApproved===false),true);
assert.equal(actual.allCases.filter(x=>
 x.openingDisposition==="HISTORICAL_GRADUAL_OPENING_TEXT_ALIGNS_RESEARCH_ONLY").length,29);
assert.equal(actual.allCases.filter(x=>
 x.openingDisposition==="SELECTED_OPENING_DIFFERS_FROM_HISTORICAL_GRADUAL_MUST_TRACE_1962_VARIANT").length,27);
const may=actual.pentecostEmber;
assert.equal(may.date,"2026-05-27");
assert.equal(may.sourcePath,"Tempora/Pasc7-3");
assert.equal(may.sourceBlobSha,"0bbee976f86bca03718fabe918cf43618fdf13a8");
assert.equal(may.sequenceDonorPath,"Tempora/Pasc7-0");
assert.equal(may.sequenceDonorSha,"64876cd8fa68f29bc86926b60bcc50e4fffa76fe");
assert.deepEqual(may.originalSectionOrder.map(x=>x.section),[
 "LectioL1","GradualeL1","OratioL1","Oratio","Lectio",
 "Graduale","Sequentia","Evangelium"
]);
assert.equal(may.originalSectionOrder[1].type,"FIRST_LESSON_ALLELUIA");
assert.equal(may.originalSectionOrder[5].type,"FINAL_ALLELUIA_WITH_GENUFLECTION");
assert.equal(may.originalSectionOrder[6].type,"PENTECOST_SEQUENCE_INHERITED");
assert.equal(may.allMusicNotatedAndCertified,false);
assert.equal(may.publicScore,false);
assert.deepEqual(actual.publication,{
 noNewPublicScores:true,noRuntimeChanges:true,
 archivalAliasesProhibited:true,full1961NotationCollationStillRequired:true
});
const tamper=change=>{
 const s=structuredClone(source);
 change(s);
 return ()=>buildSevenCommon2026Review(s);
};
assert.throws(tamper(s=>s.evidence.witnesses[0].expected2026DatedCases=18),
 /SCHOLA_SEVEN_COMMONS_HISTORICAL_WITNESS_OR_FAMILY_DRIFT/);
assert.throws(tamper(s=>s.annual.rows.find(x=>x.date==="2026-01-23").sourcePath="Sancti/Forged"),
 /SCHOLA_SEVEN_COMMONS_SELECTED_DAY_NOT_CORROBORATED/);
assert.throws(tamper(s=>s.evidence.acceptance.approvedProperScores=1),
 /SCHOLA_SEVEN_COMMONS_EVIDENCE_INVALID/);
assert.throws(tamper(s=>s.evidence.independentPentecostEmber.sourcePinSha="0".repeat(40)),
 /SCHOLA_SEVEN_COMMONS_PENTECOST_EMBER_SOURCE_OR_SEQUENCE_DRIFT/);
assert.throws(tamper(s=>s.evidence.independentPentecostEmber.order[1].section="Graduale"),
 /SCHOLA_SEVEN_COMMONS_EMBERTIDE_CUE_ORDER_NOT_PROVEN/);
assert.throws(tamper(s=>s.closeout.counts.preGospelDatedOwnershipHolds=0),
 /SCHOLA_SEVEN_COMMONS_CLOSEOUT_SOURCE_CHANGED/);
console.log("PASS 7 original Common witnesses, 56 actual dates: 29 archival Gradual incipit alignments, 27 variant mismatches; 27 May Pentecost Ember two Alleluia positions and Sequence remain separate; zero approvals");
