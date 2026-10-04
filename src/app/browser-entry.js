import {
  NON_MASS_DONOR_CONTRACT,
  createAppHostAdapter,
  createAppShellController,
  normalizeAppSurface,
  surfaceForCoreRoute,
} from "./index.js";

export const VERSION = "final-app-shell-bridge-v2";
const DONOR_RIBBON_ATTR = "data-ao-ribbon";
const APP_RIBBON_ATTR = "data-ao-app-surface";

function ready(win) {
  return Boolean(
    win?.AO_RUNTIME_V8?.store &&
    typeof win?.AO_NAV_V362?.home === "function" &&
    typeof win?.AO_V37_SHELL?.openDomain === "function"
  );
}

function initialSurface(win, host) {
  try {
    const ribbon = normalizeAppSurface(win?.AO_GLOBAL_RIBBON_V4323?.getActive?.());
    if (ribbon) return ribbon;
  } catch {}
  return surfaceForCoreRoute(host.currentCoreRoute?.(), "home");
}

function visibleRibbon(win) {
  return win?.document?.getElementById?.("ao-global-ribbon") ?? null;
}

export function adoptVisibleRibbon({
  win = globalThis,
  navigate,
  getActive,
  observeSurface,
} = {}) {
  const nav = visibleRibbon(win);
  if (!nav || typeof navigate !== "function") {
    return Object.freeze({
      owned: false,
      neutralized: false,
      syncActive() {},
      dispose() {},
    });
  }

  let disposed = false;
  let observer = null;

  function syncActive() {
    if (disposed) return;
    const active = normalizeAppSurface(getActive?.()) ?? "home";
    for (const button of nav.querySelectorAll?.(`[${APP_RIBBON_ATTR}]`) ?? []) {
      const surface = normalizeAppSurface(button.getAttribute?.(APP_RIBBON_ATTR));
      const selected = surface === active;
      button.classList?.toggle?.("active", selected);
      button.setAttribute?.("aria-current", selected ? "page" : "false");
    }
  }

  function adoptButtons() {
    if (disposed) return 0;
    let adopted = 0;
    for (const button of nav.querySelectorAll?.(`[${DONOR_RIBBON_ATTR}]`) ?? []) {
      const surface = normalizeAppSurface(button.getAttribute?.(DONOR_RIBBON_ATTR));
      if (!surface) continue;
      button.setAttribute?.(APP_RIBBON_ATTR, surface);
      button.removeAttribute?.(DONOR_RIBBON_ATTR);
      adopted += 1;
    }
    nav.setAttribute?.("data-ao-app-owner", "modular");
    if (win?.document?.documentElement?.dataset) {
      win.document.documentElement.dataset.aoAppShellOwner = "modular";
    }
    syncActive();
    return adopted;
  }

  function onClick(event) {
    const target = event?.target;
    const button = target?.closest?.(`[${APP_RIBBON_ATTR}]`);
    if (button && nav.contains?.(button)) {
      const surface = normalizeAppSurface(button.getAttribute?.(APP_RIBBON_ATTR));
      if (!surface) return;
      event.preventDefault?.();
      event.stopPropagation?.();
      void Promise.resolve(navigate(surface)).finally(syncActive);
      return;
    }

    // The donor still owns deep non-Mass presentation during extraction.
    // Mirror its internal launcher/home signals into the modular shell state so
    // a donor re-render cannot make the visible ribbon drift from app state.
    const domain = target?.closest?.("[data-v37-domain]")?.getAttribute?.("data-v37-domain");
    if (domain) {
      observeSurface?.(domain === "today" ? "home" : domain);
      return;
    }
    const moduleId = target?.closest?.("[data-v37-open]")?.getAttribute?.("data-v37-open");
    if (moduleId === "today.calendar") {
      observeSurface?.("calendar");
      return;
    }
    if (moduleId === "utility.settings") {
      observeSurface?.("settings");
      return;
    }
    if (target?.closest?.("[data-app-home]")) observeSurface?.("home");
  }

  win?.addEventListener?.("click", onClick, { capture: true });

  const MutationObserverCtor = win?.MutationObserver;
  if (typeof MutationObserverCtor === "function") {
    observer = new MutationObserverCtor(() => adoptButtons());
    observer.observe(nav, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: [DONOR_RIBBON_ATTR],
    });
  }

  adoptButtons();

  return Object.freeze({
    owned: true,
    get neutralized() {
      return !nav.querySelector?.(`[${DONOR_RIBBON_ATTR}]`);
    },
    syncActive,
    dispose() {
      if (disposed) return;
      disposed = true;
      observer?.disconnect?.();
      win?.removeEventListener?.("click", onClick, { capture: true });
    },
  });
}

export function installAppShellBridge({
  win = globalThis,
  pollMs = 80,
  maxPolls = 150,
} = {}) {
  if (win?.AO_APP_SHELL_V1) return win.AO_APP_SHELL_V1;

  const state = {
    polls: 0,
    controller: null,
    host: null,
    blocked: false,
    ribbonOwner: null,
    unsubscribeSurface: null,
  };

  function setDataset(value) {
    if (win?.document?.documentElement?.dataset) {
      win.document.documentElement.dataset.aoAppShellBridge = value;
    }
  }

  function ownVisibleRibbon() {
    state.ribbonOwner?.dispose?.();
    state.ribbonOwner = adoptVisibleRibbon({
      win,
      navigate: (surface) => state.controller?.go?.(surface),
      getActive: () => state.controller?.getActive?.(),
      observeSurface: (surface) => state.controller?.setActive?.(surface),
    });
    state.unsubscribeSurface?.();
    state.unsubscribeSurface = state.controller?.subscribe?.(() => {
      state.ribbonOwner?.syncActive?.();
    }) ?? null;
  }

  function tryInstall() {
    state.polls += 1;
    if (!ready(win)) {
      if (state.polls < maxPolls && typeof win?.setTimeout === "function") {
        win.setTimeout(tryInstall, pollMs);
      } else {
        state.blocked = true;
        setDataset("blocked");
      }
      return;
    }

    try {
      state.host = createAppHostAdapter(win);
      state.controller = createAppShellController({
        host: state.host,
        initialSurface: initialSurface(win, state.host),
      });
      ownVisibleRibbon();
      setDataset("ready");
    } catch {
      state.blocked = true;
      setDataset("blocked");
    }
  }

  const api = Object.freeze({
    version: VERSION,
    passive: false,
    contract: NON_MASS_DONOR_CONTRACT,
    get installed() { return Boolean(state.controller); },
    get polls() { return state.polls; },
    navigate(surface) {
      if (!state.controller) {
        return Promise.resolve(Object.freeze({
          ok: false,
          surface: null,
          reason: state.blocked ? "APP_SHELL_BLOCKED" : "APP_SHELL_NOT_READY",
        }));
      }
      return state.controller.go(surface);
    },
    getActive() {
      return state.controller?.getActive?.() ?? null;
    },
    status() {
      return Object.freeze({
        installed: Boolean(state.controller),
        passive: false,
        polls: state.polls,
        blocked: state.blocked,
        active: state.controller?.getActive?.() ?? null,
        visibleRibbonOwned: Boolean(state.ribbonOwner?.owned),
        legacyRibbonClickNeutralized: Boolean(state.ribbonOwner?.neutralized),
        homeOwner: typeof win?.AO_NAV_V362?.home === "function",
        domainOwner: typeof win?.AO_V37_SHELL?.openDomain === "function",
        settingsOwner: Boolean(
          win?.AO_SETTINGS_V4359 ??
          win?.AO_SETTINGS_V4358 ??
          win?.AO_SETTINGS_V4356
        ),
        prayerOwner: Boolean(win?.AO_PRAY_V435930),
        massOwner: Boolean(win?.AO_R17_BROWSER_ENTRY),
        legacyRibbonPresent: Boolean(win?.AO_GLOBAL_RIBBON_V4323),
      });
    },
  });

  win.AO_APP_SHELL_V1 = api;
  setDataset("installing");
  tryInstall();
  return api;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => installAppShellBridge(), { once: true });
  } else {
    installAppShellBridge();
  }
}
