import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {attachApprovedDirectoryMedia,eligibleDirectoryImage,renderDirectoryVenueCard,renderDirectoryGallery} from "../src/find/directory-card.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const covers=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const stage=read("data/geography/research/directory-st-alphonsus-photo-stage-20261029.v1.json");
const review=read("data/geography/research/directory-st-alphonsus-photo-editorial-20261029.v1.json");
const placeId="place:US:st-alphonsus-baltimore";
const venueId="ao-fssp-national-shrine-of-st-alphonsus-liguori-114-w-saratoga-st-baltimore-md-21201-usa";
assert.equal(geo.directoryPlaceLinks.filter(l=>l.venue_id===venueId&&l.place_id===placeId&&l.confidence==="CONFIRMED"&&l.relationship==="LOCATED_AT").length,1);
assert.equal(covers.items.length,32);
assert.equal(gallery.items.length,7);
assert.equal(new Set(covers.items.map(p=>p.place_id)).size,covers.items.length);
assert.equal(new Set(gallery.items.map(p=>p.media_id)).size,gallery.items.length);
const cover=covers.items.find(x=>x.place_id===placeId);
const image=gallery.items.find(x=>x.place_id===placeId);
assert.ok(cover&&image);
assert.equal(cover.license,"CC-BY-SA-4.0");
assert.equal(image.license,"CC0");
assert.equal(image.media_role,"EXTERIOR");
assert.equal(cover.asset_path,"assets/approved/place-media/US-st-alphonsus-baltimore.webp");
assert.equal(image.asset_path,"assets/approved/place-gallery/US-st-alphonsus-baltimore-facade.webp");
assert.equal(review.approved_source_assets.length,2);
assert.deepEqual(new Set(review.held.map(x=>x.role)),new Set(["INTERIOR","SACRED_DETAIL"]));
for(const photo of [cover,image]){
 const decision=review.approved_source_assets.find(x=>x.derivative_sha256===photo.derivative_sha256);
 const staged=stage.records.find(x=>x.asset_path.endsWith("/"+decision?.stage_filename));
 assert.ok(staged&&decision);
 assert.equal(photo.source_sha1,staged.original_sha1);
 assert.equal(photo.source_url,staged.source_url);
 assert.equal(photo.credit,staged.credit);
 assert.equal(photo.license,staged.license);
 assert.equal(photo.derivative_sha256,decision.derivative_sha256);
 assert.equal(eligibleDirectoryImage(photo,placeId),true);
 assert.equal(eligibleDirectoryImage(photo,"place:US:another"),false);
 assert.ok(existsSync(photo.asset_path));
 const data=readFileSync(photo.asset_path);
 assert.equal(data.toString("ascii",0,4),"RIFF");
 assert.equal(data.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(data).digest("hex"),photo.derivative_sha256);
 assert.equal(photo.rights_verified,true);
 assert.equal(photo.subject_verified,true);
 assert.equal(photo.crop_reviewed,true);
 assert.ok(photo.alt_en&&photo.alt_fr);
}
const item={item_id:"tlm:"+venueId,source_id:venueId,kind:"TLM_VENUE",
 title:"National Shrine of Saint Alphonsus Liguori",subtitle:"Baltimore · US",
 community_id:"FSSP",source_links:[],sections:[],status:"SCHEDULE UNVERIFIED"};
const actual=attachApprovedDirectoryMedia([item],{directoryPlaceLinks:geo.directoryPlaceLinks,approved:covers.items,gallery:gallery.items})[0];
assert.equal(actual.place_id,placeId);
assert.equal(actual.cover_media.asset_path,cover.asset_path);
assert.equal(actual.gallery_media.length,1);
assert.ok(renderDirectoryVenueCard(actual,"en").includes(cover.asset_path));
assert.ok(renderDirectoryGallery(actual,"en").includes(image.asset_path));
assert.ok(renderDirectoryGallery(actual,"fr").includes(image.alt_fr));
const bad=attachApprovedDirectoryMedia([{...item,source_id:"different-venue"}],
 {directoryPlaceLinks:geo.directoryPlaceLinks,approved:covers.items,gallery:gallery.items})[0];
assert.equal(bad.cover_media,undefined,"Approved image must not leak into a nearby unlinked venue");
for(const held of review.held){
 const filename=held.stage_filename;
 assert.equal(covers.items.some(p=>p.asset_path.includes(filename)),false);
 assert.equal(gallery.items.some(p=>p.asset_path.includes(filename)),false);
}
console.log("PASS St Alphonsus: real hashed WebP hero + facade in canonical approved registries, exact Place/venue identity, held nave/altar excluded");
