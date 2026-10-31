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
  let route="/settings",routeHistory=[],returnSurface="home",previousFocus=null,unsubscribe=null,legacyObserver=null,releaseObserver=null;
  let checkingUpdates=false,applyingUpdate=false,updateCheck="idle";
  let familyOpen=1,resetAsk=false;

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
    // Preference updates rebuild the donor markup. Keep keyboard focus on
    // the *same preference* rather than silently dumping the user onto body.
    const previous=win.document?.activeElement;
    const focusFields=["prefPath","prefValue","prefToggle","prefSelect","settingsRoute",
      "settingsBack","settingsClose","settingsCheckUpdate","settingsApplyUpdate","profileId","profileKey","profileName","prefFamily","settingsContents"];
    const activeFields=previous&&r.contains(previous)
      ?focusFields.filter(key=>previous.dataset?.[key]!==undefined)
        .map(key=>[key,previous.dataset[key]]):[];
    r.dataset.aoSettingsOwner="AO_SETTINGS_APP_V1";
    r.dataset.aoSettingsPresentationOwner=SETTINGS_PRESENTATION_VERSION;
    r.dataset.aoSettingsRoute=route;
    const scrollY=r.querySelector(".aoSetWrap")?.scrollTop??0;
    const menuOpen=r.querySelector("[data-settings-contents]")?.getAttribute("aria-expanded")==="true";
    r.innerHTML=renderSettingsToString(win,{route,live:isLive(),updateCheck:checkingUpdates?"checking":updateCheck,familyOpen,resetAsk});
    const scroller=r.querySelector(".aoSetWrap");if(scroller)scroller.scrollTop=scrollY;
    if(menuOpen){const menu=r.querySelector("[data-settings-toc]"),ribbon=r.querySelector("[data-settings-contents]");if(menu)menu.hidden=false;if(ribbon)ribbon.setAttribute("aria-expanded","true");}
    if(activeFields.length){
      const candidate=[...r.querySelectorAll("button,input,select,textarea")]
        .find(el=>activeFields.every(([key,value])=>el.dataset?.[key]===value));
      try{candidate?.focus?.({preventScroll:true})}catch{}
    }
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
    release();routeHistory=[];resetAsk=false;
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
  function go(next,{remember=true}={}){
    const target=normalizeSettingsRoute(next);
    if(remember&&root()&&target!==route)routeHistory.push(route);
    route=target;resetAsk=false;paint();
    const panel=root()?.querySelector(".aoSetWrap");if(panel)panel.scrollTop=0;
    (win.queueMicrotask?.bind(win)||queueMicrotask)(()=>root()?.querySelector?.("[data-settings-back],[data-settings-close]")?.focus?.());
    return true;
  }
  function back(){
    if(routeHistory.length)return go(routeHistory.pop(),{remember:false});
    if(route==="/settings")return close();
    if(route.startsWith("/settings/local-customs/"))return go("/settings/local-customs",{remember:false});
    return go("/settings",{remember:false});
  }
  function open(target="/settings"){
    const doc=win?.document,st=store();
    if(!doc?.body||typeof st?.getState!=="function")return false;
    if(!root()){
      previousFocus=doc.activeElement;
      const current=shell()?.getActive?.();
      returnSurface=current&&current!=="settings"?current:(isLive()?"mass":"home");
    }
    routeHistory=[];route=normalizeSettingsRoute(target);resetAsk=false;suppressHistorical();
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
  function confirmAction(message){try{return typeof win.confirm==="function"&&win.confirm(message)===true;}catch{return false;}}
  function bind(r){
    // Page turn is deliberate. Vertical scrolling never advances a chapter.
    // Form controls and the independently scrollable contents ribbon do not
    // initiate a page turn.
    const bookRoutes=["/settings","/settings/accessibility","/settings/language-reading",
      "/settings/mass","/settings/local-customs","/settings/prayer",
      "/settings/general","/settings/privacy-data","/settings/about-sources"];
    function turnChapter(delta){
      const i=bookRoutes.indexOf(route),next=i+delta;
      if(i<0||next<0||next>=bookRoutes.length)return false;
      go(bookRoutes[next]);return true;
    }
    let bookTouch=null;
    r.addEventListener("pointerdown",event=>{
      const elem=event.target;
      if(!elem?.closest?.(".aoSetWrap")||elem.closest?.("button,input,select,textarea,a,[contenteditable],[data-settings-toc]")){
        bookTouch=null;return;
      }
      bookTouch={x:event.clientX,y:event.clientY,id:event.pointerId};
    });
    r.addEventListener("pointerup",event=>{
      const start=bookTouch;bookTouch=null;
      if(!start||event.pointerId!==start.id)return;
      const dx=event.clientX-start.x,dy=event.clientY-start.y;
      if(Math.abs(dx)<70||Math.abs(dx)<=Math.abs(dy)*1.45)return;
      turnChapter(dx<0?1:-1);
    });
    r.addEventListener("pointercancel",()=>{bookTouch=null;});
    r.addEventListener("click",event=>{
      const button=event.target?.closest?.("button");if(!button)return;
      if(button.dataset.settingsClose!==undefined){event.preventDefault();close();return;}
      if(button.dataset.settingsContents!==undefined){
        event.preventDefault();
        const menu=r.querySelector("[data-settings-toc]");
        if(menu){menu.hidden=!menu.hidden;button.setAttribute("aria-expanded",String(!menu.hidden));}
        return;
      }
      if(button.dataset.prefFamily!==undefined){
        event.preventDefault();
        const selected=Number(button.dataset.prefFamily);
        familyOpen=familyOpen===selected?-1:selected;
        paint();return;
      }
      if(button.dataset.settingsResetAsk!==undefined){
        event.preventDefault();if(isLive())return;
        resetAsk=true;paint();return;
      }
      if(button.dataset.settingsResetCancel!==undefined){
        event.preventDefault();resetAsk=false;paint();return;
      }
      if(button.dataset.settingsResetConfirm!==undefined){
        event.preventDefault();
        if(!resetAsk||isLive())return;
        resetAsk=false;mutate(()=>donor.clearData("reset-all"));return;
      }
      if(button.dataset.settingsBack!==undefined){event.preventDefault();back();return;}
      if(button.dataset.settingsRoute||button.dataset.settingsBookRoute){event.preventDefault();go(button.dataset.settingsRoute||button.dataset.settingsBookRoute);return;}
      if(button.dataset.settingsCheckUpdate!==undefined){
        event.preventDefault();
        if(checkingUpdates||applyingUpdate)return;
        const updater=win?.AO_OFFLINE_APP_V1;
        if(!updater?.status?.supported||!updater?.status?.registered)return;
        checkingUpdates=true;updateCheck="idle";paint();
        Promise.resolve().then(()=>updater.check()).then(result=>{
          updateCheck=result?.ok?(result?.updateAvailable?"ready":"current"):"error";
        }).catch(()=>{updateCheck="error";}).finally(()=>{
          checkingUpdates=false;
          if(root()?.dataset?.aoSettingsRoute==="/settings/about-sources")paint();
        });
        return;
      }
      if(button.dataset.settingsApplyUpdate!==undefined){
        event.preventDefault();
        const updater=win?.AO_OFFLINE_APP_V1;
        const status=updater?.status;
        if(checkingUpdates||applyingUpdate||isLive()||!status?.supported||
          !status?.registered||!status?.pendingVersion||
          status.pendingVersion===status.version||typeof updater.apply!=="function")return;
        applyingUpdate=true;updateCheck="applying";paint();
        // The second deliberate tap invokes the existing transactional worker.
        // Its apply() refuses a live Mass, and reloads only after activation.
        Promise.resolve().then(()=>updater.apply()).then(ok=>{
          updateCheck=ok?"applied":"applyError";
        }).catch(()=>{updateCheck="applyError";}).finally(()=>{
          applyingUpdate=false;
          if(root()?.dataset?.aoSettingsRoute==="/settings/about-sources")paint();
        });
        return;
      }
      if(button.dataset.prefClearToday!==undefined){event.preventDefault();mutate(()=>donor.setPath("mass.todayChoices",null));return;}
      if(button.dataset.prefPath&&button.dataset.prefValue!==undefined){event.preventDefault();const raw=button.dataset.prefValue;const v=raw==="true"?true:raw==="false"?false:raw;mutate(()=>donor.setPath(button.dataset.prefPath,v));return;}
      if(button.dataset.prefToggle){event.preventDefault();mutate(()=>donor.togglePath(button.dataset.prefToggle));return;}
      if(button.dataset.profileDefault!==undefined){event.preventDefault();mutate(()=>donor.setPath("mass.defaultProfileId",null));return;}
      if(button.dataset.profileAdd!==undefined){event.preventDefault();const id=donor.createProfile(donor.snapshot().preferences.general.uiLanguage==="fr"?"Profil d’église":"Church profile");go("/settings/local-customs/"+encodeURIComponent(id));return;}
      if(button.dataset.profileId&&button.dataset.profileKey&&button.dataset.profileValue!==undefined){
        event.preventDefault();
        mutate(()=>donor.updateProfile(button.dataset.profileId,button.dataset.profileKey,button.dataset.profileValue));
        return;
      }
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
    r.addEventListener("keydown",event=>{
      if(event.key==="Escape"){event.preventDefault();const menu=r.querySelector("[data-settings-toc]");if(menu&&!menu.hidden){menu.hidden=true;r.querySelector("[data-settings-contents]")?.setAttribute("aria-expanded","false");return;}if(resetAsk){resetAsk=false;paint();return;}back();return;}
      if(["ArrowLeft","ArrowRight"].includes(event.key)){
        if(event.target?.closest?.("button,input,select,textarea,[contenteditable],[data-settings-toc]"))return;
        if(turnChapter(event.key==="ArrowRight"?1:-1))event.preventDefault();
        return;
      }
      if(event.key!=="Tab")return;
      // Settings is a real aria-modal dialog. Never move focus into the
      // dimmed app while the overlay is open, including after preference paint.
      const focusables=[...r.querySelectorAll(
        'button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])'
      )].filter(el=>el.getClientRects().length&&!el.closest("[hidden],[inert],details:not([open])"));
      if(!focusables.length){event.preventDefault();r.tabIndex=-1;r.focus();return;}
      const first=focusables[0],last=focusables[focusables.length-1],active=win.document.activeElement;
      if(event.shiftKey&&(active===first||!r.contains(active))){
        event.preventDefault();last.focus();
      }else if(!event.shiftKey&&(active===last||!r.contains(active))){
        event.preventDefault();first.focus();
      }
    });
  }
  function status(){
    const r=root();
    return Object.freeze({
      version:"modular-settings-v4359.6",installed:true,open:Boolean(r?.isConnected),owner:r?.dataset?.aoSettingsOwner||"AO_SETTINGS_APP_V1",
      presentationOwner:r?.dataset?.aoSettingsPresentationOwner||SETTINGS_PRESENTATION_VERSION,route:route==="/settings/about-sources"?"about-sources":route,path:route,returnSurface,
      liveSessionGuarded:isLive(),structuralLocked:isLive(),historicalSettingsVisible:historicalVisible(),
      embeddedHomeSettingsVisible:Boolean(win?.document?.querySelector?.(".homeSheet [data-ao-home-settings],.homeSheet[data-ao-home-settings]")),
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
