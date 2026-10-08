import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const curriculum=JSON.parse(readFileSync("data/learn/learn-the-faith-curriculum.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));

assert.equal(curriculum.schema,"ao-learn-the-faith-curriculum-v1");
assert.equal(curriculum.status,"CURRICULUM_FROZEN_NOT_PUBLISHED");
assert.equal(curriculum.proposed_route,"learn.faith");
assert.equal(curriculum.publication_gate.published,false);
assert.equal(LEARN_MODULE_IDS.includes("learn.faith"),false,"Unsourced Learn the Faith route surfaced prematurely");

assert.equal(curriculum.families.length,5);
assert.deepEqual(
  curriculum.families.map(x=>[x.id,x.lessonIds.length]),
  [
    ["revelation-faith",6],
    ["creed",15],
    ["grace-sacraments",10],
    ["moral-life",14],
    ["prayer-christian-life",9],
  ]
);

assert.equal(curriculum.lessons.length,54);
assert.equal(new Set(curriculum.lessons.map(x=>x.id)).size,54);
assert.equal(curriculum.lessons[0].id,"LTF-001");
assert.equal(curriculum.lessons.at(-1).id,"LTF-054");

for(const lesson of curriculum.lessons){
  assert.equal(lesson.owner,"learn-the-faith");
  assert.equal(lesson.doctrineOwner,"catechism");
  assert.equal(lesson.status,"CURRICULUM_ONLY");
  assert.ok(lesson.title?.en&&lesson.title?.fr,lesson.id+" lost bilingual title");
  assert.ok(Array.isArray(lesson.catechismRefs),lesson.id+" catechismRefs missing");
  assert.ok(Array.isArray(lesson.sourceRefs),lesson.id+" sourceRefs missing");
}

assert.equal(curriculum.relationship_to_existing["learn.catechism"].includes("Full searchable"),true);
assert.equal(curriculum.relationship_to_existing["learn.catechism.daily"].includes("Daily review"),true);
assert.equal(curriculum.source_policy.no_unsourced_synthesis,true);
assert.equal(curriculum.source_policy.no_duplicate_question_bank,true);

assert.equal(ownership.guided_formation.learn_the_faith.registry,"data/learn/learn-the-faith-curriculum.v1.json");
assert.equal(ownership.guided_formation.learn_the_faith.visible,false);
assert.equal(ownership.guided_formation.learn_the_faith.doctrine_reference,"learn.catechism");
assert.equal(ownership.guided_formation.learn_the_faith.daily_review,"learn.catechism.daily");

console.log(JSON.stringify({
  families:curriculum.families.length,
  lessons:curriculum.lessons.length,
  published:false,
  existingCatechismUntouched:true
},null,2));
