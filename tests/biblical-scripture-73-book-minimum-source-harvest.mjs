import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const gap = read("data/explore/biblical-scripture-73-book-minimum-source-harvest.v1.json");
const audit = read("data/explore/biblical-scripture-reading-granularity-audit.v1.json");
const atlas = read("data/explore/biblical-reading-continuity-review.v1.json");
const publisher = read("data/explore/biblical-pericope-comparative-full-master.v7.json");

assert.equal(gap.schema, "AO_BIBLICAL_CATHOLIC_73_BOOK_MINIMUM_SOURCE_HARVEST_V1");
assert.equal(atlas.events.length, 151);
assert.equal(atlas.readingChapters.length, 37);
assert.equal(publisher.sourceSelectionRecords.length, 460);
assert.equal(gap.qualifications.preserve151AtlasEvents, true);
assert.equal(gap.qualifications.preserve37ReadingSections, true);
assert.equal(gap.qualifications.preserve460OriginalEventReferences, true);
assert.equal(gap.qualifications.noApprovedFinalReadingUnits, true);
assert.equal(gap.bookCandidates.length, 35);
assert.equal(gap.publisherEvidenceRecords.length, 62);
const missing = new Set(audit.catholic73BookCoverage.unrepresentedBookResearchQueue.map(x => x.book));
assert.equal(missing.size,35);
const sources = new Map(gap.publisherEvidenceRecords.map(x=>[x.citationId,x]));
assert.equal(sources.size, 62, "citation IDs must be unique");
for (const b of gap.bookCandidates) {
  assert.ok(missing.has(b.book), "candidate must be one of the original 35 uncovered books");
  assert.ok(b.candidateEvidenceIds.length > 0);
  assert.equal(b.candidateEvidenceIds.length,b.publishedChoiceCount);
  assert.equal(b.distinctIndependentFamilies, 1, "do not inflate cross-publisher votes");
  assert.equal(b.editorialReviewStatus,"HOLD");
  for (const id of b.candidateEvidenceIds) {
    assert.ok(sources.has(id),id);
    assert.equal(sources.get(id).book,b.book);
  }
}
for(const r of gap.publisherEvidenceRecords){
  assert.ok(r.publishedReferenceVerbatim?.trim());
  assert.ok(r.sourceURL.startsWith("https://"));
  assert.equal(r.publishedLiteralRefNoNormalization,true);
  assert.equal(r.sourceSelectionIndependence,"ONE_SOURCE_FAMILY_ONLY_NO_CONSENSUS");
  assert.equal(r.publicationBoundary,"RESEARCH_METADATA_ONLY_NO_BIBLE_TEXT");
  if(r.book==="Obadiah"){
    assert.equal(r.sourceType,"PUBLISHED_WHOLE_BOOK_DAILY_READING");
    assert.equal(r.publishedReferenceVerbatim,"Obadiah 1-21");
    assert.equal(r.publisherSourceId,"ABS_OBADIAH_DAILY");
    assert.equal(r.sourceTextIndexLine,null);
  } else {
    assert.equal(r.publisherSourceId,"LEC98");
    assert.ok(Number.isInteger(r.sourceTextIndexLine));
  }
  if (r.book==="Psalms")assert.equal(r.sourceType,"RESPONSORIAL_PSALM_SELECTION");
}
assert.equal(gap.totals.ofWhichCatholicLectionary,61);
assert.equal(gap.totals.ofWhichFullBook,1);
assert.equal(gap.totals.ofWhichResponsorialPsalms,3);
assert.equal(gap.totals.distinctCatholicBooksWithAtLeastOnePotentialReferenceAfterResearch,73);
assert.equal(gap.totals.approvedNewUnits,0);
assert.equal(gap.totals.previousBooksRepresentedBy151And53Candidates,38);
console.log("73-book Scripture harvest: 35/35 previously absent books have printed publisher-selected reference candidates; 62 source rows; 151 canonical Atlas milestones, 37 sections, 460 legacy source rows untouched; 0 approved readings.");
