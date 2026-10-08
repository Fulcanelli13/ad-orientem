import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const curriculum=JSON.parse(readFileSync("data/learn/learn-the-faith-curriculum.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));
const sourceMap=JSON.parse(readFileSync("data/learn/pius-x-catechism-source-map.v1.json","utf8"));
const batches=[
  JSON.parse(readFileSync("data/learn/learn-the-faith-content.batch1.v1.json","utf8")),
  JSON.parse(readFileSync("data/learn/learn-the-faith-content.batch2.v1.json","utf8")),
  JSON.parse(readFileSync("data/learn/learn-the-faith-content.batch3.v1.json","utf8")),
];

assert.equal(curriculum.schema,"ao-learn-the-faith-curriculum-v1");
assert.equal(curriculum.status,"CURRICULUM_FROZEN_NOT_PUBLISHED");
assert.equal(curriculum.proposed_route,"learn.faith");
assert.equal(curriculum.publication_gate.published,false);
assert.equal(curriculum.publication_gate.mapping_complete,true);
assert.equal(curriculum.publication_gate.lesson_prose_complete,true);
assert.equal(curriculum.publication_gate.paragraph_sources_complete,true);
assert.equal(curriculum.publication_gate.editorial_review_complete,false);
assert.equal(LEARN_MODULE_IDS.includes("learn.faith"),false,"Learn the Faith surfaced before final editorial promotion");

assert.equal(curriculum.families.length,5);
assert.deepEqual(
  curriculum.families.map(x=>[x.id,x.lessonIds.length]),
  [
    ["revelation-faith",6],
    ["creed",15],
    ["grace-sacraments",10],
    ["moral-life",14],
    ["prayer-christian-life",9],
  ],
);

assert.equal(curriculum.lessons.length,54);
assert.equal(new Set(curriculum.lessons.map(x=>x.id)).size,54);
assert.equal(curriculum.lessons[0].id,"LTF-001");
assert.equal(curriculum.lessons.at(-1).id,"LTF-054");
assert.equal(curriculum.lessons.reduce((n,l)=>n+l.catechismRefs.length,0),709);
assert.equal(curriculum.lessons.filter(l=>l.sourceResolution==="SUPPLEMENT_REQUIRED").length,0);

for(const lesson of curriculum.lessons){
  assert.equal(lesson.owner,"learn-the-faith");
  assert.equal(lesson.doctrineOwner,"catechism");
  assert.equal(lesson.status,"CURRICULUM_ONLY");
  assert.ok(lesson.title?.en&&lesson.title?.fr,lesson.id+" lost bilingual title");
  assert.ok(lesson.catechismRefs.length>0,lesson.id+" lost exact Catechism mapping");
  assert.ok(lesson.catechismRefs.every(ref=>/^PXQ\d{3}$/.test(ref)),lesson.id+" has malformed Catechism ref");
  assert.ok(lesson.sourceRefs.length>0,lesson.id+" sourceRefs missing");
  for(const source of lesson.sourceRefs)assert.ok(curriculum.source_registry[source],lesson.id+" unresolved source registry id "+source);
}

assert.equal(sourceMap.schema,"ao-pius-x-catechism-source-map-v1");
assert.equal(sourceMap.status,"CANONICAL_SOURCE_MAP");
assert.equal(sourceMap.question_count,433);
assert.equal(sourceMap.chapters.length,21);
assert.equal(sourceMap.chapters.reduce((n,x)=>n+x.count,0),433);
assert.equal(curriculum.catechism_corpus.source_map,"data/learn/pius-x-catechism-source-map.v1.json");

assert.equal(batches.length,3);
assert.deepEqual(batches.map(x=>x.lessons.length),[18,18,18]);
const draftLessons=batches.flatMap(x=>x.lessons);
assert.equal(draftLessons.length,54);
assert.equal(new Set(draftLessons.map(x=>x.id)).size,54,"draft lesson coverage overlaps or has gaps");
assert.deepEqual(draftLessons.map(x=>x.id),curriculum.lessons.map(x=>x.id),"draft batches do not cover LTF-001–054 in canonical order");

const claims=draftLessons.flatMap(lesson=>lesson.claims.map(claim=>({lessonId:lesson.id,...claim})));
assert.equal(claims.length,176);
for(const claim of claims){
  assert.ok(claim.text?.en?.trim(),claim.lessonId+" has claim without English prose");
  assert.ok(claim.text?.fr?.trim(),claim.lessonId+" has claim without French prose");
  assert.ok(Array.isArray(claim.sourceRefs)&&claim.sourceRefs.length>0,claim.lessonId+" has unsourced substantive claim");
  for(const ref of claim.sourceRefs){
    assert.ok(curriculum.source_registry[ref.source],claim.lessonId+" claim has unresolved source "+ref.source);
    assert.ok(Array.isArray(ref.refs)&&ref.refs.length>0,claim.lessonId+" claim has source without locator");
  }
}

assert.match(draftLessons.find(x=>x.id==="LTF-045").claims.at(-1).text.en,/responsibility for another's sin/i);
assert.ok(draftLessons.find(x=>x.id==="LTF-049").claims.some(c=>c.sourceRefs.some(r=>r.source==="PIUS_XII_MUNIFICENTISSIMUS_DEUS")),"Assumption definition source missing");
assert.ok(draftLessons.find(x=>x.id==="LTF-052").claims.some(c=>c.sourceRefs.some(r=>r.source==="PIUS_XII_MEDIATOR_DEI_165")),"liturgical-year theology source missing");
assert.match(draftLessons.find(x=>x.id==="LTF-052").claims[1].text.en,/changed over time/i,"historical discipline safeguard missing from liturgical-year lesson");

assert.equal(curriculum.relationship_to_existing["learn.catechism"].includes("Full searchable"),true);
assert.equal(curriculum.relationship_to_existing["learn.catechism.daily"].includes("Daily review"),true);
assert.equal(curriculum.source_policy.no_unsourced_synthesis,true);
assert.equal(curriculum.source_policy.no_duplicate_question_bank,true);

assert.equal(ownership.guided_formation.learn_the_faith.registry,"data/learn/learn-the-faith-curriculum.v1.json");
assert.equal(ownership.guided_formation.learn_the_faith.visible,false);
assert.equal(ownership.guided_formation.learn_the_faith.doctrine_reference,"learn.catechism");
assert.equal(ownership.guided_formation.learn_the_faith.daily_review,"learn.catechism.daily");

console.log(JSON.stringify({
  families:5,
  lessons:54,
  catechismQuestionRefs:709,
  sourceLinkedClaims:176,
  unresolvedSourceGaps:0,
  published:false,
  existingCatechismUntouched:true
},null,2));
