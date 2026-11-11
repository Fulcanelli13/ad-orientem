import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {CESTAC_MARIAN_DEVOTIONS_V1 as works,cestacMarianWork,cestacMarianMatches} from "../src/pray/cestac-marian-devotions.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
const official="https://servantesdemarie.com/fr/pages/pere-cestac-priere-spiritualite-accompagnement-soutien-vierge-marie-auguste-reine";
assert.equal(Object.keys(canon.prayers).length,48,"Canonical collection must remain unchanged");
assert.equal(works.length,1);
assert.deepEqual(works.map(x=>x.order),[1]);
assert.deepEqual(works.map(x=>x.subject),["V"]);
assert.equal(new Set(works.map(x=>x.id)).size,1);
for(const w of works){
 assert.equal(w.primarySource,official);
 assert.equal(w.languageSource,"fr");
 assert.equal(w.original1864LeafletCollated,false);
 assert.equal(w.printedHistoricalIndulgencesCurrent,false);
 assert.ok(w.originalFrench.length>280,"Original French full body required: "+w.id);
 assert.ok(w.editorialEnglish.length>250,"English editorial full body required: "+w.id);
 assert.equal(cestacMarianWork(w.id),w);
 assert.equal(cestacMarianMatches({subject:"V",search:w.enTitle}).filter(x=>x.id===w.id).length,1);
 assert.equal(cestacMarianMatches({subject:"VI",search:w.enTitle}).length,0);
 assert.equal(cestacMarianMatches({category:"essentials",search:w.enTitle}).length,0);
 assert.ok(w.additionalWitnesses.some(x=>x.url.includes("servantesdemarie.com/en/")));
}
assert.equal(works[0].acquisitionId,"AO-AQ-012");
assert.match(works[0].originalFrench,/Auguste Reine des cieux et maîtresse des Anges/);
assert.match(works[0].originalFrench,/écraser la tête de Satan/);
assert.match(works[0].originalFrench,/Qui est comme Dieu/);
assert.match(works[0].originalFrench,/Saints Anges et Archanges/);
assert.equal(works[0].original1864LeafletCollated,false);
assert.equal(works[0].instituteWitnessContainsClosingRefrain,false);
assert.equal(works[0].primaryOnlineWitnessContainsClosingRefrain,true);
assert.equal(works[0].additionalWitnesses.filter(w=>w.type==="ICKSP_ALTERNATE_ENGLISH_RECENSION").length,1);
assert.match(works[0].optionalClosingRefrainFr,/Auguste Reine des cieux/);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const marker of [
 "import {CESTAC_MARIAN_DEVOTIONS_V1",
 "function renderCestacMarianPrayer(){",
 "if(LIB.open&&cestacMarianWork(LIB.open))return renderCestacMarianPrayer();",
 "data-ao-cestac-reader",
 "data-ao-cestac-prayer-body",
 "data-ao-cestac-refrain",
 "data-ao-cestac-variant",
 "data-ao-cestac-library",
 "data-ao-cestac-open",
 "data-p435930-cestac-back",
 "CESTAC_MARIAN_DEVOTIONS_V1.filter(w=>w.subject===subject.id)"
])assert.ok(ui.includes(marker),"Missing source-owning UI contract "+marker);
assert.ok(ui.includes("cestacSection}"));
console.log("Cestac scope: one August Queen FR source body and editorial EN face, ICKSP variant linked, three optional Cestac texts deferred, 48 canonical unchanged PASS");
