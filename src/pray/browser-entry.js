const VERSION="modular-pray-v1";

function donor(win){return win?.AO_PRAY_V435930??null;}

function wait(win,ms){
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
      if(i<maxPolls)await wait(win,pollMs);
    }
    return null;
  }

  async function open(){
    const api=await resolveDonor();
    if(typeof api?.open!=="function")return false;
    const opened=api.open("pray.hub",{returnContext:null});
    if(opened===false)return false;
    const root=win?.document?.getElementById?.("aoPray435930")??null;
    if(root?.dataset)root.dataset.aoPrayOwner=VERSION;
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
    const root=win?.document?.getElementById?.("aoPray435930")??null;
    let donorState=null;
    try{donorState=donor(win)?.state?.()??null;}catch{}
    return Object.freeze({
      version:VERSION,
      installed:true,
      donorAvailable:typeof donor(win)?.open==="function",
      visibleOwner:root?.dataset?.aoPrayOwner??null,
      open:Boolean(root?.classList?.contains?.("open")),
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
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined"){
  installPrayBrowserOwner(window);
}
