import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930 as canonical} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

const read=rel=>JSON.parse(readFileSync(new URL(rel,import.meta.url),"utf8"));
const repair=read("../data/pray/canonical-1962-source-link-repair-20261110.v1.json");
const historical=read("../data/pray/prayer-source-certification-inventory.v3.json");
const prayers=canonical.prayers;

assert.equal(repair.schema,"ao.pray.canonical-1962-source-link-repair.v1");
assert.equal(repair.scope,"SOURCE_URLS_ONLY_NO_PRAYER_BODY_CHANGE_NO_PRINT_CERTIFICATION_NO_NEW_VARIANT");
assert.equal(Object.keys(prayers).length,48,"Do not expand original 48");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Do not change original 16 novenas");
assert.equal(repair.patches.length,2);
for(const x of repair.patches){
 const p=prayers[x.id];
 assert.ok(p,"Original canonical prayer missing: "+x.id);
 assert.equal(p.sourceUrl,x.sourceUrl,"Correct 1962 digital Latin source URL required");
 assert.ok(p.en&&p.fr&&p.la,"Previously existing three-language prayer body lost");
 assert.match(p.note,/digital witness, not an independent original-print or three-language translation certificate/);
 assert.equal(x.witnessLanguage,"la");
 assert.equal(x.independentPrintedEditionCollation,false);
 assert.equal(x.englishAndFrenchBodies,"UNCHANGED_PRE_EXISTING_RENDERINGS_NOT_VERBATIM_PRINT_CERTIFIED");
 assert.match(x.witnessType,/NOT_ORIGINAL_PRINT_PHOTOGRAPH/);
}
assert.match(prayers.mass_confiteor.la,/^Confíteor Deo omnipoténti/);
assert.match(prayers.mass_confiteor.la,/et tibi, pater/);
assert.match(prayers.mass_confiteor.la,/mea máxima culpa/);
assert.match(prayers.mass_confiteor.en,/I confess to Almighty God/);
assert.match(prayers.adoration_lord_i_am_not_worthy.la,/^Domine, non sum dignus ut intres sub tectum meum/);
assert.match(prayers.adoration_lord_i_am_not_worthy.en,/Lord, I am not worthy/);
assert.match(prayers.adoration_lord_i_am_not_worthy.fr,/Seigneur, je ne suis pas digne/);

const missing=Object.entries(prayers).filter(([,p])=>!(p.sourceUrl||p.provenance?.url)).map(([id])=>id);
assert.deepEqual(missing,[],"All 48 canonical prayers should now have effective URL references, not full print certificates");
assert.equal(repair.postPatchEffectiveSourceReferenceCountExpected,48);
assert.equal(Object.values(prayers).filter(p=>!!p.sourceUrl).length,repair.postPatchDirectSourceUrlCountExpected,
 "Direct sourceUrl is a different coverage metric from sourceUrl/provenance.url");
assert.deepEqual(historical.counts.prayerMissingUrl,["mass_confiteor","adoration_lord_i_am_not_worthy"],
 "Retain dated historical baseline rather than falsifying past inventory");
for(const x of repair.patches){
 assert.equal(historical.prayers.find(p=>p.id===x.id).sourceUrl,null,
  "Historical snapshot must remain a historical record, with new repair tracked separately");
}
const immac=prayers.marian_consecration_immaculate_heart;
assert.ok(immac.en.length>300,"Keep complete existing English Fatima consecration");
assert.equal(immac.fr,"","Do not fabricate or conflate a French version of another recension");
assert.equal(immac.la,"","Do not fabricate a Latin version of another recension");
assert.equal(immac.sourceUrl,repair.separatePreservedHold.englishSourceUrl);
assert.match(immac.note,/distinct consecration wording/);
assert.match(immac.note,/French and Latin remain withheld/);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
assert.match(ui,/No vernacular translation is available in the current UI language/);
assert.match(ui,/without fabricating a substitute/);
assert.equal(repair.separatePreservedHold.newPrayerAdded,false);
assert.equal(repair.publicationAuthorization,false);
console.log("Prayer 1962 source-link repair: 48/48 source URLs; 48/16 corpus unchanged; Immaculate Heart EN witness and FR/LA hold preserved; historical source inventory preserved PASS");
