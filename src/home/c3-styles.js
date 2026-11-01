export const HOME_C3_CSS=String.raw`/* C3 Living Gallery extends (does not replace) the approved H7 Mass door. */
.aoH7Screens .aoH7HomeView .aoH7Hero[data-c3-orientation="landscape"]{height:clamp(420px,115vw,520px)!important}
.aoH7Screens .aoH7HomeView .aoH7Hero[data-c3-orientation="balanced"]{height:clamp(460px,135vw,555px)!important}
.aoH7Screens .aoH7HomeView .aoH7Hero[data-c3-orientation="portrait"]{height:clamp(535px,155vw,630px)!important}
.aoH7Screens .aoH7Hero .aoTodayV2ArtSource img{object-position:var(--ao-c3-x,50%) var(--ao-c3-y,30%)!important;transform:scale(var(--ao-c3-zoom,1.075));transform-origin:center;object-fit:cover}
.aoH7Screens .aoH7Hero .aoTodayV2Art{overflow:hidden}
.aoH7Screens .aoC3MassInfo{position:absolute;right:var(--g);top:50px;z-index:6}
.aoH7Screens .aoC3Info{width:44px;height:44px;display:grid;place-items:center;border:0;background:transparent;color:#fff;cursor:pointer;z-index:6}
.aoH7Screens .aoC3Info[hidden]{display:none!important}
.aoH7Screens .aoC3Info span{display:grid;place-items:center;width:25px;height:25px;border:1px solid #fffa;border-radius:50%;background:#090e11b8;font:italic 600 15px/1 Georgia,serif}
.aoH7Screens .aoC3Info:focus-visible{outline:2px solid var(--sage);outline-offset:-4px;border-radius:50%}
.aoH7Screens .aoH7HomeView .aoC3PrayerFrame{overflow:hidden;position:relative;border-radius:16px;border:1px solid var(--ln);background:var(--sf)}
.aoH7Screens .aoC3PrayerSlide{position:relative;isolation:isolate;min-height:214px;background:radial-gradient(ellipse at 85% 20%,#74614d50,transparent 60%),linear-gradient(135deg,#15221e,#171a18 75%);color:#fff}
.aoH7Screens .aoC3PrayerSlide[hidden]{display:none!important}
.aoH7Screens .aoC3PrayerArt{position:absolute;inset:0;background-size:cover;background-position:center}
.aoH7Screens .aoC3PrayerSlide::before{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#080d10de,#080d1060 65%,#080d1020);z-index:1;pointer-events:none}
.aoH7Screens .aoH7HomeView .aoC3PrayerAction,.aoH7Screens .aoH7HomeView .aoH4Prayer.np.aoC3PrayerAction{position:relative!important;z-index:2;width:100%!important;min-height:214px!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important;color:#fff!important;display:flex!important;align-items:flex-start!important;justify-content:flex-end!important;flex-direction:column!important;gap:7px!important;padding:22px 60px 20px 18px!important;text-align:left!important}
.aoH7Screens .aoC3PrayerAction strong{font:500 26px/1.1 var(--serif)!important;color:white!important}
.aoH7Screens .aoC3PrayerAction small{font:13px/1.35 var(--sans)!important;color:#f0e9dc!important}
.aoH7Screens .aoC3PrayerRole{font:600 11px/1.2 var(--sans);text-transform:uppercase;letter-spacing:.11em;color:#bcd9bd}
.aoH7Screens .aoC3Arrow{position:absolute;right:19px;bottom:20px;font:26px/1 var(--serif)}
.aoH7Screens .aoC3PrayerSlide>.aoC3Info{position:absolute;top:7px;right:7px;z-index:6}
.aoH7Screens .aoC3PrayerPager{height:36px;display:flex;justify-content:center;align-items:center;background:var(--sf)}
.aoH7Screens .aoC3PrayerPager button{min-width:44px;height:36px;display:grid;place-items:center;border:0;background:transparent;cursor:pointer}
.aoH7Screens .aoC3PrayerPager button span{width:7px;height:7px;border-radius:50%;background:var(--mu);opacity:.65}
.aoH7Screens .aoC3PrayerPager button[aria-current="true"] span{background:var(--ink);opacity:1}
.aoH7Screens .aoH4Upcoming.wkc .aoC3UpcomingCard{position:relative;flex:0 0 152px;scroll-snap-align:start;overflow:hidden;border:1px solid var(--ln);border-radius:12px;background:var(--sf)}
.aoH7Screens .aoH4Upcoming.wkc .aoC3UpcomingArt{height:106px;overflow:hidden;background:linear-gradient(145deg,#343f36,#161e1b 70%)}
.aoH7Screens .aoC3UpcomingArt img{width:100%;height:100%;object-fit:cover;object-position:center 35%;transform:scale(1.075)}
.aoH7Screens .aoH4Upcoming.wkc .aoC3UpcomingCard .aoTodayV2Event{width:100%!important;min-height:103px!important;flex:none!important;border:0!important;border-radius:0!important;padding:9px 11px!important;position:relative}
.aoH7Screens .aoC3UpcomingCard .aoTodayV2Event strong{margin:6px 0 0!important;max-height:3.6em;overflow:hidden}
.aoH7Screens .aoC3UpcomingCard .aoTodayV2Event small{margin-top:5px!important}
.aoH7Screens .aoC3WeekArrow{position:absolute;right:9px;bottom:7px;font-size:20px}
.aoH7Screens .aoC3UpcomingCard>.aoC3Info{position:absolute;top:0;right:0}
.aoH7Screens .aoC3ArtDialog{width:min(92vw,540px);max-height:86dvh;overflow:auto;border:1px solid var(--ln);border-radius:16px;padding:16px;background:var(--sf);color:var(--ink)}
.aoH7Screens .aoC3ArtDialog::backdrop{background:#05070bd9}
.aoH7Screens .aoC3ArtDialog img{display:block;width:100%;max-height:54dvh;object-fit:contain;background:#0b0b0b;border-radius:9px}
.aoH7Screens .aoC3ArtDialog h2{font:500 22px/1.2 var(--serif);margin:12px 0 4px}
.aoH7Screens .aoC3ArtDialog p{font:13px/1.4 var(--sans);color:var(--mu);margin:0 0 12px}
.aoH7Screens .aoC3ArtDialog a{color:var(--sage)}
.aoH7Screens .aoC3ArtDialog button{min-height:44px;border:1px solid var(--ln);background:var(--sf2);color:var(--ink);padding:0 16px;margin:10px 0;border-radius:8px}
@media(max-width:359px){.aoH7Screens .aoH7HomeView .aoH7Hero[data-c3-orientation="portrait"]{height:530px!important}.aoH7Screens .aoC3PrayerSlide,.aoH7Screens .aoH7HomeView .aoC3PrayerAction,.aoH7Screens .aoH7HomeView .aoH4Prayer.np.aoC3PrayerAction{min-height:196px!important}.aoH7Screens .aoH4Upcoming.wkc .aoC3UpcomingCard{flex-basis:142px}}

/* C3 nested Week controls must override inherited H7 general button dimensions. */
.aoH7Screens .aoH7HomeView .aoH4Upcoming.wkc .aoC3UpcomingCard>.aoC3Info{
 position:absolute!important;right:0!important;top:0!important;z-index:6!important;
 display:grid!important;place-items:center!important;flex:none!important;min-width:44px!important;
 width:44px!important;height:44px!important;min-height:44px!important;
 padding:0!important;border:0!important;border-radius:0!important;background:transparent!important
}
.aoH7Screens .aoH7HomeView .aoH4Upcoming.wkc .aoC3UpcomingCard>.aoC3Info[hidden]{display:none!important}

/* The original source-owned Calendar Class I artwork is also authoritative
   for today's Home hero. Crop just the image; attribution stays legible. */
.aoH7Screens .aoH7Hero .aoC3DatedImage{display:block;width:100%;height:100%;object-fit:cover;object-position:var(--ao-c3-x,50%) var(--ao-c3-y,30%);transform:scale(var(--ao-c3-zoom,1.075));transform-origin:center}
.aoH7Screens .aoH7Hero .aoC3DatedCredit{position:absolute;left:0;right:0;bottom:0;z-index:3;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:14px 16px;background:linear-gradient(transparent,rgba(5,12,15,.93));color:#eee;font:12px/1.3 Georgia,serif}
.aoH7Screens .aoH7Hero .aoC3DatedCredit span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.aoH7Screens .aoH7Hero .aoC3DatedCredit a{flex:none;color:#eee;white-space:nowrap;text-decoration:underline;text-underline-offset:3px}
`;
