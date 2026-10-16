import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = p => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const master = read("data/explore/biblical-pericope-comparative-full-master.v5.json");
const canonical = read("data/explore/biblical-reading-continuity-review.v1.json");
const held = new Set(["MISSAL62", "CHRON152"]);
const qualified = new Set(["PRIMARY_SOURCE_EXACT_REFERENCE_CONFIRMED", "PUBLISHER_REFERENCES_HARVESTED"]);

assert.equal(master.metadata.schema, "AO_COMPARATIVE_PERICOPE_MASTER_MATRIX_V5");
assert.equal(master.eventRegistry.length, 151);
assert.equal(canonical.events.length, 151);
assert.equal(canonical.readingChapters.length, 37);
assert.equal(master.sectionRegistry.length, 37);
assert.equal(master.sourceSelectionRecords.length, 432);
assert.equal(master.metadata.fifthHarvestAdditionalRows, 124);
assert.equal(master.metadata.rowsHarvested, 432);
assert.equal(master.metadata.shortSelectionsApproved, 0);
assert.equal(master.metadata.productionReaderChanged, false);
assert.equal(master.fifthHarvestEvidenceTrace.noEditorialSelections, true);
assert.equal(master.fifthHarvestEvidenceTrace.noProductionAppChanges, true);

const sectionKeys = new Set(canonical.readingChapters.map(ch => ch.id || ("reading-chapter:" + ch.slug)));
const families = Array.from({ length: 151 }, () => new Set());
const newRowCounts = { LIFE100: 0, MANNORA100: 0, SMP_TIMELINE: 0 };
const newRowKeys = new Set();

for (const [i, event] of master.eventRegistry.entries()) {
  assert.equal(event.index, i);
  assert.equal(event.eventKey, canonical.events[i].eventKey);
  assert.equal(event.atlasReference, canonical.events[i].reference);
  assert.equal(event.sectionId, canonical.events[i].readingChapterId);
  assert.ok(sectionKeys.has(event.sectionId), "unknown section " + event.sectionId);
}

for (const row of master.sourceSelectionRecords) {
  assert.ok(Number.isInteger(row.eventIndex) && row.eventIndex >= 0 && row.eventIndex < 151);
  const event = master.eventRegistry[row.eventIndex];
  assert.equal(row.eventKey, event.eventKey);
  assert.equal(row.atlasReference, event.atlasReference);
  assert.equal(row.sectionId, event.sectionId);
  assert.ok(master.sourceRegister[row.sourceId], "unknown original publisher " + row.sourceId);
  assert.ok(typeof row.sourceURL === "string" && row.sourceURL.startsWith("https://"));
  assert.ok(typeof row.publishedReferenceVerbatim === "string" && row.publishedReferenceVerbatim.length > 0);
  if (Object.hasOwn(newRowCounts, row.sourceId)) {
    newRowCounts[row.sourceId]++;
    assert.equal(row.evidenceStatus, "PRIMARY_SOURCE_EXACT_REFERENCE_CONFIRMED");
    assert.equal(row.candidateOnlyNotEditorialChoice, true);
    const key = [row.eventIndex, row.sourceId, row.publishedReferenceVerbatim].join("|");
    assert.ok(!newRowKeys.has(key), "duplicate new publisher/event/reference " + key);
    newRowKeys.add(key);
  }
  if (qualified.has(row.evidenceStatus) && !held.has(row.sourceId)) {
    families[row.eventIndex].add(row.sourceFamily || master.sourceRegister[row.sourceId].independentFamily);
  }
}
assert.deepEqual(newRowCounts, { LIFE100: 54, MANNORA100: 63, SMP_TIMELINE: 7 });
assert.equal(families.filter(s => s.size > 0).length, 148);
assert.equal(families.filter(s => s.size >= 2).length, 83);
assert.equal(families.filter(s => s.size >= 3).length, 56);
for (let i=0; i<151; i++) assert.equal(master.eventRegistry[i].qualifiedIndependentFamilies, families[i].size);

const gaps = master.eventRegistry.filter(e => !families[e.index].size);
assert.deepEqual(gaps.map(e => e.index), [59, 60, 131]);
assert.equal(master.fifthHarvestEvidenceTrace.qaHoldCount, 20);
console.log("Biblical Pericope v5: 432 source references, 151 exact canonical events, 148 covered, 83 with 2+, 56 with 3+, 3 held gaps; 0 approved excerpts.");
