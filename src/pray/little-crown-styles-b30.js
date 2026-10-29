/** One mobile-first reader inside the existing Rosary & Chaplets family. */
export function installLittleCrownStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById?.("ao-little-crown-b30-style"))return;
 const style=doc.createElement("style");style.id="ao-little-crown-b30-style";
 style.textContent=`
#aoPray435930 .aoLittleCrown{max-width:720px;min-width:0;margin:auto;padding:clamp(15px,3.5vw,30px) clamp(12px,3vw,26px) 46px;color:var(--ao-text,#e8dfd1)}
#aoPray435930 .aoLittleCrownIntro{text-align:center;margin:8px auto 20px}
#aoPray435930 .aoLittleCrownIntro small{font:600 11px/1.4 var(--ao-font-ui,Georgia,serif);letter-spacing:.12em;text-transform:uppercase;color:var(--ao-muted,#c7b49c)}
#aoPray435930 .aoLittleCrownIntro h2{font:400 clamp(25px,5vw,34px)/1.25 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);margin:7px 0 8px}
#aoPray435930 .aoLittleCrownIntro p{font:400 14px/1.55 var(--ao-font-ui,Georgia,serif);color:var(--ao-muted,#bbaea0);max-width:440px;margin:auto}
#aoPray435930 .aoLittleCrownProgress{height:3px;overflow:hidden;background:rgba(195,173,133,.19);border-radius:3px;margin:10px 0 22px}
#aoPray435930 .aoLittleCrownProgress span{display:block;height:100%;background:#c9af80;transition:width .18s ease}
#aoPray435930 .aoLittleCrownGroup{margin:12px auto;max-width:540px;text-align:center}
#aoPray435930 .aoLittleCrownGroup h3{font:600 12px/1.4 var(--ao-font-ui,Georgia,serif);letter-spacing:.03em;color:var(--ao-muted,#c7b49c);margin:0 0 9px}
#aoPray435930 .aoLittleCrownBeads{display:flex;justify-content:center;align-items:center;flex-wrap:wrap;gap:5px}
#aoPray435930 .aoLittleCrownBeads button{min-height:48px;min-width:48px;width:48px;border:1px solid transparent;border-radius:12px;background:transparent;display:grid;place-items:center;cursor:pointer;color:inherit}
#aoPray435930 .aoLittleCrownBeads button span{display:block;width:12px;height:12px;border:1px solid #bca47d;border-radius:50%}
#aoPray435930 .aoLittleCrownBeads button.family span{width:16px;height:16px}
#aoPray435930 .aoLittleCrownBeads button.done span{background:rgba(205,178,132,.4)}
#aoPray435930 .aoLittleCrownBeads button.active{background:rgba(203,171,114,.12);border-color:rgba(207,180,126,.52)}
#aoPray435930 .aoLittleCrownBeads button.active span{background:#e1c493;box-shadow:0 0 0 4px rgba(202,169,114,.13)}
#aoPray435930 .aoLittleCrownPrayer{border:1px solid rgba(198,175,136,.25);background:rgba(170,140,94,.055);border-radius:14px;padding:clamp(18px,4vw,29px);margin:22px auto 0}
#aoPray435930 .aoLittleCrownPrayerTop{display:flex;justify-content:space-between;align-items:center;gap:10px}
#aoPray435930 .aoLittleCrownPrayerTop small{color:var(--ao-muted,#c6b6a2);font-size:12px}
#aoPray435930 .aoLittleCrownPrayerTop button{min-height:48px;border:1px solid rgba(198,171,120,.45);border-radius:999px;background:transparent;padding:8px 12px}
#aoPray435930 .aoLittleCrownAspiration{font:italic 400 clamp(17px,3.5vw,21px)/1.5 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);text-align:center;margin:22px auto 18px;color:#d8be92}
#aoPray435930 .aoLittleCrownPrayerText{font:400 clamp(19px,4vw,24px)/1.65 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);text-align:center;overflow-wrap:anywhere;margin:0}
#aoPray435930 .aoLittleCrownActions{display:flex;justify-content:space-between;gap:12px;margin-top:18px}
#aoPray435930 .aoLittleCrownActions button{min-height:48px;min-width:105px;padding:9px 16px;border:1px solid rgba(197,175,137,.5);background:transparent;border-radius:999px;color:inherit;cursor:pointer}
#aoPray435930 .aoLittleCrownActions button.primary{margin-left:auto;background:rgba(196,161,107,.2)}
#aoPray435930 .aoLittleCrownSource{border-top:1px solid rgba(198,169,115,.23);margin-top:25px;padding-top:8px}
#aoPray435930 .aoLittleCrownSource summary{min-height:48px;display:flex;align-items:center;cursor:pointer;color:var(--ao-muted,#c6b6a2)}
#aoPray435930 .aoLittleCrownSource p{font-size:13px;line-height:1.55}
#aoPray435930 .aoLittleCrownSource a{display:block;color:#d7bb8a;padding:8px 0;font-size:13px;overflow-wrap:anywhere}
#aoPray435930 .aoLittleCrown button:focus-visible,#aoPray435930 .aoLittleCrown summary:focus-visible{outline:2px solid #e0c594;outline-offset:2px}
/* The 15-bead structure remains intact, but source prayer should be visible
   when a 320px user first enters the chaplet, not below decorative spacing. */
@media(max-width:420px){
 #aoPray435930 .aoLittleCrown{padding:7px 11px 28px}
 #aoPray435930 .aoLittleCrownIntro{margin:0 auto 5px}
 #aoPray435930 .aoLittleCrownIntro h2{font-size:22px;line-height:1.18;margin:2px 0 4px}
 #aoPray435930 .aoLittleCrownIntro p{font-size:13px;line-height:1.35}
 #aoPray435930 .aoLittleCrownProgress{margin:5px 0 7px}
 #aoPray435930 .aoLittleCrownGroup{margin:3px auto}
 #aoPray435930 .aoLittleCrownGroup h3{margin:0 0 3px;line-height:1.22}
 #aoPray435930 .aoLittleCrownPrayer{margin:7px auto 0;padding:11px 12px}
 #aoPray435930 .aoLittleCrownAspiration{margin:7px auto 7px}
 #aoPray435930 .aoLittleCrownActions{margin-top:11px}
 #aoPray435930 .aoLittleCrownSource{margin-top:12px}
}
@media(max-width:350px){#aoPray435930 .aoLittleCrownBeads{gap:1px}#aoPray435930 .aoLittleCrownPrayer{padding:17px 12px}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoLittleCrownProgress span{transition:none}}
`;
 doc.head?.append(style);
}
if(typeof document!=="undefined")installLittleCrownStyles(document);
