// Approved Sacred Atlas prototype screen 3: Place profile only.
// Source data, captions, and original folio chapters remain unchanged.
export const EXPLORE_PROTOTYPE_PLACE_STYLE = `
.aoExplorePlaceSheet {
  position:relative;box-sizing:border-box;
  background:#090d12;color:#eee7dc;
}
.aoExplorePlaceSheet>header {
  border:0!important;background:transparent!important;
  padding:0 16px 10px!important;margin:0!important;
}
.aoExplorePlaceSheet>header:after{display:none!important}
.aoExplorePlaceSheet>header h2 {
  font:500 clamp(27px,6.4vw,35px)/1.1 var(--ao-font-display,Georgia,serif)!important;
  letter-spacing:-.02em!important;color:#f0e7d6;
  max-width:700px;margin:7px 0!important;
}
.aoExplorePlaceSheet>header small {
  color:#cdb278!important;letter-spacing:.16em!important;
  font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif)!important;
  text-transform:uppercase;
}
.aoExplorePlaceSheet>header p{
  margin:0!important;color:#c9bfb1!important;
  font:italic 15px/1.3 var(--ao-font-display,Georgia,serif)!important;
}
.aoExplorePlaceSheet>header button[data-find-close-place]{
  position:absolute;top:18px;right:16px;z-index:8;
  width:44px;min-width:44px;height:44px;min-height:44px;
  border-radius:50%;background:rgba(9,15,22,.9);
  color:#e4d5b9;border:1px solid #55564d;
}
.aoExplorePlaceSheet>.aoExploreFullBack {
  position:absolute;left:16px;top:18px;z-index:8;
  margin:0;padding:0;border:0;
}
.aoExplorePlaceSheet>.aoExploreFullBack button{
  width:44px;min-width:44px;height:44px;min-height:44px;
  border-radius:50%;font-size:0!important;line-height:1;
  background:rgba(9,15,22,.88);border:1px solid #55564d;
  color:#eee1cc;padding:0;
}
.aoExplorePlaceSheet>.aoExploreFullBack button:before{
  content:"‹";font:32px/1 var(--ao-font-display,Georgia,serif);
}
.aoExplorePlaceSheet>.aoExplorePlaceMedia{
  position:relative;margin:0 0 13px!important;
  border:0!important;border-radius:14px!important;
  background:#151d25;overflow:hidden;
  flex:none;
}
.aoExplorePlaceSheet>.aoExplorePlaceMedia img{
  width:100%;height:210px;max-height:none!important;
  object-fit:cover;display:block;
}
.aoExplorePlaceSheet>.aoExplorePlaceMedia figcaption{
  position:absolute;right:9px;bottom:9px;max-width:calc(100% - 18px);
  padding:5px 8px;border-radius:4px;
  background:#060b10da;color:#cbbdaa;font:10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
}
.aoExplorePlaceSheet>.aoExplorePlaceMedia figcaption a{color:#e2c58c}
.aoExplorePlaceSheet .aoAtlasPlaceSummary{
  margin:0;padding:0 16px 4px;
}
.aoExplorePlaceSheet .aoAtlasPlaceTags{
  display:flex;flex-wrap:wrap;align-items:center;gap:12px;
  margin:0 0 12px;
}
.aoExplorePlaceSheet .aoAtlasPlaceTags span{
  color:#cbb586;font:500 12px/1.3 var(--ao-font-display,Georgia,serif);
  white-space:nowrap;
}
.aoExplorePlaceSheet .aoAtlasPlaceTags span+span:before{
  content:"✣";margin-right:12px;color:#a69b7a;font-size:11px;
}
.aoExplorePlaceSheet .aoAtlasPlaceSynopsis{
  margin:0 0 20px;color:#f2e7d8;
  font:500 16px/1.65 var(--ao-font-display,Georgia,serif);
}
.aoExplorePlaceSheet .aoAtlasPlaceGlance,
.aoExplorePlaceSheet .aoAtlasPlaceConnections{
  margin:6px 0 16px;padding:0;border:0;background:transparent;
}
.aoExplorePlaceSheet .aoAtlasPlaceGlance>h3,
.aoExplorePlaceSheet .aoAtlasPlaceConnections>small{
  display:block;margin:0 0 11px;color:#caa867;
  font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.16em;text-transform:uppercase;
}
.aoExplorePlaceSheet .aoAtlasPlaceGlanceRow,
.aoExplorePlaceSheet .aoAtlasPlaceConnections .aoExplorePlaceRow{
  display:flex;align-items:center;justify-content:space-between;
  gap:9px;width:100%;min-height:60px;margin:0;padding:12px 0;
  border:0;border-bottom:1px solid #38434d;
  border-radius:0;background:transparent;text-align:left;
  color:#e9e1d4;
}
.aoExplorePlaceSheet .aoAtlasPlaceGlanceRow strong,
.aoExplorePlaceSheet .aoAtlasPlaceConnections .aoExplorePlaceRow strong{
  display:block;font:500 15px/1.3 var(--ao-font-display,Georgia,serif);
}
.aoExplorePlaceSheet .aoAtlasPlaceGlanceRow small,
.aoExplorePlaceSheet .aoAtlasPlaceConnections .aoExplorePlaceRow small{
  display:block;margin-top:4px;color:#9aa2aa;
  font:italic 12px/1.3 var(--ao-font-display,Georgia,serif);
}
.aoExplorePlaceSheet .aoAtlasPlaceGlanceRow button{
  min-height:44px;min-width:75px;flex:none;
  color:#d1b47b;background:transparent;border:0;text-align:right;
  font:500 13px/1.3 var(--ao-font-display,Georgia,serif);
}
.aoExplorePlaceSheet .aoAtlasPlaceConnections{margin:6px 16px 17px}
.aoExplorePlaceSheet .aoAtlasPlaceConnections .aoExplorePlaceRows{padding:0;margin:0}
.aoExplorePlaceSheet .aoAtlasPlaceConnections .aoExplorePlaceRow{
  min-height:68px!important;
}
.aoExplorePlaceSheet .aoAtlasPlaceConnections .aoExplorePlaceRow:after{
  content:"›";font:24px/1 var(--ao-font-display,Georgia,serif);color:#c4a875;
}
@media(max-width:799px){
  .aoExplorePlaceSheet{padding-top:8px!important}
  .aoExplorePlaceSheet>.aoExplorePlaceMedia{margin-inline:0!important}
  .aoExplorePlaceSheet>.aoExplorePlaceMedia img{height:210px!important}
  .aoExplorePlaceSheet .aoAtlasPlaceSynopsis{font-size:16px}
}
@media(min-width:800px){
  .aoExplorePlaceSheet>.aoExplorePlaceMedia img{height:250px!important}
  .aoExplorePlaceSheet .aoAtlasPlaceSummary{padding-left:22px;padding-right:22px}
  .aoExplorePlaceSheet .aoAtlasPlaceConnections{margin-left:22px;margin-right:22px}
}
`;
