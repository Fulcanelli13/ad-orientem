const css=`
#aoPray435930 .aoMercyReader,#aoPray435930 .aoMercyMethods{max-width:730px;margin:0 auto;padding:22px 20px 55px;line-height:1.65}
#aoPray435930 .aoMercyKicker{font:600 .82rem system-ui,sans-serif;letter-spacing:.13em;color:var(--ao-muted,#b7a89b);text-transform:uppercase}
#aoPray435930 .aoMercyPrayer{font:400 clamp(1.35rem,4vw,1.8rem)/1.65 Georgia,serif;white-space:normal;max-width:38ch;margin:24px auto 20px;padding:12px 0;color:var(--ao-ink,#eee6dc)}
#aoPray435930 .aoMercyReader h2{font:400 1.2rem Georgia,serif}
#aoPray435930 .aoMercyHelp{padding:14px 0;border-top:1px solid rgba(205,185,150,.2);font-style:italic;color:var(--ao-muted,#cbbfb2)}
#aoPray435930 .aoMercyNote{color:var(--ao-muted,#cbbfb2)}
#aoPray435930 .aoMercyControls{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:25px 0}
#aoPray435930 .aoMercyControls button,#aoPray435930 .aoMercyOptions button,#aoPray435930 .aoMercyMethod button{min-height:44px;padding:10px 14px;color:inherit;border:1px solid rgba(205,185,150,.38);background:rgba(190,174,149,.07);border-radius:6px}
#aoPray435930 .aoMercyControls button:disabled{opacity:.35}
#aoPray435930 .aoMercyOptions{display:flex;flex-wrap:wrap;gap:8px}
#aoPray435930 .aoMercyOptions button[aria-pressed=true]{border-color:rgba(210,190,151,.85);background:rgba(210,190,151,.16)}
#aoPray435930 .aoMercySource{margin-top:22px;font-size:.82rem}
#aoPray435930 .aoMercySource a,#aoPray435930 .aoMercyMethods a{color:inherit;text-decoration:underline;text-underline-offset:3px}
#aoPray435930 .aoMercyBeads{display:flex;justify-content:center;gap:5px;margin:15px 0}
#aoPray435930 .aoMercyBeads i{width:9px;height:9px;border:1px solid rgba(205,185,150,.6);border-radius:50%}
#aoPray435930 .aoMercyBeads i.active{background:rgba(205,185,150,.85)}
#aoPray435930 .aoMercyMethod{padding:14px 0;border-top:1px solid rgba(205,185,150,.2)}
#aoPray435930 .aoMercyMethod small{display:block;color:var(--ao-muted,#cbbfb2)}

#aoPray435930 .aoRosaryChooser{display:flex;flex-direction:column;gap:24px}
#aoPray435930 .aoRosaryChoiceGrid{display:grid;grid-template-columns:1fr;gap:9px}
#aoPray435930 .aoRosaryChoice{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;padding:13px 16px;background:transparent;border:1px solid rgba(205,185,150,.25);border-radius:8px;color:inherit;min-height:64px}
#aoPray435930 .aoRosaryChoice strong{font:500 1.08rem Georgia,serif}
#aoPray435930 .aoRosaryChoice small,#aoPray435930 .aoRosaryChooserOptions small{font:400 .87rem/1.45 system-ui,sans-serif;color:var(--ao-muted,#cbbfb2);margin-top:4px}
#aoPray435930 .aoRosaryChoice[aria-pressed=true],#aoPray435930 .aoMercyOptions button[aria-pressed=true]{border-color:rgba(210,190,151,.85);background:rgba(210,190,151,.13)}
#aoPray435930 .aoRosaryChooser .aoMercyOptions button{min-height:44px}
#aoPray435930 .aoRosaryChooser .aoMercyOptions button:disabled{opacity:.3}
#aoPray435930 .aoRosaryBegin{width:100%;padding:14px 18px;min-height:52px;border-radius:8px;border:1px solid rgba(210,190,151,.9);color:var(--ao-ink,#eee6dc);background:rgba(210,190,151,.17);font:500 1.1rem Georgia,serif}
#aoPray435930 .aoRosaryHeld{font-size:.86rem;color:var(--ao-muted,#cbbfb2);border-top:1px solid rgba(205,185,150,.2);padding-top:14px}
#aoPray435930 .aoRosaryChooser .aoMercySource small{display:block;margin-top:6px}
@media(min-width:650px){#aoPray435930 .aoRosaryChoiceGrid{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoMercyReader *{animation:none!important;transition:none!important}}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-pray-devotional-method-styles")){
 const n=document.createElement("style");n.id="ao-pray-devotional-method-styles";n.textContent=css;document.head.appendChild(n);
}
export const DEVOTIONAL_METHOD_STYLES_V1=true;
