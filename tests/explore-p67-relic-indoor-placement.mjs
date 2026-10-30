import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {execFileSync} from "node:child_process";
import {resolveRelicIndoorPlacement} from "../src/find/relic-indoor-location.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {buildExplorePlaceProfiles} from "../src/find/place-profiles.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const placement=read("data/explore/relic-indoor-placement.v1.json");
const phenomena=read("data/explore/sacred-phenomena-seed.v1.json");
const geography=read("data/geography/seed-registry.v1.json");
const shrines=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const customs=read("data/customs/customs-atlas-seed.v1.json");
const guides=[
 "france","france-r67","ireland","world-marian-r1","global-saints-r1","global-marian-b2"
].flatMap(id=>read("data/shrines/illustrated-place-guides-"+id+".v1.json").guides);
const refs=read("data/shrines/source-registry.v1.json");
const byId=new Map(phenomena.relics.map(x=>[x.id,x]));
assert.equal(phenomena.relics.length,123);
assert.equal(placement.entries.length,25);
assert.equal(new Set(placement.entries.map(x=>x.relic_id)).size,25);
assert.equal(new Set(placement.entries.map(x=>x.place_id)).size,10);
for(const r of placement.entries){
 const canonical=byId.get(r.relic_id);
 assert.ok(canonical,"Cannot create new relic object "+r.relic_id);
 assert.equal(canonical.place_id,r.place_id,"Indoor site must inherit exact original Place");
 assert.equal(canonical.authentication,"NOT_INDEPENDENTLY_CERTIFIED_BY_APP");
 const entry=resolveRelicIndoorPlacement(placement,r.relic_id,r.place_id);
 assert.ok(entry,"Unpublished or invalid room "+r.relic_id);
 assert.equal(entry.source_url,r.source_url);
 assert.equal(entry.qualification,"SOURCE_DESCRIBED_POSITION_NO_INDOOR_NAVIGATION");
 assert.equal(resolveRelicIndoorPlacement(placement,r.relic_id,"place:FR:notre-dame-paris"),r.place_id==="place:FR:notre-dame-paris"?entry:null,
  "Never leak room from a different Place");
}
assert.equal(resolveRelicIndoorPlacement(placement,"relic:FR:crown-of-thorns-paris","place:FR:notre-dame-paris"),null,
 "Custody at Notre-Dame is not documented precise indoor placement");
assert.equal(resolveRelicIndoorPlacement({ ...placement,entries:[
 placement.entries[0],placement.entries[0],
]},placement.entries[0].relic_id,placement.entries[0].place_id),null,"Reject duplicate interior identities");
assert.equal(resolveRelicIndoorPlacement({ ...placement,status:"RESEARCH_ONLY" },
 placement.entries[0].relic_id,placement.entries[0].place_id),null,"Research location must never publish");
assert.equal(resolveRelicIndoorPlacement({ ...placement,entries:[
 {...placement.entries[0],location_en:"<script>alert(1)</script>",source_url:"javascript:alert(1)"}
]},placement.entries[0].relic_id,placement.entries[0].place_id),null,"No insecure sources");
const dataset={
 directory:{records:[],communities:[]},
 geography:{places:geography.places,geoAreas:geography.geoAreas,directoryPlaceLinks:geography.directoryPlaceLinks},
 shrines:{shrines:shrines.shrines,pilgrimages:shrines.pilgrimages,
   routes:shrines.routes,temporalLinks:shrines.temporalLinks,sources:refs.sources},
 customs:{customs:customs.customs,attestations:customs.attestations,sources:[]},
 sacredPhenomena:{relics:phenomena.relics,apparitions:phenomena.apparitions,indoorPlacement:placement},
 saints:read("data/saints/holiness-first-editorial-pilot-20261015.v1.json"),
 editorial:{featured:[],placeGuides:guides},
 media:{approved:read("data/geography/approved-place-media.v1.json").items,
   gallery:read("data/geography/approved-place-gallery.v1.json").items},
 novenas:{records:[],links:[],sources:[]},
};
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-29"});
const profile=id=>profiles.find(x=>x.place_id===id);
const render=(id,language="en")=>renderExploreToString(buildExploreViewModel({
  language,lens:"heritage",view:"map",items:projection.byLens.shrines,
  filters:{heritageCategories:[]},selectedPlaceId:id,
  placeProfiles:profiles,expandPlace:true,
}));
const rome=render("place:IT:santa-croce-gerusalemme-rome");
assert.ok(rome.includes("Chapel of the Relics"),"Room needs to be visible to pilgrim");
assert.equal((rome.match(/data-relic-placement=/g)||[]).length,7);
assert.ok(rome.includes("16 April 2026"));
assert.ok(rome.includes("Check for reopening"));
assert.ok(rome.includes("Closure notice"));
const romeFr=render("place:IT:santa-croce-gerusalemme-rome","fr");
assert.ok(romeFr.includes("Chapelle des Reliques"));
assert.ok(romeFr.includes("Vérifiez sa réouverture"));
const francis=render("place:IT:basilica-san-francesco-assisi");
assert.ok(francis.includes("Lower Church"));
assert.ok(francis.includes("niches")||francis.includes("Niches"));
const fatima=render("place:PT:fatima-sanctuary");
assert.ok(fatima.includes("Left transept chapel"));
assert.ok(fatima.includes("Right transept chapel"));
const seton=render("place:US:seton-emmitsburg");
assert.ok(seton.includes("Altar of Relics"));
assert.ok(!seton.includes("Check for reopening"));
const notre=render("place:FR:notre-dame-paris");
assert.ok(notre.includes("Crown of Thorns"));
assert.ok(!notre.includes("aoExploreIndoorPosition"));
const carnet=profile("place:FR:carmel-lisieux");
assert.ok(!carnet.sacred_treasures.some(x=>x.inside_location),
  "Do not invent chapel details if no placement metadata is approved");
const packet=JSON.parse(execFileSync(process.execPath,[
 new URL("../tools/audit-relic-indoor-placement-p67.mjs",import.meta.url).pathname
],{encoding:"utf8"}));
assert.deepEqual([packet.relic_records,packet.physical_places_with_relics,
 packet.source_attributed_indoor_placements,packet.places_with_indoor_positions,
 packet.site_only_relics,packet.new_physical_pins],[123,93,25,10,98,0]);
const missing=execFileSync(process.execPath,[
 new URL("../tools/audit-relic-indoor-placement-p67.mjs",import.meta.url).pathname,"--jsonl"
],{encoding:"utf8"}).trim().split("\n").map(JSON.parse);
assert.equal(missing.length,98);
assert.ok(missing.every(x=>x.publication==="RESEARCH_ONLY_NOT_DISPLAYED"));
assert.ok(missing.some(x=>x.relic_id==="relic:FR:crown-of-thorns-paris"));
console.log("P67 PASS 25 sourced indoor locations, 98 explicit research-only remaining, EN/FR, temporary closure, no cross-site misbinding");
