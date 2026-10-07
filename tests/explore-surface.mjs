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
const novenaBridge=readJson("data/customs/novena-context-links.v1.json");
const novenaSot=readJson("data/pray/novena-sot.v1.json");

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
  novenas:{
    records:novenaSot.novenas,
    links:novenaBridge.links,
    sources:novenaBridge.sources,
    researchStatus:novenaBridge.research_status,
  },
};

const projection=projectExploreDataset(dataset);
assert.deepEqual(EXPLORE_LENSES,["tlm","shrines","traditions","pilgrimages"]);
assert.deepEqual(projection.counts,{
  tlm:1,
  shrines:72,
  traditions:89,
  pilgrimages:100,
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

const lourdesPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Pilgrimage to Lourdes"});
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
assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"only provenance-locked shrine Places should publish map points");

const chartresShrine=filterExploreItems(projection.byLens.shrines,{query:"Chartres"});
assert.equal(chartresShrine.length,1);
assert.equal(chartresShrine[0].map_publishable,false);
assert.equal(chartresShrine[0].map_state,"ADDRESS_ONLY");
assert.match(chartresShrine[0].subtitle,/Chartres/);

const sainteAnneTradition=filterExploreItems(projection.byLens.traditions,{query:"Grand Pardon"});
assert.ok(sainteAnneTradition.some(item=>item.source_id==="att:DEV-007:SAINTE-ANNE-D-AURAY"));
assert.ok(sainteAnneTradition.every(item=>item.map_publishable===false),"address-only Sainte-Anne custom unexpectedly became a pin");

const knockPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Knock Apparition"});
assert.equal(knockPilgrimage.length,1);
assert.equal(knockPilgrimage[0].map_publishable,false);
assert.ok(knockPilgrimage[0].sections.some(section=>/Anniversary of the Knock Apparition/.test(section.title)));

const loughDerg=filterExploreItems(projection.byLens.pilgrimages,{query:"Lough Derg Three Day"});
assert.equal(loughDerg.length,1);
assert.equal(loughDerg[0].map_state,"DESTINATION_ADDRESS_ONLY");
assert.ok(loughDerg[0].sections.some(section=>section.label==="Calendar relationship"&&/Traditional Three Day Pilgrimage season/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const pereLaval=filterExploreItems(projection.byLens.pilgrimages,{query:"Père Laval"});
assert.equal(pereLaval.length,1);
assert.equal(pereLaval[0].map_publishable,false);

const altoetting=filterExploreItems(projection.byLens.shrines,{query:"Altötting"});
assert.equal(altoetting.length,1);
assert.equal(altoetting[0].map_publishable,false);
const altoettingExVoto=filterExploreItems(projection.byLens.traditions,{query:"votive tablets"});
assert.ok(altoettingExVoto.some(item=>item.source_id==="att:DEV-009:ALTOETTING"));

const kevelaer=filterExploreItems(projection.byLens.pilgrimages,{query:"Kevelaer"});
assert.equal(kevelaer.length,1);
assert.equal(kevelaer[0].map_publishable,false);
assert.ok(kevelaer[0].sections.some(section=>/pilgrimage season/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const mariazell=filterExploreItems(projection.byLens.pilgrimages,{query:"Mariazell"});
assert.equal(mariazell.length,1);
assert.equal(mariazell[0].map_state,"DESTINATION_ADDRESS_ONLY");
assert.ok(mariazell[0].sections.some(section=>/pilgrimage season/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));
const mariazellCandle=filterExploreItems(projection.byLens.traditions,{query:"votive candle"});
assert.ok(mariazellCandle.some(item=>item.source_id==="att:DEV-010:MARIAZELL"));

const mariaTaferl=filterExploreItems(projection.byLens.shrines,{query:"Maria Taferl"});
assert.equal(mariaTaferl.length,1);
assert.equal(mariaTaferl[0].map_publishable,false);

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
assert.ok(champion.every(item=>item.map_publishable===false));
assert.ok(champion.some(item=>item.sections.some(section=>/Solemnity of Our Lady of Champion/.test(section.title)&&/Resolved by Calendar/.test(section.body))));

const guadalupeShrine=filterExploreItems(projection.byLens.shrines,{query:"La Crosse"});
assert.equal(guadalupeShrine.length,1);
assert.equal(guadalupeShrine[0].map_publishable,false);
const guadalupeCandles=filterExploreItems(projection.byLens.traditions,{query:"Votive Candle"});
assert.ok(guadalupeCandles.some(item=>item.source_id==="att:DEV-010:GUADALUPE-LA-CROSSE"));

const holyHill=filterExploreItems(projection.byLens.pilgrimages,{query:"Traditional Holy Hill"});
assert.equal(holyHill.length,1);
assert.equal(holyHill[0].map_publishable,false);
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
assert.equal(martyrs[0].map_publishable,false);
assert.ok(martyrs[0].sections.some(section=>/Annual Canadian Martyrs traditional pilgrimage/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const loreto=filterExploreItems(projection.byLens.pilgrimages,{query:"Loreto"});
assert.equal(loreto.length,1);
assert.equal(loreto[0].map_publishable,false);
assert.ok(loreto[0].sections.some(section=>/Blessed Virgin Mary of Loreto/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const loretoCustom=filterExploreItems(projection.byLens.traditions,{query:"Venuta"});
assert.ok(loretoCustom.some(item=>item.source_id==="att:DEV-007:LORETO-VENUTA"));

const pompei=filterExploreItems(projection.byLens.pilgrimages,{query:"Pompeii"});
assert.equal(pompei.length,1);
assert.equal(pompei[0].map_publishable,false);
assert.ok(pompei[0].sections.some(section=>/Supplica/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const jasna=filterExploreItems(projection.byLens.pilgrimages,{query:"Jasna Góra"});
assert.equal(jasna.length,1);
assert.equal(jasna[0].map_publishable,false);
assert.ok(jasna[0].sections.some(section=>/Częstochowa/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const kalwaria=filterExploreItems(projection.byLens.pilgrimages,{query:"Kalwaria"});
assert.equal(kalwaria.length,1);
assert.equal(kalwaria[0].map_publishable,false);
assert.ok(kalwaria[0].sections.some(section=>/Assumption/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const walsingham=filterExploreItems(projection.byLens.pilgrimages,{query:"Walsingham"});
assert.equal(walsingham.length,2);
assert.ok(walsingham.every(item=>item.map_publishable===false));
assert.ok(walsingham.some(item=>item.sections.some(section=>/Our Lady of Walsingham/.test(section.title)&&/Resolved by Calendar/.test(section.body))));
assert.ok(walsingham.some(item=>item.sections.some(section=>/August Bank Holiday/.test(section.title)&&/no single recurring Calendar date/i.test(section.body))));

const holywell=filterExploreItems(projection.byLens.pilgrimages,{query:"Holywell"});
assert.equal(holywell.length,2);
assert.ok(holywell.every(item=>item.map_publishable===false));
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
assert.equal(peterChanel[0].map_publishable,false);
assert.ok(peterChanel[0].sections.some(section=>/Saint Peter Chanel/.test(section.title)&&/Resolved by Calendar/.test(section.body)));
const ugwogo=filterExploreItems(projection.byLens.pilgrimages,{query:"Ugwogo"});
assert.equal(ugwogo.length,1);
assert.equal(ugwogo[0].map_publishable,false);
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
assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"Australasia/Africa mapped shrine count drifted");

const guadalupeMx=filterExploreItems(projection.byLens.pilgrimages,{query:"Santa María de Guadalupe"});
assert.equal(guadalupeMx.length,1);
assert.equal(guadalupeMx[0].map_publishable,false);
assert.ok(guadalupeMx[0].sections.some(section=>/Guadalupe/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const zapopan=filterExploreItems(projection.byLens.pilgrimages,{query:"Zapopan"});
assert.equal(zapopan.length,2);
assert.ok(zapopan.every(item=>item.map_publishable===false));
assert.ok(zapopan.some(item=>item.sections.some(section=>/Romería de Zapopan/.test(section.title)&&/Resolved by Calendar/.test(section.body))));

const aparecida=filterExploreItems(projection.byLens.pilgrimages,{query:"Aparecida"});
assert.equal(aparecida.length,1);
assert.equal(aparecida[0].map_publishable,false);
assert.ok(aparecida[0].sections.some(section=>/Aparecida/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const cirio=filterExploreItems(projection.byLens.pilgrimages,{query:"Círio de Nazaré"});
assert.equal(cirio.length,1);
assert.equal(cirio[0].map_publishable,false);
assert.ok(cirio[0].sections.some(section=>/second Sunday of October/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const lasLajas=filterExploreItems(projection.byLens.pilgrimages,{query:"Las Lajas"});
assert.equal(lasLajas.length,1);
assert.equal(lasLajas[0].map_publishable,true);
assert.ok(lasLajas[0].sections.some(section=>/Las Lajas/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const chiquinquira=filterExploreItems(projection.byLens.pilgrimages,{query:"Chiquinquirá"});
assert.equal(chiquinquira.length,1);
assert.equal(chiquinquira[0].map_publishable,false);
assert.ok(chiquinquira[0].sections.some(section=>/Chiquinquirá/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"Latin America shrine pin count drifted");

const banneux=filterExploreItems(projection.byLens.pilgrimages,{query:"Banneux"});
assert.equal(banneux.length,1);
assert.equal(banneux[0].map_publishable,false);
assert.ok(banneux[0].sections.some(section=>/first apparition at Banneux/i.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const beauraing=filterExploreItems(projection.byLens.pilgrimages,{query:"Beauraing"});
assert.equal(beauraing.length,1);
assert.equal(beauraing[0].map_publishable,false);

const svataHora=filterExploreItems(projection.byLens.pilgrimages,{query:"Svatá Hora"});
assert.equal(svataHora.length,1);
assert.equal(svataHora[0].map_publishable,false);
assert.ok(svataHora[0].sections.some(section=>/Assumption season/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const wenceslas=filterExploreItems(projection.byLens.pilgrimages,{query:"Wenceslas"});
assert.equal(wenceslas.length,1);
assert.equal(wenceslas[0].map_publishable,false);
assert.ok(wenceslas[0].sections.some(section=>/National St Wenceslas Pilgrimage/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const heiloo=filterExploreItems(projection.byLens.pilgrimages,{query:"Heiloo"});
assert.equal(heiloo.length,1);
assert.equal(heiloo[0].map_publishable,false);
assert.ok(heiloo[0].sections.some(section=>/First Saturday pilgrimage at Heiloo/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const maastricht=filterExploreItems(projection.byLens.pilgrimages,{query:"Sterre der Zee"});
assert.equal(maastricht.length,1);
assert.equal(maastricht[0].map_publishable,false);
assert.ok(maastricht[0].sections.some(section=>/Sterre der Zee diocesan-feast walking pilgrimage/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));

const fatima=filterExploreItems(projection.byLens.pilgrimages,{query:"Fátima"});
assert.equal(fatima.length,1);
assert.equal(fatima[0].map_publishable,false);
assert.ok(fatima[0].sections.some(section=>/13 May anniversary pilgrimage at Fátima/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const sameiro=filterExploreItems(projection.byLens.pilgrimages,{query:"Sameiro"});
assert.equal(sameiro.length,1);
assert.equal(sameiro[0].map_publishable,false);
assert.ok(sameiro[0].sections.some(section=>/Archdiocesan pilgrimage to Sameiro/.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));
assert.ok(sameiro[0].sections.some(section=>/Feast of Our Lady of Sameiro/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"tranche 7 address-only shrines unexpectedly published map points");

const bermontShrine=filterExploreItems(projection.byLens.shrines,{query:"Bermont"});
assert.equal(bermontShrine.length,1);
assert.equal(bermontShrine[0].map_publishable,false);
assert.equal(bermontShrine[0].map_state,"ADDRESS_ONLY");

const arcachonShrine=filterExploreItems(projection.byLens.shrines,{query:"Notre-Dame des Marins"});
assert.equal(arcachonShrine.length,1);
assert.equal(arcachonShrine[0].map_publishable,false);

const pontmainShrine=filterExploreItems(projection.byLens.shrines,{query:"Notre-Dame de Pontmain"});
assert.equal(pontmainShrine.length,1);
assert.equal(pontmainShrine[0].map_publishable,false);
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
assert.equal(rueDuBacPilgrimage[0].map_publishable,false);
assert.ok(rueDuBacPilgrimage[0].sections.some(section=>/Médaille Miraculeuse/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"France tranche address-only shrines unexpectedly published map points");

const wigratzbadShrine=filterExploreItems(projection.byLens.shrines,{query:"Wigratzbad"});
assert.equal(wigratzbadShrine.length,1);
assert.equal(wigratzbadShrine[0].map_publishable,false);

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

assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"Germany tranche address-only shrines unexpectedly published map points");

const oswegoShrine=filterExploreItems(projection.byLens.shrines,{query:"St. Mary of the Assumption Parish and Shrine"});
assert.equal(oswegoShrine.length,1);
assert.equal(oswegoShrine[0].map_publishable,false);

const restorationPilgrimage=filterExploreItems(projection.byLens.pilgrimages,{query:"Pilgrimage for Restoration"});
assert.equal(restorationPilgrimage.length,1);
assert.equal(restorationPilgrimage[0].map_publishable,false);
assert.ok(restorationPilgrimage[0].sections.some(section=>/annual September dates/i.test(section.title)&&/no single recurring Calendar date/i.test(section.body)));
const restorationCustom=filterExploreItems(projection.byLens.traditions,{query:"Chartres"});
assert.ok(restorationCustom.some(item=>item.source_id==="att:DEV-006:AURIESVILLE-RESTORATION"));

const stockbridgeMercy=filterExploreItems(projection.byLens.pilgrimages,{query:"Divine Mercy Sunday Pilgrimage"});
assert.equal(stockbridgeMercy.length,1);
assert.equal(stockbridgeMercy[0].map_publishable,false);
assert.ok(stockbridgeMercy[0].sections.some(section=>/Divine Mercy Sunday/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

const laSaletteShrine=filterExploreItems(projection.byLens.shrines,{query:"La Salette"});
assert.equal(laSaletteShrine.length,1);
assert.equal(laSaletteShrine[0].map_publishable,false);

const litchfieldShrine=filterExploreItems(projection.byLens.shrines,{query:"Lourdes in Litchfield"});
assert.equal(litchfieldShrine.length,1);
assert.equal(litchfieldShrine[0].map_publishable,false);

const fiskdaleNovena=filterExploreItems(projection.byLens.pilgrimages,{query:"Annual St. Anne Novena"});
assert.equal(fiskdaleNovena.length,1);
assert.equal(fiskdaleNovena[0].map_publishable,false);
assert.ok(fiskdaleNovena[0].sections.some(section=>/18–26 July/.test(section.title)&&/Resolved by Calendar/.test(section.body)));

assert.equal(exploreMapFeatures(projection.byLens.shrines).length,7,"US Northeast address-only shrines unexpectedly published map points");

const browserSource=readFileSync("src/find/browser-entry.js","utf8");
assert.match(browserSource,/loadExploreDataset/);
assert.match(browserSource,/projectExploreDataset/);
assert.match(browserSource,/mountExploreMap/);
assert.match(browserSource,/lens:"tlm"/);
assert.match(browserSource,/data-explore-open-novena/,"Explore lost Novena deep-link click handling");
assert.match(browserSource,/AO_PRAY_V435930\?\.open\?\.\("pray\.novenas"/,"Explore no longer opens the canonical PRAY Novena owner");
assert.doesNotMatch(browserSource,/Sanctuaire Notre-Dame de Lourdes|Paray-le-Monial|Notre-Dame de Laghet/,"Explore browser owner hardcodes corpus places");

const novenaRuntimeSource=readFileSync("src/pray/novena-runtime.js","utf8");
assert.match(novenaRuntimeSource,/opts\?\.novenaId/,"Novenas stopped accepting Explore deep-link identity");
assert.match(novenaRuntimeSource,/data-n1-explore/,"Novena detail stopped linking back into Explore");
assert.match(novenaRuntimeSource,/AO_FIND_APP_V1\?\.open\?\.\(\{lens:'traditions',query:/,"Novena context no longer opens prefiltered Explore");
assert.match(novenaRuntimeSource,/Object\.keys\(CORPUS\)\.length===16/,"Novena QA still assumes the obsolete 12-target corpus");

const homeSource=readFileSync("src/home/presentation.js","utf8");
assert.match(homeSource,/Traditional Masses, shrines, customs and pilgrimages/);
assert.match(homeSource,/data-home-find/,"Explore route lost shell-compatible Home trigger");

console.log("PASS unified Explore projection and four-lens surface");
