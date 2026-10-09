import assert from "node:assert/strict";
import {parseScriptureReference,ROSARY_SCRIPTURE_LINKS,sourceReadingLink,scriptureBookCatalogue} from "../src/scripture/links.js";
import {mountScriptureLibrary} from "../src/scripture/library.js";
assert.equal(scriptureBookCatalogue().length,73);
assert.equal(Object.keys(ROSARY_SCRIPTURE_LINKS).length,20);
for(const [id,entry] of Object.entries(ROSARY_SCRIPTURE_LINKS)) {
 assert.ok(entry.editorialSummary.en && entry.editorialSummary.fr,id);
 assert.ok(entry.prayerIntention.en && entry.prayerIntention.fr,id);
 assert.ok(entry.relation==="scriptural_event" || entry.relation==="traditional_typology",id);
 assert.ok(sourceReadingLink(entry.passage).includes("version=DRA"),id);
}
assert.equal(ROSARY_SCRIPTURE_LINKS.glo4.relation,"traditional_typology");
assert.equal(ROSARY_SCRIPTURE_LINKS.glo5.relation,"traditional_typology");
assert.deepEqual(parseScriptureReference("Luke 1:26-38"),{book:"Luke",chapter:1,verseStart:26,verseEnd:38});
assert.throws(()=>parseScriptureReference("GospelOfThomas 1:1"));
assert.throws(()=>parseScriptureReference("Luke 1:38-26"));
assert.throws(()=>sourceReadingLink({book:"Luke",chapter:1,verseStart:28},"knox"));
assert.equal(typeof mountScriptureLibrary,"function");
console.log("Scripture library/Rosary bridge contracts passed");