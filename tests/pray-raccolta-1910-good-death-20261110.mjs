import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PRAY_CANONICAL_DATA_V435930} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";
import {RACCOLTA_1910_GOOD_DEATH_WORKS_V1 as works,RACCOLTA_1910_AGONY_429 as agony,raccolta1910GoodDeathWork,raccolta1910GoodDeathMatches} from "../src/pray/raccolta-1910-good-death.v1.js";
assert.equal(Object.keys(PRAY_CANONICAL_DATA_V435930.prayers).length,48,"Original 48 prayers remain unchanged");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Original 16 novenas remain unchanged");
assert.deepEqual(works.map(w=>w.number),[428,435]);
assert.equal(new Set(works.map(w=>w.id)).size,2);
for(const w of works){
 assert.equal(w.subject,"IX");
 assert.ok(w.la.length>50&&w.en.length>60&&w.fr.length>60);
 assert.equal(w.historicalIndulgencesCurrentlyValid,false);
 assert.match(w.sourceURL,/Raccolta/);
 assert.match(w.witnessStatus,/NOT_ORIGINAL_PRINT_FACSIMILE/);
 assert.equal(raccolta1910GoodDeathWork(w.id),w);
 assert.equal(raccolta1910GoodDeathMatches({subject:"IX",search:w.titleEn}).filter(x=>x.id===w.id).length,1);
 assert.equal(raccolta1910GoodDeathMatches({subject:"V",search:w.titleEn}).length,0);
 assert.equal(raccolta1910GoodDeathMatches({category:"essentials",search:w.titleEn}).length,0);
}
assert.match(works[0].la,/^Beati mortui/);
assert.match(works[0].la,/in peccato lethali expirem/);
assert.match(works[0].en,/^Blessed are the dead/);
assert.match(works[0].en,/hour of my death\. Amen\.$/);
assert.match(works[1].la,/^Nos, Jesu, Maria/);
assert.equal(works[1].languagePolicy,"HISTORICAL_LATIN_EDITORIAL_ENGLISH_AND_FRENCH");
assert.equal(agony.number,429);
assert.equal(agony.kind,"PRESCRIBED_DEVOTION_NOT_DISTINCT_PRAYER");
assert.deepEqual(agony.steps,[
 "foundations_our_father","foundations_our_father","foundations_our_father",
 "foundations_hail_mary","foundations_hail_mary","foundations_hail_mary"
]);
for(const id of new Set(agony.steps)){
 const prayer=PRAY_CANONICAL_DATA_V435930.prayers[id];
 assert.ok(prayer&&prayer.en&&prayer.fr,"Use already-owned canonical prayer "+id);
}
assert.match(agony.instructionEn,/kneeling unless physical infirmity/);
assert.equal(agony.historicalIndulgencesCurrentlyValid,false);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const anchor of [
 "function renderRaccoltaGoodDeath(){","raccolta1910GoodDeathMatches({",
 "data-ao-raccolta-good-death-reader","data-ao-raccolta-good-death-library",
 "data-ao-raccolta-agony-progress","data-ao-raccolta-prayer-body",
 "data-p435930-raccolta-prev","data-p435930-raccolta-next",
 "data-p435930-raccolta-back","data-ao-raccolta-latin",
 "RACCOLTA_1910_GOOD_DEATH_WORKS_V1.filter(w=>w.subject===subject.id)"
])assert.ok(ui.includes(anchor),"Missing UI integration "+anchor);
console.log("Raccolta 1910: 2 distinct prayers (§428/435) and §429 six canonical recitations; bilingual search, reader & navigation; historical source and 48/16 preserved PASS");
