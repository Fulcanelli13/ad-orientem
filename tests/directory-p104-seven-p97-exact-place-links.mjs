import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {assertExploreGeographyRegistry, isMapPublishablePlaceGeo} from "../src/find/geography-contracts.js";
import {auditShrineSource} from "../src/find/shrines-contracts.js";
import {LIVE, RELEASES} from "./helpers/sacred-places-live-baseline.mjs";
import {attachApprovedDirectoryMedia} from "../src/find/directory-card.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const src=read("data/shrines/source-registry.v1.json");
const r49=read("data/directory/preliminary-map-r49.v1.json");
const p104=read("data/geography/research/sacred-places-p104-seven-p97-directory-links.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const laterPhotoRelease=read("data/geography/research/directory-p106-four-approved-covers.v1.json");
const laterApproved=new Map(laterPhotoRelease.photos.map(p=>[p.place_id,p]));
const cross=read("data/geography/research/directory-place-photo-screen-p92-20261029.v1.json");
const columns=Object.fromEntries(r49.columns.map((n,i)=>[n,i]));
const venueById=new Map(r49.records.map(v=>[v[columns.id],v]));
const sources=new Map(src.sources.map(x=>[x.id,x]));
const expected=new Map([
 [309,"place:CZ:st-ignatius-jihlava"],
 [315,"place:DE:friedhofskirche-st-michael-altoetting"],
 [320,"place:FR:basilique-saint-bernard-fontaine-les-dijon"],
 [349,"place:GB:sacred-heart-caterham"],
 [356,"place:GB:st-mary-catholic-brewood"],
 [375,"place:US:immaculate-conception-cathedral-lake-charles"],
 [380,"place:US:holy-family-log-church-cahokia"]
]);
assert.equal(p104.schema,"AO_SACRED_PLACES_P104_SEVEN_P97_EXACT_DIRECTORY_CHURCHES_V1");
assert.deepEqual(p104.baseline,{places:522,sources:830,crosswalk:522,unlinked:257,geo_areas:146,directory_links:15});
assert.deepEqual(p104.proposed,{places:529,sources:844,crosswalk:529,unlinked:257,geo_areas:146,directory_links:22});
assert.ok(RELEASES.some(r=>r.id==="P104"),"Historical P104 must remain frozen");
assert.deepEqual([LIVE.places,LIVE.sources,LIVE.links],[530,846,23]);
assert.deepEqual([geo.places.length,src.sources.length,geo.directoryPlaceLinks.length],[LIVE.places,LIVE.sources,LIVE.links]);
assertExploreGeographyRegistry(geo);
assert.equal(p104.published_new.length,7);
assert.equal(media.items.length,36+laterPhotoRelease.photos.length,"Historical P104 approved none; P106 later independently approved four");
const rad=n=>n*Math.PI/180;
const meters=(a,b,c,d)=>{let q=Math.sin(rad(c-a)/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(rad(d-b)/2)**2;return Math.round(12742000*Math.asin(Math.sqrt(q))*10)/10};
for(const r of p104.published_new){
 assert.equal(expected.get(r.row),r.place_id);
 assert.equal(r.candidate_id,"P97-ROW-"+r.row);
 const place=geo.places.find(x=>x.place_id===r.place_id);
 assert.ok(place,"P104 Place must exist");
 assert.equal(place.name.official,geo.places.find(x=>x.place_id===r.place_id).name.official);
 assert.ok(isMapPublishablePlaceGeo(place.geo,place.address.country_code));
 assert.deepEqual(place.geo_area_ids,["geo:country:"+place.address.country_code]);
 assert.equal(place.geo.source_url,r.source_geo_url);
 assert.equal(place.geo.source_ref,r.geo_source_ref);
 assert.equal(place.geo.geocoding_source,r.geo_source_kind);
 const venue=venueById.get(r.venue_id);
 assert.ok(venue,"Frozen venue must exist");
 assert.equal(venue[columns.country],place.address.country_code);
 assert.equal(r.existing_r49_pin_precision,venue[columns.precision]);
 const m=meters(venue[columns.lat],venue[columns.lng],place.geo.lat,place.geo.lng);
 assert.equal(m,r.existing_r49_pin_distance_m);
 assert.ok(m<=150,"Larger distances require full independent physical site re-evaluation");
 const links=geo.directoryPlaceLinks.filter(x=>x.venue_id===r.venue_id);
 assert.equal(links.length,1);
 assert.equal(links[0].place_id,r.place_id);
 assert.equal(links[0].link_id,r.link_id);
 assert.equal(links[0].confidence,"CONFIRMED");
 assert.equal(links[0].relationship,"LOCATED_AT");
 assert.deepEqual(place.source_ids,r.source_ids);
 for(const sid of r.source_ids){
  const source=sources.get(sid);
  assert.ok(source&&source.url.startsWith("https://"));
  assert.deepEqual(auditShrineSource(source),[]);
 }
 assert.equal(sources.get(r.source_ids[0]).url,r.source_site_url);
 assert.equal(sources.get(r.source_ids[1]).url,r.source_geo_url);
 assert.equal(media.items.some(x=>x.place_id===r.place_id),laterApproved.has(r.place_id),"Only separately verified P106 may approve post-P104 photos");
 const attached=attachApprovedDirectoryMedia([{kind:"TLM_VENUE",source_id:r.venue_id}],{directoryPlaceLinks:geo.directoryPlaceLinks,approved:media.items,gallery:[]});
 if(laterApproved.has(r.place_id)){
   const later=laterApproved.get(r.place_id);
   assert.equal(later.venue_id,r.venue_id);
   assert.equal(attached[0].cover_media?.derivative_sha256,later.sha256);
 }else assert.equal(attached[0].cover_media,undefined,"No unreviewed P104 photo");
 assert.equal(r.approved_photo,false);
 assert.equal(r.published_photo,false);
 const pair=cross.candidate_pairs.filter(x=>x.place_id===r.place_id&&x.venue_id===r.venue_id);
 assert.equal(pair.length,1);
 assert.equal(pair[0].disposition,"EXISTING_CONFIRMED_LINK");
 assert.equal(pair[0].distance_m,m);
}
assert.equal(cross.counts.canonical_places,529);
assert.equal(cross.counts.confirmed_links,22);
assert.equal(cross.counts.exact_confirmed_photo_joins,5+laterPhotoRelease.photos.length,"P104 adds identity only; four later P106 approvals are separate");
assert.equal(p104.research_holds.length,4);
const gnd=cross.candidate_pairs.find(p=>p.venue_id==="ao-research-icksp-federated-v13-icksp-stg-112"&&p.place_id==="place:DE:altoetting-gnadenkapelle");
assert.equal(gnd?.disposition,"DIFFERENT_CONFIRMED_PLACE_HOLD","Do not mistake cemetery church for Gnadenkapelle");
const lake=p104.published_new.find(x=>x.row===375);
assert.equal(lake.existing_r49_pin_precision,"source_marker_unassessed");
assert.ok(!lake.source_geo_url.includes("/find"),"Must never treat unassessed Directory marker as independent map proof");
const family=p104.published_new.find(x=>x.row===380);
assert.ok(family.identity_evidence.includes("NOT the modern adjacent sanctuary"));
for(const [row,min] of [[349,80],[356,100]])assert.ok(p104.published_new.find(x=>x.row===row).existing_r49_pin_distance_m>min,
  "Street-pin discrepancy must remain visible, never hidden in geocoding");
console.log("P104 PASS: seven historical Place bridges, 22 Directory links; four distinct later P106 photos with immutable identities");
