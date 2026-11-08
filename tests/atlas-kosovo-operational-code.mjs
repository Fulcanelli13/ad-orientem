import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {auditGeoArea,assertExploreGeographyRegistry} from "../src/find/geography-contracts.js";
import {atlasCoverageAreaCode,atlasCoverageCountryNames,KOSOVO_OPERATIONAL_AREA_ID}
  from "../src/find/atlas-country-identifiers.js";
import {buildAtlasCoverage,enrichAtlasCountryFeatures}
  from "../src/find/mapcn-atlas-coverage.js";

const read=p=>JSON.parse(readFileSync(new URL("../"+p,import.meta.url),"utf8"));
const preview=read("data/geography/research/sacred-atlas-five-active-country-area-preview-20261107.v1.json");
const live=read("data/geography/seed-registry.v1.json");
assert.equal(live.places.length,535);
const ks=preview.proposals.find(x=>x.source_country_code==="XK");
assert.ok(ks);
const proposed=ks.proposed_geo_area;
assert.equal(proposed.geo_area_id,KOSOVO_OPERATIONAL_AREA_ID);
assert.equal(proposed.area_type,"other");
assert.equal(proposed.codes.operational_alpha2,"XK");
assert.equal(proposed.codes.iso_alpha2,undefined);
assert.deepEqual(auditGeoArea(proposed),[]);
assert.equal(atlasCoverageAreaCode(proposed),"XK");
assert.equal(atlasCoverageCountryNames([proposed]).get("XK"),"Kosovo");
assert.equal(atlasCoverageAreaCode({geo_area_id:"geo:country:XK",area_type:"country",
  area_system:"CIVIL",codes:{iso_alpha2:"XK"}}),"");
assert.ok(auditGeoArea({geo_area_id:"geo:country:XK",name:{official:"Kosovo",aliases:[]},
  area_system:"CIVIL",area_type:"country",parent_geo_area_ids:["geo:world"],
  mappable:true,codes:{iso_alpha2:"XK"}}).some(x=>x.code==="KOSOVO_XK_IS_NOT_ISO"));
assert.ok(auditGeoArea({geo_area_id:"geo:country:ZZ",name:{official:"Fictional",aliases:[]},
  area_system:"CIVIL",area_type:"country",parent_geo_area_ids:["geo:world"],
  mappable:true,codes:{operational_alpha2:"XK",iso_alpha2:"ZZ"}})
  .some(x=>x.code==="INVALID_OPERATIONAL_AREA_CODE"));
for(const entry of preview.proposals.filter(x=>x.source_country_code!=="XK")){
 assert.deepEqual(auditGeoArea(entry.proposed_geo_area),[]);
 assert.equal(atlasCoverageAreaCode(entry.proposed_geo_area),entry.source_country_code);
}
const registry={...live,geoAreas:[...live.geoAreas,proposed]};
// This is an in-memory fixture: no actual map or canonical publication.
assert.equal(assertExploreGeographyRegistry(registry).pass,true);
const projection={byLens:{tlm:[{
 item_id:"kosovo-latin-shrine-projection-only",source_id:"test:XK:Letnica",
 map_publishable:true,lens:"tlm",title:"Letnica",
 geo:{lat:42.4,lng:21.2,approximate:true},
 raw:{venue:{address:{country_code:"XK"}}}
}]}};
const coverage=buildAtlasCoverage({geography:{geoAreas:registry.geoAreas,places:[]}},
  projection,{scope:"tlm"});
assert.equal(coverage.total,1);
assert.equal(coverage.mappedCountries,1);
assert.deepEqual(coverage.countries.map(c=>[c.code,c.name,c.count]),[["XK","Kosovo",1]]);
assert.equal(coverage.points[0].approximate,true);
const poly={type:"FeatureCollection",features:[{type:"Feature",
 properties:{ISO_A2_EH:"XK",ADMIN:"Kosovo"},geometry:{type:"Polygon",
 coordinates:[[[21,42],[22,42],[22,43],[21,42]]]}}]};
const patched=enrichAtlasCountryFeatures(poly,coverage);
assert.equal(patched.features[0].properties.aoCountryCode,"XK");
assert.equal(patched.features[0].properties.aoCount,1);
assert.ok(!live.geoAreas.some(x=>x.geo_area_id===proposed.geo_area_id));
assert.equal(preview.counts.geo_areas_appended_to_canonical,0);
assert.equal(preview.counts.candidate_places_admitted,0);
console.log("PASS: Kosovo operational code supported in an in-memory country coverage fixture; ISO spoof blocked; no published areas or Places");
