/**
 * Quiet, prayer-first visual language shared by existing DAILY donor and
 * First Friday / First Saturday programmes. No artificial timers or rewards.
 */
export const QUIET_DEVOTIONAL_PROGRESSION_CSS=String.raw\`
/* Progressive horizon: abstract atmospheric light, not a drawn landscape. */
#aoPray435930 [data-ao-quiet-daily-horizon]{
  --ao-sky-top:#111b29;--ao-sky-mid:#283440;--ao-sky-low:#50494a;--ao-sky-light:#916b60;
  margin:5px 0 11px;flex:0 0 auto;min-width:0;
}
#aoPray435930 .aoQuietHorizonCanvas{
  position:relative;isolation:isolate;overflow:hidden;
  height:clamp(90px,13.5dvh,130px);
  border-radius:3px;
  border:1px solid color-mix(in srgb,var(--liturgical,#ba9e71) 15%,transparent);
  background:linear-gradient(180deg,var(--ao-sky-top),var(--ao-sky-mid) 59%,var(--ao-sky-low));
}
#aoPray435930 .aoQuietHorizonCanvas:before{
 content:"";position:absolute;inset:0;
 background:radial-gradient(ellipse 88% 45% at 49% 108%,var(--ao-sky-light),transparent 74%);
 opacity:.43;pointer-events:none;
}
#aoPray435930 .aoQuietHorizonCanvas:after{
 content:"";position:absolute;inset:0;
 background:
   linear-gradient(180deg,transparent 62%,rgba(7,13,20,.34) 100%),
   repeating-linear-gradient(117deg,rgba(220,209,187,.016) 0px,transparent 1px,transparent 9px);
 pointer-events:none;
}
#aoPray435930 .aoQuietHorizonCanvas.is-changing:before{
 animation:aoQuietSkySettle .9s ease-out both;
}
@keyframes aoQuietSkySettle{from{opacity:.12}to{opacity:.43}}
#aoPray435930 .aoQuietHorizonMeta{
 display:flex;align-items:center;justify-content:space-between;
 gap:8px;margin:9px 1px 0;
}
#aoPray435930 .aoQuietHorizonMeta>span{
 color:var(--muted,#a7a49f);font:italic 12px/1.3 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoQuietHorizonTrace{
 position:relative;flex:0 1 118px;height:1px;background:color-mix(in srgb,var(--liturgical,#b9a17d) 25%,transparent);
}
#aoPray435930 .aoQuietHorizonTrace>span{
 position:absolute;inset:0 auto 0 0;background:var(--liturgical,#b9a17d);
 max-width:100%;transition:width .3s ease;
}
/* Daypart chooser remains easily reachable; eliminate the generic numbered timeline. */
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoTP381DaypartStrip{margin:0}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoTP381GuideCount{display:none!important}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoSequenceTimeline{
 min-height:48px!important;
 padding:2px 0!important;
}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoSequenceTimeline .aoDevoStop{
 flex:0 0 44px!important;min-width:44px!important;width:44px!important;
 max-width:44px!important;min-height:44px!important;
 border:0!important;background:transparent!important;
 box-shadow:none!important;padding:0!important;
 display:grid!important;place-items:center!important;
}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoStopNumber,
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoStopTitle{
 display:none!important;
}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoSequenceTimeline .aoDevoStop:after{
 content:"";width:5px;height:5px;border-radius:50%;
 background:color-mix(in srgb,var(--liturgical,#b9a17d) 24%,transparent);
 border:1px solid color-mix(in srgb,var(--liturgical,#b9a17d) 47%,transparent);
}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoSequenceTimeline .aoDevoStop.active:after{
 width:8px;height:8px;background:var(--liturgical,#b9a17d);
 box-shadow:0 0 0 3px color-mix(in srgb,var(--liturgical,#b9a17d) 13%,transparent);
}
#aoPray435930 .aoP435930Mount[data-ao-traditional-dual-axis="daily"] .aoDevoCardScroll{
 min-height:min(270px,42dvh);
}
/* Nine / five-month register: quiet ink marks rather than medals or badges. */
#aoPray435930 .aoQuietMonthRegister{
 --ao-series-ink:#a98b78;
 display:grid;gap:9px;padding:14px 12px 12px;margin:1px 0 6px;
 border:1px solid var(--border,rgba(220,200,171,.15));
 border-radius:10px;
 background:color-mix(in srgb,var(--surface-1,#111820) 80%,transparent);
}
#aoPray435930 .aoQuietMonthRegister[data-ao-month-kind="saturday"]{--ao-series-ink:#9aaec1}
#aoPray435930 .aoQuietMonthTitle{
 display:flex;align-items:baseline;justify-content:space-between;gap:9px;
 color:var(--text,#e9dfd1);font:italic 15px/1.35 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoQuietMonthTitle small{
 color:var(--muted,#9d9b98);font:11px/1.4 var(--ao-font-ui,system-ui,sans-serif);
 white-space:nowrap;
}
#aoPray435930 .aoQuietMonthGrid{
 display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
 column-gap:11px;row-gap:13px;padding:6px 2px 7px;
}
#aoPray435930 .aoQuietMonthCell{
 display:flex;align-items:center;gap:9px;min-width:0;
 color:var(--muted,#898a8b);font:12px/1.4 var(--ao-font-liturgical,Georgia,serif);
}
#aoPray435930 .aoQuietMonthCell>span{
 display:inline-block;width:8px;height:8px;min-width:8px;border-radius:50%;
 border:1px solid color-mix(in srgb,var(--ao-series-ink) 55%,transparent);
}
#aoPray435930 .aoQuietMonthCell[data-status="recorded"]{color:var(--text,#e9dfd1)}
#aoPray435930 .aoQuietMonthCell[data-status="recorded"]>span{
 background:var(--ao-series-ink);border-color:var(--ao-series-ink);
}
#aoPray435930 .aoQuietMonthCell[data-status="incomplete"]{color:var(--muted,#b0a39e)}
#aoPray435930 .aoQuietMonthCell[data-status="incomplete"]>span{
 border-style:dashed;border-color:#a58a80;
}
#aoPray435930 .aoQuietMonthCell>abbr{text-decoration:none;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}
#aoPray435930 .aoQuietMonthNote{
 margin:0;color:var(--muted,#a09b91);
 font:11px/1.5 var(--ao-font-ui,system-ui,sans-serif);
}
#aoPray435930 .aoP435930ProgrammeRail button>span{display:none!important}
#aoPray435930 .aoP435930ProgrammeRail button>b{font-weight:500}
@media(max-width:370px){
 #aoPray435930 .aoQuietMonthRegister{padding:12px 9px}
 #aoPray435930 .aoQuietMonthGrid{column-gap:5px}
 #aoPray435930 .aoQuietMonthCell{gap:6px;font-size:11px}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoQuietHorizonCanvas.is-changing:before{animation:none!important}
 #aoPray435930 .aoQuietHorizonTrace>span{transition:none!important}
}
\`;
export function installQuietDevotionalProgressionStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-quiet-devotional-progression-style"))return;
 const style=doc.createElement("style");style.id="ao-quiet-devotional-progression-style";
 style.textContent=QUIET_DEVOTIONAL_PROGRESSION_CSS;
 (doc.head||doc.documentElement).append(style);
}
if(typeof document!=="undefined")installQuietDevotionalProgressionStyles(document);
