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
`;
