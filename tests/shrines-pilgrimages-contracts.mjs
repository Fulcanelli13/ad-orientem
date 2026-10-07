import fs from "node:fs";
import assert from "node:assert/strict";
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
  shrines:3,
  pilgrimages:4,
  routes:2,
  temporalLinks:3,
  sources:10,
});
assert.deepEqual([...result.unresolvedCalendarBindings].sort(),[
  "temporal:laghet:paillon-pentecost-monday",
  "temporal:lourdes:our-lady-feast",
  "temporal:paray:sacred-heart-feast",
]);

const requiredPlaces=new Set([
  "place:FR:sanctuaire-notre-dame-de-lourdes",
  "place:FR:sanctuaire-notre-dame-de-laghet",
  "place:FR:sanctuaire-sacre-coeur-paray",
]);
for(const shrine of corpus.shrines){
  assert.ok(requiredPlaces.has(shrine.place_id),`${shrine.shrine_id} did not use frozen shared place identity`);
}

const laghetRoute=corpus.routes.find(item=>item.route_id==="route:FR:laghet-paillon-old-road");
assert.equal(laghetRoute.route_state,"DOCUMENTED_UNMAPPED");
assert.equal(laghetRoute.geometry_ref,null);

const illegallyMapped={...laghetRoute,route_state:"MAPPED"};
assert.ok(auditRoute(illegallyMapped).some(item=>item.code==="MAPPED_ROUTE_LACKS_GEOMETRY"));

const lourdesTemporal=corpus.temporalLinks.find(item=>item.temporal_link_id==="temporal:lourdes:our-lady-feast");
assert.equal(lourdesTemporal.calendar_semantic_key,"feast.our_lady_of_lourdes");
assert.equal(Object.hasOwn(lourdesTemporal,"date"),false);

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
