import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {projectSaintPlaceItems} from "../src/find/saints-lens.js";
import {projectExploreDataset} from "../src/find/explore-projection.js";
import {exploreMapFeatures} from "../src/find/map-runtime.js";
import {buildExploreViewModel,renderExploreToString} from "../src/find/explore-presentation.js";
import {renderHeritageToString} from "../src/find/heritage-presentation.js";

const read=path=>JSON.parse(readFileSync(new URL("../"+path,import.meta.url),"utf8"));
const saints=read("data/saints/holiness-first-editorial-pilot-20261015.v1.json");
const saintsCalendarBridge=read("data/saints/parallel-owner-identity-bridge-20261015.v1.json");
const geo=read("data/geography/seed-registry.v1.json");
const shrine=read("data/shrines/shrines-pilgrimages-seed.v1.json");
const dataset={
  saints,
  saintsCalendarBridge,
  geography:{places:geo.places,geoAreas:geo.geoAreas||[],placeRelationships:[]},
  shrines:{shrines:shrine.shrines,pilgrimages:[],routes:[],temporalLinks:[],sources:[]},
  directory:{records:[],communities:[]},
  customs:{customs:[],attestations:[],sources:[]},
  sacredPhenomena:{apparitions:[],relics:[]},
  novenas:{links:[],records:[],sources:[]}
};
const heritageHome=renderHeritageToString({language:"en",items:[],filters:{heritageCategories:["shrines","relics","pilgrimages","apparitions","traditions"]}}, {placeSheet:()=>"",detailSheet:()=>"",itemPreview:()=>""});
assert(heritageHome.includes('data-find-filter-value="saints"'),"Saints map must be visibly accessible from the existing Heritage map");
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
assert(items.every(x=>x.saints.every(s=>s.life?.birth?.date&&s.life?.death?.date&&s.life?.celebration?.month_day)),
  "Every six-profile pilot biography should show provenance-bound dates and scoped celebration");
const distinct=new Map(items.flatMap(i=>i.saints).map(p=>[p.saint_id,p]));
assert.equal(distinct.size,6,"The person taxonomy is identity-owned, not duplicated per shrine");
assert.equal(distinct.get("saint:therese-of-lisieux").calendar_context?.observed1962?.civilDate,"2026-10-03");
assert.equal(distinct.get("saint:therese-of-lisieux").calendar_context?.observed1962?.principalSourceId,"sancti:10-03:3:w");
assert.equal(distinct.get("saint:claude-la-colombiere").calendar_context?.observed1962,null,"Canonization date is not 1962 feast");
assert.equal(distinct.get("blessed:jacques-desire-laval").calendar_context,null,"Do not conflate different Laval saints");
assert.equal([...distinct.values()].filter(x=>x.calendar_context?.observed1962).length,1,"Only one actually observed 2026 principal day is cross-certified");
const canonicalHonours=[...distinct.values()].flatMap(p=>p.classification.honours);
assert.deepEqual(canonicalHonours.map(h=>h.code),["DOCTOR_OF_CHURCH"],"Only formally declared Doctor of Church is classified as such");
assert.equal(distinct.get("saint:therese-of-lisieux").classification.honours[0].en,"Doctor of the Church");
assert.equal([...distinct.values()].reduce((n,p)=>n+p.classification.roles.length,0),16);
assert(distinct.get("saint:peter-chanel").classification.roles.some(x=>x.code==="MARTYR"));
assert(!distinct.get("saint:bernadette-soubirous").classification.roles.some(x=>x.code==="MARTYR"));
const extraordinary=[...distinct.values()].flatMap(x=>x.classification.extraordinary);
assert.equal(extraordinary.length,2,"Only two verified private-experience accounts; never invent personal miracles");
assert(new Set(extraordinary.map(e=>e.kind)).has("MARIAN_APPARITION_ACCOUNT"));
assert(new Set(extraordinary.map(e=>e.kind)).has("CHRIST_APPARITION_ACCOUNT"));
assert(!extraordinary.some(e=>/STIGMATA|MIRACULOUS_HEALING|OTHER_MIRACLE/.test(e.kind)),
 "No verified stigmata or personally performed cures in current six-profile source set");
assert([...distinct.values()].every(p=>p.classification.extraordinary.every(e=>e.source_ids.length>0)));
assert(distinct.get("blessed:jacques-desire-laval").classification.roles.some(r=>r.code==="MISSIONARY"));
assert(!distinct.get("blessed:jacques-desire-laval").classification.extraordinary.length);
const bern=distinct.get("saint:bernadette-soubirous");
assert(bern.classification.extraordinary[0].en.includes("not a claim that Bernadette herself performed the cures"));
assert(bern.sources.some(s=>s.id==="BERN_2007"));
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
  assert(html.includes("aoSaintLife"),"Holiness-first biography must be continuous, not a bullet list");
  assert(html.includes("aoSaintLifeEvents"),"Birth and death must be visible beside the reserved portrait");
  assert(html.includes("aoSaintFeasts"),"Celebration dates must be source-scoped and visible");
  assert(html.includes('data-saint-category="MYSTIC"'),"Descriptive spiritual categories missing from bilingual biography");
  assert(html.includes("aoSaintWitness"),"Source-attributed extraordinary testimony should appear in the narrative, without a redundant drawer");
  assert(!html.includes("aoSaintExtraordinary"),"Do not split the biography into repetitive topic sections");
  assert(html.includes('data-saint-event="event:margaret-mary:paray-sacred-heart"'));

  assert(html.includes("aoSaintReading"),"Further reading should remain folded");
  assert(html.includes("Portrait awaiting approval")||html.includes("Portrait en attente"));
  assert(!html.includes("<img"),"No borrowed sacred art/saint imagery in editorial pilot");
  assert(!html.includes("2026-10-15T"),"Do not manufacture feast dates");
}
const search=items.filter(x=>x.search_text.includes("lisieux"));
assert(items.some(x=>x.search_text.includes("thérèse")&&x.search_text.includes("therese")),"Search must support French accents and their ASCII equivalents");
assert.equal(search.length,2,"A saint with two shrine sites appears at two locations, not as two identities");

for(const language of ["en","fr"]){
 const lisieux=items.find(x=>x.place_id==="place:FR:carmel-lisieux");
 assert(lisieux,"Verified Lisieux Carmel must exist");
 const vm=buildExploreViewModel({language,lens:"saints",items,view:"map",filters:{query:""},
    selectedId:lisieux.item_id,placeProfiles:[]});
 const html=renderExploreToString(vm);
 assert(html.includes("aoSaintCalendarContext"),"Exact observed Calendar context missing from Saints sheet");
 assert(html.includes(language==="fr"?"3 octobre 2026":"3 October 2026"));
 assert(html.includes(language==="fr"?"Observé dans le calendrier de 1962":"Observed in the 1962-calendar cycle"));
 assert(html.includes(language==="fr"?"non d’une date de fête valable pour toute année":"not a timeless feast date"));
 assert(!html.includes("data-calendar-mass"),"No new Mass selection action");
}
const noBridge=projectSaintPlaceItems({...dataset,saintsCalendarBridge:null});
assert(noBridge.every(p=>p.saints.every(s=>s.calendar_context===null)),"No context without owner bridge");

const noSites=projectSaintPlaceItems({...dataset,shrines:{shrines:[]}});
assert.equal(noSites.length,0,"Cannot publish person pin without corresponding source shrine edge");
const noPilot=projectSaintPlaceItems({...dataset,saints:{...saints,publication:"PUBLISHED"}});
assert.equal(noPilot.length,0,"A wrong production/content publication state must fail closed");
console.log("PASS: native Saints lens, bilingual holiness-first sheets, 9 unique Places/8 pins, Paray one-pin/two-saints, Russell geo hold");
