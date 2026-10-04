export const VERSION = "app-live-session-guards-v1";

const STRUCTURAL_SELECTOR = [
  "[data-live-form]",
  "[data-sunday-asperges]",
  "[data-setting-form]",
].join(",");

function liveActive(win) {
  return Boolean(
    win?.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected ||
    win?.AO_RUNTIME_V8?.store?.getState?.()?.route === "live"
  );
}

function forceHapticsOff(win) {
  try { win?.AO_HAPTICS_V4319?.setEnabled?.(false); } catch {}
  try { win?.localStorage?.setItem?.("ao-haptics-enabled", "0"); } catch {}
  try { win?.navigator?.vibrate?.(0); } catch {}
}

export function installLiveSessionGuards({ win = globalThis } = {}) {
  const doc = win?.document;
  const store = win?.AO_RUNTIME_V8?.store;
  if (!doc?.documentElement || !doc?.addEventListener || typeof store?.getState !== "function") {
    return Object.freeze({ installed:false, sync(){ return false; }, dispose(){} });
  }

  let disposed=false;
  let lastLive=null;

  function sync() {
    if (disposed) return false;
    const live=liveActive(win);
    lastLive=live;
    doc.documentElement.classList?.toggle?.("aoAppLive", live);
    doc.body?.classList?.toggle?.("aoAppLive", live);

    const ribbon=doc.getElementById?.("ao-global-ribbon");
    if (ribbon) {
      // Do not repeat the historical aria-hidden/focused-descendant regression.
      if (live && ribbon.contains?.(doc.activeElement)) {
        try { doc.activeElement?.blur?.(); } catch {}
      }
      ribbon.hidden=live;
      ribbon.setAttribute?.("aria-hidden", live ? "true" : "false");
    }

    if (live) forceHapticsOff(win);
    return live;
  }

  function onClick(event) {
    if (!liveActive(win)) return;
    const control=event?.target?.closest?.(STRUCTURAL_SELECTOR);
    if (!control) return;
    event.preventDefault?.();
    event.stopImmediatePropagation?.();
    const fr=store.getState?.()?.language === "fr";
    win?.alert?.(
      fr
        ? "Ce réglage est verrouillé pendant la Messe. Quittez le suivi de la Messe pour le modifier."
        : "This setting is locked while Mass is in progress. Exit Mass to change it."
    );
  }

  const unsubscribe=typeof store.subscribe === "function" ? store.subscribe(sync) : null;
  doc.addEventListener("click", onClick, true);

  const MutationObserverImpl=win?.MutationObserver;
  let observer=null;
  if (typeof MutationObserverImpl === "function") {
    observer=new MutationObserverImpl(()=>sync());
    observer.observe(doc.documentElement,{childList:true,subtree:true});
  }

  sync();

  const api=Object.freeze({
    version:VERSION,
    installed:true,
    sync,
    forceHapticsOff:()=>forceHapticsOff(win),
    status:()=>Object.freeze({
      live:Boolean(lastLive),
      nativeMounted:Boolean(win?.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected),
    }),
    dispose(){
      if(disposed)return;
      disposed=true;
      try{unsubscribe?.();}catch{}
      observer?.disconnect?.();
      doc.removeEventListener?.("click",onClick,true);
    },
  });
  return api;
}
