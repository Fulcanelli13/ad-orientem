import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {attachApprovedDirectoryMedia} from "../src/find/directory-card.js";
import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const g=read("data/geography/seed-registry.v1.json");
const receipt=read("data/geography/research/sacred-places-p92-two-directory-photo-venue-links.v1.json");
const r49=read("data/directory/preliminary-map-r49.v1.json");
const approved=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
assert.equal(receipt.schema,"AO_SACRED_PLACES_P92_TWO_EXACT_DIRECTORY_PHOTO_VENUE_LINKS_V1");
assert.deepEqual([g.places.length,g.directoryPlaceLinks.length],[LIVE.places,LIVE.links]);
assert.ok(LIVE.places>=518 && LIVE.links>=11,"P92 frozen historical counts may be extended by later releases");
assert.deepEqual([receipt.baseline.places,receipt.baseline.directory_links,receipt.proposed.places,receipt.proposed.directory_links],[516,9,518,11]);
assert.deepEqual(receipt.published_new.map(x=>x.place_id),["place:US:st-boniface-sioux-city","place:US:st-agnes-saint-paul"]);
assertExploreGeographyRegistry({geoAreas:g.geoAreas,places:g.places,directoryPlaceLinks:g.directoryPlaceLinks});
const expected=new Map([
 ["AO-AMER-R28-US-25-03","place:US:st-boniface-sioux-city"],
 ["V19:DIO-US-MN-ST-PAUL-SAINT-AGNES","place:US:st-agnes-saint-paul"]
]);
const col=Object.fromEntries(r49.columns.map((key,i)=>[key,i]));
for(const [venue,place] of expected){
 const rows=r49.records.filter(row=>row[col.id]===venue);
 assert.equal(rows.length,1,"frozen R49 operational venue must be unique");
 const physical=g.places.find(p=>p.place_id===place);
 assert.ok(physical);
 assert.equal(physical.place_type,"church");
 assert.equal(physical.geo_area_ids[0],"geo:country:US");
 assert.equal(physical.geo.matched_country_code,"US");
 assert.ok(/^https:\/\//.test(physical.geo.source_url));
 assert.equal(physical.mappable,true);
 const links=g.directoryPlaceLinks.filter(l=>l.venue_id===venue);
 assert.equal(links.length,1);
 assert.equal(links[0].place_id,place);
 assert.equal(links[0].relationship,"LOCATED_AT");
 assert.equal(links[0].confidence,"CONFIRMED");
 assert.ok(links[0].source_ids.length>=2);
 assert.equal(approved.items.some(x=>x.place_id===place&&x.status==="APPROVED"),true,"P95 has since published this approved church cover");
 assert.equal(gallery.items.some(x=>x.place_id===place),false);
 const item={kind:"TLM_VENUE",source_id:venue};
 assert.equal(attachApprovedDirectoryMedia([item],{directoryPlaceLinks:g.directoryPlaceLinks,approved:approved.items,gallery:gallery.items})[0].cover_media?.place_id,place,"P95 release must attach only exact approved Place cover");
}
assert.equal(g.places.filter(p=>expected.has(p.place_id)).length,0);
assert.equal(receipt.new_places,2);
assert.equal(receipt.confirmed_directory_links_added,2);
assert.equal(receipt.policy.no_new_tlm_masses_or_schedules,true);
assert.equal(receipt.policy.photo_media_unapproved_until_exact_credit_and_derivative_review,true);
console.log("P92 PASS — frozen 518/11 receipt retained; exact identity links survive later releases and 2 P95 approved covers");
