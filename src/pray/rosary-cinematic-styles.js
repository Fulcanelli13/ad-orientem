// A scene and milestone ribbon, not a second Rosary player.
// The canonical .pbShell continues to own prayers, bead state and controls.
export const ROSARY_CINEMATIC_STYLES_V1="rosary-cinematic-styles-v1";
if(typeof document!=="undefined"&&!document.getElementById("ao-rosary-cinematic-v1-styles")){
 const CSS=[
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinema{position:relative;isolation:isolate;display:grid;gap:0;margin:3px 0 13px;min-width:0;background:#080c12;color:#edece7;border:1px solid rgba(211,201,178,.14);border-radius:8px;overflow:hidden}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaTimeline{position:relative;display:flex;align-items:stretch;gap:0;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;background:#101720;border-bottom:1px solid rgba(225,229,233,.11)}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaTimeline::-webkit-scrollbar{display:none}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStop{flex:1 0 20%;min-width:72px;display:grid;grid-template-rows:19px auto;justify-items:center;align-content:start;gap:4px;min-height:55px;max-width:none;border:0!important;border-top:2px solid rgba(232,232,230,.11)!important;border-radius:0!important;padding:6px 3px 8px!important;background:none!important;color:#979da4!important;text-align:center;font:500 .57rem/1.25 system-ui,sans-serif!important;box-shadow:none!important}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStop.active{border-top-color:var(--liturgical,#c9b992)!important;color:#f3ede3!important;background:linear-gradient(180deg,rgba(209,190,151,.07),transparent)!important}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStop:focus-visible{outline:2px solid var(--liturgical,#d3c8ae);outline-offset:-3px}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaNumber{font:400 .92rem/1.12 Georgia,serif}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaName{font-size:inherit;letter-spacing:0;overflow-wrap:anywhere;text-wrap:balance}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStage{position:relative;height:clamp(172px,27vw,240px);overflow:hidden;background:radial-gradient(ellipse at 60% 27%,rgba(180,171,154,.19),transparent 57%),linear-gradient(140deg,#1c2735,#080c12 78%);color:#eeeae4}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStage[hidden]{display:none!important}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaImage{position:absolute;inset:0;display:block;width:100%;height:100%;object-fit:cover;object-position:center 39%;transform:scale(1.015);filter:brightness(.79) saturate(.8);opacity:0;transition:opacity .33s ease}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStage[data-artwork="ready"] .aoRosaryCinemaImage{opacity:1}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaShade{position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(0deg,rgba(3,6,10,.92) 0%,rgba(3,6,10,.22) 70%,rgba(3,6,10,.09) 100%)}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaCopy{position:absolute;z-index:2;left:clamp(14px,3vw,23px);right:14px;bottom:clamp(12px,3vw,20px);pointer-events:none}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaKicker{display:block;font:600 .61rem/1.3 system-ui,sans-serif;color:#c8c5bf;letter-spacing:.16em}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaTitle{font:400 clamp(1.3rem,3.5vw,2.06rem)/1.1 Georgia,serif;color:#f1efe7!important;margin:7px 0 0!important;letter-spacing:-.012em}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaCaption{display:none;font:italic .7rem/1.4 Georgia,serif;color:#c5c6c5}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStage[data-effect="absolute-stillness"] .aoRosaryCinemaImage{animation:none!important;transition:none!important;transform:scale(1.015)}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="threshold-light"] .aoRosaryCinemaImage,#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="dawn-reveal"] .aoRosaryCinemaImage{animation:aoRosaryCinematicReveal 1.2s cubic-bezier(.18,.8,.2,1) both}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="meeting"] .aoRosaryCinemaImage,#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="processional-travel"] .aoRosaryCinemaImage,#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="landscape-travel"] .aoRosaryCinemaImage{animation:aoRosaryCinematicTravel 1.35s cubic-bezier(.18,.8,.2,1) both}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="shadow"] .aoRosaryCinemaImage,#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="night-vigil"] .aoRosaryCinemaImage{animation:aoRosaryCinematicShadow 1.35s ease-out both}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="radiance"] .aoRosaryCinemaImage,#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter[data-effect="vertical-ascension"] .aoRosaryCinemaImage{animation:aoRosaryCinematicLight 1.35s ease-out both}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaEnter:not([data-effect="absolute-stillness"]) .aoRosaryCinemaCopy{animation:aoRosaryCinematicCopy .66s ease-out both}',
  '#aoPrayerBookRoot[data-ao-rosary-active-root="true"]:has(.aoRosaryCinemaStage[data-artwork="ready"]) .aoV401RosaryHero img,#aoPrayerBookRoot[data-ao-rosary-active-root="true"]:has(.aoRosaryCinemaStage[data-artwork="ready"]) .lab-contemplation img{display:none!important}',
  '@keyframes aoRosaryCinematicReveal{from{opacity:.35;transform:scale(1.06)}to{opacity:1;transform:scale(1.015)}}',
  '@keyframes aoRosaryCinematicTravel{from{opacity:.72;transform:scale(1.065) translateX(-1.5%)}to{opacity:1;transform:scale(1.015) translateX(0)}}',
  '@keyframes aoRosaryCinematicShadow{from{opacity:.42;filter:brightness(.45) saturate(.75);transform:scale(1.03)}to{opacity:1;filter:brightness(.79) saturate(.8);transform:scale(1.015)}}',
  '@keyframes aoRosaryCinematicLight{from{opacity:.38;filter:brightness(.5) saturate(.75);transform:scale(1.045)}to{opacity:1;filter:brightness(.81) saturate(.83);transform:scale(1.015)}}',
  '@keyframes aoRosaryCinematicCopy{from{opacity:.26;transform:translateY(8px)}to{opacity:1;transform:none}}',
  '@media(max-width:560px){#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStage{height:clamp(155px,25dvh,200px)}#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinemaStop{min-width:65px;font-size:.55rem!important}#aoPrayerBookRoot[data-ao-rosary-active-root="true"] .aoRosaryCinema{margin-inline:0}}',
  '@media(prefers-reduced-motion:reduce){#aoPrayerBookRoot .aoRosaryCinema *,#aoPrayerBookRoot .aoRosaryCinemaImage{animation:none!important;transition:none!important;transform:none!important}}'
 ].join("\n");
 const style=document.createElement("style");style.id="ao-rosary-cinematic-v1-styles";style.textContent=CSS;(document.head||document.documentElement).append(style);
}
