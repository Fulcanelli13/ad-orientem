/** B26 scoped source-directed Marian consecration timeline, existing Pray shell. */
export function installMontfortStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById?.("ao-montfort-b26-style"))return;
 const style=doc.createElement("style");style.id="ao-montfort-b26-style";
 style.textContent=`
#aoPray435930 .aoMontfortB26{max-width:790px;margin:auto;padding:16px clamp(14px,4vw,26px) 42px}
#aoPray435930 .aoMontfortB26 p{line-height:1.66}
#aoPray435930 .aoMontfortB26Intro{font:16px/1.6 var(--ao-font-ui,Georgia,serif);color:var(--ao-muted,#c1b69f)}
#aoPray435930 .aoMontfortB26Progress{height:6px;background:rgba(191,164,121,.19);border-radius:999px;overflow:hidden;margin:16px 0 10px}
#aoPray435930 .aoMontfortB26Progress span{display:block;height:100%;background:#c1a26c;transition:width .15s ease}
#aoPray435930 .aoMontfortB26PhaseRail{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:7px;margin:13px 0 20px}
#aoPray435930 .aoMontfortB26PhaseRail button{min-width:0;min-height:50px;text-align:center;padding:7px 3px;border:1px solid rgba(198,178,139,.33);background:transparent;color:inherit;border-radius:10px;font:500 12px/1.35 var(--ao-font-ui,Georgia,serif);cursor:pointer}
#aoPray435930 .aoMontfortB26PhaseRail button[aria-current=step]{background:rgba(198,178,139,.19);border-color:#b9976d}
#aoPray435930 .aoMontfortB26Picker{display:flex;flex-wrap:wrap;gap:11px;align-items:center;padding:12px 14px;border:1px solid rgba(198,178,139,.32);border-radius:12px}
#aoPray435930 .aoMontfortB26Picker label{font:500 13px/1.4 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoMontfortB26Picker input{min-height:48px;max-width:100%;border:1px solid rgba(198,178,139,.5);border-radius:8px;background:transparent;color:inherit;padding:7px 12px;font:inherit;color-scheme:dark}
#aoPray435930 .aoMontfortB26Card{padding:clamp(18px,4vw,26px);border:1px solid rgba(198,178,139,.33);border-radius:14px;background:rgba(174,148,102,.055);margin:15px 0}
#aoPray435930 .aoMontfortB26Card h2{font:400 clamp(23px,5vw,31px)/1.25 var(--ao-font-liturgical,Georgia,serif);margin:6px 0 15px}
#aoPray435930 .aoMontfortB26Kicker{font:500 12px/1.4 var(--ao-font-ui,Georgia,serif);letter-spacing:.05em;text-transform:uppercase;color:var(--ao-muted,#c1b69f)}
#aoPray435930 .aoMontfortB26Original{font:400 clamp(18px,3vw,21px)/1.85 var(--ao-font-liturgical,Georgia,serif);white-space:pre-line;margin:13px 0}
#aoPray435930 .aoMontfortB26Action{margin:14px 0;padding:14px;border-top:1px solid rgba(194,171,130,.31)}
#aoPray435930 .aoMontfortB26Action h3{font:400 19px/1.45 var(--ao-font-liturgical,Georgia,serif);margin:8px 0}
#aoPray435930 .aoMontfortB26Canonical{font:400 18px/1.8 var(--ao-font-liturgical,Georgia,serif);white-space:pre-line}
#aoPray435930 .aoMontfortB26Nav{display:flex;gap:11px;justify-content:space-between;align-items:center;margin:18px 0}
#aoPray435930 .aoMontfortB26Nav button,#aoPray435930 .aoMontfortB26Action button,#aoPray435930 .aoMontfortB26Jump{min-height:48px;min-width:0;padding:9px 15px;border:1px solid rgba(202,177,134,.43);border-radius:10px;background:rgba(187,154,101,.12);color:inherit;cursor:pointer;font:500 14px/1.4 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoMontfortB26Nav button[disabled]{opacity:.3;cursor:default}
#aoPray435930 .aoMontfortB26Check{display:flex;align-items:center;gap:12px;padding:12px 15px;border:1px solid rgba(198,178,139,.27);border-radius:11px;font:500 14px/1.4 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoMontfortB26Check input{width:22px;height:22px;accent-color:#bc9b66;flex-shrink:0}
#aoPray435930 .aoMontfortB26Details{border-top:1px solid rgba(203,180,134,.28);margin-top:19px}
#aoPray435930 .aoMontfortB26Details summary{cursor:pointer;min-height:48px;padding:11px 0;font:500 14px/1.5 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoMontfortB26Details a{color:#c5a875;overflow-wrap:anywhere}
#aoPray435930 .aoMontfortB26Note{color:var(--ao-muted,#c1b69f);font:13px/1.65 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoMontfortB26 :focus-visible{outline:2px solid #d8bc8f;outline-offset:3px}
@media(max-width:360px){#aoPray435930 .aoMontfortB26PhaseRail{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoMontfortB26Progress span{transition:none}}
`;
 doc.head?.append(style);
}
if(typeof document!=="undefined")installMontfortStyles(document);
