import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const registry=JSON.parse(readFileSync("data/mass/mass-knowledge-registry.v1.json","utf8"));
const gestures=JSON.parse(readFileSync("data/mass/gesture-matrix.v1.json","utf8"));
const postures=JSON.parse(readFileSync("data/presentation/reader-postures.v1.json","utf8"));
const positions=JSON.parse(readFileSync("data/presentation/reader-priest-positions.v1.json","utf8"));
const voices=JSON.parse(readFileSync("data/presentation/reader-priest-voices.v1.json","utf8"));
const responses=JSON.parse(readFileSync("data/presentation/reader-responses.v1.json","utf8"));
const rubricEvents=JSON.parse(readFileSync("data/presentation/reader-rubric-events.v1.json","utf8"));
const formation=JSON.parse(readFileSync("data/learn/mass-formation-campion.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));

assert.equal(registry.schema,"ao-mass-knowledge-registry-v1");
assert.equal(registry.status,"CANONICAL_SHARED_MASS_KNOWLEDGE");
assert.equal(registry.no_new_route,true);
assert.equal(registry.canonical_formation_route,"learn.mass");

assert.equal(gestures.status,"CANONICAL_GESTURE_SOT");
assert.equal(gestures.items.length,142);
assert.equal(gestures.items.filter(x=>x.actor==="PRIEST").length,83);
assert.equal(gestures.items.filter(x=>x.actor==="FAITHFUL").length,59);
assert.equal(postures.items.length,23);
assert.equal(positions.items.length,49);
assert.equal(voices.items.length,126);
assert.equal(responses.items.length,23);
assert.equal(rubricEvents.items.length,57);
assert.equal(formation.stages.length,8);

const counts=Object.fromEntries(registry.source_registries.map(x=>[x.id,x.count]));
assert.deepEqual(counts,{
  GESTURES:142,POSTURES:23,PRIEST_POSITIONS:49,PRIEST_VOICES:126,
  RESPONSES:23,RUBRIC_EVENTS:57,MASS_FORMATION:8
});

assert.ok(registry.projection_contracts.mass_runtime.owns.includes("current posture"));
assert.ok(registry.projection_contracts.mass_formation.owns.includes("meaning of gestures and postures"));
assert.equal(registry.projection_contracts.mass_formation.route,"learn.mass");
assert.ok(registry.migration_policy.some(x=>/Do not create a top-level Gestures & Postures/i.test(x)));

assert.equal(ownership.shared_knowledge_layers.mass.registry,"data/mass/mass-knowledge-registry.v1.json");
assert.equal(ownership.shared_knowledge_layers.mass.owner,"mass-formation");
assert.equal(ownership.shared_knowledge_layers.mass.runtime_projection,"mass");

console.log(JSON.stringify({
  canonicalGestureRows:142,
  priestGestures:83,
  faithfulGestures:59,
  postures:23,
  priestPositions:49,
  priestVoices:126,
  responses:23,
  rubricEvents:57,
  formationStages:8,
  newTopLevelRoute:false
},null,2));
