import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { assertExploreGeographyRegistry } from "../src/find/geography-contracts.js";
import { attachApprovedDirectoryMedia } from "../src/find/directory-card.js";
import { LIVE } from "./helpers/sacred-places-live-baseline.mjs";
const read = p => JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const g=read("data/geography/seed-registry.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const r=read("data/directory/preliminary-map-r49.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const manifest=read("data/geography/research/sacred-places-p99-four-exact-directory-churches.v1.json");
const crosswalk=read("data/geography/research/directory-place-photo-screen-p92-20261029.v1.json");
assert.equal(manifest.schema,"AO_SACRED_PLACES_P99_FOUR_EXACT_DIRECTORY_CHURCHES_V1");
assert.deepEqual([manifest.baseline.places,manifest.baseline.sources,manifest.baseline.directory_links],[518,822,11]);
assert.deepEqual([manifest.proposed.places,manifest.proposed.sources,manifest.proposed.directory_links],[522,830,15]);
assert.deepEqual([g.places.length,sources.sources.length,g.directoryPlaceLinks.length],[LIVE.places,LIVE.sources,LIVE.links]);
assert.deepEqual([LIVE.places,LIVE.sources,LIVE.links],[530,846,23]);
assert.equal(manifest.new_places,4);
assert.equal(manifest.confirmed_directory_links_added,4);
assert.equal(g.geoAreas.length,146);
assertExploreGeographyRegistry({geoAreas:g.geoAreas,places:g.places,directoryPlaceLinks:g.directoryPlaceLinks});
const col=Object.fromEntries(r.columns.map((s,i)=>[s,i]));
const sourceIndex=new Map(sources.sources.map(s=>[s.id,s]));
const expected=new Map([
 ["V19:SJC-001",["place:US:st-john-cantius-chicago","osm:way:210308153",230]],
 ["ao-fssp-chiesa-di-san-canziano-via-s-canziano-9-i-35100-padova-italia",["place:IT:san-canziano-padova","osm:way:131987476",366]],
 ["ao-fssp-chapelle-saint-louis-de-gonzague-place-saint-louis-de-gonzague-f-64000-pau-france",["place:FR:saint-louis-de-gonzague-pau","osm:way:62885578",322]],
 ["ao-fssp-eglise-saint-bruno-place-du-11-novembre-f-33000-bordeaux-france",["place:FR:saint-bruno-bordeaux","osm:way:115526560",330]],
]);
const photoReleasePlaces=new Set(["place:US:st-john-cantius-chicago","place:IT:san-canziano-padova","place:FR:saint-bruno-bordeaux"]);
const roundMeters=(a,b,c,d)=>{const rad=x=>x*Math.PI/180,x=rad(c-a),y=rad(d-b),q=Math.sin(x/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(y/2)**2;return Math.round(12742000*Math.asin(Math.min(1,Math.sqrt(q)))*10)/10;};
for(const [venueId,[placeId,osm,sourceRow]] of expected){
 const row=r.records.filter(v=>v[col.id]===venueId);assert.equal(row.length,1,"R49 venue must exist exactly once");
 const place=g.places.find(p=>p.place_id===placeId);assert.ok(place);
 assert.equal(place.geo.source_ref,osm);
 assert.equal(place.geo.geocoding_source,"OSM");
 assert.equal(place.geo.precision,"site");
 assert.equal(place.geo.matched_country_code,place.address.country_code);
 assert.equal(place.geo_area_ids[0],"geo:country:"+row[0][col.country]);
 assert.equal(place.place_type,"church");
 const official=sourceIndex.get(place.source_ids[0]),geoSrc=sourceIndex.get(place.source_ids[1]);
 assert.ok(official?.url.startsWith("https://"));
 assert.ok(geoSrc?.url.endsWith(osm.replace("osm:way:","/way/")));
 assert.ok(/OFFICIAL/.test(official.directness));
 assert.equal(geoSrc.directness,"SECONDARY");
 const link=g.directoryPlaceLinks.filter(l=>l.venue_id===venueId);
 assert.equal(link.length,1);assert.equal(link[0].place_id,placeId);
 assert.equal(link[0].confidence,"CONFIRMED");assert.equal(link[0].relationship,"LOCATED_AT");
 const meters=roundMeters(row[0][col.lat],row[0][col.lng],place.geo.lat,place.geo.lng);
 assert.ok(meters<=80,"named church building must align with already established venue pin");
 const pair=crosswalk.candidate_pairs.filter(x=>x.venue_id===venueId&&x.place_id===placeId);
 assert.equal(pair.length,1);assert.equal(pair[0].distance_m,meters);assert.equal(pair[0].disposition,"EXISTING_CONFIRMED_LINK");
 assert.equal(media.items.some(m=>m.place_id===placeId),photoReleasePlaces.has(placeId),"P102 only releases three exact identified covers; Pau remains held");
 assert.equal(gallery.items.some(m=>m.place_id===placeId),false);
 const attached=attachApprovedDirectoryMedia([{kind:"TLM_VENUE",source_id:venueId}],{directoryPlaceLinks:g.directoryPlaceLinks,approved:media.items,gallery:gallery.items});
 if(photoReleasePlaces.has(placeId)){
  assert.equal(attached[0].cover_media?.place_id,placeId,"P102 approved cover attaches by exact Place");
  assert.deepEqual(attached[0].gallery_media,[],"No invented gallery photos");
 }else{
  assert.equal(attached[0].cover_media,undefined,"Pau photo held");
  assert.equal(attached[0].gallery_media,undefined,"Pau has no approved gallery");
 }
 assert.ok(manifest.published_new.some(x=>x.place_id===placeId&&x.candidate_id==="P97-ROW-"+sourceRow&&x.photo_publication==="NONE"));
}
assert.equal(crosswalk.counts.canonical_places,LIVE.places);
assert.equal(crosswalk.counts.confirmed_links,LIVE.links);
assert.equal(crosswalk.counts.exact_confirmed_photo_joins,10,"two P95, three P102, four P106 and one P108/P109 exact photo");
assert.equal(manifest.policy.no_new_tlm_masses_or_schedules,true);
assert.equal(manifest.policy.photo_media_unapproved_until_native_rights_derivative_review,true);
assert.equal(manifest.policy.no_expense,true);

const photoReview=read("data/directory/research/p100-four-p99-photo-preview-release-holds-20261029.json");
assert.equal(photoReview.schema,"AO_P100_FOUR_P99_PHOTO_PREVIEW_VISUAL_RELEASE_HOLDS_V1");
assert.deepEqual([photoReview.counts.photos_advanced_from_p97,photoReview.counts.individual_web_image_previews_manually_seen,photoReview.counts.visually_promising_primary,photoReview.counts.held_primary_weak_foreground],[4,4,3,1]);
assert.equal(photoReview.records.length,4);
for(const item of photoReview.records){
 assert.ok(manifest.published_new.some(x=>x.place_id===item.place_id));
 assert.ok(item.download_original_sha256?.length===64&&item.source_sha1?.length===40);
 assert.equal(item.original_sha_verified,true);
 assert.equal(item.web_preview_reviewed,true);
 assert.equal(item.native_pixel_source_original_manually_inspected,false);
 assert.equal(item.source_rights_release_cleared,false);
 assert.equal(item.derivative_generated_and_hash_verified,false);
 assert.equal(item.mobile_card_render_inspected,false);
 assert.equal(item.approved_media_entry_created,false);
 assert.equal(item.published,false);
}
assert.equal(photoReview.records.find(x=>x.row===322)?.visual_status,"HOLD_PRIMARY_OBTRUSIVE_FOREGROUND_BOLLARD");
assert.equal(photoReview.counts.new_approved_media,0);
assert.equal(photoReview.counts.new_published_photos,0);

console.log("P99/P102 PASS: 4 verified building links, 15 exact venue joins; three later approved covers, Pau held");
