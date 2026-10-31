// Focused override applied after the existing Explore styles.
// Preserve source-backed Place cards, map attribution, and the established tokens.
export const EXPLORE_MAP_FIRST_V2_STYLE = `
/* The primary chip row is now reserved for actual Place categories. */
.aoHeritageSurface .aoHeritageCategories{
  max-width:min(600px,calc(100% - 36px));
  gap:7px;
}
.aoHeritageSurface .aoHeritageCategories button{
  font:600 12px/1.15 var(--ao-font-ui,system-ui,sans-serif);
  border-radius:999px;
  padding-inline:13px;
}
.aoHeritageSurface .aoHeritageMore>div{
  max-height:min(75dvh,550px);
  box-shadow:0 22px 55px #000c;
  border-color:var(--ao-rule,rgba(217,197,154,.3));
}
.aoHeritageSurface .aoHeritageMore[open] summary{
  border-color:var(--ao-liturgical-border,rgba(217,197,154,.55));
}
/* A compact overview remains available without covering the map itself. */
.aoHeritageSurface .aoMapcnDiscoverRail{
  top:auto;left:16px;bottom:14px;
  width:min(320px,calc(100% - 32px));
  height:min(62dvh,480px);
  max-height:calc(100dvh - 220px);
  border-radius:13px;
  transition:height .18s ease;
}
.aoHeritageSurface .aoMapcnDiscoverRail[data-discover-expanded="false"]{
  height:68px;min-height:68px;
}
.aoHeritageSurface .aoMapcnDiscoverHead{padding:0;display:block;border-bottom:1px solid #a18c6038}
.aoHeritageSurface .aoMapcnDiscoverToggle{
  color:inherit;background:transparent;border:0;
  display:flex;align-items:center;gap:11px;
  width:100%;min-height:66px;padding:9px 14px;text-align:left;
  font:600 12px/1.25 var(--ao-font-ui,system-ui,sans-serif);
  cursor:pointer;
}
.aoHeritageSurface .aoMapcnDiscoverToggle:focus-visible{
  outline:2px solid var(--ao-liturgical-border,#d9c59a);
  outline-offset:-3px;
}
.aoHeritageSurface .aoMapcnDiscoverHeading{display:grid;gap:3px;min-width:0;flex:1}
.aoHeritageSurface .aoMapcnDiscoverHeading small{
  font:600 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.11em;color:#bca57b;
}
.aoHeritageSurface .aoMapcnDiscoverTitle{
  font:500 21px/1.15 var(--ao-font-display,Georgia,serif);
  color:var(--ao-text-primary,#efe7d4);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.aoHeritageSurface .aoMapcnDiscoverCount{
  border:1px solid rgba(217,197,154,.23);
  border-radius:30px;padding:4px 9px;min-width:32px;text-align:center;
  font:600 13px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:#dcc9a3;
}
.aoHeritageSurface .aoMapcnDiscoverChevron{font-size:20px;color:#d8c39d;transition:transform .2s ease}
.aoHeritageSurface .aoMapcnDiscoverRail[data-discover-expanded="false"] .aoMapcnDiscoverChevron{transform:rotate(180deg)}
.aoHeritageSurface .aoMapcnDiscoverRail[data-discover-expanded="false"] .aoMapcnDiscoverEntries,
.aoHeritageSurface .aoMapcnDiscoverRail[data-discover-expanded="false"] .aoMapcnDiscoverFoot{display:none}
.aoHeritageSurface .aoMapcnDiscoverEmpty{
  color:#b9c4c8;padding:20px 15px;margin:0;
  font:13px/1.5 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoMapcnDiscoverRail[data-discover-expanded="false"] .aoMapcnEditorialStrip{display:none}
.aoHeritageSurface .aoMapcnEditorialStrip{
  flex:none;padding:11px 12px 12px;
  border-bottom:1px solid rgba(201,174,121,.25);
  background:linear-gradient(145deg,rgba(201,174,121,.07),transparent 75%);
}
.aoHeritageSurface .aoMapcnEditorialHeading{
  display:flex;align-items:baseline;justify-content:space-between;
  gap:7px;margin-bottom:8px;
}
.aoHeritageSurface .aoMapcnEditorialHeading span{
  color:#dec38f;letter-spacing:.11em;
  font:700 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoMapcnEditorialHeading small{
  color:#a5b4b8;font:10px/1.2 var(--ao-font-ui,system-ui,sans-serif);
}
.aoHeritageSurface .aoMapcnEditorialCarousel{
  display:flex;gap:8px;min-width:0;overflow-x:auto;
  padding-bottom:2px;overscroll-behavior-x:contain;scroll-snap-type:x proximity;
  scrollbar-width:thin;scrollbar-color:#7d6d51 transparent;
}
.aoHeritageSurface .aoMapcnEditorialCard{
  flex:0 0 238px;display:flex;align-items:stretch;gap:9px;
  min-height:80px;padding:5px;
  text-align:left;color:#efe6d3;background:#1a2933;
  border:1px solid rgba(201,174,121,.24);border-radius:10px;
  scroll-snap-align:start;cursor:pointer;
}
.aoHeritageSurface .aoMapcnEditorialCard:hover,
.aoHeritageSurface .aoMapcnEditorialCard[aria-current="true"]{
  background:#263940;border-color:rgba(201,174,121,.75);
}
.aoHeritageSurface .aoMapcnEditorialCard:focus-visible{
  outline:2px solid var(--ao-liturgical-accent,#d9c59a);outline-offset:-3px;
}
.aoHeritageSurface .aoMapcnEditorialCard img{
  display:block;width:88px;height:76px;flex:none;
  object-fit:cover;background:#15232d;border-radius:7px;
}
.aoHeritageSurface .aoMapcnEditorialCard img[data-photo-orientation="portrait"]{
  object-fit:contain;
}
.aoHeritageSurface .aoMapcnEditorialLabel{
  display:flex;flex-direction:column;justify-content:center;gap:5px;
  min-width:0;overflow:hidden;
}
.aoHeritageSurface .aoMapcnEditorialLabel strong{
  color:#f0e3cc;font:500 14px/1.18 var(--ao-font-display,Georgia,serif);
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;
}
.aoHeritageSurface .aoMapcnEditorialLabel small{
  color:#9aadb1;font:11px/1.28 var(--ao-font-ui,system-ui,sans-serif);
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden;
}

.aoHeritageSurface .aoMapcnDiscoverItem>img{
  object-fit:cover;
}
@media(max-width:799px){
  .aoHeritageSurface .aoHeritageCategories{
    max-width:calc(100% - 20px);
    padding-right:16px;
    scroll-snap-type:x proximity;
  }
  .aoHeritageSurface .aoHeritageCategories button{min-height:44px}
  .aoHeritageSurface .aoMapcnDiscoverRail{
    bottom:0;left:0;right:0;width:100%;
    height:min(48dvh,390px);max-height:min(48dvh,390px);
    border-radius:17px 17px 0 0;
    padding-bottom:env(safe-area-inset-bottom);
  }
  .aoHeritageSurface .aoMapcnDiscoverRail[data-discover-expanded="false"]{
    bottom:calc(10px + env(safe-area-inset-bottom));
    left:10px;right:10px;width:calc(100% - 20px);
    height:66px;min-height:66px;
    border-radius:13px;padding-bottom:0;
  }
  .aoHeritageSurface .aoMapcnDiscoverToggle{min-height:64px;padding:8px 13px}
  .aoHeritageSurface .aoMapcnDiscoverTitle{font-size:19px}
  .aoHeritageSurface:has(.aoMapcnDiscoverRail) .aoHeritageNearby{
    bottom:calc(88px + env(safe-area-inset-bottom));
  }
  .aoHeritageSurface:has(.aoMapcnDiscoverRail[data-discover-expanded="true"]) .aoHeritageNearby{
    bottom:calc(min(48dvh,390px) + 12px);
  }
}
@media(max-width:360px){
  .aoHeritageSurface .aoMapcnDiscoverHeading small{font-size:8px}
  .aoHeritageSurface .aoMapcnDiscoverTitle{font-size:18px}
}
@media(prefers-reduced-motion:reduce){
  .aoHeritageSurface .aoMapcnDiscoverRail,
  .aoHeritageSurface .aoMapcnDiscoverChevron{transition:none}
}

/* P0 phone preview: a Place with no approved site photograph should not
   reserve the 110px photo column. Keep the original two-column treatment
   wherever an actual licensed image exists. */
@media(max-width:799px){
 .aoHeritageSurface .aoHeritagePreview[data-approved-place-photo="no"]{
   grid-template-columns:minmax(0,1fr);
 }
 .aoHeritageSurface .aoHeritagePreview[data-approved-place-photo="no"] .aoHeritageCardHeading,
 .aoHeritageSurface .aoHeritagePreview[data-approved-place-photo="no"] h2,
 .aoHeritageSurface .aoHeritagePreview[data-approved-place-photo="no"] .aoHeritageSynopsis,
 .aoHeritageSurface .aoHeritagePreview[data-approved-place-photo="no"] .aoHeritageCardEmpty{
   grid-column:1;
 }
 .aoHeritageSurface .aoHeritagePreview h2{
   display:block;-webkit-line-clamp:unset;overflow:visible;
   white-space:normal;overflow-wrap:anywhere;text-wrap:pretty;
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img{
   object-fit:contain;background:var(--ao-surface-2,#0d141c);
 }
}
@media(min-width:800px){
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePlaceThumb img{
   object-fit:contain;background:var(--ao-surface-2,#0d141c);
 }
}
@media(max-width:360px){
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePreviewActions{
   grid-template-columns:minmax(0,1fr);
 }
 .aoHeritageSurface .aoHeritagePreview .aoHeritagePreviewActions>*{
   min-width:0;white-space:normal;overflow-wrap:anywhere;
 }
}
`;
