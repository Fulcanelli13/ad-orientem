export const APP_DESIGN_SYSTEM_VERSION="ao-design-system-v2";
const STYLE_ID="ao-app-design-system";

const CSS=`
:root{
  --ao-font-display:var(--font-liturgical,"EB Garamond",Georgia,serif);
  --ao-font-brand:var(--font-display,"Cinzel",Georgia,serif);
  --ao-font-body:var(--font-liturgical,"EB Garamond",Georgia,serif);
  --ao-font-liturgical:var(--font-liturgical,var(--font-body,Georgia,"Times New Roman",serif));
  --ao-font-ui:var(--font-liturgical,"EB Garamond",Georgia,serif);

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
  --ao-type-ui-xs:13px;
  --ao-type-ui-sm:14px;
  --ao-type-ui:16px;
  --ao-type-body:18px;
  --ao-type-prayer:clamp(20px,5.65vw,24px);
  --ao-type-prose:18px;
  --ao-type-action-primary:17px;
  --ao-type-action-secondary:16px;
  --ao-type-speaker-weight:650;
  /* Tab-bar labels. Earlier per-breakpoint rules shrank them to 7.4-9 px. */
  --ao-type-nav:12px;

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
#ao-global-ribbon .aoGlobalRibbonBtn{
  font-size:var(--ao-type-nav)!important;
  letter-spacing:0;
}
#ao-global-ribbon .aoGlobalRibbonBtn:not(.active){
  color:var(--ao-text-muted);
}

.homeScreen .homeUtilityButton{
  min-width:var(--ao-control-h);
  min-height:var(--ao-control-h);
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


/*
 * Approved app-wide A2 hybrid action grammar:
 * primary actions use EB Garamond small caps; secondary actions stay quiet.
 * Ordinary display roles use EB Garamond. Cinzel remains the brand font.
 * No font-variant or text-transform rule is applied to liturgical text.
 */
:where(.homeScreen,#ao-calendar-modular-root,#ao-learn-modular-root,
  #ao-settings-modular-root,#ao-find-modular-root,#aoPray435930,
  #aoPrayerBookRoot,#ao-scripture-overlay,.aoScriptureLibrary,
  .aoHeritageSurface,.aoApostolateSurface,.aoApostolateRoot,
  .prepareScreen,.thanksgivingScreen,.ao-reader-shell,#ao-global-ribbon)
  :is(button,[role="button"],input,select,textarea){
  font-family:var(--ao-font-ui)!important;
}
:where(.homeScreen,#ao-calendar-modular-root,#ao-learn-modular-root,
  #ao-settings-modular-root,#ao-find-modular-root,#aoPray435930,
  #aoPrayerBookRoot,#ao-scripture-overlay,.aoScriptureLibrary,
  .aoHeritageSurface,.aoApostolateSurface,.aoApostolateRoot,
  .prepareScreen,.thanksgivingScreen)
  :is(button.primary,button.aoTodayV2PrimaryMass,button.aoCalV2Primary,
    button.aoRosaryBegin,button.aoApostolatePrimary,
    button.aoHeritagePrayAction,button[data-ao-primary],
    button[data-action-priority="primary"]){
  font-family:var(--ao-font-ui)!important;
  font-size:var(--ao-type-action-primary)!important;
  font-weight:600!important;
  font-variant-caps:small-caps;
  letter-spacing:.04em;
  line-height:1.3;
}
:where(.homeScreen,#ao-calendar-modular-root,#ao-learn-modular-root,
  #ao-settings-modular-root,#ao-find-modular-root,#aoPray435930,
  #aoPrayerBookRoot,#ao-scripture-overlay,.aoScriptureLibrary,
  .aoHeritageSurface,.aoApostolateSurface,.aoApostolateRoot,
  .prepareScreen,.thanksgivingScreen)
  :is(.aoTodayV2SecondaryMass button,.aoApostolateActions button,
    .aoCalPracticeActions button,.aoHeritagePreviewActions button){
  font-family:var(--ao-font-ui)!important;
  font-size:var(--ao-type-action-secondary)!important;
  font-weight:400!important;
  font-variant-caps:normal;
  letter-spacing:0;
  line-height:1.4;
}
:where(.homeScreen,#ao-global-ribbon) .brandName,
:where(.homeScreen,#ao-global-ribbon) .aoBrandName,
.aoBrandWordmark{
  font-family:var(--ao-font-brand)!important;
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

/* AO quiet-frame visual baseline — approved 2026-10-24.
 * Presentation-only. The 1962 resolver, Mass reader, prayer routing and
 * source/art provenance remain owned by their existing modules.
 * Use the established v2 design-system owner; do not install a second skin.
 */
:root{
  --ao-frame-bg:#0B0F13;
  --ao-frame-card:#141A20;
  --ao-frame-raised:#1C232B;
  --ao-frame-text:#ECE8DF;
  --ao-frame-muted:#A3ABB4;
  --ao-frame-rule:rgba(255,255,255,.08);
  --ao-frame-radius:16px;
  --ao-frame-gutter:16px;
  --ao-frame-header:56px;
  --ao-frame-action:52px;
  --ao-frame-secondary:48px;
}
/* Shared primitives for migrations. Ordinary cards contain groups; list
 * rows keep their own dividers rather than nested decorative borders. */
.aoQuietFrame{background:var(--ao-frame-bg);color:var(--ao-frame-text);font-family:var(--ao-font-body)}
.aoQuietHeader{min-height:var(--ao-frame-header);display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;border-bottom:1px solid var(--ao-frame-rule);padding-inline:var(--ao-frame-gutter)}
.aoQuietHeaderTitle{min-width:0;text-align:center;font:400 19px/1.3 var(--ao-font-display);overflow-wrap:anywhere}
.aoQuietHeaderAction{display:grid;place-items:center;width:44px;height:44px;border:0;background:none;color:var(--ao-frame-text)}
.aoQuietCard{padding:16px;border:0;border-radius:var(--ao-frame-radius);background:var(--ao-frame-card)}
.aoQuietRow{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:12px;min-height:64px;padding:10px 16px;background:transparent;color:var(--ao-frame-text);border:0;border-bottom:1px solid var(--ao-frame-rule);text-align:left;font-family:var(--ao-font-ui)}
.aoQuietRow:last-child{border-bottom:0}
.aoQuietRowTitle{display:block;font-size:17px;line-height:1.3;font-weight:500}
.aoQuietRowSubtitle{display:block;font-size:14px;line-height:1.4;color:var(--ao-frame-muted)}
.aoQuietPrimary{display:flex;align-items:center;justify-content:center;width:100%;min-height:var(--ao-frame-action);border:0;border-radius:12px;background:var(--liturgical,var(--ao-liturgical-accent));color:var(--liturgical-ink,var(--ao-frame-bg));font:500 17px/1.35 var(--ao-font-ui);font-variant-caps:normal;letter-spacing:0}
.aoQuietSecondary{display:flex;align-items:center;justify-content:center;min-height:var(--ao-frame-secondary);border:1px solid var(--ao-frame-rule);border-radius:12px;background:transparent;color:var(--ao-frame-text);font:400 17px/1.35 var(--ao-font-ui)}
.aoQuietHeaderAction:focus-visible,.aoQuietRow:focus-visible,.aoQuietPrimary:focus-visible,.aoQuietSecondary:focus-visible{outline:2px solid var(--liturgical,var(--ao-liturgical-accent));outline-offset:2px}
#ao-global-ribbon .aoGlobalRibbonBtn{font-size:12px!important;font-variant-caps:normal!important;text-transform:none!important;letter-spacing:0!important}
#ao-global-ribbon .aoGlobalRibbonIcon{width:24px!important;height:24px!important}
/* Today: keep all existing calendar controls, proper selection, art and
 * action callbacks. Hide the redundant view switch only in normal Today;
 * its embedded calendar views retain their tabs. */
.homeScreen.aoTodayV2{background:var(--ao-frame-bg)!important;color:var(--ao-frame-text)}
.homeScreen.aoTodayV2 .aoTodayV2Header{background:var(--ao-frame-bg)!important}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayV2Tabs{display:none!important}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoHomeCalendarAccess{display:flex!important;justify-content:flex-end;padding:4px var(--ao-frame-gutter) 8px!important}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoHomeCalendarAction{border:0!important;background:transparent!important;color:var(--liturgical,var(--ao-liturgical-accent))!important}
.homeScreen.aoTodayV2 .aoTodayV2PrimaryMass{min-height:var(--ao-frame-action)!important;border-radius:12px!important}
.homeScreen.aoTodayV2 .aoTodayV2PrimaryMass b{font-variant-caps:normal!important;letter-spacing:0!important;font-size:17px!important}
.homeScreen.aoTodayV2 .aoTodayV2SecondaryMass{gap:12px!important}
.homeScreen.aoTodayV2 .aoTodayV2SecondaryMass button{flex:1;min-height:var(--ao-frame-secondary)!important;padding-inline:12px!important;border:1px solid var(--ao-frame-rule)!important;border-radius:12px!important;color:var(--ao-frame-text)!important;background:transparent!important}
.homeScreen.aoTodayV2 .aoTodayV2HeroActions{background:var(--ao-frame-bg)!important}
/* Mobile frontispiece: show the feast outside the painting, rather than
 * overlaying the sacred art. The art credit remains source-owned. */
@media(max-width:699px){
 .homeScreen.aoTodayV2 .aoTodayV2Frontispiece{display:flex!important;flex-direction:column!important;margin:0 var(--ao-frame-gutter)!important;border:0!important;border-radius:0!important;background:var(--ao-frame-bg)!important;overflow:visible!important}
 .homeScreen.aoTodayV2 .aoTodayV2Art{display:flex!important;flex-direction:column!important;height:auto!important;overflow:visible!important;background:transparent!important}
 .homeScreen.aoTodayV2 .aoTodayV2Art::after{display:none!important}
 .homeScreen.aoTodayV2 .aoTodayV2ArtOverlay{order:-1!important;position:static!important;inset:auto!important;min-height:0!important;padding:16px 0 12px!important;display:block!important;pointer-events:none!important}
 .homeScreen.aoTodayV2 .aoTodayV2ArtOverlay .eyebrow{display:none!important}
 .homeScreen.aoTodayV2 .aoTodayV2ArtOverlay h1{margin:0!important;font:400 28px/1.15 var(--ao-font-display)!important;text-align:left!important;text-shadow:none!important;color:var(--ao-frame-text)!important;overflow-wrap:normal!important}
 .homeScreen.aoTodayV2 .aoTodayV2ArtSource{display:block;flex:none;width:100%;height:clamp(215px,57vw,355px)!important;overflow:hidden;border-radius:var(--ao-frame-radius)!important;background:var(--ao-frame-card)}
 .homeScreen.aoTodayV2 .aoTodayV2ArtSource img{object-fit:contain!important;object-position:center!important}
 .homeScreen.aoTodayV2 .aoTodayV2HeroActions{padding:12px 0 16px!important}
 .homeScreen.aoTodayV2 .aoTodayV2Mass{padding:12px 0 16px!important}
 .homeScreen.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2ArtSource{display:none!important}
}
/* Only the Pray catalogue shell; devotional reading and prayer cards retain
 * their separately audited visual contracts and sequence behaviour. */
#aoPray435930 .aoP435930RootOrganised .aoP435930ModuleCard{background:var(--ao-frame-card)!important;border:1px solid var(--ao-frame-rule)!important;border-radius:var(--ao-frame-radius)!important;box-shadow:none!important}
#aoPray435930 .aoP435930RootOrganised .aoP435930ModuleCard b{font-family:var(--ao-font-display)!important;font-size:17px!important;font-variant-caps:normal!important;letter-spacing:0!important}
#aoPray435930 .aoP435930RootOrganised .aoP435930ModuleKind{display:none!important}
#aoPray435930 .aoP435930RootOrganised .aoP435930ModuleDescription{color:var(--ao-frame-muted)!important;font-size:14px!important}
@media(prefers-reduced-motion:reduce){.aoQuietFrame *,#ao-global-ribbon *{scroll-behavior:auto!important}}


/* Quiet Frame P2a: ordinary Formation / Settings / Explore chrome.
 * Visual-only surface adaptation. Keep native controllers, map canvases,
 * draggable sheets, site provenance and specialized reader views untouched. */
#ao-learn-modular-root,#ao-settings-modular-root,
#ao-find-modular-root .aoExploreSurface{
 background:var(--ao-frame-bg,#0B0F13)!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
}
#ao-learn-modular-root .aoLearnModTop,
#ao-settings-modular-root .aoSetTop,
#ao-find-modular-root .aoExploreSurface>.aoFindHeader,
#ao-find-modular-root .aoHeritageSurface>.aoFindHeader{
 background:var(--ao-frame-bg,#0B0F13)!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
 border-bottom:1px solid var(--ao-frame-rule,rgba(255,255,255,.08))!important;
 box-shadow:none!important;
}
#ao-learn-modular-root .aoLearnModTop button,
#ao-settings-modular-root .aoSetTop button,
#ao-find-modular-root .aoExploreSurface>.aoFindHeader>button,
#ao-find-modular-root .aoHeritageSurface>.aoFindHeader>button{
 min-width:44px!important;min-height:44px!important;
 background:transparent!important;
 border:0!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
 box-shadow:none!important;
}
#ao-learn-modular-root .aoLearnModTopTitle small,
#ao-settings-modular-root .aoSetTitle small,
#ao-find-modular-root .aoExploreSurface>.aoFindHeader>div>small,
#ao-find-modular-root .aoHeritageSurface>.aoFindHeader>div>small{
 display:none!important;
}
#ao-learn-modular-root .aoLearnModTopTitle strong,
#ao-settings-modular-root .aoSetTitle strong,
#ao-find-modular-root .aoExploreSurface>.aoFindHeader h1,
#ao-find-modular-root .aoHeritageSurface>.aoFindHeader h1{
 font:400 19px/1.3 var(--ao-font-display,"EB Garamond",Georgia,serif)!important;
 letter-spacing:0!important;
 text-transform:none!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
}
#ao-learn-modular-root .aoLearnModWrap,
#ao-settings-modular-root .aoSetWrap{
 width:min(var(--ao-content-max,760px),100%);
 padding-inline:var(--ao-frame-gutter,16px)!important;
}
/* The nine-section table of contents belongs in an opened Formation reader,
 * not above the discovery homepage. Preserve it for each subject/lesson. */
#ao-learn-modular-root[data-ao-learn-family=""]>.aoFNav{display:none!important}
#ao-learn-modular-root .aoLearnModHero h1{
 font:400 clamp(28px,5vw,38px)/1.16 var(--ao-font-display,"EB Garamond",Georgia,serif)!important;
 letter-spacing:0!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
}
#ao-learn-modular-root .aoLearnFamilyCard{
 background:var(--ao-frame-card,#141A20)!important;
 border-color:var(--ao-frame-rule,rgba(255,255,255,.08))!important;
 box-shadow:none!important;
}
#ao-learn-modular-root .aoLearnFamilyDoor p{
 font-size:14px!important;line-height:1.48!important;
 color:var(--ao-frame-muted,#A3ABB4)!important;
}
#ao-settings-modular-root .aoSetGroup{
 border:0!important;
 border-radius:var(--ao-frame-radius,16px)!important;
 background:var(--ao-frame-card,#141A20)!important;
 box-shadow:none!important;
}
#ao-settings-modular-root .aoSetSection>h2{
 font:500 13px/1.45 var(--ao-font-ui,"EB Garamond",Georgia,serif)!important;
 color:var(--ao-frame-muted,#A3ABB4)!important;
 font-variant-caps:small-caps!important;
 letter-spacing:.06em!important;
 text-transform:none!important;
}
#ao-settings-modular-root .aoSetRow{
 min-height:64px!important;
 border-bottom:1px solid var(--ao-frame-rule,rgba(255,255,255,.08))!important;
 padding:10px 16px!important;
 background:transparent!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
}
#ao-settings-modular-root .aoSetRow:last-child{border-bottom:0!important}
#ao-settings-modular-root .aoSetRowText b{
 font:500 17px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif)!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
}
#ao-settings-modular-root .aoSetRowText small{
 font:400 14px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif)!important;
 color:var(--ao-frame-muted,#A3ABB4)!important;
}
#ao-find-modular-root .aoExploreSurface>.aoFindHeader>span{
 color:var(--ao-frame-muted,#A3ABB4)!important;
}
#ao-find-modular-root .aoExploreSurface .aoFindSearch input{
 background:var(--ao-frame-raised,#1C232B)!important;
 border-color:var(--ao-frame-rule,rgba(255,255,255,.08))!important;
 color:var(--ao-frame-text,#ECE8DF)!important;
 font:400 16px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif)!important;
}
#ao-learn-modular-root :is(.aoLearnModTop button,.aoLearnFamilyDoor):focus-visible,
#ao-settings-modular-root :is(.aoSetTop button,.aoSetRow):focus-visible,
#ao-find-modular-root .aoExploreSurface :is(.aoFindHeader button,.aoFindSearch input):focus-visible{
 outline:2px solid var(--liturgical,#C9AD78)!important;outline-offset:2px;
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
