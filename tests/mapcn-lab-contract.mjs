import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import {resolve} from "node:path";
import {test} from "node:test";
import {makeLabModel,selectedItems,countryCounts,calendarContext,MAPCN_BLOCKS} from "../labs/mapcn-integration/adapter.js";
const root=resolve(fileURLToPath(new URL("..",import.meta.url)));
const mock={geography:{
 geoAreas:[{geo_area_id:"geo:country:FR",area_type:"country",name:{official:"France"},codes:{iso_alpha2:"FR"}}],
 places:[{place_id:"place:FR:approved",geo_area_ids:["geo:country:FR"]}]}};
const projection={byLens:{
 shrines:[{item_id:"shrine:fr",place_id:"place:FR:approved",map_publishable:true,
    lens:"shrines",title:"Documented Marian shrine",subtitle:"France",geo:{lat:43,lng:2,
    precision:"site",source_url:"https://example.org/map"},search_text:"shrine"}],
 relics:[],pilgrimages:[],apparitions:[],traditions:[],
 tlm:[{item_id:"venue:fr",place_id:"venue:fr",lens:"tlm",title:"Documented chapel",subtitle:"France",
    map_publishable:true,geo:{lat:48,lng:2,precision:"locality",approximate:true},
    raw:{venue:{venue_id:"venue:fr",address:{country_code:"FR"}},
     ministries:[{schedules:[{service_type:"MASS",payload:{raw:"Sunday at 10:30 (confirm with parish)"},
       source_ids:["source"],verification:{state:"OFFICIAL_LIVE",checked_at:"2026-10-01"}}]}]},
    sources:[{url:"https://example.org/mass",title:"Official chapel"}]}]
}};
test("Lab owns no synthetic pin or duplicated source and preserves published schedule wording",()=>{
 const model=makeLabModel(mock,projection);
 assert.equal(model.items.length,2);
 const chapel=model.items.find(x=>x.lens==="tlm");
 assert.equal(chapel.scheduleState,"SOURCE_ATTESTED");
 assert.match(chapel.scheduleText,/Sunday at 10:30/);
 assert.equal(chapel.indicative,true);
 assert.equal(chapel.countryCode,"FR");
 assert.equal(chapel.source.url,"https://example.org/mass");
 assert.equal(model.items.find(x=>x.lens==="heritage").placeId,"place:FR:approved");
 assert.equal(countryCounts(model.items).get("FR"),2);
 assert.equal(selectedItems(model,{query:"chapel",scope:"tlm"}).length,1);
 assert.equal(selectedItems(model,{query:"unrelated"}).length,0);
});
test("Schedule provenance never creates a next-Mass timestamp from raw text",()=>{
 const data={...projection,byLens:{...projection.byLens,tlm:[{
   ...projection.byLens.tlm[0],item_id:"venue:raw",
   raw:{...projection.byLens.tlm[0].raw,ministries:[{schedules:[{
     service_type:"MASS",payload:{raw:"Tue 18h, first Friday variable"},
     source_ids:[],verification:{state:"UNKNOWN"}}]}]}
 }]}};
 const m=makeLabModel(mock,data);
 const record=m.items.find(x=>x.lens==="tlm");
 assert.equal(record.scheduleState,"PUBLISHED_UNNORMALIZED");
 assert.ok(!Object.keys(record).some(key=>/nextmass|nexttime|opennow/i.test(key)));
});
test("Indicative and unmapped positions fail closed",()=>{
 const invalid={...projection,byLens:{...projection.byLens,tlm:[{
   ...projection.byLens.tlm[0],item_id:"unmapped",geo:{lat:null,lng:0},map_publishable:true
 }]}};
 assert.equal(makeLabModel(mock,invalid).items.length,1);
});
test("Liturgical layer is descriptive, never an independent daily ordo",()=>{
 const context=calendarContext("2026-10-20");
 assert.equal(context.candidateOnly,true);
 assert.ok(context.season);
 assert.match(context.date,/2026-10-20/);
});
test("Four real MapCN originals are individually attributed",()=>{
 assert.deepEqual(Object.keys(MAPCN_BLOCKS).sort(),["density","discover","regions","time"]);
 for(const url of Object.values(MAPCN_BLOCKS))assert.match(url,/^https:\/\/www\.mapcn\.dev\/blocks\//);
});
test("Laboratory stays isolated and exposes real MapLibre layers",async()=>{
 const js=await readFile(resolve(root,"labs/mapcn-integration/lab.js"),"utf8");
 const html=await readFile(resolve(root,"labs/mapcn-integration/index.html"),"utf8");
 for(const key of ["lab-heat","lab-country-fill","lab-pins","lab-clusters","lab-density","lab-countries"])
  assert.ok(js.includes(key),"Missing layer "+key);
 for(const key of ["data-mode=\"discover\"","data-mode=\"time\"","data-mode=\"density\"","data-mode=\"regions\""])
  assert.ok(html.includes(key),"Missing tab "+key);
 assert.ok(!/from ["']react["']/.test(js));
 assert.ok(html.includes("READ-ONLY · NOT PRODUCTION"));
});
