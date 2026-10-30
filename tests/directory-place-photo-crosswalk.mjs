import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {buildScreen} from "../tools/directory/screen-canonical-place-photos.mjs";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const r49=read("data/directory/preliminary-map-r49.v1.json");
const cover=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const review=read("data/geography/research/directory-place-photo-screen-p92-20261029.v1.json");
assert.deepEqual(review,buildScreen(geo,r49,cover,gallery),
  "The review registry must exactly reflect authoritative R49 and Place/media manifests");
assert.equal(review.state,"RESEARCH_ONLY_NEVER_APP_VISIBLE");
assert.deepEqual([review.counts.venues_screened,review.counts.canonical_places,
 review.counts.within_350m_pairs,review.counts.venues_near_place],
 [1879,529,54,49]);
assert.equal(review.counts.confirmed_links,22);
assert.equal(review.counts.nearby_approved_photo_pairs,16);
assert.equal(review.counts.exact_confirmed_photo_joins,9);
assert.equal(review.counts.published_new_links,0);
assert.equal(review.counts.published_new_photos,0);
assert.equal(review.counts.approved_gallery_images,33);
for(const [venue,place] of [["AO-AMER-R28-US-25-03","place:US:st-boniface-sioux-city"],["V19:DIO-US-MN-ST-PAUL-SAINT-AGNES","place:US:st-agnes-saint-paul"]]) {
 const exact=review.candidate_pairs.filter(x=>x.venue_id===venue&&x.place_id===place);
 assert.equal(exact.length,1);
 assert.equal(exact[0].disposition,"EXISTING_CONFIRMED_LINK");
 assert.equal(exact[0].place_has_approved_photo,true,"P95 approved the two historical P92 church photos");
}
assert.equal(review.batches.length,10);
assert.equal(review.batches.reduce((n,b)=>n+b.limit,0),1879);
assert.equal(review.candidate_pairs.length,54);
assert.equal(new Set(review.candidate_pairs.map(x=>x.venue_id+"|"+x.place_id)).size,54);
assert.equal(review.candidate_pairs.every(x=>x.auto_publish===false),true);
assert.equal(review.candidate_pairs.every(x=>x.distance_m>=0&&x.distance_m<=350),true);
assert.equal(review.photo_review_queue.length,16);
assert.equal(review.photo_review_queue.every(x=>x.review==="HOLD_SEPARATE_BUILDING_AND_RIGHTS_VERIFICATION"),true);
const unrelated=review.candidate_pairs.find(x=>x.venue_name==="Friedhofskirche St. Michael"
  &&x.place_id==="place:DE:altoetting-gnadenkapelle");
assert.equal(unrelated?.disposition,"DIFFERENT_CONFIRMED_PLACE_HOLD","P104 exact cemetery-church link must block Gnadenkapelle media substitution");
const wrongChapel=review.candidate_pairs.find(x=>x.venue_name==="Sieben-Schmerzen-Kapelle (Seven Sorrows Chapel)"
  &&x.place_id==="place:DE:altoetting-gnadenkapelle");
assert.equal(wrongChapel?.place_has_approved_photo,true);
assert.notEqual(wrongChapel?.disposition,"EXISTING_CONFIRMED_LINK");
for(const row of geo.directoryPlaceLinks){
 const pair=review.candidate_pairs.find(x=>x.venue_id===row.venue_id&&x.place_id===row.place_id);
 if(pair)assert.equal(pair.disposition,"EXISTING_CONFIRMED_LINK");
}
assert.equal(buildScreen({...geo,directoryPlaceLinks:[...geo.directoryPlaceLinks,{
 venue_id:"fake-proximity-match",place_id:"place:FR:pontmain",confidence:"PENDING",relationship:"LOCATED_AT"}]},r49,cover,gallery).counts.exact_confirmed_photo_joins,9);
const adjudication=read("data/geography/research/directory-place-identity-editorial-20261029.v1.json");
assert.equal(adjudication.schema,"AO_DIRECTORY_PLACE_EXACT_BUILDING_EDITORIAL_REVIEW_V1");
assert.equal(adjudication.release_candidate_count,0);
assert.equal(adjudication.verified_photo_release_count,0);
assert.equal(adjudication.adjudications.length,5);
for(const row of adjudication.adjudications){
 assert.ok(review.candidate_pairs.some(p=>p.venue_id===row.venue_id&&p.place_id===row.place_id));
 assert.ok(row.source_url.startsWith("https://"));
 assert.equal(row.editorial_state,"RESEARCH_EVIDENCE_REVIEW_ONLY__NO_SEED_REGISTRY_CHANGE");
 assert.equal(row.safe_public_photo,false);
 assert.equal(row.safe_schedule_publication,false);
}
assert.equal(adjudication.adjudications.find(x=>x.venue_id==="AO-EUR-DE-049")?.place_id,
 "place:DE:kevelaer-kerzenkapelle");
assert.ok(adjudication.forbidden_join_examples.some(x=>x.incorrect_place==="place:DE:kevelaer-gnadenkapelle"));

const trio=read("data/geography/research/directory-st-alphonsus-photo-candidates-w6.v1.json");
assert.equal(trio.schema,"AO_DIRECTORY_PHOTO_THREE_CATEGORY_ST_ALPHONSUS_W6_V1");
assert.equal(trio.status,"PHOTO_SOURCE_RESEARCH_ONLY_NO_PUBLICATION");
assert.equal(trio.publications,0);
assert.equal(trio.downloads,0);
assert.equal(trio.photos.length,3);
assert.deepEqual(trio.photos.map(x=>x.category),["EXTERIOR","INTERIOR","SACRED_DETAIL"]);
assert.ok(geo.directoryPlaceLinks.some(x=>x.venue_id===trio.venue_id&&x.place_id===trio.place_id&&
 x.confidence==="CONFIRMED"&&x.relationship==="LOCATED_AT"),
 "Only source-confirmed exact physical Place may own a three-category photo shortlist");
for(const item of trio.photos){
 assert.ok(item.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
 assert.ok(item.editorial_state.startsWith("HOLD_"));
}
assert.equal(trio.photos[0].license,"CC0");
assert.equal(trio.photos[1].license,"CC-BY-SA-3.0");
assert.equal(trio.photos[2].license,null,"Unknown altar copyright must remain unverified");

console.log("PASS 1,879 venues x 529 Places: 54 spatial pairs, 9 exact approved photo joins, 7 new non-published P104 identity links");
