import { canonicalAssetIdForSurface } from "../assets/asset-registry.js";
import { installLazyPrayRegistry } from "./lazy-module-registry.js";





const VERSION="modular-pray-v1";

// Cold Home requires only the small route owner. Devotional readers, novena
// records, gesture focus observers and traditional prayer corpora are loaded
// on first Prayer entry in the historical dependency/installation order.
// Module scripts are cached by the browser; concurrent entries share a promise.
let readerLoad=null;
let readerReady=false;
let readerError=null;
export function ensurePrayReader({win=globalThis}={}){
  // Unit-test/SSR host adapters have no browser document or module side-effects.
  // The supplied donor in those environments is already the dependency.
  if(typeof window==="undefined" || typeof document==="undefined")return Promise.resolve(true);
  if(readerReady)return Promise.resolve(true);
  if(readerLoad)return readerLoad;
  const loading=win?.AO_LOADING_DIRECTOR_V1?.begin?.("pray");
  readerLoad=(async()=>{
    await import("./presentation-coherence.js");
    await import("./novena-runtime.js");
    await import("./traditional-pray-runtime.js");
    await import("./focus-installer.js");
    // All of these modules install via their original production side-effects.
    // Preserve their original API globals instead of introducing a new owner.
    const coherence=win?.AO_PRAY_COHERENCE_V435930;
    const focus=win?.AO_PRAY_FOCUS_V3410;
    if(!coherence||!focus)throw new Error("Prayer presentation or focus owner missing");
    // Settings is eagerly available while this reader is not. Apply any
    // already-persisted Rosary, Stations and Angelus preferences now, before
    // the first Prayer frame is painted, instead of losing early edits.
    const prayerPreferences=win?.AO_SETTINGS_DONOR_V4359?.snapshot?.()?.preferences?.prayer;
    if(prayerPreferences && typeof win?.AO_PRAY_V435930?.applySettingsPreferences==="function"){
      win.AO_PRAY_V435930.applySettingsPreferences(prayerPreferences);
    }
    readerReady=true;
    readerError=null;
    return true;
  })().finally(()=>loading?.end?.()).catch(error=>{
    readerError=error;
    readerLoad=null; // retry from a new navigation after transient failures
    throw error;
  });
  return readerLoad;
}


function donor(win){return win?.AO_PRAY_V435930??null;}
function root(win){return win?.document?.getElementById?.("aoPray435930")??null;}

function stamp(win){
  const node=root(win);
  if(node?.dataset){
    node.dataset.aoPrayOwner=VERSION;
    node.dataset.aoAssetId=canonicalAssetIdForSurface("pray")||"";
  }
  if(win?.document?.documentElement?.dataset){
    win.document.documentElement.dataset.aoPrayRouteOwner=VERSION;
  }
  return node;
}

function delay(win,ms){
  return new Promise(resolve=>{
    if(typeof win?.setTimeout==="function")win.setTimeout(resolve,ms);
    else setTimeout(resolve,ms);
  });
}

export function createPrayOwner(win=globalThis,{pollMs=40,maxPolls=150}={}){
  async function resolveDonor(){
    for(let i=0;i<=maxPolls;i++){
      const api=donor(win);
      if(typeof api?.open==="function")return api;
      if(i<maxPolls)await delay(win,pollMs);
    }
    return null;
  }

  async function open(){
    try{await ensurePrayReader({win});}catch(error){
      try{win?.console?.error?.("Prayer reader load failed",error);}catch{}
      return false;
    }
    const api=await resolveDonor();
    if(typeof api?.open!=="function")return false;
    const opened=await Promise.resolve(api.open("pray.hub",{returnContext:null}));
    if(opened!==true&&opened?.ok!==true)return false;
    stamp(win);
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("pray");}catch{}
    return true;
  }

  function close(){
    const api=donor(win);
    if(typeof api?.close!=="function")return false;
    api.close();
    return true;
  }

  function status(){
    const node=root(win);
    let donorState=null;
    try{donorState=donor(win)?.state?.()??null;}catch{}
    return Object.freeze({
      version:VERSION,
      installed:true,
      readerLoaded:readerReady,
      readerLoading:Boolean(readerLoad&&!readerReady),
      readerError:readerError?String(readerError?.message??readerError):null,
      donorAvailable:typeof donor(win)?.open==="function",
      routeOwner:win?.document?.documentElement?.dataset?.aoPrayRouteOwner??null,
      visibleOwner:node?.dataset?.aoPrayOwner??null,
      open:Boolean(node?.classList?.contains?.("open")),
      donorState,
      presentationOwner:"AO_PRAY_V435930",
      presentationRoot:"aoPray435930",
    });
  }

  return Object.freeze({version:VERSION,open,close,status});
}

export function installPrayBrowserOwner(win=globalThis){
  if(win?.AO_PRAY_APP_V1)return win.AO_PRAY_APP_V1;
  const api=createPrayOwner(win);
  win.AO_PRAY_APP_V1=api;
  installLazyPrayRegistry(win,ensurePrayReader);
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  installPrayBrowserOwner(window);
}
