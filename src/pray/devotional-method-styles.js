const CSS=String.raw`
#aoPray435930 .aoMercyReader{max-width:800px;margin:0 auto;padding:16px clamp(14px,4vw,28px) 72px}
#aoPray435930 .aoMercyModes{display:flex;gap:6px;margin:0 0 18px}
#aoPray435930 .aoMercyModes button{min-height:42px;border:1px solid rgba(208,191,157,.28);padding:8px 18px;border-radius:9px;color:inherit;background:transparent}
#aoPray435930 .aoMercyModes button[aria-pressed="true"]{background:rgba(194,172,126,.15);border-color:var(--liturgical,#c7ae6d)}
#aoPray435930 .aoMercyCounter{display:flex;justify-content:space-between;gap:12px;color:var(--muted,#b6b4b0);margin:24px 0 10px;letter-spacing:.06em}
#aoPray435930 .aoMercyBeads{display:flex;justify-content:center;gap:8px;align-items:center;min-height:34px}
#aoPray435930 .aoMercyBeads i{height:9px;width:9px;border-radius:50%;border:1px solid rgba(215,198,171,.55);background:rgba(155,152,139,.16)}
#aoPray435930 .aoMercyBeads i.past{background:rgba(215,198,171,.40)}
#aoPray435930 .aoMercyBeads i.active{background:var(--liturgical,#c7ae6d);height:13px;width:13px}
#aoPray435930 .aoMercyPrayer{margin:16px 0 18px;min-height:265px;display:flex;flex-direction:column;justify-content:center;padding:clamp(20px,6vw,38px);border-radius:14px;border:1px solid rgba(215,198,171,.18);background:rgba(255,255,255,.018)}
#aoPray435930 .aoMercyPrayer>small{font:500 .72rem/1.4 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--liturgical,#c7ae6d)}
#aoPray435930 .aoMercyPrayer h2{font:500 clamp(1.1rem,4vw,1.5rem)/1.35 var(--ao-font-display,Georgia,serif);margin:14px 0}
#aoPray435930 .aoMercyVernacular{font:400 clamp(1.22rem,4vw,1.7rem)/1.6 var(--ao-font-liturgical,Georgia,serif);white-space:pre-line}
#aoPray435930 .aoMercyDirection{font:400 .89rem/1.52 var(--ao-font-display,Georgia,serif);color:var(--muted,#b4b2ac);margin-top:24px}
#aoPray435930 .aoMercyGuide,#aoPray435930 .aoMercySource{font:400 .86rem/1.6 var(--ao-font-display,Georgia,serif);color:var(--muted,#b4b2ac)}
#aoPray435930 .aoMercyGuide{padding:13px 16px;border:1px solid rgba(215,198,171,.15);border-radius:10px}
#aoPray435930 .aoMercyGuide p{margin:10px 0}
#aoPray435930 .aoMercySource{margin-top:25px}
#aoPray435930 .aoMercySource a,#aoPray435930 .aoMercyGuide a{color:var(--liturgical,#c7ae6d)}
#aoPray435930 .aoMercyControls{display:flex;gap:12px;justify-content:space-between}
#aoPray435930 .aoMercyControls button{min-height:48px;min-width:128px;padding:12px 19px;border:1px solid rgba(215,198,171,.34);border-radius:10px;color:inherit;background:transparent;font:500 .92rem system-ui,sans-serif}
#aoPray435930 .aoMercyControls button:last-child{background:rgba(215,198,171,.12)}
#aoPray435930 .aoMercyControls button:disabled{opacity:.28}
#aoPray435930 .aoMercyClosing{text-align:center;max-width:500px;margin:20px auto;color:var(--muted,#b4b2ac);font:400 .95rem/1.6 var(--ao-font-liturgical,Georgia,serif)}
#aoPrayerBookRoot .aoRosaryMethods{margin:12px 0;padding:14px;border:1px solid rgba(213,193,161,.22);border-radius:12px;background:rgba(7,11,16,.83);color:var(--text,#f6eedf);font:400 .9rem/1.55 var(--ao-font-liturgical,Georgia,serif)}
#aoPrayerBookRoot .aoRosaryMethods h2{font:500 1.06rem var(--ao-font-display,Georgia,serif);margin:0 0 10px}
#aoPrayerBookRoot .aoRosaryMethodChoices{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0 15px}
#aoPrayerBookRoot .aoRosaryMethodChoices button{min-height:42px;padding:8px 12px;border-radius:8px;background:transparent;border:1px solid rgba(213,193,161,.25);color:inherit}
#aoPrayerBookRoot .aoRosaryMethodChoices button[aria-pressed="true"]{background:rgba(213,193,161,.16);border-color:var(--liturgical,#c7ae6d)}
#aoPrayerBookRoot .aoRosaryMethodDescription{color:var(--muted,#c0bdb5)}
#aoPrayerBookRoot .aoRosaryDominicanOpening{margin:14px 0;border-left:2px solid var(--liturgical,#c7ae6d);padding-left:14px}
#aoPrayerBookRoot .aoRosaryDominicanOpening p{margin:6px 0}
#aoPrayerBookRoot .aoRosaryMethodStage{margin:10px 0 14px;padding:13px 15px;border:1px solid rgba(213,193,161,.21);border-radius:10px;background:rgba(213,193,161,.055)}
#aoPrayerBookRoot .aoRosaryMethodStage strong{display:block;font:500 1rem var(--ao-font-display,Georgia,serif)}
#aoPrayerBookRoot .aoRosaryMethodStage a,#aoPrayerBookRoot .aoRosaryMethods a{color:var(--liturgical,#c7ae6d)}
#aoPrayerBookRoot .aoRosaryMethodStage[hidden]{display:none}
#aoPrayerBookRoot .aoRosaryMethodProgress{font:500 .8rem/1.5 var(--ao-font-display,Georgia,serif);letter-spacing:.05em;margin:8px 0}
#aoPrayerBookRoot .aoRosaryMethodStage button{min-height:44px;margin-top:8px;padding:9px 15px;border-radius:8px;background:rgba(213,193,161,.17);color:inherit;border:1px solid rgba(213,193,161,.4)}
@media(max-width:390px){#aoPray435930 .aoMercyControls button{min-width:100px;padding:10px 13px}#aoPray435930 .aoMercyVernacular{font-size:1.2rem}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoMercyPrayer,#aoPrayerBookRoot .aoRosaryMethods{animation:none!important;transition:none!important}}
`;
export function installDevotionalMethodStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-devotional-methods-styles"))return true;
 const style=doc.createElement("style");
 style.id="ao-pray-devotional-methods-styles";
 style.textContent=CSS;doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installDevotionalMethodStyles(document);
