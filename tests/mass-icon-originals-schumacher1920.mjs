import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const sch=read("data/presentation/mass-icon-originals-schumacher1920.p3.json");
const prov=read("data/presentation/mass-icon-generation-provenance-20261019.v1.json");
assert.equal(sch.schema,"ao-mass-original-art-source-witness-v1");
assert.equal(sch.artist,"Philipp Schumacher (1866–1940)");
assert.equal(sch.year,1920);
assert.equal(sch.originalPrintedSource.page,97);
assert.equal(sch.repository.institution,"Wikimedia Commons");
assert.equal(sch.repository.rights,"PUBLIC_DOMAIN_MARK_1_0_AND_PD_SCAN");
assert.equal(sch.repository.rightsAssessment,"PUBLISHED_FILE_DOCUMENTED_PUBLIC_DOMAIN");
assert.equal(sch.repository.repositorySHA1,"3073f3c53d38c007a821d3fe1c3dc3fe8d103436");
assert.equal(sch.repository.originalBytesReported,939529);
assert.deepEqual(sch.repository.displayedImageSize,[1265,964]);
assert.equal(sch.repository.localFile,null);
assert.equal(sch.repository.localSHA256,null);
assert.equal(sch.visualInspection.reviewState,"VIEWED_SOURCE_PHOTO_ORIGINAL_NOT_FILE_VERIFIED");
assert.equal(sch.visualInspection.priestAtAltar,true);
assert.equal(sch.visualInspection.chaliceOnAltar,true);
assert.equal(sch.visualInspection.raisedHandsNearMouth,true);
assert.equal(sch.visualInspection.consumptionOfHostUnambiguous,false,
 "Cannot certify Host reception from a labelled but ambiguous image");
assert.equal(sch.visualInspection.visibilityOfTwoHostHalves,false);
assert.equal(sch.visualInspection.elbowsRestOnAltarDemonstrably,false);
assert.equal(sch.visualInspection.drinkingFromChalice,false);
assert.equal(sch.visualInspection.rightHandHoldsChalice,false);
assert.equal(sch.visualInspection.leftHandSupportsPaten,false);
assert.equal(sch.harmonization.generationAuthorized,false);
assert.equal(sch.harmonization.userApproval,"PENDING");
assert.equal(sch.verdict.productionEligible,false);
assert.equal(sch.verdict.depictsExact1962HostReceivingGesture,"PARTIAL_UNCERTAIN");
assert.equal(sch.verdict.depictsExact1962ChaliceReceivingGesture,false);
assert.equal(prov.discoveryReview.schumacher1920SourceIndex,
 "data/presentation/mass-icon-originals-schumacher1920.p3.json");
const host=prov.candidates.find(x=>x.id==="EA.PRIEST_COMMUNION_HOST");
const chalice=prov.candidates.find(x=>x.id==="EA.PRIEST_COMMUNION_CHALICE");
assert.ok(host.researchLeads.some(x=>x.id==="SCHUMACHER_1920_PRIEST_COMMUNION_P97"&&
  x.actualImageViewed===true&&x.sha256===null));
assert.ok(!chalice.researchLeads.some(x=>x.id==="SCHUMACHER_1920_PRIEST_COMMUNION_P97"),
 "Host-like source drawing was incorrectly offered as celebrant drinking from chalice");
for(const candidate of prov.candidates){
 assert.deepEqual(candidate.originalPictures,[],
   "source discovery was promoted to verified original image without download and rubrical certification");
 assert.equal(candidate.status,"BLOCKED_SOURCE_IMAGE_REQUIRED");
 assert.equal(candidate.asset,null);
 assert.equal(candidate.userApproval,"PENDING");
}
console.log("Mass icon original Schumacher 1920 PASS — verifiable public-domain drawing inspected; only partial Host witness; chalice and production art still blocked.");
