import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  APOSTOLATE_CLAIM_CLASSES,
  APOSTOLATE_ENGINES,
  APOSTOLATE_HANDOFF_DIRECTIONS,
  APOSTOLATE_OWNER,
  APOSTOLATE_OWNERSHIP_BOUNDARIES,
  APOSTOLATE_SCENARIO_FAMILIES,
  APOSTOLATE_SCENARIO_IDS,
  APOSTOLATE_SKILLS,
  APOSTOLATE_SOT_VERSION,
  engineForScenarioId,
  makeApostolateHandoff,
  makeApostolateScenario,
} from "../src/apostolate/contracts.js";
import { createApostolateScenarioEngine } from "../src/apostolate/engine.js";
import { createApostolateOwner } from "../src/apostolate/browser-entry.js";
import { APP_SURFACES, APP_ROUTE_SURFACES, normalizeAppSurface } from "../src/app/contracts.js";

assert.equal(APOSTOLATE_SOT_VERSION,"APOSTOLATE_SOT_V1");
assert.equal(APOSTOLATE_OWNER,"AO_APOSTOLATE_APP_V1");
assert.deepEqual(APOSTOLATE_SCENARIO_FAMILIES.map(x=>[x.prefix,x.count,x.engine]),[
  ["AQ",8,APOSTOLATE_ENGINES.ANSWER],
  ["HS",7,APOSTOLATE_ENGINES.HELP],
  ["FH",8,APOSTOLATE_ENGINES.HELP],
  ["TF",5,APOSTOLATE_ENGINES.INTRODUCE],
  ["DV",5,APOSTOLATE_ENGINES.INTRODUCE],
  ["WC",3,APOSTOLATE_ENGINES.INTRODUCE],
]);
assert.equal(APOSTOLATE_SCENARIO_IDS.length,36);
assert.equal(new Set(APOSTOLATE_SCENARIO_IDS).size,36);
assert.deepEqual(APOSTOLATE_SCENARIO_IDS.slice(0,8),["AQ01","AQ02","AQ03","AQ04","AQ05","AQ06","AQ07","AQ08"]);
assert.deepEqual(APOSTOLATE_SCENARIO_IDS.slice(-3),["WC01","WC02","WC03"]);
assert.equal(APOSTOLATE_SKILLS.length,9);
assert.deepEqual(APOSTOLATE_SKILLS.map(x=>x.id),["APF01","APF02","APF03","APF04","APF05","APF06","APF07","APF08","APF09"]);
assert.deepEqual(APOSTOLATE_CLAIM_CLASSES,["D","N","T","H","S","P","C"]);

assert.equal(engineForScenarioId("AQ03"),APOSTOLATE_ENGINES.ANSWER);
assert.equal(engineForScenarioId("HS01"),APOSTOLATE_ENGINES.HELP);
assert.equal(engineForScenarioId("FH08"),APOSTOLATE_ENGINES.HELP);
assert.equal(engineForScenarioId("TF05"),APOSTOLATE_ENGINES.INTRODUCE);
assert.equal(engineForScenarioId("DV02"),APOSTOLATE_ENGINES.INTRODUCE);
assert.equal(engineForScenarioId("WC03"),APOSTOLATE_ENGINES.INTRODUCE);
assert.equal(engineForScenarioId("NOPE"),null);

assert.throws(()=>makeApostolateScenario({
  id:"AQ01",publication:"READY",claimClass:"D",sourceIds:[],text:{en:"x",fr:"y"},handoffs:[{}],
}),/source IDs/);
assert.throws(()=>makeApostolateScenario({
  id:"AQ01",publication:"READY",claimClass:"D",sourceIds:["SRC-1"],text:{en:"x"},handoffs:[{}],
}),/English and French/);
assert.throws(()=>makeApostolateScenario({
  id:"AQ01",publication:"READY",claimClass:"D",sourceIds:["SRC-1"],text:{en:"x",fr:"y"},handoffs:[],
}),/handoff/);

const ready=makeApostolateScenario({
  id:"AQ01",
  publication:"READY",
  claimClass:"D",
  sourceIds:["SRC-1"],
  text:{en:"English",fr:"Français"},
  handoffs:[{targetId:"learn.catechism"}],
});
assert.equal(ready.engine,APOSTOLATE_ENGINES.ANSWER);

const engine=createApostolateScenarioEngine([ready]);
assert.equal(engine.answer.resolve("AQ01").ok,true);
assert.equal(engine.help.resolve("AQ01").reason,"WRONG_ENGINE");
assert.equal(engine.resolve("AQ02").reason,"RESEARCH_ONLY");
assert.equal(engine.resolve("ZZ99").reason,"UNKNOWN_SCENARIO");
assert.deepEqual(engine.status(),{scenarioCount:36,registeredCount:1,publishedCount:1,researchOnlyCount:35});

const toFormation=makeApostolateHandoff({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId:"AQ01",
  targetId:"learn.catechism",
  reason:"Deepen the doctrinal answer",
});
assert.equal(toFormation.sourceSurface,"apostolate");
assert.equal(toFormation.targetSurface,"learn");
assert.throws(()=>makeApostolateHandoff({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.APOSTOLATE_TO_FORMATION,
  fromId:"AQ01",targetId:"formation.catechism",reason:"bad namespace",
}),/learn\.\*/);

const toApostolate=makeApostolateHandoff({
  direction:APOSTOLATE_HANDOFF_DIRECTIONS.FORMATION_TO_APOSTOLATE,
  fromId:"learn.catechism",
  targetId:"AQ01",
  reason:"Practise answering",
});
assert.equal(toApostolate.sourceSurface,"learn");
assert.equal(toApostolate.targetSurface,"apostolate");

assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.CONFESSION,{owner:"pray",target:"pray.confession"});
assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.ANOINTING_VIATICUM,{owner:"formation",target:"learn.rites.sick"});
assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.FIRST_COMMUNION,{owner:"formation",target:"learn.rites.first_communion"});
assert.deepEqual(APOSTOLATE_OWNERSHIP_BOUNDARIES.NOVENAS,{owner:"pray",target:"pray.novenas"});
assert.equal(APOSTOLATE_OWNERSHIP_BOUNDARIES.MASS.owner,"mass");
assert.equal(APOSTOLATE_OWNERSHIP_BOUNDARIES.RECEPTION.owner,"formation");

assert.equal(APP_SURFACES.includes("apostolate"),false,"A3 exposed Apostolate in the permanent ribbon");
assert.equal(APP_ROUTE_SURFACES.includes("apostolate"),false,"A3 made Apostolate a normal app route");
assert.equal(normalizeAppSurface("apostolate"),null,"A3 made Apostolate navigable through the app shell");

const doc={
  documentElement:{dataset:{}},
  querySelector(selector){
    if(selector.includes("apostolate"))return null;
    return null;
  },
};
const win={document:doc};
const owner=createApostolateOwner(win,{scenarios:[ready]});
assert.equal(owner.owner,"AO_APOSTOLATE_APP_V1");
assert.equal(owner.status().installed,true);
assert.equal(owner.status().hidden,true);
assert.equal(owner.status().visible,false);
assert.equal(owner.status().mounted,false);
assert.equal(owner.status().ribbonExposed,false);
assert.equal(owner.engines.answer.resolve("AQ01").ok,true);
assert.equal(owner.receiveHandoff(toApostolate).ok,true);
assert.equal(owner.handoffToFormation({fromId:"AQ01",targetRoute:"learn.catechism",reason:"Study"}).targetSurface,"learn");

const appSource=readFileSync("src/app/browser-entry.js","utf8");
assert.match(appSource,/import "\.\.\/apostolate\/browser-entry\.js";/,"hidden Apostolate owner is not installed by the app entry");
assert.doesNotMatch(appSource,/data-ao-app-surface=["']apostolate["']/,"Apostolate UI leaked into the ribbon");
assert.doesNotMatch(readFileSync("src/home/presentation.js","utf8"),/apostolate/i,"Apostolate leaked into Home presentation");
assert.doesNotMatch(readFileSync("src/learn/presentation.js","utf8"),/data-ao-app-surface=["']apostolate["']/i,"Apostolate leaked into Formation presentation");

console.log("PASS hidden Apostolate A3 contracts: 36 scenarios, 9 APF skills, gated engines, canonical handoffs, no visible surface.");
