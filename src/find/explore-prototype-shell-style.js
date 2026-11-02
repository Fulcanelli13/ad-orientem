// Approved Sacred Atlas prototype (screens 1, 2 and shared map shell).
// Deliberately presentation-only: retain canonical MapLibre, Place folios,
// approved photographs, original navigation actions and source-scoped filters.
// Screen 5 Venue Profile was rejected; no change to that surface.
export const EXPLORE_PROTOTYPE_SHELL_STYLE = String.raw`
.aoHeritageSurface.aoExploreSurface {
  --atlas-proto-glass:rgba(7,12,18,.94);
  --atlas-proto-line:#35404b;
  --atlas-proto-gold:#c3a66b;
  --atlas-proto-ink:#ebe3d5;
  background:#080c12;
}
.aoHeritageSurface .aoFindHeader {
  position:absolute!important;inset:0 0 auto!important;
  height:0!important;min-height:0!important;padding:0!important;
  border:0!important;display:block!important;background:transparent!important;
  overflow:visible;z-index:16;
}
.aoHeritageSurface .aoFindHeader>div:first-of-type{display:none}
.aoHeritageSurface .aoFindHeader>button[data-find-close]{
  position:absolute;top:13px;right:12px;left:auto;
  width:43px;height:43px;min-height:43px;border-radius:50%;
  color:#e6d8bd;background:var(--atlas-proto-glass);border:1px solid var(--atlas-proto-line);
  box-shadow:0 4px 20px #0008;
}
.aoHeritageSurface .aoHeritageTools{
  position:absolute!important;top:11px!important;left:12px!important;
  right:69px!important;width:auto!important;max-width:none!important;
  z-index:14!important;box-shadow:none!important;
}
.aoHeritageSurface .aoHeritageTools .aoFindSearch{position:relative}
.aoHeritageSurface .aoHeritageTools .aoFindSearch:before{
  content:"⌕";top:8px;left:14px;font-size:25px;
  color:var(--atlas-proto-gold);
}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{
  height:46px;min-height:46px;width:100%;border-radius:26px!important;
  border:1px solid var(--atlas-proto-line)!important;
  background:var(--atlas-proto-glass)!important;
  box-shadow:0 8px 25px #0007!important;
  padding:9px 14px 9px 40px!important;
  font:italic 16px/1.2 var(--ao-font-display,Georgia,serif)!important;
  color:var(--atlas-proto-ink)!important;
}
.aoHeritageSurface .aoAtlasPrimaryTabs{
  position:absolute;z-index:13;top:67px;left:12px;
  display:flex;align-items:center;gap:2px;width:max-content;max-width:calc(100% - 24px);
  padding:4px;border:1px solid var(--atlas-proto-line);border-radius:24px;
  background:var(--atlas-proto-glass);backdrop-filter:blur(10px);
}
.aoHeritageSurface .aoAtlasPrimaryTabs button,
.aoHeritageSurface .aoAtlasPrimaryTabs .aoHeritageMassShortcut{
  display:inline-flex;align-items:center;justify-content:center;
  white-space:nowrap;flex:none;min-height:34px;height:34px;
  padding:0 13px;border:1px solid transparent;border-radius:19px;
  color:#d5cabb;background:transparent;
  font:500 14px/1 var(--ao-font-display,Georgia,serif);
  cursor:pointer;box-shadow:none;
}
.aoHeritageSurface .aoAtlasPrimaryTabs button.active,
.aoHeritageSurface .aoAtlasPrimaryTabs button[aria-pressed=true]{
  color:#f4e5cf;background:#26323c;border-color:#a4a6a355;
}
.aoHeritageSurface .aoAtlasPrimaryTabs button:focus-visible{
  outline:2px solid #d3b781;outline-offset:2px;
}
.aoHeritageSurface .aoHeritageMore{
  position:fixed!important;top:307px;right:12px;
  left:auto;z-index:17;
}
.aoHeritageSurface .aoHeritageMore>summary{
  display:flex;align-items:center;justify-content:center;
  width:44px!important;height:44px!important;min-height:44px!important;
  padding:0!important;overflow:hidden;border-radius:50%!important;
  border:1px solid var(--atlas-proto-line)!important;
  background:var(--atlas-proto-glass)!important;
  color:#d6c6a8!important;font-size:0!important;list-style:none;
}
.aoHeritageSurface .aoHeritageMore>summary::marker,
.aoHeritageSurface .aoHeritageMore>summary::-webkit-details-marker{display:none}
.aoHeritageSurface .aoHeritageMore>summary:after{
  content:"◇";font:28px/1 var(--ao-font-display,Georgia,serif);
  color:#d6c6a8;
}
.aoHeritageSurface .aoHeritageMore>div{
  position:absolute;right:0;left:auto;top:52px;width:min(290px,calc(100vw - 24px));
  max-height:min(56dvh,470px);overflow:auto;z-index:30;
  border-radius:14px;border:1px solid #6e614c;
}
.aoHeritageSurface .aoHeritageCategories{
  top:120px!important;left:12px!important;right:auto!important;
  max-width:calc(100% - 78px)!important;
  gap:4px!important;padding:0!important;
}
.aoHeritageSurface[data-atlas-entry=discover] .aoHeritageCategories{display:none!important}
.aoHeritageSurface .aoHeritageCategories button{
  height:36px!important;min-height:36px!important;border-radius:20px!important;
  font:500 12px var(--ao-font-display,Georgia,serif)!important;
  padding:8px 11px!important;background:var(--atlas-proto-glass)!important;
}
.aoHeritageSurface .aoHeritageCategories button.active{
  background:#28363e!important;color:#f1ddbb!important;border-color:#9b865c!important;
}
.aoHeritageSurface .aoFindBody .maplibregl-top-right{
  top:163px;right:12px;
}
.aoHeritageSurface .aoFindBody .maplibregl-ctrl-top-right,
.aoHeritageSurface .aoFindBody .maplibregl-ctrl-group{
  background:transparent;box-shadow:none;
}
.aoHeritageSurface .aoFindBody .maplibregl-ctrl-top-right button,
.aoHeritageSurface .aoFindBody .maplibregl-ctrl-group button{
  width:44px;height:44px;border-radius:50%;margin-bottom:7px;
  background:var(--atlas-proto-glass);border:1px solid var(--atlas-proto-line);
  color:#e1d3bb;box-shadow:0 4px 18px #0006;
}
.aoHeritageSurface .aoHeritageWorldReset{
  left:auto!important;right:12px!important;top:368px!important;
  width:44px!important;height:44px!important;min-width:44px!important;max-width:44px!important;
  border-radius:50%!important;background:var(--atlas-proto-glass)!important;
  border:1px solid var(--atlas-proto-line)!important;
}
.aoHeritageSurface .aoHeritageNearby{
  right:12px!important;bottom:calc(94px + env(safe-area-inset-bottom))!important;
  border-radius:25px!important;font-size:12px;
  background:var(--atlas-proto-glass)!important;
}
.aoHeritageSurface .aoHeritageMapHint{display:none}
.aoHeritageSurface .aoHeritageSearchResults{
  top:119px!important;left:12px!important;
  width:min(440px,calc(100% - 24px))!important;
  border-color:var(--atlas-proto-line);
}
.aoHeritageSurface .aoMapcnDiscoverRail{
  background:rgba(8,12,18,.98);
  border:1px solid #323a43;border-radius:16px 16px 0 0;
  box-shadow:0 -10px 36px #0008;
}
.aoHeritageSurface .aoMapcnDiscoverRail:before{
  content:"";display:block;position:absolute;left:calc(50% - 19px);top:6px;
  width:38px;height:3px;border-radius:3px;background:#4c5961;z-index:2;
}
.aoHeritageSurface .aoMapcnDiscoverToggle{padding-top:14px}
.aoHeritageSurface .aoMapcnDiscoverHeading small{
  color:var(--atlas-proto-gold);font:600 10px/1.2 var(--ao-font-display,Georgia,serif);
  letter-spacing:.12em;
}
.aoHeritageSurface .aoMapcnDiscoverTitle{
  color:#f0e8d8;font:500 20px/1.12 var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface .aoMapcnDiscoverCount{
  color:#bfb1a0;border:0;padding:0;font:italic 13px var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnDiscoverRail{
  height:min(52dvh,440px)!important;max-height:min(52dvh,440px)!important;
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnDiscoverRail[data-discover-expanded=false]{
  height:min(52dvh,440px)!important;
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialCarousel{gap:11px}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialCard{
  flex:0 0 min(220px,67vw);display:flex;flex-direction:column;align-items:stretch;gap:0;
  min-height:220px;padding:0;background:#111923;border-radius:12px;
  border:1px solid #aa8f6066;overflow:hidden;
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialCard img{
  display:block;width:100%;height:125px;border-radius:0;object-fit:cover;
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialLabel{
  padding:11px 12px;gap:7px;
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialLabel strong{
  font:500 17px/1.12 var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialLabel small{
  font:italic 13px/1.3 var(--ao-font-display,Georgia,serif);
}
@media(max-width:799px){
  .aoHeritageSurface .aoMapcnDiscoverRail{left:0!important;right:0!important;bottom:0!important;width:100%!important}
  .aoHeritageSurface[data-atlas-entry=discover] .aoMapcnDiscoverRail[data-discover-expanded=false]{
    height:80px!important;min-height:80px!important;padding-bottom:env(safe-area-inset-bottom)!important;
    left:0!important;right:0!important;width:100%!important;bottom:0!important;
    border-radius:16px 16px 0 0;
  }
  .aoHeritageSurface .aoAtlasPrimaryTabs button,
  .aoHeritageSurface .aoAtlasPrimaryTabs .aoHeritageMassShortcut{
    font-size:13px;padding:0 10px;
  }
  .aoHeritageSurface .aoHeritageMore{top:298px}
  .aoHeritageSurface .aoHeritageWorldReset{top:356px!important}
  .aoHeritageSurface .aoHeritageNearby{bottom:calc(98px + env(safe-area-inset-bottom))!important}
}
@media(min-width:800px){
  .aoHeritageSurface .aoHeritageTools{width:min(370px,calc(100% - 90px))!important;right:auto!important}
  .aoHeritageSurface .aoMapcnDiscoverRail{border-radius:13px;bottom:13px}
  .aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnDiscoverRail{
    height:min(57dvh,500px)!important;max-height:min(57dvh,500px)!important;
  }
}
@media(prefers-reduced-motion:reduce){
  .aoHeritageSurface .aoMapcnDiscoverRail{transition:none!important}
}
`;
