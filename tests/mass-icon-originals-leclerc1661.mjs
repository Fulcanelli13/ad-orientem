import assert from "node:assert/strict";
import {readFileSync} from "node:fs";

const read=(name)=>JSON.parse(readFileSync(new URL("../"+name,import.meta.url),"utf8"));
const series=read("data/presentation/mass-icon-originals-leclerc1661.p3.json");
const provenance=read("data/presentation/mass-icon-generation-provenance-20261019.v1.json");
assert.equal(series.schema,"ao-mass-original-art-series-v1");
assert.equal(series.work.artist,"Sébastien Leclerc I (1637–1714)");
assert.equal(series.work.publicationYear,1661);
assert.equal(series.work.holdingInstitution,"Rijksmuseum, Amsterdam");
assert.equal(series.work.rights,"PUBLIC_DOMAIN_AS_DESCRIBED_BY_RIJKSMUSEUM");
assert.equal(series.sourceStatus,"CATALOGUED_OFFICIAL_ORIGINAL_IMAGES_NOT_DOWNLOADED");
assert.equal(series.plates.length,8,"P3 public-domain source sequence lost catalogue entries");
assert.deepEqual(series.plates.map(x=>x.plate),[13,19,21,26,28,29,30,31]);
assert.equal(new Set(series.plates.map(x=>x.id)).size,8,"duplicate catalogue object numbers");
for(const item of series.plates){
 assert.match(item.id,/^RP-P-OB-69\.\d{3}$/);
 assert.ok(item.institutionId.startsWith("https://")&&
    /rijksmuseum\.nl/.test(item.institutionId));
 assert.equal(item.rightsStatus,"PUBLIC_DOMAIN_INSTITUTIONALLY_CATALOGUED");
 assert.equal(item.actualImageViewed,false,"uninspected original was incorrectly marked viewed");
 assert.equal(item.originalImagePath,null,"unverified original was added to storage");
 assert.equal(item.sha256,null,"unchecked image was assigned a fake SHA-256 digest");
 assert.equal(item.handPlacementVerified,false,"1661 image was assumed to meet 1962 rubrics");
 assert.equal(item.matches1962Rubrics,null);
 assert.equal(item.approvedBankArtComparison,false);
 assert.equal(item.userApproval,"PENDING");
 assert.equal(item.releaseEligible,false);
}
const communion=series.plates.find(x=>x.plate===29);
assert.equal(communion.id,"RP-P-OB-69.179");
assert.equal(communion.printedTitle,"Quand le P. communie");
assert.equal(communion.target,"PRIEST_OWN_COMMUNION_POTENTIAL");
assert.equal(communion.institutionId,"https://id.rijksmuseum.nl/200217641");
assert.equal(communion.readiness,"HIGH_PRIORITY_IMAGE_ACQUISITION_AND_RUBRICAL_INSPECTION");
assert.equal(series.plates.find(x=>x.plate===30).target,"ABLUTIONS",
 "Ablutions plate was misidentified as receiving the chalice");
assert.equal(series.plates.find(x=>x.plate===21).target,"ELEVATES_HOST",
 "Elevation plate was misidentified as consuming Host");
assert.equal(series.plates.find(x=>x.plate===26).target,"BREAKS_HOST",
 "Fraction should remain RUBRIC_ONLY under P2");
assert.equal(provenance.discoveryReview.leclerc1661SourceIndex,
 "data/presentation/mass-icon-originals-leclerc1661.p3.json");
for(const candidate of provenance.candidates){
 const lead=candidate.researchLeads.find(x=>x.id==="RIJKSMUSEUM_LECLERC_1661_PLATE29");
 assert.ok(lead,"actual Catholic communion source reference absent from "+candidate.id);
 assert.equal(lead.rightsStatus,"PUBLIC_DOMAIN_CONFIRMED_ON_INSTITUTION_PAGE");
 assert.equal(lead.pictureVisuallyInspected,false);
 assert.equal(lead.exactHostVsChaliceState,"NOT_DETERMINED");
 assert.equal(lead.sourceImagesRetrieved,0);
 assert.equal(lead.approvedFamilyComparison,"NOT_STARTED");
 assert.deepEqual(candidate.originalPictures,[],
   "research lead wrongly promoted to a verified original without source image");
 assert.equal(candidate.status,"BLOCKED_SOURCE_IMAGE_REQUIRED");
 assert.equal(candidate.asset,null);
}
console.log("Mass icon P3 original series PASS — 8 museum records; source/public-domain provenance confirmed, art release blocked awaiting actual image inspection.");
