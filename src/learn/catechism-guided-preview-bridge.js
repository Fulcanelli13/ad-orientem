import { renderCatechismGuidedStudy } from "./catechism-guided-reader.js";

// Attach only during explicit editorial QA. No changes to the 433-question Q&A runtime.
export async function installCatechismGuidedPreview(win = globalThis) {
  const params = new URLSearchParams(win.location?.search || "");
  if (params.get("aoCatechismGuidedPreview") !== "1") return false;
  const original = win.document?.getElementById("ao-cate-root");
  if (!original || original.hidden) return false;
  const existing = win.document.getElementById("ao-catechism-guided-preview");
  if (existing) return true;
  const paths = [
    "data/learn/learn-the-faith-55-proposed-reconciliation-2026-10-09.v1.json",
    "data/learn/learn-the-faith-certification-001-018.v1.json",
    "data/learn/learn-the-faith-certification-019-054.v1.json",
    "data/learn/ltfaith-pius-x-en-witness-index.v1.json"
  ];
  const responses = await Promise.all(paths.map(path => win.fetch(new URL(path, win.document.baseURI))));
  if (responses.some(response => !response.ok)) throw new Error("Guided Catechism preview source unavailable");
  const [crosswalk, first, second, witnessIndex] = await Promise.all(responses.map(response => response.json()));
  const button = win.document.createElement("button");
  button.type = "button";
  button.textContent = win.AO_RUNTIME_V8?.store?.getState?.()?.language === "fr" ? "Parcours guidé (brouillon)" : "Guided study (draft)";
  button.dataset.aoCatechismGuidedPreview = "toggle";
  const panel = win.document.createElement("section");
  panel.id = "ao-catechism-guided-preview";
  panel.hidden = true;
  panel.style.cssText = "position:fixed;inset:0;z-index:2147483000;overflow:auto;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#e9e4d9);padding:24px 14px 60px;font-family:Georgia,serif";
  const close = win.document.createElement("button");
  close.textContent = "×";
  close.type = "button";
  close.setAttribute("aria-label", "Close guided study preview");
  close.style.cssText = "position:sticky;top:0;float:right;font-size:26px;z-index:2";
  const content = win.document.createElement("div");
  const style = win.document.createElement("style");
  style.textContent = ".aoCatechismGuided{max-width:760px;margin:auto;line-height:1.55}.aoCatechismGuided select{max-width:100%;padding:10px;background:#151d29;color:inherit}.aoCatechismGuided a{color:var(--liturgical,#c9ad78)}.aoCatechismGuided article p{margin:1.1rem 0}.aoCatechismGuided button{padding:10px;margin:3px;background:#17202b;color:inherit;border:1px solid #56606a;border-radius:7px}.aoCatechismGuidedDraft{font-size:.85rem;opacity:.75}";
  panel.append(close, style, content);
  win.document.body.append(panel);
  original.prepend(button);
  const view = renderCatechismGuidedStudy(content, { crosswalk, first, second, witnessIndex }, {
    preview: true,
    language: win.AO_RUNTIME_V8?.store?.getState?.()?.language,
    onQuestion: ({ number }) => {
      panel.hidden = true;
      original.hidden = false;
      // The historical Catechism reader has no confirmed question deep-link API.
      // Until its native navigator is identified, open the exact source chapter
      // rather than pretending that the original reader moved to question N.
      const source = witnessIndex.entries.find(entry => entry.q === number);
      if (source?.source_file_url) {
        const link = win.document.createElement("a");
        link.href = source.source_file_url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.click();
      }
    }
  });
  button.addEventListener("click", () => { panel.hidden = false; });
  close.addEventListener("click", () => { panel.hidden = true; button.focus(); });
  return Boolean(view.rendered);
}
