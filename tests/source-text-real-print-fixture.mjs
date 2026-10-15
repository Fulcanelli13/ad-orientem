import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {extractReviewedWitnessDocument,normalizeWitnessLocator}
 from "../src/source-text/witness-locators.js";
import {packageSourceDocument} from "../src/source-text/package.js";
import {createSourceTextReader} from "../src/source-text/reader.js";
const json=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const sample=json("data/source-text/fortescue-1908-print-excerpts.v1.json");
const reg=json("data/source-text/witness-profiles.v1.json");
const profile=reg.profiles.find(x=>x.id===sample.work.witnessId);
assert.ok(profile);
assert.equal(profile.scanEditionIdentification,"1913_SPECIAL_EDITION_CONFIRMED_COMMONS_AND_PRINTED_TITLE");
assert.equal(sample.work.editionId,"ED-CE1913-V3-KOC-SPECIAL");
assert.equal(sample.work.witnessId,"WIT-CE1913-V3-KOC-PRINT-FORTESCUE");
assert.ok(sample.originalEdition.includes("1913"));
assert.ok(profile.scanTitleImage.endsWith("/11"));
assert.equal(sample.work.rights.editorialPublicationApproval,"NOT_GRANTED");

assert.equal(profile.originalFacsimilePageIndexOffset,48);
assert.equal(sample.productionImportAllowed,false);
assert.equal(sample.records.length,4);
assert.equal(sample.work.rights.scope,"REVIEWED_EXCERPTS_ONLY");
assert.equal(sample.work.rights.approvedExcerpts.length,4);
assert.equal(sample.records[0].djvuPage-sample.records[0].printedPage,48);
assert.equal(sample.records[1].djvuPage-sample.records[1].printedPage,48);
assert.equal(normalizeWitnessLocator(profile,"p255:s001").sourceAnchor,"ce1913-v3-p255-s001");
assert.throws(()=>normalizeWitnessLocator(profile,"p255:s1"),/PRINT_PAGE_INVALID/);
const parsed=extractReviewedWitnessDocument({
 profile,work:sample.work,review:sample.review,
 heading:sample.heading,records:sample.records
});
assert.equal(parsed.passages.length,4);
assert.equal(parsed.passages[0].sourceLocator,"p255:s001");
assert.equal(parsed.passages[1].sourceLocator,"p256:s001");
for(let i=0;i<4;i++){
 assert.equal(parsed.passages[i].text,sample.records[i].text,
  "Verbatim short excerpt must remain unchanged from manually inspected scan");
 assert.equal(parsed.passages[i].sourcePage,sample.records[i].hostUrl);
}
const bundled=packageSourceDocument(parsed,{chunkSize:1});
assert.equal(bundled.manifest.chunks.length,4);
assert.equal(bundled.manifest.passages[0].sourcePage,sample.records[0].hostUrl);
assert.equal(bundled.manifest.passages[1].sourcePage,sample.records[1].hostUrl);
let reads=0;
const reader=createSourceTextReader({manifest:bundled.manifest,loadChunk:async path=>{
 reads++;return bundled.chunks[path];
}});
assert.equal(reader.searchMetadata("p255:s001").length,1);
assert.equal(reads,0);
const one=await reader.open(reader.firstId);
assert.equal(one.passage.text,sample.records[0].text);
assert.equal(reads,1);
const two=await reader.open(one.next);
assert.equal(two.passage.sourceLocator,"p256:s001");
assert.equal(reads,2);
const changed=structuredClone(sample);
changed.records[0].text+=" Extra unchecked words.";
const unreviewed=extractReviewedWitnessDocument({
 profile,work:changed.work,review:changed.review,
 heading:changed.heading,records:changed.records
});
assert.throws(()=>packageSourceDocument(unreviewed,{chunkSize:1}),/OUTSIDE_APPROVED_EXCERPTS/);
assert.equal(reader.searchMetadata("p257:s002").length,1);
const newPage=await reader.open(bundled.manifest.passages[2].id);
assert.equal(newPage.passage.sourcePage,sample.records[2].hostUrl);
assert.equal(reads,3);
const newParagraph=await reader.open(bundled.manifest.passages[3].id);
assert.equal(newParagraph.passage.sourceLocator,"p257:s002");
assert.equal(reads,4);
const additional=structuredClone(sample);
additional.records.push({locator:"p258:s001",hostUrl:sample.records[1].hostUrl,
 text:"Not inspected, not approved."});
assert.throws(()=>extractReviewedWitnessDocument({
 profile,work:additional.work,review:additional.review,
 heading:additional.heading,records:additional.records}),/PAGE_UNVERIFIED/);
const wrongPage=structuredClone(sample);
wrongPage.records[0].hostUrl=sample.records[1].hostUrl;
assert.throws(()=>extractReviewedWitnessDocument({
 profile,work:wrongPage.work,review:wrongPage.review,
 heading:wrongPage.heading,records:wrongPage.records}),/WRONG_PAGE/);
const forged=createSourceTextReader({manifest:bundled.manifest,loadChunk:async path=>{
 const chunk=JSON.parse(bundled.chunks[path]);
 chunk.passages[0].text+=" forged";
 return chunk;
}});
await assert.rejects(forged.open(forged.firstId),/OUTSIDE_APPROVED_EXCERPTS/);
const wrongWork=structuredClone(sample);
wrongWork.work.editionId="ED-1913-DIFFERENT";
assert.throws(()=>extractReviewedWitnessDocument({
 profile,work:wrongWork.work,review:wrongWork.review,
 heading:wrongWork.heading,records:wrongWork.records
}),/REVIEW_IDENTITY_REQUIRED/);
console.log("PASS scanned 1913 Fortescue print witness: 4 preliminary excerpts, printed pages 255-257, scan pages 303-305, lazy 4 chunks");
console.log(JSON.stringify({realPrintedEdition:"Catholic Encyclopedia III (1913 special edition)",
 excerptPassages:4,originalScanPagesChecked:3,
 metadataOnlyFetches:0,firstOpenChunkFetches:1,secondOpenChunkFetches:2,
 entireWorkCleared:false,productionImportAllowed:false}));
