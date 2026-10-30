// The Calendar is already embedded inside Today and Mass. H3 migrates only
// the resolved Day presentation to the shared visual kit. Month, Year, modal
// Calendar, the source resolver, commemorations and all actions are unchanged.
// This CSS is appended after the historical Calendar rules to avoid fragile
// global overrides; it remains inside the canonical Calendar's own style tag.
export const EMBEDDED_DAY_TCM_CSS=String.raw`
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"]{
 --ao-cal-tcm-space:var(--ao-tcm-section-gap,32px);
 color:var(--ao-tcm-ink,var(--ao-text-primary,#ede7dc));
 background:var(--ao-tcm-bg,var(--ao-bg-canvas,#0b1017));
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalModBody{
 width:min(760px,100%);padding:8px min(12px,var(--ao-tcm-gutter,16px)) 50px;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2DayNav{
 grid-template-columns:44px minmax(0,1fr) 44px;
 gap:10px;margin:10px 0 14px;padding:10px 8px 13px;
 border-bottom:1px solid var(--ao-tcm-line);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2DayNav button{
 min-height:44px;border:1px solid var(--ao-tcm-line)!important;
 border-radius:12px;background:var(--ao-tcm-surface)!important;
 color:var(--ao-tcm-ink)!important;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2DayNav small{
 color:var(--ao-tcm-mute);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2DayNav strong{
 color:var(--ao-tcm-ink);overflow-wrap:anywhere;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero{
 box-sizing:border-box;margin:0;padding:22px 20px 20px;
 background:var(--ao-tcm-surface);color:var(--ao-tcm-ink);
 border:1px solid var(--ao-tcm-line);
 border-radius:var(--ao-tcm-card-radius,18px);text-align:left;
 min-width:0;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero:after{display:none}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Eyebrow{
 display:block;color:var(--ao-tcm-gold);letter-spacing:.12em;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero h2{
 margin:10px 0 13px;max-width:none;text-align:left;
 font:500 clamp(28px,4.5vw,38px)/1.13 var(--ao-font-display,Georgia,serif);
 color:var(--ao-tcm-ink);overflow-wrap:anywhere;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero .aoCalIdentityMeta,
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero .aoCalSourceLine{
 justify-content:flex-start;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalIdentityMeta{
 color:var(--ao-tcm-ink-2);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalDayMassOrdo{
 border:1px solid var(--ao-tcm-line);border-radius:12px;
 background:var(--ao-tcm-raised);padding:14px;
 margin:19px 0 12px;max-width:none;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalDayMassOrdo>small{
 color:var(--ao-tcm-gold);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalOrdoFact dt,
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalDayMassOrdo>p{
 color:var(--ao-tcm-mute);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalOrdoFact dd{
 color:var(--ao-tcm-ink);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero .aoCalV2Commemorations,
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero .aoCalDayScripture{
 max-width:none;width:100%;margin:18px 0 0;padding:15px;
 background:var(--ao-tcm-raised);border:1px solid var(--ao-tcm-line);
 border-radius:12px;text-align:left;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalDayScriptureActions button{
 background:var(--ao-tcm-surface)!important;
 border:1px solid var(--ao-tcm-line)!important;
 border-radius:12px!important;color:var(--ao-tcm-ink)!important;
 min-height:58px;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Primary{
 display:flex;align-items:center;justify-content:space-between;
 gap:12px;width:100%;min-height:54px!important;margin:19px 0 0;
 padding:12px 16px!important;border:1px solid var(--ao-tcm-sage)!important;
 border-radius:var(--ao-tcm-control-radius,16px)!important;
 background:var(--ao-tcm-sage)!important;color:var(--ao-tcm-on-sage)!important;
 font:600 17px/1.25 var(--ao-font-display,Georgia,serif)!important;
 text-align:left!important;
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Documentation{
 max-width:none;margin:17px 0 0;padding:13px 0 0;
 border-color:var(--ao-tcm-line);color:var(--ao-tcm-mute);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Context,
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2WeekSection{
 margin-top:var(--ao-cal-tcm-space);padding:18px 16px;
 background:var(--ao-tcm-surface);border:1px solid var(--ao-tcm-line);
 border-radius:var(--ao-tcm-card-radius,18px);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] :is(.aoCalV2Context,.aoCalV2WeekSection) .aoCalV2SectionTitle h3{
 color:var(--ao-tcm-ink);
}
#ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] :is(.aoCalV2DayNav button,.aoCalDayScriptureActions button,.aoCalV2Primary):focus-visible{
 outline:2px solid var(--ao-tcm-gold)!important;outline-offset:2px;
}
@media(max-width:430px){
 #ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalModBody{padding-inline:min(12px,var(--ao-tcm-gutter,16px))}
 #ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero{padding:18px 14px}
 #ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero h2{font-size:clamp(26px,8vw,33px)}
 #ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Hero .aoCalDayScriptureActions{grid-template-columns:minmax(0,1fr)}
 #ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2Context,
 #ao-calendar-modular-root[data-ao-calendar-embedded="true"][data-ao-calendar-view="day"] .aoCalV2WeekSection{padding:16px 13px}
}
`;
