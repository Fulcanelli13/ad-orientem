import { canonicalAssetIdForSurface } from "../assets/asset-registry.js";
import {
  LEARN_DONOR_RELEASE,
  LEARN_MODULE_IDS,
  LEARN_PRESENTATION_VERSION,
  renderLearnPresentation,learnDiscoveryMarkup,
} from "./presentation.js";
import {
  ensureLearnModule,installLazyLearnRegistry,TRADITIONAL_LEARN_ROUTES,
  SPIRITUAL_LIFE_ROUTE_ID,LATIN_COURSE_ROUTE_ID,GLOSSARY_ROUTE_ID,MASS_FORMATION_ROUTE,
} from "./lazy-module-registry.js";
import {loadReferenceDiscovery} from "./discovery.js";

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
    if(id==="learn.catechism"){win?.AO_CATECHISM_GUIDED_MODE_V1?.dispose?.();win?.AO_TRADITIONAL_CATECHISM?.close?.();return true;}
    if(id==="learn.catechism.daily"){win?.AO_DAILY_CATECHISM?.close?.();return true;}
    if(id==="today.saint"&&win?.AO_NAV_V25?.getState?.()?.panel==="saint"){win.AO_NAV_V25.closePanel?.();return true;}
    if(id==="today.gospel"&&appState(win)?.route==="scripture"){runtime(win)?.store?.dispatch?.({type:"scripture-close"});return true;}
  }catch{}
  return false;
}

export function createLearnOwner(win=globalThis,{pollMs=80,maxOpenPolls=30}={}){
  let launchEpoch=0;
  const state={open:false,child:null,family:null,lastFamily:null,externalReturn:null,error:"",monitor:null,unsub:null,lastLauncher:null,openPolls:0,seenChild:false,guidedAttempted:false,discoveryQuery:"",referenceEntries:[],referenceStatus:"idle",lastDiscoveryReference:null};

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
    renderLearnPresentation(node,appState(win),win,{error:state.error,familyId:state.family,discoveryQuery:state.discoveryQuery,referenceEntries:state.referenceEntries,referenceStatus:state.referenceStatus});
    node.dataset.aoLearnOwner=VERSION;
    markRouteOwner();
    return true;
  }

  function updateDiscovery(){
    const node=root(win);
    const results=node?.querySelector?.("[data-ao-learn-discovery-results]");
    if(!results)return false;
    results.innerHTML=learnDiscoveryMarkup(appState(win),win,{
      query:state.discoveryQuery,referenceEntries:state.referenceEntries,referenceStatus:state.referenceStatus
    });
    return true;
  }

  function ensureDiscovery(){
    if(state.referenceStatus==="ready"||state.referenceStatus==="loading")return;
    state.referenceStatus="loading";
    void loadReferenceDiscovery(win).then(entries=>{
      state.referenceEntries=entries;
      state.referenceStatus="ready";
      if(state.open&&!state.child)updateDiscovery();
    }).catch(error=>{
      state.referenceStatus="unavailable";
      try{win?.console?.warn?.("Formation reference discovery unavailable",error)}catch{}
      if(state.open&&!state.child)updateDiscovery();
    });
  }

  async function navigateFromLearn(target){
    const context={
      family:state.family,lastFamily:state.lastFamily,
      query:state.discoveryQuery,reference:state.lastDiscoveryReference,
      launcher:state.lastLauncher
    };
    try{
      const result=await win?.AO_APP_SHELL_V1?.navigate?.(target);
      if(result===true||result?.ok===true)return true;
    }catch(error){
      try{win?.console?.error?.("Formation navigation failed",target,error)}catch{}
    }
    // hardHome() closes Formation before attempting the destination. Recover
    // using the *same* canonical Formation owner, retaining its family/query
    // instead of leaving an empty screen or substituting another module.
    if(!state.open){
      if(!open())return false;
      state.family=context.family;
      state.lastFamily=context.lastFamily;
      state.discoveryQuery=context.query;
      state.lastDiscoveryReference=context.reference;
      state.lastLauncher=context.launcher;
    }
    if(state.open&&!state.child){
      state.error=L(win,"This section could not be opened. Please retry.","Impossible d’ouvrir cette rubrique. Veuillez réessayer.");
      paint();
      try{win?.AO_APP_SHELL_V1?.syncSurface?.("learn")}catch{}
    }
    return false;
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
    node.addEventListener("input",event=>{
      const input=event.target?.closest?.("[data-ao-learn-discovery-search]");
      if(!input)return;
      state.discoveryQuery=String(input.value||"").slice(0,100);
      if(state.discoveryQuery.trim().length>=2)ensureDiscovery();
      updateDiscovery(); // Preserve input focus/caret, don't repaint the root.
    });
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
        void navigateFromLearn("home");
        return;
      }
      const home=event.target?.closest?.("[data-ao-learn-home]");
      if(home){
        event.preventDefault?.();
        void navigateFromLearn("home");
        return;
      }
      // Only a family-door button changes the family. The page root also carries
      // data-ao-learn-family to identify its active family; matching that ancestor
      // would swallow every child module click before it reaches openModule.
      const family=event.target?.closest?.("button[data-ao-learn-family]");
      if(family){
        event.preventDefault?.();
        const id=family.dataset?.aoLearnFamily??null;
        if(id){
          state.family=id;
          state.lastFamily=id;
          state.discoveryQuery="";
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
        void navigateFromLearn("apostolate");
        return;
      }
      const surface=event.target?.closest?.("[data-ao-learn-discovery-surface]");
      if(surface){
        event.preventDefault?.();
        const target=surface.dataset?.aoLearnDiscoverySurface;
        if(["home","mass","pray","calendar","find","apostolate"].includes(target)){
          void navigateFromLearn(target);
        }
        return;
      }
      const launch=event.target?.closest?.("[data-ao-learn-module]");
      if(launch){
        event.preventDefault?.();
        state.lastLauncher=launch.dataset?.aoLearnModule??null;
        const referenceId=launch.dataset?.aoLearnReferenceId??null;
        const referenceKind=launch.dataset?.aoLearnReferenceKind??null;
        state.lastDiscoveryReference=referenceId;
        const familyId=launch.dataset?.aoLearnDiscoveryFamily??null;
        if(familyId){
          state.family=familyId;
          state.lastFamily=familyId;
        }
        const opts=referenceId&&["concept","lexeme","phrase"].includes(referenceKind)
          ?{[referenceKind==="concept"?"entryId":referenceKind==="lexeme"?"lexemeId":"phraseId"]:referenceId}:{};
        void openModule(state.lastLauncher,opts);
      }
    });
    node.addEventListener("keydown",event=>{
      if(event.key==="Escape"&&event.target?.closest?.("[data-ao-learn-discovery-search]")){
        event.preventDefault?.();
        if(state.discoveryQuery){
          state.discoveryQuery="";
          event.target.value="";
          updateDiscovery();
        }else event.target.blur?.();
        return;
      }
      if(event.key==="Escape"&&!state.child){
        event.preventDefault?.();
        void navigateFromLearn("home");
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
      const selector=state.lastDiscoveryReference&&state.discoveryQuery
        ?`[data-ao-learn-reference-id="${state.lastDiscoveryReference}"]`
        :state.lastLauncher&&state.discoveryQuery
          ?`[data-ao-learn-module="${state.lastLauncher}"]`
          :state.lastLauncher&&state.family
            ?`[data-ao-learn-module="${state.lastLauncher}"]`
            :state.family?"[data-ao-learn-module]":"[data-ao-learn-back]";
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
    if(openNow&&state.child==="learn.catechism"&&!state.guidedAttempted){
      state.guidedAttempted=true;
      void import("./catechism-guided-preview-bridge.js").then(mod=>mod.installCatechismGuidedMode(win)).catch(error=>win?.console?.error?.("Catechism guided integration failed",error));
    }
    if(state.seenChild&&!openNow){
      win?.AO_CATECHISM_GUIDED_MODE_V1?.dispose?.();
      state.guidedAttempted=false;
      state.child=null;
      state.openPolls=0;
      state.seenChild=false;
      state.error="";
      const external=state.externalReturn;
      state.externalReturn=null;
      if(external?.surface==="apostolate"||external?.surface==="pray"){
        state.open=false;
        ++launchEpoch;
        cancelMonitor();
        const node=root(win);
        releaseFocus(win,node);
        node?.remove?.();
        win?.document?.body?.classList?.remove?.("aoLearnModularOpen");
        // A Learn child opened from bedside Prayer must return to that
        // Prayer module, not abandon the user at the Formation landing.
        void Promise.resolve(win?.AO_APP_SHELL_V1?.navigate?.(external.surface))
          .then(result=>result?.ok===true&&external.surface==="pray"&&
            String(external.route||"").startsWith("pray.")
              ?win?.AO_MODULES?.open?.(external.route)
              :false)
          .catch(error=>win?.console?.error?.("Formation return navigation failed",error));
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
    if(!state.open||!MODULE_SET.has(id))return false;
    const attempt=++launchEpoch;
    const current=()=>state.open&&launchEpoch===attempt;
    try{
      await ensureLearnModule(id,win);
      // Import results must never revive a child after Home/Back or a newer
      // module entry superseded the request.
      if(!current())return false;
    }catch(error){
      if(!current())return false;
      try{win?.console?.error?.("Formation module import failed",error);}catch{}
      state.error=L(win,"This module could not be opened.","Ce module n’a pas pu être ouvert.");
      paint();return false;
    }
    const registry=win?.AO_MODULES;
    if(typeof registry?.open!=="function"){
      state.error=L(win,"This module could not be opened.","Ce module n’a pas pu être ouvert.");
      paint();
      return false;
    }
    retireHistoricalLearnSurface(win);
    try{win?.AO_NAV_V362?.clearExternalReturn?.();}catch{}
    state.child=id;
    state.guidedAttempted=false;
    state.externalReturn=opts?.returnContext??null;
    state.error="";
    state.seenChild=false;
    state.openPolls=0;
    hideHub();
    let result=null;
    try{
      if(id===GLOSSARY_ROUTE_ID&&typeof win?.AO_GLOSSARY_V1?.open==="function"){
        // Glossary's existing canonical owner is authoritative. Registry wrappers
        // from other Formation modules may advertise the route without actually
        // dispatching it; open the owner directly on this known Learn child.
        const opened=await win.AO_GLOSSARY_V1.open({origin:"learn",
          ...(opts?.entryId?{entryId:opts.entryId}:{}),
          ...(opts?.lexemeId?{lexemeId:opts.lexemeId}:{}),
          ...(opts?.phraseId?{phraseId:opts.phraseId}:{})
        });
        result={ok:opened===true||opened?.ok===true,canonicalId:GLOSSARY_ROUTE_ID};
      }else result=await registry.open(id);
    }catch(error){
      try{win?.console?.error?.("Modular Learn module launch failed",error);}catch{}
    }
    if(!current()){
      // The child owner may have mounted after its parent was closed. Close
      // only the stale child, never a newer request for that same module.
      if(!state.open||state.child!==id)closeChild(win,id);
      return false;
    }
    if(result?.ok!==true){
      state.child=null;
      state.externalReturn=null;
      state.error=L(win,"This module could not be opened.","Ce module n’a pas pu être ouvert.");
      showHub();
      return false;
    }
    state.seenChild=childOpen(win,id);
    monitorChild();
    return true;
  }

  function close(){
    ++launchEpoch;
    state.open=false;
    cancelMonitor();
    if(state.child)closeChild(win,state.child);
    state.child=null;
    state.guidedAttempted=false;
    state.family=null;
    state.lastFamily=null;
    state.discoveryQuery="";
    state.lastDiscoveryReference=null;
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
    // A specialist child may call AO_LEARN_APP_V1.open() on Back. If its
    // existing parent is still alive, restore that suspended Formation
    // family rather than rebuilding the landing. The app shell's fresh
    // entry first calls close(), so normal re-entry still resets.
    const returningToSuspendedFamily=state.open&&!state.externalReturn
      &&(!state.child||(state.seenChild&&!childOpen(win,state.child)));
    if(returningToSuspendedFamily){
      cancelMonitor();
      state.child=null;
      state.guidedAttempted=false;
      state.seenChild=false;
      state.openPolls=0;
      state.error="";
      return showHub();
    }
    ++launchEpoch;
    const doc=win?.document;
    if(!doc?.body||!runtime(win)?.store||typeof win?.AO_MODULES?.open!=="function")return false;
    cancelMonitor();
    if(state.child)closeChild(win,state.child);
    state.open=true;
    state.child=null;
    state.family=null;
    state.lastFamily=null;
    state.discoveryQuery="";
    state.lastDiscoveryReference=null;
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
      discoveryQuery:state.discoveryQuery,
      referenceDiscoveryLoaded:state.referenceStatus==="ready",
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
  // Only the canonical route descriptors install on Home.
  // Runtime-specific install*Module functions are called in ensureLearnModule.
  installLazyLearnRegistry(win);
  const api=createLearnOwner(win);
  win.AO_LEARN_APP_V1=api;
  maybeOpenFormationResearchPreview(win);
  maybeOpenFormationRecoveryReview(win);
  return api;
}

if(typeof window!=="undefined"&&typeof document!=="undefined")installLearnBrowserOwner(window);
