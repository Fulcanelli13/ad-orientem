// Exact v3.4.10 reading-focus response, isolated from the already-recovered rail owners.
export const PRAY_FOCUS_V3410_CSS=String.raw`
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoP435930PrayerUnit{
  opacity:var(--ao346-focus-opacity,.50)!important;
  transition:opacity .045s linear,transform .065s linear,border-color .065s linear,box-shadow .065s linear!important;
}
#aoPray435930 .ao347-focusable{
  opacity:var(--ao347-focus-opacity,.54)!important;
  transition:opacity .045s linear,transform .065s linear,border-color .065s linear,box-shadow .065s linear!important;
}
#aoPray435930 .aoP435930PrayerUnit.ao346-current,
#aoPray435930 .ao347-focusable.ao347-current{
  transform:translateX(2px)!important;
}
#aoPray435930 .aoP435930PrayerUnit.ao346-near,
#aoPray435930 .aoP435930PrayerUnit.ao346-far,
#aoPray435930 .ao347-focusable.ao347-near,
#aoPray435930 .ao347-focusable.ao347-far{
  opacity:var(--ao346-focus-opacity,var(--ao347-focus-opacity,.60))!important;
}
@media(prefers-reduced-motion:reduce){
  #aoPray435930 .aoP435930PrayerUnit,
  #aoPray435930 .ao347-focusable{transition:none!important}
}
`;

export function installPrayFocusStyles(doc=globalThis.document){
  if(!doc?.head)return false;
  let style=doc.getElementById("ao-v3410-home-focus-repair-css");
  if(!style){
    style=doc.createElement("style");
    style.id="ao-v3410-home-focus-repair-css";
    style.textContent=PRAY_FOCUS_V3410_CSS;
    doc.head.appendChild(style);
  }
  return true;
}
if(typeof document!=="undefined")installPrayFocusStyles(document);
