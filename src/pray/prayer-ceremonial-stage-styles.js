/**
 * Visual-only prayer scenes. No animation implies an observed rite, priestly
 * absolution, physical extinguishing, or a change of prayer text.
 * Motion disabled for reduced-motion users. No new artwork source required.
 */
export const PRAYER_CEREMONIAL_SCENE_CSS=String.raw`
#aoPray435930 .aoPrayerCeremonialScene{position:relative;min-width:0;margin:12px auto 18px;border:1px solid rgba(208,184,145,.22);border-radius:14px;overflow:hidden;background:radial-gradient(ellipse at 50% 15%,#1c2530 0%,#111720 42%,#090d13 100%);color:#dfd0b8;isolation:isolate}
#aoPray435930 .aoPrayerCeremonialScene figcaption{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
#aoPray435930 .aoPrayerSceneVault{position:relative;min-height:136px;height:clamp(136px,24vw,190px);max-width:690px;margin:0 auto;overflow:hidden}
#aoPray435930 .aoPrayerSceneArch{position:absolute;inset:10% 22% 0;border:13px solid rgba(176,150,116,.12);border-radius:48% 48% 0 0;box-shadow:inset 0 0 24px #06090f}
#aoPray435930 .aoPrayerSceneWindow{position:absolute;left:19%;top:20%;height:42%;width:10%;border-radius:48% 48% 3px 3px;border:5px solid #41392f;background:linear-gradient(115deg,#3d2b1c,#a38853 30%,#332e29 65%);opacity:.62}
#aoPray435930 .aoPrayerSceneDoor{position:absolute;left:50%;bottom:8%;height:78%;width:29%;transform:translateX(-50%);border:7px ridge #51402c;border-radius:48% 48% 1px 1px;background:linear-gradient(100deg,#1a1513 2%,#422c1c 42%,#1b1312 100%);box-shadow:0 6px 25px #05070a, inset 0 0 18px #14100d}
#aoPray435930 .aoPrayerSceneGrille{position:absolute;width:14%;height:28%;left:50%;top:28%;transform:translateX(-50%);border:5px solid #624629;background:repeating-linear-gradient(90deg,#151211 0px,#151211 8px,#665133 9px,#665133 11px);box-shadow:inset 0 0 15px #060508}
#aoPray435930 .aoPrayerSceneKneeler{position:absolute;width:18%;height:13%;left:41%;bottom:9%;border:3px solid #4a3724;border-radius:5px;background:linear-gradient(#473526,#261913);box-shadow:0 6px 12px #06080b}
#aoPray435930 .aoPrayerSceneFloor{position:absolute;inset:auto 0 0;height:10%;background:linear-gradient(90deg,#29241e,#43372b 50%,#211d1a)}
#aoPray435930 .aoPrayerSceneLight{position:absolute;left:50%;bottom:8%;height:83%;width:50%;transform:translateX(-50%);background:radial-gradient(ellipse at 50% 65%,rgba(232,187,96,.14),transparent 68%);opacity:.5;pointer-events:none;transition:opacity .7s ease}
#aoPray435930 .aoPrayerCeremonialScene--confession[data-ao-scene-phase="prepare"] .aoPrayerSceneDoor{transform:translateX(-50%) scale(.82);filter:brightness(.7)}
#aoPray435930 .aoPrayerCeremonialScene--confession[data-ao-scene-phase="examine"] .aoPrayerSceneDoor{transform:translateX(-50%) scale(.93)}
#aoPray435930 .aoPrayerCeremonialScene--confession[data-ao-scene-phase="approach"] .aoPrayerSceneDoor{animation:aoPrayerSceneNear .9s ease-out both}
#aoPray435930 .aoPrayerCeremonialScene--confession[data-ao-scene-phase="approach"] .aoPrayerSceneLight{opacity:1}
#aoPray435930 .aoPrayerCeremonialScene--confession[data-ao-scene-phase="after"] .aoPrayerSceneLight{opacity:.9}
#aoPray435930 .aoPrayerSceneTenebraeVault{position:relative;min-height:170px;height:clamp(170px,30vw,240px);display:flex;align-items:flex-end;justify-content:center;padding:28px 12px 12px;background:radial-gradient(ellipse at 50% 90%,rgba(201,149,68,.08),transparent 70%);transition:background .7s ease}
#aoPray435930 .aoPrayerSceneTenebraeArch{position:absolute;top:10%;left:21%;width:58%;height:84%;border:10px solid rgba(172,144,98,.10);border-radius:48% 48% 0 0}
#aoPray435930 .aoPrayerCeremonialCandleRail{
 position:relative;z-index:2;display:block;
 width:min(94%,440px);height:min(205px,100%);max-width:100%;
}
#aoPray435930 .aoPrayerCeremonialCandleRail::before{
 content:"";position:absolute;inset:0;
 background:linear-gradient(90deg,#3b2d1f,#aa8851 42%,#c0a06e 51%,#655037 83%,#2b231d);
 clip-path:polygon(13% 92%,13% 89%,49% 33%,51% 33%,87% 89%,87% 92%,50% 40%);
 opacity:.63;pointer-events:none
}
#aoPray435930 .aoPrayerCeremonialCandleRail::after{
 content:"";position:absolute;left:49.3%;top:37%;bottom:2%;width:1.4%;
 background:linear-gradient(#806342,#4b3b2a);opacity:.52;pointer-events:none
}
#aoPray435930 .aoPrayerCeremonialCandle{
 position:absolute;left:var(--ao-candle-x,50%);bottom:var(--ao-candle-rise,8%);
 transform:translateX(-50%);display:block;width:clamp(6px,1.3vw,12px);
 height:clamp(30px,6.7vw,54px);border-radius:2px 2px 1px 1px;
 background:linear-gradient(90deg,#a99477,#ddcbab 50%,#83705a);
 box-shadow:0 0 6px #030608;transition:opacity .65s ease
}
#aoPray435930 .aoPrayerCeremonialCandle.is-final{height:clamp(42px,8vw,68px)}
#aoPray435930 .aoPrayerCeremonialCandle.is-dark{opacity:.28}
#aoPray435930 .aoPrayerCeremonialCandle.is-concealed{opacity:0;visibility:hidden}
#aoPray435930 .aoPrayerCeremonialWick{position:absolute;left:50%;bottom:100%;width:1px;height:5px;background:#4b3a29}
#aoPray435930 .aoPrayerCeremonialFlame{position:absolute;left:50%;bottom:calc(100% + 4px);width:10px;height:19px;transform:translateX(-50%);border-radius:70% 20% 70% 45%;background:radial-gradient(ellipse at 50% 70%,#fff1c2 0%,#ffbd5a 50%,#af582b 90%);filter:drop-shadow(0 0 11px #d79b4f);animation:aoPrayerFlame 1.8s ease-in-out infinite alternate;transform-origin:50% 100%}
#aoPray435930 .aoPrayerCeremonialCandle.is-dark .aoPrayerCeremonialFlame{opacity:0;animation:none}
#aoPray435930 .aoPrayerCeremonialScene--tenebrae[data-ao-scene-phase="strepitus"] .aoPrayerSceneTenebraeVault{animation:aoPrayerObservedStrepitus .26s ease-in-out 2}
@keyframes aoPrayerSceneNear{from{transform:translateX(-50%) scale(.93);filter:brightness(.8)}to{transform:translateX(-50%) scale(1.03);filter:brightness(1)}}
@keyframes aoPrayerFlame{from{transform:translateX(-50%) scale(.92) rotate(-5deg)}to{transform:translateX(-50%) scale(1.05) rotate(4deg)}}
@keyframes aoPrayerObservedStrepitus{0%,100%{transform:none}50%{transform:translateX(2px)}}
@media (max-width:400px){#aoPray435930 .aoPrayerSceneTenebraeVault{padding-inline:6px}#aoPray435930 .aoPrayerCeremonialScene figcaption{font-size:.69rem}}
@media (prefers-reduced-motion:reduce){#aoPray435930 .aoPrayerCeremonialScene *,#aoPray435930 .aoPrayerCeremonialScene{animation:none!important;transition:none!important}}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-prayer-ceremonial-stage-style")){
  const style=document.createElement("style");
  style.id="ao-prayer-ceremonial-stage-style";
  style.textContent=PRAYER_CEREMONIAL_SCENE_CSS;
  (document.head||document.documentElement).appendChild(style);
}
