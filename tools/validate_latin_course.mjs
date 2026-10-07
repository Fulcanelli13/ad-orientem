import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const course = readJson("data/learn/latin-course-40-core350.v1.json");
const core200 = readJson("data/learn/core-latin-200.v0.2.json");
const core350 = readJson("data/learn/core-latin-201-350.v1.json");
const lesson1 = readJson("data/learn/latin-course-lessons/lesson-01.v1.json");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

assert(course.lessons.length === 40, "course must contain 40 lessons");
assert(course.stages.length === 8, "course must contain 8 stages");
for (let i = 0; i < 40; i++) {
  assert(course.lessons[i].lesson === i + 1, `lesson sequence breaks at ${i + 1}`);
}
for (const stage of course.stages) {
  assert(stage.lessons[1] - stage.lessons[0] === 4, `stage ${stage.stage} must span five lessons`);
}

assert(course.casesFramework.visibleFromLesson === 2, "case framework must be visible from Lesson 2");
assert(new Set(course.casesFramework.cases).size === 6, "case framework must expose six cases");
for (const required of ["nominative","vocative","accusative","genitive","dative","ablative"]) {
  assert(course.casesFramework.cases.includes(required), `missing case: ${required}`);
}
assert(course.pronounSpiral.startsAt === 10, "pronoun spiral must start at Lesson 10");
assert(course.pronounSpiral.cumulativeCheckpoint === 20, "pronoun cumulative checkpoint must be Lesson 20");
for (const n of [10,12,15,17,18,19,20]) {
  assert(course.pronounSpiral.sequence.some(x => x.lesson === n), `pronoun spiral missing Lesson ${n}`);
}

const courseCore200 = [];
const courseCore350 = [];
for (const lesson of course.lessons) {
  for (const lemma of lesson.core1_200Introduced) courseCore200.push({lemma, lesson:lesson.lesson});
  for (const lemma of lesson.core201_350Introduced) courseCore350.push({lemma, lesson:lesson.lesson});
}

assert(courseCore200.length === core200.count, `Core 1-200 count mismatch: ${courseCore200.length}`);
const core200Pairs = new Map(core200.items.map(x => [x.lemma, x.lesson]));
assert(new Set(courseCore200.map(x => x.lemma)).size === core200.count, "Core 1-200 duplicates in course");
for (const row of courseCore200) {
  assert(core200Pairs.has(row.lemma), `unknown Core 1-200 lemma: ${row.lemma}`);
  assert(core200Pairs.get(row.lemma) === row.lesson, `Core 1-200 lesson drift for ${row.lemma}`);
}

assert(courseCore350.length === 150, `Core 201-350 must place exactly 150 lemmas, got ${courseCore350.length}`);
assert(new Set(courseCore350.map(x => x.lemma)).size === 150, "Core 201-350 duplicates in course");
const frozen350 = new Set(core350.items.map(x => x.lemma));
for (const row of courseCore350) {
  assert(frozen350.has(row.lemma), `unknown Core 201-350 lemma: ${row.lemma}`);
}
for (const lemma of frozen350) {
  assert(courseCore350.some(x => x.lemma === lemma), `unplaced Core 201-350 lemma: ${lemma}`);
}

for (const n of [37,38,39,40]) {
  const lesson = course.lessons.find(x => x.lesson === n);
  assert(lesson.core201_350Introduced.length === 0, `integration Lesson ${n} must introduce no new Core 201-350 vocabulary`);
}
assert(course.lessons.find(x => x.lesson === 40).totalTrackedIntroduced === 0, "capstone must introduce no new tracked vocabulary");

// Authored Lesson 1 contract.
assert(lesson1.lesson === 1, "authored Lesson 1 must declare lesson=1");
assert(lesson1.stage?.number === 1, "authored Lesson 1 must belong to Stage 1");
assert(lesson1.curriculumRef?.version === course.version, "authored Lesson 1 curriculum version must match frozen crosswalk");
assert(lesson1.progressionStep === "phrase", "Lesson 1 must remain at phrase stage");

const frozenLesson1 = course.lessons.find(x => x.lesson === 1);
const frozenLesson1Introduced = [...frozenLesson1.core1_200Introduced, ...frozenLesson1.core201_350Introduced].sort();
const authoredIntroduced = lesson1.coreVocabulary.introduced.map(x => x.lemma).sort();
assert(JSON.stringify(authoredIntroduced) === JSON.stringify(frozenLesson1Introduced),
  `Lesson 1 introduced vocabulary drift: expected ${frozenLesson1Introduced.join(", ")}, got ${authoredIntroduced.join(", ")}`);
assert(new Set(authoredIntroduced).size === authoredIntroduced.length, "Lesson 1 introduced vocabulary contains duplicates");
assert(authoredIntroduced.length === 1 && authoredIntroduced[0] === "et", "Lesson 1 must introduce only et");

const frozenLessonsByLemma = new Map([
  ...core200.items.map(x => [x.lemma, x.lesson]),
  ...core350.items.map(x => [x.lemma, x.lesson])
]);
const passiveByLemma = new Map();
for (const item of lesson1.passiveReadingLexicon) {
  assert(!passiveByLemma.has(item.lemma), `duplicate passive lexicon lemma: ${item.lemma}`);
  passiveByLemma.set(item.lemma, item);
  assert(!authoredIntroduced.includes(item.lemma), `introduced lemma leaked into passive lexicon: ${item.lemma}`);
  if (item.trackedLesson !== null) {
    assert(frozenLessonsByLemma.has(item.lemma), `passive item claims tracked lesson but is absent from Core: ${item.lemma}`);
    assert(frozenLessonsByLemma.get(item.lemma) === item.trackedLesson,
      `passive tracked-lesson drift for ${item.lemma}: expected ${frozenLessonsByLemma.get(item.lemma)}, got ${item.trackedLesson}`);
    assert(item.trackedLesson > 1, `Lesson 1 passive Core item must remain scheduled later: ${item.lemma}`);
  }
}
assert(Array.isArray(lesson1.validation?.silentIntroductions) && lesson1.validation.silentIntroductions.length === 0,
  "Lesson 1 must declare zero silent introductions");

const sourceIds = new Set();
for (const source of lesson1.sources) {
  assert(source.id && !sourceIds.has(source.id), `duplicate or empty source id: ${source.id}`);
  sourceIds.add(source.id);
  assert(source.sourceLatin && source.sourceLatin.trim(), `source ${source.id} must preserve sourceLatin`);
}
assert(sourceIds.size >= 3, "Lesson 1 must carry at least three authentic source records");

for (const passage of lesson1.authenticPassages) {
  assert(sourceIds.has(passage.sourceId), `passage ${passage.id} references unknown source ${passage.sourceId}`);
  assert(Array.isArray(passage.targetLemmas) && passage.targetLemmas.length > 0, `passage ${passage.id} must declare target lemmas`);
  for (const lemma of passage.targetLemmas) {
    assert(authoredIntroduced.includes(lemma) || lesson1.coreVocabulary.recycled.includes(lemma),
      `passage ${passage.id} silently targets untaught lemma ${lemma}`);
  }
  for (const lemma of passage.supportLemmas) {
    assert(passiveByLemma.has(lemma), `passage ${passage.id} support lemma missing passive lexicon entry: ${lemma}`);
  }
  assert(passage.sourceLatin === lesson1.sources.find(x => x.id === passage.sourceId).sourceLatin,
    `passage ${passage.id} sourceLatin drift from source registry`);
}

const exerciseIds = new Set();
for (const exercise of lesson1.exercises) {
  assert(exercise.id && !exerciseIds.has(exercise.id), `duplicate or empty exercise id: ${exercise.id}`);
  exerciseIds.add(exercise.id);
  assert(exercise.exerciseType, `exercise ${exercise.id} missing exerciseType`);
  assert(Object.prototype.hasOwnProperty.call(exercise, "expectedAnswer"), `exercise ${exercise.id} missing expectedAnswer`);
  assert(Array.isArray(exercise.acceptedVariants), `exercise ${exercise.id} acceptedVariants must be an array`);
  assert(typeof exercise.hint === "string" && exercise.hint.length > 0, `exercise ${exercise.id} missing hint`);
  assert(typeof exercise.explanation === "string" && exercise.explanation.length > 0, `exercise ${exercise.id} missing explanation`);
  assert(Number.isInteger(exercise.difficulty) && exercise.difficulty >= 1 && exercise.difficulty <= 5,
    `exercise ${exercise.id} difficulty must be 1-5`);
  if (exercise.sourceId !== null) {
    assert(sourceIds.has(exercise.sourceId), `exercise ${exercise.id} references unknown source ${exercise.sourceId}`);
  }
}
assert(lesson1.exercises.length >= 10, "Lesson 1 production packet must contain at least ten exercises");

const sourceText = lesson1.authenticPassages.map(x => x.sourceLatin).join(" ");
const etMatches = sourceText.match(/\bet\b/gi) || [];
assert(etMatches.length >= 4, `Lesson 1 should expose et repeatedly in authentic text; found ${etMatches.length}`);

const checkpointAuto = lesson1.checkpoint?.passingRule?.autoGradedExerciseIds || [];
for (const id of checkpointAuto) assert(exerciseIds.has(id), `checkpoint references unknown auto-graded exercise ${id}`);
for (const id of lesson1.checkpoint?.passingRule?.selfCheckRequired || []) {
  assert(exerciseIds.has(id), `checkpoint references unknown self-check exercise ${id}`);
}

console.log(JSON.stringify({
  status:"PASS",
  lessons:course.lessons.length,
  stages:course.stages.length,
  core1_200Placed:courseCore200.length,
  core201_350Placed:courseCore350.length,
  casesVisibleFrom:course.casesFramework.visibleFromLesson,
  pronounCheckpoint:course.pronounSpiral.cumulativeCheckpoint,
  vocabularyNeutralIntegrationLessons:[37,38,39,40],
  authoredLessonsValidated:[1],
  lesson1Introduced:authoredIntroduced,
  lesson1PassiveSupport:lesson1.passiveReadingLexicon.length,
  lesson1AuthenticSources:sourceIds.size,
  lesson1Exercises:lesson1.exercises.length,
  lesson1EtOccurrencesInAuthenticText:etMatches.length
}, null, 2));
