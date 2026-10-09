import fs from "node:fs";
import assert from "node:assert/strict";
import { calendarDateForSemanticKey, CALENDAR_SEMANTIC_REGISTRY_VERSION } from "../src/calendar/intelligence.js";
import {
  SHRINES_PILGRIMAGES_SCHEMA,
  auditRoute,
  auditTemporalLink,
  assertShrinesPilgrimagesRegistry,
} from "../src/find/shrines-contracts.js";

function readJson(relative){
  return JSON.parse(fs.readFileSync(new URL(relative,import.meta.url),"utf8"));
}

const contract=readJson("../data/shrines/shrines-contract.v1.json");
const corpus=readJson("../data/shrines/shrines-pilgrimages-seed.v1.json");
const sourceRegistry=readJson("../data/shrines/source-registry.v1.json");
const geography=readJson("../data/geography/seed-registry.v1.json");
const customs=readJson("../data/customs/customs-atlas-seed.v1.json");

assert.equal(contract.schema,SHRINES_PILGRIMAGES_SCHEMA);
assert.equal(contract.version,"1.0.0");
assert.ok(contract.invariants.some(value=>/Calendar is the sole owner/i.test(value)));
assert.ok(contract.invariants.some(value=>/nearby traditional community/i.test(value)));
assert.ok(contract.invariants.some(value=>/documented but unmapped/i.test(value)));

const result=assertShrinesPilgrimagesRegistry({
  shrines:corpus.shrines,
  pilgrimages:corpus.pilgrimages,
  routes:corpus.routes,
  temporalLinks:corpus.temporalLinks,
  sources:sourceRegistry.sources,
  places:geography.places,
});

assert.equal(result.pass,true);
assert.deepEqual(result.counts,{
  shrines:178,
  pilgrimages:206,
  routes:20,
  temporalLinks:77,
  sources:261,
});
assert.deepEqual([...result.unresolvedCalendarBindings],[]);
for(const link of corpus.temporalLinks){
  if(link.binding_state==="NO_FIXED_CALENDAR_BINDING"){
    assert.equal(link.calendar_semantic_key,null,link.temporal_link_id+" should not pretend to have a fixed Calendar key");
    assert.equal(Object.hasOwn(link,"calendar_registry_version"),false,link.temporal_link_id+" should not claim Calendar resolution");
    continue;
  }
  assert.equal(link.binding_state,"BOUND_TO_CALENDAR",link.temporal_link_id);
  assert.equal(link.calendar_registry_version,CALENDAR_SEMANTIC_REGISTRY_VERSION,link.temporal_link_id);
  assert.ok(calendarDateForSemanticKey(link.calendar_semantic_key,2026),link.calendar_semantic_key+" is not owned by Calendar");
}

const requiredPlaces=new Set([
  "place:FR:sanctuaire-notre-dame-de-lourdes",
  "place:FR:sanctuaire-notre-dame-de-laghet",
  "place:FR:sanctuaire-sacre-coeur-paray",
  "place:FR:chartres-notre-dame",
  "place:FR:sainte-anne-d-auray",
  "place:FR:bermont-greux",
  "place:FR:notre-dame-des-marins-arcachon",
  "place:FR:pontmain",
  "place:FR:pellevoisin",
  "place:FR:montligeon",
  "place:FR:rue-du-bac",
  "place:IE:knock-shrine",
  "place:IE:lough-derg-station-island",
  "place:MU:pere-laval-sainte-croix",
  "place:DE:altoetting-gnadenkapelle",
  "place:DE:kevelaer-gnadenkapelle",
  "place:DE:wigratzbad-maria-vom-sieg",
  "place:DE:mariahilf-amberg",
  "place:DE:st-leonhard-nussdorf",
  "place:DE:st-apollinaris-frielingsdorf",
  "place:DE:bettbrunn-st-salvator",
  "place:DE:maria-vesperbild",
  "place:AT:mariazell-basilica",
  "place:AT:maria-taferl-basilica",
  "place:CH:einsiedeln-monastery",
  "place:CH:kloster-mariastein",
  "place:US:champion-shrine",
  "place:US:guadalupe-shrine-la-crosse",
  "place:US:holy-hill",
  "place:US:st-alphonsus-baltimore",
  "place:US:st-john-neumann-philadelphia",
  "place:US:miraculous-medal-philadelphia",
  "place:US:czestochowa-doylestown",
  "place:US:seton-emmitsburg",
  "place:US:lourdes-grotto-emmitsburg",
  "place:US:st-mary-assumption-oswego",
  "place:US:auriesville-martyrs",
  "place:US:divine-mercy-stockbridge",
  "place:US:la-salette-attleboro",
  "place:US:lourdes-litchfield",
  "place:US:st-anne-fiskdale",
  "place:CA:sainte-anne-de-beaupre",
  "place:CA:notre-dame-du-cap",
  "place:CA:martyrs-shrine-midland",
  "place:IT:loreto-santa-casa",
  "place:IT:pompei-rosary-shrine",
  "place:IT:montecassino-abbey",
  "place:PL:jasna-gora",
  "place:PL:kalwaria-zebrzydowska",
  "place:GB:walsingham-catholic-shrine",
  "place:GB:holywell-st-winefride",
  "place:AU:penrose-park",
  "place:AU:marian-valley",
  "place:NZ:st-peter-chanel-russell",
  "place:NZ:pukekaraka-otaki",
  "place:NG:ugwogo-nike-national-marian-shrine",
  "place:NG:nne-enyemaka-umuaka",
  "place:UG:namugongo-martyrs",
  "place:UG:munyonyo-martyrs",
  "place:MX:basilica-guadalupe-mexico-city",
  "place:MX:basilica-zapopan",
  "place:BR:aparecida-national-shrine",
  "place:BR:nazare-belem",
  "place:CO:las-lajas-ipiales",
  "place:CO:chiquinquira-basilica",
  "place:BE:banneux",
  "place:BE:beauraing",
  "place:CZ:svata-hora-pribram",
  "place:CZ:stara-boleslav-st-wenceslas",
  "place:NL:heiloo-olv-ter-nood",
  "place:NL:maastricht-sterre-der-zee",
  "place:PT:fatima-sanctuary",
  "place:PT:sameiro-braga",
  "place:VA:saint-peter-vatican",
  "place:IT:saint-paul-outside-walls-rome",
  "place:IT:santa-maria-maggiore-rome",
  "place:IT:scala-santa-rome",
  "place:ES:santiago-compostela-cathedral",
  "place:ES:basilica-del-pilar-zaragoza",
  "place:ES:santo-toribio-liebana",
  "place:ES:carmel-alba-tormes",
  "place:PS:holy-sepulchre-jerusalem",
  "place:PS:nativity-bethlehem",
  "place:JP:our-lady-akita-convent",
  "place:FR:basilique-sainte-therese-lisieux",
  "place:BE:sanctuaire-sainte-julienne-cornillon",
  "place:FR:cathedrale-notre-dame-le-puy",
  "place:FR:basilique-notre-dame-victoires-paris",
  "place:FR:basilique-notre-dame-perpetuel-secours-paris",
  "place:FR:grottes-saint-antoine-brive",
  "place:FR:basilique-saint-martin-tours",
  "place:FR:basilique-montfort-saint-laurent",
  "place:FR:basilique-sainte-marie-madeleine-saint-maximin",
  "place:FR:abbaye-fleury-saint-benoit-loire",
  "place:PL:gietrzwald-basilica",
  "place:LT:siluva-apparition-chapel",
  "place:NI:cuapa-national-shrine",
  "place:VE:finca-betania",
  "place:AR:san-nicolas-virgen-rosario",
  "place:IT:santa-croce-gerusalemme-rome",
  // Bulk source-recovered shrines added 9 October 2026; these are grounded shared-place IDs, not approximate pins.
  "place:FR:saint-joseph-bessillon",
  "place:FR:notre-dame-graces-cotignac",
  "place:FR:notre-dame-la-salette-fallavaux",
  "place:FR:abbaye-mont-saint-michel",
  "place:IT:san-michele-gargano",
  "place:FR:carmel-lisieux",
  "place:FR:espace-bernadette-nevers",
  "place:FR:basilique-ars",
  "place:FR:notre-dame-du-laus",
  "place:PL:divine-mercy-plock",
  "place:IT:basilica-sant-antonio-padova",
  "place:IT:basilica-san-francesco-assisi",
  "place:IT:basilica-santa-rita-cascia",
  "place:IT:basilica-san-nicola-bari",
  "place:IT:santuario-san-pio-rotondo",
  "place:IN:basilica-bom-jesus-old-goa",
  "place:RW:sanctuaire-kibeho",
  "place:FR:notre-dame-paris",
  // Freeze recovered institutional relic and pilgrimage owners including the Holy Tunic in Argenteuil.
  "place:CA:oratoire-saint-joseph-montreal",
  "place:FR:basilique-saint-denis",
  "place:PL:sanktuarium-jana-pawla-ii-krakow",
  "place:FR:basilique-saint-denys-argenteuil",
  "place:FR:cathedrale-notre-dame-amiens",
  "place:FR:basilique-sainte-marie-madeleine-vezelay",
  "place:FR:basilique-saint-sernin-toulouse",
  "place:FR:basilique-saint-nicolas-de-port",
  "place:FR:basilique-saint-quentin-aisne",
  "place:FR:cathedrale-saint-etienne-sens",
  "place:CH:abbaye-saint-maurice-agaune",
  "place:DE:kolner-dom-three-kings",
  "place:IT:basilica-san-marco-venezia",
  "place:IT:basilica-san-domenico-bologna",
]);
assert.ok(requiredPlaces.size>=131,"frozen place identities must not silently shrink");
for(const id of ["place:FR:saint-joseph-bessillon","place:FR:notre-dame-graces-cotignac","place:FR:notre-dame-la-salette-fallavaux","place:FR:abbaye-mont-saint-michel","place:IT:san-michele-gargano","place:FR:carmel-lisieux","place:FR:espace-bernadette-nevers","place:FR:basilique-ars","place:FR:notre-dame-du-laus","place:PL:divine-mercy-plock","place:IT:basilica-sant-antonio-padova","place:IT:basilica-san-francesco-assisi","place:IT:basilica-santa-rita-cascia","place:IT:basilica-san-nicola-bari","place:IT:santuario-san-pio-rotondo","place:IN:basilica-bom-jesus-old-goa","place:RW:sanctuaire-kibeho","place:FR:notre-dame-paris"])assert.ok(corpus.shrines.some(x=>x.place_id===id),id+" source-recovered shrine missing");
for(const shrine of corpus.shrines){
  assert.ok(requiredPlaces.has(shrine.place_id),`${shrine.shrine_id} did not use frozen shared place identity`);
}

assert.equal(calendarDateForSemanticKey("feast.saint_anne",2026),"2026-07-26");
assert.equal(calendarDateForSemanticKey("observance.pilar_oct12",2026),"2026-10-12");
assert.equal(calendarDateForSemanticKey("observance.santa_maria_maggiore_aug5",2026),"2026-08-05");
assert.equal(calendarDateForSemanticKey("observance.san_nicolas_september25",2026),"2026-09-25");
assert.equal(calendarDateForSemanticKey("observance.siluva_silines",2026),"2026-09-08");
assert.equal(calendarDateForSemanticKey("observance.gietrzwald_september8",2026),"2026-09-08");
assert.equal(calendarDateForSemanticKey("observance.knock_apparition_anniversary",2026),"2026-08-21");
assert.equal(calendarDateForSemanticKey("feast.blessed_jacques_desire_laval",2026),"2026-09-09");
assert.equal(calendarDateForSemanticKey("feast.assumption_of_mary",2026),"2026-08-15");
assert.equal(calendarDateForSemanticKey("observance.einsiedeln_engelweihe",2026),"2026-09-14");
assert.equal(calendarDateForSemanticKey("observance.our_lady_of_champion",2026),"2026-10-09");
assert.equal(calendarDateForSemanticKey("feast.our_lady_of_guadalupe",2026),"2026-12-12");
assert.equal(calendarDateForSemanticKey("observance.loreto_our_lady",2026),"2026-12-10");
assert.equal(calendarDateForSemanticKey("observance.pompeii_supplica_may_8",2026),"2026-05-08");
assert.equal(calendarDateForSemanticKey("observance.jasna_gora_czestochowa",2026),"2026-08-26");
assert.equal(calendarDateForSemanticKey("observance.walsingham_our_lady",2026),"2026-09-24");
assert.equal(calendarDateForSemanticKey("observance.holywell_saint_winefride",2026),"2026-11-03");
assert.equal(calendarDateForSemanticKey("feast.saint_peter_chanel",2026),"2026-04-28");
assert.equal(calendarDateForSemanticKey("feast.our_lady_perpetual_help",2026),"2026-06-27");
assert.equal(calendarDateForSemanticKey("feast.uganda_martyrs",2026),"2026-06-03");
assert.equal(calendarDateForSemanticKey("observance.zapopan_romeria",2026),"2026-10-12");
assert.equal(calendarDateForSemanticKey("observance.our_lady_aparecida",2026),"2026-10-12");
assert.equal(calendarDateForSemanticKey("observance.las_lajas",2026),"2026-09-15");
assert.equal(calendarDateForSemanticKey("observance.chiquinquira_july9",2026),"2026-07-09");
assert.equal(calendarDateForSemanticKey("observance.banneux_first_apparition",2026),"2026-01-15");
assert.equal(calendarDateForSemanticKey("feast.saint_wenceslas",2026),"2026-09-28");
assert.equal(calendarDateForSemanticKey("observance.fatima_may13",2026),"2026-05-13");
assert.equal(calendarDateForSemanticKey("observance.sameiro_june12",2026),"2026-06-12");
assert.equal(calendarDateForSemanticKey("observance.pontmain_apparition_anniversary",2026),"2026-01-17");
assert.equal(calendarDateForSemanticKey("observance.miraculous_medal_nov27",2026),"2026-11-27");
assert.equal(calendarDateForSemanticKey("observance.mariahilf_amberg_july2",2026),"2026-07-02");
assert.equal(calendarDateForSemanticKey("observance.nussdorf_leonhardiritt",2026),"2026-11-06");
assert.equal(calendarDateForSemanticKey("feast.saint_apollinaris",2026),"2026-07-23");
assert.equal(calendarDateForSemanticKey("observance.divine_mercy_sunday_current",2026),"2026-04-12");

const kevelaerSeason=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:kevelaer:pilgrimage-season");
assert.equal(kevelaerSeason.binding_state,"NO_FIXED_CALENDAR_BINDING");
const mariazellSeason=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:mariazell:pilgrimage-season");
assert.equal(mariazellSeason.binding_state,"NO_FIXED_CALENDAR_BINDING");
const mariasteinMonthly=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:mariastein:monthly-pilgrimage");
assert.equal(mariasteinMonthly.binding_state,"NO_FIXED_CALENDAR_BINDING");

const walkToMary=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:champion:walk-to-mary");
assert.equal(walkToMary.binding_state,"NO_FIXED_CALENDAR_BINDING");
const holyHillSeason=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:holy-hill:traditional-pilgrimage");
assert.equal(holyHillSeason.binding_state,"NO_FIXED_CALENDAR_BINDING");
const martyrsSeason=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:martyrs:traditional-pilgrimage");
assert.equal(martyrsSeason.binding_state,"NO_FIXED_CALENDAR_BINDING");

const walsinghamWalk=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:walsingham:lms-walk");
assert.equal(walsinghamWalk.binding_state,"NO_FIXED_CALENDAR_BINDING");
const holywellWalk=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:holywell:lms-pilgrimage");
assert.equal(holywellWalk.binding_state,"NO_FIXED_CALENDAR_BINDING");

for(const id of ["temporal:penrose:fatima-day","temporal:marian-valley:monthly-devotions","temporal:nne-enyemaka:rosary-season"]){
  const link=corpus.temporalLinks.find(item=>item.temporal_link_id===id);
  assert.ok(link,id+" missing");
  assert.equal(link.binding_state,"NO_FIXED_CALENDAR_BINDING");
}

const cirio=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:nazare:cirio");
assert.ok(cirio);
assert.equal(cirio.binding_state,"NO_FIXED_CALENDAR_BINDING");

const zapopanRoute=corpus.routes.find(item=>item.route_id==="route:MX:guadalajara-zapopan-romeria");
assert.equal(zapopanRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(zapopanRoute.destination_place_id,"place:MX:basilica-zapopan");
const cirioRoute=corpus.routes.find(item=>item.route_id==="route:BR:belem-cathedral-nazare");
assert.equal(cirioRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(cirioRoute.destination_place_id,"place:BR:nazare-belem");

for(const id of [
  "temporal:svata-hora:annual-feast",
  "temporal:heiloo:first-saturday",
  "temporal:maastricht:sterre-der-zee-walk",
  "temporal:sameiro:annual-pilgrimage",
]){
  const link=corpus.temporalLinks.find(item=>item.temporal_link_id===id);
  assert.ok(link,id+" missing");
  assert.equal(link.binding_state,"NO_FIXED_CALENDAR_BINDING");
}

const maastrichtRoute=corpus.routes.find(item=>item.route_id==="route:NL:winthagen-maastricht-sterre-der-zee");
assert.equal(maastrichtRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(maastrichtRoute.destination_place_id,"place:NL:maastricht-sterre-der-zee");
const sameiroRoute=corpus.routes.find(item=>item.route_id==="route:PT:braga-cathedral-sameiro");
assert.equal(sameiroRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(sameiroRoute.destination_place_id,"place:PT:sameiro-braga");

for(const id of [
  "temporal:miraculous-medal:monday-novena",
  "temporal:czestochowa-us:walking-pilgrimage",
  "temporal:seton:sea-services",
]){
  const link=corpus.temporalLinks.find(item=>item.temporal_link_id===id);
  assert.ok(link,id+" missing");
  assert.equal(link.binding_state,"NO_FIXED_CALENDAR_BINDING");
}
const grottoLourdes=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:grotto-lourdes:feb11");
assert.equal(grottoLourdes.binding_state,"BOUND_TO_CALENDAR");
assert.equal(grottoLourdes.calendar_semantic_key,"feast.our_lady_of_lourdes");
assert.equal(calendarDateForSemanticKey(grottoLourdes.calendar_semantic_key,2026),"2026-02-11");
const czestochowaUsRoute=corpus.routes.find(item=>item.route_id==="route:US:great-meadows-doylestown-czestochowa");
assert.equal(czestochowaUsRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(czestochowaUsRoute.destination_place_id,"place:US:czestochowa-doylestown");

const pontmainJan17=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:pontmain:jan17");
assert.equal(pontmainJan17.binding_state,"BOUND_TO_CALENDAR");
assert.equal(pontmainJan17.calendar_semantic_key,"observance.pontmain_apparition_anniversary");
assert.equal(calendarDateForSemanticKey(pontmainJan17.calendar_semantic_key,2026),"2026-01-17");

const pontmainAssumption=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:pontmain:assumption");
assert.equal(pontmainAssumption.calendar_semantic_key,"feast.assumption_of_mary");
assert.equal(calendarDateForSemanticKey(pontmainAssumption.calendar_semantic_key,2026),"2026-08-15");

for(const id of ["temporal:pellevoisin:annual","temporal:montligeon:ciel"]){
  const link=corpus.temporalLinks.find(item=>item.temporal_link_id===id);
  assert.ok(link,id+" missing");
  assert.equal(link.binding_state,"NO_FIXED_CALENDAR_BINDING");
}

const rueDuBac=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:rue-du-bac:nov27");
assert.equal(rueDuBac.binding_state,"BOUND_TO_CALENDAR");
assert.equal(rueDuBac.calendar_semantic_key,"observance.miraculous_medal_nov27");
assert.equal(calendarDateForSemanticKey(rueDuBac.calendar_semantic_key,2026),"2026-11-27");


for(const id of [
  "temporal:wigratzbad:suehnesamstag",
  "temporal:bettbrunn:preith",
  "temporal:bettbrunn:men-october",
  "temporal:maria-vesperbild:fatima-day",
]){
  const link=corpus.temporalLinks.find(item=>item.temporal_link_id===id);
  assert.ok(link,id+" missing");
  assert.equal(link.binding_state,"NO_FIXED_CALENDAR_BINDING");
}
for(const [id,key,date] of [
  ["temporal:mariahilf-amberg:july2","observance.mariahilf_amberg_july2","2026-07-02"],
  ["temporal:nussdorf:leonhardiritt","observance.nussdorf_leonhardiritt","2026-11-06"],
  ["temporal:frielingsdorf:apollinaris","feast.saint_apollinaris","2026-07-23"],
]){
  const link=corpus.temporalLinks.find(item=>item.temporal_link_id===id);
  assert.ok(link,id+" missing");
  assert.equal(link.binding_state,"BOUND_TO_CALENDAR");
  assert.equal(link.calendar_semantic_key,key);
  assert.equal(calendarDateForSemanticKey(key,2026),date);
}
const restoration=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:auriesville:restoration");
assert.ok(restoration);
assert.equal(restoration.binding_state,"NO_FIXED_CALENDAR_BINDING");
assert.equal(restoration.calendar_semantic_key,null);

const amsterdamAuriesville=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:auriesville:amsterdam");
assert.ok(amsterdamAuriesville);
assert.equal(amsterdamAuriesville.binding_state,"NO_FIXED_CALENDAR_BINDING");
assert.equal(amsterdamAuriesville.calendar_semantic_key,null);

const mercySunday=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:stockbridge:divine-mercy-sunday");
assert.ok(mercySunday);
assert.equal(mercySunday.binding_state,"BOUND_TO_CALENDAR");
assert.equal(mercySunday.calendar_semantic_key,"observance.divine_mercy_sunday_current");
assert.equal(calendarDateForSemanticKey(mercySunday.calendar_semantic_key,2026),"2026-04-12");

const fiskdaleNovena=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:fiskdale:st-anne-novena");
assert.ok(fiskdaleNovena);
assert.equal(fiskdaleNovena.binding_state,"BOUND_TO_CALENDAR");
assert.equal(fiskdaleNovena.calendar_semantic_key,"feast.saint_anne");
assert.equal(calendarDateForSemanticKey(fiskdaleNovena.calendar_semantic_key,2026),"2026-07-26");

for(const [routeId,destination] of [
  ["route:US:lake-george-auriesville-restoration","place:US:auriesville-martyrs"],
  ["route:US:amsterdam-auriesville","place:US:auriesville-martyrs"],
]){
  const route=corpus.routes.find(item=>item.route_id===routeId);
  assert.ok(route,routeId+" missing");
  assert.equal(route.route_state,"DOCUMENTED_UNMAPPED");
  assert.equal(route.destination_place_id,destination);
}

const preithRoute=corpus.routes.find(item=>item.route_id==="route:DE:preith-bettbrunn");
assert.ok(preithRoute);
assert.equal(preithRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(preithRoute.destination_place_id,"place:DE:bettbrunn-st-salvator");

const loughSeason=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:lough-derg:three-day-season");
assert.equal(loughSeason.binding_state,"NO_FIXED_CALENDAR_BINDING");
assert.equal(loughSeason.relation,"SEASONAL");

const chartresRoute=corpus.routes.find(item=>item.route_id==="route:FR:paris-chartres-pentecost");
assert.equal(chartresRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(chartresRoute.stage_count,3);

const pereRoutes=corpus.routes.filter(item=>item.route_id.startsWith("route:MU:pere-laval-"));
assert.equal(pereRoutes.length,2);
assert.ok(pereRoutes.every(item=>item.route_state==="DOCUMENTED_UNMAPPED"));

const walkRoute=corpus.routes.find(item=>item.route_id==="route:US:walk-to-mary");
assert.equal(walkRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(walkRoute.destination_place_id,"place:US:champion-shrine");
const martyrsRoute=corpus.routes.find(item=>item.route_id==="route:CA:canadian-martyrs-traditional");
assert.equal(martyrsRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(martyrsRoute.destination_place_id,"place:CA:martyrs-shrine-midland");

const walsinghamRoute=corpus.routes.find(item=>item.route_id==="route:GB:ely-walsingham-lms");
assert.equal(walsinghamRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(walsinghamRoute.stage_count,3);
assert.equal(walsinghamRoute.destination_place_id,"place:GB:walsingham-catholic-shrine");
const holywellRoute=corpus.routes.find(item=>item.route_id==="route:GB:holywell-church-to-well");
assert.equal(holywellRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(holywellRoute.destination_place_id,"place:GB:holywell-st-winefride");

const ngaTapuwae=corpus.routes.find(item=>item.route_id==="route:NZ:nga-tapuwae-russell");
assert.equal(ngaTapuwae.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(ngaTapuwae.destination_place_id,"place:NZ:st-peter-chanel-russell");
const umuakaRosary=corpus.routes.find(item=>item.route_id==="route:NG:nne-enyemaka-rosary-procession");
assert.equal(umuakaRosary.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(umuakaRosary.destination_place_id,"place:NG:nne-enyemaka-umuaka");

const laghetRoute=corpus.routes.find(item=>item.route_id==="route:FR:laghet-paillon-old-road");
assert.equal(laghetRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(laghetRoute.geometry_ref,null);

const illegallyMapped={...laghetRoute,route_state:"MAPPED"};
assert.ok(auditRoute(illegallyMapped).some(item=>item.code==="MAPPED_ROUTE_LACKS_GEOMETRY"));

const lourdesTemporal=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:lourdes:our-lady-feast");
assert.equal(lourdesTemporal.calendar_semantic_key,"feast.our_lady_of_lourdes");
assert.equal(Object.hasOwn(lourdesTemporal,"date"),false);
assert.equal(calendarDateForSemanticKey(lourdesTemporal.calendar_semantic_key,2026),"2026-02-11");

const missingRegistry={...lourdesTemporal};
delete missingRegistry.calendar_registry_version;
assert.ok(auditTemporalLink(missingRegistry).some(item=>item.code==="MISSING_CALENDAR_REGISTRY_VERSION"));

const leakedDate={...lourdesTemporal,date:"2027-02-11"};
assert.ok(auditTemporalLink(leakedDate).some(item=>item.code==="TEMPORAL_DATE_LOGIC_OUTSIDE_CALENDAR"));

const laghetCustom=customs.attestations.find(item=>item.attestation_id==="att:DEV-009:LAGHET");
assert.equal(laghetCustom.map_policy,"PLACE");
assert.equal(laghetCustom.place_id,"place:FR:sanctuaire-notre-dame-de-laghet");

const lourdesCustom=customs.attestations.find(item=>item.attestation_id==="att:DEV-010:LOURDES");
assert.equal(lourdesCustom.map_policy,"PLACE");
assert.equal(lourdesCustom.place_id,"place:FR:sanctuaire-notre-dame-de-lourdes");

for(const id of ["att:DOM-006:PARAY","att:DOM-007:PARAY"]){
  const att=customs.attestations.find(item=>item.attestation_id===id);
  assert.ok(att,id+" missing");
  assert.equal(att.map_policy,"PLACE");
  assert.equal(att.place_id,"place:FR:sanctuaire-sacre-coeur-paray");
}

console.log("shrines and pilgrimages source-of-truth: PASS");
