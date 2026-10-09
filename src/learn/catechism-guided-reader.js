import { buildCatechismGuidedStudy, findGuidedLessonForQuestion } from "./catechism-guided-study.js";

// Embeddable reader for the existing Catechism surface. Never mounts itself or adds a public route.
// Production callers must supply the certified crosswalk and overlays and must not set preview.
const escapeHtml = value => String(value ?? "").replace(/[&<>"']/g, c => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
}[c]));
const language = value => value === "fr" ? "fr" : "en";
const text = (en, fr, lang) => lang === "fr" ? fr : en;
const questionRef = n => "PX1912-Q" + String(n).padStart(3, "0");

// The canonical 433-question reader already implements openQuestion(number).
// Use that controller instead of simulating clicks or sending users to GitHub.
export async function openNativeCatechismQuestion(win, number, language = "en") {
  if (!Number.isInteger(number) || number < 1 || number > 433) return false;
  const api = win?.AO_TRADITIONAL_CATECHISM;
  if (typeof api?.openQuestion !== "function") return false;
  try {
    if (api.openQuestion(number) === true) return true;
    if (typeof api.load === "function") {
      await api.load(language === "fr" ? "fr" : "en");
      return api.openQuestion(number) === true;
    }
  } catch (error) {
    win?.console?.error?.("Catechism native question navigation failed", error);
  }
  return false;
}

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
  const witnessByQuestion = new Map(inputs.witnessIndex.entries.map(entry => [entry.q, entry]));
  // Original-language links load only when Guided Study is explicitly open.
  const frenchByQuestion = new Map((inputs.frenchIndex?.entries || []).map(item => [item.q, item]));
  if (inputs.frenchIndex && frenchByQuestion.size !== 433)
    throw new Error("Incomplete original 1913 French page index");
  const renderSource = source => {
    const links = [`<a href="${escapeHtml(source.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(source.ref)}</a>`];
    if (source.originalLanguageUrl)
      links.push(`<a href="${escapeHtml(source.originalLanguageUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(text("Italian 1912 transcription", "Transcription italienne de 1912", lang))}">IT</a>`);
    const match = /^PX1912-Q(\d{3})$/.exec(source.ref);
    const french = match ? frenchByQuestion.get(Number(match[1])) : null;
    if (french?.scanUrl) {
      const checked = french.status === "VISUALLY_CONFIRMED_ORIGINAL_FRENCH_1913_PRINT_QA";
      const label = checked
        ? text("French printed 1913 original, answer visually checked", "Original français imprimé de 1913, réponse contrôlée visuellement", lang)
        : text("French printed 1913 original, provisional page locator", "Original français imprimé de 1913, page provisoire non collationnée", lang);
      links.push(`<a href="${escapeHtml(french.scanUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHtml(label)}" title="${escapeHtml(label)}">FR 1913</a>`);
    }
    return links.join(" ");
  };
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
      <p class="aoCatechismGuidedPosition">${text("Lesson", "Leçon", lang)} ${idx + 1} / ${study.lessons.length}</p>
      <article><h2>${escapeHtml(lesson.title[lang])}</h2>
        ${lesson.claims.map((c, j) => `<div class="aoCatechismGuidedClaim"><p>${escapeHtml(c[lang])}</p><details class="aoCatechismGuidedEvidence"><summary>${text("Sources", "Sources", lang)} · ${c.sources.length}</summary><div class="aoCatechismGuidedSources" aria-label="${text("Original documents for this explanation", "Documents originaux de cette explication", lang)}">${c.sources.map(renderSource).join(" · ")}</div></details></div>`).join("")}
        <h3>${text("Original Catechism questions", "Questions du Catéchisme original", lang)}</h3>
        <div class="aoCatechismGuidedQuestions">${lesson.primaryQuestions.map(n => `<button type="button" data-guided-question="${n}" aria-label="${text("Open original question", "Ouvrir la question originale", lang)} ${n}">${lang === "fr" ? `Question ${n}` : `Q${n} · ${escapeHtml(witnessByQuestion.get(n)?.q_stem || "")}`}</button>`).join(" ")}</div>
      </article>
      <footer>
        <button type="button" data-guided-prev ${idx === 0 ? "disabled" : ""}>${text("Previous", "Précédente", lang)}</button>
        <button type="button" data-guided-next ${idx === study.lessons.length - 1 ? "disabled" : ""}>${text("Next", "Suivante", lang)}</button>
      </footer>
    </section>`;
    root.innerHTML = html;
    // The overlay is scrollable; advancing a lesson must not leave the reader at the preceding lesson's footer.
    if (root.parentElement?.scrollTop != null) root.parentElement.scrollTop = 0;
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
