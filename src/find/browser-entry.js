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
import { buildCustomsAtlasFacets, filterCustomsAtlasItems } from "./customs-atlas-filters.js";
import { groupTraditionsForBrowse, countCanonicalTraditions } from "./traditions-browse.js";
import { HERITAGE_CATEGORIES, projectHeritagePlaces, heritageCustomCards } from "./heritage-map.js";
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
    ".aoFindActionError{margin:0;padding:10px 16px;background:var(--ao-surface-2,#21191a);color:var(--ao-text-primary,#efe7d4);border-bottom:1px solid var(--ao-rule,rgba(217,197,154,.2));font:600 var(--ao-type-ui-sm,12px)/1.4 var(--ao-font-ui,system-ui,sans-serif)}.aoFindActionError[hidden]{display:none}",
    ".aoExploreLensTabs{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;padding:14px 16px 4px}",
    ".aoExploreLensTabs button{min-width:0;border:1px solid rgba(217,197,154,.16);background:#0e151e;color:#c9bea8;border-radius:var(--ao-control-radius,11px);padding:10px 7px;font:650 var(--ao-type-ui-sm,12px)/1.15 var(--ao-font-ui,system-ui,sans-serif);display:grid;gap:4px;text-align:center}",
    ".aoExploreLensTabs button small{font-size:var(--ao-type-ui-xs,11px);color:#817765}.aoExploreLensTabs button.active{background:#d9c59a;color:#080c12;border-color:#d9c59a}.aoExploreLensTabs button.active small{color:#493f30}",
    ".aoCustomsAtlasPanel{margin:12px 16px 6px;padding:17px;border:1px solid rgba(217,197,154,.22);border-radius:16px;background:linear-gradient(145deg,rgba(217,197,154,.06),rgba(10,18,27,.6))}",
    ".aoCustomsAtlasHeading{display:flex;align-items:end;justify-content:space-between;gap:14px}.aoCustomsAtlasHeading small{font:650 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:#bba47a}.aoCustomsAtlasHeading h2{margin:5px 0 0;font:600 25px/1.1 var(--ao-font-display,Georgia,serif);color:#eadfcb}.aoCustomsAtlasHeading p{max-width:390px;margin:0;color:#ad9f8c;font:13px/1.45 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoCustomsAtlasTopics{margin-top:14px;max-width:440px}.aoCustomsAtlasDiscovery{margin-top:12px;padding-top:10px;border-top:1px solid rgba(217,197,154,.14)}.aoCustomsAtlasDiscovery>summary{cursor:pointer;min-height:36px;color:#d9c59a;font:650 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);display:list-item;list-style-position:inside}.aoCustomsAtlasDiscovery>summary:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}",
    ".aoCustomsAtlasFacets{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:16px}.aoAtlasSelect{display:grid;gap:6px;min-width:0}.aoAtlasSelect span{font:650 11px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#c6b18b}.aoAtlasSelect select{width:100%;min-width:0;min-height:44px;box-sizing:border-box;border:1px solid rgba(217,197,154,.24);border-radius:10px;background:#101a24;color:#efe7d4;padding:10px 26px 10px 10px;font:13px var(--ao-font-ui,system-ui,sans-serif)}.aoAtlasSelect select:focus-visible,.aoCustomsAtlasFoot button:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}",
    ".aoCustomsAtlasFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px}.aoCustomsAtlasFoot span{color:#978d7e;font:11px/1.45 var(--ao-font-ui,system-ui,sans-serif)}.aoCustomsAtlasFoot button{flex:none;border:1px solid rgba(217,197,154,.28);border-radius:999px;background:transparent;color:#e6d4b4;padding:9px 11px;cursor:pointer;font:650 11px var(--ao-font-ui,system-ui,sans-serif)}",
    "@media(max-width:700px){.aoCustomsAtlasHeading{display:block}.aoCustomsAtlasHeading p{max-width:none;margin-top:9px}.aoCustomsAtlasFacets{grid-template-columns:1fr}.aoCustomsAtlasFoot{align-items:flex-start;flex-direction:column}}",
    ".aoFindSearch{padding:12px 16px 14px}.aoFindSearch input{width:100%;box-sizing:border-box;padding:14px 15px;border-radius:12px;border:1px solid rgba(217,197,154,.18);background:#111923;color:#fff;font:16px/1.2 inherit}",
    ".aoFindExternalSource{margin:0 16px 12px;padding:12px 14px;display:flex;flex-wrap:wrap;justify-content:space-between;align-items:center;gap:12px;border:1px solid rgba(217,197,154,.18);background:rgba(217,197,154,.035);border-radius:12px}.aoFindExternalSource>div{display:grid;gap:5px;flex:1;min-width:190px}.aoFindExternalSource strong{color:#dfcba3;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoFindExternalSource span{color:#a99f8d;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}.aoFindExternalSource a{color:#f0dfbc;text-decoration:none;border:1px solid rgba(217,197,154,.27);border-radius:999px;padding:10px 12px;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoFindExternalSource a:focus-visible{outline:2px solid #d9c59a;outline-offset:3px}",
    ".aoFindMore{padding:18px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;color:#9f937d;font:12px var(--ao-font-ui,system-ui,sans-serif)}.aoFindMore button{border:1px solid rgba(217,197,154,.27);background:#101822;color:#e9d9b9;padding:12px 18px;border-radius:999px;min-height:44px;cursor:pointer}.aoFindMore button:focus-visible{outline:2px solid #d9c59a;outline-offset:3px}",
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
    ".aoExploreSacredCaution{margin:0 12px 14px;padding:10px 12px;font:12px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#ada18c;border:1px solid rgba(217,197,154,.14);border-radius:10px}.aoFindResultMeta{padding:8px 16px 12px;color:#978c77;font:12px sans-serif}.aoFindResultMeta strong{color:#efe7d4;font-size:18px;margin-right:6px}",
    ".aoFindList{display:grid;gap:10px;padding:0 16px 40px}.aoFindCard{text-align:left;border:1px solid rgba(217,197,154,.14);background:#0d141d;color:inherit;border-radius:16px;padding:15px}",
    ".aoFindCardTop{display:flex;justify-content:space-between;gap:10px}.aoFindCard strong{display:block;font-size:18px;margin:8px 0 4px}.aoFindCard>span:not(.aoFindCardTop),.aoFindCard em{display:block;color:#9f9582;font-style:normal;font-size:13px}.aoFindCard p{margin:10px 0 0;color:#c8bda8;font-size:13px;line-height:1.4}",
    ".aoFindStatus{font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.05em;color:#8f846e}.aoFindStatus[data-state=YES]{color:#c8b27f}",
    ".aoFindEmpty{margin:16px;border:1px solid rgba(217,197,154,.15);border-radius:16px;padding:22px;background:#0d141d}.aoFindEmpty strong{font-size:19px}.aoFindEmpty p{color:#aaa08d;line-height:1.5}",
    ".aoFindMap{height:calc(100vh - 250px);min-height:420px;margin:0 12px 24px;border-radius:16px;overflow:hidden;border:1px solid rgba(217,197,154,.15);background:#0d141d}.aoFindMapFallback{height:100%;display:grid;place-content:center;text-align:center;gap:8px;padding:24px;color:#a99e89}.aoFindMapFallback strong{color:#efe7d4;font-size:24px}",
    ".aoFindBody[data-find-view=map]{position:relative;padding:0 12px 20px}.aoFindBody[data-find-view=map] .aoFindMap{height:min(74vh,780px);min-height:420px;margin:0;border-radius:14px;overflow:hidden}.aoFindMap .maplibregl-control-container .maplibregl-ctrl-group{background:#0e1721;color:#e8dcc3;border:1px solid rgba(217,197,154,.22);box-shadow:0 6px 20px rgba(0,0,0,.28)}.aoFindMap .maplibregl-ctrl button{min-width:36px;min-height:36px}.aoFindMap .maplibregl-ctrl-attrib{font:10px var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoMapLegend{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 5px 3px;color:#b4aa97;font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}.aoMapLegendLabel{color:#e2d4b6;margin-right:4px}.aoMapLegend>span[data-group]{display:inline-flex;align-items:center;gap:6px;padding:5px 9px;border-radius:999px;background:#121b25;border:1px solid rgba(217,197,154,.13)}.aoMapLegend>span[data-group]:before{content:\"\";display:inline-block;width:9px;height:9px;border-radius:50%;background:#b8b1a2}.aoMapLegend>span[data-group=FSSP]:before{background:#c9ae75}.aoMapLegend>span[data-group=ICKSP]:before{background:#aa9bc5}.aoMapLegend>span[data-group=SSPX]:before{background:#85a9b7}.aoMapLegend>span[data-group=DIOCESAN]:before{background:#87ac9b}.aoMapLegend>small{display:block;flex-basis:100%;font-weight:400;color:#948b7c;margin-top:3px}",
    "@media(min-width:800px){.aoFindSurface:has(.aoFindBody[data-find-view=map]){max-width:none}.aoFindBody[data-find-view=map] .aoFindMap{height:calc(100vh - 315px);min-height:480px}}",
    "@media(max-width:520px){.aoFindBody[data-find-view=map]{padding:0 8px 18px}.aoFindBody[data-find-view=map] .aoFindMap{height:calc(100dvh - 310px);min-height:350px}.aoMapLegend{gap:5px;font-size:10px}.aoMapLegend>span[data-group]{padding:5px 7px}}",
    ".aoFindSheetBackdrop{position:fixed;inset:0;z-index:var(--ao-z-sheet,2147483000);background:rgba(0,0,0,.68);display:flex;align-items:flex-end}.aoFindSheet{max-height:82vh;overflow:auto;width:100%;box-sizing:border-box;background:#0d141d;border-top:1px solid rgba(217,197,154,.25);border-radius:22px 22px 0 0;padding:20px}",
    ".aoFindSheet header{display:grid;grid-template-columns:1fr var(--ao-control-h,44px);gap:12px}.aoFindSheet h2{margin:4px 0 5px;font-size:24px}.aoFindSheet header p{margin:0;color:#a99e89}.aoFindSheet header button{width:var(--ao-control-h,44px);height:var(--ao-control-h,44px);min-height:var(--ao-control-h,44px);border:0;border-radius:var(--ao-pill-radius,999px);background:transparent;color:#eee;font-size:24px}",
    ".aoExploreLead{color:#d2c7b2;line-height:1.5}.aoFindFacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}.aoFindFacts>div{background:#101923;border-radius:12px;padding:12px}.aoFindFacts strong{display:block;margin-top:5px;font-size:13px}",
    ".aoFindSchedules article{border-top:1px solid rgba(217,197,154,.12);padding:10px 0}.aoFindSchedules article small{display:block;margin-bottom:4px}.aoFindSchedules p{white-space:pre-line;color:#c0b6a3;font-size:13px}",
    ".aoExploreAddress{margin:15px 0;padding:12px;border:1px solid rgba(217,197,154,.1);border-radius:12px}.aoExploreAddress p{margin:5px 0 0;color:#c5baa6}",
    ".aoTraditionEvidence{margin:16px 0;border:1px solid rgba(217,197,154,.16);border-radius:12px;padding:12px 14px}.aoTraditionEvidence summary{cursor:pointer;min-height:32px;color:#e2d0aa;font:650 13px var(--ao-font-ui,system-ui,sans-serif)}.aoTraditionEvidence article{border-top:1px solid rgba(217,197,154,.12);padding:12px 0}.aoTraditionEvidence article strong{display:block;font-size:13px}.aoTraditionEvidence article small{display:block;color:#9e937f;margin:5px 0}.aoTraditionEvidence article p{line-height:1.45;color:#c7baa5;font-size:13px}.aoTraditionEvidence article button{min-height:44px;padding:8px 12px;border:1px solid rgba(217,197,154,.25);border-radius:999px;background:transparent;color:#e5d4b2;cursor:pointer}",
    ".aoFindActions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}.aoFindActions a,.aoFindActions button,.aoFindSources a{display:inline-flex;align-items:center;min-height:var(--ao-control-h,44px);border:1px solid rgba(217,197,154,.2);border-radius:var(--ao-pill-radius,999px);padding:9px 12px;color:#e7d8b8;text-decoration:none;font:650 var(--ao-type-ui-sm,12px) var(--ao-font-ui,system-ui,sans-serif);background:transparent;cursor:pointer}",
    ".aoFindSources{margin:15px 0}.aoFindSources>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.aoFindSheet footer{color:#8f846e;font:500 var(--ao-type-ui-xs,11px)/1.4 var(--ao-font-ui,system-ui,sans-serif);margin-top:14px}.aoFindGeoAttribution{display:block;margin-top:6px;opacity:.82}",
    ".aoExplorePlaceGroup{margin:16px 0;padding-top:13px;border-top:1px solid rgba(217,197,154,.1)}.aoExplorePlaceGroup>small{display:block;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;color:#b7a57d;margin-bottom:9px}.aoExplorePlaceGroup>p{color:#bdb29f;line-height:1.45;font-size:13px}.aoExplorePlaceGroup>article{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid rgba(217,197,154,.07)}.aoExplorePlaceGroup>article:first-of-type{border-top:0}.aoExplorePlaceGroup>article button{min-height:38px;flex:none;border:1px solid rgba(217,197,154,.27);border-radius:999px;background:#111c25;color:#e5d5b5;padding:7px 10px;font:600 11px var(--ao-font-ui,system-ui,sans-serif)}.aoExplorePlaceGroup>article>div{min-width:0}.aoExplorePlaceGroup>article>div p{font-size:11px;line-height:1.4;color:#a59d90;margin:5px 0}.aoExplorePlaceGroup>article strong{font-size:13px;font-weight:500}.aoExplorePlaceGroup>article span{color:#a99e89;font:600 11px sans-serif;white-space:nowrap}.aoExplorePlaceRows{display:grid;gap:7px}.aoExplorePlaceRow{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:left;border:1px solid rgba(217,197,154,.12);background:#101923;color:#e9e4d9;border-radius:12px;padding:11px}.aoExplorePlaceRow span{min-width:0}.aoExplorePlaceRow small{display:block;color:#a99570;font:650 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em}.aoExplorePlaceRow strong{display:block;margin-top:4px;font-size:13px;font-weight:500}.aoExplorePlaceRow i{font:600 var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif);color:#887e6d;font-style:normal;text-align:right}",
    "@media(min-width:800px){.aoFindSurface{max-width:980px;margin:auto;border-left:1px solid rgba(217,197,154,.08);border-right:1px solid rgba(217,197,154,.08)}.aoFindList{grid-template-columns:repeat(2,minmax(0,1fr))}.aoFindSheet{max-width:720px;margin:0 auto}.aoFindSheetBackdrop{justify-content:center}}",
    ".aoHeritageSurface{display:flex;flex-direction:column;height:100%;overflow:hidden;background:#080c12}.aoHeritageSurface .aoFindHeader{flex:none;padding:9px 12px;grid-template-columns:44px minmax(0,1fr) 44px auto}.aoHeritageSurface .aoFindHeader h1{font-size:21px}.aoHeritageCategories{display:flex;gap:7px;flex:none;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding:10px 12px 8px}.aoHeritageCategories button{white-space:nowrap;min-height:42px;flex:none;border:1px solid rgba(217,197,154,.23);background:#101923;color:#c9bba3;border-radius:999px;padding:9px 12px;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageCategories button.active{border-color:#d9c59a;color:#f5e5c3;background:#28271f}.aoHeritageCategories button[data-category]:before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#c1ad80;margin-right:6px}.aoHeritageCategories button[data-category=relics]:before{background:#a99bc5}.aoHeritageCategories button[data-category=apparitions]:before{background:#a0b5c8}.aoHeritageCategories button[data-category=pilgrimages]:before{background:#87ac9b}.aoHeritageCategories button[data-category=traditions]:before{background:#c49c93}",
    ".aoHeritageTools{display:flex;align-items:center;gap:8px;position:relative;padding:0 12px 9px;z-index:4;flex:none}.aoHeritageTools .aoFindSearch{padding:0;min-width:0;flex:1}.aoHeritageTools .aoFindSearch input{border-radius:999px;min-height:44px;padding:11px 16px;background:#101923}.aoHeritageMore{flex:none;position:relative;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageMore summary{display:flex;align-items:center;justify-content:center;cursor:pointer;list-style:none;min-height:44px;padding:0 13px;border:1px solid rgba(217,197,154,.2);border-radius:999px;color:#e6d3af;background:#101923}.aoHeritageMore summary::-webkit-details-marker{display:none}.aoHeritageMore>div{position:absolute;z-index:8;top:50px;right:0;background:#101923;border:1px solid rgba(217,197,154,.23);border-radius:12px;padding:12px;width:min(310px,80vw);box-shadow:0 12px 26px #0009;color:#afa28f;line-height:1.4}.aoHeritageMore button{min-height:44px;color:#e8d7b7;background:transparent;border:1px solid rgba(217,197,154,.22);border-radius:9px;padding:10px;font:inherit}.aoHeritageMore>div{max-height:min(66dvh,520px);overflow:auto}.aoHeritageMore>div>strong{display:block;color:#e8d5b3;font:650 12px var(--ao-font-ui,system-ui,sans-serif);padding-bottom:10px}.aoHeritageSecondary{display:grid;grid-template-columns:1fr;gap:7px}.aoHeritageSecondary button{width:100%;text-align:left}.aoHeritageMore>div p{font-size:11px;line-height:1.4;color:#a69b89}",
    ".aoHeritageBody.aoFindBody[data-find-view=map]{flex:1;min-height:230px;position:relative;padding:0 8px 8px;overflow:hidden}.aoHeritageBody.aoFindBody[data-find-view=map] .aoFindMap{height:100%;min-height:0;margin:0;border-radius:12px}.aoHeritageCustomStrip{position:absolute;bottom:38px;left:16px;right:16px;max-width:720px;z-index:2;border:1px solid rgba(217,197,154,.22);border-radius:13px;background:rgba(8,12,18,.90);backdrop-filter:blur(12px);padding:8px 9px;box-shadow:0 10px 26px #0008}.aoHeritageStripHeading{display:flex;justify-content:space-between;align-items:center;gap:12px;color:#e3d4b7;font:650 11px var(--ao-font-ui,system-ui,sans-serif);padding:1px 4px 7px;letter-spacing:.04em}.aoHeritageStripHeading button{border:0;background:transparent;color:#f0d9a6;text-decoration:underline;font:inherit;min-height:28px}.aoHeritageCustomRail{display:flex;gap:7px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin}.aoHeritageCustomRail button{flex:0 0 145px;min-height:68px;text-align:left;border:1px solid rgba(217,197,154,.16);border-radius:9px;background:#15202a;color:#efe6d4;padding:9px;cursor:pointer}.aoHeritageCustomRail button.active{border-color:#dac494;background:#302b22}.aoHeritageCustomRail strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 13px/1.2 var(--ao-font-display,Georgia,serif)}.aoHeritageCustomRail small{display:block;margin-top:6px;color:#9b907c;font:500 10px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageScope{margin:0;padding:3px 14px 7px;color:#a79d89;font:11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoHeritageSurface .aoFindSheetBackdrop{background:rgba(0,0,0,.34)}.aoHeritagePreview{max-width:660px;max-height:48vh}.aoHeritagePreview h2{font-size:21px}.aoHeritagePlaceTags{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0}.aoHeritagePlaceTags span{background:#19212b;border:1px solid rgba(217,197,154,.17);padding:6px 9px;border-radius:999px;color:#cbbca5;font:600 11px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageCaution{font:12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#b2a58f;margin:9px 0}.aoHeritagePreviewActions{display:flex;gap:8px;margin-top:10px}.aoHeritagePreviewActions button,.aoHeritagePreviewActions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:1px solid rgba(217,197,154,.27);border-radius:999px;background:#1d2023;color:#e9d3a7;padding:10px 16px;text-decoration:none;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritagePreviewActions button:first-child{background:#dac494;color:#0b121b}",
    ".aoHeritageStripActions{display:flex;align-items:center;gap:8px}.aoExploreReturnMap{grid-column:1/-1}@media(max-width:520px){.aoHeritageCategories{padding:7px 8px}.aoHeritageTools{padding:0 8px 7px}.aoHeritageCustomStrip{left:12px;right:12px;bottom:34px}.aoHeritageCustomRail button{flex-basis:126px}.aoHeritagePreviewActions{flex-wrap:wrap}.aoHeritageSurface .aoFindHeader h1{font-size:19px}}",
    "@media(max-width:520px){.aoExploreLensTabs{grid-template-columns:repeat(3,minmax(0,1fr))}.aoFindMap{height:calc(100vh - 320px);min-height:360px}}"
  ].join("");
  win.document.head?.append?.(style);
}

export function createFindOwner(win=globalThis){
  let openState=false,dataset=null,projection=null,mapHandle=null,loading=null;
  let paintToken=0,lastLoadError=null;
  let lastMapView=null,lastMapLens=null;
  const state={
    lens:"heritage",
    view:"map",
    query:"",
    day:"ANY",
    affiliations:[],
    unaCum:"ANY",
    liturgy:"ANY",
    massType:"ANY",
    heritageCategories:[...HERITAGE_CATEGORIES],
    highlightCustomId:null,
    expandPlace:false,
    atlasFamily:"ANY",
    atlasArea:"ANY",
    atlasPeriod:"ANY",
    atlasCalendar:"ANY",
    calendarKey:null,
    selectedId:null,
    selectedPlaceId:null,
    displayLimit:120,
  };

  function glossaryTerms(){
    if(state.lens==="tlm")return ["G135","G149","G150","G449","G450","G047","G048","G049"];
    if(state.lens==="shrines")return ["G336","G334","G338","G321"];
    if(state.lens==="apparitions")return ["G336","G321","G233"];
    if(state.lens==="relics")return ["G321","G336"];
    if(state.lens==="traditions")return ["G322","G233","G095","G339"];
    if(state.lens==="pilgrimages")return ["G334","G335","G336","G233"];
    return ["G334","G336"];
  }

  function actionError(message){
    const label=getRoot(win)?.querySelector?.("[data-find-action-error]");
    if(label){label.textContent=String(message||"");label.hidden=!message;}
  }
  async function openGlossary(button){
    if(button?.getAttribute?.("aria-busy")==="true")return false;
    button?.setAttribute?.("aria-busy","true");actionError("");
    try{
      const {ensureLearnModule}=await import("../learn/lazy-module-registry.js");
      await ensureLearnModule("learn.glossary",win);
      const glossary=win?.AO_GLOSSARY_V1;
      if(typeof glossary?.openTerms!=="function")throw new Error("Glossary owner unavailable");
      const opened=await glossary.openTerms(glossaryTerms(),{origin:"find"});
      if(opened===false)throw new Error("No contextual glossary entries available");
      return true;
    }catch(error){
      console.error("Explore Glossary failed",error);
      actionError(language(win)==="fr"?"Définitions indisponibles. Veuillez réessayer.":"Definitions unavailable. Please try again.");
      return false;
    }finally{button?.removeAttribute?.("aria-busy");}
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
    if(state.lens==="heritage")return projectHeritagePlaces(projection,{categories:state.heritageCategories,query:state.query,customId:state.highlightCustomId});
    if(state.lens==="tlm"){
      const records=filterDirectoryRecords(dataset.directory?.records??[],state);
      return projectDirectoryItems(records,{communities:dataset.directory?.communities??[]});
    }
    if(state.lens==="traditions")return filterCustomsAtlasItems(projection.byLens.traditions,state);
    const list=filterExploreItems(projection.byLens?.[state.lens]??[],{query:state.query});
    return state.lens==="pilgrimages"&&state.calendarKey?list.filter(item=>item.calendar_keys?.includes(state.calendarKey)):list;
  }

  function showLoadFailure(node){
    const fr=language(win)==="fr";
    node.innerHTML=`<main class="aoFindSurface" data-find-recovery aria-labelledby="ao-find-load-failed-title">
      <header class="aoFindHeader"><span aria-hidden="true"></span><div><small>${fr?"EXPLORER":"EXPLORE"}</small><h1 id="ao-find-load-failed-title">${fr?"Contenu indisponible":"Content unavailable"}</h1></div><span></span><button type="button" data-find-close aria-label="${fr?"Fermer":"Close"}">×</button></header>
      <div role="alert" style="padding:24px var(--ao-page-gutter,14px);max-width:540px;margin:auto">
        <p style="line-height:1.5">${fr?"Impossible de charger les données. Vérifiez votre connexion, puis réessayez.":"Explore could not load its data. Check your connection and try again."}</p>
        <button type="button" data-find-retry style="min-height:44px;padding:10px 22px;border:1px solid var(--ao-rule,rgba(217,197,154,.35));border-radius:999px;background:transparent;color:inherit;font:inherit">${fr?"Réessayer":"Retry"}</button>
      </div></main>`;
    node.dataset.open="true";
    node.dataset.aoFindLoadState="error";
    node.querySelector?.("[data-find-retry]")?.focus?.({preventScroll:true});
  }

  async function paint({preserveSearchFocus=false}={}){
    const token=++paintToken;
    const node=ensureRoot(win);if(!node)return false;
    installStyle(win);
    // Rebuilding the entire Explore surface after each search keystroke
    // detaches its focused input. Retain focus, caret and page position so
    // users can type a complete query, including on mobile keyboards.
    const activeSearch=node.querySelector?.("[data-find-query]");
    const searchFocus=preserveSearchFocus&&activeSearch===win?.document?.activeElement
      ? {
          start:activeSearch.selectionStart,
          end:activeSearch.selectionEnd,
          direction:activeSearch.selectionDirection,
          scroll:node.querySelector?.(".aoFindSurface")?.scrollTop??0,
        }
      : null;
    let data;
    try{data=await ensureData()}catch(error){
      if(token!==paintToken||!openState)return false;
      lastLoadError=error;
      try{win?.console?.error?.("Explore data unavailable",error)}catch{}
      showLoadFailure(node);
      return true;
    }
    // Ignore a stale dataset response if the user has closed Explore or
    // started another render while the shared load was in flight.
    if(token!==paintToken||!openState)return false;
    lastLoadError=null;
    const rawItems=filtered();
    // Canonical practice cards are a reading view over the immutable attestation
    // corpus. Site-backed map pins and Place-page deep links keep original IDs.
    const items=state.lens==="traditions"&&state.view==="list"
      ?groupTraditionsForBrowse(rawItems,{includeNovenaContext:Boolean(state.query.trim())||state.atlasCalendar==="NOVENA"})
      :rawItems;
    const canonical=groupTraditionsForBrowse(projection.byLens.traditions);
    const selectedOverride=state.lens==="traditions"
      ?projection.byLens.traditions.find(item=>item.item_id===state.selectedId)??null
      :state.lens==="heritage"?canonical.find(item=>item.item_id===state.selectedId)??null:null;
    const customCards=state.lens==="heritage"
      ?heritageCustomCards(canonical,{enabled:state.heritageCategories.includes("traditions")&&state.heritageCategories.length<HERITAGE_CATEGORIES.length,query:state.query}):[];
    const placeProfiles=buildExplorePlaceProfiles(data,projection,{today:localTodayIso()});
    const vm=buildExploreViewModel({
      language:language(win),
      items,
      lens:state.lens,
      counts:{...projection.counts,traditions:countCanonicalTraditions(projection.byLens.traditions),heritage:items.length},
      customCards,
      atlasFacets:state.lens==="traditions"?buildCustomsAtlasFacets(projection.byLens.traditions):null,
      loadedProviders:data.directory?.loadedProviders??[],
      unavailableProviders:data.directory?.unavailableProviders??[],
      view:state.view,
      filters:state,
      selectedId:state.selectedId,
      selectedOverride,
      displayLimit:state.displayLimit,
      placeProfiles,
      selectedPlaceId:state.selectedPlaceId,
      expandPlace:state.expandPlace,
    });
    node.innerHTML=renderExploreToString(vm);
    if(searchFocus){
      const next=node.querySelector?.("[data-find-query]");
      next?.focus?.({preventScroll:true});
      if(Number.isInteger(searchFocus.start)&&Number.isInteger(searchFocus.end)){
        try{next?.setSelectionRange?.(searchFocus.start,searchFocus.end,searchFocus.direction||"none")}catch{}
      }
      const scroller=node.querySelector?.(".aoFindSurface");
      if(scroller)scroller.scrollTop=searchFocus.scroll;
    }
    node.dataset.open=openState?"true":"false";
    node.dataset.aoFindLoadState="ready";
    node.dataset.exploreLens=state.lens;
    if(mapHandle&&state.view==="map"){
      lastMapView=mapViewport(mapHandle.map);lastMapLens=state.lens;
    }
    mapHandle?.destroy?.();mapHandle=null;
    if(openState&&state.view==="map"){
      const mapNode=node.querySelector?.("[data-find-map]");
      try{
        const nextHandle=await mountExploreMap(mapNode,items,{
          win,initialViewport:lastMapLens===state.lens?lastMapView:null,
          onSelect:id=>{
            const place=state.lens==="heritage"?items.find(item=>item.item_id===id):null;
            state.selectedPlaceId=place?.place_id??null;
            state.selectedId=place?null:id;
            state.expandPlace=false;
            void paint();
          },
        });
        if(token!==paintToken||!openState){nextHandle?.destroy?.();return false;}
        mapHandle=nextHandle;
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
    if(options?.lens==="heritage"||EXPLORE_LENSES.includes(options?.lens))state.lens=options.lens;
    if(state.lens==="heritage"){
      state.view="map";
      if(Array.isArray(options?.categories))state.heritageCategories=options.categories.filter(cat=>HERITAGE_CATEGORIES.includes(cat));
    }
    state.calendarKey=state.lens==="pilgrimages"&&typeof options?.calendarKey==="string"?options.calendarKey:null;
    if(options?.view==="map"||options?.view==="list")state.view=options.view;
    if(typeof options?.query==="string")state.query=options.query;
    if(typeof options?.placeId==="string")state.selectedPlaceId=options.placeId;
    state.expandPlace=false;
    const node=ensureRoot(win);if(!node)return false;
    openState=true;node.dataset.open="true";
    node.dataset.aoFindLoadState="loading";
    // A failed fetch produces an actual recoverable Explore screen rather
    // than a blank overlay or a rejected navigation promise.
    const rendered=await paint();
    if(!rendered)return false;
    try{win?.AO_APP_SHELL_V1?.syncSurface?.("find")}catch{}
    return true;
  }

  function close(){
    ++paintToken;
    openState=false;state.selectedId=null;state.selectedPlaceId=null;state.expandPlace=false;
    lastMapView=null;lastMapLens=null;mapHandle?.destroy?.();mapHandle=null;
    const node=getRoot(win);if(node){node.dataset.open="false";node.innerHTML=""}
    return true;
  }

  function setFilter(key,value){
    const previousLens=state.lens;
    if(key==="view")state.view=value==="map"?"map":"list";
    else if(key==="lens"&&(value==="heritage"||EXPLORE_LENSES.includes(value))){
      state.lens=value;state.calendarKey=null;
      if(value==="heritage")state.view="map";
      else if(value==="traditions")state.view="map";
    }else if(Object.hasOwn(state,key))state[key]=value;
    state.selectedId=null;state.selectedPlaceId=null;state.expandPlace=false;
    state.displayLimit=120;
    if(state.lens!==previousLens){lastMapView=null;lastMapLens=null;}
    void paint();
  }

  async function handoff(surface,openExact,label){
    const shell=win?.AO_APP_SHELL_V1;
    actionError("");
    try{
      const routed=await shell?.navigate?.(surface);
      if(routed?.ok===true){
        const exact=await openExact();
        if(exact===true||exact?.ok===true)return true;
      }
    }catch(error){
      try{win?.console?.error?.("Explore handoff unavailable",surface,error)}catch{}
    }
    // The canonical shell performs a hard-Home reset before every routed
    // destination. A refused destination therefore cannot rely on the
    // previous Explore sheet still being visible. Restore its existing
    // exact lens before showing the recoverable bilingual error.
    try{
      if(shell?.getActive?.()!=="find"){
        const recovered=await shell?.navigate?.("find");
        if(recovered?.ok!==true){
          try{win?.console?.error?.("Explore handoff restoration unavailable",surface)}catch{}
          return false;
        }
      }
      actionError(label);
    }catch(error){
      try{win?.console?.error?.("Explore handoff restoration failed",error)}catch{}
    }
    return false;
  }

  function onClick(event){
    if(!openState)return;
    const target=event?.target;
    const retry=target?.closest?.("[data-find-retry]");
    if(retry){
      event.preventDefault?.();
      if(retry.getAttribute?.("aria-busy")==="true")return;
      retry.setAttribute?.("aria-busy","true");
      void paint().finally(()=>retry.removeAttribute?.("aria-busy"));
      return;
    }
    const glossaryButton=target?.closest?.("[data-find-glossary]");if(glossaryButton){event.preventDefault?.();event.stopPropagation?.();void openGlossary(glossaryButton);return}
    if(target?.closest?.("[data-find-clear-calendar]")){
      event.preventDefault?.();state.calendarKey=null;state.query="";void paint();return;
    }
    if(state.lens==="traditions"&&target?.closest?.("[data-atlas-clear]")){
      event.preventDefault?.();
      state.atlasFamily="ANY";state.atlasArea="ANY";state.atlasPeriod="ANY";state.atlasCalendar="ANY";
      state.selectedId=null;state.selectedPlaceId=null;void paint();return;
    }
    if(target?.closest?.("[data-find-close]")){event.preventDefault?.();close();void win?.AO_APP_SHELL_V1?.navigate?.("home");return}
    // Backdrops may be clicked to dismiss, but clicks *inside* the sheet
    // must reach their own Place, Calendar, novena and source-link actions.
    if(target?.closest?.("button[data-find-close-detail]")||
       target?.matches?.(".aoFindSheetBackdrop[data-find-close-detail]")){
      event.preventDefault?.();state.selectedId=null;void paint();return;
    }
    if(target?.closest?.("button[data-find-close-place]")||
       target?.matches?.(".aoFindSheetBackdrop[data-find-close-place]")){
      event.preventDefault?.();state.selectedPlaceId=null;void paint();return;
    }
    if(target?.closest?.("[data-explore-expand-place]")){
      event.preventDefault?.();state.expandPlace=true;void paint();return;
    }
    const heritageCategory=target?.closest?.("[data-heritage-category]");
    if(heritageCategory&&state.lens==="heritage"){
      event.preventDefault?.();
      const value=heritageCategory.dataset.heritageCategory;
      if(value==="ALL")state.heritageCategories=[...HERITAGE_CATEGORIES];
      else if(HERITAGE_CATEGORIES.includes(value)){
        const current=state.heritageCategories;
        state.heritageCategories=current.length===HERITAGE_CATEGORIES.length?[value]:
          current.includes(value)?(current.length===1?[...HERITAGE_CATEGORIES]:current.filter(cat=>cat!==value)):
          [...current,value];
      }
      state.highlightCustomId=null;state.selectedId=null;state.selectedPlaceId=null;state.expandPlace=false;
      void paint();return;
    }
    if(target?.closest?.("[data-heritage-custom-clear]")&&state.lens==="heritage"){
      event.preventDefault?.();state.highlightCustomId=null;void paint();return;
    }
    if(target?.closest?.("[data-heritage-custom-details]")&&state.lens==="heritage"&&state.highlightCustomId){
      event.preventDefault?.();state.selectedId="tradition:custom:"+state.highlightCustomId;void paint();return;
    }
    const heritageCustom=target?.closest?.("[data-heritage-custom]");
    if(heritageCustom&&state.lens==="heritage"){
      event.preventDefault?.();
      const id=heritageCustom.dataset.heritageCustom;
      const custom=projection?.byLens?.traditions?.find(item=>item?.raw?.custom?.custom_id===id);
      if(!custom)return;
      state.heritageCategories=["traditions"];
      state.highlightCustomId=state.highlightCustomId===id?null:id;
      state.selectedId=null; // Keep the map visible; extended practice text is opt-in.
      state.selectedPlaceId=null;state.expandPlace=false;
      // A selected practice can have geographically distant examples. Fit
      // their source-backed pins rather than preserving an unrelated viewport.
      lastMapView=null;lastMapLens=null;mapHandle?.destroy?.();mapHandle=null;
      void paint();return;
    }
    const openPlace=target?.closest?.("[data-explore-open-place]");
    if(openPlace){
      event.preventDefault?.();event.stopPropagation?.();
      state.selectedPlaceId=openPlace.dataset.exploreOpenPlace||null;
      state.selectedId=null;state.expandPlace=false;
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
    const calendarDate=target?.closest?.("[data-explore-calendar-date]");
    if(calendarDate){
      event.preventDefault?.();event.stopPropagation?.();
      const date=calendarDate.dataset.exploreCalendarDate;
      if(/^\d{4}-\d{2}-\d{2}$/.test(date||"")){
        void handoff("calendar",()=>win?.AO_CALENDAR_APP_V1?.select?.(date),
          language(win)==="fr"?"Impossible d’ouvrir cette date. Réessayez.":"Could not open this date. Please retry.");
      }
      return;
    }
    const novena=target?.closest?.("[data-explore-open-novena]");
    if(novena){
      event.preventDefault?.();event.stopPropagation?.();
      const novenaId=novena.dataset.exploreOpenNovena;
      if(!novenaId)return;
      // Shell loads the canonical Prayer owner before opening the specific
      // Novena. On failure return to this Explore lens, not generic Pray.
      void handoff("pray",()=>win?.AO_PRAY_V435930?.open?.("pray.novenas",
        {novenaId,returnContext:{surface:"find"}}),
        language(win)==="fr"?"Impossible d’ouvrir cette neuvaine. Réessayez.":"Could not open this novena. Please retry.");
      return;
    }
    if(target?.closest?.("[data-find-show-more]")){
      event.preventDefault?.();
      const previousScroll=getRoot(win)?.querySelector?.(".aoFindSurface")?.scrollTop??0;
      state.displayLimit+=120;
      void paint().then(()=>{const scroller=getRoot(win)?.querySelector?.(".aoFindSurface");if(scroller)scroller.scrollTop=previousScroll;});
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
    state.query=input.value??"";state.selectedId=null;state.selectedPlaceId=null;state.displayLimit=120;
    void paint({preserveSearchFocus:true});
  }

  function onChange(event){
    if(!openState||state.lens!=="traditions")return;
    const field=event?.target?.closest?.("[data-atlas-filter]");
    if(!field)return;
    setFilter(field.dataset.atlasFilter,field.value);
  }

  win?.document?.addEventListener?.("click",onClick,true);
  win?.document?.addEventListener?.("input",onInput,true);
  win?.document?.addEventListener?.("change",onChange,true);
  installStyle(win);ensureRoot(win);

  return Object.freeze({
    version:VERSION,
    open,
    close,
    paint,
    status:()=>Object.freeze({
      installed:true,
      open:openState,
      loadState:openState?(lastLoadError?"error":dataset?"ready":"loading"):"closed",
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
      win?.document?.removeEventListener?.("change",onChange,true);
      getRoot(win)?.remove?.();
    }
  });
}
export function installFindBrowserOwner(win=globalThis){
  if(win?.AO_FIND_APP_V1)return win.AO_FIND_APP_V1;
  const api=createFindOwner(win);win.AO_FIND_APP_V1=api;return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installFindBrowserOwner(window);
