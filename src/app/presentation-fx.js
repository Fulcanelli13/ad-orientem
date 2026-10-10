export const PRESENTATION_FX_VERSION = "modular-presentation-fx-v3";

const SURFACE_ROOT = Object.freeze({
  home: ".homeScreen",
  mass: "#ao-r17-native-reader-preview, #ao-mass-flow-v1 .aoMassFlowBackdrop",
  pray: "#aoPray435930",
  learn: "#ao-learn-modular-root",
  calendar: "#ao-calendar-modular-root",
  settings: "#ao-settings-modular-root",
});

const HERO_SELECTOR = Object.freeze({
  home: ".celebrationBlock",
  pray: ".aoP435930HomeIntro,.aoP435930Hero,.aoP435930WordHero,.aoP435930MeditationIntro",
  learn: ".aoLearnModHero",
  calendar: ".aoCalV2Hero,.aoCalSacredTime",
});


function runtimeState(win) {
  return win?.AO_RUNTIME_V8?.store?.getState?.() ?? null;
}

function legacyCinema(win) {
  return win?.AO_CINEMATIC_V4312 ?? win?.AO_CINEMATIC_V4311 ?? null;
}

function reducedMotion(win) {
  const legacy = legacyCinema(win);
  if (typeof legacy?.isReducedMotion === "function") return Boolean(legacy.isReducedMotion());
  return Boolean(
    win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    runtimeState(win)?.settings?.reducedMotion
  );
}

function loaderElement(win) {
  return win?.document?.getElementById?.("ao-cinema-loader") ?? null;
}

function ensureModularFxStyle(win) {
  const doc=win?.document;
  if (!doc?.createElement || doc.getElementById?.("ao-modular-presentation-fx-style")) return;
  const style=doc.createElement("style");
  style.id="ao-modular-presentation-fx-style";
  style.textContent=`
.aoModularSurfaceIn{animation:aoModularSurfaceIn .42s cubic-bezier(.18,.8,.2,1) both}
@keyframes aoModularSurfaceIn{from{opacity:.18;filter:blur(1.5px)}to{opacity:1;filter:none}}
.aoModularHeroIn{animation:aoModularHeroIn .54s cubic-bezier(.16,.78,.18,1) both;transform-origin:50% 20%}
@keyframes aoModularHeroIn{from{opacity:.12;filter:blur(2.2px);transform:translateY(7px) scale(.995)}to{opacity:1;filter:none;transform:none}}
@media(prefers-reduced-motion:reduce){.aoModularSurfaceIn,.aoModularHeroIn{animation:none!important;filter:none!important;transform:none!important}}
html[data-reduced-motion="true"] .aoModularSurfaceIn,html[data-reduced-motion="true"] .aoModularHeroIn{animation:none!important;filter:none!important;transform:none!important}
`;
  (doc.head??doc.documentElement)?.append?.(style);
}

function setText(root, selector, value) {
  const node = root?.querySelector?.(selector);
  if (node) node.textContent = value;
}

export function createPresentationFxBridge({
  win = globalThis,
  getActive = () => null,
  loaderDelay = 220,
  surfaceDuration = 520,
} = {}) {
  let loaderTimer = null;
  let surfaceTimer = null;
  let scanTimer = null;
  let initialScanTimer = null;
  let initialScanAttempts = 0;
  let scanQueued = false;
  let disposed = false;
  let presentationHookInstalled = false;
  let releaseRuntimeHook = null;
  let legacyLoaderGuardTimer = null;

  function mark(value) {
    const html = win?.document?.documentElement;
    if (!html?.dataset) return;
    html.dataset.aoPresentationFx = value;
    html.dataset.aoPresentationFxOwner = PRESENTATION_FX_VERSION;
  }

  // Exact-donor rule: the v43.12 cinematic owner is semantic, not a generic
  // six-destination route animation. Callers must supply the donor-owned
  // meaning explicitly; ribbon navigation never synthesizes one from a surface.
  function showTransition(meta) {
    if (disposed || reducedMotion(win) || !meta || typeof meta !== "object") return false;
    const title = String(meta.title ?? "").trim();
    if (!title) return false;
    const cinema = legacyCinema(win);
    if (typeof cinema?.showTransition !== "function") {
      mark("legacy-cinema-unavailable");
      return false;
    }
    const payload = { kicker: String(meta.kicker ?? "AD ORIENTEM"), title };
    if (Number.isFinite(meta.hold)) payload.hold = Number(meta.hold);
    cinema.showTransition(payload);
    const html = win?.document?.documentElement;
    if (html?.dataset) html.dataset.aoPresentationFxTransition = String(meta.id ?? meta.kind ?? "semantic");
    mark("active");
    return true;
  }

  // Likewise, loader copy belongs to the actual workload (calendar resolution,
  // Scripture, week preparation, etc.), never to the destination name.
  function showLoader(spec) {
    if (disposed || reducedMotion(win) || !spec || typeof spec !== "object") return false;
    const title = String(spec.title ?? "").trim();
    if (!title) return false;
    const el = loaderElement(win);
    if (!el) return false;
    setText(el, "[data-ao-cinema-loader-title]", title);
    setText(el, "[data-ao-cinema-loader-sub]", String(spec.sub ?? ""));
    if (spec.kind) el.dataset.kind = String(spec.kind);
    el.classList?.add?.("aoCinemaLoaderOn");
    el.setAttribute?.("aria-hidden", "false");
    win?.AO_LOADING_DIRECTOR_V1?.adoptLegacy?.(spec.kind ?? "generic");
    return true;
  }

  function hideLoader() {
    if (loaderTimer != null && typeof win?.clearTimeout === "function") {
      win.clearTimeout(loaderTimer);
    }
    loaderTimer = null;
    const el = loaderElement(win);
    if (!el || el.dataset?.aoLoadingDirector === "active") return;
    win?.AO_LOADING_DIRECTOR_V1?.releaseLegacy?.();
    el.classList?.remove?.("aoCinemaLoaderOn");
    el.setAttribute?.("aria-hidden", "true");
  }

  function rootFor(surface) {
    const selector = SURFACE_ROOT[surface];
    if (!selector) return null;
    return win?.document?.querySelector?.(selector) ?? null;
  }

  function heroNodes(root, surface) {
    const selector = HERO_SELECTOR[surface];
    if (!root || !selector) return [];
    return [...(root.querySelectorAll?.(selector) ?? [])];
  }

  function prepHero(node, { force = false } = {}) {
    if (!node?.classList) return false;
    if (!force && node.dataset?.aoPresentationFxHero === PRESENTATION_FX_VERSION) return false;
    node.dataset.aoPresentationFxHero = PRESENTATION_FX_VERSION;
    if (reducedMotion(win)) {
      node.classList.remove("aoModularHeroIn");
      return true;
    }
    node.classList.remove("aoModularHeroIn");
    void node.offsetWidth;
    node.classList.add("aoModularHeroIn");
    return true;
  }

  function scanSurface(surface = getActive?.(), { forceHero = false } = {}) {
    if (disposed || !surface) return Object.freeze({ heroes: 0, art: 0 });
    const root = rootFor(surface);
    if (!root) return Object.freeze({ heroes: 0, art: 0 });
    ensureModularFxStyle(win);
    const heroes = heroNodes(root, surface);
    heroes.forEach(node => prepHero(node, { force: forceHero }));
    const legacyArtScan = typeof legacyCinema(win)?.scanArt === "function";
    legacyCinema(win)?.scanArt?.(root);
    root.dataset.aoPresentationFxHeroCount = String(heroes.length);
    root.dataset.aoPresentationFxArtScan = legacyArtScan ? "legacy-v4312" : "unavailable";
    return Object.freeze({ heroes: heroes.length, legacyArtScan });
  }

  function queueSurfaceScan() {
    if (disposed) return;
    if (!scanQueued && typeof win?.requestAnimationFrame === "function") {
      scanQueued = true;
      win.requestAnimationFrame(() => {
        scanQueued = false;
        scanSurface();
      });
    }
    if (scanTimer != null && typeof win?.clearTimeout === "function") win.clearTimeout(scanTimer);
    if (typeof win?.setTimeout === "function") {
      scanTimer = win.setTimeout(() => {
        scanTimer = null;
        scanSurface();
      }, 180);
    }
  }

  function scheduleInitialScan() {
    if (disposed) return false;
    initialScanAttempts += 1;
    const surface = getActive?.();
    const result = scanSurface(surface, { forceHero: true });
    if (result.heroes > 0 || initialScanAttempts >= 16) {
      initialScanTimer = null;
      return result.heroes > 0;
    }
    if (typeof win?.setTimeout === "function") {
      initialScanTimer = win.setTimeout(scheduleInitialScan, 120);
    }
    return false;
  }

  function presentationEvent() {
    queueSurfaceScan();
  }

  function installPresentationHook() {
    const doc = win?.document;
    if (presentationHookInstalled || !doc?.addEventListener) return false;
    presentationHookInstalled = true;
    for (const type of ["click", "change", "submit"]) doc.addEventListener(type, presentationEvent, true);
    return true;
  }

  function removePresentationHook() {
    const doc = win?.document;
    if (!presentationHookInstalled || !doc?.removeEventListener) return;
    for (const type of ["click", "change", "submit"]) doc.removeEventListener(type, presentationEvent, true);
    presentationHookInstalled = false;
  }

  function syncLegacyWorkloadLoader(next = runtimeState(win)) {
    const el = loaderElement(win);
    if (!el) return false;
    const active = getActive?.() ?? null;
    const allowed = Boolean(
      next?.scripture?.loading ||
      (next?.resolving && active === "calendar") ||
      el.dataset?.kind === "calendar-week" ||
      el.dataset?.aoLoadingDirector === "active"
    );
    if (allowed) return true;

    const clearIfStillBackground = () => {
      const current = runtimeState(win);
      const node = loaderElement(win);
      if (!node || node.dataset?.kind === "calendar-week" || node.dataset?.aoLoadingDirector === "active") return;
      if (current?.scripture?.loading) return;
      if (current?.resolving && getActive?.() === "calendar") return;
      node.classList?.remove?.("aoCinemaLoaderOn");
      node.setAttribute?.("aria-hidden", "true");
    };

    clearIfStillBackground();
    if (legacyLoaderGuardTimer != null && typeof win?.clearTimeout === "function") {
      win.clearTimeout(legacyLoaderGuardTimer);
    }
    if (typeof win?.setTimeout === "function") {
      // The embedded v43.12 donor schedules its legacy loader at 220 ms.
      // Correct it immediately afterwards when calendar resolution is background work.
      legacyLoaderGuardTimer = win.setTimeout(() => {
        legacyLoaderGuardTimer = null;
        clearIfStillBackground();
      }, 225);
    }
    return false;
  }

  function installRuntimeHook() {
    if (releaseRuntimeHook) return true;
    const subscribe = win?.AO_RUNTIME_V8?.store?.subscribe;
    if (typeof subscribe !== "function") return false;
    const release = subscribe.call(win.AO_RUNTIME_V8.store, next => {
      queueSurfaceScan();
      syncLegacyWorkloadLoader(next);
    });
    releaseRuntimeHook = typeof release === "function" ? release : () => {};
    syncLegacyWorkloadLoader(runtimeState(win));
    return true;
  }

  function removeRuntimeHook() {
    try { releaseRuntimeHook?.(); } catch {}
    releaseRuntimeHook = null;
  }

  function surfaceEntered(surface) {
    if (disposed) return false;
    const root = rootFor(surface);
    const html = win?.document?.documentElement;
    if (html?.dataset) html.dataset.aoPresentationFxSurface = surface;
    legacyCinema(win)?.queuePresentationScan?.();
    if (!root) return false;
    scanSurface(surface, { forceHero: true });

    root.dataset.aoPresentationFx = "entered";
    root.dataset.aoPresentationFxSurface = surface;

    if (reducedMotion(win)) {
      root.classList?.remove?.("aoModularSurfaceIn");
      return true;
    }

    ensureModularFxStyle(win);
    root.classList?.remove?.("aoModularSurfaceIn");
    // Reflow is intentional: restart a modular-safe opacity/filter entry without
    // transforming fixed surface geometry or covering the global ribbon.
    void root.offsetWidth;
    root.classList?.add?.("aoModularSurfaceIn");

    if (surfaceTimer != null && typeof win?.clearTimeout === "function") {
      win.clearTimeout(surfaceTimer);
    }
    if (typeof win?.setTimeout === "function") {
      surfaceTimer = win.setTimeout(() => {
        root.classList?.remove?.("aoModularSurfaceIn");
        surfaceTimer = null;
      }, surfaceDuration);
    }
    mark("active");
    return true;
  }

  async function navigate(surface, task) {
    if (typeof task !== "function") throw new TypeError("presentation FX navigation requires a task");
    // Deliberately no generic route transition or route loader here. The donor
    // fired full-screen cinematics only for semantic events and real workloads.
    const result = await task();
    if (result?.ok !== false) {
      const entered = result?.surface ?? surface;
      if (typeof win?.requestAnimationFrame === "function") {
        win.requestAnimationFrame(() => win.requestAnimationFrame(() => surfaceEntered(entered)));
      } else {
        surfaceEntered(entered);
      }
    }
    return result;
  }

  function status() {
    return Object.freeze({
      version: PRESENTATION_FX_VERSION,
      installed: !disposed,
      legacyCinematicOwner: legacyCinema(win)?.version ?? null,
      legacyCinematicAvailable: typeof legacyCinema(win)?.showTransition === "function",
      bootPresent: Boolean(win?.document?.getElementById?.("ao-cinema-boot")),
      transitionPresent: Boolean(win?.document?.getElementById?.("ao-cinema-transition")),
      loaderPresent: Boolean(loaderElement(win)),
      activeSurface: getActive?.() ?? null,
      reducedMotion: reducedMotion(win),
      routeTransitionPolicy: "SEMANTIC_ONLY",
      genericRouteLoader: false,
    });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    hideLoader();
    if (surfaceTimer != null && typeof win?.clearTimeout === "function") win.clearTimeout(surfaceTimer);
    if (scanTimer != null && typeof win?.clearTimeout === "function") win.clearTimeout(scanTimer);
    if (initialScanTimer != null && typeof win?.clearTimeout === "function") win.clearTimeout(initialScanTimer);
    if (legacyLoaderGuardTimer != null && typeof win?.clearTimeout === "function") win.clearTimeout(legacyLoaderGuardTimer);
    surfaceTimer = null;
    scanTimer = null;
    initialScanTimer = null;
    legacyLoaderGuardTimer = null;
    scanQueued = false;
    removePresentationHook();
    removeRuntimeHook();
    mark("disposed");
  }

  mark("installing");
  installPresentationHook();
  installRuntimeHook();
  if (typeof legacyCinema(win)?.showTransition === "function") mark("ready");
  else mark("legacy-cinema-unavailable");
  scheduleInitialScan();

  return Object.freeze({
    version: PRESENTATION_FX_VERSION,
    navigate,
    showTransition,
    showLoader,
    hideLoader,
    surfaceEntered,
    scanSurface,
    queueSurfaceScan,
    status,
    dispose,
  });
}
