const css=`
#aoPray435930 .aoMercyReader,#aoPray435930 .aoMercyMethods{max-width:730px;margin:0 auto;padding:22px 20px 55px;line-height:1.65}
#aoPray435930 .aoMercyKicker{font:600 .82rem system-ui,sans-serif;letter-spacing:.13em;color:var(--ao-muted,#b7a89b);text-transform:uppercase}
#aoPray435930 .aoMercyPrayer{font:400 clamp(1.35rem,4vw,1.8rem)/1.65 Georgia,serif;white-space:normal;max-width:38ch;margin:24px auto 20px;padding:12px 0;color:var(--ao-ink,#eee6dc)}
#aoPray435930 .aoMercyReader h2{font:400 1.2rem Georgia,serif}
#aoPray435930 .aoMercyHelp{padding:14px 0;border-top:1px solid rgba(205,185,150,.2);font-style:italic;color:var(--ao-muted,#cbbfb2)}
#aoPray435930 .aoMercyNote{color:var(--ao-muted,#cbbfb2)}
#aoPray435930 .aoMercyControls{display:flex;align-items:center;justify-content:space-between;gap:8px;margin:25px 0}
#aoPray435930 .aoMercyControls button,#aoPray435930 .aoMercyOptions button,#aoPray435930 .aoMercyMethod button{min-height:44px;padding:10px 14px;color:inherit;border:1px solid rgba(205,185,150,.38);background:rgba(190,174,149,.07);border-radius:6px}
#aoPray435930 .aoMercyControls button:disabled{opacity:.35}
#aoPray435930 .aoMercyOptions{display:flex;flex-wrap:wrap;gap:8px}
/* Settings stay subordinate to the canonical prayer/verse reading card. */
#aoPray435930 .aoMercyOptional{margin:12px 0 5px;border:1px solid rgba(205,185,150,.24);border-radius:10px;background:rgba(190,174,149,.035)}
#aoPray435930 .aoMercyOptional>summary{min-height:48px;padding:11px 13px;display:flex;align-items:center;justify-content:space-between;gap:8px;cursor:pointer;font:600 13px/1.4 system-ui,sans-serif}
#aoPray435930 .aoMercyOptional>summary small{color:var(--liturgical,#d8bd7d);text-align:right;font:600 12px/1.4 system-ui,sans-serif}
#aoPray435930 .aoMercyOptional>summary:focus-visible{outline:2px solid var(--liturgical,#d8bd7d);outline-offset:3px}
#aoPray435930 .aoMercyOptional>.aoMercyOptions{padding:0 12px 12px}
#aoPray435930 .aoMercyOptional:not([open])>.aoMercyOptions{display:none!important}

#aoPray435930 .aoMercyOptions button[aria-pressed=true]{border-color:rgba(210,190,151,.85);background:rgba(210,190,151,.16)}
#aoPray435930 .aoMercySource{margin-top:22px;font-size:.82rem}
#aoPray435930 .aoMercySource a,#aoPray435930 .aoMercyMethods a{color:inherit;text-decoration:underline;text-underline-offset:3px}
#aoPray435930 .aoMercyBeads{display:flex;justify-content:center;gap:5px;margin:15px 0}
#aoPray435930 .aoMercyBeads i{width:9px;height:9px;border:1px solid rgba(205,185,150,.6);border-radius:50%}
#aoPray435930 .aoMercyBeads i.active{background:rgba(205,185,150,.85)}
#aoPray435930 .aoMercyMethod{padding:14px 0;border-top:1px solid rgba(205,185,150,.2)}
#aoPray435930 .aoMercyMethod small{display:block;color:var(--ao-muted,#cbbfb2)}

#aoPray435930 .aoRosaryChooser{display:flex;flex-direction:column;gap:24px}
#aoPray435930 .aoRosaryChoiceGrid{display:grid;grid-template-columns:1fr;gap:9px}
#aoPray435930 .aoRosaryChoice{display:flex;flex-direction:column;align-items:flex-start;text-align:left;width:100%;padding:13px 16px;background:transparent;border:1px solid rgba(205,185,150,.25);border-radius:8px;color:inherit;min-height:64px}
#aoPray435930 .aoRosaryChoice strong{font:500 1.08rem Georgia,serif}
#aoPray435930 .aoRosaryChoice small,#aoPray435930 .aoRosaryChooserOptions small{font:400 .87rem/1.45 system-ui,sans-serif;color:var(--ao-muted,#cbbfb2);margin-top:4px}
#aoPray435930 .aoRosaryChoice[aria-pressed=true],#aoPray435930 .aoMercyOptions button[aria-pressed=true]{border-color:rgba(210,190,151,.85);background:rgba(210,190,151,.13)}
#aoPray435930 .aoRosaryChooser .aoMercyOptions button{min-height:44px}
#aoPray435930 .aoRosaryChooser .aoMercyOptions button:disabled{opacity:.3}
#aoPray435930 .aoRosaryBegin{width:100%;padding:14px 18px;min-height:52px;border-radius:8px;border:1px solid rgba(210,190,151,.9);color:var(--ao-ink,#eee6dc);background:rgba(210,190,151,.17);font:500 1.1rem Georgia,serif}
#aoPray435930 .aoRosaryHeld{font-size:.86rem;color:var(--ao-muted,#cbbfb2);border-top:1px solid rgba(205,185,150,.2);padding-top:14px}
#aoPray435930 .aoRosaryChooser .aoMercySource small{display:block;margin-top:6px}
/* One primary recitation action; source and alternatives are always reachable.
   Existing donor Rosary player, prayer text and liturgical flow stay untouched. */
#aoPray435930 .aoRosaryChooser{gap:12px;padding-top:14px}
#aoPray435930 .aoRosaryReady{
  display:grid;gap:8px;min-width:0;
  padding:22px 18px 20px;border:1px solid rgba(205,185,150,.35);
  border-radius:14px;background:linear-gradient(160deg,rgba(205,185,150,.10),rgba(14,22,29,.25));
}
#aoPray435930 .aoRosaryReady .aoMercyKicker{margin:0;font-size:11px}
#aoPray435930 .aoRosaryReady h2{
  margin:0;color:var(--ao-ink,#eee6dc);
  font:500 clamp(24px,5vw,30px)/1.2 Georgia,serif
}
#aoPray435930 .aoRosaryReadyChoice{
  margin:0;font:600 13px/1.45 system-ui,sans-serif;color:var(--ao-ink,#eee6dc)
}
#aoPray435930 .aoRosaryReadyDescription{
  margin:1px 0 6px;color:var(--ao-muted,#cbbfb2);
  font:400 14px/1.55 system-ui,sans-serif
}
#aoPray435930 .aoRosaryReady .aoRosaryBegin{
  display:block;min-height:54px;margin-top:4px;font-size:19px
}
#aoPray435930 .aoRosarySourceCurrent{margin:0}
#aoPray435930 .aoRosarySourceCurrent a{
  display:inline-flex;align-items:center;min-height:44px;
  color:var(--ao-muted,#cbbfb2);font:500 12px/1.4 system-ui,sans-serif;
  text-decoration:underline;text-underline-offset:3px
}
#aoPray435930 .aoRosarySourceCurrent small{
  display:block;font:400 12px/1.4 system-ui,sans-serif;color:var(--ao-muted,#cbbfb2)
}
#aoPray435930 .aoRosaryCustomizeToggle{
  width:100%;min-height:50px;padding:12px 14px;display:flex;
  align-items:center;justify-content:space-between;gap:12px;
  border:1px solid rgba(205,185,150,.26);border-radius:10px;
  color:var(--ao-ink,#eee6dc);background:rgba(205,185,150,.045);
  text-align:left;font:600 13px/1.4 system-ui,sans-serif
}
#aoPray435930 .aoRosaryCustomizeToggle span{font-size:20px;line-height:1;color:var(--ao-muted,#cbbfb2)}
#aoPray435930 .aoRosaryCustomizeToggle[aria-expanded="true"]{border-color:rgba(205,185,150,.55)}
#aoPray435930 .aoRosaryCustomPanel{display:grid;gap:18px;padding:10px 0 0}
#aoPray435930 .aoRosaryCustomPanel[hidden]{display:none!important}
#aoPray435930 .aoRosaryCustomizeToggle:focus-visible,
#aoPray435930 .aoRosaryReady .aoRosaryBegin:focus-visible,
#aoPray435930 .aoRosaryChoice:focus-visible{
  outline:2px solid var(--ao-liturgical-accent,#d9bd85);outline-offset:3px
}
@media(max-width:430px){
 #aoPray435930 .aoRosaryReady{padding:18px 14px 16px}
 #aoPray435930 .aoRosaryReady h2{font-size:25px}
}

/* Divine Mercy: authentic large/small bead strand; no numbers-as-chapters. */
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader]{padding:10px 14px 35px}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoMercyKicker,
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader]>.aoMercyStepType,
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader]>.aoMercyBeads,
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoDevoCardNumber,
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoDevoSequenceTimeline{display:none!important}
#aoPray435930 .aoMercyBeadNavigation{
 display:grid;gap:7px;padding:0 3px 11px;margin:0 0 8px;
 border-bottom:1px solid color-mix(in srgb,var(--liturgical,#b9a17d) 25%,transparent)
}
#aoPray435930 .aoMercyPhases{display:flex;align-items:center;justify-content:space-between;gap:2px;min-width:0}
#aoPray435930 .aoMercyPhaseLink{
 flex:0 0 auto;min-height:44px;padding:7px 4px;border:0;border-radius:5px;background:transparent;
 color:var(--ao-muted,#a9a19a);font:italic 11px/1.25 Georgia,serif;text-align:center
}
#aoPray435930 .aoMercyPhaseLink[aria-current=step]{color:var(--ao-ink,#eee3d3);text-decoration:underline;text-decoration-color:var(--liturgical,#bda079);text-underline-offset:5px}
#aoPray435930 .aoMercyDecades{display:flex;align-items:center;justify-content:space-around;flex:1 1 auto;min-width:0;gap:1px}
#aoPray435930 .aoMercyDecadeLink{
 display:grid;place-items:center;flex:1 1 40px;max-width:48px;height:44px;min-width:28px;
 position:relative;border:0;border-radius:5px;background:transparent;
 color:var(--ao-muted,#8e8c89);font:12px/1.2 Georgia,serif
}
#aoPray435930 .aoMercyDecadeLink:after{
 content:"";position:absolute;bottom:4px;left:50%;transform:translateX(-50%);
 width:3px;height:3px;border-radius:50%;background:color-mix(in srgb,var(--liturgical,#b9a17d) 35%,transparent)
}
#aoPray435930 .aoMercyDecadeLink[data-status=active]{color:var(--ao-ink,#f0e4d3)}
#aoPray435930 .aoMercyDecadeLink[data-status=active]:after{width:6px;height:6px;background:var(--liturgical,#d6b780)}
#aoPray435930 .aoMercyDecadeLink[data-status=prayed]{color:var(--liturgical,#bd9f73)}
#aoPray435930 .aoMercyBeadPosition{display:flex;justify-content:space-between;align-items:baseline;gap:8px}
#aoPray435930 .aoMercyBeadPosition>span{font:italic 13px/1.3 Georgia,serif;color:var(--ao-ink,#e9dcc8)}
#aoPray435930 .aoMercyBeadPosition>small{font:11px/1.3 system-ui,sans-serif;color:var(--ao-muted,#aea49c)}
#aoPray435930 .aoMercyStrand{
 position:relative;isolation:isolate;display:flex;justify-content:space-between;align-items:center;
 gap:0;min-height:48px;padding:0
}
#aoPray435930 .aoMercyStrand:before{
 content:"";position:absolute;left:4.6%;right:4.6%;top:50%;z-index:0;pointer-events:none;
 border-top:1px solid color-mix(in srgb,var(--liturgical,#b8a27c) 42%,transparent)
}
#aoPray435930 .aoMercyBeadButton{
 position:relative;z-index:1;display:grid;place-items:center;flex:1 1 0;
 min-width:0;max-width:44px;height:44px;border:0;border-radius:6px;
 background:transparent;padding:0
}
#aoPray435930 .aoMercyBeadButton:before{
 content:"";display:block;width:7px;height:7px;border-radius:50%;
 border:1px solid color-mix(in srgb,var(--liturgical,#b9a17d) 58%,#626066);
 background:var(--surface-1,#151c24);box-shadow:inset 0 0 3px #0004
}
#aoPray435930 .aoMercyBeadButton[data-bead="0"]:before{width:13px;height:13px;border-width:1.5px}
#aoPray435930 .aoMercyBeadButton[data-status=prayed]:before{
 background:color-mix(in srgb,var(--liturgical,#c0a37a) 36%,#26303b);border-color:var(--liturgical,#c0a37a)
}
#aoPray435930 .aoMercyBeadButton[data-status=active]:before{
 width:10px;height:10px;background:var(--liturgical,#cdb489);border:2px solid var(--ao-ink,#efe5d5);
 box-shadow:0 0 0 3px color-mix(in srgb,var(--liturgical,#be9c66) 13%,transparent)
}
#aoPray435930 .aoMercyBeadButton[data-status=active][data-bead="0"]:before{width:16px;height:16px}
#aoPray435930 .aoMercyBeadButton:focus-visible,
#aoPray435930 .aoMercyDecadeLink:focus-visible,
#aoPray435930 .aoMercyPhaseLink:focus-visible{outline:2px solid var(--liturgical,#ba9e71);outline-offset:2px}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoDevoCardHead{padding:9px 12px 8px}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoDevoCardScroll{
 padding:12px clamp(11px,3vw,25px) 110px;max-height:min(45dvh,430px);min-height:min(185px,30dvh)
}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoDevoCardTitle{font:400 clamp(21px,5.7vw,27px)/1.15 Georgia,serif}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoMercyLine{margin:0 0 12px}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoMercyLine>small{font:italic 12px/1.3 Georgia,serif;opacity:.75}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoMercyControls{margin:12px 0}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoMercyControls span{font:italic 12px/1.3 Georgia,serif;text-align:center;color:var(--ao-muted,#a99f96)}
#aoPray435930 .aoMercyReader[data-ao-mercy-bead-reader] .aoMercyNote{margin:8px 2px;font-size:12px}
@media(max-width:350px){
 #aoPray435930 .aoMercyPhaseLink{font-size:10px;padding-inline:2px}
 #aoPray435930 .aoMercyDecadeLink{min-width:27px;font-size:11px}
 #aoPray435930 .aoMercyBeadNavigation{padding-inline:0}
}
@media(min-width:650px){#aoPray435930 .aoRosaryChoiceGrid{grid-template-columns:1fr 1fr}}
@media(prefers-reduced-motion:reduce){#aoPray435930 .aoMercyReader *{animation:none!important;transition:none!important}}
`;
if(typeof document!=="undefined"&&!document.getElementById("ao-pray-devotional-method-styles")){
 const n=document.createElement("style");n.id="ao-pray-devotional-method-styles";n.textContent=css;document.head.appendChild(n);
}
export const DEVOTIONAL_METHOD_STYLES_V1=true;
