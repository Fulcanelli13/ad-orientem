import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
import {buildRogationsLitanyOwnershipMatrix} from "../tools/mass/reconcile-rogation-litany-1962.mjs";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const census=read("../data/mass/rogation-187-vernacular-owner-census.v1.json");
const invocations=read("../data/mass/rogation-112-invocations-historical-en-fr-crosswalk.v1.json");
const historic=new Map(invocations.rows.map(x=>[x.rowId,x]));
const source=read("../data/presentation/reader-rogations.v1.json");
const graph=read("../data/mass/special-days-extension.v1.3.json").graphs.ROG;
const reader=buildRogationsPayload({graph,payload:source});
const authoritative=buildRogationsLitanyOwnershipMatrix();
const renderRows=reader.cards.flatMap(x=>x.paragraphs);
const lookup=new Map(renderRows.map(x=>[x.id,x]));
assert.equal(reader.cards.length,6);
assert.equal(reader.petitionsDuplicated,false);
assert.equal(reader.cards[2].paragraphs.length,112);
assert.equal(reader.cards[5].handoff,"INTROIT");
assert.equal(census.schema,"ao-rogation-187-vernacular-owner-census-v1");
assert.equal(census.status,"187_SOURCE_ROWS_OWNER_AND_OLDER_NEWER_WITNESSES_FOUND_NOT_PUBLICATION_CERTIFIED");
assert.equal(census.rows.length,187);
assert.equal(renderRows.length,187);
assert.equal(new Set(census.rows.map(x=>x.rowId)).size,187);
assert.deepEqual(census.rows.map(x=>x.rowId),renderRows.map(x=>x.id),
  "Consolidated bilingual discovery must preserve all source-owned native reader row positions");
const summary=census.summary;
assert.equal(summary.total,187);
assert.equal(summary.exactOrdinaryLatin,22);
assert.equal(summary.additionalExactPRAYLatin,15);
assert.equal(summary.withoutExactLatinOwner,150);
assert.deepEqual(summary.classification,{
 exactCorpusCandidate:37,
 historicalOutsideLitanyPositionCandidate:46,
 historicalLitanyEnglishFrenchLineMappedUnapproved:96,
 historicalLitanyEnglishOnlyFrenchOmitted:2,
 historicalLitanyNeitherHistoricWitness:3,
 sourceSpecificScriptureChantSearch:0,
 laterRitualOpeningEnFrCandidateUnapproved:3
});
assert.equal(summary.confirmedGenuinelyMissingTranslations,null);
assert.equal(census.historicalLitanyLineAlignment.totalNativeInvocations,112);
assert.equal(census.historicalLitanyLineAlignment.bothHistoricalEnglishFrench,107);
assert.deepEqual(census.historicalLitanyLineAlignment.correspondingUnlinkedCorpusOwnerRows,{
  bothHistorical:96,englishOnly:2,neither:3
});
assert.equal(summary.editoriallyApprovedEN,0);
assert.equal(summary.editoriallyApprovedFR,0);
assert.equal(summary.source1962FullyPrintCollated,false);
const owners=[...authoritative.items,...authoritative.supplementalSourceRows];
assert.equal(owners.length,187);
const refs=new Map(owners.map(x=>[x.rowId,x]));
for(let i=0;i<census.rows.length;i++){
 const row=census.rows[i], rendered=renderRows[i], index=refs.get(row.rowId);
 assert.ok(index,"Missing native source owner "+row.rowId);
 assert.ok(row.sourcePath===index.sourceLocator.split("#")[1],
   "Lost exact original Latin source path "+row.rowId);
 const donor=row.sourcePath.split(".").reduce((obj,key)=>obj?.[key],source);
 assert.equal(donor,rendered.latin,"Canonical donor Latin changed or misattributed "+row.rowId);
 assert.equal(row.stage,reader.cards.find(x=>x.paragraphs.some(p=>p.id===row.rowId))?.id);
 assert.deepEqual(row.ordinaryCueIds,index.ordinaryCueIds,
   "Ordinary candidate IDs differ from existing source owner matrix "+row.rowId);
 // The second-pass PRAY owner index deliberately scans only rows without
 // an Ordinary exact match. The exhaustive census may additionally find
 // PRAY parallels on a row whose primary wording owner is the Ordinary.
 // That is overlapping candidate evidence, not a canon/source disagreement.
 if(!row.ordinaryCueIds.length){
   assert.deepEqual(row.prayIds,index.prayPrayerIds,
     "PRAY candidate IDs differ on an Ordinary-unmatched row "+row.rowId);
 }else{
   assert.ok(index.prayPrayerIds.every(id=>row.prayIds.includes(id)),
     "Secondary PRAY source IDs missing from wider census "+row.rowId);
 }
 if(row.stage==="ROG-R03"){
   const h=historic.get(row.rowId);
   assert.ok(h,"Every Litany row must now have an explicit witness-position record");
   assert.equal(row.historicalParallelRef,
     "data/mass/rogation-112-invocations-historical-en-fr-crosswalk.v1.json#"+row.rowId);
   if(!row.ordinaryCueIds.length&&!row.prayIds.length){
     const type={
       HISTORICAL_EN_FR_PARALLEL:"HISTORICAL_LITANY_LINE_EN_FR_MAPPED_UNAPPROVED",
       HISTORICAL_EN_ONLY:"HISTORICAL_LITANY_EN_ONLY_FR_VARIANT",
       NO_EN_FR_HISTORICAL_PARALLEL:"HISTORICAL_LITANY_NEITHER_EDITION_SOURCE_GAP"
     }[h.historicalPairStatus];
     assert.equal(row.triage,type,"Historical source coverage must stay in sync across the two canonical files");
   }
 }
 assert.equal(row.publication,"REVIEW_PENDING_NOT_PROMOTED");
 assert.equal(Object.hasOwn(row,"latin"),false);
 assert.equal(Object.hasOwn(row,"english"),false);
 assert.equal(Object.hasOwn(row,"french"),false);
 assert.ok(["EXACT_OWNER_CANDIDATE","HISTORICAL_ROW_OR_POSITION_EN_FR_REVIEW",
 "HISTORICAL_EN_FR_LITANY_INTRO_DIALOGUE",
 "HISTORICAL_LITANY_LINE_EN_FR_MAPPED_UNAPPROVED",
 "HISTORICAL_LITANY_EN_ONLY_FR_VARIANT",
 "HISTORICAL_LITANY_NEITHER_EDITION_SOURCE_GAP",
 "HISTORICAL_POST_LITANY_DIALOGUE","HISTORICAL_PSALM_VERSE",
 "HISTORICAL_SUFFRAGES","HISTORICAL_COLLECT_INVITATION",
 "HISTORICAL_EN_FR_TEN_COLLECTS_PAIR","HISTORICAL_EN_FR_FINAL_DIALOGUE",
 "LATER_RITUAL_OPENING_EN_FR_CANDIDATE_UNAPPROVED"].includes(row.triage),
   "Unrecognised review queue "+row.rowId+" "+row.triage);
}
assert.deepEqual(census.stages,{
 "ROG-R01":{rows:4,ordinary:0,additionalPRAY:1,withoutExactOwner:3},
 "ROG-R02":{rows:18,ordinary:6,additionalPRAY:4,withoutExactOwner:8},
 "ROG-R03":{rows:112,ordinary:4,additionalPRAY:7,withoutExactOwner:101},
 "ROG-R04":{rows:35,ordinary:6,additionalPRAY:3,withoutExactOwner:26},
 "ROG-R05":{rows:18,ordinary:6,additionalPRAY:0,withoutExactOwner:12}
});
assert.deepEqual(census.known1962VsHistoricalDifferences,[
 "ROG-R03-10","ROG-R03-74","ROG-R03-75","ROG-R03-81","ROG-R03-96"
]);
assert.deepEqual(census.twoJames,["ROG-R03-15","ROG-R03-18"]);
assert.notEqual(lookup.get("ROG-R03-15").id,lookup.get("ROG-R03-18").id);
assert.equal(census.rows.find(x=>x.rowId==="ROG-R04-PS8").prayIds.includes("foundations_glory_be"),true);
assert.equal(census.rows.find(x=>x.rowId==="ROG-R05-OR").ordinaryCueIds.includes("AO.SM.C0036"),true);
assert.equal(census.rows.find(x=>x.rowId==="ROG-R04-R").ordinaryCueIds.includes("AO.SM.C0210"),true);
assert.equal(census.rows.find(x=>x.rowId==="ROG-R05-F2").ordinaryCueIds.includes("AO.SM.C0034"),true);
assert.equal(census.rows.find(x=>x.rowId==="ROG-R05-F3").ordinaryCueIds.includes("AO.SM.C0035"),true);
const openingCandidates=census.rows.filter(x=>
  x.triage==="LATER_RITUAL_OPENING_EN_FR_CANDIDATE_UNAPPROVED");
assert.deepEqual(openingCandidates.map(x=>x.rowId),
 ["ROG-R01-A1","ROG-R01-P","ROG-R01-A2"]);
assert.equal(summary.laterWitnessCandidateCoverage.publicationApproved,false);
assert.equal(summary.laterWitnessCandidateCoverage.missingTranslationCount,null);
assert.match(summary.laterWitnessCandidateCoverage.englishRights,/COPYRIGHT_1964/);
assert.equal(summary.laterWitnessCandidateCoverage.sourceScopeOnly["ROG-R03"].count,112);
assert.ok(census.releaseRequirements.some(x=>x.includes("never conflate")));
console.log("PASS Rogations 187-row source ownership census, 96 EN/FR mapped Litany candidates, 2 EN-only and 3 in neither historical edition, 37 exact corpus candidates; no invented translation gaps.");
