import { buildReaderFrameModel } from "./reader-view-model.js";

const STYLE_ID = "ao-r17-reader-style";

function ensureStyle(doc) {
  if (doc.getElementById(STYLE_ID)) return;
  const style = doc.createElement("style");
  style.id = STYLE_ID;
  style.textContent = `
.ao-r17-reader{--ao-r-bg:var(--ao-bg,#080c12);--ao-r-panel:rgba(15,20,27,.94);--ao-r-text:var(--ao-text,#eee8dc);--ao-r-muted:var(--ao-muted,#a8a49c);--ao-r-accent:var(--ao-accent,currentColor);background:var(--ao-r-bg);color:var(--ao-r-text);min-height:100%;font-family:var(--ao-body-font,Georgia,serif);display:grid;grid-template-rows:auto auto minmax(0,1fr);overflow:hidden}
.ao-r17-mode,.ao-r17-state{display:grid;align-items:center;border-bottom:1px solid rgba(255,255,255,.09);background:rgba(8,12,18,.97)}
.ao-r17-mode{grid-template-columns:repeat(3,1fr)}
.ao-r17-state{grid-template-columns:1fr minmax(0,2fr) auto;min-height:38px}
.ao-r17-mode button,.ao-r17-state button{appearance:none;border:0;background:transparent;color:inherit;font:inherit;letter-spacing:.08em;text-transform:uppercase;padding:.65rem .5rem}
.ao-r17-mode button[aria-pressed="true"]{color:var(--ao-r-accent);box-shadow:inset 0 -2px currentColor}
.ao-r17-state .ao-r17-position,.ao-r17-state .ao-r17-section{padding:.45rem .65rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ao-r17-state .ao-r17-section{text-align:center;font-variant:small-caps;letter-spacing:.06em}
.ao-r17-readerbody{display:grid;grid-template-columns:minmax(58px,76px) minmax(0,1fr) minmax(58px,76px);min-height:0}
.ao-r17-rail{background:rgba(8,12,18,.92);display:flex;flex-direction:column;gap:.45rem;padding:.55rem .35rem;min-width:0}
.ao-r17-railbox{border:1px solid rgba(255,255,255,.09);border-radius:10px;min-height:56px;padding:.45rem .3rem;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;gap:.25rem}
.ao-r17-raillabel{font-size:.58rem;letter-spacing:.08em;text-transform:uppercase;color:var(--ao-r-muted)}
.ao-r17-railvalue{font-size:.74rem;line-height:1.15;overflow-wrap:anywhere}
.ao-r17-railbox[data-transient="true"].ao-r17-active{border-color:currentColor;transform:scale(1.04)}
.ao-r17-icon{width:24px;height:24px;background:currentColor;mask:var(--ao-icon-mask) center/contain no-repeat;-webkit-mask:var(--ao-icon-mask) center/contain no-repeat}
.ao-r17-icon:not([style*="--ao-icon-mask"]){display:none}
.ao-r17-cardwrap{min-width:0;min-height:0;padding:.75rem;overflow:hidden}
.ao-r17-card{height:100%;max-width:760px;margin:0 auto;background:var(--ao-r-panel);border:1px solid rgba(255,255,255,.08);border-radius:16px;display:flex;flex-direction:column;overflow:hidden}
.ao-r17-cardhead{padding:1rem 1rem .65rem;border-bottom:1px solid rgba(255,255,255,.07)}
.ao-r17-cardhead h2{font-family:var(--ao-display-font,Georgia,serif);font-size:clamp(1.18rem,3.6vw,1.65rem);font-weight:500;margin:0;text-align:center;letter-spacing:.025em}
.ao-r17-scroll{overflow:auto;overscroll-behavior:contain;scrollbar-width:thin;padding:1rem 1.05rem 30vh}
.ao-r17-line{font-size:clamp(1.08rem,3.8vw,1.38rem);line-height:1.62;margin:0 0 1.05rem}
.ao-r17-line[data-response="true"]{padding-left:.75rem;border-left:2px solid currentColor}
.ao-r17-latin,.ao-r17-vernacular{display:block}
.ao-r17-secondary{font-size:.82em;color:var(--ao-r-muted);margin-top:.18rem}
.ao-r17-toggle{cursor:pointer}
.ao-r17-guide[disabled]{opacity:.4}
@media(max-width:430px){.ao-r17-readerbody{grid-template-columns:58px minmax(0,1fr) 58px}.ao-r17-rail{padding:.4rem .2rem}.ao-r17-cardwrap{padding:.45rem}.ao-r17-scroll{padding:.85rem .8rem 34vh}.ao-r17-state{grid-template-columns:minmax(74px,1fr) minmax(0,2fr) auto}.ao-r17-state .ao-r17-position{font-size:.72rem}.ao-r17-railvalue{font-size:.66rem}}
`;
  doc.head.appendChild(style);
}

function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

function el(doc, tag, cls, text) {
  const node = doc.createElement(tag);
  if (cls) node.className = cls;
  if (text != null) node.textContent = String(text);
  return node;
}

function valueText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  return value.label ?? value.value ?? value.type ?? "";
}

function railBox(doc, label, value, transient = false) {
  const box = el(doc, "div", "ao-r17-railbox" + (value ? " ao-r17-active" : ""));
  if (transient) box.dataset.transient = "true";
  const iconMask = value && typeof value === "object" ? value.iconMask : null;
  if (iconMask) {
    const icon = el(doc, "span", "ao-r17-icon");
    icon.style.setProperty("--ao-icon-mask", `url("${iconMask}")`);
    box.appendChild(icon);
  }
  box.appendChild(el(doc, "span", "ao-r17-raillabel", label));
  box.appendChild(el(doc, "span", "ao-r17-railvalue", valueText(value) || "—"));
  return box;
}

function renderLine(doc, line, language) {
  const p = el(doc, "p", "ao-r17-line");
  if (line.response) p.dataset.response = "true";

  if (line.policy.primary === "LATIN") {
    p.appendChild(el(doc, "span", "ao-r17-latin", line.lat ?? line.vernacular ?? ""));
    if (line.vernacular) p.appendChild(el(doc, "span", "ao-r17-vernacular ao-r17-secondary", line.vernacular));
    return p;
  }

  const latinFirst = String(language ?? "").toLowerCase() === "latin";
  const primary = latinFirst ? (line.lat ?? line.vernacular ?? "") : (line.vernacular ?? line.lat ?? "");
  const alternate = latinFirst ? line.vernacular : line.lat;
  const main = el(doc, "span", "ao-r17-vernacular ao-r17-toggle", primary);
  if (alternate) {
    main.tabIndex = 0;
    main.setAttribute("role", "button");
    main.addEventListener("click", () => {
      const current = main.textContent;
      main.textContent = current === primary ? alternate : primary;
    });
    main.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        main.click();
      }
    });
  }
  p.appendChild(main);
  return p;
}

export function mountMassReader({
  root,
  prepared,
  moment,
  guideRegistryAvailable = false,
  guideRubric = null,
  onModeChange = null,
  onGuide = null,
} = {}) {
  if (!root || !root.ownerDocument) throw new TypeError("A DOM root is required");
  if (!prepared?.readerPreferences) throw new TypeError("Prepared Mass entry payload required");

  const doc = root.ownerDocument;
  ensureStyle(doc);
  root.classList.add("ao-r17-reader");

  let currentMoment = moment ?? {};
  let preferences = prepared.readerPreferences;

  function draw() {
    const frame = buildReaderFrameModel({
      moment: currentMoment,
      preferences,
      guideRegistryAvailable,
      guideRubric,
      localPostureOverride: currentMoment.localPostureOverride ?? null,
    });

    clear(root);

    const mode = el(doc, "div", "ao-r17-mode");
    for (const name of ["MISSAL", "SIMPLE", "LIVE"]) {
      const button = el(doc, "button", "", name);
      button.type = "button";
      button.setAttribute("aria-pressed", String(frame.mode === name));
      button.addEventListener("click", () => {
        if (frame.mode === name) return;
        preferences = Object.freeze({ ...preferences, mode: name });
        if (typeof onModeChange === "function") onModeChange(name);
        draw();
      });
      mode.appendChild(button);
    }

    const state = el(doc, "div", "ao-r17-state");
    state.appendChild(el(doc, "div", "ao-r17-position", valueText(frame.topState.priestPosition) || "—"));
    state.appendChild(el(doc, "div", "ao-r17-section", frame.topState.currentSection || "Mass"));
    const guide = el(doc, "button", "ao-r17-guide", "Guide");
    guide.type = "button";
    guide.disabled = frame.topState.guide.failClosed;
    guide.title = frame.topState.guide.failClosed ? "Guide registry awaiting exact sourced recovery" : "Open current rubric";
    guide.addEventListener("click", () => {
      if (!frame.topState.guide.failClosed && typeof onGuide === "function") onGuide(frame.topState.guide.rubric, frame);
    });
    state.appendChild(guide);

    const body = el(doc, "div", "ao-r17-readerbody");
    const left = el(doc, "aside", "ao-r17-rail");
    left.setAttribute("aria-label", "Faithful");
    left.appendChild(railBox(doc, "Posture", frame.leftRail.posture));
    left.appendChild(railBox(doc, "Gesture", frame.leftRail.gesture, true));
    left.appendChild(railBox(doc, "Respond", frame.leftRail.respond, true));

    const wrap = el(doc, "main", "ao-r17-cardwrap");
    const card = el(doc, "section", "ao-r17-card");
    const head = el(doc, "header", "ao-r17-cardhead");
    head.appendChild(el(doc, "h2", "", frame.title || frame.section || "Mass"));
    const scroll = el(doc, "div", "ao-r17-scroll");
    for (const line of frame.lines) scroll.appendChild(renderLine(doc, line, frame.language));
    card.append(head, scroll);
    wrap.appendChild(card);

    const right = el(doc, "aside", "ao-r17-rail");
    right.setAttribute("aria-label", "Audio and priest");
    right.appendChild(railBox(doc, "Priest Voice", frame.rightRail.priestVoice));
    right.appendChild(railBox(doc, "Schola", frame.rightRail.schola));

    body.append(left, wrap, right);
    root.append(mode, state, body);
    return frame;
  }

  let frame = draw();

  return Object.freeze({
    get frame() { return frame; },
    updateMoment(nextMoment) {
      currentMoment = nextMoment ?? {};
      frame = draw();
      return frame;
    },
    setGuide({ available = false, rubric = null } = {}) {
      guideRegistryAvailable = available;
      guideRubric = rubric;
      frame = draw();
      return frame;
    },
    destroy() {
      clear(root);
      root.classList.remove("ao-r17-reader");
    },
  });
}
