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
.aoTodayV2ArtSource{width:100%;height:100%;overflow:hidden}.aoTodayV2ArtSource>img,.aoTodayV2ArtSource>picture,.aoTodayV2ArtSource>figure{width:100%;height:100%;object-fit:cover;display:block}
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
.aoTodayV2Frontispiece.aoTodayV2ArtMissing{display:block!important}
@media(max-width:699px){
.aoTodayV2ArtMissing .aoTodayV2Art{height:clamp(138px,36vw,175px)!important;background:radial-gradient(ellipse at 50% 40%,var(--liturgical-soft,rgba(143,154,165,.10)),transparent 68%),var(--surface-1,#101720)}
.aoTodayV2ArtMissing .aoTodayV2ArtOverlay{inset:12px 16px 15px}
.aoTodayV2ArtMissing .aoTodayV2ArtOverlay h1{max-width:660px;margin-inline:auto}
.aoTodayV2ArtMissing .aoTodayV2HeroActions{max-width:700px;margin-inline:auto}
}
@media(min-width:700px){.aoTodayV2Art{height:410px}.aoTodayV2Frontispiece{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(280px,.9fr)}.aoTodayV2Art{height:410px}.aoTodayV2HeroActions{display:grid;align-content:center;padding:20px 30px}.aoTodayV2ArtOverlay h1{font-size:42px}}
@media(max-width:370px){.aoTodayV2Art{height:225px}.aoTodayV2ArtOverlay h1{font-size:27px}.aoTodayV2Mass .phaseButton b{font-size:10px}}

.aoTodayV2Tabs button[aria-current="page"]{border-bottom-color:var(--liturgical,#939fa8);color:var(--text,#eee9df)}
.aoTodayExploreFoot{padding:0 18px 35px}.aoTodayExploreFoot button{min-height:58px;width:100%;text-align:left;border:0;border-top:1px solid var(--border,rgba(238,238,238,.12));padding:12px 2px;background:transparent;color:var(--text,#eee9df)}.aoTodayExploreFoot strong{display:block;font:400 17px var(--ao-font-display,Georgia,serif)}.aoTodayExploreFoot small{display:block;margin-top:4px;color:var(--muted,#a6abb5);font:400 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2CalendarInline[hidden]{display:none!important}
.aoTodayV2CalendarInline{width:100%;min-height:100px;padding:0 10px 28px}
.aoTodayV2[data-ao-home-calendar-view="day"]>.dateNavigator,.aoTodayV2[data-ao-home-calendar-view="day"]>.aoTodayV2Frontispiece,.aoTodayV2[data-ao-home-calendar-view="day"]>.aoTodayV2Context,.aoTodayV2[data-ao-home-calendar-view="day"]>.aoTodayV2Below,.aoTodayV2[data-ao-home-calendar-view="picker"]>.dateNavigator,.aoTodayV2[data-ao-home-calendar-view="picker"]>.aoTodayV2Frontispiece,.aoTodayV2[data-ao-home-calendar-view="picker"]>.aoTodayV2Context,.aoTodayV2[data-ao-home-calendar-view="picker"]>.aoTodayV2Below,.aoTodayV2[data-ao-home-calendar-view="year"]>.dateNavigator,.aoTodayV2[data-ao-home-calendar-view="year"]>.aoTodayV2Frontispiece,.aoTodayV2[data-ao-home-calendar-view="year"]>.aoTodayV2Context,.aoTodayV2[data-ao-home-calendar-view="year"]>.aoTodayV2Below{display:none!important}
.aoTodayV2[data-ao-home-calendar-view] .aoTodayV2CalendarInline{display:block}
/* Avoid sticky host-tab overlap with the larger Liturgical Clock identity header. */
.aoTodayV2[data-ao-home-calendar-view="year"] .aoTodayV2Tabs{position:relative;top:auto}
/* Today already owns the Day / Month / Year navigation: no nested Calendar toolbar. */
.aoTodayV2CalendarInline #ao-calendar-modular-root[data-ao-calendar-view="year"] .aoCalModTop{display:none!important}
.aoTodayV2[data-ao-home-calendar-view] > :not(.aoTodayV2Header){display:none!important}
.aoTodayV2[data-ao-home-calendar-view] .aoTodayV2Header > :not(.brandRow):not(.aoTodayV2Tabs):not(.aoTodayV2CalendarInline){display:none!important}

@media(prefers-reduced-motion:reduce){.aoTodayV2 *{scroll-behavior:auto}}

/* Compact rhythm from the supplied Today v2 study: never reproduce legacy cards. */
.aoTodayV2 .aoTodayV2HeroActions{min-height:48px}
.aoTodayV2 .aoTodayV2Mass{padding:12px 18px 18px!important}
.aoTodayV2 .aoTodayV2PrimaryMass{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:100%;min-height:54px;border-radius:10px;padding:10px 12px!important;background:var(--liturgical,#c6b692)!important;color:var(--liturgical-ink,var(--bg,#080c12))!important;text-align:center;border:1px solid var(--liturgical,#c6b692)!important}
.aoTodayV2 .aoTodayV2PrimaryMass b{font:750 14px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2 .aoTodayV2PrimaryMass b,.aoTodayV2 .aoTodayV2PrimaryMass span{display:block!important;opacity:1!important;visibility:visible!important;color:var(--liturgical-ink,var(--bg,#080c12))!important;text-shadow:none!important;filter:none!important}
.aoTodayV2 .aoTodayV2PrimaryMass span{font:600 11px/1.25 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2 .aoTodayV2SecondaryMass{display:flex;justify-content:center;gap:28px;margin-top:8px}
.aoTodayV2 .aoTodayV2SecondaryMass button{min-height:40px;padding:7px 4px;color:var(--text-muted,var(--muted,#c4b7a0));border:0;background:transparent;font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2Context{display:grid;grid-template-columns:1fr 1fr;border-block:1px solid var(--border,rgba(230,230,230,.11));padding:13px 16px;background:var(--surface-1,#101720);gap:12px}
.aoTodayV2Context button{text-align:left;display:flex;flex-direction:column;align-items:flex-start;gap:5px;min-height:62px;border:0;color:inherit;background:transparent;padding:3px 8px}
.aoTodayV2Context button+button{border-left:1px solid var(--border,rgba(230,230,230,.11));padding-left:17px}
.aoTodayV2Context small,.aoTodayV2SectionHead small{display:block;font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.12em;color:var(--text-muted,#aab0b4)}
.aoTodayV2Context strong{font:400 17px/1.17 var(--ao-font-display,Georgia,serif);overflow-wrap:anywhere}
.aoTodayV2Context span{font:500 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4)}
.aoTodayV2Below{padding:2px 18px 34px}
.aoTodayV2Zone{padding:23px 1px 22px;border-bottom:1px solid var(--border,rgba(235,235,235,.12))}
.aoTodayV2SectionHead{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:14px}
.aoTodayV2SectionHead h2{font:400 26px/1.12 var(--ao-font-display,Georgia,serif);margin:5px 0 0}
.aoTodayV2SectionHead>button{background:none;border:0;color:var(--liturgical,#c4b79b);font:600 12px var(--ao-font-ui,system-ui,sans-serif);padding:8px 0;min-height:44px;white-space:nowrap}
.aoTodayV2PrayerFeature{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 12px;min-height:90px;border-radius:10px;border:1px solid var(--border,rgba(235,235,235,.17));background:var(--surface-2,#111a23)}
.aoTodayV2PrayerGlyph{width:40px;height:40px;border:1px solid var(--liturgical-border,rgba(210,200,175,.3));border-radius:50%;display:grid;place-items:center}
.aoTodayV2PrayerGlyph:before{content:"";width:13px;height:22px;border:2px solid var(--liturgical,#c6b692);border-radius:50%;opacity:.75;transform:rotate(20deg)}
.aoTodayV2PrayerFeature small{display:block;font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.075em;color:var(--text-muted,#aab0b4)}
.aoTodayV2PrayerFeature strong{display:block;font:400 19px/1.2 var(--ao-font-display,Georgia,serif);margin:3px 0}
.aoTodayV2PrayerFeature span{display:block;font:400 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4)}
.aoTodayV2PrayerFeature button{min-height:44px;padding:8px 13px;border:1px solid var(--liturgical-border,rgba(215,215,215,.45));border-radius:9px;color:var(--text,#eee9df);background:transparent;font:650 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2PrayerShortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px}
.aoTodayV2PrayerShortcuts button{min-height:69px;padding:10px 4px;background:var(--surface-1,#0c131b);border:1px solid var(--border,rgba(235,235,235,.12));border-radius:9px;color:var(--text,#eee9df);font:600 12px var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2EditorialRow{display:grid;grid-template-columns:minmax(0,1fr) 26px;gap:13px;align-items:center;width:100%;min-height:72px;text-align:left;border:0;border-bottom:1px solid var(--border,rgba(235,235,235,.1));background:transparent;color:var(--text,#eee9df);padding:12px 0}
.aoTodayV2EditorialRow:last-child{border-bottom:0}
.aoTodayV2EditorialRow strong,.aoTodayV2Event strong{display:block;font:400 19px/1.2 var(--ao-font-display,Georgia,serif)}
.aoTodayV2EditorialRow small,.aoTodayV2Event small{display:block;margin-top:5px;font:400 12px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4)}
.aoTodayV2Arrow{font:400 24px var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c6b692)}
.aoTodayV2Event{display:grid;grid-template-columns:70px minmax(0,1fr) 18px;gap:13px;align-items:center;min-height:76px;padding:11px 0;border:0;border-bottom:1px solid var(--border,rgba(235,235,235,.1));color:inherit;background:transparent;text-align:left;width:100%}
.aoTodayV2Event:last-child{border-bottom:0}
.aoTodayV2EventDate{font:400 17px/1.2 var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c6b692)}
.aoTodayV2Event>span:last-child{font-size:20px;color:var(--liturgical,#c6b692)}
.aoTodayV2 button:focus-visible{outline:2px solid var(--liturgical,#c6b692);outline-offset:3px}
@media(min-width:700px){.aoTodayV2Mass{padding:12px 30px 20px!important}.aoTodayV2Below{max-width:750px;margin:auto}}
@media(max-width:370px){.aoTodayV2Below{padding-inline:13px}.aoTodayV2Context{padding-inline:12px}.aoTodayV2PrayerFeature{grid-template-columns:31px minmax(0,1fr) auto;gap:8px;padding-inline:8px}.aoTodayV2PrayerGlyph{width:31px;height:31px}.aoTodayV2PrayerFeature strong{font-size:17px}}
`;
