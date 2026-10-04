const VERSION="modular-home-v1";

function runtime(win){return win?.AO_RUNTIME_V8??null;}
function state(win){return runtime(win)?.store?.getState?.()??null;}

function closeTransientSurfaces(win){
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

export function createHomeOwner(win=globalThis){
  function open(){
    closeTransientSurfaces(win);
    resetCoreRoute(win);
    try{win?.AO_SETTINGS_V4359?.restoreHome?.();}catch{}
    try{win?.AO_SETTINGS_V4358?.restoreHome?.();}catch{}
    try{win?.AO_SETTINGS_V4356?.restoreHome?.();}catch{}
    const screen=win?.document?.querySelector?.(".homeScreen")??null;
    if(screen?.dataset)screen.dataset.aoHomeOwner=VERSION;
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("home");}catch{}
    return true;
  }
  function status(){
    const screen=win?.document?.querySelector?.(".homeScreen")??null;
    return Object.freeze({
      version:VERSION,
      installed:true,
      visibleOwner:screen?.dataset?.aoHomeOwner??null,
      route:state(win)?.route??null,
      donorHomeAvailable:typeof win?.AO_NAV_V362?.home==="function",
    });
  }
  return Object.freeze({version:VERSION,open,status});
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
