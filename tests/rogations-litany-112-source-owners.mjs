import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsLitanyOwnershipMatrix}
  from "../tools/mass/reconcile-rogation-litany-1962.mjs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";
const read=p=>JSON.parse(readFileSync(new URL(p,import.meta.url),"utf8"));
const source=read("../data/presentation/reader-rogations.v1.json");
const graphs=read("../data/mass/special-days-extension.v1.3.json").graphs;
const m=buildRogationsLitanyOwnershipMatrix();
assert.equal(m.status,"INDEXED_LATIN_SOURCE_NO_VERNACULAR_PROMOTIONS");
assert.equal(m.ritualAuthority.petitionsDuplicated,false,
  "1962 Rubricae generales 82: the Litany petitions may not be doubled");
assert.match(m.ritualAuthority.norm,/non duplicantur/);
assert.match(m.chantBook.historicallyPrintedDirection,/is doubled/);
assert.equal(m.chantBook.conflict,
  "OLDER_CHANT_BOOK_DIRECTION_OVERRIDDEN_BY_1962_GENERAL_RUBRICS");
assert.equal(m.items.length,112);
assert.equal(m.summary.invocationCount,112);
assert.deepEqual(m.sections.map(g=>[g.sourceFirstIndex,g.sourceLastIndex,g.count]),[
  [0,62,63],[63,64,2],[65,85,21],
  [86,103,18],[104,106,3],[107,111,5],
]);
assert.equal(m.items[0].rowId,"ROG-R03-1");
assert.equal(m.items[111].rowId,"ROG-R03-112");
assert.equal(m.items[0].group,"SAINT_INVOCATIONS");
assert.equal(m.items[63].group,"PROPITIUS_ESTO");
assert.equal(m.items[65].group,"LIBERA_NOS");
assert.equal(m.items[86].group,"TE_ROGAMUS");
assert.equal(m.items[104].group,"AGNUS_DEI");
assert.equal(m.items[107].group,"CONCLUSION");
assert.equal(m.items[100].responseFormula,"TE_ROGAMUS_AUDI_NOS");
assert.equal(m.items[14].idDisambiguation,"SANCTE_JACOBE_FIRST_APOSTOLIC_POSITION");
assert.equal(m.items[17].idDisambiguation,"SANCTE_JACOBE_SECOND_APOSTOLIC_POSITION");
assert.notEqual(m.items[14].rowId,m.items[17].rowId,
  "Same Latin Saint James cannot be collapsed into one apostolic identity");
assert.deepEqual(m.summary.sameLiteralButDistinctSaintPositions,
  ["ROG-R03-15","ROG-R03-18"]);
assert.equal(m.summary.ordinaryCueCandidateOccurrences+
  m.summary.prayerCorpusCandidateOccurrences>=
  m.summary.withAnyKnownExactOwner,true);
assert.equal(m.summary.withNeitherOfTwoOwners+
  m.summary.withAnyKnownExactOwner,m.items.length);
assert.equal(m.summary.editorialTranslationGaps,null);
assert.ok(m.items[0].prayPrayerIds.includes("litany_loreto_1962"),
  "Sancta Maria shared Latin must be recognized without importing Loreto's different prayer");
assert.ok(m.items[104].prayPrayerIds.includes("adoration_litany_blessed_sacrament"),
  "Agnus Dei existing prayer phrase was lost");
assert.ok(m.items.some(x=>x.ordinaryCueIds.includes("AO.SM.C0044")));
assert.ok(m.items.every((x,i)=>
  x.index===i&&x.sequence===i+1&&
  x.rowId==="ROG-R03-"+(i+1)&&
  x.sourceLocator.endsWith("processionLitany."+i)&&
  x.repetition===1&&
  x.draftTranslationPromotion==="BLOCKED_PENDING_OWNERSHIP_REVIEW"&&
  !Object.hasOwn(x,"latin")&&!Object.hasOwn(x,"english")&&!Object.hasOwn(x,"french")),
  "Provenance index must never become a duplicate liturgical text/translation owner");
const built=buildRogationsPayload({graph:graphs.ROG,payload:source});
assert.equal(built.cards.length,6);
assert.equal(built.petitionsDuplicated,false);
assert.equal(built.cards[2].paragraphs.length,112);
assert.deepEqual(
  built.cards[2].paragraphs.map(x=>x.latin),
  source.processionLitany,"Rogation original Latin source order must remain unchanged");
assert.deepEqual(
  built.cards[2].paragraphs.map(x=>x.id),
  m.items.map(x=>x.rowId),"Every owner index must align to production 1962 reader ID");
assert.equal(built.cards[2].processionBeginsAt,"Sancta Maria");
assert.deepEqual(m.summary.additionalRogationPrayerRows,{
  opening:4,beforeProcession:18,psalm69:8,suffrages:24,orations:10,final:7,
});
console.log("PASS 112 Rogation Litany source-owned identities, seven liturgical family boundaries, 1962 non-doubling precedence, named saint parity, source order, no copied text.");
console.log(JSON.stringify(m.summary));
