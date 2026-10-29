import assert from "node:assert/strict";
import {readFileSync,existsSync} from "node:fs";
import {createHash} from "node:crypto";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,resolveApprovedPlaceGallery} from "../src/find/place-profiles.js";
import {renderPlaceSacredTreasures} from "../src/find/place-editorial-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const manifest=read("data/geography/research/approved-sacred-object-acquisition-p68.v1.json");
const originalGallery=read("data/geography/approved-place-gallery.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const relicById=new Map(phenomena.relics.map(x=>[x.id,x]));
const guides=[
 "france","france-r67","ireland","world-marian-r1","global-saints-r1","global-marian-b2"
].flatMap(x=>read("data/shrines/illustrated-place-guides-"+x+".v1.json").guides);
assert.equal(manifest.schema,"AO_SACRED_OBJECT_ACQUISITION_MANIFEST_P68_V1");
assert.equal(manifest.photos.length,3);
assert.equal(new Set(manifest.photos.map(x=>x.place_id)).size,3);
assert.equal(phenomena.relics.length,122);
assert.ok(originalGallery.items.length>=6);
for(const row of manifest.photos){
 const original=relicById.get(row.relic_id);
 assert.ok(original,"No object owner "+row.relic_id);
 assert.equal(original.place_id,row.place_id);
 assert.equal(row.expected_license,"CC-BY-SA-4.0");
 assert.equal(row.crop_policy,"ENTIRE_FRAME_NO_CROP");
 assert.ok(row.label_en&&row.label_fr&&row.caption_en&&row.caption_fr);
 const published=originalGallery.items.find(x=>x.media_id===row.media_id);
 if(published){
  assert.equal(published.place_id,row.place_id);
  assert.equal(published.subject_relic_id,row.relic_id);
  assert.equal(published.depicts_kind,row.subject_kind);
  assert.equal(published.status,"APPROVED");
  assert.equal(published.rights_verified,true);
  assert.equal(published.subject_verified,true);
  assert.equal(published.source_url,row.source_url);
  assert.ok(existsSync(new URL("../"+published.asset_path,import.meta.url)));
  const bytes=readFileSync(new URL("../"+published.asset_path,import.meta.url));
  assert.equal(createHash("sha256").update(bytes).digest("hex"),published.derivative_sha256);
 }

}
const data={
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 directory:{records:[],communities:[]},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,temporalLinks:shr.temporalLinks,sources:[]},
 customs:{customs:customs.customs,attestations:customs.attestations,sources:[]},
 sacredPhenomena:{relics:phenomena.relics,apparitions:phenomena.apparitions},
 saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
 media:{approved:[],gallery:originalGallery.items},
 editorial:{featured:[],placeGuides:guides},
 novenas:{records:[],links:[],sources:[]},
};
const projection=projectExploreDataset(data);
const profiles=buildExplorePlaceProfiles(data,projection,{today:"2026-10-29"});
const place=id=>profiles.find(p=>p.place_id===id);
const nd=place("place:FR:notre-dame-paris");
assert.equal(nd.sacred_treasures.length,3);
for(const treasure of nd.sacred_treasures){
 const published=originalGallery.items.find(x=>x.subject_relic_id===treasure.id&&x.place_id===nd.place_id);
 assert.equal(Boolean(treasure.image),Boolean(published),
  "Research-only/unacquired photographs must remain invisible");
}

for(const candidate of manifest.photos){
 const old=originalGallery.items[0];
 // In-memory metadata fixture only: never save/reuse an unrelated asset
 // as a real object photo. This checks the owner joining and HTML escaping.
 const fake={...old,media_id:candidate.media_id+"-fixture",place_id:candidate.place_id,
  chapter_id:"sacred_treasures",subject_relic_id:candidate.relic_id,
  depicts_kind:candidate.subject_kind,photographed_at:candidate.photographed_at,
  caption_en:candidate.caption_en,caption_fr:candidate.caption_fr,
  label_en:candidate.label_en,label_fr:candidate.label_fr};
 const withPhoto={...data,media:{...data.media,gallery:[
   ...originalGallery.items.filter(x=>x.media_id!==candidate.media_id),fake]}};
 const selected=buildExplorePlaceProfiles(withPhoto,projectExploreDataset(withPhoto))
   .find(x=>x.place_id===candidate.place_id);
 const owner=selected.sacred_treasures.find(x=>x.id===candidate.relic_id);
 assert.ok(owner.image,"Exact subject should be associated with its own Place");
 assert.equal(owner.image.media_id,fake.media_id);
 const html=renderPlaceSacredTreasures(selected);
 assert.ok(html.includes("aoExploreTreasurePhoto"));
 assert.ok(html.includes('data-sacred-object-photo="'+fake.media_id+'"'));
 assert.ok(html.includes(candidate.caption_en.slice(0,18)),"English editorial caption must be shown and HTML-escaped");
 assert.ok(html.includes("Original photograph"));
 assert.ok(html.includes("Licence"));
 assert.ok(html.includes("object-fit:contain")===false,"Crop rules belong in CSS, not inline styles");
 const french=renderPlaceSacredTreasures(selected,"fr");
 assert.ok(french.includes(candidate.caption_fr.slice(0,18)),"French editorial caption must be shown and HTML-escaped");
 assert.ok(french.includes("Photographie originale"));
 const unrelated=buildExplorePlaceProfiles(withPhoto,projectExploreDataset(withPhoto))
   .find(x=>x.place_id==="place:FR:chartres-notre-dame");
 assert.ok(!unrelated.sacred_treasures.some(x=>x.image?.media_id===fake.media_id),
  "No image subject may leak to another Place");
 const invalid={...fake,subject_relic_id:"relic:ZZ:does-not-exist"};
 assert.ok(!buildExplorePlaceProfiles({...withPhoto,media:{approved:[],gallery:[...originalGallery.items,invalid]}},
    projectExploreDataset(withPhoto))
   .find(x=>x.place_id===candidate.place_id).sacred_treasures
   .some(x=>x.image?.media_id===candidate.media_id),
   "Unknown relic ID must not be substituted by caption similarity");
}
const notreGallery=resolveApprovedPlaceGallery(originalGallery.items,"place:FR:notre-dame-paris");
assert.ok(notreGallery.every(x=>x.source_url.startsWith("https://commons.wikimedia.org/wiki/File:")));

console.log("P68 PASS: 3 exact, licensed research selections, zero premature public assets; object-Place scoped bilingual photo binding");
