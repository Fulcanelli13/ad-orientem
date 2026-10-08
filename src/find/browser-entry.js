import { filterDirectoryRecords } from "./data-service.js";
import { loadExploreDataset } from "./explore-data-service.js";
import {
  EXPLORE_LENSES,
  filterExploreItems,
  projectDirectoryItems,
  projectExploreDataset,
} from "./explore-projection.js";
import { buildExploreViewModel, renderExploreToString } from "./explore-presentation.js";
import { mapViewport, mountExploreMap } from "./map-runtime.js";
import { buildExplorePlaceProfiles } from "./place-profiles.js";

const VERSION="explore-v1";
const ROOT_ID="ao-find-modular-root";
const language=win=>win?.AO_RUNTIME_V8?.store?.getState?.()?.language==="fr"?"fr":"en";
const getRoot=win=>win?.document?.getElementById?.(ROOT_ID)??null;
const localTodayIso=()=>{
  const d=new Date();
  return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");
};

function ensureRoot(win){
  let node=getRoot(win);
  if(node)return node;
  node=win?.document?.createElement?.("div");
  if(!node)return null;
  node.id=ROOT_ID;
  node.dataset.aoFindRoot=VERSION;
  node.dataset.aoExploreRoot=VERSION;
  win.document.body?.append?.(node);
  return node;
}
function installStyle(win){
  if(win?.document?.getElementById?.("ao-find-style-v1"))return;
  const style=win?.document?.createElement?.("style");
  if(!style)return;
  style.id="ao-find-style-v1";
  style.textContent=[
    "#"+ROOT_ID+"{position:fixed;inset:0;z-index:var(--ao-z-surface,2147481800);display:none;background:var(--ao-bg-canvas,#080c12);color:var(--ao-text-primary,#efe7d4);font-family:var(--ao-font-body,Georgia,serif)}",
    "#"+ROOT_ID+"[data-open=true]{display:block}",
    ".aoFindSurface{height:100%;overflow:auto;background:linear-gradient(180deg,#0d131c,#080c12 38%);padding:env(safe-area-inset-top) 0 env(safe-area-inset-bottom)}",
    ".aoFindHeader{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:44px minmax(0,1fr) 44px auto;gap:10px;align-items:center;padding:14px var(--ao-page-gutter,14px);background:rgba(8,12,18,.94);border-bottom:1px solid var(--ao-rule,rgba(217,197,154,.15));backdrop-filter:blur(var(--ao-topbar-blur,14px))}",
    ".aoFindHeader button{width:var(--ao-control-h,44px);height:var(--ao-control-h,44px);border-radius:var(--ao-pill-radius,999px);border:1px solid var(--ao-rule,rgba(217,197,154,.22));background:transparent;color:inherit;font-size:20px}",
    ".aoFindHeader small,.aoFindCard small,.aoFindFacts small,.aoFindSchedules>small,.aoFindSources>small,.aoExploreAddress>small{font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;color:#b7a57d}",
    ".aoFindHeader h1{margin:2px 0 0;font:600 24px/1.05 var(--ao-font-display,Georgia,serif)}",
    ".aoFindHeader>span{font:600 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em;color:#8f846e}",
    ".aoExploreLensTabs{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:6px;padding:14px 16px 4px}",
    ".aoExploreLensTabs button{min-width:0;border:1px solid rgba(217,197,154,.16);background:#0e151e;color:#c9bea8;border-radius:var(--ao-control-radius,11px);padding:10px 7px;font:650 var(--ao-type-ui-sm,12px)/1.15 var(--ao-font-ui,system-ui,sans-serif);display:grid;gap:4px;text-align:center}",
    ".aoExploreLensTabs button small{font-size:var(--ao-type-ui-xs,11px);color:#817765}.aoExploreLensTabs button.active{background:#d9c59a;color:#080c12;border-color:#d9c59a}.aoExploreLensTabs button.active small{color:#493f30}",
    ".aoFindSearch{padding:12px 16px 14px}.aoFindSearch input{width:100%;box-sizing:border-box;padding:14px 15px;border-radius:12px;border:1px solid rgba(217,197,154,.18);background:#111923;color:#fff;font:16px/1.2 inherit}",
    ".aoFindViewTabs{display:flex;gap:6px;padding:0 16px 10px}",
    ".aoFindViewTabs button,.aoFindFilters button{border:1px solid rgba(217,197,154,.16);background:#0e151e;color:#c9bea8;border-radius:var(--ao-pill-radius,999px);padding:9px 12px;font:650 var(--ao-type-ui-sm,12px)/1 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoExploreQuickFilters{display:flex;align-items:center;gap:7px;flex-wrap:wrap}",
    ".aoExploreFilterLabel{color:#948a78;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.06em;text-transform:uppercase}",
    ".aoExploreAdvancedFilters{margin-top:8px;border-top:1px solid rgba(217,197,154,.11)}",
    ".aoExploreAdvancedFilters>summary{min-height:44px;display:flex;align-items:center;cursor:pointer;color:#b7a57d;font:650 var(--ao-type-ui-sm,12px)/1.2 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoExploreAdvancedFilters>section{padding:10px 0;border-top:1px solid rgba(217,197,154,.08)}",
    ".aoExploreAdvancedFilters>section>small{display:block;margin-bottom:8px;color:#817765;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em}",
    ".aoExploreAdvancedFilters>section>div{display:flex;gap:6px;flex-wrap:wrap}",
    ".aoFindViewTabs button.active,.aoFindFilters button.active{background:#d9c59a;color:#080c12;border-color:#d9c59a}",
    ".aoFindFilters{padding:0 16px 12px}.aoFindFilters>div,.aoFindFilters details>div{display:flex;gap:7px;overflow:auto;padding:5px 0}.aoFindFilters summary{cursor:pointer;color:#b7a57d;font:600 11px sans-serif;margin:6px 0}",
    ".aoFindResultMeta{padding:8px 16px 12px;color:#978c77;font:12px sans-serif}.aoFindResultMeta strong{color:#efe7d4;font-size:18px;margin-right:6px}",
    ".aoFindList{display:grid;gap:10px;padding:0 16px 40px}.aoFindCard{text-align:left;border:1px solid rgba(217,197,154,.14);background:#0d141d;color:inherit;border-radius:16px;padding:15px}",
    ".aoFindCardTop{display:flex;justify-content:space-between;gap:10px}.aoFindCard strong{display:block;font-size:18px;margin:8px 0 4px}.aoFindCard>span:not(.aoFindCardTop),.aoFindCard em{display:block;color:#9f9582;font-style:normal;font-size:13px}.aoFindCard p{margin:10px 0 0;color:#c8bda8;font-size:13px;line-height:1.4}",
    ".aoFindStatus{font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.05em;color:#8f846e}.aoFindStatus[data-state=YES]{color:#c8b27f}",
    ".aoFindEmpty{margin:16px;border:1px solid rgba(217,197,154,.15);border-radius:16px;padding:22px;background:#0d141d}.aoFindEmpty strong{font-size:19px}.aoFindEmpty p{color:#aaa08d;line-height:1.5}",
    ".aoFindMap{height:calc(100vh - 250px);min-height:420px;margin:0 12px 24px;border-radius:16px;overflow:hidden;border:1px solid rgba(217,197,154,.15);background:#0d141d}.aoFindMapFallback{height:100%;display:grid;place-content:center;text-align:center;gap:8px;padding:24px;color:#a99e89}.aoFindMapFallback strong{color:#efe7d4;font-size:24px}",
    ".aoFindSheetBackdrop{position:fixed;inset:0;z-index:var(--ao-z-sheet,2147483000);background:rgba(0,0,0,.68);display:flex;align-items:flex-end}.aoFindSheet{max-height:82vh;overflow:auto;width:100%;box-sizing:border-box;background:#0d141d;border-top:1px solid rgba(217,197,154,.25);border-radius:22px 22px 0 0;padding:20px}",
    ".aoFindSheet header{display:grid;grid-template-columns:1fr var(--ao-control-h,44px);gap:12px}.aoFindSheet h2{margin:4px 0 5px;font-size:24px}.aoFindSheet header p{margin:0;color:#a99e89}.aoFindSheet header button{width:var(--ao-control-h,44px);height:var(--ao-control-h,44px);min-height:var(--ao-control-h,44px);border:0;border-radius:var(--ao-pill-radius,999px);background:transparent;color:#eee;font-size:24px}",
    ".aoExploreLead{color:#d2c7b2;line-height:1.5}.aoFindFacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}.aoFindFacts>div{background:#101923;border-radius:12px;padding:12px}.aoFindFacts strong{display:block;margin-top:5px;font-size:13px}",
    ".aoFindSchedules article{border-top:1px solid rgba(217,197,154,.12);padding:10px 0}.aoFindSchedules article small{display:block;margin-bottom:4px}.aoFindSchedules p{white-space:pre-line;color:#c0b6a3;font-size:13px}",
    ".aoExploreAddress{margin:15px 0;padding:12px;border:1px solid rgba(217,197,154,.1);border-radius:12px}.aoExploreAddress p{margin:5px 0 0;color:#c5baa6}",
    ".aoFindActions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}.aoFindActions a,.aoFindActions button,.aoFindSources a{display:inline-flex;align-items:center;min-height:var(--ao-control-h,44px);border:1px solid rgba(217,197,154,.2);border-radius:var(--ao-pill-radius,999px);padding:9px 12px;color:#e7d8b8;text-decoration:none;font:650 var(--ao-type-ui-sm,12px) var(--ao-font-ui,system-ui,sans-serif);background:transparent;cursor:pointer}",
    ".aoFindSources{margin:15px 0}.aoFindSources>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.aoFindSheet footer{color:#8f846e;font:500 var(--ao-type-ui-xs,11px)/1.4 var(--ao-font-ui,system-ui,sans-serif);margin-top:14px}.aoFindGeoAttribution{display:block;margin-top:6px;opacity:.82}",
    ".aoExplorePlaceGroup{margin:16px 0;padding-top:13px;border-top:1px solid rgba(217,197,154,.1)}.aoExplorePlaceGroup>small{display:block;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;color:#b7a57d;margin-bottom:9px}.aoExplorePlaceGroup>p{color:#bdb29f;line-height:1.45;font-size:13px}.aoExplorePlaceGroup>article{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid rgba(217,197,154,.07)}.aoExplorePlaceGroup>article:first-of-type{border-top:0}.aoExplorePlaceGroup>article strong{font-size:13px;font-weight:500}.aoExplorePlaceGroup>article span{color:#a99e89;font:600 11px sans-serif;white-space:nowrap}.aoExplorePlaceRows{display:grid;gap:7px}.aoExplorePlaceRow{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:left;border:1px solid rgba(217,197,154,.12);background:#101923;color:#e9e4d9;border-radius:12px;padding:11px}.aoExplorePlaceRow span{min-width:0}.aoExplorePlaceRow small{display:block;color:#a99570;font:650 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em}.aoExplorePlaceRow strong{display:block;margin-top:4px;font-size:13px;font-weight:500}.aoExplorePlaceRow i{font:600 var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif);color:#887e6d;font-style:normal;text-align:right}",
    "@media(min-width:800px){.aoFindSurface{max-width:980px;margin:auto;border-left:1px solid rgba(217,197,154,.08);border-right:1px solid rgba(217,197,154,.08)}.aoFindList{grid-template-columns:repeat(2,minmax(0,1fr))}.aoFindSheet{max-width:720px;margin:0 auto}.aoFindSheetBackdrop{justify-content:center}}",
    "@media(max-width:520px){.aoExploreLensTabs{grid-template-columns:repeat(2,minmax(0,1fr))}.aoFindMap{height:calc(100vh - 320px);min-height:360px}}"
  ].join("");
  win.document.head?.append?.(style);
}

export function createFindOwner(win=globalThis){
  let openState=false,dataset=null,projection=null,mapHandle=null,loading=null;
  let lastMapView=null,lastMapLens=null;
  const state={
    lens:"tlm",
    view:"list",
    query:"",
    day:"ANY",
    affiliations:[],
    unaCum:"ANY",
    liturgy:"ANY",
    massType:"ANY",
    selectedId:null,
    selectedPlaceId:null,
  };

  function glossaryTerms(){
    if(state.lens==="tlm")return ["G135","G149","G150","G449","G450","G047","G048","G049"];
    if(state.lens==="shrines")return ["G336","G334","G338","G321"];
    if(state.lens==="traditions")return ["G322","G233","G095","G339"];
    if(state.lens==="pilgrimages")return ["G334","G335","G336","G233"];
    return ["G334","G336"];
  }

  function openGlossary(){
    const glossary=win?.AO_GLOSSARY_V1;
    if(typeof glossary?.openTerms!=="function")return false;
    void glossary.openTerms(glossaryTerms(),{origin:"find"});
    return true;
  }

  async function ensureData(){
    if(dataset)return dataset;
    if(!loading){
      loading=loadExploreDataset({fetchImpl:win?.fetch?.bind?.(win)??fetch})
        .then(value=>{dataset=value;projection=projectExploreDataset(value);return value})
        .finally(()=>{loading=null});
    }
    return loading;
  }

  function filtered(){
    if(!dataset||!projection)return [];
    if(state.lens==="tlm"){
      const records=filterDirectoryRecords(dataset.directory?.records??[],state);
      return projectDirectoryItems(records,{communities:dataset.directory?.communities??[]});
    }
    return filterExploreItems(projection.byLens?.[state.lens]??[],{query:state.query});
  }

  async function paint(){
    const node=ensureRoot(win);if(!node)return false;
    installStyle(win);
    const data=await ensureData(),items=filtered();
    const placeProfiles=buildExplorePlaceProfiles(data,projection,{today:localTodayIso()});
    const vm=buildExploreViewModel({
      language:language(win),
      items,
      lens:state.lens,
      counts:projection?.counts??{},
      loadedProviders:data.directory?.loadedProviders??[],
      unavailableProviders:data.directory?.unavailableProviders??[],
      view:state.view,
      filters:state,
      selectedId:state.selectedId,
      placeProfiles,
      selectedPlaceId:state.selectedPlaceId,
    });
    node.innerHTML=renderExploreToString(vm);
    node.dataset.open=openState?"true":"false";
    node.dataset.exploreLens=state.lens;
    if(mapHandle&&state.view==="map"){
      lastMapView=mapViewport(mapHandle.map);lastMapLens=state.lens;
    }
    mapHandle?.destroy?.();mapHandle=null;
    if(openState&&state.view==="map"){
      const mapNode=node.querySelector?.("[data-find-map]");
      try{
        mapHandle=await mountExploreMap(mapNode,items,{
          win,initialViewport:lastMapLens===state.lens?lastMapView:null,
          onSelect:id=>{state.selectedPlaceId=null;state.selectedId=id;void paint()},
        });
      }catch(error){
        const fallback=mapNode?.querySelector?.(".aoFindMapFallback");
        if(fallback)fallback.textContent=language(win)==="fr"?"Carte indisponible":"Map unavailable";
        console.error("Explore map failed",error);
      }
    }
    return true;
  }

  async function open(options={}){
    try{win?.AO_LEARN_APP_V1?.close?.()}catch{}
    try{win?.AO_PRAY_APP_V1?.close?.()}catch{}
    try{win?.AO_CALENDAR_APP_V1?.close?.({surface:"find"})}catch{}
    if(EXPLORE_LENSES.includes(options?.lens))state.lens=options.lens;
    if(typeof options?.query==="string")state.query=options.query;
    if(typeof options?.placeId==="string")state.selectedPlaceId=options.placeId;
    openState=true;
    const node=ensureRoot(win);if(node)node.dataset.open="true";
    await paint();
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("find")}catch{}
    return true;
  }

  function close(){
    openState=false;state.selectedId=null;state.selectedPlaceId=null;
    lastMapView=null;lastMapLens=null;mapHandle?.destroy?.();mapHandle=null;
    const node=getRoot(win);if(node){node.dataset.open="false";node.innerHTML=""}
    return true;
  }

  function setFilter(key,value){
    if(key==="view")state.view=value==="map"?"map":"list";
    else if(key==="lens"&&EXPLORE_LENSES.includes(value))state.lens=value;
    else if(Object.hasOwn(state,key))state[key]=value;
    state.selectedId=null;state.selectedPlaceId=null;
    mapHandle?.destroy?.();mapHandle=null;
    lastMapView=null;lastMapLens=null;void paint();
  }

  function onClick(event){
    if(!openState)return;
    const target=event?.target;
    if(target?.closest?.("[data-find-glossary]")){event.preventDefault?.();event.stopPropagation?.();openGlossary();return}
    if(target?.closest?.("[data-find-close]")){event.preventDefault?.();close();void win?.AO_APP_SHELL_V1?.navigate?.("home");return}
    if(target?.closest?.("[data-find-close-detail]")){state.selectedId=null;void paint();return}
    if(target?.closest?.("[data-find-close-place]")){state.selectedPlaceId=null;void paint();return}
    const openPlace=target?.closest?.("[data-explore-open-place]");
    if(openPlace){
      event.preventDefault?.();event.stopPropagation?.();
      state.selectedPlaceId=openPlace.dataset.exploreOpenPlace||null;
      state.selectedId=null;
      void paint();return;
    }
    const placeItem=target?.closest?.("[data-explore-place-item]");
    if(placeItem){
      event.preventDefault?.();event.stopPropagation?.();
      const lens=placeItem.dataset.explorePlaceLens;
      if(EXPLORE_LENSES.includes(lens))state.lens=lens;
      state.query="";
      state.selectedPlaceId=null;
      state.selectedId=placeItem.dataset.explorePlaceItem||null;
      void paint();return;
    }
    const novena=target?.closest?.("[data-explore-open-novena]");
    if(novena){
      event.preventDefault?.();event.stopPropagation?.();
      const novenaId=novena.dataset.exploreOpenNovena;
      close();
      try{win?.AO_PRAY_V435930?.open?.("pray.novenas",{novenaId,returnContext:{surface:"find"}});}catch{}
      try{win?.AO_APP_SHELL_V1?.syncSurface?.("pray");}catch{}
      return;
    }
    const item=target?.closest?.("[data-explore-item]");if(item){state.selectedPlaceId=null;state.selectedId=item.dataset.exploreItem;void paint();return}
    const aff=target?.closest?.("[data-find-affiliation]");
    if(aff&&state.lens==="tlm"){
      const id=aff.dataset.findAffiliation,index=state.affiliations.indexOf(id);
      if(index>=0)state.affiliations.splice(index,1);else state.affiliations.push(id);
      state.selectedId=null;void paint();return;
    }
    const filter=target?.closest?.("[data-find-filter]");if(filter){setFilter(filter.dataset.findFilter,filter.dataset.findFilterValue);return}
  }

  function onInput(event){
    if(!openState)return;
    const input=event?.target?.closest?.("[data-find-query]");if(!input)return;
    state.query=input.value??"";state.selectedId=null;state.selectedPlaceId=null;void paint();
  }

  win?.document?.addEventListener?.("click",onClick,true);
  win?.document?.addEventListener?.("input",onInput,true);
  installStyle(win);ensureRoot(win);

  return Object.freeze({
    version:VERSION,
    open,
    close,
    paint,
    status:()=>Object.freeze({
      installed:true,
      open:openState,
      lens:state.lens,
      view:state.view,
      selectedPlaceId:state.selectedPlaceId,
      counts:projection?.counts??{},
      loadedProviders:dataset?.directory?.loadedProviders??[],
      unavailableProviders:dataset?.directory?.unavailableProviders??[],
      records:dataset?.directory?.records?.length??0,
    }),
    dispose(){
      close();
      win?.document?.removeEventListener?.("click",onClick,true);
      win?.document?.removeEventListener?.("input",onInput,true);
      getRoot(win)?.remove?.();
    }
  });
}
export function installFindBrowserOwner(win=globalThis){
  if(win?.AO_FIND_APP_V1)return win.AO_FIND_APP_V1;
  const api=createFindOwner(win);win.AO_FIND_APP_V1=api;return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installFindBrowserOwner(window);
