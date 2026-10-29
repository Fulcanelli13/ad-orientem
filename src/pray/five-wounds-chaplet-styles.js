/**
 * The Five Wounds is a nested guided chaplet, not a replacement for Stations
 * or a new top-level Prayer module. Physical tap targets >= 48px.
 */
export function installFiveWoundsChapletStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById?.("ao-five-wounds-chaplet-style"))return;
 const s=doc.createElement("style");s.id="ao-five-wounds-chaplet-style";
 s.textContent=`
#aoPray435930 .aoFiveWoundsFamilyAside{margin:12px 0 4px;text-align:center}
#aoPray435930 .aoFiveWoundsFamilyAside button{min-height:48px;padding:9px 16px;border:1px solid rgba(198,169,115,.35);border-radius:999px;background:transparent;color:inherit;cursor:pointer}
#aoPray435930 .aoFiveWoundsFamilyAside button:focus-visible{outline:2px solid #dec291;outline-offset:3px}
#aoPray435930 .aoFiveWounds{max-width:760px;margin:0 auto;padding:clamp(18px,4vw,38px) clamp(12px,4vw,28px) 45px;color:var(--ao-text,#e8dfd1)}
#aoPray435930 .aoFiveWounds header{text-align:center;margin:10px 0 22px}
#aoPray435930 .aoFiveWoundsEyebrow{letter-spacing:.09em;text-transform:uppercase;font-size:11px;color:var(--ao-muted,#bead93)}
#aoPray435930 .aoFiveWounds header h2{font:400 clamp(23px,4.7vw,34px)/1.25 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);margin:7px 0;color:inherit}
#aoPray435930 .aoFiveWounds header>p:last-child{font:400 15px/1.5 var(--ao-font-ui,Georgia,serif);color:var(--ao-muted,#bcb0a0)}
#aoPray435930 .aoFiveWoundsRail{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:5px;margin:18px 0 12px}
#aoPray435930 .aoFiveWoundsRail button{min-height:58px;padding:7px 3px;border:1px solid transparent;background:transparent;border-radius:8px;color:inherit;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;cursor:pointer}
#aoPray435930 .aoFiveWoundsRail button span{width:10px;height:10px;border-radius:50%;border:1px solid #b9a073}
#aoPray435930 .aoFiveWoundsRail button.active span{background:#d1b98c;box-shadow:0 0 0 4px rgba(198,167,113,.12)}
#aoPray435930 .aoFiveWoundsRail button small{font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);opacity:1;max-width:110px;min-width:0;overflow-wrap:anywhere}
#aoPray435930 .aoFiveWoundsRail button.active{border-color:rgba(199,170,119,.4);background:rgba(199,170,119,.08)}
#aoPray435930 .aoFiveWoundsProgress{height:3px;background:rgba(196,179,150,.18);border-radius:8px;overflow:hidden}
#aoPray435930 .aoFiveWoundsProgress>span{height:100%;display:block;background:#baa176;transition:width .2s ease}
#aoPray435930 .aoFiveWoundsBeads{display:flex;justify-content:center;align-items:center;gap:14px;margin:26px 0 19px}
#aoPray435930 .aoFiveWoundsBeads span{width:11px;height:11px;border-radius:50%;border:1px solid #b69d72;opacity:.6}
#aoPray435930 .aoFiveWoundsBeads span.ave{width:14px;height:14px;border-color:#cabb9d}
#aoPray435930 .aoFiveWoundsBeads span.current{background:#dbc29a;opacity:1;box-shadow:0 0 0 5px rgba(208,174,111,.15)}
#aoPray435930 .aoFiveWoundsPrayer{padding:22px clamp(14px,4vw,30px) 26px;border:1px solid rgba(202,180,146,.25);background:rgba(181,149,96,.055);border-radius:12px}
#aoPray435930 .aoFiveWoundsPrayerTop{display:flex;justify-content:space-between;align-items:center;gap:12px}
#aoPray435930 .aoFiveWoundsPrayerTop small{font:500 12px/1.3 var(--ao-font-ui,Georgia,serif);color:var(--ao-muted,#c4b6a1)}
#aoPray435930 .aoFiveWoundsPrayerText{font:400 clamp(19px,3.2vw,23px)/1.75 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);text-align:center;margin:28px 0 12px}
#aoPray435930 .aoFiveWounds button{min-height:48px;color:inherit;font-family:var(--ao-font-ui,Georgia,serif)}
#aoPray435930 .aoFiveWoundsPrayerTop button{font-size:12px;min-width:66px;border:1px solid rgba(198,171,120,.5);border-radius:999px;background:transparent;padding:6px 10px}
#aoPray435930 .aoFiveWoundsActions{
 position:sticky;bottom:0;z-index:12;
 display:flex;justify-content:space-between;align-items:stretch;
 gap:9px;margin:16px 0 0;
 padding:11px 3px max(11px,env(safe-area-inset-bottom));
 border-top:1px solid var(--border,rgba(202,180,146,.25));
 background:var(--surface-1,#151c24);
}
#aoPray435930 .aoFiveWoundsActions button{
 flex:1 1 0;min-width:0;min-height:48px;
 padding:10px 9px;border:1px solid rgba(197,175,137,.43);
 background:transparent;border-radius:999px;
 font-size:14px;line-height:1.35;text-align:center;
 white-space:normal;
}
#aoPray435930 .aoFiveWoundsActions button.primary{margin-left:auto;background:rgba(196,161,107,.2);border-color:rgba(202,180,145,.65)}
#aoPray435930 .aoFiveWoundsSource{margin-top:30px;border-top:1px solid rgba(198,169,115,.23);padding-top:8px}
#aoPray435930 .aoFiveWoundsSource summary{min-height:48px;display:flex;align-items:center;cursor:pointer;font-size:13px;color:var(--ao-muted,#c4b6a1)}
#aoPray435930 .aoFiveWoundsSource p{font-size:14px;line-height:1.65}
#aoPray435930 .aoFiveWoundsSource a{display:block;color:#c9ac79;font-size:13px;padding:7px 0;min-height:35px}
#aoPray435930 .aoFiveWounds button:focus-visible,#aoPray435930 .aoFiveWounds summary:focus-visible{outline:2px solid #dac291;outline-offset:3px}
@media(max-width:420px){
 /* In the 320px reader, the app header already identifies the chaplet.
    Keep the wound identity and instructions, but remove redundant air so
    the source prayer is visible without a preparatory manual scroll. */
 #aoPray435930 .aoFiveWounds{padding:8px 10px calc(48px + env(safe-area-inset-bottom))}
 #aoPray435930 .aoFiveWounds header{margin:0 0 5px}
 #aoPray435930 .aoFiveWoundsEyebrow{margin:0;letter-spacing:.06em;font-size:10px}
 #aoPray435930 .aoFiveWounds header h2{font-size:21px;line-height:1.2;margin:3px 0 5px}
 #aoPray435930 .aoFiveWounds header>p:last-child{font-size:13px;line-height:1.35;margin:0}
 #aoPray435930 .aoFiveWoundsRail{margin:7px 0 5px}
 #aoPray435930 .aoFiveWoundsRail button{min-height:66px;padding:5px 2px;gap:5px}
 #aoPray435930 .aoFiveWoundsRail button small{font-size:12px;line-height:1.25}
 #aoPray435930 .aoFiveWoundsBeads{gap:11px;margin:12px 0 10px}
 #aoPray435930 .aoFiveWoundsPrayer{padding:12px 12px 14px}
 #aoPray435930 .aoFiveWoundsPrayerText{margin:13px 0 5px;line-height:1.55}
 #aoPray435930 .aoFiveWoundsActions{margin-top:8px}
 #aoPray435930 .aoFiveWoundsSource{margin-top:12px}
}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoFiveWoundsProgress>span{transition:none}}
`;
 doc.head?.append(s);
}
if(typeof document!=="undefined")installFiveWoundsChapletStyles(document);
