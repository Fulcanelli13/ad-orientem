import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildCatechismGuidedStudy, findGuidedLessonForQuestion, guidedStudyReleaseApproved } from "../src/learn/catechism-guided-study.js";
import { openNativeCatechismQuestion } from "../src/learn/catechism-guided-reader.js";
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
// Native Q&A handoff is real, not an external source chapter redirect.
const opened = [];
const api = { openQuestion: n => { opened.push(n); return true; } };
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: api }, 213, "en"), true);
assert.deepEqual(opened, [213]);
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: api }, 0), false);
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: api }, 434), false);
let loaded = false;
const retryApi = { openQuestion: n => loaded && n === 433, async load(lang) { assert.equal(lang, "fr"); loaded = true; } };
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: retryApi }, 433, "fr"), true);
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: { openQuestion: () => false } }, 1), false);
assert.equal(await openNativeCatechismQuestion({}, 1), false);
let asyncOpens = 0;
let unnecessaryLoads = 0;
const asyncApi = {
  async openQuestion(n) { asyncOpens += 1; return n === 212; },
  async load() { unnecessaryLoads += 1; }
};
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: asyncApi }, 212), true);
assert.equal(asyncOpens, 1, "A successful async native open must be invoked exactly once");
assert.equal(unnecessaryLoads, 0, "A successful async native open must not reload the Catechism");
let deferredReady = false;
const asyncRetry = {
  async openQuestion(n) { return deferredReady && n === 211; },
  async load(lang) { assert.equal(lang, "fr"); deferredReady = true; }
};
assert.equal(await openNativeCatechismQuestion({ AO_TRADITIONAL_CATECHISM: asyncRetry }, 211, "fr"), true);

console.log(JSON.stringify({ status: "PASS", publicLessons: 0, previewLessons: 55, sourceClaims: 181, mappedQuestions: 433 }));
