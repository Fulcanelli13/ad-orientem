import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { joinDirectoryRecords } from "../src/find/data-service.js";
import {
  EXPLORE_LENSES,
  filterExploreItems,
  projectExploreDataset,
} from "../src/find/explore-projection.js";
import { buildExploreViewModel, renderExploreToString } from "../src/find/explore-presentation.js";
import { sacredPlaceSynopsis, compactHeritagePlaceSheet } from "../src/find/heritage-presentation.js";
import { exploreMapFeatures } from "../src/find/map-runtime.js";
import { buildCustomsAtlasFacets, filterCustomsAtlasItems } from "../src/find/customs-atlas-filters.js";
import { groupTraditionsForBrowse, countCanonicalTraditions } from "../src/find/traditions-browse.js";
import { HERITAGE_CATEGORIES, projectHeritagePlaces, heritageCustomCards, nearbyHeritagePlaces } from "../src/find/heritage-map.js";
import { buildExplorePlaceProfiles, resolveApprovedPlaceMedia } from "../src/find/place-profiles.js";
import { isMapPublishablePlaceGeo } from "../src/find/geography-contracts.js";
import {
  assertLossless,
  assertPinsAreCanonicalAndSourced,
  assertGateConsistent,
  assertApprovedMedia,
} from "./support/explore-invariants.mjs";

const readJson=path=>JSON.parse(readFileSync(path,"utf8"));
const geography=readJson("data/geography/seed-registry.v1.json");
const phenomena=readJson("data/explore/sacred-phenomena-seed.v1.json");
const customsSeed=readJson("data/customs/customs-atlas-seed.v1.json");
const customSources=readJson("data/customs/source-registry.v1.json");
const customGuidance=readJson("data/customs/customs-p0-guidance-en-fr.v1.json");
const customGuidanceP1=readJson("data/customs/customs-p1-guidance-en-fr.v1.json");
const shrineSeed=readJson("data/shrines/shrines-pilgrimages-seed.v1.json");
const shrineSources=readJson("data/shrines/source-registry.v1.json");
const novenaBridge=readJson("data/customs/novena-context-links.v1.json");
const novenaSot=readJson("data/pray/novena-sot.v1.json");
const featuredEditorial=readJson("data/geography/major-places-editorial.v1.json");
assert.equal(featuredEditorial.schema,"AO_EXPLORE_MAJOR_PLACES_EDITORIAL_V1");
assert.ok(featuredEditorial.items.length>0,"Editorial featured list must not be empty");
assert.equal(new Set(featuredEditorial.items.map(row=>row.place_id)).size,featuredEditorial.items.length,"Curated Place identities must be unique");
for(const item of featuredEditorial.items){
  const place=geography.places.find(p=>p.place_id===item.place_id);
  assert.ok(place?.source_ids?.includes(item.source_id),"Featured site must cite an original Place source: "+item.place_id);
  assert.equal(item.media_review,"NOT_CURATED","No site photograph may be implied approved");
}

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
  editorial:{featured:featuredEditorial.items},
  directory:{
    records,
    communities:[{id:"FSSP",abbreviation:"FSSP",name:"Priestly Fraternity of Saint Peter"}],
    loadedProviders:["fssp"],
    unavailableProviders:[],
  },
  geography:{geoAreas:geography.geoAreas,places:geography.places},
  sacredPhenomena:phenomena,
  customs:{customs:customsSeed.customs,attestations:customsSeed.attestations,sources:customSources.sources,guidance:[...customGuidance.entries,...customGuidanceP1.entries]},
  shrines:{
    shrines:shrineSeed.shrines,
    pilgrimages:shrineSeed.pilgrimages,
    routes:shrineSeed.routes,
    temporalLinks:shrineSeed.temporalLinks,
    sources:shrineSources.sources,
  },
  novenas:{
    records:novenaSot.novenas,
    links:novenaBridge.links,
    sources:novenaBridge.sources,
    researchStatus:novenaBridge.research_status,
  },
};

const projection=projectExploreDataset(dataset);
const sacredGeoLaunch=readJson("data/geography/research/sacred-geography-major-sites-launch-2026-10-10.v1.json");
const majorExceptions=readJson("data/geography/research/sacred-geography-major-exceptions-2026-10-10.v1.json");
assert.equal(sacredGeoLaunch.promoted.length,35,"major-site launch batch drifted");
const launchPlaceIds=new Set();
for(const site of [...sacredGeoLaunch.promoted,...majorExceptions.promoted]){
  assert.ok(!launchPlaceIds.has(site.place_id),"duplicate launched Place "+site.place_id);
  launchPlaceIds.add(site.place_id);
  const place=geography.places.find(p=>p.place_id===site.place_id);
  assert.ok(place,"launched Place absent from canonical geography: "+site.place_id);
  const item=projection.byLens.shrines.find(s=>s.place_id===site.place_id);
  assert.ok(item&&item.map_publishable,"launched shrine not projected onto app map: "+site.place_id);
  assert.ok(item.source_links.some(source=>source.url===(site.identity_source_url??site.officialUrl)),
    "launched shrine lacks clickable identity source: "+site.place_id);
  assert.equal(item.geo.lat,place.geo.lat,"launched map position drifted from canonical Place");
  assert.equal(item.geo.lng,place.geo.lng,"launched map position drifted from canonical Place");
}
const mexicanGuadalupe=geography.places.find(p=>p.place_id==="place:MX:basilica-guadalupe-mexico-city");
assert.equal(mexicanGuadalupe?.geo?.source_ref,"osm:way:120733641","Guadalupe must point to the modern 1976 Basilica");
assert.equal(geography.places.filter(p=>p.place_id===mexicanGuadalupe.place_id).length,1,"Guadalupe must not duplicate canonical identity");

assert.deepEqual(EXPLORE_LENSES,["tlm","shrines","apparitions","relics","traditions","pilgrimages","saints"]);
// Every lens is a lossless projection of its seed file: no record dropped,
// duplicated or invented. (Replaces a frozen table of seven totals.)
for(const lens of EXPLORE_LENSES)
  assert.equal(projection.counts[lens],projection.byLens[lens].length,lens+" count disagrees with projected items");
assertLossless("tlm",projection.byLens.tlm,records.map(record=>record.venue.venue_id));
assertLossless("shrines",projection.byLens.shrines,shrineSeed.shrines.map(row=>row.shrine_id));
assertLossless("pilgrimages",projection.byLens.pilgrimages,shrineSeed.pilgrimages.map(row=>row.pilgrimage_id));
assertLossless("apparitions",projection.byLens.apparitions,phenomena.apparitions.map(row=>row.id));
assertLossless("relics",projection.byLens.relics,phenomena.relics.map(row=>row.id));
assertLossless("traditions",projection.byLens.traditions,[
  ...customsSeed.attestations.map(row=>row.attestation_id),
  ...novenaBridge.links.map(row=>row.link_id),
]);
assert.equal(projection.counts.saints,0,"Saints lens is loaded by its own fixture, not this dataset");

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

const lourdesShrine=filterExploreItems(projection.byLens.shrines,{query:"Sanctuaire Notre-Dame de Lourdes"});
assert.equal(lourdesShrine.length,1);
assert.equal(lourdesShrine[0].map_publishable,true);
assert.equal(lourdesShrine[0].map_state,"MAPPED");
assert.equal(exploreMapFeatures(lourdesShrine).length,1,"provenance-locked Lourdes shrine must publish one map pin");
assert.match(lourdesShrine[0].subtitle,/Lourdes/);
assert.ok(lourdesShrine[0].sections.some(section=>section.label==="Related novena"&&/Immaculate Conception/.test(section.title)),"Lourdes shrine lost related Immaculate Conception novena");
assert.ok(lourdesShrine[0].actions.some(action=>action.novena_id==="immaculate_conception"),"Lourdes shrine lost Novena deep link");

const lourdesTradition=filterExploreItems(projection.byLens.traditions,{query:"Lourdes"});
assert.ok(lourdesTradition.some(item=>item.source_id==="att:DEV-010:LOURDES"));
assert.ok(lourdesTradition.some(item=>item.map_publishable===true),"place-backed Lourdes tradition did not inherit the canonical Place pin");

const immaculateContext=filterExploreItems(projection.byLens.traditions,{query:"Immaculate Conception"});
assert.ok(immaculateContext.some(item=>item.kind==="NOVENA_CONTEXT"&&item.raw?.link?.novena_id==="immaculate_conception"),"Explore Traditions lost Immaculate Conception Novena context");

const christmasContext=filterExploreItems(projection.byLens.traditions,{query:"Christmas Novena"});
assert.ok(christmasContext.some(item=>item.kind==="NOVENA_CONTEXT"&&/Corsica/i.test(item.subtitle)),"Explore lost French Christmas O-antiphon Novena attestation");

const christKingContext=filterExploreItems(projection.byLens.traditions,{query:"Christ the King"});
assert.ok(christKingContext.some(item=>item.kind==="NOVENA_CONTEXT"&&item.map_state==="NOT_MAPPED"),"Christ the King textual French-world context was incorrectly forced onto a map");

const lourdesPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Sanctuaire Notre-Dame de Lourdes"});
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
  filters:{query:"Sanctuaire Notre-Dame de Lourdes"},
  selectedId:lourdesShrine[0].item_id,
  expandDetail:true,
});
const shrineHtml=renderExploreToString(shrineVm);
assert.match(shrineHtml,/AD ORIENTEM · EXPLORE/);
assert.match(shrineHtml,/<h1>Shrines<\/h1>/,"R53 gives the active Explore section its own heading");
assert.match(shrineHtml,/data-find-filter="lens"/);
assert.match(shrineHtml,/Shrines/);
assert.match(shrineHtml,/Traditions/);
assert.match(shrineHtml,/Pilgrimages/);
assert.match(shrineHtml,/Sanctuaire Notre-Dame de Lourdes/);
assert.match(shrineHtml,/Official Sanctuary|OFFICIAL SANCTUARY/);
assert.match(shrineHtml,/SOURCES/);
assert.match(shrineHtml,/Related novena/);
assert.match(shrineHtml,/Open novena/);
assert.match(shrineHtml,/data-explore-open-novena="immaculate_conception"/);
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
  expandDetail:true,
});
const tlmHtml=renderExploreToString(tlmVm);
assert.match(tlmHtml,/data-find-filter="unaCum"/);
assert.match(tlmHtml,/data-find-affiliation="FSSP"/);
assert.match(tlmHtml,/aoExploreAdvancedFilters/,"TLM advanced filter disclosure is missing");
assert.match(tlmHtml,/More filters/,"TLM advanced filter label disappeared");
assert.match(tlmHtml,/COMMUNITY \/ PROVIDER/,"provider taxonomy lost its explicit advanced label");
assert.match(tlmHtml,/COMMUNION STATUS/,"communion taxonomy lost its explicit advanced label");
assert.match(tlmHtml,/LITURGY/,"liturgy taxonomy lost its explicit advanced label");
assert.match(tlmHtml,/MASS TYPE/,"Mass-type taxonomy lost its explicit advanced label");
assert.ok(
  tlmHtml.indexOf('aoExploreAdvancedFilters') < tlmHtml.indexOf('data-find-affiliation="FSSP"'),
  "provider affiliation leaked ahead of the Advanced disclosure"
);
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
// Only provenance-locked shrine Places publish map points. Checked as a rule on
// every shrine, so a new, properly sourced shrine needs no test edit, and any
// regional tranche is covered without re-asserting a total after each one.
const placeLensItems=[...projection.byLens.shrines,...projection.byLens.pilgrimages,
  ...projection.byLens.apparitions,...projection.byLens.relics,...projection.byLens.traditions];
for(const lens of ["shrines","pilgrimages","apparitions","relics"])
  assertGateConsistent(lens,projection.byLens[lens],geography.places,isMapPublishablePlaceGeo);
assertPinsAreCanonicalAndSourced("Explore",placeLensItems,geography.places);
assert.equal(exploreMapFeatures(projection.byLens.shrines).length,
  projection.byLens.shrines.filter(item=>item.map_publishable).length,
  "every publishable shrine yields exactly one map feature, and nothing else does");

const chartresShrine=filterExploreItems(projection.byLens.shrines,{query:"Chartres"});
assert.equal(chartresShrine.length,1);
assert.equal(chartresShrine[0].map_publishable,true);
assert.equal(chartresShrine[0].map_state,"MAPPED");
assert.match(chartresShrine[0].subtitle,/Chartres/);

const sainteAnneTradition=filterExploreItems(projection.byLens.traditions,{query:"Grand Pardon"});
assert.ok(sainteAnneTradition.some(item=>item.source_id==="att:DEV-007:SAINTE-ANNE-D-AURAY"));
assert.ok(sainteAnneTradition.some(item=>item.map_publishable===true),"verified Sainte-Anne custom failed to produce a pin");

const knockPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Knock Apparition"});
assert.equal(knockPilgrimage.length,1);
assert.equal(knockPilgrimage[0].map_publishable,true);
assert.ok(knockPilgrimage[0].sections.some(section=>/Anniversary of the Knock Apparition/.test(section.title)));

const loughDerg=filterExploreItems(projection.byLens.pilgrimages,{query:"Lough Derg Three Day"});
assert.equal(loughDerg.length,1);
assert.equal(loughDerg[0].map_state,"DESTINATION_MAPPED");
assert.ok(loughDerg[0].sections.some(section=>section.label==="Calendar relationship"&&/Traditional Three Day Pilgrimage season/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const pereLaval=filterExploreItems(projection.byLens.pilgrimages,{query:"Père Laval"});
assert.equal(pereLaval.length,1);
assert.equal(pereLaval[0].map_publishable,true);

const altoetting=filterExploreItems(projection.byLens.shrines,{query:"Altötting"});
assert.equal(altoetting.length,1);
assert.equal(altoetting[0].map_publishable,true);
const altoettingExVoto=filterExploreItems(projection.byLens.traditions,{query:"votive tablets"});
assert.ok(altoettingExVoto.some(item=>item.source_id==="att:DEV-009:ALTOETTING"));

const kevelaer=filterExploreItems(projection.byLens.pilgrimages,{query:"Kevelaer"});
assert.equal(kevelaer.length,1);
assert.equal(kevelaer[0].map_publishable,true);
assert.ok(kevelaer[0].sections.some(section=>/pilgrimage season/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const mariazell=filterExploreItems(projection.byLens.pilgrimages,{query:"Mariazell"});
assert.equal(mariazell.length,1);
assert.equal(mariazell[0].map_state,"DESTINATION_MAPPED");
assert.ok(mariazell[0].sections.some(section=>/pilgrimage season/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));
const mariazellCandle=filterExploreItems(projection.byLens.traditions,{query:"votive candle"});
assert.ok(mariazellCandle.some(item=>item.source_id==="att:DEV-010:MARIAZELL"));

const mariaTaferl=filterExploreItems(projection.byLens.shrines,{query:"Maria Taferl"});
assert.equal(mariaTaferl.length,1);
assert.equal(mariaTaferl[0].map_publishable,true);

const engelweihe=filterExploreItems(projection.byLens.pilgrimages,{query:"Engelweihe"});
assert.equal(engelweihe.length,1);
assert.ok(engelweihe[0].sections.some(section=>/Engelweihe/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const einsiedelnCustom=filterExploreItems(projection.byLens.traditions,{query:"Engelweihe"});
assert.ok(einsiedelnCustom.some(item=>item.source_id==="att:DEV-007:EINSIEDELN-ENGELWEIHE"));

const mariastein=filterExploreItems(projection.byLens.pilgrimages,{query:"Mariastein"});
assert.equal(mariastein.length,1);
assert.ok(mariastein[0].sections.some(section=>/first Wednesday/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const champion=filterExploreItems(projection.byLens.pilgrimages,{query:"Our Lady of Champion"});
assert.ok(champion.length>=1);
assert.ok(champion.every(item=>item.map_publishable===true));
assert.ok(champion.some(item=>item.sections.some(section=>/Solemnity of Our Lady of Champion/.test(section.title)&&/Resolved by Calendar/.test(section.body))));

const guadalupeShrine=filterExploreItems(projection.byLens.shrines,{query:"La Crosse"});
assert.equal(guadalupeShrine.length,1);
assert.equal(guadalupeShrine[0].map_publishable,true);
const guadalupeCandles=filterExploreItems(projection.byLens.traditions,{query:"Votive Candle"});
assert.ok(guadalupeCandles.some(item=>item.source_id==="att:DEV-010:GUADALUPE-LA-CROSSE"));

const holyHill=filterExploreItems(projection.byLens.pilgrimages,{query:"Traditional Holy Hill"});
assert.equal(holyHill.length,1);
assert.equal(holyHill[0].map_publishable,true);
assert.ok(holyHill[0].sections.some(section=>/Annual traditional Holy Hill pilgrimage/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const beaupre=filterExploreItems(projection.byLens.pilgrimages,{query:"Sainte-Anne-de-Beaupré"});
assert.equal(beaupre.length,1);
assert.ok(beaupre[0].sections.some(section=>/Feast of Saint Anne/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const ndc=filterExploreItems(projection.byLens.pilgrimages,{query:"Notre-Dame-du-Cap"});
assert.equal(ndc.length,1);
assert.ok(ndc[0].sections.some(section=>/Assumption/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const ndcCandle=filterExploreItems(projection.byLens.traditions,{query:"novena candle"});
assert.ok(ndcCandle.some(item=>item.source_id==="att:DEV-010:NOTRE-DAME-DU-CAP"));

const martyrs=filterExploreItems(projection.byLens.pilgrimages,{query:"Canadian Martyrs traditional"});
assert.equal(martyrs.length,1);
assert.equal(martyrs[0].map_publishable,true);
assert.ok(martyrs[0].sections.some(section=>/Annual Canadian Martyrs traditional pilgrimage/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const loreto=filterExploreItems(projection.byLens.pilgrimages,{query:"Loreto"});
assert.equal(loreto.length,1);
assert.equal(loreto[0].map_publishable,true);
assert.ok(loreto[0].sections.some(section=>/Blessed Virgin Mary of Loreto/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const loretoCustom=filterExploreItems(projection.byLens.traditions,{query:"Venuta"});
assert.ok(loretoCustom.some(item=>item.source_id==="att:DEV-007:LORETO-VENUTA"));

const pompei=filterExploreItems(projection.byLens.pilgrimages,{query:"Pompeii"});
assert.equal(pompei.length,1);
assert.equal(pompei[0].map_publishable,true);
assert.ok(pompei[0].sections.some(section=>/Supplica/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const jasna=filterExploreItems(projection.byLens.pilgrimages,{query:"Jasna Góra"});
assert.equal(jasna.length,1);
assert.equal(jasna[0].map_publishable,true);
assert.ok(jasna[0].sections.some(section=>/Częstochowa/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const kalwaria=filterExploreItems(projection.byLens.pilgrimages,{query:"Kalwaria"});
assert.equal(kalwaria.length,1);
assert.equal(kalwaria[0].map_publishable,true);
assert.ok(kalwaria[0].sections.some(section=>/Assumption/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const walsingham=filterExploreItems(projection.byLens.pilgrimages,{query:"Walsingham"});
assert.equal(walsingham.length,2);
assert.ok(walsingham.every(item=>item.map_publishable===true));
assert.ok(walsingham.some(item=>item.sections.some(section=>/Our Lady of Walsingham/.test(section.title)&&/Resolved by Calendar/.test(section.body))));
assert.ok(walsingham.some(item=>item.sections.some(section=>/August Bank Holiday/.test(section.title)&&/no single recurring Calendar date/i.test(section.body))));

const holywell=filterExploreItems(projection.byLens.pilgrimages,{query:"Holywell"});
assert.equal(holywell.length,2);
assert.ok(holywell.some(item=>item.map_publishable===true),"documented Holywell shrine must now be on map");
assert.ok(holywell.some(item=>item.sections.some(section=>/Saint Winefride/.test(section.title)&&/Resolved by Calendar/.test(section.body))));
assert.ok(holywell.some(item=>item.sections.some(section=>/first Sunday of July/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body))));

const penrose=filterExploreItems(projection.byLens.shrines,{query:"Penrose Park"});
assert.equal(penrose.length,1);
assert.equal(penrose[0].map_publishable,true);
const marianValley=filterExploreItems(projection.byLens.shrines,{query:"Marian Valley"});
assert.equal(marianValley.length,1);
assert.equal(marianValley[0].map_publishable,true);
const peterChanel=filterExploreItems(projection.byLens.pilgrimages,{query:"Peter Chanel"});
assert.equal(peterChanel.length,1);
assert.equal(peterChanel[0].map_publishable,true);
assert.equal(peterChanel[0].geo.indicative_only,true);
assert.ok(peterChanel[0].sections.some(section=>/Saint Peter Chanel/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const ugwogo=filterExploreItems(projection.byLens.pilgrimages,{query:"Ugwogo"});
assert.equal(ugwogo.length,1);
assert.equal(ugwogo[0].map_publishable,true);
assert.ok(ugwogo[0].sections.some(section=>/Perpetual Help/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const umuaka=filterExploreItems(projection.byLens.shrines,{query:"Nne Enyemaka"});
assert.equal(umuaka.length,1);
assert.equal(umuaka[0].map_publishable,true);
const namugongo=filterExploreItems(projection.byLens.pilgrimages,{query:"Namugongo"});
assert.equal(namugongo.length,1);
assert.ok(namugongo[0].sections.some(section=>/Uganda Martyrs Day/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const munyonyo=filterExploreItems(projection.byLens.pilgrimages,{query:"Munyonyo"});
assert.equal(munyonyo.length,1);
assert.ok(munyonyo[0].sections.some(section=>/Uganda Martyrs/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const guadalupeMx=filterExploreItems(projection.byLens.pilgrimages,{query:"Santa María de Guadalupe"});
assert.equal(guadalupeMx.length,1);
assert.equal(guadalupeMx[0].map_publishable,true);
assert.ok(guadalupeMx[0].sections.some(section=>/Guadalupe/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const zapopan=filterExploreItems(projection.byLens.pilgrimages,{query:"Zapopan"});
assert.equal(zapopan.length,2);
assert.ok(zapopan.every(item=>item.map_publishable===true));
assert.ok(zapopan.some(item=>item.sections.some(section=>/Romería de Zapopan/.test(section.title)&&/Resolved by Calendar/.test(section.body))));

const aparecida=filterExploreItems(projection.byLens.pilgrimages,{query:"Aparecida"});
assert.equal(aparecida.length,1);
assert.equal(aparecida[0].map_publishable,true);
assert.ok(aparecida[0].sections.some(section=>/Aparecida/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const cirio=filterExploreItems(projection.byLens.pilgrimages,{query:"Círio de Nazaré"});
assert.equal(cirio.length,1);
assert.equal(cirio[0].map_publishable,true);
assert.ok(cirio[0].sections.some(section=>/second Sunday of October/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const lasLajas=filterExploreItems(projection.byLens.pilgrimages,{query:"Las Lajas"});
assert.equal(lasLajas.length,1);
assert.equal(lasLajas[0].map_publishable,true);
assert.ok(lasLajas[0].sections.some(section=>/Las Lajas/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const chiquinquira=filterExploreItems(projection.byLens.pilgrimages,{query:"Chiquinquirá"});
assert.equal(chiquinquira.length,1);
assert.equal(chiquinquira[0].map_publishable,true);
assert.ok(chiquinquira[0].sections.some(section=>/Chiquinquirá/.test(section.title)&&/Resolved by Calendar/.test(section.body)));


const banneux=filterExploreItems(projection.byLens.pilgrimages,{query:"Banneux"});
assert.equal(banneux.length,1);
assert.equal(banneux[0].map_publishable,true);
assert.ok(banneux[0].sections.some(section=>/first apparition at Banneux/i.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const beauraing=filterExploreItems(projection.byLens.pilgrimages,{query:"Beauraing"});
assert.equal(beauraing.length,1);
assert.equal(beauraing[0].map_publishable,true);

const svataHora=filterExploreItems(projection.byLens.pilgrimages,{query:"Svatá Hora"});
assert.equal(svataHora.length,1);
assert.equal(svataHora[0].map_publishable,true);
assert.ok(svataHora[0].sections.some(section=>/Assumption season/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const wenceslas=filterExploreItems(projection.byLens.pilgrimages,{query:"Wenceslas"});
assert.equal(wenceslas.length,1);
assert.equal(wenceslas[0].map_publishable,true);
assert.ok(wenceslas[0].sections.some(section=>/National St Wenceslas Pilgrimage/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const heiloo=filterExploreItems(projection.byLens.pilgrimages,{query:"Heiloo"});
assert.equal(heiloo.length,1);
assert.equal(heiloo[0].map_publishable,true);
assert.ok(heiloo[0].sections.some(section=>/First Saturday pilgrimage at Heiloo/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const maastricht=filterExploreItems(projection.byLens.pilgrimages,{query:"Sterre der Zee"});
assert.equal(maastricht.length,1);
assert.equal(maastricht[0].map_publishable,true);
assert.ok(maastricht[0].sections.some(section=>/Sterre der Zee diocesan-feast walking pilgrimage/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

// Name search now legitimately returns distinct global Fátima sanctuaries; anchor the Portugal-specific historic case by canonical Place.
const fatima=filterExploreItems(projection.byLens.pilgrimages,{query:"Fátima"}).filter(item=>item.place_id==="place:PT:fatima-sanctuary");
assert.equal(fatima.length,1);
assert.equal(fatima[0].map_publishable,true);
assert.ok(fatima[0].sections.some(section=>/13 May anniversary pilgrimage at Fátima/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const sameiro=filterExploreItems(projection.byLens.pilgrimages,{query:"Sameiro"});
assert.equal(sameiro.length,1);
assert.equal(sameiro[0].map_publishable,true);
assert.ok(sameiro[0].sections.some(section=>/Archdiocesan pilgrimage to Sameiro/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));
assert.ok(sameiro[0].sections.some(section=>/Feast of Our Lady of Sameiro/.test(section.title)&&/Resolved by Calendar/.test(section.body)));


const bermontShrine=filterExploreItems(projection.byLens.shrines,{query:"Bermont"});
assert.ok(bermontShrine.some(item=>item.source_id==="shrine:FR:bermont-greux"),"historical Bermont sanctuary missing from expanded shrine search");
assert.equal(bermontShrine[0].map_publishable,true);
assert.equal(bermontShrine[0].map_state,"MAPPED");

const arcachonShrine=filterExploreItems(projection.byLens.shrines,{query:"Notre-Dame des Marins"});
assert.equal(arcachonShrine.length,1);
assert.equal(arcachonShrine[0].map_publishable,true);

const pontmainShrine=filterExploreItems(projection.byLens.shrines,{query:"Notre-Dame de Pontmain"});
assert.equal(pontmainShrine.length,1);
assert.equal(pontmainShrine[0].map_publishable,true);
const pontmainAnniversary=filterExploreItems(projection.byLens.pilgrimages,{query:"Pontmain Apparition Anniversary"});
assert.equal(pontmainAnniversary.length,1);
assert.ok(pontmainAnniversary[0].sections.some(section=>/Anniversary of the apparition at Pontmain/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const pontmainAssumption=filterExploreItems(projection.byLens.pilgrimages,{query:"Pontmain Assumption"});
assert.equal(pontmainAssumption.length,1);
assert.ok(pontmainAssumption[0].sections.some(section=>/Assumption/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const pellevoisinAnnual=filterExploreItems(projection.byLens.pilgrimages,{query:"Grand Annual Pilgrimage to Pellevoisin"});
assert.equal(pellevoisinAnnual.length,1);
assert.ok(pellevoisinAnnual[0].sections.some(section=>/last weekend of August/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const montligeonCiel=filterExploreItems(projection.byLens.pilgrimages,{query:"Pèlerinages du Ciel"});
assert.equal(montligeonCiel.length,1);
assert.ok(montligeonCiel[0].sections.some(section=>/Pèlerinages du Ciel/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const rueDuBacPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Rue du Bac"});
assert.equal(rueDuBacPilgrimage.length,1);
assert.equal(rueDuBacPilgrimage[0].map_publishable,true);
assert.ok(rueDuBacPilgrimage[0].sections.some(section=>/Médaille Miraculeuse/.test(section.title)&&/Resolved by Calendar/.test(section.body)));


const wigratzbadShrine=filterExploreItems(projection.byLens.shrines,{query:"Wigratzbad"});
assert.equal(wigratzbadShrine.length,1);
assert.equal(wigratzbadShrine[0].map_publishable,true);

const ambergBergfest=filterExploreItems(projection.byLens.pilgrimages,{query:"Maria Hilf Bergfest"});
assert.equal(ambergBergfest.length,1);
assert.ok(ambergBergfest[0].sections.some(section=>/Maria Hilf principal feast/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const nussdorfRitt=filterExploreItems(projection.byLens.pilgrimages,{query:"Nußdorf Leonhardiritt"});
assert.equal(nussdorfRitt.length,1);
assert.ok(nussdorfRitt[0].sections.some(section=>/Nußdorf Leonhardiritt/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const frielingsdorf=filterExploreItems(projection.byLens.pilgrimages,{query:"St. Apollinaris Octave"});
assert.equal(frielingsdorf.length,1);
assert.ok(frielingsdorf[0].sections.some(section=>/Saint Apollinaris/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const bettbrunnPreith=filterExploreItems(projection.byLens.pilgrimages,{query:"Preith Foot Pilgrimage"});
assert.equal(bettbrunnPreith.length,1);
assert.ok(bettbrunnPreith[0].sections.some(section=>/weekend after Ascension/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const vesperbild=filterExploreItems(projection.byLens.pilgrimages,{query:"Maria Vesperbild"});
assert.equal(vesperbild.length,1);
assert.ok(vesperbild[0].sections.some(section=>/13th of every month/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));


const oswegoShrine=filterExploreItems(projection.byLens.shrines,{query:"St. Mary of the Assumption Parish and Shrine"});
assert.equal(oswegoShrine.length,1);
assert.equal(oswegoShrine[0].map_publishable,true);

const restorationPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Pilgrimage for Restoration"});
assert.equal(restorationPilgrimage.length,1);
assert.equal(restorationPilgrimage[0].map_publishable,true);
assert.ok(restorationPilgrimage[0].sections.some(section=>/annual September dates/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));
const restorationCustom=filterExploreItems(projection.byLens.traditions,{query:"Chartres"});
assert.ok(restorationCustom.some(item=>item.source_id==="att:DEV-006:AURIESVILLE-RESTORATION"));

const stockbridgeMercy=filterExploreItems(projection.byLens.pilgrimages,{query:"Divine Mercy Sunday Pilgrimage"});
assert.equal(stockbridgeMercy.length,1);
assert.equal(stockbridgeMercy[0].map_publishable,true);
assert.ok(stockbridgeMercy[0].sections.some(section=>/Divine Mercy Sunday/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const laSaletteShrine=filterExploreItems(projection.byLens.shrines,{query:"La Salette"});
assert.ok(laSaletteShrine.some(item=>item.source_id==="shrine:US:la-salette-attleboro"),"US La Salette replica shrine lost its original identity");
assert.equal(laSaletteShrine.find(item=>item.source_id==="shrine:US:la-salette-attleboro").map_publishable,true,"US La Salette must use its own source-backed Attleboro complex point, never France GPS");
assert.ok(laSaletteShrine.some(item=>item.place_id==="place:FR:notre-dame-la-salette-fallavaux"),"French original sanctuary absent from expanded search");

const litchfieldShrine=filterExploreItems(projection.byLens.shrines,{query:"Lourdes in Litchfield"});
assert.equal(litchfieldShrine.length,1);
assert.equal(litchfieldShrine[0].map_publishable,true);

const fiskdaleNovena=filterExploreItems(projection.byLens.pilgrimages,{query:"Annual St. Anne Novena"});
assert.equal(fiskdaleNovena.length,1);
assert.equal(fiskdaleNovena[0].map_publishable,true);
assert.ok(fiskdaleNovena[0].sections.some(section=>/18–26 July/.test(section.title)&&/Resolved by Calendar/.test(section.body)));


const browserSource=readFileSync("src/find/browser-entry.js","utf8");
assert.match(browserSource,/loadExploreDataset/);
assert.match(browserSource,/projectExploreDataset/);
assert.match(browserSource,/mountExploreMap/);
assert.match(browserSource,/lens:"heritage"/,"the default Explore lens must be the unified heritage map");
assert.match(browserSource,/data-explore-open-novena/,"Explore lost Novena deep-link click handling");
assert.match(browserSource,/AO_PRAY_V435930\?\.open\?\.\("pray\.novenas"/,"Explore no longer opens the canonical PRAY Novena owner");
assert.match(browserSource,/ensureLearnModule\("learn\.glossary",win\)/,"Cold Explore Glossary must load its canonical owner");
assert.match(browserSource,/actionError\(/,"Explore deferred action failures must be visible");
assert.doesNotMatch(browserSource,/Sanctuaire Notre-Dame de Lourdes|Paray-le-Monial|Notre-Dame de Laghet/,"Explore browser owner hardcodes corpus places");

const novenaRuntimeSource=readFileSync("src/pray/novena-runtime.js","utf8");
assert.match(novenaRuntimeSource,/opts\?\.novenaId/,"Novenas stopped accepting Explore deep-link identity");
assert.match(novenaRuntimeSource,/data-n1-explore/,"Novena detail stopped linking back into Explore");
assert.match(novenaRuntimeSource,/AO_APP_SHELL_V1\?\.navigate\?\.\('find'\)/,"Novena context must first activate canonical Explore route");
assert.match(novenaRuntimeSource,/result\?\.ok===true\?window\.AO_FIND_APP_V1\?\.open\?\.\(\{lens:'traditions',view:'list',query\}\)/,"Novena context deep link must be gated by successful navigation");
assert.match(novenaRuntimeSource,/Object\.keys\(CORPUS\)\.length===16/,"Novena QA still assumes the obsolete 12-target corpus");

const homeSource=readFileSync("src/home/presentation.js","utf8");
assert.match(homeSource,/Traditional Masses, shrines and pilgrimages/);
assert.match(homeSource,/Traditions through the year/);
assert.match(homeSource,/Read customs and their sources in Calendar/);
assert.match(homeSource,/data-home-find/,"Explore route lost shell-compatible Home trigger");



// Expected values are derived from the customs seed, not frozen.
const placeAttestations=customsSeed.attestations.filter(row=>row.map_policy==="PLACE");
const attestationsPerCustom=id=>customsSeed.attestations.filter(row=>row.custom_id===id).length;
const canonicalCustomIds=new Set(customsSeed.attestations.map(row=>row.custom_id));
const atlasMappedTraditions=projection.byLens.traditions.filter(item=>item.kind==="CUSTOM_ATTESTATION"&&item.map_publishable);
assert.deepEqual(atlasMappedTraditions.map(item=>item.source_id).sort(),placeAttestations.map(row=>row.attestation_id).sort(),
  "exactly the site-specific (PLACE) customs attestations have pins");
assert.equal(exploreMapFeatures(atlasMappedTraditions).length,atlasMappedTraditions.length,"customs map feature count diverged from published attestations");
const atlasUngrounded=projection.byLens.traditions.filter(item=>item.kind==="CUSTOM_ATTESTATION"&&!item.map_publishable&&item.raw?.attestation?.map_policy==="PLACE");
assert.deepEqual(atlasUngrounded.map(item=>item.place_id).sort(),[],"all exact-site attestations have actual or indicative pins");


const customsAtlasItems=projection.byLens.traditions;
const unattestedCustoms=customsSeed.customs.map(row=>row.custom_id).filter(id=>!canonicalCustomIds.has(id));
assert.deepEqual(unattestedCustoms,[],"a canonical custom without any attestation would be invisible in Explore");
assert.equal(countCanonicalTraditions(customsAtlasItems),canonicalCustomIds.size,"every attested custom remains independently canonical");
const practiceBrowse=groupTraditionsForBrowse(customsAtlasItems);
const practiceCount=canonicalCustomIds.size;
assert.ok(practiceBrowse.some(item=>item.source_id==="BLSS-001"),"St Blaise must be discoverable as one canonical non-map tradition");
assert.ok(customsAtlasItems.some(item=>item.raw?.custom?.custom_id==="BLSS-001"&&item.map_publishable===false),"St Blaise must not manufacture a map pin");
assert.equal(practiceBrowse.length,practiceCount,"list should not turn attestations or novena context links into separate practices");
assert.ok(practiceBrowse.every(item=>item.kind==="CANONICAL_CUSTOM"&&!item.map_publishable),"canonical practices are not map pins");
assert.ok(practiceBrowse.every(item=>item.facts.every(fact=>fact.label!=="Class")),"geographically mixed legacy classification must not appear as exclusive nationality");
assert.ok(customsAtlasItems.filter(item=>item.kind==="CUSTOM_ATTESTATION").every(item=>item.facts.every(fact=>fact.label!=="Class")),"place-specific evidence must not promote unreviewed national classification");
const pilgrimagePractice=practiceBrowse.find(item=>item.source_id==="DEV-006");
assert.equal(pilgrimagePractice.attestation_examples.length,attestationsPerCustom("DEV-006"),"global and place-level pilgrimage evidence stays with its practice");
assert.ok(pilgrimagePractice.attestation_examples.some(example=>example.title==="World"),"worldwide attestation must not be lost");
const regionalPardons=practiceBrowse.find(item=>item.source_id==="DEV-007");
assert.equal(regionalPardons.attestation_examples.length,attestationsPerCustom("DEV-007"),"local examples belong under one practice");
assert.ok(regionalPardons.attestation_examples.some(example=>example.place_id),"source-linked places remain navigable");
const holyWater=practiceBrowse.find(item=>item.source_id==="DOM-002");
assert.equal(holyWater.attestation_examples.length,attestationsPerCustom("DOM-002"),"one-locality customs remain one practice");
const searchedContexts=groupTraditionsForBrowse(customsAtlasItems,{includeNovenaContext:true});
assert.equal(searchedContexts.length,practiceCount+novenaBridge.links.length,"novena contextual links should remain accessible through search/context");
assert.equal(new Set(practiceBrowse.map(item=>item.item_id)).size,practiceCount,"canonical practice identities must be unique");
const practiceVm=buildExploreViewModel({
  language:"en",items:practiceBrowse,lens:"traditions",counts:{...projection.counts,traditions:practiceCount},
  view:"list",filters:{},selectedId:"tradition:custom:DEV-007",expandDetail:true,
});
const practiceHtml=renderExploreToString(practiceVm);
assert.match(practiceHtml,/data-explore-item="tradition:custom:DEV-007"/);
assert.match(practiceHtml,new RegExp("Documented examples.*"+attestationsPerCustom("DEV-007")));
assert.match(practiceHtml,/data-explore-open-place=/,"examples must deep-link to canonical Places");
assert.match(practiceHtml,/Attested places/,"map is supplementary evidence navigation, not the default customs structure");
assert.match(practiceHtml,new RegExp(">"+practiceCount+"</strong><span>practices"),"list count must describe practices, not attestations");


for(const guide of [...customGuidance.entries,...customGuidanceP1.entries]){
  const item=practiceBrowse.find(x=>x.source_id===guide.custom_id);
  assert.ok(item,"Missing guidance owner in Explore: "+guide.custom_id);
  assert.equal(item.item_id,"tradition:custom:"+guide.custom_id);
  assert.equal(item.title_fr,guide.title_fr);
  assert.equal(item.summary,guide.description_en);
  assert.equal(item.summary_fr,guide.description_fr);
  assert.equal(item.map_publishable,false);
  assert.equal(item.attestation_examples.length,1);
  assert.ok(item.source_links.some(x=>customSources.sources.some(y=>y.id===guide.source_ids[0]&&y.url===x.url)),"No source link "+guide.custom_id);
  assert.ok(item.sections.some(x=>x.label==="Meaning"&&x.body===guide.meaning_en&&x.body_fr===guide.meaning_fr));
  assert.ok(item.sections.some(x=>x.label==="Optional observance"&&x.body===guide.how_en&&x.body_fr===guide.how_fr));
  assert.ok(item.sections.some(x=>x.label==="Pastoral context"&&x.body_fr===guide.caution_fr),"French caution must be visible");
  for(const language of ["en","fr"]){
    const vm=buildExploreViewModel({
      language,items:practiceBrowse,lens:"traditions",counts:{...projection.counts,traditions:practiceCount},
      view:"list",filters:{},selectedId:item.item_id,expandDetail:true,
    });
    const html=renderExploreToString(vm);
    const title=language==="fr"?guide.title_fr:guide.title_en;
    const summary=language==="fr"?guide.description_fr:guide.description_en;
    const meaning=language==="fr"?guide.meaning_fr:guide.meaning_en;
    const how=language==="fr"?guide.how_fr:guide.how_en;
    assert.ok(html.includes(title.replaceAll("&","&amp;").replaceAll("'","&#039;").replaceAll('"',"&quot;")),"Missing translated heading "+guide.custom_id);
    assert.ok(html.includes(summary.replaceAll("&","&amp;").replaceAll("'","&#039;").replaceAll('"',"&quot;")),"Missing full description "+guide.custom_id);
    assert.ok(html.includes(meaning.replaceAll("&","&amp;").replaceAll("'","&#039;").replaceAll('"',"&quot;")),"Missing meaning "+guide.custom_id);
    assert.ok(html.includes(how.replaceAll("&","&amp;").replaceAll("'","&#039;").replaceAll('"',"&quot;")),"Missing optional observance "+guide.custom_id);
    assert.match(html,/<section class="aoFindSources"><small>SOURCES<\/small>/,"Canonical custom must show its source links");
    assert.doesNotMatch(html,/data-explore-open-place="(?:geo:country|(?:place:))/,"Do not invent a national map pin");
  }
}
assert.ok(customGuidance.entries.length>0,"P0 customs guidance must not be empty");

const atlasFacets=buildCustomsAtlasFacets(customsAtlasItems);
assert.ok(atlasFacets.families.some(option=>option.value==="Sacred Heart"),"theme browsing must be independent of geography");
const sacredHeartFamily=filterCustomsAtlasItems(customsAtlasItems,{atlasFamily:"Sacred Heart"});
assert.ok(sacredHeartFamily.length>0&&sacredHeartFamily.every(item=>item.raw?.custom?.family==="Sacred Heart"),"theme filter must not infer a country");
assert.equal(groupTraditionsForBrowse(sacredHeartFamily).length,customsSeed.customs.filter(row=>row.family==="Sacred Heart").length,
  "one practice per Sacred Heart custom, not several country records");
assert.ok(atlasFacets.areas.some(option=>option.value==="geo:country:FR"&&option.label==="France"),"French customs geography disappeared");
assert.ok(atlasFacets.periods.some(option=>option.value==="Historical; largely declined"),"source-owned historical period was lost");
assert.ok(atlasFacets.calendar.some(option=>option.value==="HINT:May"),"documented May Marian context was lost");
assert.ok(atlasFacets.calendar.some(option=>option.value==="NOVENA"),"Novena context filter was lost");
const atlasFrance=filterCustomsAtlasItems(customsAtlasItems,{atlasArea:"geo:country:FR"});
assert.ok(atlasFrance.length>0&&atlasFrance.length<customsAtlasItems.length);
assert.ok(atlasFrance.every(item=>(item.raw?.attestation??item.raw?.link)?.geo_area_id==="geo:country:FR"));
const atlasHistorical=filterCustomsAtlasItems(customsAtlasItems,{atlasPeriod:"Historical; largely declined"});
assert.ok(atlasHistorical.length>0&&atlasHistorical.every(item=>item.raw?.custom?.custom_id==="FOOD-001"),"historical facet must use the recorded period, not fabricated chronology");
const atlasMay=filterCustomsAtlasItems(customsAtlasItems,{atlasCalendar:"HINT:May"});
assert.ok(atlasMay.length>0&&atlasMay.every(item=>item.raw?.custom?.custom_id==="DEV-001"));
const atlasNovenas=filterCustomsAtlasItems(customsAtlasItems,{atlasCalendar:"NOVENA"});
assert.ok(atlasNovenas.some(item=>item.kind==="NOVENA_CONTEXT"));
assert.ok(atlasNovenas.some(item=>item.kind==="CUSTOM_ATTESTATION"&&item.actions.some(action=>action.novena_id)));
const atlasLourdes=filterCustomsAtlasItems(customsAtlasItems,{query:"Lourdes",atlasArea:"geo:country:FR"});
assert.ok(atlasLourdes.length>0&&atlasLourdes.every(item=>item.search_text.includes("lourdes")),"geography and search must compose");
assert.equal(filterCustomsAtlasItems(customsAtlasItems,{atlasArea:"INVALID"}).length,0);
assert.equal(filterCustomsAtlasItems(customsAtlasItems,{atlasCalendar:"HINT:UNSOURCED"}).length,0);
assert.equal(exploreMapFeatures(atlasFrance).every(feature=>feature.geometry.type==="Point"),true);
assert.ok(customsAtlasItems.some(item=>!item.map_publishable),"unmapped source records must stay discoverable");
const atlasVm=buildExploreViewModel({
  language:"en",items:customsAtlasItems,lens:"traditions",counts:projection.counts,
  atlasFacets,view:"map",
  filters:{atlasArea:"geo:country:FR",atlasPeriod:"ANY",atlasCalendar:"NOVENA"},
});
const atlasHtml=renderExploreToString(atlasVm);
// The 1962 Calendar is the public Customs owner. Keep a legacy exact-record reader,
 // but no geographic Atlas controls or public Explore nav destination.
assert.match(atlasHtml,/Customs belong in the Calendar/);
assert.match(atlasHtml,/data-explore-customs-calendar/);
assert.doesNotMatch(atlasHtml,/data-atlas-filter=/);
assert.doesNotMatch(atlasHtml,/data-atlas-clear/);
assert.doesNotMatch(atlasHtml,/data-find-filter-value="traditions"/);
const atlasFrHtml=renderExploreToString(buildExploreViewModel({
  language:"fr",items:atlasFrance,lens:"traditions",counts:projection.counts,
  atlasFacets,filters:{atlasArea:"ANY",atlasPeriod:"ANY",atlasCalendar:"ANY"},view:"list",
}));
assert.match(atlasFrHtml,/Les coutumes se découvrent dans le calendrier/);
assert.match(atlasFrHtml,/Lire les coutumes au fil de l’année/);
assert.doesNotMatch(atlasFrHtml,/Atlas des coutumes/);
assert.doesNotMatch(shrineHtml,/data-atlas-filter=/);
assert.match(browserSource,/filterCustomsAtlasItems/);
assert.match(browserSource,/addEventListener\?\.\("change",onChange,true\)/);
assert.match(browserSource,/options\?\.view==="map"/);
assert.doesNotMatch(homeSource,/data-home-customs-atlas/,"The Home route must no longer invite users into a geographical Customs Atlas");
assert.match(homeSource,/data-home-calendar data-home-calendar-view="day"/,"Home traditions must use the existing Calendar");
const homeOwnerSource=readFileSync("src/home/browser-entry.js","utf8");
assert.doesNotMatch(homeOwnerSource,/data-home-customs-atlas|openCustomsAtlas/);
assert.match(homeOwnerSource,/id==="find.traditions"\)return navigateHomeShortcut\("calendar"/,"old bookmarks must route to Calendar");


// Unified map is derived from source-owned Place IDs, not from coordinate proximity.
// Each documented site appears once even when it has multiple independent claims.
const heritagePlaces=projectHeritagePlaces(projection);
assert.deepEqual(HERITAGE_CATEGORIES,["shrines","relics","pilgrimages","apparitions","traditions"]);
const mappedShrinePlaceIds=new Set(projection.byLens.shrines.filter(item=>item.map_publishable).map(item=>item.place_id));
const heritagePlaceIds=new Set(heritagePlaces.map(item=>item.place_id));
assert.deepEqual([...mappedShrinePlaceIds].filter(id=>!heritagePlaceIds.has(id)),[],"mapped shrine places must survive the unified projection");
assert.equal(new Set(heritagePlaces.map(item=>item.place_id)).size,heritagePlaces.length,"unified map duplicated a physical Place");
assert.equal(exploreMapFeatures(heritagePlaces).length,heritagePlaces.length,"unified Place points must remain source-backed");
const lourdesCombined=heritagePlaces.find(item=>item.place_id===lourdesShrine[0].place_id);
assert.ok(lourdesCombined,"Lourdes was dropped by the unified map");
assert.ok(lourdesCombined.heritage_categories.includes("shrines"),"Lourdes shrine relationship lost");
assert.ok(lourdesCombined.heritage_categories.includes("pilgrimages"),"pilgrimage records should share the Lourdes Place pin");
const onlyRelics=projectHeritagePlaces(projection,{categories:["relics"]});
assert.ok(onlyRelics.length>0&&onlyRelics.length<=projection.byLens.relics.length);
assert.ok(onlyRelics.every(item=>item.heritage_categories.length===1&&item.heritage_categories[0]==="relics"),"relic filter leaked another category");
const onlyCustomSites=projectHeritagePlaces(projection,{categories:["traditions"]});
const placeAttestationPlaceIds=new Set(placeAttestations.map(row=>row.place_id));
assert.ok(onlyCustomSites.length>0&&onlyCustomSites.every(item=>placeAttestationPlaceIds.has(item.place_id)),"customs must map only genuine PLACE attestations");
const globalCustom=projectHeritagePlaces(projection,{categories:["traditions"],customId:"DEV-006"});
const dev006PlacePins=new Set(placeAttestations.filter(row=>row.custom_id==="DEV-006").map(row=>row.place_id));
assert.ok(globalCustom.every(item=>dev006PlacePins.has(item.place_id)),"the global pilgrimage custom cannot create a pin per abstract area");
assert.ok(globalCustom.every(item=>item.heritage_categories.includes("traditions")),"custom selection must not turn on other categories");
assert.equal(projectHeritagePlaces(projection,{categories:[],query:""}).length,0,"empty map category filter must not show pins");
const heritageCustoms=heritageCustomCards(practiceBrowse);
assert.equal(heritageCustoms.length,practiceCount,"all canonical practices must be available without a geographical list");
assert.equal(heritageCustomCards(practiceBrowse,{enabled:false}).length,0);
const heritageVm=buildExploreViewModel({
  language:"en",lens:"heritage",view:"map",items:heritagePlaces,
  filters:{query:"",heritageCategories:["shrines","relics","pilgrimages","apparitions"],highlightCustomId:null},
  customCards:[],counts:{...projection.counts,heritage:heritagePlaces.length},
});
const heritageHtml=renderExploreToString(heritageVm);
assert.match(heritageHtml,/Sacred places/);
assert.match(heritageHtml,/data-find-view="map"/);
assert.match(heritageHtml,/data-heritage-category="ALL"/);
for(const category of ["shrines","relics","pilgrimages","apparitions"])
  assert.match(heritageHtml,new RegExp('data-heritage-category="'+category+'"'));
assert.doesNotMatch(heritageHtml,/data-heritage-category="traditions"|aoHeritageCustomRail/,"geographic Customs browsing was retired");
assert.doesNotMatch(heritageHtml,/data-find-filter-value="traditions"/,"Explore menus cannot reopen Atlas");
assert.match(heritageHtml,/data-bible-atlas-open/,"Biblical Atlas remains a separate intact feature");
assert.doesNotMatch(heritageHtml,/class="aoFindList"/,"map-first Explore must not default to a result list");
assert.match(heritageHtml,/data-heritage-nearby/,"map-first discovery must support user-requested nearby recentering");
assert.match(heritageHtml,/aoHeritageMapHint/,"initial screen should explain pin interaction without a long list");
assert.match(heritageHtml,/data-heritage-world/,"a world-view recovery control is required");
assert.ok(heritageHtml.indexOf('class="aoHeritageTools"')<heritageHtml.indexOf('class="aoHeritageCategories"'),"search must appear before the category filters");
assert.match(heritageHtml,/aoHeritageMore/,"technical record lists should be behind Browse");
assert.equal((heritageHtml.match(/data-find-glossary/g)||[]).length,1,"Glossary should have one visible entry beside search");
assert.match(heritageHtml,/aoHeritageGlossaryButton/);
assert.match(heritageHtml,/data-find-filter-value="tlm"/,"Mass map shortcut remains reachable in Browse");
assert.doesNotMatch(heritageHtml,/aoHeritageSearchResults/,"unfiltered launch must not display search results");
const searchableMap=projectHeritagePlaces(projection,{query:"Lourdes"});
const searchHtml=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"heritage",view:"map",items:searchableMap,
  filters:{query:"Lourdes",heritageCategories:[...HERITAGE_CATEGORIES]},
}));
assert.match(searchHtml,/aoHeritageSearchResults/,"matching sites need a compact navigable search surface");
assert.match(searchHtml,/data-explore-open-place=/,"search matches must open the canonical Place, not duplicate place records");
assert.ok((searchHtml.match(/data-explore-open-place=/g)||[]).length<=6,"mobile search must not become an unbounded list");
assert.doesNotMatch(searchHtml,/class="aoFindList"/,"search must remain map-first");

const placeProfiles=buildExplorePlaceProfiles(dataset,projection);
const featuredPlaces=placeProfiles.filter(p=>p.editorial_feature&&p.map_publishable&&p.sources.length)
  .sort((a,b)=>a.editorial_feature.ordinal-b.editorial_feature.ordinal);
assert.ok(featuredPlaces.length>=12,"Editorial list should expose numerous actual source-backed map Places");
assert.ok(featuredPlaces.every(p=>p.sources.some(source=>source.url)),"No unsourced editorial Place should be featured");
const featuredMenu=renderExploreToString(buildExploreViewModel({
 language:"en",lens:"heritage",view:"map",items:heritagePlaces,featuredPlaces,
 filters:{heritageCategories:[...HERITAGE_CATEGORIES]}
}));
assert.match(featuredMenu,/aoHeritageFeatured/);
assert.match(featuredMenu,/data-explore-open-place="place:FR:sanctuaire-notre-dame-de-lourdes"/);
assert.doesNotMatch(featuredMenu,/aoExploreMainDestinations/);
const invalidFeatured=buildExplorePlaceProfiles({...dataset,editorial:{featured:[{place_id:featuredPlaces[0].place_id,source_id:"UNRELATED"}]}},projection);
assert.equal(invalidFeatured.find(p=>p.place_id===featuredPlaces[0].place_id).editorial_feature,null,"A mismatched source must never yield editorial promotion");
const heritagePreview=renderExploreToString(buildExploreViewModel({
  language:"fr",lens:"heritage",view:"map",items:heritagePlaces,
  filters:{heritageCategories:[...HERITAGE_CATEGORIES]},
  selectedPlaceId:lourdesCombined.place_id,placeProfiles,featuredPlaces,
}));
assert.match(heritagePreview,/data-explore-expand-place/,"map click must open compact Place preview");
assert.match(heritagePreview,/Découvrir/);
assert.match(heritagePreview,/data-explore-sheet-toggle/);
assert.match(heritagePreview,/data-explore-calendar-date/);
assert.match(heritagePreview,/data-explore-open-novena/);
assert.match(heritagePreview,/aoHeritageEditorialPreview/);
assert.match(heritagePreview,/À DÉCOUVRIR/);
assert.doesNotMatch(heritagePreview,/<img/,"Unapproved site photographs must not appear in the compact card");
assert.match(heritagePreview,/aoHeritageCardHeading/,"place preview should show its type and location compactly");
assert.match(heritagePreview,/aoHeritageCardTitle/,"place name must be the main visual identity");
assert.doesNotMatch(heritagePreview,/aoHeritageCaution/,"source qualifications belong in the expanded record, not the small card");
assert.doesNotMatch(heritagePreview,/class="aoExplorePlaceRows"/,"Place preview must not open a dense record listing immediately");
assert.match(heritagePreview,/aoHeritageSynopsis/,"sourced place explanation must be the salient preview");
assert.doesNotMatch(heritagePreview,/class="aoFindFacts"/,"place previews should not be numerical dashboards");
assert.match(heritagePreview,/data-find-close-place/,"Place preview must be dismissible");

const expandedPlace=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"heritage",view:"map",items:heritagePlaces,
  filters:{heritageCategories:[...HERITAGE_CATEGORIES]},
  selectedPlaceId:lourdesCombined.place_id,placeProfiles,expandPlace:true,
}));
assert.match(expandedPlace,/data-explore-place-item=/,"expanded Place must retain original source-owned records");
assert.match(expandedPlace,/aoExploreSourcedStory/,"featured Place should open with a source-cited, multi-stage story");
assert.match(expandedPlace,/aoExploreStoryEvidence/,"each editorial paragraph needs a direct original source");
assert.match(expandedPlace,/data-story-kind="ORIGIN"/);
assert.match(expandedPlace,/data-story-kind="PILGRIMAGE"/);
assert.doesNotMatch(expandedPlace,/The linked institution records this mary apparition/,"generic evidence placeholder is not editorial narrative");
assert.match(expandedPlace,/aoExplorePlaceEditorial/);
assert.match(expandedPlace,/aoExplorePlaceChapters/);
assert.match(expandedPlace,/data-explore-place-jump="story"/);
assert.match(expandedPlace,/data-explore-place-jump="pray"/);
assert.match(expandedPlace,/data-explore-place-jump="sources"/);
assert.doesNotMatch(expandedPlace,/aoExplorePlaceMedia/,"Unapproved site images must not be inserted into Place pages");
assert.match(expandedPlace,/class="aoPlaceAccordion"/,"long evidence lists should be opt-in disclosures");
assert.doesNotMatch(expandedPlace,/class="aoFindFacts"/,"expanded Place should not open with numeric record counters");
assert.match(expandedPlace,/Sources and geographic evidence/,"original evidence must remain one tap away");



const mixedProfile={
  place_id:"place:FR:mixed-test",name:"Mixed Sacred Place",
  address:{city:"Lourdes",region:"Occitanie",country:"France"},
  counts:{"shrines":1,"relics":1},geo:{precision:"site"},
  shrines:[{summary:"SHRINE INTRO ORIGINAL"}],
  relics:[{summary:"RELIC INTRO ORIGINAL",summary_fr:"INTRO RELIQUE FRANÇAISE"}],
};
assert.equal(sacredPlaceSynopsis(mixedProfile,{preferredCategory:"relics"}),"RELIC INTRO ORIGINAL");
assert.equal(sacredPlaceSynopsis(mixedProfile,{preferredCategory:"relics",language:"fr"}),"INTRO RELIQUE FRANÇAISE");
assert.equal(sacredPlaceSynopsis({...mixedProfile,relics:[{}]},{preferredCategory:"relics"}),"",
  "missing relic synopsis must not silently substitute shrine history");
const relicPreview=compactHeritagePlaceSheet({selectedPlace:mixedProfile,language:"en",filters:{heritageCategories:["relics"]}});
assert.match(relicPreview,/RELIC INTRO ORIGINAL/);
assert.doesNotMatch(relicPreview,/SHRINE INTRO ORIGINAL/);
assert.match(relicPreview,/aoHeritageCardLayer/);
assert.match(relicPreview,/aria-modal="false"/);
assert.match(relicPreview,/Lourdes · France/);

console.log("PASS unified Explore projection, canonical customs and map-first heritage surface");
await import("./heritage-place-reconciliation.mjs");
await import("./explore-overlapping-place-pins.mjs");
await import("./explore-europe-acquisition-wave1.mjs");
await import("./explore-europe-combined-coverage.mjs");
await import("./explore-europe-three-wave-coverage.mjs");
await import("./explore-europe-national-depth-wave4.mjs");
await import("./explore-europe-four-wave-master.mjs");
await import("./explore-europe-diocesan-indices-wave5.mjs");
await import("./explore-europe-eparchy-sanctuary-wave6.mjs");
await import("./explore-europe-sparse-country-wave7.mjs");
await import("./explore-research-ownership-gates.mjs");
await import("./explore-customary-source-trace.mjs");
await import("./explore-relic-final60-open20-source.mjs");
await import("./explore-sot07-source-recovery.mjs");
await import("./explore-handoff-recovery.mjs");
await import("./explore-first-load-recovery.mjs");



const mediaRegistry=readJson("data/geography/approved-place-media.v1.json");
assert.equal(mediaRegistry.schema,"AO_APPROVED_PLACE_MEDIA_V1");
// Every approved photograph is the reviewed file, licensed, on a known Place,
// and actually reaches its Place page. (Replaces a frozen photo count.)
assertApprovedMedia(mediaRegistry,geography.places);
const mediaFixture={
  place_id:"place:FR:lourdes",status:"APPROVED",asset_path:"assets/places/lourdes.webp",
  source_url:"https://example.org/photograph",credit:"Photographer Name",license:"CC-BY-4.0",
  license_url:"https://creativecommons.org/licenses/by/4.0/",
  changes_en:"Resized and converted to WebP",changes_fr:"Redimensionnée et convertie en WebP",
  width:1200,height:900,orientation:"landscape",
  rights_verified:true,subject_verified:true,crop_reviewed:true,
  alt_en:"View of the physical sanctuary",alt_fr:"Vue du sanctuaire physique",
};
const realMedia=readJson("data/geography/approved-place-media.v1.json");
const reviewedProfiles=buildExplorePlaceProfiles({...dataset,media:{approved:realMedia.items}},projection);
const unpublishedApproved=realMedia.items.filter(item=>reviewedProfiles.find(p=>p.place_id===item.place_id)?.media?.asset_path!==item.asset_path)
  .map(item=>item.place_id);
assert.deepEqual(unpublishedApproved,[],"approved photographs must appear on their own Place page");
const reviewedLourdes=reviewedProfiles.find(p=>p.place_id==="place:FR:sanctuaire-notre-dame-de-lourdes");
for(const [placeId,filename,license] of [
 ["place:FR:pontmain","FR-pontmain-basilica-east.webp","CC-BY-SA-4.0"],
 ["place:FR:sanctuaire-notre-dame-de-laghet","FR-sanctuaire-notre-dame-de-laghet.webp","CC-BY-SA-3.0"],
 ["place:FR:sanctuary-of-our-lady-of-rocamadour","FR-sanctuary-of-our-lady-of-rocamadour.webp","CC-BY-SA-4.0"],
 ["place:IE:lough-derg-station-island","IE-lough-derg-station-island.webp","CC-BY-SA-4.0"],
 ["place:IE:croagh-patrick-murrisk-pilgrimage-base","IE-croagh-patrick-murrisk-pilgrimage-base.webp","CC-BY-SA-2.0"],
 ["place:IE:st-peters-oliver-plunkett-drogheda","IE-st-peters-oliver-plunkett-drogheda.webp","CC-BY-SA-3.0"],
]){
 const profile=reviewedProfiles.find(p=>p.place_id===placeId);
 assert.equal(profile?.media?.asset_path,"assets/approved/place-media/"+filename,
   "Exact shrine must own approved local site image, not an unrelated site: "+placeId);
 assert.equal(profile?.media?.license,license,
   "Original photographer's licence must remain visible: "+placeId);
}
assert.equal(reviewedProfiles.find(p=>p.place_id==="place:IE:solas-bhride-kildare")?.media,null,
 "No unverified nearby Brigid image may substitute for the actual Solas Bhride Centre");
assert.equal(reviewedLourdes?.media?.license,"CC-BY-SA-4.0","Exact Place should expose screened photograph");
assert.match(reviewedLourdes.media.asset_path,/^assets\/approved\/place-media\//);
assert.ok(reviewedProfiles.find(p=>p.place_id==="place:FR:chartres-notre-dame")?.media,
 "The previous portal detail must be replaced by the source-confirmed full Chartres facade");
assert.equal(reviewedProfiles.find(p=>p.place_id==="place:MU:pere-laval-sainte-croix")?.media,null,
 "Older-licence Père Laval documentary photograph remains research-only");
const reviewedPreview=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"heritage",view:"map",items:heritagePlaces,
  filters:{heritageCategories:[...HERITAGE_CATEGORIES]},
  selectedPlaceId:reviewedLourdes.place_id,placeProfiles:reviewedProfiles,
}));
assert.match(reviewedPreview,/aoHeritagePlaceThumb/,"Screened image must appear within canonical Place preview");
assert.match(reviewedPreview,/CC-BY-SA-4.0/,"Compact preview credits the photographer and licence without undersized links");
const reviewedExpanded=renderExploreToString(buildExploreViewModel({
  language:"fr",lens:"heritage",view:"map",items:heritagePlaces,
  filters:{heritageCategories:[...HERITAGE_CATEGORIES]},
  selectedPlaceId:reviewedLourdes.place_id,placeProfiles:reviewedProfiles,expandPlace:true,
}));
assert.match(reviewedExpanded,/aoExplorePlaceMedia/,"Screened image must appear in Place reading view");
assert.match(reviewedExpanded,/convertie en WebP/,"Image modification must be disclosed in French");
assert.match(reviewedExpanded,/commons.wikimedia.org/,"Image source must link to the original file");
assert.match(reviewedExpanded,/creativecommons.org\/licenses\/by-sa\/4\.0/,
  "Expanded reader must link the actual image licence");

const approved=resolveApprovedPlaceMedia([mediaFixture],mediaFixture.place_id);
assert.equal(approved.asset_path,mediaFixture.asset_path,"Approved Place media must resolve by exact identity");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,asset_path:"https://example.org/image.jpg"}],mediaFixture.place_id),null,
  "External hotlinked photos must never be published");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,asset_path:"assets/staged/place-media/lourdes.webp"}],mediaFixture.place_id),null,
  "Review-only staged photos must never be publishable");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,license_url:"https://creativecommons.org/licenses/by-sa/4.0/"}],mediaFixture.place_id),null,
  "Licence link must exactly match licence identifier");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,license_url:""}],mediaFixture.place_id),null,
  "No image without a licence URL");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,changes_en:""}],mediaFixture.place_id),null,
  "All image modifications must be disclosed");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,changes_fr:""}],mediaFixture.place_id),null,
  "French modification disclosure must be present");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,orientation:"portrait"}],mediaFixture.place_id),null,
  "Image orientation must match actual dimensions");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,rights_verified:false}],mediaFixture.place_id),null,
  "Unverified rights must fail closed");
assert.equal(resolveApprovedPlaceMedia([{...mediaFixture,alt_fr:""}],mediaFixture.place_id),null,
  "Images require bilingual alternative text");
assert.equal(resolveApprovedPlaceMedia([mediaFixture],"place:FR:other"),null,
  "A photograph must never transfer to a different physical Place");
const auditedCard=compactHeritagePlaceSheet({language:"en",
 selectedPlace:{place_id:mediaFixture.place_id,name:"Lourdes",place_type:"shrine",
  counts:{shrines:1},saints:[],novenas:[],calendar:[],geo:{},media:approved},
 filters:{heritageCategories:[...HERITAGE_CATEGORIES]}});
assert.match(auditedCard,/aoHeritagePlaceThumb/,"Approved photography must have a visible, credited card slot");
assert.match(auditedCard,/Photographer Name/);
assert.match(auditedCard,/CC-BY-4.0/,"The thumbnail credits licence in readable, noninteractive text");

const nearbyFixtures=[
  {place_id:"place:FR:lourdes",title:"Lourdes",subtitle:"France",place_type:"shrine",map_publishable:true,geo:{lat:43.09738,lng:-0.05875}},
  {place_id:"place:FR:tarbes",title:"Tarbes",subtitle:"France",place_type:"cathedral",map_publishable:true,geo:{lat:43.23,lng:0.07,precision:"complex_anchor"}},
  {place_id:"place:FR:unmapped",title:"Unmapped",map_publishable:false,geo:{lat:43.09,lng:0}},
  {place_id:"place:FR:lourdes",title:"Duplicate Lourdes",map_publishable:true,geo:{lat:43.1,lng:0}},
];
const nearest=nearbyHeritagePlaces(nearbyFixtures,{lat:43.09738,lng:-0.05875});
assert.equal(nearest.length,2,"Nearby must deduplicate and exclude unpublished markers");
assert.equal(nearest[0].place_id,"place:FR:lourdes");
assert.equal(nearest[0].distance_km,0);
assert.ok(nearest[1].distance_km>0&&nearest[1].indicative,"Nearby must expose distance and indicative precision");
assert.equal(nearbyHeritagePlaces(nearbyFixtures,{lat:null,lng:0}).length,0,"Invalid position must not resolve to equator");
assert.ok(nearbyHeritagePlaces([
  {place_id:"place:dateline",title:"Across date line",map_publishable:true,geo:{lat:0,lng:-179.9}},
],{lat:0,lng:179.9})[0].distance_km<25,"Nearby must respect the antimeridian");
const nearbyMarkup=renderExploreToString(buildExploreViewModel({
  language:"en",lens:"heritage",view:"map",items:nearbyFixtures,nearby:nearest,
  filters:{heritageCategories:[...HERITAGE_CATEGORIES]},
}));
assert.match(nearbyMarkup,/aoHeritageNearbyPanel/,"Nearby needs discoverable source-backed results");
assert.match(nearbyMarkup,/Straight-line|straight-line/,"Nearby distances must not be mistaken for driving time");
assert.match(nearbyMarkup,/data-explore-open-place="place:FR:lourdes"/);
assert.doesNotMatch(nearbyMarkup,/data-heritage-nearby aria-label/,"Nearby panel must not overlap the geolocation action");
const classifiedFeatures=exploreMapFeatures([{
  item_id:"heritage:place:FR:tarbes",place_id:"place:FR:tarbes",lens:"heritage",title:"Tarbes",
  place_type:"cathedral",heritage_primary:"shrines",map_publishable:true,geo:{lat:43.23,lng:0.07},
}]);
assert.equal(classifiedFeatures[0].properties.place_type,"cathedral","Map must inherit source-owned physical site category");

await import("./explore-photo-research.mjs");
await import("./explore-photo-r59.mjs");
await import("./explore-r61-bilingual-stories.mjs");
await import("./explore-r62-bilingual-stories.mjs");
await import("./explore-r63-source-enrichment.mjs");
await import("./explore-r64-illustrated-ireland.mjs");
await import("./explore-r66-illustrated-france.mjs");
await import("./explore-r67-france-six.mjs");
await import("./explore-r68-photo-gallery.mjs");
await import("./explore-r69-multi-place-gallery.mjs");
await import("./sacred-geography-coverage-r70.mjs");
await import("./sacred-geography-r70-six-global-sites.mjs");
await import("./sacred-geography-r70-worldwide-coverage.mjs");
await import("./explore-r65-ireland-five-places.mjs");
await import("./explore-world-boundaries.mjs");
