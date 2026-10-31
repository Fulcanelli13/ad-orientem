/**
 * F01 Holy Card — quiet source-owned reading surface.
 * Scoped to five certified clause maps; all other readers are untouched.
 */
export const ESSENTIAL_HOLY_CARD_CSS=String.raw`
#aoPray435930 .aoP435930EssentialCard{
  max-width:620px;margin-inline:auto;padding:clamp(14px,4vw,30px) clamp(12px,4vw,30px);
  background:transparent;border:0;border-radius:0;box-shadow:none;
}
#aoPray435930 .aoP435930EssentialCard .aoP435930PrayerHead{
  display:flex;align-items:start;justify-content:space-between;gap:10px;
  padding:0 0 15px;margin:0 0 22px;border-bottom:3px double rgba(160,55,49,.68);
}
#aoPray435930 .aoP435930EssentialCard .aoP435930PrayerHead h3{
  font:500 clamp(21px,5.3vw,30px)/1.25 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif));
  letter-spacing:.015em;margin:0;
}
#aoPray435930 .aoP435930EssentialCard .aoP435930EssentialLang{
  min-height:44px;min-width:64px;flex:0 0 auto;padding:8px 12px;
  background:transparent;color:var(--liturgical,#c7ae6d);
  border:1px solid var(--liturgical-border,rgba(199,174,109,.4));
  border-radius:0;font:500 .78rem/1.2 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoP435930EssentialCard [hidden]{display:none!important}
#aoPray435930 .aoP435930EssentialFaces{max-width:48ch;margin-inline:auto;}
#aoPray435930 .aoP435930EssentialBeat{
  margin:0 0 clamp(21px,4.8vh,32px);
  padding:0;overflow-wrap:break-word;
  color:var(--text,#f1e7d7);
  font:400 clamp(18px,4.8vw,23px)/1.72 var(--ao-font-liturgical,var(--font-liturgical,Georgia,serif));
  transition:opacity .22s ease;
}
#aoPray435930 .aoP435930EssentialBeat.aoP435930EssentialCollective{
  border-left:2px solid var(--liturgical-border,rgba(199,174,109,.42));
  padding-left:clamp(12px,3vw,20px);margin-left:9px;
  background:var(--liturgical-soft,rgba(199,174,109,.035));
}
#aoPray435930 .aoP435930EssentialBeat[data-ao-devo-active="true"]{
  color:var(--text,#f1e7d7);
}
#aoPray435930 .aoP435930EssentialBeat[data-ao-devo-active="true"]::before{
  content:"";display:block;width:24px;border-top:1px solid var(--liturgical,#c7ae6d);
  margin:0 0 8px;
}
#aoPray435930 .aoP435930EssentialCard .aoP435930Source{margin-top:26px}
#aoPray435930 .aoP435930EssentialLang:focus-visible,
#aoPray435930 .aoP435930EssentialBeat:focus-visible{
  outline:2px solid var(--liturgical,#c7ae6d);outline-offset:3px;
}
@media(max-width:359px){
  #aoPray435930 .aoP435930EssentialCard{padding-inline:12px}
  #aoPray435930 .aoP435930EssentialBeat{font-size:18px;line-height:1.65}
}
@media(prefers-reduced-motion:reduce){
  #aoPray435930 .aoP435930EssentialBeat{transition:none}
}
`;

export function installEssentialHolyCardStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-essential-holy-card-css"))return true;
 const style=doc.createElement("style");
 style.id="ao-essential-holy-card-css";
 style.textContent=ESSENTIAL_HOLY_CARD_CSS;
 doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installEssentialHolyCardStyles(document);
