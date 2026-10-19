import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const index=read("data/presentation/mass-icon-source-acquisition-p3.v1.json");
const prov=read("data/presentation/mass-icon-generation-provenance-20261019.v1.json");
const current=read("data/presentation/mass-icon-originals-leclerc1661.p3.json");
assert.equal(index.schema,"ao-mass-source-acquisition-v1");
assert.equal(index.originals.length,1);
assert.equal(index.licensingResearch.length,2);
const original=index.originals[0];
assert.equal(original.id,"RIJKSMUSEUM_LECLERC_1661_PLATE29");
assert.equal(original.objectId,"RP-P-OB-69.179");
assert.equal(original.rights,"CC0_1_0");
assert.equal(original.sourcePage,current.plates.find(x=>x.plate===29).commonsFilePage);
assert.equal(original.sourceFileURL,"https://upload.wikimedia.org/wikipedia/commons/0/09/Priester_met_twee_misdienaars_voor_een_altaar%2C_RP-P-OB-69.179.jpg");
assert.deepEqual([original.expectedWidth,original.expectedHeight],[657,1045]);
assert.ok(original.minimumBytes>0 && original.maximumBytes<=500000);
assert.equal(original.approvedForGeneration,false);
assert.equal(original.approvedForRuntime,false);
assert.equal(original.exactHostGestureVerified,false);
assert.equal(original.exactChaliceGestureVerified,false);
const checksum="968fd5bdb467c77ceeb7d4d771a1b7b120258bd40fc987b8ea3a3a4d84b633bf";
assert.equal(original.expectedSHA256,checksum);
assert.equal(original.verifiedBinary.sha256,checksum);
assert.equal(original.verifiedBinary.bytes,167545);
assert.equal(original.verifiedBinary.artifactId,12179522591);
assert.equal(original.verifiedBinary.status,"BITWISE_VERIFIED_RESEARCH_ARTIFACT_NOT_PRODUCTION_ORIGINAL");
const [restrictedChalice,restrictedOther]=index.licensingResearch;
assert.deepEqual([restrictedChalice.id,restrictedOther.id],["CTH49809","CTH43758"]);
assert.equal(restrictedChalice.actualChaliceDrinkingVisible,true,
  "visually documented chalice-drinking candidate was lost");
assert.equal(restrictedChalice.leftPatenUnderChaliceVerified,false,
  "source preview does not confirm left-hand paten under chalice");
assert.equal(restrictedChalice.disposition,"PRIORITY_RIGHTS_LICENSE_AND_FULL_ORIGINAL_IMAGE_REVIEW");
assert.equal(restrictedOther.disposition,"EXCLUDE_FROM_1962_HOST_ICON_SOURCE_SHORTLIST");
assert.equal(restrictedOther.exactHostActionVerified,false);
assert.equal(restrictedOther.acquireForProduction,false);
assert.equal(prov.discoveryReview.leads.find(x=>x.id==="CTH49809")
  .visualPreviewInspection.releaseApproved,false,
  "a preview without full original and rights must not be approved");

assert.ok(index.licensingResearch.every(x=>x.rights==="COPYRIGHT_INDIVIDUAL_LICENSE_REQUIRED" && x.neverAutoDownload===true && x.sourceImageLocallyAcquired===false));
assert.ok(prov.candidates.every(x=>x.originalPictures.length===0 && x.asset===null));
assert.ok(!existsSync("assets/generated/mass-icons/Leclerc_1661_RP-P-OB-69.179_CC0.jpg"),
 "historical source entered production icon bank");
const acquire=readFileSync("scripts/acquire-mass-icon-originals.mjs","utf8");
assert.match(acquire,/createHash\("sha256"\)/);
assert.match(acquire,/jpegDimensions\(data\)/);
assert.match(acquire,/artifacts\/mass-original-research/);
assert.doesNotMatch(acquire,/licensingResearch\s*\)/,"copyrighted images must never be auto downloaded");
const workflow=readFileSync(".github/workflows/mass-icon-original-source-capture.yml","utf8");
assert.match(workflow,/node scripts\/acquire-mass-icon-originals\.mjs/);
assert.match(workflow,/retention-days:\s*90/);
console.log("P3 CC0 source capture manifest PASS — exact original allowed; copyrighted alternatives excluded; source images not activated.");
