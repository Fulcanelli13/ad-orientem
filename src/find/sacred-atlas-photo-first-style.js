// Atlas R1: map remains a usable surface; photography is an exact approved
// Place identity, not a decorative crop. Appended after existing style layers.
// No new visual owner, Place data, photo approval or navigation state.
export const SACRED_ATLAS_PHOTO_FIRST_STYLE = String.raw`
/* Legible first-action typography: this is a search input, not a painting
   caption. Maintain the deliberately restrained dark palette. */
.aoHeritageSurface .aoHeritageTools .aoFindSearch input{
 font:500 16px/1.25 var(--ao-font-ui,system-ui,sans-serif)!important;
 letter-spacing:0!important;font-style:normal!important;
 color:#f3ebdf!important;
}
.aoHeritageSurface .aoHeritageTools .aoFindSearch input::placeholder{
 color:#d6c7af!important;opacity:1!important;font-style:normal!important;
}
/* Sacred Atlas browsing is not coloured by the liturgical day's Mass
   vestment. One accessible gold primary action anchors the Place card. */
.aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreviewActions button:first-child{
 background:#d0b783!important;color:#0a1520!important;
 border-color:#d0b783!important;font-weight:700!important;
}
.aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreviewActions button:first-child:focus-visible{
 outline:2px solid #f5e6bf;outline-offset:2px;
}
/* The former Sacred Places "closed" discover drawer consumed 43dvh.
   Its aria-expanded=false and data-discover-expanded=false state must
   genuinely leave the map visible; expanded remains an explicit action. */
@media(max-width:799px){
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail[data-discover-expanded="false"]{
   height:calc(76px + env(safe-area-inset-bottom))!important;
   min-height:calc(76px + env(safe-area-inset-bottom))!important;
   max-height:calc(76px + env(safe-area-inset-bottom))!important;
   padding-bottom:env(safe-area-inset-bottom)!important;
   overflow:hidden;
 }
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverRail[data-discover-expanded="true"]{
   height:min(48dvh,420px)!important;
   max-height:min(48dvh,420px)!important;
   min-height:0!important;
 }
 .aoHeritageSurface[data-atlas-entry="sacred"] .aoMapcnDiscoverToggle{
   min-height:72px;
 }
 /* A real licensed photograph is more important than a large generic frame.
    The short two-column peek keeps the map visible beneath the sheet. */
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview:has(.aoHeritagePlaceThumb img){
   display:grid;
   grid-template-columns:minmax(112px,43%) minmax(0,1fr);
   column-gap:12px;row-gap:6px;
   max-height:min(49dvh,425px)!important;
   overflow-y:auto;overflow-x:hidden;
   padding:9px 13px calc(13px + env(safe-area-inset-bottom));
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb:not(.aoSacredPlaceSymbolFallback){
   grid-column:1;grid-row:2/span 3;
   display:block;float:none;width:100%;max-width:100%;
   margin:0!important;padding:0;
   border:1px solid rgba(213,189,142,.24);border-radius:8px;
   overflow:hidden;background:#0a141e;
   align-self:start;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb:not(.aoSacredPlaceSymbolFallback) img{
   display:block;width:100%;height:clamp(132px,21dvh,195px)!important;
   object-fit:contain!important;object-position:center;
   background:#07111b;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb:not(.aoSacredPlaceSymbolFallback) figcaption{
   display:block!important;max-height:3.2em;overflow:hidden;
   padding:5px 7px;background:#101b23;color:#c2b49a;
   font:10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
   overflow-wrap:anywhere;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageCardHeading{
   grid-column:2;grid-row:2;padding-right:38px;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageCardTitle{
   grid-column:2;grid-row:3;margin:0;
   display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;
   overflow:hidden;font-size:clamp(18px,4.9vw,23px);
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageSynopsis,
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageCardEmpty{
   grid-column:2;grid-row:4;margin:0;
   display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;
   overflow:hidden;font-size:13px;line-height:1.42;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePreviewActions{
   grid-column:1/-1;grid-row:5;margin-top:5px;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageFeastLink{
   grid-column:1/-1;grid-row:6;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePrecision{
   grid-column:1/-1;
 }
}
@media(max-width:359px){
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview:has(.aoHeritagePlaceThumb img){
   grid-template-columns:minmax(112px,42%) minmax(0,1fr);
   column-gap:9px;padding-inline:9px;
 }
 .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageCardTitle{
   font-size:18px;
 }
}
/* Preserve the original full-frame photograph in both the preview and
   expanded reader. The credits must not mask the actual image. */
.aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img,
.aoHeritageSurface .aoExplorePlaceSheet>.aoExplorePlaceMedia img{
 object-fit:contain!important;object-position:center!important;
 background:#08121a;
}
.aoHeritageSurface .aoExplorePlaceSheet>.aoExplorePlaceMedia figcaption{
 position:static!important;display:block!important;
 max-width:none!important;margin:0!important;
 border-top:1px solid rgba(213,189,142,.22);
 border-radius:0!important;background:#101c25!important;
 padding:9px 11px!important;color:#d0bea2;
 font:11px/1.48 var(--ao-font-ui,system-ui,sans-serif);
 overflow-wrap:anywhere;
}
.aoHeritageSurface .aoExplorePlaceSheet>.aoExplorePlaceMedia figcaption a{
 display:inline-flex;align-items:center;min-height:27px;
 text-decoration:underline;text-underline-offset:2px;
}
@media(min-width:800px){
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb:not(.aoSacredPlaceSymbolFallback) img{
   object-fit:contain!important;background:#08121a;
 }
}
`;
