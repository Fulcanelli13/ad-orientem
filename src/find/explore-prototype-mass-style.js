// Sacred Atlas approved Latin Mass screen 4, presentation only.
// Reuses the CL27 Directory, source-qualified data, approved exact-venue images,
// original MapLibre and existing source-scope filter controls.
export const EXPLORE_PROTOTYPE_MASS_STYLE = String.raw`
.aoExploreSurface[data-atlas-mass=true]{
 --atlas-glass:rgba(7,12,18,.95);--atlas-rule:#38424a;--atlas-gold:#c3a66b;
 background:#080c12;overflow:hidden;
}
.aoExploreSurface[data-atlas-mass=true]>.aoFindHeader{
 position:absolute!important;top:0;left:0;right:0;z-index:16!important;
 height:0!important;min-height:0!important;padding:0!important;
 border:0!important;background:transparent!important;display:block!important;
}
.aoExploreSurface[data-atlas-mass=true]>.aoFindHeader>div,
.aoExploreSurface[data-atlas-mass=true]>.aoFindHeader>span{display:none!important}
.aoExploreSurface[data-atlas-mass=true]>.aoFindHeader>button[data-find-close]{
 position:absolute;right:12px;top:12px;left:auto;min-width:44px;min-height:44px;
 width:44px;height:44px;border-radius:50%;background:var(--atlas-glass);
 border:1px solid var(--atlas-rule);color:#eadcbd;box-shadow:0 5px 20px #0008;
}
.aoExploreSurface[data-atlas-mass=true]>.aoFindHeader>button[data-find-glossary]{
 position:absolute;right:12px;top:305px;left:auto;min-width:44px;min-height:44px;
 width:44px;height:44px;border-radius:50%;background:var(--atlas-glass);
 border:1px solid var(--atlas-rule);color:#eadcbd;
}
.aoExploreSurface[data-atlas-mass=true]>.aoAtlasMassTabs{
 position:absolute;z-index:15;top:67px;left:12px;display:flex;gap:2px;
 padding:4px;max-width:calc(100% - 24px);border-radius:25px;
 border:1px solid var(--atlas-rule);background:var(--atlas-glass);
 box-sizing:border-box;backdrop-filter:blur(11px);
}
.aoExploreSurface[data-atlas-mass=true]>.aoAtlasMassTabs button{
 border:1px solid transparent;background:transparent;color:#d5c9b7;
 flex:none;min-height:44px;padding:0 11px;border-radius:23px;
 font:500 13px/1 var(--ao-font-display,Georgia,serif);white-space:nowrap;
}
.aoExploreSurface[data-atlas-mass=true]>.aoAtlasMassTabs button.active{
 color:#f4e8d5;background:#26363d;border-color:#7988806e;
}
.aoExploreSurface[data-atlas-mass=true]>.aoAtlasMassTabs button:focus-visible{
 outline:2px solid #dfc288;outline-offset:2px;
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar{
 position:absolute!important;top:12px!important;left:12px!important;right:69px!important;
 width:auto!important;min-width:0;z-index:14!important;display:flex!important;
 padding:0!important;border:0!important;background:transparent!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar .aoFindSearch{
 flex:1;min-width:0;
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar .aoFindSearch input{
 width:100%;min-height:44px!important;height:44px!important;
 background:var(--atlas-glass)!important;border:1px solid var(--atlas-rule)!important;
 border-radius:25px!important;padding:9px 15px!important;
 color:#eee6d8!important;font:italic 15px/1 var(--ao-font-display,Georgia,serif)!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar .aoFindViewTabs{
 position:absolute;left:0;top:105px;display:flex;gap:4px;
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar .aoFindViewTabs button{
 background:var(--atlas-glass);border:1px solid var(--atlas-rule);
 border-radius:20px;min-height:38px;height:38px;padding:6px 12px;
 color:#d8ccbc;font:500 12px/1 var(--ao-font-display,Georgia,serif);
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar .aoFindViewTabs button.active{
 background:#25373b;border-color:#9f916e;color:#f2e3c6;
}
.aoExploreSurface[data-atlas-mass=true]>.aoExploreTlmFilters{
 position:absolute!important;top:163px!important;left:12px!important;
 right:12px!important;z-index:16!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmProviderStrip{padding-right:72px!important}
.aoExploreSurface[data-atlas-mass=true] .aoTlmProviderStrip .aoFindAffiliations button{
 min-height:40px!important;border-radius:23px!important;
 font:500 12px/1 var(--ao-font-display,Georgia,serif)!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoAtlasTlmExtra{
 border-radius:23px!important;background:var(--atlas-glass)!important;
 border:1px solid var(--atlas-rule)!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoAtlasTlmExtra>summary{
 min-height:40px!important;border-radius:23px!important;
 font:500 12px/1.2 var(--ao-font-display,Georgia,serif)!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoAtlasTlmExtra[open]{
 z-index:25;max-height:min(65dvh,560px);overflow:auto;
 background:#0a1118!important;border-radius:15px!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoExploreSectionNav{
 position:absolute;right:12px;top:252px;left:auto;z-index:13;
}
.aoExploreSurface[data-atlas-mass=true] .aoExploreSectionSwitcher>summary{
 width:44px;min-width:44px;height:44px;min-height:44px;font-size:0!important;
 display:grid;place-items:center;border-radius:50%;padding:0!important;
 background:var(--atlas-glass);border:1px solid var(--atlas-rule);
}
.aoExploreSurface[data-atlas-mass=true] .aoExploreSectionSwitcher>summary:before{
 content:"◇";font:26px/1 var(--ao-font-display,Georgia,serif);color:#e4d2b0;
}
.aoExploreSurface[data-atlas-mass=true]>.aoFindBody[data-find-view=map]{
 position:relative;flex:1;min-height:0;overflow:hidden;
}
.aoExploreSurface[data-atlas-mass=true] .aoFindMap .maplibregl-ctrl-top-right{
 top:125px;right:12px;
}
.aoExploreSurface[data-atlas-mass=true] .aoFindMap .maplibregl-ctrl-top-right button{
 border-radius:50%;margin-bottom:7px;min-width:44px;min-height:44px;
 background:var(--atlas-glass);border:1px solid var(--atlas-rule);
 box-shadow:0 3px 18px #0008;
}
.aoExploreSurface[data-atlas-mass=true] .aoExploreMapReset{
 top:242px!important;left:12px!important;right:auto!important;
 min-height:44px;border-radius:24px!important;
 background:var(--atlas-glass)!important;border:1px solid var(--atlas-rule)!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoFindResultMeta{
 display:none!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoMapLegend{
 top:310px!important;bottom:auto!important;left:12px!important;
}
.aoExploreSurface[data-atlas-mass=true]>.aoFindExternalSource{
 top:356px!important;bottom:auto!important;right:12px!important;
}
.aoExploreSurface[data-atlas-mass=true] .aoPreliminaryDirectoryNotice{
 top:47px;right:0;max-width:min(300px,70vw);
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailToggle small{
 font:650 9px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.18em;color:var(--atlas-gold);
}
.aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailToggle strong{
 color:#f2e7d3;font:500 21px/1.12 var(--ao-font-display,Georgia,serif);
}
.aoExploreSurface[data-atlas-mass=true] .aoAtlasMassPhotoNotice{
 color:#9b9e9b!important;
 font:italic 10px/1.25 var(--ao-font-display,Georgia,serif)!important;
}
@media(max-width:899px){
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRail{
  display:block!important;position:absolute!important;left:0!important;right:0!important;
  top:auto!important;bottom:0!important;z-index:12!important;
  height:min(46dvh,310px);width:100%;min-height:225px;
  box-sizing:border-box;overflow:hidden;
  border:1px solid #354048;border-bottom:0;border-radius:16px 16px 0 0;
  background:#080d12f9;box-shadow:0 -13px 40px #0009;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRail:before{
  content:"";display:block;position:absolute;top:6px;left:calc(50% - 19px);
  width:38px;height:3px;border-radius:3px;background:#566370;z-index:4;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailDisclosure[open]{
  display:flex;flex-direction:column;min-height:0;height:100%;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailToggle{
  flex:none;min-height:67px;display:flex;justify-content:space-between;align-items:center;
  padding:13px 16px 8px;gap:8px;list-style:none;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailToggle::-webkit-details-marker{display:none}
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailToggle span:first-child{
  display:flex;flex-direction:column;gap:4px;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailCount{
  color:#b3d6c0;font:italic 12px var(--ao-font-display,Georgia,serif);
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailItems{
  min-height:0;flex:1;display:flex;gap:11px;
  overflow-x:auto;overflow-y:hidden;padding:2px 12px 9px;
  scroll-snap-type:x proximity;overscroll-behavior-x:contain;scrollbar-width:none;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailItems>div{
  flex:0 0 min(226px,70vw);min-width:0;scroll-snap-align:start;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailItem{
  width:100%;height:100%;display:flex;flex-direction:column;align-items:stretch;
  gap:0;padding:0;text-align:left;background:#131a21;color:#f0e5d2;
  border:1px solid #56604e;border-radius:13px;overflow:hidden;
  box-sizing:border-box;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailItem[aria-current=true]{
  border-color:#cbaa69;box-shadow:inset 0 0 0 1px #cbaa69;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailVisual{
  display:grid;place-items:center;height:94px;flex:0 0 94px;
  overflow:hidden;background:radial-gradient(ellipse at 50% 20%,#2c343e,#151b22);
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailVisual img{
  max-width:100%;width:100%;height:100%;object-fit:cover;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailVisual[data-visual-kind=emblem] img{
  width:75px;height:75px;object-fit:contain;border-radius:50%;
  background:#131d27;border:2px solid #aab2b6;padding:9px;box-sizing:border-box;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailCopy{
  padding:7px 10px;display:flex;flex:1;flex-direction:column;gap:4px;
  min-width:0;overflow:hidden;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailCopy strong{
  font:500 15px/1.2 var(--ao-font-display,Georgia,serif);
  color:#f0e6d8;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;
  overflow:hidden;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailCopy small{
  color:#bac0bc;font:italic 11px/1.25 var(--ao-font-display,Georgia,serif);
  overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailCopy em{
  color:#a6c9b1;font:11px/1.3 var(--ao-font-display,Georgia,serif);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailArrow{display:none}
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailFoot{
  padding:4px 12px 7px;flex:none;border-top:1px solid #3c453f;
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailFoot small{display:none}
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailFoot button{
  min-height:39px;width:100%;border:1px solid #7c7355;border-radius:8px;
  color:#e3d2ae;background:#1d272e;font:500 12px var(--ao-font-display,Georgia,serif);
 }
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRailEmpty{
  flex:1;color:#c3b7a1;font:italic 12px var(--ao-font-display,Georgia,serif);
 }
 .aoExploreSurface[data-atlas-mass=true] .aoExploreSectionNav{top:280px}
 .aoExploreSurface[data-atlas-mass=true] .aoFindMap .maplibregl-ctrl-top-right{top:114px}
 .aoExploreSurface[data-atlas-mass=true] .aoExploreMapReset{top:242px!important}
 .aoExploreSurface[data-atlas-mass=true] .aoMapLegend{top:304px!important}
 .aoExploreSurface[data-atlas-mass=true]>.aoFindExternalSource{top:348px!important}
}
@media(max-width:365px){
 .aoExploreSurface[data-atlas-mass=true]>.aoAtlasMassTabs button{padding:0 9px;font-size:12px}
 .aoExploreSurface[data-atlas-mass=true] .aoTlmProviderStrip .aoFindAffiliations button{
  font-size:11px;padding-inline:8px;
 }
}
@media(min-width:900px){
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRail{top:185px!important}
 .aoExploreSurface[data-atlas-mass=true] .aoTlmMapRail .aoAtlasMassPhotoNotice{
  display:none;
 }
}
`;
