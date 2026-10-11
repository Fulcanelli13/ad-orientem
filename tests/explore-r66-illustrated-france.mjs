import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const fr=read("data/shrines/illustrated-place-guides-france.v1.json");
const ir=read("data/shrines/illustrated-place-guides-ireland.v1.json");
const places=read("data/geography/seed-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const approved=read("data/geography/approved-place-media.v1.json");
assert.equal(fr.guides.length,3);
assert.equal(ir.guides.length,5);
assert.ok(EXPLORE_DATA_URLS.illustratedFrenchGuides.endsWith("illustrated-place-guides-france.v1.json"));
const ids=new Set();
for(const g of fr.guides){
 assert.equal(g.publication,"PUBLISHED");
 assert.ok(g.place_id.startsWith("place:FR:")&&!ids.has(g.place_id));ids.add(g.place_id);
 assert.ok(places.places.some(x=>x.place_id===g.place_id));
 assert.ok(approved.items.some(x=>x.place_id===g.place_id&&x.status==="APPROVED"));
 assert.ok(g.sections.length>=3&&g.stops.length>=3&&g.chronology.length>=4&&g.programmes.length>=1);
 assert.deepEqual(g.gallery,[]);
 for(const s of g.sections){
  assert.ok(s.title_en&&s.title_fr);
  for(const p of s.paragraphs){
   assert.ok(p.en.length>70&&p.fr.length>70&&p.en!==p.fr);
   assert.ok(p.source_url.startsWith("https://"));
  }
 }
 for(const x of [...g.stops,...g.chronology,...g.programmes]){
  assert.ok(x.source_url.startsWith("https://"));
 }
 assert.ok(g.visit.source_url.startsWith("https://"));
}
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:places.places,geoAreas:places.geoAreas,directoryPlaceLinks:places.directoryPlaceLinks},
 shrines:{shrines:shrines.shrines,pilgrimages:shrines.pilgrimages,routes:shrines.routes,temporalLinks:shrines.temporalLinks,sources:sources.sources},
 customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:[],placeGuides:[...ir.guides,...fr.guides]},
 media:{approved:approved.items}
};
const proj=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,proj,{today:"2026-10-11"});
assert.equal(profiles.filter(x=>x.illustrated_guide).length,8);
for(const guide of fr.guides){
 const profile=profiles.find(x=>x.place_id===guide.place_id);
 assert.ok(profile?.media);
 for(const lang of ["en","fr"]){
  const html=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"heritage",view:"map",items:proj.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:guide.place_id,expandPlace:true
  }));
  assert.ok(html.includes("aoExploreIllustratedGuide"));
  assert.ok(html.includes("aoExploreGuideTimeline"));
  assert.ok(html.includes("aoExplorePlaceMedia"));
  assert.ok(html.includes(guide.official_url));
  assert.ok(html.includes(guide.sections[0].paragraphs[0][lang].slice(0,30).replace(/&/g,"&amp;")));
 }
}
console.log("PASS R66: France bilingual pilgrimage guide cohort (3), Irish coexistence (5), rights and source anchors.");
