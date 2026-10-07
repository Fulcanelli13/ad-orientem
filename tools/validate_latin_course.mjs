import fs from "node:fs";

const readJson = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const course = readJson("data/learn/latin-course-40-core350.v1.json");
const core200 = readJson("data/learn/core-latin-200.v0.2.json");
const core350 = readJson("data/learn/core-latin-201-350.v1.json");

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

console.log(JSON.stringify({
  status:"PASS",
  lessons:course.lessons.length,
  stages:course.stages.length,
  core1_200Placed:courseCore200.length,
  core201_350Placed:courseCore350.length,
  casesVisibleFrom:course.casesFramework.visibleFromLesson,
  pronounCheckpoint:course.pronounSpiral.cumulativeCheckpoint,
  vocabularyNeutralIntegrationLessons:[37,38,39,40]
}, null, 2));
