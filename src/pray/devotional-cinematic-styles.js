// Scoped sacred interstitial; only card transitions, never ordinary paragraph scroll.
export const DEVOTIONAL_CINEMATIC_CSS=String.raw`
#aoPray435930 .aoP435930Sheet{position:relative}
#aoPray435930 .aoDevoCinematicInterstitial{position:absolute;inset:0;z-index:80;pointer-events:none;overflow:hidden;display:flex;flex-direction:column;justify-content:center;align-items:stretch;background:#080c12;color:#eee9dc;animation:aoDevoFilm var(--ao-devo-duration,1000ms) ease-in-out both;isolation:isolate}
#aoPray435930 .aoDevoCinematicImageZone{position:relative;display:grid;place-items:center;height:min(66dvh,580px);min-height:240px;overflow:hidden;background:radial-gradient(ellipse at center,#182029,#080c12 76%)}
#aoPray435930 .aoDevoCinematicImageZone:before{content:"";position:absolute;inset:0;z-index:1;box-shadow:inset 0 0 75px 28px #080c12;pointer-events:none}
#aoPray435930 .aoDevoCinematicArtwork{display:block;width:100%;height:100%;object-fit:contain;transform-origin:var(--ao-devo-x,50%) var(--ao-devo-y,50%);animation:aoDevoFilmCamera var(--ao-devo-duration,1000ms) cubic-bezier(.18,.8,.24,1) both;filter:brightness(.86) saturate(.80)}
#aoPray435930 .aoDevoCinematicImageZone[data-ao-art-absent] {height:min(28dvh,180px);min-height:100px;background:radial-gradient(ellipse at center,rgba(199,174,109,.085),transparent 70%)}
#aoPray435930 .aoDevoCinematicImageZone[data-ao-art-failed] {background:#080c12}
#aoPray435930 .aoDevoCinematicHeading{text-align:center;position:relative;z-index:2;padding:20px max(18px,6%) 28px;background:linear-gradient(to bottom,transparent,#080c12 20%);color:#ede8dd}
#aoPray435930 .aoDevoCinematicHeading>small:first-child{font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.18em;color:#a5a8ab}
#aoPray435930 .aoDevoCinematicHeading h2{font:500 clamp(26px,7vw,43px)/1.14 Georgia,serif;margin:11px 0 8px;text-wrap:balance}
#aoPray435930 .aoDevoCinematicHeading p{font:italic 15px/1.55 Georgia,serif;color:#c4bda9;margin:0}
#aoPray435930 .aoDevoCinematicHeading .aoDevoCinematicCredit{display:block;font:400 10px/1.35 system-ui,sans-serif;color:#9a9ca0;margin-top:16px}
#aoPray435930 .aoDevoCard[data-ao-gesture-cinematic="profound-bow"] .aoDevoCardHead{animation:aoDevoGestureQuiet .78s ease-out both}
@keyframes aoDevoFilm{0%{opacity:0}14%{opacity:1}72%{opacity:1}100%{opacity:0}}
@keyframes aoDevoFilmCamera{0%{transform:scale(1.025);filter:brightness(.73) saturate(.7)}75%{transform:scale(var(--ao-devo-scale,1.12));filter:brightness(.9) saturate(.84)}100%{transform:scale(var(--ao-devo-scale,1.12))}}
@keyframes aoDevoGestureQuiet{0%{box-shadow:inset 0 0 0 rgba(202,178,120,0)}45%{box-shadow:inset 0 -2px 0 rgba(202,178,120,.62)}100%{box-shadow:inset 0 0 0 rgba(202,178,120,0)}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoDevoCinematicInterstitial{display:none!important}#aoPray435930 .aoDevoCardHead{animation:none!important}}
`;
function ensureDevotionalCinematicStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-devotional-cinematic-style"))return;
 const n=doc.createElement("style");n.id="ao-devotional-cinematic-style";n.textContent=DEVOTIONAL_CINEMATIC_CSS;
 (doc.head||doc.documentElement).append(n);
}
if(typeof document!=="undefined")ensureDevotionalCinematicStyles(document);
