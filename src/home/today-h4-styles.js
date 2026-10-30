// H4 "Today is the door": scoped presentation tokens only.
// Keep existing Calendar, Mass, and artwork owners; no mock data or new reader.
export const TODAY_H4_CSS=`
.homeScreen.aoTodayV2.aoTodayH4{--h4-bg:var(--ao-bg-canvas,var(--bg,#0a0f15));--h4-surface:var(--ao-surface-1,var(--surface-1,#121a22));--h4-ink:var(--ao-text-primary,var(--text-primary,#f1ebe1));--h4-muted:var(--ao-text-muted,#98a1ab);--h4-line:var(--ao-rule,rgba(151,161,169,.24));--h4-accent:var(--ao-liturgical-accent,#86b596);--h4-gold:var(--ao-gold,#d9bb7e);--h4-serif:var(--ao-font-display,"EB Garamond",Georgia,serif);--h4-gap:16px;color:var(--h4-ink);background:var(--h4-bg);padding:0 0 28px;max-width:100%;overflow-x:hidden}
.aoTodayH4,.aoTodayH4 *{box-sizing:border-box}
.aoTodayH4 button{cursor:pointer}
.aoTodayH4 button:focus-visible{outline:2px solid var(--h4-accent);outline-offset:2px}
.aoTodayH4 .aoH4Bar{display:flex;align-items:center;height:52px;padding:0 var(--h4-gap)}
.aoTodayH4 .aoH4Wordmark{flex:1;min-width:0;font:500 14px/1.2 Cinzel,Georgia,serif;letter-spacing:.19em;white-space:nowrap}
.aoTodayH4 .aoH4Utility{display:grid;place-items:center;width:44px;height:44px;flex:0 0 44px;border:0;background:transparent;color:var(--h4-ink);border-radius:50%}
.aoTodayH4 .aoH4DateBar{display:flex;align-items:flex-end;gap:12px;padding:6px var(--h4-gap) 8px}
.aoTodayH4 .aoH4DateOpen{flex:1;min-width:0;text-align:left;background:transparent;border:0;padding:0;min-height:50px;color:var(--h4-ink)}
.aoTodayH4 .aoH4Eyebrow{display:block;font:700 10px/1.35 system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:var(--h4-accent)}
.aoTodayH4 .aoH4DateOpen strong{display:block;font:500 27px/1.1 var(--h4-serif);margin-top:5px;overflow:hidden;text-overflow:ellipsis}
.aoTodayH4 .aoH4DateReset{min-height:38px;padding:0 13px;background:var(--h4-surface);border:1px solid var(--h4-line);border-radius:19px;color:var(--h4-ink)}
.aoTodayH4 .dateRail.aoH4Week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;padding:0 var(--h4-gap);margin:0}
.aoTodayH4 .dateRail.aoH4Week .dayCell{width:100%;min-width:0;height:56px;padding:4px 0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;background:transparent;color:var(--h4-ink);border:1px solid transparent;border-radius:14px;font:500 15px/1 var(--h4-serif)}
.aoTodayH4 .dateRail.aoH4Week .dayCell span{font:600 10px/1 system-ui,sans-serif;color:var(--h4-muted);text-transform:uppercase}
.aoTodayH4 .dateRail.aoH4Week .dayCell b{font:500 17px/1 var(--h4-serif)}
.aoTodayH4 .dateRail.aoH4Week .dayCell.selected{border-color:var(--h4-accent);background:var(--h4-surface)}
.aoTodayH4 .dateRail.aoH4Week .dayCell.today:not(.selected) b{text-decoration:underline;text-decoration-color:var(--h4-gold);text-underline-offset:4px}
.aoTodayH4 .dateRail.aoH4Week .aoWeekColour{display:block!important;width:16px!important;height:4px!important;border-radius:3px;background:repeating-linear-gradient(90deg,var(--h4-muted) 0 3px,transparent 3px 6px)!important;opacity:.3}
.aoTodayH4 .dateRail.aoH4Week .dayCell .aoWeekColour[data-verified-colour]{background:var(--ao-h4-day-colour)!important;opacity:1}
.aoTodayH4 .aoH4Door{position:relative;margin:12px var(--h4-gap) 0;border:1px solid var(--h4-line);border-radius:22px;background:var(--h4-surface);overflow:hidden}
.aoTodayH4 .aoH4Door .aoTodayV2Art{position:relative;width:100%;height:auto;max-height:none;min-height:0;margin:0;overflow:hidden;border:0;border-radius:0}
.aoTodayH4 .aoH4Door .aoTodayV2ArtSource{width:100%;aspect-ratio:16/10;min-height:0;position:relative;overflow:hidden}
.aoTodayH4 .aoH4Door .aoTodayV2ArtSource img{display:block;width:100%;height:100%;max-height:none;object-fit:cover;object-position:center 32%;border:0;border-radius:0}
.aoTodayH4 .aoH4Door .aoTodayV2ArtSource:after{content:"";position:absolute;inset:65% 0 0;pointer-events:none;background:linear-gradient(transparent,var(--h4-surface))}
.aoTodayH4 .aoH4Door.aoTodayV2ArtMissing .aoTodayV2Art{display:none!important}
.aoTodayH4 .aoH4MassBody{padding:16px 20px 0}
.aoTodayH4 .aoH4MassIdentity{display:flex;align-items:center;gap:8px;font:700 10px/1.3 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase;color:var(--h4-muted)}
.aoTodayH4 .aoH4Dot{height:9px;width:9px;flex:0 0 9px;border-radius:50%;background:var(--ao-liturgical-color,var(--h4-accent))}
.aoTodayH4 .aoH4MassBody h1{font:500 34px/1.08 var(--h4-serif);margin:10px 0 4px;overflow-wrap:break-word}
.aoTodayH4 .aoH4Formulary{font:400 16px/1.4 var(--h4-serif);color:var(--h4-ink);opacity:.86;margin:0}
.aoTodayH4 .aoH4Introit{font:italic 18px/1.32 var(--h4-serif);color:var(--h4-gold);margin:8px 0 0}
.aoTodayH4 .aoH4Primary{width:100%;min-height:56px;display:flex;align-items:center;gap:12px;margin:16px 0 0;padding:9px 16px;border:0;border-radius:16px;background:var(--h4-accent);color:#101c15;text-align:left}
.aoTodayH4 .aoH4Primary strong{font:600 18px/1.2 var(--h4-serif)}
.aoTodayH4 .aoH4Primary small{display:block;font:500 12px/1.3 system-ui,sans-serif;margin-top:3px;opacity:.87}
.aoTodayH4 .aoH4Primary .aoH4Arrow{margin-left:auto;font-size:22px}
.aoTodayH4 .aoH4Primary:disabled{background:var(--h4-line);color:var(--h4-muted);cursor:not-allowed}
.aoTodayH4 .aoH4Change{display:flex;justify-content:center;align-items:center;gap:8px;width:100%;min-height:44px;padding:5px 12px;background:transparent;border:0;color:var(--h4-muted);font:400 13.5px/1.3 var(--h4-serif)}
.aoTodayH4 .aoH4Change strong{color:var(--h4-accent);font-weight:600}
.aoTodayH4 .aoH4Acts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));border-top:1px solid var(--h4-line);margin:0 -20px;padding:2px 0}
.aoTodayH4 .aoH4Acts button{min-height:48px;border:0;border-right:1px solid var(--h4-line);background:transparent;color:var(--h4-ink);font:500 14px/1 var(--h4-serif)}
.aoTodayH4 .aoH4Acts button:last-child{border-right:0}
.aoTodayH4 .aoH4Status{margin:12px 0;padding:12px;border-radius:12px;border:1px solid var(--h4-line);font:14px/1.45 var(--h4-serif);color:var(--h4-muted)}
.aoTodayH4 .aoH4SectionHead{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:30px var(--h4-gap) 12px}
.aoTodayH4 .aoH4SectionHead h2{font:500 22px/1.2 var(--h4-serif);margin:0}
.aoTodayH4 .aoH4SectionHead button{min-height:44px;border:0;background:transparent;color:var(--h4-accent);font:500 14px/1 var(--h4-serif)}
.aoTodayH4 .aoH4Prayer{display:flex;align-items:center;gap:14px;text-align:left;width:calc(100% - 2*var(--h4-gap));min-height:85px;margin:0 var(--h4-gap);padding:14px;border-radius:18px;background:var(--h4-surface);border:1px solid var(--h4-line);color:var(--h4-ink)}
.aoTodayH4 .aoH4PrayerGlyph{display:grid;place-items:center;flex:0 0 46px;width:46px;height:46px;border-radius:50%;background:color-mix(in srgb,var(--h4-accent) 15%,transparent);color:var(--h4-accent);font-size:22px}
.aoTodayH4 .aoH4Prayer .aoH4PrayerText{flex:1;min-width:0}
.aoTodayH4 .aoH4Prayer strong{display:block;font:500 19px/1.2 var(--h4-serif);margin:5px 0 2px}
.aoTodayH4 .aoH4Prayer small{font:400 13px/1.3 system-ui,sans-serif;color:var(--h4-muted)}
.aoTodayH4 .aoH4Chips{display:flex;gap:8px;overflow-x:auto;scrollbar-width:none;padding:10px var(--h4-gap) 2px}
.aoTodayH4 .aoH4Chips button{flex:0 0 auto;min-height:44px;border:1px solid var(--h4-line);border-radius:22px;background:transparent;color:var(--h4-ink);padding:0 13px;font:500 14px/1 var(--h4-serif)}
.aoTodayH4 .aoH4Mine{font:700 9px/1 system-ui,sans-serif;letter-spacing:.1em;margin-left:5px;color:var(--h4-muted)}
.aoTodayH4 .aoH4Upcoming{display:flex;gap:10px;overflow-x:auto;scroll-snap-type:x mandatory;scrollbar-width:none;padding:0 var(--h4-gap) 4px}
.aoTodayH4 .aoH4Upcoming button{flex:0 0 152px;min-height:112px;scroll-snap-align:start;display:flex;flex-direction:column;gap:8px;text-align:left;padding:12px 14px;border:1px solid var(--h4-line);border-radius:16px;background:var(--h4-surface);color:var(--h4-ink)}
.aoTodayH4 .aoH4Upcoming strong{font:500 17px/1.2 var(--h4-serif)}
.aoTodayH4 .aoH4Upcoming small{font:500 12px/1.3 system-ui,sans-serif;color:var(--h4-muted);margin-top:auto}
.aoTodayH4 .aoH4Read{margin:0 var(--h4-gap);border:1px solid var(--h4-line);border-radius:16px;overflow:hidden;background:var(--h4-surface)}
.aoTodayH4 .aoH4Read button{display:flex;align-items:center;text-align:left;gap:12px;min-height:60px;padding:10px 14px;width:100%;border:0;border-top:1px solid var(--h4-line);background:transparent;color:var(--h4-ink)}
.aoTodayH4 .aoH4Read button:first-child{border-top:0}
.aoTodayH4 .aoH4Read button strong{display:block;font:500 16.5px/1.25 var(--h4-serif)}
.aoTodayH4 .aoH4Read button small{display:block;font:400 13px/1.3 system-ui,sans-serif;color:var(--h4-muted);margin-top:3px}
.aoTodayH4 .aoH4Read button .aoH4Arrow{margin-left:auto}
.aoTodayH4 .aoH4CalendarInline{display:none}
.aoTodayH4[data-ao-home-calendar-view] .aoH4CalendarInline{display:block}
.aoTodayH4[data-ao-home-calendar-view] .aoH4TodayContent{display:none}
.aoTodayH4[data-ao-home-calendar-view] .aoH4CalendarBack{display:flex}
.aoTodayH4 .aoH4CalendarBack{display:none;align-items:center;padding:0 var(--h4-gap);gap:12px;min-height:52px}
.aoTodayH4 .aoH4CalendarBack button{width:44px;height:44px;border:0;background:transparent;color:var(--h4-ink)}
.aoTodayH4 .aoH4CalendarBack strong{font:500 20px/1.2 var(--h4-serif)}
.aoTodayH4 .aoH4CalendarInline:not([hidden]){display:block}
@media(max-width:359px){.homeScreen.aoTodayV2.aoTodayH4{--h4-gap:12px}.aoTodayH4 .aoH4Bar{height:44px}.aoTodayH4 .aoH4DateOpen strong{font-size:23px}.aoTodayH4 .dateRail.aoH4Week .dayCell{height:46px}.aoTodayH4 .aoH4Door .aoLiturgicalDayKicker{display:none!important}.aoTodayH4 .aoH4Door .aoTodayV2Art{height:76px!important;max-height:76px!important}.aoTodayH4 .aoH4Door .aoTodayV2ArtSource{height:76px!important;max-height:76px!important;aspect-ratio:auto!important}.aoTodayH4 .aoH4MassBody{padding:12px 16px 0}.aoTodayH4 .aoH4MassBody h1{font-size:29px}.aoTodayH4 .aoH4Acts{margin:0 -16px}.aoTodayH4 .aoH4Acts button{font-size:13px}}

/* Home's source-owned Did You Know teaser; a full Discovery corpus is still gated. */
.aoTodayV2 .aoHomeDYK{display:flex!important;flex-direction:column!important;align-items:flex-start!important;gap:5px!important;min-width:0;width:100%;text-align:left!important;padding:15px 16px!important;min-height:112px!important;border:1px solid var(--ao-rule,var(--border,rgba(225,210,180,.2)))!important;border-radius:14px!important;background:var(--ao-surface-1,var(--surface-1,#161e25))!important;color:var(--ao-text-primary,var(--text,#f2ebe0))!important;white-space:normal!important}
.aoTodayV2 .aoHomeDYK:disabled{opacity:1!important;cursor:default}
.aoTodayV2 .aoHomeDYKLabel{font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif)!important;letter-spacing:.12em!important;text-transform:uppercase;color:var(--liturgical,#c9ad78)}
.aoTodayV2 .aoHomeDYK strong{font:500 19px/1.2 var(--ao-font-display,Georgia,serif)!important;margin:2px 0!important}
.aoTodayV2 .aoHomeDYK [data-home-dyk-fact]{font:400 14px/1.45 var(--ao-font-body,Georgia,serif)!important;color:var(--ao-text-secondary,var(--muted,#bbc0bf))!important;margin:0!important;overflow-wrap:anywhere}
.aoTodayV2 .aoHomeDYKSource{font:600 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);color:var(--liturgical,#c9ad78);margin-top:6px}
.aoTodayV2 .aoHomeDYK:not(:disabled):focus-visible{outline:2px solid var(--liturgical,#c9ad78);outline-offset:2px}

@media(prefers-reduced-motion:reduce){.aoTodayH4 *{scroll-behavior:auto!important;transition:none!important}}
`;
