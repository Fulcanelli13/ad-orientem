// Approved Sacred Atlas prototype screen 7: source-bound desktop arrangement.
// Presentation-only. Preserve canonical MapLibre, contextual layers, Places,
// original sources, Place profile content and TLM CL27 venue classification.
export const EXPLORE_PROTOTYPE_DESKTOP_STYLE = String.raw`
/* Desktop prototype 7: permanent source-backed left results, native MapLibre
   camera in the centre, and the existing canonical Place reader on the right.
   Scope to the Sacred Atlas only; the already-released TLM layout retains its
   own CL27 church-profile owner and no rejected screen-5 redesign is used. */
@media (min-width:900px) {
 .aoHeritageSurface.aoExploreSurface {
  --ao-atlas-left:clamp(254px,25.5vw,368px);
  --ao-atlas-right:clamp(298px,27.8vw,400px);
  --ao-atlas-right-occupied:0px;
  --ao-atlas-map-left:calc(var(--ao-atlas-left) + 28px);
  --ao-atlas-desktop-ink:#efe8dc;
  --ao-atlas-desktop-border:#2b3540;
 }
 .aoHeritageSurface.aoExploreSurface:has(.aoHeritagePreview),
 .aoHeritageSurface.aoExploreSurface:has(.aoExplorePlaceSheet) {
  --ao-atlas-right-occupied:calc(var(--ao-atlas-right) + 15px);
 }
 /* The approved left results panel is a vertical document, not a bottom
    sheet stretched to desktop width. It never remounts or owns the map. */
 .aoHeritageSurface .aoMapcnDiscoverRail,
 .aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnDiscoverRail,
 .aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnDiscoverRail[data-discover-expanded=false] {
  position:absolute!important;
  top:14px!important;bottom:14px!important;left:14px!important;right:auto!important;
  width:var(--ao-atlas-left)!important;height:auto!important;max-height:none!important;
  border:1px solid var(--ao-atlas-desktop-border)!important;
  border-radius:16px!important;background:#0b0e12f8!important;
  box-shadow:0 14px 48px rgba(0,0,0,.45)!important;
  display:flex!important;flex-direction:column;min-height:0;
 }
 /* A deliberate desktop collapse retracts the left folio to its title.
    Default desktop remains expanded, with independently scrollable results. */
 .aoHeritageSurface.aoExploreSurface .aoMapcnDiscoverRail[data-discover-expanded="false"]{
  bottom:auto!important;height:88px!important;max-height:88px!important;
 }
 .aoHeritageSurface .aoMapcnDiscoverHead {padding:18px 14px 13px}
 .aoHeritageSurface .aoMapcnDiscoverTitle {
  font:500 22px/1.15 var(--ao-font-display,Georgia,serif);
  color:var(--ao-atlas-desktop-ink);
 }
 .aoHeritageSurface .aoMapcnEditorialStrip {
  flex:none;min-height:0;max-height:min(34dvh,290px);overflow:hidden;
  border-bottom:1px solid #2b3540;
 }
 /* Screen 7 Sacred Places is a viewport directory, not a worldwide feature reel.
    Keep editorial discovery in Discover and phone sheets unchanged. */
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnEditorialStrip {
  display:none!important;
 }
 .aoHeritageSurface .aoMapcnEditorialHeading {padding:9px 12px 6px}
 .aoHeritageSurface .aoMapcnEditorialCarousel {
  display:flex;flex-direction:column;gap:6px;
  padding:4px 10px 10px;overflow-x:hidden;overflow-y:auto;
  scroll-snap-type:none;max-height:min(25dvh,224px);
 }
 .aoHeritageSurface .aoMapcnEditorialCard,
 .aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialCard {
  box-sizing:border-box;flex:0 0 auto;
  display:flex;flex-direction:row;align-items:stretch;
  width:100%;height:88px;min-height:88px;max-height:88px;
  border-radius:10px;overflow:hidden;background:#11161c;
  border:1px solid #35404b;
 }
 .aoHeritageSurface .aoMapcnEditorialCard img,
 .aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialCard img {
  box-sizing:border-box;flex:none;width:94px;height:100%;
  min-height:0;max-height:none;object-fit:cover;border-radius:0;
 }
 .aoHeritageSurface .aoMapcnEditorialLabel,
 .aoHeritageSurface[data-atlas-entry=sacred] .aoMapcnEditorialLabel {
  display:flex;flex:1;flex-direction:column;justify-content:center;min-width:0;
  padding:8px 10px;gap:4px;
 }
 .aoHeritageSurface .aoMapcnEditorialLabel strong {
  font:500 17px/1.13 var(--ao-font-display,Georgia,serif);
  color:#f0e7d8;overflow-wrap:anywhere;
 }
 .aoHeritageSurface .aoMapcnDiscoverEntries {
  display:block;min-height:0;overflow-y:auto;overscroll-behavior:contain;
  scrollbar-width:thin;scrollbar-color:#73695b transparent;
 }
 /* Screen 7: put the existing canonical subject controls inside the left
    Sacred Places rail. Discover, phone sheets and the TLM drawer are excluded. */
 .aoHeritageSurface[data-atlas-entry="sacred"]:has(.aoMapcnCategoryTabs) .aoHeritageCategories {
  display:none!important;
 }
 .aoHeritageSurface .aoMapcnCategoryTabs {
  display:flex;gap:10px;align-items:center;flex:none;
  padding:12px 13px 10px;overflow-x:auto;overscroll-behavior-x:contain;
  scrollbar-width:thin;border-bottom:1px solid var(--ao-atlas-desktop-border);
 }
 .aoHeritageSurface .aoMapcnCategoryTabs button {
  flex:none;min-height:32px;padding:5px 1px 7px;border:0;
  border-bottom:1px solid transparent;background:transparent;
  color:#b2a89d;font:500 13px/1.2 var(--ao-font-display,Georgia,serif);
 }
 .aoHeritageSurface .aoMapcnCategoryTabs button:is(.active,[aria-pressed="true"]) {
  color:#f2e3c4;border-bottom-color:#c9af75;
 }
 .aoHeritageSurface .aoMapcnCategoryTabs button:focus-visible {
  outline:2px solid #e1c083;outline-offset:2px;
 }
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverEntries {
  padding:8px 10px 12px!important;
 }
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverEntries > [role="listitem"] {
  margin-bottom:10px;
 }
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDesktopPlaceCard {
  align-items:flex-start;width:100%;height:auto;min-height:104px;gap:10px;
  border:1px solid #35414c;border-radius:12px;background:#121820;
  padding:10px!important;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard[aria-current="true"] {
  border-color:#c7ae77;background:#222727;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard > img,
 .aoHeritageSurface .aoMapcnDesktopPlaceCard > .aoSacredPlaceSymbolFallback {
  width:74px!important;height:76px!important;flex:0 0 74px!important;
  border-radius:9px;object-fit:cover;margin:0;overflow:hidden;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard > .aoSacredPlaceSymbolFallback
 .aoSacredPlaceSymbolPlate {
  width:100%!important;height:100%!important;min-height:0!important;
  box-sizing:border-box;display:grid;place-items:center;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard > .aoSacredPlaceSymbolFallback svg {
  width:60px;height:60px;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard > .aoSacredPlaceSymbolFallback figcaption {
  display:none;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard .aoMapcnDiscoverCopy {
  min-width:0;display:flex;flex:1;flex-direction:column;gap:4px;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard .aoMapcnDiscoverCopy > strong {
  font-size:17px;line-height:1.15;
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard .aoMapcnPlaceSynopsis {
  display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;
  overflow:hidden;color:#d8cfc2;font:400 13px/1.35 var(--ao-font-body,Georgia,serif);
 }
 .aoHeritageSurface .aoMapcnDesktopPlaceCard .aoMapcnDiscoverArrow {
  margin-left:0;
 }

 .aoHeritageSurface .aoMapcnDiscoverItem {
  min-height:75px;gap:9px;padding:10px 12px;
 }
 .aoHeritageSurface .aoMapcnDiscoverItem>img,
 .aoHeritageSurface .aoMapcnDiscoverGlyph {
  width:62px;height:62px;flex:none;
 }
 .aoHeritageSurface .aoMapcnDiscoverCopy>strong {font-size:17px}
 /* Search, the three approved entrances and the category ribbon all belong
    to the EXPOSED centre map, never above the left results rail. */
 .aoHeritageSurface .aoHeritageTools {
  position:absolute!important;top:14px!important;right:auto!important;
  left:var(--ao-atlas-map-left)!important;
  width:min(520px,calc(100% - var(--ao-atlas-left) - var(--ao-atlas-right-occupied) - 62px))!important;
  max-width:none!important;margin:0!important;
 }
 .aoHeritageSurface .aoAtlasPrimaryTabs {
  position:absolute;top:76px!important;left:var(--ao-atlas-map-left)!important;
  max-width:calc(100% - var(--ao-atlas-left) - var(--ao-atlas-right-occupied) - 58px)!important;
 }
 .aoHeritageSurface .aoHeritageCategories {
  top:137px!important;left:var(--ao-atlas-map-left)!important;right:auto!important;
  max-width:calc(100% - var(--ao-atlas-left) - var(--ao-atlas-right-occupied) - 56px)!important;
 }
 .aoHeritageSurface .aoHeritageSearchResults {
  top:189px!important;left:var(--ao-atlas-map-left)!important;right:auto!important;
  width:min(450px,calc(100% - var(--ao-atlas-left) - var(--ao-atlas-right-occupied) - 60px))!important;
 }
 .aoHeritageSurface .aoHeritageMore {
  position:absolute!important;top:201px!important;
  right:calc(var(--ao-atlas-right-occupied) + 13px)!important;
  left:auto!important;
 }
 .aoHeritageSurface .aoFindBody .maplibregl-top-right,
 .aoHeritageSurface .aoFindBody .maplibregl-ctrl-top-right {
  top:135px!important;right:calc(var(--ao-atlas-right-occupied) + 9px)!important;
 }
 /* Approved desktop map-controls stack: keep controls at the map edge
    below the primary tabs and above Nearby, even with the right folio open.
    Native MapLibre zoom, fullscreen and attribution retain their owners. */
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoFindBody .maplibregl-top-right,
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoFindBody .maplibregl-ctrl-top-right {
  top:auto!important;bottom:148px!important;
  right:calc(var(--ao-atlas-right-occupied) + 10px)!important;
 }
 /* Keep the existing Layers control at its verified top-right position:
    its header-owned positioning context does not support bottom docking. */
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoHeritageWorldReset {
  top:auto!important;bottom:348px!important;
  left:auto!important;right:calc(var(--ao-atlas-right-occupied) + 13px)!important;
 }
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoFindMap
 :is(.maplibregl-ctrl-zoom-in,.maplibregl-ctrl-zoom-out,.maplibregl-ctrl-fullscreen) {
  min-width:44px;min-height:44px;
 }

 .aoHeritageSurface .aoHeritageWorldReset {
  position:absolute;left:var(--ao-atlas-map-left)!important;
  top:215px!important;right:auto!important;bottom:auto!important;
 }
 .aoHeritageSurface .aoHeritageNearby {
  right:calc(var(--ao-atlas-right-occupied) + 13px)!important;
  bottom:86px!important;
 }
 .aoHeritageSurface .aoHeritageMapHint {
  left:var(--ao-atlas-map-left)!important;bottom:20px!important;
  max-width:calc(100% - var(--ao-atlas-left) - var(--ao-atlas-right-occupied) - 50px);
 }
 /* Keep the original lightweight right preview, with the approved photo.
    The visitor can expand it into the complete existing source folio. */
 .aoHeritageSurface .aoHeritageCardLayer {
  position:absolute!important;inset:0!important;z-index:16;
  pointer-events:none!important;justify-content:flex-end!important;
  align-items:flex-start!important;padding:14px!important;
  background:transparent!important;box-sizing:border-box!important;
 }
 .aoHeritageSurface .aoHeritagePreview {
  pointer-events:auto!important;box-sizing:border-box!important;
  width:var(--ao-atlas-right)!important;max-width:var(--ao-atlas-right)!important;
  max-height:calc(100dvh - 28px)!important;
  margin:0!important;padding:14px 16px 20px!important;
  border:1px solid var(--ao-atlas-desktop-border)!important;
  border-radius:16px!important;background:#0b0e12fa!important;
  color:#efe8dc;box-shadow:0 14px 45px rgba(0,0,0,.48);
  overflow-y:auto!important;overscroll-behavior:contain;
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img {
  width:100%;max-height:none;height:min(28dvh,240px);
 }
 /* Full Place reader is a right-hand DOCK, not an opaque full-screen
    backdrop. The centre map and left results remain independently usable. */
 .aoHeritageSurface>.aoFindSheetBackdrop:has(.aoExplorePlaceSheet) {
  position:absolute!important;inset:0!important;z-index:19!important;
  box-sizing:border-box!important;display:flex!important;
  align-items:stretch!important;justify-content:flex-end!important;
  padding:14px!important;background:transparent!important;
  pointer-events:none!important;
 }
 .aoHeritageSurface>.aoFindSheetBackdrop:has(.aoExplorePlaceSheet) .aoExplorePlaceSheet {
  pointer-events:auto!important;position:relative!important;
  width:var(--ao-atlas-right)!important;min-width:0!important;
  max-width:var(--ao-atlas-right)!important;height:100%!important;
  max-height:100%!important;min-height:0!important;
  margin:0!important;padding:0 0 20px!important;
  box-sizing:border-box!important;overflow-x:hidden!important;overflow-y:auto!important;
  overscroll-behavior:contain;border-radius:16px!important;
  border:1px solid var(--ao-atlas-desktop-border)!important;
  background:#0b0e12fa!important;box-shadow:0 14px 50px rgba(0,0,0,.5)!important;
 }
 .aoHeritageSurface .aoExplorePlaceSheet>.aoExplorePlaceMedia img {
  height:220px!important;
 }
 .aoHeritageSurface .aoExplorePlaceSheet>header h2 {
  font-size:clamp(24px,2.2vw,33px)!important;
 }
 .aoHeritageSurface .aoExplorePlaceSheet .aoAtlasPlaceSummary {
  padding-left:17px!important;padding-right:17px!important;
 }
 .aoHeritageSurface .aoExplorePlaceSheet .aoAtlasPlaceConnections {
  margin-left:17px!important;margin-right:17px!important;
 }
 .aoHeritageSurface :is(.aoMapcnDiscoverRail,.aoHeritagePreview,.aoExplorePlaceSheet)
  :is(button,a):focus-visible {
  outline:2px solid #e1c083;outline-offset:-3px;
 }
}
`;
