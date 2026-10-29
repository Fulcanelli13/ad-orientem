import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";
import {resolveApprovedPlaceGallery,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const load=p=>JSON.parse(readFileSync(p,"utf8"));
const htmlEsc=value=>String(value).replace(/[&<>"\']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#039;"}[c]));
const manifest=load("data/geography/research/explore-r68-reviewed-photo-sources.v1.json");
const sourceGallery=load("data/geography/approved-place-gallery.v1.json");
// R68 tests its original exact Pontmain cohort, not the later approved gallery appendices.
const gallery={...sourceGallery,items:sourceGallery.items.filter(item=>item.place_id==="place:FR:pontmain")};
const geo=load("data/geography/seed-registry.v1.json");
const shr=load("data/shrines/shrines-pilgrimages-seed.v1.json");
const refs=load("data/shrines/source-registry.v1.json");
const ir=load("data/shrines/illustrated-place-guides-ireland.v1.json");
const fr=load("data/shrines/illustrated-place-guides-france.v1.json");
const fr67=load("data/shrines/illustrated-place-guides-france-r67.v1.json");
const hero=load("data/geography/approved-place-media.v1.json");
assert.equal(gallery.schema,"AO_APPROVED_PLACE_GALLERY_V1");
assert.equal(gallery.items.length,2);
assert.equal(manifest.sources.length,2);
assert.ok(EXPLORE_DATA_URLS.approvedPlaceGallery.endsWith("/data/geography/approved-place-gallery.v1.json"));
assert.equal(hero.items.length,31+load("data/geography/research/directory-p95-first-two-photo-covers.v1.json").photos.length,"Six separate shrine approvals retain the original Pontmain gallery");
assert.equal(new Set(gallery.items.map(m=>m.media_id)).size,2);
const named=new Map(manifest.sources.map(r=>[r.media_id,r]));
for(const item of gallery.items){
 const req=named.get(item.media_id);
 assert.ok(req);
 assert.equal(item.place_id,"place:FR:pontmain");
 assert.equal(item.source_url,req.source_url);
 assert.equal(item.credit,"GO69");
 assert.equal(item.license,"CC-BY-SA-4.0");
 assert.equal(item.kind,"PHOTO");
 assert.ok(item.rights_verified&&item.subject_verified&&item.crop_reviewed);
 assert.equal(item.asset_path,"assets/approved/place-gallery/"+req.asset_filename);
 const b=readFileSync(item.asset_path);
 assert.equal(b.toString("ascii",0,4),"RIFF");
 assert.equal(b.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(b).digest("hex"),item.derivative_sha256);
}
const good=resolveApprovedPlaceGallery(gallery.items,"place:FR:pontmain");
assert.equal(good.length,2);
assert.equal(resolveApprovedPlaceGallery(gallery.items,"place:FR:chartres-notre-dame").length,0);
for(const variant of [
 {...gallery.items[0],status:"STAGED_NOT_APPROVED"},
 {...gallery.items[0],asset_path:"https://commons.wikimedia.org/example.jpg"},
 {...gallery.items[0],source_url:"https://untrusted.example/photo"},
 {...gallery.items[0],license:"CC-BY-SA-2.0"},
 {...gallery.items[0],rights_verified:false},
 {...gallery.items[0],subject_verified:false},
 {...gallery.items[0],crop_reviewed:false},
 {...gallery.items[0],place_id:"place:FR:rue-du-bac"},
 {...gallery.items[0],derivative_sha256:"garbage"}
]){
 assert.equal(resolveApprovedPlaceGallery([variant],"place:FR:pontmain").length,0,"Reject invalid gallery photo "+JSON.stringify(variant));
}
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,temporalLinks:shr.temporalLinks,sources:refs.sources},
 customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[...ir.guides,...fr.guides,...fr67.guides]},
 media:{approved:hero.items,gallery:gallery.items}
};
const projected=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projected,{today:"2026-10-11"});
assert.equal(profiles.filter(p=>p.illustrated_guide).length,14);
assert.equal(profiles.filter(p=>p.gallery.length).length,1);
const pont=profiles.find(p=>p.place_id==="place:FR:pontmain");
assert.ok(pont.illustrated_guide);
assert.equal(pont.gallery.length,2);
assert.equal(pont.media?.asset_path,"assets/approved/place-media/FR-pontmain-basilica-east.webp",
 "Pontmain uses the exact same approved image as the original gallery photograph");
for(const lang of ["en","fr"]){
 const html=renderExploreToString(buildExploreViewModel({
  language:lang,lens:"heritage",view:"map",items:projected.byLens.shrines,
  filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
  placeProfiles:profiles,selectedPlaceId:pont.place_id,expandPlace:true
 }));
 for(const fragment of ["aoExploreGuideGallery","aoExploreGalleryGrid","aoExploreGalleryImage",
   'data-explore-place-chapter="gallery"','data-explore-place-jump="gallery"',"aoExploreGuideTimeline"]){
  assert.ok(html.includes(fragment),fragment+" missing in "+lang);
 }
 for(const m of gallery.items){
  assert.ok(html.includes(m.asset_path));
  assert.ok(html.includes(m.source_url.replace(/&/g,"&amp;")));
  assert.ok(html.includes(htmlEsc(m["label_"+lang])));
  assert.ok(html.includes(htmlEsc(m["alt_"+lang])));
  assert.ok(html.includes("creativecommons.org/licenses/by-sa/4.0/"));
 }
}
for(const p of profiles.filter(x=>x.place_id!=="place:FR:pontmain"))assert.equal(p.gallery.length,0);
console.log("PASS Explore R68 Pontmain: 2 rights-verified local photographs, bilingual sourced gallery, no cross-Place leakage");
