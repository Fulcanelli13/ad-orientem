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
  },{
    venue_id:"ao-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria",
    name:{official:"Nne Enyemaka Shrine Umuaka",alternate:[]},
    venue_type:"other",
    address:{formatted:"P.O. Box 605 - Umuaka Imo State - Nigeria",city:"Umuaka",country_code:"NG"},
    geo:{
      lat:5.6769512,lng:7.0243016,precision:"street",geocoding_source:"OSM_NOMINATIM",
      source_url:"https://nominatim.openstreetmap.org/",source_ref:"osm:way:547843649",
      matched_country_code:"NG",geocoded_at:"2026-10-07T11:45:46.764Z",
      attribution:"© OpenStreetMap contributors, ODbL 1.0",match_score:0.65,query_fingerprint:"umuaka-fixture"
    },
    diocese:{name:"Orlu"},
    contact:{phone:[],email:[],website:["https://fsspnigeria.org/"],schedule_url:["https://fsspnigeria.org/"]},
    source_ids:["src-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria"]
  }],
  ministries:[{
    ministry_id:"m-fssp",venue_id:"ao-fssp-paris",community_id:"FSSP",relationship:"served_by",
    liturgical_usage:{family:"ROMAN",books:"1962"},source_ids:["src-fssp-paris"]
  },{
    ministry_id:"m-fssp-umuaka",venue_id:"ao-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria",community_id:"FSSP",relationship:"served_by",
    liturgical_usage:{family:"ROMAN",books:"1962"},source_ids:["src-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria"]
  }],
  schedules:[{
    schedule_id:"s-fssp",ministry_id:"m-fssp",service_type:"MASS",mass_type:"SUNG",
    payload:{raw:"Sunday 10:30 Sung Mass"},source_ids:["src-fssp-paris"]
  },{
    schedule_id:"s-fssp-umuaka",ministry_id:"m-fssp-umuaka",service_type:"MASS",mass_type:"LOW",
    payload:{raw:"Sunday 07:00 Traditional Latin Mass"},source_ids:["src-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria"]
  }],
  sources:[
    {source_id:"src-fssp-paris",url:"https://example.org/mass",source_type:"COMMUNITY_OFFICIAL"},
    {source_id:"src-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria",url:"https://fsspnigeria.org/",source_type:"COMMUNITY_OFFICIAL"}
  ],
  communityProfiles:[{communityId:"FSSP",communionProfile:{pope_named_in_canon:"YES"}}]
});

function buildDataset(directoryPlaceLinks=geography.directoryPlaceLinks){
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

assert.equal(profiles.length,56,"every seeded canonical Place should have one Place profile");

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

const altoetting=explorePlaceProfile(profiles,"place:DE:altoetting-gnadenkapelle");
assert.ok(altoetting);
assert.equal(altoetting.counts.shrines,1);
assert.equal(altoetting.counts.pilgrimages,2);
assert.ok(altoetting.counts.traditions>=1);
assert.equal(altoetting.map_publishable,false);
assert.ok(altoetting.calendar.some(row=>row.semantic_key==="feast.assumption_of_mary"&&row.date==="2027-08-15"));

const kevelaer=explorePlaceProfile(profiles,"place:DE:kevelaer-gnadenkapelle");
assert.ok(kevelaer);
assert.equal(kevelaer.counts.shrines,1);
assert.equal(kevelaer.counts.pilgrimages,1);
assert.equal(kevelaer.counts.tlm,0);
assert.equal(kevelaer.calendar.length,0,"seasonal Kevelaer pilgrimage was incorrectly reduced to one date");

const kevelaerKerzen=explorePlaceProfile(profiles,"place:DE:kevelaer-kerzenkapelle");
assert.ok(kevelaerKerzen);
assert.equal(kevelaerKerzen.counts.shrines,0);
assert.equal(kevelaerKerzen.counts.pilgrimages,0);
assert.equal(kevelaerKerzen.counts.tlm,0,"unresolved 1962-Mass candidate leaked into exact-place TLM projection");

const mariazell=explorePlaceProfile(profiles,"place:AT:mariazell-basilica");
assert.ok(mariazell);
assert.equal(mariazell.counts.shrines,1);
assert.equal(mariazell.counts.pilgrimages,1);
assert.ok(mariazell.counts.traditions>=1);
assert.equal(mariazell.calendar.length,0);

const mariaTaferl=explorePlaceProfile(profiles,"place:AT:maria-taferl-basilica");
assert.ok(mariaTaferl);
assert.equal(mariaTaferl.counts.shrines,1);
assert.equal(mariaTaferl.counts.pilgrimages,1);

const einsiedeln=explorePlaceProfile(profiles,"place:CH:einsiedeln-monastery");
assert.ok(einsiedeln);
assert.equal(einsiedeln.counts.shrines,1);
assert.equal(einsiedeln.counts.pilgrimages,2);
assert.ok(einsiedeln.counts.traditions>=1);
assert.ok(einsiedeln.calendar.some(row=>row.semantic_key==="observance.einsiedeln_engelweihe"&&row.date==="2027-09-14"));

const mariastein=explorePlaceProfile(profiles,"place:CH:kloster-mariastein");
assert.ok(mariastein);
assert.equal(mariastein.counts.shrines,1);
assert.equal(mariastein.counts.pilgrimages,1);
assert.equal(mariastein.calendar.length,0,"monthly Mariastein pilgrimage should remain recurrence context, not a single date");

const champion=explorePlaceProfile(profiles,"place:US:champion-shrine");
assert.ok(champion);
assert.equal(champion.counts.shrines,1);
assert.equal(champion.counts.pilgrimages,3);
assert.ok(champion.counts.traditions>=1);
assert.equal(champion.map_publishable,false);
assert.ok(champion.calendar.some(row=>row.semantic_key==="observance.our_lady_of_champion"&&row.date==="2026-10-09"));

const guadalupe=explorePlaceProfile(profiles,"place:US:guadalupe-shrine-la-crosse");
assert.ok(guadalupe);
assert.equal(guadalupe.counts.shrines,1);
assert.equal(guadalupe.counts.pilgrimages,1);
assert.ok(guadalupe.counts.traditions>=1);
assert.equal(guadalupe.counts.tlm,0,"unresolved Guadalupe TLM candidate leaked into exact-place TLM projection");
assert.ok(guadalupe.calendar.some(row=>row.semantic_key==="feast.our_lady_of_guadalupe"&&row.date==="2026-12-12"));

const holyHill=explorePlaceProfile(profiles,"place:US:holy-hill");
assert.ok(holyHill);
assert.equal(holyHill.counts.shrines,1);
assert.equal(holyHill.counts.pilgrimages,2);
assert.equal(holyHill.calendar.length,0,"annual traditional Holy Hill pilgrimage was incorrectly reduced to one fixed Calendar date");

const beaupre=explorePlaceProfile(profiles,"place:CA:sainte-anne-de-beaupre");
assert.ok(beaupre);
assert.equal(beaupre.counts.shrines,1);
assert.equal(beaupre.counts.pilgrimages,1);
assert.ok(beaupre.counts.traditions>=1);
assert.ok(beaupre.calendar.some(row=>row.semantic_key==="feast.saint_anne"&&row.date==="2027-07-26"));

const ndc=explorePlaceProfile(profiles,"place:CA:notre-dame-du-cap");
assert.ok(ndc);
assert.equal(ndc.counts.shrines,1);
assert.equal(ndc.counts.pilgrimages,1);
assert.ok(ndc.counts.traditions>=1);
assert.ok(ndc.calendar.some(row=>row.semantic_key==="feast.assumption_of_mary"&&row.date==="2027-08-15"));

const martyrs=explorePlaceProfile(profiles,"place:CA:martyrs-shrine-midland");
assert.ok(martyrs);
assert.equal(martyrs.counts.shrines,1);
assert.equal(martyrs.counts.pilgrimages,2);
assert.equal(martyrs.calendar.length,0);
assert.equal(martyrs.counts.tlm,0,"traditional pilgrimage evidence incorrectly created an exact-place TLM venue");

const loreto=explorePlaceProfile(profiles,"place:IT:loreto-santa-casa");
assert.ok(loreto);
assert.equal(loreto.counts.shrines,1);
assert.equal(loreto.counts.pilgrimages,1);
assert.ok(loreto.counts.traditions>=1);
assert.equal(loreto.map_publishable,false);
assert.ok(loreto.calendar.some(row=>row.semantic_key==="observance.loreto_our_lady"&&row.date==="2026-12-10"));

const pompei=explorePlaceProfile(profiles,"place:IT:pompei-rosary-shrine");
assert.ok(pompei);
assert.equal(pompei.counts.shrines,1);
assert.equal(pompei.counts.pilgrimages,1);
assert.ok(pompei.counts.traditions>=1);
assert.ok(pompei.calendar.some(row=>row.semantic_key==="observance.pompeii_supplica_may_8"&&row.date==="2027-05-08"));

const jasna=explorePlaceProfile(profiles,"place:PL:jasna-gora");
assert.ok(jasna);
assert.equal(jasna.counts.shrines,1);
assert.equal(jasna.counts.pilgrimages,1);
assert.ok(jasna.counts.traditions>=1);
assert.ok(jasna.calendar.some(row=>row.semantic_key==="observance.jasna_gora_czestochowa"&&row.date==="2027-08-26"));

const kalwaria=explorePlaceProfile(profiles,"place:PL:kalwaria-zebrzydowska");
assert.ok(kalwaria);
assert.equal(kalwaria.counts.shrines,1);
assert.equal(kalwaria.counts.pilgrimages,1);
assert.ok(kalwaria.counts.traditions>=1);
assert.ok(kalwaria.calendar.some(row=>row.semantic_key==="feast.assumption_of_mary"&&row.date==="2027-08-15"));

const walsingham=explorePlaceProfile(profiles,"place:GB:walsingham-catholic-shrine");
assert.ok(walsingham);
assert.equal(walsingham.counts.shrines,1);
assert.equal(walsingham.counts.pilgrimages,2);
assert.ok(walsingham.counts.traditions>=1);
assert.equal(walsingham.counts.tlm,0,"annual Walsingham traditional pilgrimage leaked into exact-place TLM projection");
assert.ok(walsingham.calendar.some(row=>row.semantic_key==="observance.walsingham_our_lady"&&row.date==="2027-09-24"));

const holywell=explorePlaceProfile(profiles,"place:GB:holywell-st-winefride");
assert.ok(holywell);
assert.equal(holywell.counts.shrines,1);
assert.equal(holywell.counts.pilgrimages,2);
assert.ok(holywell.counts.traditions>=1);
assert.equal(holywell.counts.tlm,0,"Holywell pilgrimage evidence leaked into Well-shrine TLM projection");
assert.ok(holywell.calendar.some(row=>row.semantic_key==="observance.holywell_saint_winefride"&&row.date==="2026-11-03"));

const holywellChurch=explorePlaceProfile(profiles,"place:GB:holywell-st-winefride-church");
assert.ok(holywellChurch);
assert.equal(holywellChurch.counts.shrines,0);
assert.equal(holywellChurch.counts.pilgrimages,0);
assert.equal(holywellChurch.counts.tlm,0,"unresolved Holywell parish candidate leaked into exact-place TLM projection");

const penrose=explorePlaceProfile(profiles,"place:AU:penrose-park");
assert.ok(penrose);
assert.equal(penrose.counts.shrines,1);
assert.equal(penrose.counts.pilgrimages,1);
assert.equal(penrose.map_publishable,true);

const marianValley=explorePlaceProfile(profiles,"place:AU:marian-valley");
assert.ok(marianValley);
assert.equal(marianValley.map_publishable,true);
assert.equal(marianValley.calendar.length,0);

const peterChanel=explorePlaceProfile(profiles,"place:NZ:st-peter-chanel-russell");
assert.ok(peterChanel);
assert.equal(peterChanel.counts.shrines,1);
assert.equal(peterChanel.counts.pilgrimages,1);
assert.ok(peterChanel.counts.traditions>=1);
assert.ok(peterChanel.calendar.some(row=>row.semantic_key==="feast.saint_peter_chanel"&&row.date==="2027-04-28"));

const pukekaraka=explorePlaceProfile(profiles,"place:NZ:pukekaraka-otaki");
assert.ok(pukekaraka);
assert.equal(pukekaraka.counts.shrines,1);
assert.equal(pukekaraka.counts.pilgrimages,1);

const ugwogo=explorePlaceProfile(profiles,"place:NG:ugwogo-nike-national-marian-shrine");
assert.ok(ugwogo);
assert.ok(ugwogo.counts.traditions>=1);
assert.ok(ugwogo.calendar.some(row=>row.semantic_key==="feast.our_lady_perpetual_help"&&row.date==="2027-06-27"));

const umuaka=explorePlaceProfile(profiles,"place:NG:nne-enyemaka-umuaka");
assert.ok(umuaka);
assert.equal(umuaka.map_publishable,true);
assert.equal(umuaka.counts.tlm,1,"confirmed FSSP Umuaka Directory→Place bridge did not surface exactly one TLM venue");
assert.equal(umuaka.exact_tlm_link_state,"VERIFIED");
assert.equal(umuaka.tlm[0].item_id,"tlm:ao-fssp-nne-enyemaka-shrine-umuaka-p-o-box-605-umuaka-imo-state-nigeria");

const namugongo=explorePlaceProfile(profiles,"place:UG:namugongo-martyrs");
assert.ok(namugongo);
assert.ok(namugongo.counts.traditions>=1);
assert.ok(namugongo.calendar.some(row=>row.semantic_key==="feast.uganda_martyrs"&&row.date==="2027-06-03"));

const munyonyo=explorePlaceProfile(profiles,"place:UG:munyonyo-martyrs");
assert.ok(munyonyo);
assert.ok(munyonyo.counts.traditions>=1);
assert.ok(munyonyo.calendar.some(row=>row.semantic_key==="feast.uganda_martyrs"&&row.date==="2027-06-03"));

const guadalupeMx=explorePlaceProfile(profiles,"place:MX:basilica-guadalupe-mexico-city");
assert.ok(guadalupeMx);
assert.equal(guadalupeMx.counts.shrines,1);
assert.equal(guadalupeMx.counts.pilgrimages,1);
assert.ok(guadalupeMx.counts.traditions>=1);
assert.equal(guadalupeMx.map_publishable,false);
assert.equal(guadalupeMx.counts.tlm,0);
assert.ok(guadalupeMx.calendar.some(row=>row.semantic_key==="feast.our_lady_of_guadalupe"&&row.date==="2026-12-12"));

const zapopan=explorePlaceProfile(profiles,"place:MX:basilica-zapopan");
assert.ok(zapopan);
assert.equal(zapopan.counts.shrines,1);
assert.equal(zapopan.counts.pilgrimages,2);
assert.ok(zapopan.counts.traditions>=1);
assert.equal(zapopan.map_publishable,false);
assert.ok(zapopan.calendar.some(row=>row.semantic_key==="observance.zapopan_romeria"&&row.date==="2026-10-12"));

const aparecida=explorePlaceProfile(profiles,"place:BR:aparecida-national-shrine");
assert.ok(aparecida);
assert.equal(aparecida.counts.shrines,1);
assert.equal(aparecida.counts.pilgrimages,1);
assert.ok(aparecida.counts.traditions>=1);
assert.equal(aparecida.map_publishable,false);
assert.ok(aparecida.calendar.some(row=>row.semantic_key==="observance.our_lady_aparecida"&&row.date==="2026-10-12"));

const nazare=explorePlaceProfile(profiles,"place:BR:nazare-belem");
assert.ok(nazare);
assert.equal(nazare.counts.shrines,1);
assert.equal(nazare.counts.pilgrimages,2);
assert.ok(nazare.counts.traditions>=1);
assert.equal(nazare.map_publishable,false);
assert.equal(nazare.calendar.length,0,"second-Sunday Círio recurrence was incorrectly reduced to one fixed date");

const lasLajas=explorePlaceProfile(profiles,"place:CO:las-lajas-ipiales");
assert.ok(lasLajas);
assert.equal(lasLajas.counts.shrines,1);
assert.equal(lasLajas.counts.pilgrimages,1);
assert.ok(lasLajas.counts.traditions>=1);
assert.equal(lasLajas.map_publishable,true);
assert.ok(lasLajas.calendar.some(row=>row.semantic_key==="observance.las_lajas"&&row.date==="2027-09-15"));

const chiquinquira=explorePlaceProfile(profiles,"place:CO:chiquinquira-basilica");
assert.ok(chiquinquira);
assert.equal(chiquinquira.counts.shrines,1);
assert.equal(chiquinquira.counts.pilgrimages,1);
assert.ok(chiquinquira.counts.traditions>=1);
assert.equal(chiquinquira.map_publishable,false);
assert.ok(chiquinquira.calendar.some(row=>row.semantic_key==="observance.chiquinquira_july9"&&row.date==="2027-07-09"));

const banneux=explorePlaceProfile(profiles,"place:BE:banneux");
assert.ok(banneux);
assert.equal(banneux.counts.shrines,1);
assert.equal(banneux.counts.pilgrimages,1);
assert.ok(banneux.counts.traditions>=1);
assert.equal(banneux.map_publishable,false);
assert.ok(banneux.calendar.some(row=>row.semantic_key==="observance.banneux_first_apparition"&&row.date==="2027-01-15"));

const beauraing=explorePlaceProfile(profiles,"place:BE:beauraing");
assert.ok(beauraing);
assert.equal(beauraing.counts.shrines,1);
assert.equal(beauraing.counts.pilgrimages,1);
assert.ok(beauraing.counts.traditions>=1);
assert.equal(beauraing.calendar.length,0);

const svataHora=explorePlaceProfile(profiles,"place:CZ:svata-hora-pribram");
assert.ok(svataHora);
assert.equal(svataHora.counts.shrines,1);
assert.equal(svataHora.counts.pilgrimages,1);
assert.ok(svataHora.counts.traditions>=1);
assert.equal(svataHora.calendar.length,0,"Svatá Hora seasonal pilgrimage was incorrectly reduced to one date");

const staraBoleslav=explorePlaceProfile(profiles,"place:CZ:stara-boleslav-st-wenceslas");
assert.ok(staraBoleslav);
assert.equal(staraBoleslav.counts.shrines,1);
assert.equal(staraBoleslav.counts.pilgrimages,1);
assert.ok(staraBoleslav.counts.traditions>=1);
assert.ok(staraBoleslav.calendar.some(row=>row.semantic_key==="feast.saint_wenceslas"&&row.date==="2027-09-28"));

const heiloo=explorePlaceProfile(profiles,"place:NL:heiloo-olv-ter-nood");
assert.ok(heiloo);
assert.equal(heiloo.counts.shrines,1);
assert.equal(heiloo.counts.pilgrimages,1);
assert.ok(heiloo.counts.traditions>=1);
assert.equal(heiloo.calendar.length,0);

const maastricht=explorePlaceProfile(profiles,"place:NL:maastricht-sterre-der-zee");
assert.ok(maastricht);
assert.equal(maastricht.counts.shrines,1);
assert.equal(maastricht.counts.pilgrimages,1);
assert.ok(maastricht.counts.traditions>=1);
assert.equal(maastricht.calendar.length,0);

const fatima=explorePlaceProfile(profiles,"place:PT:fatima-sanctuary");
assert.ok(fatima);
assert.equal(fatima.counts.shrines,1);
assert.equal(fatima.counts.pilgrimages,1);
assert.ok(fatima.counts.traditions>=1);
assert.equal(fatima.counts.tlm,0,"FSSP presence elsewhere in Fátima was incorrectly attached to the Sanctuary");
assert.ok(fatima.calendar.some(row=>row.semantic_key==="observance.fatima_may13"&&row.date==="2027-05-13"));

const sameiro=explorePlaceProfile(profiles,"place:PT:sameiro-braga");
assert.ok(sameiro);
assert.equal(sameiro.counts.shrines,1);
assert.equal(sameiro.counts.pilgrimages,1);
assert.ok(sameiro.counts.traditions>=1);
assert.ok(sameiro.calendar.some(row=>row.semantic_key==="observance.sameiro_june12"&&row.date==="2027-06-12"));

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
