/**
 * Choir family — retain the application's existing dark typographic system.
 * Each sourced stanza, psalm verse, litany invocation and response owns a
 * focus beat; collective replies are never permanently muted.
 */
export const CHOIR_F02_F03_CSS=String.raw`
#aoPray435930 .aoChoirPrayer{max-width:660px;margin:0 auto;padding:clamp(14px,4vw,30px) clamp(11px,4vw,29px);background:transparent;border:0;box-shadow:none}
#aoPray435930 .aoChoirPrayer .aoP435930PrayerHead{
 display:flex;justify-content:space-between;align-items:start;gap:10px;
 border-bottom:1px solid var(--liturgical-border,rgba(199,174,109,.33));
 padding-bottom:17px;margin-bottom:25px;
}
#aoPray435930 .aoChoirPrayer .aoP435930PrayerHead>div{min-width:0}
#aoPray435930 .aoChoirPrayer .aoP435930PrayerHead h3{
 margin:7px 0 0;font:500 clamp(23px,5.6vw,33px)/1.25 var(--ao-font-display,Georgia,serif);
}
#aoPray435930 .aoChoirType{
 display:block;letter-spacing:.11em;text-transform:uppercase;
 font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#d7bb84);
}
#aoPray435930 .aoChoirLanguage{
 flex:0 0 auto;min-height:44px;max-width:42%;padding:8px 12px;
 border:1px solid var(--liturgical-border,rgba(199,174,109,.4));
 border-radius:8px;background:transparent;color:var(--liturgical,#d7bb84);
 font:500 12px/1.25 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoChoirLanguage:focus-visible{
 outline:2px solid var(--liturgical,#d7bb84);outline-offset:3px;
}
#aoPray435930 .aoChoirFaces [hidden]{display:none!important}
#aoPray435930 .aoChoirFace{max-width:51ch;margin:0 auto;display:block}
#aoPray435930 .aoChoirBeat{
 display:block;margin:0 0 clamp(17px,3.2vh,24px);padding:0;
 font:400 clamp(18px,4.7vw,23px)/1.7 var(--ao-font-liturgical,Georgia,serif);
 color:var(--text,#f1e7d7);overflow-wrap:break-word;
 transition:opacity .2s ease;
}
#aoPray435930 .aoChoirStanzaSpace{height:clamp(13px,3vh,27px)}
#aoPray435930 .aoChoirPrayer[data-ao-choir-kind="hymn"] .aoChoirBeat,
#aoPray435930 .aoChoirPrayer[data-ao-choir-kind="sequence"] .aoChoirBeat,
#aoPray435930 .aoChoirPrayer[data-ao-choir-kind="responsory"] .aoChoirBeat{
 margin-bottom:9px;line-height:1.55
}
#aoPray435930 .aoChoirPrayer[data-ao-choir-kind="litany"] .aoChoirFace{max-width:57ch}
#aoPray435930 .aoChoirPrayer[data-ao-choir-kind="litany"] .aoChoirBeat{
 margin-bottom:12px;font-size:clamp(17px,4.4vw,21px);line-height:1.6
}
#aoPray435930 .aoChoirPrayer .aoChoirInvocation{
 margin-bottom:5px
}
#aoPray435930 .aoChoirPrayer .aoChoirResponse{
 margin:0 0 23px clamp(10px,4vw,24px);
 padding:6px 9px 7px clamp(11px,2.8vw,17px);
 border-left:2px solid var(--liturgical-border,rgba(199,174,109,.35));
 background:var(--liturgical-soft,rgba(199,174,109,.045));
 border-radius:0 7px 7px 0;
}
#aoPray435930 .aoChoirPrayer .aoChoirResponse[data-ao-devo-active="true"]{
 opacity:1!important;color:var(--text,#f1e7d7);
 border-left-color:var(--liturgical,#d7bb84);
}
#aoPray435930 .aoChoirPrayer .aoChoirBeat[data-ao-devo-active="true"]::before{
 content:"";display:block;width:23px;height:0;border-top:1px solid var(--liturgical,#d7bb84);
 margin:0 0 6px;
}
#aoPray435930 .aoChoirPrayer .aoChoirResponse[data-ao-devo-active="true"]::before{display:none}
#aoPray435930 .aoChoirPrayer .aoChoirVersicle,
#aoPray435930 .aoChoirPrayer .aoChoirResponse{
 font-style:normal;
}
#aoPray435930 .aoChoirPrayer .aoP435930Source{margin-top:30px}
@media(max-width:359px){
 #aoPray435930 .aoChoirPrayer{padding-inline:11px}
 #aoPray435930 .aoChoirBeat{font-size:18px}
 #aoPray435930 .aoChoirPrayer .aoChoirResponse{margin-left:8px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoChoirBeat{transition:none}
}
`;
export function installChoirStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-choir-f02-f03-styles"))return true;
 const sheet=doc.createElement("style");
 sheet.id="ao-pray-choir-f02-f03-styles";sheet.textContent=CHOIR_F02_F03_CSS;
 doc.head.appendChild(sheet);return true;
}
if(typeof document!=="undefined")installChoirStyles(document);
