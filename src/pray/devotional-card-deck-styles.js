// Non-owning shared devotional card layout, loaded after legacy PRAY CSS.
export const DEVOTIONAL_CARD_DECK_CSS=String.raw`
#aoPray435930 .aoDevoDeck{display:block!important;width:100%;min-width:0;gap:0!important}
#aoPray435930 .aoDevoTimeline{display:grid;grid-template-columns:minmax(0,1fr);gap:5px;align-items:center;min-height:58px;padding:6px 2px;background:var(--bg,#080c12);border-block:1px solid var(--border,rgba(255,255,255,.12));position:sticky;top:74px;z-index:16}
#aoPray435930 .aoDevoStops{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;overscroll-behavior-x:contain;scroll-snap-type:x proximity}
#aoPray435930 .aoDevoStops::-webkit-scrollbar{display:none}
/* A quiet, continuous bar reports position without implying devotional merit. */
#aoPray435930 .aoDevoProgress,
#aoPrayerBookRoot.open .aoDevoProgress{
 display:block;grid-column:1/-1;position:relative;box-sizing:border-box;
 width:100%;height:3px;min-height:3px;overflow:hidden;border-radius:2px;
 background:var(--border,rgba(255,255,255,.14));pointer-events:none;
}
#aoPray435930 .aoDevoProgressFill,
#aoPrayerBookRoot.open .aoDevoProgressFill{
 display:block;width:var(--ao-devo-progress,0%);height:100%;
 background:var(--liturgical,#c8b28a);opacity:.85;
 transition:width .2s ease;
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoDevoProgressFill,
 #aoPrayerBookRoot.open .aoDevoProgressFill{transition:none}
}
/* First Friday/Saturday are finite stage guides, not achievement trackers. */
#aoPray435930 .aoP435930ProgrammeNavShell{
 position:sticky;top:79px;z-index:20;background:var(--bg,#080c12);
}
#aoPray435930 .aoP435930ProgrammeNavShell .aoP435930ProgrammeRail{
 position:relative!important;top:auto!important;
}
#aoPray435930 .aoP435930ProgrammeNavShell>.aoDevoProgress{
 width:calc(100% - 28px);margin:0 14px 4px;
}
#aoPray435930 .aoP435930ProgrammeExit{
 grid-template-columns:minmax(0,1fr)!important;
}
/* Stations inherit their one positional progress track from the shared chapter adapter. */
/* The legacy StageRail flex!important must not displace the adapter's one progress row. */
#aoPray435930 .aoP435930StageRail.aoP435930StationRail.aoDevoSequenceTimeline{
 display:grid!important;grid-template-columns:minmax(0,1fr)!important;
 gap:5px!important;align-items:center!important;
}
#aoPray435930 .aoP435930StationRail.aoDevoSequenceTimeline>.aoDevoStops{
 min-width:0!important;width:100%;overflow-x:auto;
}
#aoPray435930 .aoP435930StationRail.aoDevoSequenceTimeline>.aoDevoProgress{
 width:100%;margin:0;grid-column:1/-1;
}

#aoPray435930 .aoP435930FinalExit{
 grid-template-columns:minmax(0,1fr)!important;
}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll:focus-visible{
 outline:2px solid var(--liturgical,#c8b28a);outline-offset:2px;
}
/* Confession chooser uses the source-owned four-stage rail. Only its
   entry screen needs the stage indicator; subsequent cards own one track. */
#aoPray435930 .aoP435930ConfNavShell{
 position:sticky;top:79px;z-index:20;background:var(--bg,#080c12);
}
#aoPray435930 .aoP435930ConfNavShell .aoP435930GuideRail{
 position:relative!important;top:auto!important;
}
#aoPray435930 .aoP435930ConfNavShell>.aoDevoProgress{
 width:calc(100% - 28px);margin:0 14px 4px;
}
#aoPray435930 .aoDevoStop{scroll-snap-align:center;display:grid;gap:2px;flex:0 0 max(112px,42%);padding:8px 9px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:9px;color:var(--muted,#aeb2b8);background:var(--surface-1,#141a20);text-align:left;min-height:48px}
#aoPray435930 .aoDevoStop.active{border-color:var(--liturgical,#d8bd7d);color:var(--text,#f1e7d7);background:color-mix(in srgb,var(--liturgical,#d8bd7d) 9%,var(--surface-1,#141a20))}
#aoPray435930 .aoDevoStopNumber{font:600 13px/1.2 var(--ao-font-ui,"EB Garamond",Georgia,serif);letter-spacing:.12em}
#aoPray435930 .aoDevoStopTitle{font:500 13px/1.25 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoDevoCardViewport{min-width:0;width:100%}
#aoPray435930 .aoDevoCard[hidden]{display:none!important}
#aoPray435930 .aoDevoCard{display:flex;flex-direction:column;min-width:0;animation:aoDevoCardEnter .24s ease both}
#aoPray435930 .aoDevoCardHead{text-align:center;padding:15px 14px 12px;border-bottom:1px solid var(--border,rgba(255,255,255,.12))}
#aoPray435930 .aoDevoCardNumber{font:600 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);color:var(--muted,#aeb2b8);letter-spacing:.12em}
#aoPray435930 .aoDevoCardTitle{font:500 clamp(23px,5.6vw,30px)/1.18 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:var(--text,#f1e7d7);margin:4px 0}
#aoPray435930 .aoDevoCardLatin{font:italic 13px/1.45 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:var(--muted,#aeb2b8);margin:0}
#aoPray435930 .aoDevoCardScroll{height:min(55dvh,540px);min-height:min(320px,48dvh);overflow-y:auto;overscroll-behavior-y:contain;scrollbar-width:thin;padding:22px 14px 26dvh;box-sizing:border-box;display:flex;flex-direction:column;gap:22px}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoDevoCardScroll .aoP435930PrayerUnit{flex:0 0 auto;min-height:0;opacity:1!important;transform:none!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important}
#aoPray435930 .aoDevoCardScroll .aoP435930PrayerUnit>small{display:none!important}
#aoPray435930 .aoDevoCardScroll .aoP435930PrayerUnit button{font:400 clamp(17px,4.4vw,21px)/1.6 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;text-align:left}
#aoPray435930 .aoDevoCardScroll .aoAngelusDialogueLine{display:flex;align-items:flex-start;gap:9px;padding:8px 2px;border:0!important;background:none!important}
#aoPray435930 .aoDevoCardScroll .ao-liturgical-speaker{flex:0 0 26px;font:600 18px/1.5 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoDevoParagraph{opacity:var(--ao-devo-focus,.5)!important;transition:opacity .22s ease!important}
#aoPray435930 .aoDevoCardScroll .aoP435930PrayerUnit.aoDevoParagraph{opacity:var(--ao-devo-focus,.5)!important}
#aoPray435930 .aoDevoParagraph[data-ao-devo-active="true"]{color:var(--text,#f1e7d7)!important}
#aoPray435930 .aoDevoCardScroll .aoDevoAppendixLine{display:block;padding:8px 0}
#aoPray435930 .aoDevoCardScroll .aoDevoAppendixUnit [data-face-v],#aoPray435930 .aoDevoCardScroll .aoDevoAppendixUnit [data-face-la]{display:block}
#aoPray435930 .aoDevoCardScroll [data-face-v][hidden],#aoPray435930 .aoDevoCardScroll [data-face-la][hidden]{display:none!important}

/* Shared Stations/Mercy reader: the prayer text scrolls, never the title rail. */
#aoPray435930 .aoDevoSequenceTimeline{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:5px!important;align-items:center;max-width:100%;width:100%;min-width:0;overflow:visible!important;position:sticky;top:74px;z-index:19;background:var(--bg,#080c12);padding:5px 2px!important;border-block:1px solid var(--border,rgba(255,255,255,.14))}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStops{min-width:0;display:flex!important;overflow-x:auto!important;max-width:100%;padding:0!important}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop{flex:0 0 max(116px,42%)!important;min-height:54px;max-width:none;margin:0!important;display:grid!important;align-content:center}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStopTitle{font:500 13px/1.22 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);white-space:normal}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStopNumber{font:600 13px/1.1 var(--ao-font-ui,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll{padding:18px 16px 27dvh;display:block;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll>*{margin-block:0 22px}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideNow h2{display:none!important}
#aoPray435930 .aoMercyStepType{display:block;margin:4px 14px;color:var(--muted,#aeb2b8);font:500 13px/1.4 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930Flip{max-width:100%;white-space:normal}
#aoPray435930 .aoMercyReader .aoDevoCardScroll{gap:18px;padding:18px 14px 30dvh;min-height:min(350px,52dvh)}
#aoPray435930 .aoMercyLine{display:block;flex:0 0 auto;min-width:0;margin:0!important;padding:18px 8px;border-bottom:1px solid var(--border,rgba(255,255,255,.10));background:transparent!important;box-shadow:none!important;transform:none!important;min-height:unset!important;border-radius:0!important;text-align:left}
#aoPray435930 .aoMercyLine p{font:400 clamp(18px,4.5vw,22px)/1.62 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);margin:8px 0 0;color:var(--text,#f1e7d7)}
#aoPray435930 .aoMercyLine small{font:600 13px/1.4 var(--ao-font-ui,"EB Garamond",Georgia,serif);letter-spacing:.08em;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoMercyReader .aoMercyCurrentGroup{font:500 13px/1.5 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);color:var(--muted,#aeb2b8);margin:6px 0 10px}
#aoPray435930 .aoMercyReader .aoMercyKicker{font-size:13px;margin:4px 0}
#aoPray435930 .aoMercyReader .aoDevoCardTitle{font-size:clamp(23px,5.6vw,30px)}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoMercyLine{transition:none!important}}


/* Individual Prayer Library entries use one named card and source-owned flip. */
#aoPray435930 .aoP435930LibraryReader{min-width:0}
#aoPray435930 .aoP435930LibraryReader .aoDevoCardScroll{display:block;padding:16px 15px 28dvh;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930LibraryReader .aoP435930Prayer{border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;margin:0}
#aoPray435930 .aoP435930LibraryReader .aoP435930PrayerHead{display:none!important}
#aoPray435930 .aoP435930LibraryReader .aoP435930Flip,
#aoPray435930 .aoP435930LibraryReader .aoP435930Text{font:400 clamp(18px,4.5vw,22px)/1.65 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;text-align:left;white-space:normal;max-width:100%}
#aoPray435930 .aoP435930LibraryReader .aoLibraryLine{margin:0 0 16px;min-width:0;white-space:pre-wrap}
#aoPray435930 .aoP435930LibraryReader .aoP435930PrayerProse.aoLibraryLine{display:block}
#aoPray435930 .aoP435930LibraryReader .aoLibraryBreak{display:block;height:8px}
#aoPray435930 .aoP435930LibraryReader .aoP435930Source{margin-top:20px}
#aoPray435930 .aoP435930LibraryReader .aoDevoSequenceTimeline{margin:7px 0}

/* Public Benediction reuses source-owned seven stages as prayer-first cards.
   The user, not an automatic clock, advances with the actual ceremonial. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll{
 display:block;padding:18px min(52px,16vw) 26dvh 16px;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll>*{margin-block:0 22px}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideNow h2{display:none!important}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930Prayer{
 border:0!important;background:transparent!important;box-shadow:none!important}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930Flip{
 max-width:100%;white-space:normal}
#aoPray435930 .aoP435930BenedictionReader[data-ao-benediction-dual-axis="true"] .aoP435930GuideNav{display:none!important}
#aoPray435930 .aoP435930BenedictionReader[data-ao-benediction-dual-axis="true"][data-ao-benediction-final="true"] .aoP435930GuideNav{display:flex!important}
#aoPray435930 .aoP435930BenedictionReader[data-ao-benediction-dual-axis="true"][data-ao-benediction-final="true"] [data-p435930-ben-prev]{display:none!important}
#aoPray435930 .aoP435930BenedictionReader [data-ao-benediction-guide]{
 margin:12px 0 8px}
#aoPray435930 .aoP435930BenedictionReader [data-ao-benediction-guide]>summary{
 min-height:44px;display:flex;align-items:center;color:var(--muted,#aeb2b8);font-size:13px}

/* Only the three chosen guided Adoration methods use card navigation.
   Open-ended silent prayer and the treasury remain non-sequential. */
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="visit"] .aoDevoCardScroll,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="holy"] .aoDevoCardScroll,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-mode="four"] .aoDevoCardScroll{
 display:block;padding:18px min(52px,16vw) 26dvh 16px;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930AdorationReader .aoDevoCardScroll>*{margin-block:0 22px}
#aoPray435930 .aoP435930AdorationReader .aoDevoCardScroll .aoP435930GuideNow h2{display:none!important}
#aoPray435930 .aoP435930AdorationReader .aoDevoCardScroll .aoP435930Prayer{
 border:0!important;background:transparent!important;box-shadow:none!important}
#aoPray435930 .aoP435930AdorationReader .aoDevoCardScroll .aoP435930Flip{max-width:100%;white-space:normal}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-dual-axis="true"] .aoP435930GuideNav{display:none!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-dual-axis="true"][data-ao-adoration-final="true"] .aoP435930GuideNav{display:flex!important}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-dual-axis="true"][data-ao-adoration-final="true"] .aoP435930GuideNav .aoP435930Secondary{display:none!important}

/* Sacramental Confession: no personal sins or responses are stored. The
   canonical path chooser remains outside the swipe/timeline interface. */
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll{
 display:block;padding:18px min(52px,16vw) 26dvh 16px;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll>*{margin-block:0 22px}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930GuideNow h2{
 display:none!important}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930ConfOneCard{
 margin:0!important;padding:0!important;border:0!important;border-radius:0;background:transparent!important;box-shadow:none!important}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930ConfOneCard>h2,
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930ConfOneCard>small{
 display:none!important}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930ConfQuestions>li{
 padding-block:8px}
#aoPray435930 .aoP435930ConfessionReader[data-ao-confession-dual-axis="true"][data-ao-confession-final="false"] .aoP435930GuideNav{
 display:none!important}
#aoPray435930 .aoP435930ConfessionReader[data-ao-confession-dual-axis="true"][data-ao-confession-final="true"] .aoP435930GuideNav .aoP435930Secondary{
 display:none!important}

/* Four historical source-owning devotions use the same prayer-first deck.
   Only canonical final actions are retained; the chapter timeline replaces
   redundant Previous/Next controls. The public rite is never auto-timed. */
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll{
 display:block;padding:18px min(52px,16vw) 26dvh 16px;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll>*{
 margin-block:0 22px}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930GuideNow h2{
 display:none!important}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930WordHero h2{
 display:none!important}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930Prayer{
 border:0!important;background:transparent!important;box-shadow:none!important}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930LitanyVerses{
 display:grid;gap:10px}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930LitanyLine{
 margin:0;font:400 1rem/1.67 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930WitnessParagraph{
 font:400 1rem/1.67 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);margin:0 0 14px}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930ScriptureVerse{
 display:inline-block;margin:5px 3px 8px 0}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930ScriptureFlip{
 max-width:100%;white-space:normal}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-dual-axis="true"] .aoP435930GuideNav{
 display:none!important}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-dual-axis="true"][data-ao-devotional-final="true"] .aoP435930GuideNav{
 display:flex!important}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-dual-axis="true"][data-ao-devotional-final="true"] .aoP435930GuideNav .aoP435930Secondary{
 display:none!important}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoP435930GuidedContext>summary{
 display:flex;align-items:center;min-height:44px;color:var(--muted,#aeb2b8);font-size:13px}


/* Rosary exact donor is a separate shell: shared chapter rail styling is scoped there. */
#aoPrayerBookRoot.open .aoRosaryNamedTimeline{display:grid;grid-template-columns:minmax(0,1fr);width:100%;min-width:0;max-width:100%;padding:7px 8px;box-sizing:border-box;border-block:1px solid var(--border,rgba(255,255,255,.14));background:var(--bg,#080c12);position:sticky;top:65px;z-index:15}
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStops{display:flex;min-width:0;max-width:100%;gap:6px;overflow-x:auto;scrollbar-width:thin;scroll-snap-type:x proximity}
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStop{flex:0 0 min(46%,180px);min-height:52px;padding:8px 10px;display:grid;gap:3px;scroll-snap-align:center;text-align:left;border:1px solid var(--border,rgba(255,255,255,.15));border-radius:9px;background:var(--surface-1,#141a20);color:var(--muted,#aeb2b8)}
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStop[aria-current="step"]{border-color:var(--liturgical,#d8bd7d);color:var(--text,#f1e7d7)}
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStopNumber{font:600 13px/1.2 var(--ao-font-ui,"EB Garamond",Georgia,serif);letter-spacing:.12em}
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStopTitle{font:500 13px/1.25 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);white-space:normal}


/* The canonical Rosary donor retains its prayer heading, flip, and bead
 * controls. The visible prayer face scrolls locally inside the titled card. */
#aoPrayerBookRoot.open .aoRosaryActiveCard{
 width:100%;min-width:0;max-width:100%;box-sizing:border-box;
 border:1px solid var(--border,rgba(255,255,255,.16));
 border-radius:12px;background:var(--surface-1,rgba(15,22,30,.88));
 overflow:hidden;padding:18px 14px 12px;
}
#aoPrayerBookRoot.open .aoRosaryActiveCard > h2.aoDevoCardTitle{
 font:500 clamp(22px,5.5vw,30px)/1.24 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);
 margin:0 0 13px;letter-spacing:.015em;
}
#aoPrayerBookRoot.open .aoRosaryActiveCard .aoRosaryPrayerScroll,
#aoPrayerBookRoot.open .aoRosaryActiveCard.aoRosaryPrayerScroll{
 display:block;box-sizing:border-box;min-width:0;width:100%;
 min-height:min(245px,39dvh);max-height:min(49dvh,530px);
 overflow-x:hidden;overflow-y:auto;overscroll-behavior-y:contain;
 -webkit-overflow-scrolling:touch;touch-action:pan-y;
 padding:12px 7px 25dvh 3px;scrollbar-width:thin;
}
#aoPrayerBookRoot.open .aoRosaryActiveCard.aoRosaryPrayerScroll{
 display:block;max-height:min(52dvh,540px);min-height:min(245px,39dvh)
}
#aoPrayerBookRoot.open .aoRosaryActiveCard .aoDevoParagraph{
 transition:opacity .24s ease;opacity:.42;
}
#aoPrayerBookRoot.open .aoRosaryActiveCard .aoDevoParagraph[data-ao-devo-active="true"]{
 opacity:1;
}
#aoPrayerBookRoot.open .aoRosaryActiveCard[data-ao-rosary-dual-axis="v1"]{
 scroll-margin-block-start:100px;
}
@media(prefers-reduced-motion:reduce){
 #aoPrayerBookRoot.open .aoRosaryActiveCard .aoDevoParagraph{transition:none!important}
}


/* Angelus Folio v1: five movements. Same canonical prayer owner; visually
   sparse and directly usable. The approved artwork slot can be populated later. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoP435930Head{position:relative}
#aoPray435930 .aoFolioSettingsTrigger{
 width:44px;height:44px;min-width:44px;display:grid;place-items:center;
 flex:0 0 44px;padding:8px;border:0;border-radius:9px;
 color:var(--muted,#c7bfad);background:transparent;
}
#aoPray435930 .aoFolioSettingsTrigger svg,
#aoPray435930 .aoFolioSettingsTrigger [data-ao-asset-id]{width:21px!important;height:21px!important}
#aoPray435930 .aoFolioSettingsTrigger[aria-expanded="true"],
#aoPray435930 .aoFolioSettingsTrigger:focus-visible{
 color:var(--text,#f1e7d7);outline:1px solid var(--liturgical,#d8bd7d)}
#aoPray435930 .aoFolioReader{position:relative;min-width:0}
#aoPray435930 .aoFolioReader .aoFolioOptions:not([open]){display:none!important}
#aoPray435930 .aoFolioReader .aoFolioOptions[open]{
 display:block!important;position:fixed;z-index:150;top:78px;right:clamp(10px,4vw,55px);
 width:min(355px,calc(100vw - 22px));max-height:min(75dvh,650px);
 overflow-y:auto;overscroll-behavior:contain;
 margin:0!important;border:1px solid var(--border,rgba(217,197,154,.28))!important;
 border-radius:12px!important;box-shadow:0 18px 44px rgba(0,0,0,.55);
 padding:14px!important;background:var(--surface-1,#121920)!important;
}
#aoPray435930 .aoFolioReader .aoFolioOptions>summary{display:none!important}
#aoPray435930 .aoFolioReader .aoFolioOptions .aoP435930PrayerOptionsBody{display:grid;gap:13px}
#aoPray435930 .aoFolioReader .aoFolioPostureNote{
 margin:3px 10px 10px;border:0;border-radius:8px;background:transparent;
 color:var(--muted,#b6ad9a);font:500 13px/1.45 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);
}
#aoPray435930 .aoFolioReader .aoFolioPostureNote summary{
 display:flex;gap:8px;align-items:center;cursor:pointer;min-height:32px;list-style:none}
#aoPray435930 .aoFolioReader .aoFolioPostureNote summary::-webkit-details-marker{display:none}
#aoPray435930 .aoFolioReader .aoFolioPostureNote summary span:last-child{opacity:.65;font-style:normal}
#aoPray435930 .aoFolioReader .aoFolioPostureNote p{margin:5px 0 8px 26px;max-width:56ch;line-height:1.5}
#aoPray435930 .aoFolioReader .aoFolioPostureIcon{width:20px!important;height:20px!important;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoFolioReader .aoAngelusRitualGrid{display:block!important;min-width:0}
#aoPray435930 .aoFolioReader .aoAngelusRitualGrid>.aoRitualRail{display:none!important}
#aoPray435930 .aoFolioReader .aoDevoTimeline{
 min-height:52px;padding:4px 3px!important;top:74px;
 border-top:0;background:var(--bg,#080c12);
}
#aoPray435930 .aoFolioReader .aoDevoStop{flex-basis:max(105px,35%);min-height:44px;padding:7px 10px}
#aoPray435930 .aoFolioReader .aoDevoStopNumber{font-size:13px}
#aoPray435930 .aoFolioReader .aoDevoStopTitle{font-size:13px}
#aoPray435930 .aoFolioReader .aoDevoCard{max-width:850px;margin-inline:auto;width:100%}
#aoPray435930 .aoFolioReader .aoDevoCardHead{
 padding:22px 14px 16px;background:linear-gradient(180deg,rgba(210,170,103,.045),transparent);
}
#aoPray435930 .aoFolioReader .aoDevoCardTitle{font:500 clamp(24px,5.8vw,32px)/1.2 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoFolioReader .aoDevoCardScroll{
 height:min(65dvh,660px);min-height:min(330px,50dvh);padding:20px clamp(14px,3vw,38px) 21dvh;
 gap:20px;line-height:1.62;scrollbar-width:thin;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoP435930PrayerUnit button{
 font:400 clamp(18px,4.4vw,23px)/1.66 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 letter-spacing:.01em;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoDevoParagraph{
 transition:opacity .22s ease,color .22s ease!important}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoDevoParagraph[data-ao-devo-active="true"]{opacity:1!important}
#aoPray435930 .aoFolioReader .aoFolioGuidedHint{margin:12px auto 0;max-width:50ch;color:var(--muted,#b6ad9a);font:italic 14px/1.48 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoFolioReader .aoFolioConclusionPart{
 display:grid;gap:8px;padding:17px 0 0;margin:4px 0 0;
 border-top:1px solid var(--border,rgba(255,255,255,.13));
}
#aoPray435930 .aoFolioReader .aoFolioConclusionHeading{
 font:italic 15px/1.45 var(--ao-font-liturgical,"EB Garamond",Georgia,serif);font-weight:400;color:var(--liturgical,#d8bd7d);
 margin:0 0 4px;
}
#aoPray435930 .aoFolioReader .aoFolioGloria{display:block;margin-bottom:17px}
#aoPray435930 .aoFolioReader .aoDevoAppendixFace{display:block}
#aoPray435930 .aoFolioReader .aoDevoAppendixLine{display:block;white-space:normal}
#aoPray435930 .aoFolioReader .aoFolioIncarnationCue{
 display:flex;align-items:center;justify-content:center;gap:12px;
 max-height:0;opacity:0;overflow:hidden;transition:opacity .3s ease,max-height .3s ease;
 margin:0;color:var(--liturgical,#d8bd7d);font:500 13px/1.35 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)}
#aoPray435930 .aoFolioReader .aoFolioIncarnationCue.is-active{
 max-height:100px;opacity:1;margin-top:12px}
#aoPray435930 .aoFolioReader .aoFolioIncarnationIcon{
 width:50px!important;height:50px!important;flex:0 0 50px}
#aoPray435930 .aoFolioReader .aoDevoCard.aoFolioIncarnationActive .aoDevoCardHead{
 background:radial-gradient(ellipse at top,rgba(211,174,105,.19),transparent 75%);
 border-bottom-color:var(--liturgical,#d8bd7d)}
@media(max-width:600px){
 #aoPray435930 .aoFolioReader .aoDevoCardHead{padding-top:17px}
 #aoPray435930 .aoFolioReader .aoDevoCardScroll{height:min(63dvh,615px);padding-bottom:23dvh}
 #aoPray435930 .aoFolioReader .aoDevoStop{flex-basis:max(112px,45%)}
}
@media(prefers-reduced-motion:reduce){
 #aoPray435930 .aoFolioReader .aoFolioIncarnationCue,
 #aoPray435930 .aoFolioReader .aoDevoCardScroll .aoDevoParagraph{transition:none!important}
}


/* Angelus Folio compact mobile reading contract. This is local to Angelus /
   Regina Cæli: Mass, Rosary, Stations and other prayer donors are unchanged. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"]>.aoP435930Head{
 grid-template-columns:44px minmax(0,1fr) 44px 44px!important;
 align-items:center!important;gap:6px!important;padding:6px 10px!important;
 min-height:56px!important;box-sizing:border-box;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"]>.aoP435930Head>div{
 padding:0!important;align-self:center;min-width:0;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"]>.aoP435930Head>div>small{
 display:none!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"]>.aoP435930Head h1{
 font-size:clamp(20px,5.8vw,26px)!important;line-height:1.16!important;
 margin:0!important;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"]>.aoP435930Head button{
 width:44px!important;height:44px!important;min-width:44px!important;min-height:44px!important;
 border:1px solid transparent!important;border-radius:11px!important;
 background:transparent!important;box-shadow:none!important;justify-self:center;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"]>.aoP435930Head button:focus-visible{
 outline:2px solid var(--liturgical,#d8bd7d)!important;outline-offset:2px;
}
#aoPray435930 .aoFolioReader{
 padding:3px 9px 24px!important;gap:5px!important;
}
#aoPray435930 .aoFolioReader .aoFolioPostureNote{
 margin:0 2px 3px!important;font-size:12px!important;
}
#aoPray435930 .aoFolioReader .aoFolioPostureNote summary{
 min-height:32px!important;gap:7px!important;
}
#aoPray435930 .aoFolioReader .aoFolioPostureIcon{
 width:18px!important;height:18px!important;
}
#aoPray435930 .aoFolioReader .aoDevoTimeline{
 display:grid!important;
 grid-template-columns:minmax(0,1fr)!important;
 min-height:52px!important;max-height:none!important;
 gap:3px!important;padding:1px 3px!important;
 top:56px!important;border-block:0 1px solid var(--border,rgba(255,255,255,.14))!important;
}
#aoPray435930 .aoFolioReader .aoDevoStops{
 min-width:0!important;gap:4px!important;
 align-items:center!important;justify-content:safe center;
}
#aoPray435930 .aoFolioReader .aoDevoStop{
 display:flex!important;align-items:center!important;justify-content:center!important;
 flex:0 0 44px!important;min-width:44px!important;width:44px!important;
 min-height:44px!important;height:44px!important;
 padding:0!important;border-radius:7px!important;
 background:transparent!important;border:1px solid transparent!important;
}
#aoPray435930 .aoFolioReader .aoDevoStop.active{
 color:var(--text,#f1e7d7)!important;
 background:color-mix(in srgb,var(--liturgical,#d8bd7d) 10%,transparent)!important;
 border-color:color-mix(in srgb,var(--liturgical,#d8bd7d) 60%,transparent)!important;
}
#aoPray435930 .aoFolioReader .aoDevoStopTitle{display:none!important}
#aoPray435930 .aoFolioReader .aoDevoStopNumber{
 font:500 13px/1.2 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 letter-spacing:0!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardHead{
 padding:13px 12px 12px!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardNumber,
#aoPray435930 .aoFolioReader .aoDevoCardLatin{
 display:none!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardTitle{
 font:500 clamp(22px,5.8vw,29px)/1.15 var(--ao-font-display,"EB Garamond",Georgia,serif)!important;
 margin:0!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll{
 height:min(72dvh,720px)!important;
 min-height:min(330px,52dvh)!important;
 padding:16px clamp(13px,3vw,36px) 23dvh!important;
 gap:17px!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoAngelusDialogueLine{
 display:grid!important;
 grid-template-columns:30px minmax(0,1fr)!important;
 gap:10px!important;
 align-items:start!important;
 box-sizing:border-box!important;
 width:100%!important;min-width:0!important;
 padding:6px 2px!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoAngelusDialogueLine.response{
 padding:9px 7px 9px 10px!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoAngelusDialogueLine>.ao-liturgical-speaker{
 display:block!important;grid-column:1;min-width:0!important;width:30px!important;
 flex:none!important;
 font-family:inherit!important;font-size:1em!important;line-height:1.62!important;
 font-weight:var(--ao-type-speaker-weight,600)!important;
 text-align:left!important;
}
#aoPray435930 .aoFolioReader .aoDevoCardScroll .aoAngelusDialogueLine>span:not(.ao-liturgical-speaker){
 grid-column:2;min-width:0!important;max-width:100%!important;
 overflow-wrap:break-word;white-space:normal!important;
}
#aoPray435930 .aoFolioReader .aoFolioGloria .aoAngelusDialogueLine{
 margin-block:2px!important;
}
@media(max-width:370px){
 #aoPray435930 .aoFolioReader .aoDevoStop{flex-basis:44px!important;min-width:44px!important;width:44px!important}
 #aoPray435930 .aoFolioReader .aoDevoStops{justify-content:flex-start}
 #aoPray435930 .aoFolioReader .aoDevoCardScroll .aoAngelusDialogueLine{
  grid-template-columns:26px minmax(0,1fr)!important;gap:8px!important
 }
 #aoPray435930 .aoFolioReader .aoDevoCardScroll .aoAngelusDialogueLine>.ao-liturgical-speaker{width:26px!important}
}


/* Unified Eucharistic module chapter navigation: one quiet underlined timeline.
   Adoration already owns this treatment; Benediction now uses the same anatomy. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoSequenceTimeline{
 position:relative!important;top:auto!important;z-index:1!important;
 background:transparent!important;border-block:0!important;
 padding:0 0 4px!important;margin:0 0 5px!important;min-height:48px!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoSequenceTimeline .aoDevoStop{
 flex:0 0 max(116px,42%)!important;min-height:45px!important;
 border:0!important;border-bottom:1px solid var(--border,rgba(255,255,255,.13))!important;
 border-radius:0!important;background:transparent!important;box-shadow:none!important;
 display:grid!important;place-content:center!important;text-align:center!important;
 padding:4px 8px!important;color:var(--muted,#aaa39a)!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoSequenceTimeline .aoDevoStop.active{
 border-bottom:2px solid var(--liturgical,#c3a77e)!important;
 color:var(--text,#f0e5d6)!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoStopNumber{display:none!important}
#aoPray435930 .aoP435930BenedictionReader .aoDevoStopTitle{
 font:italic 12px/1.3 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:inherit!important;
}
/* PRAY #1644 — one prayer-first type hierarchy, shared by Adoration and Benediction.
   Horizontal navigation and Latin tap remain runtime owners; this is presentation only. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="adoration"]>.aoP435930Head,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="benediction"]>.aoP435930Head{
 grid-template-columns:44px minmax(0,1fr) 44px 44px!important;
 align-items:center!important;gap:5px!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="adoration"]>.aoP435930Head>div,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="benediction"]>.aoP435930Head>div{min-width:0!important;overflow:hidden}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="adoration"]>.aoP435930Head h1,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="benediction"]>.aoP435930Head h1{
 overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
 font-size:clamp(15px,4.2vw,21px)!important;line-height:1.2!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="adoration"]>.aoP435930Head p,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="benediction"]>.aoP435930Head p{display:none!important}
#aoPray435930 .aoP435930SessionLanguage{
 font:700 12px/1 var(--ao-font-ui,system-ui,sans-serif)!important;
 letter-spacing:.07em!important;border-radius:9px!important;
 border:1px solid var(--liturgical-border,rgba(206,177,122,.5))!important;
 color:var(--text,#f2e8d7)!important;background:transparent!important;
 min-height:44px!important;min-width:44px!important;touch-action:manipulation;
}
/* The shared card is not a second editor or a checklist. Put actual prayers first. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll{
 display:flex!important;flex-direction:column!important;gap:14px!important;
 align-items:stretch!important;overflow-anchor:none!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll>.aoP435930Prayer,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll>.aoP435930GuidePrayers{
 order:-2;margin:0 0 10px!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll>.aoP435930GuideNow,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll>.aoP435930GuideNow{order:0}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll>.aoP435930GuideCue,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll>.aoP435930GuideCue{order:2}
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll>.aoAdorationQuietLink,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll>.aoAdorationQuietEnter{order:3}
/* Prayer: dominant liturgical face, high contrast, generous measure and spacing. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930Prayer,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930Prayer{
 border:0!important;border-radius:0!important;box-shadow:none!important;
 background:transparent!important;padding:12px 0 16px!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930PrayerHead h3,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930PrayerHead h3{
 font:500 clamp(19px,5vw,25px)/1.3 var(--ao-font-display,"EB Garamond",Georgia,serif)!important;
 color:var(--liturgical,#c8ad7b)!important;margin:5px 0 13px!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930Flip,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930Flip,
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930Text,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930Text{
 font:400 clamp(19px,5.1vw,24px)/1.65 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f4eddf)!important;letter-spacing:0!important;
 white-space:normal!important;overflow-wrap:break-word!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoP435930PrayerHead>span,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoP435930PrayerHead>span{display:none!important}
/* Rubrics and instructions: muted compact sans-serif, never prayer-like Georgia. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideNow,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideNow{
 padding:10px 0 0!important;margin:0!important;background:none!important;border:0!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideNow h2,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideNow h2,
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideNow small,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideNow small{display:none!important}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideNow p,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideNow p{
 margin:0!important;color:var(--muted,#afa89c)!important;
 font:400 clamp(12px,3.5vw,14px)/1.55 var(--ao-font-ui,system-ui,sans-serif)!important;
 letter-spacing:0!important;text-align:left!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideCue,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideCue{
 margin:4px 0 0!important;padding:9px 0 0!important;
 border:0!important;border-top:1px solid var(--border,rgba(255,255,255,.13))!important;
 background:transparent!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideCue small,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideCue small{
 color:var(--liturgical,#c5aa7b)!important;
 font:650 10px/1.35 var(--ao-font-ui,system-ui,sans-serif)!important;
 text-transform:uppercase!important;letter-spacing:.08em!important;
}
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll .aoP435930GuideCue p,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll .aoP435930GuideCue p{
 color:var(--muted,#afa89c)!important;
 font:400 12px/1.5 var(--ao-font-ui,system-ui,sans-serif)!important;
 margin:3px 0 0!important;letter-spacing:0!important;
}
/* The chapter timeline already names the stage; repeat neither its title nor 1/7
   above a prayer. Keep the action title on prayerless Blessing/Silence cards. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoCard:has(.aoP435930Prayer)>.aoDevoCardHead,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCard:has(.aoP435930Prayer)>.aoDevoCardHead{display:none!important}
/* A prayerless stage remains legible: silence, blessing and reposition are not blank cards. */
#aoPray435930 .aoP435930BenedictionReader .aoDevoCardScroll:not(:has(.aoP435930Prayer)) .aoP435930GuideNow p,
#aoPray435930 .aoP435930AdorationReader[data-ao-adoration-folio="v1"] .aoDevoCardScroll:not(:has(.aoP435930Prayer)) .aoP435930GuideNow p{
 font-size:clamp(14px,3.8vw,16px)!important;line-height:1.62!important;
 color:var(--text,#e6ddce)!important;
}


/* PRAY shared parity phase 2: Stations and Confession reuse the same one-tap
   session locale and quiet hierarchy. Their owners and cardinalities do not change. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="stations"]>.aoP435930Head,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="confession"]>.aoP435930Head{
 grid-template-columns:44px minmax(0,1fr) 44px 44px!important;
 align-items:center!important;gap:5px!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="stations"]>.aoP435930Head>div,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="confession"]>.aoP435930Head>div{
 min-width:0!important;overflow:hidden!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="stations"]>.aoP435930Head h1,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="confession"]>.aoP435930Head h1{
 overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;
 font-size:clamp(15px,4.2vw,21px)!important;line-height:1.2!important;
}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="stations"]>.aoP435930Head p,
#aoPray435930 .aoP435930Mount[data-ao-pray-view="confession"]>.aoP435930Head p{display:none!important}
/* Stations retains its original direction/verse/meditation/prayer order:
   source-based posture cues depend on paragraph scroll, so DO NOT reorder it. */
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideNow{
 padding:4px 0 2px!important;background:transparent!important;border:0!important;
}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideNow p,
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideCue p,
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930GuideNow p{
 color:var(--muted,#aaa49b)!important;
 font:400 clamp(12px,3.3vw,14px)/1.55 var(--ao-font-ui,system-ui,sans-serif)!important;
 letter-spacing:0!important;
}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideNow small,
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideCue small{
 font:650 10px/1.35 var(--ao-font-ui,system-ui,sans-serif)!important;
 letter-spacing:.07em!important;color:var(--liturgical,#c8ad7b)!important;
}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930StationConsider p{
 font:400 clamp(17px,4.5vw,21px)/1.6 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f1e7d7)!important;
}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930StationPrayer .aoP435930Flip,
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930VRLine{
 font:400 clamp(19px,5vw,23px)/1.65 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f1e7d7)!important;
}
/* Stations already names the episode in the fourteen-stage chapter rail:
   show its actual response and prayer instead of a duplicate numbered title. */
#aoPray435930 .aoP435930Mount[data-ao-pray-view="stations"] .aoP435930Stations .aoDevoCardHead{
 display:none!important;
}
#aoPray435930 .aoP435930Stations .aoP435930PrayerOptions{
 background:transparent!important;border:0!important;
 border-bottom:1px solid var(--border,rgba(255,255,255,.13))!important;
 border-radius:0!important;margin:0 0 4px!important;
}
#aoPray435930 .aoP435930Stations .aoP435930PrayerOptions>summary{
 min-height:44px!important;padding:5px 3px!important;
 color:var(--muted,#ada69c)!important;
 font:500 12px/1.4 var(--ao-font-ui,system-ui,sans-serif)!important;
}
#aoPray435930 .aoP435930Stations .aoP435930PrayerOptions>summary>small{
 color:var(--muted,#ada69c)!important;
 font:500 11px/1.35 var(--ao-font-ui,system-ui,sans-serif)!important;
}
#aoPray435930 .aoP435930Stations .aoP435930VRLine>button,
#aoPray435930 .aoP435930Stations .aoP435930StationPrayer .aoP435930Flip{
 font:400 clamp(19px,5vw,23px)/1.65 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f1e7d7)!important;
}
/* The chapter rail already identifies the active examination category. Do not
   repeat the numbered card heading and compete with the questions. */
#aoPray435930 .aoP435930ConfessionReader[data-ao-confession-dual-axis="true"] .aoDevoCardHead{
 display:none!important;
}
/* The sacramental preparation reader is NOT a text-only prayer: the questions
   are primary, while instructions, privacy notes and doctrine are secondary. */
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930ConfQuestions li,
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930ConfOneCard>p{
 font:400 clamp(18px,4.6vw,22px)/1.62 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f1e7d7)!important;
}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930Prayer{
 border:0!important;background:transparent!important;box-shadow:none!important;
}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930PrayerHead h3{
 font:500 clamp(19px,5vw,25px)/1.3 var(--ao-font-display,"EB Garamond",Georgia,serif)!important;
 color:var(--liturgical,#c8ad7b)!important;
}
#aoPray435930 .aoP435930ConfessionReader .aoDevoCardScroll .aoP435930Flip{
 font:400 clamp(19px,5.1vw,24px)/1.65 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f4eddf)!important;
}


/* Public Eucharistic rite is discoverable from the Adoration chooser, while
   its own source-owned seven-stage reader remains the only implementation. */
#aoPray435930 .aoAdorationChooser .aoAdorationPublicRiteLink{
 display:block!important;width:100%!important;text-align:left!important;
 min-height:54px!important;margin:9px 0 0!important;padding:12px 14px!important;
 border:1px solid var(--border,rgba(255,255,255,.12))!important;
 border-radius:10px!important;background:transparent!important;
 color:var(--text,#f1e7d7)!important;
 font:500 15px/1.35 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
}
#aoPray435930 .aoAdorationChooser .aoAdorationPublicRiteLink small{
 display:block!important;margin-top:5px!important;color:var(--muted,#aca69d)!important;
 font:400 11px/1.5 var(--ao-font-ui,system-ui,sans-serif)!important;
}

/* The generic dual-axis rule hides .aoP435930GuideNav; the private
   Litany's edition selector is a DIFFERENT control, never a duplicate
   chapter navigator. Keep it keyboard-accessible in a quiet disclosure. */
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoPrivateLitanyEditionChooser{
 margin:3px 0 10px;border-bottom:1px solid var(--border,rgba(255,255,255,.12));
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoPrivateLitanyEditionChooser>summary{
 display:flex;align-items:center;min-height:44px;cursor:pointer;
 font:500 14px/1.4 var(--ao-font-liturgical,Georgia,serif);
 color:var(--muted,#c8bdaa);
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-dual-axis="true"][data-ao-devotional-owner="litany"] .aoPrivateLitanyEditionChooser .aoBatch03LitanyUses.aoP435930GuideNav{
 display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;
 gap:8px!important;padding:7px 0 13px!important;margin:0!important;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoPrivateLitanyEditionChooser .aoBatch03LitanyUses button{
 min-height:44px!important;min-width:0;padding:8px 6px!important;
 font-size:12px!important;line-height:1.32!important;
 white-space:normal;overflow-wrap:break-word;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoPrivateLitanyEditionChooser>summary:focus-visible{
 outline:2px solid var(--liturgical,#d8bd7d);outline-offset:2px;
}
/* B38: the historical PRIVATE Litany is invocation-first, not a 1962
   public-liturgical edition. Preserve the existing source-owned chapter rail. */
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll{
 padding:14px 16px 25dvh 16px;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930LitanyPrayer{
 margin:0 0 16px;padding:0;border:0;box-shadow:none;background:transparent;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930LitanyVerses{
 display:grid;gap:12px;min-width:0;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930LitanyLine{
 font:400 clamp(18px,4.25vw,22px)/1.58 var(--ao-font-liturgical,"EB Garamond",Georgia,serif)!important;
 color:var(--text,#f1e7d7)!important;
 margin:0;overflow-wrap:break-word;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930GuideNow{
 margin-bottom:14px!important;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930GuideNow p{
 font-size:14px!important;line-height:1.45!important;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardHead{
 padding-block:9px 8px;
}
#aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoStop{
 min-height:48px;
}
@media(max-width:420px){
 #aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll{
  padding:12px 15px 24dvh;
 }
 #aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930GuideNow{
  margin-bottom:10px!important;padding-block:2px!important;
 }
 #aoPray435930 .aoP435930DevotionalGuidedReader[data-ao-devotional-owner="litany"] .aoDevoCardScroll .aoP435930GuideCue{
  margin-top:12px!important;
 }
}
@keyframes aoDevoCardEnter{from{opacity:.55;transform:translateX(5px)}to{opacity:1;transform:none}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoDevoCard{animation:none}#aoPray435930 .aoDevoParagraph{transition:none!important}}
`;
function installDevotionalDeckStyles(doc=globalThis.document){
 if(!doc||doc.getElementById("ao-devotional-card-deck-style"))return;
 const style=doc.createElement("style");style.id="ao-devotional-card-deck-style";
 style.textContent=DEVOTIONAL_CARD_DECK_CSS;
 (doc.head||doc.documentElement).append(style);
}
if(typeof document!=="undefined")installDevotionalDeckStyles(document);
