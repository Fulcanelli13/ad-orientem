import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import {attachApprovedDirectoryMedia,eligibleRenderedDirectoryImage,
  renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {attachCL2SiteCategories} from "../src/find/tlm-site-category-associations.js";
import {attachCL2ExactVenueCategoryWitnesses} from "../src/find/tlm-exact-venue-categories.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const release=read("data/geography/research/sacred-places-p107-two-diocesan-photo-links.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const images=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const physical=read("data/directory/generated/cl2-physical-site-index.v1.json");
const matrix=read("data/directory/cl2-source-site-category-matrix-20261111.v1.json");
const witnesses=read("data/directory/cl2-exact-venue-category-witnesses-20261111.v1.json");

assert.equal(release.schema,"AO_SACRED_PLACES_P107_TWO_DIOCESAN_PHOTO_LINKS_V1");
assert.equal(release.new_places,0);
assert.equal(release.confirmed_directory_links_added,2);
assert.deepEqual([release.baseline.directory_links,release.proposed.directory_links],[24,26]);
assert.deepEqual([release.baseline.places,release.proposed.places],[530,530]);
assert.deepEqual([release.baseline.sources,release.proposed.sources],[846,846]);
assert.equal(geography.directoryPlaceLinks.length,LIVE.links);
assert.equal(LIVE.links,26);
assert.equal(geography.places.length,530);
assert.equal(physical.records.length,2580);
assert.equal(release.published_links.length,2);

const originals=physical.records.map(r=>({
  kind:"TLM_VENUE",physical_site_source:"CL2_MASTER",physical_group_id:r[0],
  source_ids:r[1],source_id:r[1][0],item_id:"tlm:cl2:"+r[0],
  lens:"tlm",community_id:"OTHER",title:r[2],subtitle:r[4],sections:[],
}));
const classified=attachCL2ExactVenueCategoryWitnesses(
  attachCL2SiteCategories(originals,physical,matrix),physical,witnesses);
const withMedia=attachApprovedDirectoryMedia(classified,{
  directoryPlaceLinks:geography.directoryPlaceLinks,approved:images.items,
  gallery:gallery.items,
});
const expected=new Map([
 ["AO-B35-L-GB-91CDCC69A421",{
  anchor:"RG-01F176BB1074",place:"place:GB:westminster-cathedral",
  photo:"assets/approved/place-media/pf-718ed6d79ce70af01a892d.webp"}],
 ["AO-RSCH-B69-3A43E996D0D9",{
  anchor:"RG-B69-3A43E996D0D9",place:"place:DE:maria-vesperbild",
  photo:"assets/approved/place-media/pf-6aceb6203e1f582b6cbd22.webp"}],
]);
for(const [source,match] of expected){
  const r=release.published_links.find(x=>x.venue_id===source);
  assert.ok(r);
  assert.equal(r.physical_anchor_id,match.anchor);
  assert.equal(r.place_id,match.place);
  assert.equal(r.photo_asset,match.photo);
  assert.equal(r.new_images,0);
  assert.equal(r.new_pins,0);
  assert.equal(r.new_mass_times,0);
  const site=physical.records.find(x=>x[0]===match.anchor);
  assert.equal(site[1][0],source);
  const link=geography.directoryPlaceLinks.filter(x=>x.venue_id===source);
  assert.equal(link.length,1);
  assert.equal(link[0].relationship,"LOCATED_AT");
  assert.equal(link[0].confidence,"CONFIRMED");
  assert.equal(link[0].place_id,match.place);
  const place=geography.places.find(x=>x.place_id===match.place);
  assert.ok(place,"Place must have been in the approved registry already");
  const cover=images.items.find(x=>x.place_id===match.place);
  assert.equal(cover.asset_path,match.photo);
  for(const k of ["rights_verified","subject_verified","crop_reviewed"])
    assert.equal(cover[k],true);
  assert.equal(cover.status,"APPROVED");
  const item=withMedia.find(x=>x.physical_group_id===match.anchor);
  assert.equal(item.place_id,match.place);
  assert.equal(item.cover_media.asset_path,match.photo);
  assert.equal(item.site_category.category,"DIOCESAN_OR_PARISH_CONTEXT");
  assert.equal(eligibleRenderedDirectoryImage(item.cover_media,item),true);
  assert.match(renderDirectoryVenueCard(item),/data-visual-kind="photo"/);
  assert.ok(renderDirectoryVenueCard(item).includes(match.photo));
}
assert.equal(geography.directoryPlaceLinks.filter(x=>
  x.place_id==="place:GB:walsingham-catholic-shrine"&&
  x.venue_id==="AO-EUR-GB-003").length,0,
 "The Walsingham basilica must not acquire the Slipper Chapel's photo by name");
assert.equal(withMedia.filter(x=>x.site_category?.category==="DIOCESAN_OR_PARISH_CONTEXT"
  &&eligibleRenderedDirectoryImage(x.cover_media,x)).length,9);
assert.equal(release.policy.no_new_map_pins,true);
assert.equal(release.policy.no_new_liturgy_status_or_ownership_inference,true);
console.log("P107 PASS: 26 canonical geography links, nine approved exact-linked diocesan photo heroes; Walsingham held");
