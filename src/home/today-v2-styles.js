import { TODAY_H3_SECTIONS_CSS } from "./today-h3-sections-styles.js";
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


/* The art overlay owns contrast independently of the user's page appearance.
   No approved art: light canvas + dark ink. Approved art: dark veil + light ink. */
html[data-ao-appearance-v1="light"] .aoTodayV2ArtMissing .aoTodayV2Art::after{
 background:linear-gradient(180deg,rgba(246,242,234,.04),rgba(235,227,212,.72))!important
}
html[data-ao-appearance-v1="light"] .aoTodayV2ArtMissing .aoTodayV2ArtOverlay h1,
html[data-ao-appearance-v1="light"] .aoTodayV2ArtMissing .aoTodayV2ArtOverlay .eyebrow{
 color:#1E242B!important;text-shadow:none!important
}
html[data-ao-appearance-v1="light"] .aoTodayV2Frontispiece:not(.aoTodayV2ArtMissing) .aoTodayV2ArtOverlay h1,
html[data-ao-appearance-v1="light"] .aoTodayV2Frontispiece:not(.aoTodayV2ArtMissing) .aoTodayV2ArtOverlay .eyebrow{
 color:#F7F2E9!important;text-shadow:0 2px 8px rgba(0,0,0,.88)!important
}

/* H1.1 — compact Today, three Calendar lenses, source-owned Prayer and appearance. */
.aoTodayV2 .brandRow{min-height:52px;display:flex;align-items:center;gap:7px}
.aoTodayV2 .brandText{min-width:0;flex:1}
.aoTodayV2 .aoTodayV2PrayerJump{width:44px;min-width:44px;min-height:44px;height:44px;border:0;background:transparent;color:var(--liturgical,var(--text));border-radius:50%;display:grid;place-items:center;padding:0}
.aoTodayV2 .aoTodayV2PrayerJump:focus-visible{outline:2px solid var(--liturgical);outline-offset:2px}
.aoTodayV2 .aoTodayV2Tabs{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:3px;margin:0 13px 3px;padding:3px;min-height:44px;border:1px solid var(--border);border-radius:24px;background:var(--surface-1)}
.aoTodayV2 .aoTodayV2Tabs button{min-height:36px;border:0;border-radius:20px;padding:3px 4px;text-transform:none;letter-spacing:0;font:500 14px/1.2 var(--ao-font-body,Georgia,serif);color:var(--muted)}
.aoTodayV2 .aoTodayV2Tabs button[aria-current="page"]{color:var(--text);background:var(--surface-2);box-shadow:inset 0 0 0 1px var(--liturgical-border);border:0}
/* Today date is navigation, not hidden metadata: always show it above the week. */
.aoTodayV2 .aoTodayV2Header>.dateNavigator{display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px;align-items:center;min-height:50px;padding:2px 8px 4px;margin:0;border:0;visibility:visible!important}
.aoTodayV2 .dateNavigator>.iconButton{width:44px;min-width:44px;height:44px;min-height:44px;display:grid;place-items:center}
.aoTodayV2 .dateNavigator>.dateTitle{display:flex;flex-direction:column;align-items:center;justify-content:center;min-width:0;min-height:44px;padding:2px 4px;border:0;background:transparent;color:var(--text);text-align:center;white-space:normal}
.aoTodayV2 .dateNavigator>.dateTitle span{font:700 10px/1.1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--muted)}
.aoTodayV2 .dateNavigator>.dateTitle b{font:500 19px/1.15 var(--ao-font-display,Georgia,serif);overflow-wrap:break-word}
@media(max-width:359px){.aoTodayV2 .dateNavigator>.dateTitle b{font-size:17px}}
.aoTodayV2 .dateRail{display:grid!important;grid-template-columns:repeat(7,minmax(0,1fr));gap:3px;padding:0 12px 7px;overflow:visible;background:var(--bg)}
.aoTodayV2 .dateRail .dayCell{min-width:0;min-height:55px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;border:1px solid transparent;border-radius:12px;padding:3px 0;background:transparent;color:var(--muted);font:500 12px/1.1 var(--ao-font-ui,system-ui,sans-serif)}
.aoTodayV2 .dateRail .dayCell span{font:600 10px/1.15 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.03em}
.aoTodayV2 .dateRail .dayCell b{font:500 19px/1.1 var(--ao-font-display,Georgia,serif);color:var(--text)}
.aoTodayV2 .dateRail .dayCell.selected{background:var(--surface-1);border-color:var(--liturgical-border)}
.aoTodayV2 .dateRail .dayCell.today b{text-decoration:underline;text-underline-offset:4px;text-decoration-color:var(--liturgical)}
.aoTodayV2 .dateRail .dayCell:focus-visible{outline:2px solid var(--liturgical);outline-offset:2px}
.aoTodayV2 .aoHomeCalendarAccess[hidden]{display:none!important}
.aoTodayV2ArtMissing .aoTodayV2Art{height:clamp(116px,31vw,143px)!important}
.aoTodayV2 .aoTodayV2ArtOverlay .eyebrow{font-size:11px;letter-spacing:.11em}
.aoTodayV2 .aoTodayV2HeroActions{padding:10px 16px 12px}
.aoTodayV2 .aoTodayV2Mass{padding:7px 10px 10px!important;border-bottom:0}
.aoTodayV2 .aoTodayV2PrimaryMass b,.aoTodayV2 .aoTodayV2PrimaryMass span{white-space:normal!important;overflow:visible!important;text-overflow:clip!important;overflow-wrap:break-word;max-width:100%}
.aoTodayV2 .aoTodayV2PrayerThroughDay{margin:0;padding:0 18px}
.aoTodayV2 .aoTodayV2PrayerThroughDay .aoTodayV2Zone{padding-top:19px}
.aoTodayV2 .aoTodayV2PrayerThroughDay:focus{outline:none}
.aoTodayV2 .aoTodayV2RuleLine{display:flex;align-items:center;justify-content:space-between;gap:7px;width:100%;min-height:44px;margin:7px 0;border:1px dashed var(--border);border-radius:11px;padding:8px 11px;background:transparent;color:var(--text);text-align:left;font:400 14px/1.35 var(--ao-font-body,Georgia,serif)}
.aoTodayV2 .aoTodayV2RuleLine span:first-child{min-width:0;overflow-wrap:anywhere}
.aoTodayV2 .aoTodayV2CalendarGlance{margin-top:5px}
html[data-ao-appearance-v1] .aoTodayV2,html[data-ao-appearance-v1] .aoTodayV2 .aoTodayV2HeroActions,html[data-ao-appearance-v1] .aoTodayV2 .aoTodayV2Tabs,html[data-ao-appearance-v1] .aoTodayV2 .aoTodayV2PrayerFeature{transition:background-color .22s ease,color .22s ease,border-color .22s ease}
@media(max-width:359px){
 .aoTodayV2 .aoTodayV2Tabs{margin-inline:10px}
 .aoTodayV2 .aoTodayV2Tabs button{font-size:12px}
 .aoTodayV2 .dateRail{padding-inline:9px;gap:2px}
 .aoTodayV2 .dateRail .dayCell{min-height:51px}
 .aoTodayV2 .aoTodayV2ArtOverlay h1{font-size:clamp(25px,8vw,30px)}
 .aoTodayV2 .aoTodayV2Mass{padding-inline:5px!important}
 .aoTodayV2 .aoTodayV2PrayerThroughDay{padding:0 13px}
}
@media(prefers-reduced-motion:reduce){html[data-ao-appearance-v1] .aoTodayV2,html[data-ao-appearance-v1] .aoTodayV2 *{transition:none!important;scroll-behavior:auto!important}}
html[data-ao-motion-v1="reduced"] .aoTodayV2,html[data-ao-motion-v1="reduced"] .aoTodayV2 *{transition:none!important;scroll-behavior:auto!important}

/* H1.2: H2 observance and actual Mass Proper occupy distinct source-owned roles.
   Approved artwork is an uncluttered image island; title always in readable ink. */
.aoTodayV2Frontispiece{border:1px solid var(--border)!important;border-radius:18px!important;overflow:hidden;background:var(--surface-1)}
.aoTodayV2Frontispiece .aoTodayV2Art::after{display:none!important}
.aoTodayV2Frontispiece .aoTodayV2ArtOverlay{display:none!important}
.aoTodayV2Frontispiece .aoTodayV2HeroActions{min-width:0;padding:16px 18px 14px!important;display:block!important}
.aoTodayV2DayIdentity{border-top:3px solid var(--liturgical);padding-top:10px}
.aoTodayV2DayIdentity .eyebrow{display:block;margin-bottom:8px;font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;color:var(--muted)}
.aoTodayV2DayIdentity h1{font:500 clamp(27px,7.8vw,35px)/1.12 var(--ao-font-display,Georgia,serif);margin:0 0 11px;color:var(--text);text-align:left;letter-spacing:0;text-shadow:none;overflow-wrap:anywhere;text-wrap:balance;hyphens:auto}
.aoTodayV2Frontispiece .aoEditorialMeta{justify-content:flex-start;gap:5px 10px;margin:0 0 6px;line-height:1.35;overflow-wrap:anywhere}
.aoTodayV2Frontispiece .aoTodayV2SeasonMicro{text-align:left;max-width:100%;white-space:normal;overflow-wrap:break-word}
.aoTodayV2ActualFormulary{display:grid;grid-template-columns:minmax(0,1fr);gap:4px;margin:11px 0 0;padding:9px 12px;border:1px solid var(--border);border-radius:11px;background:var(--surface-2);color:var(--text)}
.aoTodayV2ActualFormulary>span,.aoTodayV2Introit>span{font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--muted)}
.aoTodayV2ActualFormulary strong{font:500 17px/1.3 var(--ao-font-body,Georgia,serif);overflow-wrap:break-word;white-space:normal}
.aoTodayV2Introit{display:flex;align-items:baseline;flex-wrap:wrap;gap:5px 10px;margin:9px 0 1px;color:var(--text)}
.aoTodayV2Introit em{font:italic 17px/1.4 var(--ao-font-body,Georgia,serif);overflow-wrap:anywhere;min-width:0}
.aoTodayV2Frontispiece.aoTodayV2ArtMissing .aoTodayV2Art{display:none!important}
.aoTodayV2Frontispiece.aoTodayV2ArtMissing .aoTodayV2HeroActions{max-width:760px;margin-inline:auto;padding:14px 18px!important}
.aoTodayV2 .dateRail .dayCell{position:relative;justify-content:flex-start;padding-top:7px;gap:4px}
.aoTodayV2 .dateRail .dayCell .aoWeekColour{display:block;width:16px;height:3px;border-radius:3px;flex:0 0 3px;margin-top:2px;background:repeating-linear-gradient(90deg,var(--border) 0 3px,transparent 3px 5px)}
.aoTodayV2 .dateRail .dayCell.aoVerifiedDay .aoWeekColour{background:var(--liturgical)}
.aoTodayV2 .dateRail .dayCell.aoUnresolvedDay .aoWeekColour{opacity:.55}
.aoTodayV2 .dateRail .dayCell.aoUnresolvedDay{color:var(--muted)}
.aoTodayV2 .dateRail .dayCell{min-height:62px}
@media(max-width:359px){
 .aoTodayV2 .dateRail .dayCell{min-height:57px}
 .aoTodayV2DayIdentity h1{font-size:27px}
 .aoTodayV2Frontispiece .aoTodayV2HeroActions{padding:14px 13px!important}
 .aoTodayV2Frontispiece.aoTodayV2ArtMissing .aoTodayV2HeroActions{padding-inline:13px!important}
}
@media(min-width:700px){
 .aoTodayV2Frontispiece:not(.aoTodayV2ArtMissing){display:grid;grid-template-columns:minmax(0,1.1fr) minmax(300px,.9fr)}
 .aoTodayV2Frontispiece:not(.aoTodayV2ArtMissing) .aoTodayV2Art{height:410px}
 .aoTodayV2Frontispiece:not(.aoTodayV2ArtMissing) .aoTodayV2HeroActions{align-self:center}
}


/* H2 Calendar band: a legible one-column agenda, not two clipped tiles. */
.aoTodayV2GlanceEvents{grid-template-columns:minmax(0,1fr)}
.aoTodayV2CalendarGlance .aoTodayV2Event{display:grid;grid-template-columns:42px minmax(0,1fr) 18px;gap:12px;align-items:center;min-height:62px;padding:9px 14px;flex-direction:row;border-right:0!important;border-bottom:1px solid var(--border)!important}
.aoTodayV2CalendarGlance .aoTodayV2Event:last-child{border-bottom:0!important}
.aoTodayV2CalendarGlance .aoTodayV2EventDate{display:grid;gap:3px;text-align:center;color:var(--text);border-bottom:3px solid var(--liturgical-border);padding-bottom:5px}
.aoTodayV2CalendarGlance .aoTodayV2EventDate small{font:700 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted);text-transform:uppercase}
.aoTodayV2CalendarGlance .aoTodayV2EventDate b{font:500 20px/1 var(--ao-font-display,Georgia,serif);color:var(--text)}
.aoTodayV2CalendarGlance .aoTodayV2Event strong{font:500 17px/1.25 var(--ao-font-body,Georgia,serif);overflow-wrap:anywhere;min-width:0}
.aoTodayV2CalendarGlance .aoTodayV2EventArrow{color:var(--liturgical)}
.aoTodayV2GlanceNote{font:400 12px/1.35 var(--ao-font-ui,system-ui,sans-serif);color:var(--muted)}


/* Home's source-owned Did You Know teaser; a full Discovery corpus is still gated. */
.aoTodayV2 .aoHomeDYK{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:5px!important;min-width:0;width:100%;text-align:left!important;padding:15px 16px!important;min-height:112px!important;border:1px solid var(--ao-rule,var(--border,rgba(225,210,180,.2)))!important;border-radius:14px!important;background:var(--ao-surface-1,var(--surface-1,#161e25))!important;color:var(--ao-text-primary,var(--text,#f2ebe0))!important;white-space:normal!important}
.aoTodayV2 .aoHomeDYK:disabled{opacity:1!important;cursor:default}
.aoTodayV2 .aoHomeDYKLabel{font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.12em!important;text-transform:uppercase;color:var(--liturgical,#c9ad78)}
.aoTodayV2 .aoHomeDYK strong{font:500 19px/1.2 var(--ao-font-display,Georgia,serif)!important;margin:2px 0!important}
.aoTodayV2 .aoHomeDYK [data-home-dyk-fact]{font:400 14px/1.45 var(--ao-font-body,Georgia,serif)!important;color:var(--ao-text-secondary,var(--muted,#bbc0bf))!important;margin:0!important;overflow-wrap:anywhere}
.aoTodayV2 .aoHomeDYKSource{font:600 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#c9ad78);margin-top:6px}
.aoTodayV2 .aoHomeDYK:not(:disabled):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}

` + TODAY_H3_SECTIONS_CSS;
