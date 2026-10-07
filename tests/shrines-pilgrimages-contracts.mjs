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
  shrines:26,
  pilgrimages:37,
  routes:10,
  temporalLinks:28,
  sources:66,
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
  "place:IE:knock-shrine",
  "place:IE:lough-derg-station-island",
  "place:MU:pere-laval-sainte-croix",
  "place:DE:altoetting-gnadenkapelle",
  "place:DE:kevelaer-gnadenkapelle",
  "place:AT:mariazell-basilica",
  "place:AT:maria-taferl-basilica",
  "place:CH:einsiedeln-monastery",
  "place:CH:kloster-mariastein",
  "place:US:champion-shrine",
  "place:US:guadalupe-shrine-la-crosse",
  "place:US:holy-hill",
  "place:CA:sainte-anne-de-beaupre",
  "place:CA:notre-dame-du-cap",
  "place:CA:martyrs-shrine-midland",
  "place:IT:loreto-santa-casa",
  "place:IT:pompei-rosary-shrine",
  "place:PL:jasna-gora",
  "place:PL:kalwaria-zebrzydowska",
  "place:GB:walsingham-catholic-shrine",
  "place:GB:holywell-st-winefride",
]);
for(const shrine of corpus.shrines){
  assert.ok(requiredPlaces.has(shrine.place_id),`${shrine.shrine_id} did not use frozen shared place identity`);
}

assert.equal(calendarDateForSemanticKey("feast.saint_anne",2026),"2026-07-26");
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
