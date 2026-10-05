import { canonicalAssetIdForSurface } from "../assets/asset-registry.js";
import {
  SETTINGS_PRESENTATION_VERSION,
  renderSettingsToString,
} from "./presentation.js";

export const VERSION="modular-settings-v1";
export const OWNER="AO_SETTINGS_APP_V1";
export const ROOT_ID="ao-settings-modular-root";

const runtime=win=>win?.AO_RUNTIME_V8??null;
const store=win=>runtime(win)?.store??null;
const state=win=>store(win)?.getState?.()??null;
const shell=win=>win?.AO_APP_SHELL_V1??null;
const liveGuards=win=>win?.AO_APP_LIVE_SESSION_GUARDS_V1??null;

function focusSafeRemove(win,node){
  if(!node)return;
  const active=win?.document?.activeElement;
  if(active&&node.contains?.(active)){try{active.blur?.();}catch{}}
  node.remove?.();
}
const HISTORICAL_SETTINGS_SELECTORS=[
  "#ao-settings-v4359",
  "#ao-settings-v4358",
  "#ao-settings-v4356",
  "[data-ao-settings-owner^='AO_SETTINGS_V']",
  "[data-v37-module='utility.settings']",
  "[data-module='utility.settings']",
];

function historicalSettingsVisible(win){
  const doc=win?.document;
  return HISTORICAL_SETTINGS_SELECTORS.some(selector=>[...doc?.querySelectorAll?.(selector)??[]].some(node=>!node.hidden&&node.isConnected));
}
function suppressHistoricalSettings(win){
  const s=state(win),st=store(win);
  if(s?.homeSheet==="settings"&&typeof st?.dispatch==="function")st.dispatch({type:"home-sheet",sheet:null});
  const doc=win?.document;
  for(const selector of HISTORICAL_SETTINGS_SELECTORS){
    for(const node of doc?.querySelectorAll?.(selector)??[]){
      if(node.id===ROOT_ID)continue;
      const active=doc.activeElement;if(active&&node.contains?.(active)){try{active.blur?.();}catch{}}
      if(!node.hidden)node.hidden=true;
      if(node.hasAttribute?.("aria-hidden"))node.removeAttribute?.("aria-hidden");
    }
  }
}
function live(win){return Boolean(liveGuards(win)?.status?.().live);}
function normalizeRoute(value){return String(value??"").includes("about-sources")?"about-sources":"main";}
function dispatch(win,action){const st=store(win);if(typeof st?.dispatch!=="function")return false;st.dispatch(action);return true;}
function patchSettings(win,patch){return dispatch(win,{type:"hydrate-settings",settings:patch});}
function restoreFocus(win,previous){
  if(previous?.isConnected&&!previous.hidden&&!previous.closest?.("[hidden],[inert]")){try{previous.focus?.();return true}catch{}}
  const reader=win?.document?.getElementById?.("ao-r17-native-reader-preview");
  const target=reader?.querySelector?.("button,[href],[tabindex]:not([tabindex='-1'])");
  if(target){try{target.focus?.();return true}catch{}}
  return false;
}

export function createSettingsOwner(win=globalThis){
  let route="main";
  let returnSurface="home";
  let previousFocus=null;
  let unsubscribe=null;
  let legacyObserver=null;
  let versionTimers=[];

  function root(){return win?.document?.getElementById?.(ROOT_ID)??null;}
  function clearTimers(){for(const id of versionTimers){try{win?.clearTimeout?.(id);}catch{}}versionTimers=[];}
  function paint(){
    const r=root();if(!r)return false;
    r.dataset.aoSettingsOwner=OWNER;
    r.dataset.aoSettingsPresentationOwner=SETTINGS_PRESENTATION_VERSION;
    r.dataset.aoSettingsRoute=route;
    r.innerHTML=renderSettingsToString(win,{route,live:live(win)});
    return true;
  }
  function subscribe(){
    if(unsubscribe)return;
    const st=store(win);
    if(typeof st?.subscribe==="function")unsubscribe=st.subscribe(()=>{if(root())(win.queueMicrotask?.bind(win)??queueMicrotask)(paint);});
  }
  function releaseSubscription(){
    try{unsubscribe?.();}catch{}
    unsubscribe=null;
    try{legacyObserver?.disconnect?.();}catch{}
    legacyObserver=null;
    clearTimers();
  }
  function watchHistoricalSurfaces(){
    if(legacyObserver||typeof win?.MutationObserver!=="function")return;
    legacyObserver=new win.MutationObserver(()=>{if(root())suppressHistoricalSettings(win);});
    legacyObserver.observe(win.document.documentElement,{subtree:true,childList:true,attributes:true,attributeFilter:["hidden","class","aria-hidden"]});
  }
  function closeInternal({restoreSurface=false,surface=null}={}){
    const r=root();if(!r){releaseSubscription();return true;}
    const prior=previousFocus;
    focusSafeRemove(win,r);releaseSubscription();
    if(win?.document?.documentElement?.dataset){
      delete win.document.documentElement.dataset.aoSettingsSurface;
      win.document.documentElement.dataset.aoSettingsOwner=OWNER;
    }
    if(restoreSurface){
      const target=surface||returnSurface||"home";
      try{shell(win)?.syncSurface?.(target);}catch{}
      try{win?.AO_GLOBAL_RIBBON_V4323?.setActive?.(target);}catch{}
    }
    restoreFocus(win,prior);previousFocus=null;
    return true;
  }
  function close(){return closeInternal({restoreSurface:true});}
  function dismiss(){return closeInternal({restoreSurface:false});}
  function restoreHome(){
    closeInternal({restoreSurface:false});
    const st=store(win),s=state(win);if(s?.homeSheet&&typeof st?.dispatch==="function")st.dispatch({type:"home-sheet",sheet:null});
    try{shell(win)?.syncSurface?.("home");}catch{}
    return true;
  }
  function open(target="/settings"){
    const doc=win?.document,st=store(win);
    if(!doc?.body||typeof st?.getState!=="function"||typeof st?.dispatch!=="function")return false;
    const existing=root();
    if(!existing){
      previousFocus=doc.activeElement;
      const current=shell(win)?.getActive?.();
      returnSurface=current&&current!=="settings"?current:(live(win)?"mass":"home");
    }
    route=normalizeRoute(target);
    suppressHistoricalSettings(win);
    let r=root();
    if(!r){r=doc.createElement("section");r.id=ROOT_ID;r.dataset.aoAssetId=canonicalAssetIdForSurface("settings")||"";r.setAttribute("role","dialog");r.setAttribute("aria-modal","true");doc.body.appendChild(r);bind(r);}
    subscribe();watchHistoricalSurfaces();paint();
    if(doc.documentElement?.dataset){doc.documentElement.dataset.aoSettingsOwner=OWNER;doc.documentElement.dataset.aoSettingsSurface="open";}
    clearTimers();versionTimers=[100,500,1200].map(ms=>win.setTimeout?.(()=>{if(root())paint();},ms)).filter(id=>id!=null);
    r.querySelector?.(route==="about-sources"?"[data-settings-main]":"[data-settings-close]")?.focus?.();
    return true;
  }
  function setRoute(next){route=normalizeRoute(next);return paint();}
  function structuralBlocked(){return live(win);}
  function onSettingClick(target){
    if(target.dataset.settingStructural!==undefined&&structuralBlocked()){liveGuards(win)?.sync?.();return true;}
    if(target.dataset.settingLanguage){dispatch(win,{type:"set-language",language:target.dataset.settingLanguage});return true;}
    if(target.dataset.settingForm){dispatch(win,{type:"live-form",form:target.dataset.settingForm});return true;}
    if(target.dataset.settingFollow){dispatch(win,{type:"live-follow-mode",mode:target.dataset.settingFollow});return true;}
    if(target.dataset.settingText){dispatch(win,{type:"live-text-mode",mode:target.dataset.settingText});return true;}
    if(target.dataset.settingParticipation){dispatch(win,{type:"set-participation",mode:target.dataset.settingParticipation});return true;}
    if(target.dataset.settingPostureProfile){patchSettings(win,{massPostureProfile:target.dataset.settingPostureProfile});return true;}
    if(target.dataset.settingGestureProfile){patchSettings(win,{massGestureProfile:target.dataset.settingGestureProfile});return true;}
    if(target.dataset.settingFaithfulCommunion!==undefined){dispatch(win,{type:"set-faithful-communion",value:target.dataset.settingFaithfulCommunion==="1"});return true;}
    if(target.dataset.settingSecondConfiteor!==undefined){dispatch(win,{type:"set-second-confiteor",value:target.dataset.settingSecondConfiteor==="1"});return true;}
    if(target.dataset.settingJoinConfiteor!==undefined){dispatch(win,{type:"set-join-second-confiteor",value:target.dataset.settingJoinConfiteor==="1"});return true;}
    if(target.dataset.sundayAsperges!==undefined){dispatch(win,{type:"set-sunday-asperges",value:target.dataset.sundayAsperges==="1"});return true;}
    if(target.dataset.settingScale){dispatch(win,{type:"set-text-scale",value:target.dataset.settingScale});return true;}
    if(target.dataset.settingMotion!==undefined){dispatch(win,{type:"set-reduced-motion",value:target.dataset.settingMotion==="1"});return true;}
    if(target.dataset.settingHaptics!==undefined){
      if(structuralBlocked()){liveGuards(win)?.forceHapticsOff?.();paint();return true;}
      try{win?.AO_HAPTICS_V4319?.setEnabled?.(target.dataset.settingHaptics==="1");}catch{}
      paint();return true;
    }
    if(target.dataset.resetPostures!==undefined){dispatch(win,{type:"reset-local-postures"});patchSettings(win,{localMassPostures:{}});return true;}
    return false;
  }
  function bind(r){
    r.addEventListener("click",event=>{
      const target=event.target?.closest?.("button");if(!target)return;
      if(target.dataset.settingsClose!==undefined){event.preventDefault();close();return;}
      if(target.dataset.settingsSources!==undefined){event.preventDefault();setRoute("about-sources");r.querySelector?.("[data-settings-main]")?.focus?.();return;}
      if(target.dataset.settingsMain!==undefined){event.preventDefault();setRoute("main");r.querySelector?.("[data-settings-close]")?.focus?.();return;}
      onSettingClick(target);
    });
    r.addEventListener("keydown",event=>{if(event.key==="Escape"){event.preventDefault();close();}});
  }
  function status(){
    const r=root();
    return Object.freeze({
      version:VERSION,installed:true,open:Boolean(r?.isConnected),owner:r?.dataset?.aoSettingsOwner??OWNER,
      presentationOwner:r?.dataset?.aoSettingsPresentationOwner??SETTINGS_PRESENTATION_VERSION,route,returnSurface,
      liveSessionGuarded:live(win),structuralLocked:live(win),historicalSettingsVisible:historicalSettingsVisible(win),
      embeddedHomeSettingsVisible:Boolean(win?.document?.querySelector?.(".homeSheet [data-ao-home-settings],.homeSheet[data-ao-home-settings]")),
    });
  }
  return Object.freeze({version:VERSION,owner:OWNER,open,close,dismiss,restoreHome,setRoute,paint,status});
}

export function installSettingsBrowserOwner(win=globalThis){
  if(win?.AO_SETTINGS_APP_V1)return win.AO_SETTINGS_APP_V1;
  const api=createSettingsOwner(win);
  win.AO_SETTINGS_APP_V1=api;
  const installLauncher=()=>{
    const doc=win?.document;if(!doc?.addEventListener||doc.documentElement?.dataset?.aoSettingsLauncherOwner===OWNER)return;
    doc.documentElement.dataset.aoSettingsLauncherOwner=OWNER;
    doc.addEventListener("click",event=>{
      const target=event.target?.closest?.("[data-ao-settings-open],[data-home-open-settings],[data-v37-open='utility.settings']");
      if(!target)return;
      event.preventDefault?.();event.stopImmediatePropagation?.();
      const appShell=shell(win);if(typeof appShell?.navigate==="function")void appShell.navigate("settings");else api.open();
    },true);
  };
  if(win?.document?.readyState==="loading")win.document.addEventListener("DOMContentLoaded",installLauncher,{once:true});else installLauncher();
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installSettingsBrowserOwner(window);
