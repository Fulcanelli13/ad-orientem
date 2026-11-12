/**
 * Reusable visual/text split for two source-owned guided prayer families.
 * The sanctuary occupies an actual grid row. Moving the text boundary changes
 * its height continuously; it never overlays or hides the text behind it.
 */
export const PRAYER_RITUAL_WORKSPACE_CSS=String.raw`
#aoPray435930 .aoPrayerRitualWorkspace{
  --ao-ritual-scene-share:39%;box-sizing:border-box;display:grid;
  grid-template-rows:minmax(0,var(--ao-ritual-scene-share)) 11px minmax(0,1fr);
  height:clamp(315px,calc(100dvh - 174px),850px);
  min-height:0;min-width:0;margin:8px 0 16px;
  border:1px solid rgba(206,182,141,.26);border-radius:15px;
  overflow:hidden;background:#0b0f15;isolation:isolate
}
#aoPray435930 .aoPrayerRitualVisual{position:relative;min-height:0;min-width:0;overflow:hidden;background:radial-gradient(ellipse at 50% 70%,#242018,#090c12 90%)}
#aoPray435930 .aoPrayerRitualVisual>.aoPrayerCeremonialScene{
  box-sizing:border-box;display:block;width:100%;height:100%;min-height:0;
  margin:0;border:0;border-radius:0;overflow:hidden;background:transparent
}
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerSceneVault,
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerSceneTenebraeVault{
  box-sizing:border-box;width:100%;height:100%;min-height:0;max-width:none
}
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerSceneTenebraeVault{align-items:flex-end;padding-bottom:12px}
/* An already approved Murillo painting replaces schematic confessional
   shapes. It stays legible at all 3 user-controlled scene/text proportions. */
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerCeremonialScene--painted{
  background:radial-gradient(ellipse at 50% 42%,#2f211a 0%,#120f0d 73%);isolation:isolate;
}
#aoPray435930 .aoPrayerRitualSceneArt{
  display:block;position:absolute;inset:0;margin:0;min-width:0;min-height:0;
  width:100%;height:100%;z-index:0;overflow:hidden;border:0;border-radius:0;
  background:radial-gradient(ellipse at center,#271b14,#100e0d 72%)
}
#aoPray435930 .aoPrayerRitualSceneArt img{
  display:block;width:100%;height:100%;object-fit:contain;
  object-position:center center;filter:brightness(.92) saturate(.88);
  transform:none;transition:filter 1.1s ease
}
/* The inherited caption is normally visually hidden; the released image's
   authenticated source link must remain visible for keyboard navigation. */
#aoPray435930 .aoPrayerCeremonialScene--painted .aoPrayerRitualSceneArt figcaption{
  position:absolute;z-index:3;bottom:8px;left:10px;right:10px;
  width:auto;height:auto;margin:0;padding:3px 7px;clip:auto;
  white-space:normal;overflow:visible;border:0;
  background:rgba(8,9,10,.66);color:#e6d9c5;border-radius:4px;
  font:400 .68rem/1.3 "EB Garamond",Georgia,serif;max-width:max-content
}
#aoPray435930 .aoPrayerRitualSceneArt figcaption a{
  color:#f2debb;text-decoration:underline;text-underline-offset:2px
}
#aoPray435930 .aoPrayerCeremonialScene--painted .aoPrayerSceneVault{
  position:absolute;inset:0;width:100%;height:100%;max-width:none;
  overflow:hidden;z-index:1;pointer-events:none;
  background:linear-gradient(0deg,rgba(9,8,7,.46),transparent 45%),
             linear-gradient(90deg,rgba(8,8,7,.20),transparent 24%,transparent 76%,rgba(8,8,7,.20))
}
#aoPray435930 .aoPrayerCeremonialScene--painted .aoPrayerSceneVault>*:not(.aoPrayerSceneLight){
  display:none
}
#aoPray435930 .aoPrayerCeremonialScene--painted .aoPrayerSceneLight{
  inset:0;width:100%;height:100%;transform:none;
  background:radial-gradient(ellipse at 52% 48%,rgba(221,181,110,.10),transparent 67%);
  opacity:.55
}
#aoPray435930 .aoPrayerCeremonialScene--painted[data-ao-scene-phase="examine"] .aoPrayerRitualSceneArt img{
  transform:none;filter:brightness(.82) saturate(.79)
}
#aoPray435930 .aoPrayerCeremonialScene--painted[data-ao-scene-phase="approach"] .aoPrayerRitualSceneArt img{
  transform:none;filter:brightness(.72) saturate(.75)
}
#aoPray435930 .aoPrayerCeremonialScene--painted[data-ao-scene-phase="after"] .aoPrayerRitualSceneArt img{
  transform:none;filter:brightness(.99) saturate(.95)
}
/* Text mode retains a compact control band; do not reduce the artwork and
   its source credit to an illegible thumbnail. Show them in Scene/Together. */
#aoPray435930 .aoPrayerRitualWorkspace[data-ao-prayer-workspace="confession"][data-ao-ritual-mode="text"] .aoPrayerRitualSceneArt{
  visibility:hidden
}
#aoPray435930 .aoPrayerRitualWorkspace[data-ao-ritual-mode="text"] .aoPrayerCeremonialCandleRail{
  transform:scale(.52);transform-origin:50% 100%
}
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerSceneOfficeCross{
  position:absolute;z-index:1;top:21%;left:50%;width:11px;height:42%;
  transform:translateX(-50%);background:linear-gradient(90deg,#927345,#d5b47b,#654a2a);box-shadow:0 0 14px #000
}
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerSceneOfficeCross::after{
  content:"";position:absolute;left:50%;top:27%;height:10px;width:75px;
  transform:translateX(-50%);background:linear-gradient(#c7a46a,#78532d);box-shadow:0 0 12px #000
}
#aoPray435930 .aoPrayerRitualWorkspace .aoPrayerSceneOfficeGlow{
  position:absolute;inset:12% 8% 0;background:radial-gradient(ellipse at 50% 70%,rgba(174,129,77,.13),transparent 56%);
  animation:aoRitualOfficeLight 7s ease-in-out infinite alternate;pointer-events:none
}
@keyframes aoRitualOfficeLight{from{opacity:.3}to{opacity:.75}}
#aoPray435930 .aoPrayerRitualViews{
  position:absolute;right:clamp(4px,2vw,14px);top:7px;z-index:5;
  display:flex;align-items:center;gap:2px;padding:3px;
  border:1px solid rgba(230,209,174,.24);border-radius:99px;
  background:rgba(7,10,15,.79);backdrop-filter:blur(8px)
}
#aoPray435930 .aoPrayerRitualViews button{
  min-width:0;min-height:32px;padding:6px clamp(7px,1.5vw,12px);
  color:#c1b7a6;background:transparent;border:0;border-radius:99px;
  font:500 .74rem/1.2 system-ui,sans-serif;cursor:pointer
}
#aoPray435930 .aoPrayerRitualViews button[aria-pressed="true"]{
  background:rgba(225,194,139,.22);color:#f8ead2
}
#aoPray435930 .aoPrayerRitualDivider{
  position:relative;z-index:4;min-width:0;min-height:11px;touch-action:none;
  border-block:1px solid rgba(215,195,155,.19);background:#141922;
  cursor:row-resize;outline-offset:-1px
}
#aoPray435930 .aoPrayerRitualDivider::after{
  content:"";position:absolute;top:50%;left:50%;
  width:46px;height:3px;transform:translate(-50%,-50%);border-radius:99px;
  background:rgba(216,198,163,.66)
}
#aoPray435930 .aoPrayerRitualText{
  box-sizing:border-box;min-height:0;min-width:0;overflow-y:auto;overflow-x:hidden;
  overscroll-behavior:contain;touch-action:pan-y;scrollbar-width:thin;
  padding:clamp(10px,2.3vw,20px);background:rgba(7,10,15,.88)
}
#aoPray435930 .aoPrayerRitualText>*{min-width:0;max-width:100%}
#aoPray435930 .aoPrayerRitualText .aoTenebStageNav{top:0;z-index:7}
#aoPray435930 .aoPrayerRitualText .aoTenebReading{border:0;padding:clamp(10px,2vw,24px);background:transparent}
#aoPray435930 .aoPrayerRitualText .aoTenebSourceSteps{
  display:grid;grid-template-columns:minmax(0,1fr) auto minmax(0,1fr);
  align-items:center;gap:6px;padding:14px 2px 2px;color:#c3ac87;
  font:500 .78rem system-ui,sans-serif
}
#aoPray435930 .aoPrayerRitualText .aoTenebSourceSteps button{
  min-height:44px;min-width:0;border:1px solid rgba(218,194,152,.32);
  border-radius:8px;padding:8px 10px;background:rgba(215,181,120,.08);
  color:#e8d6b4;font:inherit;text-align:center
}
#aoPray435930 .aoPrayerRitualText .aoTenebSourceSteps button:disabled{
  opacity:.3;cursor:default
}
#aoPray435930 .aoPrayerRitualText .aoTenebCeremony{
  margin:8px 0!important;border-color:rgba(208,183,141,.22)!important;
  padding:12px!important
}
#aoPray435930 .aoPrayerRitualText .aoDevoCard{margin-block:8px;min-width:0}
#aoPray435930 .aoPrayerRitualText .aoDevoCardScroll{
  max-height:min(49dvh,440px);min-height:125px;height:auto;
  padding-bottom:38px
}
/* Every examination question must stay fully legible. Active-paragraph
   highlighting cannot dim the substance of a private examination. */
#aoPray435930 .aoPrayerRitualWorkspace .aoDevoCardScroll .aoP435930ConfQuestions li,
#aoPray435930 .aoPrayerRitualWorkspace .aoDevoCardScroll .aoP435930ConfOneCard>p{
  opacity:1!important;
}
#aoPray435930 .aoPrayerRitualViews button:focus-visible,
#aoPray435930 .aoPrayerRitualDivider:focus-visible,
#aoPray435930 .aoPrayerRitualText:focus-visible{outline:2px solid #e7c994;outline-offset:-2px}
/* The source-owned four-stage Confession rail stays above all painted scenes.
   Its earlier transparent 10px gap exposed scene tabs through the header. */
#aoPray435930 .aoP435930ConfNavShell{
  z-index:200;background:#0a0b11!important;isolation:isolate;
  box-shadow:0 10px 16px rgba(5,6,10,.76);
}
@media(max-width:560px){
 #aoPray435930 .aoP435930ConfNavShell{top:68px!important}
}
@media(max-width:480px){
  #aoPray435930 .aoPrayerRitualWorkspace{margin-inline:0;height:clamp(295px,calc(100dvh - 154px),720px)}
  #aoPray435930 .aoPrayerRitualViews{top:5px;right:6px}
  #aoPray435930 .aoPrayerRitualViews button{min-height:29px;font-size:.69rem;padding:5px 7px}
  #aoPray435930 .aoPrayerRitualText{padding:10px 8px 16px}
  #aoPray435930 .aoPrayerRitualText .aoTenebReading{padding:10px 8px}
}
@media(prefers-reduced-motion:reduce){
  #aoPray435930 .aoPrayerRitualWorkspace *,
  #aoPray435930 .aoPrayerRitualWorkspace{animation:none!important;transition:none!important}
}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-prayer-ritual-workspace-style")){
  const style=document.createElement("style");
  style.id="ao-prayer-ritual-workspace-style";
  style.textContent=PRAYER_RITUAL_WORKSPACE_CSS;
  (document.head||document.documentElement).appendChild(style);
}
