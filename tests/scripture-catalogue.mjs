import assert from "node:assert/strict";
import { SCRIPTURE_EDITIONS, DEFAULT_SCRIPTURE_EDITION, scripturePassage, scriptureEditionFor, assertScriptureTextReady } from "../src/scripture/catalogue.js";

assert.deepEqual(Object.keys(SCRIPTURE_EDITIONS).sort(), ["crampon-1923","cpdv-2009","dr-challoner","vulgate-clementine"].sort());
assert.equal(DEFAULT_SCRIPTURE_EDITION.fr, "crampon-1923");
assert.equal(scriptureEditionFor("en").id, "dr-challoner");
assert.equal(scriptureEditionFor("en", "cpdv-2009").id, "cpdv-2009");
assert.equal(scriptureEditionFor("en", "cpdv-2009").role, "readability-alternative");
assert.equal(scriptureEditionFor("en", "cpdv-2009").selectionStatus, "approved-by-product-owner-pending-certification");
assert.equal(scriptureEditionFor("en", "cpdv-2009").doctrinalReview, "pending");
assert.equal(scriptureEditionFor("en", "cpdv-2009").textAccuracyReview, "pending");
assert.throws(() => assertScriptureTextReady("cpdv-2009"), /unavailable/);
assert.equal(scriptureEditionFor("en", "cpdv-2009").enabled, false);
assert.throws(() => scriptureEditionFor("fr", "cpdv-2009"));
assert.equal(SCRIPTURE_EDITIONS["ncb-2019"], undefined);
assert.equal(SCRIPTURE_EDITIONS.knox, undefined);
assert.deepEqual(scripturePassage({ book: "Luke", chapter: 1, verseStart: 28 }), {book:"Luke",chapter:1,verseStart:28,verseEnd:28});
assert.throws(() => scripturePassage({ book: "Luke",chapter:1,verseStart:28,verseEnd:27 }));
assert.throws(() => scripturePassage({ book: "Luke",chapter:0,verseStart:1 }));
for (const edition of Object.values(SCRIPTURE_EDITIONS)) {
  assert.equal(edition.enabled, false);
  assert.throws(() => assertScriptureTextReady(edition.id));
}
console.log("Scripture catalogue foundation contracts passed");
