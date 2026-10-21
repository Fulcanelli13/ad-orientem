import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {EXPLORE_DATA_URLS} from "../src/find/explore-data-service.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=path=>JSON.parse(readFileSync(path,"utf8"));
const r67=read("data/shrines/illustrated-place-guides-france-r67.v1.json");
const r66=read("data/shrines/illustrated-place-guides-france.v1.json");
const ir=read("data/shrines/illustrated-place-guides-ireland.v1.json");
const media=read("data/geography/approved-place-media.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shr=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const sources=read("data/shrines/source-registry.v1.json");
const visual=read("data/geography/research/explore-r67-visual-storyboards.v1.json");
assert.equal(r67.schema,"AO_ILLUSTRATED_PLACE_GUIDES_V1");
assert.equal(r67.guides.length,6);
assert.equal(r66.guides.length,3);
assert.equal(ir.guides.length,5);
assert.equal(visual.items.length,6);
assert.ok(EXPLORE_DATA_URLS.illustratedFrenchR67.endsWith("/data/shrines/illustrated-place-guides-france-r67.v1.json"));
const ids=new Set(),allPar=[];
const approved=new Set(["place:FR:basilique-sainte-therese-lisieux","place:FR:chartres-notre-dame","place:FR:rue-du-bac"]);
for(const guide of r67.guides){
 assert.equal(guide.publication,"PUBLISHED");
 assert.ok(guide.place_id.startsWith("place:FR:"));
 assert.ok(!ids.has(guide.place_id));ids.add(guide.place_id);
 assert.ok(geo.places.some(p=>p.place_id===guide.place_id));
 assert.ok(shr.shrines.some(s=>s.place_id===guide.place_id));
 assert.ok(guide.official_url.startsWith("https://"));
 assert.equal(guide.image_policy,"USE_APPROVED_PLACE_MEDIA_ONLY");
 assert.deepEqual(guide.gallery,[]);
 assert.ok(guide.sections.length>=3&&guide.stops.length>=3&&guide.chronology.length>=4&&guide.programmes.length>=1);
 for(const section of guide.sections){
  assert.ok(section.title_en&&section.title_fr);
  for(const p of section.paragraphs){
   assert.ok(p.en.length>105&&p.fr.length>105,"Narrative paragraphs must be substantive and bilingual");
   assert.notEqual(p.en,p.fr);
   assert.ok(/^https:\/\/\S+$/.test(p.source_url));
   allPar.push(p);
  }
 }
 for(const row of [...guide.stops,...guide.chronology,...guide.programmes])assert.ok(/^https:\/\/\S+$/.test(row.source_url));
 assert.ok(guide.visit.source_url.startsWith("https://"));
 const board=visual.items.find(x=>x.place_id===guide.place_id);
 assert.ok(board&&board.frames.length>=2);
 const hero=board.frames.find(x=>x.status==="EXISTING_APPROVED_HERO");
 assert.equal(Boolean(hero),approved.has(guide.place_id));
 for(const frame of board.frames){
  assert.ok(frame.reference_url.startsWith("https://"));
  assert.ok(["EXISTING_APPROVED_HERO","RIGHTS_REVIEW_PENDING"].includes(frame.status));
 }
}
assert.equal(ids.size,6);
assert.equal(allPar.length,28);
assert.ok(r67.guides.find(g=>g.place_id.endsWith("laghet")).sections.flatMap(s=>s.paragraphs).some(p=>p.qualifier==="NO_APPARITION"));
assert.ok(r67.guides.find(g=>g.place_id.includes("rocamadour")).sections.flatMap(s=>s.paragraphs).some(p=>p.qualifier==="RELIC_IDENTITY_UNCERTAIN"));
const list=[...ir.guides,...r66.guides,...r67.guides];
assert.equal(new Set(list.map(g=>g.place_id)).size,14);
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:shr.shrines,pilgrimages:shr.pilgrimages,routes:shr.routes,temporalLinks:shr.temporalLinks,sources:sources.sources},
 customs:{customs:[],attestations:[],sources:[]},sacredPhenomena:{apparitions:[],relics:[]},
 novenas:{records:[],links:[],sources:[]},editorial:{featured:[],placeGuides:list},
 media:{approved:media.items}
};
const proj=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,proj,{today:"2026-10-11"});
assert.equal(profiles.filter(p=>p.illustrated_guide).length,14);
for(const guide of r67.guides){
 const profile=profiles.find(p=>p.place_id===guide.place_id);
 assert.ok(profile?.illustrated_guide);
 const currentlyApproved=media.items.some(row=>row.place_id===guide.place_id&&row.status==="APPROVED");
 assert.equal(Boolean(profile.media),currentlyApproved,
   "Current folio must render exact approved photo without rewriting historical R67 storyboards");
 for(const lang of ["en","fr"]){
  const html=renderExploreToString(buildExploreViewModel({
   language:lang,lens:"heritage",view:"map",items:proj.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:guide.place_id,expandPlace:true
  }));
  for(const token of ["aoExploreIllustratedGuide","aoExploreGuideTimeline","aoExploreGuideStops","aoExploreStoryEvidence",'data-explore-place-jump="guide"'])
   assert.ok(html.includes(token),token+" missing from "+guide.place_id+" "+lang);
  assert.ok(html.includes(guide.official_url));
  const snippet=guide.sections[0].paragraphs[0][lang].slice(0,65).replace(/[&<>"\']/g,ch=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","\'":"&#039;"}[ch]));
  assert.ok(html.includes(snippet),"Source paragraph not rendered for "+guide.place_id+" / "+lang);
  if(approved.has(guide.place_id))assert.ok(html.includes("aoExplorePlaceMedia"));
  else assert.ok(!html.includes("aoExplorePlaceMedia"),"Unapproved hero was published");
 }
}
console.log("PASS R67: six French guides + 8 pre-existing, 28 bilingual source paragraphs, cited dates/stops, approved-media-only renders");
