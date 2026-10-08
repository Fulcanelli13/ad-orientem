import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { LEARN_MODULE_IDS } from "../src/learn/presentation.js";

const curriculum=JSON.parse(readFileSync("data/learn/learn-the-faith-curriculum.v1.json","utf8"));
const ownership=JSON.parse(readFileSync("data/learn/content-ownership-registry.v1.json","utf8"));
const sources=JSON.parse(readFileSync("data/learn/learn-the-faith-sources.v1.json","utf8"));
const batch1=JSON.parse(readFileSync("data/learn/learn-the-faith-lessons-001-018.v1.json","utf8"));
const batch2=JSON.parse(readFileSync("data/learn/learn-the-faith-lessons-019-036.v1.json","utf8"));
const batch3=JSON.parse(readFileSync("data/learn/learn-the-faith-lessons-037-054.v1.json","utf8"));
const sourceMap=JSON.parse(readFileSync("data/learn/pius-x-catechism-source-map.v1.json","utf8"));
const batches=[
  JSON.parse(readFileSync("data/learn/learn-the-faith-content.batch1.v1.json","utf8")),
  JSON.parse(readFileSync("data/learn/learn-the-faith-content.batch2.v1.json","utf8")),
  JSON.parse(readFileSync("data/learn/learn-the-faith-content.batch3.v1.json","utf8")),
];

assert.equal(curriculum.schema,"ao-learn-the-faith-curriculum-v1");
assert.equal(curriculum.status,"QUESTION_MAPPING_COMPLETE_NOT_PUBLISHED");
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
    ["moral-life",15],
    ["prayer-christian-life",9],
  ],
);

assert.equal(curriculum.lessons.length,55);
assert.equal(curriculum.coverage_summary.direct,48);
assert.equal(curriculum.coverage_summary.partial,6);
assert.equal(curriculum.coverage_summary.unmapped,0);
assert.equal(new Set(curriculum.lessons.map(x=>x.id)).size,55);
assert.equal(curriculum.lessons[0].id,"LTF-001");
assert.equal(curriculum.lessons.at(-1).id,"LTF-055");
assert.equal(curriculum.lessons.reduce((n,l)=>n+l.catechismRefs.length,0),709);
assert.equal(curriculum.lessons.filter(l=>l.sourceResolution==="SUPPLEMENT_REQUIRED").length,0);

for(const lesson of curriculum.lessons){
  assert.equal(lesson.owner,"learn-the-faith");
  assert.equal(lesson.doctrineOwner,"catechism");
  assert.equal(lesson.status,"CATECHISM_MAPPED");
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

const primary=curriculum.lessons.flatMap(x=>x.primaryCatechismRefs);
assert.equal(primary.length,433,"not every St Pius X question has exactly one primary guided owner");
assert.equal(new Set(primary).size,433,"a St Pius X question has multiple primary guided owners");
assert.deepEqual([...new Set(primary)].sort((a,b)=>a-b),Array.from({length:433},(_,i)=>i+1),"primary mapping does not cover Q1-Q433 exactly");
assert.equal(curriculum.coverage.primaryMappedQuestionCount,433);
assert.deepEqual(curriculum.coverage.unmappedPrimaryQuestions,[]);
assert.ok(curriculum.coverage.lessonsRequiringSupplement.includes("LTF-033"),"Natural law supplement gate disappeared");
assert.ok(curriculum.coverage.lessonsRequiringSupplement.includes("LTF-034"),"Conscience supplement gate disappeared");
assert.ok(curriculum.lessons.find(x=>x.id==="LTF-046")?.title?.en==="The Precepts of the Church","Precepts of the Church lesson missing");
assert.equal(curriculum.relationship_to_existing["learn.catechism"].includes("Full searchable"),true);
assert.equal(curriculum.relationship_to_existing["learn.catechism.daily"].includes("Daily review"),true);
assert.equal(curriculum.source_policy.no_unsourced_synthesis,true);
assert.equal(curriculum.source_policy.no_duplicate_question_bank,true);

assert.equal(curriculum.catechism_source_index.questionCount,433);
assert.equal(curriculum.mapping_coverage.lessonsMapped,54);
assert.equal(curriculum.mapping_coverage.catechismQuestionsCovered,433);
assert.deepEqual(curriculum.mapping_coverage.unmappedQuestions,[]);
assert.equal(curriculum.mapping_coverage.publicationReady,false);
const mappedQuestionNumbers=new Set(curriculum.lessons.flatMap(lesson=>lesson.catechismRefs.map(ref=>Number(ref.slice(1)))));
assert.equal(mappedQuestionNumbers.size,433,"Not all 433 Catechism questions are represented in the guided curriculum");
for(let n=1;n<=433;n++)assert.ok(mappedQuestionNumbers.has(n),"Catechism Q"+n+" is missing from Learn the Faith");
assert.equal(curriculum.catechism_source_map,"data/learn/st-pius-x-catechism-source-map.v1.json");
const sourceMap=JSON.parse(readFileSync(curriculum.catechism_source_map,"utf8"));
assert.equal(sourceMap.corpus.questionCount,433);
assert.equal(sourceMap.corpus.ranges[0].from,1);
assert.equal(sourceMap.corpus.ranges.at(-1).to,433);
for(let i=1;i<sourceMap.corpus.ranges.length;i++)assert.equal(sourceMap.corpus.ranges[i].from,sourceMap.corpus.ranges[i-1].to+1,"Catechism chapter ranges are not contiguous");
assert.equal(curriculum.content_draft.status,"ALL_54_SOURCE_LINKED_DRAFTED");
assert.equal(curriculum.content_draft.lessons,54);
assert.equal(curriculum.content_draft.paragraphs,162);
assert.equal(curriculum.content_draft.published,false);

assert.equal(ownership.guided_formation.learn_the_faith.registry,"data/learn/learn-the-faith-curriculum.v1.json");
assert.equal(ownership.guided_formation.learn_the_faith.visible,false);
assert.equal(ownership.guided_formation.learn_the_faith.doctrine_reference,"learn.catechism");
assert.equal(ownership.guided_formation.learn_the_faith.daily_review,"learn.catechism.daily");

assert.equal(curriculum.catechism_mapping.status,"PX1912_433_MAPPED");
assert.equal(curriculum.catechism_mapping.directOrPartialLessons,52);
assert.equal(curriculum.catechism_mapping.supplementRequiredLessons,12);
assert.deepEqual(curriculum.catechism_mapping.zeroDirectCatechismRefLessons,["LTF-034","LTF-051"]);
assert.equal(curriculum.lessons.filter(x=>x.catechismRefs.length).length,52);

assert.equal(sources.status,"ACTIVE_SOURCE_REGISTRY");
const sourceIds=new Set(sources.sources.map(x=>x.id));
for(const id of ["PX1912","V1-DEI-FILIUS","TRENT-CATECHISM","TRENT-DECREES","LEO13-PROVIDENTISSIMUS","PIUS12-MYSTICI","AQUINAS-ST"])assert.ok(sourceIds.has(id),id+" missing from Learn the Faith source registry");

assert.equal(batch1.batch,"LTF-001–LTF-018");
assert.equal(batch2.batch,"LTF-019–LTF-036");
assert.equal(batch3.batch,"LTF-037–LTF-054");
const drafted=[...batch1.lessons,...batch2.lessons,...batch3.lessons];
assert.equal(drafted.length,54);
assert.equal(new Set(drafted.map(x=>x.id)).size,54);
assert.equal(drafted.reduce((n,x)=>n+x.paragraphs.length,0),162);
for(const lesson of drafted){
  const canonical=curriculum.lessons.find(x=>x.id===lesson.id);
  assert.ok(canonical,lesson.id+" missing from canonical curriculum");
  assert.deepEqual(lesson.catechismRefs,canonical.catechismRefs,lesson.id+" draft refs diverge from curriculum mapping");
  assert.ok(lesson.paragraphs.every(p=>p.en&&p.fr&&Array.isArray(p.sources)&&p.sources.length),lesson.id+" has unsourced/untranslated paragraph");
  for(const p of lesson.paragraphs)for(const id of p.sources)assert.ok(sourceIds.has(id),lesson.id+" unresolved source "+id);
}

console.log(JSON.stringify({
  families:5,
  lessons:54,
  catechismQuestionRefs:709,
  sourceLinkedClaims:176,
  unresolvedSourceGaps:0,
  published:false,
  existingCatechismUntouched:true,
  px1912MappedLessons:52,
  sourceLinkedDraftLessons:54,
  sourceLinkedDraftParagraphs:162
},null,2));
