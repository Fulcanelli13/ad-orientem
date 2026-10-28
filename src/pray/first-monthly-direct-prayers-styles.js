/**
 * B15: existing Sacred Heart and Rosary sources, with no new devotional texts
 * or claims of completed Friday/Saturday sacramental acts.
 */
const CSS=String.raw`
#aoPray435930 .aoFirstMonthlyDirect{display:grid;gap:8px;min-width:0;margin:10px 0 17px;padding:11px;border:1px solid var(--border,rgba(255,255,255,.17));background:var(--surface-1,rgba(22,27,34,.8));border-radius:14px}
#aoPray435930 .aoFirstMonthlyDirectTop{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:6px}
#aoPray435930 .aoFirstMonthlyDirectTop>strong{font:600 .9rem/1.3 var(--ao-font-display,Georgia,serif)}
#aoPray435930 .aoFirstMonthlyDirectTop>small{font:500 .7rem/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#adb0b7)}
#aoPray435930 .aoFirstMonthlyDirectChoices{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,140px),1fr));gap:8px;min-width:0}
#aoPray435930 .aoFirstMonthlyDirectChoices button{display:grid;align-content:center;gap:5px;min-width:0;min-height:64px;text-align:left;border:1px solid var(--liturgical-border,rgba(199,174,109,.37));border-radius:10px;background:var(--liturgical-soft,rgba(199,174,109,.085));color:var(--text,#eee9df);padding:11px 12px;cursor:pointer}
#aoPray435930 .aoFirstMonthlyDirectChoices button strong{font:600 .83rem/1.34 var(--ao-font-display,Georgia,serif);overflow-wrap:anywhere}
#aoPray435930 .aoFirstMonthlyDirectChoices button small{font:400 .68rem/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#adb0b7);overflow-wrap:anywhere}
#aoPray435930 .aoFirstMonthlyDirectChoices button:focus-visible{outline:2px solid var(--liturgical,#d8bd7d);outline-offset:2px}
#aoPray435930 .aoFirstMonthlyDirect>p{margin:0;font:400 .72rem/1.46 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#adb0b7)}
@media(max-width:360px){#aoPray435930 .aoFirstMonthlyDirect{padding:9px}#aoPray435930 .aoFirstMonthlyDirectChoices{grid-template-columns:1fr;gap:6px}}
`;
export function installFirstMonthlyDirectStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById('ao-pray-first-monthly-direct-styles'))return true;
 const e=doc.createElement('style');e.id='ao-pray-first-monthly-direct-styles';
 e.textContent=CSS;doc.head.appendChild(e);return true;
}
if(typeof document!=='undefined')installFirstMonthlyDirectStyles(document);
