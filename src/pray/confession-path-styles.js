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
