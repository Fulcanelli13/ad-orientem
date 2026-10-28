/** B16: compact source-owned hymn choice and priest-first bedside stages. */
const CSS=String.raw`
#aoPray435930 .aoPrayHymnsDirect,#aoPray435930 .aoBedsideDirect{display:grid;gap:8px;min-width:0;margin:7px 0 13px}
#aoPray435930 .aoPrayHymnsDirect>p{margin:0;color:var(--muted,#adb0b7);font:500 .74rem/1.4 var(--ao-font-ui,system-ui,sans-serif)}
#aoPray435930 .aoPrayHymnsDirectChoices,#aoPray435930 .aoBedsideDirectChoices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px;min-width:0}
#aoPray435930 .aoPrayHymnsDirectChoices button,#aoPray435930 .aoBedsideDirectChoices button{min-width:0;min-height:49px;text-align:center;overflow-wrap:anywhere;padding:8px 7px;border:1px solid var(--border,rgba(255,255,255,.22));border-radius:10px;background:var(--surface-1,rgba(22,27,34,.8));color:var(--text,#eee9df);font:600 .75rem/1.3 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
#aoPray435930 .aoPrayHymnsDirectChoices button[aria-pressed="true"],#aoPray435930 .aoBedsideDirectChoices button[aria-pressed="true"]{border-color:var(--liturgical,#d6bd7d);background:var(--liturgical-soft,rgba(214,189,125,.1));color:var(--liturgical,#ddc997)}
#aoPray435930 .aoPrayHymnsDirectChoices button:focus-visible,#aoPray435930 .aoBedsideDirectChoices button:focus-visible{outline:2px solid var(--liturgical,#d6bd7d);outline-offset:2px}
#aoPray435930 .aoBedsideDirect>small{color:var(--muted,#adb0b7);font:500 .69rem/1.45 var(--ao-font-ui,system-ui,sans-serif)}
@media(max-width:360px){#aoPray435930 .aoPrayHymnsDirectChoices{grid-template-columns:repeat(2,minmax(0,1fr))}
#aoPray435930 .aoBedsideDirectChoices{grid-template-columns:1fr;gap:5px}
#aoPray435930 .aoBedsideDirectChoices button{min-height:42px;text-align:left;padding:9px 11px}}
`;
export function installTraditionalPrayDirectB16Styles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-traditional-pray-b16-direct-styles"))return true;
 const style=doc.createElement("style");style.id="ao-traditional-pray-b16-direct-styles";
 style.textContent=CSS;doc.head.appendChild(style);return true;
}
if(typeof document!=="undefined")installTraditionalPrayDirectB16Styles(document);
