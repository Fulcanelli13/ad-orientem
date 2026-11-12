import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";
import {attachApprovedDirectoryMedia,eligibleVenueImage,eligibleRenderedDirectoryImage,renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {attachCL2SiteCategories} from "../src/find/tlm-site-category-associations.js";
import {attachCL2ExactVenueCategoryWitnesses} from "../src/find/tlm-exact-venue-categories.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=p=>JSON.parse(fs.readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const release=read("data/directory/research/tlm-p108-thirteen-venue-photo-promotion-review-20261112.v1.json");
const staged=read("data/directory/research/tlm-28-release-candidates-20261112.v1.json");
const media=read("data/directory/approved-venue-media.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const physical=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");
assert.equal(release.schema,"AO_TLM_P108_THIRTEEN_EXACT_VENUE_PHOTO_REVIEW_V1");
assert.equal(staged.schema,"AO_TLM_28_VERIFIED_WEBP_TRANSFER_AND_APPROVAL_GATES_V1");
assert.equal(media.schema,"AO_APPROVED_TLM_VENUE_MEDIA_V1");
assert.deepEqual([release.staged_count,release.review.length,staged.entries.length],[28,28,28]);
assert.equal(release.outcome.proposed_for_media_promotion,13);
assert.equal(release.outcome.retained_for_source_provenance_review,13);
assert.equal(release.outcome.retained_for_composition_review,2);
assert.equal(release.outcome.lewiston_excluded,true);
assert.ok(!release.review.some(x=>x.cl2_anchor==="RG-A1C02A9EC71D"));
assert.equal(new Set(release.review.map(x=>x.cl2_anchor)).size,28);
assert.equal(new Set(media.items.map(x=>x.venue_id)).size,media.items.length);
assert.equal(new Set(media.items.map(x=>x.asset_path)).size,media.items.length);
assert.ok(media.items.some(x=>x.venue_id==="SSPXMAP:OPE-002280"));
assert.ok(media.items.some(x=>x.venue_id==="AO-B35-L-GB-E4B83FC0EAF5"));

const placeLinked=new Set(geography.directoryPlaceLinks.map(x=>x.venue_id));
const physicalByAnchor=new Map(physical.records.map(x=>[x[0],x]));
const released=release.review.filter(x=>x.decision==="PROPOSED_APPROVED_VENUE_COVER");
const held=release.review.filter(x=>x.decision==="HOLD_STAGED");
assert.deepEqual([released.length,held.length],[13,15]);

const originals=physical.records.map(r=>({
  kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",
  physical_group_id:r[0],source_ids:r[1],source_id:r[1][0],
  item_id:"tlm:cl2:"+r[0],lens:"tlm",community_id:"OTHER",
  title:r[2],subtitle:r[4],sections:[],
}));
const classified=attachCL2ExactVenueCategoryWitnesses(
  attachCL2SiteCategories(originals,physical,matrix),physical,witnesses);
const linked=attachApprovedDirectoryMedia(classified,{
  directoryPlaceLinks:geography.directoryPlaceLinks,
  approved:read("data/geography/approved-place-media.v1.json").items,
  gallery:read("data/geography/approved-place-gallery.v1.json").items,
  venueApproved:media.items,
});
for(const entry of released){
  const raw=staged.entries.find(x=>x.cl2_anchor===entry.cl2_anchor);
  const img=media.items.find(x=>x.venue_id===entry.venue_id);
  assert.ok(raw&&img,entry.cl2_anchor+" missing source or production record");
  assert.ok(physicalByAnchor.get(entry.cl2_anchor)?.[1].includes(entry.venue_id),"exact CL2 source join");
  assert.equal(physicalByAnchor.get(entry.cl2_anchor)[1][0],entry.venue_id,"primary source ID");
  assert.equal(placeLinked.has(entry.venue_id),false,"do not override Place cover");
  assert.equal(img.asset_path,raw.approved_asset_path);
  assert.equal(img.source_url,raw.source_url);
  assert.equal(img.source_sha1,raw.source_sha1);
  assert.equal(img.derivative_sha256,raw.derivative_sha256);
  assert.equal(img.credit,raw.credit);
  assert.equal(img.license,raw.license);
  assert.equal(img.license_url,raw.license_url);
  assert.deepEqual([img.width,img.height],[raw.width,raw.height]);
  for(const k of ["rights_verified","subject_verified","crop_reviewed"])assert.equal(img[k],true);
  assert.ok(img.changes_en&&img.changes_fr&&img.alt_en&&img.alt_fr);
  assert.ok(eligibleVenueImage(img,entry.venue_id),"eligible exact venue media");
  const stagedBytes=fs.readFileSync(new URL("../"+entry.staged_asset_path,import.meta.url));
  const publishedBytes=fs.readFileSync(new URL("../"+img.asset_path,import.meta.url));
  assert.ok(stagedBytes.equals(publishedBytes),"approved copy must be byte-identical");
  assert.equal(stagedBytes.toString("ascii",0,4),"RIFF");
  assert.equal(stagedBytes.toString("ascii",8,12),"WEBP");
  assert.equal(createHash("sha256").update(publishedBytes).digest("hex"),img.derivative_sha256);
  const item=linked.find(x=>x.physical_group_id===entry.cl2_anchor);
  assert.equal(item.source_id,entry.venue_id);
  assert.equal(item.site_category.visual_lane,"DIOCESAN_PHOTO");
  assert.equal(item.cover_media.asset_path,img.asset_path);
  assert.ok(eligibleRenderedDirectoryImage(item.cover_media,item));
  for(const lang of ["en","fr"]){
    const html=renderDirectoryVenueCard(item,lang);
    assert.match(html,/data-visual-kind="photo"/);
    assert.ok(html.includes(img.asset_path));
    assert.ok(html.includes(lang==="fr"?img.alt_fr:img.alt_en));
  }
}
// Preview credit/source/licence rendering must remain accessible, not solely stored in JSON.
const representative=linked.find(x=>x.physical_group_id===released[0].cl2_anchor);
const html=renderExploreToString(buildExploreViewModel({
  language:"fr",lens:"tlm",items:[representative],
  view:"map",selectedId:representative.item_id,
  filters:{directoryGroup:"ALL"},
}));
assert.match(html,/aoTlmPreviewPhotoCredit/);
assert.ok(html.includes(representative.cover_media.credit));
assert.ok(html.includes(representative.cover_media.license_url));
assert.ok(html.includes(representative.cover_media.source_url.replaceAll("&","&amp;"))||html.includes(representative.cover_media.source_url));
for(const row of held){
  assert.ok(staged.entries.find(x=>x.cl2_anchor===row.cl2_anchor));
  assert.ok(!media.items.find(x=>x.venue_id===row.venue_id),"held image must remain unavailable as an approved photo");
}
console.log("P108 PASS: 13 exact venue cover bytes, 15 holds, unchanged originals, EN/FR and attribution verified");
