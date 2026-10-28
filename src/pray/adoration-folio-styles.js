/** Adoration-only contemplative presentation. Canonical prayers remain in the existing runtime. */
export const ADORATION_FOLIO_CSS=String.raw`
/* Adoration-only: no numbered stage tiles, performance scores or animations. */

/* Rail icons are meaningful in the guided Visit, but not at a mode
   selection or during unstructured stillness, where they obscure text. */
#aoPray435930:has(.aoAdorationChooser[data-ao-adoration-chooser="quiet-v2"]) [data-ao-pray-rail-channel],
#aoPray435930:has(.aoP435930AdorationReader[data-ao-adoration-mode="open"]) [data-ao-pray-rail-channel]{
 display:none!important;visibility:hidden!important;pointer-events:none!important;
}
/* Entry hierarchy: immediately available Visit and untimed silence;
   optional guided methods have equal access through a native disclosure. */
#aoPray435930 .aoAdorationChooser[data-ao-adoration-chooser="quiet-v2"]{
 max-width:720px;padding:4px clamp(7px,3vw,20px) 27px;
}
#aoPray435930 .aoAdorationChooserIntroduction{
 margin:3px 0 16px;color:var(--muted,#b0a59a);
 font:italic 14px/1.55 Georgia,serif;text-align:center;
}
#aoPray435930 .aoAdorationPrimaryGrid{
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;
}
#aoPray435930 .aoAdorationPrimaryGrid button{
 min-width:0;min-height:164px;padding:18px 17px;text-align:left;
 display:flex;flex-direction:column;align-items:flex-start;
 background:transparent;border:1px solid color-mix(in srgb,var(--liturgical,#b8a17e) 27%,var(--border,#414043));
 border-radius:7px;color:var(--text,#ede3d5);box-shadow:none;
}
#aoPray435930 .aoAdorationPrimaryGrid button small{
 font:10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.1em;color:var(--liturgical,#c3a982);
}
#aoPray435930 .aoAdorationPrimaryGrid button b{
 display:block;margin:15px 0 10px;
 font:400 clamp(20px,5vw,25px)/1.24 Georgia,serif;
}
#aoPray435930 .aoAdorationPrimaryGrid button span{
 font:italic 13px/1.55 Georgia,serif;color:var(--muted,#b0a49b);
}
#aoPray435930 .aoAdorationPrimaryGrid button:hover{
 border-color:color-mix(in srgb,var(--liturgical,#c3a982) 55%,var(--border,#414043));
}
#aoPray435930 .aoAdorationPrimaryGrid button:focus-visible,
#aoPray435930 .aoAdorationMethodsDisclosure>summary:focus-visible{
 outline:2px solid var(--liturgical,#c3a982);outline-offset:2px;
}
#aoPray435930 .aoAdorationMethodsDisclosure{
 margin:18px 0 0;border-top:1px solid var(--border,rgba(255,255,255,.15));
}
#aoPray435930 .aoAdorationMethodsDisclosure>summary{
 list-style:none;display:flex;align-items:center;justify-content:space-between;gap:10px;
 cursor:pointer;min-height:47px;padding:10px 3px;
 color:var(--muted,#a9a39a);font:italic 14px/1.45 Georgia,serif;
}
#aoPray435930 .aoAdorationMethodsDisclosure>summary::-webkit-details-marker{display:none}
#aoPray435930 .aoAdorationMethodsDisclosure>summary:after{
 content:"⌄";font:19px/1 Georgia,serif;color:var(--liturgical,#c3a982);
}
#aoPray435930 .aoAdorationMethodsDisclosure[open]>summary:after{transform:rotate(180deg)}
#aoPray435930 .aoAdorationChooser[data-ao-adoration-chooser="quiet-v2"] .aoP435930BigGrid{
 grid-template-columns:1fr;gap:0;margin:2px 0 7px;
}
#aoPray435930 .aoAdorationChooser[data-ao-adoration-chooser="quiet-v2"] .aoP435930BigGrid button{
 min-height:68px;padding:12px 9px;
 background:transparent!important;border:0!important;border-top:1px solid var(--border,rgba(255,255,255,.12))!important;
 border-radius:0!important;box-shadow:none!important;
}
#aoPray435930 .aoAdorationChooser[data-ao-adoration-chooser="quiet-v2"] .aoP435930BigGrid button b{
 font:400 18px/1.25 Georgia,serif;margin:0 0 5px;
}
#aoPray435930 .aoAdorationChooser[data-ao-adoration-chooser="quiet-v2"] .aoP435930BigGrid button span{
 font:italic 12px/1.5 Georgia,serif;
}
#aoPray435930 .aoAdorationChooserAfterword{
 border-top:1px solid var(--border,rgba(255,255,255,.10));
 padding:12px 1px 0;margin:4px 0 0;
 color:var(--muted,#a9a39a);font:italic 12px/1.55 Georgia,serif;
}
@media(max-width:360px){
 #aoPray435930 .aoAdorationPrimaryGrid{grid-template-columns:1fr}
 #aoPray435930 .aoAdorationPrimaryGrid button{min-height:104px;padding:13px}
 #aoPray435930 .aoAdorationPrimaryGrid button b{margin:8px 0 4px}
}

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
/* A single quiet exit from each canonical Visit / Holy Hour prayer card.
   It is deliberately an editorial text link, not an additional stage tile. */
#aoPray435930 .aoP435930AdorationReader .aoAdorationQuietLink{
 display:block;min-height:44px;margin:18px 0 4px;
 padding:12px 1px 8px;border:0;border-top:1px solid
 color-mix(in srgb,var(--liturgical,#c3a77e) 20%,transparent);
 border-radius:0;background:transparent!important;box-shadow:none!important;
 text-align:left;color:var(--muted,#b8ab9e);
 font:italic 13px/1.45 Georgia,serif;
}
#aoPray435930 .aoP435930AdorationReader .aoAdorationQuietLink:focus-visible{
 outline:2px solid var(--liturgical,#c3a77e);outline-offset:2px;
}
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
/* Canonical rails float on phones. Keep the actual prayer lines clear. */
@media(max-width:560px){
 #aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoCardScroll{
  padding-left:clamp(40px,11vw,48px)!important;
  padding-right:clamp(40px,11vw,48px)!important;
 }
}
/* User-requested silence must cover both rails and global navigation, not merely
   create an empty panel surrounded by navigation controls. */
/* An explicitly entered quiet screen must outrank even the boot overlay\n   if a late bootstrap status repaint occurs during a long prayer session. */\n#aoPray435930:has(.aoAdorationQuietScreen){z-index:2147483100!important}
/* The shared app ribbon deliberately has a z-index above prayer surfaces.
   Hide it only while the user's explicit untimed stillness view is active. */
body:has(#aoPray435930 .aoAdorationQuietScreen) #ao-global-ribbon{
 visibility:hidden!important;pointer-events:none!important;
}

#aoPray435930 .aoAdorationQuietScreen{
 position:fixed!important;inset:0!important;width:100vw!important;
 max-width:none!important;max-height:none!important;min-height:100dvh!important;
 z-index:2147483101!important;box-sizing:border-box!important;
 padding:clamp(36px,7dvh,80px) 17px!important;
 background:radial-gradient(ellipse 42% 28% at 50% 46%,
  color-mix(in srgb,var(--liturgical,#bb9f78) 6%,#080c12),#080c12 83%)!important;
 overflow-y:auto;overscroll-behavior:contain;
}
#aoPray435930 .aoAdorationQuietScreen .aoAdorationQuietExit{
 margin-top:clamp(40px,10dvh,110px)!important;
}

@media(max-width:360px){
 #aoPray435930 .aoAdorationChooser .aoP435930BigGrid{grid-template-columns:1fr}
 #aoPray435930 .aoAdorationChooser .aoP435930BigGrid button{min-height:96px}
 #aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] .aoDevoStop{flex-basis:52%!important}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio=v1] *,
 #aoPray435930 .aoAdorationQuietScreen *{animation:none!important;transition:none!important}
}

/* B10: optional, whole historical source prayer inside a fixed Four Ends stage.
   Distinct devotions never replace canonical texts or become extra stages. */
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="four"] .aoFourPurposeOption{
 margin:14px 0 7px;padding:13px 0 0;
 border-top:1px solid color-mix(in srgb,var(--liturgical,#c3a77e) 19%,transparent);
 display:grid;gap:8px;min-width:0
}
#aoPray435930 .aoFourPurposeCaption{
 font:italic 12px/1.55 Georgia,serif;
 color:var(--muted,#b0a49b)
}
#aoPray435930 .aoFourPurposeChoices{
 display:flex;gap:7px;min-width:0;padding:1px 0 7px;
 overflow-x:auto;overscroll-behavior-x:contain;-webkit-overflow-scrolling:touch;
 scrollbar-width:none
}
#aoPray435930 .aoFourPurposeChoices::-webkit-scrollbar{display:none}
#aoPray435930 .aoFourPurposeChoices>button{
 flex:0 0 auto;min-height:44px;max-width:220px;
 padding:9px 12px;border-radius:10px;
 border:1px solid var(--border,rgba(255,255,255,.17));
 background:transparent;color:var(--text,#ece2d4);
 font:500 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);
 text-align:center;white-space:normal
}
#aoPray435930 .aoFourPurposeChoices>button[aria-pressed="true"]{
 border-color:var(--liturgical,#c3a77e);
 background:color-mix(in srgb,var(--liturgical,#c3a77e) 12%,transparent);
 color:var(--liturgical,#dfc895)
}
#aoPray435930 .aoFourPurposeChoices>button:focus-visible{
 outline:2px solid var(--liturgical,#c3a77e);outline-offset:2px
}
#aoPray435930 .aoFourPurposeReading{margin:7px 0 0}
#aoPray435930 .aoFourPurposeReading .aoP435930Prayer{
 margin:0!important;padding:11px 0!important;
 border-top:1px solid var(--border,rgba(255,255,255,.1))!important
}

`;
export function installAdorationFolioStyles(doc=globalThis.document){
 if(!doc?.head)return false;
 if(doc.getElementById('ao-adoration-folio-styles'))return true;
 const style=doc.createElement('style');style.id='ao-adoration-folio-styles';style.textContent=ADORATION_FOLIO_CSS;
 doc.head.append(style);return true;
}
if(typeof document!=='undefined')installAdorationFolioStyles(document);
