import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolveApprovedPlaceGallery,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const pub=read("data/geography/approved-place-gallery.v1.json");
const hero=read("data/geography/approved-place-media.v1.json");
const manifest=read("data/geography/research/p77-approved-exterior-gallery-manifest.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const source=read("data/shrines/source-registry.v1.json");
assert.equal(pub.schema,"AO_APPROVED_PLACE_GALLERY_V1");
assert.equal(manifest.schema,"AO_P77_REVIEWED_TWENTY_ONE_PLACES_V1");
assert.equal(manifest.reviewed_hero_count,18);
assert.equal(manifest.reviewed_architecture_count,3);
assert.equal(manifest.entries.length,21);
const items=new Map(pub.items.map(r=>[r.media_id,r]));
const canonical=new Set(geo.places.map(p=>p.place_id));
const already=new Set(hero.items.map(p=>p.place_id));
const selected=[];
for(const x of manifest.entries){
 const row=items.get(x.media_id);
 assert.ok(row,"Missing exact P77 approved gallery row "+x.media_id);
 assert.ok(canonical.has(x.place_id)&&!already.has(x.place_id));
 assert.equal(row.place_id,x.place_id);
 assert.equal(row.source_url,x.source_url);
 assert.equal(row.source_sha1,x.source_sha1);
 assert.equal(row.derivative_sha256,x.staging_sha256);
 assert.equal(row.license,x.license);
 assert.equal(row.license_url,x.license_url);
 assert.equal(row.credit,x.artist);
 assert.equal(row.display_role,x.display_role);
 assert.ok(row.rights_verified&&row.subject_verified&&row.crop_reviewed);
 assert.ok(row.alt_en?.length>40&&row.alt_fr?.length>40);
 assert.ok(row.caption_en&&row.caption_fr);
 assert.equal(row.status,"APPROVED");
 assert.equal(row.asset_path,x.asset_path);
 assert.match(x.source_sha1,/^[0-9a-f]{40}$/);
 assert.match(x.staging_sha256,/^[0-9a-f]{64}$/);
 const bytes=readFileSync(new URL("../"+row.asset_path,import.meta.url));
 assert.equal(bytes.subarray(0,4).toString("ascii"),"RIFF");
 assert.equal(bytes.subarray(8,12).toString("ascii"),"WEBP");
 assert.equal(createHash("sha256").update(bytes).digest("hex"),x.staging_sha256);
 const exact=resolveApprovedPlaceGallery([row],x.place_id);
 assert.equal(exact.length,1,"Exact license URL and Place gate blocked approved photo "+x.media_id);
 assert.equal(exact[0].display_role,x.display_role);
 assert.equal(resolveApprovedPlaceGallery([row],"place:FR:nonexistent-photo-owner").length,0);
 assert.equal(resolveApprovedPlaceGallery([{...row,license_url:"https://creativecommons.org/licenses/by-sa/4.0/"}],x.place_id).length,
   x.license_url==="https://creativecommons.org/licenses/by-sa/4.0/"?1:0,
   "Wrong source licence version was accepted");
 selected.push(row);
}
assert.equal(new Set(selected.map(x=>x.place_id)).size,21);
assert.equal(selected.filter(x=>x.display_role==="HERO").length,18);
assert.equal(selected.filter(x=>x.display_role==="GALLERY_ARCHITECTURE").length,3);
assert.equal(pub.items.length,33);
assert.ok(!manifest.entries.some(x=>manifest.held_other_visual_and_rights.includes(x.review_number)));
for(const n of [3,4,5,10,11,12,47,32,76]){
 assert.ok(!manifest.entries.some(x=>x.review_number===n),"Held source entered publication "+n);
}
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,
   temporalLinks:shr.temporalLinks,sources:source.sources},
 customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},
 media:{approved:hero.items,gallery:pub.items}
};
const projected=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projected,{today:"2026-10-29"});
for(const row of selected){
 const profile=profiles.find(p=>p.place_id===row.place_id);
 assert.ok(profile,"No exact Place profile for "+row.place_id);
 assert.equal(profile.gallery.some(p=>p.media_id===row.media_id),true);
 if(row.display_role==="HERO"){
   assert.equal(profile.media?.asset_path,row.asset_path,
     "P77 hero photo missing from actual Place card "+row.place_id);
 }else{
   assert.equal(profile.media,null,
     "Secondary architecture image illegally promoted to Place hero "+row.place_id);
 }
}
console.log("P77 PASS: 21 original-byte-verified local WebPs, exact CC licences, 18 card heroes, three secondary photos, zero wrong-Place/relic fallback");
