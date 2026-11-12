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
#aoPray435930 .aoPrayerRitualViews button:focus-visible,
#aoPray435930 .aoPrayerRitualDivider:focus-visible,
#aoPray435930 .aoPrayerRitualText:focus-visible{outline:2px solid #e7c994;outline-offset:-2px}
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
