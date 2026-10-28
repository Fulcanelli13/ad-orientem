/** B20: scoped, compact occasional intercessions UI, same Prayer surface. */
export function installOccasionalIntercessionStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById?.("ao-occasional-intercessions-style"))return;
 const s=doc.createElement("style");s.id="ao-occasional-intercessions-style";
 s.textContent=`
#aoPray435930 .aoOccasionalIntercession{max-width:760px;margin:auto;padding:18px clamp(14px,4vw,30px) 35px}
#aoPray435930 .aoOccasionalIntro{text-align:center;color:var(--ao-muted,#c5b391);font:15px/1.6 var(--ao-font-ui,Georgia,serif);margin:4px 0 18px}
#aoPray435930 .aoOccasionalChoices{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;margin:6px 0 20px}
#aoPray435930 .aoOccasionalChoices button,#aoPray435930 .aoOccasionalLangButton{min-height:48px;padding:10px;border:1px solid rgba(210,181,143,.4);border-radius:10px;background:transparent;color:inherit;font:500 13px/1.4 var(--ao-font-ui,Georgia,serif);cursor:pointer}
#aoPray435930 .aoOccasionalChoices button[aria-pressed="true"]{border-color:rgba(210,183,135,.86);background:rgba(197,166,114,.16)}
#aoPray435930 .aoOccasionalCard{padding:clamp(17px,3vw,28px);border-radius:14px;border:1px solid rgba(210,181,143,.25);background:rgba(189,159,107,.06)}
#aoPray435930 .aoOccasionalTitle{display:flex;align-items:center;justify-content:space-between;gap:10px}
#aoPray435930 .aoOccasionalTitle h2{margin:0;font:400 clamp(21px,4vw,29px)/1.3 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoOccasionalLanguage{display:block;margin:13px 0 4px;color:var(--ao-muted,#c5b391);font:500 12px/1.4 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoOccasionalText{white-space:pre-line;font:400 clamp(18px,3vw,21px)/1.8 var(--ao-font-liturgical,Georgia,serif);margin:13px 0 2px}
#aoPray435930 .aoOccasionalSource{margin-top:23px;border-top:1px solid rgba(194,178,152,.2)}
#aoPray435930 .aoOccasionalSource summary{min-height:48px;display:flex;align-items:center;cursor:pointer;font:13px/1.5 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoOccasionalSource p{font:14px/1.6 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoOccasionalSource a{display:block;min-height:44px;padding:10px 0;color:#ceb187;font-size:13px;text-decoration:underline}
#aoPray435930 .aoOccasionalFamilyAside{margin:16px 0 3px;text-align:center}
#aoPray435930 .aoOccasionalFamilyAside button{min-height:48px;padding:9px 19px;border:1px solid rgba(196,173,133,.4);border-radius:999px;background:transparent;color:inherit;cursor:pointer}
#aoPray435930 .aoOccasionalIntercession button:focus-visible,#aoPray435930 .aoOccasionalSource summary:focus-visible,#aoPray435930 .aoOccasionalFamilyAside button:focus-visible{outline:2px solid #d9bd83;outline-offset:3px}
@media(min-width:641px){#aoPray435930 .aoOccasionalChoices{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media(max-width:360px){#aoPray435930 .aoOccasionalChoices{grid-template-columns:1fr}#aoPray435930 .aoOccasionalTitle{align-items:flex-start;flex-wrap:wrap}}
`;doc.head?.append(s);
}
if(typeof document!=="undefined")installOccasionalIntercessionStyles(document);
