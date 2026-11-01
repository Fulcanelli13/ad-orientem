import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {resolveApprovedObjectPhotoReuse} from "../src/find/approved-object-photo-reuse.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,resolveApprovedPlaceGallery,resolveApprovedPlaceMedia} from "../src/find/place-profiles.js";
import {renderPlaceSacredTreasures} from "../src/find/place-editorial-presentation.js";
import {EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const bundle=read("data/geography/approved-object-photo-reuse.v1.json");
const cover=read("data/geography/approved-place-media.v1.json");
const gallery=read("data/geography/approved-place-gallery.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const exactPlace="place:IE:st-peters-oliver-plunkett-drogheda";
const exactRelic="relic:IE:oliver-plunkett-head-drogheda";
assert.equal(bundle.schema,"AO_APPROVED_OBJECT_PHOTO_REUSE_V1");
assert.equal(bundle.releases.length,1,"Do not inadvertently release research cohort");
const entry=bundle.releases[0];
assert.equal(entry.place_id,exactPlace);
assert.equal(entry.subject_relic_id,exactRelic);
assert.equal(entry.photographic_subject_scope,"SAME_PHYSICAL_SHRINE_HOUSING_RELIC_NOT_HEAD_DETAIL");
assert.equal(phenomena.relics.find(x=>x.id===exactRelic)?.place_id,exactPlace);
assert.equal(phenomena.relics.find(x=>x.id===exactRelic)?.source_url,entry.official_subject_source_url);
const original=cover.items.filter(x=>x.place_id===exactPlace);
assert.equal(original.length,1);
assert.equal(original[0].status,"APPROVED");
assert.equal(original[0].rights_verified,true);
assert.equal(original[0].subject_verified,true);
assert.equal(original[0].crop_reviewed,true);
assert.ok(resolveApprovedPlaceMedia(cover.items,exactPlace),"Original cover must remain a public Place cover");
const digest=createHash("sha256").update(readFileSync(new URL("../"+original[0].asset_path,import.meta.url))).digest("hex");
assert.equal(digest,entry.approved_cover_derivative_sha256,"Local original bytes no longer match approved checksum");
assert.equal(original[0].source_sha1,entry.approved_cover_source_sha1);
const good=resolveApprovedObjectPhotoReuse(bundle.releases,cover.items,exactPlace,exactRelic);
assert(good,"Exact approved reused object photo should resolve");
assert.equal(good.asset_path,original[0].asset_path);
assert.equal(good.media_reuse_source,"EXACT_APPROVED_PLACE_COVER");
assert.equal(good.additional_asset_bytes,0);
assert.equal(good.license,original[0].license);
assert.equal(good.license_url,original[0].license_url);
assert.equal(good.credit,original[0].credit);
for(const changes of [
  {...entry,status:"RESEARCH_ONLY"},
  {...entry,approved_cover_derivative_sha256:"0".repeat(64)},
  {...entry,approved_cover_source_sha1:"0".repeat(40)},
  {...entry,approved_cover_asset_path:"assets/staged/place-media/unsafe.webp"},
  {...entry,photographic_subject_scope:"SAME_SITE_ANY_RELIC"},
  {...entry,depicts_kind:"PAINTING_OR_GENERIC_PLACE"},
  {...entry,photographed_at:"unknown"},
  {...entry,place_id:"place:FR:rue-du-bac"},
  {...entry,subject_relic_id:"relic:IE:wrong-object"},
  {...entry,site_photo_also_used_as_place_cover:false},
  {...entry,no_user_keep_vote_modified:false},
  {...entry,not_approved_for_any_other_relic:false},
  {...entry,caption_en:""}
]){
  const wrong=resolveApprovedObjectPhotoReuse([changes],cover.items,exactPlace,exactRelic);
  assert.equal(wrong,null,"Refuse altered identity/approval/rights or empty caption");
}
assert.equal(resolveApprovedObjectPhotoReuse([...bundle.releases,...bundle.releases],cover.items,exactPlace,exactRelic),null,
 "Duplicate owner rows must fail shut");
for(const wrongCover of [
  {...original[0],status:"UNREVIEWED"},
  {...original[0],rights_verified:false},
  {...original[0],subject_verified:false},
  {...original[0],crop_reviewed:false},
  {...original[0],source_sha1:"0".repeat(40)},
  {...original[0],derivative_sha256:"0".repeat(64)},
  {...original[0],license_url:"https://example.org/not-a-license"},
  {...original[0],asset_path:"assets/staged/place-media/unsafe.webp"}
]){
 const testCovers=cover.items.map(x=>x.place_id===exactPlace?wrongCover:x);
 assert.equal(resolveApprovedObjectPhotoReuse(bundle.releases,testCovers,exactPlace,exactRelic),null,
   "Do not show object when approved cover evidence changes");
}
assert.equal(resolveApprovedObjectPhotoReuse(bundle.releases,cover.items,"place:IE:knock-shrine",exactRelic),null);
assert.equal(resolveApprovedObjectPhotoReuse(bundle.releases,cover.items,exactPlace,"relic:IE:unrelated"),null);
assert.equal(resolveApprovedPlaceGallery(gallery.items,exactPlace).length,0,
 "Do not silently add a gallery photograph or change its approval registry");
assert.ok(EXPLORE_DATA_URLS.approvedObjectPhotoReuse.endsWith("/data/geography/approved-object-photo-reuse.v1.json"));

const data={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,temporalLinks:shr.temporalLinks,sources:[]},
 customs:{customs:[],attestations:[],sources:[]},
 sacredPhenomena:{relics:phenomena.relics,apparitions:phenomena.apparitions},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[]},
 media:{approved:cover.items,gallery:gallery.items,objectPhotoReuses:bundle.releases}
};
const projection=projectExploreDataset(data);
const profiles=buildExplorePlaceProfiles(data,projection);
const profile=profiles.find(x=>x.place_id===exactPlace);
assert(profile,"The target Place must exist");
assert.equal(profile.media.asset_path,original[0].asset_path,"Existing cover should not change");
const relic=profile.sacred_treasures.find(x=>x.id===exactRelic);
assert(relic,"The exact relic owner should be rendered");
assert.equal(relic.image?.media_id,entry.media_id);
assert.equal(relic.image?.asset_path,original[0].asset_path);
assert.equal(relic.image?.depicts_kind,"RELIQUARY_HOUSING_REPUTED_RELIC");
const bodyEn=renderPlaceSacredTreasures(profile,"en");
const bodyFr=renderPlaceSacredTreasures(profile,"fr");
for(const text of [bodyEn,bodyFr]){
 assert.ok(text.includes('data-sacred-object-photo="'+entry.media_id+'"'));
 assert.ok(text.includes(original[0].asset_path));
 assert.ok(text.includes(original[0].credit));
 assert.ok(text.includes(original[0].license_url));
}
assert.ok(bodyEn.includes("not a close-up or authentication"));
assert.ok(bodyFr.includes("non d'un gros plan ni d'une authentification"));
const unrelated=profiles.find(x=>x.place_id==="place:IE:knock-shrine");
assert(unrelated&&!unrelated.sacred_treasures.some(x=>x.image?.media_id===entry.media_id),
 "Do not leak exact object photograph to different Place");
const noRelease={...data,media:{...data.media,objectPhotoReuses:[]}};
const unapproved=buildExplorePlaceProfiles(noRelease,projectExploreDataset(noRelease))
 .find(x=>x.place_id===exactPlace);
assert.equal(unapproved.sacred_treasures.find(x=>x.id===exactRelic)?.image,null,
 "Object photo must vanish when approved release row is removed");
console.log("PASS Explore exact-object photo first release: existing verified Drogheda cover reused for ONLY its relic shrine; original hash, site cover, rights, FR/EN labels and invalid-photo gates intact");
