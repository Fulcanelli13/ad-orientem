import {LIVE} from "./helpers/sacred-places-live-baseline.mjs";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditPlaceGeo} from "../src/find/geography-contracts.js";
import {assertShrinesPilgrimagesRegistry} from "../src/find/shrines-contracts.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExplorePlaceProfiles,explorePlaceProfile} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(p,"utf8"));
const geo=read("data/geography/seed-registry.v1.json"),seed=read("data/shrines/shrines-pilgrimages-seed.v1.json"),
 sources=read("data/shrines/source-registry.v1.json"),guideData=read("data/shrines/illustrated-place-guides-ireland.v1.json"),
 media=read("data/geography/approved-place-media.v1.json"),featured=read("data/geography/major-places-editorial.v1.json");
assert.deepEqual([geo.places.length,seed.shrines.length,seed.pilgrimages.length,sources.sources.length],[LIVE.places,257,240,LIVE.sources]);
assert.equal(seed.routes.length,20);assert.equal(seed.temporalLinks.length,77);
assert.equal(featured.items.length,20);assert.equal(media.items.length,31,"New photos extend the original published set");
assert.equal(assertShrinesPilgrimagesRegistry({shrines:seed.shrines,pilgrimages:seed.pilgrimages,routes:seed.routes,
 temporalLinks:seed.temporalLinks,sources:sources.sources,places:geo.places}).pass,true);
assert.equal(guideData.guides.length,5);
assert.equal(guideData.candidates.length,3);
const recordSet=[
 {key:"croagh",id:"place:IE:croagh-patrick-murrisk-pilgrimage-base",lat:53.77811,lng:-9.639078,kind:"complex_anchor",
 source:"https://www.sportireland.ie/outdoors/walking/trails/murrisk-loop"},
 {key:"oliver",id:"place:IE:st-peters-oliver-plunkett-drogheda",lat:53.7149,lng:-6.35242,kind:"site",
 source:"https://www.discoverboynevalley.ie/boyne-valley-drive/heritage-sites/st-peters-church-drogheda"},
 {key:"brigid",id:"place:IE:solas-bhride-kildare",lat:53.14821,lng:-6.90623,kind:"site",
 source:"https://www.openstreetmap.org/node/4571427638"}
];
const ids=new Set();
for(const entry of recordSet){
 const p=geo.places.find(x=>x.place_id===entry.id);assert.ok(p,entry.id);
 assert.ok(!ids.has(p.place_id));ids.add(p.place_id);
 assert.equal(p.geo.lat,entry.lat);assert.equal(p.geo.lng,entry.lng);assert.equal(p.geo.precision,entry.kind);
 assert.equal(p.geo.source_url,entry.source);assert.equal(p.address.country_code,"IE");
 assert.deepEqual(auditPlaceGeo(p.geo,{countryCode:"IE"}),[]);
 const shrine=seed.shrines.filter(s=>s.place_id===entry.id);assert.equal(shrine.length,1);
 const pilgrimage=seed.pilgrimages.filter(x=>x.destination_shrine_id===shrine[0].shrine_id);assert.equal(pilgrimage.length,1);
 assert.ok(shrine[0].origin_summary.length>150&&shrine[0].origin_summary_fr.length>150);
 assert.ok(pilgrimage[0].scope_note.length>140&&pilgrimage[0].scope_note_fr.length>140);
 for(const id of new Set([...p.source_ids,...shrine[0].source_ids,...pilgrimage[0].source_ids])){
  const rec=sources.sources.find(s=>s.id===id);assert.ok(rec&&rec.url.startsWith("https://"),"Source "+id+" missing");
 }
}
assert.equal(geo.places.find(p=>p.place_id===recordSet[0].id).geo.indicative_only,true);
assert.ok(geo.places.find(p=>p.place_id===recordSet[0].id).geo.reference_point_name.includes("NOT the summit"));
const solas=seed.shrines.find(s=>s.place_id===recordSet[2].id);
assert.match(solas.origin_summary,/Church of Ireland/);
assert.match(solas.origin_summary_fr,/Église d'Irlande/);
assert.equal(solas.recognition_class,"OTHER_OFFICIAL");
const church=seed.shrines.find(s=>s.place_id===recordSet[1].id);
assert.equal(church.recognition_class,"OFFICIAL_SANCTUARY");
assert.equal(seed.temporalLinks.some(x=>recordSet.some(y=>x.subject_id?.includes(y.id))),false);
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geo.places,geoAreas:geo.geoAreas,directoryPlaceLinks:geo.directoryPlaceLinks},
 shrines:{shrines:seed.shrines,pilgrimages:seed.pilgrimages,routes:seed.routes,temporalLinks:seed.temporalLinks,sources:sources.sources},
 sacredPhenomena:{apparitions:[],relics:[]},customs:{customs:[],attestations:[],sources:[]},
 novenas:{records:[],links:[],sources:[]},
 editorial:{featured:featured.items,placeGuides:guideData.guides},
 media:{approved:media.items}
};
const projection=projectExploreDataset(dataset),features=exploreMapFeatures(projection.byLens.shrines);
assert.equal(features.length,257,"Exactly one pin per shrine physical Place");
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-11"});
assert.equal(profiles.length,LIVE.places);
assert.equal(profiles.filter(p=>p.illustrated_guide).length,5);
for(const row of recordSet){
 const profile=explorePlaceProfile(profiles,row.id);
 assert.ok(profile.map_publishable);assert.equal(profile.illustrated_guide.place_id,row.id);
 if(row.key==="brigid"){
  assert.equal(profile.media,null,"The real Solas Bríde Centre still lacks an exact licensed image");
 }else{
  assert.equal(profile.media?.asset_path,"assets/approved/place-media/"+row.id.replace("place:","").replaceAll(":","-")+".webp",
   "Only the exact, reviewed Irish shrine photograph should appear");
 }
 assert.ok(profile.story_chapters.some(x=>x.kind==="ORIGIN"));
 assert.ok(profile.story_chapters.some(x=>x.kind==="PILGRIMAGE"));
 const projected=projection.byLens.shrines.find(item=>item.place_id===row.id);
 assert.ok(projected,"Canonical shrine projection missing "+row.id);
 assert.equal(features.filter(x=>x.properties.item_id===projected.item_id).length,1,"Duplicate or absent pin "+row.id);
 for(const language of ["en","fr"]){
  const html=renderExploreToString(buildExploreViewModel({
   language,lens:"heritage",view:"map",items:projection.byLens.shrines,
   filters:{heritageCategories:["shrines","pilgrimages","apparitions","relics","traditions"]},
   placeProfiles:profiles,selectedPlaceId:row.id,expandPlace:true
  }));
  for(const marker of ["aoExploreIllustratedGuide","aoExploreGuideSection","aoExploreGuideStops",
    "aoExploreGuideTimeline","aoExploreGuideDate",'data-explore-place-jump="guide"',"aoExploreStoryEvidence"]){
   assert.ok(html.includes(marker),row.key+" "+language+" missing "+marker);
  }
  assert.ok(html.includes(profile.illustrated_guide.official_url));
 }
}
const date=guideData.guides.find(g=>g.place_id===recordSet[0].id).programmes.find(p=>p.id==="reek-sunday-2026");
assert.equal(date.start_date,"2026-07-26");
assert.match(date.details_en,/not independently confirmed Mass/);
const kildare=guideData.guides.find(g=>g.place_id===recordSet[2].id);
assert.ok(kildare.stops.some(x=>x.name_en.includes("Church of Ireland")));
assert.ok(!kildare.gallery.length);
assert.equal(guideData.candidates.filter(x=>x.state==="PUBLISHED_R65").length,2);
assert.equal(guideData.candidates.filter(x=>x.state==="PARTIAL_PUBLICATION_R65").length,1);
console.log("PASS Explore R65: all five Irish guides, three physical Places, no conflated Kildare cathedral, sources, 2026 dates and image rights held");
