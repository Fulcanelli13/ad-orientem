/**
 * B14: source-preserving, one-tap reading depth in the existing fourteen
 * Stations reader. Deliberately no new version, public rubric or text.
 */
const CSS=String.raw`
#aoPray435930 .aoStationsDirectReading{display:grid;gap:7px;min-width:0;margin:8px 0 12px}
#aoPray435930 .aoStationsDirectReadingChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;min-width:0}
#aoPray435930 .aoStationsDirectReadingChoices button{display:grid;align-content:center;gap:5px;text-align:left;min-width:0;min-height:68px;border-radius:11px;border:1px solid var(--liturgical-border,rgba(199,174,109,.29));background:transparent;color:var(--text,#eee9df);padding:10px 11px;cursor:pointer}
#aoPray435930 .aoStationsDirectReadingChoices button strong{font:600 clamp(.78rem,3vw,.92rem)/1.25 var(--ao-font-display,Georgia,serif);overflow-wrap:anywhere}
#aoPray435930 .aoStationsDirectReadingChoices button small{color:var(--muted,#aeb2b8);font:400 .68rem/1.3 var(--ao-font-ui,system-ui,sans-serif);overflow-wrap:anywhere}
#aoPray435930 .aoStationsDirectReadingChoices button[aria-pressed="true"]{border-color:var(--liturgical,#c7ae6d);background:var(--liturgical-soft,rgba(199,174,109,.11))}
#aoPray435930 .aoStationsDirectReadingChoices button[aria-pressed="true"] strong{color:var(--liturgical,#dec791)}
#aoPray435930 .aoStationsDirectReadingChoices button:focus-visible{outline:2px solid var(--liturgical,#c7ae6d);outline-offset:2px}
#aoPray435930 .aoStationsDirectReadingChoices button:disabled{cursor:not-allowed;opacity:.5}
#aoPray435930 .aoStationsDirectPublicNotice{color:var(--muted,#aeb2b8);font:400 .73rem/1.43 var(--ao-font-ui,system-ui,sans-serif);margin:1px 0 0}
@media(max-width:360px){#aoPray435930 .aoStationsDirectReadingChoices{gap:6px}
#aoPray435930 .aoStationsDirectReadingChoices button{padding:9px 7px;min-height:76px}
#aoPray435930 .aoStationsDirectReadingChoices button small{font-size:.65rem}}
`;
export function installStationsDirectAccessStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-stations-direct-access-styles"))return true;
 const style=doc.createElement("style");style.id="ao-pray-stations-direct-access-styles";
 style.textContent=CSS;doc.head.appendChild(style);return true;
}
if(typeof document!=="undefined")installStationsDirectAccessStyles(document);
