import {selectAngelusOpeningArtwork,resolveAngelusArtworkImage} from "./angelus-cinematic-policy.js";
export const PRAY_FOLIO_VERSION="nonmass-folio-p0-v1";
export const PRAY_FOLIO_CSS=String.raw`

/* Shared non-Mass Folio grammar. All accents flow from the existing
   calendar-owned --liturgical tokens; this file never chooses a feast. */
#aoPray435930{
 --ao-folio-ink:var(--ao-text-primary,var(--text,#eee9df));
 --ao-folio-muted:var(--ao-text-muted,var(--muted,#a4a8ad));
 --ao-folio-accent:var(--ao-liturgical-accent,var(--liturgical,#cdb38e));
 --ao-folio-bg:var(--ao-bg-canvas,var(--bg,#080c12));
 --ao-folio-serif:var(--ao-font-liturgical,Georgia,serif);
 --ao-folio-rule:var(--ao-rule,rgba(217,197,158,.14));
}
#aoPray435930 .aoFolioSurface{
 width:100%;max-width:min(100%,740px);margin-inline:auto;
 color:var(--ao-folio-ink);
}
#aoPray435930 .aoFolioSurface .aoDevoCard{
 animation:none;min-width:0;background:transparent;
}
#aoPray435930 .aoFolioSurface .aoDevoCardHead{
 border-bottom:0;padding:16px 10px 11px;
}
#aoPray435930 .aoFolioSurface .aoDevoCardTitle{
 font:500 clamp(23px,5vw,29px)/1.13 var(--ao-font-display,Georgia,serif);
 color:var(--ao-folio-ink);margin:6px 0 3px;
}
#aoPray435930 .aoFolioSurface .aoDevoCardLatin{
 font:italic 13px/1.4 var(--ao-folio-serif);
 color:var(--ao-folio-muted);
}
#aoPray435930 .aoFolioSurface .aoDevoCardNumber{
 letter-spacing:.15em;color:var(--ao-folio-accent);
}
#aoPray435930 .aoFolioSurface .aoDevoCardScroll{
 height:clamp(285px,54dvh,630px);min-height:0;
 padding:12px clamp(15px,5vw,40px) 24dvh;
 gap:17px;overscroll-behavior-y:contain;
 scrollbar-color:var(--ao-folio-rule) transparent;
}
#aoPray435930 .aoFolioSurface .aoDevoCardScroll .aoP435930PrayerUnit button{
 font:400 clamp(18px,4.45vw,22px)/1.72 var(--ao-folio-serif)!important;
 color:var(--ao-folio-ink);text-align:left;
}
#aoPray435930 .aoFolioSurface .aoDevoCardScroll .aoAngelusDialogueLine{
 padding:6px 1px;gap:8px;
}
#aoPray435930 .aoFolioSurface .aoDevoParagraph{
 transition:opacity .38s ease,color .38s ease!important;
}
#aoPray435930 .aoFolioSurface .aoDevoParagraph[data-ao-devo-active="true"]{
 color:var(--ao-folio-ink)!important;
}
#aoPray435930 .aoFolioSurface .aoDevoTimeline{
 position:sticky;top:auto;bottom:0;z-index:20;
 min-height:62px;grid-template-columns:44px minmax(0,1fr) 44px;
 padding:6px 0 9px;margin:0;
 background:color-mix(in srgb,var(--ao-folio-bg) 95%,transparent);
 border-top:1px solid var(--ao-folio-rule);border-bottom:0;
 backdrop-filter:blur(12px);
}
#aoPray435930 .aoFolioSurface .aoDevoStops{gap:2px}
#aoPray435930 .aoFolioSurface .aoDevoStop{
 flex:0 0 auto;min-width:30px;width:auto;max-width:154px;
 min-height:42px;padding:5px 10px;gap:1px;
 border:0;border-radius:6px;background:transparent;
 color:var(--ao-folio-muted);text-align:center;
}
#aoPray435930 .aoFolioSurface .aoDevoStop:not(.active) .aoDevoStopTitle{display:none}
#aoPray435930 .aoFolioSurface .aoDevoStop.active{
 color:var(--ao-folio-ink);border:0;
 background:color-mix(in srgb,var(--ao-folio-accent) 10%,transparent);
}
#aoPray435930 .aoFolioSurface .aoDevoStopTitle{
 font:500 12px/1.25 var(--ao-font-display,Georgia,serif);
 white-space:normal;
}
#aoPray435930 .aoFolioSurface .aoDevoStopNumber{
 font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-folio-accent);
}
#aoPray435930 .aoFolioSurface .aoDevoNavArrow{
 border:0;border-radius:100%;background:transparent;
 color:var(--ao-folio-ink);font-size:23px;min-height:44px;
}
#aoPray435930 .aoFolioSurface .aoDevoNavArrow:focus-visible,
#aoPray435930 .aoFolioSurface .aoDevoStop:focus-visible{
 outline:2px solid var(--ao-folio-accent);outline-offset:1px;
}
#aoPray435930 .aoFolioInlineGesture{
 display:flex;align-items:center;justify-content:center;gap:13px;
 width:min(100%,420px);margin:8px auto 4px;padding:13px 12px;
 border:1px solid color-mix(in srgb,var(--ao-folio-accent) 25%,transparent);
 border-radius:8px;
 background:color-mix(in srgb,var(--ao-folio-accent) 5%,transparent);
 color:var(--ao-folio-ink);
}
#aoPray435930 .aoFolioGestureIcon{
 display:block;flex:0 0 38px;width:38px;height:38px;
 background:var(--ao-folio-accent);
 mask-position:center;mask-size:contain;mask-repeat:no-repeat;
 -webkit-mask-position:center;-webkit-mask-size:contain;-webkit-mask-repeat:no-repeat;
}
#aoPray435930 .aoFolioGestureLabel{
 font:500 14px/1.35 var(--ao-font-display,Georgia,serif);
}
#aoPray435930 .aoFolioGestureLatin{
 display:block;margin-top:4px;font:italic 11px/1.35 var(--ao-folio-serif);
 color:var(--ao-folio-muted);
}
#aoPray435930 .aoFolioClosing{
 margin:22px 0 0;padding-top:22px;
 border-top:1px solid var(--ao-folio-rule);
}
#aoPray435930 .aoFolioClosingTitle{
 text-align:center;margin:0 0 20px;
 font:italic 19px/1.3 var(--ao-folio-serif);
 color:var(--ao-folio-accent);
}
#aoPray435930 .aoFolioClosingPrayer{margin:0 0 20px}
#aoPray435930 .aoFolioClosingLabel{
 display:block;margin:0 0 6px;
 font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 text-transform:uppercase;letter-spacing:.09em;
 color:var(--ao-folio-muted);
}
#aoPray435930 .aoFolioArt{
 position:relative;display:block;max-width:100%;
 height:clamp(145px,25dvh,250px);margin:0 auto 12px;overflow:hidden;
 background:var(--ao-folio-bg);
}
#aoPray435930 .aoFolioArt img{
 display:block;width:100%;height:100%;object-fit:contain;
 filter:brightness(.85) saturate(.72);
}
#aoPray435930 .aoFolioArt figcaption{
 position:absolute;bottom:0;inset-inline:0;padding:18px 10px 6px;
 background:linear-gradient(transparent,var(--ao-folio-bg));
 text-align:center;color:var(--ao-folio-muted);
 font:10px/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoAngelusRitualGrid{
 display:flex;flex-direction:column;gap:5px;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoRitualFaithfulRail{
 position:static!important;width:auto!important;min-width:0!important;
 display:flex;flex-direction:row;align-items:center;justify-content:center;
 padding:4px 8px;margin:0 auto;max-width:100%;
 border:0;background:transparent;box-shadow:none;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoRitualFaithfulRail .aoRitualSlot{
 min-width:0;flex:0 1 auto;gap:5px;
}

/* Folio's quiet header and discrete settings are scoped to Angelus, not
   to the whole Prayer hub or other currently unmigrated modules. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] >.aoP435930Head p{
 display:none!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoP435930PrayerOptions{
 border:0;background:transparent;border-radius:0;
 box-shadow:none;margin:0 auto 4px;max-width:740px;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoP435930PrayerOptions>summary{
 min-height:39px;padding:4px 12px;
 font:500 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-folio-muted);
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoP435930PrayerOptions>summary>small{
 font-size:10px;color:var(--ao-folio-muted);
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoRitualFaithfulRail .aoRitualSlot{
 display:flex;flex-direction:row;align-items:center;
 gap:8px;min-height:36px;min-width:0;
 border:0;border-radius:99px;padding:2px 9px;
 background:color-mix(in srgb,var(--ao-folio-accent) 6%,transparent);
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoRitualFaithfulRail .aoRitualIcon{
 width:29px;height:29px;min-width:29px;min-height:29px;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoRitualFaithfulRail .aoRitualKey{
 display:none;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoRitualFaithfulRail .aoRitualValue{
 font:500 12px/1.25 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoP435930PrayerOptions{
 margin:0 auto 7px;max-width:740px;
}
@media(max-width:520px){
 #aoPray435930 .aoFolioSurface .aoDevoCardScroll{
  height:clamp(270px,48dvh,540px);
  padding:10px 13px 19dvh;gap:14px;
 }
 #aoPray435930 .aoFolioSurface .aoDevoCardHead{padding:9px 10px 9px}
 #aoPray435930 .aoFolioSurface .aoDevoStop{min-width:27px;padding:4px 7px}
 #aoPray435930 .aoFolioSurface .aoDevoCardScroll .aoP435930PrayerUnit button{
  font-size:18px!important;line-height:1.62!important;
 }
 #aoPray435930 .aoFolioSurface .aoDevoTimeline{min-height:56px}
 #aoPray435930 .aoFolioArt{height:145px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoFolioSurface *,#aoPray435930 .aoFolioInlineGesture{
  transition:none!important;animation:none!important;scroll-behavior:auto!important;
 }
}

`;

export function installPrayFolioStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById("ao-nonmass-folio-p0"))return false;
 const el=doc.createElement("style");el.id="ao-nonmass-folio-p0";
 el.textContent=PRAY_FOLIO_CSS;
 (doc.head||doc.documentElement).append(el);
 return true;
}
if(typeof document!=="undefined")installPrayFolioStyles(document);

/** No artwork box is rendered unless an approved, usable reproduction exists.
 * Source identity + image rights must both be certified by the artwork owner.
 */
export async function installAngelusFolioArtwork({form="angelus",cards=[],win=globalThis}={}){
 if(form!=="angelus")return false;
 const card=cards.find(x=>x?.dataset?.aoDevoCard==="announcement");
 const doc=card?.ownerDocument;
 if(!doc||card.querySelector(".aoFolioArt"))return false;
 const art=selectAngelusOpeningArtwork();
 if(!art)return false;
 const url=await resolveAngelusArtworkImage(art,{fetchImpl:win?.fetch?.bind?.(win)});
 if(!url||!/^https:\/\//i.test(url)||!card.isConnected)return false;
 const figure=doc.createElement("figure");figure.className="aoFolioArt";
 figure.dataset.aoArtworkId=art.id;
 const img=doc.createElement("img");img.alt="";img.setAttribute("aria-hidden","true");
 img.loading="lazy";img.decoding="async";img.src=url;
 img.addEventListener("error",()=>figure.remove(),{once:true});
 const credit=doc.createElement("figcaption");
 credit.textContent=art.artist+" · "+art.title;
 figure.append(img,credit);
 card.querySelector(".aoDevoCardHead")?.before(figure);
 return true;
}
