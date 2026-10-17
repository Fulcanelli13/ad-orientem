/**
 * Ad Orientem non-Mass Folio: reusable presentation, not a reader/rite.
 * Loaded only on first Prayer entry; safe to extend to other modules through
 * .aoFolio* opt-in surfaces without copying prayer texts, state or gesture clocks.
 * The current Angelus/Regina reader owns its five/four source-grounded cards.
 */
export const NONMASS_FOLIO_VERSION="nonmass-folio-p0-reconciled-v1";

export const NONMASS_FOLIO_CSS=String.raw`
#aoPray435930{
 --ao-folio-canvas:var(--ao-bg-canvas,var(--bg,#080c12));
 --ao-folio-surface:var(--ao-surface-1,var(--surface-1,#101821));
 --ao-folio-text:var(--ao-text-primary,var(--text,#ede8dd));
 --ao-folio-muted:var(--ao-text-muted,var(--muted,#9ba5b1));
 --ao-folio-accent:var(--ao-liturgical-accent,var(--liturgical,#bda67c));
 --ao-folio-border:var(--ao-rule,var(--border,rgba(220,205,171,.14)));
 --ao-folio-liturgical-font:var(--ao-font-liturgical,Georgia,serif);
 --ao-folio-display-font:var(--ao-font-display,Georgia,serif);
 --ao-folio-body-font:var(--ao-font-body,Georgia,serif);
 --ao-folio-readable-width:720px;
}
/* Establish a reusable quiet reading surface without changing the existing
   Angelus source corpus, focus resolver, translations or communal recitation. */
#aoPray435930 .aoDevoDeck{
 display:flex!important;flex-direction:column!important;
 width:100%;max-width:min(100%,var(--ao-folio-readable-width));
 margin-inline:auto;min-width:0;background:transparent;
 color:var(--ao-folio-text);
}
/* Viewport comes visually before compact navigation. Preserve the native DOM
   order, existing clickable chapter stops, swipes and keyboard semantics. */
#aoPray435930 .aoDevoDeck > .aoDevoCardViewport{order:0;min-width:0;}
#aoPray435930 .aoDevoDeck > .aoDevoTimeline{
 order:1;position:sticky;top:auto;bottom:0;z-index:19;
 min-height:58px;width:100%;margin:0;
 padding:6px 0 8px;
 border:0;border-top:1px solid var(--ao-folio-border);
 background:color-mix(in srgb,var(--ao-folio-canvas) 96%,transparent);
 backdrop-filter:blur(13px);
}
#aoPray435930 .aoDevoDeck .aoDevoStops{
 display:flex;align-items:center;gap:3px;min-width:0;
}
#aoPray435930 .aoDevoDeck .aoDevoStop{
 flex:0 0 auto;min-height:44px;
 min-width:28px;max-width:160px;padding:6px 8px;
 border:0;border-radius:7px;background:transparent;
 text-align:center;color:var(--ao-folio-muted);
}
#aoPray435930 .aoDevoDeck .aoDevoStop:not(.active) .aoDevoStopTitle{
 display:none;
}
#aoPray435930 .aoDevoDeck .aoDevoStop.active{
 background:color-mix(in srgb,var(--ao-folio-accent) 9%,transparent);
 color:var(--ao-folio-text);border:0;
}
#aoPray435930 .aoDevoDeck .aoDevoStopTitle{
 font:500 12px/1.25 var(--ao-folio-display-font);
}
#aoPray435930 .aoDevoDeck .aoDevoStopNumber{
 font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-folio-accent);
}
#aoPray435930 .aoDevoDeck .aoDevoNavArrow{
 min-width:44px;min-height:44px;
 border:0;border-radius:50%;background:transparent;
 color:var(--ao-folio-text);
}
#aoPray435930 .aoDevoDeck .aoDevoCard{animation:none;}
#aoPray435930 .aoDevoDeck .aoDevoCardHead{
 text-align:center;padding:17px 12px 11px;border:0;
}
#aoPray435930 .aoDevoDeck .aoDevoCardTitle{
 font:500 clamp(23px,5.3vw,30px)/1.15 var(--ao-folio-display-font);
 color:var(--ao-folio-text);margin:4px 0 3px;
}
#aoPray435930 .aoDevoDeck .aoDevoCardLatin{
 font:italic 13px/1.45 var(--ao-folio-liturgical-font);
 color:var(--ao-folio-muted);
}
#aoPray435930 .aoDevoDeck .aoDevoCardNumber{
 color:var(--ao-folio-accent);
}
#aoPray435930 .aoDevoDeck .aoDevoCardScroll{
 box-sizing:border-box;
 height:clamp(290px,55dvh,630px);
 min-height:0;padding:14px clamp(15px,5vw,40px) 20dvh;
 gap:18px;scrollbar-width:thin;
 scrollbar-color:var(--ao-folio-border) transparent;
}
#aoPray435930 .aoDevoDeck .aoDevoCardScroll .aoP435930PrayerUnit button{
 font:400 clamp(18px,4.35vw,22px)/1.7 var(--ao-folio-liturgical-font)!important;
 text-align:left;color:var(--ao-folio-text);
}
/* Source-based focus values are still determined by the existing scroll
   controller. This file tunes only how a change is perceived. */
#aoPray435930 .aoDevoDeck .aoDevoParagraph{
 transition:opacity .32s ease,color .32s ease!important;
}
#aoPray435930 .aoDevoDeck .aoDevoParagraph[data-ao-devo-active="true"]{
 color:var(--ao-folio-text)!important;
}
#aoPray435930 .aoDevoDeck .aoFolioConclusionPart{
 margin:15px 0 0;padding:18px 0 0;
 border-top:1px solid var(--ao-folio-border);
}
#aoPray435930 .aoDevoDeck .aoFolioConclusionHeading{
 margin:0 0 12px;color:var(--ao-folio-accent);
 font:italic 17px/1.35 var(--ao-folio-display-font);
}
#aoPray435930 .aoDevoDeck .aoFolioGloria{
 display:block;margin:6px 0;
}
#aoPray435930 .aoDevoDeck .aoFolioIncarnationCue{
 background:color-mix(in srgb,var(--ao-folio-accent) 5%,transparent);
 border-color:color-mix(in srgb,var(--ao-folio-accent) 24%,transparent);
}
#aoPray435930 .aoDevoDeck .aoFolioIncarnationCue .aoFolioIncarnationIcon{
 color:var(--ao-folio-accent);
}
#aoPray435930 .aoDevoDeck .aoDevoStop:focus-visible,
#aoPray435930 .aoDevoDeck .aoDevoNavArrow:focus-visible{
 outline:2px solid var(--ao-folio-accent);outline-offset:2px;
}
/* Optional future artwork surfaces are inert until the separately approved
   artwork/reproduction owner supplies an image. Never render placeholders. */
#aoPray435930 .aoDevoDeck .aoFolioArtwork[hidden]{display:none!important;}
#aoPray435930 .aoDevoDeck .aoFolioArtwork:not([hidden]){
 display:block;max-width:100%;height:clamp(145px,24dvh,250px);
 margin:0 auto 10px;overflow:hidden;
}
#aoPray435930 .aoDevoDeck .aoFolioArtwork img{
 display:block;width:100%;height:100%;object-fit:contain;
 filter:brightness(.87) saturate(.78);
}
@media(max-width:520px){
 #aoPray435930 .aoDevoDeck .aoDevoCardHead{padding:10px 10px 8px}
 #aoPray435930 .aoDevoDeck .aoDevoCardScroll{
  height:clamp(270px,49dvh,520px);
  padding:11px 14px 18dvh;gap:14px;
 }
 #aoPray435930 .aoDevoDeck .aoDevoStop{
  min-height:44px;padding:5px 7px;
 }
 #aoPray435930 .aoDevoDeck .aoDevoCardScroll .aoP435930PrayerUnit button{
  font-size:18px!important;line-height:1.65!important;
 }
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoDevoDeck *,
 #aoPray435930 .aoDevoDeck{
  animation:none!important;transition:none!important;
  scroll-behavior:auto!important;
 }
}
`;

export function installNonmassFolioStyles(doc=globalThis.document){
 if(!doc?.createElement||doc.getElementById("ao-nonmass-folio-p0"))return false;
 const node=doc.createElement("style");
 node.id="ao-nonmass-folio-p0";
 node.textContent=NONMASS_FOLIO_CSS;
 (doc.head||doc.documentElement).append(node);
 return true;
}
if(typeof document!=="undefined")installNonmassFolioStyles(document);
