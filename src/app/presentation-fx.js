export const PRESENTATION_FX_VERSION = "modular-presentation-fx-v1";

const SURFACE_META = Object.freeze({
  home: Object.freeze({ kicker: "AD ORIENTEM", en: "Home", fr: "Accueil" }),
  mass: Object.freeze({ kicker: "AD ORIENTEM", en: "Mass", fr: "Messe" }),
  pray: Object.freeze({ kicker: "PRAY", en: "Prayer", fr: "Prière" }),
  learn: Object.freeze({ kicker: "FORMATION", en: "Learn", fr: "Apprendre" }),
  calendar: Object.freeze({ kicker: "SACRED TIME", en: "Calendar", fr: "Calendrier" }),
  settings: Object.freeze({ kicker: "AD ORIENTEM", en: "Settings", fr: "Réglages" }),
});

const SURFACE_ROOT = Object.freeze({
  home: ".homeScreen",
  mass: "#ao-r17-native-reader-preview, #ao-mass-flow-v1 .aoMassFlowBackdrop",
  pray: "#aoPray435930",
  learn: "#ao-learn-modular-root",
  calendar: "#ao-calendar-modular-root",
  settings: "#ao-settings-modular-root",
});

function runtimeState(win) {
  return win?.AO_RUNTIME_V8?.store?.getState?.() ?? null;
}

function isFrench(win) {
  return runtimeState(win)?.language === "fr";
}

function labelFor(win, surface) {
  const meta = SURFACE_META[surface] ?? SURFACE_META.home;
  return {
    kicker: meta.kicker,
    title: isFrench(win) ? meta.fr : meta.en,
  };
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
  let disposed = false;

  function mark(value) {
    const html = win?.document?.documentElement;
    if (!html?.dataset) return;
    html.dataset.aoPresentationFx = value;
    html.dataset.aoPresentationFxOwner = PRESENTATION_FX_VERSION;
  }

  function showTransition(surface) {
    if (disposed || reducedMotion(win)) return false;
    const cinema = legacyCinema(win);
    if (typeof cinema?.showTransition !== "function") {
      mark("legacy-cinema-unavailable");
      return false;
    }
    cinema.showTransition(labelFor(win, surface));
    const html = win?.document?.documentElement;
    if (html?.dataset) html.dataset.aoPresentationFxTransition = surface;
    mark("active");
    return true;
  }

  function showLoader(surface) {
    if (disposed || reducedMotion(win)) return false;
    const el = loaderElement(win);
    if (!el) return false;
    const meta = labelFor(win, surface);
    setText(el, "[data-ao-cinema-loader-title]", isFrench(win) ? "Ouverture…" : "Opening…");
    setText(
      el,
      "[data-ao-cinema-loader-sub]",
      isFrench(win) ? `Préparation de ${meta.title}` : `Preparing ${meta.title}`,
    );
    el.classList?.add?.("aoCinemaLoaderOn");
    el.setAttribute?.("aria-hidden", "false");
    return true;
  }

  function hideLoader() {
    if (loaderTimer != null && typeof win?.clearTimeout === "function") {
      win.clearTimeout(loaderTimer);
    }
    loaderTimer = null;
    const el = loaderElement(win);
    if (!el) return;
    el.classList?.remove?.("aoCinemaLoaderOn");
    el.setAttribute?.("aria-hidden", "true");
  }

  function rootFor(surface) {
    const selector = SURFACE_ROOT[surface];
    if (!selector) return null;
    return win?.document?.querySelector?.(selector) ?? null;
  }

  function surfaceEntered(surface) {
    if (disposed) return false;
    const root = rootFor(surface);
    const html = win?.document?.documentElement;
    if (html?.dataset) html.dataset.aoPresentationFxSurface = surface;
    legacyCinema(win)?.queuePresentationScan?.();
    if (!root) return false;

    root.dataset.aoPresentationFx = "entered";
    root.dataset.aoPresentationFxSurface = surface;

    if (reducedMotion(win)) {
      root.classList?.remove?.("aoCinemaSurfaceIn");
      return true;
    }

    root.classList?.remove?.("aoCinemaSurfaceIn");
    // Reflow is intentional: it restarts the inherited v43.12 surface-entry keyframe.
    void root.offsetWidth;
    root.classList?.add?.("aoCinemaSurfaceIn");

    if (surfaceTimer != null && typeof win?.clearTimeout === "function") {
      win.clearTimeout(surfaceTimer);
    }
    if (typeof win?.setTimeout === "function") {
      surfaceTimer = win.setTimeout(() => {
        root.classList?.remove?.("aoCinemaSurfaceIn");
        surfaceTimer = null;
      }, surfaceDuration);
    }
    mark("active");
    return true;
  }

  async function navigate(surface, task) {
    if (typeof task !== "function") throw new TypeError("presentation FX navigation requires a task");
    const current = getActive?.();
    if (surface !== current) showTransition(surface);

    hideLoader();
    if (!reducedMotion(win) && typeof win?.setTimeout === "function") {
      loaderTimer = win.setTimeout(() => showLoader(surface), loaderDelay);
    }

    try {
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
    } finally {
      hideLoader();
    }
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
    });
  }

  function dispose() {
    if (disposed) return;
    disposed = true;
    hideLoader();
    if (surfaceTimer != null && typeof win?.clearTimeout === "function") win.clearTimeout(surfaceTimer);
    surfaceTimer = null;
    mark("disposed");
  }

  mark("installing");
  if (typeof legacyCinema(win)?.showTransition === "function") mark("ready");
  else mark("legacy-cinema-unavailable");

  return Object.freeze({
    version: PRESENTATION_FX_VERSION,
    navigate,
    showTransition,
    showLoader,
    hideLoader,
    surfaceEntered,
    status,
    dispose,
  });
}
