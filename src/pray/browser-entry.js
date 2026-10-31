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
    // Default contemplative only for Morning/Evening Prayer; the module
    // guards all other routes and supports ?aoPrayReader=classic rollback.
    // This lazy import occurs after entering Pray; cold Home stays unchanged.
    const contemplative=await import("./contemplative-daily-preview.js");
    contemplative.installContemplativeDailyPreview(win);
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
  // One-use, in-memory Back receipt owned by this Prayer entry; not a
  // persisted session or a second navigation state machine.
  let backReceipt=null;
  function snapshotScroll(){
    const m=root(win)?.querySelector(".aoP435930Mount");
    if(!m)return null;
    return {
      mount:Math.max(0,Math.floor(m.scrollTop||0)),
      cards:[...m.querySelectorAll("[data-ao-devo-card] .aoDevoCardScroll")].map((node,index)=>({
        index,id:node.closest("[data-ao-devo-card]")?.dataset?.aoDevoCard||"",
        top:Math.max(0,Math.floor(node.scrollTop||0))
      }))
    };
  }
  function restoreScroll(snapshot){
    if(!snapshot)return;
    const apply=()=>{
      const m=root(win)?.querySelector(".aoP435930Mount");
      if(!m||!root(win)?.classList?.contains("open"))return;
      m.scrollTop=snapshot.mount||0;
      for(const item of snapshot.cards||[]){
        const nodes=[...m.querySelectorAll("[data-ao-devo-card] .aoDevoCardScroll")];
        const node=nodes[item.index];
        if(!node||node.closest("[data-ao-devo-card]")?.dataset?.aoDevoCard!==item.id)continue;
        node.scrollTop=item.top;
        node.dispatchEvent(new win.Event("scroll",{bubbles:true}));
      }
      m.dispatchEvent(new win.Event("scroll",{bubbles:true}));
    };
    // Restore after the reader's own queued render and focus-frame setup,
    // so the normal paragraph focus/mute engine stays authoritative.
    Promise.resolve().then(()=>win?.requestAnimationFrame?.(
      ()=>win?.requestAnimationFrame?.(apply)));
  }
  async function resolveDonor(){
    for(let i=0;i<=maxPolls;i++){
      const api=donor(win);
      if(typeof api?.open==="function")return api;
      if(i<maxPolls)await delay(win,pollMs);
    }
    return null;
  }

  async function open({restoreReturn=false}={}){
    const receipt=restoreReturn?backReceipt:null;
    backReceipt=null; // Explicit Prayer entry always starts fresh.
    try{await ensurePrayReader({win});}catch(error){
      try{win?.console?.error?.("Prayer reader load failed",error);}catch{}
      return false;
    }
    const api=await resolveDonor();
    if(typeof api?.open!=="function")return false;
    let opened=false;
    if(receipt?.navigation&&typeof api.restoreHandoff==="function"){
      try{opened=api.restoreHandoff(receipt.navigation)===true}catch{opened=false}
    }
    if(!opened){
      const fresh=await Promise.resolve(api.open("pray.hub",{returnContext:null}));
      opened=fresh===true||fresh?.ok===true;
    }
    if(!opened)return false;
    stamp(win);
    if(receipt&&opened&&root(win)?.querySelector(".aoP435930Mount")?.dataset?.aoPrayView===receipt.navigation?.view)
      restoreScroll(receipt.scroll);
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("pray");}catch{}
    return true;
  }

  function close({preserveForBack=false}={}){
    const api=donor(win);
    if(typeof api?.close!=="function")return false;
    let captured=null;
    if(preserveForBack&&typeof api.captureAppBackHandoff==="function"){
      const navigation=api.captureAppBackHandoff();
      if(navigation)captured={navigation,scroll:snapshotScroll()};
    }
    backReceipt=captured;
    if(captured)api.close({silent:true,preserve:true});
    else api.close();
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
      returnAvailable:Boolean(backReceipt),
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
