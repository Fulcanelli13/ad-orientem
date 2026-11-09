import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {NOVENA_HOLY_FACE_1887_B25, HOLY_FACE_SOURCE_GATES_B25} from "../src/pray/holy-face-janvier-1887-b25.js";

const ledger = JSON.parse(readFileSync(
 new URL("../data/pray/research/pray-holy-face-janvier-editions-nine-day-crosswalk-20261109.v1.json", import.meta.url),
 "utf8"
));
assert.equal(ledger.schema,"ao.pray.holy-face-janvier-edition-crosswalk.v1");
assert.equal(ledger.prayerId,NOVENA_HOLY_FACE_1887_B25.id);
assert.equal(ledger.dayCrosswalk.length,9);
assert.equal(NOVENA_HOLY_FACE_1887_B25.days.length,9);
assert.equal(ledger.scope.readerChanges,false);
assert.equal(ledger.scope.originalPrintedEnglish1887Collated,false);
assert.equal(ledger.scope.originalPrintedFrenchCollated,false);
assert.equal(HOLY_FACE_SOURCE_GATES_B25.originalPrintPhotoCollated,false);
assert.equal(HOLY_FACE_SOURCE_GATES_B25.verifiedFrenchPrayerBody,false);
assert.equal(ledger.englishReprint.status,"MODERN_REPRINT_NOT_PHOTOGRAPHIC_1887_EDITION");
assert.equal(ledger.englishReprint.nineDayHeadingsChecked,true);
assert.equal(ledger.releasePolicy.noEnglishOverwrite,true);
assert.equal(ledger.releasePolicy.noSourceAttributionUpgrade,true);
assert.equal(ledger.releasePolicy.noReprintAsPrintFacsimile,true);
for(let i=0;i<9;i++){
 const c=ledger.dayCrosswalk[i],d=NOVENA_HOLY_FACE_1887_B25.days[i];
 assert.equal(c.day,i+1);
 assert.equal(d.originalSourceDay,i+1);
 assert.equal(c.appEnglishTitle,d.theme.en);
 assert.equal(typeof d.text.en,"string");
 assert.ok(d.text.en.length>800,"Full original-language English text expected for day "+(i+1));
 assert.equal(d.text.fr,"","Historical French day body must remain empty until collation: day "+(i+1));
 assert.equal(c.frenchHistoricalDayBody,"NOT_TRANSCRIBED");
 assert.equal(c.frenchReaderTitle,"EDITORIAL_LABEL_NOT_HISTORICAL_TRANSLATION");
 assert.equal(c.modernEnglishStructuralMatch,"THEME_AND_SECTION_SEQUENCE_ONLY");
}
for(const ed of ledger.editions){
 assert.ok(/^https:\/\//.test(ed.source));
 assert.notEqual(ed.status,"TEXT_COLLATED");
 assert.notEqual(ed.status,"CERTIFIED_TRANSLATION");
}
assert.ok(ledger.editions.some(ed=>ed.year===1858&&ed.language==="fr"));
assert.ok(ledger.editions.some(ed=>ed.year===1889&&ed.language==="fr"));
assert.ok(ledger.editions.some(ed=>ed.year===1894&&ed.language==="fr"));
assert.ok(ledger.editions.some(ed=>ed.year===1887&&ed.language==="en"));
assert.ok(ledger.editions.some(ed=>ed.year===1890&&ed.language==="en"));
assert.equal(ledger.releasePolicy.noRosaryOrConfessionChanges,true);
console.log("PASS: nine Holy Face days retain exact EN, all FR bodies held, research chronology and modern reprint not promoted to print collation");
