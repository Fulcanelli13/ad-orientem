import { installNonMassConvergence } from "./nonmass-convergence.js";
import {
  NON_MASS_DONOR_CONTRACT,
  createAppHostAdapter,
  createAppShellController,
  normalizeAppSurface,
  surfaceForCoreRoute,
} from "./index.js";

export const VERSION = "final-app-shell-bridge-v1";

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
      installNonMassConvergence({ win });
      setDataset("ready");
    } catch {
      state.blocked = true;
      setDataset("blocked");
    }
  }

  const api = Object.freeze({
    version: VERSION,
    passive: true,
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
        passive: true,
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
        nonMassConvergence: win?.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.() ?? null,
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
