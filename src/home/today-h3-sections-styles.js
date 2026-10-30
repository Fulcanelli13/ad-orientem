// H3 Today editorial cards: presentation-only migration to the shared
// Today / Calendar / Mass vocabulary. Prayer remains an independent owner.
// Never alter Calendar dates, Customs statuses, reading routes or Mass entry.
export const TODAY_H3_SECTIONS_CSS=String.raw`
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayV2CalendarGlance.aoTcmCard,
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayV2ReadReflect.aoTcmCard,
.homeScreen.aoTodayV2:not([data-ao-home-calendar-view]) .aoTodayV2CustomSpotlight.aoTcmCard{
 box-sizing:border-box;max-width:min(750px,calc(100% - 28px));
 margin:18px auto 0;padding:0;
 border:1px solid var(--ao-tcm-line)!important;
 border-radius:var(--ao-tcm-card-radius)!important;
 background:var(--ao-tcm-surface)!important;
 color:var(--ao-tcm-ink)!important;overflow:hidden;
 box-shadow:none;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance.aoTcmCard>h2{
 margin:0;padding:20px 19px 14px;
 font:500 24px/1.17 var(--ao-font-display,Georgia,serif);
 color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2GlanceHonours{
 background:var(--ao-tcm-raised);padding:13px 19px;
 border-color:var(--ao-tcm-line);
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2GlanceCategory{
 color:var(--ao-tcm-gold);font:700 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
 letter-spacing:.11em;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2ObservedRow.aoTcmRow{
 background:transparent!important;color:var(--ao-tcm-ink)!important;
 border-color:var(--ao-tcm-line)!important;min-height:55px;
 padding:10px 0!important;border-left:0!important;border-right:0!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2ObservedRow strong{
 color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2ObservedRow small{
 color:var(--ao-tcm-ink-2)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2GlanceCaveat{
 color:var(--ao-tcm-ink-2)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents{
 display:grid;grid-template-columns:minmax(0,1fr);
 background:var(--ao-tcm-surface);min-width:0;
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2Event.aoTcmRow{
 box-sizing:border-box;display:grid;grid-template-columns:48px minmax(0,1fr) 18px;
 align-items:center;gap:12px;min-height:69px;
 padding:11px 18px!important;width:100%;
 background:transparent!important;color:var(--ao-tcm-ink)!important;
 border:0!important;border-bottom:1px solid var(--ao-tcm-line)!important;
 border-radius:0!important;text-align:left;
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2Event:last-child{
 border-bottom:0!important;
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2EventDate{
 border-color:var(--ao-tcm-gold);min-width:0;
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2EventDate :is(small,b),
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2Event strong{
 color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2EventArrow{
 color:var(--ao-tcm-gold)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CalendarGlance .aoTodayV2GlanceNote{
 margin:0;padding:12px 18px 15px;
 border-top:1px solid var(--ao-tcm-line);
 font:400 12px/1.55 var(--ao-font-ui,system-ui,sans-serif);
 color:var(--ao-tcm-ink-2)!important;
 background:var(--ao-tcm-raised);
}
.homeScreen.aoTodayV2 .aoTodayV2GlanceEmpty{
 color:var(--ao-tcm-ink-2)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2Below{
 box-sizing:border-box;max-width:780px;margin:0 auto;
 padding:0 14px 0;
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect.aoTcmCard{
 max-width:750px;margin:18px auto 0;padding:0;
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2SectionHead{
 margin:0;padding:19px 19px 12px;border-bottom:1px solid var(--ao-tcm-line);
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2SectionHead h2{
 margin:0;font:500 24px/1.2 var(--ao-font-display,Georgia,serif);
 color:var(--ao-tcm-ink);
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2EditorialRow.aoTcmRow{
 box-sizing:border-box;display:grid;grid-template-columns:minmax(0,1fr) 18px;
 min-height:69px;gap:12px;padding:11px 19px!important;
 background:transparent!important;border:0!important;
 border-bottom:1px solid var(--ao-tcm-line)!important;
 border-radius:0!important;text-align:left;color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2EditorialRow:last-child{
 border-bottom:0!important;
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2EditorialRow strong{
 color:var(--ao-tcm-ink)!important;
 font:500 19px/1.2 var(--ao-font-display,Georgia,serif);
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2EditorialRow small{
 color:var(--ao-tcm-ink-2)!important;font-size:13px;line-height:1.4;
}
.homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2Arrow{
 color:var(--ao-tcm-gold)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight.aoTcmCard{
 padding:19px 20px;margin-top:18px;
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight .aoTodayV2CustomKicker{
 color:var(--ao-tcm-gold)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight h2{
 margin:8px 0;color:var(--ao-tcm-ink)!important;
 font:500 clamp(22px,4vw,28px)/1.2 var(--ao-font-display,Georgia,serif);
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight :is(.aoTodayV2CustomSummary,.aoTodayV2CustomReading){
 color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight :is(.aoTodayV2CustomTiming,.aoTodayV2CustomScope,.aoTodayV2CustomReading h3){
 color:var(--ao-tcm-ink-2)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight .aoTodayV2CustomDetails{
 border-color:var(--ao-tcm-line);
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight :is(.aoTodayV2CustomDetails>summary,.aoTodayV2CustomReading a,.aoTodayV2CustomCalendarLink){
 color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight .aoTodayV2CustomCalendarLink{
 min-height:44px;padding:7px 0!important;
}
.homeScreen.aoTodayV2 .aoTodayExploreFoot{
 box-sizing:border-box;max-width:778px;margin:18px auto 0;padding:0 14px 32px;
 display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;
}
.homeScreen.aoTodayV2 .aoTodayExploreFoot button{
 box-sizing:border-box;display:block;min-height:82px;padding:15px!important;
 border:1px solid var(--ao-tcm-line)!important;border-radius:var(--ao-tcm-card-radius)!important;
 background:var(--ao-tcm-surface)!important;color:var(--ao-tcm-ink)!important;
}
.homeScreen.aoTodayV2 .aoTodayExploreFoot button strong{
 color:var(--ao-tcm-ink)!important;font:500 18px/1.2 var(--ao-font-display,Georgia,serif);
}
.homeScreen.aoTodayV2 .aoTodayExploreFoot button small{
 color:var(--ao-tcm-ink-2)!important;font:400 13px/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
.homeScreen.aoTodayV2 :is(.aoTodayV2CalendarGlance,.aoTodayV2ReadReflect,.aoTodayV2CustomSpotlight,.aoTodayExploreFoot) button:focus-visible,
.homeScreen.aoTodayV2 .aoTodayV2CustomDetails>summary:focus-visible{
 outline:2px solid var(--ao-tcm-sage)!important;outline-offset:-3px;
}
@media(max-width:440px){
 .homeScreen.aoTodayV2 .aoTodayExploreFoot{grid-template-columns:minmax(0,1fr);gap:9px}
 .homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight.aoTcmCard{padding:16px}
 .homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2EditorialRow.aoTcmRow,
 .homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2Event.aoTcmRow{padding-inline:14px!important}
 .homeScreen.aoTodayV2 .aoTodayV2ReadReflect .aoTodayV2SectionHead{padding-inline:15px}
}
@media(max-width:359px){
 .homeScreen.aoTodayV2 .aoTodayV2CalendarGlance.aoTcmCard,
 .homeScreen.aoTodayV2 .aoTodayV2ReadReflect.aoTcmCard,
 .homeScreen.aoTodayV2 .aoTodayV2CustomSpotlight.aoTcmCard{max-width:calc(100% - 20px)}
 .homeScreen.aoTodayV2 .aoTodayV2GlanceEvents .aoTodayV2Event.aoTcmRow{
  grid-template-columns:42px minmax(0,1fr) 14px;gap:9px;
 }
}
`;
