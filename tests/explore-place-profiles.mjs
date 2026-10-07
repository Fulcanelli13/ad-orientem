import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { joinDirectoryRecords } from "../src/find/data-service.js";
import { projectExploreDataset, filterExploreItems } from "../src/find/explore-projection.js";
import { buildExplorePlaceProfiles, explorePlaceProfile, placeIdForExploreItem } from "../src/find/place-profiles.js";
import { buildExploreViewModel, renderExploreToString } from "../src/find/explore-presentation.js";

const readJson=path=>JSON.parse(readFileSync(path,"utf8"));
const geography=readJson("data/geography/seed-registry.v1.json");
const customsSeed=readJson("data/customs/customs-atlas-seed.v1.json");
const customSources=readJson("data/customs/source-registry.v1.json");
const shrineSeed=readJson("data/shrines/shrines-pilgrimages-seed.v1.json");
const shrineSources=readJson("data/shrines/source-registry.v1.json");
const novenaBridge=readJson("data/customs/novena-context-links.v1.json");
const novenaSot=readJson("data/pray/novena-sot.v1.json");

const records=joinDirectoryRecords({
  venues:[{
    venue_id:"ao-fssp-paris",
    name:{official:"Église Saint-Test",alternate:[]},
    venue_type:"church",
    address:{formatted:"10 rue Exemple, Paris, France",city:"Paris",country_code:"FR"},
    geo:{
      lat:48.8566,lng:2.3522,precision:"building",geocoding_source:"OSM_NOMINATIM",
      source_url:"https://nominatim.openstreetmap.org/",source_ref:"osm:node:1",
      matched_country_code:"FR",geocoded_at:"2026-10-07T10:00:00Z",
      attribution:"© OpenStreetMap contributors, ODbL 1.0",match_score:0.9,query_fingerprint:"fixture"
    },
    diocese:{name:"Archidiocèse de Paris"},
    contact:{phone:[],email:[],website:["https://example.org"],schedule_url:["https://example.org/mass"]},
    source_ids:["src-fssp-paris"]
  }],
  ministries:[{
    ministry_id:"m-fssp",venue_id:"ao-fssp-paris",community_id:"FSSP",relationship:"served_by",
    liturgical_usage:{family:"ROMAN",books:"1962"},source_ids:["src-fssp-paris"]
  }],
  schedules:[{
    schedule_id:"s-fssp",ministry_id:"m-fssp",service_type:"MASS",mass_type:"SUNG",
    payload:{raw:"Sunday 10:30 Sung Mass"},source_ids:["src-fssp-paris"]
  }],
  sources:[{source_id:"src-fssp-paris",url:"https://example.org/mass",source_type:"COMMUNITY_OFFICIAL"}],
  communityProfiles:[{communityId:"FSSP",communionProfile:{pope_named_in_canon:"YES"}}]
});

function buildDataset(directoryPlaceLinks=[]){
  return {
    directory:{
      records,
      communities:[{id:"FSSP",abbreviation:"FSSP",name:"Priestly Fraternity of Saint Peter"}],
      loadedProviders:["fssp"],
      unavailableProviders:[]
    },
    geography:{
      geoAreas:geography.geoAreas,
      places:geography.places,
      directoryPlaceLinks
    },
    customs:{customs:customsSeed.customs,attestations:customsSeed.attestations,sources:customSources.sources},
    shrines:{
      shrines:shrineSeed.shrines,
      pilgrimages:shrineSeed.pilgrimages,
      routes:shrineSeed.routes,
      temporalLinks:shrineSeed.temporalLinks,
      sources:shrineSources.sources
    },
    novenas:{
      records:novenaSot.novenas,
      links:novenaBridge.links,
      sources:novenaBridge.sources,
      researchStatus:novenaBridge.research_status
    }
  };
}

const dataset=buildDataset();
const projection=projectExploreDataset(dataset);
const profiles=buildExplorePlaceProfiles(dataset,projection,{today:"2026-10-07"});

assert.equal(profiles.length,8,"every seeded canonical Place should have one Place profile");

const lourdes=explorePlaceProfile(profiles,"place:FR:sanctuaire-notre-dame-de-lourdes");
assert.ok(lourdes);
assert.equal(lourdes.name,"Sanctuaire Notre-Dame de Lourdes");
assert.equal(lourdes.counts.shrines,1);
assert.ok(lourdes.counts.traditions>=1,"Lourdes Place lost place-backed traditions/Novena context");
assert.equal(lourdes.counts.pilgrimages,1);
assert.equal(lourdes.counts.tlm,0,"unlinked Paris fixture leaked into Lourdes by proximity or country");
assert.equal(lourdes.exact_tlm_link_state,"NONE");
assert.match(lourdes.exact_tlm_note,/does not make any claim about nearby Masses/);
assert.ok(lourdes.saints.includes("Saint Bernadette Soubirous"));
assert.ok(lourdes.sources.some(source=>source.role==="GEO"&&/openstreetmap/i.test(source.url)),"Lourdes Place page lost map provenance");
assert.deepEqual(lourdes.calendar.map(row=>[row.semantic_key,row.date,row.date_label]),[
  ["feast.our_lady_of_lourdes","2027-02-11","11/02/2027"]
]);

const laghet=explorePlaceProfile(profiles,"place:FR:sanctuaire-notre-dame-de-laghet");
assert.ok(laghet);
assert.ok(laghet.calendar.some(row=>row.semantic_key==="liturgical.pentecost_monday"&&row.date==="2027-05-17"));

const paray=explorePlaceProfile(profiles,"place:FR:sanctuaire-sacre-coeur-paray");
assert.ok(paray);
assert.ok(paray.calendar.some(row=>row.semantic_key==="feast.sacred_heart"&&row.date==="2027-06-04"));

const chartres=explorePlaceProfile(profiles,"place:FR:chartres-notre-dame");
assert.ok(chartres);
assert.equal(chartres.counts.shrines,1);
assert.equal(chartres.counts.pilgrimages,1);
assert.equal(chartres.map_publishable,false);
assert.ok(chartres.calendar.some(row=>row.semantic_key==="liturgical.pentecost_monday"&&row.date==="2027-05-17"));

const sainteAnne=explorePlaceProfile(profiles,"place:FR:sainte-anne-d-auray");
assert.ok(sainteAnne);
assert.equal(sainteAnne.counts.pilgrimages,2);
assert.ok(sainteAnne.counts.traditions>=1);
assert.ok(sainteAnne.calendar.some(row=>row.semantic_key==="feast.saint_anne"&&row.date==="2027-07-26"));

const knock=explorePlaceProfile(profiles,"place:IE:knock-shrine");
assert.ok(knock);
assert.equal(knock.counts.pilgrimages,2);
assert.ok(knock.saints.includes("Saint Joseph"));
assert.ok(knock.calendar.some(row=>row.semantic_key==="observance.knock_apparition_anniversary"&&row.date==="2027-08-21"));

const loughDerg=explorePlaceProfile(profiles,"place:IE:lough-derg-station-island");
assert.ok(loughDerg);
assert.equal(loughDerg.counts.pilgrimages,1);
assert.equal(loughDerg.calendar.length,0,"seasonal Lough Derg pilgrimage was incorrectly reduced to a single Calendar date");

const pereLaval=explorePlaceProfile(profiles,"place:MU:pere-laval-sainte-croix");
assert.ok(pereLaval);
assert.equal(pereLaval.counts.pilgrimages,1);
assert.ok(pereLaval.saints.includes("Blessed Jacques-Désiré Laval"));
assert.ok(pereLaval.calendar.some(row=>row.semantic_key==="feast.blessed_jacques_desire_laval"&&row.date==="2027-09-09"));
assert.equal(pereLaval.counts.tlm,0,"Mauritius shrine inferred a TLM link without a bridge");

const lourdesShrine=filterExploreItems(projection.byLens.shrines,{query:"Lourdes"})[0];
assert.equal(placeIdForExploreItem(lourdesShrine),lourdes.place_id);
assert.equal(lourdesShrine.place_id,lourdes.place_id);

const vm=buildExploreViewModel({
  language:"en",
  items:[lourdesShrine],
  lens:"shrines",
  counts:projection.counts,
  view:"list",
  filters:{query:"Lourdes"},
  selectedId:null,
  placeProfiles:profiles,
  selectedPlaceId:lourdes.place_id
});
const html=renderExploreToString(vm);
assert.ok(html.includes('data-explore-place-owner="'+lourdes.place_id+'"'));
assert.match(html,/ASSOCIATED SAINTS/);
assert.match(html,/11\/02\/2027/);
assert.match(html,/No TLM venue is currently linked to this exact Place/);
assert.match(html,/data-explore-place-item=/);
assert.match(html,/data-explore-place-lens="pilgrimages"/);
assert.match(html,/This page aggregates records by canonical Place ID/);

const detailHtml=renderExploreToString(buildExploreViewModel({
  language:"en",
  items:[lourdesShrine],
  lens:"shrines",
  counts:projection.counts,
  view:"list",
  filters:{query:"Lourdes"},
  selectedId:lourdesShrine.item_id,
  placeProfiles:profiles
}));
assert.ok(detailHtml.includes('data-explore-open-place="'+lourdes.place_id+'"'));
assert.match(detailHtml,/Place page/);

const linkedDataset=buildDataset([{
  link_id:"link:directory-place:test-lourdes",
  venue_id:"ao-fssp-paris",
  place_id:"place:FR:sanctuaire-notre-dame-de-lourdes",
  relationship:"LOCATED_AT",
  confidence:"CONFIRMED",
  source_ids:["src-fssp-paris"]
}]);
const linkedProjection=projectExploreDataset(linkedDataset);
const linkedProfiles=buildExplorePlaceProfiles(linkedDataset,linkedProjection,{today:"2026-10-07"});
const linkedLourdes=explorePlaceProfile(linkedProfiles,lourdes.place_id);
assert.equal(linkedLourdes.counts.tlm,1,"explicit Directory→Place link was not projected into Place page");
assert.equal(linkedLourdes.tlm[0].item_id,"tlm:ao-fssp-paris");
assert.equal(linkedLourdes.exact_tlm_link_state,"VERIFIED");

const browserSource=readFileSync("src/find/browser-entry.js","utf8");
assert.match(browserSource,/buildExplorePlaceProfiles/);
assert.match(browserSource,/data-explore-open-place/);
assert.match(browserSource,/data-explore-place-item/);
assert.match(browserSource,/state\.query="";/,"cross-lens Place navigation must clear stale search text");

console.log("PASS canonical Explore Place profiles and exact-place aggregation");
