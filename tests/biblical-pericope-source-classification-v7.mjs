import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const read = p => JSON.parse(readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const master = read("data/explore/biblical-pericope-comparative-full-master.v7.json");
const canon = read("data/explore/biblical-reading-continuity-review.v1.json");
const boundary = read("data/explore/biblical-pericope-exact-boundary-agreement.v6.json");
const triage = master.seventhHarvestClassification;
const excluded = new Set(["MISSAL62", "CHRON152"]);
const qualifying = new Set(["PUBLISHER_REFERENCES_HARVESTED", "PRIMARY_SOURCE_EXACT_REFERENCE_CONFIRMED"]);
const shortLabels = new Set(["SHORT","HIGHLIGHT","THEMED_SHORT_EXCERPT","LITURGICAL_SHORT_EXCERPT"]);

assert.equal(master.metadata.schema, "AO_COMPARATIVE_PERICOPE_MASTER_MATRIX_V7");
assert.equal(master.sourceSelectionRecords.length, 460);
assert.equal(master.eventRegistry.length, 151);
assert.equal(canon.events.length, 151);
assert.equal(canon.readingChapters.length, 37);
assert.equal(boundary.review.length, 151);
assert.equal(triage.all151EventClassification.length, 151);
assert.equal(triage.finalApprovedScriptureChoices, 0);
assert.equal(triage.appReaderChanges, 0);
assert.equal(master.metadata.seventhClassification.newPublisherEvidenceRows, 0);
assert.equal(master.metadata.seventhClassification.multisourceEvents, 107);

const expected = {
 "STRICT COMPACT-RANGE AGREEMENT — VERIFY CONTEXT": 20,
 "STRICT EXTENDED-RANGE AGREEMENT — SEEK ABRIDGEMENT": 7,
 "DIFFERENT CUTS, PUBLISHED SHORT OPTION — COMPARE": 14,
 "DIFFERENT CUTS / STORY SCOPE — EDITORIAL COMPARISON": 66,
 "SINGLE FAMILY — SEEK INDEPENDENT EVIDENCE": 42,
 "GAP — TARGETED SOURCE RESEARCH": 2
};
assert.deepEqual(triage.reviewBuckets, expected);
const counts=Array.from({length:151},()=>new Set());
let qualifiedShorts=0;
const sourceKeys=new Set(Object.keys(master.sourceRegister));
for (const row of master.sourceSelectionRecords) {
 assert.ok(Number.isInteger(row.eventIndex) && row.eventIndex>=0 && row.eventIndex<151);
 assert.equal(row.eventKey, canon.events[row.eventIndex].eventKey);
 assert.equal(row.atlasReference, canon.events[row.eventIndex].reference);
 assert.ok(sourceKeys.has(row.sourceId), "Unregistered source " + row.sourceId);
 assert.ok(row.sourceURL.startsWith("https://"), "Missing source URL");
 assert.ok(typeof row.publishedReferenceVerbatim==="string" && row.publishedReferenceVerbatim.length>0);
 assert.equal(row.v7ReferenceStatus,"ORIGINAL_VERBATIM_REFERENCE_RETAINED");
 assert.equal(row.v7RequiresEditorialContextVerification,true);
 assert.equal(row.v7ApprovedForApp,false);
 const eligible = !excluded.has(row.sourceId) && qualifying.has(row.evidenceStatus);
 const isShort = eligible && shortLabels.has(row.variant.toUpperCase());
 assert.equal(row.v7PublisherShortVariant,isShort);
 if (isShort) qualifiedShorts++;
 if (eligible) counts[row.eventIndex].add(row.sourceFamily);
}
assert.equal(qualifiedShorts,29);
assert.equal(counts.filter(s=>s.size>0).length,149);
assert.equal(counts.filter(s=>s.size>=2).length,107);
assert.equal(counts.filter(s=>s.size>=3).length,57);
const all=triage.all151EventClassification;
assert.equal(all.filter(x=>x.publisherShortOrHighlightsRows>0).length,26);
assert.equal(all.filter(x=>x.strictAgreementGroups>0).length,27);
assert.equal(all.filter(x=>x.strictConsensusWithCompactVerseLength>0).length,20);
assert.equal(all.filter(x=>x.strictConsensusWithExtendedOrUncertainLength>0).length,7);
assert.equal(all.filter(x=>x.anyStrictAgreeingCutMatchesAtlasAnchor).length,23);
for (let i=0;i<151;i++){
 const x=all[i],e=canon.events[i];
 assert.equal(x.eventIndex,i);
 assert.equal(x.eventKey,e.eventKey);
 assert.equal(x.sectionId,e.readingChapterId);
 assert.equal(x.atlasReference,e.reference);
 assert.equal(x.qualifiedIndependentEditorialFamilies,counts[i].size);
 assert.equal(x.editoriallyApproved,false);
 assert.equal(x.manualEssentialReading,null);
 assert.equal(x.manualExtendedReading,null);
 assert.equal(x.contextCompletenessCertified,false);
 assert.equal(x.strictAgreementGroups,boundary.review[i].strictAgreeingOriginalEditorialRangeGroups.length);
}
const unresolved=all.filter(x=>x.qualifiedIndependentEditorialFamilies===0);
assert.deepEqual(unresolved.map(x=>x.atlasReference),["Daniel 14:1–22","Daniel 14:23–42"]);
console.log("V7 Biblical source triage OK: 460 provenance records; 151 events; 107 multisource; 27 strict consensus; 29 explicit short source rows; 0 final choices.");
