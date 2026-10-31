/**
 * Claude reconciliation F11: preserve app dark palette and the original
 * named rite rail, resize only the clutter and sung-reading surface.
 * No added art, no synthetic motions, no liturgical source changes.
 */
export const F11_RITE_CSS=String.raw`
#aoPray435930 [data-ao-rite-owner]{
 --f11-rule:var(--liturgical-border,rgba(198,178,136,.32));
 --f11-quiet:var(--liturgical-soft,rgba(179,179,140,.06));
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteOptionRow{
 display:flex;gap:8px 12px;align-items:stretch;
 max-width:680px;margin:0 auto 12px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteOptionRow>*{
 flex:1 1 0;min-width:0;margin-top:0;margin-bottom:0;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteOptionRow summary{
 min-height:44px;display:flex;align-items:center;padding:10px 12px;
 font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoDevoCardHead{
 padding-bottom:12px;border-bottom:1px solid var(--f11-rule);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoDevoCardHead .aoDevoCardTitle{
 display:block;white-space:normal;
 font:500 clamp(24px,5.4vw,30px)/1.28 var(--ao-font-display,Georgia,serif);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer{
 padding:clamp(12px,3vw,24px);margin:clamp(12px,2.5vh,20px) 0;
 max-width:620px;background:transparent;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer .aoP435930PrayerHead{
 border-bottom:1px solid var(--f11-rule);padding-bottom:15px;margin-bottom:18px;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer .aoP435930PrayerHead small{
 color:var(--liturgical,#d3b87d);font-style:italic;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer .aoP435930Flip{
 display:block;width:100%;text-align:left;
 background:transparent;border:0;padding:0;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer [hidden]{display:none!important}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza{
 display:block;padding:0 0 12px;margin:0 0 clamp(20px,4vh,32px);
 border-bottom:1px solid var(--f11-rule);
 transition:opacity .2s ease;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza .aoRiteChantLatin{
 margin:0 0 13px;
 font:500 clamp(19px,4.7vw,23px)/1.7 var(--ao-font-liturgical,Georgia,serif);
 color:var(--text,#ece8de);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza .aoRiteChantVernacular{
 margin:0 0 4px;padding-left:clamp(7px,2vw,12px);
 border-left:1px solid var(--f11-rule);
 font:400 clamp(15px,3.5vw,18px)/1.58 var(--ao-font-liturgical,Georgia,serif);
 color:var(--muted,#c2bbac);
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza[data-ao-devo-active="true"]{
 opacity:1!important;
}
#aoPray435930 [data-ao-rite-owner="benediction"] .aoDevoCardScroll .aoP435930GuideNow p,
#aoPray435930 [data-ao-rite-owner="benediction"] .aoDevoCardScroll .aoP435930GuideCue p{
 line-height:1.68;
}
#aoPray435930 [data-ao-rite-owner="forty-hours-visitor"] .aoDevoCardScroll p,
#aoPray435930 [data-ao-rite-owner="forty-hours-solemn"] .aoDevoCardScroll p,
#aoPray435930 [data-ao-rite-owner="tenebrae"] .aoDevoCardScroll p{
 line-height:1.7;
}
@media(max-width:359px){
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteOptionRow{gap:6px}
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteOptionRow summary{font-size:11px;padding-inline:8px}
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantPrayer{padding-inline:11px}
 #aoPray435930 [data-ao-rite-owner="benediction"] .aoRiteChantStanza .aoRiteChantLatin{font-size:19px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 [data-ao-rite-owner] .aoRiteChantStanza{transition:none}
}
`;
export function installF11Styles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById("ao-pray-f11-rite-css"))return true;
 const style=doc.createElement("style");
 style.id="ao-pray-f11-rite-css";
 style.textContent=F11_RITE_CSS;doc.head.appendChild(style);
 return true;
}
if(typeof document!=="undefined")installF11Styles(document);
