import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {projectPreliminaryR49,projectPublishedProvisionalMassSites} from "../src/find/preliminary-directory-r49.js";
import {projectCL2PhysicalDirectory} from "../src/find/cl2-physical-directory.js";
import {attachApprovedDirectoryMedia,eligibleDirectoryImage,renderDirectoryVenueCard} from "../src/find/directory-card.js";
import {assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const geo=read("data/geography/seed-registry.v1.json");
const candidates=read("data/geography/directory-place-candidates.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const r49=read("data/directory/preliminary-map-r49.v1.json");
const extras=read("data/directory/published-provisional-mass-sites-20261026.v1.json");
const cl2=read("data/directory/generated/cl2-physical-site-index.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const release=read("data/geography/research/sacred-places-p108-la-crosse-guadalupe-exact-directory-photo-link.v1.json");

const venueId="AO-AMER-R28-US-23-05",anchor="RG-ACCD4654B950";
const placeId="place:US:guadalupe-shrine-la-crosse";
const sourceUrl="https://guadalupeshrine.org/hours-locations/";
const expectedAsset="assets/approved/place-media/pf-d2cc2fb4fdbf658d031f42.webp";
assert.equal(release.schema,"AO_SACRED_PLACES_P108_LA_CROSSE_GUADALUPE_DIRECTORY_PHOTO_LINK_V1");
assert.deepEqual(release.baseline,{places:530,sources:846,crosswalk:530,unlinked:257,geo_areas:146,directory_links:23});
assert.deepEqual(release.proposed,{places:530,sources:846,crosswalk:530,unlinked:257,geo_areas:146,directory_links:24});
assert.deepEqual([geo.places.length,geo.directoryPlaceLinks.length,LIVE.links],[530,24,24]);
assertExploreGeographyRegistry(geo);

const pl=geo.places.find(p=>p.place_id===placeId);
assert.equal(pl?.address?.line1,"5250 Justin Road");
assert.equal(pl?.address?.postal_code,"54601");
assert.equal(pl?.address?.city,"La Crosse");
const official=sources.sources.find(x=>x.id==="SHR-GUADALUPE-SCHEDULE");
assert.equal(official?.url,"https://guadalupeshrine.org/mass-schedules/");

const link=geo.directoryPlaceLinks.filter(l=>l.venue_id===venueId||l.place_id===placeId);
assert.equal(link.length,1,"Only one canonical exact link can own the shrine");
assert.equal(link[0].link_id,"link:directory-place:US:guadalupe-shrine-la-crosse");
assert.equal(link[0].venue_id,venueId);
assert.equal(link[0].place_id,placeId);
assert.equal(link[0].relationship,"LOCATED_AT");
assert.equal(link[0].confidence,"CONFIRMED");
assert.deepEqual(link[0].source_ids,["SHR-GUADALUPE-SCHEDULE",venueId]);
assert.equal(release.confirmed_existing_place_link.link_id,link[0].link_id);

const candidate=candidates.candidates.find(x=>x.candidate_id==="candidate:directory-place:US:guadalupe-la-crosse-tlm");
assert.equal(candidate?.status,"RESOLVED_CONFIRMED_DIRECTORY_VENUE");
assert.equal(candidate.resolution.venue_id,venueId);
assert.equal(candidate.resolution.cl2_physical_group_id,anchor);
assert.deepEqual(candidate.generated_provider_scan.exact_or_text_matches,[],"Prior limited provider scan remains unchanged");
assert.equal(candidates.candidates.filter(x=>x.status==="IDENTITY_RESOLUTION_REQUIRED").length,3);
const row=cl2.records.filter(x=>x[0]===anchor);
assert.equal(row.length,1);
assert.deepEqual(row[0].slice(0,5),[anchor,[venueId],"Shrine of Our Lady of Guadalupe","US","5250 Justin Road, La Crosse, WI 54601"]);
assert.equal(row[0][6][0],sourceUrl);

const approved=media.items.filter(m=>m.place_id===placeId);
assert.equal(approved.length,1);
const photo=approved[0];
assert.equal(photo.asset_path,expectedAsset);
assert.equal(photo.source_sha1,"53a98bc8794a37e05f7a85d99dd406fab56c8e5d");
assert.equal(photo.derivative_sha256,"36d078da2813b14ff11a60c3610872c154b49d413be4c7d8daf95cfab31d6743");
assert.equal(photo.license,"CC-BY-3.0");
assert.ok(eligibleDirectoryImage(photo,placeId));
assert.equal(createHash("sha256").update(readFileSync(new URL("../"+expectedAsset,import.meta.url))).digest("hex"),photo.derivative_sha256,"Only existing verified cover WebP is reused");

const base=projectPreliminaryR49(r49);
const sourceItem=base.find(x=>x.source_id===venueId);
assert.ok(sourceItem?.subtitle.includes("Louisiana Crosse, LA"),"Historical erroneous R49 source remains unchanged");
const extended=projectPublishedProvisionalMassSites(base,extras);
const projected=projectCL2PhysicalDirectory(extended,cl2);
assert.equal(projected.length,2582);
const matches=projected.filter(x=>x.physical_group_id===anchor);
assert.equal(matches.length,1);
const item=matches[0];
assert.equal(item.source_id,venueId);
assert.equal(item.title,"Shrine of Our Lady of Guadalupe");
assert.equal(item.subtitle,"La Crosse, WI · US");
assert.equal(item.address.formatted,"5250 Justin Road, La Crosse, WI 54601");
assert.ok(item.note.includes("source R49 locality was malformed"));
assert.equal(item.geo.lat,sourceItem.geo.lat,"Location correction must not silently alter source pin");
assert.equal(item.geo.lng,sourceItem.geo.lng);
assert.equal(item.map_state,sourceItem.map_state);

const [linked]=attachApprovedDirectoryMedia([item],{directoryPlaceLinks:geo.directoryPlaceLinks,approved:media.items,gallery:gallery.items});
assert.equal(linked.place_id,placeId);
assert.equal(linked.cover_media?.asset_path,expectedAsset);
assert.equal(linked.cover_media?.derivative_sha256,photo.derivative_sha256);
assert.ok(renderDirectoryVenueCard(linked,"en").includes(expectedAsset));
assert.ok(renderDirectoryVenueCard(linked,"fr").includes(expectedAsset));
assert.ok(!renderDirectoryVenueCard(linked,"fr").includes("Louisiana Crosse"));

for(const otherId of ["AO-EUR-DE-049","SSPXMAP:OPE-002134","AO-B33-L-DE-7348A60E1CA7"]){
 const [unlinked]=attachApprovedDirectoryMedia([{kind:"TLM_VENUE",source_id:otherId}],{directoryPlaceLinks:geo.directoryPlaceLinks,approved:[photo],gallery:[]});
 assert.equal(unlinked.cover_media,undefined,"No cross-country/same-dedication photo reuse: "+otherId);
}
for(const id of ["place:DE:kevelaer-gnadenkapelle","place:DE:kevelaer-kerzenkapelle","place:FR:rue-du-bac","place:GB:holywell-st-winefride-church","place:GB:walsingham-catholic-shrine"]){
 assert.equal(geo.directoryPlaceLinks.some(x=>x.place_id===id),false,"Unresolved chapel or shrine must stay unlinked: "+id);
}
assert.equal(release.no_new_photo_assets,true);
assert.equal(release.no_new_masses_or_schedule_rows,true);
assert.equal(release.no_photo_selection_changes,true);
console.log("P108 PASS: exact La Crosse TLM venue→Place bridge reuses one existing verified cover; historical false matches blocked.");
