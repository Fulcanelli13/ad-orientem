import { HOME_PRESENTATION_VERSION, renderHome } from "./presentation.js";

const VERSION="modular-home-v2";

function runtime(win){return win?.AO_RUNTIME_V8??null;}
function state(win){return runtime(win)?.store?.getState?.()??null;}

function closeTransientSurfaces(win){
  try{win?.AO_LEARN_APP_V1?.close?.();}catch{}
  try{win?.AO_CALENDAR_APP_V1?.close?.({surface:"home"});}catch{}
  try{win?.AO_INLINE_CUES_V251?.closeGuide?.();}catch{}
  try{win?.AO_RULE_V411?.closeSheet?.();}catch{}
  try{win?.AO_CONTENT_V37?.closeDiagnostics?.();}catch{}
  try{win?.document?.getElementById?.("ao-use-guide-v9")?.remove?.();}catch{}
  try{win?.document?.querySelectorAll?.(".aoArtInfoBackdrop,.aoArtQaBackdrop")?.forEach?.(node=>node.remove?.());}catch{}
  try{win?.AOTraditionalPrayerBook?.close?.({silent:true});}catch{}
  try{win?.AO_UNDERSTAND_MASS?.close?.();}catch{}
  try{win?.AO_TRADITIONAL_CATECHISM?.close?.();}catch{}
  try{win?.AO_DAILY_CATECHISM?.close?.();}catch{}
  try{win?.AO_TRAD_V26?.close?.();}catch{}
  try{win?.AO_EUCHARISTIC_V354?.close?.();}catch{}
  try{win?.AO_V37_SHELL?.close?.();}catch{}
  try{win?.AO_NAV_V25?.closePanel?.();}catch{}
}

function resetCoreRoute(win){
  const store=runtime(win)?.store;
  if(typeof store?.getState!=="function"||typeof store?.dispatch!=="function")return false;
  let s=store.getState();
  if(s?.homeSheet)store.dispatch({type:"home-sheet",sheet:null});
  s=store.getState();
  if(s?.route==="scripture")store.dispatch({type:"scripture-close"});
  s=store.getState();
  if(s?.route==="live")store.dispatch({type:"leave-live"});
  else if(s?.route==="prepare")store.dispatch({type:"leave-prepare"});
  else if(s?.route==="thanksgiving")store.dispatch({type:"leave-thanksgiving"});
  return true;
}

function retireLegacyHomeEnrichers(win){
  try{
    win?.document?.querySelectorAll?.(".aoComingUpV4323,.aoDailyCateHome")?.forEach?.(node=>{
      const active=win?.document?.activeElement;
      if(active&&node.contains?.(active)){try{active.blur?.();}catch{}}
      node.remove?.();
    });
  }catch{}
}

function rehydrateRemainingHomeDonors(win){
  // Coming Up and Daily Catechism Home presentation are modular now.
  // Keep unrelated donor services, then physically retire any historical
  // Home cards they recreate as compatibility side effects.
  try{win?.AO_EUCHARISTIC_V354?.ensureHome?.();}catch{}
  try{win?.AO_V37_SHELL?.ensureHome?.();}catch{}
  retireLegacyHomeEnrichers(win);
}

function watchRetiredHomeEnrichers(win,onMutation){
  if(typeof win?.MutationObserver!=="function"||!win?.document?.documentElement)return null;
  const observer=new win.MutationObserver(()=>onMutation?.());
  observer.observe(win.document.documentElement,{subtree:true,childList:true});
  return observer;
}

function root(win){return win?.document?.getElementById?.("app")??null;}

export function createHomeOwner(win=globalThis){
  let unsubscribe=null;
  let retryTimer=null;
  let enricherClicksBound=false;
  let retiredEnricherObserver=null;

  function ensureRetiredEnricherWatch(){
    if(retiredEnricherObserver)return;
    retiredEnricherObserver=watchRetiredHomeEnrichers(win,()=>{
      if(state(win)?.route==="home")retireLegacyHomeEnrichers(win);
    });
    retireLegacyHomeEnrichers(win);
  }

  function bindEnricherClicks(){
    if(enricherClicksBound||typeof win?.document?.addEventListener!=="function")return;
    win.document.addEventListener("click",onEnricherClick,true);
    enricherClicksBound=true;
  }

  function openRoute(route){
    const id=String(route??"");
    if(!id)return false;
    if(id==="mass.current")return win?.AO_APP_SHELL_V1?.navigate?.("mass")??false;
    if(id.startsWith("pray.")){
      try{const result=win?.AO_MODULES?.open?.(id);if(result)return result;}catch{}
      try{return win?.AO_PRAY_APP_V1?.open?.()??false;}catch{return false;}
    }
    if(id.startsWith("learn.")){
      try{const result=win?.AO_MODULES?.open?.(id);if(result)return result;}catch{}
      try{return win?.AO_LEARN_APP_V1?.openModule?.(id)??false;}catch{return false;}
    }
    try{return win?.AO_MODULES?.open?.(id)??false;}catch{return false;}
  }

  function onEnricherClick(event){
    const target=event?.target;
    const daily=target?.closest?.("[data-home-daily-catechism]");
    if(daily){
      event.preventDefault?.();
      try{win?.AO_DAILY_CATECHISM?.open?.();}catch{}
      return;
    }
    const dynamic=target?.closest?.("[data-home-cu-dynamic]");
    if(dynamic){
      event.preventDefault?.();
      const id=dynamic.dataset?.homeCuDynamic;
      if(id==="dynamic.free"){openRoute("pray.library");return;}
      try{if(win?.AO_RULE_V411?.openDynamic?.(id))return;}catch{}
      openRoute(dynamic.dataset?.homeCuRoute);
      return;
    }
    const stat=target?.closest?.("[data-home-cu-static]");
    if(stat){
      event.preventDefault?.();
      try{if(win?.AO_RULE_V411?.openStatic?.(stat.dataset?.homeCuStatic))return;}catch{}
      return;
    }
    const route=target?.closest?.("[data-home-cu-route]");
    if(route){
      event.preventDefault?.();
      openRoute(route.dataset?.homeCuRoute);
      return;
    }
    const all=target?.closest?.("[data-home-cu-all]");
    if(all){
      event.preventDefault?.();
      void win?.AO_APP_SHELL_V1?.navigate?.("calendar");
    }
  }

  function markOwner(){
    const screen=win?.document?.querySelector?.(".homeScreen")??null;
    if(screen?.dataset){
      screen.dataset.aoHomeOwner=VERSION;
      screen.dataset.aoHomePresentationOwner=HOME_PRESENTATION_VERSION;
    }
    return screen;
  }

  function paint(next=state(win)){
    if(next?.route!=="home")return false;
    const appRoot=root(win);
    if(!appRoot)return false;
    const rendered=renderHome(appRoot,next,win);
    if(!rendered)return false;
    markOwner();
    const queue=typeof win?.queueMicrotask==="function"?win.queueMicrotask.bind(win):queueMicrotask;
    queue(()=>rehydrateRemainingHomeDonors(win));
    return true;
  }

  function attachPresentation(){
    if(unsubscribe)return true;
    const store=runtime(win)?.store;
    if(typeof store?.getState!=="function"||typeof store?.subscribe!=="function"){
      if(typeof win?.setTimeout==="function"&&!retryTimer){
        retryTimer=win.setTimeout(()=>{retryTimer=null;attachPresentation();},80);
      }
      return false;
    }
    unsubscribe=store.subscribe(next=>{if(next?.route==="home")paint(next);});
    paint(store.getState());
    return true;
  }

  function open(){
    closeTransientSurfaces(win);
    resetCoreRoute(win);
    try{win?.AO_SETTINGS_APP_V1?.restoreHome?.();}catch{}
    ensureRetiredEnricherWatch();
    attachPresentation();
    paint(state(win));
    markOwner();
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("home");}catch{}
    return true;
  }

  function status(){
    const screen=win?.document?.querySelector?.(".homeScreen")??null;
    return Object.freeze({
      version:VERSION,
      installed:true,
      visibleOwner:screen?.dataset?.aoHomeOwner??null,
      presentationOwner:screen?.dataset?.aoHomePresentationOwner??null,
      presentationAttached:Boolean(unsubscribe),
      route:state(win)?.route??null,
      donorHomeAvailable:typeof win?.AO_NAV_V362?.home==="function",
      enrichersOwner:screen?.querySelector?.("[data-ao-home-enricher-owner]")?.dataset?.aoHomeEnricherOwner??null,
    });
  }

  function dispose(){
    try{unsubscribe?.();}catch{}
    unsubscribe=null;
    if(retryTimer&&typeof win?.clearTimeout==="function")win.clearTimeout(retryTimer);
    retryTimer=null;
    if(enricherClicksBound){
      try{win?.document?.removeEventListener?.("click",onEnricherClick,true);}catch{}
      enricherClicksBound=false;
    }
    try{retiredEnricherObserver?.disconnect?.();}catch{}
    retiredEnricherObserver=null;
  }

  bindEnricherClicks();
  ensureRetiredEnricherWatch();
  attachPresentation();
  return Object.freeze({version:VERSION,open,paint,status,dispose});
}

export function installHomeBrowserOwner(win=globalThis){
  if(win?.AO_HOME_APP_V1)return win.AO_HOME_APP_V1;
  const api=createHomeOwner(win);
  win.AO_HOME_APP_V1=api;
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  installHomeBrowserOwner(window);
}
