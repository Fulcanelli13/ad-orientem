// Non-owning shared devotional card layout, loaded after legacy PRAY CSS.
export const DEVOTIONAL_CARD_DECK_CSS=String.raw`
#aoPray435930 .aoDevoDeck{display:block!important;width:100%;min-width:0;gap:0!important}
#aoPray435930 .aoDevoTimeline{display:grid;grid-template-columns:44px minmax(0,1fr) 44px;gap:5px;align-items:center;min-height:58px;padding:6px 2px;background:var(--bg,#080c12);border-block:1px solid var(--border,rgba(255,255,255,.12));position:sticky;top:74px;z-index:16}
#aoPray435930 .aoDevoStops{display:flex;gap:5px;overflow-x:auto;scrollbar-width:none;overscroll-behavior-x:contain;scroll-snap-type:x proximity}
#aoPray435930 .aoDevoStops::-webkit-scrollbar{display:none}
#aoPray435930 .aoDevoStop{scroll-snap-align:center;display:grid;gap:2px;flex:0 0 max(112px,42%);padding:8px 9px;border:1px solid var(--border,rgba(255,255,255,.14));border-radius:9px;color:var(--muted,#aeb2b8);background:var(--surface-1,#141a20);text-align:left;min-height:48px}
#aoPray435930 .aoDevoStop.active{border-color:var(--liturgical,#d8bd7d);color:var(--text,#f1e7d7);background:color-mix(in srgb,var(--liturgical,#d8bd7d) 9%,var(--surface-1,#141a20))}
#aoPray435930 .aoDevoStopNumber{font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.12em}
#aoPray435930 .aoDevoStopTitle{font:500 12px/1.25 Georgia,serif}
#aoPray435930 .aoDevoNavArrow{min-width:42px;min-height:46px;color:var(--text,#f1e7d7);background:transparent;border:1px solid var(--border,rgba(255,255,255,.12));border-radius:8px;font:22px/1 Georgia,serif}
#aoPray435930 .aoDevoNavArrow:disabled{opacity:.23}
#aoPray435930 .aoDevoCardViewport{min-width:0;width:100%}
#aoPray435930 .aoDevoCard[hidden]{display:none!important}
#aoPray435930 .aoDevoCard{display:flex;flex-direction:column;min-width:0;animation:aoDevoCardEnter .24s ease both}
#aoPray435930 .aoDevoCardHead{text-align:center;padding:15px 14px 12px;border-bottom:1px solid var(--border,rgba(255,255,255,.12))}
#aoPray435930 .aoDevoCardNumber{font:600 10px/1.4 system-ui,sans-serif;color:var(--muted,#aeb2b8);letter-spacing:.12em}
#aoPray435930 .aoDevoCardTitle{font:500 clamp(23px,5.6vw,30px)/1.18 Georgia,serif;color:var(--text,#f1e7d7);margin:4px 0}
#aoPray435930 .aoDevoCardLatin{font:italic 12px/1.45 Georgia,serif;color:var(--muted,#aeb2b8);margin:0}
#aoPray435930 .aoDevoCardScroll{height:min(55dvh,540px);min-height:min(320px,48dvh);overflow-y:auto;overscroll-behavior-y:contain;scrollbar-width:thin;padding:22px 14px 26dvh;box-sizing:border-box;display:flex;flex-direction:column;gap:22px}
#aoPray435930 .aoP435930Mount[data-ao-pray-view="angelus"] .aoDevoCardScroll .aoP435930PrayerUnit{flex:0 0 auto;min-height:0;opacity:1!important;transform:none!important;margin:0!important;border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important}
#aoPray435930 .aoDevoCardScroll .aoP435930PrayerUnit>small{display:none!important}
#aoPray435930 .aoDevoCardScroll .aoP435930PrayerUnit button{font:400 clamp(17px,4.4vw,21px)/1.6 Georgia,serif!important;text-align:left}
#aoPray435930 .aoDevoCardScroll .aoAngelusDialogueLine{display:flex;align-items:flex-start;gap:9px;padding:8px 2px;border:0!important;background:none!important}
#aoPray435930 .aoDevoCardScroll .ao-liturgical-speaker{flex:0 0 26px;font:600 18px/1.5 Georgia,serif;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoDevoParagraph{opacity:var(--ao-devo-focus,.5)!important;transition:opacity .22s ease!important}
#aoPray435930 .aoDevoCardScroll .aoP435930PrayerUnit.aoDevoParagraph{opacity:var(--ao-devo-focus,.5)!important}
#aoPray435930 .aoDevoParagraph[data-ao-devo-active="true"]{color:var(--text,#f1e7d7)!important}
#aoPray435930 .aoDevoCardScroll .aoDevoAppendixLine{display:block;padding:8px 0}
#aoPray435930 .aoDevoCardScroll .aoDevoAppendixUnit [data-face-v],#aoPray435930 .aoDevoCardScroll .aoDevoAppendixUnit [data-face-la]{display:block}
#aoPray435930 .aoDevoCardScroll [data-face-v][hidden],#aoPray435930 .aoDevoCardScroll [data-face-la][hidden]{display:none!important}

/* Shared Stations/Mercy reader: the prayer text scrolls, never the title rail. */
#aoPray435930 .aoDevoSequenceTimeline{display:grid!important;grid-template-columns:44px minmax(0,1fr) 44px!important;gap:5px!important;align-items:center;max-width:100%;width:100%;min-width:0;overflow:visible!important;position:sticky;top:74px;z-index:19;background:var(--bg,#080c12);padding:5px 2px!important;border-block:1px solid var(--border,rgba(255,255,255,.14))}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStops{min-width:0;display:flex!important;overflow-x:auto!important;max-width:100%;padding:0!important}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStop{flex:0 0 max(116px,42%)!important;min-height:54px;max-width:none;margin:0!important;display:grid!important;align-content:center}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStopTitle{font:500 12px/1.22 Georgia,serif;white-space:normal}
#aoPray435930 .aoDevoSequenceTimeline .aoDevoStopNumber{font:600 10px/1.1 system-ui,sans-serif}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll{padding:18px 16px 27dvh;display:block;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll>*{margin-block:0 22px}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930GuideNow h2{display:none!important}
#aoPray435930 .aoMercyStepType{display:block;margin:4px 14px;color:var(--muted,#aeb2b8);font:500 12px/1.4 Georgia,serif}
#aoPray435930 .aoP435930Stations .aoDevoCardScroll .aoP435930Flip{max-width:100%;white-space:normal}
#aoPray435930 .aoMercyReader .aoDevoCardScroll{gap:18px;padding:18px 14px 30dvh;min-height:min(350px,52dvh)}
#aoPray435930 .aoMercyLine{display:block;flex:0 0 auto;min-width:0;margin:0!important;padding:18px 8px;border-bottom:1px solid var(--border,rgba(255,255,255,.10));background:transparent!important;box-shadow:none!important;transform:none!important;min-height:unset!important;border-radius:0!important;text-align:left}
#aoPray435930 .aoMercyLine p{font:400 clamp(18px,4.5vw,22px)/1.62 Georgia,serif;margin:8px 0 0;color:var(--text,#f1e7d7)}
#aoPray435930 .aoMercyLine small{font:600 11px/1.4 system-ui,sans-serif;letter-spacing:.08em;color:var(--liturgical,#d8bd7d)}
#aoPray435930 .aoMercyReader .aoMercyCurrentGroup{font:500 13px/1.5 Georgia,serif;color:var(--muted,#aeb2b8);margin:6px 0 10px}
#aoPray435930 .aoMercyReader .aoMercyKicker{font-size:11px;margin:4px 0}
#aoPray435930 .aoMercyReader .aoDevoCardTitle{font-size:clamp(23px,5.6vw,30px)}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoMercyLine{transition:none!important}}


/* Individual Prayer Library entries use one named card and source-owned flip. */
#aoPray435930 .aoP435930LibraryReader{min-width:0}
#aoPray435930 .aoP435930LibraryReader .aoDevoCardScroll{display:block;padding:16px 15px 28dvh;min-height:min(350px,52dvh)}
#aoPray435930 .aoP435930LibraryReader .aoP435930Prayer{border:0!important;background:transparent!important;box-shadow:none!important;padding:0!important;margin:0}
#aoPray435930 .aoP435930LibraryReader .aoP435930PrayerHead{display:none!important}
#aoPray435930 .aoP435930LibraryReader .aoP435930Flip,
#aoPray435930 .aoP435930LibraryReader .aoP435930Text{font:400 clamp(18px,4.5vw,22px)/1.65 Georgia,serif!important;text-align:left;white-space:normal;max-width:100%}
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
#aoPray435930 .aoP435930BenedictionReader[data-ao-benediction-dual-axis="true"][data-ao-benediction-step="6"] .aoP435930GuideNav{display:flex!important}
#aoPray435930 .aoP435930BenedictionReader[data-ao-benediction-dual-axis="true"][data-ao-benediction-step="6"] [data-p435930-ben-prev]{display:none!important}
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
 margin:0;font:400 1rem/1.67 var(--ao-font-liturgical,Georgia,serif)}
#aoPray435930 .aoP435930DevotionalGuidedReader .aoDevoCardScroll .aoP435930WitnessParagraph{
 font:400 1rem/1.67 var(--ao-font-liturgical,Georgia,serif);margin:0 0 14px}
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
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStopNumber{font:600 10px/1.2 system-ui,sans-serif;letter-spacing:.12em}
#aoPrayerBookRoot.open .aoRosaryNamedTimeline .aoDevoStopTitle{font:500 12px/1.25 Georgia,serif;white-space:normal}

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
