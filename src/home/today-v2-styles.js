/* Home Today v2 styles as source-owned string: works in browser and Node ESM tests. */
export const TODAY_V2_CSS = String.raw`/* Today v2 / uploaded 10 Oct sacred frontispiece reference. Canonical Home actions remain unchanged. */
.homeScreen.aoTodayV2{background:var(--bg,#080c12);color:var(--text,#eee9df);padding-bottom:76px}
.aoTodayV2Header{position:relative;background:var(--bg,#080c12)}
.aoTodayV2Tabs{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--border,rgba(238,238,238,.12));background:var(--bg,#080c12);padding:0 8px}
.aoTodayV2Tabs button,.aoTodayV2Tabs span{display:grid;place-items:center;min-height:47px;border:0;border-bottom:2px solid transparent;background:none;color:var(--muted,#9da3a2);font:700 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em;text-transform:uppercase;text-align:center}
.aoTodayV2Tabs span{border-bottom-color:var(--liturgical,#929ba8);color:var(--text,#eee9df)}
.aoTodayV2Tabs button:focus-visible{outline:2px solid var(--liturgical,#929ba8);outline-offset:-2px}
.aoTodayV2 .dateRail{display:none!important}
.aoTodayV2 .dateNavigator{margin:0;padding:6px 13px;background:var(--bg,#080c12);border-bottom:1px solid var(--border,rgba(238,238,238,.08))}
.aoTodayV2 .aoHomeCalendarAccess{display:none}
.aoTodayV2Frontispiece{position:relative;padding:0!important;border:0!important;background:var(--surface-1,#0c131b);overflow:hidden}
.aoTodayV2Art{position:relative;height:clamp(235px,67vw,355px);overflow:hidden;background:var(--surface-2,#131920)}
.aoTodayV2ArtOriginal,.aoTodayV2ArtOriginal img,.aoTodayV2Art img{width:100%;height:100%;object-fit:cover;object-position:center 33%;display:block}
.aoTodayV2Art .aoPhase1HomeArt,.aoTodayV2Art .aoSaintArtCard{height:100%}
.aoTodayV2Art:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(to bottom,rgba(8,12,18,.05),rgba(8,12,18,.16) 42%,rgba(8,12,18,.94))}
.aoTodayV2NoArt{height:100%;background:radial-gradient(ellipse at 50% 35%,var(--liturgical-soft,rgba(143,154,165,.1)),transparent 65%),var(--surface-1,#111924)}
.aoTodayV2ArtOverlay{position:absolute;z-index:2;inset:18px 16px 18px;display:flex;flex-direction:column;justify-content:space-between;pointer-events:none}
.aoTodayV2ArtOverlay .eyebrow{align-self:flex-start;color:var(--text,#eee9df);font-size:10px;letter-spacing:.12em;text-shadow:0 2px 8px #000}
.aoTodayV2ArtOverlay h1{font:400 clamp(29px,7vw,39px)/1.08 var(--ao-font-display,Georgia,serif);color:var(--text,#eee9df);text-shadow:0 3px 11px #000;text-align:center;margin:0 7px;overflow-wrap:anywhere}
.aoTodayV2HeroActions{padding:13px 18px 16px;background:var(--surface-1,#0b1119)}
.aoTodayV2HeroActions .metaLine{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:7px;font-size:12px;color:var(--muted,#bcbec0)}
.aoTodayV2 .resumeCard{display:block;width:calc(100% - 32px);margin:12px 16px;background:var(--surface-2,#111a23);border:1px solid var(--liturgical-border,rgba(235,235,235,.2))}
.aoTodayV2Mass{padding:10px 16px 18px!important;border-bottom:1px solid var(--border,rgba(238,238,238,.12))}
.aoTodayV2Mass .sectionLabel{font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#b2afa9);margin:0 0 8px}
.aoTodayV2Mass .phaseActions{display:grid;grid-template-columns:1fr 2fr 1fr;gap:8px}
.aoTodayV2Mass .phaseButton{min-width:0;min-height:54px;border-radius:8px;padding:9px 5px!important}
.aoTodayV2Mass .phaseButton.primary{background:var(--liturgical,#929ba8);color:var(--bg,#080c12);border-color:var(--liturgical,#929ba8)}
.aoTodayV2Mass .phaseButton.secondary{background:transparent;color:var(--text,#eee9df);border-color:var(--border,rgba(238,238,238,.2))}
.aoTodayV2Mass .phaseButton b{font-size:clamp(10px,2.7vw,13px)}
.aoTodayV2 .gospelCard,.aoTodayV2 .aoHomeScriptureLink,.aoTodayV2 .findCard{background:transparent;border:0;border-bottom:1px solid var(--border,rgba(238,238,238,.12));border-radius:0;box-shadow:none;margin:0 16px;padding:19px 2px}
.aoTodayV2 .gospelCard .cardKicker{letter-spacing:.1em;color:var(--muted,#b2afa9)}
.aoTodayV2 .homeSection{margin-top:0}
@media(min-width:700px){.aoTodayV2Art{height:410px}.aoTodayV2Frontispiece{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr)}.aoTodayV2Art{height:410px}.aoTodayV2HeroActions{display:grid;align-content:center;padding:20px 30px}.aoTodayV2ArtOverlay h1{font-size:42px}}
@media(max-width:370px){.aoTodayV2Art{height:225px}.aoTodayV2ArtOverlay h1{font-size:27px}.aoTodayV2Mass .phaseButton b{font-size:10px}}
@media(prefers-reduced-motion:reduce){.aoTodayV2 *{scroll-behavior:auto}}
`;
