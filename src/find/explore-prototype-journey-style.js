// Approved Sacred Atlas prototype screen 6: one map, documented itinerary
// stages, and a compact mobile bottom sheet. Presentation only: the canonical
// route/stage IDs, MapLibre camera, rights gates and no-geometry policy remain.
// The rejected Venue Profile prototype is deliberately unrelated.
export const EXPLORE_PROTOTYPE_JOURNEY_STYLE = String.raw\`
.aoHeritageSurface .aoJourneyPanel[data-atlas-journey="true"]{
 --ao-journey-ink:#efe8dc;--ao-journey-muted:#bfb7a9;
 --ao-journey-line:#2b3540;--ao-journey-gold:#d9bb7e;
 background:linear-gradient(180deg,rgba(13,17,22,.98),#0b0e12 62%)!important;
 color:var(--ao-journey-ink);border:1px solid var(--ao-journey-line);
 box-shadow:0 -10px 30px rgba(0,0,0,.45);
 font-family:var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyGrab{
 flex:none;display:none;align-items:center;justify-content:center;
 width:100%;height:16px;pointer-events:none;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyGrab:after{
 content:"";width:38px;height:4px;border-radius:3px;background:#3a4652;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader{
 padding:9px 16px 6px;align-items:flex-start;gap:12px;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader small{
 font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.12em;color:var(--ao-journey-gold);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader h2{
 margin:3px 0 0;font:500 22px/1.12 var(--ao-font-display,Georgia,serif);
 color:var(--ao-journey-ink);overflow-wrap:anywhere;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader>button{
 flex:none;border:0;background:transparent;box-shadow:none;
 color:#d6cbbb;min-width:44px;min-height:44px;width:44px;height:44px;
 font:26px/1 var(--ao-font-display,Georgia,serif);cursor:pointer;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyScope{
 padding:2px 16px 7px;font:italic 13px/1.35 var(--ao-font-display,Georgia,serif);
 color:var(--ao-journey-muted);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes{
 gap:7px;padding:0 16px 8px;scroll-snap-type:x mandatory;
 border-color:var(--ao-journey-line);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes button{
 min-height:51px;max-height:66px;flex-basis:160px;padding:6px 10px;
 border:1px solid #35404b;border-radius:10px;background:#11161c;
 color:#d7cab8;gap:3px;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes button.active{
 border-color:#bfa472;background:#25302f;color:#f3e7d3;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes button small{
 font:500 10px/1.15 var(--ao-font-display,Georgia,serif);
 color:var(--ao-journey-gold);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes button strong{
 font:500 13px/1.15 var(--ao-font-display,Georgia,serif);
 -webkit-line-clamp:2;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyDetail{
 padding:7px 16px calc(20px + env(safe-area-inset-bottom));
 display:flex;flex-direction:column;gap:0;scrollbar-width:thin;
 overscroll-behavior:contain;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyDetail h3{
 position:absolute;width:1px;height:1px;padding:0;margin:-1px;
 overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyType{
 order:-2;color:var(--ao-journey-gold);
 font:600 10px/1.25 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.11em;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyModeWarning,
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyEndpointWarning{order:-1}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyAnchors{
 order:0;list-style:none;margin:4px 0 0;padding:0;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyAnchors li{
 grid-template-columns:32px minmax(0,1fr);gap:12px;
 padding:10px 0;border-bottom:1px solid var(--ao-journey-line);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyAnchors li:first-child:after{
 display:none!important;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyAnchors li:last-child{
 border-bottom:0;padding-bottom:10px;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyNode{
 width:30px;height:30px;border-radius:50%;
 border:1.5px solid #74808a;background:transparent;
 color:#d6c6a9;font:600 13px/1 var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyFocusButton{
 width:44px;height:44px;margin:-7px 0 -7px -7px;
 border:1.5px solid var(--ao-journey-gold);border-radius:50%;
 color:var(--ao-journey-gold);background:#151c22;
 font:600 14px/1 var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyFocusButton[aria-pressed=true]{
 background:var(--ao-journey-gold);color:#0b0e12;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyAnchors small{
 font:italic 12px/1.3 var(--ao-font-display,Georgia,serif);
 letter-spacing:0;text-transform:none;color:#b8b4af;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyAnchors strong,
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyStagePlaceLink strong{
 font:500 16.5px/1.25 var(--ao-font-display,Georgia,serif);
 color:var(--ao-journey-ink);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyStagePlaceLink{
 min-height:44px;padding:5px 0;align-items:center;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyStagePlaceLink>span{
 color:var(--ao-journey-gold);
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyStages{order:1;
 color:var(--ao-journey-muted);font:italic 12px/1.35 var(--ao-font-display,Georgia,serif);
 margin:10px 0 0;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyNoLine{
 order:2;color:var(--ao-journey-muted);
 font:italic 13px/1.4 var(--ao-font-display,Georgia,serif);
 margin:10px 0;
}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyActions{order:3;margin:9px 0}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyEvidence{order:4}
.aoHeritageSurface [data-atlas-journey="true"] .aoJourneyMapNotice{
 display:block;color:#c0b4a0;font:italic 12px/1.4 var(--ao-font-display,Georgia,serif);
}
.aoHeritageSurface [data-atlas-journey="true"] :is(button,a):focus-visible{
 outline:2px solid #e6c688;outline-offset:2px;
}
@media(max-width:799px){
 .aoHeritageSurface .aoJourneyPanel[data-atlas-journey="true"]{
  left:0;right:0;bottom:0;top:auto;
  width:100%;height:min(330px,52dvh);max-height:52dvh;
  border-radius:20px 20px 0 0;border-bottom:0;
  padding-bottom:0;z-index:17;
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyGrab{display:flex}
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader{
  padding:0 16px 3px;
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader h2{
  font-size:19px;
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyScope{
  font-size:12px;padding-bottom:5px;
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes button{
  flex-basis:150px;max-height:62px;min-height:48px;
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyDetail{
  padding:6px 16px calc(12px + env(safe-area-inset-bottom));
 }
 .aoHeritageSurface:has(.aoJourneyPanel[data-atlas-journey="true"]) .aoHeritageNearby{
  display:none!important;
 }
}
@media(max-width:360px){
 .aoHeritageSurface .aoJourneyPanel[data-atlas-journey="true"]{
  height:min(300px,52dvh);
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyHeader h2{
  font-size:18px;
 }
 .aoHeritageSurface [data-atlas-journey="true"] .aoJourneyRoutes button{
  flex-basis:138px;
 }
}
@media(prefers-reduced-motion:reduce){
 .aoHeritageSurface [data-atlas-journey="true"]{transition:none!important}
}
\`;
