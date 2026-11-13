// Explore visual convergence with the owner-supplied AO_Explore_AppDesign.html.
// Presentation-only bridge to the host Ad Orientem theme. Never import the
// donor's four-tab shell, demo registry, synthetic Mass calculations, or fonts.
// All content/coordinates/sources/approved media remain owned by src/find/.
export const EXPLORE_APP_DESIGN_STYLE = String.raw`
#ao-find-modular-root .aoExploreSurface {
  --explore-app-night:var(--ao-bg-canvas,#070b11);
  --explore-app-panel:var(--ao-surface-1,#0d141e);
  --explore-app-paper:var(--ao-text-primary,#ede6d7);
  --explore-app-gold:var(--ao-palette-gold,#c9ad78);
  --explore-app-muted:var(--ao-text-muted,#ada594);
  --explore-app-rule:rgba(220,204,170,.15);
  color:var(--explore-app-paper);
  background:var(--explore-app-night);
  font-family:var(--ao-font-body,"EB Garamond",Georgia,serif);
}
#ao-find-modular-root .aoExploreSurface .aoFindHeader small,
#ao-find-modular-root .aoExploreSurface .aoHeritageCardKicker,
#ao-find-modular-root .aoExploreSurface .aoMapcnEditorialLabel,
#ao-find-modular-root .aoExploreSurface .aoExploreFilterLabel,
#ao-find-modular-root .aoExploreSurface .aoTlmProfileDatum small {
  font:600 10px/1.3 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  letter-spacing:.14em;text-transform:uppercase;color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoFindHeader h1,
#ao-find-modular-root .aoExploreSurface .aoHeritageCardTitle,
#ao-find-modular-root .aoExploreSurface .aoMapcnDiscoverTitle,
#ao-find-modular-root .aoExploreSurface .aoTlmMapRailCopy strong,
#ao-find-modular-root .aoExploreSurface .aoTlmProfileHeading h2 {
  font-family:var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  font-weight:500;letter-spacing:-.015em;
}
#ao-find-modular-root .aoExploreSurface .aoHeritageSynopsis,
#ao-find-modular-root .aoExploreSurface .aoExploreGuideParagraph p,
#ao-find-modular-root .aoExploreSurface .aoTlmProfileCaution,
#ao-find-modular-root .aoExploreSurface .aoTlmMapRailCopy small {
  font-family:var(--ao-font-body,"EB Garamond",Georgia,serif);
  line-height:1.5;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageTools .aoFindSearch input,
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] .aoTlmToolbar .aoFindSearch input {
  border-radius:15px!important;
  border-color:var(--explore-app-rule)!important;
  background:rgba(7,11,17,.8)!important;
  box-shadow:0 6px 24px rgba(0,0,0,.23)!important;
  color:var(--explore-app-paper)!important;
}
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs,
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] .aoAtlasMassTabs {
  border:1px solid var(--explore-app-rule);
  background:rgba(7,11,17,.92);border-radius:14px;
  box-shadow:0 8px 26px rgba(0,0,0,.22);
}
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs button,
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs .aoHeritageMassShortcut,
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] .aoAtlasMassTabs button {
  font:500 15px/1.1 var(--ao-font-body,"EB Garamond",Georgia,serif);
  border-radius:10px;color:var(--explore-app-muted);
}
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs button.active,
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs button[aria-pressed=true],
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] .aoAtlasMassTabs button.active {
  background:rgba(201,173,120,.16);
  color:var(--explore-app-paper);
  border-color:rgba(201,173,120,.35);
}
#ao-find-modular-root .aoHeritageSurface .aoHeritagePreview,
#ao-find-modular-root .aoExploreSurface .aoExploreQuickPreview,
#ao-find-modular-root .aoExploreSurface .aoTlmMapRail,
#ao-find-modular-root .aoExploreSurface .aoMapcnDiscoverRail {
  color:var(--explore-app-paper);
  background:var(--explore-app-panel);
  border-color:var(--explore-app-rule);
  border-radius:18px;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritagePreviewActions button:first-child,
#ao-find-modular-root .aoExploreSurface .aoExplorePreviewActions button:first-child,
#ao-find-modular-root .aoExploreSurface .aoTlmProfilePrimaryAction {
  border-radius:12px;
  background:linear-gradient(180deg,#efdcaf,#c9ad78);
  border-color:#c9ad78;
  color:#21190d;
  font-family:var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  font-weight:600;
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet,
#ao-find-modular-root .aoExploreSurface .aoTlmChurchProfile {
  background:var(--explore-app-night);
  color:var(--explore-app-paper);
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet .aoExploreStoryChapter h3,
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet .aoExploreGuideSection h3,
#ao-find-modular-root .aoExploreSurface .aoTlmProfilePanel h3 {
  font-family:var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  font-weight:500;
  color:var(--explore-app-paper);
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet .aoExploreGuideSection,
#ao-find-modular-root .aoExploreSurface .aoTlmProfilePanel {
  border-color:var(--explore-app-rule);
}
#ao-find-modular-root .aoExploreSurface :is(button,a,input,summary):focus-visible {
  outline:2px solid var(--explore-app-gold);
  outline-offset:3px;
}
@media(max-width:360px) {
  #ao-find-modular-root .aoExploreSurface :is(.aoHeritagePreviewActions,.aoExplorePreviewActions,.aoTlmProfileActions) {
    display:flex;flex-wrap:wrap;gap:8px;
  }
  #ao-find-modular-root .aoExploreSurface :is(.aoHeritagePreviewActions,.aoExplorePreviewActions,.aoTlmProfileActions) > :is(button,a) {
    flex:1 1 120px;min-width:0;max-width:100%;white-space:normal;
  }
  #ao-find-modular-root .aoExploreSurface .aoHeritageCardTitle {overflow-wrap:anywhere}
}

/* APP-DESIGN QA2: cards and folios; canonical content and image fit preserved.
   The donor's large photo-first card becomes a source-credited, full-composition
   illustration, not a cropped background or an uncredited decorative image. */
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview:has(.aoHeritagePlaceThumb img) {
  display:flex!important;
  flex-direction:column!important;
  align-items:stretch!important;
  gap:8px;
  min-width:0;
  border-radius:20px;
  padding:12px 14px calc(15px + env(safe-area-inset-bottom))!important;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageSheetHandle {
  order:-3;flex:none;align-self:center;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb:not(.aoSacredPlaceSymbolFallback) {
  order:-2;
  grid-column:auto;grid-row:auto;
  width:100%;max-width:100%;
  margin:0!important;
  border-radius:13px;
  border:1px solid var(--explore-app-rule);
  overflow:hidden;
  background:#07111b;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb img {
  display:block;width:100%;
  height:clamp(142px,23dvh,218px)!important;
  object-fit:contain!important;
  object-position:center;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb figcaption {
  position:static!important;
  display:block!important;
  padding:5px 8px 7px!important;
  background:#080e15!important;
  color:var(--explore-app-muted);
  font:12px/1.25 var(--ao-font-body,"EB Garamond",Georgia,serif);
  text-align:left;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritageCardHeading {
  display:flex;align-items:center;justify-content:space-between;gap:8px;
  min-width:0;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardKicker,
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardLocation {
  font:600 10px/1.25 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  letter-spacing:.09em;color:var(--explore-app-gold);
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageCardTitle {
  margin:2px 0 0;
  font:500 clamp(25px,6.5vw,35px)/1.08 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  text-wrap:balance;overflow-wrap:anywhere;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageSynopsis {
  margin:1px 0 4px;
  font:400 16px/1.42 var(--ao-font-body,"EB Garamond",Georgia,serif);
  color:var(--explore-app-paper);
}
#ao-find-modular-root .aoHeritageSurface .aoHeritagePreviewActions {
  display:flex;flex-wrap:wrap;gap:8px;margin-top:4px;min-width:0;
}
#ao-find-modular-root .aoHeritageSurface .aoHeritagePreviewActions > :is(button,a) {
  flex:1 1 115px;min-width:0;min-height:44px;
  white-space:normal;text-align:center;
}
/* TLM discovery: a photographed church is not a timetable occurrence. The
   canonical card deliberately offers source-backed schedule status instead
   of a computed "next Mass" that might omit feast-day exceptions. */
#ao-find-modular-root .aoExploreSurface .aoFindList .aoTlmVenueCard {
  grid-template-columns:clamp(104px,29%,148px) minmax(0,1fr);
  border-radius:20px;
  border-color:var(--explore-app-rule);
  background:var(--explore-app-panel);
  box-shadow:0 10px 30px rgba(0,0,0,.2);
  min-width:0;overflow:hidden;
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueVisual {
  background:radial-gradient(circle at 20% 10%,rgba(201,173,120,.14),transparent 65%),#101923;
  min-width:0;
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueVisual > img {
  object-fit:contain!important;
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueContent {
  padding:14px 16px 13px;gap:7px;min-width:0;
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueInstitution {
  font:600 10px/1.35 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  letter-spacing:.09em;color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueTitle {
  font:500 clamp(22px,3vw,28px)/1.07 var(--ao-font-display,"Cormorant Garamond",Georgia,serif)!important;
  letter-spacing:-.012em;
  color:var(--explore-app-paper);
  overflow-wrap:anywhere;
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueLocality,
#ao-find-modular-root .aoExploreSurface .aoTlmVenueSchedule {
  font:400 15px/1.3 var(--ao-font-body,"EB Garamond",Georgia,serif);
  color:var(--explore-app-muted);
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueSchedule {
  padding:7px 0 0;border-top:1px solid var(--explore-app-rule);
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueSourceEdition {
  font:600 10px/1.3 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  letter-spacing:.05em;color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoTlmVenueFoot {
  font:600 14px/1.2 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  color:var(--explore-app-gold);
}
/* The map's contextual results share the same typographic hierarchy. */
#ao-find-modular-root .aoExploreSurface .aoTlmMapRailItem {
  border-color:var(--explore-app-rule);
  background:rgba(255,255,255,.025);
  border-radius:14px;
}
#ao-find-modular-root .aoExploreSurface .aoTlmMapRailCopy strong {
  font:500 21px/1.08 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  text-wrap:balance;
}
#ao-find-modular-root .aoExploreSurface .aoMapcnDiscoverItem strong {
  font:500 21px/1.09 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
}
#ao-find-modular-root .aoExploreSurface .aoMapcnDiscoverItem img {
  object-fit:contain!important;
}
/* Liber Locorum: image-led reading, source/rights immediately below the
   uncropped image, editorial heading, ruled facts, and indexable chapters. */
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet > .aoExplorePlaceMedia {
  background:#09131d;
  border-radius:13px!important;
  overflow:hidden;
  margin:0 12px 10px!important;
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet > .aoExplorePlaceMedia img {
  display:block;width:100%;
  height:clamp(200px,37dvh,370px)!important;
  object-fit:contain!important;
  object-position:center;
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet > .aoExplorePlaceMedia figcaption {
  position:static!important;
  display:block!important;
  padding:8px 12px!important;
  text-align:center;
  background:#080e15;
  color:var(--explore-app-muted);
  font:13px/1.4 var(--ao-font-body,"EB Garamond",Georgia,serif);
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet > header {
  text-align:center;padding:6px 18px 17px!important;
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet > header h2 {
  font:500 clamp(31px,8vw,44px)/1.02 var(--ao-font-display,"Cormorant Garamond",Georgia,serif)!important;
  margin:8px 0 6px!important;
  text-wrap:balance;
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceSheet > header p {
  font:italic 18px/1.25 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceChapters {
  display:flex;gap:18px;align-items:center;
  overflow-x:auto;max-width:100%;
  border-bottom:1px solid var(--explore-app-rule);
  scrollbar-width:thin;
  padding:2px 16px 0;
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceChapters button {
  flex:none;min-height:44px;padding:7px 0;
  border:0;border-bottom:2px solid transparent;
  font:600 10px/1.2 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  text-transform:uppercase;letter-spacing:.13em;
  color:var(--explore-app-muted);
}
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceChapters button:focus-visible {
  border-bottom-color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoAtlasPlaceGlanceRow,
#ao-find-modular-root .aoExploreSurface .aoExplorePlaceRow {
  border-bottom:1px solid var(--explore-app-rule);
  padding-block:10px;
  min-width:0;
}
#ao-find-modular-root .aoExploreSurface .aoExploreStoryChapter {
  position:relative;margin:20px 15px 0;padding:18px 4px 14px;
  border-top:1px solid var(--explore-app-rule);
}
#ao-find-modular-root .aoExploreSurface .aoExploreStoryChapter + .aoExploreStoryChapter:before {
  content:"✣";position:absolute;top:-12px;left:calc(50% - 16px);
  width:32px;text-align:center;background:var(--explore-app-night);
  color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoExploreStoryChapter h3 {
  font:500 28px/1.1 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  text-align:center;text-wrap:balance;
  margin:0 0 14px;
}
#ao-find-modular-root .aoExploreSurface .aoExploreStoryChapter > p {
  font:400 18px/1.55 var(--ao-font-body,"EB Garamond",Georgia,serif);
  margin:0 0 9px;
}
#ao-find-modular-root .aoExploreSurface .aoExploreStoryEvidence a {
  min-height:44px;display:inline-flex;align-items:center;
  font:600 10px/1.25 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  letter-spacing:.06em;color:var(--explore-app-gold);
}
/* Church profile: calendar-style weekly row treatment but NO inferred next
   event. Existing ministry, site and celebration distinctions remain visible. */
#ao-find-modular-root .aoExploreSurface .aoTlmChurchProfile .aoTlmProfileSpotlight {
  background:linear-gradient(180deg,rgba(201,173,120,.035),transparent);
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileHeading {
  text-align:center;padding:16px 18px 20px;
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileHeading h2 {
  font:500 clamp(30px,7.5vw,44px)/1.02 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  text-wrap:balance;
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileLocation {
  font:italic 18px/1.2 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  color:var(--explore-app-gold);
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileWeeklySource {
  margin:14px 0;padding:16px;
  background:linear-gradient(180deg,rgba(201,173,120,.065),rgba(201,173,120,.01));
  border:1px solid var(--explore-app-rule);
  border-radius:18px;
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileWeeklySource h4 {
  font:500 23px/1.15 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  color:var(--explore-app-paper);
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileWeeklySource .aoTlmProfileSchedule {
  display:flex;gap:12px;align-items:flex-start;
  padding:11px 2px;border-bottom:1px solid var(--explore-app-rule);
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileWeeklySource .aoTlmProfileSchedule:last-of-type {
  border-bottom:0;
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileWeeklySource .aoTlmProfileSchedule small {
  font:600 10px/1.4 var(--ao-font-ritual,"Cinzel",Georgia,serif);
  color:var(--explore-app-muted);
}
#ao-find-modular-root .aoExploreSurface .aoTlmProfileWeeklySource .aoTlmProfileSchedule strong {
  font:500 20px/1.18 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
}
@media(max-width:420px) {
  #ao-find-modular-root .aoExploreSurface .aoFindList .aoTlmVenueCard {
    grid-template-columns:92px minmax(0,1fr);min-width:0;
  }
  #ao-find-modular-root .aoExploreSurface .aoTlmVenueContent {
    padding:11px 10px;gap:5px;
  }
  #ao-find-modular-root .aoExploreSurface .aoTlmVenueTitle {
    font-size:clamp(21px,6vw,25px)!important;
  }
  #ao-find-modular-root .aoExploreSurface .aoTlmVenueInstitution {font-size:9px}
}
@media(max-width:360px) {
  #ao-find-modular-root .aoExploreSurface .aoFindList .aoTlmVenueCard {
    grid-template-columns:82px minmax(0,1fr);
  }
  #ao-find-modular-root .aoExploreSurface .aoTlmVenueVisual {min-height:154px}
  #ao-find-modular-root .aoExploreSurface .aoTlmVenueTitle {font-size:21px!important}
  #ao-find-modular-root .aoExploreSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb img {
    height:156px!important;
  }
}



/* QA3: Exactly two atlas collections in the global segmented selector.
   Discover and source-backed filters remain secondary within Sacred Atlas. */
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs,
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] > .aoAtlasMassTabs {
  box-sizing:border-box;
  display:grid!important;
  grid-template-columns:repeat(2,minmax(0,1fr));
  width:min(292px,calc(100% - 24px));
  max-width:calc(100% - 24px);
  gap:3px;
  padding:4px;
  border-radius:15px;
}
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs > button,
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] > .aoAtlasMassTabs > button {
  box-sizing:border-box;
  width:100%;
  min-width:0;
  min-height:44px;
  padding:7px 8px;
  border-radius:11px;
  font:600 clamp(12px,3.6vw,15px)/1.2 var(--ao-font-display,"Cormorant Garamond",Georgia,serif);
  white-space:normal;
  text-align:center;
  letter-spacing:.015em;
}
#ao-find-modular-root .aoHeritageSurface .aoAtlasPrimaryTabs > button.active,
#ao-find-modular-root .aoExploreSurface[data-atlas-mass=true] > .aoAtlasMassTabs > button.active {
  background:linear-gradient(180deg,rgba(219,187,132,.21),rgba(193,157,100,.1));
  color:var(--explore-app-paper);
  border-color:rgba(201,173,120,.38);
}
#ao-find-modular-root .aoHeritageSurface .aoHeritageSecondary [data-atlas-entry-tab] {
  font:500 15px/1.25 var(--ao-font-body,"EB Garamond",Georgia,serif);
  min-height:44px;
}



/* QA4 screenshot acceptance: a flex preview must not shrink its photograph,
   title or source credit to zero when the phone sheet has a max-height.
   Name first makes the relevant identity immediately readable at 320px;
   the approved photo remains full-frame and credited immediately beneath. */
@media(max-width:799px) {
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview:has(.aoHeritagePlaceThumb img) {
    overflow-y:auto!important;
    overflow-x:hidden!important;
    overflow-anchor:none;
    scroll-behavior:auto;
    overscroll-behavior:contain;
    align-content:start;
  }
  /* Preview children are inside .aoHeritagePreviewScroll in QA6b.
     Never apply flex:0 0 auto to that scroller: it hides the action dock. */
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageSheetHandle {
    order:-4!important;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageCardHeading {
    order:-3!important;
    padding-right:0;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritageCardTitle {
    order:-2!important;
    display:block;
    -webkit-line-clamp:unset;
    overflow-wrap:anywhere;
    white-space:normal;
    line-height:1.08;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb:not(.aoSacredPlaceSymbolFallback) {
    order:-1!important;
    flex:0 0 auto!important;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb img {
    flex:none;
    object-fit:contain!important;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer .aoHeritagePreview .aoHeritagePlaceThumb figcaption {
    max-height:none!important;
    overflow-wrap:anywhere;
  }
}



/* QA6: keep the primary action in reach in the compact map preview.
   The entire preview remains scrollable; the original credited painting or
   photograph is never replaced, zoomed or cropped. Secondary actions remain
   accessible in a horizontally scrollable row rather than taking over 320px. */
@media(max-width:799px) {
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview:has(.aoHeritagePlaceThumb img) {
    scroll-padding-bottom:72px;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview .aoHeritagePreviewActions {
    position:sticky!important;
    bottom:0!important;
    z-index:6;
    box-sizing:border-box;
    order:20;
    display:flex!important;
    flex-direction:row!important;
    flex-wrap:nowrap!important;
    flex:0 0 auto!important;
    align-items:stretch;
    gap:8px;
    width:100%;
    min-width:0;
    max-height:72px;
    overflow-x:auto!important;
    overflow-y:hidden!important;
    margin-top:0!important;
    padding:7px 2px 5px;
    background:linear-gradient(180deg,rgba(8,13,20,.96),#080d14);
    border-top:1px solid var(--explore-app-rule);
    box-shadow:0 -8px 18px rgba(0,0,0,.46);
    scrollbar-width:thin;
    overscroll-behavior-x:contain;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview .aoHeritagePreviewActions > :is(button,a) {
    min-height:44px;
    max-height:54px;
    min-width:0;
    width:auto;
    padding:9px 12px;
    white-space:nowrap;
    flex:0 0 auto;
    justify-content:center;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview .aoHeritagePreviewActions > [data-explore-expand-place] {
    flex:1 0 min(56%,166px);
    min-width:132px;
    font-weight:700;
  }
}



/* QA6b: the dock is a SIBLING of a separate content scroller, never an overlay
   across the approved photograph or credit. This is the phone map-preview
   composition, not a second modal or a new Atlas runtime. */
@media(max-width:799px) {
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview:has(> .aoHeritagePreviewScroll) {
    display:flex!important;
    flex-direction:column!important;
    gap:0!important;
    /* A definite flex height reserves 57px for the sibling action dock.
       max-height alone clips the flex content without shrinking its child. */
    height:min(54dvh,440px)!important;
    max-height:min(54dvh,440px)!important;
    box-sizing:border-box!important;
    min-height:0!important;
    overflow:hidden!important;
    padding:8px 12px calc(8px + env(safe-area-inset-bottom))!important;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview > .aoHeritagePreviewScroll {
    display:flex;
    flex-direction:column;
    align-items:stretch;
    gap:7px;
    flex:1 1 auto!important;
    min-height:0;
    min-width:0;
    overflow-y:auto;
    overflow-x:hidden;
    overscroll-behavior:contain;
    padding:0 2px 4px;
    scrollbar-width:thin;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreviewScroll > * {
    flex:0 0 auto!important;
    min-width:0;
  }
  #ao-find-modular-root .aoHeritageSurface .aoHeritageCardLayer
  .aoHeritagePreview > .aoHeritagePreviewActions {
    position:relative!important;
    bottom:auto!important;
    order:20;
    flex:0 0 auto!important;
    margin-top:0!important;
    border-top:1px solid var(--explore-app-rule);
    box-shadow:0 -5px 16px rgba(0,0,0,.33);
  }
}

`;
