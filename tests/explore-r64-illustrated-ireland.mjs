import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles,explorePlaceProfile} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const guides=read("data/shrines/illustrated-place-guides-ireland.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const s=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sr=read("data/shrines/source-registry.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const featured=read("data/geography/major-places-editorial.v1.json");
assert.equal(guides.schema,"AO_ILLUSTRATED_PLACE_GUIDES_V1");
assert.ok(guides.guides.length>=2);
assert.equal(guides.candidates.length,3);
assert.ok(s.shrines.length>=216);
assert.ok(s.pilgrimages.length>=206);
assert.ok(geo.places.length>=220);
assert.equal(featured.items.length,20);
assert.equal(media.items.length,32,"Historical source-verified site photos plus St Alphonsus exact Directory cover; Ireland guide cohort unchanged");
assert.ok(EXPLORE_DATA_URLS.illustratedPlaceGuides.endsWith("/data/shrines/illustrated-place-guides-ireland.v1.json"));
const ids=new Set(["place:IE:knock-shrine","place:IE:lough-derg-station-island"]);
let count=0;
for(const guide of guides.guides){
 if(ids.has(guide.place_id))count++;
 assert.equal(guide.publication,"PUBLISHED");
 assert.ok(guide.official_url.startsWith("https://"));
 assert.equal(guide.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.deepEqual(guide.gallery,[]);
 assert.ok(guide.sections.length>=3&&guide.stops.length>=3&&guide.chronology.length>=3&&guide.programmes.length>=2);
 for(const section of guide.sections){
  assert.ok(section.title_en&&section.title_fr);
  for(const row of section.paragraphs){
   assert.ok(row.en.length>90&&row.fr.length>90);
   assert.notEqual(row.en,row.fr);
   assert.ok(row.source_url.startsWith("https://"));
  }
 }
 for(const row of [...guide.stops,...guide.chronology,...guide.programmes]){
  assert.ok(row.source_url.startsWith("https://"));
 }
 assert.ok(guide.visit.source_url.startsWith("https://"));
}
assert.ok(count>=2);
const selected=guides.guides.find(g=>g.place_id==="place:IE:lough-derg-station-island").programmes.find(p=>p.id==="day-retreats-2026");
assert.equal(selected.year,2026);
assert.ok(!selected.start_date&&!selected.end_date,"Do not invent continuous selected-day event window");
for(const hold of guides.candidates){
 assert.ok(["SOURCE_REVIEW_COMPLETE_MAP_PUBLICATION_HOLD","PUBLISHED_R65","PARTIAL_PUBLICATION_R65"].includes(hold.state));
 assert.ok(hold.evidence.length>=2&&hold.evidence.every(x=>x.startsWith("https://")));
 assert.ok(hold.hold_reason.length>55);
}
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:s.shrines,pilgrimages:s.pilgrimages,routes:s.routes,temporalLinks:s.temporalLinks,sources:sr.sources},
 customs:{customs:[],attestations:[],sources:[]},
 sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:featured.items,placeGuides:guides.guides},
 media:{approved:media.items}
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-11"});
assert.equal(profiles.length,geo.places.length);
assert.equal(profiles.filter(p=>p.illustrated_guide).length,guides.guides.length);
for(const id of ids){
 const profile=explorePlaceProfile(profiles,id);
 assert.equal(profile.illustrated_guide.place_id,id);
 assert.ok(profile.story_chapters.length>=2,"Original canonical prose remains");
 for(const language of ["en","fr"]){
  const html=renderExploreToString(buildExploreViewModel({
   language,lens:"heritage",view:"map",items:projection.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:id,expandPlace:true
  }));
  for(const marker of ["aoExploreIllustratedGuide","aoExploreGuideTimeline","aoExploreGuideStops","aoExploreGuideDate",
   "aoExplorePlaceChapters","aoExploreStoryEvidence",'data-explore-place-jump="guide"','data-explore-place-chapter="guide"']){
   assert.ok(html.includes(marker),marker+" missing "+id+" "+language);
  }
  assert.ok(html.includes("2026"));
  assert.ok(html.includes(profile.illustrated_guide.official_url));
 }
}
assert.ok(explorePlaceProfile(profiles,"place:IE:knock-shrine").media,"Knock retains licensed photo");
assert.equal(explorePlaceProfile(profiles,"place:IE:lough-derg-station-island").media?.asset_path,
 "assets/approved/place-media/IE-lough-derg-station-island.webp",
 "Lough Derg now has a reviewed photo of the correct Station Island basilica");
assert.ok(profiles.filter(p=>!guides.guides.some(g=>g.place_id===p.place_id)).every(p=>p.illustrated_guide===null));
assert.ok(!JSON.stringify(guides.guides).includes("destinationes.com"),"No copying third-party guide text");
console.log("PASS R64: two bilingual guides, 3 research holds, source-linked timelines/dates and approved-photo guard");
