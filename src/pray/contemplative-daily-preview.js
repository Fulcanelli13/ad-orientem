/**
 * Contemplative presentation for the source-owned Morning/Evening Prayer.
 *
 * Default: contemplative. Classic rollback: ?aoPrayReader=classic.
 * Explicit preview URL ?aoPrayReader=contemplative remains compatible.
 * Never rewrites prayer texts, sequences, routes or reader state.
 * Existing source-gated formulation and timer work remains independently owned.
 */
export const CONTEMPLATIVE_DAILY_PREVIEW_VERSION = "contemplative-daily-preview-v2-horizon";
export const CONTEMPLATIVE_DAILY_PREVIEW_FLAG = "aoPrayReader=contemplative";
export const CONTEMPLATIVE_DAILY_CLASSIC_FALLBACK_FLAG = "aoPrayReader=classic";

// The rollback is URL-local; no persistent preference or migration is written.
export function contemplativeDailyEnabled(search) {
  const params = new URLSearchParams(String(search || "").replace(/^\?/, ""));
  return !["classic", "regular", "legacy"].includes(params.get("aoPrayReader"));
}

export function contemplativeDailyMode(search, mount) {
  if (!contemplativeDailyEnabled(search)) return null;
  if (mount?.dataset?.aoTraditionalPrayRoute !== "pray.morning_evening") return null;
  if (mount?.dataset?.aoPrayView !== "traditional-pray" || !mount.querySelector?.(".aoTP381DaypartStrip")) return null;
  // Full-text mode retains the subdued theme but not the guided-stage treatment.
  return mount.dataset.aoTraditionalDualAxis === "daily" ? "guided" : "list";
}

export const CONTEMPLATIVE_DAILY_PREVIEW_CSS = [
  // Typed colour variables animate the sky with manual prayer progression.
  '@property --ao-contemplative-top{syntax:"<color>";inherits:true;initial-value:#111b29}',
  '@property --ao-contemplative-mid{syntax:"<color>";inherits:true;initial-value:#283440}',
  '@property --ao-contemplative-low{syntax:"<color>";inherits:true;initial-value:#50494a}',
  '@property --ao-contemplative-light{syntax:"<color>";inherits:true;initial-value:#916b60}',
  '#aoPray435930[data-ao-contemplative-daily]{--text:#eee9df;--muted:#aeb3ba;--bg:#0b121b;--surface:#101a24;--surface-1:#101a24;--border:rgba(236,224,204,.13);--liturgical:#c6a67a;color:var(--text)!important;transition:--ao-contemplative-top 1150ms ease,--ao-contemplative-mid 1150ms ease,--ao-contemplative-low 1150ms ease,--ao-contemplative-light 1150ms ease}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Sheet{background:linear-gradient(180deg,rgba(5,10,17,.42),rgba(6,11,17,.53) 52%,rgba(5,9,15,.69)),radial-gradient(ellipse 98% 48% at 51% 104%,color-mix(in srgb,var(--ao-contemplative-light,#916b60) 88%,transparent),transparent 76%),linear-gradient(180deg,var(--ao-contemplative-top,#111b29) 0%,var(--ao-contemplative-mid,#283440) 56%,var(--ao-contemplative-low,#50494a) 100%)!important;color:#eee9df!important;border:1px solid rgba(224,199,163,.15)!important;box-shadow:0 -12px 65px rgba(0,0,0,.54)!important}',
  // The approved Design B has a very quiet landscape silhouette beneath the text.
  // It is decorative, does not block touch input, and never requires art assets.
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Sheet{position:relative!important;isolation:isolate!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Sheet::before{content:"";position:absolute;inset:auto 0 0;height:clamp(48px,10dvh,100px);z-index:0;pointer-events:none;background:rgba(5,13,21,.4);clip-path:polygon(0% 65%,14% 57%,29% 68%,48% 49%,63% 62%,81% 53%,100% 66%,100% 100%,0 100%)}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Mount{position:relative!important;z-index:1!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Mount{background:transparent!important;color:#eee9df!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Head{background:rgba(8,15,23,.88)!important;border-bottom:1px solid rgba(239,224,198,.08)!important;padding-block:8px!important;align-items:center!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Head small{display:none!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Head h1{font:500 13px/1.3 var(--ao-font-ui,Georgia,serif)!important;letter-spacing:.055em!important;text-align:center!important;color:#d8d4cc!important;margin:0!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoP435930Head button{background:transparent!important;border-color:transparent!important;color:#d6c9b5!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoTP381DonorBody{background:transparent!important;color:#eee9df!important;padding:0 clamp(12px,2.5vw,24px) max(48px,env(safe-area-inset-bottom))!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoTP381DaypartStrip{justify-content:center!important;gap:22px!important;margin:4px 0 6px!important;padding:0!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoTP381DaypartStrip button{border:0!important;border-radius:0!important;background:transparent!important;color:#aeb3ba!important;min-height:44px!important;padding:8px 3px!important;font:500 12px/1.3 var(--ao-font-ui,Georgia,serif)!important;letter-spacing:.04em!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoTP381DaypartStrip button[aria-pressed="true"]{box-shadow:inset 0 -2px #c6a67a!important;color:#eee9df!important}',
  // Restore the original compact horizon; the entire reading sky also changes.
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoQuietHorizon{position:relative!important;width:min(100%,660px)!important;height:auto!important;margin:5px auto 12px!important;overflow:visible!important;clip-path:none!important;opacity:1!important;pointer-events:auto!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoQuietHorizonCanvas{height:clamp(88px,10dvh,106px)!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoTimeline.aoDevoSequenceTimeline{position:relative!important;top:auto!important;min-height:0!important;border:0!important;padding:2px 7px 14px!important;margin:0 auto!important;background:transparent!important;width:min(100%,560px)!important;gap:2px!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoStops{gap:3px!important;justify-content:flex-start!important;overflow-x:auto!important;scroll-snap-type:none!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoStop{display:flex!important;align-items:center!important;justify-content:center!important;flex:0 0 44px!important;min-width:44px!important;width:44px!important;min-height:44px!important;height:44px!important;border:0!important;padding:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important;color:#aeb3ba!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoStopNumber{display:block!important;overflow:hidden!important;width:5px!important;height:5px!important;border-radius:50%!important;background:rgba(235,221,202,.37)!important;font-size:0!important;letter-spacing:0!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoStop.active .aoDevoStopNumber{width:13px!important;height:3px!important;border-radius:2px!important;background:#c6a67a!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoStopTitle{position:absolute!important;width:1px!important;height:1px!important;overflow:hidden!important;clip-path:inset(50%)!important;white-space:nowrap!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoProgress{height:2px!important;min-height:2px!important;background:rgba(238,230,218,.13)!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoDevoProgressFill{background:#c6a67a!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoDevoCard{border:0!important;background:transparent!important;box-shadow:none!important;max-width:100%!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoDevoCardScroll{width:100%!important;max-width:660px!important;margin-inline:auto!important;height:auto!important;min-height:min(58dvh,560px)!important;overflow-y:auto!important;box-sizing:border-box!important;padding:clamp(25px,7dvh,65px) clamp(17px,4vw,40px) clamp(95px,16dvh,170px)!important;background:transparent!important;scroll-padding-top:20px!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoDevoCardScroll .aoTP381GuideCard{border:0!important;box-shadow:none!important;background:transparent!important;padding:0!important;margin:0!important;gap:clamp(18px,4dvh,34px)!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoDevoCardScroll .aoTP381GuideCard>h2{font:400 clamp(32px,7vw,43px)/1.12 var(--ao-font-display,Georgia,serif)!important;letter-spacing:-.015em!important;max-width:18ch!important;color:#f2eee6!important;margin:0 0 8px!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoTP381GuideCard>.aoTP381PrayerCard [data-tp381-flip],#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoTP381GuideCard>.aoTP381PrayerCard .aoTP381Reader{font:400 clamp(20px,4.6vw,24px)/1.85 var(--ao-font-liturgical,Georgia,serif)!important;color:#eee9df!important;max-width:44ch!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoTP381GuideCard .aoTP381TextParagraph{font:400 clamp(20px,4.6vw,24px)/1.85 var(--ao-font-liturgical,Georgia,serif)!important;color:#eee9df!important;margin:0 0 1.35em!important}',
  '#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoTP381GuideCard>p{font:400 clamp(20px,4.6vw,23px)/1.75 var(--ao-font-liturgical,Georgia,serif)!important;color:#eee9df!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoTP381DonorBody .aoTP381SecondaryOptions{border-color:rgba(238,224,204,.10)!important;color:#b6b1aa!important;max-width:660px;margin-inline:auto!important}',
  '#aoPray435930[data-ao-contemplative-daily] .aoTP381Source{color:#b6b1aa!important;max-width:660px;margin-inline:auto!important}',
  '#aoPray435930[data-ao-contemplative-daily="list"] .aoTP381PrayerList{max-width:660px;margin:25px auto!important}',
  '#aoPray435930[data-ao-contemplative-daily] :is(button,summary,a):focus-visible{outline:2px solid #dbb983!important;outline-offset:3px!important}',
  '@media(max-width:560px){#aoPray435930[data-ao-contemplative-daily] .aoP435930Sheet{height:100dvh!important;max-height:100dvh!important;border-radius:0!important;border:0!important}#aoPray435930[data-ao-contemplative-daily="guided"] .aoTP381DonorBody .aoDevoCardScroll{min-height:61dvh!important;padding-inline:clamp(15px,5vw,24px)!important}}',
  '@media(prefers-reduced-motion:reduce){#aoPray435930[data-ao-contemplative-daily]{transition:none!important}#aoPray435930[data-ao-contemplative-daily] *,#aoPray435930[data-ao-contemplative-daily] *::before,#aoPray435930[data-ao-contemplative-daily] *::after{animation-duration:0.01ms!important;transition-duration:0.01ms!important;scroll-behavior:auto!important}}'
].join("\n");

/**
 * Observe only the owned Prayer root, not the full document. Once the donor
 * installs the root, presentation synchronizes on its ordinary rerenders.
 */
export function installContemplativeDailyPreview(win = globalThis) {
  const doc = win.document;
  if (!doc || !contemplativeDailyEnabled(win.location?.search || "")) return false;
  if (win.AO_CONTEMPLATIVE_DAILY_PREVIEW_V1) return true;
  const style = doc.createElement("style");
  style.id = "ao-contemplative-daily-preview-css";
  style.textContent = CONTEMPLATIVE_DAILY_PREVIEW_CSS;
  doc.head?.appendChild(style);

  let root = null;
  let attached = null;
  let pending = false;
  let rootObserver = null;
  let discoverObserver = null;
  const COLORS = ["top", "mid", "low", "light"];

  function sync() {
    pending = false;
    if (!root?.isConnected) return;
    const mount = root.querySelector(".aoP435930Mount");
    const mode = contemplativeDailyMode(win.location?.search || "", mount);
    if (!mode) {
      root.removeAttribute("data-ao-contemplative-daily");
      for (const name of COLORS) root.style.removeProperty("--ao-contemplative-" + name);
      return;
    }
    root.setAttribute("data-ao-contemplative-daily", mode);
    if (mode === "guided") {
      const horizon = mount.querySelector("[data-ao-quiet-daily-horizon]");
      for (const name of COLORS) {
        const value = horizon?.style.getPropertyValue("--ao-sky-" + name);
        if (value) root.style.setProperty("--ao-contemplative-" + name, value);
      }
      // The traditional renderer flips language faces from a document-level
      // capture listener. That listener deliberately stops propagation, so
      // the generic card focus listener cannot re-focus the newly revealed
      // Latin paragraphs. Normalize both faces at mount time, including the
      // initially hidden face; the actual prayer text remains source-owned.
      for (const paragraph of mount.querySelectorAll(".aoDevoCardScroll .aoDevoParagraph")) {
        paragraph.style.setProperty("--ao-devo-focus", "1");
        paragraph.style.setProperty("opacity", "1", "important");
      }
      // Compact timeline dots remain individually accessible, named and clickable.
      for (const button of mount.querySelectorAll(".aoDevoSequenceTimeline .aoDevoStop")) {
        const name = button.querySelector(".aoDevoStopTitle")?.textContent?.trim();
        if (name && button.getAttribute("aria-label") !== name) button.setAttribute("aria-label", name);
      }
    }
  }
  function queueSync() {
    if (pending) return;
    pending = true;
    win.queueMicrotask ? win.queueMicrotask(sync) : Promise.resolve().then(sync);
  }
  function attach() {
    const next = doc.getElementById("aoPray435930");
    if (!next || next === attached) return;
    rootObserver?.disconnect();
    root = attached = next;
    rootObserver = new win.MutationObserver(queueSync);
    rootObserver.observe(root, {
      childList: true, subtree: true, attributes: true,
      attributeFilter: ["data-ao-traditional-pray-route", "data-ao-traditional-dual-axis"]
    });
    discoverObserver?.disconnect();
    discoverObserver = null;
    queueSync();
  }
  if (doc.getElementById("aoPray435930")) attach();
  else if (doc.documentElement && win.MutationObserver) {
    discoverObserver = new win.MutationObserver(attach);
    discoverObserver.observe(doc.documentElement, {childList:true,subtree:true});
  }
  win.AO_CONTEMPLATIVE_DAILY_PREVIEW_V1 = Object.freeze({
    version: CONTEMPLATIVE_DAILY_PREVIEW_VERSION,
    sync: queueSync,
    active: () => Boolean(root?.getAttribute("data-ao-contemplative-daily"))
  });
  return true;
}

if (typeof window !== "undefined" && typeof document !== "undefined")
  installContemplativeDailyPreview(window);
