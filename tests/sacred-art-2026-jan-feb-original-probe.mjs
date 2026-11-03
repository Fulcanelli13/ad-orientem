import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const report=JSON.parse(readFileSync(new URL("../artifacts/sacred-art-2026/jan-feb-28-original-source-byte-probe.json",import.meta.url)));
const source=JSON.parse(readFileSync(new URL("../artifacts/sacred-art-2026/jan-feb-59-photo-readiness.json",import.meta.url)));
assert.equal(report.counts.dates,59);
assert.equal(report.counts.originalSourcePages,28);
assert.equal(report.counts.datesWithSourcePage,43);
assert.equal(report.counts.datesMissingSourcePage,16);
assert.equal(report.sources.length,28);
assert.equal(report.dates.length,59);
assert.equal(report.counts.datesPublicationAuthorized,0);
assert.equal(report.counts.photosManualCropApprovedInThisPass,0);
assert.equal(report.counts.previouslyReleasedModuleOriginalFilesRehashed,1);
const feb25=report.dates.find(x=>x.date==="2026-02-25");
assert.match(feb25.previouslyReleasedLocalOriginalSha256,/^[0-9a-f]{64}$/);
assert.equal(feb25.publicationAuthorized,false);
const rubens=report.sources.find(s=>s.originalDateReferences.includes("2026-02-25"));
assert.ok(rubens?.previouslyReleasedModuleOriginalsVerified?.some(x=>
 x.moduleId==="regina"&&x.moduleReleasePR===2296&&
 x.technicalFileVerified&&x.placementApprovalInherited===false));
assert.equal(new Set(report.sources.map(s=>s.sourcePage)).size,28);
assert.deepEqual(report.dates.map(d=>d.date),source.dates.map(d=>d.date));
const sourceByUrl=new Map(report.sources.map(x=>[x.sourcePage,x]));
for(const row of report.dates){
 const original=source.dates.find(d=>d.date===row.date);
 assert.ok(original);
 assert.equal(row.originalDateArtworkApprovalPreserved,original.firstPhotoAuditCandidate.preservedDateApproval);
 assert.equal(row.sourcePage,original.firstPhotoAuditCandidate.sourceUrl);
 assert.equal(row.publicationAuthorized,false);
 assert.equal(row.imageRightsCertifiedForThisDate,false);
 assert.equal(row.imageVisualCropCertified,false);
 if(row.sourcePage)assert.ok(sourceByUrl.has(row.sourcePage));
 else assert.equal(row.evidenceStatus,"HISTORICAL_DATE_SOURCE_PAGE_NOT_LINKED");
}
const held=report.sources.find(s=>s.sourceHost==="www.museodelprado.es");
assert.ok(held);
assert.equal(held.state,"HISTORICAL_PRADO_SOURCE_HELD");
assert.equal(held.original,undefined);
assert.ok(held.originalDateReferences.includes("2026-01-06"));
for(const s of report.sources){
 assert.equal(s.homeDatePublished,false);
 assert.equal(s.manualFramelessCropPassed,false);
 assert.equal(s.exactNativePhotoRightsApprovedForHomeDate,false);
 if(s.original){
  assert.equal(s.state,"ORIGINAL_BYTES_VERIFIED_TECHNICAL_ONLY");
  assert.match(s.original.sha256,/^[0-9a-f]{64}$/);
  assert.ok(s.original.nativeWidth>50&&s.original.nativeHeight>50);
  assert.ok(s.original.bytes>1000);
  assert.ok(["upload.wikimedia.org","images.metmuseum.org"].includes(s.original.imageOrigin));
 }
 if(s.state==="SOURCE_OR_IMAGE_FETCH_BLOCKED"){
  assert.ok(s.failure);
  assert.equal(s.original,undefined);
 }
 if(s.state==="METADATA_RETURNED_RIGHTS_HELD"||
    s.state==="MET_METADATA_IMAGE_NOT_OPEN_ACCESS")assert.equal(s.original,undefined);
}
const sumStates=report.sources.reduce((n,s)=>(n[s.state]=(n[s.state]??0)+1,n),{});
assert.equal(Object.values(sumStates).reduce((a,b)=>a+b,0),28);
console.log("PASS 59 dates, 28 existing source pages, 43 linked, 16 unresolved; original SHA evidence scoped, no publication");
console.log(JSON.stringify({runMode:report.runMode,counts:report.counts,states:sumStates},null,2));
