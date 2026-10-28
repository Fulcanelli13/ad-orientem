/** B29 home night watch — scoped to the existing Adoration reader. */
export function installNightHomeB29Styles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById?.("ao-night-home-b29-style"))return;
 const style=doc.createElement("style");style.id="ao-night-home-b29-style";
 style.textContent=`
#aoPray435930 .aoNightHomeB29Opening{
 margin:0 0 15px;padding:16px clamp(15px,4vw,23px);
 background:linear-gradient(125deg,rgba(145,108,73,.15),rgba(30,36,54,.11));
 border:1px solid rgba(202,177,134,.33);border-radius:15px
}
#aoPray435930 .aoNightHomeB29Opening small{
 display:block;color:var(--ao-muted,#c8bca6);letter-spacing:.075em;
 font:600 11px/1.5 var(--ao-font-ui,Georgia,serif);margin-bottom:8px
}
#aoPray435930 .aoNightHomeB29Opening p{
 margin:8px 0;font:400 15px/1.65 var(--ao-font-ui,Georgia,serif);
 max-width:66ch;overflow-wrap:anywhere
}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="night"] [data-ao-night-home-source]{
 border:1px solid rgba(202,177,134,.28);border-radius:11px;
 margin:12px 0 26px;padding:0 15px
}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="night"] [data-ao-night-home-source] summary{
 min-height:48px;display:list-item;padding:13px 0;cursor:pointer
}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="night"] [data-ao-night-home-source] a{
 display:inline-block;min-height:44px;line-height:1.5;color:var(--ao-gold,#c5a879);
 overflow-wrap:anywhere
}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="night"] :focus-visible{
 outline:2px solid var(--ao-gold,#c5a879);outline-offset:3px
}
@media(max-width:350px){
 #aoPray435930 .aoNightHomeB29Opening{padding:13px}
 #aoPray435930 .aoNightHomeB29Opening p{font-size:14px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="night"] *{scroll-behavior:auto}
}
`;
 doc.head?.appendChild(style)
}
if(typeof document!=="undefined")installNightHomeB29Styles(document);
