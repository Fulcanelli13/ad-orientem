// Browser bridge for landing the R17 Mass engine in the existing monolithic app.
// The existing GitHub shell, preflight, Proper resolver and live DOM remain host-owned.
// This module intercepts only the final Start Mass action at the window capture phase,
// validates/compiles the session through R17, then delegates the current live renderer.

import { createMassEntryController } from "./app-shell-bootstrap.js";

export const VERSION = "r17-browser-entry-v1";
const ACTIVE_KEY = "ao-r17-active-mass-v1";

export function mapLegacyFollowMode(value) {
  const raw = String(value ?? "vox").toLowerCase();
  if (raw === "missal" || raw === "read") return "MISSAL";
  if (raw === "simple") return "SIMPLE";
  return "LIVE";
}

export function mapInsertedRites(values = []) {
  const precedingRites = [];
  const followingActions = [];
  const add = (arr, value) => { if (!arr.includes(value)) arr.push(value); };
  for (const item of values ?? []) {
    const raw = String(item ?? "").toUpperCase().replace(/[ -]+/g, "_");
    if (raw.includes("ASPERGES")) add(precedingRites, "ASPERGES");
    if (raw.includes("PALM")) add(precedingRites, "PALM");
    if (raw.includes("ASH")) add(precedingRites, "ASH");
    if (raw.includes("CANDLEMAS") || raw.includes("CANDLE")) add(precedingRites, "CANDLEMAS");
    if (raw.includes("ROGATION") || raw.includes("LITAN")) add(precedingRites, "ROGATIONS");
    if (raw.includes("REQUIEM") && raw.includes("ABSOLUTION")) add(followingActions, "REQUIEM_ABSOLUTION");
    if (raw.includes("HOLY_THURSDAY") || raw.includes("ALTAR_REPOSE")) add(followingActions, "HOLY_THURSDAY_POST");
    if (raw.includes("CORPUS") && raw.includes("PROCESSION")) add(followingActions, "CORPUS_CHRISTI_PROCESSION");
    else if (raw.includes("PROCESSION")) add(followingActions, "GENERIC_PROCESSION");
  }
  return Object.freeze({
    precedingRites: Object.freeze(precedingRites),
    followingActions: Object.freeze(followingActions),
  });
}

export function deriveHostOptions({ resolvedMass, assemblyStatus, arch, runtimeState } = {}) {
  if (!resolvedMass || typeof resolvedMass !== "object") {
    throw new TypeError("ResolvedMass required for R17 browser bridge");
  }
  if (assemblyStatus && assemblyStatus.ok === false) {
    throw new Error(assemblyStatus.reason || "Legacy preflight is not startable");
  }
  const rites = mapInsertedRites(resolvedMass.insertedRites ?? []);
  return Object.freeze({
    proper: assemblyStatus?.proper ?? null,
    celebrationForm: arch?.celebrationForm ?? runtimeState?.settings?.massForm ?? "sung",
    presentationMode: mapLegacyFollowMode(arch?.followMode ?? runtimeState?.settings?.followMode),
    precedingRites: rites.precedingRites,
    followingActions: rites.followingActions,
    localProfile: runtimeState?.settings?.localMassProfile ?? null,
  });
}

function runtime() { return globalThis.AO_RUNTIME_V8 ?? null; }
function runtimeState() { return runtime()?.store?.getState?.() ?? null; }
function arch() { return globalThis.AO_CELEBRATION_ARCH_V1 ?? null; }
function legacyBridge() { return globalThis.AO_SEQUENCE_BRIDGE_V23 ?? globalThis.AO_SEQUENCE_BRIDGE_V22 ?? null; }
function celebrationApi() { return globalThis.AO_CELEBRATION_API ?? null; }

function readerPreferences() {
  const a = arch();
  const state = runtimeState();
  const settings = state?.settings ?? {};
  return {
    mode: mapLegacyFollowMode(a?.followMode ?? settings.followMode),
    postureProfile: settings.massPostureProfile ?? "FOLLOW_CONGREGATION",
    gestureProfile: settings.massGestureProfile ?? "GUIDED_1962",
    language: state?.language ?? "vernacular",
    localPostures: settings.localMassPostures ?? {},
  };
}

function statusSnapshot() {
  const bridge = legacyBridge();
  if (typeof bridge?.getAssemblyStatus === "function") return bridge.getAssemblyStatus();
  return null;
}

function persistPrepared(prepared) {
  globalThis.AO_R17_ACTIVE_MASS = prepared;
  try {
    localStorage.setItem(ACTIVE_KEY, JSON.stringify({
      schema: prepared?.schema ?? null,
      session: prepared?.session ?? null,
      readerPreferences: prepared?.readerPreferences ?? null,
      storedAt: new Date().toISOString(),
    }));
  } catch {}
  document.documentElement.dataset.aoMassEngine = "r17-validated-legacy-ui";
}

async function delegateLegacyRenderer(prepared) {
  persistPrepared(prepared);
  const bridge = legacyBridge();
  if (typeof bridge?.startLive !== "function") {
    throw new Error("Legacy live renderer bridge is unavailable");
  }
  await Promise.resolve(bridge.startLive());
  const legacyActive = bridge.getActive?.() ?? globalThis.AO_ACTIVE_MASS_SESSION ?? null;
  globalThis.AO_R17_MASS_RUNTIME = Object.freeze({
    version: VERSION,
    prepared,
    legacyActive,
    uiOwner: "LEGACY_DOM_TEMPORARY",
    canonicalOwner: "R17_SESSION_ENGINE",
  });
}

export function createBrowserMassController() {
  const api = celebrationApi();
  if (!api?.getResolvedMass) throw new Error("AO_CELEBRATION_API is not ready");
  return createMassEntryController({
    celebrationApi: api,
    readReaderPreferences: () => readerPreferences(),
    resolveHostOptions: (resolvedMass) => deriveHostOptions({
      resolvedMass,
      assemblyStatus: statusSnapshot(),
      arch: arch(),
      runtimeState: runtimeState(),
    }),
    openReader: delegateLegacyRenderer,
  });
}

function showFailure(error, button = null) {
  console.error("R17 Mass entry blocked", error);
  document.documentElement.dataset.aoMassEngine = "r17-entry-blocked";
  const message = String(error?.message ?? error ?? "R17 Mass entry failed");
  if (button) {
    button.disabled = false;
    button.dataset.aoR17Error = "true";
    button.title = message;
  }
  const host = document.getElementById("ao-mass-flow-v1");
  if (host) {
    let note = host.querySelector(".aoR17EntryError");
    if (!note) {
      note = document.createElement("div");
      note.className = "aoBridgeNote aoR17EntryError";
      host.querySelector(".aoFlowActions")?.insertAdjacentElement("afterend", note);
    }
    note.textContent = message;
  }
}

export function installBrowserMassBridge({ pollMs = 80, maxPolls = 150 } = {}) {
  if (globalThis.AO_R17_BROWSER_ENTRY?.installed) return globalThis.AO_R17_BROWSER_ENTRY;
  const state = { installed: false, polls: 0, controller: null };

  function tryInstall() {
    state.polls += 1;
    if (!celebrationApi()?.getResolvedMass || !legacyBridge()?.startLive || !runtime()?.store) {
      if (state.polls < maxPolls) setTimeout(tryInstall, pollMs);
      return;
    }
    try {
      state.controller = createBrowserMassController();
      state.installed = true;
      document.documentElement.dataset.aoR17MassBridge = "ready";
    } catch (error) {
      document.documentElement.dataset.aoR17MassBridge = "blocked";
      console.error(error);
    }
  }

  // Window capture runs before the legacy document-capture listener.
  // We only take ownership of the final Start Mass button once the controller is ready.
  window.addEventListener("click", (event) => {
    const button = event.target?.closest?.("[data-ao-start-live]");
    if (!button || !state.installed || !state.controller) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    button.disabled = true;
    delete button.dataset.aoR17Error;
    void state.controller.enter()
      .catch((error) => showFailure(error, button))
      .finally(() => { if (button.isConnected) button.disabled = false; });
  }, true);

  globalThis.AO_R17_BROWSER_ENTRY = Object.freeze({
    version: VERSION,
    get installed() { return state.installed; },
    get polls() { return state.polls; },
    prepare: () => state.controller?.prepare?.(),
    enter: () => state.controller?.enter?.(),
    status: () => Object.freeze({
      installed: state.installed,
      polls: state.polls,
      hostApi: Boolean(celebrationApi()?.getResolvedMass),
      legacyRenderer: Boolean(legacyBridge()?.startLive),
      runtime: Boolean(runtime()?.store),
      active: globalThis.AO_R17_ACTIVE_MASS ?? null,
    }),
  });

  tryInstall();
  return globalThis.AO_R17_BROWSER_ENTRY;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => installBrowserMassBridge(), { once: true });
  } else {
    installBrowserMassBridge();
  }
}
