/** Adoration-only contemplative presentation. Canonical prayers remain in the existing runtime. */
export const ADORATION_FOLIO_CSS=String.raw`
/* Adoration-only: no numbered stage tiles, performance scores or animations. */
#aoPray435930 .aoAdorationChooser{max-width:760px;margin:auto;padding-top:5px}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid button{
 min-height:126px;text-align:left;padding:15px;border-radius:9px;
 background:var(--surface-1,#141b23);border:1px solid var(--border,rgba(255,255,255,.13));
 box-shadow:none;color:var(--text,#ece2d4)}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid button:nth-child(-n+2){border-color:color-mix(in srgb,var(--liturgical,#c3a77e) 38%,var(--border,#35373c))}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid small{color:var(--muted,#aaa29a);font:italic 11px/1.3 Georgia,serif;letter-spacing:0;text-transform:none}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid b{display:block;margin:8px 0;color:var(--text,#eee5d8);font:400 clamp(19px,4.7vw,23px)/1.24 Georgia,serif}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid span{color:var(--muted,#a9a29b);font:12px/1.5 Georgia,serif}
#aoPray435930 .aoAdorationChooser .aoP435930BigGrid button:focus-visible{outline:2px solid var(--liturgical,#c3a77e);outline-offset:2px}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1]{max-width:780px;margin-inline:auto;padding-top:5px}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoP435930InlineBack{
 display:inline-flex;align-items:center;gap:5px;min-height:42px;padding:3px;margin:0 0 6px;
 border:0;background:transparent;color:var(--muted,#a9a39a);font:italic 12px/1.35 Georgia,serif}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoSequenceTimeline{
 position:relative!important;top:auto!important;z-index:1;background:transparent!important;
 border-block:0!important;padding:0 0 4px!important;margin:0 0 5px!important;min-height:48px!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoSequenceTimeline .aoDevoStop{
 flex:0 0 max(116px,42%)!important;min-height:45px!important;
 border:0!important;border-bottom:1px solid var(--border,rgba(255,255,255,.13))!important;
 border-radius:0!important;background:transparent!important;box-shadow:none!important;
 display:grid!important;place-content:center!important;text-align:center!important;padding:4px 8px!important;
 color:var(--muted,#aaa39a)!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoSequenceTimeline .aoDevoStop.active{
 border-bottom:2px solid var(--liturgical,#c3a77e)!important;color:var(--text,#f0e5d6)!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoStopNumber{display:none!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoStopTitle{font:italic 12px/1.3 Georgia,serif;color:inherit}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoNavArrow{
 min-height:44px;border:0!important;background:transparent!important;color:var(--muted,#b8aa96)!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCard{animation:none!important;background:transparent!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardHead{
 padding:11px 11px 13px!important;border-bottom:1px solid color-mix(in srgb,var(--liturgical,#c3a77e) 28%,transparent)!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardNumber{display:none!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardTitle{
 font:400 clamp(24px,6vw,31px)/1.22 Georgia,serif;color:var(--text,#efe3d4)}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll{
 display:block;max-height:min(59dvh,540px);min-height:min(238px,36dvh);
 padding:18px clamp(15px,4vw,28px) 25dvh}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideNow{
 display:block!important;border:0!important;background:transparent!important;padding:0 0 6px!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideNow small,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideNow h2{display:none!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideNow p{
 color:var(--text,#eee2d3)!important;font:400 clamp(17px,4.3vw,21px)/1.68 Georgia,serif!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuidePrayers{margin:17px 0;gap:14px!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930Prayer{
 padding:12px 0!important;background:transparent!important;border:0!important;
 border-top:1px solid var(--border,rgba(255,255,255,.14))!important;
 border-radius:0!important;box-shadow:none!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideCue{
 border-left:1px solid color-mix(in srgb,var(--liturgical,#c3a77e) 45%,transparent)!important;
 padding:5px 0 5px 13px!important;margin-top:17px}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideCue small{
 font:italic 11px/1.35 Georgia,serif!important;letter-spacing:0!important;text-transform:none!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll .aoP435930GuideCue p{
 font:italic 14px/1.6 Georgia,serif!important;color:var(--muted,#b0a69d)!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoAdorationOptionDisclosure,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoAdorationVisitNote{
 border-top:1px solid var(--border,rgba(255,255,255,.14));margin-top:12px;background:transparent}
#aoPray435930 .aoAdorationOptionDisclosure>summary,#aoPray435930 .aoAdorationVisitNote>summary{
 min-height:44px;display:flex;align-items:center;cursor:pointer;
 font:italic 13px/1.4 Georgia,serif;color:var(--muted,#b0a69d)}
#aoPray435930 .aoAdorationOptionDisclosure .aoP435930GuideChoices{margin:8px 0 15px}
#aoPray435930 .aoAdorationOptionDisclosure .aoP435930Timer{
 margin:5px 0 14px;background:transparent;border:0;padding:5px 0}
#aoPray435930 .aoAdorationVisitNote p{color:var(--muted,#aca49b);font:13px/1.55 Georgia,serif}
#aoPray435930 .aoAdorationOpenPrayer{
 display:grid;justify-items:center;align-content:center;gap:18px;
 min-height:310px;padding:22px 12px 35px;text-align:center}
#aoPray435930 .aoAdorationStillSymbol{
 width:1px;height:65px;margin:4px auto 0;
 background:linear-gradient(180deg,transparent,var(--liturgical,#b9a37e),transparent);opacity:.52}
#aoPray435930 .aoAdorationOpenPrayer .aoP435930GuideNow{
 padding:0!important;border:0!important;max-width:540px;text-align:center}
#aoPray435930 .aoAdorationOpenPrayer .aoP435930GuideNow small{
 font:italic 12px/1.3 Georgia,serif!important;letter-spacing:0!important;text-transform:none!important}
#aoPray435930 .aoAdorationOpenPrayer .aoP435930GuideNow h2{
 margin:10px 0!important;font:400 clamp(25px,6vw,34px)/1.3 Georgia,serif!important}
#aoPray435930 .aoAdorationOpenPrayer .aoP435930GuideNow p{
 color:var(--muted,#b4aa9e)!important;font:400 clamp(17px,4vw,20px)/1.7 Georgia,serif!important}
#aoPray435930 .aoAdorationQuietEnter,#aoPray435930 .aoAdorationQuietExit{
 min-height:46px;padding:10px 20px;border-radius:7px;
 border:1px solid color-mix(in srgb,var(--liturgical,#c3a77e) 50%,transparent)!important;
 background:transparent!important;color:var(--text,#efe4d5)!important;
 font:italic 14px/1.3 Georgia,serif!important}
#aoPray435930 .aoAdorationQuietScreen{
 display:grid;align-content:center;justify-items:center;text-align:center;
 min-height:clamp(415px,72dvh,830px);padding:45px 17px;
 background:radial-gradient(ellipse 55% 34% at 50% 46%,
 color-mix(in srgb,var(--liturgical,#bb9f78) 6%,transparent),transparent 85%)}
#aoPray435930 .aoAdorationQuietScreen small{font:italic 12px/1.4 Georgia,serif;color:var(--liturgical,#baa179)}
#aoPray435930 .aoAdorationQuietScreen h2{font:400 clamp(28px,7vw,39px)/1.25 Georgia,serif;color:var(--text,#f0e5d7);margin:22px 0 12px}
#aoPray435930 .aoAdorationQuietScreen p{max-width:30ch;color:var(--muted,#aca39a);font:italic 15px/1.65 Georgia,serif}
#aoPray435930 .aoAdorationQuietScreen .aoAdorationQuietExit{margin-top:75px}
@media(max-width:360px){
 #aoPray435930 .aoAdorationChooser .aoP435930BigGrid{grid-template-columns:1fr}
 #aoPray435930 .aoAdorationChooser .aoP435930BigGrid button{min-height:96px}
 #aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoStop{flex-basis:52%!important}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] *,
 #aoPray435930 .aoAdorationQuietScreen *{animation:none!important;transition:none!important}
}
`;
export function installAdorationFolioStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById('ao-adoration-folio-styles'))return true;
 const style=doc.createElement('style');style.id='ao-adoration-folio-styles';style.textContent=ADORATION_FOLIO_CSS;
 doc.head.append(style);return true;
}
if(typeof document!=='undefined')installAdorationFolioStyles(document);
