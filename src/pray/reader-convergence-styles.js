import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
const PREVIOUS_ICON=resolveCanonicalAssetUrl("ao-ui-previous");
const NEXT_ICON=resolveCanonicalAssetUrl("ao-ui-next");

// Shared devotional reading presentation. Strictly visual: original prayer
// order, module state, response roles, timers, and source provenance remain owned
// by their established canonical engines.
export const PRAY_READER_CONVERGENCE_VERSION="pray-reader-convergence-v1";
const STYLE_ID="ao-pray-reader-convergence-css";
export const PRAY_READER_CONVERGENCE_CSS=String.raw`
#aoPray435930 .aoReaderStageIndicator{
  position:sticky;top:76px;z-index:24;min-width:0;
  display:grid;grid-template-columns:auto minmax(0,1fr);gap:5px 10px;align-items:center;
  margin:0;padding:8px 14px 7px!important;
  background:color-mix(in srgb,var(--ao-bg-canvas,#080c12) 97%,transparent)!important;
  border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.12));
  backdrop-filter:blur(14px);
}
#aoPray435930 .aoReaderStageNumber{
  color:var(--ao-liturgical-accent-text,var(--ao-liturgical-accent,#c9ad78));
  font:650 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);font-variant-numeric:tabular-nums;
}
#aoPray435930 .aoReaderStageTitle{
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
  overflow:hidden;white-space:normal;overflow-wrap:anywhere;
  color:var(--ao-text-primary,#e9e4d9);
  font:500 14px/1.35 var(--ao-font-display,Georgia,serif);
  letter-spacing:.01em;
}
#aoPray435930 .aoReaderStageTrack{
  display:block;grid-column:1/-1;height:3px;overflow:hidden;border-radius:2px;
  background:var(--ao-rule,rgba(255,255,255,.14));
}
#aoPray435930 .aoReaderStageTrack>i{
  display:block;height:100%;border-radius:2px;
  background:var(--ao-liturgical-accent,#c9ad78);
  transition:width .18s linear;
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail{
  position:sticky!important;top:132px!important;z-index:23!important;
  display:flex!important;gap:2px!important;align-items:center;
  padding:1px 10px 4px!important;margin:0!important;
  min-height:46px!important;overflow-x:auto!important;
  background:color-mix(in srgb,var(--ao-bg-canvas,#080c12) 96%,transparent)!important;
  border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.12))!important;
  box-shadow:none!important;scrollbar-width:none;
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail::-webkit-scrollbar{display:none}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button{
  appearance:none;position:relative;
  flex:1 0 44px!important;min-width:44px!important;min-height:44px!important;
  max-width:64px;padding:4px 6px 9px!important;margin:0!important;
  display:grid!important;place-items:center!important;
  border:0!important;border-radius:0!important;box-shadow:none!important;
  background:transparent!important;color:var(--ao-text-muted,#a1acb9)!important;
  cursor:pointer;text-align:center!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button>span{
  display:block!important;width:auto!important;height:auto!important;
  padding:0!important;border:0!important;border-radius:0!important;
  background:transparent!important;color:inherit!important;
  font:600 11px/1.2 var(--ao-font-ui,system-ui,sans-serif)!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button>b{
  display:none!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button::after{
  content:"";position:absolute;left:3px;right:3px;bottom:4px;height:3px;
  border-radius:2px;background:var(--ao-rule,rgba(255,255,255,.14));
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button.past::after{
  background:color-mix(in srgb,var(--ao-liturgical-accent,#c9ad78) 53%,transparent);
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button.active,
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button.current{
  color:var(--ao-text-primary,#e9e4d9)!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button.active::after,
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button.current::after{
  background:var(--ao-liturgical-accent,#c9ad78);
  box-shadow:0 0 8px var(--ao-liturgical-soft,rgba(255,255,255,.1));
}
#aoPray435930 .aoP435930StageRail.aoReaderStageRail>button:focus-visible{
  outline:2px solid var(--ao-liturgical-accent,#c9ad78)!important;
  outline-offset:-2px!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderMacroRail{
  top:132px!important;position:sticky!important;z-index:23!important;
  display:flex!important;gap:3px!important;background:transparent!important;
  padding:4px 10px 6px!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderMacroRail>span{
  flex:1!important;display:grid!important;place-items:center!important;
  min-height:42px!important;min-width:0!important;padding:3px 4px 8px!important;
  border:0!important;border-radius:0!important;background:transparent!important;
  box-shadow:inset 0 -3px var(--ao-rule,rgba(255,255,255,.14))!important;
  color:var(--ao-text-muted,#a1acb9)!important;
  font:500 clamp(9px,2.3vw,11px)/1.2 var(--ao-font-ui,system-ui,sans-serif)!important;
  text-align:center!important;white-space:normal!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderMacroRail>span.active{
  color:var(--ao-text-primary,#e9e4d9)!important;
  box-shadow:inset 0 -3px var(--ao-liturgical-accent,#c9ad78)!important;
}
#aoPray435930 .aoP435930StageRail.aoReaderMacroRail>span.past{
  box-shadow:inset 0 -3px color-mix(in srgb,var(--ao-liturgical-accent,#c9ad78) 50%,transparent)!important;
}
#aoPray435930 .aoP435930Prayer .aoP435930PrayerHead h3,
#aoPray435930 .aoP435930StationPrayer .aoReaderDevotionalTitle{
  margin:2px 0 8px!important;
  font:600 clamp(.85rem,2.5vw,1.02rem)/1.3 var(--ao-font-display,Georgia,serif)!important;
  text-transform:uppercase!important;letter-spacing:.105em!important;
  color:var(--ao-text-primary,#e9e4d9)!important;
}
/* Apply the established light/mute focus outside Benediction without
   allowing unfocused prayer text to disappear almost completely. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="adoration"] .aoP435930FluidUnit,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="library"] .aoP435930FluidUnit,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="prayerOnly"] .aoP435930FluidUnit{
  opacity:clamp(.54,var(--ao-pray-focus-opacity,1),1)!important;
  transition:opacity .14s linear!important;
}
#aoPray435930 .aoP435930PrayerHead small:empty{display:none!important}
/* Only the explicitly selected blessing stage receives a short arrival glow.
   The public rite itself controls timing; there is no auto-advance or bell. */
#aoPray435930 .aoP435930Body[data-ao-benediction-stage="blessing"] .aoP435930GuideNow{
  background:radial-gradient(ellipse at 50% 30%,
    var(--ao-liturgical-soft,rgba(215,203,173,.09)),transparent 72%)!important;
  animation:aoReaderBlessingReveal .5s ease-out both;
}
@keyframes aoReaderBlessingReveal{
  from{opacity:.78;filter:brightness(.90)}
  to{opacity:1;filter:brightness(1)}
}
/* Same compact reader grammar in lazy traditional-prayer and novena
   modules; source texts and devotional state remain untouched. */
#aoPray435930 .aoReadingPosition{margin:0 0 12px!important}
#aoPray435930 .aoReadingPosition .aoReaderStageTitle:empty{display:none}
#aoPray435930 .aoTP381GuideCard>h2,
#aoPray435930 .aoTP381PrayerCard>h3,
#aoPray435930 .aoN1CanonHead>b{
  font-family:var(--ao-font-display,Georgia,serif)!important;
  font-weight:600!important;font-size:clamp(.88rem,2.6vw,1.03rem)!important;
  line-height:1.35!important;
  text-transform:uppercase!important;letter-spacing:.10em!important;
}
#aoPray435930 .aoTP381GuideCard{
  border:0!important;border-top:1px solid var(--ao-rule,rgba(255,255,255,.12))!important;
  border-radius:0!important;background:transparent!important;
  padding:16px 2px!important;margin-top:0!important;
}
#aoPray435930 .aoTP381GuideCount{
  color:var(--ao-text-muted,#a1acb9)!important;
  font-family:var(--ao-font-ui,system-ui,sans-serif)!important;
}
#aoPray435930 .aoTP381GuideNav button,
#aoPray435930 .aoTP381GuideMode button,
#aoPray435930 .aoTP381Tabs button,
#aoPray435930 .aoN1Nav button{
  min-height:44px!important;
  border-radius:var(--ao-control-radius,11px)!important;
}
#aoPray435930 .aoTP381GuideNav button:focus-visible,
#aoPray435930 .aoN1Nav button:focus-visible{
  outline:2px solid var(--ao-liturgical-accent,#c9ad78)!important;
  outline-offset:2px!important;
}
#aoPray435930 .aoN1SourceText>small{
  display:block;font:600 11px/1.35 var(--ao-font-display,Georgia,serif)!important;
  letter-spacing:.11em;text-transform:uppercase;
  color:var(--ao-liturgical-accent-text,var(--ao-liturgical-accent,#c9ad78));
}
#aoPray435930 .aoP435930GuideNav button{
  border-radius:var(--ao-control-radius,11px)!important;
  font-family:var(--ao-font-ui,system-ui,sans-serif)!important;
  min-height:44px!important;
}
/* Decorative passage direction glyphs use the same canonical bank as global Back/Next.
   The full button text remains visible to screen readers and sighted readers. */
#aoPray435930 .aoP435930GuideNav .aoP435930Secondary::before,
#aoPray435930 .aoP435930GuideNav .aoP435930Primary::after{
  content:"";display:inline-block;width:1.05em;height:1.05em;
  background:currentColor;vertical-align:-.18em;
}
#aoPray435930 .aoP435930GuideNav .aoP435930Secondary::before{
  margin-right:.55em;
  -webkit-mask:url("${PREVIOUS_ICON}") center/contain no-repeat;
  mask:url("${PREVIOUS_ICON}") center/contain no-repeat;
}
#aoPray435930 .aoP435930GuideNav .aoP435930Primary::after{
  margin-left:.55em;
  -webkit-mask:url("${NEXT_ICON}") center/contain no-repeat;
  mask:url("${NEXT_ICON}") center/contain no-repeat;
}
#aoPray435930 .aoP435930GuideNav button:disabled{opacity:.35!important}
@media(max-width:560px){
  #aoPray435930 .aoReaderStageIndicator{top:76px;padding-inline:12px!important}
  #aoPray435930 .aoP435930StageRail.aoReaderStageRail{top:132px!important;padding-inline:8px!important}
}
@media(prefers-reduced-motion:reduce){
  #aoPray435930 .aoReaderStageTrack>i{transition:none}
  #aoPray435930 .aoP435930Body[data-ao-benediction-stage="blessing"] .aoP435930GuideNow{animation:none!important}
}
`;
export function installPrayReaderConvergenceStyles(doc=globalThis.document){
 if(!doc?.createElement||!doc?.head)return false;
 let node=doc.getElementById(STYLE_ID);
 if(!node){node=doc.createElement("style");node.id=STYLE_ID;doc.head.appendChild(node)}
 if(node.textContent!==PRAY_READER_CONVERGENCE_CSS)node.textContent=PRAY_READER_CONVERGENCE_CSS;
 return true;
}
if(typeof document!=="undefined")installPrayReaderConvergenceStyles(document);
