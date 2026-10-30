import { filterDirectoryRecords } from "./data-service.js";
import { createScrollTapGuard } from "../app/scroll-tap-guard.js";
import { PRELIMINARY_R49_TOTAL,loadPreliminaryR49,filterPreliminaryR49 } from "./preliminary-directory-r49.js";
import { loadExploreDataset } from "./explore-data-service.js";
import {
  EXPLORE_LENSES,
  filterExploreItems,
  projectDirectoryItems,
  projectExploreDataset,
} from "./explore-projection.js";
import { buildExploreViewModel, renderExploreToString } from "./explore-presentation.js";
import {buildTimeMassBoard,validTimeMassDate} from "./mapcn-time-mass-board.js";
import { HERITAGE_STYLE } from "./heritage-style.js";
import { EXPLORE_ATLAS_LAYOUT_STYLE } from "./explore-atlas-layout-style.js";
import { EXPLORE_MAP_FIRST_V2_STYLE } from "./explore-map-first-v2-style.js";
import { DIRECTORY_CARD_STYLE, attachApprovedDirectoryMedia,loadDirectoryCardMedia } from "./directory-card.js";
import {TLM_CHURCH_PROFILE_STYLE} from "./tlm-church-profile.js";
import { discoverItemsWithinMapBounds, renderMapcnDiscoverRail } from "./mapcn-discover-rail.js";
import { SAINTS_SHEET_CSS } from "./saints-presentation.js";
import { projectSaintCatalogueItems } from "./saints-catalogue.js";
import { projectSaintSourceIndexItems } from "./saints-source-index.js";
import { mapViewport, mountExploreMap, exploreMapFeatures } from "./map-runtime.js";
import { mappedVenueViewportLabel } from "./mass-map-viewport-context.js";
import {buildAtlasCoverage} from "./mapcn-atlas-coverage.js";
import {buildSacredNetwork} from "./mapcn-network-model.js";
import { ATLAS_PHYSICAL_STYLE } from "./atlas-physical-style.js";
import { readAtlasReadingPlace, saveAtlasReadingPlace } from "./bible-atlas-reading-place.js";
import { buildBibleAtlas, atlasMapItems, atlasIndexForPin, atlasDetail, atlasPinEpisodes, atlasEraOverlay, atlasCinemaPlate, renderBibleAtlasToString } from "./bible-atlas.js";
import { buildCustomsAtlasFacets, filterCustomsAtlasItems } from "./customs-atlas-filters.js";
import { groupTraditionsForBrowse, countCanonicalTraditions } from "./traditions-browse.js";
import { PUBLIC_HERITAGE_CATEGORIES, projectHeritagePlaces, nearbyHeritagePlaces } from "./heritage-map.js";
import { buildExplorePlaceProfiles } from "./place-profiles.js";
import { publishedCustomFolioId } from "./custom-canonical-handoff.js";
import { buildPilgrimageJourneyCatalogue,selectedPilgrimageJourney,journeysForCanonicalPlace } from "./pilgrimage-journey.js";

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
    ".aoCustomsLibraryLaunch{display:block;width:100%;margin:15px 0 6px;min-height:48px;text-align:left;padding:12px 14px;border:1px solid rgba(217,197,154,.55);border-radius:9px;background:#27301f;color:#f4e5c9;font:600 14px/1.4 var(--ao-font-ui,system-ui,sans-serif)}.aoCustomsLibraryLaunch:hover{background:#313d2c}.aoCustomsLibraryLaunch:focus-visible{outline:2px solid #d9c59a;outline-offset:3px}",
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
    ".aoMapLegend{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:12px 5px 3px;color:#b7c6d6;font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}\n.aoMapLegendLabel{color:#e5f2ff;margin-right:4px}\n.aoMapLegend>span[data-group]{display:inline-flex;align-items:center;gap:6px;min-height:32px;padding:4px 9px;border-radius:8px;background:#101925;border:1px solid #254355;color:#e1edf9}\n.aoMapLegend>span[data-group] img{display:block;flex:none;width:27px;height:27px;object-fit:contain;filter:drop-shadow(0 0 3px #22d6f766)}\n.aoMapLegend>span[data-group]:before{display:none}\n.aoMapLegend>span[data-group=FSSP]{border-color:#00e5ff66}\n.aoMapLegend>span[data-group=ICKSP]{border-color:#bc65ff66}\n.aoMapLegend>span[data-group=SSPX]{border-color:#347cff66}\n.aoMapLegend>span[data-group=IBP]{border-color:#ff9d2466}\n.aoMapLegend>span[data-group=DIOCESAN]{border-color:#a3ff1266}\n.aoMapLegend>span[data-group=OTHER]:before{content:\"\";display:inline-block;width:10px;height:10px;border-radius:50%;background:#93a3b9}\n.aoMapLegend>small{display:block;flex-basis:100%;font-weight:400;color:#9badbe;margin-top:3px}\n.aoMapEmblemCredits{flex-basis:100%;font:400 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#98aabd}\n.aoMapEmblemCredits summary{cursor:pointer;width:max-content;min-height:34px;display:flex;align-items:center;outline-offset:3px;color:#9ddbea}\n.aoMapEmblemCredits>div{padding:8px 10px;border-radius:8px;background:#0c1620;border:1px solid #254355}\n.aoMapEmblemCredits p{margin:7px 0}\n.aoMapEmblemCredits a{color:#64dfff;text-decoration:underline;text-underline-offset:2px}.aoExploreDarkPopup .maplibregl-popup-content{padding:5px;background:#0b1622;color:#e8f4ff;border:1px solid #254355;border-radius:11px;box-shadow:0 12px 36px #000b}.aoExploreDarkPopup .maplibregl-popup-close-button{font-size:23px;min-width:34px;min-height:34px;color:#e7f6ff;border-radius:8px;z-index:3}.aoExploreDarkPopup .aoExplorePlaceChoices button:focus-visible{outline:2px solid #00e5ff;outline-offset:2px}.aoExploreDarkPopup .aoExplorePlaceChoices button:active{background:#123548}",
    "@media(min-width:800px){.aoFindSurface:has(.aoFindBody[data-find-view=map]){max-width:none}.aoFindBody[data-find-view=map] .aoFindMap{height:calc(100vh - 315px);min-height:480px}}",
    "@media(max-width:520px){.aoFindBody[data-find-view=map]{padding:0 8px 18px}.aoFindBody[data-find-view=map] .aoFindMap{height:calc(100dvh - 310px);min-height:350px}.aoMapLegend{gap:5px;font-size:10px}.aoMapLegend>span[data-group]{padding:5px 7px}}",
    ".aoFindSheetBackdrop{position:fixed;inset:0;z-index:var(--ao-z-sheet,2147483000);background:rgba(0,0,0,.68);display:flex;align-items:flex-end}.aoFindSheet{max-height:82vh;overflow:auto;width:100%;box-sizing:border-box;background:#0d141d;border-top:1px solid rgba(217,197,154,.25);border-radius:22px 22px 0 0;padding:20px}",
    ".aoFindSheet header{display:grid;grid-template-columns:1fr var(--ao-control-h,44px);gap:12px}.aoFindSheet h2{margin:4px 0 5px;font-size:24px}.aoFindSheet header p{margin:0;color:#a99e89}.aoFindSheet header button{width:var(--ao-control-h,44px);height:var(--ao-control-h,44px);min-height:var(--ao-control-h,44px);border:0;border-radius:var(--ao-pill-radius,999px);background:transparent;color:#eee;font-size:24px}",
    ".aoExploreLead{color:#d2c7b2;line-height:1.5}.aoFindFacts{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:18px 0}.aoFindFacts>div{background:#101923;border-radius:12px;padding:12px}.aoFindFacts strong{display:block;margin-top:5px;font-size:13px}",
    ".aoFindSchedules article{border-top:1px solid rgba(217,197,154,.12);padding:10px 0}.aoFindSchedules article small{display:block;margin-bottom:4px}.aoFindSchedules p{white-space:pre-line;color:#c0b6a3;font-size:13px}",
    ".aoExploreAddress{margin:15px 0;padding:12px;border:1px solid rgba(217,197,154,.1);border-radius:12px}.aoExploreAddress p{margin:5px 0 0;color:#c5baa6}",
    ".aoTraditionEvidence{margin:16px 0;border:1px solid rgba(217,197,154,.16);border-radius:12px;padding:12px 14px}.aoTraditionEvidence summary{cursor:pointer;min-height:32px;color:#e2d0aa;font:650 13px var(--ao-font-ui,system-ui,sans-serif)}.aoTraditionEvidence article{border-top:1px solid rgba(217,197,154,.12);padding:12px 0}.aoTraditionEvidence article strong{display:block;font-size:13px}.aoTraditionEvidence article small{display:block;color:#9e937f;margin:5px 0}.aoTraditionEvidence article p{line-height:1.45;color:#c7baa5;font-size:13px}.aoTraditionEvidence article button{min-height:44px;padding:8px 12px;border:1px solid rgba(217,197,154,.25);border-radius:999px;background:transparent;color:#e5d4b2;cursor:pointer}",
    ".aoExploreTraditionSheet{max-height:calc(100dvh - 20px);padding:24px 20px calc(25px + env(safe-area-inset-bottom));border-top-color:rgba(217,197,154,.42);background:linear-gradient(180deg,#151d26 0,#0b121a 225px,#0a1119 100%)}.aoExploreTraditionSheet header small{color:#c4a976;letter-spacing:.12em}.aoExploreTraditionSheet header h2{font:400 clamp(23px,5.8vw,32px)/1.19 var(--ao-font-display,Georgia,serif);color:#f1e5d0;overflow-wrap:break-word}.aoExploreTraditionSheet>.aoExploreLead{font:400 15px/1.68 var(--ao-font-body,Georgia,serif);color:#dbcfb9;letter-spacing:.005em;margin:16px 0 18px;max-width:70ch}.aoExploreTraditionSheet .aoExploreSections{margin-top:19px}.aoExploreTraditionSheet .aoExploreSections article{padding:16px 0 18px;border-color:rgba(217,197,154,.19)}.aoExploreTraditionSheet .aoExploreSections article small{color:#c7ad82;font:650 11px/1.5 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;text-transform:uppercase}.aoExploreTraditionSheet .aoExploreSections article p{font:400 15px/1.67 var(--ao-font-body,Georgia,serif);color:#ded1bc;overflow-wrap:break-word;max-width:70ch}.aoExploreTraditionSheet .aoTraditionEvidence summary{min-height:44px;display:flex;align-items:center;font-size:14px}.aoExploreTraditionSheet .aoTraditionEvidence article p{font-size:14px;line-height:1.6}.aoExploreTraditionSheet .aoFindSources a{overflow-wrap:anywhere;max-width:100%;white-space:normal;line-height:1.4}.aoExploreTraditionSheet .aoFindFacts strong{font-size:14px;line-height:1.4;overflow-wrap:anywhere}@media(max-width:520px){.aoExploreTraditionSheet{padding:20px 16px calc(28px + env(safe-area-inset-bottom));border-radius:18px 18px 0 0}.aoExploreTraditionSheet>.aoExploreLead,.aoExploreTraditionSheet .aoExploreSections article p{font-size:15px;line-height:1.65}}",
    ".aoFindActions{display:flex;flex-wrap:wrap;gap:8px;margin:15px 0}.aoFindActions a,.aoFindActions button,.aoFindSources a{display:inline-flex;align-items:center;min-height:var(--ao-control-h,44px);border:1px solid rgba(217,197,154,.2);border-radius:var(--ao-pill-radius,999px);padding:9px 12px;color:#e7d8b8;text-decoration:none;font:650 var(--ao-type-ui-sm,12px) var(--ao-font-ui,system-ui,sans-serif);background:transparent;cursor:pointer}",
    ".aoFindSources{margin:15px 0}.aoFindSources>div{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.aoFindSheet footer{color:#8f846e;font:500 var(--ao-type-ui-xs,11px)/1.4 var(--ao-font-ui,system-ui,sans-serif);margin-top:14px}.aoFindGeoAttribution{display:block;margin-top:6px;opacity:.82}",
    ".aoExplorePlaceGroup{margin:16px 0;padding-top:13px;border-top:1px solid rgba(217,197,154,.1)}.aoExplorePlaceGroup>small{display:block;font:650 var(--ao-type-ui-xs,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;color:#b7a57d;margin-bottom:9px}.aoExplorePlaceGroup>p{color:#bdb29f;line-height:1.45;font-size:13px}.aoExplorePlaceGroup>article{display:flex;justify-content:space-between;gap:12px;padding:8px 0;border-top:1px solid rgba(217,197,154,.07)}.aoExplorePlaceGroup>article:first-of-type{border-top:0}.aoExplorePlaceGroup>article button{min-height:38px;flex:none;border:1px solid rgba(217,197,154,.27);border-radius:999px;background:#111c25;color:#e5d5b5;padding:7px 10px;font:600 11px var(--ao-font-ui,system-ui,sans-serif)}.aoExplorePlaceGroup>article>div{min-width:0}.aoExplorePlaceGroup>article>div p{font-size:11px;line-height:1.4;color:#a59d90;margin:5px 0}.aoExplorePlaceGroup>article strong{font-size:13px;font-weight:500}.aoExplorePlaceGroup>article span{color:#a99e89;font:600 11px sans-serif;white-space:nowrap}.aoExplorePlaceRows{display:grid;gap:7px}.aoExplorePlaceRow{width:100%;display:flex;justify-content:space-between;gap:12px;align-items:center;text-align:left;border:1px solid rgba(217,197,154,.12);background:#101923;color:#e9e4d9;border-radius:12px;padding:11px}.aoExplorePlaceRow span{min-width:0}.aoExplorePlaceRow small{display:block;color:#a99570;font:650 var(--ao-type-ui-xs,11px)/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em}.aoExplorePlaceRow strong{display:block;margin-top:4px;font-size:13px;font-weight:500}.aoExplorePlaceRow i{font:600 var(--ao-type-ui-xs,11px) var(--ao-font-ui,system-ui,sans-serif);color:#887e6d;font-style:normal;text-align:right}",
    "@media(min-width:800px){.aoFindSurface{max-width:980px;margin:auto;border-left:1px solid rgba(217,197,154,.08);border-right:1px solid rgba(217,197,154,.08)}.aoFindList{grid-template-columns:repeat(2,minmax(0,1fr))}.aoFindSheet{max-width:720px;margin:0 auto}.aoFindSheetBackdrop{justify-content:center}}",
    ".aoHeritageSurface{display:flex;flex-direction:column;height:100%;overflow:hidden;background:#080c12}.aoHeritageSurface .aoFindHeader{flex:none;padding:9px 12px;grid-template-columns:44px minmax(0,1fr) 44px auto}.aoHeritageSurface .aoFindHeader h1{font-size:21px}.aoHeritageCategories{display:flex;gap:7px;flex:none;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin;padding:10px 12px 8px}.aoHeritageCategories button{white-space:nowrap;min-height:42px;flex:none;border:1px solid rgba(217,197,154,.23);background:#101923;color:#c9bba3;border-radius:999px;padding:9px 12px;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageCategories button.active{border-color:#d9c59a;color:#f5e5c3;background:#28271f}.aoHeritageCategories button[data-category]:before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#c1ad80;margin-right:6px}.aoHeritageCategories button[data-category=relics]:before{background:#a99bc5}.aoHeritageCategories button[data-category=apparitions]:before{background:#a0b5c8}.aoHeritageCategories button[data-category=pilgrimages]:before{background:#87ac9b}.aoHeritageCategories button[data-category=traditions]:before{background:#c49c93}",
    ".aoHeritageTools{display:flex;align-items:center;gap:8px;position:relative;padding:0 12px 9px;z-index:4;flex:none}.aoHeritageTools .aoFindSearch{padding:0;min-width:0;flex:1}.aoHeritageTools .aoFindSearch input{border-radius:999px;min-height:44px;padding:11px 16px;background:#101923}.aoHeritageMore{flex:none;position:relative;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageMore summary{display:flex;align-items:center;justify-content:center;cursor:pointer;list-style:none;min-height:44px;padding:0 13px;border:1px solid rgba(217,197,154,.2);border-radius:999px;color:#e6d3af;background:#101923}.aoHeritageMore summary::-webkit-details-marker{display:none}.aoHeritageMore>div{position:absolute;z-index:8;top:50px;right:0;background:#101923;border:1px solid rgba(217,197,154,.23);border-radius:12px;padding:12px;width:min(310px,80vw);box-shadow:0 12px 26px #0009;color:#afa28f;line-height:1.4}.aoHeritageMore button{min-height:44px;color:#e8d7b7;background:transparent;border:1px solid rgba(217,197,154,.22);border-radius:9px;padding:10px;font:inherit}.aoHeritageMore>div{max-height:min(66dvh,520px);overflow:auto}.aoHeritageMore>div>strong{display:block;color:#e8d5b3;font:650 12px var(--ao-font-ui,system-ui,sans-serif);padding-bottom:10px}.aoHeritageSecondary{display:grid;grid-template-columns:1fr;gap:7px}.aoHeritageSecondary button{width:100%;text-align:left}.aoHeritageMore>div p{font-size:11px;line-height:1.4;color:#a69b89}",
    ".aoExploreMainDestinations{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;padding:9px 12px 5px;flex:none}.aoExploreMainDestinations>*{min-width:0;min-height:48px;display:flex;align-items:center;justify-content:center;text-align:center;padding:8px 6px;border:1px solid rgba(217,197,154,.23);border-radius:12px;background:#101923;color:#d9c9ae;font:650 12px/1.25 var(--ao-font-ui,system-ui,sans-serif)}.aoExploreMainDestinations>.active{color:#0b1017;background:#d9c59a;border-color:#d9c59a}.aoExploreMainDestinations button{cursor:pointer}.aoExploreMainDestinations button:focus-visible{outline:2px solid #d9c59a;outline-offset:2px}",
    ".aoExploreSectionNav{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:0 14px 9px;padding:7px 0;border-bottom:1px solid rgba(217,197,154,.14)}.aoExploreSectionNav>span{font:650 10px/1.35 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.06em;color:#9c907b}.aoExploreSectionSwitcher{position:relative;flex:none}.aoExploreSectionSwitcher>summary{display:flex;align-items:center;justify-content:center;min-height:44px;padding:8px 13px;border:1px solid rgba(217,197,154,.24);border-radius:999px;background:#111923;color:#e4d5b7;font:650 12px var(--ao-font-ui,system-ui,sans-serif);cursor:pointer;list-style:none}.aoExploreSectionSwitcher>summary::-webkit-details-marker{display:none}.aoExploreSectionSwitcher>div{position:absolute;right:0;top:49px;z-index:12;width:min(285px,75vw);max-height:min(58dvh,430px);overflow:auto;border:1px solid rgba(217,197,154,.27);border-radius:12px;padding:8px;background:#101923;box-shadow:0 14px 30px #0009;display:grid;gap:5px}.aoExploreSectionSwitcher button{width:100%;min-height:48px;text-align:left;padding:10px 12px;border:1px solid rgba(217,197,154,.15);border-radius:10px;background:#17212c;color:#f0e5ce;font:600 13px var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoExploreSurface button,.aoExploreSurface summary{touch-action:manipulation}.aoFindSheet,.aoFindSurface{overscroll-behavior-y:contain;-webkit-overflow-scrolling:touch}.aoFindFilters .aoExploreQuickFilters{overflow-x:auto;scrollbar-width:thin}.aoHeritageCategories button{min-height:48px;padding-inline:15px}.aoFindList .aoExploreCard{padding:13px 15px}.aoFindList .aoExploreCard strong{font-size:16px;margin:6px 0 3px}.aoFindList .aoExploreCard p{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.aoHeritageTools .aoFindSearch input{font-size:16px}",
    "@media(max-width:520px){.aoExploreSectionNav{margin:0 10px 7px}.aoExploreSectionNav>span{max-width:52vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.aoExploreMainDestinations{padding:7px 8px 4px}.aoExploreMainDestinations>*{min-height:50px;font-size:12px}.aoHeritageCategories{padding:5px 8px!important}.aoExploreSurface .aoFindHeader h1{font-size:20px}}",
    ".aoHeritageBody.aoFindBody[data-find-view=map]{flex:1;min-height:230px;position:relative;padding:0 8px 8px;overflow:hidden}.aoHeritageBody.aoFindBody[data-find-view=map] .aoFindMap{height:100%;min-height:0;margin:0;border-radius:12px}.aoHeritageCustomStrip{position:absolute;bottom:38px;left:16px;right:16px;max-width:720px;z-index:2;border:1px solid rgba(217,197,154,.22);border-radius:13px;background:rgba(8,12,18,.90);backdrop-filter:blur(12px);padding:8px 9px;box-shadow:0 10px 26px #0008}.aoHeritageStripHeading{display:flex;justify-content:space-between;align-items:center;gap:12px;color:#e3d4b7;font:650 11px var(--ao-font-ui,system-ui,sans-serif);padding:1px 4px 7px;letter-spacing:.04em}.aoHeritageStripHeading button{border:0;background:transparent;color:#f0d9a6;text-decoration:underline;font:inherit;min-height:28px}.aoHeritageCustomRail{display:flex;gap:7px;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:thin}.aoHeritageCustomRail button{flex:0 0 145px;min-height:68px;text-align:left;border:1px solid rgba(217,197,154,.16);border-radius:9px;background:#15202a;color:#efe6d4;padding:9px;cursor:pointer}.aoHeritageCustomRail button.active{border-color:#dac494;background:#302b22}.aoHeritageCustomRail strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font:600 13px/1.2 var(--ao-font-display,Georgia,serif)}.aoHeritageCustomRail small{display:block;margin-top:6px;color:#9b907c;font:500 10px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageScope{margin:0;padding:3px 14px 7px;color:#a79d89;font:11px/1.3 var(--ao-font-ui,system-ui,sans-serif)}",
    ".aoExploreQuickPreview{max-height:min(53dvh,455px);padding:14px 18px calc(14px + env(safe-area-inset-bottom));background:linear-gradient(180deg,#131c27,#090f17);border-color:rgba(217,197,154,.28);box-shadow:0 -15px 55px #0008}.aoExploreQuickPreview .aoHeritageSheetHandle{width:42px;height:4px;border-radius:99px;margin:0 auto 12px;background:rgba(217,197,154,.38)}.aoExploreQuickPreview header{align-items:start}.aoExploreQuickPreview h2{font:600 clamp(19px,4.7vw,24px)/1.22 var(--ao-font-display,Georgia,serif);margin:3px 0 5px}.aoExploreQuickPreview header small{color:var(--liturgical,#c7ac77);font:650 10px/1.35 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase}.aoExploreQuickPreview header p{font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#9dabb6}.aoExplorePreviewSynopsis{font:14px/1.48 var(--ao-font-ui,system-ui,sans-serif);color:#e2ddd2;margin:12px 0 8px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}.aoExplorePreviewCaution{font:11px/1.45 var(--ao-font-ui,system-ui,sans-serif);color:#b5a78f;margin:10px 0}.aoExplorePreviewActions{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.aoExplorePreviewActions>button,.aoExplorePreviewActions>a{min-height:48px;min-width:122px;display:inline-flex;align-items:center;justify-content:center;gap:6px;padding:11px 15px;border-radius:11px;border:1px solid rgba(217,197,154,.27);background:#192430;color:#e6d6b5;font:650 13px var(--ao-font-ui,system-ui,sans-serif);text-decoration:none;cursor:pointer}.aoExplorePreviewActions>button:first-child{background:rgba(217,197,154,.19);border-color:rgba(217,197,154,.45);flex:1}.aoExplorePreviewSourceCount{display:block;color:#938c7e;font:11px var(--ao-font-ui,system-ui,sans-serif);margin-top:10px}.aoExploreFullBack{margin:0 0 15px}.aoExploreFullBack button{min-height:44px;border:1px solid rgba(217,197,154,.22);border-radius:11px;padding:9px 13px;background:#17212b;color:#e4cfac;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}",
    "@media(max-width:520px){.aoExploreQuickPreview{max-height:min(51dvh,430px);padding:12px 14px calc(12px + env(safe-area-inset-bottom))}.aoExploreQuickPreview h2{font-size:20px}.aoExploreQuickPreview .aoExplorePreviewSynopsis{-webkit-line-clamp:2}.aoExplorePreviewActions>button{min-height:50px}}",
    ".aoHeritageSurface .aoFindSheetBackdrop{background:rgba(0,0,0,.34)}.aoHeritagePreview{max-width:660px;max-height:48vh}.aoHeritagePreview h2{font-size:21px}.aoHeritagePlaceTags{display:flex;gap:6px;flex-wrap:wrap;margin:14px 0}.aoHeritagePlaceTags span{background:#19212b;border:1px solid rgba(217,197,154,.17);padding:6px 9px;border-radius:999px;color:#cbbca5;font:600 11px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritageCaution{font:12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#b2a58f;margin:9px 0}.aoHeritagePreviewActions{display:flex;gap:8px;margin-top:10px}.aoHeritagePreviewActions button,.aoHeritagePreviewActions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border:1px solid rgba(217,197,154,.27);border-radius:999px;background:#1d2023;color:#e9d3a7;padding:10px 16px;text-decoration:none;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}.aoHeritagePreviewActions button:first-child{background:#dac494;color:#0b121b}",
    ".aoHeritageStripActions{display:flex;align-items:center;gap:8px}.aoExploreReturnMap{grid-column:1/-1}@media(max-width:520px){.aoHeritageCategories{padding:7px 8px}.aoHeritageTools{padding:0 8px 7px}.aoHeritageCustomStrip{left:12px;right:12px;bottom:34px}.aoHeritageCustomRail button{flex-basis:126px}.aoHeritagePreviewActions{flex-wrap:wrap}.aoHeritageSurface .aoFindHeader h1{font-size:19px}}",
    "@media(max-width:520px){.aoExploreLensTabs{grid-template-columns:repeat(3,minmax(0,1fr))}.aoFindMap{height:calc(100vh - 320px);min-height:360px}}",
    "\n/* Compact map-first TLM controls: search and List/Map stay visible while scrolling. */\n.aoExploreSurface:has(.aoExploreTlmFilters) .aoExploreSectionNav{margin-bottom:2px;padding:4px 0}\n.aoExploreSurface:has(.aoExploreTlmFilters) .aoExploreSectionSwitcher>summary{min-height:38px}\n.aoExploreSurface .aoTlmToolbar{position:sticky;top:76px;z-index:4;display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:8px;padding:7px 14px;background:rgba(8,12,18,.97);border-bottom:1px solid #28404e;box-shadow:0 4px 12px #0005}\n.aoTlmToolbar .aoFindSearch{padding:0;min-width:0}\n.aoTlmToolbar .aoFindSearch input{height:46px;min-height:46px;padding:9px 13px;border:1px solid #365467;color:#eef7ff;background:#14202c;border-radius:10px;font:500 15px/1.2 var(--ao-font-ui,system-ui,sans-serif)}\n.aoTlmToolbar .aoFindViewTabs{display:flex;gap:5px;padding:0}\n.aoTlmToolbar .aoFindViewTabs button{min-height:46px;min-width:58px;border-radius:9px}\n.aoTlmToolbar .aoFindViewTabs button.active{background:#143a49;color:#e6faff;border-color:#25d5fc}\n.aoExploreSurface .aoExploreTlmFilters{padding:7px 14px 4px}\n.aoExploreTlmFilters .aoExploreQuickFilters{display:flex;flex-wrap:nowrap;gap:6px;align-items:center;overflow-x:auto;white-space:nowrap;padding:0 0 5px;scrollbar-width:thin}\n.aoExploreTlmFilters .aoExploreQuickFilters button{flex:none;min-height:38px;padding:8px 11px;border-radius:9px}\n.aoExploreTlmFilters .aoExploreQuickFilters button.active{background:#173e4c;color:#edfbff;border-color:#00dffc}\n.aoTlmProviderStrip{display:flex;align-items:center;gap:9px;min-width:0;padding:1px 0 5px}\n.aoTlmProviderStrip .aoExploreFilterLabel{flex:none}\n.aoTlmProviderStrip .aoFindAffiliations{display:flex;align-items:center;gap:6px;overflow-x:auto;white-space:nowrap;scrollbar-width:thin}\n.aoTlmProviderStrip button{display:inline-flex;align-items:center;justify-content:center;gap:5px;min-height:42px;padding:5px 10px;flex:none;border-radius:9px}\n.aoTlmProviderStrip button img{width:25px;height:25px;object-fit:contain;filter:drop-shadow(0 0 3px #00dbff55)}\n.aoTlmProviderStrip button[data-find-affiliation=SSPX] img{filter:brightness(0) invert(1) drop-shadow(0 0 4px #347cffb3)}\n.aoTlmProviderStrip button.active{background:#173e4c;color:#edfbff;border-color:#00dffc}\n.aoExploreSurface .aoPreliminaryDirectoryNotice{display:block;margin:1px 0 4px;padding:0;color:#a5bed2;background:none;border:0;font:500 11px/1.5 var(--ao-font-ui,system-ui,sans-serif)}\n.aoPreliminaryDirectoryNotice>summary{display:list-item;list-style:disclosure-closed inside;min-height:26px;cursor:pointer;color:#9fd7e4;padding:5px 0}\n.aoPreliminaryDirectoryNotice[open]>summary{list-style:disclosure-open inside}\n.aoPreliminaryDirectoryNotice p{margin:2px 0 5px;padding:9px 12px;border:1px solid #314755;background:#111c28;border-radius:8px;color:#b8c9d8;font:12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}\n.aoExploreSurface:has(.aoExploreTlmFilters) .aoFindResultMeta{padding-top:5px;padding-bottom:8px}\n.aoExploreSurface:has(.aoExploreTlmFilters) .aoFindBody[data-find-view=map]{padding:0 9px 7px}\n.aoExploreSurface:has(.aoExploreTlmFilters) .aoFindBody[data-find-view=map] .aoFindMap{margin:0;width:100%;box-sizing:border-box;height:clamp(430px,74dvh,860px);min-height:0;border:1px solid #304858;border-radius:11px}\n.aoExploreSurface .aoFindExternalSource{display:block;margin:5px 14px 18px;padding:0 10px;border:1px solid #293b48;background:#0d1721;border-radius:10px}\n.aoExploreSurface .aoFindExternalSource summary{display:list-item;cursor:pointer;padding:12px 5px;min-height:24px;color:#a8d5e5;font:600 12px var(--ao-font-ui,system-ui,sans-serif)}\n.aoExploreSurface .aoFindExternalSource>div{margin:8px 0}\n.aoExploreSurface .aoFindExternalSource a{margin:4px 7px 10px 0;display:inline-flex}\n.aoExploreMapReset{position:absolute;z-index:3;top:11px;left:11px;min-height:42px;max-width:190px;padding:8px 12px;display:flex;align-items:center;gap:7px;background:rgba(10,21,32,.95);color:#ebfaff;border:1px solid #39b3d7;border-radius:9px;font:600 12px/1.2 var(--ao-font-ui,system-ui,sans-serif);box-shadow:0 4px 16px #0009;cursor:pointer}\n.aoExploreMapReset:focus-visible{outline:2px solid #00e5ff;outline-offset:3px}\n@media(max-width:600px){\n.aoExploreSurface .aoTlmToolbar{top:69px;padding:6px 9px;gap:6px}\n.aoTlmToolbar .aoFindSearch input{min-height:44px;height:44px;font-size:16px}\n.aoTlmToolbar .aoFindViewTabs button{min-height:44px;min-width:49px;padding:7px 9px}\n.aoExploreSurface .aoExploreTlmFilters{padding:6px 9px 4px}\n.aoTlmProviderStrip{display:block}\n.aoTlmProviderStrip .aoExploreFilterLabel{display:block;padding:0 0 2px}\n.aoExploreSurface:has(.aoExploreTlmFilters) .aoFindBody[data-find-view=map] .aoFindMap{height:max(410px,63dvh)}\n.aoExploreMapReset{top:9px;left:9px;min-height:44px}\n}",
    "@media(max-width:600px){\n.aoExploreSurface:not(.aoHeritageSurface) .aoFindHeader{grid-template-columns:44px minmax(0,1fr) 44px;gap:8px;padding:9px 10px}\n.aoExploreSurface:not(.aoHeritageSurface) .aoFindHeader>span{display:none}\n.aoExploreSurface:not(.aoHeritageSurface) .aoFindHeader h1{font-size:clamp(17px,4.5vw,21px);line-height:1.03;margin:2px 0 0;overflow-wrap:normal}\n}\n@media(max-width:355px){\n.aoExploreSurface:not(.aoHeritageSurface) .aoFindHeader small{display:none}\n.aoExploreSurface:not(.aoHeritageSurface) .aoFindHeader h1{font-size:18px;line-height:1.06}\n.aoExploreSurface:not(.aoHeritageSurface) .aoFindHeader{padding-block:7px;min-height:54px}\n}",
  ].join("")+HERITAGE_STYLE+SAINTS_SHEET_CSS+EXPLORE_ATLAS_LAYOUT_STYLE+EXPLORE_MAP_FIRST_V2_STYLE+DIRECTORY_CARD_STYLE+TLM_CHURCH_PROFILE_STYLE;
  win.document.head?.append?.(style);
}

export function createFindOwner(win=globalThis){
  // Integrated canonical Biblical Atlas: map-first physical terrain and
  // source-context notes are the default. Explicit legacy opt-outs exist for
  // regression comparisons without hiding shipped features behind URL flags.
  const query=new URLSearchParams(String(win?.location?.search??""));
  const bibleCinemaPreview=query.get("atlasCinema")!=="0";
  const bibleHistoricalPreview=bibleCinemaPreview&&query.get("atlasHistory")!=="0";
  let bibleCinemaFollow=true,bibleCinemaSheetExpanded=false,bibleCinemaPlateTimer=null;
  let bibleProgrammaticScrollUntil=0;
  const atlasDeviceStorage=()=>{try{return win?.localStorage??null;}catch{return null;}};
  let openState=false,dataset=null,projection=null,mapHandle=null,loading=null,preliminary=null,preliminaryLoading=null;
  let directoryCardMedia=null,directoryCardMediaLoading=null;
  // A transient source-reader return token; never persists Atlas event progress.
  let atlasScriptureReturn=null;
  let paintToken=0,lastLoadError=null;
  let lastMapView=null,lastMapLens=null,lastExploreViewModel=null;
  // Ephemeral ranked results only. Device location is never stored or persisted.
  let nearbyResults=null;
  let networkGraph=null;
  let journeyPreviousCategories=null;
  const queryByLens=new Map();
  const scrollGuard=createScrollTapGuard(win?.document,{
    contains:target=>Boolean(getRoot(win)?.contains?.(target)),
  });
  let atlasReturnViewport=null;
  const state={
    lens:"heritage",
    view:"map",
    directoryGroup:"ALL",
    query:"",
    saintCategory:"ALL",
    saintScope:"profiles",
    day:"ANY",
    affiliations:[],
    unaCum:"ANY",
    liturgy:"ANY",
    massType:"ANY",
    heritageCategories:[...PUBLIC_HERITAGE_CATEGORIES],
    highlightCustomId:null,
    journeyOpen:false,journeySelectedId:null,
    expandPlace:false,
    expandDetail:false,
    atlasFamily:"ANY",
    atlasArea:"ANY",
    atlasPeriod:"ANY",
    atlasCalendar:"ANY",
    calendarKey:null,
    selectedId:null,
    selectedPlaceId:null,
    displayLimit:24,
    mapcnDiscoverLimit:36,
    timeMassOpen:false,
    timeMassDate:localTodayIso(),
    timeMassQuery:"",
    timeMassEvidence:"ALL",
    timeMassLimit:24,
    atlasMode:"places",
    atlasScope:"all",
    atlasCountry:null,
    atlasCountryLimit:12,
    networkOpen:false,
    networkFocus:"",
    networkSearch:"",
    networkKind:"all",
    networkLimit:12,
    bibleAtlas:false,
    bibleIndex:0,
  };

  function glossaryTerms(){
    if(state.lens==="tlm")return ["G135","G149","G150","G449","G450","G047","G048","G049"];
    if(state.lens==="saints")return ["G336","G321"];
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
  function nearbyStatus(message){
    const label=getRoot(win)?.querySelector?.("[data-heritage-location-status]");
    if(label){label.textContent=String(message||"");label.hidden=!message;}
  }
  // Explicit user gesture only. Coordinates never enter Ad Orientem's data
  // registry and do not change the canonical point/source records.
  function locateNearby(button){
    if(state.lens!=="heritage")return;
    nearbyStatus("");
    const geo=win?.navigator?.geolocation;
    if(!geo?.getCurrentPosition){
      nearbyStatus(language(win)==="fr"?"Géolocalisation indisponible sur cet appareil.":"Location unavailable on this device.");
      return;
    }
    if(!mapHandle?.map){
      nearbyStatus(language(win)==="fr"?"Carte indisponible. Cherchez un lieu par son nom.":"Map unavailable. Search for a place by name.");
      return;
    }
    button?.setAttribute?.("aria-busy","true");
    geo.getCurrentPosition(position=>{
      button?.removeAttribute?.("aria-busy");
      if(!openState||state.lens!=="heritage"||!mapHandle?.map)return;
      const lat=position?.coords?.latitude,lng=position?.coords?.longitude;
      if(!Number.isFinite(lat)||!Number.isFinite(lng))return;
      const currentZoom=mapHandle.map.getZoom?.()??2;
      const options={center:[lng,lat],zoom:Math.max(currentZoom,7)};
      if(win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)mapHandle.map.jumpTo?.(options);
      else mapHandle.map.easeTo?.({...options,duration:450});
      nearbyResults=nearbyHeritagePlaces(filtered(),{lat,lng},{limit:6});
      if(!nearbyResults.length){
        nearbyStatus(language(win)==="fr"?"Aucun lieu publié pour ces filtres.":"No mapped places match the current filters.");
      }else{
        void paint();
      }
    },()=>{
      button?.removeAttribute?.("aria-busy");
      nearbyStatus(language(win)==="fr"?"Accès à la position refusé ou indisponible. Utilisez la recherche.":"Location permission denied or unavailable. Use search instead.");
    },{enableHighAccuracy:false,timeout:10000,maximumAge:300000});
  }

  async function ensureData(){
    if(dataset)return dataset;
    if(!loading){
      const ticket=win?.AO_LOADING_DIRECTOR_V1?.begin?.("find");
      loading=loadExploreDataset({fetchImpl:win?.fetch?.bind?.(win)??fetch})
        .then(value=>{dataset=value;projection=projectExploreDataset(value);return value})
        .finally(()=>{loading=null;ticket?.end?.()});
    }
    return loading;
  }

  async function ensurePreliminary(){
    if(preliminary)return preliminary;
    if(!preliminaryLoading){
      const ticket=win?.AO_LOADING_DIRECTOR_V1?.begin?.("find");
      preliminaryLoading=loadPreliminaryR49({fetchImpl:win?.fetch?.bind?.(win)??fetch})
        .then(value=>{preliminary=value;return value})
        .finally(()=>{preliminaryLoading=null;ticket?.end?.()});
    }
    return preliminaryLoading;
  }

  async function ensureDirectoryCardMedia(){
    if(directoryCardMedia)return directoryCardMedia;
    if(!directoryCardMediaLoading){
      directoryCardMediaLoading=loadDirectoryCardMedia({fetchImpl:win?.fetch?.bind?.(win)??fetch})
        .then(value=>{directoryCardMedia=value;return value})
        .finally(()=>{directoryCardMediaLoading=null;});
    }
    return directoryCardMediaLoading;
  }

  function filtered(){
    if(state.lens==="tlm")return filterPreliminaryR49(preliminary??[],state);
    if(!dataset||!projection)return [];
    if(state.lens==="heritage")return projectHeritagePlaces(projection,{categories:state.heritageCategories,query:state.query,customId:state.highlightCustomId});
    if(state.lens==="tlm"){
      const records=filterDirectoryRecords(dataset.directory?.records??[],state);
      return projectDirectoryItems(records,{communities:dataset.directory?.communities??[]});
    }
    if(state.lens==="traditions")return filterCustomsAtlasItems(projection.byLens.traditions,state);
    if(state.lens==="saints"&&state.view==="list"){
      if(state.saintScope!=="profiles"&&dataset.saintsRelease?.researchEnabled)
        return filterExploreItems(projectSaintSourceIndexItems(dataset,state.saintScope),{query:state.query});
      const people=filterExploreItems(projectSaintCatalogueItems(dataset),{query:state.query});
      if(state.saintCategory==="ALL"||!dataset.saintsRelease?.researchEnabled)return people;
      return people.filter(item=>{
        const saint=item.saints?.[0],classifications=saint?.classification??{};
        return [...(classifications.roles??[]),...(classifications.honours??[])].some(category=>category.code===state.saintCategory);
      });
    }
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

  // Rebuild only the small Discover rail on map movement. This uses the
  // currently filtered canonical Places and the existing MapLibre camera;
  // there is no parallel search index, geocoder, or map instance.
  function syncMassViewport(){
    if(!openState||state.lens!=="tlm"||state.view!=="map"||!mapHandle)return;
    const counter=getRoot(win)?.querySelector?.("[data-tlm-viewport-count]");
    if(!counter)return;
    try{counter.textContent=mappedVenueViewportLabel(mapHandle.viewportVenueStats?.(),language(win));}
    catch{counter.textContent=mappedVenueViewportLabel(null,language(win));}
  }

  function syncDiscoverViewport(){
    if(!openState||state.lens!=="heritage"||state.bibleAtlas)return;
    const rail=getRoot(win)?.querySelector?.("[data-mapcn-discover-rail]");
    const map=mapHandle?.map;
    if(!rail||!lastExploreViewModel||!map)return;
    let bounds=null;
    try{bounds=map.getBounds?.()??null;}catch{return;}
    if(!bounds||typeof bounds.contains!=="function")return;
    const visible=discoverItemsWithinMapBounds(lastExploreViewModel.items,bounds);
    const staged=win?.document?.createElement?.("div");
    if(!staged)return;
    const center=map.getCenter?.();
    staged.innerHTML=renderMapcnDiscoverRail({...lastExploreViewModel,items:visible,discoverViewport:true,
      discoverCenter:center&&Number.isFinite(Number(center.lat))&&Number.isFinite(Number(center.lng))
        ?{lat:Number(center.lat),lng:Number(center.lng)}:null});
    const next=staged.firstElementChild;
    if(!next||typeof rail.replaceWith!=="function")return;
    const expanded=rail.dataset?.discoverExpanded==="true";
    next.dataset.discoverExpanded=String(expanded);
    next.querySelector?.("[data-mapcn-discover-toggle]")?.setAttribute?.("aria-expanded",String(expanded));
    rail.replaceWith(next);
  }

  async function paint({preserveSearchFocus=false,selectionOnly=false}={}){
    const token=++paintToken;
    const node=ensureRoot(win);if(!node)return false;
    installStyle(win);
    // Rebuilding the entire Explore surface after each search keystroke
    // detaches its focused input. Retain focus, caret and page position so
    // users can type a complete query, including on mobile keyboards.
    const priorDiscoverScroll=node.querySelector?.(".aoMapcnDiscoverEntries")?.scrollTop??0;
    const priorDiscoverExpanded=node.querySelector?.("[data-mapcn-discover-rail]")?.dataset?.discoverExpanded==="true";
    const priorTimeMassScroll=node.querySelector?.(".aoTimeMassScroll")?.scrollTop??0;
    const priorNetworkScroll=node.querySelector?.(".aoNetworkResults")?.scrollTop??0;
    const wasNetworkSearch=node.querySelector?.("[data-network-search]")===win?.document?.activeElement;
    const networkCaret=wasNetworkSearch?node.querySelector?.("[data-network-search]")?.selectionStart:0;
    const activeTimeMassSearch=node.querySelector?.("[data-explore-time-mass-query]");
    const timeMassFocused=activeTimeMassSearch===win?.document?.activeElement;
    const timeMassCaret=timeMassFocused?{start:activeTimeMassSearch.selectionStart,
      end:activeTimeMassSearch.selectionEnd}:null;
    const activeSearch=node.querySelector?.("[data-find-query]");
    const searchFocus=preserveSearchFocus&&activeSearch===win?.document?.activeElement
      ? {
          start:activeSearch.selectionStart,
          end:activeSearch.selectionEnd,
          direction:activeSearch.selectionDirection,
          scroll:node.querySelector?.(".aoFindSurface")?.scrollTop??0,
        }
      : null;
    let data=null;
    const preliminaryMode=state.lens==="tlm";
    try{if(preliminaryMode)await Promise.all([ensurePreliminary(),ensureDirectoryCardMedia()]);else data=await ensureData()}catch(error){
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
    // A focused map-first view over the current Explore owner; do not
    // replace the bounded-world map or recreate it on every timeline event.
    if(state.bibleAtlas){
      const atlasStops=buildBibleAtlas(data?.biblePlaces?.entries??[]);
      node.innerHTML=renderBibleAtlasToString({language:language(win),atlasStops,atlasIndex:state.bibleIndex,
       cinematicPreview:bibleCinemaPreview,historicalPreview:bibleHistoricalPreview,cinemaFollow:bibleCinemaFollow,
       cinemaSheetExpanded:bibleCinemaSheetExpanded});
      // Place the selected source stop under the timeline cursor before async map
      // loading; the initial scroll origin must never nominate Creation by mistake.
      centerBibleMilestone(state.bibleIndex);
      node.dataset.open=openState?"true":"false";
      node.dataset.aoFindLoadState="ready";
      node.dataset.exploreLens=state.lens;
      mapHandle?.destroy?.();mapHandle=null;
      const mapNode=node.querySelector?.("[data-bible-map]");
      try{
        const handle=await mountExploreMap(mapNode,atlasMapItems(atlasStops,state.bibleIndex,{cinematic:bibleCinemaPreview,language:language(win)}),{
          win,allowEmpty:true,initialViewport:{center:[35,31],zoom:3.6},
          styleOverride:bibleCinemaPreview?ATLAS_PHYSICAL_STYLE:null,
          onSelect:id=>{
            const index=atlasIndexForPin(atlasStops,state.bibleIndex,id);
            updateBibleIndex(index,{center:true,remember:true});
            const detail=getRoot(win)?.querySelector?.("[data-bible-detail]");
            if(detail)detail.insertAdjacentHTML("beforeend",atlasPinEpisodes(
              atlasStops,data?.biblePlaces?.entries??[],String(id).replace(/^atlas:/,""),index,language(win)));
          },
        });
        if(token!==paintToken||!openState||!state.bibleAtlas){handle?.destroy?.();return false;}
        mapHandle=handle;
        if(bibleCinemaPreview){
          // Manual map drag suspends camera follow. Timeline selection keeps
          // updating source-backed pins without seizing the viewport.
          handle?.map?.on?.("dragstart",()=>{
            if(!openState||!state.bibleAtlas)return;
            bibleCinemaFollow=false;
            getRoot(win)?.querySelector?.("[data-bible-follow]")?.setAttribute?.("aria-pressed","false");
          });
        }
        updateBibleIndex(state.bibleIndex);
      }catch(error){
        try{win?.console?.error?.("Biblical Atlas map unavailable",error)}catch{}
        if(mapNode&&win?.document){
          const fallback=win.document.createElement("div");
          fallback.className="aoFindMapFallback";
          fallback.textContent=language(win)==="fr"
            ?"Carte indisponible. Parcourez la chronologie pour lire les Écritures."
            :"Map unavailable. Use the timeline to read the Scriptures.";
          mapNode.replaceChildren(fallback);
        }
      }
      return true;
    }
    const rawItems=filtered();
    // Canonical practice cards are a reading view over the immutable attestation
    // corpus. Site-backed map pins and Place-page deep links keep original IDs.
    const baseItems=state.lens==="traditions"&&state.view==="list"
      ?groupTraditionsForBrowse(rawItems,{includeNovenaContext:Boolean(state.query.trim())||state.atlasCalendar==="NOVENA"})
      :rawItems;
    const items=state.lens==="tlm"?attachApprovedDirectoryMedia(baseItems,directoryCardMedia??{}):baseItems;
    const canonical=projection?groupTraditionsForBrowse(projection.byLens.traditions):[];
    const selectedOverride=state.lens==="traditions"
      ?projection.byLens.traditions.find(item=>item.item_id===state.selectedId)??null
      :state.lens==="heritage"?canonical.find(item=>item.item_id===state.selectedId)??null:null;
    // Source attestations still enrich Place records; there is no public geographic Customs rail.
    const customCards=[];
    const placeProfiles=preliminaryMode?[]:buildExplorePlaceProfiles(data,projection,{today:localTodayIso()});
    const journeys=preliminaryMode?[]:buildPilgrimageJourneyCatalogue(
      projection?.byLens?.pilgrimages,data?.shrines?.sources,
      data?.shrines?.routeStageEvidence,data?.shrines?.routeGeometryReview,
      data?.shrines?.routeStageSiteLinks,data?.geography?.places);
    const atlasCoverage=state.lens==="heritage"
      ?buildAtlasCoverage(data,projection,{scope:state.atlasScope}):null;
    if(state.lens==="heritage"&&state.networkOpen&&!networkGraph)
      networkGraph=buildSacredNetwork(data);
    const featuredPlaces=placeProfiles.filter(p=>p.editorial_feature&&p.map_publishable&&p.sources.length)
      .sort((a,b)=>a.editorial_feature.ordinal-b.editorial_feature.ordinal);
    const vm=buildExploreViewModel({
      language:language(win),
      items,
      lens:state.lens,
      counts:preliminaryMode?{tlm:preliminary?.length??PRELIMINARY_R49_TOTAL}:{...projection.counts,traditions:countCanonicalTraditions(projection.byLens.traditions),heritage:items.length},
      customCards,
      featuredPlaces,
      nearby:state.lens==="heritage"?nearbyResults:[],
      atlasFacets:state.lens==="traditions"?buildCustomsAtlasFacets(projection.byLens.traditions):null,
      loadedProviders:preliminaryMode?[]:data.directory?.loadedProviders??[],
      unavailableProviders:preliminaryMode?[]:data.directory?.unavailableProviders??[],
      view:state.view,
      filters:state,
      saintsRelease:dataset?.saintsRelease??null,
      selectedId:state.selectedId,
      selectedOverride,
      displayLimit:state.displayLimit,
      atlasCoverage:state.atlasMode!=="places"?atlasCoverage:null,
      network:state.lens==="heritage"&&state.networkOpen?networkGraph:null,
      timeMass:state.lens==="heritage"&&state.timeMassOpen
        ?buildTimeMassBoard({projection,asOf:localTodayIso(),
          date:state.timeMassDate,query:state.timeMassQuery,
          evidence:state.timeMassEvidence,limit:state.timeMassLimit,
          language:language(win)}):null,
      placeProfiles,
      journeyOpen:state.lens==="heritage"&&state.journeyOpen,
      journeys,
      journeySelectedId:state.journeySelectedId,
      selectedPlaceId:state.selectedPlaceId,
      selectedId:state.selectedId,
      expandPlace:state.expandPlace,
      expandDetail:state.expandDetail,
    });
    lastExploreViewModel=vm;
    const rendered=renderExploreToString(vm);
    // Selecting or expanding a Place changes only its sheet. Never discard
    // the interactive map, its camera, or the user's current search position.
    if(selectionOnly&&node.dataset.exploreLens===state.lens&&node.querySelector(".aoFindSurface")){
      const staged=win.document.createElement("div");
      staged.innerHTML=rendered;
      const nextSheet=staged.querySelector(".aoFindSheetBackdrop");
      const surface=node.querySelector(".aoFindSurface");
      // A selection-only update preserves the same MapLibre canvas. It must
      // nevertheless reconcile the search result overlay: otherwise the
      // original suggestions remain visible behind the editorial folio.
      const mapBody=surface.querySelector(".aoHeritageBody");
      const nextSearch=staged.querySelector(".aoHeritageSearchResults");
      mapBody?.querySelector(".aoHeritageSearchResults")?.remove();
      if(nextSearch&&mapBody)mapBody.append(nextSearch);
      surface.querySelectorAll(".aoFindSheetBackdrop").forEach(sheet=>sheet.remove());
      if(nextSheet)surface.append(nextSheet);
      // Map pin → list and list → folio share one canonical place selection.
      surface.querySelectorAll?.("[data-mapcn-discover-rail] [data-explore-open-place]")
        .forEach(button=>button.setAttribute("aria-current",
          String(button.dataset.exploreOpenPlace===state.selectedPlaceId)));
      node.dataset.aoFindLoadState="ready";
      return true;
    }
    // Search and filter changes update MapLibre's source without instantiating
    // a new canvas. A map is recreated only when changing destinations.
    const existingMap=node.querySelector("[data-find-map]");
    const reuseMap=Boolean(mapHandle?.map&&existingMap&&state.view==="map"&&node.dataset.exploreLens===state.lens);
    if(reuseMap){
      const staged=win.document.createElement("div");
      staged.innerHTML=rendered;
      const nextMap=staged.querySelector("[data-find-map]");
      if(nextMap){
        nextMap.replaceWith(existingMap);
        node.replaceChildren(...Array.from(staged.childNodes));
        mapHandle.updateItems?.(items);
        mapHandle.setAtlasOverlay?.(state.atlasMode,atlasCoverage);
        mapHandle.map.resize?.();
      }else node.innerHTML=rendered;
    }else node.innerHTML=rendered;
    const discoverRail=node.querySelector?.("[data-mapcn-discover-rail]");
    if(discoverRail){
      discoverRail.dataset.discoverExpanded=String(priorDiscoverExpanded);
      discoverRail.querySelector?.("[data-mapcn-discover-toggle]")?.setAttribute?.("aria-expanded",String(priorDiscoverExpanded));
    }
    const discoverEntries=node.querySelector?.(".aoMapcnDiscoverEntries");
    if(discoverEntries)discoverEntries.scrollTop=priorDiscoverScroll;
    const networkList=node.querySelector?.(".aoNetworkResults");
    if(networkList)networkList.scrollTop=priorNetworkScroll;
    if(wasNetworkSearch){
      const target=node.querySelector?.("[data-network-search]");
      target?.focus?.({preventScroll:true});
      try{target?.setSelectionRange?.(networkCaret,networkCaret)}catch{}
    }
    const newTimeMassScroll=node.querySelector?.(".aoTimeMassScroll");
    if(newTimeMassScroll)newTimeMassScroll.scrollTop=priorTimeMassScroll;
    if(timeMassFocused){
      const next=node.querySelector?.("[data-explore-time-mass-query]");
      next?.focus?.({preventScroll:true});
      if(Number.isInteger(timeMassCaret?.start)&&Number.isInteger(timeMassCaret?.end))
        try{next.setSelectionRange(timeMassCaret.start,timeMassCaret.end)}catch{}
    }
    if(searchFocus){
      const next=node.querySelector?.("[data-find-query]");
      next?.focus?.({preventScroll:true});
      if(Number.isInteger(searchFocus.start)&&Number.isInteger(searchFocus.end)){
        try{next?.setSelectionRange?.(searchFocus.start,searchFocus.end,searchFocus.direction||"none")}catch{}
      }
      const scroller=node.querySelector?.(".aoFindSurface");
      if(scroller)scroller.scrollTop=searchFocus.scroll;
    }
    // Repainting preserves the MapLibre canvas but replaces the route rail.
    // Keep the chosen D card in view rather than resetting the carousel to 01.
    if(state.journeyOpen){
      node.querySelector?.(".aoJourneyRoutes button.active")?.scrollIntoView?.({
        behavior:"instant",block:"nearest",inline:"center",
      });
    }
    node.dataset.open=openState?"true":"false";
    node.dataset.aoFindLoadState="ready";
    node.dataset.exploreLens=state.lens;
    if(mapHandle&&state.view==="map"){
      lastMapView=mapViewport(mapHandle.map);lastMapLens=state.lens;
    }
    if(reuseMap){syncJourneyMarkers();syncDiscoverViewport();syncMassViewport();return true;}
    mapHandle?.destroy?.();mapHandle=null;
    if(openState&&state.view==="map"){
      const mapNode=node.querySelector?.("[data-find-map]");
      // Local directory readiness is not proof the third-party map library or
      // tiles have loaded. Show state before the remote module import starts.
      const showMapRecovery=(noMappedPins=false)=>{
        if(!mapNode||token!==paintToken||!openState||
           typeof mapNode.replaceChildren!=="function")return;
        const panel=win.document.createElement("div");
        panel.className="aoFindMapFallback";
        const title=win.document.createElement("strong");
        title.textContent=noMappedPins
          ?(language(win)==="fr"?"Aucun lieu cartographié":"No mapped places")
          :(language(win)==="fr"?"Carte indisponible":"Map unavailable");
        const detail=win.document.createElement("span");
        detail.textContent=noMappedPins
          ?(language(win)==="fr"
            ?"Essayez un autre filtre ou recherchez un lieu par son nom."
            :"Try another filter or search for a place by name.")
          :(language(win)==="fr"
            ?"Utilisez la recherche ci-dessus pour ouvrir un lieu et ses sources."
            :"Use search above to open any place and its source references.");
        panel.append(title,detail);mapNode.replaceChildren(panel);
        if(mapNode.dataset)mapNode.dataset.aoMapState=noMappedPins?"empty":"unavailable";
      };
      // Keep import-time status independent of map style/tile status.
      // A slow CDN response must be allowed to recover, not destroy the map.
      let pending=null;
      if(mapNode?.append&&win.document?.createElement){
        if(mapNode.dataset)mapNode.dataset.aoMapState="loading";
        pending=win.document.createElement("div");
        pending.className="aoExploreMapLoading";
        pending.setAttribute("role","status");pending.setAttribute("aria-live","polite");
        pending.textContent=language(win)==="fr"?"Chargement du fond de carte…":"Loading map background…";
        mapNode.append(pending);
      }
      const importTimer=win.setTimeout?.(()=>{
        if(token!==paintToken||!openState||!pending)return;
        pending.className="aoExploreMapLoading aoExploreMapStalled";
        pending.textContent=language(win)==="fr"
          ?"Le fond de carte tarde à répondre. La recherche et les fiches restent disponibles."
          :"The map background is taking longer than expected. Search and place details remain available.";
        if(mapNode.dataset)mapNode.dataset.aoMapState="stalled";
      },12000);
      try{
        const nextHandle=await mountExploreMap(mapNode,items,{
          atlasCoverage,atlasMode:state.atlasMode,
          onAtlasCountry:code=>{
            if(state.lens==="heritage"&&state.atlasMode==="countries"){
              state.atlasCountry=code;void paint();
            }
          },
          win,initialViewport:lastMapLens===state.lens?lastMapView:null,
          onSelect:id=>{
            const place=state.lens==="heritage"?filtered().find(item=>item.item_id===id):null;
            state.selectedPlaceId=place?.place_id??null;
            state.selectedId=place?null:id;
            state.expandPlace=false;state.expandDetail=false;
            void paint({selectionOnly:true});
          },
        });
        if(importTimer!==undefined)win.clearTimeout?.(importTimer);
        if(token!==paintToken||!openState){
          nextHandle?.destroy?.();return false;
        }
        if(!nextHandle){
          // Zero publishable pins is not a network failure or failed Explore route.
          showMapRecovery(true);return true;
        }
        mapHandle=nextHandle;
        if(state.lens==="tlm"){
          mapHandle.map?.on?.("moveend",syncMassViewport);
          mapHandle.map?.on?.("load",syncMassViewport);
          syncMassViewport();
        }
        if(state.lens==="heritage"){
          mapHandle.map?.on?.("moveend",syncDiscoverViewport);
          syncDiscoverViewport();
        }
        syncJourneyMarkers();
      }catch(error){
        if(importTimer!==undefined)win.clearTimeout?.(importTimer);
        // A blocked CDN or failed module import must show the existing
        // recovery instructions, rather than leaving an empty map canvas.
        showMapRecovery();
        console.error("Explore map failed",error);
      }
    }
    return true;
  }

  async function open(options={}){
    // A Calendar handoff can select only an existing, source-backed canonical
    // custom. The route payload alone cannot mint a practice or map pin.
    const customId=options?.lens==="traditions"&&typeof options?.customId==="string"?options.customId:null;
    // Canonical published membership is the authority. Valid IDs have both
    // 3- and 4-letter families (DEV-010, DOM-006, ADVT-001, ...).
    if(options?.customId!=null&&!customId)return false;
    let customFolio=null;
    if(customId){
      try{await ensureData()}catch{return false;}
      customFolio=publishedCustomFolioId(projection,customId);
      if(!customFolio)return false;
    }
    try{win?.AO_LEARN_APP_V1?.close?.()}catch{}
    try{win?.AO_PRAY_APP_V1?.close?.()}catch{}
    try{win?.AO_CALENDAR_APP_V1?.close?.({surface:"find"})}catch{}
    const requestedLens=options?.lens==="heritage"||EXPLORE_LENSES.includes(options?.lens)
      ?options.lens:null;
    if(requestedLens&&requestedLens!==state.lens){
      // Changing owners must not leave a stale folio, custom highlight, route,
      // or network state over another surface. Search values stay per-lens.
      state.selectedId=null;state.selectedPlaceId=null;state.highlightCustomId=null;
      state.journeyOpen=false;journeyPreviousCategories=null;
      state.networkOpen=false;state.networkFocus="";state.networkKind="all";
      state.atlasCountry=null;state.expandDetail=false;state.expandPlace=false;
      nearbyResults=null;
      lastMapView=null;lastMapLens=null;
    }
    if(requestedLens)state.lens=requestedLens;
    if(state.lens==="heritage"){
      state.view="map";
      state.timeMassOpen=options?.timeMass===true;
      state.networkOpen=false;
      state.atlasMode="places";state.atlasCountry=null;
      if(Array.isArray(options?.categories)){
        const allowed=options.categories.filter(cat=>PUBLIC_HERITAGE_CATEGORIES.includes(cat));
        state.heritageCategories=allowed.length?allowed:[...PUBLIC_HERITAGE_CATEGORIES];
      }
    }
    state.calendarKey=state.lens==="pilgrimages"&&typeof options?.calendarKey==="string"?options.calendarKey:null;
    if(options?.view==="map"||options?.view==="list")state.view=options.view;
    if(state.lens==="traditions")state.view="list"; // Existing folios, not a map or geographic Atlas.
    if(typeof options?.query==="string")state.query=options.query;
    if(typeof options?.placeId==="string")state.selectedPlaceId=options.placeId;
    if(customId){
      state.lens="traditions";state.view="list";state.query="";
      state.atlasFamily="ANY";state.atlasArea="ANY";state.atlasPeriod="ANY";state.atlasCalendar="ANY";
      state.displayLimit=24;state.selectedId=customFolio;state.selectedPlaceId=null;
    }
    state.expandPlace=false;state.expandDetail=Boolean(customId&&options?.expandDetail);
    state.bibleAtlas=false;state.bibleIndex=0;
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

  async function openAtlasEvent(eventKey,{onCloseReturn=null}={}){
    if(!openState||typeof eventKey!=="string"||
       !/^biblical:(event|passage):[a-z0-9-]+$/.test(eventKey)||
       atlasScriptureReturn)return false;
    let events;
    try{
      const source=await ensureData();
      events=buildBibleAtlas(source?.biblePlaces?.entries??[]);
    }catch{return false;}
    if(events.length!==151)return false;
    const exact=events.find(item=>item.eventKey===eventKey);
    if(!exact)return false;
    const oldLens=state.lens;
    state.lens="heritage";
    state.bibleAtlas=true;
    state.bibleIndex=exact.index;
    bibleCinemaFollow=true;bibleCinemaSheetExpanded=true;
    try{
      const painted=await paint();
      const node=getRoot(win);
      const button=[...(node?.querySelectorAll?.("[data-bible-event-key]")??[])]
        .find(item=>item.dataset.bibleEventKey===eventKey);
      if(!painted||!button)throw new Error("Atlas exact event was not rendered");
      // The source-linked visit is observational. Never replace the person's
      // chosen Atlas continuation scene or infer a new map coordinate.
      atlasScriptureReturn=typeof onCloseReturn==="function"
        ?{restore:onCloseReturn,oldLens}:null;
      centerBibleMilestone(exact.index);
      button.focus?.({preventScroll:true});
      return true;
    }catch{
      state.bibleAtlas=false;state.bibleIndex=0;state.lens=oldLens;
      void paint();return false;
    }
  }
  function returnToScriptureAtlas(){
    const receipt=atlasScriptureReturn;
    if(!receipt)return false;
    atlasScriptureReturn=null;
    close();
    state.lens=receipt.oldLens;
    queueMicrotask(()=>{try{void receipt.restore()}catch(error){
      win?.console?.error?.("Atlas Scripture return failed",error);
    }});
    return true;
  }
  function close(){
    ++paintToken;
    atlasScriptureReturn=null;
    openState=false;state.selectedId=null;state.selectedPlaceId=null;state.expandPlace=false;state.expandDetail=false;
    state.bibleAtlas=false;state.bibleIndex=0;
    state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;atlasReturnViewport=null;
    state.networkOpen=false;
    lastMapView=null;lastMapLens=null;mapHandle?.destroy?.();mapHandle=null;
    nearbyResults=null;
    const node=getRoot(win);if(node){node.dataset.open="false";node.innerHTML=""}
    return true;
  }

  function journeyCatalogue(){
    if(!projection||!dataset)return [];
    return buildPilgrimageJourneyCatalogue(
      projection.byLens?.pilgrimages,dataset.shrines?.sources,
      dataset.shrines?.routeStageEvidence,dataset.shrines?.routeGeometryReview,
      dataset.shrines?.routeStageSiteLinks,dataset.geography?.places);
  }

  function focusJourneyStage(stageId,{fromMap=false}={}){
    if(!state.journeyOpen||!mapHandle?.map)return false;
    const active=selectedPilgrimageJourney(journeyCatalogue(),state.journeySelectedId);
    const stage=active?.namedStages?.find(s=>s.id===stageId);
    const geo=stage?.siteAnchor;
    if(!geo)return false;
    const map=mapHandle.map,phone=Number(win?.innerWidth||0)<800;
    const target={center:[geo.lng,geo.lat],
      // Holywell's church and well are both known, but collapse into one
      // symbol at regional zoom. Focus an actual stage at local-site scale.
      zoom:Math.max(14.8,Number(map.getZoom?.())||0),
      offset:phone?[0,-125]:[-175,0]};
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
      map.jumpTo?.(target);
    else map.easeTo?.({...target,duration:460});
    const root=getRoot(win);
    root?.querySelectorAll?.("[data-explore-journey-stage-focus]").forEach(button=>{
      button.setAttribute("aria-pressed",String(button.dataset.exploreJourneyStageFocus===stageId));
    });
    if(fromMap){
      const row=[...(root?.querySelectorAll?.("[data-journey-named-stage]")||[])]
        .find(element=>element.dataset.journeyNamedStage===stageId);
      row?.scrollIntoView?.({behavior:"smooth",block:"nearest",inline:"nearest"});
    }
    return true;
  }

  function openJourneyStagePlace(stageId){
    if(!state.journeyOpen||state.lens!=="heritage"||!projection||!dataset)return false;
    const active=selectedPilgrimageJourney(journeyCatalogue(),state.journeySelectedId);
    const stage=active?.namedStages?.find(row=>row.id===stageId);
    const placeId=stage?.siteAnchor?.placeId;
    // A sourced map anchor is not enough unless the existing Place profile
    // can be opened by the same canonical identity. No fallback to a nearby
    // sanctuary, reverse-geocoded result, or separate external page.
    if(!placeId||!dataset.geography?.places?.some(p=>p.place_id===placeId))return false;
    focusJourneyStage(stageId,{fromMap:true});
    state.selectedPlaceId=placeId;
    state.selectedId=null;
    state.expandPlace=false;
    state.expandDetail=false;
    // Preserve both the MapLibre canvas and the currently selected Journey
    // rail under a normal C Place sheet. Closing it returns to this itinerary.
    void paint({selectionOnly:true});
    return true;
  }

  function syncJourneyMarkers(){
    if(!mapHandle?.setJourneyStageAnchors)return;
    const active=state.journeyOpen&&state.lens==="heritage"
      ?selectedPilgrimageJourney(journeyCatalogue(),state.journeySelectedId):null;
    mapHandle.setJourneyStageAnchors(active?.stageSiteAnchors??[],
      stageId=>openJourneyStagePlace(stageId));
  }

  function focusJourneyDestination(){
    if(!projection||!dataset||!mapHandle?.map)return false;
    const active=selectedPilgrimageJourney(journeyCatalogue(),state.journeySelectedId);
    // The Walsingham 2026 Priory endpoint differs from the canonical Catholic
    // shrine. It has no surveyed stage coordinate. Center the broader related
    // shrine AREA for context without labelling that marker the route endpoint.
    const geo=active?.destinationGeo??active?.relatedShrineGeo;
    if(!geo)return false;
    const map=mapHandle.map,phone=Number(win?.innerWidth||0)<800;
    const zoomFloor=active?.destinationGeo?8.5:7.0;
    const target={center:[geo.lng,geo.lat],zoom:Math.max(zoomFloor,Number(map.getZoom?.())||0),
      offset:phone?[0,-125]:[-175,0]};
    if(win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches)
      map.jumpTo?.(target);
    else map.easeTo?.({...target,duration:450});
    return true;
  }

  function setFilter(key,value){
    const previousLens=state.lens;
    if(key==="view")state.view=state.lens==="traditions"?"list":value==="map"?"map":"list";
    else if(key==="lens"&&(value==="heritage"||EXPLORE_LENSES.includes(value))){
      if(value!==previousLens){
        queryByLens.set(previousLens,state.query);
        state.query=queryByLens.get(value)??"";
      }
      state.lens=value;state.calendarKey=null;nearbyResults=null;
      state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;
      state.networkOpen=false;
      if(value!=="heritage"){state.journeyOpen=false;journeyPreviousCategories=null;}
      if(value==="saints")state.view="list";
      else if(value==="heritage"||value==="tlm")state.view="map";
    }else if(key==="saintScope"&&["profiles","historical","later","doctors"].includes(value)&&
      (value==="profiles"||dataset?.saintsRelease?.researchEnabled)){
      state.saintScope=value;state.query="";
    }else if(Object.hasOwn(state,key))state[key]=value;
    state.selectedId=null;state.selectedPlaceId=null;state.expandPlace=false;state.expandDetail=false;
    state.displayLimit=24;
    if(state.lens!==previousLens){lastMapView=null;lastMapLens=null;state.bibleAtlas=false;state.bibleIndex=0;}
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

  // Update pins and camera *in place* as the timeline scrubs; never remount map on each stop.
  function updateBibleIndex(next,{center=false,remember=false}={}){
    if(!openState||!state.bibleAtlas||!dataset)return;
    const stops=buildBibleAtlas(dataset.biblePlaces?.entries??[]);
    const index=Math.max(0,Math.min(stops.length-1,Math.floor(Number(next)||0)));
    const previous=stops[state.bibleIndex],active=stops[index];
    if(!active)return;
    state.bibleIndex=index;
    // Commit only deliberate chapter selections and actual timeline gestures.
    // Never overwrite a saved scene during initial rendering or Follow recenter.
    if(remember&&index!==previous?.index)saveAtlasReadingPlace(atlasDeviceStorage(),active);
    const root=getRoot(win),lang=language(win);
    root?.querySelectorAll?.("[data-bible-step]")?.forEach(button=>{
      const selected=Number(button.dataset.bibleStep)===index;
      button.classList.toggle("active",selected);button.setAttribute("aria-pressed",String(selected));
    });
    // Reading groups only navigate existing canonical eventKeys. One timeline,
    // one saved Scripture reading position; no competing journey bookmark.
    root?.querySelectorAll?.("[data-bible-reading-start]")?.forEach(button=>{
      const begin=Number(button.dataset.bibleReadingStart),end=Number(button.dataset.bibleReadingEnd);
      button.setAttribute("aria-pressed",String(index>=begin&&index<=end));
    });
    const detail=root?.querySelector?.("[data-bible-detail]");
    if(detail){
      detail.innerHTML=atlasDetail(active,lang,{historicalPreview:bibleHistoricalPreview});
      if(index!==previous?.index){
        // A long source note in a previous scene must not leave the next
        // scene scrolled into the middle of unrelated evidence.
        const sheet=detail.closest?.(".aoBibleAtlasDetail");
        if(sheet)sheet.scrollTop=0;
      }
    }
    const contextShortcut=root?.querySelector?.("[data-bible-context-open]");
    if(contextShortcut){
      const extra=Boolean(detail?.querySelector?.("[data-bible-history-note],[data-bible-landscape]"));
      contextShortcut.setAttribute("aria-label",lang==="fr"?
       (extra?"Ouvrir le contexte historique de cette étape":"Ouvrir les détails et le contexte biblique"):
       (extra?"Open this scene’s historical context":"Open Biblical scene details and context"));
    }
    if(bibleCinemaPreview){
      const sheetTitle=root?.querySelector?.("[data-bible-sheet-title]");
      if(sheetTitle)sheetTitle.textContent=lang==="fr"?active.title_fr:active.title_en;
      root?.querySelectorAll?.("[data-bible-chapter]")?.forEach(button=>{
        const chapter=stops[Number(button.dataset.bibleChapter)];
        button.setAttribute("aria-pressed",String(chapter?.era===active.era));
      });
    }
    const title=root?.querySelector?.("[data-bible-era-name]");
    if(title)title.textContent=lang==="fr"?
      ({ORIGINS:"Les origines",PATRIARCHS:"Les Patriarches",EXODUS:"L'Exode",ISRAEL:"Israël et les Prophètes",EXILE:"Exil et restauration",INFANCY:"L'Incarnation",PUBLIC:"La Vie publique",PASSION:"La Passion",RESURRECTION:"La Résurrection",APOSTLES:"L'Église apostolique",REVELATION:"L'Apocalypse"})[active.era]:
      ({ORIGINS:"The Beginnings",PATRIARCHS:"The Patriarchs",EXODUS:"The Exodus",ISRAEL:"Israel and the Prophets",EXILE:"Exile and Restoration",INFANCY:"The Incarnation",PUBLIC:"The Public Ministry",PASSION:"The Passion",RESURRECTION:"The Resurrection",APOSTLES:"The Apostolic Church",REVELATION:"The Apocalypse"})[active.era];
    if(previous?.era!==active.era&&win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches!==true){
      const overlay=root?.querySelector?.("[data-bible-era-overlay]");
      if(overlay){
        overlay.innerHTML=bibleCinemaPreview?atlasCinemaPlate(active.era,lang):atlasEraOverlay(active.era,lang);
        if(bibleCinemaPreview){
          if(bibleCinemaPlateTimer)win.clearTimeout?.(bibleCinemaPlateTimer);
          bibleCinemaPlateTimer=win.setTimeout?.(()=>{
            if(overlay.isConnected)overlay.replaceChildren();
          },2400);
        }
      }
    }
    const mapStage=root?.querySelector?.(".aoBibleAtlasMapStage");
    const unlocated=atlasMapItems(stops,index).length===0;
    if(mapStage){
      const wasUnlocated=mapStage.dataset.bibleUnlocated==="true";
      mapStage.dataset.bibleUnlocated=String(unlocated);
      // The same map remains mounted throughout the chronology: only its
      // unlocated presentation changes; no marker or fictitious GPS is added.
      if(wasUnlocated&&!unlocated)mapHandle?.map?.resize?.();
    }
    const map=mapHandle?.map;
    const sync=()=>{
      const source=map?.getSource?.("ao-explore-items");if(!source)return;
      source.setData?.({type:"FeatureCollection",features:exploreMapFeatures(atlasMapItems(stops,index,{cinematic:bibleCinemaPreview,language:lang}))});
      if(!active.geo){
        try{map.setPaintProperty?.("ao-explore-points","circle-color","#79909f");}catch{}
      }
      if((!bibleCinemaPreview||bibleCinemaFollow)&&!active.geo&&previous?.era!==active.era){
        try{map.easeTo?.({center:[35,31],zoom:3.6,duration:win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?0:560});}catch{}
      }
      if(active.geo){
        const key="atlas:"+active.geo.key;
        try{
          map.setPaintProperty?.("ao-explore-points","circle-color",["case",["==",["get","item_id"],key],"#edcb86","#79909f"]);
          if(!bibleCinemaPreview||bibleCinemaFollow)
           map.easeTo?.({center:[active.geo.lng,active.geo.lat],
             zoom:bibleCinemaPreview?(active.era==="APOSTLES"?5.3:active.geo.key==="jerusalem"?6.2:5.5)
              :(active.geo.key==="jerusalem"?10:active.era==="APOSTLES"?6:8),
             duration:win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?0:560});
        }catch{}
      }
    };
    if(map?.getSource?.("ao-explore-items"))sync();
    else if(map?.once)map.once("load",sync);
    if(center)centerBibleMilestone(index);
  }
  function centerBibleMilestone(index){
    const target=getRoot(win)?.querySelector?.('[data-bible-step="'+index+'"]');
    // Exact Scripture jumps must arrive at one stable scene, not sweep the interim cards.
    // User-driven swipes retain their native scrolling behaviour.
    bibleProgrammaticScrollUntil=Date.now()+250;
    target?.scrollIntoView?.({block:"nearest",inline:"center",behavior:"instant"});
  }
  let bibleScrollFrame=0;
  function onBibleTimelineScroll(event){
    if(!openState||!state.bibleAtlas||!event?.target?.matches?.("[data-bible-track]")||Date.now()<bibleProgrammaticScrollUntil)return;
    if(bibleScrollFrame)return;
    const track=event.target;
    const update=()=>{
      bibleScrollFrame=0;
      const middle=track.getBoundingClientRect().left+track.clientWidth/2;
      let best=-1,distance=Infinity;
      track.querySelectorAll("[data-bible-step]").forEach(button=>{
        const rect=button.getBoundingClientRect(),diff=Math.abs(rect.left+rect.width/2-middle);
        if(diff<distance){distance=diff;best=Number(button.dataset.bibleStep);}
      });
      if(best>=0&&best!==state.bibleIndex)updateBibleIndex(best,{remember:true});
    };
    bibleScrollFrame=win.requestAnimationFrame?win.requestAnimationFrame(update):1;
    if(!win.requestAnimationFrame){bibleScrollFrame=0;update();}
  }

  function onClick(event){
    if(!openState)return;
    const target=event?.target;
    // Public customs reading now belongs to the existing Calendar, not a Places Atlas.
    if(target?.closest?.("[data-explore-customs-calendar]")){
      event.preventDefault?.();
      void handoff("calendar",()=>win?.AO_CALENDAR_APP_V1?.open?.(),
        language(win)==="fr"?"Impossible d’ouvrir le calendrier des coutumes.":"Could not open the Calendar traditions.");
      return;
    }
    const customsLibrary=target?.closest?.("[data-explore-customs-library]");
    if(customsLibrary&&state.lens==="traditions"){
      event.preventDefault?.();
      if(customsLibrary.disabled)return;
      customsLibrary.disabled=true;
      void import("../customs/customs-browser.js")
        .then(({installCustomsBrowserOwner})=>installCustomsBrowserOwner(win).open({view:"all"}))
        .then(ok=>{if(!ok)throw Error("CUSTOMS_LIBRARY_UNAVAILABLE");})
        .catch(error=>{
          console.error("Customs library unavailable",error);
          actionError(language(win)==="fr"?"Bibliothèque des coutumes indisponible.":"Customs library unavailable.");
        })
        .finally(()=>{if(customsLibrary.isConnected)customsLibrary.disabled=false;});
      return;
    }
    // A category/detail Back tap returns to the parent map; only Back from
    // Sacred Geography itself exits the Explore domain.
    // The swipe guard runs in capture phase before this handler.
    if(target?.closest?.("[data-bible-atlas-open]")&&state.lens==="heritage"){
      event.preventDefault?.();
      if(!dataset?.biblePlaces?.entries?.length){actionError(language(win)==="fr"?"Données bibliques indisponibles.":"Biblical Atlas data is unavailable.");return;}
      state.bibleAtlas=true;
      const stops=buildBibleAtlas(dataset.biblePlaces?.entries??[]);
      const saved=readAtlasReadingPlace(atlasDeviceStorage(),stops);
      // A reader returns to their last explicitly selected Scripture episode.
      // With no saved place, start at the earliest source-qualified map stop,
      // retaining Creation as selectable event zero in the 151-event corpus.
      const firstMapped=bibleCinemaPreview?stops.find(stop=>Boolean(stop.geo)):null;
      state.bibleIndex=saved??firstMapped?.index??0;
      bibleCinemaFollow=true;bibleCinemaSheetExpanded=false;
      lastMapView=null;lastMapLens=null;
      void paint().then(ok=>{if(!ok||!state.bibleAtlas)return;centerBibleMilestone(state.bibleIndex);const overlay=getRoot(win)?.querySelector?.("[data-bible-era-overlay]");if(overlay&&!bibleCinemaPreview&&win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches!==true)overlay.innerHTML=atlasEraOverlay("ORIGINS",language(win));});return;
    }
    if(target?.closest?.("[data-bible-atlas-close]")&&state.bibleAtlas){
      event.preventDefault?.();
      if(atlasScriptureReturn){
        event.stopImmediatePropagation?.();
        returnToScriptureAtlas();return;
      }
      state.bibleAtlas=false;state.bibleIndex=0;
      if(bibleCinemaPlateTimer)win.clearTimeout?.(bibleCinemaPlateTimer);
      bibleCinemaFollow=true;bibleCinemaSheetExpanded=false;mapHandle?.destroy?.();mapHandle=null;lastMapView=null;lastMapLens=null;void paint();return;
    }
    if(bibleCinemaPreview&&state.bibleAtlas){
      const readingToggle=target?.closest?.("[data-bible-reading-toggle]");
      if(readingToggle){
        event.preventDefault?.();
        const panel=getRoot(win)?.querySelector?.("[data-bible-reading-panel]");
        if(panel){
          panel.hidden=!panel.hidden;
          readingToggle.setAttribute("aria-expanded",String(!panel.hidden));
        }
        return;
      }
      const readingTab=target?.closest?.("[data-bible-reading-tab]");
      if(readingTab){
        event.preventDefault?.();
        const chosen=readingTab.dataset.bibleReadingTab;
        if(["chapters","arcs","themes"].includes(chosen)){
          const drawer=getRoot(win)?.querySelector?.("[data-bible-reading-panel]");
          drawer?.querySelectorAll?.("[data-bible-reading-tab]")?.forEach(tab=>{
            tab.setAttribute("aria-selected",String(tab.dataset.bibleReadingTab===chosen));
          });
          drawer?.querySelectorAll?.("[data-bible-reading-view]")?.forEach(view=>{
            view.hidden=view.dataset.bibleReadingView!==chosen;
          });
          if(drawer)drawer.scrollTop=0;
        }
        return;
      }
      const readingStart=target?.closest?.("[data-bible-reading-start]");
      if(readingStart){
        event.preventDefault?.();
        const chosen=Number(readingStart.dataset.bibleReadingStart);
        if(Number.isInteger(chosen)&&chosen>=0&&chosen<151){
          updateBibleIndex(chosen,{center:true,remember:true});
          const root=getRoot(win),panel=root?.querySelector?.("[data-bible-reading-panel]");
          if(panel)panel.hidden=true;
          root?.querySelector?.("[data-bible-reading-toggle]")?.setAttribute?.("aria-expanded","false");
        }
        return;
      }
      const chapter=target?.closest?.("[data-bible-chapter]");
      if(chapter){
        event.preventDefault?.();
        const index=Number(chapter.dataset.bibleChapter);
        if(Number.isInteger(index)){updateBibleIndex(index,{center:true,remember:true});}
        return;
      }
      if(target?.closest?.("[data-bible-chapter-dismiss]")){
        event.preventDefault?.();
        if(bibleCinemaPlateTimer)win.clearTimeout?.(bibleCinemaPlateTimer);
        getRoot(win)?.querySelector?.("[data-bible-era-overlay]")?.replaceChildren?.();
        return;
      }
      const context=target?.closest?.("[data-bible-context-open]");
      if(context){
        event.preventDefault?.();
        bibleCinemaSheetExpanded=true;
        const sheet=context.closest?.(".aoBibleAtlasDetail");
        if(sheet){
          sheet.dataset.bibleSheet="expanded";
          sheet.querySelector?.("[data-bible-sheet-toggle]")?.setAttribute?.("aria-expanded","true");
          const notes=sheet.querySelectorAll?.("[data-bible-history-note],[data-bible-landscape]")??[];
          // Context includes both independently sourced ancient-name and
          // landscape evidence, not just the first research card.
          notes.forEach(note=>{note.open=true;});
          if(notes.length)notes[0].scrollIntoView?.({block:"nearest",behavior:"instant"});
          else sheet.scrollTop=0;
        }
        return;
      }
      const toggle=target?.closest?.("[data-bible-sheet-toggle]");
      if(toggle){
        event.preventDefault?.();
        bibleCinemaSheetExpanded=!bibleCinemaSheetExpanded;
        toggle.setAttribute("aria-expanded",String(bibleCinemaSheetExpanded));
        const sheet=toggle.closest?.(".aoBibleAtlasDetail");
        if(sheet)sheet.dataset.bibleSheet=bibleCinemaSheetExpanded?"expanded":"collapsed";
        return;
      }
    }
    const atlasStep=target?.closest?.("[data-bible-step]");
    if(atlasStep&&state.bibleAtlas){event.preventDefault?.();updateBibleIndex(Number(atlasStep.dataset.bibleStep),{center:true,remember:true});return;}
    if(target?.closest?.("[data-bible-follow]")&&state.bibleAtlas){
      event.preventDefault?.();
      if(bibleCinemaPreview){
        bibleCinemaFollow=true;
        target.closest("[data-bible-follow]")?.setAttribute("aria-pressed","true");
      }
      centerBibleMilestone(state.bibleIndex);updateBibleIndex(state.bibleIndex);return;
    }
    const retry=target?.closest?.("[data-find-retry]");
    if(retry){
      event.preventDefault?.();
      if(retry.getAttribute?.("aria-busy")==="true")return;
      retry.setAttribute?.("aria-busy","true");
      void paint().finally(()=>retry.removeAttribute?.("aria-busy"));
      return;
    }
    const discoverToggle=target?.closest?.("[data-mapcn-discover-toggle]");
    if(discoverToggle&&state.lens==="heritage"){
      event.preventDefault?.();
      const rail=discoverToggle.closest?.("[data-mapcn-discover-rail]");
      if(rail){
        const expanded=rail.dataset.discoverExpanded!=="true";
        rail.dataset.discoverExpanded=String(expanded);
        discoverToggle.setAttribute("aria-expanded",String(expanded));
      }
      return;
    }
    const worldButton=target?.closest?.("[data-heritage-world]");
    if(worldButton&&state.lens==="heritage"){
      event.preventDefault?.();
      state.query="";state.heritageCategories=[...PUBLIC_HERITAGE_CATEGORIES];
      state.journeyOpen=false;journeyPreviousCategories=null;
      state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;
      state.networkOpen=false;
      state.highlightCustomId=null;state.selectedId=null;
      state.selectedPlaceId=null;state.expandPlace=false;state.expandDetail=false;
      nearbyResults=null;
      lastMapView=null;lastMapLens=null;
      void paint();return;
    }
    if(target?.closest?.("[data-explore-time-mass-toggle]")&&state.lens==="heritage"){
      event.preventDefault?.();
      state.timeMassOpen=!state.timeMassOpen;
      if(state.timeMassOpen){
        state.networkOpen=false;
        state.atlasMode="places";state.atlasCountry=null;
        state.journeyOpen=false;journeyPreviousCategories=null;nearbyResults=null;
        state.selectedId=null;state.selectedPlaceId=null;
      }
      void paint();return;
    }
    if(state.lens==="heritage"&&state.timeMassOpen){
      if(target?.closest?.("[data-explore-time-mass-calendar]")){
        event.preventDefault?.();
        void handoff("calendar",()=>win?.AO_CALENDAR_APP_V1?.select?.(state.timeMassDate),
          language(win)==="fr"?"Date du calendrier indisponible.":"Calendar date unavailable.");
        return;
      }
      if(target?.closest?.("[data-explore-time-mass-more]")){
        event.preventDefault?.();
        state.timeMassLimit=Math.min(120,state.timeMassLimit+24);
        void paint();return;
      }
    }
    if(target?.closest?.("button[data-network-toggle]")&&state.lens==="heritage"){
      event.preventDefault?.();
      state.networkOpen=!state.networkOpen;
      if(state.networkOpen){
        state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;
        state.journeyOpen=false;journeyPreviousCategories=null;nearbyResults=null;
        state.highlightCustomId=null;state.selectedId=null;state.selectedPlaceId=null;
      }
      void paint();return;
    }
    if(target?.closest?.("button[data-network-close]")&&state.networkOpen){
      event.preventDefault?.();state.networkOpen=false;void paint();return;
    }
    const openCustom=target?.closest?.("[data-network-open-custom]");
    if(openCustom&&state.lens==="heritage"&&state.networkOpen){
      event.preventDefault?.();
      const id=openCustom.dataset.networkOpenCustom;
      const canonicalFolio=publishedCustomFolioId(projection,id);
      if(!canonicalFolio)return;
      // Open the existing canonical Traditions folio; no duplicate custom owner.
      queryByLens.set("heritage",state.query);
      state.lens="traditions";state.view="list";state.query="";
      state.networkOpen=false;state.networkFocus="";state.selectedPlaceId=null;
      // Grouped canonical custom folios use tradition:custom:<custom_id>,
      // never an individual attestation item's source-specific identity.
      state.selectedId=canonicalFolio;state.expandPlace=false;state.expandDetail=true;
      state.displayLimit=24;state.highlightCustomId=null;
      lastMapView=null;lastMapLens=null;nearbyResults=null;
      void paint();return;
    }
    const focused=target?.closest?.("[data-network-focus]");
    if(focused&&state.networkOpen){
      event.preventDefault?.();
      state.networkFocus=focused.dataset.networkFocus||"";
      state.networkLimit=12;void paint();return;
    }
    if(target?.closest?.("button[data-network-more]")&&state.networkOpen){
      event.preventDefault?.();state.networkLimit=Math.min(20,state.networkLimit+4);void paint();return;
    }
    const atlasButton=target?.closest?.("button[data-atlas-mode]");
    if(atlasButton&&state.lens==="heritage"){
      event.preventDefault?.();
      const mode=atlasButton.dataset.atlasMode;
      if(["places","heatmap","countries"].includes(mode)){
        // A density or choropleth view needs global context even when a Place
        // was just selected at street zoom. Restore that exact camera on exit.
        if(mode==="places"){
          if(atlasReturnViewport&&mapHandle?.map)
            mapHandle.map.jumpTo?.({center:atlasReturnViewport.center,zoom:atlasReturnViewport.zoom});
          atlasReturnViewport=null;
        }else if(state.atlasMode==="places"){
          const map=mapHandle?.map;
          const previous=mapViewport(map);
          atlasReturnViewport=previous?{...previous,zoom:Number(map?.getZoom?.())||0}:null;
          if(map){
            const width=Number(map.getContainer?.()?.getBoundingClientRect?.().width||win.innerWidth||390);
            const zoom=Math.max(-1.2,Math.min(2.4,Math.log2(Math.max(280,width)/560)));
            map.jumpTo?.({center:[0,19],zoom});
          }
        }
        state.atlasMode=mode;state.atlasCountry=null;
        if(mode!=="places"){
          state.networkOpen=false;
          state.timeMassOpen=false;state.journeyOpen=false;journeyPreviousCategories=null;
          state.highlightCustomId=null;state.heritageCategories=[...PUBLIC_HERITAGE_CATEGORIES];
          state.selectedId=null;state.selectedPlaceId=null;state.query="";nearbyResults=null;
        }
        void paint();
      }
      return;
    }
    const atlasScope=target?.closest?.("[data-atlas-scope]");
    if(atlasScope&&state.lens==="heritage"&&state.atlasMode!=="places"){
      event.preventDefault?.();
      if(["all","heritage","tlm"].includes(atlasScope.dataset.atlasScope)){
        state.atlasScope=atlasScope.dataset.atlasScope;
        state.atlasCountry=null;state.atlasCountryLimit=12;void paint();
      }
      return;
    }
    if(target?.closest?.("[data-atlas-country-more]")&&state.atlasMode==="countries"){
      event.preventDefault?.();state.atlasCountryLimit=Math.min(120,state.atlasCountryLimit+16);
      void paint();return;
    }
    const countryButton=target?.closest?.("[data-atlas-country]");
    if(countryButton&&state.atlasMode==="countries"){
      event.preventDefault?.();state.atlasCountry=countryButton.dataset.atlasCountry;
      mapHandle?.focusAtlasCountry?.(state.atlasCountry);
      void paint();return;
    }
    const nearButton=target?.closest?.("[data-heritage-nearby]");if(nearButton){event.preventDefault?.();locateNearby(nearButton);return;}
    if(target?.closest?.("[data-heritage-nearby-close]")){
      event.preventDefault?.();nearbyResults=null;void paint();return;
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
    if(target?.closest?.("[data-find-close]")){
      event.preventDefault?.();
      if(state.selectedPlaceId){if(state.expandPlace){state.expandPlace=false;void paint({selectionOnly:true});return;}state.selectedPlaceId=null;void paint({selectionOnly:true});return;}
      if(state.selectedId){if(state.expandDetail){state.expandDetail=false;void paint({selectionOnly:true});return;}state.selectedId=null;void paint({selectionOnly:true});return;}
      if(state.lens!=="heritage"){setFilter("lens","heritage");return;}
      close();void win?.AO_APP_SHELL_V1?.navigate?.("home");return;
    }
    // Backdrops may be clicked to dismiss, but clicks *inside* the sheet
    // must reach their own Place, Calendar, novena and source-link actions.
    if(target?.closest?.("button[data-find-close-detail]")||
       target?.matches?.(".aoFindSheetBackdrop[data-find-close-detail]")){
      event.preventDefault?.();state.selectedId=null;state.expandDetail=false;void paint({selectionOnly:true});return;
    }
    if(target?.closest?.("button[data-find-close-place]")||
       target?.matches?.(".aoFindSheetBackdrop[data-find-close-place]")){
      event.preventDefault?.();state.selectedPlaceId=null;state.expandPlace=false;void paint({selectionOnly:true});return;
    }
    if(target?.closest?.("[data-explore-sheet-toggle]")){
      event.preventDefault?.();state.expandPlace=true;void paint({selectionOnly:true});return;
    }
    const placeJourney=target?.closest?.("[data-explore-place-journey]");
    if(placeJourney&&state.lens==="heritage"&&state.selectedPlaceId){
      event.preventDefault?.();
      const placeId=state.selectedPlaceId;
      const routeId=placeJourney.dataset.explorePlaceJourney;
      const candidates=journeysForCanonicalPlace(journeyCatalogue(),placeId);
      if(!candidates.some(candidate=>candidate.routeId===routeId))return;
      if(!state.journeyOpen)journeyPreviousCategories=[...state.heritageCategories];
      state.journeyOpen=true;
      state.journeySelectedId=routeId;
      state.heritageCategories=["pilgrimages"];
      state.query="";state.selectedPlaceId=null;state.selectedId=null;
      state.expandPlace=false;state.expandDetail=false;nearbyResults=null;
      // A single shared MapLibre atlas: switch C -> D without remounting it.
      // Do not snap to the related Walsingham shrine as a Priory terminus.
      void paint();return;
    }
    if(target?.closest?.("[data-explore-place-journey-list]")&&state.selectedPlaceId){
      event.preventDefault?.();state.expandPlace=true;
      void paint({selectionOnly:true});return;
    }
    if(target?.closest?.("[data-explore-expand-place]")){
      event.preventDefault?.();state.expandPlace=true;void paint({selectionOnly:true});return;
    }
    if(target?.closest?.("[data-explore-collapse-place]")){
      event.preventDefault?.();state.expandPlace=false;void paint({selectionOnly:true});return;
    }
    if(target?.closest?.("[data-explore-expand-detail]")){
      event.preventDefault?.();state.expandDetail=true;void paint({selectionOnly:true});return;
    }
    if(target?.closest?.("[data-explore-collapse-detail]")){
      event.preventDefault?.();state.expandDetail=false;void paint({selectionOnly:true});return;
    }
    const openJourney=target?.closest?.("[data-explore-journey-open]");
    if(openJourney){state.networkOpen=false;state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;}
    if(openJourney&&state.lens==="heritage"){
      event.preventDefault?.();
      if(!state.journeyOpen){
        journeyPreviousCategories=[...state.heritageCategories];
        state.journeyOpen=true;state.heritageCategories=["pilgrimages"];
        state.query="";state.selectedPlaceId=null;state.selectedId=null;
        state.expandPlace=false;nearbyResults=null;
      }
      void paint();return;
    }
    if(target?.closest?.("[data-explore-journey-close]")&&state.lens==="heritage"){
      event.preventDefault?.();state.journeyOpen=false;
      state.heritageCategories=journeyPreviousCategories??[...PUBLIC_HERITAGE_CATEGORIES];
      journeyPreviousCategories=null;void paint();return;
    }
    const journeySelect=target?.closest?.("[data-explore-journey-select]");
    if(journeySelect&&state.journeyOpen){
      event.preventDefault?.();
      state.journeySelectedId=journeySelect.dataset.exploreJourneySelect;
      focusJourneyDestination();
      void paint();return;
    }
    const stagePlace=target?.closest?.("[data-explore-journey-stage-place]");
    if(stagePlace&&state.journeyOpen){
      event.preventDefault?.();
      openJourneyStagePlace(stagePlace.dataset.exploreJourneyStagePlace);return;
    }
    const stageFocus=target?.closest?.("[data-explore-journey-stage-focus]");
    if(stageFocus&&state.journeyOpen){
      event.preventDefault?.();
      focusJourneyStage(stageFocus.dataset.exploreJourneyStageFocus);return;
    }
    if(target?.closest?.("[data-explore-journey-focus]")&&state.journeyOpen){
      event.preventDefault?.();focusJourneyDestination();return;
    }
    const journeyDestination=target?.closest?.("[data-explore-journey-destination]");
    if(journeyDestination&&state.journeyOpen){
      event.preventDefault?.();
      const placeId=journeyDestination.dataset.exploreJourneyDestination||null;
      if(!placeId||!dataset?.geography?.places?.some(p=>p.place_id===placeId))return;
      state.selectedPlaceId=placeId;
      state.selectedId=null;state.expandPlace=false;state.expandDetail=false;
      // Destination/related shrine uses the same existing C folio as an
      // individually linked stage: return to D without resetting its map,
      // filter or selected route (including Walsingham's Priory exception).
      void paint({selectionOnly:true});return;
    }
    const heritageCategory=target?.closest?.("[data-heritage-category]");
    if(heritageCategory){state.networkOpen=false;state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;}
    if(heritageCategory&&state.lens==="heritage"){
      event.preventDefault?.();
      // Changing ordinary map subjects exits the D journey folio without
      // preserving an obsolete route filter over an unrelated map category.
      state.journeyOpen=false;journeyPreviousCategories=null;
      const value=heritageCategory.dataset.heritageCategory;
      if(value==="ALL")state.heritageCategories=[...PUBLIC_HERITAGE_CATEGORIES];
      else if(PUBLIC_HERITAGE_CATEGORIES.includes(value)){
        // One thematic filter at a time; repeat the selection to restore All.
        const current=state.heritageCategories;
        state.heritageCategories=current.length===1&&current[0]===value
          ?[...PUBLIC_HERITAGE_CATEGORIES]:[value];
      }
      state.highlightCustomId=null;state.selectedId=null;state.selectedPlaceId=null;state.expandPlace=false;state.expandDetail=false;
      nearbyResults=null;
      void paint();return;
    }
    if(target?.closest?.("[data-heritage-custom-clear]")&&state.lens==="heritage"){
      event.preventDefault?.();state.highlightCustomId=null;void paint();return;
    }
    if(target?.closest?.("[data-heritage-custom-details]")&&state.lens==="heritage"&&state.highlightCustomId){
      event.preventDefault?.();state.selectedId="tradition:custom:"+state.highlightCustomId;state.expandDetail=false;void paint({selectionOnly:true});return;
    }
    const heritageCustom=target?.closest?.("[data-heritage-custom]");
    if(heritageCustom){state.networkOpen=false;state.timeMassOpen=false;state.atlasMode="places";state.atlasCountry=null;}
    if(heritageCustom&&state.lens==="heritage"){
      event.preventDefault?.();
      const id=heritageCustom.dataset.heritageCustom;
      const custom=projection?.byLens?.traditions?.find(item=>item?.raw?.custom?.custom_id===id);
      if(!custom)return;
      state.heritageCategories=[...PUBLIC_HERITAGE_CATEGORIES];
      state.highlightCustomId=state.highlightCustomId===id?null:id;
      state.selectedId=null; // Keep the map visible; extended practice text is opt-in.
      state.selectedPlaceId=null;state.expandPlace=false;state.expandDetail=false;
      // A selected practice can have geographically distant examples. Fit
      // their source-backed pins rather than preserving an unrelated viewport.
      lastMapView=null;lastMapLens=null;mapHandle?.destroy?.();mapHandle=null;
      void paint();return;
    }
    const chapterButton=target?.closest?.("[data-explore-place-jump]");
    if(chapterButton){
      event.preventDefault?.();
      const name=chapterButton.dataset.explorePlaceJump;
      const chapter=getRoot(win)?.querySelector?.('.aoExplorePlaceSheet [data-explore-place-chapter="'+name+'"]');
      if(chapter){
        const details=chapter.matches?.("details")?chapter:chapter.querySelector?.("details");
        if(details)details.open=true;
        chapter.scrollIntoView?.({block:"start",behavior:win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?"auto":"smooth"});
      }
      return;
    }
    const saintCrosslink=target?.closest?.("[data-saint-crosslink-target]");
    if(saintCrosslink&&state.lens==="saints"&&dataset){
      event.preventDefault?.();event.stopPropagation?.();
      const scope=saintCrosslink.dataset.saintCrosslinkScope;
      const id=saintCrosslink.dataset.saintCrosslinkTarget;
      if(!["profiles","historical","later","doctors"].includes(scope)||
         (scope!=="profiles"&&!dataset.saintsRelease?.researchEnabled))return;
      const candidates=scope==="profiles"?projectSaintCatalogueItems(dataset):projectSaintSourceIndexItems(dataset,scope);
      if(!candidates.some(item=>item.item_id===id))return;
      state.view="list";state.saintScope=scope;state.saintCategory="ALL";
      state.query="";state.selectedId=id;state.selectedPlaceId=null;
      state.expandPlace=false;state.expandDetail=false;state.displayLimit=24;
      void paint();return;
    }
    if(target?.closest?.("[data-mapcn-discover-more]")&&state.lens==="heritage"){
      event.preventDefault?.();
      state.mapcnDiscoverLimit=Math.min(180,(state.mapcnDiscoverLimit||36)+36);
      void paint();return;
    }
    const openPlace=target?.closest?.("[data-explore-open-place]");
    if(openPlace){
      event.preventDefault?.();event.stopPropagation?.();
      state.selectedPlaceId=openPlace.dataset.exploreOpenPlace||null;
      state.selectedId=null;state.expandPlace=false;state.expandDetail=false;
      // Search selection should reveal the actual geographical context, not
      // leave a worldwide zoom behind the editorial Place folio. Reuse the
      // already published source coordinates, never infer a new entrance.
      const focused=filtered().find(item=>item?.place_id===state.selectedPlaceId
        &&item?.map_publishable&&Number.isFinite(Number(item?.geo?.lat))
        &&Number.isFinite(Number(item?.geo?.lng)));
      const map=mapHandle?.map;
      if(map&&focused){
        const mobile=Number(win.innerWidth)||map.getContainer?.()?.clientWidth||0;
        const offset=mobile<800?[0,-110]:[-155,0];
        const target={
          center:[Number(focused.geo.lng),Number(focused.geo.lat)],
          zoom:Math.max(9,Number(map.getZoom?.())||0),
          offset,duration:win.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches?0:460,
        };
        map.easeTo?.(target);
      }
      void paint({selectionOnly:true});return;
    }
    const placeItem=target?.closest?.("[data-explore-place-item]");
    if(placeItem){
      event.preventDefault?.();event.stopPropagation?.();
      const lens=placeItem.dataset.explorePlaceLens;
      if(EXPLORE_LENSES.includes(lens))state.lens=lens;
      state.query="";
      state.selectedPlaceId=null;
      state.selectedId=placeItem.dataset.explorePlaceItem||null;state.expandDetail=false;
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
      state.displayLimit+=24;
      void paint().then(()=>{const scroller=getRoot(win)?.querySelector?.(".aoFindSurface");if(scroller)scroller.scrollTop=previousScroll;});
      return;
    }
    const item=target?.closest?.("[data-explore-item]");if(item){state.selectedPlaceId=null;state.selectedId=item.dataset.exploreItem;state.expandDetail=false;void paint({selectionOnly:true});return}
    const aff=target?.closest?.("[data-find-affiliation]");
    if(aff&&state.lens==="tlm"){
      const id=aff.dataset.findAffiliation,index=state.affiliations.indexOf(id);
      if(index>=0)state.affiliations.splice(index,1);else state.affiliations.push(id);
      state.selectedId=null;void paint();return;
    }
    const filter=target?.closest?.("[data-find-filter]");if(filter){setFilter(filter.dataset.findFilter,filter.dataset.findFilterValue);return}
  }

  // The visible sheet handle is a real interaction: upward swipe expands
  // the record, downward swipe dismisses. Text and map gestures remain native.
  let sheetTouch=null;
  function onSheetTouchStart(event){
    const handle=event.target?.closest?.(".aoHeritageCardLayer .aoHeritageSheetHandle");
    const touch=event.touches?.[0];
    sheetTouch=handle&&state.selectedPlaceId&&!state.expandPlace&&touch
      ?{x:touch.clientX,y:touch.clientY}:null;
  }
  function onSheetTouchEnd(event){
    if(!sheetTouch)return;
    const started=sheetTouch;sheetTouch=null;
    const end=event.changedTouches?.[0];if(!end)return;
    const dy=end.clientY-started.y,dx=end.clientX-started.x;
    if(Math.abs(dy)<42||Math.abs(dx)>Math.abs(dy))return;
    if(dy<0)state.expandPlace=true;
    else state.selectedPlaceId=null;
    void paint({selectionOnly:true});
  }
  function onKeyDown(event){
    if(openState&&state.networkOpen&&["Enter"," "].includes(event?.key)){
      const item=event?.target?.closest?.(".aoNetworkSvgItem[data-network-focus]");
      if(item){
        event.preventDefault?.();
        state.networkFocus=item.dataset.networkFocus;state.networkLimit=12;
        void paint();return;
      }
    }
    if(!openState||event?.key!=="Escape")return;
    if(state.bibleAtlas){event.preventDefault?.();
      if(atlasScriptureReturn){returnToScriptureAtlas();return;}
      state.bibleAtlas=false;state.bibleIndex=0;lastMapView=null;lastMapLens=null;void paint();return;}
    if(state.selectedPlaceId){event.preventDefault?.();if(state.expandPlace)state.expandPlace=false;else state.selectedPlaceId=null;void paint({selectionOnly:true});return;}
    if(state.selectedId){event.preventDefault?.();if(state.expandDetail)state.expandDetail=false;else state.selectedId=null;void paint({selectionOnly:true});return;}
    const disclosure=getRoot(win)?.querySelector?.(".aoHeritageMore[open],.aoExploreSectionSwitcher[open]");
    if(disclosure){event.preventDefault?.();disclosure.open=false;return;}
    if(state.lens!=="heritage"){event.preventDefault?.();setFilter("lens","heritage");}
  }

  function onInput(event){
    if(!openState)return;
    const networkInput=event?.target?.closest?.("[data-network-search]");
    if(networkInput&&state.lens==="heritage"&&state.networkOpen){
      state.networkSearch=networkInput.value||"";
      state.networkFocus="";state.networkLimit=12;
      void paint();return;
    }
    const timeInput=event?.target?.closest?.("[data-explore-time-mass-query]");
    if(timeInput&&state.lens==="heritage"&&state.timeMassOpen){
      state.timeMassQuery=timeInput.value||"";
      state.timeMassLimit=24;void paint();return;
    }
    const input=event?.target?.closest?.("[data-find-query]");if(!input)return;
    state.query=input.value??"";nearbyResults=null;state.selectedId=null;state.selectedPlaceId=null;state.expandDetail=false;state.displayLimit=24;
    void paint({preserveSearchFocus:true});
  }

  function onChange(event){
    if(!openState)return;
    if(state.lens==="heritage"&&state.networkOpen){
      const field=event?.target?.closest?.("[data-network-kind]");
      if(field){
        const allowed=["all","place","shrine","pilgrimage","route","relic","apparition","calendar","custom","person"];
        if(allowed.includes(field.value)){
          state.networkKind=field.value;state.networkFocus="";state.networkLimit=12;void paint();
        }
        return;
      }
    }
    if(state.lens==="heritage"&&state.timeMassOpen){
      const dateField=event?.target?.closest?.("[data-explore-time-mass-date]");
      if(dateField){
        if(validTimeMassDate(dateField.value)){state.timeMassDate=dateField.value;void paint();}
        else actionError(language(win)==="fr"?"Date invalide":"Invalid date");
        return;
      }
      const statusField=event?.target?.closest?.("[data-explore-time-mass-evidence]");
      if(statusField){
        const allowed=["ALL","SOURCE_REVIEW_CURRENT","SOURCE_ATTESTED","REVIEW_DUE","RAW_UNCONFIRMED","LISTING_ONLY"];
        if(allowed.includes(statusField.value)){
          state.timeMassEvidence=statusField.value;state.timeMassLimit=24;void paint();
        }
        return;
      }
    }
    if(state.lens!=="traditions")return;
    const field=event?.target?.closest?.("[data-atlas-filter]");
    if(!field)return;
    setFilter(field.dataset.atlasFilter,field.value);
  }

  win?.document?.addEventListener?.("scroll",onBibleTimelineScroll,true);
  win?.document?.addEventListener?.("click",onClick,true);
  win?.document?.addEventListener?.("input",onInput,true);
  win?.document?.addEventListener?.("change",onChange,true);
  win?.document?.addEventListener?.("keydown",onKeyDown,true);
  win?.document?.addEventListener?.("touchstart",onSheetTouchStart,{capture:true,passive:true});
  win?.document?.addEventListener?.("touchend",onSheetTouchEnd,{capture:true,passive:true});
  installStyle(win);ensureRoot(win);

  return Object.freeze({
    version:VERSION,
    open,
    openAtlasEvent,
    close,
    paint,
    status:()=>Object.freeze({
      installed:true,
      open:openState,
      loadState:openState?(lastLoadError?"error":dataset?"ready":"loading"):"closed",
      lens:state.lens,
      view:state.view,
      bibleAtlas:state.bibleAtlas,
      bibleIndex:state.bibleIndex,
      selectedPlaceId:state.selectedPlaceId,
      counts:state.lens==="tlm"?{tlm:preliminary?.length??PRELIMINARY_R49_TOTAL}:projection?.counts??{},
      loadedProviders:dataset?.directory?.loadedProviders??[],
      unavailableProviders:dataset?.directory?.unavailableProviders??[],
      records:preliminary?.length??dataset?.directory?.records?.length??0,
    }),
    dispose(){
      close();
      win?.document?.removeEventListener?.("scroll",onBibleTimelineScroll,true);
      win?.document?.removeEventListener?.("click",onClick,true);
      win?.document?.removeEventListener?.("input",onInput,true);
      win?.document?.removeEventListener?.("change",onChange,true);
      win?.document?.removeEventListener?.("keydown",onKeyDown,true);
      win?.document?.removeEventListener?.("touchstart",onSheetTouchStart,true);
      win?.document?.removeEventListener?.("touchend",onSheetTouchEnd,true);
      scrollGuard.dispose();
      getRoot(win)?.remove?.();
    }
  });
}
export function installFindBrowserOwner(win=globalThis){
  if(win?.AO_FIND_APP_V1)return win.AO_FIND_APP_V1;
  const api=createFindOwner(win);win.AO_FIND_APP_V1=api;return api;
}
if(typeof window!=="undefined"&&typeof document!=="undefined")installFindBrowserOwner(window);
