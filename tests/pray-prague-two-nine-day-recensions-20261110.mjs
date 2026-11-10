import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAGUE_TWO_NOVENA_RECENSIONS_V1 as bank,pragueNovenaRecension,pragueNovenaMatches} from "../src/pray/prague-two-nine-day-recensions.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

assert.equal(Object.keys(canon.prayers).length,48,"Canonical 48 unchanged");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Original 16 novenas unchanged");
assert.equal(bank.programmeCount,2);
assert.equal(bank.canonicalNovenaCountImpact,0);
assert.equal(bank.sourceUrl,"https://icrspfrance.fr/?page=child-jesus-prayers");
assert.equal(bank.originalPrintCollated,false);
assert.equal(bank.sourceDigitalWordingReproducedVerbatim,false);
assert.match(bank.frenchTextStatus,/EDITORIAL_RECASTING/);
assert.match(bank.englishTextStatus,/EDITORIAL_TRANSLATION/);
assert.deepEqual(bank.canonicalCommonPrayerIds,[
 "foundations_our_father","foundations_hail_mary","foundations_glory_be"
]);
for(const id of bank.canonicalCommonPrayerIds){
 assert.ok(canon.prayers[id].en, id+" English required");
 assert.ok(canon.prayers[id].fr, id+" French required");
}
assert.deepEqual(bank.programmes.map(p=>p.sourceAcquisitionId),["AO-AQ-017","AO-AQ-018"]);
assert.deepEqual(bank.programmes.map(p=>p.subject),["II","II"]);
assert.deepEqual(bank.programmes.map(p=>p.variant),["first","second"]);
assert.deepEqual(bank.programmes.map(p=>p.sourceAddressForm),["vous","tu"]);
assert.notEqual(bank.petitions.first.fr,bank.petitions.second.fr);
assert.match(bank.petitions.first.fr,/votre divine Enfance/);
assert.match(bank.petitions.second.fr,/ta divine Enfance/);
assert.match(bank.petitions.first.en,/Thy divine Childhood/);
assert.match(bank.petitions.second.en,/Thy divine Childhood/);
const [first,second]=bank.programmes;
for(const p of bank.programmes){
 assert.equal(pragueNovenaRecension(p.id),p);
 assert.equal(p.days.length,9);
 assert.equal(pragueNovenaMatches({subject:"II",search:p.titleFr}).filter(x=>x.id===p.id).length,1);
 assert.equal(pragueNovenaMatches({subject:"III",search:p.titleFr}).length,0);
 assert.equal(pragueNovenaMatches({category:"essentials",search:p.titleFr}).length,0);
 assert.deepEqual(p.days.map(d=>d.day),[1,2,3,4,5,6,7,8,9]);
 for(const day of p.days){
  assert.ok(day.fr.length>=120,"Incomplete editorial FR day "+p.variant+" "+day.day);
  assert.ok(day.en.length>=120,"Incomplete editorial EN day "+p.variant+" "+day.day);
  assert.ok(day.theme&&day.themeFr);
 }
}
assert.equal(first.sourceHymnPolicy,"NO_HYMN");
assert.equal(second.sourceHymnPolicy,"HYMN_EXPLICIT_DAYS_1_TO_8_NOT_DAY_9");
assert.equal(first.days.filter(d=>d.hymnId).length,0);
assert.equal(second.days.filter(d=>d.hymnId).length,8);
assert.ok(second.days.slice(0,8).every(d=>d.hymnId===bank.hymn.id));
assert.equal(second.days[8].hymnId,null,"Source omits hymn on ninth day");
assert.ok(bank.hymn.fr.length>300);
assert.ok(bank.hymn.en.length>300);
assert.ok(bank.hymn.collectFr.length>200&&bank.hymn.collectEn.length>200);
assert.match(bank.hymn.status,/MODERN_EDITORIAL/);
assert.ok(bank.hymn.versicleFr.startsWith("℣."));
assert.ok(bank.hymn.versicleEn.startsWith("℣."));
assert.ok(bank.conclusion.fr.length>350);
assert.ok(bank.conclusion.en.length>330);
assert.match(bank.conclusion.status,/EDITORIAL/);
for(let i=0;i<9;i++)assert.notEqual(first.days[i].fr,second.days[i].fr,"Recension-specific daily wording must remain distinct "+i);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const needle of [
 "import {PRAGUE_TWO_NOVENA_RECENSIONS_V1",
 "function renderPragueSourceNovena(){",
 "if(LIB.open&&pragueNovenaRecension(LIB.open))return renderPragueSourceNovena();",
 "data-ao-prague-novena-reader",
 "data-ao-prague-day-prayer",
 "data-ao-prague-common",
 "data-ao-prague-hymn",
 "data-ao-prague-intention",
 "data-ao-prague-after-novena",
 "data-ao-prague-novena-library",
 "data-p435930-prague-prev",
 "data-p435930-prague-next",
 "data-p435930-prague-finish",
 "data-ao-prague-novena-open",
 "PRAGUE_TWO_NOVENA_RECENSIONS_V1.programmes.filter(w=>w.subject===subject.id).length",
 "pragueNovenaSection}"
])assert.ok(ui.includes(needle),"Reader incomplete: "+needle);
console.log("Prague novenas: 2 distinct source recensions × 9 editorial EN/FR days, 3 reused canonical prayers, second-recension hymn days 1–8 only, optional post-novena prayer, locked 48/16 unchanged PASS");
