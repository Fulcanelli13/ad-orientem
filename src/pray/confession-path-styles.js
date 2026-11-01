const CONFESSION_CSS=String.raw`
#aoPray435930 .aoP435930ConfPathCards{display:grid;gap:10px;margin:8px 0 14px}
#aoPray435930 .aoP435930ConfPathCards button{display:grid;gap:6px;width:100%;min-height:76px;padding:15px 16px;text-align:left;color:var(--text,#f3ead7);border:1px solid var(--border,rgba(255,255,255,.16));border-radius:12px;background:transparent}
#aoPray435930 .aoP435930ConfPathCards button strong{font:600 1.04rem/1.3 var(--ao-font-display,Georgia,serif)}
#aoPray435930 .aoP435930ConfPathCards button span{font:400 .89rem/1.55 var(--ao-font-liturgical,Georgia,serif);color:var(--muted,#aeb2b8)}
#aoPray435930 .aoP435930ConfPathCards button.selected,#aoPray435930 .aoP435930ConfPathCards button[aria-pressed="true"]{border-color:var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.08))}
#aoPray435930 .aoP435930ConfPathCards button:focus-visible,#aoPray435930 .aoP435930GuideNav button:focus-visible{outline:2px solid var(--liturgical,#c7ae6d);outline-offset:3px}
#aoPray435930 .aoP435930ConfOneCard{display:flex;flex-direction:column;gap:15px;margin:10px 0 20px;padding:clamp(14px,4vw,22px);border:1px solid var(--border,rgba(255,255,255,.16));border-radius:12px;background:rgba(255,255,255,.025)}
#aoPray435930 .aoP435930ConfOneCard>small{font:600 .73rem/1.35 var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c7ae6d)}
#aoPray435930 .aoP435930ConfOneCard>h2{margin:0;font:600 clamp(1.2rem,4vw,1.55rem)/1.3 var(--ao-font-display,Georgia,serif)}
#aoPray435930 .aoP435930ConfOneCard>p{margin:0;font:400 1rem/1.62 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoP435930ConfOneCard .aoP435930ConfQuestions{padding-left:1.2rem;margin:0;display:grid;gap:15px;font:400 .98rem/1.6 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoP435930ConfSources{margin:20px 0;color:var(--muted,#aeb2b8);font:400 .8rem/1.55 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoP435930ConfSources summary{cursor:pointer;min-height:40px}
#aoPray435930 .aoP435930ConfSources a{display:block;margin-top:8px;color:var(--liturgical,#c7ae6d);overflow-wrap:anywhere}
@media (max-width:400px){#aoPray435930 .aoP435930ConfOneCard{padding-inline:13px}#aoPray435930 .aoP435930ConfPathCards button{padding-inline:12px}}
/* B13: visible, session-only prayer text alternatives inside the existing
   sacramental preparation; never an additional Confession pathway or rite. */
#aoPray435930 .aoP435930ConfContrition{display:grid;min-width:0;gap:9px;margin:15px 0 4px}
#aoPray435930 .aoP435930ConfContrition>h3{margin:0;font:600 .9rem/1.36 var(--ao-font-display,Georgia,serif)}
#aoPray435930 .aoP435930ConfContritionChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;min-width:0}
#aoPray435930 .aoP435930ConfContritionChoices button{min-width:0;min-height:44px;padding:9px 10px;border:1px solid var(--liturgical-border,rgba(199,174,109,.3));border-radius:10px;background:transparent;color:var(--text,#eee9df);font:500 .77rem/1.38 var(--ao-font-ui,system-ui,sans-serif);overflow-wrap:anywhere}
#aoPray435930 .aoP435930ConfContritionChoices button[aria-pressed="true"]{background:var(--liturgical-soft,rgba(199,174,109,.12));border-color:var(--liturgical,#c7ae6d);color:var(--liturgical,#dec791)}
#aoPray435930 .aoP435930ConfContritionChoices button:focus-visible{outline:2px solid var(--liturgical,#c7ae6d);outline-offset:2px}
#aoPray435930 .aoP435930ConfContritionSourceStatus{font:400 .74rem/1.52 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#aeb2b8);margin:0}
#aoPray435930 .aoP435930ConfContritionSourceStatus a{color:var(--liturgical,#dec791);overflow-wrap:anywhere}
@media(max-width:360px){#aoPray435930 .aoP435930ConfContritionChoices button{padding:9px 7px}}

/* 30 Oct Claude interim: visual correction of Confession stage strip and path list.
   Retain source-owned step handlers and source data; follow-up is required
   to remove the legacy optional time field from the runtime and its test. */
#aoPray435930 .aoP435930ConfNavShell{margin:3px 0 9px}
#aoPray435930 .aoP435930ConfNavShell>.aoP435930GuideRail{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:5px!important;padding:21px 0 0!important;border:0!important;background:transparent!important;overflow:visible!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button{position:relative!important;display:block!important;width:100%!important;min-width:0!important;height:44px!important;min-height:44px!important;padding:0!important;border:0!important;background:transparent!important;border-radius:0!important;box-shadow:none!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button>span{display:none!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button>b{position:absolute!important;left:0;top:-21px;color:var(--liturgical,#c7ae6d)!important;font:600 10px/1.2 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.08em!important;text-transform:uppercase!important;opacity:0!important;white-space:nowrap!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button.active>b{opacity:1!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button::after{content:""!important;position:absolute!important;inset:auto 0 20px!important;height:4px!important;border-radius:8px!important;background:var(--border,rgba(220,208,186,.22))!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button.active::after{height:5px!important;background:var(--liturgical,#c7ae6d)!important}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail button:focus-visible{outline:2px solid var(--liturgical,#c7ae6d)!important;outline-offset:1px!important;border-radius:8px!important}
#aoPray435930 .aoP435930ConfPathCards{gap:0!important;margin:2px 0 12px!important;border-top:1px solid var(--border,rgba(255,255,255,.16))}
#aoPray435930 .aoP435930ConfPathCards button{position:relative;display:grid;gap:2px;min-height:62px;padding:11px 30px 10px 2px;border:0;border-bottom:1px solid var(--border,rgba(255,255,255,.16));border-radius:0;background:transparent}
#aoPray435930 .aoP435930ConfPathCards button strong{font:500 17px/1.24 var(--ao-font-display,Georgia,serif)}
#aoPray435930 .aoP435930ConfPathCards button span{font:400 13px/1.28 var(--ao-font-ui,system-ui,sans-serif);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
#aoPray435930 .aoP435930ConfPathCards button::after{content:"›";position:absolute;right:8px;top:50%;transform:translateY(-50%);font:400 23px/1 var(--ao-font-display,Georgia,serif);color:var(--muted,#b8aea0)}
`;
export function installConfessionPathStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-confession-path-styles"))return true;
 const style=doc.createElement("style");
 style.id="ao-pray-confession-path-styles";
 style.textContent=CONFESSION_CSS;doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installConfessionPathStyles(document);
