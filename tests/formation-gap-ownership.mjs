import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const sot=JSON.parse(readFileSync("data/learn/formation-gap-ownership.v1.json","utf8"));
assert.equal(sot.version,"FORMATION_GAP_OWNERSHIP_V1");
assert.equal(sot.status,"FROZEN_ARCHITECTURE_DECISION");

assert.equal(sot.decisions.spiritual_life.decision,"CREATE_FOCUSED_FORMATION_STRAND");
assert.equal(sot.decisions.spiritual_life.future_route,"learn.spiritual_life");
assert.equal(sot.decisions.spiritual_life.route_state,"PUBLISHED");
assert.equal(LEARN_MODULE_IDS.includes("learn.spiritual_life"),true,"published Spiritual Life route missing from Formation");

assert.equal(sot.decisions.catholic_home_and_family.decision,"NO_STANDALONE_FORMATION_SURFACE");
assert.equal(sot.decisions.funeral_and_requiem.decision,"NO_STANDALONE_FORMATION_SURFACE");
assert.equal(sot.decisions.funeral_and_requiem.absorption_state,"COMPLETE");
assert.equal(sot.decisions.catholic_home_and_family.absorption_state,"COMPLETE");
assert.equal(sot.closure.catholic_life_absorption,"COMPLETE");
assert.equal(sot.closure.publishable_residual_claims_without_owner,0);
assert.equal(sot.decisions.religious_life.decision,"RESEARCH_ONLY_NO_SURFACE");
assert.equal(sot.decisions.vocations.decision,"RESEARCH_ONLY_NO_SURFACE");

for(const forbidden of [
  "learn.catholic_life",
  "learn.catholic_home",
  "learn.funeral_requiem",
  "learn.religious_life",
  "learn.vocations"
]) assert.equal(LEARN_MODULE_IDS.includes(forbidden),false,"forbidden/reserved Formation route surfaced: "+forbidden);

const retirement=JSON.parse(readFileSync("data/learn/focused-formation-gaps-catholic-life-salvage.v1.json","utf8"));
assert.equal(retirement.status,"RESEARCH_ONLY_NOT_PUBLISHABLE_AS_IS");
assert.equal(retirement.domains["FORMATION.FUNERAL_AND_REQUIEM"].claim_count,15);
assert.equal(retirement.domains["FORMATION.RELIGIOUS_LIFE"].claim_count,7);
assert.equal(retirement.domains["FORMATION.VOCATIONS"].claim_count,7);
assert.equal(retirement.domains["FORMATION.CATHOLIC_HOME_AND_FAMILY"].claim_count,3);

console.log(JSON.stringify({
  spiritualLife:"PUBLISHED_FOCUSED_STRAND",
  catholicHome:"ABSORBED_NO_STANDALONE_SURFACE",
  funeralRequiem:"ABSORBED_EXISTING_OWNERS",
  religiousLife:"RESEARCH_ONLY",
  vocations:"RESEARCH_ONLY",
},null,2));
