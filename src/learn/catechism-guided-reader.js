import { buildCatechismGuidedStudy, findGuidedLessonForQuestion } from "./catechism-guided-study.js";

// Embeddable reader for the existing Catechism surface. Never mounts itself or adds a public route.
// Production callers must supply the certified crosswalk and overlays and must not set preview.
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const language = value => value === "fr" ? "fr" : "en";
const text = (en, fr, lang) => lang === "fr" ? fr : en;
const questionRef = n => "PX1912-Q" + String(n).padStart(3, "0");

export function renderCatechismGuidedStudy(root, inputs, options = {}) {
  if (!root || typeof root.replaceChildren !== "function")
    throw new TypeError("Guided study requires a DOM root");
  const lang = language(options.language);
  const study = buildCatechismGuidedStudy(
    inputs.crosswalk, inputs.first, inputs.second, inputs.witnessIndex,
    { preview: options.preview === true }
  );
  if (!study.available && options.preview !== true) {
    root.replaceChildren();
    return { rendered: false, reason: "NOT_CERTIFIED", destroy() {} };
  }
  const doc = root.ownerDocument;
  const onQuestion = typeof options.onQuestion === "function" ? options.onQuestion : () => {};
  let current = options.questionNumber
    ? findGuidedLessonForQuestion(study, options.questionNumber)?.id
    : options.lessonId;
  if (!study.lessons.some(l => l.id === current)) current = study.lessons[0].id;
  let destroyed = false;
  function paint() {
    if (destroyed) return;
    const idx = study.lessons.findIndex(l => l.id === current);
    const lesson = study.lessons[idx];
    const html = `<section class="aoCatechismGuided" lang="${lang}" aria-label="${text("Guided study", "Parcours guidé", lang)}">
      ${study.previewOnly ? `<p role="status" class="aoCatechismGuidedDraft">${text("Editorial preview — not published or certified", "Aperçu éditorial — non publié et non certifié", lang)}</p>` : ""}
      <nav aria-label="${text("Lessons", "Leçons", lang)}">
        <label for="ao-catechism-guided-select">${text("Lesson", "Leçon", lang)}</label>
        <select id="ao-catechism-guided-select" data-guided-select>
          ${study.lessons.map(l => `<option value="${escapeHtml(l.id)}" ${l.id === current ? "selected" : ""}>${escapeHtml(l.id)} · ${escapeHtml(l.title[lang])}</option>`).join("")}
        </select>
      </nav>
      <article><h2>${escapeHtml(lesson.title[lang])}</h2>
        ${lesson.claims.map(c => `<p>${escapeHtml(c[lang])} <span class="aoCatechismGuidedSources">${c.sources.map(s => `<a href="${escapeHtml(s.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(s.ref)}</a>`).join(" · ")}</span></p>`).join("")}
        <h3>${text("Original Catechism questions", "Questions du Catéchisme original", lang)}</h3>
        <div class="aoCatechismGuidedQuestions">${lesson.primaryQuestions.map(n => `<button type="button" data-guided-question="${n}">Q${n}</button>`).join(" ")}</div>
      </article>
      <footer>
        <button type="button" data-guided-prev ${idx === 0 ? "disabled" : ""}>${text("Previous", "Précédente", lang)}</button>
        <button type="button" data-guided-next ${idx === study.lessons.length - 1 ? "disabled" : ""}>${text("Next", "Suivante", lang)}</button>
      </footer>
    </section>`;
    root.innerHTML = html;
    root.querySelector("[data-guided-select]")?.addEventListener("change", event => {
      const value = event.target.value;
      if (study.lessons.some(l => l.id === value)) { current = value; paint(); }
    });
    root.querySelector("[data-guided-prev]")?.addEventListener("click", () => {
      if (idx > 0) { current = study.lessons[idx - 1].id; paint(); }
    });
    root.querySelector("[data-guided-next]")?.addEventListener("click", () => {
      if (idx < study.lessons.length - 1) { current = study.lessons[idx + 1].id; paint(); }
    });
    root.querySelectorAll("[data-guided-question]").forEach(button => button.addEventListener("click", () => {
      const n = Number(button.dataset.guidedQuestion);
      onQuestion({ number: n, ref: questionRef(n), lessonId: current });
    }));
  }
  paint();
  return {
    rendered: true, previewOnly: study.previewOnly,
    openQuestion(number) {
      const lesson = findGuidedLessonForQuestion(study, number);
      if (!lesson || destroyed) return false;
      current = lesson.id;
      paint();
      return true;
    },
    get currentLessonId() { return current; },
    destroy() { destroyed = true; root.replaceChildren(); }
  };
}
