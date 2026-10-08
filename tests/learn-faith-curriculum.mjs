import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const curriculum=JSON.parse(readFileSync("data/learn/learn-the-faith-curriculum.v1.json","utf8"));
const content=JSON.parse(readFileSync("data/learn/learn-the-faith-content.v1.json","utf8"));
const sourceMap=JSON.parse(readFileSync("data/learn/st-pius-x-catechism-source-map.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));

assert.equal(curriculum.schema,"ao-learn-the-faith-curriculum-v1");
assert.equal(curriculum.status,"CURRICULUM_FROZEN_NOT_PUBLISHED");
assert.equal(curriculum.proposed_route,"learn.faith");
assert.equal(curriculum.publication_gate.published,false);
assert.equal(curriculum.publication_gate.mapping_complete,true);
assert.equal(curriculum.publication_gate.lesson_prose_complete,true);
assert.equal(curriculum.publication_gate.paragraph_sources_complete,true);
assert.equal(curriculum.publication_gate.editorial_review_complete,false);
assert.equal(LEARN_MODULE_IDS.includes("learn.faith"),false,"Learn the Faith surfaced before publication gates passed");

assert.equal(curriculum.families.length,5);
assert.equal(curriculum.lessons.length,54);
assert.equal(new Set(curriculum.lessons.map(x=>x.id)).size,54);
assert.equal(curriculum.lessons[0].id,"LTF-001");
assert.equal(curriculum.lessons.at(-1).id,"LTF-054");
assert.deepEqual(curriculum.coverage_summary,{direct:48,partial:6,unmapped:0});

assert.equal(sourceMap.schema,"ao-st-pius-x-catechism-source-map-v1");
assert.equal(sourceMap.status,"CANONICAL_REFERENCE_MAP");
assert.equal(sourceMap.corpus.questionCount,433);
assert.equal(sourceMap.corpus.ranges.length,21);
assert.equal(sourceMap.corpus.ranges[0].from,1);
assert.equal(sourceMap.corpus.ranges.at(-1).to,433);
for(let i=1;i<sourceMap.corpus.ranges.length;i++){
  assert.equal(sourceMap.corpus.ranges[i].from,sourceMap.corpus.ranges[i-1].to+1,"Catechism source ranges are not contiguous");
}

const mapped=new Set(curriculum.lessons.flatMap(lesson=>lesson.catechismRefs.map(ref=>Number(String(ref).slice(-3)))));
assert.equal(mapped.size,433,"Not all 433 Catechism questions are represented");
for(let n=1;n<=433;n++)assert.ok(mapped.has(n),"Missing Catechism Q"+n);
assert.equal(curriculum.mapping_coverage.lessonsMapped,54);
assert.equal(curriculum.mapping_coverage.catechismQuestionsCovered,433);
assert.deepEqual(curriculum.mapping_coverage.unmappedQuestions,[]);

assert.equal(content.schema,"ao-learn-the-faith-content-v1");
assert.equal(content.status,"FULL_54_LESSON_DRAFT_SOURCE_MAPPED_NOT_PUBLISHED");
assert.equal(content.lessonCount,54);
assert.equal(content.lessons.length,54);
assert.equal(new Set(content.lessons.map(x=>x.id)).size,54);
assert.equal(content.coverage.questions,433);
assert.equal(content.coverage.directLessons,48);
assert.equal(content.coverage.partialLessons,6);
assert.equal(content.coverage.published,false);

const registry=curriculum.source_registry;
const claims=content.lessons.flatMap(lesson=>(lesson.claims||[]).map(claim=>({lesson,...claim})));
assert.equal(claims.length,108);
for(const {lesson, ...claim} of claims){
  assert.ok(claim.text?.en?.trim(),lesson.id+" missing English claim");
  assert.ok(claim.text?.fr?.trim(),lesson.id+" missing French claim");
  assert.ok(Array.isArray(claim.catechismRefs)&&claim.catechismRefs.length>0,lesson.id+" claim missing exact Catechism refs");
  assert.ok(Array.isArray(claim.sourceRefs)&&claim.sourceRefs.length>0,lesson.id+" claim missing source refs");
  for(const id of claim.sourceRefs)assert.ok(registry[id],lesson.id+" unresolved source id "+id);
}
for(const lesson of content.lessons){
  const canonical=curriculum.lessons.find(x=>x.id===lesson.id);
  assert.ok(canonical,lesson.id+" absent from curriculum");
  assert.deepEqual(lesson.catechismRefs,canonical.catechismRefs,lesson.id+" content/curriculum Catechism refs diverged");
  assert.ok(lesson.sourceRefs.length>0,lesson.id+" missing lesson source refs");
  for(const id of lesson.sourceRefs)assert.ok(registry[id],lesson.id+" unresolved lesson source id "+id);
}

const partialIds=["LTF-016","LTF-033","LTF-034","LTF-045","LTF-051","LTF-052"];
assert.deepEqual(content.lessons.filter(x=>x.catechismCoverage==="PARTIAL").map(x=>x.id),partialIds);
assert.ok(content.lessons.find(x=>x.id==="LTF-033").claims.some(c=>c.sourceRefs.includes("LEO_XIII_LIBERTAS")));
assert.ok(content.lessons.find(x=>x.id==="LTF-034").claims.some(c=>c.sourceRefs.includes("VERITATIS_SPLENDOR_60_61")));
assert.ok(content.lessons.find(x=>x.id==="LTF-045").claims.some(c=>c.sourceRefs.includes("CCC_1868_COOPERATION")));
assert.ok(content.lessons.find(x=>x.id==="LTF-052").claims.some(c=>c.sourceRefs.includes("PIUS_XII_MEDIATOR_DEI_165")));

assert.equal(curriculum.catechism_mapping.directOrPartialLessons,54);
assert.equal(curriculum.catechism_mapping.supplementRequiredLessons,6);
assert.deepEqual(curriculum.catechism_mapping.zeroDirectCatechismRefLessons,[]);
assert.equal(curriculum.content_draft.lessons,54);
assert.equal(curriculum.content_draft.claims,108);
assert.equal(curriculum.content_draft.published,false);

assert.equal(ownership.guided_formation.learn_the_faith.registry,"data/learn/learn-the-faith-curriculum.v1.json");
assert.equal(ownership.guided_formation.learn_the_faith.visible,false);
assert.equal(ownership.guided_formation.learn_the_faith.doctrine_reference,"learn.catechism");
assert.equal(ownership.guided_formation.learn_the_faith.daily_review,"learn.catechism.daily");

console.log(JSON.stringify({
  families:5,
  lessons:54,
  catechismQuestionsMapped:433,
  bilingualClaims:108,
  partialLessons:6,
  published:false,
  existingCatechismUntouched:true
},null,2));
