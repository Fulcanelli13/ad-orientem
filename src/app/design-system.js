export const APP_DESIGN_SYSTEM_VERSION="ao-design-system-v2";
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

  /* Shared UI type scale. Do not create new micro-sizes in feature CSS. */
  --ao-type-ui-xs:11px;
  --ao-type-ui-sm:12px;
  --ao-type-ui:14px;
  --ao-type-body:16px;
  --ao-type-prayer:clamp(16px,2.4vw,20px);
  --ao-type-prose:16px;
  --ao-type-speaker-weight:650;

  /*
   * Shared elevation vocabulary. These retain the migration-safe high range
   * while legacy roots still exist, but feature CSS must consume the tokens
   * rather than inventing a new z-index. Once the historical host is removed,
   * only these values need to be lowered.
   */
  --ao-z-surface:2147481800;
  --ao-z-sheet:2147483000;
  --ao-z-modal:2147483200;
  --ao-z-global-nav:2147483300;
}

.homeScreen{
  width:min(var(--ao-content-max),100%);
  margin-inline:auto;
}
.homeScreen,
#ao-calendar-modular-root,
#ao-learn-modular-root,
#ao-settings-modular-root,
#ao-find-modular-root{
  font-family:var(--ao-font-body);
  color:var(--ao-text-primary);
  text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;
}
.homeScreen h1,.homeScreen h2,.homeScreen h3,
#ao-calendar-modular-root h1,#ao-calendar-modular-root h2,#ao-calendar-modular-root h3,#ao-calendar-modular-root h4,
#ao-learn-modular-root h1,#ao-learn-modular-root h2,#ao-learn-modular-root h3,
#ao-settings-modular-root h1,#ao-settings-modular-root h2,#ao-settings-modular-root h3,
#ao-find-modular-root h1,#ao-find-modular-root h2,#ao-find-modular-root h3,
#aoPray435930 h1,#aoPray435930 h2,#aoPray435930 h3,#aoPray435930 h4,
.prepareScreen h1,.prepareScreen h2,.prepareScreen h3,
.thanksgivingScreen h1,.thanksgivingScreen h2,.thanksgivingScreen h3{
  font-family:var(--ao-font-display)!important;
}

#ao-global-ribbon{
  font-family:var(--ao-font-display);
  z-index:var(--ao-z-global-nav)!important;
}

.aoCalModTop button,
.aoLearnModTop button,
.aoSetModTop button,
.aoFindHeader button,
#aoPray435930 .aoP435930Head button{
  width:var(--ao-control-h)!important;
  height:var(--ao-control-h)!important;
  min-width:var(--ao-control-h)!important;
  min-height:var(--ao-control-h)!important;
  border-radius:var(--ao-pill-radius)!important;
}

.homeScreen .contentCard,
#ao-calendar-modular-root .aoCalV2NextMajor,
#ao-calendar-modular-root .aoCalV2YearHeroGrid,
#ao-calendar-modular-root .aoCalV2JourneyRail>button,
#ao-calendar-modular-root .aoCalV2ComingGrid button,
#ao-calendar-modular-root .aoCalV2IndexGrid button,
#ao-learn-modular-root .aoLearnModCard,
#ao-settings-modular-root .aoSetModCard,
#ao-find-modular-root .aoFindCard,
#ao-find-modular-root .aoFindEmpty,
#ao-find-modular-root .aoFindFacts>div,
#ao-find-modular-root .aoExploreAddress,
#ao-find-modular-root .aoExplorePlaceRow,
#aoPray435930 .aoP435930ModuleCard{
  border-radius:var(--ao-card-radius)!important;
}

#ao-calendar-modular-root button,
#ao-learn-modular-root button,
#ao-settings-modular-root button,
#ao-find-modular-root button,
#aoPray435930 button,
.prepareScreen button,
.thanksgivingScreen button{
  min-height:var(--ao-control-h);
  touch-action:manipulation;
}
#ao-calendar-modular-root button:focus-visible,
#ao-learn-modular-root button:focus-visible,
#ao-settings-modular-root button:focus-visible,
#ao-find-modular-root button:focus-visible,
#aoPray435930 button:focus-visible,
.prepareScreen button:focus-visible,
.thanksgivingScreen button:focus-visible{
  outline:2px solid var(--ao-liturgical-accent);
  outline-offset:2px;
}


/*
 * Shared liturgical transcription grammar. Four source roles share exactly
 * one type rule; the source, not the locale or surrounding section, owns the
 * distinction between ℣./℟. and M./S.
 */
:where(.ao-reader-shell,#aoPray435930,#aoPrayerBookRoot,#ao-learn-modular-root) .ao-liturgical-speaker{
  display:inline;
  font-family:inherit!important;
  font-size:1em!important;
  font-style:normal;
  font-weight:var(--ao-type-speaker-weight)!important;
  line-height:inherit;
  letter-spacing:0;
  white-space:nowrap;
  color:var(--liturgical,var(--ao-liturgical-accent));
}
.ao-reader-shell .ao-liturgical-speaker{
  color:var(--ao-mass-accent-text,var(--ao-liturgical-accent));
}
#aoPray435930 .aoAngelusDialogueLine>span:not(.ao-liturgical-speaker),
#aoPray435930 .aoP435930VRLine>button,
#ao-learn-modular-root .aoLearnTradPrompt,
#ao-learn-modular-root .aoLearnTradAnswer{
  font-family:var(--ao-font-liturgical,Georgia,serif)!important;
}
#aoPray435930 .aoAngelusDialogueLine>span:not(.ao-liturgical-speaker),
#aoPray435930 .aoP435930VRLine>button{
  font-size:var(--ao-type-prayer)!important;
  line-height:1.62;
}
/* Consistent Formation prose without overriding its title or citation UI. */
#ao-learn-modular-root .aoCSEAnswer,
#ao-learn-modular-root .aoCSEDebateStep p,
#ao-learn-modular-root .aoLearnTradIntro,
#ao-learn-modular-root .aoLearnTradCard p{
  font-family:var(--ao-font-body,Georgia,serif);
  font-size:var(--ao-type-prose);
  line-height:1.65;
}

/* Reusable source/provenance disclosure. Feature modules should converge here. */
.aoSourceDisclosure{
  margin-top:12px;
  padding-top:10px;
  border-top:1px solid var(--ao-rule);
  color:var(--ao-text-muted);
  font:500 var(--ao-type-ui-sm)/1.45 var(--ao-font-ui);
}
.aoSourceDisclosure>summary{
  min-height:var(--ao-control-h);
  display:flex;
  align-items:center;
  cursor:pointer;
  color:var(--ao-text-muted);
  font:650 var(--ao-type-ui-sm)/1.2 var(--ao-font-ui);
}
.aoSourceDisclosure a{
  color:var(--ao-liturgical-accent);
  text-underline-offset:2px;
}

@media(max-width:560px){
  :root{
    --ao-page-gutter:var(--ao-page-gutter-phone);
  }
}
@media(prefers-reduced-motion:reduce){
  #ao-calendar-modular-root *,
  #ao-learn-modular-root *,
  #ao-settings-modular-root *,
  #ao-find-modular-root *{
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
    (doc.head??doc.documentElement)?.append?.(style);
  }
  /*
   * Always refresh the style text. This lets an existing DOM created by a
   * previous owner converge to the current token contract without requiring a
   * page reload or a second override stylesheet.
   */
  if(style.textContent!==CSS)style.textContent=CSS;
  if(doc.documentElement?.dataset)doc.documentElement.dataset.aoDesignSystem=APP_DESIGN_SYSTEM_VERSION;
  return Object.freeze({version:APP_DESIGN_SYSTEM_VERSION,styleId:STYLE_ID,installed:true});
}
