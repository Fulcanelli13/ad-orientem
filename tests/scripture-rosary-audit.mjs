import assert from "node:assert/strict";
import { auditRosaryScriptureSlots } from "../src/scripture/rosary-audit.js";
const result = auditRosaryScriptureSlots([]);
assert.equal(result.certified,false);
assert.deepEqual(result.problems[0],{issue:"wrong-count",expected:200,actual:0});
const candidate={id:"joyful-01-01",mysteryId:"joyful-01",
 passage:{book:"Luke",chapter:1,verseStart:28},
 sourceEdition:"verified edition", sourceUrl:"https://example.org/source",
 review:{textAccuracy:"approved", context:"approved",
 mysteryRelevance:"approved",translationFidelity:"approved"}};
assert.equal(auditRosaryScriptureSlots([candidate],{expectedCount:1}).certified,true);
assert.equal(auditRosaryScriptureSlots([candidate,candidate],{expectedCount:2}).certified,false);
assert.equal(auditRosaryScriptureSlots([{...candidate,review:{}}],{expectedCount:1}).certified,false);
console.log("Rosary certification gate contracts passed");
