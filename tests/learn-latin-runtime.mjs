import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  LATIN_COURSE_ROUTE_ID,
  canonicalChoiceValue,
  gradeLatinExercise,
  localizeLatinExercise,
  localizeLatinLesson,
} from "../src/learn/latin-course.js";

assert.equal(LATIN_COURSE_ROUTE_ID,"learn.latin");

const lesson=n=>JSON.parse(readFileSync(`data/learn/latin-course-lessons/lesson-${String(n).padStart(2,"0")}.v1.json`,"utf8"));

let lessons=0,blocks=0,exercises=0;
for(let n=1;n<=40;n++){
  const j=lesson(n);lessons++;
  const fr=localizeLatinLesson(j,"fr");
  assert.ok(fr.title.trim(),`Lesson ${n} missing localized title`);
  assert.ok(fr.grammarFocus.trim(),`Lesson ${n} missing localized grammar focus`);
  assert.ok(fr.readingOutcome.trim(),`Lesson ${n} missing localized reading outcome`);
  assert.equal(fr.objectives.length,j.objectives.length,`Lesson ${n} objective cardinality drift`);
  for(const b of j.learningBlocks||[]){
    blocks++;
    assert.ok(b.localization?.fr?.title?.trim(),`${b.id} missing French block title`);
    assert.ok(b.learnerCopy?.fr?.trim(),`${b.id} missing French learner copy`);
  }
  for(const e of j.exercises||[]){
    exercises++;
    const loc=localizeLatinExercise(e,"fr");
    assert.ok(loc.prompt.trim(),`${e.id} missing French prompt`);
    assert.ok(loc.hint.trim(),`${e.id} missing French hint`);
    assert.ok(loc.explanation.trim(),`${e.id} missing French explanation`);
    assert.equal(Object.hasOwn(e.localization?.fr||{},"expectedAnswer"),false,`${e.id} localized grading override leaked`);
    assert.equal(Object.hasOwn(e.localization?.fr||{},"acceptedVariants"),false,`${e.id} localized acceptedVariants leaked`);
    if(Array.isArray(e.options)){
      assert.equal(loc.options.length,e.options.length,`${e.id} localized option cardinality drift`);
      e.options.forEach((value,i)=>assert.equal(canonicalChoiceValue(e,i),value,`${e.id} canonical option mapping drift at index ${i}`));
    }
    if(e.exerciseType==="matching"){
      assert.deepEqual(Object.keys(loc.matches).sort(),Object.keys(e.expectedAnswer).sort(),`${e.id} localized matching key drift`);
    }
    if(e.exerciseType==="passage_analysis"){
      assert.ok(Array.isArray(loc.answerGuide)&&loc.answerGuide.length>0,`${e.id} missing localized answer guide`);
    }
    if(e.exerciseType==="read_aloud_model"){
      assert.ok(loc.modelGuide,`${e.id} missing localized model guide`);
      assert.equal(loc.requiredChecks.length,e.expectedAnswer.requiredChecks.length,`${e.id} localized read-aloud checklist drift`);
    }
  }
}
assert.equal(lessons,40);
assert.equal(blocks,245);
assert.equal(exercises,431);

// Localized labels are presentation only: the canonical option remains grading truth.
{
  const e=lesson(1).exercises.find(x=>x.id==="l1-e1");
  const fr=localizeLatinExercise(e,"fr");
  assert.equal(fr.options[0],"et");
  assert.equal(canonicalChoiceValue(e,0),"and");
  assert.equal(gradeLatinExercise(e,canonicalChoiceValue(e,0)).correct,true);
  assert.equal(gradeLatinExercise(e,fr.options[0]).correct,false,"French display label became a grading value");
}

// Canonical response survives a language switch unchanged.
{
  const e=lesson(37).exercises.find(x=>x.id==="l37-e9");
  const canonical=canonicalChoiceValue(e,0);
  assert.equal(canonical,"no");
  assert.equal(localizeLatinExercise(e,"en").options[0],"no");
  assert.equal(localizeLatinExercise(e,"fr").options[0],"non");
  assert.equal(gradeLatinExercise(e,canonical).correct,true);
}

// Matching translates learner-facing labels while grading stays canonical.
{
  const e=lesson(15).exercises.find(x=>x.id==="l15-e10");
  const fr=localizeLatinExercise(e,"fr");
  assert.equal(fr.matchKeys.imperfect,"imparfait");
  assert.equal(fr.matches.imperfect,"passé en cours / arrière-plan");
  assert.equal(gradeLatinExercise(e,{...e.expectedAnswer}).correct,true);
  assert.equal(gradeLatinExercise(e,{imperfect:"passé en cours / arrière-plan",future:"non encore accompli / à venir",perfect:"événement achevé"}).correct,false,
    "localized matching values became canonical grading values");
}

// Open-ended/self-check guidance is localized without altering canonical answers.
{
  const readAloud=lesson(1).exercises.find(x=>x.id==="l1-e9");
  const fr=localizeLatinExercise(readAloud,"fr");
  assert.match(fr.requiredChecks[0],/final|prononc/i);
  assert.equal(gradeLatinExercise(readAloud,null).selfCheck,true);

  const passage=lesson(40).exercises.find(x=>x.id==="l40-e12");
  const passageFr=localizeLatinExercise(passage,"fr");
  assert.equal(passageFr.answerGuide[0],"lecture à froid");
  assert.equal(gradeLatinExercise(passage,"anything").selfCheck,true);
}

// Registry/owner wiring must be present in source.
const owner=readFileSync("src/learn/browser-entry.js","utf8");
const presentation=readFileSync("src/learn/presentation.js","utf8");
assert.match(owner,/installLatinCourseModule/);
assert.match(owner,/ensureLatinCourseRegistry/);
assert.match(owner,/AO_LATIN_COURSE_V1/);
assert.match(presentation,/id:"learn\.latin"/);

console.log("PASS Latin course runtime localization: 40 lessons / 245 blocks / 431 exercises, canonical grading isolated from EN↔FR presentation.");
