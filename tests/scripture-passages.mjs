import assert from "node:assert/strict";
import { SCRIPTURE_EDITIONS } from "../src/scripture/catalogue.js";
import { buildScriptureStore, passageReference, scriptureLink, resolveScripturePreference } from "../src/scripture/passages.js";
import { mountScriptureReader } from "../src/scripture/reader.js";

assert.equal(passageReference({ book: "Luke", chapter: 1, verseStart: 28 }), "Luke 1:28");
assert.equal(passageReference({ book: "Luke", chapter: 1, verseStart: 26, verseEnd: 38 }), "Luke 1:26–38");
assert.deepEqual(scriptureLink({ book:"Luke", chapter:1, verseStart:28 }).passage,
  {book:"Luke",chapter:1,verseStart:28,verseEnd:28});
assert.equal(resolveScripturePreference("fr"), "crampon-1923");
assert.throws(() => resolveScripturePreference("fr", "knox"));
assert.throws(() => buildScriptureStore([{ editionId:"knox", book:"Luke",
 chapter:1, verseStart:28, text:"not approved", sourceUrl:"example.org",
 sourceEdition:"test", licenceId:"test", reviewed:true }]), /unavailable/);
const empty = buildScriptureStore([]);
assert.equal(empty.size, 0);
assert.equal(empty.has({book:"Luke",chapter:1,verseStart:28},"knox"),false);
assert.throws(() => empty.get({book:"Luke",chapter:1,verseStart:28},"knox"));
assert.equal(typeof mountScriptureReader, "function");
for (const id of Object.keys(SCRIPTURE_EDITIONS)) assert.equal(SCRIPTURE_EDITIONS[id].enabled,false);
console.log("Scripture passage/reader contracts passed");
