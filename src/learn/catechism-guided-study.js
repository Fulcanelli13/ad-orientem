// Non-public data adapter for the St Pius X Catechism's proposed guided-study view.
// Intentionally independent of the production router: approval is a hard prerequisite.
const lessonId = n => "LTF-" + String(n).padStart(3, "0");
const sourceQuestion = n => "PX1912-Q" + String(n).padStart(3, "0");
const releaseKeys = [
  "fullOriginalPassageHumanVerification",
  "editorialApproval",
  "canonicalReview",
  "frenchOriginalCollation",
  "nativeFrenchEdit"
];

export function guidedStudyReleaseApproved(crosswalk) {
  const gate = crosswalk?.publicationGate;
  return Boolean(gate && releaseKeys.every(key => gate[key] === true)
    && gate.publicRouteAdded === true
    && crosswalk.lessons?.length === 55
    && crosswalk.lessons.every(x => x.publicationApproved === true
      && x.humanSourceApproval === true && x.nativeFrenchApproval === true));
}

export function buildCatechismGuidedStudy(crosswalk, first, second, { preview = false } = {}) {
  if (!crosswalk || !first || !second) throw new TypeError("All three course files are required");
  if (!preview && !guidedStudyReleaseApproved(crosswalk))
    return Object.freeze({ available: false, lessons: Object.freeze([]), questionToLesson: Object.freeze({}) });
  if (crosswalk.lessons.length !== 55 || first.lessons.length !== 18 || second.lessons.length !== 36)
    throw new Error("Unexpected guided-study curriculum dimensions");
  const overlays = new Map([...first.lessons, ...second.lessons].map(x => [x.id, x]));
  if (overlays.size !== 54) throw new Error("Duplicate or missing historical claim overlays");
  const seen = new Set();
  const questionToLesson = Object.create(null);
  const lessons = crosswalk.lessons.map((entry, i) => {
    if (entry.displayLessonId !== lessonId(i + 1)) throw new Error("Display order is not stable");
    const original = entry.historicalOriginalLessonId;
    const overlay = original ? overlays.get(original) : null;
    if (original && !overlay) throw new Error("Missing historical claims: " + original);
    if (!original && i !== 45) throw new Error("Unexpected nonhistorical lesson");
    const claims = original ? overlay.claims : entry.teachingClaims;
    if (!Array.isArray(claims) || claims.length === 0)
      throw new Error("Missing bilingual claims at " + entry.displayLessonId);
    const normalizedClaims = claims.map((c, j) => {
      if (!c.en || !c.fr) throw new Error("Missing translation at " + entry.displayLessonId);
      const sources = original
        ? c.sources.flatMap(s => (s.locators?.length
          ? s.locators.map(l => ({ ref: l.ref, url: l.url }))
          : s.refs.map(ref => {
              const n = Number(ref.replace(/\\D/g, ""));
              const witness = entry.sourceWitnesses.find(w => Number(w.ref.slice(-3)) === n);
              return { ref: sourceQuestion(n), url: witness?.sourceUrl ?? null };
            })))
        : c.sourceQuestionNumbers.map(n => {
            const witness = entry.sourceWitnesses.find(w => Number(w.ref.slice(-3)) === n);
            return { ref: sourceQuestion(n), url: witness?.sourceUrl ?? null };
          });
      if (!sources.length || sources.some(s => !s.url))
        throw new Error("Unresolved source link at " + entry.displayLessonId + " claim " + (j + 1));
      return Object.freeze({ en: c.en, fr: c.fr, sources: Object.freeze(sources.map(Object.freeze)) });
    });
    const primaryQuestions = entry.primaryCatechismQuestionNumbers;
    for (const n of primaryQuestions) {
      if (!Number.isInteger(n) || n < 1 || n > 433 || seen.has(n))
        throw new Error("Invalid or multiply assigned question " + n);
      seen.add(n);
      questionToLesson[sourceQuestion(n)] = entry.displayLessonId;
    }
    return Object.freeze({
      id: entry.displayLessonId,
      historicalId: original,
      title: Object.freeze({ ...entry.title }),
      family: entry.family,
      primaryQuestions: Object.freeze([...primaryQuestions]),
      claims: Object.freeze(normalizedClaims),
      approved: entry.publicationApproved === true && entry.humanSourceApproval === true && entry.nativeFrenchApproval === true
    });
  });
  if (seen.size !== 433) throw new Error("Not all Catechism questions have a primary lesson");
  if (lessons[45].historicalId !== null || lessons[46].historicalId !== "LTF-046")
    throw new Error("Precepts insertion damaged archival identity");
  return Object.freeze({
    available: guidedStudyReleaseApproved(crosswalk),
    previewOnly: !guidedStudyReleaseApproved(crosswalk),
    lessons: Object.freeze(lessons),
    questionToLesson: Object.freeze(questionToLesson)
  });
}

export function findGuidedLessonForQuestion(study, questionNumber) {
  if (!Number.isInteger(questionNumber) || questionNumber < 1 || questionNumber > 433) return null;
  const id = study?.questionToLesson?.[sourceQuestion(questionNumber)];
  return study?.lessons?.find(lesson => lesson.id === id) || null;
}
