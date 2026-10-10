// Shared visual grammar for Formation's existing canonical readers.
// Layout only: no content ownership, translation, publication or route changes.
export const FORMATION_UI_VERSION="formation-unified-layout-v1";

export function formationReaderCss(){
  const roots=":is(#ao-glossary-root,#ao-learn-modular-root,#ao-spiritual-life-root,#ao-sexual-ethics-root,#ao-latin-course-root,#ao-learn-traditional-root,#ao-mass-formation-root)";
  const top=":is(.aoGlossTop,.aoLearnModTop,.aoSLTop,.aoCSETop,.aoL2Top,.aoLearnTradTop,.aoMFTop)";
  const wrap=":is(.aoGlossWrap,.aoLearnModWrap,.aoSLWrap,.aoCSEWrap,.aoL2Wrap,.aoLearnTradWrap,.aoMFWrap)";
  return `
${roots}{--ao-formation-column:760px;--ao-formation-gutter:clamp(13px,3.8vw,24px);background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));font-family:var(--ao-font-body,var(--font-body,Georgia,serif));overscroll-behavior:contain}
${roots} ${top}{position:sticky;top:0;z-index:9;display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:10px;align-items:center;padding:calc(10px + var(--safe-top,0px)) var(--ao-formation-gutter) 10px;background:color-mix(in srgb,var(--ao-bg-canvas,var(--bg,#080c12)) 94%,transparent);border-bottom:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.14)));backdrop-filter:blur(var(--ao-topbar-blur,14px))}
${roots} ${top} button{width:44px;height:44px;min-width:44px;min-height:44px;padding:0;display:grid;place-items:center;border:1px solid var(--ao-rule,var(--border,rgba(255,255,255,.16)));border-radius:var(--ao-pill-radius,999px);background:var(--ao-surface-1,var(--surface-1,#101821));color:inherit}
${roots} ${top}>:nth-child(2){min-width:0;text-align:center}
${roots} ${top} small{display:block;color:var(--liturgical,#c9ad78);font:600 .64rem/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.1em;text-transform:uppercase}
${roots} ${top} strong{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;max-height:2.55em;margin-top:3px;font:600 1rem/1.24 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:.01em;white-space:normal;text-overflow:ellipsis}
${roots} ${wrap}{box-sizing:border-box;width:min(var(--ao-formation-column),100%);max-width:100%;margin-inline:auto;padding:20px var(--ao-formation-gutter) 48px}
${roots} :is(.aoGlossHero,.aoLearnModHero,.aoSLHero,.aoL2Hero,.aoSLLessonHead){padding-top:12px;padding-bottom:20px}
${roots} :is(.aoGlossHero h1,.aoLearnModHero h1,.aoSLHero h1,.aoL2Hero h1,.aoSLLessonHead h1,.aoMFStage h1){font:500 clamp(1.95rem,7vw,3rem)/1.08 var(--ao-font-display,var(--font-display,Georgia,serif));letter-spacing:-.015em}
${roots} :is(.aoGlossHero p,.aoLearnModHero p,.aoSLHero p,.aoL2Meta p,.aoLearnTradIntro,.aoMFIntro,.aoCSEIntro,.aoSLLessonHead p){font-size:max(15px,.9375rem);line-height:1.58;color:var(--ao-text-muted,var(--muted,#a9a5b1))}
${roots} :is(.aoSLBlock p,.aoL2Block p,.aoMFClaim p,.aoLearnTradCard p,.aoCSEAnswer,.aoCSEDebateStep p){font-size:max(15px,.9375rem);line-height:1.66}
${roots} :is(.aoGlossSection,.aoGlossTerm,.aoSLRow,.aoCSERow,.aoMFStageRow,.aoLearnTradCard>summary,.aoL2Stage,.aoL2Lesson,.aoLearnModCardMain){min-height:54px}
${roots} :is(.aoSLSources summary,.aoCSESources summary,.aoL2Sources summary,.aoLearnTradSource summary,.aoL2Panel>summary){min-height:44px;display:flex;align-items:center;line-height:1.4}
${roots} :is(button,input,select,textarea,summary,a):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}
${roots} :is(.aoSLSource a,.aoCSESource a,.aoLearnTradSource a,.aoMFSource a){text-decoration-color:color-mix(in srgb,var(--liturgical,#c9ad78) 50%,transparent);text-underline-offset:3px}
${roots} :is(.aoSLBlock h2,.aoL2Block h2,.aoCSEMaritalDisputations h2,.aoLearnTradPrayer h2,.aoMFStageRow strong){font-family:var(--ao-font-display,var(--font-display,Georgia,serif))}
${roots} :is(.aoGlossCard,.aoGlossTerm,.aoLearnModCard,.aoL2Stage,.aoL2Lesson,.aoL2Panel,.aoL2Passage,.aoL2Exercise,.aoCSEAnswer){border-color:var(--ao-rule,var(--border,rgba(255,255,255,.14)));background:var(--ao-surface-1,var(--surface-1,#101821))}
@media(max-width:430px){
 ${roots} ${top}{gap:8px}
 ${roots} ${wrap}{padding:16px var(--ao-formation-gutter) 40px}
 ${roots} :is(.aoGlossHero h1,.aoLearnModHero h1,.aoSLHero h1,.aoL2Hero h1,.aoSLLessonHead h1,.aoMFStage h1){font-size:clamp(1.9rem,8vw,2.4rem)}
}
`;
}
