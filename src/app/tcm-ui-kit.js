// Shared visual vocabulary for the Today / embedded Calendar / M1 Mass entry
// redesign. It intentionally does not target PRAY, the Office or the R17 reader.
// Existing source owners and route handlers remain untouched.
export const TCM_KIT_VERSION="ao-tcm-ui-kit-v1";
export const TCM_KIT_STYLE_ID="ao-tcm-ui-kit";

export const TCM_KIT_CSS=String.raw`
:where(.homeScreen.aoTodayV2,#ao-calendar-modular-root,
  html[data-ao-m1-mass-root="true"] #ao-mass-flow-v1){
  --ao-tcm-bg:#0a0f15;
  --ao-tcm-surface:#121a22;
  --ao-tcm-raised:#18232d;
  --ao-tcm-ink:#f1ebe1;
  --ao-tcm-ink-2:#cfc6b8;
  --ao-tcm-mute:#98a1ab;
  --ao-tcm-line:#24303b;
  --ao-tcm-sage:#86b596;
  --ao-tcm-on-sage:#0b1410;
  --ao-tcm-sage-bg:#1e2c26;
  --ao-tcm-gold:#d9bb7e;
  --ao-tcm-rubric:#d07a6e;
  --ao-tcm-card-radius:18px;
  --ao-tcm-control-radius:16px;
  --ao-tcm-sheet-radius:20px;
  --ao-tcm-section-gap:32px;
  --ao-tcm-gutter:16px;
  --ao-tcm-max-width:560px;
  --ao-tcm-control-height:44px;
  --ao-tcm-primary-height:54px;
}
html[data-ao-appearance-v1="light"] :where(.homeScreen.aoTodayV2,#ao-calendar-modular-root,
  #ao-mass-flow-v1){
  --ao-tcm-bg:#f6f2ea;
  --ao-tcm-surface:#ffffff;
  --ao-tcm-raised:#efe8dc;
  --ao-tcm-ink:#1e242b;
  --ao-tcm-ink-2:#3c434b;
  --ao-tcm-mute:#6a7380;
  --ao-tcm-line:#e2d9ca;
  --ao-tcm-sage:#3e7a57;
  --ao-tcm-on-sage:#ffffff;
  --ao-tcm-sage-bg:#e3efe6;
  --ao-tcm-gold:#94712f;
  --ao-tcm-rubric:#9b2c24;
}
@media(max-width:359px){
  :where(.homeScreen.aoTodayV2,#ao-calendar-modular-root,
    html[data-ao-m1-mass-root="true"] #ao-mass-flow-v1){--ao-tcm-gutter:12px}
}
/* Named components are opt-in. Existing pages don't change until migrated.
   Sacred reading typography is never targeted by these selectors. */
.aoTcmCard{
  border:1px solid var(--ao-tcm-line);
  border-radius:var(--ao-tcm-card-radius);
  background:var(--ao-tcm-surface);
  color:var(--ao-tcm-ink);
  padding:20px;
  min-width:0;
}
.aoTcmRow{display:flex;align-items:center;gap:12px;min-height:58px;
  padding:10px 14px;border-bottom:1px solid var(--ao-tcm-line);
  color:var(--ao-tcm-ink);min-width:0}
.aoTcmRow:last-child{border-bottom:0}
.aoTcmSection{margin-block:var(--ao-tcm-section-gap) 0;min-width:0}
.aoTcmSectionHeading{font:500 21px/1.15 var(--ao-font-display,Georgia,serif);
  color:var(--ao-tcm-ink);margin:0 0 12px}
.aoTcmPrimary{min-height:var(--ao-tcm-primary-height);border-radius:var(--ao-tcm-control-radius);
  border:1px solid var(--ao-tcm-sage);background:var(--ao-tcm-sage);
  color:var(--ao-tcm-on-sage);font:600 17px/1.2 var(--ao-font-display,Georgia,serif);
  padding:12px 16px;cursor:pointer}
.aoTcmSecondary{min-height:44px;border-radius:12px;border:1px solid var(--ao-tcm-line);
  background:transparent;color:var(--ao-tcm-ink);font:500 15px/1.25 var(--ao-font-display,Georgia,serif);
  padding:8px 12px;cursor:pointer}
.aoTcmNotice{border:1px solid var(--ao-tcm-line);border-radius:12px;
  padding:12px;color:var(--ao-tcm-ink-2);
  font:400 14px/1.45 var(--ao-font-display,Georgia,serif)}
.aoTcmAuthority{display:inline-flex;align-items:center;min-height:22px;
  border:1px solid currentColor;border-radius:5px;padding:4px 6px;
  font:700 9px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.aoTcmAuthority[data-authority="1962"]{color:var(--ao-tcm-gold)}
.aoTcmAuthority[data-authority="custom"]{color:var(--ao-tcm-sage)}
.aoTcmAuthority[data-authority="mine"]{color:var(--ao-tcm-ink-2);border-style:dashed}
.aoTcmAuthority[data-authority="later"]{color:var(--ao-tcm-mute)}
.aoTcmSkeleton{display:block;background:var(--ao-tcm-line);height:10px;border-radius:4px}
/* Live first consumer of the shared kit: H2 Today / Month / Year lens.
   High specificity beats the older Today-only strip, without changing tab
   identity, event delegation, bottom navigation, or the Calendar resolver. */
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens{
  box-sizing:border-box;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));
  gap:3px;margin:0 var(--ao-tcm-gutter);padding:3px;
  min-height:44px;border:1px solid var(--ao-tcm-line);
  border-radius:20px;background:var(--ao-tcm-surface);
}
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens button,
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens span{
  min-width:0;min-height:44px;border:0;border-radius:17px;
  color:var(--ao-tcm-mute);background:transparent;
  font-family:var(--ao-font-display,Georgia,serif)!important;
  font-size:14px;line-height:1.2;font-weight:500;
  letter-spacing:0;text-transform:none;white-space:nowrap;
}
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens button[aria-current="page"],
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens button[aria-selected="true"],
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens span{
  background:var(--ao-tcm-raised);
  color:var(--ao-tcm-ink);
  box-shadow:inset 0 0 0 1px var(--ao-tcm-sage);
}
.homeScreen.aoTodayV2 .aoTodayV2Tabs.aoTcmLens button:focus-visible{
  outline:2px solid var(--ao-tcm-sage);outline-offset:-2px;
}
:where(.aoTcmPrimary,.aoTcmSecondary,.aoTcmRow):focus-visible{
  outline:2px solid var(--ao-tcm-sage);outline-offset:2px;
}
@media(max-width:359px){.aoTcmCard{padding:16px}}
@media(prefers-reduced-motion:reduce){.aoTcmLens *{scroll-behavior:auto!important}}
`;

export function installTodayCalendarMassKit(win=globalThis){
 const doc=win?.document;
 if(!doc?.createElement)return null;
 let node=doc.getElementById?.(TCM_KIT_STYLE_ID);
 if(!node){
   node=doc.createElement("style");node.id=TCM_KIT_STYLE_ID;
   (doc.head??doc.documentElement)?.append(node);
 }
 if(node.textContent!==TCM_KIT_CSS)node.textContent=TCM_KIT_CSS;
 return Object.freeze({installed:true,version:TCM_KIT_VERSION,styleId:TCM_KIT_STYLE_ID});
}
