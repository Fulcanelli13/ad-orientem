// Scoped sacred interstitial; only card transitions, never ordinary paragraph scroll.
export const DEVOTIONAL_CINEMATIC_CSS=String.raw`
#aoPray435930 .aoP435930Sheet{position:relative}
body.aoP435930Open > .aoDevoCinematicInterstitial{position:fixed;inset:0;z-index:2147483600;pointer-events:none;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:stretch;background:#080c12;color:#eee9dc;animation:aoDevoFilm var(--ao-devo-duration,1000ms) ease-in-out both;isolation:isolate}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicImageZone{position:relative;display:grid;place-items:center;height:min(66dvh,580px);min-height:240px;overflow:hidden;background:radial-gradient(ellipse at center,#182029,#080c12 76%)}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicImageZone:before{content:"";position:absolute;inset:0;z-index:1;box-shadow:inset 0 0 75px 28px #080c12;pointer-events:none}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicArtwork{display:block;width:100%;height:100%;object-fit:contain;transform-origin:var(--ao-devo-x,50%) var(--ao-devo-y,50%);animation:aoDevoFilmCamera var(--ao-devo-duration,1000ms) cubic-bezier(.18,.8,.24,1) both;filter:brightness(.86) saturate(.80)}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicImageZone[data-ao-art-absent] {height:min(28dvh,180px);min-height:100px;background:radial-gradient(ellipse at center,rgba(199,174,109,.085),transparent 70%)}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicImageZone[data-ao-art-failed] {background:#080c12}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicHeading{text-align:center;position:relative;z-index:2;padding:20px max(18px,6%) 28px;background:linear-gradient(to bottom,transparent,#080c12 20%);color:#ede8dd}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicHeading>small:first-child{font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.18em;color:#a5a8ab}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicHeading h2{font:500 clamp(26px,7vw,43px)/1.14 Georgia,serif;margin:11px 0 8px;text-wrap:balance}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicHeading p{font:italic 15px/1.55 Georgia,serif;color:#c4bda9;margin:0}
body.aoP435930Open > .aoDevoCinematicInterstitial .aoDevoCinematicHeading .aoDevoCinematicCredit{display:block;font:400 10px/1.35 system-ui,sans-serif;color:#9a9ca0;margin-top:16px}
#aoPray435930 .aoDevoCard[data-ao-gesture-cinematic="profound-bow"] .aoDevoCardHead{animation:aoDevoGestureQuiet .78s ease-out both}
/* Angelus v2: one tableau on entry; never reprise its artwork at every
   versicle. The user-rated museum painting is not panned or distorted. */
body.aoP435930Open > .aoDevoCinematicOpening .aoDevoCinematicArtwork{
  animation:none!important;transform:none!important;object-fit:contain;
  filter:brightness(.85) saturate(.77);
}
body.aoP435930Open > .aoDevoCinematicOpening .aoDevoCinematicImageZone{
  height:min(59dvh,570px);min-height:175px;
}
body.aoP435930Open > .aoDevoCinematicOpening .aoDevoCinematicSkip{
  position:absolute;right:15px;top:max(15px,env(safe-area-inset-top));
  z-index:3;min-width:76px;min-height:44px;padding:8px 14px;
  border:1px solid rgba(221,204,168,.28);border-radius:999px;
  background:rgba(8,12,18,.82);color:#e6dfd1;
  font:600 12px/1.3 system-ui,sans-serif;pointer-events:auto;
}
body.aoP435930Open > .aoDevoCinematicOpening .aoDevoCinematicCredit{
  display:block;max-width:42ch;margin-inline:auto;
}
/* Full-cinematic response cue: stronger than Mass's frequent posture
   reminders. User continues explicitly after taking the posture. */
body.aoP435930Open > .aoDevoPostureCinematic{
  position:fixed;inset:0;z-index:2147483630;display:grid;
  place-items:center;overflow:auto;overscroll-behavior:contain;
  padding:max(28px,env(safe-area-inset-top)) 24px max(28px,env(safe-area-inset-bottom));
  color:#f1eadc;text-align:center;
  background:radial-gradient(ellipse 85% 58% at 50% 46%,#202229 0%,#10151d 55%,#080c12 100%);
  isolation:isolate;animation:aoDevoPostureEnter .42s ease-out both;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureInner{
  display:flex;flex-direction:column;align-items:center;
  width:min(100%,520px);max-height:100%;gap:0;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureKicker{
  font:650 10px/1.4 system-ui,sans-serif;letter-spacing:.2em;color:#c6b68f;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureLatin{
  font:400 clamp(25px,6.2vw,39px)/1.25 Georgia,serif;
  margin:20px 0 0;max-width:19ch;text-wrap:balance;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureRule{
  display:block;width:min(180px,48vw);height:1px;margin:22px 0 10px;
  background:linear-gradient(90deg,transparent,rgba(205,181,130,.68),transparent);
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureIcon{
  display:block;width:clamp(106px,34vw,158px);height:clamp(106px,34vw,158px);
  margin:8px auto 16px;background-color:#e0d3b3;opacity:1;
  mask-size:contain;mask-position:center;mask-repeat:no-repeat;
  -webkit-mask-size:contain;-webkit-mask-position:center;-webkit-mask-repeat:no-repeat;
  filter:drop-shadow(0 0 16px rgba(206,182,142,.2));
  animation:aoDevoPostureIcon .75s cubic-bezier(.2,.72,.18,1) both;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureIcon[data-ao-icon-unavailable="true"]{
  width:0;height:0;margin:0;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureInstruction{
  font:500 clamp(25px,6.1vw,36px)/1.24 Georgia,serif;
  margin:4px 0 12px;text-wrap:balance;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureResponse{
  font:italic clamp(16px,4vw,20px)/1.55 Georgia,serif;
  margin:0 0 30px;color:#b9b5a8;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureContinue{
  min-height:50px;min-width:min(100%,240px);padding:12px 24px;
  border:1px solid rgba(228,212,171,.47);border-radius:10px;
  background:rgba(209,186,142,.10);color:#f6eddc;
  font:600 14px/1.2 Georgia,serif;cursor:pointer;
}
body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureContinue:focus-visible{
  outline:2px solid #d2b883;outline-offset:4px;
}
@keyframes aoDevoPostureEnter{from{opacity:0}to{opacity:1}}
@keyframes aoDevoPostureIcon{
  0%{opacity:.3;transform:translateY(-11px) scale(.87)}
  66%{opacity:1;transform:translateY(1px) scale(1.03)}
  100%{opacity:1;transform:none}
}
@media(prefers-reduced-motion:reduce){
  body.aoP435930Open > .aoDevoPostureCinematic,
  body.aoP435930Open > .aoDevoPostureCinematic .aoDevoPostureIcon{
    animation:none!important;transition:none!important;
  }
}
body.aoP435930Open > .aoDevoPostureCinematic[data-ao-reduced-motion="true"],
body.aoP435930Open > .aoDevoPostureCinematic[data-ao-reduced-motion="true"] .aoDevoPostureIcon{
  animation:none!important;transition:none!important;
}
@keyframes aoDevoFilm{0%{opacity:0}14%{opacity:1}72%{opacity:1}100%{opacity:0}}
@keyframes aoDevoFilmCamera{0%{transform:scale(1.025);filter:brightness(.73) saturate(.7)}75%{transform:scale(var(--ao-devo-scale,1.12));filter:brightness(.9) saturate(.84)}100%{transform:scale(var(--ao-devo-scale,1.12))}}
@keyframes aoDevoGestureQuiet{0%{box-shadow:inset 0 0 0 rgba(202,178,120,0)}45%{box-shadow:inset 0 -2px 0 rgba(202,178,120,.62)}100%{box-shadow:inset 0 0 0 rgba(202,178,120,0)}}
@media(prefers-reduced-motion:reduce){body.aoP435930Open > .aoDevoCinematicInterstitial{animation:none!important}#aoPray435930 .aoDevoCardHead{animation:none!important}}
`;
function ensureDevotionalCinematicStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-devotional-cinematic-style"))return;
 const n=doc.createElement("style");n.id="ao-devotional-cinematic-style";n.textContent=DEVOTIONAL_CINEMATIC_CSS;
 (doc.head||doc.documentElement).append(n);
}
if(typeof document!=="undefined")ensureDevotionalCinematicStyles(document);
