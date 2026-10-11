import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = path => JSON.parse(readFileSync(new URL("../" + path, import.meta.url), "utf8"));
const triage = read("data/geography/research/mass-1962-uninspected-source-triage-20261011.v1.json");
const seasonal = read("data/geography/research/mass-seasonal-bulk-source-audit-20261011.v1.json");
const sanctoral = read("data/geography/research/mass-sanctoral-bulk-source-audit-20261011.v1.json");
const old = read("data/geography/research/mass-1962-105-source-path-chant-index-20261011.v1.json");
const records = [...seasonal.rows, ...sanctoral.rows];
const byPath = new Map(triage.rows.map(x => [x.sourcePath, x]));
const oldPaths = new Set(old.rows.map(x => x.sourcePath));
assert.equal(triage.rows.length,947);
assert.equal(oldPaths.size,105);
assert.equal(records.length,947);
assert.equal(new Set(records.map(x=>x.sourcePath)).size,947,"Duplicate new source file");
assert.ok(records.every(x=>!oldPaths.has(x.sourcePath)),"Existing 105-path witnesses must not be recounted");
assert.deepEqual(new Set(records.map(x=>x.sourcePath)),new Set(triage.rows.map(x=>x.sourcePath)),"Complete 947-path source population");
for(const [data,family,count,chantCount] of [
 [seasonal,"NON_SANCTORAL",426,290],
 [sanctoral,"SANCTORAL_FIXED_DATE_SOURCE",521,803]
]) {
 assert.equal(data.schema,"MASS_BULK_LATIN_SOURCE_SECTION_DISCOVERY_V1");
 assert.equal(data.auditFamily,family);
 assert.equal(data.rows.length,count);
 assert.equal(data.totals.attempted,count);
 assert.equal(data.totals.retrieved,count);
 assert.equal(data.totals.errors,0);
 assert.equal(data.totals.chantSectionCandidates,chantCount);
 assert.equal(data.publicationApproved,false);
 const sections=data.rows.flatMap(x=>x.sections);
 assert.equal(sections.filter(s=>/^(Introitus|Graduale|Tractus|Alleluia|Sequentia|Offertorium|Communio)/i.test(s.section)).length,chantCount);
}
for(const record of records) {
 const expected = byPath.get(record.sourcePath);
 assert.ok(expected,record.sourcePath);
 assert.equal(record.sourceFamily,expected.sourceFamily);
 assert.equal(record.sourceBlobShaAtCensus,expected.sourceBlobSha);
 assert.equal(record.sourceBlobVerified,true,"Git blob SHA check required "+record.sourcePath);
 assert.equal(record.retrieval,"RETRIEVED");
 assert.equal(record.missal1962EligibilityVerified,false);
 assert.equal(record.scriptureVerseCollated,false);
 assert.equal(record.publishable,false);
 assert.ok(Array.isArray(record.sections));
 for(const s of record.sections) {
   assert.equal(typeof s.section,"string");
   assert.ok(s.section.length>0);
   assert.ok(Array.isArray(s.bibleNoteCandidates));
   assert.ok(Array.isArray(s.referenceDirectives));
   assert.ok(s.initialLatin===null || typeof s.initialLatin==="string");
 }
}
const n = records.flatMap(x=>x.sections);
assert.equal(n.reduce((count,s)=>count+s.bibleNoteCandidates.length,0),2323);
assert.equal(n.reduce((count,s)=>count+s.referenceDirectives.length,0),833);
console.log("PASS: 947/947 new file witnesses, 947 verified blobs, 1093 chant-section candidates, 2323 raw note lines, 833 directives; every publication gate closed.");
