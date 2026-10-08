import { canonicalAssetIdForSurface } from "../assets/asset-registry.js";
import {
  LEARN_DONOR_RELEASE,
  LEARN_MODULE_IDS,
  LEARN_PRESENTATION_VERSION,
  renderLearnPresentation,
} from "./presentation.js";
import { ensureTraditionalLearnRegistry, installTraditionalLearnModules, TRADITIONAL_LEARN_ROUTES } from "./traditional-life.js";
import { ensureSexualEthicsRegistry, installSexualEthicsModule } from "./sexual-ethics.js";
import { ensureSpiritualLifeRegistry, installSpiritualLifeModule } from "./spiritual-life.js";
import { SPIRITUAL_LIFE_ROUTE_ID } from "./spiritual-life-data.js";
import { ensureLatinCourseRegistry, installLatinCourseModule, LATIN_COURSE_ROUTE_ID } from "./latin-course-v2.js";
import { ensureGlossaryRegistry, installGlossaryModule, GLOSSARY_ROUTE_ID } from "../glossary/browser-entry.js";
import { ensureMassFormationRegistry, installMassFormationModule, MASS_FORMATION_ROUTE } from "./mass-formation.js";

const VERSION="modular-learn-v1";
const ROOT_ID="ao-learn-modular-root";
const MODULE_SET=new Set([...LEARN_MODULE_IDS,"today.saint","today.gospel",SPIRITUAL_LIFE_ROUTE_ID]);

function runtime(win){return win?.AO_RUNTIME_V8??null;}
function appState(win){return runtime(win)?.store?.getState?.()??null;}
function root(win){return win?.document?.getElementById?.(ROOT_ID)??null;}
function donorRoot(win){return win?.document?.getElementById?.("ao-v37-root")??null;}
function isFr(win){return appState(win)?.language==="fr";}
function L(win,en,fr){return isFr(win)?fr:en;}

function releaseFocus(win,node){
  const active=win?.document?.activeElement;
  if(node?.contains?.(active)){
    try{active.blur?.();}catch{}
  }
}

function retireHistoricalLearnSurface(win){
  try{win?.AO_V37_SHELL?.close?.();}catch{}
  const donor=donorRoot(win);
  if(donor){
    releaseFocus(win,donor);
    donor.hidden=true;
    donor.setAttribute?.("aria-hidden","true");
  }
  win?.document?.body?.classList?.remove?.("aoV37ShellOpen");
}

function childOpen(win,id){
  if(id===LATIN_COURSE_ROUTE_ID)return Boolean(win?.AO_LATIN_COURSE_V1?.status?.()?.open);
  if(id===GLOSSARY_ROUTE_ID)return Boolean(win?.AO_GLOSSARY_V1?.status?.()?.open);
  if(id===MASS_FORMATION_ROUTE)return Boolean(win?.AO_MASS_FORMATION_V1?.status?.()?.open);
  if(id==="learn.sexual_ethics")return Boolean(win?.AO_SEXUAL_ETHICS_V1?.status?.()?.open);
  if(id===SPIRITUAL_LIFE_ROUTE_ID)return Boolean(win?.AO_SPIRITUAL_LIFE_V1?.status?.()?.open);
  if(TRADITIONAL_LEARN_ROUTES[id]){const s=win?.AO_TRADITIONAL_LEARN_V381?.status?.();return Boolean(s?.open&&s?.route===id)}
  if(id==="learn.mass"){
    const node=win?.document?.getElementById?.("ao-learn-root");
    return Boolean(node&&!node.hidden);
  }
  if(id==="learn.catechism"){
    const node=win?.document?.getElementById?.("ao-cate-root");
    return Boolean(node&&!node.hidden);
  }
  if(id==="learn.catechism.daily"){
    const node=win?.document?.getElementById?.("ao-daily-cate-root");
    return Boolean(node&&!node.hidden&&node.getAttribute?.("aria-hidden")!=="true");
  }
  if(id==="today.saint"){
    try{return win?.AO_NAV_V25?.getState?.()?.panel==="saint";}catch{return Boolean(win?.document?.getElementById?.("ao-v25-panel"));}
  }
  if(id==="today.gospel")return appState(win)?.route==="scripture";
  return false;
}

function closeChild(win,id){
  try{
    if(id===LATIN_COURSE_ROUTE_ID){win?.AO_LATIN_COURSE_V1?.close?.();return true;}
    if(id===GLOSSARY_ROUTE_ID){win?.AO_GLOSSARY_V1?.close?.();return true;}
    if(id===MASS_FORMATION_ROUTE){win?.AO_MASS_FORMATION_V1?.close?.();return true;}
    if(id==="learn.sexual_ethics"){win?.AO_SEXUAL_ETHICS_V1?.close?.();return true;}
    if(id===SPIRITUAL_LIFE_ROUTE_ID){win?.AO_SPIRITUAL_LIFE_V1?.close?.();return true;}
    if(TRADITIONAL_LEARN_ROUTES[id]){win?.AO_TRADITIONAL_LEARN_V381?.close?.();return true;}
    if(id==="learn.catechism"){win?.AO_TRADITIONAL_CATECHISM?.close?.();return true;}
    if(id==="learn.catechism.daily"){win?.AO_DAILY_CATECHISM?.close?.();return true;}
    if(id==="today.saint"&&win?.AO_NAV_V25?.getState?.()?.panel==="saint"){win.AO_NAV_V25.closePanel?.();return true;}
    if(id==="today.gospel"&&appState(win)?.route==="scripture"){runtime(win)?.store?.dispatch?.({type:"scripture-close"});return true;}
  }catch{}
  return false;
}

export function createLearnOwner(win=globalThis,{pollMs=80,maxOpenPolls=30}={}){
  const state={open:false,child:null,family:null,lastFamily:null,externalReturn:null,error:"",monitor:null,unsub:null,lastLauncher:null,openPolls:0,seenChild:false};

  function cancelMonitor(){
    if(state.monitor&&typeof win?.clearTimeout==="function")win.clearTimeout(state.monitor);
    state.monitor=null;
  }

  function markRouteOwner(){
    if(win?.document?.documentElement?.dataset)win.document.documentElement.dataset.aoLearnRouteOwner=VERSION;
  }

  function paint(){
    const node=root(win);
    if(!node||!state.open)return false;
    renderLearnPresentation(node,appState(win),win,{error:state.error,familyId:state.family});
    node.dataset.aoLearnOwner=VERSION;
    markRouteOwner();
    return true;
  }

  function ensureRoot(){
    const doc=win?.document;
    if(!doc?.body)return null;
    let node=root(win);
    if(node)return node;
    node=doc.createElement("section");
    node.id=ROOT_ID;
    node.dataset.aoLearnOwner=VERSION;
    node.dataset.aoAssetId=canonicalAssetIdForSurface("learn")||"";
    node.dataset.aoLearnDonorRelease=LEARN_DONOR_RELEASE;
    node.setAttribute("role","region");
    node.setAttribute("aria-label","Formation");
    node.addEventListener("click",event=>{
      const back=event.target?.closest?.("[data-ao-learn-back]");
      if(back){
        event.preventDefault?.();
        if(state.family){
          state.lastFamily=state.family;
          state.family=null;
          paint();
          const queue=typeof win?.queueMicrotask==="function"?win.queueMicrotask.bind(win):queueMicrotask;
          queue(()=>root(win)?.querySelector?.(`[data-ao-learn-family="${state.lastFamily}"]`)?.focus?.({preventScroll:true}));
          return;
        }
        void win?.AO_APP_SHELL_V1?.navigate?.("home");
        return;
      }
      const home=event.target?.closest?.("[data-ao-learn-home]");
      if(home){
        event.preventDefault?.();
        void win?.AO_APP_SHELL_V1?.navigate?.("home");
        return;
      }
      const family=event.target?.closest?.("[data-ao-learn-family]");
      if(family){
        event.preventDefault?.();
        const id=family.dataset?.aoLearnFamily??null;
        if(id){
          state.family=id;
          state.lastFamily=id;
          state.error="";
          paint();
          const queue=typeof win?.queueMicrotask==="function"?win.queueMicrotask.bind(win):queueMicrotask;
          queue(()=>root(win)?.querySelector?.("[data-ao-learn-module]")?.focus?.({preventScroll:true}));
        }
        return;
      }
            const apostolate=event.target?.closest?.("[data-ao-learn-apostolate]");
      if(apostolate){
        event.preventDefault?.();
        void win?.AO_APP_SHELL_V1?.navigate?.("apostolate");
        return;
      }
      const launch=event.target?.closest?.("[data-ao-learn-module]");
      if(launch){
        event.preventDefault?.();
        state.lastLauncher=launch.dataset?.aoLearnModule??null;
        void openModule(state.lastLauncher);
      }
    });
    node.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&!state.child){
        event.preventDefault?.();
        void win?.AO_APP_SHELL_V1?.navigate?.("home");
      }
    });
    doc.body.append(node);
    return node;
  }

  function attach(){
    if(state.unsub)return true;
    const store=runtime(win)?.store;
    if(typeof store?.subscribe!=="function")return false;
    state.unsub=store.subscribe(()=>{
      if(state.open&&!state.child)queueMicrotask(paint);
    });
    return true;
  }

  function hideHub(){
    const node=root(win);
    if(!node)return;
    releaseFocus(win,node);
    node.hidden=true;
    node.setAttribute("aria-hidden","true");
    try{node.inert=true;}catch{}
  }

  function showHub({focus=true}={}){
    if(!state.open)return false;
    const node=ensureRoot();
    if(!node)return false;
    node.hidden=false;
    node.removeAttribute("aria-hidden");
    try{node.inert=false;}catch{}
    paint();
    if(focus){
      const selector=state.lastLauncher&&state.family
        ?`[data-ao-learn-module="${state.lastLauncher}"]`
        :state.family
          ?"[data-ao-learn-module]"
          :"[data-ao-learn-back]";
      const queue=typeof win?.queueMicrotask==="function"?win.queueMicrotask.bind(win):queueMicrotask;
      queue(()=>root(win)?.querySelector?.(selector)?.focus?.({preventScroll:true}));
    }
    return true;
  }

  function monitorChild(){
    cancelMonitor();
    if(!state.open||!state.child)return;
    const openNow=childOpen(win,state.child);
    if(openNow)state.seenChild=true;
    if(state.seenChild&&!openNow){
      state.child=null;
      state.openPolls=0;
      state.seenChild=false;
      state.error="";
      const external=state.externalReturn;
      state.externalReturn=null;
      if(external?.surface==="apostolate"){
        state.open=false;
        cancelMonitor();
        const node=root(win);
        releaseFocus(win,node);
        node?.remove?.();
        win?.document?.body?.classList?.remove?.("aoLearnModularOpen");
        void win?.AO_APP_SHELL_V1?.navigate?.("apostolate");
        return;
      }
      showHub();
      try{win?.AO_APP_SHELL_V1?.syncSurface?.("learn");}catch{}
      return;
    }
    state.openPolls+=1;
    if(!state.seenChild&&state.openPolls>maxOpenPolls){
      const failed=state.child;
      state.child=null;
      state.openPolls=0;
      state.error=L(win,"This module could not be opened.","Ce module n’a pas pu être ouvert.");
      showHub();
      try{win?.console?.error?.("Modular Learn child did not become visible",failed);}catch{}
      return;
    }
    if(typeof win?.setTimeout==="function")state.monitor=win.setTimeout(monitorChild,pollMs);
  }

  async function openModule(id,opts={}){
    win.__AO_LEARN_GLOSS_TRACE?.push(['learn-openModule-enter',id,Date.now(),state.open,state.child]);
    if(!state.open||!MODULE_SET.has(id))return false;
    ensureTraditionalLearnRegistry(win);
    ensureLatinCourseRegistry(win);
    ensureGlossaryRegistry(win);
    ensureMassFormationRegistry(win);
    ensureSexualEthicsRegistry(win);
    ensureSpiritualLifeRegistry(win);
    const registry=win?.AO_MODULES;
    if(typeof registry?.open!=="function"){
      state.error=L(win,"This module could not be opened.","Ce module n’a pas pu être ouvert.");
      paint();
      return false;
    }
    retireHistoricalLearnSurface(win);
    try{win?.AO_NAV_V362?.clearExternalReturn?.();}catch{}
    state.child=id;
    state.externalReturn=opts?.returnContext??null;
    state.error="";
    state.seenChild=false;
    state.openPolls=0;
    hideHub();
    win.__AO_LEARN_GLOSS_TRACE?.push(['learn-hidden',Date.now(),state.child]);
    let result=null;
    try{
      if(id===GLOSSARY_ROUTE_ID&&typeof win?.AO_GLOSSARY_V1?.open==="function"){
        // Glossary's existing canonical owner is authoritative. Registry wrappers
        // from other Formation modules may advertise the route without actually
        // dispatching it; open the owner directly on this known Learn child.
        const opened=await win.AO_GLOSSARY_V1.open({origin:"learn"});
        result={ok:opened!==false,canonicalId:GLOSSARY_ROUTE_ID};
      }else result=await registry.open(id);
    }catch(error){
      try{win?.console?.error?.("Modular Learn module launch failed",error);}catch{}
    }
    if(result?.ok!==true){
      state.child=null;
      state.error=L(win,"This module could not be opened.","Ce module n’a pas pu être ouvert.");
      showHub();
      return false;
    }
    win.__AO_LEARN_GLOSS_TRACE?.push(['learn-open-result',Date.now(),id,JSON.stringify(result),childOpen(win,id)]);
    state.seenChild=childOpen(win,id);
    monitorChild();
    return true;
  }

  function close(){
    win.__AO_LEARN_GLOSS_TRACE?.push(['learn-close',Date.now(),state.child]);
    state.open=false;
    cancelMonitor();
    if(state.child)closeChild(win,state.child);
    state.child=null;
    state.family=null;
    state.lastFamily=null;
    state.externalReturn=null;
    state.seenChild=false;
    state.openPolls=0;
    const node=root(win);
    releaseFocus(win,node);
    node?.remove?.();
    win?.document?.body?.classList?.remove?.("aoLearnModularOpen");
    return true;
  }

  function open(){
    win.__AO_LEARN_GLOSS_TRACE?.push(['learn-open',Date.now(),state.child]);
    const doc=win?.document;
    if(!doc?.body||!runtime(win)?.store||typeof win?.AO_MODULES?.open!=="function")return false;
    cancelMonitor();
    if(state.child)closeChild(win,state.child);
    state.open=true;
    state.child=null;
    state.family=null;
    state.lastFamily=null;
    state.seenChild=false;
    state.openPolls=0;
    state.error="";
    retireHistoricalLearnSurface(win);
    const node=ensureRoot();
    if(!node){state.open=false;return false;}
    attach();
    doc.body.classList.add("aoLearnModularOpen");
    node.hidden=false;
    node.removeAttribute("aria-hidden");
    try{node.inert=false;}catch{}
    paint();
    markRouteOwner();
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("learn");}catch{}
    const queue=typeof win?.queueMicrotask==="function"?win.queueMicrotask.bind(win):queueMicrotask;
    queue(()=>root(win)?.querySelector?.("[data-ao-learn-home]")?.focus?.({preventScroll:true}));
    return true;
  }

  function status(){
    const node=root(win),donor=donorRoot(win);
    return Object.freeze({
      version:VERSION,
      installed:true,
      open:Boolean(state.open&&node&&!node.hidden),
      child:state.child,
      family:state.family,
      externalReturn:state.externalReturn,
      owner:node?.dataset?.aoLearnOwner??null,
      presentationOwner:node?.dataset?.aoLearnPresentationOwner??LEARN_PRESENTATION_VERSION,
      routeOwner:win?.document?.documentElement?.dataset?.aoLearnRouteOwner??null,
      donorRelease:LEARN_DONOR_RELEASE,
      donorShellOpen:Boolean(donor&&!donor.hidden&&win?.document?.body?.classList?.contains?.("aoV37ShellOpen")),
      donorRootHidden:donor?Boolean(donor.hidden):true,
      modules:[...LEARN_MODULE_IDS],
    });
  }

  function dispose(){
    close();
    try{state.unsub?.();}catch{}
    state.unsub=null;
  }

  return Object.freeze({version:VERSION,open,close,openModule,paint,status,dispose});
}

function maybeOpenFormationResearchPreview(win){
  // Explicit editorial QA URL only. Never register public Formation navigation.
  if(!String(win?.location?.search||"").includes("aoFormationResearchPreview=1"))return;
  void import("./formation-research-preview.js").then(mod=>{
    const preview=mod.installFormationResearchPreview(win);
    if(win?.document?.body)preview.open();
    else win?.document?.addEventListener?.("DOMContentLoaded",()=>preview.open(),{once:true});
  }).catch(error=>{try{win?.console?.error?.("Formation research preview unavailable",error);}catch{}});
}

function maybeOpenFormationRecoveryReview(win){
  // Explicit QA URL gate. Not a Formation module and not an authentication boundary.
  if(!String(win?.location?.search||"").includes("aoFormationRecoveryReview=1"))return;
  void import("./formation-recovery-review.js").then(mod=>{
    const review=mod.installFormationRecoveryReview(win);
    if(win?.document?.body)void review.open();
    else win?.document?.addEventListener?.("DOMContentLoaded",()=>void review.open(),{once:true});
  }).catch(error=>{try{win?.console?.error?.("Formation recovery review unavailable",error);}catch{}});
}

export function installLearnBrowserOwner(win=globalThis){
  if(win?.AO_LEARN_APP_V1)return win.AO_LEARN_APP_V1;
  installTraditionalLearnModules(win);
  installLatinCourseModule(win);
  installGlossaryModule(win);
  installMassFormationModule(win);
  installSexualEthicsModule(win);
  installSpiritualLifeModule(win);
  const api=createLearnOwner(win);
  win.AO_LEARN_APP_V1=api;
  maybeOpenFormationResearchPreview(win);
  maybeOpenFormationRecoveryReview(win);
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installLearnBrowserOwner(window);
