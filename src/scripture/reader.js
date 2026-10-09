import { SCRIPTURE_EDITIONS, DEFAULT_SCRIPTURE_EDITION, scripturePassage } from "./catalogue.js";
import { passageReference } from "./passages.js";

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text != null) el.textContent = text;
  return el;
}

/**
 * Standalone, DOM-safe read-only Scripture panel. Only displays certified records.
 * No HTML interpretation of source text; no implicit network dependency.
 * Mounting it is the caller's explicit responsibility.
 */
export function mountScriptureReader(root, { store, passage, language = "en", onSelection } = {}) {
  if (!root || typeof root.replaceChildren !== "function") throw new TypeError("A DOM root is required");
  if (!store || typeof store.get !== "function") throw new TypeError("A certified Scripture store is required");
  let current = scripturePassage(passage);
  let lang = language;
  let editionId = DEFAULT_SCRIPTURE_EDITION[lang];
  if (!editionId) throw new Error("Unsupported Scripture language");
  const container = node("section", "ao-scripture-reader");
  container.setAttribute("aria-label", "Sacred Scripture");
  const toolbar = node("div", "ao-scripture-toolbar");
  const title = node("h2", "ao-scripture-heading", "Sacred Scripture");
  const reference = node("p", "ao-scripture-reference");
  const selectLabel = node("label", "ao-scripture-edition-label", "Bible translation");
  const select = node("select", "ao-scripture-edition");
  const output = node("article", "ao-scripture-text");
  output.setAttribute("aria-live", "polite");
  selectLabel.append(select);
  toolbar.append(title, selectLabel);
  container.append(toolbar, reference, output);
  root.replaceChildren(container);

  function draw() {
    const options = Object.values(SCRIPTURE_EDITIONS).filter(e => e.language === lang);
    select.replaceChildren(...options.map(e => {
      const option = node("option", "", e.title);
      option.value = e.id;
      option.disabled = !e.enabled || e.rights !== "cleared";
      return option;
    }));
    select.value = editionId;
    reference.textContent = passageReference(current);
    output.replaceChildren();
    try {
      const record = store.get(current, editionId);
      output.append(node("p", "ao-scripture-verse", record.text));
      const credit = node("small", "ao-scripture-source", record.sourceEdition);
      output.append(credit);
    } catch {
      output.append(node("p", "ao-scripture-unavailable",
        "This translation is not yet available. No unverified Scripture text will be substituted."));
    }
  }
  select.addEventListener("change", () => {
    const option = SCRIPTURE_EDITIONS[select.value];
    if (!option || option.language !== lang || !option.enabled || option.rights !== "cleared") {
      select.value = editionId;
      return;
    }
    editionId = option.id;
    draw();
    onSelection?.({ language: lang, editionId, passage: current });
  });
  draw();
  return Object.freeze({
    setPassage(next) { current = scripturePassage(next); draw(); },
    setLanguage(next) {
      if (!DEFAULT_SCRIPTURE_EDITION[next]) throw new Error("Unsupported Scripture language");
      lang = next;
      editionId = DEFAULT_SCRIPTURE_EDITION[next];
      draw();
    },
    destroy() { root.replaceChildren(); }
  });
}
