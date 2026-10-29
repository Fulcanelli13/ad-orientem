import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {createHash} from "node:crypto";
import {EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";
import {resolveApprovedPlaceGallery,buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const esc=x=>String(x).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));
const sources=read("data/geography/research/explore-r69-gallery-sources.v1.json");
const registry=read("data/geography/approved-place-gallery.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const refs=read("data/shrines/source-registry.v1.json");
const ir=read("data/shrines/illustrated-place-guides-ireland.v1.json");
const fr=read("data/shrines/illustrated-place-guides-france.v1.json");
const fr67=read("data/shrines/illustrated-place-guides-france-r67.v1.json");
const hero=read("data/geography/approved-place-media.v1.json");
assert.equal(sources.schema,"AO_PLACE_GALLERY_ACQUISITION_R69_V1");
assert.equal(registry.schema,"AO_APPROVED_PLACE_GALLERY_V1");
assert.equal(sources.sources.length,4);
// R69's original six remain frozen. Later exact-source batches may add approved
// media but cannot silently replace or alter the six historical records.
const originalOwners=[
 "place:FR:basilique-sainte-therese-lisieux","place:FR:chartres-notre-dame",
 "place:FR:pontmain","place:FR:rue-du-bac"
];
const originals=registry.items.filter(x=>originalOwners.includes(x.place_id));
const p73=read("data/geography/research/p73-curated-place-gallery-bundle.v1.json");
const later=registry.items.filter(x=>!originalOwners.includes(x.place_id));
assert.equal(originals.length,6);
assert.ok(later.length===0||later.length===p73.candidates.length,
  "No partial P73 approval state: image binaries and gallery entries must ship atomically");
if(later.length){
 assert.deepEqual(new Set(later.map(x=>x.media_id)),
   new Set(p73.candidates.map(x=>x.media_id)));
}
assert.equal(registry.items.length,originals.length+later.length);
assert.equal(hero.items.length,31);
assert.ok(EXPLORE_DATA_URLS.approvedPlaceGallery.endsWith("/data/geography/approved-place-gallery.v1.json"));
assert.equal(new Set(registry.items.map(x=>x.media_id)).size,registry.items.length);
assert.deepEqual([...new Set(originals.map(x=>x.place_id))].sort(),originalOwners.sort());
for(const source of sources.sources){
 const item=registry.items.find(r=>r.media_id===source.media_id);
 assert.ok(item,"Missing acquired photo "+source.media_id);
 assert.equal(item.place_id,source.place_id);
 assert.equal(item.source_url,source.source_url);
 assert.equal(item.credit,source.expected_artist);
 assert.equal(item.license,"CC-BY-SA-4.0");
 assert.equal(item.content_kind,source.content_kind);
 assert.equal(item.asset_path,"assets/approved/place-gallery/"+source.asset_filename);
 assert.equal(item.status,"APPROVED");
 assert.ok(item.rights_verified&&item.subject_verified&&item.crop_reviewed);
 assert.ok(item.alt_en&&item.alt_fr&&item.label_en&&item.label_fr);
 const data=readFileSync(item.asset_path);
 assert.equal(data.toString("ascii",0,4),"RIFF");
 assert.equal(data.toString("ascii",8,12),"WEBP");
 assert.equal(createHash("sha256").update(data).digest("hex"),item.derivative_sha256);
 const match=resolveApprovedPlaceGallery([item],item.place_id);
 assert.equal(match.length,1);
 assert.equal(resolveApprovedPlaceGallery([item],"place:FR:sainte-anne-d-auray").length,0);
}
for(const row of registry.items){
 assert.ok(row.asset_path.startsWith("assets/approved/place-gallery/"));
 assert.ok(row.source_url.startsWith("https://commons.wikimedia.org/wiki/File:"));
}
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,temporalLinks:shr.temporalLinks,sources:refs.sources},
 customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[...ir.guides,...fr.guides,...fr67.guides]},
 media:{approved:hero.items,gallery:registry.items}
};
const projected=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projected,{today:"2026-10-11"});
assert.equal(profiles.filter(p=>p.illustrated_guide).length,14);
assert.equal(profiles.filter(p=>p.gallery.length>0).length,
  new Set(registry.items.map(x=>x.place_id)).size);
for(const placeId of new Set(originals.map(x=>x.place_id))){
 const images=registry.items.filter(x=>x.place_id===placeId);
 const profile=profiles.find(x=>x.place_id===placeId);
 assert.ok(profile&&profile.illustrated_guide);
 assert.equal(profile.gallery.length,images.length);
 assert.equal(Boolean(profile.media),true,"All four gallery owners now also have their own approved exact-site hero photograph");
 for(const lang of ["en","fr"]){
  const html=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"heritage",view:"map",items:projected.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:placeId,expandPlace:true
  }));
  for(const marker of ["aoExploreGuideGallery","aoExploreGalleryGrid","aoExploreGalleryImage",
    'data-explore-place-chapter="gallery"','data-explore-place-jump="gallery"']){
   assert.ok(html.includes(marker),marker+" missing at "+placeId);
  }
  for(const img of images){
   assert.ok(html.includes(esc(img.alt_en))||html.includes(esc(img.alt_fr)));
   assert.ok(html.includes(esc(img["alt_"+lang])));
   assert.ok(html.includes(esc(img["label_"+lang])));
   assert.ok(html.includes(img.asset_path));
   assert.ok(html.includes(img.source_url));
  }
  for(const other of registry.items.filter(x=>x.place_id!==placeId)){
   assert.ok(!html.includes(other.asset_path),"Cross-site photo leak "+placeId+" / "+other.media_id);
  }
 }
}
// P63: a Place's approved gallery must remain visible even when there is no
// published illustrated pilgrimage guide (e.g. Notre-Dame and P61 churches).
const galleryOnlyId="place:FR:pontmain";
const galleryOnlyProfiles=profiles.map(p=>p.place_id===galleryOnlyId?{...p,illustrated_guide:null}:p);
for(const lang of ["en","fr"]){
 const html=renderExploreToString(buildExploreViewModel({
  language:lang,lens:"heritage",view:"map",items:projected.byLens.shrines,
  filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
  placeProfiles:galleryOnlyProfiles,selectedPlaceId:galleryOnlyId,expandPlace:true
 }));
 assert.ok(html.includes('data-explore-place-chapter="gallery"'),"Missing standalone gallery");
 assert.ok(html.includes('data-explore-place-jump="gallery"'),"Missing gallery navigation");
 assert.ok(!html.includes('data-explore-place-chapter="guide"'),"Gallery incorrectly requires a published guide");
 for(const item of registry.items.filter(x=>x.place_id===galleryOnlyId)){
  assert.ok(html.includes(item.asset_path));
  assert.ok(html.includes(esc(item["alt_"+lang])));
  assert.ok(html.includes(esc(item["label_"+lang])));
 }
 for(const item of registry.items.filter(x=>x.place_id!==galleryOnlyId))
  assert.ok(!html.includes(item.asset_path),"Other Place's gallery leaked");
}
for(const p of profiles.filter(x=>!registry.items.some(img=>img.place_id===x.place_id)))
 assert.equal(p.gallery.length,0);
console.log("PASS R69: original six approved Place-gallery photographs remain unchanged; "+
 registry.items.length+" exact local photographs over "+
 new Set(registry.items.map(x=>x.place_id)).size+
 " Places, bilingual UI and original 14 guides");
