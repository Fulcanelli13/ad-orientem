export const TRADITIONAL_PRAY_V381_CSS=String.raw`
#aoPray435930 .aoTPIntro{margin:0;color:var(--muted,#aeb2b8);font:400 .88rem/1.55 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoTPHero{display:grid;gap:8px;padding:4px 0 2px}
#aoPray435930 .aoTPHero small{color:var(--liturgical,#d8bd7d);font:700 .61rem/1.2 var(--font-display,system-ui);letter-spacing:.11em;text-transform:uppercase}
#aoPray435930 .aoTPHero h2{margin:0;font:600 clamp(1.35rem,5.2vw,1.85rem)/1.12 var(--font-display,Georgia,serif)}
#aoPray435930 .aoTPTabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(112px,1fr));gap:8px}
#aoPray435930 .aoTPTabs button{min-height:44px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:999px;background:var(--surface-1,#151c24);color:var(--muted,#aeb2b8);font:650 .72rem/1.2 var(--font-display,system-ui)}
#aoPray435930 .aoTPTabs button.active{border-color:var(--liturgical-border,rgba(216,189,125,.52));background:color-mix(in srgb,var(--liturgical,#d8bd7d) 10%,var(--surface-1,#151c24));color:var(--text,#f3ead7)}
#aoPray435930 .aoTPPrayerList{display:grid;gap:9px}
#aoPray435930 .aoTPPrayerRow{width:100%;display:grid;grid-template-columns:minmax(0,1fr) 30px;gap:12px;align-items:center;text-align:left;padding:13px 14px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:15px;background:var(--surface-1,#151c24);color:var(--text,#f3ead7)}
#aoPray435930 .aoTPPrayerRow span:first-child{display:grid;gap:3px;min-width:0}
#aoPray435930 .aoTPPrayerRow b{font:600 .94rem/1.25 var(--font-display,Georgia,serif)}
#aoPray435930 .aoTPPrayerRow small{color:var(--muted,#aeb2b8);font-size:.69rem;line-height:1.3}
#aoPray435930 .aoTPPrayerRow .aoTPRowIcon{justify-self:end;color:var(--liturgical,#d8bd7d);font-size:18px}
#aoPray435930 .aoTPReader{white-space:pre-wrap;padding:15px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:16px;background:color-mix(in srgb,var(--surface-1,#151c24) 96%,transparent);font:400 .98rem/1.72 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoTPSource{border-top:1px solid var(--border,rgba(255,255,255,.11));padding-top:10px}
#aoPray435930 .aoTPSource summary{cursor:pointer;color:var(--muted,#aeb2b8);font-size:.72rem}
#aoPray435930 .aoTPSource a{color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoTPLoading,#aoPray435930 .aoTPFailClosed{padding:14px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:14px;color:var(--muted,#aeb2b8);font:.82rem/1.5 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoTPPrayerHead{display:flex;align-items:center;justify-content:space-between;gap:12px}
#aoPray435930 .aoTPPrayerHead small{color:var(--liturgical,#d8bd7d);font:.62rem/1.2 var(--font-display,system-ui);letter-spacing:.1em}
#aoPray435930 .aoTPPrayerFlip{width:100%;text-align:left;border:0;background:transparent;color:inherit;padding:0}
@media(max-width:560px){#aoPray435930 .aoTPTabs{grid-template-columns:1fr 1fr}#aoPray435930 .aoTPTabs.three{grid-template-columns:1fr}}
`;

export function installTraditionalPrayStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 let style=doc.getElementById("ao-v381-traditional-pray-modular-css");
 if(!style){style=doc.createElement("style");style.id="ao-v381-traditional-pray-modular-css";style.textContent=TRADITIONAL_PRAY_V381_CSS;doc.head.appendChild(style)}
 return true;
}
if(typeof document!=="undefined")installTraditionalPrayStyles(document);
