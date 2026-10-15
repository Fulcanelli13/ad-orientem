import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const saints=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shrine=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const dataset={
  saints,
  geography:{places:geo.places,geoAreas:geo.geoAreas||[],placeRelationships:[]},
  shrines:{shrines:shrine.shrines,pilgrimages:[],routes:[],temporalLinks:[],sources:[]},
  directory:{records:[],communities:[]},
  customs:{customs:[],attestations:[],sources:[]},
  sacredPhenomena:{apparitions:[],relics:[]},
  novenas:{links:[],records:[],sources:[]}
};
const items=projectSaintPlaceItems(dataset);
const lens=projectExploreDataset(dataset);
assert.equal(lens.byLens.saints.length,items.length,"Native projection must use Saints Place owner");
assert.equal(items.length,9,"Exact six-profile pilot has 9 unique physical Place identities");
assert.equal(new Set(items.map(x=>x.place_id)).size,items.length,"One site per physical pin");
assert.equal(items.reduce((count,row)=>count+row.saints.length,0),10,"All ten saint/place associations survive");
assert.equal(items.filter(x=>x.map_publishable).length,8);
assert.equal(exploreMapFeatures(items).length,8,"MapLibre feature count must equal publishable source Places");
assert(items.every(x=>x.kind==="SAINTS_AT_PHYSICAL_PLACE"&&x.lens==="saints"));
assert(items.every(x=>x.saints.every(s=>s.name_en&&s.why_en&&s.name_fr&&s.why_fr&&s.biography_facts.length===3)));
assert(items.every(x=>x.saints.every(s=>s.artwork_id===null)),"No art without curated approval");
const paray=items.find(x=>x.place_id==="place:FR:sanctuaire-sacre-coeur-paray");
assert(paray?.map_publishable&&paray.saints.length===2,"Paray is one map marker with both Margaret Mary and Claude");
assert(new Set(paray.saints.map(x=>x.saint_id)).has("saint:margaret-mary-alacoque"));
assert(new Set(paray.saints.map(x=>x.saint_id)).has("saint:claude-la-colombiere"));
const russell=items.find(x=>x.place_id==="place:NZ:st-peter-chanel-russell");
assert(russell&&!russell.map_publishable&&!russell.geo,"Russell school-proximity coordinates must never publish as a shrine pin");
assert.equal(russell.saints[0].saint_id,"saint:peter-chanel");
assert.equal(items.flatMap(x=>x.saints).filter(x=>x.recognition_status==="BEATIFIED_NOT_CANONIZED").length,1);
const mauritius=items.find(x=>x.place_id==="place:MU:pere-laval-sainte-croix");
assert.equal(mauritius?.saints[0]?.saint_id,"blessed:jacques-desire-laval");
const compare=items.map(x=>x.title);
assert.deepEqual([...compare].sort((a,b)=>a.localeCompare(b)),compare,"Deterministic name-sorted items required for stable list/map");
for(const lang of ["en","fr"]){
  const vm=buildExploreViewModel({
    language:lang,lens:"saints",items,view:"map",filters:{query:""},
    selectedId:paray.item_id,placeProfiles:[]
  });
  const html=renderExploreToString(vm);
  assert(html.includes('data-explore-lens="saints"'),"Integrated lens must use native Explore map");
  assert(html.includes("aoSaintPlaceSheet"),"Selection uses first-party Explore sheet");
  assert(html.includes('data-explore-open-place="place:FR:sanctuaire-sacre-coeur-paray"'));
  assert(html.includes(lang==="fr"?"Sainte Marguerite-Marie Alacoque":"Saint Margaret Mary Alacoque"));
  assert(html.includes("aoSaintFacts"),"Meaning-first bullet biographies must render");
  assert(html.includes("aoSaintReading"),"Further reading should remain folded");
  assert(html.includes("Art portrait pending")||html.includes("Portrait en attente"));
  assert(!html.includes("<img"),"No borrowed sacred art/saint imagery in editorial pilot");
  assert(!html.includes("2026-10-15T"),"Do not manufacture feast dates");
}
const search=items.filter(x=>x.search_text.includes("lisieux"));
assert(items.some(x=>x.search_text.includes("thérèse")&&x.search_text.includes("therese")),"Search must support French accents and their ASCII equivalents");
assert.equal(search.length,2,"A saint with two shrine sites appears at two locations, not as two identities");
const noSites=projectSaintPlaceItems({...dataset,shrines:{shrines:[]}});
assert.equal(noSites.length,0,"Cannot publish person pin without corresponding source shrine edge");
const noPilot=projectSaintPlaceItems({...dataset,saints:{...saints,publication:"PUBLISHED"}});
assert.equal(noPilot.length,0,"A wrong production/content publication state must fail closed");
console.log("PASS: native Saints lens, bilingual holiness-first sheets, 9 unique Places/8 pins, Paray one-pin/two-saints, Russell geo hold");
