/**
 * Shared devotional design language for canonical Rosary donor.
 * Scoped to the existing single player; no new modal, ribbon, bead cursor.
 */
export const ROSARY_DUAL_AXIS_CSS=String.raw`
#aoPrayerBookRoot.open .aoRosaryChapterTimeline{
 display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:5px;
 align-items:center;position:sticky;top:0;z-index:18;
 width:100%;max-width:100%;min-width:0;box-sizing:border-box;
 background:var(--bg,#080c12);border-block:1px solid var(--ao-rule,rgba(255,255,255,.15));
 padding:6px 2px;margin:8px 0 0
}
#aoPrayerBookRoot.open .aoRosaryChapterStops{
 display:flex;gap:5px;min-width:0;max-width:100%;overflow-x:auto;
 overscroll-behavior-x:contain;scroll-snap-type:x proximity;scrollbar-width:none
}
#aoPrayerBookRoot.open .aoRosaryChapterStops::-webkit-scrollbar{display:none}
#aoPrayerBookRoot.open .aoRosaryChapterStop{
 display:grid;gap:2px;flex:0 0 max(116px,42%);min-height:52px;
 text-align:left;align-content:center;scroll-snap-align:center;
 padding:8px 9px;margin:0;border-radius:9px;
 border:1px solid var(--ao-rule,rgba(255,255,255,.14));
 background:var(--surface-1,#141a20);color:var(--muted,#aeb2b8)
}
#aoPrayerBookRoot.open .aoRosaryChapterStop.active{
 border-color:var(--liturgical,#d8bd7d);background:color-mix(in srgb,var(--liturgical,#d8bd7d) 9%,var(--surface-1,#141a20));
 color:var(--text,#f1e7d7)
}
#aoPrayerBookRoot.open .aoRosaryChapterStop .aoRosaryStopNumber{
 font:600 10px/1.1 system-ui,sans-serif;letter-spacing:.12em
}
#aoPrayerBookRoot.open .aoRosaryChapterStop .aoRosaryStopTitle{
 font:500 12px/1.25 Georgia,serif;white-space:normal
}
#aoPrayerBookRoot.open .aoRosaryChapterArrow{
 min-height:46px;min-width:42px;padding:0;background:transparent;
 color:var(--text,#f1e7d7);border:1px solid var(--ao-rule,rgba(255,255,255,.14));
 border-radius:8px;font:22px/1 Georgia,serif
}
#aoPrayerBookRoot.open .aoRosaryChapterArrow:disabled{opacity:.23}
#aoPrayerBookRoot.open .aoRosaryCardHead{
 padding:14px 15px 12px;text-align:center;border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.13))
}
#aoPrayerBookRoot.open .aoRosaryCardNumber{
 font:600 10px/1.4 system-ui,sans-serif;letter-spacing:.12em;color:var(--muted,#aeb2b8)
}
#aoPrayerBookRoot.open .aoRosaryCardTitle{
 font:500 clamp(23px,5.6vw,30px)/1.2 Georgia,serif;
 color:var(--text,#f1e7d7);margin:5px 0 0
}
#aoPrayerBookRoot.open .lab-prayer-sheet.aoRosaryCardScroll{
 display:block;min-width:0;box-sizing:border-box;
 min-height:min(300px,45dvh)!important;height:min(52dvh,520px)!important;
 overflow-y:auto!important;overflow-x:hidden!important;overscroll-behavior-y:contain;scrollbar-width:thin;
 padding:20px 15px 25dvh
}
#aoPrayerBookRoot.open .aoRosaryCardScroll .aoRosaryParagraph{
 opacity:var(--ao-devo-focus,1);transition:opacity .2s ease
}
#aoPrayerBookRoot.open .aoRosaryCardScroll .aoRosaryParagraph[data-ao-devo-active="true"]{
 color:var(--text,#f3ead7)!important
}
@media(prefers-reduced-motion:reduce){
 #aoPrayerBookRoot.open .aoRosaryCardScroll .aoRosaryParagraph{transition:none!important}
}
`;
export function installRosaryDualAxisStyles(doc=globalThis.document){
 if(!doc?.head||doc.getElementById("ao-rosary-dual-axis-style"))return;
 const el=doc.createElement("style");
 el.id="ao-rosary-dual-axis-style";el.textContent=ROSARY_DUAL_AXIS_CSS;
 doc.head.append(el);
}
if(typeof document!=="undefined")installRosaryDualAxisStyles(document);
