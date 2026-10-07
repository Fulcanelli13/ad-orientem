import fs from "node:fs";
import path from "node:path";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const course = readJson("data/learn/latin-course-40-core350.v1.json");
const core200 = readJson("data/learn/core-latin-200.v0.2.json");
const core350 = readJson("data/learn/core-latin-201-350.v1.json");

function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

// Frozen 40-lesson curriculum contract.
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
const lessonByLemma = new Map();
for (const lesson of course.lessons) {
  for (const lemma of lesson.core1_200Introduced) {
    courseCore200.push({ lemma, lesson: lesson.lesson });
    lessonByLemma.set(lemma, lesson.lesson);
  }
  for (const lemma of lesson.core201_350Introduced) {
    courseCore350.push({ lemma, lesson: lesson.lesson });
    lessonByLemma.set(lemma, lesson.lesson);
  }
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

// Authored production lessons: authored strictly in five-lesson stage batches.
const lessonDir = "data/learn/latin-course-lessons";
const authoredFiles = fs.readdirSync(lessonDir)
  .filter(name => /^lesson-\d{2}\.v1\.json$/.test(name))
  .sort();

assert(authoredFiles.length > 0, "at least one authored lesson must exist");
assert(authoredFiles.length % 5 === 0, "authored lessons must land as complete five-lesson stages");

const authored = authoredFiles.map(name => readJson(path.join(lessonDir, name)));
for (let i = 0; i < authored.length; i++) {
  assert(authored[i].lesson === i + 1, `authored lesson sequence must be contiguous from 1; break at ${i + 1}`);
}

const priorIntroduced = new Set();
const allAuthoredIntroduced = [];
const stageSummaries = [];

function expectedActiveCases(lessonNumber) {
  if (lessonNumber < 2) return [];
  if (lessonNumber < 8) return ["nominative","vocative"];
  if (lessonNumber === 8) return ["dative","genitive","nominative","vocative"].sort();
  return ["ablative","accusative","dative","genitive","nominative","vocative"].sort();
}

for (const lesson of authored) {
  const n = lesson.lesson;
  const frozen = course.lessons[n - 1];
  assert(frozen, `authored lesson ${n} has no frozen curriculum row`);
  assert(lesson.stage?.number === frozen.stage.number, `stage drift in Lesson ${n}`);
  assert(lesson.curriculumRef?.version === course.version, `curriculum version drift in Lesson ${n}`);
  assert(lesson.title === frozen.title, `title drift in Lesson ${n}`);
  assert(lesson.grammarFocus === frozen.grammar, `grammar focus drift in Lesson ${n}`);
  assert(lesson.readingOutcome === frozen.readingOutcome, `reading outcome drift in Lesson ${n}`);

  const introduced = lesson.coreVocabulary?.introduced?.map(x => x.lemma) || [];
  const expected = [...frozen.core1_200Introduced, ...frozen.core201_350Introduced];
  assert(
    JSON.stringify([...introduced].sort()) === JSON.stringify([...expected].sort()),
    `introduced vocabulary drift in Lesson ${n}: expected [${expected.join(", ")}], got [${introduced.join(", ")}]`
  );
  assert(new Set(introduced).size === introduced.length, `duplicate introduced lemma in Lesson ${n}`);
  for (const item of lesson.coreVocabulary.introduced) {
    assert(item.frozenLesson === n, `frozenLesson metadata drift for ${item.lemma} in Lesson ${n}`);
  }

  const recycled = lesson.coreVocabulary?.recycled || [];
  assert(new Set(recycled).size === recycled.length, `duplicate recycled lemma in Lesson ${n}`);
  for (const lemma of recycled) {
    assert(priorIntroduced.has(lemma), `Lesson ${n} recycles lemma before it is taught: ${lemma}`);
    assert(!introduced.includes(lemma), `Lesson ${n} both introduces and recycles ${lemma}`);
  }

  const passive = new Map();
  for (const item of lesson.passiveReadingLexicon || []) {
    assert(item.lemma && !passive.has(item.lemma), `duplicate passive lemma in Lesson ${n}: ${item.lemma}`);
    passive.set(item.lemma, item);
    assert(!introduced.includes(item.lemma), `Lesson ${n} silently duplicates introduced lemma in passive lexicon: ${item.lemma}`);
    assert(!recycled.includes(item.lemma), `Lesson ${n} silently duplicates recycled lemma in passive lexicon: ${item.lemma}`);
    if (item.trackedLesson !== null) {
      assert(lessonByLemma.has(item.lemma), `Lesson ${n} passive item claims tracked status but is absent from Core: ${item.lemma}`);
      assert(lessonByLemma.get(item.lemma) === item.trackedLesson,
        `passive tracked-lesson drift for ${item.lemma} in Lesson ${n}: expected ${lessonByLemma.get(item.lemma)}, got ${item.trackedLesson}`);
      assert(item.trackedLesson > n, `Lesson ${n} passive Core item is not future vocabulary: ${item.lemma}`);
    }
  }

  assert(Array.isArray(lesson.validation?.silentIntroductions), `Lesson ${n} must declare silentIntroductions`);
  assert(lesson.validation.silentIntroductions.length === 0, `Lesson ${n} must declare zero silent introductions`);

  const sourceIds = new Set();
  for (const source of lesson.sources || []) {
    assert(source.id && !sourceIds.has(source.id), `duplicate or empty source id in Lesson ${n}: ${source.id}`);
    sourceIds.add(source.id);
    assert(source.sourceLatin && source.sourceLatin.trim(), `source ${source.id} in Lesson ${n} must preserve sourceLatin`);
    assert(source.work && source.section, `source ${source.id} in Lesson ${n} lacks provenance metadata`);
  }
  assert(sourceIds.size >= 3, `Lesson ${n} must carry at least three source records`);

  for (const passage of lesson.authenticPassages || []) {
    assert(sourceIds.has(passage.sourceId), `Lesson ${n} passage ${passage.id} references unknown source ${passage.sourceId}`);
    const source = lesson.sources.find(x => x.id === passage.sourceId);
    assert(passage.sourceLatin === source.sourceLatin, `Lesson ${n} passage ${passage.id} sourceLatin drift`);
    assert(Array.isArray(passage.targetLemmas) && passage.targetLemmas.length > 0, `Lesson ${n} passage ${passage.id} needs target lemmas`);
    for (const lemma of passage.targetLemmas) {
      assert(introduced.includes(lemma) || recycled.includes(lemma),
        `Lesson ${n} passage ${passage.id} silently targets untaught lemma ${lemma}`);
    }
    for (const lemma of passage.supportLemmas || []) {
      assert(passive.has(lemma), `Lesson ${n} passage ${passage.id} support lemma missing passive declaration: ${lemma}`);
    }
  }

  for (const block of lesson.learningBlocks || []) {
    if (block.learnerCopy) {
      assert(typeof block.learnerCopy.en === "string" && block.learnerCopy.en.length > 0,
        `Lesson ${n} block ${block.id} missing English learner copy`);
      assert(typeof block.learnerCopy.fr === "string" && block.learnerCopy.fr.length > 0,
        `Lesson ${n} block ${block.id} missing French learner copy`);
    }
    if (block.sourceId) {
      assert(sourceIds.has(block.sourceId), `Lesson ${n} block ${block.id} references unknown source ${block.sourceId}`);
    }
  }
  assert((lesson.learningBlocks || []).length >= 6, `Lesson ${n} needs at least six learning blocks`);

  const exerciseIds = new Set();
  for (const exercise of lesson.exercises || []) {
    assert(exercise.id && !exerciseIds.has(exercise.id), `duplicate or empty exercise id in Lesson ${n}: ${exercise.id}`);
    exerciseIds.add(exercise.id);
    assert(exercise.exerciseType, `Lesson ${n} exercise ${exercise.id} missing exerciseType`);
    assert(Object.prototype.hasOwnProperty.call(exercise, "expectedAnswer"), `Lesson ${n} exercise ${exercise.id} missing expectedAnswer`);
    assert(Array.isArray(exercise.acceptedVariants), `Lesson ${n} exercise ${exercise.id} acceptedVariants must be an array`);
    assert(typeof exercise.hint === "string" && exercise.hint.length > 0, `Lesson ${n} exercise ${exercise.id} missing hint`);
    assert(typeof exercise.explanation === "string" && exercise.explanation.length > 0, `Lesson ${n} exercise ${exercise.id} missing explanation`);
    assert(Number.isInteger(exercise.difficulty) && exercise.difficulty >= 1 && exercise.difficulty <= 5,
      `Lesson ${n} exercise ${exercise.id} difficulty must be 1-5`);
    if (exercise.sourceId !== null) {
      assert(sourceIds.has(exercise.sourceId), `Lesson ${n} exercise ${exercise.id} references unknown source ${exercise.sourceId}`);
    }
    if (exercise.exerciseType === "multiple_choice") {
      assert(Array.isArray(exercise.options) && exercise.options.length >= 2,
        `Lesson ${n} multiple-choice exercise ${exercise.id} needs options`);
      assert(exercise.options.includes(exercise.expectedAnswer),
        `Lesson ${n} multiple-choice answer is absent from options in ${exercise.id}`);
    }
  }
  const minExercises = n % 5 === 0 ? 12 : 10;
  assert((lesson.exercises || []).length >= minExercises,
    `Lesson ${n} needs at least ${minExercises} exercises`);

  if (n >= 2) {
    assert(lesson.casePanel?.visible === true, `Lesson ${n} must retain the visible case panel`);
    assert(lesson.casePanel.cases?.length === 6, `Lesson ${n} case panel must contain all six cases`);
    const actualActive = lesson.casePanel.cases.filter(x => x.status === "active").map(x => x.case).sort();
    const expectedActive = expectedActiveCases(n);
    assert(JSON.stringify(actualActive) === JSON.stringify(expectedActive),
      `Lesson ${n} active-case drift: expected [${expectedActive.join(", ")}], got [${actualActive.join(", ")}]`);
  }

  if (lesson.checkpoint?.passingRule?.autoGradedExerciseIds) {
    for (const id of lesson.checkpoint.passingRule.autoGradedExerciseIds) {
      assert(exerciseIds.has(id), `Lesson ${n} checkpoint references unknown exercise ${id}`);
    }
  }
  if (lesson.checkpoint?.passingRule?.selfCheckRequired) {
    for (const id of lesson.checkpoint.passingRule.selfCheckRequired) {
      assert(exerciseIds.has(id), `Lesson ${n} checkpoint references unknown self-check exercise ${id}`);
    }
  }

  introduced.forEach(lemma => {
    priorIntroduced.add(lemma);
    allAuthoredIntroduced.push({ lemma, lesson: n });
  });
}

// Every complete five-lesson batch must end in a stage checkpoint.
for (let end = 5; end <= authored.length; end += 5) {
  const stageNumber = end / 5;
  const stageLessons = authored.slice(end - 5, end);
  const checkpointLesson = stageLessons[4];
  assert(checkpointLesson.checkpoint?.stage === stageNumber,
    `Lesson ${end} must be the Stage ${stageNumber} checkpoint`);
  assert(
    JSON.stringify(checkpointLesson.checkpoint.scopeLessons) === JSON.stringify([end - 4, end - 3, end - 2, end - 1, end]),
    `Stage ${stageNumber} checkpoint scope must cover its five lessons`
  );
  stageSummaries.push({
    stage: stageNumber,
    lessons: [end - 4, end],
    introduced: stageLessons.reduce((sum, x) => sum + x.coreVocabulary.introduced.length, 0),
    exercises: stageLessons.reduce((sum, x) => sum + x.exercises.length, 0)
  });
}

// Stage 1 pedagogical lock.
if (authored.length >= 5) {
  assert(authored[0].progressionStep === "phrase", "Lesson 1 must begin at phrase level");
  for (const n of [2,3,4]) assert(authored[n - 1].progressionStep === "phrase", `Lesson ${n} must remain phrase-level`);
  assert(authored[4].progressionStep === "sentence", "Lesson 5 must transition to sentence level");
  assert(authored[4].checkpoint.progressionGate === "phrase → sentence", "Lesson 5 must lock the phrase → sentence gate");
  const stage1Introduced = authored.slice(0,5).flatMap(x => x.coreVocabulary.introduced.map(v => v.lemma));
  assert(stage1Introduced.length === 66, `Stage 1 must introduce 66 tracked lemmas, got ${stage1Introduced.length}`);
  assert(new Set(stage1Introduced).size === 66, "Stage 1 contains duplicate introduced lemmas");
}


// Stage 2/3 authored progression locks.
if (authored.length >= 10) {
  assert(authored[9].pronounParadigms, "Lesson 10 must establish the personal/reflexive pronoun paradigms");
  assert(authored[9].cumPronounRule?.forms?.includes("vobiscum"), "Lesson 10 must teach attached cum-pronoun forms");
}
if (authored.length >= 12) {
  assert(authored[11].pronounSpiral?.lesson === 12, "Lesson 12 must continue the pronoun spiral");
}
if (authored.length >= 15) {
  const frozenL15Milestone = course.milestones?.find(x => x.lesson === 15)?.target;
  assert(authored[14].pronounSpiral?.lesson === 15, "Lesson 15 must continue the pronoun spiral");
  assert(authored[14].checkpoint?.progressionGate === frozenL15Milestone,
    `Lesson 15 progression gate must match frozen milestone: ${frozenL15Milestone}`);
  assert(authored[14].checkpoint?.stage === 3, "Lesson 15 must be the Stage 3 checkpoint");
  assert(JSON.stringify(authored[14].checkpoint?.scopeLessons) === JSON.stringify([11,12,13,14,15]),
    "Stage 3 checkpoint must cover Lessons 11-15");
}


// Stage 4 structure and pronoun checkpoint locks.
if (authored.length >= 16) {
  assert(authored[15].perfectPassiveFramework, "Lesson 16 must establish perfect passive + participial agreement");
  assert(authored[15].progressionStep === "sentence", "Lesson 16 must remain sentence-level");
}
if (authored.length >= 17) {
  assert(authored[16].relativePronounFramework, "Lesson 17 must establish relative-pronoun parsing");
  assert(authored[16].pronounSpiral?.lesson === 17, "Lesson 17 must continue the pronoun spiral");
  assert(authored[16].progressionStep === "sentence", "Lesson 17 must remain sentence-level");
}
if (authored.length >= 18) {
  assert(authored[17].demonstrativeFramework, "Lesson 18 must establish demonstrative/intensive pronouns");
  assert(authored[17].pronounSpiral?.lesson === 18, "Lesson 18 must continue the pronoun spiral");
  assert(authored[17].progressionStep === "sentence", "Lesson 18 must remain sentence-level");
}
if (authored.length >= 19) {
  assert(authored[18].deponentFramework, "Lesson 19 must establish deponent reading");
  assert(authored[18].pronounSpiral?.lesson === 19, "Lesson 19 must continue the pronoun spiral");
  assert(authored[18].progressionStep === "sentence", "Lesson 19 must remain sentence-level");
}
if (authored.length >= 20) {
  const frozenL20Milestone = course.milestones?.find(x => x.lesson === 20)?.target;
  assert(authored[19].integratedReadingFramework, "Lesson 20 must contain integrated passage-reading architecture");
  assert(authored[19].pronounSpiral?.lesson === 20, "Lesson 20 must complete the compulsory pronoun checkpoint");
  assert(authored[19].progressionStep === "passage", "Lesson 20 must transition to passage-level reading");
  assert(authored[19].checkpoint?.readingTransition === "sentence → passage",
    "Lesson 20 must lock the sentence → passage transition");
  assert(authored[19].checkpoint?.progressionGate === frozenL20Milestone,
    `Lesson 20 progression gate must match frozen milestone: ${frozenL20Milestone}`);
  assert(authored[19].checkpoint?.stage === 4, "Lesson 20 must be the Stage 4 checkpoint");
  assert(JSON.stringify(authored[19].checkpoint?.scopeLessons) === JSON.stringify([16,17,18,19,20]),
    "Stage 4 checkpoint must cover Lessons 16-20");
  for (const family of ["personal","reflexive","is/ea/id","relative","demonstrative","intensive/identity retrieval"]) {
    assert(authored[19].checkpoint?.compulsoryPronounFamilies?.includes(family),
      `Lesson 20 compulsory pronoun checkpoint missing family: ${family}`);
  }
  const stage4Introduced = authored.slice(15,20).flatMap(x => x.coreVocabulary.introduced.map(v => v.lemma));
  assert(stage4Introduced.length === 47, `Stage 4 must introduce 47 tracked lemmas, got ${stage4Introduced.length}`);
  assert(new Set(stage4Introduced).size === 47, "Stage 4 contains duplicate introduced lemmas");
}


// Stage 5 prayer-language and multi-clause syntax locks.
if (authored.length >= 21) {
  assert(authored[20].subjunctiveFramework, "Lesson 21 must establish present-subjunctive prayer reading");
  assert(authored[20].progressionStep === "passage", "Lesson 21 must remain passage-level");
}
if (authored.length >= 22) {
  assert(authored[21].jussiveOptativeFramework, "Lesson 22 must distinguish jussive/optative uses");
  assert(authored[21].progressionStep === "passage", "Lesson 22 must remain passage-level");
}
if (authored.length >= 23) {
  assert(authored[22].purposeFramework, "Lesson 23 must establish purpose-clause reading");
  assert(authored[22].progressionStep === "passage", "Lesson 23 must remain passage-level");
}
if (authored.length >= 24) {
  assert(authored[23].purposeResultFramework, "Lesson 24 must distinguish result from purpose");
  assert(authored[23].progressionStep === "passage", "Lesson 24 must remain passage-level");
}
if (authored.length >= 25) {
  const frozenL25Milestone = course.milestones?.find(x => x.lesson === 25)?.target;
  assert(authored[24].cumClauseFramework, "Lesson 25 must establish circumstantial/temporal cum-clause reading");
  assert(authored[24].progressionStep === "passage", "Lesson 25 must remain passage-level");
  assert(authored[24].checkpoint?.progressionGate === frozenL25Milestone,
    `Lesson 25 progression gate must match frozen milestone: ${frozenL25Milestone}`);
  assert(authored[24].checkpoint?.stage === 5, "Lesson 25 must be the Stage 5 checkpoint");
  assert(JSON.stringify(authored[24].checkpoint?.scopeLessons) === JSON.stringify([21,22,23,24,25]),
    "Stage 5 checkpoint must cover Lessons 21-25");
  assert(authored[24].checkpoint?.readingTransition === "passage → multi-clause passage",
    "Lesson 25 must lock the multi-clause passage transition");
  const stage5Introduced = authored.slice(20,25).flatMap(x => x.coreVocabulary.introduced.map(v => v.lemma));
  assert(stage5Introduced.length === 41, `Stage 5 must introduce 41 tracked lemmas, got ${stage5Introduced.length}`);
  assert(new Set(stage5Introduced).size === 41, "Stage 5 contains duplicate introduced lemmas");
}


// Stage 6 Canon and complete-Collect locks.
if (authored.length >= 26) {
  assert(authored[25].infinitiveFramework, "Lesson 26 must establish infinitive/indirect-statement reading");
  assert(authored[25].progressionStep === "passage", "Lesson 26 must remain passage-level");
}
if (authored.length >= 27) {
  assert(authored[26].gerundFramework, "Lesson 27 must establish gerund/gerundive reading");
  assert(authored[26].progressionStep === "passage", "Lesson 27 must remain passage-level");
}
if (authored.length >= 28) {
  assert(authored[27].ablativeAbsoluteFramework, "Lesson 28 must establish ablative-absolute reading");
  assert(authored[27].progressionStep === "passage", "Lesson 28 must remain passage-level");
}
if (authored.length >= 29) {
  assert(authored[28].advancedCaseFramework, "Lesson 29 must consolidate advanced dative/ablative functions");
  assert(authored[28].progressionStep === "passage", "Lesson 29 must remain passage-level");
}
if (authored.length >= 30) {
  const frozenL30Milestone = course.milestones?.find(x => x.lesson === 30)?.target;
  assert(authored[29].collectFramework, "Lesson 30 must contain complete-Collect architecture");
  assert(authored[29].progressionStep === "passage", "Lesson 30 must remain passage-level");
  assert(authored[29].checkpoint?.progressionGate === frozenL30Milestone,
    `Lesson 30 progression gate must match frozen milestone: ${frozenL30Milestone}`);
  assert(authored[29].checkpoint?.stage === 6, "Lesson 30 must be the Stage 6 checkpoint");
  assert(JSON.stringify(authored[29].checkpoint?.scopeLessons) === JSON.stringify([26,27,28,29,30]),
    "Stage 6 checkpoint must cover Lessons 26-30");
  assert(authored[29].checkpoint?.readingTransition === "multi-clause passage → complete Roman Collect",
    "Lesson 30 must lock the complete-Roman-Collect transition");
  const stage6Introduced = authored.slice(25,30).flatMap(x => x.coreVocabulary.introduced.map(v => v.lemma));
  assert(stage6Introduced.length === 31, `Stage 6 must introduce 31 tracked lemmas, got ${stage6Introduced.length}`);
  assert(new Set(stage6Introduced).size === 31, "Stage 6 contains duplicate introduced lemmas");
}

console.log(JSON.stringify({
  status: "PASS",
  lessons: course.lessons.length,
  stages: course.stages.length,
  core1_200Placed: courseCore200.length,
  core201_350Placed: courseCore350.length,
  casesVisibleFrom: course.casesFramework.visibleFromLesson,
  pronounCheckpoint: course.pronounSpiral.cumulativeCheckpoint,
  vocabularyNeutralIntegrationLessons: [37,38,39,40],
  authoredLessonsValidated: authored.map(x => x.lesson),
  authoredStagesValidated: stageSummaries
}, null, 2));
