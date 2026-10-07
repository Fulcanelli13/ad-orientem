export const TRADITIONAL_PRAY_V381_CSS=String.raw`
#aoPray435930 .aoTP381DonorBody{gap:0}
#aoPray435930 .aoTP381Glossary{align-self:flex-start;margin:14px 0 -4px;padding:7px 10px;border:1px solid var(--liturgical-border,rgba(199,174,109,.28));border-radius:999px;background:transparent;color:var(--liturgical,#c7ae6d);font:600 .67rem/1.1 var(--ao-font-display,var(--font-display,system-ui));letter-spacing:.035em}\n#aoPray435930 .aoTP381Intro{margin:0;padding:18px 0 11px;color:var(--muted,rgba(238,233,223,.7));font:400 .94rem/1.5 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif))}
#aoPray435930 .aoTP381Section{margin:18px 0}
#aoPray435930 .aoTP381Section h2{margin:0 0 8px;font:600 1.2rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif))}
#aoPray435930 .aoTP381Section>p{margin:0 0 10px;color:var(--muted,rgba(238,233,223,.72));line-height:1.52}
#aoPray435930 .aoTP381Status{display:inline-flex;align-self:flex-start;align-items:center;min-height:23px;padding:3px 7px;border:1px solid var(--liturgical-border,rgba(199,174,109,.35));border-radius:999px;color:var(--liturgical,#c7ae6d);font:600 .62rem/1.2 var(--ao-font-display,var(--font-display,serif));letter-spacing:.065em;text-transform:uppercase;margin:0 0 8px}
#aoPray435930 .aoTP381Tabs,#aoPray435930 .aoTP381Lang{display:flex;gap:6px;overflow:auto;padding:3px 0 10px}
#aoPray435930 .aoTP381Tabs button,#aoPray435930 .aoTP381Lang button{white-space:nowrap;min-height:0;border:1px solid var(--border,rgba(255,255,255,.16));background:transparent;color:inherit;border-radius:999px;padding:7px 10px;font:400 .72rem/1.2 var(--ao-font-display,var(--font-display,system-ui))}
#aoPray435930 .aoTP381Tabs button.active,#aoPray435930 .aoTP381Lang button.active{border-color:var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.12))}
#aoPray435930 .aoTP381PrayerList{display:grid;gap:0;border-top:1px solid var(--border,rgba(255,255,255,.13));margin:12px 0}
#aoPray435930 .aoTP381PrayerList button{width:100%;min-height:0;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:4px 12px;align-items:center;text-align:left;padding:13px 2px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));border-radius:0;background:transparent;color:inherit}
#aoPray435930 .aoTP381PrayerList button>span{min-width:0;display:grid;grid-template-rows:auto auto;gap:4px}
#aoPray435930 .aoTP381PrayerList b{display:block;font:600 .98rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif))}
#aoPray435930 .aoTP381PrayerList small{display:block;color:var(--muted,#aeb2b8);font-size:.75rem;line-height:1.35}
#aoPray435930 .aoTP381PrayerList i{grid-column:2;grid-row:1/3;color:var(--liturgical,#c7ae6d);font-style:normal}
#aoPray435930 .aoTP381Reader{white-space:pre-line;padding:12px 0;border:0;border-radius:0;background:transparent;color:var(--text,#f3ead7);font:400 1.02rem/1.7 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif))}
#aoPray435930 .aoTP381PrayerCard{padding:14px 0;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.13));border-radius:0;background:transparent}
#aoPray435930 .aoTP381PrayerCard h3{margin:0 0 8px;font:600 1.04rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif))}
#aoPray435930 .aoTP381PrayerCard button[data-tp381-flip]{width:100%;padding:0;border:0;background:transparent;color:inherit;text-align:left;font:400 1.02rem/1.68 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif))}
#aoPray435930 .aoTP381Source{margin-top:10px;padding:0;border:0;font-size:.72rem}
#aoPray435930 .aoTP381Source summary{cursor:pointer;min-height:0;display:block;color:var(--muted,rgba(238,233,223,.58));font:400 .72rem/1.35 var(--ao-font-display,var(--font-display,system-ui))}
#aoPray435930 .aoTP381Source a{color:var(--liturgical,#c7ae6d)}
#aoPray435930 .aoTP381Fail{padding:10px 12px;border:0;border-left:2px solid var(--liturgical,#c7ae6d);border-radius:0;background:var(--liturgical-soft,rgba(199,174,109,.08));color:var(--muted,#b7bec5);font-size:.82rem;line-height:1.45;margin:10px 0}
#aoPray435930 .aoTP381InsertedSection .aoP435930ModuleCard{min-height:88px}
#aoPray435930 .aoTP381ModuleGlyph{width:38px;height:38px;display:block;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoTP381ModuleGlyph.mask{background:currentColor}
@media(max-width:560px){#aoPray435930 .aoTP381PrayerList button{padding-block:13px}}
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
