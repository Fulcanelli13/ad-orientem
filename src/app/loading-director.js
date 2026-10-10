/**
 * Loading Director v1. One artwork sequence over the existing v43.12
 * cinematic surfaces; no new curtain, route animator or liturgical owner.
 * Only real pending work may begin a workload sequence.
 */
export const LOADING_DIRECTOR_VERSION="loading-director-v1";
export const LOADING_ART_SEQUENCES=Object.freeze({
  boot:Object.freeze(["marian","logo","evangelists"]),
  pray:Object.freeze(["marian","logo","evangelists"]),
  learn:Object.freeze(["evangelists","logo","marian"]),
  calendar:Object.freeze(["logo","evangelists","marian"]),
  scripture:Object.freeze(["evangelists","logo","marian"]),
  find:Object.freeze(["logo","marian","evangelists"]),
  mass:Object.freeze(["logo","marian","evangelists"]),
  generic:Object.freeze(["logo","evangelists","marian"])
});
const LABELS=Object.freeze({
  pray:["Opening prayer","Ouverture de la prière"],
  learn:["Preparing formation","Préparation de la formation"],
  calendar:["Preparing the calendar","Préparation du calendrier"],
  scripture:["Opening Sacred Scripture","Ouverture de la Sainte Écriture"],
  find:["Loading places and customs","Chargement des lieux et coutumes"],
  mass:["Preparing the Missal","Préparation du missel"],
  generic:["Preparing content","Préparation du contenu"]
});
export const LOADING_ART_TIMING=Object.freeze({reveal:300,second:2000,third:5000});
export function createLoadingDirector({win=globalThis}={}){
  const doc=win?.document;
  if(!doc?.getElementById)return null;
  const now=()=>win?.performance?.now?.()??Date.now();
  const later=(fn,ms)=>win.setTimeout(fn,ms);
  const clear=id=>{if(id!=null)win.clearTimeout?.(id)};
  const boot=()=>doc.getElementById("ao-cinema-boot");
  const loader=()=>doc.getElementById("ao-cinema-loader");
  const state=()=>win?.AO_RUNTIME_V8?.store?.getState?.()??null;
  const reduced=()=>Boolean(win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ||
    state()?.settings?.reducedMotion ||
    doc.documentElement?.dataset?.reducedMotion==="true" ||
    doc.documentElement?.dataset?.aoMotionV1==="reduced");
  // A live Mass must not be displaced by an auxiliary workload.
  const live=()=>Boolean(state()?.route==="live" ||
    win?.AO_R17_NATIVE_READER_PREVIEW?.root?.isConnected);
  const localized=(pair)=>pair?.[state()?.language==="fr"?1:0]??"";
  const records=new Map();
  let nextId=0,workTimer=null,phaseTimers=[],bootTimers=[];
  let owner=null,legacyKind=null,legacyStarted=0,bootFinished=false;
  function clearPhases(){for(const id of phaseTimers)clear(id);phaseTimers=[]}
  function layer(node,art){
    const el=doc.createElement("span");
    el.className="aoLoadingArtLayer";
    el.dataset.art=art;
    el.setAttribute("aria-hidden","true");
    const symbol=doc.createElement("span");
    symbol.className="aoLoadingArtSymbol";
    el.append(symbol);
    node.append(el);
    return el;
  }
  function enhance(surface){
    const el=surface==="boot"?boot():loader();
    const mark=el?.querySelector?.(surface==="boot"?".aoCinemaBootCross":".aoCinemaLoaderMark");
    if(!mark)return null;
    if(mark.dataset.aoLoadingEnhanced!=="true"){
      mark.dataset.aoLoadingEnhanced="true";
      for(const art of ["marian","logo","evangelists"])layer(mark,art);
    }
    return {el,mark};
  }
  function stage(surface,art){
    const context=enhance(surface);
    if(!context)return;
    context.el.dataset.aoLoadingArt=art;
    for(const layer of context.mark.querySelectorAll(".aoLoadingArtLayer")){
      layer.dataset.visible=layer.dataset.art===art?"true":"false";
    }
  }
  function scheduleArt(surface,kind,started){
    clearPhases();
    const sequence=LOADING_ART_SEQUENCES[kind]??LOADING_ART_SEQUENCES.generic;
    stage(surface,sequence[0]);
    if(reduced())return;
    for(const [index,at] of [[1,LOADING_ART_TIMING.second],[2,LOADING_ART_TIMING.third]]){
      const remaining=at-Math.max(0,now()-started);
      if(remaining<=0){stage(surface,sequence[index]);continue;}
      phaseTimers.push(later(()=>{
        if(surface==="loader" && (owner!=null || legacyKind!=null) && !reduced())
          stage(surface,sequence[index]);
      },remaining));
    }
  }
  function clearWorkDisplay(){
    clear(workTimer);workTimer=null;clearPhases();
    const el=loader();
    if(el && el.dataset.aoLoadingDirector==="active"){
      el.classList.remove("aoCinemaLoaderOn");
      el.setAttribute("aria-hidden","true");
      delete el.dataset.aoLoadingDirector;
      delete el.dataset.kind;
    }
    owner=null;
  }
  function activeWork(){
    let entry=null;
    for(const item of records.values()){
      if(!entry||item.started>entry.started||item.started===entry.started&&item.id>entry.id)entry=item;
    }
    return entry;
  }
  function showWork(record){
    const el=loader();
    if(!el||boot()&&!bootFinished||live())return false;
    // Do not hijack a semantic loader such as Calendar week preparation.
    if(el.classList.contains("aoCinemaLoaderOn") &&
      el.dataset.aoLoadingDirector!=="active" && el.dataset.kind==="calendar-week")return false;
    owner=record.id;
    el.dataset.aoLoadingDirector="active";
    el.dataset.kind="ao-director-"+record.kind;
    const title=el.querySelector("[data-ao-cinema-loader-title]");
    const sub=el.querySelector("[data-ao-cinema-loader-sub]");
    if(title)title.textContent=record.title||localized(LABELS[record.kind]??LABELS.generic);
    if(sub)sub.textContent=record.sub||"";
    scheduleArt("loader",record.kind,record.started);
    el.classList.add("aoCinemaLoaderOn");
    el.setAttribute("aria-hidden","false");
    return true;
  }
  function syncWork(){
    clear(workTimer);workTimer=null;
    const current=activeWork();
    if(!current){
      if(owner!=null)clearWorkDisplay();
      if(legacyKind!=null)showLegacy();
      return;
    }
    if(owner===current.id)return;
    const remaining=LOADING_ART_TIMING.reveal-(now()-current.started);
    if(remaining<=0)showWork(current);
    else workTimer=later(()=>{workTimer=null;if(records.has(current.id))syncWork()},remaining);
  }
  function begin(kind="generic",{title="",sub=""}={}){
    if(live())return Object.freeze({end(){},cancel(){},active:false});
    const id=++nextId,record={id,kind:LOADING_ART_SEQUENCES[kind]?kind:"generic",title,sub,started:now()};
    records.set(id,record);
    syncWork();
    let ended=false;
    function end(){
      if(ended)return false;
      ended=true;
      records.delete(id);
      if(owner===id)clearWorkDisplay();
      syncWork();
      return true;
    }
    return Object.freeze({end,cancel:end,active:true,id});
  }
  // Reuse semantic/legacy real-load ownership. The legacy owner still decides
  // whether its loader opens or closes; Director changes artwork only.
  function adoptLegacy(kind="generic"){
    if(owner!=null)return false;
    const el=loader();
    if(!el)return false;
    const resolved=LOADING_ART_SEQUENCES[kind]?kind:kind==="calendar-week"?"calendar":"generic";
    if(legacyKind!==resolved)legacyStarted=now();
    legacyKind=resolved;
    scheduleArt("loader",resolved,legacyStarted);
    return true;
  }
  function showLegacy(){
    if(legacyKind!=null && loader()?.classList.contains("aoCinemaLoaderOn"))
      scheduleArt("loader",legacyKind,legacyStarted);
  }
  function releaseLegacy(){
    legacyKind=null;legacyStarted=0;
    if(owner==null)clearPhases();
  }
  function endBoot(){bootFinished=true;for(const id of bootTimers)clear(id);bootTimers=[];syncWork()}
  function startBoot(){
    if(!boot())return false;
    stage("boot","marian");
    if(reduced())return true;
    for(const [index,at] of [[1,LOADING_ART_TIMING.second],[2,LOADING_ART_TIMING.third]]){
      bootTimers.push(later(()=>{
        if(!bootFinished && boot() && !boot().classList.contains("aoCinemaBootDone") && !reduced())
          stage("boot",LOADING_ART_SEQUENCES.boot[index]);
      },at));
    }
    return true;
  }
  const api=Object.freeze({
    version:LOADING_DIRECTOR_VERSION,begin,adoptLegacy,releaseLegacy,endBoot,startBoot,
    status:()=>Object.freeze({active:records.size,owner,legacyKind,bootFinished,reducedMotion:reduced()}),
  });
  return api;
}
export function installLoadingDirector(win=globalThis){
  if(win?.AO_LOADING_DIRECTOR_V1)return win.AO_LOADING_DIRECTOR_V1;
  const api=createLoadingDirector({win});
  if(!api)return null;
  win.AO_LOADING_DIRECTOR_V1=api;
  api.startBoot();
  return api;
}
if(typeof window!=="undefined" && typeof document!=="undefined"){
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>installLoadingDirector(window),{once:true});
  else installLoadingDirector(window);
}
