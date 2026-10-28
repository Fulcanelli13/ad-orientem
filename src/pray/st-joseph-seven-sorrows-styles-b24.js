/** Scoped seven-pair guided St Joseph prayer reader; no standalone app shell. */
export function installStJosephSevenStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById?.("ao-st-joseph-seven-b24-style"))return;
 const s=doc.createElement("style");s.id="ao-st-joseph-seven-b24-style";
 s.textContent=`
#aoPray435930 .aoJosephSeven{max-width:760px;margin:auto;padding:18px clamp(14px,4vw,28px) 34px}
#aoPray435930 .aoJosephSevenIntro{font:15px/1.65 var(--ao-font-ui,Georgia,serif);color:var(--ao-muted,#c5b391);margin:5px 0 14px;text-align:center}
#aoPray435930 .aoJosephSevenProgress{height:5px;background:rgba(192,167,122,.18);border-radius:99px;overflow:hidden;margin:12px 0 18px}
#aoPray435930 .aoJosephSevenProgress span{display:block;height:100%;background:#c3a578;transition:width .15s ease}
#aoPray435930 .aoJosephSevenRail{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:5px;margin-bottom:17px}
#aoPray435930 .aoJosephSevenRail button{min-height:48px;min-width:0;padding:4px;border-radius:9px;border:1px solid rgba(204,175,125,.35);background:transparent;color:inherit;font:500 13px/1.2 var(--ao-font-ui,Georgia,serif);cursor:pointer}
#aoPray435930 .aoJosephSevenRail button[aria-current=step]{background:rgba(190,156,100,.19);border-color:#c1a270}
#aoPray435930 .aoJosephSevenCard{border:1px solid rgba(206,181,136,.3);border-radius:14px;background:rgba(173,151,104,.065);padding:clamp(18px,4vw,27px)}
#aoPray435930 .aoJosephSevenKicker{display:block;font:500 12px/1.4 var(--ao-font-ui,Georgia,serif);letter-spacing:.07em;text-transform:uppercase;color:var(--ao-muted,#c5b391)}
#aoPray435930 .aoJosephSevenCard h2{font:400 clamp(23px,5vw,30px)/1.3 var(--ao-font-liturgical,Georgia,serif);margin:10px 0 14px}
#aoPray435930 .aoJosephSevenOriginal{font:400 clamp(18px,3vw,21px)/1.85 var(--ao-font-liturgical,Georgia,serif);white-space:pre-line;margin:10px 0 20px}
#aoPray435930 .aoJosephSevenCanonical{margin-top:22px;padding-top:12px;border-top:1px solid rgba(204,175,125,.3)}
#aoPray435930 .aoJosephSevenCanonical h3{font:400 17px/1.5 var(--ao-font-liturgical,Georgia,serif);margin:12px 0 3px}
#aoPray435930 .aoJosephSevenCanonical p{font:400 clamp(17px,3vw,20px)/1.75 var(--ao-font-liturgical,Georgia,serif);margin:0 0 15px;white-space:pre-line}
#aoPray435930 .aoJosephSevenNotice{font:13px/1.65 var(--ao-font-ui,Georgia,serif);color:var(--ao-muted,#c5b391);margin:4px 0 13px}
#aoPray435930 .aoJosephSevenNav{display:flex;justify-content:space-between;align-items:center;gap:12px;margin:18px 0}
#aoPray435930 .aoJosephSevenNav button{flex:1;min-height:48px;max-width:220px;border:1px solid rgba(206,181,136,.45);border-radius:9px;padding:10px 12px;background:transparent;color:inherit;font:500 15px/1.4 var(--ao-font-ui,Georgia,serif);cursor:pointer}
#aoPray435930 .aoJosephSevenNav button[disabled]{opacity:.32;cursor:default}
#aoPray435930 .aoJosephSevenNav button:last-child{background:rgba(200,167,118,.14)}
#aoPray435930 .aoJosephSevenSource{border-top:1px solid rgba(195,168,123,.3);margin-top:20px;font:13px/1.6 var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoJosephSevenSource summary{min-height:48px;cursor:pointer;display:flex;align-items:center}
#aoPray435930 .aoJosephSevenSource a{display:block;min-height:42px;padding:9px 0;color:#cbaa7c;overflow-wrap:anywhere}
#aoPray435930 .aoJosephSeven button:focus-visible,#aoPray435930 .aoJosephSeven summary:focus-visible{outline:2px solid #dbc089;outline-offset:3px}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoJosephSevenProgress span{transition:none}}
@media(max-width:360px){#aoPray435930 .aoJosephSevenRail{grid-template-columns:repeat(4,minmax(0,1fr))}}
`;doc.head?.append(s);
}
if(typeof document!=="undefined")installStJosephSevenStyles(document);
