import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolveApprovedPlaceGallery,resolveApprovedPlaceMedia,buildExplorePlaceProfiles}
  from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
const get=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const pinned=get("data/geography/research/marian-keep-two-release-source-pins-20261101.v1.json");
const gallery=get("data/geography/approved-place-gallery.v1.json");
const approvedCovers=get("data/geography/approved-place-media.v1.json");
const geo=get("data/geography/seed-registry.v1.json");
const shrine=get("data/shrines/shrines-pilgrimages-seed.v1.json");
assert.equal(pinned.schema,"AO_EXPLORE_MARIAN_KEEP_TWO_EXACT_SOURCE_V1");
assert.equal(pinned.subjects.length,2);
assert.equal(gallery.schema,"AO_APPROVED_PLACE_GALLERY_V1");
assert.equal(new Set(gallery.items.map(x=>x.media_id)).size,gallery.items.length);
assert.equal(new Set(pinned.subjects.map(x=>x.place_id)).size,2);
assert(gallery.items.length>=35,"Existing 33 pictures plus two exactly verified medieval images");
for(const pin of pinned.subjects){
 assert.equal(pin.historic_user_keep,true);
 const selected=gallery.items.filter(x=>x.media_id===pin.media_id);
 assert.equal(selected.length,1,"Exactly one approved image for selected subject "+pin.subject_id);
 const x=selected[0];
 assert.equal(x.subject_focus_id,pin.subject_id);
 assert.equal(x.place_id,pin.place_id);
 assert.equal(x.status,"APPROVED");
 assert.equal(x.kind,"PHOTO");
 assert.equal(x.chapter_id,"images");
 assert.equal(x.display_role,"GALLERY_OBJECT");
 assert.equal(x.source_sha1,pin.original_sha1);
 assert.equal(x.license,pin.license);
 assert.equal(x.license_url,pin.license_url);
 assert.equal(x.credit,pin.photographer);
 assert.equal(x.photographed_at,pin.photographed_at);
 assert(x.rights_verified&&x.subject_verified&&x.crop_reviewed);
 assert(x.caption_en===pin.caption_en&&x.caption_fr===pin.caption_fr);
 assert(x.alt_en===pin.alt_en&&x.alt_fr===pin.alt_fr);
 assert.equal(x.source_url,"https://commons.wikimedia.org/wiki/"+
   encodeURI(pin.file_title.replaceAll(" ","_")).replaceAll("#","%23"));
 assert.match(x.source_sha1,/^[0-9a-f]{40}$/);
 assert.match(x.derivative_sha256,/^[0-9a-f]{64}$/);
 assert.equal(x.asset_path,pin.asset_path);
 assert(!x.subject_relic_id,"Marian icon isn't a physical relic claim");
 assert(x.width>=700&&x.height>=700);
 assert.equal(x.orientation,x.height>x.width?"portrait":"landscape");
 const binary=readFileSync(new URL("../"+x.asset_path,import.meta.url));
 assert.equal(binary.toString("ascii",0,4),"RIFF");
 assert.equal(binary.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(binary).digest("hex"),x.derivative_sha256,
  "Asset bytes must exactly match approved ledger");
 const approved=resolveApprovedPlaceGallery([x],pin.place_id);
 assert.equal(approved.length,1,"Existing gallery gates should accept verified original");
 assert.equal(approved[0].asset_path,pin.asset_path);
 assert.equal(resolveApprovedPlaceGallery([x],"place:FR:rue-du-bac").length,0);
 assert.equal(resolveApprovedPlaceGallery([{...x,rights_verified:false}],pin.place_id).length,0);
 assert.equal(resolveApprovedPlaceGallery([{...x,subject_verified:false}],pin.place_id).length,0);
 assert.equal(resolveApprovedPlaceGallery([{...x,asset_path:"assets/staged/example.webp"}],pin.place_id).length,0);
 assert.equal(resolveApprovedPlaceGallery([{...x,source_sha1:"0".repeat(40)}],pin.place_id).length,1,
  "SHA1 syntax gate alone does not confirm bytes: full manifest test must do so");
 assert(geo.places.some(p=>p.place_id===pin.place_id),"Must retain canonical Place");
}
const data={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shrine.shrines,pilgrimages:shrine.pilgrimages,routes:shrine.routes,temporalLinks:shrine.temporalLinks,sources:[]},
 customs:{customs:[],attestations:[],sources:[]},
 sacredPhenomena:{relics:[],apparitions:[]},novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},
 media:{approved:approvedCovers.items,gallery:gallery.items}
};
const profiles=buildExplorePlaceProfiles(data,projectExploreDataset(data));
for(const pin of pinned.subjects){
 const profile=profiles.find(x=>x.place_id===pin.place_id);
 assert(profile,"Place profile missing "+pin.place_id);
 assert(profile.gallery.some(x=>x.media_id===pin.media_id&&x.asset_path===pin.asset_path),
   "Exact image not rendered in approved Place gallery");
 assert(profile.media?.asset_path!==pin.asset_path,
   "An object detail must never replace Place cover");
}
console.log("PASS: 2 source-SHA1-pinned medieval Marian KEEP gallery photos; original Place covers retained, no wrong-Place photos or relic substitutions");
