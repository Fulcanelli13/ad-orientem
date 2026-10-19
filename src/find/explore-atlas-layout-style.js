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
  min-height:35px;height:35px;padding:7px 11px;border-radius:100px;
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
   height:54px;min-height:54px;padding:6px 9px;
   gap:8px;grid-template-columns:40px minmax(0,1fr) auto auto;
 }
 .aoHeritageSurface .aoFindHeader h1{font-size:17px}
 .aoHeritageSurface .aoFindHeader>div:first-of-type small{display:none}
 .aoHeritageSurface .aoHeritageMassShortcut{height:38px;min-height:38px;padding:0 10px}
 .aoHeritageSurface .aoHeritageMore summary{height:38px;min-height:38px;padding:0 10px}
 .aoHeritageSurface .aoHeritageTools{
   top:65px;left:10px;width:calc(100% - 20px)
 }
 .aoHeritageSurface .aoHeritageCategories{
   top:120px;left:10px;max-width:calc(100% - 20px)
 }
 .aoHeritageSurface .aoHeritageWorldReset{top:116px;left:10px}
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
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreTlmFilters>.aoExploreQuickFilters{
  display:none
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
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindBody[data-find-view=map]{
  position:relative;flex:1;min-height:0;margin:0;padding:0!important;overflow:hidden;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindBody[data-find-view=map]>.aoFindMap{
  position:absolute;inset:0;width:100%;height:100%!important;
  margin:0!important;min-height:0!important;border:0!important;border-radius:0!important;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreMapReset{
  top:130px;left:14px;width:44px;height:44px;padding:0;
  border-radius:50%;font-size:0;background:#0c1824ed;
  border:1px solid rgba(205,180,132,.34)
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoExploreMapReset:before{
  content:"◎";font:27px/1 Georgia,serif;color:#d9c390
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend{
  position:absolute;bottom:18px;left:14px;z-index:8;max-width:min(500px,80%);
  margin:0;padding:5px;max-height:42px;overflow:hidden;
  background:#0b1924e8;border:1px solid rgba(205,180,132,.22);
  border-radius:9px;box-shadow:0 8px 24px #0007;
}
/* The full logo legend and credits remain in the DOM for explicit source
   checking and future disclosure; avoid duplicated large badges by default. */
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend>span[data-group],
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapLegend>small,
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map]) .aoMapEmblemCredits{
  display:none;
}
.aoExploreSurface:has(.aoExploreTlmFilters):has(.aoFindBody[data-find-view=map])>.aoFindExternalSource{
  display:none;
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

`;
