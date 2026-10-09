// Final browser bridge for the modular Mass engine.
// The host still owns calendar/celebration preflight and Proper resolution.
// The native reader owns the production Mass surface. Legacy is explicit rollback only.

import { installAppShellBridge } from "../app/browser-entry.js";
import { createMassEntryController } from "./app-shell-bootstrap.js";
import { readBrowserReaderUiMode } from "./reader-gate.js";
import { mountNativeReaderPreview } from "./reader-native-preview.js";
import { createHostIconResolver, auditHostIconBank } from "./reader-icons.js";
import { R17_FROZEN_ACTIVE_ICON_ASSETS } from "./reader-icon-bank.js";
import { installShellFocusVisibilityGuard } from "../app/shell-focus-visibility.js";
import { recoverReaderProperOmissions } from "./reader-proper-runtime-recovery.js";
import {massScriptureContextForCard} from "./scripture-reading-context.js";

export const VERSION = "final-browser-entry-v2";
export const ACTIVE_MASS_STORAGE_KEY = "ao-r17-active-mass-v1";

export function resolveHostIconAssets(_win=globalThis){
  // The frozen modular bank is the production authority. Historical hosts may
  // still expose AO_R17_ICON_ASSETS, but that global must never override,
  // partially replace, or downgrade the certified R17 asset contract.
  return R17_FROZEN_ACTIVE_ICON_ASSETS;
}

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
// Read-only compatibility source for host preflight assembly data. This bridge
// is never permitted to render, mount, or own the Mass presentation surface.
function assemblyStatusBridge() { return globalThis.AO_SEQUENCE_BRIDGE_V23 ?? globalThis.AO_SEQUENCE_BRIDGE_V22 ?? null; }
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
  const bridge = assemblyStatusBridge();
  if (typeof bridge?.getAssemblyStatus === "function") return bridge.getAssemblyStatus();
  return null;
}

export function stampMassReaderUi(owner,doc=globalThis.document){
  const value=String(owner??"UNKNOWN");
  if(doc?.documentElement?.dataset)doc.documentElement.dataset.aoMassReaderUi=value;
  return value;
}

function storageApi(storage = globalThis.localStorage) {
  return storage ?? null;
}

export function readPersistedActiveMass(storage = globalThis.localStorage) {
  try {
    const raw = storageApi(storage)?.getItem?.(ACTIVE_MASS_STORAGE_KEY);
    if (!raw) return null;
    const record = JSON.parse(raw);
    if (!record || typeof record !== "object") return null;
    if (!record.schema || !record.session?.resolvedMass || !record.readerPreferences) return null;
    return record;
  } catch {
    return null;
  }
}

export function persistedMassIsResumable(record) {
  return Boolean(
    record &&
    (record.state === "active" || record.state === "suspended") &&
    record.schema &&
    record.session?.resolvedMass &&
    record.readerPreferences
  );
}

function writePersistedActiveMass(record, storage = globalThis.localStorage) {
  try {
    storageApi(storage)?.setItem?.(ACTIVE_MASS_STORAGE_KEY, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}

export function clearPersistedActiveMass(storage = globalThis.localStorage) {
  try {
    storageApi(storage)?.removeItem?.(ACTIVE_MASS_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function preparedFromRecord(record) {
  return Object.freeze({
    schema: record.schema,
    session: record.session,
    readerPreferences: record.readerPreferences,
  });
}

function readerPosition(preview = globalThis.AO_R17_NATIVE_READER_PREVIEW) {
  const card = preview?.getCurrentCard?.() ?? null;
  return Object.freeze({
    sectionId: card?.sectionId ?? null,
    sequence: card?.sequence ?? null,
    activeCueId: preview?.getActiveCue?.() ?? null,
  });
}

export function checkpointPersistedMass({
  storage = globalThis.localStorage,
  preview = globalThis.AO_R17_NATIVE_READER_PREVIEW,
} = {}) {
  const current = readPersistedActiveMass(storage);
  if (!persistedMassIsResumable(current) || !preview) return false;
  return writePersistedActiveMass({
    ...current,
    readerPosition: readerPosition(preview),
    checkpointedAt: new Date().toISOString(),
  }, storage);
}

// Shell navigation reports expected failures as {ok:false}; Promise.catch alone
// cannot detect them. Cancellation of the live-Mass leave prompt is not an error.
export async function navigateReaderSurface(surface,{win=globalThis}={}){
  const shell=win?.AO_APP_SHELL_V1;
  if(typeof shell?.navigate!=="function")throw new Error("APP_SHELL_NOT_READY");
  const result=await shell.navigate(surface);
  if(result===false || result?.ok===false){
    if(result?.reason==="LIVE_MASS_LEAVE_CANCELLED")return false;
    throw new Error(String(result?.reason||"READER_NAVIGATION_UNAVAILABLE"));
  }
  return true;
}

function installReaderSurfaceBridge(preview,{selector,surface,language="en"}){
  const button=preview?.root?.querySelector?.(selector);
  if(!button?.addEventListener)return null;
  let opening=false,disposed=false,notice=null;
  const fr=String(language).startsWith("fr");
  const clearNotice=()=>{notice?.remove?.();notice=null;};
  const onClick=event=>{
    event.preventDefault?.();
    event.stopImmediatePropagation?.();
    if(opening||disposed)return;
    opening=true;
    button.disabled=true;
    button.setAttribute?.("aria-busy","true");
    clearNotice();
    // Preserve the exact current card/cue before leaving the Mass surface.
    checkpointPersistedMass({preview});
    void navigateReaderSurface(surface).catch(error=>{
      if(disposed)return;
      console.error("R17 reader "+surface+" navigation failed",error);
      const doc=button.ownerDocument;
      const host=preview?.root?.querySelector?.("[data-ao-reader-shell]")??preview?.root;
      if(!doc?.createElement||!host?.append)return;
      notice=doc.createElement("p");
      notice.className="aoMassReaderNavigationError";
      notice.setAttribute("role","alert");
      notice.dataset.readerNavigationError=surface;
      notice.textContent=surface==="home"
        ?(fr?"Impossible d’ouvrir l’accueil. Réessayez.":"Home could not open. Please retry.")
        :(fr?"Impossible d’ouvrir les réglages. Réessayez.":"Settings could not open. Please retry.");
      notice.style.cssText="position:absolute;z-index:65;top:58px;left:8px;right:8px;max-width:340px;margin:auto;padding:11px 13px;border:1px solid rgba(201,164,122,.35);border-radius:9px;background:#18201c;color:#e9e9df;font:500 13px/1.5 var(--ao-font-ui,system-ui,sans-serif);text-align:center;box-shadow:0 8px 25px rgba(0,0,0,.35)";
      host.append(notice);
    }).finally(()=>{
      opening=false;
      if(!disposed){
        button.disabled=false;
        button.removeAttribute?.("aria-busy");
      }
    });
  };
  button.addEventListener("click",onClick,true);
  return Object.freeze({dispose(){
    disposed=true;
    button.removeEventListener?.("click",onClick,true);
    button.disabled=false;
    button.removeAttribute?.("aria-busy");
    clearNotice();
  }});
}

function installReaderCloseBridge(preview,prepared){
  return installReaderSurfaceBridge(preview,{
    selector:"[data-reader-home], [aria-label='Close Mass reader']",
    surface:"home",language:prepared?.readerPreferences?.language,
  });
}

function massGlossaryTerms(preview){
  const card=preview?.getCurrentCard?.()??null;
  const text=[card?.title,card?.sectionTitle,card?.sectionId,card?.id].filter(Boolean).join(" ").toLowerCase();
  const rows=[];
  const add=(...ids)=>rows.push(...ids);
  if(/asperges/.test(text))add("G235","G238","G043");
  if(/vidi aquam/.test(text))add("G236","G238","G043");
  if(/introit/.test(text))add("G052");
  if(/collect/.test(text))add("G053");
  if(/epistle/.test(text))add("G054");
  if(/gradual/.test(text))add("G055");
  if(/tract/.test(text))add("G056");
  if(/gospel/.test(text))add("G057");
  if(/kyrie/.test(text))add("G255");
  if(/gloria/.test(text))add("G256");
  if(/credo|creed/.test(text))add("G257");
  if(/offertory/.test(text))add("G058");
  if(/secret/.test(text))add("G059");
  if(/preface/.test(text))add("G060");
  if(/sanctus/.test(text))add("G258");
  if(/benedictus/.test(text))add("G259");
  if(/canon/.test(text))add("G061");
  if(/consecrat/.test(text))add("G062");
  if(/elevation/.test(text))add("G063");
  if(/agnus/.test(text))add("G260");
  if(/communion/.test(text))add("G031","G064");
  if(/postcommunion/.test(text))add("G065");
  if(/last gospel/.test(text))add("G066");
  if(/requiem/.test(text))add("G266");
  if(/rogation/.test(text))add("G094","G233");
  if(/corpus christi/.test(text))add("G320","G301","G316");
  if(/procession/.test(text))add("G233");
  if(!rows.length)add("G046","G067");
  else add("G067");
  return [...new Set(rows)];
}

// The glossary is a lazy Formation module. Production Mass can be the user's
// very first destination, so its contextual reference must install on demand.
export async function openReaderGlossaryContext(preview,{
  win=globalThis,
  loader=()=>import("../glossary/browser-entry.js"),
}={}){
  let glossary=win?.AO_GLOSSARY_V1;
  if(typeof glossary?.openTerms!=="function"){
    const mod=await loader();
    glossary=mod?.installGlossaryModule?.(win)??win?.AO_GLOSSARY_V1;
  }
  if(typeof glossary?.openTerms!=="function")throw new Error("MASS_GLOSSARY_NOT_READY");
  const result=await glossary.openTerms(massGlossaryTerms(preview),{origin:"mass"});
  if(result===false)throw new Error("MASS_GLOSSARY_CONTEXT_UNAVAILABLE");
  return true;
}

function installReaderGlossaryBridge(preview){
  const button=preview?.root?.querySelector?.("[data-reader-glossary]");
  if(!button?.addEventListener)return null;
  let opening=false,disposed=false;
  const onClick=event=>{
    // Always own this button. Missing lazy owners must never mean a silent tap.
    event.preventDefault?.();
    event.stopImmediatePropagation?.();
    if(opening||disposed)return;
    opening=true;
    button.disabled=true;
    button.setAttribute?.("aria-busy","true");
    button.removeAttribute?.("data-ao-r17-glossary-error");
    const status=button.ownerDocument?.createElement?.("p");
    const panel=button.closest?.('[data-role="mass-preferences"]');
    panel?.querySelector?.(".aoMassGlossaryError")?.remove?.();
    const fr=String(globalThis.AO_R17_ACTIVE_MASS?.readerPreferences?.language??"en").startsWith("fr");
    void openReaderGlossaryContext(preview).catch(error=>{
      if(disposed)return;
      console.error("R17 reader glossary failed",error);
      button.dataset.aoR17GlossaryError="true";
      if(status){
        status.className="aoMassGlossaryError";
        status.setAttribute("role","alert");
        status.style.cssText="margin:6px 0;color:var(--muted,#b9b3a9);font:400 max(13px,.8125rem)/1.5 var(--ao-font-ui,system-ui,sans-serif)";
        status.textContent=fr
          ?"Impossible d’ouvrir le glossaire. La Messe reste disponible."
          :"Glossary could not open. Mass remains available.";
        button.insertAdjacentElement?.("afterend",status);
      }
    }).finally(()=>{
      opening=false;
      if(!disposed){
        button.disabled=false;
        button.removeAttribute?.("aria-busy");
      }
    });
  };
  button.addEventListener("click",onClick,true);
  return Object.freeze({dispose(){
    disposed=true;
    button.removeEventListener?.("click",onClick,true);
    button.disabled=false;
    button.removeAttribute?.("aria-busy");
    button.closest?.('[data-role="mass-preferences"]')?.querySelector?.(".aoMassGlossaryError")?.remove?.();
  }});
}


export async function openReaderScriptureContext(reference,{
  win=globalThis,language="en",
  loader=()=>import("../scripture/browser-entry.js"),
}={}){
  let owner=win?.AO_SCRIPTURE_CONTEXT_V1;
  if(typeof owner?.open!=="function"){
    const module=await loader();
    module?.installScriptureBrowserOwner?.(win);
    owner=win?.AO_SCRIPTURE_CONTEXT_V1;
  }
  if(typeof owner?.open!=="function")throw new Error("MASS_SCRIPTURE_OWNER_NOT_READY");
  const isSegmented=Array.isArray(reference?.segments);
  if(isSegmented && typeof owner.openSegments!=="function")
    throw new Error("MASS_SEGMENTED_SCRIPTURE_OWNER_NOT_READY");
  const accepted=isSegmented
    ? await owner.openSegments(reference.segments,{language,reference:reference.reference,provenance:reference.provenance})
    : await owner.open(reference,{language});
  if(accepted===false)throw new Error("MASS_SCRIPTURE_CONTEXT_UNAVAILABLE");
  return true;
}

function installReaderScriptureBridge(preview,prepared){
  const root=preview?.root,panel=root?.querySelector?.('[data-role="mass-preferences"]');
  if(!panel?.ownerDocument)return null;
  const doc=panel.ownerDocument,fr=String(prepared?.readerPreferences?.language||"en").startsWith("fr");
  const box=doc.createElement("section");
  box.className="aoMassScriptureStudy";
  box.dataset.readerScriptureStudy="";
  box.hidden=true;
  const button=doc.createElement("button");
  button.type="button";button.className="ao-mass-prefs-more";
  button.dataset.readerScriptureContext="";
  button.textContent=fr?"Lire l’Écriture en contexte":"Read Scripture in context";
  const status=doc.createElement("small");status.className="aoMassScriptureStudyStatus";
  status.setAttribute("role","status");
  box.append(button,status);panel.append(box);
  let opening=false,disposed=false;
  function refresh(){
    if(disposed)return null;
    const context=massScriptureContextForCard(preview?.getCurrentCard?.(),prepared);
    box.hidden=!context;
    if(!context)return null;
    button.hidden=context.state!=="READY";
    button.disabled=opening||context.state!=="READY";
    if(context.state==="READY"){
      button.dataset.massReadingReference=context.reference;
      status.textContent=(fr?"Étude facultative · ":"Optional study · ")+context.reference;
    }else{
      delete button.dataset.massReadingReference;
      status.textContent=fr
        ?"Référence biblique exacte non vérifiée. Le texte liturgique reste inchangé."
        :"Exact Bible reference unverified. Liturgical text remains unchanged.";
    }
    status.setAttribute("role","status");
    return context;
  }
  const onClick=event=>{
    if(event.target?.closest?.("[data-reader-preferences]")){refresh();return;}
    if(!event.target?.closest?.("[data-reader-scripture-context]"))return;
    event.preventDefault?.();event.stopImmediatePropagation?.();
    if(opening||disposed)return;
    const context=refresh();if(context?.state!=="READY")return;
    opening=true;button.disabled=true;button.setAttribute("aria-busy","true");
    void openReaderScriptureContext(context.segments?context:context.reference,{language:fr?"fr":"en"}).catch(error=>{
      if(disposed)return;
      console.error("R17 reader Scripture context failed",error);
      status.textContent=fr
        ?"Le contexte biblique n’a pas pu être ouvert. La Messe reste disponible."
        :"Scripture context could not open. Mass remains available.";
      status.setAttribute("role","alert");
    }).finally(()=>{
      opening=false;
      if(!disposed){
        button.removeAttribute?.("aria-busy");
        button.disabled=false;
      }
    });
  };
  root.addEventListener("click",onClick,true);
  // The user can change cards without closing Mass preferences. Keep the
  // displayed passage synchronized with the actual selected liturgical reading.
  const Observer=root.ownerDocument?.defaultView?.MutationObserver??globalThis.MutationObserver;
  const observer=typeof Observer==="function"?new Observer(()=>refresh()):null;
  observer?.observe?.(root,{attributes:true,attributeFilter:[
    "data-r17-native-cue","data-r17-native-event","data-r17-presentation-mode",
  ]});
  refresh();
  return Object.freeze({refresh,dispose(){
    disposed=true;
    observer?.disconnect?.();
    root.removeEventListener?.("click",onClick,true);
    box.remove?.();
  }});
}

function installReaderParametersBridge(preview,prepared){
  return installReaderSurfaceBridge(preview,{
    selector:"[data-reader-parameters]",
    surface:"settings",language:prepared?.readerPreferences?.language,
  });
}

function installReaderCheckpoint(preview) {
  globalThis.AO_R17_ACTIVE_MASS_CHECKPOINT?.dispose?.();
  const root = preview?.root;
  if (!root?.addEventListener) return null;

  let queued = false;
  const save = () => checkpointPersistedMass({ preview });
  const schedule = () => {
    if (queued) return;
    queued = true;
    queueMicrotask(() => {
      queued = false;
      save();
    });
  };
  root.addEventListener("click", schedule, true);

  let observer = null;
  const MutationObserverImpl = globalThis.MutationObserver;
  if (typeof MutationObserverImpl === "function") {
    observer = new MutationObserverImpl(schedule);
    observer.observe(root, {
      attributes: true,
      attributeFilter: ["data-r17-native-cue", "data-r17-object-state"],
    });
  }

  save();
  const api = Object.freeze({
    dispose() {
      root.removeEventListener?.("click", schedule, true);
      observer?.disconnect?.();
      if (globalThis.AO_R17_ACTIVE_MASS_CHECKPOINT === api) {
        try { delete globalThis.AO_R17_ACTIVE_MASS_CHECKPOINT; } catch {}
      }
    },
  });
  globalThis.AO_R17_ACTIVE_MASS_CHECKPOINT = api;
  return api;
}

function persistPrepared(prepared, { state = "active", resumeRecord = null } = {}) {
  globalThis.AO_R17_ACTIVE_MASS = prepared;
  writePersistedActiveMass({
    schema: prepared?.schema ?? null,
    session: prepared?.session ?? null,
    readerPreferences: prepared?.readerPreferences ?? null,
    state,
    readerPosition: resumeRecord?.readerPosition ?? null,
    storedAt: resumeRecord?.storedAt ?? new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
  document.documentElement.dataset.aoMassEngine = "r17-native-production";
}

export function hasResumableMass(storage = globalThis.localStorage) {
  return persistedMassIsResumable(readPersistedActiveMass(storage));
}

export function suspendPersistedMass({
  storage = globalThis.localStorage,
  preview = globalThis.AO_R17_NATIVE_READER_PREVIEW,
} = {}) {
  if (preview) checkpointPersistedMass({ storage, preview });
  const current = readPersistedActiveMass(storage);
  if (persistedMassIsResumable(current)) {
    writePersistedActiveMass({
      ...current,
      state: "suspended",
      suspendedAt: new Date().toISOString(),
    }, storage);
  }

  globalThis.AO_R17_ACTIVE_MASS_CHECKPOINT?.dispose?.();
  preview?.destroy?.();
  try { delete globalThis.AO_R17_ACTIVE_MASS; } catch {}
  try { delete globalThis.AO_R17_MASS_RUNTIME; } catch {}
  if (globalThis.document?.documentElement?.dataset) {
    delete globalThis.document.documentElement.dataset.aoMassReaderUi;
    globalThis.document.documentElement.dataset.aoMassEngine = "r17-suspended";
  }
  return !globalThis.document?.getElementById?.("ao-r17-native-reader-preview");
}

export async function mountR17Preview({
  doc,
  prepared,
  nativeMount=mountNativeReaderPreview,
  iconAssets=resolveHostIconAssets(),
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
  }));
  return Object.freeze({
    preview,
    uiOwner:"R17_NATIVE_PRODUCTION",
    fallbackReason:null,
  });
}

async function openProductionReader(prepared, { resumeRecord = null } = {}) {
  persistPrepared(prepared, { state: "active", resumeRecord });
  const readerUiMode="NATIVE";
  const previewState=await mountR17Preview({doc:document,prepared});
  const restoredSection = resumeRecord?.readerPosition?.sectionId ?? null;
  if (restoredSection) previewState.preview?.showSection?.(restoredSection);
  installReaderCheckpoint(previewState.preview);
  installReaderCloseBridge(previewState.preview,prepared);
  installReaderParametersBridge(previewState.preview,prepared);
  installReaderGlossaryBridge(previewState.preview);
  installReaderScriptureBridge(previewState.preview,prepared);
  const uiOwner=stampMassReaderUi(previewState.uiOwner);
  globalThis.AO_R17_MASS_RUNTIME=Object.freeze({
    version:VERSION,
    prepared,
    readerUiMode,
    previewFallbackReason:null,
    uiOwner,
    canonicalOwner:"R17_SESSION_ENGINE",
    presentationOwner:"R17_NATIVE_PRODUCTION",
    resumed:Boolean(resumeRecord),
    restoredSection,
  });
  return previewState.preview;
}

export async function resumePersistedMass({
  storage = globalThis.localStorage,
} = {}) {
  const record = readPersistedActiveMass(storage);
  if (!persistedMassIsResumable(record)) {
    return Object.freeze({ ok: false, reason: "NO_RESUMABLE_MASS" });
  }
  if (globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected) {
    return Object.freeze({ ok: true, retained: true, record });
  }
  const prepared = preparedFromRecord(record);
  try {
    await openProductionReader(prepared, { resumeRecord: record });
  } catch (error) {
    clearPersistedActiveMass(storage);
    try { globalThis.AO_R17_ACTIVE_MASS_CHECKPOINT?.dispose?.(); } catch {}
    try { globalThis.AO_R17_NATIVE_READER_PREVIEW?.destroy?.(); } catch {}
    try { delete globalThis.AO_R17_ACTIVE_MASS; } catch {}
    try { delete globalThis.AO_R17_MASS_RUNTIME; } catch {}
    if (globalThis.document?.documentElement?.dataset) {
      delete globalThis.document.documentElement.dataset.aoMassReaderUi;
      globalThis.document.documentElement.dataset.aoMassEngine = "r17-resume-invalidated";
    }
    console.error("Stored R17 Mass could not be resumed; checkpoint invalidated", error);
    return Object.freeze({
      ok: false,
      reason: "STALE_OR_INCOMPLETE_RESUME",
      invalidated: true,
      error: String(error?.message ?? error),
    });
  }
  return Object.freeze({
    ok: true,
    resumed: true,
    prepared,
    readerPosition: record.readerPosition ?? null,
  });
}

export function createBrowserMassController() {
  const api = celebrationApi();
  if (!api?.getResolvedMass) throw new Error("AO_CELEBRATION_API is not ready");
  return createMassEntryController({
    celebrationApi: api,
    readReaderPreferences: () => readerPreferences(),
    resolveHostOptions: async (resolvedMass) => {
      const options=deriveHostOptions({
        resolvedMass,
        assemblyStatus: statusSnapshot(),
        arch: arch(),
        runtimeState: runtimeState(),
      });
      const proper=await recoverReaderProperOmissions(options.proper,{
        hostResolver:runtime()?.resolver?.properResolver,
      });
      return Object.freeze({...options,proper});
    },
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
    hasResumable: () => hasResumableMass(),
    resume: () => resumePersistedMass(),
    suspend: () => suspendPersistedMass(),
    status: () => Object.freeze({
      installed: state.installed,
      polls: state.polls,
      hostApi: Boolean(celebrationApi()?.getResolvedMass),
      presentationOwner: "R17_NATIVE_PRODUCTION",
      runtime: Boolean(runtime()?.store),
      active: globalThis.AO_R17_ACTIVE_MASS ?? null,
      readerUiMode: globalThis.AO_R17_MASS_RUNTIME?.readerUiMode ?? readBrowserReaderUiMode(globalThis),
      nativeMounted: Boolean(globalThis.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
      resumable: hasResumableMass(),
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
