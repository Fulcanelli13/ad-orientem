import { renderCatechismGuidedStudy, openNativeCatechismQuestion } from "./catechism-guided-reader.js";
import { guidedStudyReleaseApproved } from "./catechism-guided-study.js";

// Mounted inside the existing St Pius X Catechism, not as a competing Formation route.
// The normal UI is available only after all release gates pass; ?aoCatechismGuidedPreview=1
// enables an explicitly labelled editorial preview, not a public lesson.
export async function installCatechismGuidedMode(win = globalThis) {
  const original = win.document?.getElementById("ao-cate-root");
  if (!original || original.hidden) return false;
  if (win.AO_CATECHISM_GUIDED_MODE_V1) return true;
  const params = new URLSearchParams(win.location?.search || "");
  const preview = params.get("aoCatechismGuidedPreview") === "1";
  const paths = [
    "data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json",
    "data/learn/learn-the-faith-certification-001-018.v1.json",
    "data/learn/learn-the-faith-certification-019-054.v1.json",
    "data/learn/ltfaith-pius-x-en-witness-index.v1.json",
    "data/learn/ltfaith-pius-x-fr-1913-scan-page-candidates.v1.json"
  ];
  const firstResponse = await win.fetch(new URL(paths[0], win.document.baseURI));
  if (!firstResponse.ok) throw new Error("Guided Catechism crosswalk unavailable");
  const crosswalk = await firstResponse.json();
  if (!preview && !guidedStudyReleaseApproved(crosswalk)) return false;
  const remaining = await Promise.all(paths.slice(1).map(p => win.fetch(new URL(p, win.document.baseURI))));
  if (remaining.some(r => !r.ok)) throw new Error("Guided Catechism source unavailable");
  const [first, second, witnessIndex, frenchIndex] = await Promise.all(remaining.map(r => r.json()));
  const lang = win.AO_RUNTIME_V8?.store?.getState?.()?.language === "fr" ? "fr" : "en";
  const L = (en, fr) => lang === "fr" ? fr : en;
  const doc = win.document;
  const button = doc.createElement("button");
  button.type = "button";
  button.textContent = preview ? L("Guided study · draft", "Parcours guidé · brouillon") : L("Guided study", "Parcours guidé");
  button.dataset.aoCatechismGuidedMode = "toggle";
  button.style.cssText = "position:sticky;top:0;z-index:6;display:block;margin:8px 12px;padding:10px 16px;border:1px solid var(--liturgical,#c9ad78);border-radius:9px;background:var(--surface-1,#121a25);color:inherit";
  const panel = doc.createElement("section");
  panel.id = "ao-catechism-guided-panel";
  panel.hidden = true;
  panel.setAttribute("aria-label", L("Guided Catechism study", "Parcours guidé du Catéchisme"));
  panel.style.cssText = "position:fixed;inset:0;z-index:2147483000;overflow:auto;overscroll-behavior:contain;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);padding:calc(12px + env(safe-area-inset-top)) 14px calc(60px + env(safe-area-inset-bottom));font-family:Georgia,serif";
  const close = doc.createElement("button");
  close.textContent = "×";
  close.type = "button";
  close.setAttribute("aria-label", L("Close guided study", "Fermer le parcours guidé"));
  close.style.cssText = "position:sticky;top:0;float:right;font-size:26px;z-index:2;min-height:44px;min-width:44px";
  const notice = doc.createElement("p");
  notice.setAttribute("role", "status");
  notice.hidden = true;
  const content = doc.createElement("div");
  const style = doc.createElement("style");
  style.textContent = ".aoCatechismGuided{max-width:760px;margin:auto;line-height:1.55}.aoCatechismGuided select{max-width:100%;padding:10px;background:#151d29;color:inherit}.aoCatechismGuided a{color:var(--liturgical,#c9ad78)}.aoCatechismGuided article p{margin:1.1rem 0}.aoCatechismGuided button{padding:10px;margin:3px;background:#17202b;color:inherit;border:1px solid #56606a;border-radius:7px;min-height:44px}.aoCatechismGuidedDraft{font-size:.85rem;opacity:.75}";
  panel.append(close, notice, style, content);
  doc.body.append(panel);
  // The legacy Catechism replaces its own innerHTML when switching question/language.
  // Restore the mode control without patching that 38 MB legacy HTML script.
  const keepButton = () => {
    if (!original.contains(button)) original.prepend(button);
  };
  keepButton();
  const observer = new win.MutationObserver(keepButton);
  observer.observe(original, { childList: true });
  let view;
  try {
    view = renderCatechismGuidedStudy(content, { crosswalk, first, second, witnessIndex, frenchIndex }, {
      preview, language: lang,
      onQuestion: async ({ number }) => {
        notice.hidden = true;
        const ok = await openNativeCatechismQuestion(win, number, lang);
        if (ok) {
          panel.hidden = true;
          original.hidden = false;
          button.focus?.({ preventScroll: true });
          return;
        }
        notice.replaceChildren();
        notice.append(doc.createTextNode(L("The original question could not be opened in the app. ", "Impossible d’ouvrir cette question dans l’application. ")));
        const source = witnessIndex.entries.find(x => x.q === number);
        if (source?.source_file_url) {
          const link = doc.createElement("a");
          link.href = source.source_file_url;
          link.textContent = L("Consult the source chapter", "Consulter le chapitre source");
          link.target = "_blank";
          link.rel = "noopener noreferrer";
          notice.append(link);
        }
        notice.hidden = false;
      }
    });
  } catch(error) {
    observer.disconnect();
    button.remove();
    panel.remove();
    throw error;
  }
  if (!view.rendered) {
    observer.disconnect();
    button.remove();
    panel.remove();
    return false;
  }
  button.addEventListener("click", () => { panel.hidden = false; close.focus?.({ preventScroll: true }); });
  close.addEventListener("click", () => { panel.hidden = true; button.focus?.({ preventScroll: true }); });
  win.AO_CATECHISM_GUIDED_MODE_V1 = Object.freeze({
    openQuestion: number => view.openQuestion(number),
    status: () => ({ installed: true, preview, visible: !panel.hidden, lesson: view.currentLessonId }),
    dispose: () => {
      observer.disconnect();
      view.destroy();
      button.remove();
      panel.remove();
      delete win.AO_CATECHISM_GUIDED_MODE_V1;
    }
  });
  return true;
}

// Compatibility with earlier editorial QA callers.
export const installCatechismGuidedPreview = installCatechismGuidedMode;
