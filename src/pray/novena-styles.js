// Exact v43.59.31 Novena presentation CSS used by the N3 donor.
export const NOVENA_N3_CSS=String.raw`
/* Ad Orientem v43.59.31 — Guided Novenas N1. Uses the unified PRAY shell; no tracker/streak UI. */
#aoPray435930 .aoN1Hero{padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:linear-gradient(145deg,color-mix(in srgb,var(--liturgical-soft,rgba(199,174,109,.10)) 88%,transparent),rgba(255,255,255,.018))}
#aoPray435930 .aoN1HeroIcon{width:58px;height:58px;display:grid;place-items:center;margin:0 0 12px;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoN1HeroIcon svg{width:58px;height:58px;display:block}
#aoPray435930 .aoN1Hero small,#aoPray435930 .aoN1Kicker{display:block;color:var(--liturgical,#d8bd7d);font:650 .62rem/1.2 var(--font-display,system-ui);letter-spacing:.11em;text-transform:uppercase}
#aoPray435930 .aoN1Hero h2{margin:6px 0 7px;font-size:clamp(1.45rem,5vw,2.05rem)}
#aoPray435930 .aoN1Hero p{margin:0;color:var(--muted,#aeb2b8);line-height:1.55}
#aoPray435930 .aoN1Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#aoPray435930 .aoN1Card{min-height:132px;text-align:left;padding:15px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:16px;background:var(--surface-1,#151c24);color:inherit;display:flex;flex-direction:column;gap:5px}
#aoPray435930 .aoN1Card.active{border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.08))}
#aoPray435930 .aoN1Card b{font:600 1.03rem/1.2 var(--font-display,Georgia,serif)}
#aoPray435930 .aoN1Card span{color:var(--muted,#aeb2b8);font-size:.86rem;line-height:1.35}
#aoPray435930 .aoN1Card em{margin-top:auto;color:var(--liturgical,#d8bd7d);font-style:normal;font:600 .68rem/1.2 var(--font-display,system-ui);letter-spacing:.045em;text-transform:uppercase}
#aoPray435930 .aoN1DayGrid{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:5px}
#aoPray435930 .aoN1DayGrid button{min-height:44px;border:1px solid var(--border,rgba(255,255,255,.13));border-radius:11px;background:var(--surface-1,#151c24);color:inherit;font:650 .78rem/1 var(--font-display,system-ui)}
#aoPray435930 .aoN1DayGrid button.active{border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.12));color:var(--text,#fff)}
#aoPray435930 .aoN1Info{padding:15px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:15px;background:rgba(255,255,255,.022)}
#aoPray435930 .aoN1Info h3{margin:0 0 7px;font-size:1.05rem}
#aoPray435930 .aoN1Info p{margin:0;color:var(--muted,#b3bbc3);line-height:1.55}
#aoPray435930 .aoN1Details{border-top:1px solid var(--border,rgba(255,255,255,.11));padding:12px 0}
#aoPray435930 .aoN1Details summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font:650 .84rem/1.3 var(--font-display,system-ui);color:var(--text,#fff)}
#aoPray435930 .aoN1Details p,#aoPray435930 .aoN1Details li{color:var(--muted,#b3bbc3);line-height:1.55}
#aoPray435930 .aoN1Details a{color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoN1StageRail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
#aoPray435930 .aoN1StageRail span{height:4px;border-radius:999px;background:rgba(255,255,255,.11)}
#aoPray435930 .aoN1StageRail span.done,#aoPray435930 .aoN1StageRail span.current{background:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoN1SourceText{padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:var(--surface-1,#151c24)}
#aoPray435930 .aoN1SourceText small{display:block;color:var(--liturgical,#d8bd7d);font:650 .62rem/1.2 var(--font-display,system-ui);letter-spacing:.1em;text-transform:uppercase;margin-bottom:9px}
#aoPray435930 .aoN1SourceText p{white-space:pre-wrap;margin:0;color:var(--text,#f3ead7);font:400 1.03rem/1.68 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoN1Canon{padding:14px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:14px;background:rgba(255,255,255,.022)}
#aoPray435930 .aoN1CanonHead{display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin-bottom:8px}
#aoPray435930 .aoN1CanonHead b{font-family:var(--font-display,Georgia,serif)}
#aoPray435930 .aoN1CanonHead span{color:var(--liturgical,#d8bd7d);font:650 .67rem/1 var(--font-display,system-ui);letter-spacing:.06em}
#aoPray435930 .aoN1Canon button[data-n1-flip]{width:100%;text-align:left;border:0;background:transparent;color:inherit;padding:0;font:400 .98rem/1.6 var(--font-liturgical,Georgia,serif)}
#aoPray435930 .aoN1Nav{display:flex;gap:8px;justify-content:space-between}
#aoPray435930 .aoN1Nav button{min-height:44px;border-radius:999px;padding:9px 14px;border:1px solid var(--border,rgba(255,255,255,.13));background:var(--surface-1,#151c24);color:inherit;font:650 .72rem/1.2 var(--font-display,system-ui);letter-spacing:.04em;text-transform:uppercase}
#aoPray435930 .aoN1Nav button.primary{margin-left:auto;border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.12))}
#aoPray435930 .aoN1Calendar{padding:13px 14px;border-left:3px solid var(--liturgical,#d8bd7d);border-radius:0 12px 12px 0;background:var(--liturgical-soft,rgba(199,174,109,.07));line-height:1.5}
#aoPray435930 .aoN1Fine{color:var(--muted,#9ba7b0);font-size:.78rem;line-height:1.45}
#aoPray435930 .aoN1FailClosed{padding:16px;border:1px solid color-mix(in srgb,#c49a6c 55%,transparent);border-radius:14px;background:rgba(180,120,70,.07);color:var(--muted,#b7bec5);line-height:1.5}
#aoPray435930 .aoN1InsertedSection .aoP435930ModuleCard svg{width:32px;height:32px;color:var(--liturgical,#d8bd7d);margin-bottom:3px}
@media(max-width:560px){#aoPray435930 .aoN1Grid{grid-template-columns:1fr}#aoPray435930 .aoN1DayGrid{grid-template-columns:repeat(5,minmax(0,1fr))}}
`;

export function installNovenaStyles(doc=globalThis.document){
  if(!doc?.head)return false;
  let style=doc.getElementById("ao-v435931-novena-n1-css");
  if(!style){
    style=doc.createElement("style");
    style.id="ao-v435931-novena-n1-css";
    style.textContent=NOVENA_N3_CSS;
    doc.head.appendChild(style);
  }
  return true;
}

if(typeof document!=="undefined")installNovenaStyles(document);
