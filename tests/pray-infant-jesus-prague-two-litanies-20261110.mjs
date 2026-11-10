import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {INFANT_JESUS_LITANIES_V1 as bank,infantJesusLitanyWork,infantJesusLitanyStages,infantJesusLitanyMatches} from "../src/pray/infant-jesus-prague-litanies.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

assert.equal(Object.keys(canon.prayers).length,48,"Canonical 48 must remain unchanged");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"The two litanies are not novenas");
assert.equal(bank.works.length,2);
assert.deepEqual(bank.works.map(x=>x.acquisitionId),["AO-AQ-019","AO-AQ-020"]);
assert.equal(bank.works[0].variant,"SHORT_FULL");
assert.equal(bank.works[1].variant,"LONG_FULL");
assert.deepEqual(bank.works.map(x=>x.subject),["II","II"]);
assert.equal(bank.originalPrintedEditionCollated,false);
assert.equal(bank.frenchEditionStatus,"EDITORIAL_NORMALIZATION_OF_ICRSP_FRENCH_DEVOTIONAL_STRUCTURE_NOT_VERBATIM_PRINTED_EDITION");
assert.equal(bank.englishEditionStatus,"MODERN_AD_ORIENTEM_EDITORIAL_TRANSLATION");
assert.equal(bank.sourceUrl,"https://icrspfrance.fr/?page=child-jesus-prayers");
assert.equal(bank.sections.trinity.length,4);
assert.equal(bank.sections.infant.length,14);
assert.equal(bank.sections["short-requests"].length,3);
assert.equal(bank.sections["short-versicle"].length,2);
assert.equal(bank.sections["short-collect"].length,1);
assert.equal(bank.sections["short-closing"].length,3);
assert.equal(bank.sections["long-opening"].length,6);
assert.equal(bank.sections.deliverances.length,6);
assert.equal(bank.sections["long-requests"].length,15);
assert.equal(bank.sections.agnus.length,3);
assert.equal(bank.sections["long-versicle"].length,2);
assert.equal(bank.sections["long-collect"].length,1);
for(const w of bank.works){
 assert.equal(w.notNovena,true);
 assert.equal(infantJesusLitanyWork(w.id),w);
 assert.equal(infantJesusLitanyMatches("II",w.titleFr).filter(x=>x.id===w.id).length,1);
 assert.equal(infantJesusLitanyMatches("III",w.titleFr).length,0);
 assert.equal(infantJesusLitanyMatches("II",w.titleFr,"foundations").length,0);
 const stages=infantJesusLitanyStages(w.id);
 assert.deepEqual(stages.map(x=>x.id),w.groups,"Each distinct form has its own section flow");
 assert.ok(stages.every(s=>s.items?.length>0));
 for(const section of stages)for(const line of section.items){
  assert.ok(line.fr&&line.en,"Every invocation or collect must exist in both languages");
  assert.ok(!line.responseFr===!line.responseEn,"Responses must be present in both languages or neither");
  assert.ok(line.fr.length>12&&line.en.length>12);
 }
}
assert.equal(infantJesusLitanyStages(bank.works[0].id).length,6);
assert.equal(infantJesusLitanyStages(bank.works[1].id).length,8);
assert.equal(bank.sections["short-versicle"][0].fr.startsWith("℣."),true);
assert.equal(bank.sections["long-versicle"][0].fr.startsWith("℣."),true);
assert.match(bank.sections["short-collect"][0].fr,/notre Roi/);
assert.match(bank.sections["long-collect"][0].fr,/Roi de gloire/);
assert.notEqual(bank.sections["short-collect"][0].fr,bank.sections["long-collect"][0].fr);
assert.equal(bank.sections.agnus.filter(x=>x.responseFr?.length>0).length,3);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const needle of [
 "import {INFANT_JESUS_LITANIES_V1",
 "function renderInfantPragueLitany(){",
 "if(LIB.open&&infantJesusLitanyWork(LIB.open))return renderInfantPragueLitany();",
 "data-ao-infant-litany-reader",
 "data-ao-infant-litany-editorial",
 "data-ao-infant-litany-response",
 "data-ao-infant-litanies-library",
 "data-p435930-infant-litany-prev",
 "data-p435930-infant-litany-next",
 "data-p435930-infant-litany-finish",
 "data-ao-infant-litany-open",
 "INFANT_JESUS_LITANIES_V1.works.filter(w=>w.subject===subject.id).length",
 "infantLitaniesSection}"
])assert.ok(ui.includes(needle),"Missing source-owned reader wiring "+needle);
console.log("Infant Jesus Prague: short and long litanies distinct, 18 shared invocations, independent conclusions, long 6 deliverances/15 intercessions/3 Agnus, editorial EN/FR, original 48/16 preserved PASS");
