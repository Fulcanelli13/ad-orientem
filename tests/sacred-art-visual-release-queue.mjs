import assert from "node:assert/strict";
import {classifyReview,buildReviewQueue} from "../tools/calendar/prepare-sacred-art-visual-release-queue.mjs";
const obj=(id,provider,rights="Public domain",tier="HIGH_RESOLUTION",alerts=[])=>({
 artworkId:id,title:id,artist:"Artist",sourceProvider:provider,sourcePage:"https://example.org/"+id,
 photoRightsClaim:rights,image:{sha256:id.padEnd(64,"a"),width:3000,height:3500,resolutionTier:tier},
 productionCertified:false,exactOriginalIndependentlyVerified:false,reviewAlerts:alerts});
assert.equal(classifyReview(obj("a","MET_OPEN_ACCESS","MET_OPEN_ACCESS_CC0")).lane,"MUSEUM_OPEN_ACCESS_VISUAL_REVIEW");
assert.equal(classifyReview(obj("b","CLEVELAND_MUSEUM_CC0","CC0")).lane,"MUSEUM_OPEN_ACCESS_VISUAL_REVIEW");
assert.equal(classifyReview(obj("c","NGA_OPEN_ACCESS","NGA_OPENACCESS_1")).lane,"MUSEUM_OPEN_ACCESS_VISUAL_REVIEW");
assert.equal(classifyReview(obj("d","WIKIMEDIA_COMMONS","CC0")).lane,"COMMONS_CC0_PHOTO_IDENTITY_REVIEW");
assert.equal(classifyReview(obj("e","WIKIMEDIA_COMMONS","CC BY-SA 4.0")).lane,"ATTRIBUTION_AND_LICENSE_COMPLIANCE");
assert.equal(classifyReview(obj("f","WIKIMEDIA_COMMONS","CC BY 3.0")).lane,"ATTRIBUTION_AND_LICENSE_COMPLIANCE");
assert.equal(classifyReview(obj("g","WIKIMEDIA_COMMONS","Public domain")).lane,"PD_ART_RIGHTS_IDENTITY_REVIEW");
assert.equal(classifyReview(obj("h","WIKIMEDIA_COMMONS","Public domain","LOW_RESOLUTION")).lane,"RESOLUTION_EXCEPTION");
assert.equal(classifyReview(obj("i","MET_OPEN_ACCESS","MET_OPEN_ACCESS_CC0","HIGH_RESOLUTION",
 ["MUSEUM_TITLE_DIFFERS_FROM_CATALOGUE_VERIFY_PHYSICAL_OBJECT"])).lane,"OBJECT_IDENTITY_REVIEW");
assert.throws(()=>classifyReview({...obj("j","MET_OPEN_ACCESS"),productionCertified:true}),/Published\/certified/);
const sample=[obj("p","MET_OPEN_ACCESS","MET_OPEN_ACCESS_CC0"),obj("q","WIKIMEDIA_COMMONS","CC BY-SA 4.0")];
const queue=buildReviewQueue({images:sample,summary:{productionReleased:0}});
assert.equal(queue.records.length,2);
assert.equal(queue.records[0].lane,"MUSEUM_OPEN_ACCESS_VISUAL_REVIEW");
assert.deepEqual(queue.groups,{MUSEUM_OPEN_ACCESS_VISUAL_REVIEW:1,ATTRIBUTION_AND_LICENSE_COMPLIANCE:1});
assert(queue.records.every(x=>!x.productionReleaseApproved&&!x.exactPaintingVisualMatchApproved&&!x.reproductionRightsForAppApproved));
assert.equal(queue.releaseCount,0);
assert.throws(()=>buildReviewQueue({images:sample,summary:{productionReleased:1}}),/Bad or published/);
console.log("PASS: artwork source release queue remains curated, museum Open Access prioritized and all actual publication blocked");
