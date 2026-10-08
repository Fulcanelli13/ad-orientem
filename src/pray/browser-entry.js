import { canonicalAssetIdForSurface } from "../assets/asset-registry.js";
import "./presentation-coherence.js";
import "./novena-runtime.js";
import "./traditional-pray-runtime.js";
import "./focus-installer.js";

const VERSION="modular-pray-v1";

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
    try{win?.__AO_CI_TRACE?.("pray-owner:enter")}catch{}
    const api=await resolveDonor();
    try{win?.__AO_CI_TRACE?.("pray-owner:donor-resolved")}catch{}
    if(typeof api?.open!=="function")return false;
    try{win?.__AO_CI_TRACE?.("pray-owner:donor-open:start")}catch{}
    const opened=api.open("pray.hub",{returnContext:null});
    try{win?.__AO_CI_TRACE?.("pray-owner:donor-open:done")}catch{}
    if(opened===false)return false;
    stamp(win);
    try{win?.__AO_CI_TRACE?.("pray-owner:stamp:done")}catch{}
    // The caller owns top-level surface state; avoid re-entering ribbon adoption
    // from inside a synchronous PRAY owner open (controller.go sets active).
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
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  installPrayBrowserOwner(window);
}
