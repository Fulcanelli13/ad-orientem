import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {gospelCitationOverlap,curatedDateArtworkAssessment,assessDailyCuratedArt}
  from "../src/home/calendar-gospel-curated-art-matcher.js";

const ledger=JSON.parse(readFileSync(new URL(
 "../data/calendar/research/2026-existing-curated-date-art-reuse.v1.json",import.meta.url),"utf8"));
assert.equal(ledger.relations.length,58);
assert.equal(new Set(ledger.relations.map(x=>x.date)).size,40);
assert.equal(ledger.relations.filter(x=>x.selectedImageKey).length,16);
for(const row of ledger.relations) {
 assert.match(row.date,/^2026-\d{2}-\d{2}$/);
 assert.ok(row.artworkId&&row.sourceObservedPrincipalId);
 assert.equal(row.productionPublished,false);
 assert.equal(row.imageRightsAndCropCertified,false);
 assert.equal(row.stage,"RESEARCH_JOIN_NOT_PRODUCTION_APPROVAL");
}
assert.equal(gospelCitationOverlap("John 20:19–31","John 20:19–31"),"EXACT_CITATION");
assert.equal(gospelCitationOverlap("John 20:19–31","John 20:24–29"),
 "OVERLAPPING_VERSES_NOT_SCENE_PROOF");
assert.equal(gospelCitationOverlap("Luke 18:9–14","John 20:19–31"),"DIFFERENT_PASSAGE");
assert.equal(gospelCitationOverlap("John 21:1–10","John 2:1–10"),"DIFFERENT_PASSAGE");
assert.equal(gospelCitationOverlap(null,"John 20:19–31"),"NO_CITATION");
assert.equal(gospelCitationOverlap("Matthew 26:36–75; 27:1–60","Matthew 26:36–75; 27:1–60"),
 "EXACT_CITATION");
const candidate=ledger.relations.find(x=>x.role==="GOSPEL_SCENE"&&x.date==="2026-04-12");
assert.ok(candidate,"Expected archived Low Sunday scene");
const base={date:candidate.date,principalId:candidate.sourceObservedPrincipalId,
 gospel:{status:"VERIFIED_FROM_SELECTED_PROPER",reference:"John 20:19–31"}};
const matched=curatedDateArtworkAssessment(base,candidate);
assert.equal(matched.status,"GOSPEL_PASSAGE_MATCH_MEDIA_AND_SCENE_REVIEW_REQUIRED");
assert.equal(matched.citationFit,"EXACT_CITATION");
assert.equal(matched.publishable,false);
const other=curatedDateArtworkAssessment({...base,gospel:{status:"VERIFIED_FROM_SELECTED_PROPER",reference:"Luke 11:1–4"}},candidate);
assert.equal(other.status,"CLAIMED_GOSPEL_NOT_MATCHED");
const withheld=curatedDateArtworkAssessment({...base,gospel:{status:"NOT_VERIFIED",reference:null}},candidate);
assert.equal(withheld.status,"GOSPEL_SOURCE_UNRESOLVED");
const wrong=curatedDateArtworkAssessment({...base,principalId:"sancti:wrong:1:w"},candidate);
assert.equal(wrong.status,"WRONG_OBSERVED_PRINCIPAL");
const feast=ledger.relations.find(x=>x.role==="FEAST_PERSON");
const feastResult=curatedDateArtworkAssessment({date:feast.date,
 principalId:feast.sourceObservedPrincipalId,
 gospel:{status:"NOT_VERIFIED",reference:null}},feast);
assert.equal(feastResult.status,"FEAST_PRINCIPAL_ID_MATCH_MEDIA_REVIEW_REQUIRED");
const day=assessDailyCuratedArt(base,ledger.relations);
assert.ok(day.totals.proposals>=1);
assert.ok(day.totals.gospelPassageScreened>=1);
assert.equal(day.totals.actuallyPublishedHere,0);
assert.equal(day.totals.sourceImageRightsCropCertified,0);
console.log("58 historical candidate relations, observed Mass/Gospel guards, no auto-release PASS");
