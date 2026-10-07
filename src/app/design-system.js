export const APP_DESIGN_SYSTEM_VERSION="ao-design-system-v1";
const STYLE_ID="ao-app-design-system";

const CSS=`
:root{
  --ao-font-display:var(--font-display,Georgia,"Times New Roman",serif);
  --ao-font-body:var(--font-body,Georgia,"Times New Roman",serif);
  --ao-font-liturgical:var(--font-liturgical,var(--font-body,Georgia,"Times New Roman",serif));
  --ao-font-ui:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;
  --ao-bg-canvas:var(--bg,#080c12);
  --ao-surface-1:var(--surface-1,#101821);
  --ao-surface-2:var(--surface-2,#0d141c);
  --ao-text-primary:var(--text,#e9e4d9);
  --ao-text-muted:var(--muted,#9ba5b1);
  --ao-rule:var(--border,rgba(255,255,255,.11));
  --ao-liturgical-accent:var(--liturgical,#c9ad78);
  --ao-liturgical-border:var(--liturgical-border,rgba(201,173,120,.38));
  --ao-liturgical-soft:var(--liturgical-soft,rgba(201,173,120,.08));
  --ao-content-max:760px;
  --ao-content-wide:980px;
  --ao-page-gutter:14px;
  --ao-page-gutter-phone:12px;
  --ao-control-h:44px;
  --ao-card-radius:15px;
  --ao-control-radius:11px;
  --ao-pill-radius:999px;
  --ao-section-gap:18px;
  --ao-topbar-blur:16px;
}
.homeScreen,
#ao-calendar-modular-root,
#ao-learn-modular-root,
#ao-settings-modular-root{
  font-family:var(--ao-font-body);
  color:var(--ao-text-primary);
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
}
.homeScreen h1,.homeScreen h2,.homeScreen h3,
#ao-calendar-modular-root h1,#ao-calendar-modular-root h2,#ao-calendar-modular-root h3,#ao-calendar-modular-root h4,
#ao-learn-modular-root h1,#ao-learn-modular-root h2,#ao-learn-modular-root h3,
#ao-settings-modular-root h1,#ao-settings-modular-root h2,#ao-settings-modular-root h3,
#aoPray435930 h1,#aoPray435930 h2,#aoPray435930 h3,#aoPray435930 h4,
.prepareScreen h1,.prepareScreen h2,.prepareScreen h3,
.thanksgivingScreen h1,.thanksgivingScreen h2,.thanksgivingScreen h3{
  font-family:var(--ao-font-display);
}
#ao-calendar-modular-root button,
#ao-learn-modular-root button,
#ao-settings-modular-root button,
#aoPray435930 button,
.prepareScreen button,
.thanksgivingScreen button{
  min-height:var(--ao-control-h);
  touch-action:manipulation;
}
#ao-calendar-modular-root button:focus-visible,
#ao-learn-modular-root button:focus-visible,
#ao-settings-modular-root button:focus-visible,
#aoPray435930 button:focus-visible,
.prepareScreen button:focus-visible,
.thanksgivingScreen button:focus-visible{
  outline:2px solid var(--ao-liturgical-accent);
  outline-offset:2px;
}
@media(max-width:560px){
  :root{
    --ao-page-gutter:var(--ao-page-gutter-phone);
  }
}
@media(prefers-reduced-motion:reduce){
  #ao-calendar-modular-root *,
  #ao-learn-modular-root *,
  #ao-settings-modular-root *{
    scroll-behavior:auto!important;
  }
}
`;

export function installAppDesignSystem(win=globalThis){
  const doc=win?.document;
  if(!doc?.createElement)return null;
  let style=doc.getElementById?.(STYLE_ID)??null;
  if(!style){
    style=doc.createElement("style");
    style.id=STYLE_ID;
    style.textContent=CSS;
    (doc.head??doc.documentElement)?.append?.(style);
  }
  if(doc.documentElement?.dataset)doc.documentElement.dataset.aoDesignSystem=APP_DESIGN_SYSTEM_VERSION;
  return Object.freeze({version:APP_DESIGN_SYSTEM_VERSION,styleId:STYLE_ID,installed:true});
}
