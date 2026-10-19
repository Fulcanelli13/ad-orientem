import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildRogationsPayload} from "../src/mass/reader-rogations.js";

const read=path=>JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const gate=read("../data/mass/rogation-editorial-release-gate.v1.json");
const registry=read("../data/mass/rogation-187-vernacular-owner-census.v1.json");
const payload=read("../data/presentation/reader-rogations.v1.json");
const graph=read("../data/mass/special-days-extension.v1.3.json").graphs.ROG;
const reader=buildRogationsPayload({graph,payload});
const renderRows=reader.cards.flatMap(c=>c.paragraphs);
assert.equal(gate.schema,"AO_ROGATIONS_EDITORIAL_RELEASE_GATE_V1");
assert.equal(gate.status,"RELEASE_BLOCKED_EVIDENCE_COMPLETE_APPROVAL_INCOMPLETE");
assert.equal(gate.releaseAllowed,false);
assert.equal(reader.cards.length,6);
assert.equal(reader.petitionsDuplicated,false);
assert.equal(renderRows.length,187);
assert.equal(gate.rows.length,187);
assert.equal(gate.sourceInventory.rows,187);
assert.equal(gate.sourceInventory.ordinaryExact,22);
assert.equal(gate.sourceInventory.additionalPrayExact,15);
assert.equal(gate.sourceInventory.otherExactUnlinked,150);
assert.equal(gate.sourceInventory.newCompositionNeeded,null);
assert.equal(gate.sourceInventory.certifiedEnglishRows,0);
assert.equal(gate.sourceInventory.certifiedFrenchRows,0);
assert.deepEqual(gate.sourceInventory.routeCounts,{
 EXACT_INTERNAL_LATIN_FORMULA_UNDER_ROLE_AND_VERNACULAR_REVIEW:37,
 ORIGINAL_1883_OR_1862_HISTORICAL_TEXT_UNDER_PRINT_EDITION_AND_TERRITORY_REVIEW:142,
 "1964_WELLER_OR_2020_OTTAWA_REFERENCE_ONLY_RIGHTS_NOT_CLEARED":3,
 EDITION_VARIANT_REQUIRES_1962_FORM_TRANSLATION_OR_LICENSED_EQUIVALENT:5
});
assert.deepEqual(gate.rows.map(x=>x.rowId),renderRows.map(x=>x.id));
assert.deepEqual(gate.rows.map(x=>x.rowId),registry.rows.map(x=>x.rowId));
for(let i=0;i<187;i++){
 const item=gate.rows[i],source=registry.rows[i],current=renderRows[i];
 assert.equal(item.rowId,source.rowId);
 assert.equal(item.stage,source.stage);
 assert.equal(item.sourcePath,source.sourcePath);
 assert.equal(item.edition1962Latin,"NOT_FULLY_CERTIFIED");
 assert.equal(item.englishSelection,"NOT_ADOPTED");
 assert.equal(item.frenchSelection,"NOT_ADOPTED");
 assert.equal(item.redistributionClearance,"NOT_GRANTED_BY_THIS_AUDIT");
 assert.equal(item.editorialDisposition,"BLOCK_RELEASE");
 assert.equal(item.newTranslationRequired,"UNDETERMINED");
 assert.ok(!Object.hasOwn(item,"en")&&!Object.hasOwn(item,"fr"));
 assert.ok(!Object.hasOwn(item,"latin")&&!Object.hasOwn(item,"englishText"));
 const owner=source.ordinaryCueIds[0]||source.prayIds[0]||null;
 assert.equal(item.existingTextOwner,owner);
 const canon=item.sourcePath.split(".").reduce((o,k)=>o?.[k],payload);
 assert.equal(canon,current.latin);
 if(source.exactOwnerClass!=="NO_ORDINARY_OR_PRAY_EXACT_MATCH")
   assert.equal(item.route,"EXACT_INTERNAL_LATIN_FORMULA_UNDER_ROLE_AND_VERNACULAR_REVIEW");
 else if(gate.blockingRowGroups.HISTORICAL_EDITION_LITANY_GAPS.includes(item.rowId))
   assert.equal(item.route,"EDITION_VARIANT_REQUIRES_1962_FORM_TRANSLATION_OR_LICENSED_EQUIVALENT");
}
assert.deepEqual(gate.blockingRowGroups.INTRO_1962_ROLE_AND_REDUNDANCY,
  Array.from({length:10},(_,i)=>"ROG-R02-"+(i+1)));
assert.deepEqual(gate.blockingRowGroups.HISTORICAL_EDITION_LITANY_GAPS,
 ["ROG-R03-10","ROG-R03-74","ROG-R03-75","ROG-R03-81","ROG-R03-96"]);
assert.deepEqual(gate.blockingRowGroups.OPENING_PSALTER_AND_CHANT,
 ["ROG-R01-A1","ROG-R01-P","ROG-R01-A2"]);
assert.equal(gate.releaseChecks.length,6);
assert.ok(gate.releaseChecks.every(x=>x.status==="BLOCKED"));
assert.equal(gate.mustNot.importWeller1964Verbatim,true);
assert.equal(gate.mustNot.importOttawa2020FrenchVerbatim,true);
assert.equal(gate.mustNot.doubleRogationInvocations,true);
assert.equal(gate.mustNot.modifyNativeCeremonyGraphForSourceComparison,true);
assert.equal(gate.authorities.english1964.reproductionAllowed,false);
assert.equal(gate.authorities.governing1962Rubric.nonDoubling,true);
assert.equal(gate.authorities.english1964.litanyIntro.includes("2 Christe"));
assert.equal(gate.authorities.frenchContemporary.initialLitanies.includes("0 introductory Christe"));
console.log("PASS: 187-row Rogations release gate, 37 internal formula candidates, 142 19c historical editorial candidates, 5 edition variants and 3 opening references; no unauthorized EN/FR promotion.");

