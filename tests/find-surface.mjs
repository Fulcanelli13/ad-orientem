import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  communionValue,
  directoryStats,
  filterDirectoryRecords,
  joinDirectoryRecords,
  publishableDirectoryRecords,
} from "../src/find/data-service.js";
import { buildFindViewModel, renderFindToString } from "../src/find/presentation.js";
import { FIND_MAP_RUNTIME, MASS_MAP_GROUP_COLORS, exploreMapFeatures, mapFitBounds, mapViewport, massMapProviderGroup } from "../src/find/map-runtime.js";

const venues=[
  {
    venue_id:"ao-fssp-paris",
    name:{official:"Église Saint-Test",alternate:["Saint Test"]},
    venue_type:"church",
    address:{formatted:"10 rue Exemple, Paris, France",city:"Paris",country_code:"FR"},
    geo:{lat:48.8566,lng:2.3522,precision:"building",geocoding_source:"OSM_NOMINATIM",source_url:"https://nominatim.openstreetmap.org/",source_ref:"osm:node:1",matched_country_code:"FR",geocoded_at:"2026-10-07T10:00:00Z",attribution:"© OpenStreetMap contributors, ODbL 1.0",match_score:0.9,query_fingerprint:"fixture"},
    diocese:{name:"Archidiocèse de Paris"},
    contact:{phone:["+33 1 00 00 00 00"],email:["office@example.org"],website:["https://example.org"],schedule_url:["https://example.org/mass"]},
    source_ids:["src-fssp-paris"],
  },
  {
    venue_id:"ao-ibp-sydney",
    name:{official:"Sydney Apostolate",alternate:[]},
    venue_type:"chapel",
    address:{formatted:"Sydney, Australia",city:"Sydney",country_code:"AU"},
    geo:{lat:null,lng:null},
    diocese:{name:"Archdiocese of Sydney"},
    contact:{phone:[],email:[],website:[],schedule_url:[]},
    source_ids:["src-ibp-sydney"],
  },
];
const ministries=[
  {
    ministry_id:"m-fssp",venue_id:"ao-fssp-paris",community_id:"FSSP",relationship:"served_by",
    liturgical_usage:{family:"ROMAN",books:"1962"},
    source_ids:["src-fssp-paris"],
  },
  {
    ministry_id:"m-ibp",venue_id:"ao-ibp-sydney",community_id:"IBP",relationship:"served_by",
    liturgical_usage:{family:"ROMAN",books:"1962"},
    source_ids:["src-ibp-sydney"],
  },
];
const schedules=[
  {
    schedule_id:"s-fssp",ministry_id:"m-fssp",service_type:"MASS",mass_type:"SUNG",
    payload:{raw:"Sunday 10:30 Sung Mass"},source_ids:["src-fssp-paris"],
  },
  {
    schedule_id:"s-ibp",ministry_id:"m-ibp",service_type:"MASS",mass_type:"LOW",
    payload:{raw:"Saturday 18:00 Low Mass"},source_ids:["src-ibp-sydney"],
  },
];
const sources=[
  {source_id:"src-fssp-paris",url:"https://example.org/mass",source_type:"COMMUNITY_OFFICIAL"},
  {source_id:"src-ibp-sydney",url:"https://example.org/ibp",source_type:"COMMUNITY_OFFICIAL"},
];
const communityProfiles=[
  {communityId:"FSSP",communionProfile:{pope_named_in_canon:"YES"}},
  {communityId:"IBP",communionProfile:{pope_named_in_canon:"UNKNOWN"}},
];
const communities=[
  {id:"FSSP",abbreviation:"FSSP",name:"Priestly Fraternity of Saint Peter"},
  {id:"IBP",abbreviation:"IBP",name:"Institute of the Good Shepherd"},
];

const records=joinDirectoryRecords({venues,ministries,schedules,sources,communityProfiles});
assert.equal(records.length,2);
const invalidRecord={venue:{venue_id:"bad",address:{country_code:null},geo:{lat:null,lng:null}},ministries:[],sources:[]};
assert.equal(publishableDirectoryRecords([...records,invalidRecord]).length,2,"runtime did not quarantine invalid venues");
assert.equal(records[0].ministries[0].schedules.length,1);
assert.equal(communionValue(records[0]),"YES");
assert.equal(communionValue(records[1]),"UNKNOWN");

assert.equal(filterDirectoryRecords(records,{query:"Paris"}).length,1);
assert.equal(filterDirectoryRecords(records,{affiliations:["FSSP"]}).length,1);
assert.equal(filterDirectoryRecords(records,{unaCum:"YES"}).length,1);
assert.equal(filterDirectoryRecords(records,{liturgy:"1962"}).length,2);
assert.equal(filterDirectoryRecords(records,{massType:"SUNG"}).length,1);
assert.equal(filterDirectoryRecords(records,{day:"SUNDAY"}).length,1);

const stats=directoryStats(records);
assert.equal(stats.venues,2);
assert.equal(stats.countries,2);
assert.equal(stats.geocoded,1);

const vm=buildFindViewModel({
  language:"en",records,communities,loadedProviders:["fssp","ibp"],unavailableProviders:["sspx"],view:"list",
  filters:{query:"",day:"ANY",affiliations:[],unaCum:"ANY",liturgy:"ANY",massType:"ANY"},
  selectedId:"ao-fssp-paris",
});
const html=renderFindToString(vm);
assert.match(html,/Find a Mass/);
assert.match(html,/Église Saint-Test/);
assert.match(html,/UNA CUM/);
assert.match(html,/Roman · 1962/);
assert.match(html,/Archidiocèse de Paris/);
assert.match(html,/Open official Mass/);
assert.match(html,/Directions/);
assert.match(html,/data-find-filter="unaCum"/);
assert.match(html,/data-find-affiliation="SSPX"/);

const empty=renderFindToString(buildFindViewModel({
  language:"en",records:[],communities,loadedProviders:[],unavailableProviders:["fssp","icksp","ibp","sspx"],view:"list",
  filters:{},
}));
assert.match(empty,/Directory snapshot not published yet/);
assert.match(empty,/No locations are being invented/);

assert.match(FIND_MAP_RUNTIME.module,/maplibre-gl/);
assert.match(FIND_MAP_RUNTIME.style,/openfreemap/);
assert.ok(FIND_MAP_RUNTIME.style.includes("/styles/dark"));
assert.equal(massMapProviderGroup("SSPX"),"SSPX");
assert.equal(massMapProviderGroup("UNRECOGNISED_GROUP"),"OTHER");
assert.equal(Object.keys(MASS_MAP_GROUP_COLORS).length,6);
const mapItems=[{
  lens:"tlm",item_id:"tlm:example-sspx",title:"Source-backed SSPX",
  community_id:"SSPX",map_publishable:true,
  geo:{lat:46.21,lng:6.12,precision:"address",approximate:false},
},{
  lens:"tlm",item_id:"tlm:example-fssp",title:"Source-backed FSSP",
  community_id:"FSSP",map_publishable:true,
  geo:{lat:48.85,lng:2.35,precision:"locality",approximate:true},
},{
  lens:"tlm",item_id:"tlm:address-only",title:"Address only",
  community_id:"ICKSP",map_publishable:false,
  geo:{lat:null,lng:null},
}];
const mapFeatures=exploreMapFeatures(mapItems);
assert.equal(mapFeatures.length,2,"unverified coordinate leaked onto MapLibre map");
assert.deepEqual(mapFeatures.map(x=>x.properties.provider_group),["SSPX","FSSP"]);
assert.equal(mapFeatures[1].properties.approximate,true);
assert.deepEqual(mapFitBounds(mapFeatures),[[2.35,46.21],[6.12,48.85]]);
assert.equal(mapFitBounds([mapFeatures[0]]),null);
assert.equal(mapViewport({getCenter:()=>({lng:6,lat:45}),getZoom:()=>8}).zoom,8);
assert.equal(mapViewport({getCenter:()=>({lng:NaN,lat:45}),getZoom:()=>8}),null);


const browserSource=readFileSync("src/find/browser-entry.js","utf8");
const explorePresentation=readFileSync("src/find/explore-presentation.js","utf8");
const glossarySource=readFileSync("src/glossary/browser-entry.js","utf8");
assert.match(browserSource,/AO_FIND_APP_V1/);
assert.match(browserSource,/data-find-query/);
assert.match(browserSource,/mountExploreMap/);
assert.match(browserSource,/navigate\?\.\("home"\)/);
assert.doesNotMatch(browserSource,/Église Saint-Test|Sydney Apostolate/,"Find browser owner hardcodes fixture locations");
assert.match(browserSource,/var\(--ao-z-surface,2147481800\)/,"Explore root is not on the shared elevation vocabulary");
assert.match(explorePresentation,/ao-ui-back/,"Explore Back control is not using the canonical utility icon");
assert.match(explorePresentation,/aoMapLegend/,"TLM map provider legend not wired");
assert.match(browserSource,/initialViewport:lastMapLens===state.lens/,"Map loses viewport when a point opens");
assert.ok(browserSource.includes("aoMapLegend>span[data-group"),"Map visual legend styling missing");

assert.match(explorePresentation,/ao-ui-close/,"Explore Close control is not using the canonical utility icon");
assert.match(explorePresentation,/data-find-glossary/,"Explore header lost contextual glossary action");
assert.match(browserSource,/function glossaryTerms\(\)/,"Explore lost lens-aware glossary mapping");
assert.match(browserSource,/openTerms\(glossaryTerms\(\),\{origin:"find"\}\)/,"Explore glossary no longer opens contextually");
for(const id of ["G135","G149","G150","G449","G450","G336","G334","G322","G233"]){
  assert.match(browserSource,new RegExp('"'+id+'"'),"Explore glossary mapping lost "+id);
}
assert.match(browserSource,/grid-template-columns:44px minmax\(0,1fr\) 44px auto/,"Explore glossary action broke header geometry");
assert.match(glossarySource,/z-index:2147483600/,"Context glossary no longer renders above Explore/Mass surfaces");
assert.doesNotMatch(explorePresentation,/>×<\/button>|>←<\/button>/,"Explore shell regained raw Unicode navigation controls");

// Control regressions: search focus, nested modal actions and cross-route success gates.
assert.ok(browserSource.includes("preserveSearchFocus:true"),"Explore input still loses keyboard focus");
assert.ok(browserSource.includes('target?.closest?.("button[data-find-close-detail]")'),"Detail close is not button-specific");
assert.ok(browserSource.includes('target?.matches?.(".aoFindSheetBackdrop[data-find-close-detail]")'),"Detail backdrop dismissal is missing");
assert.ok(!browserSource.includes('target?.closest?.("[data-find-close-detail]")'),"Sheet contents are still swallowed by backdrop dismissal");
assert.ok(browserSource.includes("const routed=await shell?.navigate?.(surface)")&&browserSource.includes("if(routed?.ok===true)"),"Explore handoffs must verify successful shell navigation");
assert.ok(browserSource.includes('handoff("pray",')&&browserSource.includes('AO_PRAY_V435930?.open?.("pray.novenas"'),"Explore novena must enter through shell and then open the exact Prayer owner");
const calendarRuntime=readFileSync("src/calendar/calendar-runtime.js","utf8");
assert.ok(calendarRuntime.includes("result?.ok===true?globalThis.AO_FIND_APP_V1"),
  "Calendar Explore link does not require successful shell navigation");

console.log("PASS Find a Mass modular surface");
