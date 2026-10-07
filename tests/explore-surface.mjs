import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { joinDirectoryRecords } from "../src/find/data-service.js";
import {
  EXPLORE_LENSES,
  filterExploreItems,
  projectExploreDataset,
} from "../src/find/explore-projection.js";
import { buildExploreViewModel, renderExploreToString } from "../src/find/explore-presentation.js";
import { exploreMapFeatures } from "../src/find/map-runtime.js";

const readJson=path=>JSON.parse(readFileSync(path,"utf8"));
const geography=readJson("data/geography/seed-registry.v1.json");
const customsSeed=readJson("data/customs/customs-atlas-seed.v1.json");
const customSources=readJson("data/customs/source-registry.v1.json");
const shrineSeed=readJson("data/shrines/shrines-pilgrimages-seed.v1.json");
const shrineSources=readJson("data/shrines/source-registry.v1.json");

const records=joinDirectoryRecords({
  venues:[{
    venue_id:"ao-fssp-paris",
    name:{official:"Église Saint-Test",alternate:["Saint Test"]},
    venue_type:"church",
    address:{formatted:"10 rue Exemple, Paris, France",city:"Paris",country_code:"FR"},
    geo:{
      lat:48.8566,lng:2.3522,precision:"building",geocoding_source:"OSM_NOMINATIM",
      source_url:"https://nominatim.openstreetmap.org/",source_ref:"osm:node:1",
      matched_country_code:"FR",geocoded_at:"2026-10-07T10:00:00Z",
      attribution:"© OpenStreetMap contributors, ODbL 1.0",match_score:0.9,query_fingerprint:"fixture",
    },
    diocese:{name:"Archidiocèse de Paris"},
    contact:{phone:[],email:[],website:["https://example.org"],schedule_url:["https://example.org/mass"]},
    source_ids:["src-fssp-paris"],
  }],
  ministries:[{
    ministry_id:"m-fssp",venue_id:"ao-fssp-paris",community_id:"FSSP",relationship:"served_by",
    liturgical_usage:{family:"ROMAN",books:"1962"},source_ids:["src-fssp-paris"],
  }],
  schedules:[{
    schedule_id:"s-fssp",ministry_id:"m-fssp",service_type:"MASS",mass_type:"SUNG",
    payload:{raw:"Sunday 10:30 Sung Mass"},source_ids:["src-fssp-paris"],
  }],
  sources:[{source_id:"src-fssp-paris",url:"https://example.org/mass",source_type:"COMMUNITY_OFFICIAL"}],
  communityProfiles:[{communityId:"FSSP",communionProfile:{pope_named_in_canon:"YES"}}],
});

const dataset={
  directory:{
    records,
    communities:[{id:"FSSP",abbreviation:"FSSP",name:"Priestly Fraternity of Saint Peter"}],
    loadedProviders:["fssp"],
    unavailableProviders:[],
  },
  geography:{geoAreas:geography.geoAreas,places:geography.places},
  customs:{customs:customsSeed.customs,attestations:customsSeed.attestations,sources:customSources.sources},
  shrines:{
    shrines:shrineSeed.shrines,
    pilgrimages:shrineSeed.pilgrimages,
    routes:shrineSeed.routes,
    temporalLinks:shrineSeed.temporalLinks,
    sources:shrineSources.sources,
  },
};

const projection=projectExploreDataset(dataset);
assert.deepEqual(EXPLORE_LENSES,["tlm","shrines","traditions","pilgrimages"]);
assert.deepEqual(projection.counts,{
  tlm:1,
  shrines:3,
  traditions:17,
  pilgrimages:4,
});

for(const lens of EXPLORE_LENSES){
  const ids=projection.byLens[lens].map(item=>item.item_id);
  assert.equal(new Set(ids).size,ids.length,lens+" projection contains duplicate item ids");
  assert.ok(projection.byLens[lens].every(item=>item.lens===lens),lens+" projection leaked another owner");
}

const tlm=projection.byLens.tlm[0];
assert.equal(tlm.map_publishable,true);
assert.equal(tlm.map_state,"MAPPED");
assert.equal(exploreMapFeatures([tlm]).length,1);
assert.match(tlm.note,/Check the official schedule/);

const lourdesShrine=filterExploreItems(projection.byLens.shrines,{query:"Lourdes"});
assert.equal(lourdesShrine.length,1);
assert.equal(lourdesShrine[0].map_publishable,true);
assert.equal(lourdesShrine[0].map_state,"MAPPED");
assert.equal(exploreMapFeatures(lourdesShrine).length,1,"provenance-locked Lourdes shrine must publish one map pin");
assert.match(lourdesShrine[0].subtitle,/Lourdes/);

const lourdesTradition=filterExploreItems(projection.byLens.traditions,{query:"Lourdes"});
assert.ok(lourdesTradition.some(item=>item.source_id==="att:DEV-010:LOURDES"));
assert.ok(lourdesTradition.some(item=>item.map_publishable===true),"place-backed Lourdes tradition did not inherit the canonical Place pin");

const lourdesPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Lourdes"});
assert.equal(lourdesPilgrimage.length,1);
assert.equal(lourdesPilgrimage[0].map_publishable,true);
assert.equal(lourdesPilgrimage[0].map_state,"DESTINATION_MAPPED");
assert.ok(lourdesPilgrimage[0].sections.some(section=>section.label==="Calendar relationship"));

const shrineVm=buildExploreViewModel({
  language:"en",
  items:lourdesShrine,
  lens:"shrines",
  counts:projection.counts,
  view:"list",
  filters:{query:"Lourdes"},
  selectedId:lourdesShrine[0].item_id,
});
const shrineHtml=renderExploreToString(shrineVm);
assert.match(shrineHtml,/AD ORIENTEM · EXPLORE/);
assert.match(shrineHtml,/>Explore</);
assert.match(shrineHtml,/data-find-filter="lens"/);
assert.match(shrineHtml,/Shrines/);
assert.match(shrineHtml,/Traditions/);
assert.match(shrineHtml,/Pilgrimages/);
assert.match(shrineHtml,/Sanctuaire Notre-Dame de Lourdes/);
assert.match(shrineHtml,/Official Sanctuary|OFFICIAL SANCTUARY/);
assert.match(shrineHtml,/SOURCES/);
assert.doesNotMatch(shrineHtml,/data-find-filter="unaCum"/,"TLM-only filters leaked into Shrine lens");

const tlmVm=buildExploreViewModel({
  language:"en",
  items:projection.byLens.tlm,
  lens:"tlm",
  counts:projection.counts,
  loadedProviders:["fssp"],
  unavailableProviders:[],
  view:"list",
  filters:{query:"",day:"ANY",affiliations:[],unaCum:"ANY",liturgy:"ANY",massType:"ANY"},
  selectedId:tlm.item_id,
});
const tlmHtml=renderExploreToString(tlmVm);
assert.match(tlmHtml,/data-find-filter="unaCum"/);
assert.match(tlmHtml,/data-find-affiliation="FSSP"/);
assert.match(tlmHtml,/Église Saint-Test/);
assert.match(tlmHtml,/Sunday 10:30 Sung Mass/);

const shrineMapHtml=renderExploreToString(buildExploreViewModel({
  language:"en",
  items:projection.byLens.shrines,
  lens:"shrines",
  counts:projection.counts,
  view:"map",
  filters:{},
}));
assert.match(shrineMapHtml,/Loading source-backed map points/i);
assert.equal(exploreMapFeatures(projection.byLens.shrines).length,3,"all three seeded shrines should map through canonical Place coordinates");

const browserSource=readFileSync("src/find/browser-entry.js","utf8");
assert.match(browserSource,/loadExploreDataset/);
assert.match(browserSource,/projectExploreDataset/);
assert.match(browserSource,/mountExploreMap/);
assert.match(browserSource,/lens:"tlm"/);
assert.doesNotMatch(browserSource,/Sanctuaire Notre-Dame de Lourdes|Paray-le-Monial|Notre-Dame de Laghet/,"Explore browser owner hardcodes corpus places");

const homeSource=readFileSync("src/home/presentation.js","utf8");
assert.match(homeSource,/Traditional Masses, shrines, customs and pilgrimages/);
assert.match(homeSource,/data-home-find/,"Explore route lost shell-compatible Home trigger");

console.log("PASS unified Explore projection and four-lens surface");
