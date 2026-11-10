import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {ICKSP_INFANT_JESUS_TWO_PRAYERS_V1 as works,ickspInfantWork,ickspInfantWorksForSubject} from "../src/pray/icksp-infant-jesus-two-prayers.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
assert.equal(Object.keys(canon.prayers).length,48,"Do not expand canonical Prayer corpus");
assert.equal(works.length,2);
assert.deepEqual(works.map(x=>x.acquisitionId),["AO-AQ-021","AO-AQ-023"]);
assert.deepEqual(works.map(x=>x.subject),["II","II"]);
assert.equal(new Set(works.map(x=>x.id)).size,2);
for(const x of works){
 assert.equal(x.sourceLanguage,"fr");
 assert.equal(x.sourceUrl,"https://icrspfrance.fr/?page=child-jesus-prayers");
 assert.equal(x.frenchWitnessStatus,"ICKSP_FRANCE_PUBLISHED_TEXT_NOT_OLD_PRINT_COLLATED");
 assert.equal(x.englishStatus,"MODERN_AD_ORIENTEM_EDITORIAL_TRANSLATION");
 assert.equal(x.historicOriginalPrintedEditionCollated,false);
 assert.equal(x.historicIndulgencesCurrent,false);
 assert.equal(ickspInfantWork(x.id),x);
 assert.ok(x.fr.length>300&&x.en.length>280,x.id+" must have complete French and English bodies");
 assert.equal(ickspInfantWorksForSubject("II",x.titleFr).filter(w=>w.id===x.id).length,1);
 assert.equal(ickspInfantWorksForSubject("I",x.titleFr).length,0);
 assert.equal(ickspInfantWorksForSubject("II",x.titleFr,"essentials").length,0);
}
const memoria=works[0],eudes=works[1];
assert.ok(memoria.fr.length>1100&&memoria.en.length>1100);
assert.match(memoria.fr,/Marguerite Marie du saint Sacrement/);
assert.match(memoria.fr,/archanges Michel, Gabriel, et Raphaël/);
assert.match(memoria.fr,/consolé et exaucé\. Amen/);
assert.equal(memoria.ellipsisRepresentsPersonalPetition,true);
assert.equal(memoria.attribution,"TRADITIONAL_MARGUERITE_MARIE_DU_SAINT_SACREMENT_PROMISE_WITHIN_TEXT_AUTHOR_UNVERIFIED");
assert.match(eudes.fr,/^Nous vous adorons, ô Enfant-Jésus, notre roi/);
assert.match(eudes.fr,/Recevez-le et gardez-le tout entier/);
assert.match(eudes.fr,/Ainsi soit-il\.$/);
assert.equal(eudes.attribution,"ATTRIBUTED_TO_ST_JEAN_EUDES_BY_ICKSP_FRANCE_FIRST_PRINT_UNVERIFIED");
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const marker of [
 "import {ICKSP_INFANT_JESUS_TWO_PRAYERS_V1",
 "function renderIckspInfantPrayer(){",
 "if(LIB.open&&ickspInfantWork(LIB.open))return renderIckspInfantPrayer();",
 "data-ao-icksp-infant-reader",
 "data-ao-icksp-infant-body",
 "data-ao-icksp-infant-intention",
 "data-ao-icksp-infant-library",
 "data-ao-icksp-infant-open",
 "data-p435930-icksp-infant-back",
 "ICKSP_INFANT_JESUS_TWO_PRAYERS_V1.filter(w=>w.subject===subject.id)",
 "infantSection}"
])assert.ok(ui.includes(marker),"Incomplete source-owned Library wiring: "+marker);
console.log("ICKSP Infant Jesus: 2 complete French-source prayers, editorial EN, truthful attribution, no modern text imported or duplicate canon IDs PASS");
