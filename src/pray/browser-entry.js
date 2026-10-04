const VERSION="modular-pray-v1";

function donor(win){return win?.AOTraditionalPrayerBook??null;}
function root(win){return win?.document?.getElementById?.("aoPrayerBookRoot")??null;}

function stamp(win){
  const node=root(win);
  if(node?.dataset)node.dataset.aoPrayRouteOwner=VERSION;
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
    const api=await resolveDonor();
    if(typeof api?.open!=="function")return false;
    const opened=api.open({returnContext:null});
    if(opened===false)return false;
    stamp(win);
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("pray");}catch{}
    return true;
  }

  function close(){
    const api=donor(win);
    if(typeof api?.close!=="function")return false;
    api.close({silent:true});
    return true;
  }

  function status(){
    const node=root(win);
    let donorState=null;
    try{donorState=donor(win)?.getState?.()??null;}catch{}
    return Object.freeze({
      version:VERSION,
      installed:true,
      donorAvailable:typeof donor(win)?.open==="function",
      routeOwner:win?.document?.documentElement?.dataset?.aoPrayRouteOwner??null,
      rootOwner:node?.dataset?.aoPrayRouteOwner??null,
      open:Boolean(node?.classList?.contains?.("open")),
      donorState,
      presentationOwner:"AOTraditionalPrayerBook",
      presentationRoot:"aoPrayerBookRoot",
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
