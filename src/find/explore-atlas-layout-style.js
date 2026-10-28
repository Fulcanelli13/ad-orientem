// A/C Explore layout: immersive map-first browsing and editorial selected-place cards.
// Keep the original owners (search, filters, map, and place profiles) intact.
// D / itinerary mode is a separate scope, not inferred from unsourced place geometry.
export const EXPLORE_ATLAS_LAYOUT_STYLE = `
/* Map is the immersive stage, NOT a panel placed after header/search/filter rows. */
.aoHeritageSurface.aoExploreSurface{
  position:relative;isolation:isolate;height:100dvh;max-width:none;margin:0;
  overflow:hidden;background:#080c12;
}
.aoHeritageSurface .aoFindHeader{
  position:relative;top:0;z-index:13;flex:none;
  height:60px;min-height:60px;box-sizing:border-box;
  padding:7px 14px;display:grid;grid-template-columns:42px minmax(0,1fr) auto auto;
  gap:10px;background:#080d15ed;border-bottom:1px solid rgba(205,180,132,.22);
}
.aoHeritageSurface .aoFindHeader h1{
  font:500 20px/1.05 var(--ao-font-display,Georgia,serif);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
.aoHeritageSurface .aoFindHeader>div:first-of-type small{font-size:9px;letter-spacing:.15em}
.aoHeritageSurface .aoHeritageMassShortcut{
  border:1px solid rgba(205,180,132,.32);background:#101a25;
  color:#e5d5b9;min-height:40px;height:40px;padding:0 15px;
  border-radius:999px;font:500 12px var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoHeritageMore summary{
  min-height:40px;height:40px;padding:0 14px;font-weight:500;
}
.aoHeritageSurface .aoFindActionError:not([hidden]){position:absolute;top:60px;z-index:18;left:12px;right:12px}
.aoHeritageSurface .aoHeritageTools{
  position:absolute!important;top:74px;left:18px;width:min(390px,calc(100% - 36px));
  padding:0!important;z-index:12!important;
  background:transparent;box-shadow:0 12px 40px #0003;
}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{
  height:46px;min-height:46px;border:1px solid rgba(201,175,128,.36);
  border-radius:9px;background:#0b1723f2;color:#f0e6d2;
  font:400 14px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  padding:10px 14px;box-shadow:0 8px 22px #0005;backdrop-filter:blur(9px);
}
.aoHeritageSurface .aoHeritageGlossaryButton{
  min-width:46px;min-height:46px;border-radius:9px;
  background:#0b1723ed;border:1px solid rgba(201,175,128,.32)
}
.aoHeritageSurface .aoHeritageCategories{
  position:absolute!important;left:18px;top:130px;z-index:11;
  padding:0!important;display:flex;gap:6px;max-width:min(730px,calc(100% - 36px));
  overflow-x:auto;scrollbar-width:none;flex:none;
}
.aoHeritageSurface .aoHeritageCategories::-webkit-scrollbar{display:none}
.aoHeritageSurface .aoHeritageCategories button{
  min-height:44px;height:44px;padding:10px 11px;border-radius:100px;
  font:500 11px/1.1 var(--ao-font-ui,system-ui,sans-serif);
  background:#0b1723e8;border:1px solid rgba(204,178,125,.27);
  color:#e3d7bf;backdrop-filter:blur(10px);
}
.aoHeritageSurface .aoHeritageCategories button.active{
  background:#d3b984;color:#0d1821;border-color:#d3b984;
}
.aoHeritageSurface .aoHeritageCategories button[data-category]:before{
  width:6px;height:6px;margin-right:5px;background:#c4b58e
}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map]{
  position:relative;flex:1;min-height:0;height:auto;
  margin:0;padding:0!important;overflow:hidden;border:0;
}
.aoHeritageSurface .aoHeritageBody.aoFindBody[data-find-view=map] .aoFindMap{
  position:absolute;inset:0;width:100%;height:100%!important;
  min-height:0;border-radius:0!important;border:0;margin:0!important;
  background:#10202a;
}
.aoHeritageSurface .aoHeritageWorldReset{
  top:122px;left:16px;min-width:45px;max-width:45px;height:45px;min-height:45px;
  padding:0;border-radius:50%;font-size:0;z-index:5;
  background:#101c28e8;border:1px solid rgba(205,180,132,.35);
}
.aoHeritageSurface .aoHeritageWorldReset:before{
  content:"◎";display:block;flex:none;width:auto;height:auto;
  border:0;border-radius:0;background:transparent;
  font:27px/1 Georgia,serif;color:#ddc99f;
}
/* Provider attribution remains readable, clickable and legally visible,
   but no longer renders as a white strip on the dark Explore atlas. */
.aoExploreSurface .aoFindMap .maplibregl-ctrl-attrib{
  background:rgba(10,21,31,.94);color:#d6c9b1;
  border:1px solid rgba(205,180,132,.3);
  border-radius:12px 12px 0 0;
  box-shadow:0 2px 10px #0008;
  font:11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExploreSurface .aoFindMap .maplibregl-ctrl-attrib a{
  color:#edddbd;text-decoration:underline;text-underline-offset:2px;
}
.aoExploreSurface .aoFindMap .maplibregl-ctrl-attrib a:focus-visible,
.aoExploreSurface .aoFindMap .maplibregl-ctrl-attrib-button:focus-visible{
  outline:2px solid #edddbd;outline-offset:2px;
}
.aoExploreSurface .aoFindMap .maplibregl-ctrl-attrib-button{
  background-color:#dfcfac;border-radius:50%;
}
.aoHeritageSurface .aoHeritageNearby{
  right:16px;bottom:75px;min-height:44px;background:#0d1925eb;
  border:1px solid rgba(205,180,132,.36);border-radius:50px;
}
.aoHeritageSurface .aoHeritageMapHint{
  left:16px;bottom:79px;max-width:270px;
  background:#0b1620dc;border:1px solid rgba(206,178,121,.18);
  color:#ddd0b3;border-radius:9px;
}
.aoHeritageSurface .aoHeritageCustomStrip{max-width:600px}
.aoHeritageSurface .aoHeritageSearchResults{
  position:absolute;top:176px;left:18px;z-index:12;
  width:min(400px,calc(100% - 36px));max-height:min(50dvh,430px);
  overflow:auto;background:#0c1924fa;box-shadow:0 18px 42px #0009;
  border:1px solid rgba(205,178,122,.26);border-radius:12px;
}
/* The C concept: desktop selection is a fixed editorial folio on the right,
   not an oversized mobile bottom sheet stretched across a desktop screen. */
@media(min-width:800px){
 .aoHeritageSurface .aoHeritageCardLayer{
   pointer-events:none;background:transparent!important;
   justify-content:flex-end;align-items:flex-start;
   padding:77px 20px 20px;box-sizing:border-box;
 }
 .aoHeritageSurface .aoHeritagePreview{
   pointer-events:auto;display:flex;flex-direction:column;
   width:min(365px,32vw);height:auto;max-height:calc(100dvh - 98px);
   margin:0;padding:17px 18px 20px;
   overflow:auto;border:1px solid rgba(201,175,128,.35);
   border-radius:13px;background:#101922f7;box-shadow:0 18px 42px #000a;
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb{
   order:-1;display:block;float:none;width:100%;max-width:100%;
   min-height:0;margin:0 0 14px;border-radius:8px;
   overflow:hidden;background:#101925;
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img{
   display:block;width:100%;height:min(24dvh,210px);object-fit:cover;
 }
 .aoHeritageSurface .aoHeritagePreview h2{font-size:clamp(19px,1.7vw,25px);line-height:1.16}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageSynopsis{
   display:-webkit-box;-webkit-line-clamp:4;-webkit-box-orient:vertical;overflow:hidden;
   font:400 14px/1.55 var(--ao-font-body,Georgia,serif);
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceTags{margin:10px 0}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageFeastLink{margin-top:7px}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageSheetHandle{display:none}
}
/* On phones, A stays a map with lightweight floating search/chips.
   C becomes a compact, non-fullscreen discover folio over the bottom edge. */
@media(max-width:799px){
 .aoHeritageSurface .aoFindHeader{
   height:56px;min-height:56px;padding:6px 9px;
   gap:8px;grid-template-columns:40px minmax(0,1fr) auto auto;
 }
 .aoHeritageSurface .aoFindHeader h1{font-size:17px}
 .aoHeritageSurface .aoFindHeader>div:first-of-type small{display:none}
 .aoHeritageSurface .aoHeritageMassShortcut{height:44px;min-height:44px;padding:0 10px}
 .aoHeritageSurface .aoHeritageMore summary{height:44px;min-height:44px;padding:0 10px}
 .aoHeritageSurface .aoHeritageTools{
   top:65px;left:10px;width:calc(100% - 20px)
 }
 .aoHeritageSurface .aoHeritageCategories{
   top:120px;left:10px;max-width:calc(100% - 20px)
 }
 .aoHeritageSurface .aoHeritageWorldReset{top:116px;left:10px}
 .aoHeritageSurface .aoHeritageMapHint{max-width:calc(100% - 136px)}
 .aoHeritageSurface .aoHeritageSearchResults{
   top:164px;left:10px;width:calc(100% - 20px);
 }
 .aoHeritageSurface .aoHeritageCardLayer{
   background:rgba(3,8,14,.14)!important;
   align-items:flex-end;padding:0;justify-content:center;
 }
 .aoHeritageSurface .aoHeritagePreview{
   position:relative;display:grid;grid-template-columns:110px minmax(0,1fr);
   align-items:start;column-gap:10px;row-gap:5px;
   width:100%;max-width:none;max-height:min(44dvh,355px);
   padding:10px 15px calc(13px + env(safe-area-inset-bottom));
   overflow-y:auto;border-radius:18px 18px 0 0;
   background:#101923f8;border-top:1px solid rgba(201,174,117,.5);
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritageSheetHandle{grid-column:1/-1}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageCardHeading{
   grid-column:2;grid-row:2;padding-right:40px
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritageCardClose{
   position:absolute;right:12px;top:19px;width:44px;min-width:44px;height:44px;min-height:44px;z-index:2
 }
 .aoHeritageSurface .aoHeritagePreview h2{
   grid-column:2;grid-row:3;margin:0;
   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
   overflow:hidden;font:500 19px/1.18 var(--ao-font-display,Georgia,serif)
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb{
   grid-column:1;grid-row:2/5;float:none;max-width:none;width:110px;
   margin:0;overflow:hidden;border-radius:8px
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img{
   display:block;width:110px;height:136px;object-fit:cover
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb figcaption{
   display:none
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritageSynopsis{
   grid-column:2;grid-row:4;margin:1px 0 3px;
   display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
   overflow:hidden;font-size:13px;line-height:1.4
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritageSaints,
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceTags{display:none}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageFeastLink{
   grid-column:1/-1;grid-row:6;min-height:44px;line-height:1.3;padding-block:9px
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePreviewActions{
   grid-column:1/-1;grid-row:5;margin-top:6px
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePreviewActions>*{
   min-height:44px;padding:9px 11px
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePrecision{grid-column:1/-1;font-size:10px;margin:0}
}
@media(max-width:360px){
 .aoHeritageSurface .aoFindHeader h1{font-size:15px}
 .aoHeritageSurface .aoFindHeader{gap:5px}
 .aoHeritageSurface .aoHeritageCategories button{font-size:10px;padding:7px 9px}
 .aoHeritageSurface .aoHeritagePreview{grid-template-columns:83px minmax(0,1fr);padding-inline:10px}
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb,
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img{width:83px}
 .aoHeritageSurface .aoHeritagePreview .aoHeritageCardHeading{padding-right:34px}
}
/* Traditional Mass uses the SAME immersive atlas grammar, not a separate
   stacked blue/cyan directory. Only layout changes: affiliation, category,
   provenance, and source search remain owned by the existing filter engine. */
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]){
  position:relative;isolation:isolate;display:flex;flex-direction:column;
  height:100dvh;max-width:none;margin:0;padding:0;overflow:hidden;background:#080c12;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindHeader{
  z-index:14;position:relative;top:0;flex:none;box-sizing:border-box;
  height:58px;min-height:58px;padding:6px 12px;
  background:#080d15f5;border-bottom:1px solid rgba(205,180,132,.2);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindHeader h1{
  font:500 19px/1.12 var(--ao-font-display,Georgia,serif);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindHeader>span{display:none}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreSectionNav{
  position:absolute;z-index:15;top:66px;right:10px;
  border:0;margin:0;padding:0;display:block;width:auto;background:transparent;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreSectionNav>span{display:none}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreSectionSwitcher>summary{
  height:43px;min-height:43px;padding:8px 12px;background:#0d1b27ed;
  border:1px solid rgba(205,180,132,.32);border-radius:9px;
  font:500 12px/1 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar{
  position:absolute;top:66px;left:12px;right:145px;
  width:auto;min-width:0;z-index:13;display:flex!important;
  align-items:center;gap:8px;grid-template-columns:none;
  padding:0;background:transparent;border:0;box-shadow:none;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar .aoFindSearch{
  flex:1;min-width:0;padding:0
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar .aoFindSearch input{
  width:100%;height:43px;min-height:43px;padding:8px 11px;
  border:1px solid rgba(205,180,132,.35);border-radius:9px;
  background:#0b1723f4;color:#f2e5cd;
  font:400 13px/1.2 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar .aoFindViewTabs{
  flex:none;margin:0;padding:0;gap:4px;display:flex
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar .aoFindViewTabs button{
  height:43px;min-width:44px;min-height:43px;padding:6px 9px;
  font:500 12px/1 var(--ao-font-ui,system-ui,sans-serif);
  border:1px solid rgba(205,180,132,.28);border-radius:8px;
  background:#0b1723ec;color:#e8dcc2;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar .aoFindViewTabs button.active{
  background:#d1b784;border-color:#d1b784;color:#101b27;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoExploreTlmFilters{
  position:absolute;z-index:12;left:12px;right:12px;top:120px;
  min-height:44px;max-height:94px;padding:0!important;margin:0;
  border:0;overflow:visible;background:transparent;
}
/* The primary institute emblems remain present as filters. Grouping modes
   and unverified-source disclaimers move into the explicit filter disclosure. */
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoAtlasTlmExtra{
  position:absolute;right:0;top:0;z-index:14;background:#0c1925f2;
  border:1px solid rgba(205,180,132,.36);border-radius:9px;
  box-shadow:0 8px 25px #0008;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoAtlasTlmExtra>summary{
  min-height:40px;display:flex;align-items:center;padding:7px 12px;
  font:500 12px/1 var(--ao-font-ui,system-ui,sans-serif);color:#e6d7b7;
  cursor:pointer;list-style:none
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoAtlasTlmExtra[open]{
  min-width:min(350px,calc(100vw - 24px));max-width:calc(100vw - 24px);
  padding:0 8px 10px;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoAtlasTlmExtra .aoExploreQuickFilters{
  display:flex;flex-wrap:wrap;gap:6px;max-height:35dvh;overflow:auto
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoAtlasTlmExtra .aoExploreQuickFilters button{
  min-height:44px;background:#10202b;color:#ead9bc;border:1px solid rgba(205,180,132,.24);
  border-radius:9px;padding:9px 11px
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip{
  padding-right:77px
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip{
  display:flex;align-items:center;gap:6px;min-width:0;padding:0;
  background:none;border:0;max-width:min(760px,100%);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip>.aoExploreFilterLabel{
  display:none
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip .aoFindAffiliations{
  min-width:0;display:flex;gap:6px;overflow-x:auto;flex-wrap:nowrap;
  padding:0;scrollbar-width:none;overscroll-behavior-x:contain
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip .aoFindAffiliations button{
  flex:none;min-height:40px;padding:5px 10px;border-radius:999px;
  background:#0c1925ed;border:1px solid rgba(205,180,132,.28);
  color:#e9dfcc;font:500 12px/1 var(--ao-font-ui,system-ui,sans-serif)
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip .aoFindAffiliations button.active{
  background:#d2b986;color:#0d1921;border-color:#d2b986
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip .aoFindAffiliations img{
  width:24px;height:24px;object-fit:contain;filter:none;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoPreliminaryDirectoryNotice{
  position:absolute;right:0;top:48px;z-index:12;
  max-width:360px;background:#0b1925eb;border:1px solid rgba(205,180,132,.24);
  border-radius:8px;box-shadow:0 8px 25px #0008;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoPreliminaryDirectoryNotice summary{
  min-height:34px;font:500 10px var(--ao-font-ui,system-ui,sans-serif);
  color:#c8b793;padding:7px 10px;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoFindResultMeta{
  position:absolute;z-index:9;right:18px;bottom:72px;
  padding:6px 10px;border:1px solid rgba(205,180,132,.19);
  border-radius:8px;background:#0b1720d8;
  font:500 11px var(--ao-font-ui,system-ui,sans-serif);color:#c6baa3;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoFindResultMeta strong{
  font:500 13px var(--ao-font-body,Georgia,serif);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmViewportContext{
  display:block;margin-top:4px;padding-top:4px;border-top:1px solid rgba(205,180,132,.2);
  color:#f0debb;font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindBody[data-find-view=map]{
  position:relative;flex:1;min-height:0;margin:0;padding:0!important;overflow:hidden;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindBody[data-find-view=map]>.aoFindMap{
  position:absolute;inset:0;width:100%;height:100%!important;
  margin:0!important;min-height:0!important;border:0!important;border-radius:0!important;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreMapReset{
  top:184px;left:14px;display:inline-flex;align-items:center;gap:7px;
  width:auto;height:auto;min-height:44px;max-width:160px;padding:8px 12px;
  border-radius:10px;font:600 12px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  white-space:nowrap;color:#e9d8b8;background:#0c1824eb;
  border:1px solid rgba(205,180,132,.45)
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreMapReset:before{
  content:"◎";font:21px/1 Georgia,serif;color:#d9c390
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreMapReset:focus-visible{
  outline:2px solid #e8d1a2;outline-offset:3px
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend{
  position:absolute;bottom:13px;left:14px;z-index:8;
  max-width:min(450px,78%);margin:0;padding:0 9px;
  max-height:min(54dvh,450px);overflow:auto;
  background:#0b1924ed;border:1px solid rgba(205,180,132,.27);
  border-radius:9px;box-shadow:0 8px 24px #0007;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend summary{
  min-height:44px;display:flex;align-items:center;padding:8px 9px;cursor:pointer;
  font:500 11px var(--ao-font-ui,system-ui,sans-serif);color:#e5d4b4
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend:not([open])>*:not(summary){display:none}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindExternalSource{
  position:absolute;z-index:8;right:13px;bottom:13px;
  display:block;margin:0;padding:0 8px;max-width:min(235px,45%);
  border-radius:9px;background:#0b1924ef;border:1px solid rgba(205,180,132,.27);
  box-shadow:0 8px 24px #0007;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindExternalSource summary{
  min-height:44px;display:flex;align-items:center;cursor:pointer;
  padding:7px 9px;font:500 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#e1d1b3
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindExternalSource[open]{
  max-width:min(400px,80%);max-height:50dvh;overflow:auto;padding-bottom:10px
}
@media(max-width:600px){
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindHeader{
   height:54px;min-height:54px;padding:6px 8px;grid-template-columns:44px minmax(0,1fr) 44px
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindHeader small{display:none}
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindHeader h1{font-size:17px}
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreSectionNav{top:64px;right:9px}
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreSectionSwitcher>summary{
   font-size:0;min-width:44px;min-height:44px;width:44px;padding:0
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreSectionSwitcher>summary:before{
   content:"⋯";font:24px Georgia,serif;letter-spacing:1px;color:#e9d7b8
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar{
   top:64px;left:9px;right:64px;gap:5px;
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmToolbar .aoFindViewTabs button{
   padding:4px 6px;font-size:11px;min-width:37px;
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoExploreTlmFilters{
   left:9px;right:9px;top:120px;
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip .aoFindAffiliations button{
   min-height:40px;font-size:10px;padding:6px 8px
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoTlmProviderStrip .aoFindAffiliations img{width:22px;height:22px}
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoFindResultMeta{right:9px;bottom:65px}
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend{left:9px;bottom:9px}
}

/* Selected Traditional Mass venues inherit the same contextual folio behaviour
   as sacred places; no route, image or factual content is synthesized. */
@media(min-width:800px){
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoFindSheetBackdrop{
   pointer-events:none;background:transparent;justify-content:flex-end;align-items:flex-start;
   padding:72px 18px 20px;box-sizing:border-box;
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreQuickPreview{
   pointer-events:auto;width:min(360px,33vw);max-width:360px;
   height:auto;max-height:calc(100dvh - 92px);margin:0;
   padding:18px;border-radius:13px;border:1px solid rgba(201,175,128,.36);
   background:#101922f8;box-shadow:0 20px 40px #000a;
 }
}
@media(max-width:799px){
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoFindSheetBackdrop{
   background:rgba(3,8,14,.16);align-items:flex-end;
 }
 .aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreQuickPreview{
   max-height:min(40dvh,345px);
   overflow-y:auto;padding:12px 14px calc(12px + env(safe-area-inset-bottom));
   border-radius:18px 18px 0 0;background:#101923f8;
 }
}

/* D: Pilgrimage journeys are a contextual lens OVER the same A/C map,
   not a new page and never a pretend turn-by-turn routing engine. */
.aoHeritageSurface .aoJourneyLaunch{
  border-color:rgba(205,181,126,.6)!important;color:#ead8af!important;
}
.aoHeritageSurface .aoJourneyLaunch.active{
  background:#d2b984!important;color:#09141e!important;
}
.aoHeritageSurface .aoJourneyPanel{
  position:absolute;z-index:16;top:79px;right:18px;bottom:18px;
  width:min(425px,36vw);box-sizing:border-box;
  display:flex;flex-direction:column;min-height:0;overflow:hidden;
  background:linear-gradient(160deg,rgba(19,30,41,.98),rgba(9,16,25,.99));
  border:1px solid rgba(211,185,133,.35);border-radius:14px;
  box-shadow:0 16px 55px rgba(0,0,0,.58);
  color:#e7dfd1;font-family:var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyHeader{
  display:flex;align-items:center;justify-content:space-between;
  gap:10px;padding:19px 18px 7px;flex:none;
}
.aoHeritageSurface .aoJourneyHeader small{
  font:600 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.14em;color:#d5bd90;
}
.aoHeritageSurface .aoJourneyHeader h2{
  margin:5px 0 0;color:#f0e5d3;
  font:500 29px/1.1 var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface .aoJourneyHeader>button{
  border:1px solid rgba(211,185,133,.27);border-radius:50%;
  width:44px;height:44px;min-height:44px;flex:none;
  color:#decaa7;background:#121d29;font:26px/1 Georgia,serif;
}
.aoHeritageSurface .aoJourneyScope{
  margin:0;padding:5px 18px 13px;color:#b9b5aa;
  font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyRoutes{
  display:flex;gap:8px;padding:1px 18px 15px;flex:none;
  overflow-x:auto;overscroll-behavior-x:contain;scroll-snap-type:x proximity;
  scrollbar-width:thin;scrollbar-color:#917d62 transparent;
  border-bottom:1px solid rgba(211,185,133,.18);
}
.aoHeritageSurface .aoJourneyRoutes button{
  flex:0 0 185px;text-align:left;scroll-snap-align:start;
  min-height:98px;max-height:128px;padding:10px 12px;
  display:flex;flex-direction:column;gap:8px;justify-content:flex-start;
  background:rgba(11,23,35,.96);border:1px solid rgba(211,185,133,.21);
  color:#ddd3c1;border-radius:9px;
}
.aoHeritageSurface .aoJourneyRoutes button.active{
  border-color:#d3b987;background:rgba(62,53,39,.66);
}
.aoHeritageSurface .aoJourneyRoutes button small{
  color:#cdb78e;font:600 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  font-variant-numeric:tabular-nums;
}
.aoHeritageSurface .aoJourneyRoutes button strong{
  font:500 14px/1.3 var(--ao-font-body,Georgia,serif);
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;
}
.aoHeritageSurface .aoJourneyDetail{
  padding:20px 19px 25px;flex:1;min-height:0;overflow-y:auto;
  overscroll-behavior-y:contain;
}
.aoHeritageSurface .aoJourneyType{
  font:600 10px/1.1 var(--ao-font-ui,system-ui,sans-serif);
  color:#d4b980;letter-spacing:.09em;text-transform:uppercase;
}
.aoHeritageSurface .aoJourneyDetail h3{
  font:500 clamp(20px,2.2vw,26px)/1.2 var(--ao-font-display,Georgia,serif);
  margin:9px 0 21px;color:#f0e6d9;
}
.aoHeritageSurface .aoJourneyAnchors{
  list-style:none;margin:0;padding:0 0 0 6px;
}
.aoHeritageSurface .aoJourneyAnchors li{
  position:relative;display:grid;grid-template-columns:26px minmax(0,1fr);
  gap:13px;padding:0 0 31px;
}
.aoHeritageSurface .aoJourneyAnchors li:first-child:after{
  content:"";position:absolute;left:13px;top:30px;bottom:5px;
  border-left:1px dashed rgba(208,181,127,.55);
}
.aoHeritageSurface .aoJourneyAnchors li:last-child{padding-bottom:0}
.aoHeritageSurface .aoJourneyNode{
  display:grid;place-items:center;width:26px;height:26px;border-radius:50%;
  background:#142635;border:1px solid rgba(208,181,127,.55);
  color:#d9c190;font-size:18px;
}
.aoHeritageSurface .aoJourneyAnchors small{
  display:block;color:#c3ad86;
  font:600 10px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.075em;
}
.aoHeritageSurface .aoJourneyAnchors strong{
  display:block;margin-top:6px;font:500 17px/1.35 var(--ao-font-body,Georgia,serif);
}
.aoHeritageSurface .aoJourneyAnchors em{
  display:block;margin-top:6px;font:400 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#b4b6b6;
}
.aoHeritageSurface .aoJourneyStages{
  color:#dac9a7;margin:19px 0 3px;font:500 12px/1.45 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyNoLine{
  margin:17px 0;color:#bcb7ac;font:400 12px/1.53 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyActions{
  display:flex;flex-wrap:wrap;gap:9px;margin:19px 0;
}
.aoHeritageSurface .aoJourneyActions button{
  min-height:44px;padding:9px 13px;border-radius:8px;
  background:#d5bd8b;border:1px solid #d5bd8b;color:#0c1721;
  font:600 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyActions .aoJourneyOfficialMap{
  display:flex;align-items:center;min-height:44px;padding:9px 13px;
  border-radius:8px;border:1px solid rgba(205,180,133,.6);
  text-decoration:underline;text-underline-offset:3px;color:#eadab7;
  font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyActions button:first-child:not(:last-child){
  background:transparent;border-color:rgba(213,189,139,.49);color:#eadcc2;
}
.aoHeritageSurface .aoJourneyEvidence{
  display:grid;gap:8px;margin:18px 0 0;padding:15px 0 0;
  border-top:1px solid rgba(205,180,133,.22);
}
.aoHeritageSurface .aoJourneyEvidence>strong{
  font:600 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.08em;color:#cfb884;text-transform:uppercase;
}
.aoHeritageSurface .aoJourneyEvidence a{
  display:flex;align-items:center;min-height:44px;color:#e1d4b8;
  font:400 13px/1.4 var(--ao-font-ui,system-ui,sans-serif);
  text-decoration:underline;text-underline-offset:3px;overflow-wrap:anywhere;
}
@media(max-width:799px){
 .aoHeritageSurface .aoJourneyPanel{
   top:auto;left:0;right:0;bottom:0;width:100%;
   height:min(56dvh,505px);border-radius:17px 17px 0 0;
   border-bottom:0;box-shadow:0 -14px 43px rgba(0,0,0,.55);
   padding-bottom:env(safe-area-inset-bottom);
 }
 .aoHeritageSurface .aoJourneyHeader{padding:12px 15px 5px}
 .aoHeritageSurface .aoJourneyHeader h2{font-size:24px}
 .aoHeritageSurface .aoJourneyScope{padding:2px 15px 10px}
 .aoHeritageSurface .aoJourneyRoutes{gap:7px;padding:0 14px 10px}
 .aoHeritageSurface .aoJourneyRoutes button{flex-basis:162px;min-height:79px;max-height:94px;padding:8px 10px}
 .aoHeritageSurface .aoJourneyRoutes button strong{font-size:13px;-webkit-line-clamp:2}
 .aoHeritageSurface .aoJourneyDetail{padding:14px 16px 20px}
 .aoHeritageSurface .aoJourneyDetail h3{font-size:21px;margin:7px 0 16px}
 .aoHeritageSurface .aoJourneyAnchors strong{font-size:15px}
}
@media(max-width:360px){
 .aoHeritageSurface .aoJourneyPanel{height:min(59dvh,490px)}
 .aoHeritageSurface .aoJourneyRoutes button{flex-basis:150px}
}

/* Stage medallions link to individually sourced canonical sacred-place anchors.
   Numbers encode ordinal in a DOCUMENTED itinerary, never turn-by-turn routing. */
.aoHeritageSurface .aoJourneyMapStageMarker{
  box-sizing:border-box;display:grid;place-items:center;
  width:44px;height:44px;min-width:44px;min-height:44px;border-radius:50%;padding:0;
  border:2px solid #ddc395;background:#182b3a;color:#f1e4c8;
  box-shadow:0 0 0 4px rgba(8,15,24,.78),0 3px 13px rgba(0,0,0,.5);
  font:700 15px/1 var(--ao-font-ui,system-ui,sans-serif);
  font-variant-numeric:tabular-nums;cursor:pointer;
}
.aoHeritageSurface .aoJourneyMapStageMarker:hover,
.aoHeritageSurface .aoJourneyMapStageMarker:focus-visible{
  background:#d6bd87;color:#11202d;outline:2px solid #f4e9ce;
  outline-offset:4px;
}
.aoHeritageSurface .aoJourneyFocusButton{
  width:44px;height:44px;margin:-9px 0 -9px -9px;
  background:#243746;border:1px solid #cdb782;color:#f0e1bd;
  font:700 14px/1 var(--ao-font-ui,system-ui,sans-serif);
  cursor:pointer;position:relative;z-index:1;
}
.aoHeritageSurface .aoJourneyFocusButton:hover,
.aoHeritageSurface .aoJourneyFocusButton:focus-visible,
.aoHeritageSurface .aoJourneyFocusButton[aria-pressed="true"]{
  background:#d7bc85;color:#0c1b29;outline:2px solid #e4cfaa;
  outline-offset:2px;
}
.aoHeritageSurface .aoJourneyStageMapped{
  color:#dbc394;font-size:10px;white-space:nowrap;
  letter-spacing:.045em;
}

/* Stage names open the already published Sacred Atlas place, while the
   numbered control continues to focus the exact canonical site marker. */
.aoHeritageSurface .aoJourneyStagePlaceLink{
  box-sizing:border-box;display:flex;align-items:center;gap:9px;
  min-height:44px;max-width:100%;margin:0 0 0 -4px;padding:5px 4px;
  border:0;background:transparent;color:inherit;text-align:left;
  font:inherit;cursor:pointer;
}
.aoHeritageSurface .aoJourneyStagePlaceLink strong{
  margin:0;min-width:0;flex:1;color:#ede1ce;
}
.aoHeritageSurface .aoJourneyStagePlaceLink>span{
  flex:none;color:#d8bb84;font:650 14px/1 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoJourneyStagePlaceLink:hover strong,
.aoHeritageSurface .aoJourneyStagePlaceLink:focus-visible strong{
  color:#f7ddb0;text-decoration:underline;text-underline-offset:3px;
}
.aoHeritageSurface .aoJourneyStagePlaceLink:focus-visible{
  outline:2px solid #d8bb84;outline-offset:2px;border-radius:4px;
}

/* Icon contract: retain the canonical asset-bank mask as no-hydration fallback,
   but hide it when the app-wide Tier-A icon system hydrates this button into SVG.
   This prevents visually doubled close glyphs without discarding provenance. */
.aoExploreSurface .aoUiIconOnly [data-ao-asset-id="ao-ui-close"]{
  display:none!important;
}

/* D → C profile lifecycle: preserve Journey state and DOM under a Place
   sheet, but never draw two overlapping editorial folios at once. */
.aoHeritageSurface:has(.aoJourneyPanel):has(.aoFindSheetBackdrop[data-find-close-place]) .aoJourneyPanel{
  visibility:hidden;pointer-events:none;
}
.aoHeritageSurface:has(.aoJourneyPanel) .aoHeritageCardLayer .aoHeritagePreview{
  background:#101923; /* opaque: no text bleed-through from the journey */
}
@media(max-width:799px){
  /* A Place without approved photographic media needs one text column.
     Do not leave its title in column 2 with an empty-media paragraph in 1. */
  .aoHeritageSurface .aoHeritagePreview:not(:has(.aoHeritagePlaceThumb)){
    grid-template-columns:minmax(0,1fr);row-gap:6px;
  }
  .aoHeritageSurface .aoHeritagePreview:not(:has(.aoHeritagePlaceThumb)) .aoHeritageCardHeading{
    grid-column:1;grid-row:2;padding-right:48px;
  }
  .aoHeritageSurface .aoHeritagePreview:not(:has(.aoHeritagePlaceThumb)) .aoHeritageCardTitle{
    grid-column:1;grid-row:3;margin:0;
  }
  .aoHeritageSurface .aoHeritagePreview:not(:has(.aoHeritagePlaceThumb)) .aoHeritageSynopsis,
  .aoHeritageSurface .aoHeritagePreview:not(:has(.aoHeritagePlaceThumb)) .aoHeritageCardEmpty{
    grid-column:1;grid-row:4;margin:0;
    color:#c9beaa;font:400 13px/1.4 var(--ao-font-body,Georgia,serif);
  }
  .aoHeritageSurface .aoHeritagePreview:not(:has(.aoHeritagePlaceThumb)) .aoHeritagePreviewActions{
    grid-column:1;grid-row:5;
  }
}

/* C -> D: only source-owned canonical pilgrimages, not nearby guesses. */
.aoHeritageSurface .aoHeritageJourneyLink{
  display:flex;align-items:center;justify-content:space-between;
  gap:9px;min-height:44px;padding:10px 12px;
  border:1px solid rgba(205,178,122,.48);border-radius:8px;
  background:#1a2934;color:#e9d5ae;
  font:600 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  cursor:pointer;
}
.aoHeritageSurface .aoHeritageJourneyLink:focus-visible,
.aoHeritageSurface .aoExplorePlaceJourneyRow:focus-visible{
  outline:2px solid #e5c990;outline-offset:3px;
}
.aoHeritageSurface .aoExplorePlaceJourneys{
  padding:16px 0;display:grid;gap:9px;
}
.aoHeritageSurface .aoExplorePlaceJourneys h3{
  font:500 18px/1.3 var(--ao-font-display,Georgia,serif);
  color:#eaddc5;margin:0 0 5px;
}
.aoHeritageSurface .aoExplorePlaceJourneyRow{
  display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px 12px;
  min-height:58px;width:100%;padding:12px 14px;
  text-align:left;border-radius:9px;cursor:pointer;
  border:1px solid rgba(205,178,122,.24);background:#13212d;color:#eadcc5;
}
.aoHeritageSurface .aoExplorePlaceJourneyRow strong{
  display:block;grid-column:1;font:500 15px/1.3 var(--ao-font-body,Georgia,serif);
}
.aoHeritageSurface .aoExplorePlaceJourneyRow small{
  grid-column:1;color:#baae9c;font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoExplorePlaceJourneyRow>span{
  grid-column:2;grid-row:1/3;align-self:center;color:#d3bb8c;font-size:16px;
}
.aoHeritageSurface .aoExplorePlaceJourneys>p{
  color:#b5a997;font:400 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);margin:4px 0 0;
}


/* MapCN Store Locator visual grammar, source-bound to the existing atlas.
   One map instance, one action owner. Rail is an overlay, not a new column
   that shrinks map canvas or steals viewport height. */
.aoHeritageSurface .aoMapcnDiscoverRail{
 position:absolute;z-index:9;top:188px;bottom:13px;left:17px;
 width:min(320px,calc(100% - 34px));min-height:0;display:flex;flex-direction:column;
 border:1px solid rgba(201,174,121,.28);border-radius:13px;
 background:#0d1721f5;color:#e5ddce;box-shadow:0 18px 42px #0008;
 backdrop-filter:blur(10px);overflow:hidden;
}
.aoHeritageSurface .aoMapcnDiscoverHead{
 flex:none;display:flex;align-items:center;justify-content:space-between;
 padding:17px 15px 13px;gap:9px;border-bottom:1px solid #a18c6038;
}
.aoMapcnDiscoverHead small{color:#c9ad7b;letter-spacing:.12em;font:600 9px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoMapcnDiscoverHead h2{margin:5px 0 0;font:500 26px/1 var(--ao-font-display,Georgia,serif);color:#eee1ce}
.aoMapcnDiscoverHead>strong{font:500 27px/1 var(--ao-font-display,Georgia,serif);color:#ccb07c}
.aoHeritageSurface .aoMapcnDiscoverEntries{min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;scrollbar-color:#6f654e transparent}
.aoHeritageSurface .aoMapcnDiscoverItem{
 display:flex;align-items:flex-start;gap:10px;text-align:left;color:#e4ddcf;
 background:transparent;border:0;border-bottom:1px solid #a18c6026;
 width:100%;min-height:80px;padding:12px 13px;cursor:pointer;
}
.aoHeritageSurface .aoMapcnDiscoverItem:hover,.aoHeritageSurface .aoMapcnDiscoverItem[aria-current=true]{
 background:#23313b;
}
.aoHeritageSurface .aoMapcnDiscoverItem:focus-visible{outline:2px solid #d2b57e;outline-offset:-3px}
.aoHeritageSurface .aoMapcnDiscoverItem>img,.aoHeritageSurface .aoMapcnDiscoverGlyph{
 width:63px;height:66px;flex:none;border-radius:6px;object-fit:cover;
 border:1px solid #bda47748;background:#1d2c36;
}
.aoHeritageSurface .aoMapcnDiscoverGlyph{display:grid;place-items:center;font:29px Georgia,serif;color:#bca47b}
.aoHeritageSurface .aoMapcnDiscoverCopy{flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.aoMapcnDiscoverCopy>small{color:#cdb78c;letter-spacing:.09em;font:600 9px var(--ao-font-ui,system-ui,sans-serif)}
.aoMapcnDiscoverCopy>strong{font:500 18px/1.12 var(--ao-font-display,Georgia,serif);color:#f0e5d3}
.aoMapcnDiscoverCopy>span,.aoMapcnDiscoverCopy>em{font:11px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:#9fb0b7;font-style:normal}
.aoMapcnDiscoverCopy>em{color:#c7ab7a}
.aoMapcnDiscoverArrow{flex:none;color:#d3b984;font-size:15px}
.aoHeritageSurface .aoMapcnDiscoverFoot{flex:none;padding:8px 13px;border-top:1px solid #a18c6038}
.aoMapcnDiscoverFoot button{display:block;width:100%;min-height:44px;color:#deca9e;border:1px solid #ac916749;border-radius:7px;background:#1a2a34;font:600 11px var(--ao-font-ui,system-ui,sans-serif)}
.aoMapcnDiscoverFoot span{display:block;padding:8px;color:#a3afb2;text-align:center;font-size:11px}
@media(max-width:799px){
 .aoHeritageSurface .aoMapcnDiscoverRail{
   top:auto;left:0;right:0;bottom:0;width:100%;height:min(35dvh,310px);
   border-radius:15px 15px 0 0;border-left:0;border-right:0;
   background:#0f1b25f8;
 }
 .aoHeritageSurface .aoMapcnDiscoverHead{padding:9px 13px}
 .aoMapcnDiscoverHead h2{font-size:21px}
 .aoMapcnDiscoverHead>strong{font-size:24px}
 .aoHeritageSurface .aoMapcnDiscoverItem{min-height:69px;padding:9px 11px}
 .aoHeritageSurface .aoMapcnDiscoverItem>img,.aoHeritageSurface .aoMapcnDiscoverGlyph{width:49px;height:54px}
 .aoMapcnDiscoverCopy>strong{font-size:17px}
 .aoHeritageSurface .aoHeritageMapHint{display:none}
 .aoHeritageSurface:has(.aoMapcnDiscoverRail) .aoHeritageNearby{bottom:calc(min(35dvh,310px) + 12px)}
 .aoHeritageSurface:has(.aoFindSheetBackdrop[data-find-close-place]) .aoMapcnDiscoverRail{display:none}
}


/* P3: MapCN Uptime Monitor-inspired liturgical-time and source-evidence board.
   It overlays the ONE existing Explore map; does not imply a second map or
   continuous real-time Mass availability. */
.aoHeritageSurface .aoTimeMassLaunch.active{
  border-color:rgba(219,186,119,.9);
  background:#443d2d;color:#f0dfb9;
}
.aoHeritageSurface .aoTimeMassPanel{
  position:absolute;z-index:14;top:184px;bottom:13px;left:17px;
  width:min(418px,calc(100% - 34px));min-height:0;
  display:flex;flex-direction:column;color:#ebdfc9;
  background:#101b26fa;border:1px solid rgba(207,181,126,.48);
  border-radius:13px;overflow:hidden;box-shadow:0 18px 46px #000b;
}
.aoTimeMassHead{flex:none;display:flex;justify-content:space-between;align-items:center;
  gap:9px;padding:14px 17px;background:#111d27;border-bottom:1px solid #a68d593e}
.aoTimeMassHead small{display:block;color:#bda878;letter-spacing:.14em;
  font:600 9px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassHead h2{margin:4px 0 0;color:#f3e6ce;
  font:500 29px/1 var(--ao-font-display,Georgia,serif)}
.aoTimeMassHead button{min-height:40px;min-width:40px;border:1px solid #866f4e88;
  border-radius:50%;background:#1c2935;color:#e8d7b9;font-size:22px;cursor:pointer}
.aoTimeMassScroll{min-height:0;flex:1;overflow:auto;overscroll-behavior:contain;
  scrollbar-color:#88785e #15212b;padding:14px 16px 19px}
.aoTimeMassSeason{position:relative;padding:15px 16px 13px 22px;
  border:1px solid #ab936544;border-radius:9px;background:#172634;overflow:hidden}
.aoTimeMassSeasonAccent{position:absolute;inset:0 auto 0 0;width:5px;background:#638b69}
.aoTimeMassSeason[data-season-colour=violet] .aoTimeMassSeasonAccent{background:#85689b}
.aoTimeMassSeason[data-season-colour=white] .aoTimeMassSeasonAccent{background:#e1cfad}
.aoTimeMassSeason[data-season-colour=red] .aoTimeMassSeasonAccent{background:#ad685f}
.aoTimeMassSeason[data-season-colour=black] .aoTimeMassSeasonAccent{background:#737576}
.aoTimeMassSeason small{font:600 10px var(--ao-font-ui,system-ui,sans-serif);
 color:#baaa8c;letter-spacing:.09em}
.aoTimeMassSeason h3{font:500 25px/1.06 var(--ao-font-display,Georgia,serif);
  color:#eee1ca;margin:8px 0 7px}
.aoTimeMassSeason p{font:12px/1.5 var(--ao-font-ui,system-ui,sans-serif);
 color:#b6c1bd;margin:0 0 8px}
.aoTimeMassSeason>span{display:block;color:#cdb98f;
 font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassFields{display:flex;align-items:end;gap:9px;padding:12px 0 8px}
.aoTimeMassFields label,.aoTimeMassFilters label{flex:1;min-width:0;display:grid;gap:6px;
 font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 text-transform:uppercase;letter-spacing:.055em;color:#cbb689}
.aoTimeMassFields input,.aoTimeMassFilters input,.aoTimeMassFilters select{
 display:block;width:100%;box-sizing:border-box;min-width:0;min-height:42px;
 border:1px solid #ad925c63;border-radius:7px;padding:8px 9px;
 background:#0d1721;color:#eee1cb;font:400 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassFields button{min-height:42px;border:1px solid #ab93655e;
 border-radius:7px;background:#24343e;color:#e6cf9d;padding:6px 10px;
 font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.aoTimeMassNotice{color:#b5b0a7;background:#101923;border-left:2px solid #a98d60;
 padding:10px 11px;margin:5px 0 12px;font:11px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassMetrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.aoTimeMassMetrics>div{min-width:0;padding:10px;background:#1d2b34;border:1px solid #846f4745;
  border-radius:7px}
.aoTimeMassMetrics small{display:block;color:#bac2ba;font:10px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassMetrics strong{display:block;margin-top:5px;font:500 24px/1 var(--ao-font-display,Georgia,serif);color:#e8d2a4}
.aoTimeMassFilters{display:grid;grid-template-columns:minmax(0,1fr);gap:10px;
 margin:15px 0 12px}
.aoTimeMassResults{font:600 11px var(--ao-font-ui,system-ui,sans-serif);
 color:#cbb78e;margin:0 0 9px}
.aoTimeMassRows{display:grid;gap:8px}
.aoTimeMassRow{padding:13px;background:#152330;border:1px solid #ad925c40;border-radius:8px}
.aoTimeMassRow>small{display:block;color:#c7ad81;text-transform:uppercase;
 letter-spacing:.045em;font:600 9px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassRow h3{font:500 19px/1.16 var(--ao-font-display,Georgia,serif);
 color:#f0e5d2;margin:5px 0 4px}
.aoTimeMassRow p{font:11px/1.45 var(--ao-font-ui,system-ui,sans-serif);
 color:#aebec0;margin:5px 0}
.aoTimeMassRow blockquote{margin:9px 0;white-space:pre-line;max-height:130px;
 overflow:auto;padding:9px 10px;background:#0e1b25;border-left:2px solid #c3a775;
 font:12px/1.55 var(--ao-font-body,Georgia,serif);color:#dcd1bb}
.aoTimeMassRow a{display:inline-block;margin-top:8px;color:#e1c591;
 font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 text-decoration:underline;text-underline-offset:3px}
.aoTimeMassRow[data-time-mass-status=REVIEW_DUE]{
 border-color:#bb8e626e}
.aoTimeMassMore,.aoTimeMassScroll footer button{width:100%;min-height:44px;margin-top:12px;
 cursor:pointer;border:1px solid #bda07272;border-radius:7px;
 background:#24363d;color:#e5cca0;padding:9px;
 font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTimeMassScroll footer{margin-top:15px;border-top:1px solid #ae965d4a;padding-top:10px}
.aoTimeMassScroll footer p{font:11px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#b5bdb9}
.aoTimeMassPanel button:focus-visible,.aoTimeMassPanel input:focus-visible,
.aoTimeMassPanel select:focus-visible,.aoTimeMassPanel a:focus-visible{
 outline:2px solid #ebd3a3;outline-offset:2px}
.aoHeritageSurface:has(.aoFindSheetBackdrop) .aoTimeMassPanel{visibility:hidden;pointer-events:none}
@media(max-width:799px){
 .aoHeritageSurface .aoTimeMassPanel{top:auto;left:0;right:0;bottom:0;width:100%;
   height:min(53dvh,475px);border-radius:17px 17px 0 0;border-left:0;border-right:0}
 .aoTimeMassHead{padding:10px 14px}
 .aoTimeMassHead h2{font-size:23px}
 .aoTimeMassScroll{padding:10px 12px 17px}
 .aoTimeMassSeason{padding:10px 12px 10px 18px}
 .aoTimeMassSeason h3{font-size:22px}
 .aoTimeMassFields{align-items:stretch}
 .aoTimeMassFields button{max-width:49%}
 .aoTimeMassMetrics strong{font-size:20px}
 .aoHeritageSurface:has(.aoTimeMassPanel) .aoHeritageMapHint{display:none}
}


/* P4 MapCN layers · canonical MapLibre instance, overlay is explanatory only */
.aoHeritageSurface .aoAtlasLayersLaunch.active{background:#443d2d;color:#f1dfba;border-color:#c7a777}
.aoHeritageSurface .aoAtlasCoveragePanel{
 position:absolute;z-index:14;top:184px;left:17px;bottom:13px;
 width:min(410px,calc(100% - 34px));min-height:0;
 display:flex;flex-direction:column;overflow:hidden;
 background:#101b26fb;color:#ebdfc9;
 border:1px solid rgba(207,181,126,.47);border-radius:13px;
 box-shadow:0 18px 46px #000b;
}
.aoAtlasCoverageHead{padding:15px 17px;flex:none;display:flex;align-items:center;
 justify-content:space-between;gap:10px;background:#121f2a;border-bottom:1px solid #9b86573c}
.aoAtlasCoverageHead small{font:600 9px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 color:#c1a677;letter-spacing:.14em}
.aoAtlasCoverageHead h2{margin:4px 0 0;color:#f1e2c9;
 font:500 27px/1.06 var(--ao-font-display,Georgia,serif)}
.aoAtlasCoverageHead>button{min-height:44px;min-width:44px;
 border:1px solid #947c5299;border-radius:50%;background:#1a2a35;
 font-size:23px;color:#f0dcba;cursor:pointer}
.aoAtlasCoverageScroll{padding:12px 15px 16px;min-height:0;
 overflow:auto;flex:1;overscroll-behavior:contain;scrollbar-color:#7e7156 #15232c}
.aoAtlasCoverageModes{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.aoAtlasCoverageModes button{min-height:44px;border:1px solid #9f87595a;
 border-radius:7px;background:#172936;color:#d4b985;font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCoverageModes button[aria-pressed=true],.aoAtlasCoverageScope button[aria-pressed=true]{
 background:#b99e6d;color:#101a22;border-color:#dcc494}
.aoAtlasCoverageScope{display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin:14px 0}
.aoAtlasCoverageScope>span{color:#b7a477;font:600 10px var(--ao-font-ui,system-ui,sans-serif);
 text-transform:uppercase;letter-spacing:.09em;margin-right:5px}
.aoAtlasCoverageScope button{min-height:38px;padding:7px 10px;border:1px solid #aa93644d;
 border-radius:999px;background:#17242f;color:#e5d4ac;
 font:600 11px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCoverageMetrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}
.aoAtlasCoverageMetrics>div{padding:10px 8px;min-width:0;background:#1b2b35;
 border:1px solid #997d514f;border-radius:7px}
.aoAtlasCoverageMetrics small{display:block;min-height:25px;
 font:10px/1.25 var(--ao-font-ui,system-ui,sans-serif);color:#aebab7}
.aoAtlasCoverageMetrics strong{display:block;margin-top:5px;color:#e8cf9d;
 font:500 25px var(--ao-font-display,Georgia,serif)}
.aoAtlasCoverageCaution{padding:12px;border-left:2px solid #b69c6a;
 background:#111d27;color:#c6beb0;font:12px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCoverageLegend{display:grid;gap:7px;padding:14px 0}
.aoAtlasCoverageLegend i{display:block;height:11px;border-radius:999px;
 background:linear-gradient(90deg,#172f3b,#315b65,#627966,#b99b65,#f0d49d)}
.aoAtlasCoverageLegend span{color:#c6c1b5;font:11px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCountryLegend{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));
 gap:3px;margin:10px 0 5px}
.aoAtlasCountryLegend span{text-align:center;padding:7px 2px;color:#f4ead8;
 border-radius:4px;font:600 10px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCountryLegend span:nth-child(1){background:#25313c}
.aoAtlasCountryLegend span:nth-child(2){background:#506a64}
.aoAtlasCountryLegend span:nth-child(3){background:#728774}
.aoAtlasCountryLegend span:nth-child(4){background:#bfa975;color:#111c26}
.aoAtlasCountryLegend span:nth-child(5){background:#e2c58b;color:#111c26}
.aoAtlasBoundaryStatus{color:#adafa9;font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasSelectedCountry{padding:8px 10px;border:1px solid #a68e625e;
 background:#23333b;color:#e5ca9c;font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCountryRows{display:grid;gap:4px;max-height:310px;overflow:auto;overscroll-behavior:contain}
.aoAtlasCountryRows button{display:flex;justify-content:space-between;align-items:center;gap:12px;
 width:100%;min-height:44px;text-align:left;padding:9px 12px;cursor:pointer;
 background:#1b2a34;border:1px solid #927e5c46;border-radius:6px;color:#e8dcc5}
.aoAtlasCountryRows strong{font:500 15px/1.2 var(--ao-font-display,Georgia,serif)}
.aoAtlasCountryRows span{color:#e8c78a;font:600 13px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCountryRows button:hover{background:#273944}
.aoAtlasCoveragePanel button:focus-visible,.aoAtlasCoveragePanel a:focus-visible{
 outline:2px solid #e8cf9a;outline-offset:2px}
.aoAtlasCoveragePanel [data-atlas-country-more],.aoAtlasCoveragePanel footer button{
 display:block;width:100%;min-height:44px;margin:12px 0 0;padding:9px;
 border:1px solid #a58b5d77;border-radius:7px;background:#25343e;
 color:#dfc99f;font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCoveragePanel footer{margin-top:16px;padding-top:12px;border-top:1px solid #947d5549;
 color:#aeb8b5;font:11px/1.6 var(--ao-font-ui,system-ui,sans-serif)}
.aoAtlasCoveragePanel footer p{margin:9px 0}
.aoAtlasCoveragePanel footer a{color:#d9c28e;text-underline-offset:2px}
.aoHeritageSurface:has(.aoFindSheetBackdrop) .aoAtlasCoveragePanel{visibility:hidden;pointer-events:none}
@media(max-width:799px){
 .aoHeritageSurface .aoAtlasCoveragePanel{top:auto;bottom:0;left:0;right:0;
 width:100%;height:min(48dvh,430px);
 border-left:0;border-right:0;border-radius:17px 17px 0 0}
 .aoAtlasCoverageHead{padding:9px 13px}
 .aoAtlasCoverageHead h2{font-size:22px}
 .aoAtlasCoverageScroll{padding:10px 12px 17px}
 .aoAtlasCoverageMetrics strong{font-size:21px}
 .aoAtlasCountryRows{max-height:230px}
 .aoHeritageSurface:has(.aoAtlasCoveragePanel) .aoHeritageMapHint{display:none}
}


/* P5 · MapCN Network View: a provenance-bound relationship diagram.
   Dedicated diagram surface, never presented as a geographic route map. */
.aoHeritageSurface .aoNetworkLaunch.active{border-color:#d5b97d;background:#433c30;color:#f4e1b9}
.aoHeritageSurface .aoNetworkPanel{
 position:absolute;inset:0;z-index:16;display:flex;flex-direction:column;
 min-width:0;min-height:0;overflow:hidden;background:#0b141e;
 border:1px solid rgba(195,165,109,.45);color:#e9dec9;
 box-shadow:0 15px 45px #000b;
}
.aoNetworkHeader{flex:none;min-height:67px;padding:10px 19px;display:flex;align-items:center;
 justify-content:space-between;border-bottom:1px solid #9a85574a;background:#101c27}
.aoNetworkHeader small{font:600 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.15em;color:#c2aa81}
.aoNetworkHeader h2{font:500 29px/1.05 var(--ao-font-display,Georgia,serif);
 color:#f1e7d6;margin:4px 0 0}
.aoNetworkHeader>button{height:44px;width:44px;border-radius:50%;border:1px solid #b29b74;
 background:#1b2b36;color:#e8d4ad;font-size:22px;cursor:pointer}
.aoNetworkColumns{display:grid;grid-template-columns:minmax(250px,305px) minmax(0,1fr);
 min-height:0;flex:1;overflow:hidden}
.aoNetworkRail{min-height:0;display:flex;flex-direction:column;gap:9px;padding:14px;
 background:#131f2a;border-right:1px solid #8b805b4c}
.aoNetworkExplanation{margin:0;color:#afbcb9;font:11px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkStats{display:grid;grid-template-columns:1fr 1fr;gap:7px}
.aoNetworkStats>div{padding:8px 9px;background:#20313b;border:1px solid #89785466;border-radius:7px}
.aoNetworkStats strong{font:500 24px/1 var(--ao-font-display,Georgia,serif);color:#efd1a0}
.aoNetworkStats small{display:block;color:#b6b7ab;font:10px/1.35 var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkLabel{display:grid;gap:5px;color:#c6b189;text-transform:uppercase;
 letter-spacing:.075em;font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkLabel input,.aoNetworkLabel select{min-height:42px;width:100%;box-sizing:border-box;
 border:1px solid #a68a5d85;border-radius:8px;padding:8px 11px;background:#0b1823;
 color:#f1e5d1;font:13px var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkMatchCount{padding-top:3px;color:#bfa979;font:600 10px var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkResults{flex:1;min-height:0;overflow:auto;overscroll-behavior:contain;
 scrollbar-color:#8b7855 #18232d}
.aoNetworkResults button{display:flex;flex-direction:column;gap:3px;
 width:100%;min-height:57px;text-align:left;padding:9px 10px;border-radius:7px;
 border:1px solid transparent;border-bottom-color:#8e7a4f30;
 background:transparent;color:#e9ddc8;cursor:pointer}
.aoNetworkResults button[aria-pressed=true],.aoNetworkResults button:hover{
 border-color:#b59d6a88;background:#2a353b}
.aoNetworkResults small{color:#d0b985;font:600 9px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 text-transform:uppercase;letter-spacing:.09em}
.aoNetworkResults strong{font:500 17px/1.1 var(--ao-font-display,Georgia,serif)}
.aoNetworkResults span{color:#95a9b0;font:10px var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkMain{min-width:0;min-height:0;overflow:auto;overscroll-behavior:contain;
 background:radial-gradient(ellipse at 50% 32%,#28333a 0%,#101a25 51%,#0b151f 100%);
 scrollbar-color:#74694f #101b25}
.aoNetworkCurrent{padding:13px 19px 3px;display:flex;justify-content:space-between;gap:12px;align-items:center}
.aoNetworkCurrent small{color:#bfa77e;font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 text-transform:uppercase;letter-spacing:.075em}
.aoNetworkCurrent h3{font:500 24px/1.1 var(--ao-font-display,Georgia,serif);
 margin:4px 0;color:#efe3cc}
.aoNetworkCurrent button{padding:10px 12px;min-height:42px;flex:none;border:1px solid #af9368;
 background:#29373f;color:#e8d0a0;border-radius:7px;font:600 10px var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkGraphWrap{width:min(100%,930px);margin:0 auto}
.aoNetworkGraph{display:block;width:100%;height:auto;max-height:min(58vh,480px)}
.aoNetworkGraphWrap>p{margin:0;text-align:center;color:#8fadaf;
 font:10px/1.5 var(--ao-font-ui,system-ui,sans-serif);padding:0 14px 8px}
.aoNetworkSvgItem{cursor:pointer}
.aoNetworkSvgItem:focus .aoNetworkSvgCircle,.aoNetworkSvgItem:hover .aoNetworkSvgCircle{
 stroke-width:3.2;fill:#405059}
.aoNetworkSvgCircle{fill:#213541;stroke:#b2a180;stroke-width:1.8}
.aoNetworkType-place{fill:#324949}.aoNetworkType-shrine{fill:#4b463a}
.aoNetworkType-pilgrimage{fill:#4a3a4c}.aoNetworkType-route{fill:#344358}
.aoNetworkType-relic{fill:#4b4140}.aoNetworkType-apparition{fill:#394552}
.aoNetworkType-calendar{fill:#385047}
.aoNetworkSvgType{fill:#d8bd90;font:600 9px var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.07em;pointer-events:none}
.aoNetworkSvgTitle{fill:#f0e5d1;font:500 11px var(--ao-font-display,Georgia,serif);pointer-events:none}
.aoNetworkSvgSmall{fill:#cfbd99;font:9px var(--ao-font-ui,system-ui,sans-serif);pointer-events:none}
.aoNetworkEvidence{padding:11px 18px 25px;max-width:1000px;margin:0 auto}
.aoNetworkEvidenceTop{display:flex;align-items:center;justify-content:space-between;
 border-bottom:1px solid #a38c5c60;padding:0 0 8px;margin-bottom:6px}
.aoNetworkEvidenceTop h4{font:500 21px/1 var(--ao-font-display,Georgia,serif);margin:0}
.aoNetworkEvidenceTop span{color:#cbb383;font:11px var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkEvidenceRow{display:flex;align-items:center;justify-content:space-between;gap:15px;
 padding:10px 0;border-bottom:1px solid #9a80562d}
.aoNetworkEvidenceRow>div{display:grid;gap:4px;min-width:0}
.aoNetworkEvidenceRow small{font:10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:#b6b1a0}
.aoNetworkEvidenceRow button{border:0;background:transparent;text-align:left;color:#eadac2;
 cursor:pointer;font:500 17px/1.2 var(--ao-font-display,Georgia,serif);padding:0}
.aoNetworkEvidenceRow .aoNetworkPlaceButton{color:#c9b083;font:600 10px var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkEvidenceRow a{flex:none;color:#debb83;font:600 11px var(--ao-font-ui,system-ui,sans-serif);
 text-decoration:underline;text-underline-offset:2px}
.aoNetworkMore{width:100%;min-height:44px;border:1px solid #b19b71;
 background:#1e303a;color:#ecd7aa;margin-top:9px;border-radius:7px}
.aoNetworkEmpty{padding:35px;color:#d7ccb5}
.aoNetworkFoot{flex:none;padding:7px 16px;max-height:54px;overflow:auto;
 border-top:1px solid #99835545;color:#9eadac;
 font:10px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoNetworkPanel button:focus-visible,.aoNetworkPanel input:focus-visible,
.aoNetworkPanel select:focus-visible,.aoNetworkPanel a:focus-visible,
.aoNetworkSvgItem:focus-visible{outline:2px solid #ddc18c;outline-offset:2px}
.aoHeritageSurface:has(.aoFindSheetBackdrop[data-find-close-place]) .aoNetworkPanel{visibility:hidden;pointer-events:none}
@media(max-width:799px){
 .aoNetworkHeader{padding:7px 11px;min-height:49px}
 .aoNetworkHeader h2{font-size:22px}
 .aoNetworkColumns{display:flex;flex-direction:column}
 .aoNetworkRail{flex:none;height:min(25dvh,200px);min-height:150px;
 padding:8px 11px;gap:4px;border-right:0;border-bottom:1px solid #8d7d5947}
 .aoNetworkExplanation{font-size:10px;line-height:1.3;max-height:27px;overflow:hidden}
 .aoNetworkStats{display:none}
 .aoNetworkLabel{font-size:9px;gap:2px}
 .aoNetworkLabel input,.aoNetworkLabel select{min-height:36px;padding:5px 8px;font-size:12px}
 .aoNetworkResults{display:none}
 .aoNetworkMatchCount{font-size:9px}
 .aoNetworkCurrent{padding:9px 12px 0}
 .aoNetworkCurrent h3{font-size:20px}
 .aoNetworkCurrent button{font-size:9px;padding:6px 9px;max-width:120px}
 .aoNetworkGraph{max-height:250px}
 .aoNetworkEvidence{padding:7px 11px 20px}
 .aoNetworkEvidenceRow{gap:9px}
 .aoNetworkFoot{font-size:9px;max-height:47px}
}

`;
