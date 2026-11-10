import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LASANCE_1904_ARCHANGELS_V1 as works,lasance1904ArchangelWork,lasance1904ArchangelMatches} from "../src/pray/lasance-1904-archangel-prayers.v1.js";
import {PRAY_CANONICAL_DATA_V435930 as canon} from "../src/pray/canonical-data.js";
import {NOVENA_CORPUS_V4_IDS} from "../src/pray/novena-corpus-v4.js";

assert.equal(Object.keys(canon.prayers).length,48,"Original canonical 48 preserved");
assert.equal(NOVENA_CORPUS_V4_IDS.length,16,"Original 16 novenas preserved");
assert.equal(works.length,2,"Two and only two separate historical prayer works");
assert.deepEqual(works.map(w=>w.id),["lasance_1904_st_raphael_prayer","lasance_1904_st_gabriel_prayer"]);
assert.deepEqual(works.map(w=>w.subject),["VI","VI"]);
assert.equal(new Set(works.map(w=>w.id)).size,2);
for(const work of works){
 assert.equal(work.originalLanguage,"en");
 assert.equal(work.sourceTranscriptionStatus,"1904_PUBLIC_DOMAIN_ENGLISH_WIKISOURCE_PAGE_MARKED_NOT_PROOFREAD");
 assert.equal(work.originalPageImageIndependentlyCollated,false);
 assert.equal(work.historicalIndulgencesCurrentlyValid,false);
 assert.equal(work.sourceURL,"https://en.wikisource.org/wiki/Page:Prayerbookforrel00lasa_0.djvu/591");
 assert.match(work.sourceWork,/Lasance/);
 assert.match(work.sourceWork,/1904/);
 assert.ok(work.fullEnglish.length>300,"Complete historical English prayer "+work.id);
 assert.ok(work.editorialFrench.length>350,"Complete editorial French prayer "+work.id);
 assert.equal(lasance1904ArchangelWork(work.id),work);
 assert.equal(lasance1904ArchangelMatches({subject:"VI",search:work.titleEn}).filter(x=>x.id===work.id).length,1);
 assert.equal(lasance1904ArchangelMatches({subject:"V",search:work.titleEn}).length,0);
 assert.equal(lasance1904ArchangelMatches({category:"foundations",search:work.titleEn}).length,0);
}
const [raphael,gabriel]=works;
assert.match(raphael.fullEnglish,/^Glorious archangel, St\. Raphael/);
assert.match(raphael.fullEnglish,/young Tobias in his journeying/);
assert.match(raphael.fullEnglish,/physician of God/);
assert.match(raphael.fullEnglish,/living temple of the Holy Ghost\. Amen\.$/);
assert.match(gabriel.fullEnglish,/^O blessed archangel Gabriel/);
assert.match(gabriel.fullEnglish,/mystery of the Incarnation/);
assert.match(gabriel.fullEnglish,/land of the living\. Amen\.$/);
assert.equal(gabriel.recurringProgramme,null);
const novena=raphael.recurringProgramme;
assert.equal(novena.days,9);
assert.equal(novena.fixedNineDayTextIn1904,false);
assert.equal(novena.historicalNovenaRule,"1910_RACCOLTA_PERMITS_ANY_ECCLESIASTICALLY_SANCTIONED_FORM_NO_SINGLE_FIXED_DAY_PRAYER");
assert.equal(novena.presentation,"ONE_1904_PRAYER_REPEATED_FOR_NINE_DAYS_EDITORIAL_GUIDED_ARRANGEMENT");
assert.deepEqual(novena.standardCommonPrayersOptional,["foundations_our_father","foundations_hail_mary","foundations_glory_be"]);
for(const p of novena.standardCommonPrayersOptional)assert.ok(canon.prayers[p].en&&canon.prayers[p].fr,"Reuse canonical source text "+p);
const ui=readFileSync(new URL("../src/pray/presentation-runtime.js",import.meta.url),"utf8");
for(const anchor of [
 "import {LASANCE_1904_ARCHANGELS_V1",
 "function renderLasance1904Archangel(){",
 "if(LIB.open&&lasance1904ArchangelWork(LIB.open))return renderLasance1904Archangel();",
 "data-ao-lasance-1904-archangel-reader",
 "data-ao-lasance-1904-archangel-library",
 "data-ao-archangel-historic-body",
 "data-ao-archangel-source-status",
 "data-ao-raphael-novena-policy",
 "data-ao-raphael-optional-shared",
 "data-ao-raphael-canonical",
 "data-p435930-raphael-prev",
 "data-p435930-raphael-next",
 "data-p435930-archangel-back",
 "LASANCE_1904_ARCHANGELS_V1.filter(w=>w.subject===subject.id).length",
 "archangel1904Section}"
])assert.ok(ui.includes(anchor),"Missing source reader and navigation wiring: "+anchor);
console.log("Lasance 1904 Raphael/Gabriel: 2 complete source prayers; Raphael guided repetition 9 days only; no false fixed historical novena; editorial FR; canon 48/16 protected PASS");
