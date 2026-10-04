import { NON_MASS_DONOR_CONTRACT } from "./contracts.js";

function settingsApi(win) {
  return (
    win?.AO_SETTINGS_V4359 ??
    win?.AO_SETTINGS_V4358 ??
    win?.AO_SETTINGS_V4356 ??
    null
  );
}

function settingsState(api) {
  try {
    return typeof api?.state === "function" ? api.state() : api?.state ?? null;
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

    subscribeCoreRoute(listener) {
      const store = runtime()?.store;
      if (typeof store?.subscribe !== "function") return () => {};
      return store.subscribe((state) => listener(state?.route ?? null, state));
    },

    hardHome() {
      const nav = win?.AO_NAV_V362;
      if (typeof nav?.home !== "function") return false;
      nav.home();
      return true;
    },

    openDomain(domain) {
      if (!new Set(["mass", "pray", "learn"]).has(domain)) return false;
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
      return this.openModule(NON_MASS_DONOR_CONTRACT.calendarModuleId);
    },

    openSettings() {
      const api = settingsApi(win);
      if (typeof api?.open === "function") {
        api.open();
        return true;
      }
      const legacy = shell();
      if (typeof legacy?.openModule === "function") {
        void legacy.openModule("utility.settings");
        return true;
      }
      return false;
    },

    settingsOpen() {
      return Boolean(settingsState(settingsApi(win))?.navigation?.open);
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
