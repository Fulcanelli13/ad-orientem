/* Home Today v2 styles as source-owned string: works in browser and Node ESM tests. */
export const TODAY_V2_CSS = String.raw`/* Today v2 / uploaded 10 Oct sacred frontispiece reference. Canonical Home actions remain unchanged. */
.homeScreen.aoTodayV2{background:var(--bg,#080c12);color:var(--text,#eee9df);padding-bottom:max(112px,calc(78px + env(safe-area-inset-bottom,0px)))}
.aoTodayV2Header{position:relative;background:var(--bg,#080c12)}
.aoTodayV2Tabs{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-bottom:1px solid var(--border,rgba(238,238,238,.12));background:var(--bg,#080c12);padding:0 8px}
.aoTodayV2Tabs button,.aoTodayV2Tabs span{display:grid;place-items:center;min-height:47px;border:0;border-bottom:2px solid transparent;background:none;color:var(--muted,#9da3a2);font:700 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em;text-transform:uppercase;text-align:center}
.aoTodayV2Tabs span{border-bottom-color:var(--liturgical,#929ba8);color:var(--text,#eee9df)}
.aoTodayV2Tabs button:focus-visible{outline:2px solid var(--liturgical,#929ba8);outline-offset:-2px}
.aoTodayV2 .dateRail{display:none!important}
.aoTodayV2SelectedDayNotice{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 13px;background:var(--surface-1,#101720);border-bottom:1px solid var(--border,rgba(238,238,238,.13));font:500 13px/1.4 var(--ao-font-ui,system-ui,sans-serif);color:var(--text,#eee9df)}
.aoTodayV2SelectedDayNotice span{min-width:0;overflow-wrap:break-word}
.aoTodayV2SelectedDayNotice button{flex:0 0 auto;min-height:44px;border:1px solid var(--border,rgba(238,238,238,.3));border-radius:7px;padding:7px 10px;background:transparent;color:var(--text,#eee9df);font:600 13px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2SelectedDayNotice button:focus-visible{outline:2px solid var(--liturgical,#929ba8);outline-offset:2px}
@media(max-width:370px){.aoTodayV2SelectedDayNotice{gap:6px;padding-inline:9px}.aoTodayV2SelectedDayNotice button{padding-inline:7px}}
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
.aoTodayV2ArtOverlay .eyebrow{align-self:flex-start;color:var(--text,#eee9df);font-size:13px;letter-spacing:.12em;text-shadow:0 2px 8px #000}
.aoTodayV2ArtOverlay h1{font:400 clamp(29px,7vw,39px)/1.08 var(--ao-font-display,Georgia,serif);color:var(--text,#eee9df);text-shadow:0 3px 11px #000;text-align:center;margin:0 7px;overflow-wrap:anywhere}
.aoTodayV2HeroActions{padding:13px 18px 16px;background:var(--surface-1,#0b1119)}
.aoTodayV2HeroActions .metaLine{display:flex;justify-content:center;gap:10px;flex-wrap:wrap;margin-bottom:7px;font-size:13px;color:var(--muted,#bcbec0)}
.aoTodayV2 .resumeCard{display:block;width:calc(100% - 32px);margin:12px 16px;background:var(--surface-2,#111a23);border:1px solid var(--liturgical-border,rgba(235,235,235,.2))}
.aoTodayV2Mass{padding:10px 16px 18px!important;border-bottom:1px solid var(--border,rgba(238,238,238,.12))}
.aoTodayV2Mass .sectionLabel{font-size:13px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted,#b2afa9);margin:0 0 8px}
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
/* Desktop no-art state: typography replaces the absent painting instead of
   leaving a 410px empty billboard above the Mass action. Real approved art
   retains the generous split frontispiece. */
@media(min-width:700px){
.aoTodayV2 .aoTodayV2Frontispiece.aoTodayV2ArtMissing{display:block!important}
.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2Art{height:clamp(165px,17vw,205px)!important}
.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2ArtOverlay{inset:19px 24px 15px}
.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2ArtOverlay h1{font-size:clamp(29px,3vw,42px);line-height:1.12;max-width:760px;margin:6px auto 0}
.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2HeroActions{display:block!important;max-width:760px;margin-inline:auto;padding:7px 24px 13px!important}
.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2Mass{padding:6px 0 9px!important;border-bottom:0}
.aoTodayV2 .aoTodayV2ArtMissing .aoTodayV2NoArt{background:radial-gradient(ellipse at 50% 25%,var(--liturgical-soft,rgba(143,154,165,.07)),transparent 65%),var(--surface-1,#101720)}
}

@media(max-width:370px){.aoTodayV2Art{height:225px}.aoTodayV2ArtOverlay h1{font-size:27px}.aoTodayV2Mass .phaseButton b{font-size:13px}}

.aoTodayV2Tabs button[aria-current="page"]{border-bottom-color:var(--liturgical,#939fa8);color:var(--text,#eee9df)}
.aoTodayExploreFoot{padding:0 18px 35px}.aoTodayExploreFoot button{min-height:58px;width:100%;text-align:left;border:0;border-top:1px solid var(--border,rgba(238,238,238,.12));padding:12px 2px;background:transparent;color:var(--text,#eee9df)}.aoTodayExploreFoot strong{display:block;font:400 17px var(--ao-font-display,Georgia,serif)}.aoTodayExploreFoot small{display:block;margin-top:4px;color:var(--muted,#a6abb5);font:400 13px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2CalendarInline[hidden]{display:none!important}
.aoTodayV2CalendarInline{width:100%;min-height:100px;padding:0 10px max(64px,calc(36px + env(safe-area-inset-bottom,0px)))}
.aoTodayV2[data-ao-home-calendar-view="day"]>.dateNavigator,.aoTodayV2[data-ao-home-calendar-view="day"]>.aoTodayV2Frontispiece,.aoTodayV2[data-ao-home-calendar-view="day"]>.aoTodayV2Context,.aoTodayV2[data-ao-home-calendar-view="day"]>.aoTodayV2Below,.aoTodayV2[data-ao-home-calendar-view="picker"]>.dateNavigator,.aoTodayV2[data-ao-home-calendar-view="picker"]>.aoTodayV2Frontispiece,.aoTodayV2[data-ao-home-calendar-view="picker"]>.aoTodayV2Context,.aoTodayV2[data-ao-home-calendar-view="picker"]>.aoTodayV2Below,.aoTodayV2[data-ao-home-calendar-view="year"]>.dateNavigator,.aoTodayV2[data-ao-home-calendar-view="year"]>.aoTodayV2Frontispiece,.aoTodayV2[data-ao-home-calendar-view="year"]>.aoTodayV2Context,.aoTodayV2[data-ao-home-calendar-view="year"]>.aoTodayV2Below{display:none!important}
.aoTodayV2[data-ao-home-calendar-view] .aoTodayV2CalendarInline{display:block}
.aoTodayV2[data-ao-home-calendar-view] > :not(.aoTodayV2Header){display:none!important}
.aoTodayV2[data-ao-home-calendar-view] .aoTodayV2Header > :not(.brandRow):not(.aoTodayV2Tabs):not(.aoTodayV2CalendarInline){display:none!important}

@media(prefers-reduced-motion:reduce){.aoTodayV2 *{scroll-behavior:auto}}

/* Compact rhythm from the supplied Today v2 study: never reproduce legacy cards. */
.aoTodayV2 .aoTodayV2HeroActions{min-height:48px}
.aoTodayV2 .aoTodayV2Mass{padding:12px 18px 18px!important}
.aoTodayV2 .aoTodayV2PrimaryMass{display:flex!important;flex-direction:column;align-items:center;justify-content:center;gap:4px;width:100%;min-height:54px;border-radius:10px;padding:10px 12px!important;background:var(--liturgical,#c6b692)!important;color:var(--liturgical-ink,var(--bg,#080c12))!important;text-align:center;border:1px solid var(--liturgical,#c6b692)!important}
.aoTodayV2 .aoTodayV2PrimaryMass b{font:600 17px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);font-variant-caps:small-caps;letter-spacing:.04em}
.aoTodayV2 .aoTodayV2PrimaryMass b,.aoTodayV2 .aoTodayV2PrimaryMass span{display:block!important;opacity:1!important;visibility:visible!important;color:var(--liturgical-ink,var(--bg,#080c12))!important;text-shadow:none!important;filter:none!important}
.aoTodayV2 .aoTodayV2PrimaryMass span{font:500 13px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
.aoTodayV2 .aoTodayV2SecondaryMass{display:flex;justify-content:center;gap:28px;margin-top:8px}
.aoTodayV2 .aoTodayV2SecondaryMass button{min-height:44px;padding:7px 4px;color:var(--text-muted,var(--muted,#c4b7a0));border:0;background:transparent;font:400 16px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);font-variant-caps:normal;letter-spacing:0}
.aoTodayV2Context{display:block;border-block:1px solid var(--border,rgba(230,230,230,.11));padding:8px 16px;background:var(--surface-1,#101720)}
.aoTodayV2Context button{text-align:left;display:flex;flex-direction:row;align-items:center;justify-content:space-between;gap:10px;width:100%;min-height:44px;border:0;color:inherit;background:transparent;padding:4px 8px}
.aoTodayV2Context button strong{margin-left:auto}
.aoTodayV2Context button span{font-size:20px;color:var(--liturgical,#c6b692)}
.aoTodayV2Context button:focus-visible{outline:2px solid var(--liturgical,#c6b692);outline-offset:2px}
.aoTodayV2Context small,.aoTodayV2SectionHead small{display:block;font:700 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.12em;color:var(--text-muted,#aab0b4)}
.aoTodayV2Context strong{font:400 17px/1.17 var(--ao-font-display,Georgia,serif);overflow-wrap:break-word}
.aoTodayV2Context span{font:500 13px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4)}
.aoTodayV2Honoured{padding:18px 19px 8px;border-bottom:1px solid var(--border,rgba(235,235,235,.12));background:var(--surface-1,#101720)}
.aoTodayV2HonouredHeading{margin:0 0 7px}
.aoTodayV2HonouredHeading small{font:700 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;color:var(--text-muted,#aab0b4)}
.aoTodayV2HonouredHeading h2{font:400 22px/1.2 var(--ao-font-display,Georgia,serif);margin:5px 0 0;color:var(--text,#eee9df)}
.aoTodayV2ObservedRow{display:flex;align-items:center;justify-content:space-between;gap:10px;min-height:58px;padding:10px 0;width:100%;border:0;border-bottom:1px solid var(--border,rgba(235,235,235,.10));background:transparent;color:inherit;text-align:left}
.aoTodayV2ObservedRow:last-child{border-bottom:0}
.aoTodayV2ObservedRow span:first-child{min-width:0}
.aoTodayV2ObservedRow small{display:block;font:600 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4);letter-spacing:.025em}
.aoTodayV2ObservedRow strong{display:block;margin-top:4px;font:400 17px/1.25 var(--ao-font-display,Georgia,serif);overflow-wrap:anywhere}
.aoTodayV2ObservedRow em{display:block;font:400 13px/1.35 var(--ao-font-ui,system-ui,sans-serif);font-style:normal;color:var(--text-muted,#aab0b4);margin-top:3px}
.aoTodayV2Below{padding:2px 18px 34px}
.aoTodayV2Zone{padding:23px 1px 22px;border-bottom:1px solid var(--border,rgba(235,235,235,.12))}
.aoTodayV2SectionHead{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:14px}
.aoTodayV2SectionHead h2{font:400 26px/1.12 var(--ao-font-display,Georgia,serif);margin:5px 0 0}
.aoTodayV2SectionHead>button{background:none;border:0;color:var(--liturgical,#c4b79b);font:600 13px var(--ao-font-ui,system-ui,sans-serif);padding:8px 0;min-height:44px;white-space:nowrap}
.aoTodayV2PrayerFeature{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:10px;align-items:center;padding:13px 12px;min-height:90px;border-radius:10px;border:1px solid var(--border,rgba(235,235,235,.17));background:var(--surface-2,#111a23)}
.aoTodayV2PrayerGlyph{width:40px;height:40px;border:1px solid var(--liturgical-border,rgba(210,200,175,.3));border-radius:50%;display:grid;place-items:center}
.aoTodayV2PrayerGlyph:before{content:"";width:13px;height:22px;border:2px solid var(--liturgical,#c6b692);border-radius:50%;opacity:.75;transform:rotate(20deg)}
.aoTodayV2PrayerFeature small{display:block;font:700 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);text-transform:uppercase;letter-spacing:.075em;color:var(--text-muted,#aab0b4)}
.aoTodayV2PrayerFeature strong{display:block;font:400 19px/1.2 var(--ao-font-display,Georgia,serif);margin:3px 0}
.aoTodayV2PrayerFeature span{display:block;font:400 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4)}
.aoTodayV2PrayerFeature button{min-height:44px;padding:8px 13px;border:1px solid var(--liturgical-border,rgba(215,215,215,.45));border-radius:9px;color:var(--text,#eee9df);background:transparent;font:650 13px var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2PrayerShortcuts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:10px}
.aoTodayV2PrayerShortcuts button{min-height:69px;padding:10px 4px;background:var(--surface-1,#0c131b);border:1px solid var(--border,rgba(235,235,235,.12));border-radius:9px;color:var(--text,#eee9df);font:600 13px var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2EditorialRow{display:grid;grid-template-columns:minmax(0,1fr) 26px;gap:13px;align-items:center;width:100%;min-height:72px;text-align:left;border:0;border-bottom:1px solid var(--border,rgba(235,235,235,.1));background:transparent;color:var(--text,#eee9df);padding:12px 0}
.aoTodayV2EditorialRow:last-child{border-bottom:0}
.aoTodayV2EditorialRow strong,.aoTodayV2Event strong{display:block;font:400 19px/1.2 var(--ao-font-display,Georgia,serif)}
.aoTodayV2EditorialRow small,.aoTodayV2Event small{display:block;margin-top:5px;font:400 13px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--text-muted,#aab0b4)}
.aoTodayV2Arrow{font:400 24px var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c6b692)}
.aoTodayV2Event{display:grid;grid-template-columns:70px minmax(0,1fr) 18px;gap:13px;align-items:center;min-height:76px;padding:11px 0;border:0;border-bottom:1px solid var(--border,rgba(235,235,235,.1));color:inherit;background:transparent;text-align:left;width:100%}
.aoTodayV2Event:last-child{border-bottom:0}
.aoTodayV2EventDate{font:400 17px/1.2 var(--ao-font-display,Georgia,serif);color:var(--liturgical,#c6b692)}
.aoTodayV2Event>span:last-child{font-size:20px;color:var(--liturgical,#c6b692)}
.aoTodayV2 button:focus-visible{outline:2px solid var(--liturgical,#c6b692);outline-offset:3px}
@media(min-width:700px){.aoTodayV2Mass{padding:12px 30px 20px!important}.aoTodayV2Below{max-width:750px;margin:auto}}
@media(max-width:370px){.aoTodayV2Below{padding-inline:13px}.aoTodayV2Context{padding-inline:12px}.aoTodayV2Context button{padding-inline:3px;gap:7px}.aoTodayV2Context strong{font-size:15px;overflow-wrap:normal;word-break:normal}.aoTodayV2PrayerFeature{grid-template-columns:31px minmax(0,1fr) auto;gap:8px;padding-inline:8px}.aoTodayV2PrayerGlyph{width:31px;height:31px}.aoTodayV2PrayerFeature strong{font-size:17px}}

/* Approved Home C: one summary panel for 1962 commemorations, separately
   reviewed later-calendar honours, and two candidate upcoming dates. */
.aoTodayV2SeasonMicro{
 display:flex;gap:7px;align-items:center;justify-content:center;
 width:max-content;max-width:100%;margin:0 auto 6px;padding:5px 9px;
 min-height:46px;border:0;background:transparent;
 color:var(--text-muted,#c9c0ac);font:500 15px/1.3 var(--ao-font-ui,"EB Garamond",Georgia,serif);
 text-align:center;
}
.aoTodayV2SeasonMicro span{font-size:18px;color:var(--liturgical,#b8a176)}
.aoTodayV2CalendarGlance{
 max-width:750px;margin:14px auto 4px;background:var(--surface-1,#111921);
 border:1px solid var(--border,rgba(235,235,235,.14));border-radius:9px;overflow:hidden;
}
.aoTodayV2CalendarGlance>h2{
 font:400 23px/1.2 var(--ao-font-display,"EB Garamond",Georgia,serif);
 margin:0;padding:13px 14px 8px;color:var(--text,#eee9df);
}
.aoTodayV2GlanceHonours{
 padding:10px 14px 12px;border-bottom:1px solid var(--border,rgba(235,235,235,.10));
}
.aoTodayV2GlanceCategory{
 color:var(--liturgical,#ccb48c);font:600 13px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif);
 letter-spacing:.06em;text-transform:uppercase;margin-bottom:3px;
}
.aoTodayV2CalendarGlance .aoTodayV2ObservedRow{
 width:100%;min-height:44px;padding:7px 0;
 border:0;border-bottom:1px solid var(--border,rgba(235,235,235,.08));
 display:flex;align-items:center;justify-content:space-between;
 gap:8px;text-align:left;color:var(--text,#eee9df);background:transparent;
}
.aoTodayV2CalendarGlance .aoTodayV2ObservedRow:last-of-type{border-bottom:0}
.aoTodayV2CalendarGlance .aoTodayV2ObservedRow strong{
 font:400 18px/1.25 var(--ao-font-display,"EB Garamond",Georgia,serif);
 overflow-wrap:break-word;
}
.aoTodayV2CalendarGlance .aoTodayV2ObservedRow small{
 display:block;margin-top:3px;color:var(--text-muted,#a9a8a0);
 font:400 13px/1.35 var(--ao-font-ui,"EB Garamond",Georgia,serif);
}
.aoTodayV2CalendarGlance .aoTodayV2ObservedRow>span:last-child{
 flex:0 0 auto;color:var(--liturgical,#b8a176);
}
.aoTodayV2GlanceCaveat,.aoTodayV2GlanceNote{
 color:var(--text-muted,#adaea9);font:400 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);
}
.aoTodayV2GlanceCaveat{margin:6px 0 0}
.aoTodayV2GlanceEvents{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
.aoTodayV2CalendarGlance .aoTodayV2Event{
 display:flex;flex-direction:column;align-items:flex-start;justify-content:center;
 gap:4px;min-width:0;min-height:78px;padding:11px 13px;
 border:0;border-right:1px solid var(--border,rgba(235,235,235,.10));
 border-bottom:0;color:var(--text,#eee9df);background:transparent;text-align:left;
}
.aoTodayV2CalendarGlance .aoTodayV2Event:last-of-type{border-right:0}
.aoTodayV2CalendarGlance .aoTodayV2EventDate{
 font:500 13px/1.25 var(--ao-font-ui,"EB Garamond",Georgia,serif);
 color:var(--liturgical,#c6b692);
}
.aoTodayV2CalendarGlance .aoTodayV2Event strong{
 font:400 17px/1.2 var(--ao-font-display,"EB Garamond",Georgia,serif);
 overflow-wrap:normal;word-break:normal;hyphens:none;
}
.aoTodayV2GlanceEmpty{grid-column:1/-1;padding:12px;margin:0;color:var(--text-muted,#adaea9)}
.aoTodayV2GlanceNote{margin:0;padding:7px 14px 12px;border-top:1px solid var(--border,rgba(235,235,235,.08))}
@media(max-width:699px){
 .aoTodayV2CalendarGlance{margin:14px 15px 4px}
}
@media(max-width:370px){
 .aoTodayV2CalendarGlance{margin-inline:10px}
 .aoTodayV2CalendarGlance .aoTodayV2Event{padding-inline:9px}
 .aoTodayV2CalendarGlance .aoTodayV2Event strong{font-size:16px}
}
/* Hero artwork credit: reserve its band so the day title never sits on top of
   it, and let the LITURGICAL DAY kicker span the desktop grid instead of
   taking the artwork's column. */
.aoTodayV2Frontispiece>.aoLiturgicalDayKicker{grid-column:1/-1}
.aoTodayV2Art{--ao-hero-credit-h:0px}
.aoTodayV2Art:has(.aoProperArt figcaption){--ao-hero-credit-h:64px}
.aoTodayV2Art .aoProperArt{display:flex;flex-direction:column;height:100%;margin:0}
.aoTodayV2Frontispiece .aoTodayV2Art .aoProperArt .aoProperArtMedia{flex:1 1 auto;min-height:0;max-height:none;overflow:hidden}
.aoTodayV2Frontispiece .aoTodayV2Art .aoProperArt img{height:100%;max-height:none}
.aoTodayV2Art .aoProperArt figcaption{flex:0 0 var(--ao-hero-credit-h);box-sizing:border-box;overflow:hidden;align-items:center}
.aoTodayV2Art:has(.aoProperArt figcaption):after{bottom:var(--ao-hero-credit-h)}
.aoTodayV2Art:has(.aoProperArt figcaption) .aoTodayV2ArtOverlay{bottom:calc(var(--ao-hero-credit-h) + 10px)}

/* Quiet Frame editorial Today, actual DOM composition rather than a painted overlay.
 * The title, metadata and season occupy a semantic block before the painting.
 * Approved source art and credit remain in their own existing slot.
 * The 1962 Calendar and current-day navigation still own their selectors. */
.homeScreen.aoTodayV2{background:#0B0F13!important;color:#ECE8DF!important}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayV2Header{
  background:#0B0F13!important;padding:0 0 9px;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .brandRow{
  min-height:62px;padding-inline:18px;border-bottom:1px solid rgba(210,195,166,.14);
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .dateNavigator{
  border-bottom:0;background:transparent!important;
  display:grid;grid-template-columns:48px minmax(0,1fr) 48px;
  align-items:center;gap:8px;padding:14px 16px 0;margin:0;
}
.homeScreen.aoTodayV2 .dateNavigator>.iconButton{
  display:grid;place-items:center;width:44px;min-height:44px;
  color:#c4b38e;border:1px solid rgba(205,183,140,.23);
  background:#151b21;border-radius:50%;
}
.homeScreen.aoTodayV2 .dateNavigator>.dateTitle{
  min-width:0;background:transparent!important;
  display:flex;flex-direction:column;align-items:center;gap:3px;
  color:#e9e0d1!important;text-align:center;
}
.homeScreen.aoTodayV2 .dateNavigator>.dateTitle span{
  color:#b4a385;font:500 12px/1.2 var(--ao-font-ui,Georgia,serif);
  letter-spacing:.15em;text-transform:uppercase;
}
.homeScreen.aoTodayV2 .dateNavigator>.dateTitle b{
  color:#e9e0d1;font:400 17px/1.3 var(--ao-font-display,Georgia,serif);
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoHomeCalendarAccess{
  display:flex!important;justify-content:center;padding:0 14px 12px!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoHomeCalendarAction{
  display:inline-flex;gap:7px;align-items:center;justify-content:center;
  min-height:42px;width:auto;background:transparent!important;border:0!important;
  font:400 13px/1.25 var(--ao-font-ui,Georgia,serif)!important;
  color:#b7a481!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition{
  display:flex!important;flex-direction:column;gap:0;
  margin:0 auto!important;padding:0 16px!important;
  max-width:850px;min-width:0;width:100%;box-sizing:border-box;
  background:transparent!important;border:0!important;overflow:visible!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Identity{
  order:0!important;position:static!important;inset:auto!important;
  display:flex!important;flex-direction:column!important;align-items:center;
  gap:12px;min-height:0!important;max-width:100%;
  padding:18px 8px 23px!important;pointer-events:auto!important;
  background:transparent!important;text-align:center;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialKicker{
  display:block!important;align-self:center!important;
  color:#b6a780!important;text-shadow:none!important;
  font:500 11px/1.5 var(--ao-font-brand,Georgia,serif)!important;
  letter-spacing:.22em!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialTitle{
  margin:0!important;max-width:780px;overflow-wrap:break-word;
  font:400 clamp(37px,6vw,59px)/1.07 var(--ao-font-display,Georgia,serif)!important;
  color:#f1e8d9!important;text-shadow:none!important;text-align:center!important;
  letter-spacing:-.018em;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta{
  display:flex!important;justify-content:center;flex-wrap:wrap;gap:10px!important;
  margin:0!important;color:#d5c9b3!important;
  font:500 12px/1.4 var(--ao-font-ui,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta span{
  border:1px solid rgba(197,177,136,.21);padding:5px 11px;border-radius:100px;
  background:#141a20;white-space:normal;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta span:nth-child(2)::before{
  content:"";display:inline-block;width:7px;height:7px;margin-right:8px;
  border-radius:50%;vertical-align:1px;background:var(--liturgical,#bda477);
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoTodayV2SeasonMicro{
  min-height:40px;border:0;background:transparent!important;
  padding:5px 10px;color:#bea67d!important;
  font:500 14px/1.4 var(--ao-font-ui,Georgia,serif)!important;
  text-transform:none;letter-spacing:0;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Art{
  order:1!important;height:auto!important;max-height:none!important;
  margin:0 auto;position:relative;display:block!important;
  width:100%;min-width:0;overflow:visible!important;background:transparent!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Art::after{display:none!important}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2ArtSource{
  width:100%;height:auto!important;max-height:none!important;overflow:visible!important;
  background:#141A20;border:1px solid rgba(217,199,163,.18);
  border-radius:3px!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2ArtSource>.aoProperArt{
  display:flex;flex-direction:column;height:auto!important;
  margin:0!important;max-height:none!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoProperArtMedia{
  display:grid;place-items:center;flex:none!important;
  width:100%;height:auto!important;min-height:0!important;max-height:none!important;
  overflow:hidden;background:#10141a;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoProperArtMedia img,
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2ArtSource img{
  display:block;width:auto!important;max-width:100%!important;
  height:auto!important;max-height:min(56vh,490px)!important;
  margin-inline:auto;object-fit:contain!important;object-position:center!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoProperArt figcaption{
  display:flex!important;flex:none!important;min-height:45px;height:auto!important;
  max-height:none!important;padding:9px 12px;
  box-sizing:border-box;background:#11161d;
  color:#c7baa3;white-space:normal;
  font:400 12px/1.35 var(--ao-font-ui,Georgia,serif);
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2HeroActions{
  order:2!important;width:100%;max-width:650px;margin:0 auto;
  padding:22px 0 8px!important;background:transparent!important;
  display:flex!important;flex-direction:column;align-items:stretch;gap:8px;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2Mass{
  width:100%;margin:0!important;padding:0 0 12px!important;border:0!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2Mass .sectionLabel{
  color:#b6a780!important;text-align:center!important;
  font:500 11px/1.4 var(--ao-font-brand,Georgia,serif)!important;
  letter-spacing:.14em!important;margin-bottom:10px;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2PrimaryMass{
  min-height:60px!important;border-radius:5px!important;
  background:var(--liturgical,#bea779)!important;
  border-color:var(--liturgical,#bea779)!important;
  color:var(--liturgical-ink,#11161d)!important;
  font:600 17px/1.35 var(--ao-font-ui,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2SecondaryMass{
  display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));
  gap:11px!important;margin-top:11px!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2SecondaryMass button{
  min-height:49px!important;border:1px solid rgba(204,183,145,.24)!important;
  background:#151b22!important;border-radius:5px!important;color:#e7dccb!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Art{
  display:none!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Identity{
  padding-block:26px 25px!important;
  border-bottom:1px solid rgba(204,183,145,.23);
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2HeroActions{
  padding-top:19px!important;
}
.homeScreen.aoTodayV2 .aoTodayExploreFoot{display:none!important}
.homeScreen.aoTodayV2 .aoTodayV2Below{max-width:850px;margin:0 auto!important}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance{max-width:850px;margin-inline:auto}
.homeScreen.aoTodayV2 .aoTodayV2SelectedDayNotice{max-width:850px;margin-inline:auto}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition button:focus-visible{
  outline:2px solid #e0c48e!important;outline-offset:3px!important;
}
@media(max-width:699px){
  .homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Identity{
    padding:18px 4px 20px!important;gap:10px;
  }
  .homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialTitle{
    font-size:clamp(32px,8vw,44px)!important;
  }
  .homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2ArtSource img{
    max-height:42vh!important;
  }
  .homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2HeroActions{
    padding:16px 0 6px!important;
  }
  .homeScreen.aoTodayV2 .aoTodayV2SecondaryMass{
    gap:8px!important;
  }
}
@media(max-width:370px){
  .homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialTitle{font-size:31px!important}
  .homeScreen.aoTodayV2 .aoTodayEditorialEdition{padding-inline:12px!important}
  .homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta{gap:5px!important}
}

/* Edition II / visual direction: sober printed liturgical volume, not card UI.
   Visual hierarchy: editorial masthead → liturgical day → genuine approved art
   → one principal Mass action → prayer/readers → secondary calendar summary. */
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .brandRow{
  display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px!important;
  align-items:center!important;gap:0!important;min-height:74px!important;
  padding:8px 18px!important;background:#0B0F13!important;
  border-bottom:1px solid rgba(209,188,150,.17)!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .brandMark,
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .brandText{display:none!important}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayAppBarTitle{
  display:block!important;grid-column:2;grid-row:1;text-align:center;
  font:400 29px/1.25 var(--ao-font-display,Georgia,serif)!important;
  letter-spacing:-.02em;color:#efe7d8!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .homeUtilityButton{
  grid-column:3;grid-row:1;justify-self:end!important;
  display:grid!important;place-items:center!important;
  width:44px!important;min-height:44px!important;
  border:0!important;border-radius:50%!important;background:transparent!important;
  color:#c4b6a0!important;
}
.homeScreen.aoTodayV2[data-ao-home-calendar-view] .aoTodayAppBarTitle{display:none!important}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .dateNavigator{
  position:relative;display:grid!important;grid-template-columns:35px minmax(0,1fr) 35px;
  max-width:850px;margin:0 auto!important;align-items:center!important;
  gap:7px!important;padding:18px 17px 0!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .dateNavigator .dateTitle span{
  font:500 12px/1.35 var(--ao-font-ui,Georgia,serif)!important;
  text-transform:uppercase;letter-spacing:.18em!important;color:#b7af9f!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .dateNavigator .dateTitle b{
  display:block;font:400 15px/1.4 var(--ao-font-display,Georgia,serif)!important;
  color:#cbbda8!important;margin-top:2px;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .dateNavigator .iconButton{
  width:44px!important;min-height:44px!important;border:none!important;
  color:#9e957f!important;background:transparent!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoHomeCalendarAccess{
  padding:0 15px 3px!important;margin:0 auto!important;max-width:850px;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoHomeCalendarAction{
  color:#b7aa8e!important;min-height:44px!important;
  font:400 14px/1.3 var(--ao-font-ui,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Identity{
  align-items:flex-start!important;text-align:left!important;
  padding:17px 1px 19px!important;gap:8px!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialKicker{
  align-self:flex-start!important;text-align:left!important;
  font:500 10px/1.5 var(--ao-font-brand,Georgia,serif)!important;
  color:#bca980!important;letter-spacing:.19em!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialTitle{
  text-align:left!important;font:400 clamp(37px,6vw,55px)/1.09 var(--ao-font-display,Georgia,serif)!important;
  color:#f2ecdf!important;letter-spacing:-.024em!important;
  max-width:750px!important;text-wrap:balance;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta{
  justify-content:flex-start!important;gap:7px 14px!important;
  font:400 15px/1.4 var(--ao-font-ui,Georgia,serif)!important;
  color:#b9b4aa!important;margin-top:6px!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta span{
  border:0!important;border-radius:0!important;padding:0!important;
  background:transparent!important;color:inherit!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialMeta span+span:before{
  content:"·"!important;display:inline!important;width:auto!important;
  height:auto!important;background:transparent!important;color:#8c856e!important;
  vertical-align:baseline!important;margin:0 10px 0 0!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoTodayV2SeasonMicro{
  padding:7px 3px!important;align-self:flex-start!important;min-height:44px!important;
  color:#bda77d!important;font:400 15px/1.4 var(--ao-font-ui,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Art{
  margin-top:9px!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2ArtSource{
  border:1px solid rgba(213,191,145,.23)!important;border-radius:8px!important;
  background:#10161b!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoProperArt figcaption{
  border-top:1px solid rgba(213,191,145,.12)!important;
  color:#aaa99e!important;background:#0B0F13!important;
  padding:9px 2px!important;font:400 13px/1.4 var(--ao-font-ui,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2HeroActions{
  padding:14px 0 10px!important;max-width:850px!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Identity{
  position:relative;border-bottom:1px solid rgba(206,189,147,.19)!important;
  padding:26px 0 26px!important;
  background:linear-gradient(145deg,rgba(196,165,111,.035),transparent 58%)!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Identity:before{
  content:"✠";position:absolute;right:2px;top:14px;
  color:rgba(201,175,132,.22);font:400 42px/1 var(--ao-font-display,Georgia,serif);
  pointer-events:none;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2Mass .sectionLabel{
  text-align:left!important;margin:0 0 10px!important;
  font:500 10px/1.35 var(--ao-font-brand,Georgia,serif)!important;
  color:#b19e7c!important;letter-spacing:.18em!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2PrimaryMass{
  min-height:63px!important;border-radius:8px!important;
  background:var(--liturgical,#9A845F)!important;
  border:1px solid color-mix(in srgb,var(--liturgical,#9A845F) 80%,#e7d9ba)!important;
  box-shadow:inset 0 1px 0 rgba(255,255,255,.12)!important;
  color:var(--liturgical-ink,#0B0F13)!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2PrimaryMass b{
  font:500 21px/1.25 var(--ao-font-display,Georgia,serif)!important;
  letter-spacing:0!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition .aoTodayV2SecondaryMass button{
  min-height:55px!important;border-radius:8px!important;
  border:1px solid rgba(183,185,177,.29)!important;background:#10161b!important;
  color:#e7e0d3!important;font:400 17px/1.3 var(--ao-font-display,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Below{
  padding:8px 16px 34px!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Zone{padding:25px 0 24px!important}
.homeScreen.aoTodayV2 .aoTodayV2SectionHead h2{
  font:400 26px/1.1 var(--ao-font-display,Georgia,serif)!important;
  color:#efe5d5!important;
}
.homeScreen.aoTodayV2 .aoTodayV2SectionHead>button{
  font:400 14px/1.3 var(--ao-font-ui,Georgia,serif)!important;
  color:#bda779!important;
}
.homeScreen.aoTodayV2 .aoTodayV2PrayerFeature{
  border-radius:9px!important;border:1px solid rgba(193,184,164,.17)!important;
  background:#151C21!important;box-shadow:none!important;
}
.homeScreen.aoTodayV2 .aoTodayV2EditorialRow{
  min-height:78px!important;border-bottom:1px solid rgba(198,188,169,.12)!important;
  background:transparent!important;color:#eee8db!important;
}
.homeScreen.aoTodayV2 .aoTodayV2EditorialRow strong{
  font:400 19px/1.3 var(--ao-font-display,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2EditorialRow small{color:#adafa8!important}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance{
  border:0!important;border-top:1px solid rgba(201,184,145,.22)!important;
  border-radius:0!important;background:transparent!important;
  box-shadow:none!important;padding-top:18px!important;margin-top:5px!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance>h2{
  font:400 23px/1.2 var(--ao-font-display,Georgia,serif)!important;
}
.homeScreen.aoTodayV2 button:focus-visible{
  outline:2px solid var(--liturgical,#baa373)!important;
  outline-offset:2px!important;
}
@media(max-width:699px){
  .homeScreen.aoTodayV2 .aoTodayV2Identity .aoEditorialTitle{
    font-size:clamp(35px,9vw,43px)!important;
  }
  .homeScreen.aoTodayV2 .aoTodayEditorialEdition>.aoTodayV2Identity{
    padding:13px 1px 16px!important;
  }
  .homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Identity{
    padding:22px 0 20px!important;
  }
}
@media(prefers-reduced-motion:reduce){
  .homeScreen.aoTodayV2 *{scroll-behavior:auto!important}
}
/* One calm, contextual Home Customs folio; none when there is no timely approved subject. */
.aoTodayV2CustomSpotlight{box-sizing:border-box;max-width:780px;margin:19px auto 4px;padding:18px clamp(16px,4vw,26px);border-top:1px solid var(--border,rgba(227,212,187,.18));border-bottom:1px solid var(--border,rgba(227,212,187,.12));background:rgba(215,198,169,.025)}
.aoTodayV2CustomKicker{color:#cbb890;font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}
.aoTodayV2CustomSpotlight h2{margin:8px 0 2px;color:var(--text,#eee9df);font:400 clamp(22px,4.8vw,28px)/1.18 'EB Garamond',Georgia,serif}
.aoTodayV2CustomTiming{display:block;color:var(--muted,#b2afa9);font:500 12px/1.5 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2CustomSpotlight>p{font:400 15px/1.65 var(--ao-font-body,Georgia,serif);color:var(--text,#e5dfd6);margin:9px 0 12px}
/* Keep the Home feature succinct; opening the folio restores the complete source text. */
.aoTodayV2CustomSpotlight:not(:has(.aoTodayV2CustomDetails[open])) .aoTodayV2CustomSummary{display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden}
.aoTodayV2CustomDetails{border-top:1px solid var(--border,rgba(238,238,238,.12))}
.aoTodayV2CustomDetails>summary{min-height:44px;cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:12px;list-style:none;color:var(--text,#eee9df);font:600 13px/1.4 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2CustomDetails>summary::-webkit-details-marker{display:none}
.aoTodayV2CustomDetails>summary span{color:#cbb890}
.aoTodayV2CustomDetails>summary:focus-visible,.aoTodayV2CustomCalendarLink:focus-visible{outline:2px solid #cbb890;outline-offset:2px}
.aoTodayV2CustomReading{padding:0 0 11px;color:var(--text,#e5dfd6);font:400 14px/1.6 var(--ao-font-body,Georgia,serif)}
.aoTodayV2CustomReading h3{font:600 12px/1.4 var(--ao-font-ui,system-ui,sans-serif);margin:14px 0 4px;color:var(--muted,#b2afa9)}
.aoTodayV2CustomReading p{margin:4px 0 8px}
.aoTodayV2CustomReading ul{padding-left:19px;overflow-wrap:anywhere}
.aoTodayV2CustomReading a{color:#d5c39d}
.aoTodayV2CustomSpotlight .aoTodayV2CustomScope{font:400 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted,#b2afa9);margin:8px 0 9px}
.aoTodayV2CustomCalendarLink{min-height:44px;border:0;background:none;padding:7px 0;color:#d5c39d;font:600 13px/1.4 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
@media(max-width:700px){.aoTodayV2CustomSpotlight{margin:14px 14px 0;padding:16px 5px}}


/* Do not confuse the independent Saints resolver with the curated Proper hero:
   never show a large empty remote-art placeholder as if it were approved art. */
.homeScreen.aoTodayV2 .aoSaintArtCard:has(.aoSaintArtPlaceholder),
.homeScreen.aoTodayV2 .aoSaintArtCard:has(.aoSaintArtLoading),
.homeScreen.aoTodayV2 .aoSaintArtPlaceholder{
 display:none!important;
}
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoLiturgicalDayKicker{
 display:none!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Identity .aoTodayEditorialDate{
 text-transform:uppercase!important;align-self:flex-start!important;
 font:500 12px/1.4 var(--ao-font-ui,Georgia,serif)!important;
 letter-spacing:.17em!important;color:#c6bca9!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Identity{
 background:linear-gradient(115deg,rgba(193,165,119,.055),transparent 60%)!important;
 border-top:1px solid rgba(214,191,151,.17)!important;
 padding:22px 0 22px!important;
}
.homeScreen.aoTodayV2 .aoTodayEditorialEdition.aoTodayV2ArtMissing>.aoTodayV2Identity:before{
 font-size:26px!important;opacity:.7!important;right:3px;top:12px;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance{
 margin-bottom:22px!important;
}
`;
