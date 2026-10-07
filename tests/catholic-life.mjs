import assert from "node:assert/strict";
import {
  CATHOLIC_LIFE_VERSION,
  CATHOLIC_LIFE_ROUTE,
  CATHOLIC_LIFE_COURSES,
  CATHOLIC_LIFE_STAGES,
  CATHOLIC_LIFE_SOURCES,
  CATHOLIC_LIFE_SOURCE_MAP,
  CATHOLIC_LIFE_VALIDATION,
} from "../src/learn/catholic-life-data/index.js";

assert.equal(CATHOLIC_LIFE_VERSION,"1.2.0");
assert.equal(CATHOLIC_LIFE_ROUTE,"learn.catholic_life");
assert.equal(CATHOLIC_LIFE_COURSES.length,10);
assert.equal(CATHOLIC_LIFE_STAGES.length,79);
assert.equal(CATHOLIC_LIFE_SOURCES.length,101);
assert.equal(CATHOLIC_LIFE_VALIDATION.ok,true,CATHOLIC_LIFE_VALIDATION.errors.join("\n"));

const courseIds=new Set();
const stageIds=new Set();
const cardIds=new Set();
const claimIds=new Set();
let claims=0;
let applications=0;
const locks=new Set();

for(const course of CATHOLIC_LIFE_COURSES){
  assert.match(course.id,/^CL\d{2}$/);
  assert.equal(courseIds.has(course.id),false,course.id);
  courseIds.add(course.id);
  for(const stage of course.stages){
    assert.equal(stageIds.has(stage.id),false,stage.id);
    stageIds.add(stage.id);
    assert.ok(stage.question);
    assert.ok(stage.objective);
    assert.ok(Array.isArray(stage.cards)&&stage.cards.length>0,stage.id);
    assert.ok(stage.application?.prompt,stage.id);
    assert.ok(stage.completion,stage.id);
    applications+=1;
    for(const lock of stage.locks||[])locks.add(lock);
    for(const card of stage.cards){
      assert.equal(cardIds.has(card.id),false,card.id);
      cardIds.add(card.id);
      for(const claim of card.claims||[]){
        claims+=1;
        assert.equal(claimIds.has(claim.id),false,claim.id);
        claimIds.add(claim.id);
        assert.notEqual(claim.layer,"TRADITIONAL",claim.id);
        if(claim.layer==="PASTORAL")assert.ok(claim.basis,claim.id);
        if(claim.layer==="CUSTOM")assert.ok((claim.territory||[]).length>0,claim.id);
        for(const sourceId of claim.sources||[]){
          assert.ok(CATHOLIC_LIFE_SOURCE_MAP[sourceId],`${claim.id} -> ${sourceId}`);
        }
        if(claim.layer==="PROFILE_1962"){
          assert.ok((claim.sources||[]).some(id=>(CATHOLIC_LIFE_SOURCE_MAP[id]?.profile_validity||[]).includes("PROFILE_1962")),claim.id);
        }
      }
    }
  }
}

assert.equal(stageIds.size,79);
assert.equal(applications,79);
assert.ok(claims>=400,`expected >=400 claims, got ${claims}`);
assert.equal(CATHOLIC_LIFE_SOURCES.some(source=>String(source.status||"").startsWith("MIGRATION_REFERENCE")),false);
for(const required of [
  "RL-ARCHITECTURE-PROFILE",
  "RL-COMM-FAST-MIDNIGHT-NOT-1962",
  "RL-MIXED-MARRIAGE-NOT-DISPARITY",
  "RL-DYING-NOT-DEATH-CONFIRMED",
  "RL-CALENDAR-DATE-NOT-EVENT",
  "RL-SUBDIACONATE-NOT-FOURTH-DEGREE",
  "RL-LITURGICAL-PROFILE-NOT-CANONICAL-STATUS",
]) assert.ok(locks.has(required),required);

console.log(JSON.stringify({
  version:CATHOLIC_LIFE_VERSION,
  route:CATHOLIC_LIFE_ROUTE,
  courses:courseIds.size,
  stages:stageIds.size,
  cards:cardIds.size,
  claims,
  applications,
  sources:CATHOLIC_LIFE_SOURCES.length,
  regressionLocks:locks.size,
  validation:"PASS",
},null,2));
