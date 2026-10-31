// Canonical in-app browser/Android Back bridge. Uses the existing shell
// owners; never synthesizes a Mass reader or a duplicate navigation root.
export const APP_NATIVE_BACK_VERSION="app-native-back-v1";
const KEY="__aoNavigationV1";
const ACCEPT=new Set(["home","mass","calendar","pray","learn","find","apostolate","settings"]);

export function createAppNativeBackBridge({win=globalThis,shell}={}){
  const history=win?.history;
  if(!shell||!history?.pushState||!history?.replaceState||!win?.addEventListener)
    return Object.freeze({installed:false,record(){return false},dispose(){}});
  const session=String(Date.now())+"-"+Math.random().toString(36).slice(2);
  let index=0,armed=false,handling=false,disposed=false,expected=null;
  const nav=()=>win?.AO_APP_SHELL_V1??null;
  const settings=()=>win?.AO_SETTINGS_APP_V1??null;
  const active=()=>shell.getActive?.()??"home";
  const pack=(surface,seq)=>({...((history.state&&typeof history.state==="object")?history.state:{}),
    [KEY]:{session,seq,surface}});
  function write(surface,{replace=false}={}){
    if(disposed||!ACCEPT.has(surface))return false;
    try{
      const state=pack(surface,replace?index:++index);
      (replace?history.replaceState:history.pushState).call(history,state,"",win.location?.href);
      return true;
    }catch{return false}
  }
  function record(surface){
    if(disposed||handling||!ACCEPT.has(surface))return false;
    // The canonical shell opens Home internally while replacing one domain
    // with another. Only a user-requested Home is a navigation destination.
    const pending=shell.getPendingTarget?.();
    if(surface==="home"&&pending&&pending!=="home")return false;
    if(expected){
      // Reopening Learn/Explore/Apostolate via the canonical shell makes a
      // transient hard-Home pass before the destination mounts. That is not
      // a user-initiated page turn and MUST NOT become a new history entry.
      if(surface===expected){expected=null;return false}
      if(surface==="home")return false;
      // A different concrete owner took over: abandon stale restoration.
      expected=null;
    }
    const current=history.state?.[KEY];
    if(current?.session===session&&current.surface===surface)return false;
    if(!armed){
      // Do not create a synthetic history entry on initial Home: native Back
      // should still leave the app when there is no in-app destination.
      try{
        history.replaceState(pack("home",0),"",win.location?.href);
        armed=true;
      }catch{return false}
    }
    return write(surface);
  }
  async function onBack(event){
    if(disposed||handling)return;
    const entry=event.state?.[KEY];
    if(entry?.session!==session||!ACCEPT.has(entry.surface))return;
    handling=true;
    const origin=active();
    try{
      if(settings()?.status?.()?.open){
        if(settings().status().path!=="/settings"){
          settings().back(); // chapter -> Contents, never immediately exits
          handling=false;
          record("settings"); // re-arm the same page for the next device Back
          return;
        }
        const destination=entry.surface==="settings"
          ?settings().status().returnSurface??"home":entry.surface;
        expected=destination;
        settings().close();
        // Learn/Explore/Apostolate reopen asynchronously; others restore
        // synchronously. Do not leave a stale suppressor for later journeys.
        if(!["learn","find","apostolate"].includes(destination))expected=null;
        return;
      }
      if(entry.surface===origin)return;
      expected=entry.surface;
      const result=await nav()?.navigate?.(entry.surface);
      if(result?.ok===true){expected=null;return;}
      if(result?.ok!==true){
        expected=null;
        // LIVE Mass cancellation must not be bypassed by browser Back.
        // Rebuild the current Mass entry so another Back requires consent.
        if(result?.reason==="LIVE_MASS_LEAVE_CANCELLED"||result?.reason==="LIVE_MASS_EXIT_FAILED"){
          write("mass");
          return;
        }
        // A failed module load returns to the canonical Home owner; it must
        // never merely paint a new ribbon label over a blank module.
        await nav()?.navigate?.("home");
      }
    }catch(error){
      expected=null;
      try{win.console?.error?.("App browser Back failed",error)}catch{}
      try{await nav()?.navigate?.("home")}catch{}
    }finally{handling=false;}
  }
  const onPop=event=>{void onBack(event)};
  win.addEventListener("popstate",onPop);
  const stop=shell.subscribe?.(surface=>record(surface));
  return Object.freeze({
    version:APP_NATIVE_BACK_VERSION,installed:true,
    record,
    status:()=>Object.freeze({installed:!disposed,version:APP_NATIVE_BACK_VERSION,armed,index,active:active(),handling}),
    dispose(){
      if(disposed)return;disposed=true;
      win.removeEventListener?.("popstate",onPop);
      try{stop?.()}catch{}
    }
  });
}
