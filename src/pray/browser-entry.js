const VERSION="modular-pray-v1";

function donor(win){return win?.AO_PRAY_V435930??null;}

function root(win){
  return win?.document?.getElementById?.("aoPray435930")??null;
}

function markRoot(win){
  const node=root(win);
  if(node?.dataset)node.dataset.aoPrayOwner=VERSION;
  return node;
}

function deferMark(win){
  markRoot(win);
  const microtask=win?.queueMicrotask??globalThis.queueMicrotask;
  if(typeof microtask==="function"){
    try{microtask(()=>markRoot(win));}catch{}
  }
  if(typeof win?.requestAnimationFrame==="function"){
    try{win.requestAnimationFrame(()=>markRoot(win));}catch{}
  }else if(typeof win?.setTimeout==="function"){
    try{win.setTimeout(()=>markRoot(win),0);}catch{}
  }
}

export function createPrayOwner(win=globalThis){
  function open(){
    const api=donor(win);
    if(typeof api?.open!=="function")return false;
    const opened=api.open("pray.hub",{returnContext:null});
    if(opened===false)return false;
    deferMark(win);
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
    const node=markRoot(win);
    let donorState=null;
    try{donorState=donor(win)?.state?.()??null;}catch{}
    return Object.freeze({
      version:VERSION,
      installed:true,
      donorAvailable:typeof donor(win)?.open==="function",
      visibleOwner:node?.dataset?.aoPrayOwner??null,
      open:Boolean(node?.classList?.contains?.("open")),
      donorState,
      presentationOwner:"AO_PRAY_V435930",
    });
  }

  return Object.freeze({version:VERSION,open,close,status});
}

export function installPrayBrowserOwner(win=globalThis){
  if(win?.AO_PRAY_APP_V1)return win.AO_PRAY_APP_V1;
  const api=createPrayOwner(win);
  win.AO_PRAY_APP_V1=api;

  // The donor may create or replace its presentation root after the modular
  // browser entry has installed. Keep ownership metadata convergent without
  // taking presentation ownership away from AO_PRAY_V435930.
  const doc=win?.document;
  if(typeof win?.MutationObserver==="function"&&doc?.documentElement){
    try{
      const observer=new win.MutationObserver(()=>{markRoot(win);});
      observer.observe(doc.documentElement,{childList:true,subtree:true});
    }catch{}
  }
  deferMark(win);
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  installPrayBrowserOwner(window);
}
