import "./source-transport-compat.js";
import "./cinematic-runtime.js";
import { canonicalAssetIdForSurface, resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import "../home/browser-entry.js";
import "../pray/browser-entry.js";
import "../learn/browser-entry.js";
import "../settings/browser-entry.js";
import { installLiveSessionGuards } from "./live-session-guards.js";
import { createPresentationFxBridge } from "./presentation-fx.js";
import { installNonMassConvergence } from "./nonmass-convergence.js";
import "../calendar/browser-entry.js";
import {
  APP_SURFACES,
  NON_MASS_DONOR_CONTRACT,
  createAppHostAdapter,
  createAppShellController,
  normalizeAppSurface,
  surfaceForCoreRoute,
} from "./index.js";

export const VERSION = "final-app-shell-owner-v3";

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

function installVisibleRibbonOwner(win, controller, state, presentationFx = null) {
  const doc = win?.document;
  if (!doc?.getElementById || !controller) return () => {};

  let nav = null;
  let observer = null;
  let releaseObserver = null;
  let disposed = false;
  let ribbonClickBound = false;
  const cleanups = [];

  const isolatedNonMass=new Set(["calendar","pray","learn","settings"]);

  function ensureSurfaceIsolationStyle(){
    if(doc.getElementById?.("ao-app-surface-isolation"))return;
    const style=doc.createElement?.("style");
    if(!style)return;
    style.id="ao-app-surface-isolation";
    style.textContent='html[data-ao-home-suppressed="true"] .homeScreen{display:none!important}';
    (doc.head??doc.documentElement)?.append?.(style);
  }

  function enforceReleaseAuthority(){
    const html=doc.documentElement;
    if(!html?.dataset)return false;
    const release=NON_MASS_DONOR_CONTRACT.release;
    if(html.dataset.aoRelease!==release)html.dataset.aoRelease=release;
    if(html.dataset.aoReleaseAuthority!=="AO_APP_SHELL_V1")html.dataset.aoReleaseAuthority="AO_APP_SHELL_V1";
    return true;
  }

  function watchReleaseAuthority(){
    if(releaseObserver||typeof win?.MutationObserver!=="function"||!doc.documentElement){
      enforceReleaseAuthority();
      return releaseObserver;
    }
    releaseObserver=new win.MutationObserver(()=>enforceReleaseAuthority());
    releaseObserver.observe(doc.documentElement,{
      attributes:true,
      attributeFilter:["data-ao-release","data-ao-release-authority"],
    });
    enforceReleaseAuthority();
    return releaseObserver;
  }

  function syncHomeIsolation(active){
    ensureSurfaceIsolationStyle();
    const suppressed=isolatedNonMass.has(active);
    const home=doc.querySelector?.(".homeScreen")??null;
    if(suppressed&&home?.contains?.(doc.activeElement)){
      try{doc.activeElement?.blur?.();}catch{}
    }
    if(doc.documentElement?.dataset){
      doc.documentElement.dataset.aoHomeSuppressed=suppressed?"true":"false";
      doc.documentElement.dataset.aoRelease=NON_MASS_DONOR_CONTRACT.release;
      doc.documentElement.dataset.aoReleaseAuthority="AO_APP_SHELL_V1";
    }
  }


  function paintActive() {
    if (!nav?.querySelectorAll) return;
    const active = controller.getActive?.();
    syncHomeIsolation(active);
    for (const button of nav.querySelectorAll("[data-ao-app-surface]")) {
      const current = button.dataset?.aoAppSurface === active;
      button.classList?.toggle?.("active", current);
      button.setAttribute?.("aria-current", current ? "page" : "false");
    }
  }

  function applyCanonicalRibbonIcon(button,assetId){
    const url=resolveCanonicalAssetUrl(assetId);
    if(!url||!button)return false;
    let icon=button.querySelector?.(".aoGlobalRibbonIcon")??null;
    if(
      icon?.dataset?.aoAssetId===assetId &&
      icon?.dataset?.aoAssetRenderer==="mask"
    )return true;
    if(!icon){
      icon=doc.createElement?.("span")??null;
      if(!icon)return false;
      button.insertBefore?.(icon,button.firstChild??null);
    }
    icon.className="aoGlobalRibbonIcon aoCanonicalRibbonIcon";
    icon.dataset.aoAssetId=assetId;
    icon.dataset.aoAssetRenderer="mask";
    icon.setAttribute?.("aria-hidden","true");
    if(typeof icon.replaceChildren==="function")icon.replaceChildren();
    else icon.innerHTML="";
    icon.style.background="currentColor";
    icon.style.webkitMask=`url("${url}") center / contain no-repeat`;
    icon.style.mask=`url("${url}") center / contain no-repeat`;
    return true;
  }

  function bindRibbonClick() {
    if (ribbonClickBound || !nav?.addEventListener) return;
    nav.addEventListener("click", onRibbonClick);
    ribbonClickBound = true;
    cleanups.push(() => {
      nav?.removeEventListener?.("click", onRibbonClick);
      ribbonClickBound = false;
    });
  }

  function adopt() {
    if (disposed) return false;
    nav = doc.getElementById("ao-global-ribbon");
    if (!nav?.querySelectorAll) return false;
    bindRibbonClick();

    nav.dataset.aoOwner = "AO_APP_SHELL_V1";
    nav.dataset.aoVisibleShell = "modular";

    let adopted = 0;
    for (const button of nav.querySelectorAll("[data-ao-ribbon], [data-ao-app-surface]")) {
      const surface = normalizeAppSurface(
        button.dataset?.aoAppSurface ?? button.dataset?.aoRibbon
      );
      if (!surface) continue;
      button.dataset.aoAppSurface = surface;
      const assetId=canonicalAssetIdForSurface(surface);
      if(assetId){
        button.dataset.aoAssetId=assetId;
        applyCanonicalRibbonIcon(button,assetId);
      }
      button.removeAttribute?.("data-ao-ribbon");
      adopted += 1;
    }

    state.visibleOwner = adopted === APP_SURFACES.length;
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
    void (presentationFx?.navigate?.(surface, () => controller.go(surface)) ?? controller.go(surface));
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

  adopt();

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

  watchReleaseAuthority();
  cleanups.push(() => releaseObserver?.disconnect?.());

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
    disposeVisibleOwner: null,
    liveSessionGuards: null,
    presentationFx: null,
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
      state.presentationFx?.dispose?.();
      state.presentationFx = createPresentationFxBridge({
        win,
        getActive: () => state.controller?.getActive?.() ?? null,
      });
      try {
        installNonMassConvergence({ win });
      } catch (error) {
        console.error("Non-Mass D3-D6 convergence install failed", error);
      }
      state.disposeVisibleOwner = installVisibleRibbonOwner(win, state.controller, state, state.presentationFx);
      state.liveSessionGuards?.dispose?.();
      state.liveSessionGuards = installLiveSessionGuards({ win });
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
      return state.presentationFx?.navigate?.(surface, () => state.controller.go(surface)) ?? state.controller.go(surface);
    },
    getActive() {
      return state.controller?.getActive?.() ?? null;
    },
    syncSurface(surface) {
      if (!state.controller) return false;
      const normalized = normalizeAppSurface(surface);
      if (!normalized) return false;
      state.controller.setActive?.(normalized);
      return true;
    },
    status() {
      const nav = win?.document?.getElementById?.("ao-global-ribbon");
      return Object.freeze({
        installed: Boolean(state.controller),
        passive: false,
        visibleOwner: state.visibleOwner,
        ribbonOwner: nav?.dataset?.aoOwner ?? null,
        legacyRibbonButtons: nav?.querySelectorAll?.("[data-ao-ribbon]")?.length ?? null,
        modularRibbonButtons: nav?.querySelectorAll?.("[data-ao-app-surface]")?.length ?? null,
        polls: state.polls,
        blocked: state.blocked,
        active: state.controller?.getActive?.() ?? null,
        homeOwner: typeof win?.AO_NAV_V362?.home === "function",
        domainOwner: typeof win?.AO_V37_SHELL?.openDomain === "function",
        settingsOwner: win?.AO_SETTINGS_APP_V1?.status?.()?.installed === true,
        settingsOpen: win?.AO_SETTINGS_APP_V1?.status?.()?.open === true,
        prayerOwner: win?.AO_PRAY_APP_V1?.status?.()?.installed === true,
        prayerPresentationDonor: Boolean(win?.AOTraditionalPrayerBook),
        lockedPrayerTargetAvailable: Boolean(win?.AO_PRAY_V435930),
        learnOwner: win?.AO_LEARN_APP_V1?.status?.()?.installed === true,
        learnOpen: win?.AO_LEARN_APP_V1?.status?.()?.open === true,
        learnPresentationOwner: win?.AO_LEARN_APP_V1?.status?.()?.presentationOwner ?? null,
        historicalLearnDonorOpen: win?.AO_LEARN_APP_V1?.status?.()?.donorShellOpen ?? null,
        calendarOwner: win?.AO_CALENDAR_APP_V1?.status?.()?.installed === true,
        calendarOpen: win?.AO_CALENDAR_APP_V1?.status?.()?.open === true,
        massOwner: Boolean(win?.AO_R17_BROWSER_ENTRY),
        legacyRibbonPresent: Boolean(win?.AO_GLOBAL_RIBBON_V4323),
        liveSessionGuards: state.liveSessionGuards?.status?.() ?? null,
        nonMassConvergence: win?.AO_NON_MASS_D3_D6_CONVERGENCE?.status?.() ?? null,
        presentationFx: state.presentationFx?.status?.() ?? null,
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
