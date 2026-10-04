// Final browser bridge for the modular Mass engine.
// The host still owns calendar/celebration preflight and Proper resolution.
// The native reader owns the production Mass surface. Legacy is explicit rollback only.

import { installAppShellBridge } from "../app/browser-entry.js";
import { createMassEntryController } from "./app-shell-bootstrap.js";
import { readBrowserReaderUiMode, readerModeRunsShadowAudit, readerModeMountsPreview } from "./reader-gate.js";
import { runReaderShadowAudit } from "./reader-shadow.js";
import { mountNativeReaderPreview } from "./reader-native-preview.js";
import { createHostIconResolver, auditHostIconBank } from "./reader-icons.js";
import { installShellFocusVisibilityGuard } from "../app/shell-focus-visibility.js";

export const VERSION = "final-browser-entry-v1";
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
    throw new TypeError("ResolvedMass required for final browser bridge");
  }
  if (assemblyStatus && assemblyStatus.ok === false) {
    throw new Error(assemblyStatus.reason || "Host preflight is not startable");
  }
  const rites = mapInsertedRites(resolvedMass.insertedRites ?? []);
  return Object.freeze({
    proper: assemblyStatus?.proper ?? resolvedMass?.proper ?? null,
    celebrationForm: arch?.celebrationForm ?? runtimeState?.settings?.massForm ?? "sung",
    presentationMode: mapLegacyFollowMode(
      arch?.followMode ?? runtimeState?.settings?.followMode ?? "vox"
    ),
    precedingRites: rites.precedingRites,
    followingActions: rites.followingActions,
    chantSetting: arch?.chantSetting ?? runtimeState?.settings?.chantSetting ?? "GREGORIAN",
    faithfulCommunicantsPresent: runtimeState?.settings?.faithfulCommunion ?? null,
    requiemAbsolution: resolvedMass?.requiemAbsolution ?? resolvedMass?.provenance?.requiemAbsolution ?? null,
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
    mode: mapLegacyFollowMode(a?.followMode ?? settings.followMode ?? "vox"),
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

export function stampMassReaderUi(owner,doc=globalThis.document){
  const value=String(owner??"UNKNOWN");
  if(doc?.documentElement?.dataset)doc.documentElement.dataset.aoMassReaderUi=value;
  return value;
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
  document.documentElement.dataset.aoMassEngine = "r17-native-production";
}

export async function mountR17Preview({
  doc,
  prepared,
  nativeMount=mountNativeReaderPreview,
  iconAssets=globalThis.AO_R17_ICON_ASSETS??null,
}={}) {
  const assets=iconAssets;
  const iconAudit=auditHostIconBank(assets);
  if(!iconAudit.complete){
    throw new Error("R17_ICON_BANK_INCOMPLETE:"+iconAudit.missing.join(","));
  }
  const preview=await Promise.resolve(nativeMount({
    doc,
    prepared,
    iconResolver:createHostIconResolver({assets}),
    beforeClose:async()=>{
      const shell=globalThis.AO_APP_SHELL_V1;
      if(typeof shell?.navigate!=="function")return true;
      const result=await shell.navigate("home");
      return result?.ok===true;
    },
  }));
  return Object.freeze({
    preview,
    uiOwner:"R17_NATIVE_PRODUCTION",
    fallbackReason:null,
  });
}

async function openProductionReader(prepared) {
  persistPrepared(prepared);
  const readerUiMode=readBrowserReaderUiMode(globalThis);
  const bridge=legacyBridge();

  if(readerUiMode==="LEGACY"){
    if(typeof bridge?.startLive!=="function")throw new Error("Legacy rollback renderer is unavailable");
    await Promise.resolve(bridge.startLive());
    const uiOwner=stampMassReaderUi("LEGACY_EXPLICIT_ROLLBACK");
    globalThis.AO_R17_MASS_RUNTIME=Object.freeze({
      version:VERSION,prepared,readerUiMode,
      legacyActive:bridge.getActive?.() ?? globalThis.AO_ACTIVE_MASS_SESSION ?? null,
      shadowAudit:null,previewFallbackReason:null,
      uiOwner,
      canonicalOwner:"R17_SESSION_ENGINE",
    });
    return;
  }

  if(readerModeRunsShadowAudit(readerUiMode)){
    if(typeof bridge?.startLive!=="function")throw new Error("Legacy shadow renderer is unavailable");
    await Promise.resolve(bridge.startLive());
    const legacyActive=bridge.getActive?.() ?? globalThis.AO_ACTIVE_MASS_SESSION ?? null;
    const shadowAudit=runReaderShadowAudit({doc:document,prepared});
    const uiOwner=stampMassReaderUi("LEGACY_SHADOW_AUDIT");
    globalThis.AO_R17_MASS_RUNTIME=Object.freeze({
      version:VERSION,prepared,readerUiMode,legacyActive,shadowAudit,
      previewFallbackReason:null,uiOwner,
      canonicalOwner:"R17_SESSION_ENGINE",
    });
    return;
  }

  if(!readerModeMountsPreview(readerUiMode)){
    throw new Error("Unsupported production reader mode: "+readerUiMode);
  }
  const previewState=await mountR17Preview({doc:document,prepared});
  const uiOwner=stampMassReaderUi(previewState.uiOwner);
  globalThis.AO_R17_MASS_RUNTIME=Object.freeze({
    version:VERSION,prepared,readerUiMode,
    legacyActive:null,shadowAudit:null,
    previewFallbackReason:null,
    uiOwner,
    canonicalOwner:"R17_SESSION_ENGINE",
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
    openReader: openProductionReader,
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
  const shellFocusGuard=installShellFocusVisibilityGuard({doc:document,win:window});
  if (globalThis.AO_R17_BROWSER_ENTRY?.installed) return globalThis.AO_R17_BROWSER_ENTRY;
  const state = { installed: false, polls: 0, controller: null };

  function tryInstall() {
    state.polls += 1;
    if (!celebrationApi()?.getResolvedMass || !runtime()?.store) {
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

  // Capture before the historical document listener. The final bridge owns
  // Start Mass whenever the modular controller is ready.
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
      readerUiMode: globalThis.AO_R17_MASS_RUNTIME?.readerUiMode ?? readBrowserReaderUiMode(globalThis),
      shadow: globalThis.AO_R17_READER_SHADOW ?? null,
      nativeMounted: Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
      uiOwner: globalThis.AO_R17_MASS_RUNTIME?.uiOwner ?? null,
      fallbackReason: globalThis.AO_R17_MASS_RUNTIME?.previewFallbackReason ?? null,
      shellFocusGuard: shellFocusGuard?.installed === true,
      appShellBridge: globalThis.AO_APP_SHELL_V1?.installed === true,
    }),
  });

  tryInstall();
  return globalThis.AO_R17_BROWSER_ENTRY;
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const installFinalBrowserBridges = () => {
    installAppShellBridge();
    installBrowserMassBridge();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installFinalBrowserBridges, { once: true });
  } else {
    installFinalBrowserBridges();
  }
}
