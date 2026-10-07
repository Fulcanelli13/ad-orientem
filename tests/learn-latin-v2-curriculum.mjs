import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const c=JSON.parse(readFileSync("data/learn/latin-course-40-v2-blueprint.v1.json","utf8"));
const v=JSON.parse(readFileSync("data/learn/latin-course-v2-vocabulary-policy.v1.json","utf8"));
const s=JSON.parse(readFileSync("data/learn/latin-course-scanlon-coverage.v1.json","utf8"));
assert.equal(c.status,"V2_CURRICULUM_BLUEPRINT");
assert.equal(c.lessons.length,40);
assert.equal(c.stageDefinitions.length,8);
for(const stage of c.stageDefinitions){
  assert.equal(stage.lessons[1]-stage.lessons[0]+1,5,`Stage ${stage.stage} must have five lessons`);
  assert.ok(stage.readingGate?.lesson>=stage.lessons[0]&&stage.readingGate.lesson<=stage.lessons[1],`Stage ${stage.stage} reading gate outside stage`);
}
assert.equal(c.stageDefinitions.find(x=>x.stage===6).title.en.includes("Canon"),false,"Stage 6 must not be mislabeled Canon");
assert.equal(c.lessons.find(x=>x.lesson===35).title,"The Language of the Canon");
for(const l of c.lessons){
  assert.ok(l.microUnits.length>=2&&l.microUnits.length<=3,`Lesson ${l.lesson} micro-unit count invalid`);
  assert.ok(l.vocabulary.mastery.length<=8,`Lesson ${l.lesson} exceeds Tier-A cap`);
  assert.ok(l.vocabulary.recognition.length<=10,`Lesson ${l.lesson} exceeds Tier-B cap`);
}
const assigned=[];
for(const l of c.lessons)for(const tier of ["mastery","recognition","curriculumSupport"])for(const lemma of l.vocabulary[tier])assigned.push(lemma);
assert.equal(new Set(assigned).size,350,"Frozen Core 1-350 must be allocated exactly once across A/B/C");
assert.equal(assigned.length,350,"Frozen Core allocation contains duplicates");
assert.equal(v.totals.frozenCoreAllocated,350);
assert.ok(v.totals.mastery<200,"v2 should stop pretending every Core 1-200 exposure is immediate mastery");
assert.ok(v.totals.mastery>=150,"v2 Tier-A floor unexpectedly low");
for(const id of s.gate.p0Open){
  const r=c.scanlonRemediation[id];
  assert.ok(r,`P0 Scanlon gap missing from curriculum: ${id}`);
  assert.ok(Array.isArray(r.lessons)&&r.lessons.length>0,`P0 gap ${id} has no lesson placement`);
  assert.ok(Array.isArray(r.assessment)&&r.assessment.length>0,`P0 gap ${id} has no assessment plan`);
}
for(const n of [5,10,15,20,25,30,35,40])assert.ok(c.lessons.find(x=>x.lesson===n).readingGate,`Lesson ${n} missing stage reading gate`);
for(const n of [37,38,39,40])assert.equal(c.lessons.find(x=>x.lesson===n).assessmentContract.mode,"connected-reading");
assert.equal(c.lessons.find(x=>x.lesson===40).readingGate.type,"unseen-capstone");
assert.equal(c.permanentTools.verbMap.visibleFromLesson,5);
assert.equal(c.permanentTools.verbMap.principalParts,true);
console.log("PASS Latin v2 curriculum:",v.totals,"P0 Scanlon gaps placed:",s.gate.p0Open.length);
