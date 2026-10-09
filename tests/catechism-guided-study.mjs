import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCatechismGuidedStudy, findGuidedLessonForQuestion, guidedStudyReleaseApproved } from "../src/learn/catechism-guided-study.js";
const load = path => JSON.parse(readFileSync(path, "utf8"));
const crosswalk = load("data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json");
const first = load("data/learn/learn-the-faith-certification-001-018.v1.json");
const second = load("data/learn/learn-the-faith-certification-019-054.v1.json");
const witnesses = load("data/learn/ltfaith-pius-x-en-witness-index.v1.json");
assert.equal(guidedStudyReleaseApproved(crosswalk), false);
const publicStudy = buildCatechismGuidedStudy(crosswalk, first, second, witnesses);
assert.equal(publicStudy.available, false);
assert.equal(publicStudy.lessons.length, 0);
assert.equal(Object.keys(publicStudy.questionToLesson).length, 0);
const preview = buildCatechismGuidedStudy(crosswalk, first, second, witnesses, { preview: true });
assert.equal(preview.available, false);
assert.equal(preview.previewOnly, true);
assert.equal(preview.lessons.length, 55);
assert.equal(preview.lessons.reduce((count, l) => count + l.claims.length, 0), 181);
assert.equal(Object.keys(preview.questionToLesson).length, 433);
assert.equal(preview.lessons[45].title.en, "The Precepts of the Church");
assert.equal(preview.lessons[45].historicalId, null);
assert.equal(preview.lessons[46].historicalId, "LTF-046");
assert.equal(findGuidedLessonForQuestion(preview, 213)?.id, "LTF-046");
assert.equal(findGuidedLessonForQuestion(preview, 0), null);
for (const lesson of preview.lessons) for (const claim of lesson.claims) {
  assert.ok(claim.en && claim.fr);
  assert.ok(claim.sources.length);
  for (const source of claim.sources) assert.match(source.url, /^https:\/\//);
}
assert.throws(() => buildCatechismGuidedStudy(
  { ...crosswalk, lessons: crosswalk.lessons.slice(1) }, first, second, witnesses, { preview: true }
));
console.log(JSON.stringify({ status: "PASS", publicLessons: 0, previewLessons: 55, sourceClaims: 181, mappedQuestions: 433 }));
