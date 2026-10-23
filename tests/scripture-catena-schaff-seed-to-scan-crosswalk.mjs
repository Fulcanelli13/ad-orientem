import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const j=p=>JSON.parse(readFileSync(p,"utf8"));
const data=j("dist/schaff-context-pilot/schaff-seed-to-scan-crosswalk.v1.json");
const refs=j("data/scripture/catena/research/full-corpus-pass-20261021/schaff-first-full-work-question-seeds.v1.json");
assert.equal(data.schema,"ao.catena.schaff-seed-to-historical-scan-crosswalk.v1");
assert.equal(data.originalResearchSeeds,14);
assert.equal(data.historicalWorkUnitsLocated,14);
assert.equal(data.normalizedOriginalOCRAnchorFound,10);
assert.equal(data.historicalOCRAnchorNotExactlyFound,4);
assert.equal(data.existingCatenaPointersPreserved,3);
assert.equal(data.authorshipConfirmed,0);
assert.equal(data.criticalTextVerified,0);
assert.equal(data.verifiedNewPatristicAnswers,0);
assert.equal(data.publicationApprovals,0);
assert.equal(data.rows.length,refs.rows.length);
const idToRef=new Map(refs.rows.map(r=>[r.id,r]));
const ids=new Set();
for(const row of data.rows){
 assert.ok(!ids.has(row.seedId));ids.add(row.seedId);
 const ref=idToRef.get(row.seedId);
 assert.ok(ref);
 assert.equal(row.externalEnglishAnchor,ref.exactEnglishAnchor);
 assert.equal(row.sourceEditionId,ref.editionId);
 assert.equal(row.sourceHistoricalWork,ref.originalWork);
 assert.equal(row.sourceWorkLocusLabel,ref.workLocus);
 assert.equal(row.inheritedCatenaPointerAlreadyLinked,ref.catenaSourcePointer);
 assert.match(row.sourceUnitOriginalOCRSHA256,/^[a-f0-9]{64}$/);
 assert.ok(row.printedSourceUnitLineStart>=1);
 assert.ok(row.printedSourceUnitLineEnd>=row.printedSourceUnitLineStart);
 assert.equal(row.attributionCertified,false);
 assert.equal(row.sourceQuestionCertified,false);
 assert.equal(row.sourceAnswerCertified,false);
 assert.equal(row.catenaNoveltyCertified,false);
 assert.equal(row.originalPrintedPageVisuallyInspected,false);
 assert.equal(row.publicationEligible,false);
 assert.equal(row.missingMatchMeansOCROrEditionDifferenceNotSourceAbsence,
  !row.englishAnchorNormalizedMatchIn1888OCR);
 const inventory=j("dist/schaff-sectioned-research/"+row.sourceEditionId+
  ".source-units-and-questions.v1.json");
 const u=inventory.units.find(x=>x.id===row.sourceUnitId);
 assert.ok(u,"Seed must resolve to an actual original 1888 print OCR unit");
 assert.equal(row.printedSourceUnitLineStart,u.startLine);
 assert.equal(row.printedSourceUnitLineEnd,u.endLine);
 assert.equal(row.sourceUnitOriginalOCRSHA256,u.originalUnitOCRSHA256);
}
assert.equal(ids.size,14);
console.log("PASS: fourteen research leads mapped to historic Schaff OCR work units; ten recoverable 1888 English anchors, four explicitly unresolved; no new author/answer claims");
