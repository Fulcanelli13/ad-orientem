import {
  APP_SURFACES,
  NON_MASS_DONOR_CONTRACT,
  createAppHostAdapter,
  createAppShellController,
  normalizeAppSurface,
  surfaceForCoreRoute,
} from "./index.js";

export const VERSION = "final-app-shell-owner-v2";

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

function releaseBootInteractionShield(doc) {
  const boot = doc?.getElementById?.("ao-cinema-boot");
  if (!boot) return false;
  try {
    boot.style?.setProperty?.("pointer-events", "none", "important");
    boot.inert = true;
    if (boot.dataset) {
      boot.dataset.aoInteractionOwner = "AO_APP_SHELL_V1";
      boot.dataset.aoInteractionShield = "released";
    }
    return true;
  } catch {
    return false;
  }
}

function installVisibleRibbonOwner(win, controller, state) {
  const doc = win?.document;
  if (!doc?.getElementById || !controller) return () => {};

  let nav = null;
  let observer = null;
  let disposed = false;
  const cleanups = [];

  function paintActive() {
    if (!nav?.querySelectorAll) return;
    const active = controller.getActive?.();
    for (const button of nav.querySelectorAll("[data-ao-app-surface]")) {
      const current = button.dataset?.aoAppSurface === active;
      button.classList?.toggle?.("active", current);
      button.setAttribute?.("aria-current", current ? "page" : "false");
    }
  }

  function adopt() {
    if (disposed) return false;
    nav = doc.getElementById("ao-global-ribbon");
    if (!nav?.querySelectorAll) return false;

    nav.dataset.aoOwner = "AO_APP_SHELL_V1";
    nav.dataset.aoVisibleShell = "modular";

    let adopted = 0;
    for (const button of nav.querySelectorAll("[data-ao-ribbon], [data-ao-app-surface]")) {
      const surface = normalizeAppSurface(
        button.dataset?.aoAppSurface ?? button.dataset?.aoRibbon
      );
      if (!surface) continue;
      button.dataset.aoAppSurface = surface;
      button.removeAttribute?.("data-ao-ribbon");
      adopted += 1;
    }

    state.visibleOwner = adopted === APP_SURFACES.length;
    if (state.visibleOwner) {
      state.bootInteractionReleased = releaseBootInteractionShield(doc) || state.bootInteractionReleased;
    }
    if (doc.documentElement?.dataset) {
      doc.documentElement.dataset.aoAppShellOwner = state.visibleOwner
        ? "AO_APP_SHELL_V1"
        : "partial";
    }
    paintActive();
    return state.visibleOwner;
  }

  function onRibbonClick(event) {
    const button = event.target?.closest?.("[data-ao-app-surface]");
    if (!button || !nav?.contains?.(button)) return;
    const surface = normalizeAppSurface(button.dataset?.aoAppSurface);
    if (!surface) return;
    event.preventDefault?.();
    event.stopPropagation?.();
    void controller.go(surface);
  }

  function syncExternalNavigation(event) {
    const domain = event.target?.closest?.("[data-v37-domain]");
    if (domain) {
      controller.setActive?.(
        domain.dataset?.v37Domain === "today" ? "home" : domain.dataset?.v37Domain
      );
      return;
    }
    const module = event.target?.closest?.("[data-v37-open]");
    if (module?.dataset?.v37Open === "today.calendar") {
      controller.setActive?.("calendar");
      return;
    }
    if (module?.dataset?.v37Open === "utility.settings") {
      controller.setActive?.("settings");
      return;
    }
    if (event.target?.closest?.("[data-app-home]")) controller.setActive?.("home");
  }

  if (adopt()) {
    nav.addEventListener?.("click", onRibbonClick);
    cleanups.push(() => nav?.removeEventListener?.("click", onRibbonClick));
  }

  const unsubscribe = controller.subscribe?.(() => {
    adopt();
    paintActive();
  });
  if (typeof unsubscribe === "function") cleanups.push(unsubscribe);

  doc.addEventListener?.("click", syncExternalNavigation, { capture: true });
  cleanups.push(() => doc.removeEventListener?.("click", syncExternalNavigation, { capture: true }));

  if (typeof win?.MutationObserver === "function" && nav) {
    observer = new win.MutationObserver(() => {
      adopt();
    });
    observer.observe(nav, { childList: true, subtree: true, attributes: true, attributeFilter: ["data-ao-ribbon"] });
    cleanups.push(() => observer?.disconnect?.());
  }

  return () => {
    disposed = true;
    for (const cleanup of cleanups.splice(0)) {
      try { cleanup(); } catch {}
    }
  };
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
    visibleOwner: false,
    bootInteractionReleased: false,
    disposeVisibleOwner: null,
  };

  function setDataset(value) {
    if (win?.document?.documentElement?.dataset) {
      win.document.documentElement.dataset.aoAppShellBridge = value;
    }
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
      state.disposeVisibleOwner = installVisibleRibbonOwner(win, state.controller, state);
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
      const nav = win?.document?.getElementById?.("ao-global-ribbon");
      return Object.freeze({
        installed: Boolean(state.controller),
        passive: false,
        visibleOwner: state.visibleOwner,
        bootInteractionReleased: state.bootInteractionReleased,
        ribbonOwner: nav?.dataset?.aoOwner ?? null,
        legacyRibbonButtons: nav?.querySelectorAll?.("[data-ao-ribbon]")?.length ?? null,
        modularRibbonButtons: nav?.querySelectorAll?.("[data-ao-app-surface]")?.length ?? null,
        polls: state.polls,
        blocked: state.blocked,
        active: state.controller?.getActive?.() ?? null,
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
