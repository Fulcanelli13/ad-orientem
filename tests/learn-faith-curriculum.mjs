import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const curriculum=JSON.parse(readFileSync("data/learn/learn-the-faith-curriculum.v1.json","utf8"));
const sources=JSON.parse(readFileSync("data/learn/learn-the-faith-sources.v1.json","utf8"));
const questionIndex=JSON.parse(readFileSync("data/learn/pius-x-1912-question-index.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));

assert.equal(curriculum.schema,"ao-learn-the-faith-curriculum-v1");
assert.equal(curriculum.status,"FULL_55_LESSON_DRAFT_SOURCE_LINKED_NOT_PUBLISHED");
assert.equal(curriculum.proposed_route,"learn.faith");
assert.equal(curriculum.publication_gate.published,false);
assert.equal(curriculum.publication_gate.mapping_complete,true);
assert.equal(curriculum.publication_gate.lesson_prose_complete,true);
assert.equal(curriculum.publication_gate.paragraph_sources_complete,true);
assert.equal(curriculum.publication_gate.cross_module_dedup_complete,false);
assert.equal(curriculum.publication_gate.theological_editorial_review_complete,false);
assert.equal(curriculum.publication_gate.french_editorial_review_complete,false);
assert.equal(LEARN_MODULE_IDS.includes("learn.faith"),false,"Learn the Faith surfaced before publication gates passed");

assert.deepEqual(
  curriculum.families.map(x=>[x.id,x.lessonIds.length]),
  [
    ["revelation-faith",6],
    ["creed",15],
    ["grace-sacraments",10],
    ["moral-life",15],
    ["prayer-christian-life",9],
  ],
);

assert.equal(curriculum.lessons.length,55);
assert.equal(new Set(curriculum.lessons.map(x=>x.id)).size,55);
assert.equal(curriculum.lessons[0].id,"LTF-001");
assert.equal(curriculum.lessons.at(-1).id,"LTF-055");
assert.equal(curriculum.content_progress.draftedLessons,55);
assert.equal(curriculum.content_progress.totalLessons,55);
assert.equal(curriculum.content_progress.teachingPoints,166);
assert.equal(curriculum.content_progress.bilingualSummaries,55);
assert.equal(curriculum.content_progress.bilingualTeachingPoints,166);
assert.equal(curriculum.content_progress.allLessonDraftsPresent,true);

assert.equal(curriculum.source_registry_file,"data/learn/learn-the-faith-sources.v1.json");
assert.equal(curriculum.catechism_corpus.question_index,"data/learn/pius-x-1912-question-index.v1.json");
assert.equal(curriculum.catechism_corpus.question_count,433);
assert.equal(curriculum.catechism_corpus.source_chapters,21);

assert.equal(questionIndex.schema,"ao-pius-x-1912-question-index-v1");
assert.equal(questionIndex.status,"CANONICAL_433_QUESTION_INDEX");
assert.equal(questionIndex.questions.length,433);
assert.equal(questionIndex.integrity.questionCount,433);
assert.equal(questionIndex.integrity.firstQuestion,1);
assert.equal(questionIndex.integrity.lastQuestion,433);
assert.equal(questionIndex.integrity.contiguous,true);
assert.equal(questionIndex.integrity.chapters,21);
assert.equal(questionIndex.historical_discipline_flags.length,8);
for(let i=0;i<questionIndex.questions.length;i++)assert.equal(questionIndex.questions[i].n,i+1,"Pius X question index lost contiguous numbering");

const sourceIds=new Set(sources.sources.map(x=>x.id));
assert.equal(sources.status,"ACTIVE_SOURCE_REGISTRY");
for(const lesson of curriculum.lessons){
  assert.equal(lesson.owner,"learn-the-faith");
  assert.equal(lesson.doctrineOwner,"catechism");
  assert.ok(lesson.title?.en&&lesson.title?.fr,lesson.id+" lost bilingual title");
  assert.ok(lesson.summary?.en&&lesson.summary?.fr,lesson.id+" lost bilingual summary");
  assert.ok(Array.isArray(lesson.catechismRefs),lesson.id+" catechismRefs missing");
  assert.ok(lesson.catechismRefs.every(n=>Number.isInteger(n)&&n>=1&&n<=433),lesson.id+" has invalid Catechism question reference");
  assert.ok(Array.isArray(lesson.sourceRefs)&&lesson.sourceRefs.length,lesson.id+" sourceRefs missing");
  assert.ok(Array.isArray(lesson.teachingPoints)&&lesson.teachingPoints.length>=3,lesson.id+" has insufficient teaching points");
  for(const id of lesson.sourceRefs)assert.ok(sourceIds.has(id),lesson.id+" unresolved source "+id);
  for(const point of lesson.teachingPoints){
    assert.ok(point.text?.en?.trim(),point.id+" missing English prose");
    assert.ok(point.text?.fr?.trim(),point.id+" missing French prose");
    assert.ok(Array.isArray(point.sourceRefs)&&point.sourceRefs.length,point.id+" missing paragraph-level source refs");
    assert.ok((point.catechismRefs||[]).every(n=>Number.isInteger(n)&&n>=1&&n<=433),point.id+" has invalid Pius X refs");
    for(const id of point.sourceRefs)assert.ok(sourceIds.has(id),point.id+" unresolved source "+id);
  }
}

const primary=curriculum.lessons.flatMap(x=>x.primaryCatechismRefs||[]);
assert.equal(primary.length,433,"Primary guided ownership no longer covers exactly 433 Pius X questions");
assert.equal(new Set(primary).size,433,"A Pius X question has duplicate primary guided ownership");
assert.deepEqual([...primary].sort((a,b)=>a-b),Array.from({length:433},(_,i)=>i+1),"Primary guided ownership no longer covers Q1-Q433 exactly");
assert.equal(curriculum.coverage.primaryMappedQuestionCount,433);
assert.deepEqual(curriculum.coverage.unmappedPrimaryQuestions,[]);
assert.deepEqual(curriculum.coverage.duplicatePrimaryQuestions,[]);

const mary=curriculum.lessons.find(x=>x.id==="LTF-050");
assert.ok(mary.sourceRefs.includes("PIUS9-INEFFABILIS"),"Immaculate Conception primary definition missing");
assert.ok(mary.sourceRefs.includes("PIUS12-MUNIFICENTISSIMUS"),"Assumption primary definition missing");
assert.ok(mary.teachingPoints.some(p=>p.sourceRefs.includes("PIUS12-MUNIFICENTISSIMUS")),"Assumption teaching point missing");
const litYear=curriculum.lessons.find(x=>x.id==="LTF-053");
assert.ok(litYear.teachingPoints.some(p=>p.sourceRefs.includes("PIUS12-MEDIATOR")),"Pius XII liturgical-year source missing");

assert.equal(ownership.guided_formation.learn_the_faith.registry,"data/learn/learn-the-faith-curriculum.v1.json");
assert.equal(ownership.guided_formation.learn_the_faith.visible,false);
assert.equal(ownership.guided_formation.learn_the_faith.lesson_count,55);
assert.equal(ownership.guided_formation.learn_the_faith.mapped_catechism_questions,433);

for(const obsolete of [
  "data/learn/learn-the-faith-content.batch1.v1.json",
  "data/learn/learn-the-faith-content.batch2.v1.json",
  "data/learn/learn-the-faith-content.batch3.v1.json",
  "data/learn/learn-the-faith-content.v1.json",
  "data/learn/learn-the-faith-lessons-001-018.v1.json",
  "data/learn/learn-the-faith-lessons-019-036.v1.json",
  "data/learn/learn-the-faith-lessons-037-054.v1.json",
  "data/learn/pius-x-catechism-source-map.v1.json",
  "data/learn/st-pius-x-catechism-source-map.v1.json",
]){
  assert.equal(existsSync(obsolete),false,"Superseded Learn the Faith representation returned: "+obsolete);
}

console.log(JSON.stringify({
  lessons:55,
  teachingPoints:166,
  catechismQuestions:433,
  primaryCoverage:433,
  sourceRegistry:sources.sources.length,
  duplicateLessonRepresentations:0,
  published:false
},null,2));
