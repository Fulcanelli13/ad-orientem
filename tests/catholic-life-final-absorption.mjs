import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";
import { TRADITIONAL_LEARN_SOURCES_V381 } from "../src/learn/traditional-life-data.js";

const closure=JSON.parse(readFileSync("data/learn/catholic-life-final-absorption.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/formation-gap-ownership.v1.json","utf8"));
const runtime=readFileSync("src/learn/traditional-life.js","utf8");

assert.equal(closure.version,"CATHOLIC_LIFE_FINAL_ABSORPTION_V1");
assert.equal(closure.status,"COMPLETE");
assert.equal(closure.scope.funeral_requiem_claims,15);
assert.equal(closure.scope.catholic_home_family_claims,3);
assert.equal(closure.scope.total_claims,18);
assert.equal(closure.scope.previously_unsourced_claims,8);
assert.equal(closure.scope.unsourced_claims_after_absorption,0);
assert.equal(closure.resolutions.length,18);
assert.equal(new Set(closure.resolutions.map(x=>x.claim_id)).size,18,"final absorption contains duplicate claim resolutions");
for(const resolution of closure.resolutions){
  assert.ok(resolution.owner&&resolution.outcome,resolution.claim_id+" lost canonical owner/outcome");
  assert.ok(resolution.source_ids.length>0,resolution.claim_id+" is unsourced after final absorption");
  for(const sourceId of resolution.source_ids)assert.ok(closure.sources[sourceId],resolution.claim_id+" has unresolved closure source "+sourceId);
}

assert.equal(ownership.decisions.funeral_and_requiem.absorption_state,"COMPLETE");
assert.equal(ownership.decisions.catholic_home_and_family.absorption_state,"COMPLETE");
assert.equal(ownership.closure.catholic_life_absorption,"COMPLETE");
assert.equal(ownership.closure.publishable_residual_claims_without_owner,0);
assert.deepEqual(ownership.closure.intentional_research_only,["Religious Life","Vocations"]);

for(const forbidden of ["learn.catholic_life","learn.catholic_home","learn.funeral_requiem"]){
  assert.equal(LEARN_MODULE_IDS.includes(forbidden),false,"forbidden catch-all route surfaced: "+forbidden);
}

const sickStart=runtime.indexOf("function sick(win){");
const sickEnd=runtime.indexOf("\nfunction ",sickStart+20);
const sick=runtime.slice(sickStart,sickEnd);
const matrimonyStart=runtime.indexOf("function matrimony(win){");
const matrimonyEnd=runtime.indexOf("\nfunction ",matrimonyStart+20);
const matrimony=runtime.slice(matrimonyStart,matrimonyEnd);

assert.match(sick,/WHEN DEATH OCCURS/);
assert.match(sick,/FUNERAL & REQUIEM/);
assert.match(sick,/BURIAL, CREMATION & ASHES/);
assert.match(sick,/mass:true/);
assert.match(runtime,/data-ao-tradlearn-mass/);
assert.match(sick,/route:"pray\.holy_souls"/);
assert.doesNotMatch(sick,/DISCERNMENT & ENGAGEMENT|CANONICAL PREPARATION/,"Matrimony cards leaked into Serious Illness");

assert.match(matrimony,/DISCERNMENT & ENGAGEMENT/);
assert.match(matrimony,/CANONICAL PREPARATION/);
assert.match(matrimony,/LIVING THE MARRIAGE/);
assert.match(matrimony,/Family Rosary/);
assert.match(matrimony,/Sacred Heart prayers/);
assert.match(matrimony,/marriage anniversary is an occasion of thanksgiving/i);
assert.doesNotMatch(matrimony,/BURIAL, CREMATION & ASHES|WHEN DEATH OCCURS/,"funeral formation leaked into Matrimony");

for(const key of [
  "missal1962","currentFuneralsCanons","currentFuneralsCatechism","currentPurgatory",
  "currentAshes","currentAshes2023","catafalque","familyPrayer","piusXiiFamilyRosary",
  "leoXiiiSacredHeart","sacredHeartFamily","marriageAnniversary"
]) assert.ok(TRADITIONAL_LEARN_SOURCES_V381[key],"missing final absorption source "+key);

console.log(JSON.stringify({
  funeralRequiemClaims:15,
  catholicHomeFamilyClaims:3,
  unsourcedAfterAbsorption:0,
  publishableResidualWithoutOwner:0,
  religiousLife:"RESEARCH_ONLY",
  vocations:"RESEARCH_ONLY",
},null,2));
