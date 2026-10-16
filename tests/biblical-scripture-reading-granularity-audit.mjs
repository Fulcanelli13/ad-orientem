import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = p => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const canonical = read("data/explore/biblical-reading-continuity-review.v1.json");
const source = read("data/explore/biblical-pericope-comparative-full-master.v7.json");
const audit = read("data/explore/biblical-scripture-reading-granularity-audit.v1.json");

assert.equal(audit.schema, "AO_BIBLICAL_SCRIPTURE_READING_GRANULARITY_AUDIT_V1");
assert.equal(canonical.events.length, 151);
assert.equal(canonical.readingChapters.length, 37);
assert.equal(source.sourceSelectionRecords.length, 460);
assert.equal(audit.full151Audit.length, 151);
assert.equal(audit.scope.preserveAtlasEvents, 151);
assert.equal(audit.scope.preserveReadingSections, 37);
assert.equal(audit.scope.sourceEvidenceRowsPreservedExternally, 460);
assert.equal(audit.approvedReadingUnits.length, 0);
assert.equal(audit.productionChanges.length, 0);

const chapterIds = new Set(canonical.readingChapters.map(x=>x.id));
for (const [i,e] of audit.full151Audit.entries()) {
  const c=canonical.events[i], s=source.eventRegistry[i];
  assert.equal(e.index, i);
  assert.equal(e.eventKey, c.eventKey);
  assert.equal(e.eventKey, s.eventKey);
  assert.equal(e.atlasReference, c.reference);
  assert.equal(e.sectionId, c.readingChapterId);
  assert.equal(e.sourceEvidence.independentFamilies, s.qualifiedIndependentFamilies);
  assert.ok(chapterIds.has(e.sectionId));
  for (const j of e.overlappingCanonicalEventIndices) {
    assert.ok(j>=0 && j<151 && j!==i);
    assert.ok(audit.full151Audit[j].overlappingCanonicalEventIndices.includes(i));
  }
}
assert.equal(audit.splitPlans.length, 41);
assert.equal(audit.supplementalReadingCandidates.length, 53);
const parse = s=>{
  const m = s.replace(/[—–]/g,"-").match(/^(.+?)\s+(\d+):(\d+)-(\d+)$/);
  assert.ok(m, "needs same-chapter citation: " + s);
  return {book:m[1].replace(/\s/g,"").toLowerCase(),chap:Number(m[2]),from:Number(m[3]),to:Number(m[4])};
};
const ids = new Set();
let childCount = 0;
for (const plan of audit.splitPlans) {
  const evt=canonical.events[plan.atlasEventIndex];
  assert.equal(plan.atlasEventKey,evt.eventKey);
  assert.equal(plan.originalAnchor,evt.reference);
  const parent=parse(plan.originalAnchor);
  let last=parent.from-1;
  for (const unit of plan.units) {
    assert.ok(!ids.has(unit.proposalId));ids.add(unit.proposalId);
    assert.equal(unit.originalAtlasEventKey,evt.eventKey);
    const r=parse(unit.candidateScriptureSpan);
    assert.equal(r.book,parent.book);
    assert.equal(r.chap,parent.chap);
    assert.equal(r.from,last+1, "partition must not omit or overlap verses");
    assert.ok(r.to>=r.from);
    last=r.to;childCount++;
  }
  assert.equal(last,parent.to,"partition must cover parent anchor");
}
assert.equal(childCount,101);
for (const e of audit.supplementalReadingCandidates) {
  assert.ok(!ids.has(e.proposalId));ids.add(e.proposalId);
  assert.ok(canonical.events.some(x=>x.eventKey===e.associatedAtlasEventKey));
  assert.ok(chapterIds.has(e.nearestExistingSectionId));
  assert.equal(e.editoriallyApproved,false);
}
assert.equal(ids.size,154);
assert.equal(audit.scope.potentialReadingUnitsIfAllProposalUnitsAccepted,264);
const books=audit.catholic73BookCoverage;
assert.equal(books.booksInCatholicCanon,73);
assert.equal(books.oldTestament,46);
assert.equal(books.newTestament,27);
assert.equal(books.inventory.length,73);
assert.equal(books.booksWithExistingAtlasMilestones,28);
assert.equal(books.booksWithAnyProposedOrExistingReference,38);
assert.equal(books.unrepresentedBookResearchQueue.length,35);
assert.equal(books.minimumAdditionalUnitsToNameEveryBook,35);
assert.equal(books.hypotheticalLowerBoundIfOneUnitPerRemainingBook,299);
assert.ok(books.unrepresentedBookResearchQueue.every(x=>!x.requiresHistoricalAtlasMilestone && !x.editoriallyApproved));
console.log("Scripture granularity audit: 151 preserved events/37 sections/460 sources; 41 split plans, 101 child candidates, 53 additions, 264 candidate units; 73 Catholic books counted, 35 still without candidate, no approved verses.");
