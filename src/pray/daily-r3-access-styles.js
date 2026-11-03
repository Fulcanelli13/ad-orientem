/** R3: a visible book-style entry without replacing historical source-book pills. */
const CSS="\n#aoPray435930 .aoDailyAccessNav.aoDailyDirectChoices{\n display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));\n gap:7px!important;margin:8px 0 5px;width:100%;min-width:0;\n}\n#aoPray435930 .aoDailyAccessNav.aoDailyDirectChoices>button{\n min-height:44px;min-width:0;white-space:normal;overflow-wrap:anywhere;\n padding:8px 6px;font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);\n}\n#aoPray435930 .aoDailyAccessNav.aoDailyDirectChoices>button:only-child{\n grid-column:1/-1;\n}\n#aoPray435930 .aoDailyAccessNav.aoDailyDirectChoices .aoDailyContinuousShortcut{\n border:1px solid var(--liturgical,#c7ae6d);border-radius:12px;\n color:var(--text,#f3ead7);background:var(--liturgical-soft,rgba(199,174,109,.1));\n}\n#aoPray435930 .aoDailyAccessNav.aoDailyDirectChoices .aoDailyContinuousShortcut:focus-visible{\n outline:2px solid var(--liturgical,#c7ae6d);outline-offset:2px;\n}\n";
export function installDailyR3AccessStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById('ao-daily-r3-access-css'))return true;
 const style=doc.createElement('style');style.id='ao-daily-r3-access-css';style.textContent=CSS;doc.head.appendChild(style);return true;
}
if(typeof document!=='undefined')installDailyR3AccessStyles(document);
