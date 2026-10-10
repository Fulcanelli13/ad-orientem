// Shared visual grammar for Formation's existing canonical readers.
// Layout only: no content ownership, translation, publication or route changes.
export const FORMATION_UI_VERSION="formation-unified-navigation-v2";

export function formationReaderCss(){
  const roots=":is(#ao-glossary-root,#ao-learn-modular-root,#ao-spiritual-life-root,#ao-sexual-ethics-root,#ao-latin-course-root,#ao-learn-traditional-root,#ao-mass-formation-root,#ao-formation-recovery-review)";
  const top=":is(.aoGlossTop,.aoLearnModTop,.aoSLTop,.aoCSETop,.aoL2Top,.aoLearnTradTop,.aoMFTop,.rrTop)";
  const wrap=":is(.aoGlossWrap,.aoLearnModWrap,.aoSLWrap,.aoCSEWrap,.aoL2Wrap,.aoLearnTradWrap,.aoMFWrap)";
  return `
${roots}{--ao-formation-column:760px;--ao-formation-gutter:var(--ao-page-gutter,14px);background:var(--ao-bg-canvas,var(--bg,#080c12));color:var(--ao-text-primary,var(--text,#e9e4d9));font-family:var(--ao-font-body,var(--font-body,Georgia,serif));overscroll-behavior:contain}
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
${roots} :is(.aoGlossSection,.aoGlossTerm,.aoSLRow,.aoCSERow,.aoMFStageRow,.aoLearnTradCard>summary,.aoL2Stage,.aoL2Lesson){min-height:54px}
${roots} :is(.aoSLSources summary,.aoCSESources summary,.aoL2Sources summary,.aoLearnTradSource summary,.aoL2Panel>summary){min-height:44px;display:flex;align-items:center;line-height:1.4}
${roots} :is(button,input,select,textarea,summary,a):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:3px}
${roots} :is(.aoSLSource a,.aoCSESource a,.aoLearnTradSource a,.aoMFSource a){text-decoration-color:color-mix(in srgb,var(--liturgical,#c9ad78) 50%,transparent);text-underline-offset:3px}
${roots} :is(.aoSLBlock h2,.aoL2Block h2,.aoCSEMaritalDisputations h2,.aoLearnTradPrayer h2,.aoMFStageRow strong){font-family:var(--ao-font-display,var(--font-display,Georgia,serif))}
${roots} :is(.aoGlossCard,.aoGlossTerm,.aoLearnModCard,.aoL2Stage,.aoL2Lesson,.aoL2Panel,.aoL2Passage,.aoL2Exercise,.aoCSEAnswer){border-color:var(--ao-rule,var(--border,rgba(255,255,255,.14)));background:var(--ao-surface-1,var(--surface-1,#101821))}

${roots} .aoFNav{position:sticky;top:var(--ao-fnav-top,65px);z-index:8;background:color-mix(in srgb,var(--ao-bg-canvas,#080c12) 94%,transparent);backdrop-filter:blur(12px);border-bottom:1px solid var(--ao-rule,rgba(255,255,255,.12));font-family:var(--ao-font-ui,system-ui,sans-serif);animation:aoFNavAppear .22s ease-out}
${roots} .aoFNavRail{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;gap:8px;max-width:760px;margin:auto;padding:7px var(--ao-formation-gutter,14px)}
${roots} .aoFNav button{color:inherit;cursor:pointer}
${roots} .aoFNavArrow{display:grid;place-items:center;width:44px;height:44px;border:1px solid var(--ao-rule,rgba(255,255,255,.16));border-radius:50%;background:var(--ao-surface-1,#101821);font:500 1.3rem/1 var(--ao-font-ui,system-ui,sans-serif)}
${roots} .aoFNavArrow:disabled{opacity:.3;cursor:default}
${roots} .aoFNavMain{display:flex;align-items:center;min-width:0;gap:9px;min-height:44px;padding:4px 11px;border:1px solid var(--ao-rule,rgba(255,255,255,.16));border-radius:13px;background:var(--ao-surface-1,#101821);text-align:left}
${roots} .aoFNavIcon{flex:0 0 20px;font:1.1rem/1 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#c9ad78)}
${roots} .aoFNavText{display:flex;flex-direction:column;gap:1px;min-width:0;flex:1}
${roots} .aoFNavCounter{font:650 .63rem/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.065em;text-transform:uppercase;color:var(--liturgical,#c9ad78)}
${roots} .aoFNavTitle{display:block;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:500 .81rem/1.28 var(--ao-font-ui,system-ui,sans-serif)}
${roots} .aoFNavChevron{color:var(--liturgical,#c9ad78);font-size:.95rem;transition:transform .18s ease}
${roots} .aoFNavMain[aria-expanded=true] .aoFNavChevron{transform:rotate(180deg)}
${roots} .aoFNavProgress{height:2px;background:var(--ao-rule,rgba(255,255,255,.14));overflow:hidden}
${roots} .aoFNavProgress>span{display:block;transform:scaleX(var(--ao-fnav-progress,0));transform-origin:left center;height:100%;width:100%;background:var(--liturgical,#c9ad78);transition:transform .15s linear}
${roots} .aoFNavMenu{max-height:min(45vh,320px);overflow-y:auto;overscroll-behavior:contain;padding:5px var(--ao-formation-gutter,14px) 13px;border-top:1px solid var(--ao-rule,rgba(255,255,255,.1))}
${roots} .aoFNavMenu[hidden]{display:none!important}
${roots} .aoFNavIndex{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;max-width:760px;margin:auto}
${roots} .aoFNavIndex button{display:flex;align-items:center;gap:8px;min-width:0;min-height:44px;padding:8px 10px;text-align:left;border:1px solid var(--ao-rule,rgba(255,255,255,.13));border-radius:10px;background:var(--ao-surface-1,#101821);font:500 .75rem/1.35 var(--ao-font-ui,system-ui,sans-serif)}
${roots} .aoFNavIndex button[aria-current=location]{border-color:var(--liturgical,#c9ad78);background:color-mix(in srgb,var(--liturgical,#c9ad78) 9%,var(--ao-surface-1,#101821))}
${roots} .aoFNavIndex button>span:first-child{flex:0 0 auto;color:var(--liturgical,#c9ad78);font-size:.65rem;font-variant-numeric:tabular-nums}
${roots} .aoFNavIndex button>span:last-child{min-width:0;overflow-wrap:break-word}
${roots} .aoFNav :is(button):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}
${roots} .aoFNavTarget{scroll-margin-top:150px}
${roots} main{animation:aoFReaderAppear .19s ease-out both}
@keyframes aoFNavAppear{from{opacity:.5;transform:translateY(-5px)}to{opacity:1;transform:translateY(0)}}
@keyframes aoFReaderAppear{from{opacity:.85}to{opacity:1}}
@media(prefers-reduced-motion:reduce){${roots} .aoFNav,${roots} main{animation:none!important}${roots} .aoFNav *{transition:none!important}}
@media(max-width:430px){${roots} .aoFNavRail{gap:7px;padding:6px 12px}${roots} .aoFNavIndex{gap:6px}${roots} .aoFNavIndex button{font-size:.72rem;padding:8px}}
@media(max-width:430px){
 ${roots} ${top}{gap:8px}
 ${roots} ${wrap}{padding:16px var(--ao-formation-gutter) 40px}
 ${roots} :is(.aoGlossHero h1,.aoLearnModHero h1,.aoSLHero h1,.aoL2Hero h1,.aoSLLessonHead h1,.aoMFStage h1){font-size:clamp(1.9rem,8vw,2.4rem)}
}
`;
}
