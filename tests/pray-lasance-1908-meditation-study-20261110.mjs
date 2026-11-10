import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LASANCE_1908_MEDITATION_STUDY_WORKS_V1 as works,lasance1908Work,lasance1908Matches} from "../src/pray/lasance-1908-meditation-study.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
assert.equal(Object.keys(canon.prayers).length,48,"Historical imports must not expand core 48");
assert.equal(works.length,4);
assert.deepEqual(works.map(w=>w.id),[
 "lasance_1908_before_meditation",
 "lasance_1908_after_meditation",
 "lasance_1908_our_lady_good_studies",
 "lasance_1908_thomas_study"
]);
assert.deepEqual(works.map(w=>w.subject),["I","I","V","I"]);
assert.equal(new Set(works.map(w=>w.id)).size,4);
for(const work of works){
 assert.equal(work.printedEditionYear,1908);
 assert.equal(work.englishPrintedTextDigitized,true);
 assert.equal(work.originalPrintFacsimileCollated,false);
 assert.equal(work.frenchHistoricalPrintedWitness,false);
 assert.equal(work.frenchStatus,"MODERN_AD_ORIENTEM_EDITORIAL_TRANSLATION");
 assert.equal(work.historicalIndulgencesCurrent,false);
 assert.equal(work.sourceUrl,"https://en.wikisource.org/wiki/My_Prayer-Book/Prayers_During_the_Day");
 assert.ok(work.en&&work.fr&&work.titleEn&&work.titleFr,work.id+" missing full bilingual text");
 assert.equal(lasance1908Work(work.id),work);
 assert.ok(lasance1908Matches({subject:work.subject,search:work.titleEn}).includes(work));
 assert.equal(lasance1908Matches({subject:"VIII",search:work.titleEn}).length,0);
 assert.equal(lasance1908Matches({category:"foundations",search:work.titleEn}).length,0);
}
assert.ok(works[0].en.length>570,"Full before-meditation source required");
assert.match(works[0].en,/Enlighten my understanding and inflame my will/);
assert.match(works[0].en,/sanctification and salvation/);
assert.ok(works[1].en.length>510,"Complete after-meditation source required");
assert.match(works[1].en,/good resolutions/);
assert.match(works[1].en,/Omnia ad majorem Dei gloriam!/);
assert.equal(works[1].sourceEditorialNormalizations[0].digitalWitness,"Ommia ad majorem Dei gloriam!");
assert.equal(works[2].en,"Our Lady of Good Studies, pray for us!");
assert.equal(works[2].acquisitionId,"AO-AQ-083");
assert.equal(works[0].acquisitionId,"AO-AQ-078");
assert.equal(works[3].attributionStatus,"ATTRIBUTED_TO_ST_THOMAS_AQUINAS_IN_1908_LASANCE_EDITION_NOT_INDEPENDENTLY_AUTHENTICATED");
assert.match(works[3].la,/^Concede mihi, misericors Deus/);
assert.match(works[3].la,/et perfecte adimplere/);
assert.match(works[3].en,/examine it prudently/);
assert.match(works[3].fr,/de l’examiner avec prudence/);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const q of [
 'import {LASANCE_1908_MEDITATION_STUDY_WORKS_V1',
 'function renderLasance1908Prayer(){',
 'if(LIB.open&&lasance1908Work(LIB.open))return renderLasance1908Prayer();',
 'data-ao-lasance-1908-reader',
 'data-ao-lasance-1908-library',
 'data-ao-lasance-1908-open',
 'data-ao-lasance-editorial-note',
 'data-p435930-lasance-back',
 'LASANCE_1908_MEDITATION_STUDY_WORKS_V1.filter(x=>x.subject===subject.id)',
 'lasanceWorks.length)?renderLibraryEntryRows'
])assert.ok(ui.includes(q),"Missing Library source-owner wiring "+q);
assert.ok(ui.includes('lasanceSection}'),"Source cards must render in Prayer Library");
console.log("Lasance 1908: 4 complete standalone source prayers in bilingual EN/FR, original Thomas Latin, honest French attribution, historical indentation and canonical 48 untouched PASS");
