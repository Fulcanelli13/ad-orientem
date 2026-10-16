import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const json = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const d = json("data/explore/biblical-pericope-comparative-full-master.v6.json");
const a = json("data/explore/biblical-pericope-exact-boundary-agreement.v6.json");
const base = json("data/explore/biblical-reading-continuity-review.v1.json");
const qualified = new Set(["PRIMARY_SOURCE_EXACT_REFERENCE_CONFIRMED", "PUBLISHER_REFERENCES_HARVESTED"]);
const excluded = new Set(["MISSAL62", "CHRON152"]);
const abs = new Set(["ABS45", "ABS_START", "ABS_DAILY", "ABS_WOMEN"]);
assert.equal(d.metadata.schema, "AO_COMPARATIVE_PERICOPE_MASTER_MATRIX_V6");
assert.equal(d.metadata.shortSelectionsApproved, 0);
assert.equal(d.metadata.productionReaderChanged, false);
assert.equal(d.sourceSelectionRecords.length, 460);
assert.equal(base.events.length, 151);
assert.equal(base.readingChapters.length, 37);
assert.equal(d.eventRegistry.length, 151);
assert.equal(a.review.length, 151);
assert.equal(Object.keys(d.sourceRegister).length, 26);
const chapterIds = new Set(base.readingChapters.map(ch => ch.id));
const families = Array.from({length: 151}, () => new Set());
const newSourceCount = Object.fromEntries(["ABS_START", "ABS_DAILY", "ABS_WOMEN"].map(k => [k, 0]));
let lez = 0;
for (const [i, e] of d.eventRegistry.entries()) {
  assert.equal(e.index, i);
  assert.equal(e.eventKey, base.events[i].eventKey);
  assert.equal(e.sectionId, base.events[i].readingChapterId);
  assert.equal(e.atlasReference, base.events[i].reference);
  assert.ok(chapterIds.has(e.sectionId), "not canonical 37-group id");
  assert.equal(a.review[i].eventKey, e.eventKey);
}
for (const r of d.sourceSelectionRecords) {
  assert.equal(r.eventKey, d.eventRegistry[r.eventIndex].eventKey);
  assert.equal(r.sectionId, d.eventRegistry[r.eventIndex].sectionId);
  assert.equal(r.atlasReference, d.eventRegistry[r.eventIndex].atlasReference);
  assert.ok(d.sourceRegister[r.sourceId], "unknown publisher source");
  assert.ok(r.sourceURL?.startsWith("https://"), "missing original publisher URL");
  assert.ok(r.publishedReferenceVerbatim, "no original printed verse reference");
  if (Object.hasOwn(newSourceCount, r.sourceId)) {
    newSourceCount[r.sourceId]++;
    assert.equal(r.sourceFamily, "American Bible Society Deuterocanon");
  }
  if (r.eventIndex === 131 && r.sourceId === "LEC98" && r.publishedReferenceVerbatim === "Acts 9:26-31") lez++;
  if (qualified.has(r.evidenceStatus) && !excluded.has(r.sourceId)) families[r.eventIndex].add(r.sourceFamily);
}
assert.deepEqual(newSourceCount, { ABS_START:25, ABS_DAILY:1, ABS_WOMEN:1 });
assert.equal(lez, 1, "Lectionary 53 must appear once as Saul/Tarsus source");
for (const [i, f] of families.entries()) assert.equal(d.eventRegistry[i].qualifiedIndependentFamilies, f.size);
assert.equal(families.filter(s=>s.size>=1).length, 149);
assert.equal(families.filter(s=>s.size>=2).length, 107);
assert.equal(families.filter(s=>s.size>=3).length, 57);
assert.deepEqual(d.eventRegistry.filter(e=>!e.qualifiedIndependentFamilies).map(e=>e.index),[59,60]);
assert.equal(a.eventsWithAtLeastTwoFamiliesSameSimpleExactVerseRange,27);
assert.equal(a.eventsWithTwoFamiliesSameReferenceAsAtlasAnchor,23);
assert.equal(a.sourceRowsStrictlyParseable,257);
assert.equal(a.approvedScriptureChoices,0);
assert.equal(a.productionAppChanges,false);
assert.equal(a.review.filter(e=>e.strictAgreeingOriginalEditorialRangeGroups.length>0).length,27);
assert.equal(a.review.filter(e=>e.exactAtlasReferenceAgreedByTwoOrMoreFamilies).length,23);
console.log("Biblical v6 integrity PASSED: 460 original source references, 149/151 covered, 107 with 2+ families, 57 with 3+, 27 strict-boundary agreements; no selections or app changes.");
