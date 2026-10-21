import assert from "node:assert/strict";
import {test} from "node:test";
import {buildAtlasCoverage,atlasCoverageFeatures,enrichAtlasCountryFeatures,
  renderAtlasCoveragePanel,NATURAL_EARTH_COUNTRIES_URL} from "../src/find/mapcn-atlas-coverage.js";
import {attachAtlasCoverageLayers} from "../src/find/mapcn-atlas-controller.js";
const areas=[
 {geo_area_id:"FR",area_type:"country",codes:{iso_alpha2:"FR"},name:{official:"France"}},
 {geo_area_id:"MU",area_type:"country",codes:{iso_alpha2:"MU"},name:{official:"Mauritius"}}
];
const places=[{place_id:"chapel",geo_area_ids:["FR"]},{place_id:"shrine",geo_area_ids:["MU"]}];
const base=(place_id,lat,lng)=>({item_id:place_id,place_id,map_publishable:true,
  title:place_id,geo:{lat,lng,precision:"site"},search_text:place_id});
const projection={byLens:{
 shrines:[base("shrine",-20,57)],
 relics:[base("shrine",-20,57)], // one physical canonical site, not two heat points
 pilgrimages:[],apparitions:[],traditions:[],
 tlm:[
  {...base("chapel",48,2),source_id:"linked-mass",lens:"tlm",
    raw:{venue:{venue_id:"linked-mass",address:{country_code:"FR"}}}},
  {item_id:"mass-different",source_id:"mass-different",map_publishable:true,lens:"tlm",
    title:"Another chapel",geo:{lat:47,lng:1},raw:{venue:{venue_id:"mass-different",address:{country_code:"FR"}}}},
  {item_id:"without-country",source_id:"without-country",map_publishable:true,lens:"tlm",
    title:"Unassigned",geo:{lat:30,lng:-40},raw:{venue:{venue_id:"without-country",address:{country_code:"XX"}}}},
  {item_id:"not-published",source_id:"not-published",map_publishable:false,lens:"tlm",
    geo:{lat:50,lng:1},raw:{venue:{venue_id:"not-published",address:{country_code:"FR"}}}},
 ]}};
const dataset={geography:{geoAreas:areas,places}};
test("P4 strictly counts published coordinates and deduplicates one canonical physical place",()=>{
 const all=buildAtlasCoverage(dataset,projection);
 assert.equal(all.total,4);
 assert.equal(all.mappedCountries,3);
 assert.equal(all.unknownCountry,1);
 assert.deepEqual(all.countries.map(c=>[c.code,c.count]),[["FR",2],["MU",1]]);
 assert.deepEqual(all.types,{heritage:1,tlm:3});
 assert.equal(atlasCoverageFeatures(all).features.length,4);
 assert.equal(buildAtlasCoverage(dataset,projection,{scope:"heritage"}).total,1);
 assert.equal(buildAtlasCoverage(dataset,projection,{scope:"tlm"}).total,3);
 assert.throws(()=>buildAtlasCoverage(dataset,projection,{scope:"invented"}));
});
test("Natural Earth property matching never geocodes a point or guesses geopolitical assignment",()=>{
 const world={type:"FeatureCollection",features:[
  {type:"Feature",properties:{ISO_A2_EH:"FR",NAME_LONG:"France"},
   geometry:{type:"Polygon",coordinates:[[[1,46],[3,46],[3,49],[1,49],[1,46]]]}},
  {type:"Feature",properties:{ISO_A2_EH:"ZZ",NAME_LONG:"Unknown Land"},
   geometry:{type:"Polygon",coordinates:[[[4,5],[6,5],[6,8],[4,5]]]}},
 ]};
 const result=enrichAtlasCountryFeatures(world,buildAtlasCoverage(dataset,projection));
 assert.equal(result.features[0].properties.aoCount,2);
 assert.equal(result.features[0].properties.aoCountryCode,"FR");
 assert.equal(result.features[1].properties.aoCount,0);
 assert.equal(result.features[1].properties.aoCountryCode,"");
 assert.equal(NATURAL_EARTH_COUNTRIES_URL.startsWith("https://"),true);
 assert.throws(()=>enrichAtlasCountryFeatures({features:[]},buildAtlasCoverage(dataset,projection)));
});
test("P4's bilingual panel retains source, provenance and scope controls",()=>{
 const model=buildAtlasCoverage(dataset,projection);
 const en=renderAtlasCoveragePanel({coverage:model,mode:"countries"});
 assert.match(en,/Country coverage/);
 assert.match(en,/Natural Earth/);
 assert.match(en,/data-atlas-scope="tlm"/);
 assert.match(en,/data-atlas-country="FR"/);
 assert.match(en,/does not infer|not no Catholic life|not no Catholic life/i);
 const fr=renderAtlasCoveragePanel({coverage:model,mode:"heatmap",language:"fr"});
 assert.match(fr,/Densité documentée/);
 assert.match(fr,/population catholique/);
 assert.doesNotMatch(fr,/open-now|NEXT MASS|population estimate/i);
});
test("Controller toggles real source-backed MapLibre layers and restores original map pins",async()=>{
 const layers=new Map([["ao-explore-cluster-halo",{id:"ao-explore-cluster-halo"}],
   ["ao-explore-points",{id:"ao-explore-points"}]]);
 const sources=new Map(),layout=new Map(),handlers=new Map(),fitted=[];
 const map={on:(kind,key,callback)=>{handlers.set(kind+":"+String(key),callback)},
  isStyleLoaded:()=>true,getLayer:id=>layers.get(id),
  addLayer:layer=>layers.set(layer.id,layer),
  addSource:(id,obj)=>sources.set(id,{...obj,setData:data=>{sources.get(id).data=data}}),
  getSource:id=>sources.get(id),
  setLayoutProperty:(id,key,value)=>layout.set(id+":"+key,value),
  fitBounds:(bounds,opts)=>fitted.push({bounds,opts})
 };
 const win={document:{querySelector:()=>({textContent:""})},
  fetch:async()=>({ok:true,json:async()=>({type:"FeatureCollection",features:[{
   type:"Feature",properties:{ISO_A2_EH:"FR",NAME_LONG:"France"},
   geometry:{type:"Polygon",coordinates:[[[1,46],[3,46],[3,49],[1,49],[1,46]]]}}]})}),
  console:{warn:()=>{}},matchMedia:()=>({matches:true})};
 const coverage=buildAtlasCoverage(dataset,projection),controller=attachAtlasCoverageLayers(map,{win,coverage});
 assert.ok(controller.status().ready);
 assert.ok(layers.has("ao-atlas-heat"));
 assert.equal(controller.setMode("heatmap",coverage),true);
 assert.equal(layout.get("ao-atlas-heat:visibility"),"visible");
 assert.equal(layout.get("ao-explore-points:visibility"),"none");
 controller.setMode("countries",coverage);
 // Async boundary lookup is intentional; the base map is not recreated.
 for(let i=0;i<10&&!controller.status().countryReady;i++)await new Promise(resolve=>setTimeout(resolve,0));
 assert.ok(controller.status().countryReady);
 assert.equal(layout.get("ao-atlas-fill:visibility"),"visible");
 assert.equal(controller.focusCountry("FR"),true);
 assert.equal(fitted.length,1);
 controller.setMode("places",coverage);
 assert.equal(layout.get("ao-explore-points:visibility"),"visible");
 assert.equal(layout.get("ao-atlas-fill:visibility"),"none");
 assert.equal(layout.get("ao-atlas-heat:visibility"),"none");
 assert.equal(sources.get("ao-atlas-points").data.features.length,4);
 controller.destroy();
});
