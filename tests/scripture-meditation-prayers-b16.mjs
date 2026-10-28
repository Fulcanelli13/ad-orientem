import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {scriptureMeditationPrayers} from "../src/pray/scripture-meditation-prayers.v1.js";
import {prayerAcquisitionCandidates} from "../src/pray/prayer-acquisition-historical-witnesses.v1.js";
const enBefore=scriptureMeditationPrayers("before",{language:"en"});
const frBefore=scriptureMeditationPrayers("before",{language:"fr"});
const enAfter=scriptureMeditationPrayers("after",{language:"en"});
const frAfter=scriptureMeditationPrayers("after",{language:"fr"});
assert.deepEqual(enBefore.map(x=>x.id),[
 "thomas_aquinas_concede_mihi_lasance_1908_en",
 "thomas_aquinas_concede_mihi_lasance_1908_la"
]);
assert.deepEqual(frBefore.map(x=>x.id),["thomas_aquinas_concede_mihi_lasance_1908_la"]);
assert.deepEqual(enAfter.map(x=>x.id),["lasance_prayer_after_meditation_1908_en"]);
assert.equal(frAfter.length,0,"No unverified French version or English fallback");
assert.equal(scriptureMeditationPrayers("unknown").length,0);
assert.equal(scriptureMeditationPrayers("before",{language:"xx"}).length,0);
assert.equal(prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"en",research:true}).length,2);
assert.equal(prayerAcquisitionCandidates("prepare_spiritual_reading",{language:"en"}).length,1,
 "Longer p.225 preparatory prayer stays withheld");
for(const item of [...enBefore,...frBefore,...enAfter]){
 assert.ok(item.text.length>100);
 assert.ok(item.source.scanPageUrl.startsWith("https://en.wikisource.org/wiki/Page:MyPrayerBookHappinessInGoodness.djvu/"));
 assert.ok(["226","228"].includes(item.source.page));
 assert.equal(item.text.includes("Ommia"),false);
}
assert.equal(enAfter[0].text.includes("Omnia ad majorem Dei gloriam"),true);
assert.equal(enBefore[0].language,"en");
assert.equal(enBefore[1].language,"la");
assert.equal(frBefore[0].language,"la");
assert.ok(enBefore[0].text.startsWith("Grant me grace"));
assert.ok(enBefore[1].text.startsWith("Concede mihi"));
const library=readFileSync(new URL("../src/scripture/library.js",import.meta.url),"utf8");
const css=readFileSync(new URL("../src/scripture/styles.js",import.meta.url),"utf8");
assert.ok(library.includes('import {scriptureMeditationPrayers} from "../pray/scripture-meditation-prayers.v1.js"'));
assert.ok(library.includes('const beforePrayer=readingPrayerDisclosure("before")'));
assert.ok(library.includes('const afterPrayer=readingPrayerDisclosure("after")'));
assert.ok(library.includes("main.append(beforePrayer)"));
assert.ok(library.includes("main.append(afterPrayer)"));
assert.ok(library.includes('const details=element("details",null,"aoScriptureOptionalPrayer")'),
 "Both controls use accessible native one-tap disclosures, not additional global routes");
assert.ok(library.includes("body.append(element(\"p\",paragraph"));
assert.ok(css.includes(".aoScriptureOptionalPrayer>summary"));
assert.ok(!library.includes("STAGED_RESEARCH_NOT_LIVE"));
console.log("B16: two Aquinas EN/Latin before-reading choices and one Lasance English closing prayer; source and locale gates PASS");
