import { NON_MASS_DONOR_CONTRACT } from "./contracts.js";

function settingsApi(win) {
  return win?.AO_SETTINGS_APP_V1 ?? null;
}

function settingsStatus(api) {
  try {
    return typeof api?.status === "function" ? api.status() : null;
  } catch {
    return null;
  }
}

function language(win) {
  return win?.AO_RUNTIME_V8?.store?.getState?.()?.language === "fr" ? "fr" : "en";
}

export function createAppHostAdapter(win = globalThis) {
  const runtime = () => win?.AO_RUNTIME_V8 ?? null;
  const shell = () => win?.AO_V37_SHELL ?? null;

  return Object.freeze({
    currentCoreRoute() {
      return runtime()?.store?.getState?.()?.route ?? null;
    },

    liveMassActive() {
      return Boolean(
        runtime()?.store?.getState?.()?.route === "live" ||
        win?.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected
      );
    },

    hasResumableMass() {
      const mass = win?.AO_R17_BROWSER_ENTRY;
      return Boolean(
        typeof mass?.hasResumable === "function" &&
        mass.hasResumable()
      );
    },

    subscribeCoreRoute(listener) {
      const store = runtime()?.store;
      if (typeof store?.subscribe !== "function") return () => {};
      return store.subscribe((state) => listener(state?.route ?? null, state));
    },

    hardHome() {
      // Close modular domain presentations before mounting Home. These owners
      // are deliberately independent of the historical hard-Home reset.
      try { win?.AO_LEARN_APP_V1?.close?.(); } catch {}
      try { win?.AO_PRAY_APP_V1?.close?.(); } catch {}
      try { win?.AO_CALENDAR_APP_V1?.close?.({ surface: "home" }); } catch {}
      try { win?.AO_FIND_APP_V1?.close?.(); } catch {}
      const modular = win?.AO_HOME_APP_V1;
      if (typeof modular?.open === "function") {
        const opened = modular.open();
        if (opened !== false) return true;
      }
      const nav = win?.AO_NAV_V362;
      if (typeof nav?.home !== "function") return false;
      nav.home();
      return true;
    },

    openDomain(domain) {
      if (!new Set(["mass", "pray", "learn", "find"]).has(domain)) return false;
      if (domain === "mass") {
        const mass = win?.AO_R17_BROWSER_ENTRY;
        if (typeof mass?.hasResumable === "function" && mass.hasResumable()) {
          if (typeof mass?.resume !== "function") return false;
          return Promise.resolve(mass.resume()).then((result) => result?.ok !== false);
        }
        const celebration = win?.AO_CELEBRATION_API;
        if (typeof celebration?.openPreflight !== "function") return false;
        // Fresh Mass entry belongs to the resolved-celebration preflight.
        // Do not fall through to the historical V37 Mass domain.
        return Promise.resolve(celebration.openPreflight()).then((result) => result !== false);
      }
      if (domain === "pray") {
        const modular = win?.AO_PRAY_APP_V1;
        if (typeof modular?.open !== "function") return false;
        // PRAY has a modular final presentation owner. Never fall back to the
        // obsolete PrayerBook surface if that owner cannot open.
        return Promise.resolve(modular.open()).then((opened) => opened !== false);
      }
      if (domain === "find") {
        const modular = win?.AO_FIND_APP_V1;
        if (typeof modular?.open !== "function") return false;
        return Promise.resolve(modular.open()).then((opened) => opened !== false);
      }
      if (domain === "learn") {
        const modular = win?.AO_LEARN_APP_V1;
        if (typeof modular?.open !== "function") return false;
        // Learn is fail-closed once extracted: the historical V37 domain shell
        // is donor evidence, not a production fallback.
        return Promise.resolve(modular.open()).then((opened) => opened !== false);
      }
      const api = shell();
      if (typeof api?.openDomain !== "function") return false;
      return api.openDomain(domain) !== false;
    },

    async openModule(moduleId, options = {}) {
      const api = shell();
      if (typeof api?.openModule !== "function") return false;
      const result = await api.openModule(moduleId, options);
      return result?.ok !== false && result !== false;
    },

    async openCalendar() {
      const modular = win?.AO_CALENDAR_APP_V1;
      if (typeof modular?.open === "function") {
        const opened = await Promise.resolve(modular.open());
        if (opened !== false) return true;
      }
      return this.openModule(NON_MASS_DONOR_CONTRACT.calendarModuleId);
    },

    openSettings() {
      // Settings is modular and fail-closed. Close Learn before mounting the
      // Settings overlay so only one non-Mass state owns the visible surface.
      try { win?.AO_LEARN_APP_V1?.close?.(); } catch {}
      try { win?.AO_FIND_APP_V1?.close?.(); } catch {}
      const api = settingsApi(win);
      if (typeof api?.open !== "function") return false;
      return api.open() !== false;
    },

    settingsOpen() {
      return Boolean(settingsStatus(settingsApi(win))?.open);
    },

    dismissSettings() {
      const api = settingsApi(win);
      if (!api) return false;
      if (!this.settingsOpen()) return true;
      if (typeof api.dismiss === "function") {
        api.dismiss();
        return true;
      }
      if (typeof api.close === "function") {
        api.close();
        return true;
      }
      return false;
    },

    restoreSettingsHome() {
      const api = settingsApi(win);
      if (typeof api?.restoreHome !== "function") return false;
      api.restoreHome();
      return true;
    },

    leaveLiveMass() {
      const mass = win?.AO_R17_BROWSER_ENTRY;
      if (typeof mass?.suspend === "function") {
        return mass.suspend() !== false;
      }
      const native = win?.AO_R17_NATIVE_READER_PREVIEW;
      if (typeof native?.destroy === "function") {
        native.destroy();
        return true;
      }
      const root = win?.document?.getElementById?.("ao-r17-native-reader-preview") ?? null;
      if (!root) return true;
      return false;
    },

    confirmLeaveLiveMass() {
      if (typeof win?.confirm !== "function") return false;
      const fr = language(win) === "fr";
      return Boolean(
        win.confirm(
          fr
            ? "La Messe est en cours. Quitter le suivi de la Messe ? Votre place sera enregistrée."
            : "Mass is in progress. Leave the Mass follower? Your place will be saved.",
        ),
      );
    },

    defer(task) {
      return new Promise((resolve, reject) => {
        const run = () => {
          try {
            resolve(task());
          } catch (error) {
            reject(error);
          }
        };
        if (typeof win?.setTimeout === "function") win.setTimeout(run, 0);
        else queueMicrotask(run);
      });
    },
  });
}
