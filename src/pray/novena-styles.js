// Exact v43.59.31 Novena presentation CSS used by the N3 donor.
export const NOVENA_N3_CSS=String.raw`
/* Ad Orientem v43.59.31 — Guided Novenas N1. Uses the unified PRAY shell; no tracker/streak UI. */
#aoPray435930 .aoN1Hero{padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:linear-gradient(145deg,color-mix(in srgb,var(--liturgical-soft,rgba(199,174,109,.10)) 88%,transparent),rgba(255,255,255,.018))}
#aoPray435930 .aoN1HeroIcon{width:58px;height:58px;display:grid;place-items:center;margin:0 0 12px;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoN1HeroIcon svg{width:58px;height:58px;display:block}
#aoPray435930 .aoN1Hero small,#aoPray435930 .aoN1Kicker{display:block;color:var(--liturgical,#d8bd7d);font:650 .62rem/1.2 var(--ao-font-display,var(--font-display,system-ui));letter-spacing:.11em;text-transform:uppercase}
#aoPray435930 .aoN1Hero h2{margin:6px 0 7px;font-size:clamp(1.45rem,5vw,2.05rem)}
#aoPray435930 .aoN1Hero p{margin:0;color:var(--muted,#aeb2b8);line-height:1.55}
#aoPray435930 .aoN1Grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#aoPray435930 .aoN1Card{min-height:132px;text-align:left;padding:15px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:16px;background:var(--surface-1,#151c24);color:inherit;display:flex;flex-direction:column;gap:5px}
#aoPray435930 .aoN1Card.active{border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.08))}
#aoPray435930 .aoN1Card b{font:600 1.03rem/1.2 var(--ao-font-display,var(--font-display,Georgia,serif))}
#aoPray435930 .aoN1Card span{color:var(--muted,#aeb2b8);font-size:.86rem;line-height:1.35}
#aoPray435930 .aoN1Card em{margin-top:auto;color:var(--liturgical,#d8bd7d);font-style:normal;font:600 .68rem/1.2 var(--ao-font-display,var(--font-display,system-ui));letter-spacing:.045em;text-transform:uppercase}
#aoPray435930 .aoN1DayGrid{display:grid;grid-template-columns:repeat(9,minmax(0,1fr));gap:5px}
#aoPray435930 .aoN1DayGrid button{min-height:44px;border:1px solid var(--border,rgba(255,255,255,.13));border-radius:11px;background:var(--surface-1,#151c24);color:inherit;font:650 .78rem/1 var(--ao-font-display,var(--font-display,system-ui))}
#aoPray435930 .aoN1DayGrid button.active{border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.12));color:var(--text,#fff)}
#aoPray435930 .aoN1Info{padding:15px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:15px;background:rgba(255,255,255,.022)}
#aoPray435930 .aoN1Info h3{margin:0 0 7px;font-size:1.05rem}
#aoPray435930 .aoN1Info p{margin:0;color:var(--muted,#b3bbc3);line-height:1.55}
#aoPray435930 .aoN1Details{border-top:1px solid var(--border,rgba(255,255,255,.11));padding:12px 0}
#aoPray435930 .aoN1Details summary{cursor:pointer;min-height:44px;display:flex;align-items:center;font:650 .84rem/1.3 var(--ao-font-display,var(--font-display,system-ui));color:var(--text,#fff)}
#aoPray435930 .aoN1Details p,#aoPray435930 .aoN1Details li{color:var(--muted,#b3bbc3);line-height:1.55}
#aoPray435930 .aoN1Details a{color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoN1StageRail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:4px}
#aoPray435930 .aoN1StageRail span{height:5px;border-radius:999px;background:color-mix(in srgb,var(--text,#f3ead7) 17%,transparent)}
#aoPray435930 .aoN1StageRail span.done,#aoPray435930 .aoN1StageRail span.current{background:var(--liturgical,#d8bd7d)}
/* One quiet progress cue for the actual source-owned guided stages.
   Simple mode keeps the nine-day folio and does not invent stages. */
#aoPray435930 .aoN1Reader .aoN1StageIndicator{display:grid;gap:8px;margin:5px 2px 14px;min-width:0}
#aoPray435930 .aoN1Reader .aoN1StageCaption{font:500 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--text,#f3ead7)}
#aoPray435930 .aoN1Reader .aoN1StageRail{width:100%;min-width:0}
#aoPray435930 .aoN1Reader .aoN1StageRail span.current{box-shadow:0 0 0 1px color-mix(in srgb,var(--liturgical,#d8bd7d) 30%,transparent)}
#aoPray435930 .aoN1SourceText{padding:18px;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:18px;background:var(--surface-1,#151c24)}
#aoPray435930 .aoN1SourceText small{display:block;color:var(--liturgical,#d8bd7d);font:650 .62rem/1.2 var(--ao-font-display,var(--font-display,system-ui));letter-spacing:.1em;text-transform:uppercase;margin-bottom:9px}
#aoPray435930 .aoN1SourceText p{white-space:pre-wrap;margin:0;color:var(--text,#f3ead7);font:400 1.03rem/1.68 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif))}
#aoPray435930 .aoN1Canon{padding:14px;border:1px solid var(--border,rgba(255,255,255,.11));border-radius:14px;background:rgba(255,255,255,.022)}
#aoPray435930 .aoN1CanonHead{display:flex;justify-content:space-between;gap:10px;align-items:baseline;margin-bottom:8px}
#aoPray435930 .aoN1CanonHead b{font-family:var(--ao-font-display,var(--font-display,Georgia,serif))}
#aoPray435930 .aoN1CanonHead span{color:var(--liturgical,#d8bd7d);font:650 .67rem/1 var(--ao-font-display,var(--font-display,system-ui));letter-spacing:.06em}
#aoPray435930 .aoN1Canon button[data-n1-flip]{width:100%;text-align:left;border:0;background:transparent;color:inherit;padding:0;font:400 .98rem/1.6 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif))}
#aoPray435930 .aoN1Nav{display:flex;gap:8px;justify-content:space-between}
#aoPray435930 .aoN1Nav button{min-height:44px;border-radius:999px;padding:9px 14px;border:1px solid var(--border,rgba(255,255,255,.13));background:var(--surface-1,#151c24);color:inherit;font:650 .72rem/1.2 var(--ao-font-display,var(--font-display,system-ui));letter-spacing:.04em;text-transform:uppercase}
#aoPray435930 .aoN1Nav button.primary{margin-left:auto;border-color:var(--liturgical,#d8bd7d);background:var(--liturgical-soft,rgba(199,174,109,.12))}
#aoPray435930 .aoN1Calendar{padding:13px 14px;border-left:3px solid var(--liturgical,#d8bd7d);border-radius:0 12px 12px 0;background:var(--liturgical-soft,rgba(199,174,109,.07));line-height:1.5}
#aoPray435930 .aoN1Fine{color:var(--muted,#9ba7b0);font-size:.78rem;line-height:1.45}
#aoPray435930 .aoN1FailClosed{padding:16px;border:1px solid color-mix(in srgb,#c49a6c 55%,transparent);border-radius:14px;background:rgba(180,120,70,.07);color:var(--muted,#b7bec5);line-height:1.5}
#aoPray435930 .aoN1InsertedSection .aoP435930ModuleCard svg{width:32px;height:32px;color:var(--liturgical,#d8bd7d);margin-bottom:3px}

/* Canonical Novena day reader adopts the shared title/timeline/paragraph model. */
#aoPray435930 .aoN1Reader{min-width:0}
#aoPray435930 .aoN1Reader .aoDevoSequenceTimeline{margin:8px 0 0}
#aoPray435930 .aoN1Reader .aoDevoCard{min-width:0}
#aoPray435930 .aoN1Reader .aoDevoCardScroll{display:block;padding:18px 15px 30dvh;min-height:min(350px,52dvh)}
#aoPray435930 .aoN1Reader .aoDevoCardScroll>.aoN1SourceText,
#aoPray435930 .aoN1Reader .aoDevoCardScroll>.aoN1Canon,
#aoPray435930 .aoN1Reader .aoDevoCardScroll>.aoN1Info,
#aoPray435930 .aoN1Reader .aoDevoCardScroll>.aoN1Calendar{margin-bottom:20px}
#aoPray435930 .aoN1Reader .aoN1SourceText{background:transparent;border:0;border-radius:0;padding:8px 0}
#aoPray435930 .aoN1Reader .aoN1SourceText .aoN1PrayerParagraph{margin:0 0 22px;color:var(--text,#f3ead7);font:400 clamp(18px,4.5vw,22px)/1.66 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoN1Reader .aoN1SourceText .aoN1PrayerParagraph:last-of-type{margin-bottom:8px}
#aoPray435930 .aoN1Reader .aoN1Canon{background:transparent}
#aoPray435930 .aoN1Reader .aoN1Nav{margin:16px 0 26px}
#aoPray435930 .aoN1Reader .aoDevoCardScroll details:not([open]) .aoDevoParagraph{opacity:1!important}


/* Quiet nine-day folio: day identity is real, but not a streak or score. */
#aoPray435930 .aoN1DetailFolio{padding-block:10px 28px}
#aoPray435930 .aoN1ContextLine{
 border-bottom:1px solid var(--border,rgba(255,255,255,.13));
 padding:8px 2px 15px;margin:0 0 11px;
 display:grid;grid-template-columns:auto 1fr;gap:5px 12px;align-items:baseline;
 color:var(--muted,#aeb2b8);font:12px/1.4 var(--ao-font-liturgical,Georgia,serif)
}
#aoPray435930 .aoN1ContextLine>span{font-style:italic;color:var(--liturgical,#c6aa83)}
#aoPray435930 .aoN1ContextLine>b{
 font-weight:400;font-family:var(--ao-font-liturgical,Georgia,serif);color:var(--text,#e9e2d7)
}
#aoPray435930 .aoN1ContextLine>small{grid-column:1/-1;color:var(--muted,#aeb2b8);font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoN1DetailFolio .aoP435930Seg{margin:7px 0 13px;max-width:100%}
#aoPray435930 .aoN1DayFolio{
 display:grid;grid-template-columns:1fr auto;column-gap:12px;
 align-items:baseline;margin:7px 0 14px
}
#aoPray435930 .aoN1DayFolioLabel{
 color:var(--muted,#aeb2b8);
 font:italic 14px/1.4 var(--ao-font-liturgical,Georgia,serif)
}
#aoPray435930 .aoN1DayFolioActive{
 color:var(--text,#e9e2d7);
 font:12px/1.3 var(--ao-font-liturgical,Georgia,serif);
 white-space:nowrap
}
#aoPray435930 .aoN1DayGrid{
 grid-column:1/-1;display:grid;grid-template-columns:repeat(9,minmax(0,1fr));
 gap:4px;margin:11px 0 5px;
}
#aoPray435930 .aoN1DayGrid button.aoN1DayLeaf{
 min-height:50px;min-width:0;padding:5px 0 4px;
 border:1px solid transparent;border-radius:5px;
 background:transparent;color:var(--muted,#aba198);
 display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
 font:normal 11px/1.1 var(--ao-font-liturgical,Georgia,serif);
 box-shadow:none
}
#aoPray435930 .aoN1DayLeafRule{
 width:3px;height:17px;display:block;border-radius:1px;
 background:color-mix(in srgb,var(--liturgical,#b9a17d) 38%,transparent)
}
#aoPray435930 .aoN1DayGrid button.aoN1DayLeaf.active{
 color:var(--text,#eee4d5);
 border-color:color-mix(in srgb,var(--liturgical,#c5a981) 40%,transparent);
 background:color-mix(in srgb,var(--liturgical,#c5a981) 7%,transparent)
}
#aoPray435930 .aoN1DayLeaf.active .aoN1DayLeafRule{
 width:4px;height:25px;background:var(--liturgical,#c5a981)
}
#aoPray435930 .aoN1DayGrid button.aoN1DayLeaf:focus-visible,
#aoPray435930 .aoN1DayDisclosure>summary:focus-visible{
 outline:2px solid var(--liturgical,#c5a981);outline-offset:2px
}
#aoPray435930 .aoN1PrayDay{
 min-height:47px;width:100%;margin:3px 0 15px;
 border-radius:7px;background:color-mix(in srgb,var(--liturgical,#b9a17d) 14%,var(--surface-1,#151c24))
}
#aoPray435930 .aoN1AboutDisclosure{
 margin:13px 0 20px;border-top:1px solid var(--border,rgba(255,255,255,.14));
}
#aoPray435930 .aoN1AboutDisclosure>summary{
 min-height:47px;display:flex;align-items:center;cursor:pointer;
 font:italic 13px/1.45 var(--ao-font-liturgical,Georgia,serif);
 color:var(--muted,#aaa4a0);
}
#aoPray435930 .aoN1AboutContents{padding:10px 0 20px}
#aoPray435930 .aoN1AboutContents>p{line-height:1.6;color:var(--muted,#aaa4a0)}
#aoPray435930 .aoN1AboutContents .aoN1AboutFeast{
 color:var(--text,#ebe1d1);font:400 16px/1.5 var(--ao-font-liturgical,Georgia,serif)
}
#aoPray435930 .aoN1Reader .aoP435930Seg{margin:0 0 6px}
#aoPray435930 .aoN1DayDisclosure{
 border-block:1px solid var(--border,rgba(255,255,255,.14));margin:2px 0 8px
}
#aoPray435930 .aoN1DayDisclosure>summary{
 display:flex;justify-content:space-between;align-items:center;
 min-height:44px;gap:9px;cursor:pointer;list-style:none;
}
#aoPray435930 .aoN1DayDisclosure>summary::-webkit-details-marker{display:none}
#aoPray435930 .aoN1DayDisclosure>summary:after{content:"⌄";font-size:18px;color:var(--muted,#aaa4a0)}
#aoPray435930 .aoN1DayDisclosure[open]>summary:after{transform:rotate(180deg)}
#aoPray435930 .aoN1DayDisclosure>summary .aoN1DayFolioLabel{font-size:12px}
#aoPray435930 .aoN1DayDisclosure .aoN1DayGrid{margin:3px 0 9px}
#aoPray435930 .aoN1Reader .aoDevoSequenceTimeline{
 position:relative!important;top:auto!important;z-index:1;
 min-height:44px!important;padding:0!important;margin:0 0 8px!important;
 background:transparent!important;border-block:0!important;
}
#aoPray435930 .aoN1Reader .aoDevoSequenceTimeline .aoDevoStop{
 flex:0 0 max(98px,37%)!important;min-height:44px!important;
 border:0!important;border-bottom:1px solid var(--border,rgba(255,255,255,.18))!important;
 border-radius:0!important;background:transparent!important;
 box-shadow:none!important;padding:6px 8px!important;
 text-align:center!important;place-content:center!important;
}
#aoPray435930 .aoN1Reader .aoDevoSequenceTimeline .aoDevoStop.active{
 border-bottom-color:var(--liturgical,#beaa84)!important;
 color:var(--text,#eee2d2)!important;
}
#aoPray435930 .aoN1Reader .aoDevoSequenceTimeline .aoDevoStopNumber{display:none!important}
#aoPray435930 .aoN1Reader .aoDevoSequenceTimeline .aoDevoStopTitle{font:italic 12px/1.3 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoN1Reader .aoDevoCardHead{padding:10px 12px 8px}
#aoPray435930 .aoN1Reader .aoDevoCardNumber{display:none}
#aoPray435930 .aoN1Reader .aoDevoCardScroll{padding:13px 17px 27dvh}
@media(max-width:560px){
 #aoPray435930 .aoN1DayFolio .aoN1DayGrid{grid-template-columns:repeat(5,minmax(0,1fr))}
 #aoPray435930 .aoN1DetailFolio{padding-block:6px 25px}
 #aoPray435930 .aoN1Reader .aoDevoSequenceTimeline .aoDevoStop{flex-basis:52%!important}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoN1DayFolio *,
 #aoPray435930 .aoN1Reader *{animation:none!important;transition:none!important}
}

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
