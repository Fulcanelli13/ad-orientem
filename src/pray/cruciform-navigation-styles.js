/** Discreet, mirrored Latin crosses; navigation targets are larger than the ink. */
export const CRUCIFORM_NAVIGATION_CSS=String.raw`
/* Short Angelus movements still need real vertical travel for the focus line. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoDevoCardScroll{
 padding-bottom:max(50dvh,320px);
}
#aoPray435930 .aoCrossPair{
 position:fixed;inset:0;z-index:120;pointer-events:none;
 color:var(--liturgical,#c8b28a);
}
#aoPray435930 .aoCrossPad{
 position:absolute;bottom:max(5px,env(safe-area-inset-bottom));
 width:68px;height:82px;border:0!important;border-radius:0!important;
 background:transparent!important;box-shadow:none!important;
 display:grid;place-items:center;padding:0;margin:0;cursor:pointer;
 pointer-events:auto;touch-action:none;-webkit-tap-highlight-color:transparent;
 color:inherit!important;
}
#aoPray435930 .aoCrossPad[data-ao-cross-side="left"]{
 left:max(3px,env(safe-area-inset-left));
}
#aoPray435930 .aoCrossPad[data-ao-cross-side="right"]{
 right:max(3px,env(safe-area-inset-right));
}
#aoPray435930 .aoCrossMark{
 display:block;width:30px;height:46px;overflow:visible;
 opacity:.18;filter:none;transform:none;
 transition:opacity .22s ease;
}
#aoPray435930 .aoCrossPad:hover .aoCrossMark,
#aoPray435930 .aoCrossPad[data-ao-cross-pressed="true"] .aoCrossMark{
 opacity:.60;
}
#aoPray435930 .aoCrossPad:focus-visible{
 outline:1px solid var(--liturgical,#c8b28a)!important;
 outline-offset:-9px;border-radius:9px!important;
}
#aoPray435930 .aoCrossPad:focus-visible .aoCrossMark{opacity:.85}
@media(max-width:480px){
 #aoPray435930 .aoCrossPad{bottom:max(3px,env(safe-area-inset-bottom))}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoCrossMark{transition:none!important}
}
@media(forced-colors:active){
 #aoPray435930 .aoCrossMark{opacity:.65;forced-color-adjust:auto}
}
`;
export function installCruciformNavigationStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-cruciform-navigation-style"))return;
 const style=doc.createElement("style");
 style.id="ao-cruciform-navigation-style";
 style.textContent=CRUCIFORM_NAVIGATION_CSS;
 (doc.head||doc.documentElement).append(style);
}
if(typeof document!=="undefined")installCruciformNavigationStyles(document);
