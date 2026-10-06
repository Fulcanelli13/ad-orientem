export const TRADITIONAL_PRAY_V381_CSS=String.raw`
#aoPray435930 .aoTP381Hero{padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:linear-gradient(145deg,color-mix(in srgb,var(--liturgical-soft,rgba(199,174,109,.10)) 88%,transparent),rgba(255,255,255,.018))}
#aoPray435930 .aoTP381Hero small{display:block;color:var(--liturgical,#d8bd7d);font:650 .62rem/1.2 var(--font-display,system-ui);letter-spacing:.11em;text-transform:uppercase}
#aoPray435930 .aoTP381Hero h2{margin:6px 0 7px;font-size:clamp(1.4rem,5vw,2rem)}
#aoPray435930 .aoTP381Hero p{margin:0;color:var(--muted,#aeb2b8);line-height:1.55}
#aoPray435930 .aoTP381Tabs{display:flex;gap:7px;flex-wrap:wrap}
#aoPray435930 .aoTP381Tabs button{min-height:42px;padding:8px 13px;border-radius:999px;border:1px solid var(--border,rgba(255,255,255,.13));background:var(--surface-1,#151c24);color:inherit;font:650 .72rem/1.2 var(--font-display,system-ui)}
#aoPray435930 .aoTP381Tabs button.active{border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.12))}
#aoPray435930 .aoTP381PrayerList{display:grid;gap:8px}
#aoPray435930 .aoTP381PrayerList button{width:100%;min-height:64px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;text-align:left;padding:12px 14px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:15px;background:var(--surface-1,#151c24);color:inherit}
#aoPray435930 .aoTP381PrayerList b{font:600 1rem/1.2 var(--font-display,Georgia,serif)}
#aoPray435930 .aoTP381PrayerList small{grid-column:1;color:var(--muted,#aeb2b8);font-size:.75rem;line-height:1.35}
#aoPray435930 .aoTP381PrayerList i{grid-column:2;grid-row:1/3;color:var(--liturgical,#d8bd7d);font-style:normal}
#aoPray435930 .aoTP381Reader{white-space:pre-wrap;padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:var(--surface-1,#151c24);color:var(--text,#f3ead7);font:400 1.02rem/1.68 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoTP381PrayerCard{padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:var(--surface-1,#151c24)}
#aoPray435930 .aoTP381PrayerCard h3{margin:0 0 12px;font:600 1.18rem/1.2 var(--font-display,Georgia,serif)}
#aoPray435930 .aoTP381PrayerCard button[data-tp381-flip]{width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left;font:400 1.02rem/1.68 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoTP381Source{border-top:1px solid var(--border,rgba(255,255,255,.11));padding:12px 0}
#aoPray435930 .aoTP381Source summary{cursor:pointer;min-height:42px;display:flex;align-items:center;color:var(--text,#fff);font:650 .82rem/1.3 var(--font-display,system-ui)}
#aoPray435930 .aoTP381Source a{color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoTP381Fail{padding:15px;border:1px solid color-mix(in srgb,#c49a6c 55%,transparent);border-radius:14px;background:rgba(180,120,70,.07);color:var(--muted,#b7bec5);line-height:1.5}
#aoPray435930 .aoTP381InsertedSection .aoP435930ModuleCard{min-height:88px}
#aoPray435930 .aoTP381ModuleGlyph{width:38px;height:38px;display:block;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoTP381ModuleGlyph.mask{background:currentColor}
@media(max-width:560px){#aoPray435930 .aoTP381PrayerList button{min-height:60px}}
`;

export function installTraditionalPrayStyles(doc=globalThis.document){
  if(!doc?.head)return false;
  let style=doc.getElementById("ao-v381-traditional-pray-css");
  if(!style){
    style=doc.createElement("style");
    style.id="ao-v381-traditional-pray-css";
    style.textContent=TRADITIONAL_PRAY_V381_CSS;
    doc.head.appendChild(style);
  }
  return true;
}
if(typeof document!=="undefined")installTraditionalPrayStyles(document);
