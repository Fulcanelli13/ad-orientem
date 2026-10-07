import { canonicalAssetIdForSurface } from "../assets/asset-registry.js";
import { createSettingsDonorState } from "./donor-state.js";
import { SETTINGS_PRESENTATION_VERSION, renderSettingsToString } from "./presentation.js";

export const VERSION="modular-settings-v4359.6";
export const OWNER="AO_SETTINGS_APP_V1";
export const ROOT_ID="ao-settings-modular-root";

function normalizeSettingsRoute(value){
  const s=String(value||"/settings");
  if(s==="main")return "/settings";
  if(s==="about-sources")return "/settings/about-sources";
  const fixed=new Set(["/settings","/settings/general","/settings/accessibility","/settings/language-reading","/settings/mass","/settings/local-customs","/settings/prayer","/settings/privacy-data","/settings/about-sources"]);
  if(fixed.has(s))return s;
  if(s.startsWith("/settings/local-customs/")&&s.split("/").filter(Boolean).length===3)return s;
  return "/settings";
}

export function createSettingsOwner(win=globalThis){
  const runtime=()=>win?.AO_RUNTIME_V8||null;
  const store=()=>runtime()?.store||null;
  const state=()=>store()?.getState?.()||null;
  const shell=()=>win?.AO_APP_SHELL_V1||null;
  const liveGuards=()=>win?.AO_APP_LIVE_SESSION_GUARDS_V1||null;
  const historicalSelectors=["#ao-settings-v4359","#ao-settings-v4358","#ao-settings-v4356","[data-ao-settings-owner^='AO_SETTINGS_V']","[data-v37-module='utility.settings']","[data-module='utility.settings']"];
  const donor=createSettingsDonorState(win);
  win.AO_SETTINGS_DONOR_V4359=donor;
  let route="/settings",returnSurface="home",previousFocus=null,unsubscribe=null,legacyObserver=null,releaseObserver=null;

  const root=()=>win?.document?.getElementById?.("ao-settings-modular-root")||null;
  const isLive=()=>Boolean(liveGuards()?.status?.().live);
  function suppressHistorical(){
    const doc=win?.document,s=state(),st=store();
    if(s?.homeSheet==="settings"&&typeof st?.dispatch==="function")st.dispatch({type:"home-sheet",sheet:null});
    for(const selector of historicalSelectors)for(const node of doc?.querySelectorAll?.(selector)||[]){
      if(node.id==="ao-settings-modular-root")continue;
      if(doc.activeElement&&node.contains?.(doc.activeElement))try{doc.activeElement.blur?.();}catch{}
      node.hidden=true;node.removeAttribute?.("aria-hidden");
    }
  }
  function historicalVisible(){
    const doc=win?.document;
    return historicalSelectors.some(sel=>[...(doc?.querySelectorAll?.(sel)||[])].some(n=>n.id!=="ao-settings-modular-root"&&!n.hidden&&n.isConnected));
  }
  function paint(){
    const r=root();if(!r)return false;
    r.dataset.aoSettingsOwner="AO_SETTINGS_APP_V1";
    r.dataset.aoSettingsPresentationOwner=SETTINGS_PRESENTATION_VERSION;
    r.dataset.aoSettingsRoute=route;
    r.innerHTML=renderSettingsToString(win,{route,live:isLive()});
    return true;
  }
  function subscribe(){
    if(unsubscribe)return;
    const st=store();
    if(typeof st?.subscribe==="function")unsubscribe=st.subscribe(()=>{if(root())(win.queueMicrotask?.bind(win)||queueMicrotask)(paint);});
  }
  function watchHistorical(){
    if(legacyObserver||typeof win?.MutationObserver!=="function")return;
    legacyObserver=new win.MutationObserver(()=>{if(root())suppressHistorical();});
    legacyObserver.observe(win.document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","class","aria-hidden"]});
  }
  function watchRelease(){
    if(releaseObserver||typeof win?.MutationObserver!=="function")return;
    releaseObserver=new win.MutationObserver(records=>{if(root()&&records.some(x=>x.type==="attributes"&&x.attributeName==="data-ao-release"))paint();});
    releaseObserver.observe(win.document.documentElement,{attributes:true,attributeFilter:["data-ao-release"]});
  }
  function release(){
    try{unsubscribe?.();}catch{}unsubscribe=null;
    try{legacyObserver?.disconnect?.();}catch{}legacyObserver=null;
    try{releaseObserver?.disconnect?.();}catch{}releaseObserver=null;
  }
  function restoreFocus(){
    const prior=previousFocus;
    if(prior?.isConnected&&!prior.hidden&&!prior.closest?.("[hidden],[inert]"))try{prior.focus?.();return true;}catch{}
    const reader=win?.document?.getElementById?.("ao-r17-native-reader-preview");
    const target=reader?.querySelector?.("button,[href],[tabindex]:not([tabindex='-1'])");if(target)try{target.focus?.();return true;}catch{}
    return false;
  }
  function closeInternal({restoreSurface=false,surface=null}={}){
    const r=root();if(r){
      if(win.document.activeElement&&r.contains(win.document.activeElement))try{win.document.activeElement.blur?.();}catch{}
      r.remove?.();
    }
    release();
    if(win.document?.documentElement?.dataset){delete win.document.documentElement.dataset.aoSettingsSurface;win.document.documentElement.dataset.aoSettingsOwner="AO_SETTINGS_APP_V1";}
    if(restoreSurface){
      const target=surface||returnSurface||"home";
      try{shell()?.syncSurface?.(target);}catch{}
      try{win?.AO_GLOBAL_RIBBON_V4323?.setActive?.(target);}catch{}
    }
    restoreFocus();previousFocus=null;return true;
  }
  function close(){return closeInternal({restoreSurface:true});}
  function dismiss(){return closeInternal({restoreSurface:false});}
  function restoreHome(){closeInternal({restoreSurface:false});try{shell()?.syncSurface?.("home");}catch{}return true;}
  function go(next){
    route=normalizeSettingsRoute(next);paint();
    (win.queueMicrotask?.bind(win)||queueMicrotask)(()=>root()?.querySelector?.("[data-settings-back],[data-settings-close]")?.focus?.());
    return true;
  }
  function back(){
    if(route==="/settings")return close();
    if(route.startsWith("/settings/local-customs/"))return go("/settings/local-customs");
    return go("/settings");
  }
  function open(target="/settings"){
    const doc=win?.document,st=store();
    if(!doc?.body||typeof st?.getState!=="function")return false;
    if(!root()){
      previousFocus=doc.activeElement;
      const current=shell()?.getActive?.();
      returnSurface=current&&current!=="settings"?current:(isLive()?"mass":"home");
    }
    route=normalizeSettingsRoute(target);suppressHistorical();
    let r=root();
    if(!r){
      r=doc.createElement("section");r.id="ao-settings-modular-root";r.dataset.aoAssetId=canonicalAssetIdForSurface("settings")||"";r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");doc.body.appendChild(r);bind(r);
    }
    subscribe();watchHistorical();watchRelease();donor.syncEffects();paint();
    if(doc.documentElement?.dataset){doc.documentElement.dataset.aoSettingsOwner="AO_SETTINGS_APP_V1";doc.documentElement.dataset.aoSettingsSurface="open";}
    r.querySelector?.(route==="/settings"?"[data-settings-close]":"[data-settings-back]")?.focus?.();
    return true;
  }
  function mutate(fn){
    try{fn();liveGuards()?.sync?.();paint();return true;}catch(error){console.error("Settings update failed",error);return false;}
  }
  function confirmAction(message){try{return win.confirm?.(message)!==false;}catch{return true;}}
  function bind(r){
    r.addEventListener("click",event=>{
      const button=event.target?.closest?.("button");if(!button)return;
      if(button.dataset.settingsClose!==undefined){event.preventDefault();close();return;}
      if(button.dataset.settingsBack!==undefined){event.preventDefault();back();return;}
      if(button.dataset.settingsRoute){event.preventDefault();go(button.dataset.settingsRoute);return;}
      if(button.dataset.prefPath&&button.dataset.prefValue!==undefined){event.preventDefault();mutate(()=>donor.setPath(button.dataset.prefPath,button.dataset.prefValue));return;}
      if(button.dataset.prefToggle){event.preventDefault();mutate(()=>donor.togglePath(button.dataset.prefToggle));return;}
      if(button.dataset.profileDefault!==undefined){event.preventDefault();mutate(()=>donor.setPath("mass.defaultProfileId",null));return;}
      if(button.dataset.profileAdd!==undefined){event.preventDefault();const id=donor.createProfile(donor.snapshot().preferences.general.uiLanguage==="fr"?"Profil d’église":"Church profile");go("/settings/local-customs/"+encodeURIComponent(id));return;}
      if(button.dataset.profileUseDefault){event.preventDefault();const snap=donor.snapshot(),id=button.dataset.profileUseDefault;mutate(()=>donor.setPath("mass.defaultProfileId",snap.preferences.mass.defaultProfileId===id?null:id));return;}
      if(button.dataset.profileDelete){event.preventDefault();if(confirmAction(donor.snapshot().preferences.general.uiLanguage==="fr"?"Supprimer ce profil ?":"Delete this profile?")){donor.deleteProfile(button.dataset.profileDelete);go("/settings/local-customs");}return;}
      if(button.dataset.dataAction){event.preventDefault();if(!confirmAction(donor.snapshot().preferences.general.uiLanguage==="fr"?"Êtes-vous sûr ?":"Are you sure?"))return;mutate(()=>donor.clearData(button.dataset.dataAction));return;}
    });
    r.addEventListener("change",event=>{
      const el=event.target;
      if(el?.dataset?.prefSelect){mutate(()=>donor.setPath(el.dataset.prefSelect,el.value));return;}
      if(el?.dataset?.profileId&&el?.dataset?.profileKey){mutate(()=>donor.updateProfile(el.dataset.profileId,el.dataset.profileKey,el.value));}
    });
    r.addEventListener("focusout",event=>{
      const el=event.target;if(el?.dataset?.profileName)mutate(()=>donor.renameProfile(el.dataset.profileName,el.value));
    });
    r.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();back();}});
  }
  function status(){
    const r=root();
    return Object.freeze({
      version:"modular-settings-v4359.6",installed:true,open:Boolean(r?.isConnected),owner:r?.dataset?.aoSettingsOwner||"AO_SETTINGS_APP_V1",
      presentationOwner:r?.dataset?.aoSettingsPresentationOwner||SETTINGS_PRESENTATION_VERSION,route:route==="/settings/about-sources"?"about-sources":route,path:route,returnSurface,
      liveSessionGuarded:isLive(),structuralLocked:isLive(),historicalSettingsVisible:historicalVisible(),
      embeddedHomeSettingsVisible:Boolean(doc?.querySelector?.(".homeSheet [data-ao-home-settings],.homeSheet[data-ao-home-settings]")),
      donorVersion:donor.version,profileCount:donor.snapshot().profiles.length
    });
  }
  return Object.freeze({version:"modular-settings-v4359.6",owner:"AO_SETTINGS_APP_V1",open,close,dismiss,restoreHome,setRoute:go,back,paint,status,donorSnapshot:donor.snapshot});
}

export function installSettingsBrowserOwner(win=globalThis){
  if(win?.AO_SETTINGS_APP_V1)return win.AO_SETTINGS_APP_V1;
  const api=createSettingsOwner(win);win.AO_SETTINGS_APP_V1=api;
  const installLauncher=()=>{
    const doc=win?.document;if(!doc?.addEventListener||doc.documentElement?.dataset?.aoSettingsLauncherOwner==="AO_SETTINGS_APP_V1")return;
    doc.documentElement.dataset.aoSettingsLauncherOwner="AO_SETTINGS_APP_V1";
    doc.addEventListener("click",event=>{
      const target=event.target?.closest?.("[data-ao-settings-open],[data-home-open-settings],[data-v37-open='utility.settings']");if(!target)return;
      event.preventDefault?.();event.stopImmediatePropagation?.();
      const appShell=win?.AO_APP_SHELL_V1;if(typeof appShell?.navigate==="function")void appShell.navigate("settings");else api.open();
    },true);
  };
  if(win?.document?.readyState==="loading")win.document.addEventListener("DOMContentLoaded",installLauncher,{once:true});else installLauncher();
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installSettingsBrowserOwner(window);
