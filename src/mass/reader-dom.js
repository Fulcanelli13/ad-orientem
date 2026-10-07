import { normalizePresentationMode } from "./session-engine.js";

export const SCHOLA_SPEEDS=Object.freeze([0.25,0.35,0.45,0.60,0.80,1.00]);
export const DEFAULT_SCHOLA_SPEED=0.45;
export const SCHOLA_SPEED_STORAGE_KEY="ao-schola-speed";

export function normalizeScholaSpeed(value){
  const n=Number(value);
  return SCHOLA_SPEEDS.includes(n) ? n : DEFAULT_SCHOLA_SPEED;
}

export function scholaTickerDuration({viewportWidth=0,lineWidth=0,speed=DEFAULT_SCHOLA_SPEED,isMobile=false}={}){
  const vw=Math.max(0,Number(viewportWidth)||0);
  const lw=Math.max(0,Number(lineWidth)||0);
  const travel=Math.max(vw+lw+80,260);
  const baseSpeed=isMobile ? 34 : 40;
  const pixelsPerSecond=Math.max(7,baseSpeed*normalizeScholaSpeed(speed));
  return Math.max(15000,Math.min(120000,(travel/pixelsPerSecond)*1000));
}

const SHELL_STYLE = `
.ao-reader-shell{
  --ao-bg:#0d120f;--ao-panel:#141c17;--ao-panel2:#19231d;
  --ao-line:rgba(238,241,233,.13);--ao-muted:#a9afa7;--ao-dim:#6f766f;
  --ao-text:#eef1e9;--ao-accent:#6d9575;--ao-warm:#d6caa6;--ao-response:#c8d9e9;
  --ao-rail:62px;--ao-content-max:820px;--ao-schola-height:150px;--ao-schola-reserve:0px;
  box-sizing:border-box;position:relative;display:grid;grid-template-rows:auto auto minmax(0,1fr);
  width:100%;height:100%;min-height:0;overflow:hidden;
  background:linear-gradient(180deg,#0c120e 0,#101711 100%);color:var(--ao-text);
  font-family:var(--ao-font-ui,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif)
}
.ao-reader-shell *{box-sizing:border-box}
.ao-reader-top-ribbon{
  position:relative;z-index:12;display:grid;grid-template-columns:56px minmax(0,1fr) 56px;align-items:center;
  height:56px;min-height:56px;gap:4px;padding:4px 6px;
  background:rgba(6,10,8,.975);border-bottom:1px solid rgba(255,255,255,.045)
}
.ao-reader-top-action{
  appearance:none;border:0;background:transparent;color:#d7dfd8;display:grid;place-items:center;
  width:46px;height:46px;margin:auto;padding:0;border-radius:12px
}
.ao-reader-top-action:active,.ao-reader-top-action:focus-visible{background:rgba(255,255,255,.055);outline:none}
.ao-reader-top-action .ao-reader-top-copy{font:700 .52rem/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em}
.ao-reader-top-icon{display:block;width:29px;height:29px;color:currentColor}
.ao-reader-top-icon svg{display:block;width:100%;height:100%}
.ao-section-jump{
  appearance:none;border:0;background:transparent;color:#f1f3ee;min-width:0;height:46px;padding:0 8px;
  display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;
  font:600 15px/1.1 var(--ao-font-display,Georgia,"Times New Roman",serif);letter-spacing:.015em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
.ao-section-jump [data-role="section-title"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ao-section-caret{font:500 16px/1 var(--ao-font-ui,system-ui,sans-serif);color:#78867b}

.ao-mass-prefs{
  position:absolute;z-index:34;top:58px;right:8px;width:min(310px,calc(100% - 16px));
  padding:13px;border:1px solid rgba(255,255,255,.075);border-radius:14px;
  background:rgba(8,13,10,.985);box-shadow:0 18px 60px rgba(0,0,0,.5);
  opacity:0;visibility:hidden;pointer-events:none;transform:none;transition:opacity .14s ease,visibility 0s linear .14s
}
.ao-mass-prefs[data-open="true"]{opacity:1;visibility:visible;pointer-events:auto;transform:none;transition:opacity .14s ease}
.ao-mass-prefs-head{display:flex;justify-content:space-between;align-items:center;color:#e3e8e3;font:600 15px var(--ao-font-display,Georgia,serif)}
.ao-mass-prefs-close{appearance:none;border:0;background:transparent;color:#89958c;font-size:22px;line-height:1;padding:3px 5px}
.ao-mass-prefs-group{margin-top:14px}
.ao-mass-prefs-group>small{display:block;margin-bottom:7px;color:#6e7a72;font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;text-transform:uppercase}
.ao-mode-ribbon{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.ao-mode-ribbon button{
  appearance:none;border:0;background:transparent;color:#929a93;min-width:0;height:44px;padding:4px 0;
  font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em
}
.ao-mode-ribbon button>span{
  height:36px;display:grid;place-items:center;padding:0 7px;border:1px solid rgba(255,255,255,.07);
  border-radius:9px;background:rgba(255,255,255,.025);pointer-events:none
}
.ao-mode-ribbon button[aria-pressed="true"]>span{background:#26342b;color:#fbfbf5;border-color:rgba(140,174,149,.22)}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button{cursor:default}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button:not([aria-pressed="true"]){opacity:.34}
.ao-mass-prefs-more{
  width:100%;margin-top:12px;min-height:36px;border:1px solid rgba(255,255,255,.07);border-radius:9px;
  background:#0d130f;color:#c4ccc5;font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase
}

.ao-state-ribbon{
  position:relative;z-index:11;display:grid;
  grid-template-columns:minmax(0,1fr) minmax(90px,.72fr) minmax(0,1fr);
  align-items:stretch;gap:1px;height:64px;min-height:64px;padding:0;
  background:rgba(255,255,255,.035);border:0
}
.ao-state-cell{
  position:relative;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px;
  padding:5px 9px;background:rgba(7,12,9,.96);color:#9ca69e;overflow:visible
}
.ao-state-cell[data-side="faithful"]{justify-content:center}
.ao-state-cell[data-side="priest"]{justify-content:center;border-left:1px solid rgba(255,255,255,.035)}
.ao-state-cell[data-side="priest"] .ao-state-label{max-width:132px}
.ao-state-kicker{font:700 7px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:#657268}
.ao-state-copy{min-width:0;display:flex;flex-direction:column}
.ao-state-label{
  max-width:142px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:600 10px/1.15 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.045em;color:#c9d1ca
}
.ao-state-cell>.ao-icon-mask{width:52px;height:52px;flex:0 0 52px;color:#d6dfd7}
.ao-state-guide{
  appearance:none;border:0;border-left:1px solid rgba(255,255,255,.035);border-right:1px solid rgba(255,255,255,.035);
  background:rgba(9,15,11,.98);color:#d6dfd7;display:flex;align-items:center;justify-content:center;gap:8px;
  min-width:0;padding:5px 8px;cursor:pointer;font:inherit;transition:background .18s ease,color .18s ease,box-shadow .18s ease
}
.ao-state-guide:hover,.ao-state-guide:focus-visible{background:rgba(37,52,41,.92);color:#f2f4ef;outline:none;box-shadow:inset 0 0 0 1px rgba(174,194,179,.10)}
.ao-state-guide:disabled{opacity:.34}
.ao-guide-icon{width:32px;height:32px;display:grid;place-items:center;flex:0 0 32px;color:currentColor}
.ao-guide-icon svg{width:29px;height:29px;display:block}
.ao-guide-copy{display:flex;min-width:0;flex-direction:column;align-items:flex-start;gap:2px;text-align:left}
.ao-guide-copy small{font:700 7px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;color:#77847a}
.ao-guide-short{display:block;max-width:92px;font:600 8px/1.05 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.045em;color:#d5ddd6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ao-priest-action-badge{
  position:absolute;right:4px;top:3px;width:27px;height:27px;border-radius:50%;display:grid;place-items:center;
  background:rgba(10,15,12,.96);border:1px solid rgba(212,225,215,.20);box-shadow:0 4px 14px rgba(0,0,0,.28);
  opacity:0;transform:scale(.78);transition:opacity .16s ease,transform .18s ease,width .18s ease,height .18s ease;
  pointer-events:none;z-index:4;color:#e5eee8
}
.ao-priest-action-badge[data-active="true"]{opacity:1;transform:scale(1)}
.ao-priest-action-badge[data-major="true"]{width:42px;height:42px;right:-2px;top:-5px;border-color:rgba(225,207,145,.44);box-shadow:0 0 0 5px rgba(225,207,145,.055),0 7px 22px rgba(0,0,0,.32)}
.ao-priest-action-badge .ao-icon-mask{width:86%;height:86%}
.ao-icon-mask{
  width:24px;height:24px;flex:0 0 24px;background:currentColor;
  mask-repeat:no-repeat;mask-position:center;mask-size:contain;
  -webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain
}
.ao-icon-mask.ao-icon-direct{
  background-color:transparent!important;background-repeat:no-repeat;background-position:center;background-size:contain;
  -webkit-mask-image:none!important;mask-image:none!important;
  filter:brightness(0) saturate(100%) invert(94%) sepia(9%) saturate(263%) hue-rotate(353deg) brightness(104%) contrast(91%)
}
.ao-progress-track{position:absolute;z-index:13;left:0;right:0;top:120px;height:2px;background:rgba(255,255,255,.05)}
.ao-progress-track>span{display:block;height:100%;width:0;background:#6d9575;transition:width .18s linear}

.ao-section-menu{
  position:absolute;z-index:33;top:58px;left:50%;transform:translateX(-50%);
  width:min(92vw,440px);max-height:min(70vh,560px);overflow:auto;
  padding:7px;border:1px solid rgba(238,241,233,.11);border-radius:12px;
  background:rgba(14,21,17,.985);box-shadow:0 18px 42px rgba(0,0,0,.46)
}
.ao-section-menu[hidden]{display:none}
.ao-section-menu button{
  appearance:none;width:100%;border:0;border-bottom:1px solid rgba(238,241,233,.06);
  background:transparent;color:#bdc6be;padding:10px 11px;text-align:left;
  font:500 .69rem/1.25 var(--ao-font-ui,system-ui,sans-serif)
}
.ao-section-menu button:last-child{border-bottom:0}
.ao-section-menu button[aria-current="true"]{color:#f3f4ee;background:rgba(80,120,91,.14)}

.ao-reader-stage{min-height:0;position:relative;isolation:isolate;overflow:hidden}
.ao-card-viewport{
  width:100%;height:100%;min-width:0;min-height:0;margin:0;padding:0 calc(var(--ao-rail) + 8px);background:transparent
}
.ao-prayer-card{
  width:100%;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;touch-action:pan-y;
  scrollbar-width:none;scroll-behavior:auto;scroll-padding-top:clamp(44px,8vh,82px);
  padding:clamp(28px,4.5vh,48px) max(18px,calc((100% - 790px)/2)) calc(max(42vh,250px) + var(--ao-schola-reserve));
  border:0;border-radius:0;background:transparent;box-shadow:none
}
.ao-prayer-card::-webkit-scrollbar{display:none}

.ao-reader-shell[data-handoff="next"] .ao-reader-nav button[data-reader-nav="next"],
.ao-reader-shell[data-handoff="previous"] .ao-reader-nav button[data-reader-nav="previous"]{opacity:.46;transform:scale(1)}
.ao-prayer-card[data-card-arrival="next"]{animation:aoCardArriveNext .34s cubic-bezier(.18,.82,.20,1) both}
.ao-prayer-card[data-card-arrival="previous"]{animation:aoCardArrivePrevious .34s cubic-bezier(.18,.82,.20,1) both}
@keyframes aoCardArriveNext{0%{opacity:.72;transform:translateX(14vw);filter:blur(.35px)}100%{opacity:1;transform:none;filter:none}}
@keyframes aoCardArrivePrevious{0%{opacity:.72;transform:translateX(-14vw);filter:blur(.35px)}100%{opacity:1;transform:none;filter:none}}
.ao-prayer-title{
  margin:0 auto 26px;max-width:760px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.045);
  font:400 clamp(1.15rem,2.3vw,1.55rem)/1.18 var(--ao-font-display,Georgia,"Times New Roman",serif);
  letter-spacing:.018em;color:#e7ebe5
}
.ao-prayer-title[hidden]{display:none}
.ao-prayer-body{max-width:790px;margin:0 auto;display:flex;flex-direction:column;gap:4px}
.ao-reader-paragraph{
  position:relative;margin:0 0 2px;padding:2px 0;border-radius:6px;
  font:400 clamp(1.18rem,2.45vw,1.68rem)/1.69 var(--ao-font-liturgical,Georgia,"Times New Roman",serif);
  color:var(--ao-text);opacity:.43;font-kerning:normal;font-variant-ligatures:common-ligatures contextual;text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;transition:opacity .28s ease,transform .28s cubic-bezier(.16,.72,.18,1),color .16s ease,text-shadow .28s ease,filter .28s ease
}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph{opacity:.43}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"]{opacity:1;color:#f7f8f4;transform:translateX(2px);text-shadow:0 0 26px rgba(225,238,228,.065)}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph{opacity:.84}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.67}
.ao-reader-paragraph[data-kind="RUBRIC"]{
  margin:11px 0 14px;padding:9px 11px 9px 13px;border-left:2px solid #718178;border-radius:0 8px 8px 0;
  background:linear-gradient(90deg,rgba(113,129,120,.085),rgba(255,255,255,.012));
  font:600 .70rem/1.42 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.012em;color:#b8c2ba
}
.ao-reader-paragraph[data-kind="RUBRIC"]::before{
  content:"RUBRIC";display:block;margin-bottom:5px;font:800 7px/1 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.14em;color:#738278
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-state-duplicate="true"]{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"][data-state-duplicate="true"]{display:block}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"] .ao-line-primary{
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]::after{
  content:"TAP FOR FULL RUBRIC";display:block;margin-top:6px;font:700 6.5px/1 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.12em;color:#657268
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"][data-expanded="true"] .ao-line-primary{
  display:block;-webkit-line-clamp:unset;overflow:visible
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"][data-expanded="true"]::after{content:"TAP TO COLLAPSE"}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{
  margin:14px 0;padding:14px 8px;text-align:center;
  font-size:clamp(1.45rem,3.8vw,2rem);line-height:1.34;letter-spacing:.035em;color:#fff
}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"] .ao-line-secondary{margin-top:8px;font-size:.60em;color:#b8c2b9}
.ao-reader-paragraph[data-kind="RESPONSE"]{padding-left:14px;border-left:2px solid rgba(200,217,233,.50);color:#dbe5ee}
.ao-ritual-trigger{border-radius:.18em;background:linear-gradient(transparent 72%,rgba(132,169,141,.18) 72%);box-decoration-break:clone;-webkit-box-decoration-break:clone}
.ao-ritual-trigger-live{background:linear-gradient(transparent 62%,rgba(151,194,162,.38) 62%);text-shadow:0 0 12px rgba(155,198,166,.10);animation:aoRitualWordCue 1.25s ease-out both}
@keyframes aoRitualWordCue{0%{background-color:rgba(154,197,165,.19)}100%{background-color:transparent}}
.ao-ritual-cross-symbol{display:inline-block;margin:0 .06em;color:#8dac92;font-weight:700;transform:scale(1.08);text-shadow:0 0 11px rgba(148,188,158,.24)}
.ao-ritual-cross-symbol.ao-ritual-trigger-live{animation:aoRitualCross 1.25s ease-out both}
@keyframes aoRitualCross{0%{transform:scale(.92);filter:brightness(.8)}35%{transform:scale(1.28);filter:brightness(1.35)}100%{transform:scale(1.08);filter:none}}
.ao-reader-paragraph[data-translate-toggle="true"]{cursor:pointer}
.ao-reader-paragraph[data-translate-toggle="true"]:focus-visible{outline:1px solid rgba(109,149,117,.7);outline-offset:4px}
.ao-line-primary{display:block}
.ao-line-secondary{
  display:block;margin-top:4px;padding:4px 0 8px 12px;border-left:1px solid rgba(255,255,255,.09);
  font:400 .67em/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#b8c2b9
}

.ao-rail{
  position:absolute;z-index:5;top:8px;bottom:20px;width:52px;
  display:flex;flex-direction:column;gap:7px;padding:0;background:transparent;box-shadow:none;overflow:visible;pointer-events:none
}
.ao-rail-left{left:max(5px,calc((100% - 1080px)/2))}
.ao-rail-right{right:max(5px,calc((100% - 1080px)/2))}
.ao-rail[data-visible="false"]{display:flex}
.ao-reader-shell:not([data-mode="LIVE"]) .ao-rail{display:none}
.ao-rail-item{
  position:relative;flex:0 0 auto;width:52px;height:52px;min-height:52px;padding:0;
  display:grid;place-items:center;text-align:center;color:#8e978f;
  background:rgba(15,22,18,.82);border:1px solid rgba(238,241,233,.105);border-radius:13px;box-shadow:none;
  opacity:.18;overflow:hidden;transition:opacity .22s ease,transform .28s ease,box-shadow .28s ease,border-color .22s ease,background .22s ease,visibility .22s
}
.ao-rail-item[data-channel="posture"],.ao-rail-item[data-channel="priest-voice"]{opacity:.88}
.ao-rail-item[data-active="true"]{opacity:1;color:#edf0e9}
.ao-rail-item[data-channel="gesture"][data-active="false"],
.ao-rail-item[data-channel="response"][data-active="false"],
.ao-rail-item[data-channel="priest-action"][data-active="false"],
.ao-rail-item[data-channel="bell"][data-active="false"]{display:none}
.ao-rail-item[data-channel="gesture"][data-active="true"],
.ao-rail-item[data-channel="response"][data-active="true"],
.ao-rail-item[data-channel="priest-action"][data-active="true"],
.ao-rail-item[data-channel="bell"][data-active="true"]{animation:aoCueIn .42s cubic-bezier(.18,.8,.22,1) both}
.ao-rail-item[data-channel="response"][data-active="true"]{border-color:rgba(198,217,232,.48);background:rgba(28,43,54,.94);color:var(--ao-response)}
.ao-rail-item[data-channel="bell"][data-active="true"]{border-color:rgba(214,202,166,.45);background:rgba(49,43,29,.96)}
.ao-rail-item[data-major="true"]{width:64px;height:64px;min-height:64px;z-index:8;transform:scale(1.06)}
@keyframes aoCueIn{0%{opacity:0;transform:scale(.78)}55%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
.ao-rail-copy{display:none!important}
.ao-rail-item[data-channel="priest-action"]:has(.ao-icon-mask[hidden]) .ao-rail-copy{display:block!important;max-width:54px;font:700 7px/1.12 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.035em;text-transform:uppercase;color:#c8d0c9;text-align:center;overflow-wrap:anywhere}
.ao-rail .ao-icon-mask{width:38px;height:38px}
.ao-bell-icon{display:block;width:38px;height:38px;color:#d8c590}
.ao-bell-icon svg{display:block;width:100%;height:100%}
.ao-rail-item[data-channel="bell"][data-major="true"] .ao-bell-icon{
  animation:aoBellHold 3.4s ease-out both
}
.ao-rail-item[data-channel="schola-shared"][data-active="false"]{display:none}
.ao-rail-item[data-channel="schola-shared"][data-active="true"]{
  display:flex;opacity:1;border-color:rgba(109,149,117,.42);background:rgba(26,43,31,.94)
}
.ao-rail-item[data-channel="schola-shared"][data-active="true"] .ao-icon-mask{
  filter:drop-shadow(0 0 8px rgba(148,188,158,.18))
}
@keyframes aoBellHold{
  0%{transform:scale(.76) rotate(-10deg);opacity:.25}
  10%{transform:scale(1.22) rotate(9deg);opacity:1}
  22%{transform:scale(1.02) rotate(-5deg)}
  38%{transform:scale(1.08) rotate(3deg)}
  70%{transform:scale(1);opacity:1}
  100%{transform:scale(.96);opacity:.62}
}

.ao-schola-dock{
  position:absolute;z-index:9;left:50%;bottom:max(9px,env(safe-area-inset-bottom));transform:translateX(-50%);
  width:min(940px,calc(100% - 170px));height:var(--ao-schola-height);min-height:0;max-height:180px;
  padding:11px 16px 13px;border:1px solid rgba(109,149,117,.38);border-radius:16px;
  background:rgba(17,25,20,.968);box-shadow:0 15px 46px rgba(0,0,0,.34);color:#f0f1eb;overflow:hidden
}
.ao-schola-dock[data-active="false"]{display:none}
.ao-schola-dock[data-collapsed="true"]{min-height:32px;height:32px!important;padding-top:4px;padding-bottom:4px}
.ao-schola-dock[data-collapsed="true"] .ao-schola-main,
.ao-schola-dock[data-collapsed="true"] .ao-schola-translation,
.ao-schola-dock[data-collapsed="true"] .ao-schola-meta{display:none}
.ao-schola-resize{position:absolute;top:0;left:25%;right:25%;height:10px;cursor:ns-resize;touch-action:none}
.ao-schola-resize:before{content:"";position:absolute;left:50%;top:3px;width:34px;height:2px;border-radius:2px;background:rgba(109,149,117,.28);transform:translateX(-50%)}
.ao-schola-title{display:flex;align-items:center;gap:8px;min-height:21px;padding-right:54px}
.ao-schola-title .ao-icon-mask{width:22px;height:22px;color:#a9c6b0}
.ao-schola-kicker{font:700 8.5px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;text-transform:uppercase;color:#99b6a0}
.ao-schola-page{font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:#6f8175}
.ao-schola-main{
  position:relative;height:58px;margin-top:6px;overflow:hidden;border-top:1px solid rgba(255,255,255,.045);
  border-bottom:1px solid rgba(255,255,255,.045);cursor:pointer;display:flex;align-items:center
}
.ao-schola-dock [data-role="schola"]{
  display:inline-block;min-width:max-content;font:500 17px/1.25 var(--ao-font-liturgical,Georgia,"Times New Roman",serif);
  color:#f2f3ed;white-space:nowrap;will-change:transform;backface-visibility:hidden
}
.ao-schola-translation{
  display:none;margin-top:7px;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.035);
  border:1px solid rgba(255,255,255,.05);font:400 14px/1.42 var(--ao-font-liturgical,Georgia,"Times New Roman",serif);color:#d8dfd8
}
.ao-schola-dock[data-show-translation="true"] .ao-schola-translation{display:block}
.ao-schola-meta{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px;min-height:0}
.ao-schola-progress{grid-row:1;width:100%;height:2px;max-width:none;min-width:0;background:rgba(255,255,255,.07);overflow:hidden;border-radius:99px;opacity:.76}
.ao-schola-progress>span{display:block;height:100%;width:0;background:#8eae96;transition:none}
.ao-schola-controls{grid-row:2;width:100%;display:grid;grid-template-columns:38px 58px 38px minmax(72px,1fr);gap:6px;align-items:center;opacity:1;pointer-events:auto;overflow:visible}
.ao-schola-control{
  appearance:none;border:1px solid rgba(255,255,255,.065);background:rgba(255,255,255,.025);color:#9eada2;
  border-radius:7px;min-height:26px;padding:4px 7px;
  font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase
}
button.ao-schola-control{cursor:pointer}
.ao-schola-control[data-schola-slower],.ao-schola-control[data-schola-faster]{min-width:0;height:34px;font-size:16px;line-height:1;color:#d7e2d9;background:rgba(115,151,123,.14);border-color:rgba(145,181,153,.28)}
.ao-schola-speed{display:grid;place-items:center;min-width:58px;height:34px;text-align:center;color:#c9d8cc;background:rgba(255,255,255,.035);border-color:rgba(255,255,255,.07);padding:0}
.ao-schola-control[data-schola-pause]{justify-self:stretch;min-width:72px;height:34px;color:#aebcaf;border-color:rgba(255,255,255,.09);background:rgba(255,255,255,.03)}
.ao-schola-control[data-schola-pause][aria-pressed="true"]{color:#e5ede7;border-color:rgba(145,181,153,.34);background:rgba(88,123,97,.22)}
.ao-schola-toggle{
  position:absolute;top:7px;right:11px;appearance:none;border:1px solid rgba(255,255,255,.065);
  background:rgba(255,255,255,.025);color:#8f9a91;border-radius:7px;min-height:26px;padding:4px 7px;
  font:700 7px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase
}

.ao-reader-nav{position:absolute;z-index:10;inset:0;pointer-events:none}
.ao-reader-nav button{
  position:absolute;top:52%;width:44px;height:44px;border:0;border-radius:999px;
  background:transparent;color:#828d85;cursor:pointer;pointer-events:auto;
  font:400 1.55rem/1 var(--ao-font-display,Georgia,serif);opacity:.10;
  transition:opacity .2s ease,transform .24s cubic-bezier(.22,.72,.22,1),color .2s ease
}
.ao-reader-nav button::before{
  content:"";position:absolute;inset:3px;border-radius:999px;background:rgba(15,23,17,.70);
  box-shadow:0 9px 28px rgba(0,0,0,.18);backdrop-filter:blur(12px);pointer-events:none
}
.ao-reader-nav button:hover,.ao-reader-nav button:focus-visible{opacity:.92;background:rgba(23,32,26,.90);color:#e8ece7;outline:none}
.ao-reader-nav button[data-reader-nav="previous"]{left:max(49px,calc((100% - 1120px)/2 + 52px))}
.ao-reader-nav button[data-reader-nav="next"]{right:max(49px,calc((100% - 1120px)/2 + 52px))}
.ao-reader-progress{
  position:absolute;z-index:1;left:50%;bottom:calc(13px + var(--ao-schola-reserve));transform:translateX(-50%);
  display:block;padding:2px 4px;border:0;background:transparent;box-shadow:none;
  font:600 9px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;color:#69736c;opacity:.34;
  pointer-events:none;white-space:nowrap
}

.ao-cinematic{
  position:absolute;inset:0;z-index:22;display:grid;place-items:center;pointer-events:none;text-align:center;padding:2rem;
  opacity:1;visibility:visible;background:rgba(7,11,8,.93)
}
.ao-cinematic[hidden]{display:none}
.ao-cinematic *{pointer-events:none}
.ao-cinematic-inner{display:grid;gap:9px;justify-items:center;max-width:88%}
.ao-cinematic-mark{font:400 1.35rem/1 var(--ao-font-display,Georgia,serif);color:var(--ao-warm);display:grid;place-items:center}
.ao-cinematic-icon{display:block;width:68%;height:68%;color:#efe9d2}
.ao-cinematic-fallback{display:block}
.ao-cinematic-title{font:400 clamp(1.2rem,4vw,2rem)/1.15 var(--ao-font-display,Georgia,"Times New Roman",serif);letter-spacing:.08em;color:#f0f1e9}
.ao-cinematic-sub{font:600 .63rem/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;color:#89928a}
.ao-cinematic[data-kind="ELEVATION"]{background:radial-gradient(circle at center,rgba(226,211,158,.075),rgba(3,7,5,0) 43%)}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner{
  position:relative;width:min(43vw,210px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle,rgba(239,233,210,.12),rgba(20,27,22,.44) 48%,rgba(7,10,8,.15) 70%,transparent 72%);
  filter:drop-shadow(0 0 28px rgba(230,214,157,.14));animation:aoElevation 3.35s cubic-bezier(.18,.72,.22,1) both
}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-mark{width:100%;height:100%;font-size:0;color:#efe9d2}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-icon{width:68%;height:68%}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-fallback{display:none}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-title{display:none}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-sub{
  position:absolute;top:calc(100% + 14px);white-space:nowrap;font:600 10px/1.2 var(--ao-font-display,Cinzel,Georgia,serif);
  letter-spacing:.14em;text-transform:uppercase;color:rgba(238,235,217,.74)
}
@keyframes aoElevation{0%{opacity:0;transform:translateY(28px) scale(.72)}16%{opacity:1;transform:translateY(0) scale(1.03)}72%{opacity:1;transform:translateY(-5px) scale(1)}100%{opacity:0;transform:translateY(-16px) scale(.96)}}

.ao-guide-popover{
  position:absolute;inset:0;z-index:35;background:rgba(1,4,2,.74);backdrop-filter:blur(7px);
  display:grid;align-items:end;justify-items:stretch;padding:0
}
.ao-guide-popover[hidden]{display:none}
.ao-guide-sheet{
  width:min(760px,100%);max-height:min(84vh,860px);margin:0 auto;
  background:#0c120e;border:1px solid rgba(218,225,218,.10);border-bottom:0;border-radius:18px 18px 0 0;
  box-shadow:0 -22px 60px rgba(0,0,0,.44);overflow:hidden;display:flex;flex-direction:column
}
.ao-guide-head{
  display:flex;align-items:flex-start;justify-content:space-between;gap:16px;
  padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.06);background:rgba(17,25,19,.96)
}
.ao-guide-kicker{
  font:760 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;text-transform:uppercase;
  color:#87948a;margin-bottom:6px
}
.ao-guide-title{
  margin:0;font:500 21px/1.12 var(--ao-font-display,Georgia,"Times New Roman",serif);color:#f0f1ec
}
.ao-guide-summary{
  margin:9px 0 0;max-width:620px;
  font:400 14px/1.55 var(--ao-font-liturgical,Georgia,"Times New Roman",serif);color:#c9d0ca
}
.ao-guide-close{
  appearance:none;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.025);color:#aeb7b0;
  border-radius:999px;width:34px;height:34px;font:300 24px/1 var(--ao-font-ui,system-ui,sans-serif);
  cursor:pointer;flex:0 0 auto
}
.ao-guide-body{overflow:auto;-webkit-overflow-scrolling:touch;padding:8px 18px 34px}
.ao-guide-section{margin:20px 0 0;padding-top:18px;border-top:1px solid rgba(255,255,255,.055)}
.ao-guide-section:first-child{margin-top:7px;padding-top:0;border-top:0}
.ao-guide-section h3{
  margin:0 0 9px;font:500 16px/1.25 var(--ao-font-display,Georgia,"Times New Roman",serif);color:#ebece7
}
.ao-guide-section h4{
  margin:0 0 8px;font:760 8px/1.2 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.085em;
  text-transform:uppercase;color:#9c9b8b
}
.ao-guide-section p{
  margin:0;font:400 14px/1.62 var(--ao-font-liturgical,Georgia,"Times New Roman",serif);color:#c4c8c2
}
.ao-guide-section[data-tone="history"]{opacity:1;border-left:2px solid rgba(142,56,67,.26);padding-left:13px}
.ao-guide-section[data-tone="prayer"]{border-left:2px solid rgba(185,158,104,.28);padding-left:13px}
.ao-guide-sources{
  margin-top:24px;padding:13px 14px;border:1px solid rgba(255,255,255,.06);border-radius:10px;
  background:rgba(255,255,255,.018)
}
.ao-guide-sources small{
  display:block;margin-bottom:7px;font:750 7px/1 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.11em;text-transform:uppercase;color:#78786f
}
.ao-guide-sources p{margin:0;font:500 10px/1.55 var(--ao-font-ui,system-ui,sans-serif);color:#94978f}
.ao-guide-links{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}
.ao-guide-links a{
  display:inline-flex;padding:6px 8px;border:1px solid rgba(255,255,255,.065);border-radius:7px;
  color:#b2a993;text-decoration:none;font:650 8px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  background:rgba(255,255,255,.018)
}


@media(max-width:760px){
  .ao-reader-shell{--ao-rail:48px}
  .ao-reader-top-ribbon{grid-template-columns:56px minmax(0,1fr) 56px;height:56px;min-height:56px;padding:4px 5px}
  .ao-reader-top-action{width:44px;height:44px}.ao-reader-top-icon{width:28px;height:28px}
  .ao-section-jump{font-size:14px}
  .ao-state-ribbon{grid-template-columns:minmax(0,1fr) 80px minmax(0,1fr);height:64px;min-height:64px}
  .ao-state-cell{gap:7px;padding:5px 6px}
  .ao-state-cell>.ao-icon-mask{width:52px;height:52px;flex-basis:52px}
  .ao-state-label{font-size:10px;max-width:108px}
  .ao-state-cell[data-side="priest"] .ao-state-label{max-width:132px}
  .ao-guide-icon{width:29px;height:29px;flex-basis:29px}.ao-guide-icon svg{width:26px;height:26px}
  .ao-guide-copy{gap:1px}.ao-guide-copy small{font-size:5.8px}.ao-guide-short{font-size:6.6px;max-width:38px}
  .ao-progress-track{top:120px}
  .ao-section-menu{top:58px;width:min(92vw,440px)}
  .ao-mass-prefs{top:58px;right:8px;width:min(310px,calc(100% - 16px))}
  .ao-card-viewport{width:100%;padding:0 56px}
  .ao-prayer-card{padding:22px 8px calc(max(42vh,240px) + var(--ao-schola-reserve))}
  .ao-reader-paragraph{font-size:19px;line-height:1.55}
  .ao-rail{top:8px;bottom:20px;width:48px;gap:6px}
  .ao-rail-left{left:5px}.ao-rail-right{right:5px}
  .ao-rail-item{width:48px;height:48px;min-height:48px}
  .ao-rail-item[data-major="true"]{width:58px;height:58px;min-width:58px;max-width:58px;min-height:58px}
  .ao-rail .ao-icon-mask{width:34px;height:34px}
  .ao-schola-dock{width:calc(100% - 32px);min-height:0;padding:8px 10px 8px}
  .ao-schola-main{height:44px;margin-top:4px}
  .ao-schola-dock [data-role="schola"]{font-size:14px}.ao-schola-translation{font-size:12px;padding:7px 8px}
  .ao-schola-meta{gap:8px;margin-top:8px}
  .ao-schola-controls{grid-template-columns:36px 54px 36px minmax(66px,1fr);gap:5px}
  .ao-schola-control{min-height:28px;padding:4px 6px;font-size:7px}
  .ao-schola-speed{min-width:54px;padding:0}
  .ao-schola-toggle{position:absolute;top:3px;left:70%;transform:translateX(-50%);right:auto}
  .ao-reader-nav button{top:auto;bottom:calc(10px + var(--ao-schola-reserve));width:44px;height:44px;border-radius:50%;font-size:20px;opacity:.34;background:transparent}
  .ao-reader-nav button::before{inset:5px;background:rgba(11,16,13,.38)}
  .ao-reader-nav button[data-reader-nav="previous"]{left:51px}.ao-reader-nav button[data-reader-nav="next"]{right:51px}
  .ao-reader-progress{bottom:calc(18px + var(--ao-schola-reserve));font-size:8px;opacity:.42}
  .ao-schola-resize{left:25%;right:45%}
  .ao-guide-sheet{max-height:89vh;border-radius:16px 16px 0 0}
  .ao-guide-head{padding:15px 14px 12px}
  .ao-guide-body{padding:7px 14px 28px}
  .ao-guide-title{font-size:19px}
  .ao-guide-summary{font-size:13px}
  .ao-guide-section p{font-size:13.5px}
  .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner{width:min(48vw,190px)}
}
@media(prefers-reduced-motion:reduce){
  .ao-reader-paragraph,.ao-rail-item,.ao-reader-nav button{transition:none!important}.ao-prayer-card[data-card-arrival]{animation:none!important}
  .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner,.ao-rail-item[data-channel="bell"][data-major="true"] .ao-bell-icon{animation:none!important}
}
`;

function esc(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function topNavSvg(kind){
  if(kind==="home")return `<span class="ao-reader-top-icon" data-ao-donor-icon="home" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M3.5 10.7 12 3.8l8.5 6.9v9.1h-5.4v-5.7H8.9v5.7H3.5z" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/></svg></span>`;
  return `<span class="ao-reader-top-icon" data-ao-donor-icon="preferences" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M4 7h10M18 7h2M4 17h2M10 17h10M4 12h5M13 12h7" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="16" cy="7" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="8" cy="17" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/><circle cx="11" cy="12" r="2" fill="none" stroke="currentColor" stroke-width="1.7"/></svg></span>`;
}

function textValue(value){
  if (value == null) return null;
  if (typeof value === "string") return value;
  if (typeof value === "object") return value.label ?? value.value ?? value.text ?? null;
  return String(value);
}

function persist(next, previous){
  return next === undefined ? previous ?? null : next;
}

function ritualAnchorFragments(anchor){
  return String(anchor??"")
    .split(/\s*(?:…|\.\.\.)\s*/)
    .map(value=>value.trim())
    .filter(Boolean);
}

function appendRitualFragment(target,text,doc){
  const pieces=String(text??"").split("✠");
  pieces.forEach((piece,index)=>{
    if(piece)target.append(doc.createTextNode(piece));
    if(index<pieces.length-1){
      const cross=doc.createElement("span");
      cross.className="ao-ritual-cross-symbol ao-ritual-trigger-live";
      cross.textContent="✠";
      target.append(cross);
    }
  });
}

function renderReaderText(target,text,{anchor=null,active=false}={}){
  if(!target)return false;
  const doc=target.ownerDocument??globalThis.document;
  if(!doc?.createTextNode){target.textContent=String(text??"");return false;}
  const raw=String(text??"");
  const fragments=active ? ritualAnchorFragments(anchor) : [];
  target.replaceChildren();
  if(!fragments.length){target.textContent=raw;return false;}

  let cursor=0,matched=false;
  for(const fragment of fragments){
    const index=raw.indexOf(fragment,cursor);
    if(index<0)continue;
    if(index>cursor)target.append(doc.createTextNode(raw.slice(cursor,index)));
    const span=doc.createElement("span");
    span.className="ao-ritual-trigger ao-ritual-trigger-live";
    appendRitualFragment(span,fragment,doc);
    target.append(span);
    cursor=index+fragment.length;
    matched=true;
  }
  if(cursor<raw.length)target.append(doc.createTextNode(raw.slice(cursor)));
  if(!matched){
    target.replaceChildren();
    target.textContent=raw;
  }
  return matched;
}

export function normalizeReaderMoment(moment = {}, previous = {}) {
  if (!moment || typeof moment !== "object") throw new TypeError("Reader moment must be an object");
  const momentTitle=String(moment.cardTitle ?? moment.sectionTitle ?? previous.cardTitle ?? "");
  const latinProminent=/Consecration of (?:the )?(?:Sacred )?(?:Host|Chalice)/i.test(momentTitle);
  const paragraphs = Array.isArray(moment.paragraphs) ? moment.paragraphs.map((p, index) => {
    if (typeof p === "string") return Object.freeze({id:String(index),kind:"TEXT",primary:p,secondary:null,alternate:null,replaceOnToggle:false,active:false});
    let kind=String(p.kind ?? (p.response ? "RESPONSE" : "TEXT")).toUpperCase();
    let primary=String(p.primary ?? p.text ?? "");
    let secondary=p.secondary == null ? null : String(p.secondary);
    let alternate=p.alternate == null ? null : String(p.alternate);
    let replaceOnToggle=p.replaceOnToggle === true && p.alternate != null;
    const rubric=/^\s*\[[\s\S]+\]\s*$/.test(primary);
    if(rubric)kind="RUBRIC";
    if(latinProminent && alternate && kind!=="RUBRIC"){
      secondary=primary;
      primary=alternate;
      alternate=null;
      replaceOnToggle=false;
    }
    if(latinProminent && /\b(?:Hoc est enim Corpus meum|Hic est enim Calix)\b/i.test(primary))kind="CONSECRATION_WORDS";
    return Object.freeze({
      id:String(p.id ?? index),kind,primary,secondary,alternate,replaceOnToggle,
      active:p.active === true,
      sourceCueIds:Object.freeze([...(p.sourceCueIds ?? (p.id ? [p.id] : []))].map(String)),
    });
  }) : (previous.paragraphs ?? Object.freeze([]));

  const schola = persist(moment.schola, previous.schola);
  const sharedTextWithSchola = moment.sharedTextWithSchola === true;
  const guide = moment.guide?.registryAvailable === true && moment.guide?.text
    ? Object.freeze({
        text:String(moment.guide.text),
        detail:moment.guide.detail == null ? null : String(moment.guide.detail),
        moment:moment.guide.moment == null ? momentTitle : String(moment.guide.moment),
        sourceLine:moment.guide.sourceLine == null ? null : String(moment.guide.sourceLine),
        sourceLinks:moment.guide.sourceLinks == null ? null : String(moment.guide.sourceLinks),
      })
    : null;

  return Object.freeze({
    id:String(moment.id ?? previous.id ?? ""),
    sectionTitle:String(moment.sectionTitle ?? previous.sectionTitle ?? ""),
    cardTitle:String(moment.cardUpdate === false ? (previous.cardTitle ?? "") : (moment.cardTitle ?? moment.sectionTitle ?? previous.cardTitle ?? "")),
    cardUpdate:moment.cardUpdate !== false,
    paragraphs,
    progress:moment.progress == null ? previous.progress ?? null : String(moment.progress),
    posture:persist(moment.posture, previous.posture),
    gesture:moment.gesture ?? null,
    response:moment.response ?? null,
    bell:moment.bell ?? null,
    cinematic:moment.cinematic ?? null,
    priestPosition:persist(moment.priestPosition, previous.priestPosition),
    priestAction:moment.priestAction ?? null,
    priestVoice:persist(moment.priestVoice, previous.priestVoice),
    schola,
    scholaShared:sharedTextWithSchola && Boolean(textValue(schola)),
    scholaVisible:!sharedTextWithSchola && Boolean(textValue(schola)),
    guide,
    priestPositionIconKey:moment.priestPositionIconKey ?? null,
    priestActionIconKey:moment.priestActionIconKey ?? null,
    postureIconKey:moment.postureIconKey ?? null,
    gestureIconKey:moment.gestureIconKey ?? null,
    responseIconKey:moment.responseIconKey ?? null,
    priestVoiceIconKey:moment.priestVoiceIconKey ?? null,
    scholaIconKey:moment.scholaIconKey ?? null,
    bellIconKey:moment.bellIconKey ?? null,
  });
}


const GUIDE_HEADINGS=new Set([
  "What is happening","What should I do?","Why this matters","How this developed",
  "Before 1960","In the 1960–1962 reform state","After the Council / in the current Roman Rite",
  "Why the difference matters","What should I follow now?","Priest and schola",
  "Local or form variation","For prayer","Sources",
]);
const GUIDE_HISTORY_HEADINGS=new Set(["Before 1960","In the 1960–1962 reform state","After the Council / in the current Roman Rite","How this developed","Why the difference matters"]);

function stripRubricBrackets(text){
  const raw=String(text??"").trim();
  return /^\[[\s\S]*\]$/.test(raw) ? raw.slice(1,-1).trim() : raw;
}
export function rubricIsStateDuplicate(text){
  const t=stripRubricBrackets(text).replace(/\s+/g," ").trim();
  return /^(?:stand|sit|kneel|rise|genuflect|bow(?: the head)?|remain standing|remain seated|remain kneeling)[.!]?$/i.test(t);
}
function guideSections(text){
  const blocks=String(text??"").replace(/\r/g,"").split(/\n{2,}/).map(x=>x.trim()).filter(Boolean);
  return blocks.map(block=>{
    const lines=block.split("\n"),heading=lines[0].trim(),rest=lines.slice(1).join("\n").trim();
    if(heading==="Sources")return null;
    if(/^Exact references where useful:/i.test(heading)){
      return {heading:"Exact references",body:block.replace(/^Exact references where useful:\s*/i,""),tone:"reference",level:4};
    }
    if(GUIDE_HEADINGS.has(heading)){
      return {heading,body:rest,tone:GUIDE_HISTORY_HEADINGS.has(heading)?"history":heading==="For prayer"?"prayer":"",level:/^(Before 1960|In the 1960|After the Council)/.test(heading)?4:3};
    }
    return {heading:null,body:block,tone:"",level:0};
  }).filter(Boolean);
}
function renderGuideSheet(pop,guide){
  if(!pop||!guide)return;
  const doc=pop.ownerDocument??globalThis.document;
  if(!doc?.createElement)return;
  pop.replaceChildren();
  const sheet=doc.createElement("section");sheet.className="ao-guide-sheet";sheet.setAttribute("role","dialog");sheet.setAttribute("aria-modal","true");
  const head=doc.createElement("header");head.className="ao-guide-head";
  const intro=doc.createElement("div");
  const kicker=doc.createElement("div");kicker.className="ao-guide-kicker";kicker.textContent="Guide · 1962 Sung Mass";
  const title=doc.createElement("h2");title.className="ao-guide-title";title.textContent=guide.moment||"Guide";
  const summary=doc.createElement("p");summary.className="ao-guide-summary";summary.textContent=guide.text||"";
  intro.append(kicker,title,summary);
  const close=doc.createElement("button");close.type="button";close.className="ao-guide-close";close.dataset.guideClose="true";close.setAttribute("aria-label","Close Guide");close.textContent="×";
  head.append(intro,close);sheet.append(head);
  const body=doc.createElement("div");body.className="ao-guide-body";
  for(const section of guideSections(guide.detail)){
    const node=doc.createElement("section");node.className="ao-guide-section";if(section.tone)node.dataset.tone=section.tone;
    if(section.heading){const h=doc.createElement(section.level===4?"h4":"h3");h.textContent=section.heading;node.append(h);}
    if(section.body){const p=doc.createElement("p");p.textContent=section.body;node.append(p);}
    body.append(node);
  }
  if(guide.sourceLine){
    const sources=doc.createElement("div");sources.className="ao-guide-sources";
    const label=doc.createElement("small");label.textContent="SOURCES";sources.append(label);
    const line=doc.createElement("p");line.textContent=guide.sourceLine;sources.append(line);
    const urls=String(guide.sourceLinks??"").split(/\s*;\s*/).filter(Boolean);
    const names=String(guide.sourceLine).split(/\s*;\s*/).filter(Boolean);
    if(urls.length){const links=doc.createElement("div");links.className="ao-guide-links";urls.forEach((url,index)=>{const a=doc.createElement("a");a.href=url;a.target="_blank";a.rel="noopener noreferrer";a.textContent=names[index]||("Source "+(index+1));links.append(a);});sources.append(links);}
    body.append(sources);
  }
  sheet.append(body);pop.append(sheet);
}

export function buildReaderShellMarkup(prepared = {}) {
  const mode = normalizePresentationMode(prepared?.readerPreferences?.mode ?? prepared?.session?.resolvedMass?.presentationMode ?? "LIVE");
  const section = esc(prepared?.session?.resolvedMass?.actualCelebration?.title ?? "Mass");
  return `<style data-ao-reader-shell-style>${SHELL_STYLE}</style>
<section class="ao-reader-shell" data-ao-reader-shell data-mode="${mode}">
  <header class="ao-reader-top-ribbon" aria-label="Mass navigation">
    <button class="ao-reader-top-action" type="button" data-reader-home aria-label="Back to Ad Orientem home">${topNavSvg("home")}</button>
    <button class="ao-section-jump" type="button" data-role="section-jump" aria-expanded="false" disabled><span data-role="section-title">${section}</span><span class="ao-section-caret" aria-hidden="true">⌄</span></button>
    <button class="ao-reader-top-action" type="button" data-reader-preferences aria-label="Mass preferences" aria-expanded="false">${topNavSvg("preferences")}</button>
  </header>

  <div class="ao-state-ribbon" aria-live="polite">
    <div class="ao-state-cell" data-side="faithful" data-channel="posture">
      <span class="ao-icon-mask" data-icon-slot="posture-top" hidden></span>
      <span class="ao-state-copy"><span class="ao-state-kicker">YOU</span><span class="ao-state-label" data-role="posture">—</span></span>
    </div>
    <button class="ao-state-guide" type="button" data-role="guide-button" disabled aria-label="Open Guide and rubrics">
      <span class="ao-guide-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4.75h10.5A2.5 2.5 0 0 1 18 7.25v12H7.5A2.5 2.5 0 0 1 5 16.75z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 8h6.5M8 11h6.5M8 14h4.5" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/></svg></span>
      <span class="ao-guide-copy"><small>GUIDE</small><b class="ao-guide-short" data-role="guide-short">RUBRICS</b></span>
    </button>
    <div class="ao-state-cell" data-side="priest">
      <span class="ao-icon-mask" data-icon-slot="priest-position" hidden></span>
      <span class="ao-state-copy"><span class="ao-state-kicker">PRIEST</span><span class="ao-state-label" data-role="priest-position">—</span></span>
      <span class="ao-priest-action-badge" data-role="priest-action-badge" data-active="false" data-major="false" aria-hidden="true"><span class="ao-icon-mask" data-icon-slot="priest-action-top" hidden></span></span>
    </div>
  </div>
  <div class="ao-progress-track" aria-hidden="true"><span data-role="progress-track"></span></div>

  <div class="ao-section-menu" data-role="section-menu" hidden></div>
  <aside class="ao-mass-prefs" data-role="mass-preferences" data-open="false" aria-label="Mass preferences">
    <div class="ao-mass-prefs-head"><b>Mass preferences</b><button class="ao-mass-prefs-close" type="button" data-reader-preferences-close aria-label="Close preferences">×</button></div>
    <div class="ao-mass-prefs-group"><small>Reader mode</small><nav class="ao-mode-ribbon" aria-label="Reader mode">${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}"><span>${m}</span></button>`).join("")}</nav></div>
    <button class="ao-mass-prefs-more" type="button" data-reader-glossary>Terms & rubrics</button><button class="ao-mass-prefs-more" type="button" data-reader-parameters>App settings</button>
  </aside>

  <div class="ao-reader-stage" data-left-rail="true" data-right-rail="true">
    <aside class="ao-rail ao-rail-left" data-visible="true" aria-label="Faithful cues">
      <div class="ao-rail-item" data-channel="posture" data-active="true"><span class="ao-icon-mask" data-icon-slot="posture" hidden></span><span class="ao-rail-copy" aria-hidden="true">—</span></div>
      <div class="ao-rail-item" data-channel="gesture" data-active="false"><span class="ao-icon-mask" data-icon-slot="gesture" hidden></span><span class="ao-rail-copy" data-role="gesture">—</span></div>
      <div class="ao-rail-item" data-channel="response" data-active="false"><span class="ao-icon-mask" data-icon-slot="response" hidden></span><span class="ao-rail-copy" data-role="response">—</span></div>
    </aside>

    <main class="ao-card-viewport">
      <article class="ao-prayer-card" data-role="card" tabindex="0">
        <h1 class="ao-prayer-title" data-role="card-title">${section}</h1>
        <div class="ao-prayer-body" data-role="paragraphs"></div>
      </article>
    </main>

    <aside class="ao-rail ao-rail-right" data-visible="true" aria-label="Priest, bell, and shared Schola cues">
      <div class="ao-rail-item" data-channel="priest-voice" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-voice" hidden></span><span class="ao-rail-copy" data-role="priest-voice">—</span></div>
      <div class="ao-rail-item" data-channel="priest-action" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-action" hidden></span><span class="ao-rail-copy" data-role="priest-action">—</span></div>
      <div class="ao-rail-item" data-channel="bell" data-active="false"><span class="ao-icon-mask ao-bell-icon" data-icon-slot="bell" hidden aria-hidden="true"></span><span class="ao-rail-copy" data-role="bell">—</span></div>
      <div class="ao-rail-item" data-channel="schola-shared" data-active="false" aria-label="Schola shares the current text"><span class="ao-icon-mask" data-icon-slot="schola-shared" hidden></span><span class="ao-rail-copy" aria-hidden="true">—</span></div>
    </aside>
  </div>

  <div class="ao-schola-dock" data-channel="schola" data-active="false" data-collapsed="false" data-show-translation="false">
    <span class="ao-schola-resize" data-schola-resize aria-hidden="true"></span>
    <div class="ao-schola-title"><span class="ao-icon-mask" data-icon-slot="schola" hidden></span><span class="ao-schola-kicker">SCHOLA</span><span class="ao-schola-page" data-role="schola-page"></span></div>
    <button class="ao-schola-toggle" type="button" data-schola-toggle aria-label="Hide Schola">HIDE</button>
    <div class="ao-schola-main" data-schola-translate title="Tap to translate"><span data-role="schola">—</span></div>
    <div class="ao-schola-translation" data-role="schola-translation" aria-live="polite"></div>
    <div class="ao-schola-meta">
      <span class="ao-schola-progress"><span data-role="schola-progress"></span></span>
      <div class="ao-schola-controls" aria-label="Schola text speed">
        <button type="button" class="ao-schola-control" data-schola-slower aria-label="Slower Schola text">−</button>
        <span class="ao-schola-control ao-schola-speed" data-role="schola-speed" aria-label="Schola speed">0.45×</span>
        <button type="button" class="ao-schola-control" data-schola-faster aria-label="Faster Schola text">+</button>
        <button type="button" class="ao-schola-control" data-schola-pause aria-label="Pause Schola text" aria-pressed="false">PAUSE</button>
      </div>
    </div>
  </div>

  <div class="ao-cinematic" data-role="cinematic" aria-live="polite" hidden>
    <div class="ao-cinematic-inner"><div class="ao-cinematic-mark"><span class="ao-icon-mask ao-cinematic-icon" data-icon-slot="cinematic" hidden></span><span class="ao-cinematic-fallback" aria-hidden="true">✠</span></div><div class="ao-cinematic-title" data-role="cinematic-title"></div><div class="ao-cinematic-sub" data-role="cinematic-sub"></div></div>
  </div>

  <nav class="ao-reader-nav" aria-label="Prayer card navigation">
    <button type="button" data-reader-nav="previous" aria-label="Previous Mass card">‹</button>
    <span class="ao-reader-progress" data-role="progress">—</span>
    <button type="button" data-reader-nav="next" aria-label="Next Mass card">›</button>
  </nav>
  <aside class="ao-guide-popover" data-role="guide-popover" hidden></aside>
</section>`;
}

function setText(root, role, value){
  const el=root.querySelector(`[data-role="${role}"]`);
  if(el) el.textContent=value == null || value === "" ? "—" : String(value);
}

function setChannel(root, channel, value){
  const item=root.querySelector(`[data-channel="${channel}"]`);
  if(item) item.dataset.active = String(Boolean(textValue(value)));
}

function syncRailVisibility(root){
  const stage=root.querySelector(".ao-reader-stage");
  if(!stage)return;
  const shell=root.querySelector("[data-ao-reader-shell]");
  const live=String(shell?.dataset?.mode??"LIVE").toUpperCase()==="LIVE";
  const left=root.querySelector(".ao-rail-left");
  const right=root.querySelector(".ao-rail-right");
  if(left)left.dataset.visible=String(live);
  if(right)right.dataset.visible=String(live);
  stage.dataset.leftRail=String(live);
  stage.dataset.rightRail=String(live);
}

function applyIcon(root, slot, key, iconResolver){
  const el=root.querySelector(`[data-icon-slot="${slot}"]`);
  if(!el) return;
  const id=String(key??"").trim();
  const src = id && typeof iconResolver === "function" ? iconResolver(id) : null;
  const direct=/_rich$/.test(id);
  el.classList?.toggle?.("ao-icon-direct",Boolean(src&&direct));
  if(!src){
    el.hidden=true;
    el.style.maskImage="";el.style.webkitMaskImage="";
    el.style.backgroundImage="";
    return;
  }
  el.hidden=false;
  const css=`url("${String(src).replace(/"/g,'\\\"')}")`;
  if(direct){
    // The exact v4.6 rich masters are transparent PNG silhouettes externalized
    // inside SVG wrappers. Rendering the wrapper directly preserves its alpha;
    // re-masking the wrapper can collapse Chromium to the SVG viewport rectangle.
    el.style.maskImage="none";el.style.webkitMaskImage="none";
    el.style.backgroundImage=css;
  }else{
    el.style.backgroundImage="";
    el.style.maskImage=css;
    el.style.webkitMaskImage=css;
  }
}

export function createReaderDomAdapter({
  root,
  iconResolver = null,
  onPresentationModeChange = null,
  onPrevious = null,
  onNext = null,
  onGuide = null,
  onHome = null,
  onParameters = null,
  onScholaAdvance = null,
  sections = [],
  onSectionSelect = null,
  allowPresentationModeSwitch = true,
} = {}) {
  if(!root || typeof root.querySelector !== "function") throw new TypeError("Reader root element required");

  let prepared=null;
  let current=null;
  let mode="LIVE";
  let bound=false;
  let sectionItems=Array.isArray(sections)?[...sections]:[];
  let scholaCollapsed=false;
  let scholaHeight=(root.ownerDocument?.defaultView?.matchMedia?.("(max-width:760px)")?.matches ? 132 : 150);
  let scholaTranslationVisible=false;
  let scholaIdentity=null;
  let heldBell=null;
  let bellHoldUntil=0;
  let bellHoldTimer=0;
  let scholaSpeed=DEFAULT_SCHOLA_SPEED;
  let scholaPaused=false;
  let scholaUserPaused=false;
  let scholaPausedBeforeTranslation=false;
  let scholaAnimation=null;
  let scholaProgressRaf=0;
  let scholaFallbackTimer=0;
  let scholaTickerIdentity=null;
  let suppressNavClickUntil=0;
  let suppressNavClickDirection=null;
  let suppressModeClickUntil=0;
  let swipeStart=null;
  let wheelIntent={dir:0,amount:0,last:0};
  let navCooldownUntil=0;

  function setMode(next){
    const requested=normalizePresentationMode(next);
    if(!allowPresentationModeSwitch && requested!==mode) return mode;
    mode=requested;
    const shell=root.querySelector("[data-ao-reader-shell]");
    if(shell) shell.dataset.mode=mode;
    for(const button of root.querySelectorAll?.("[data-reader-mode]") ?? []){
      button.setAttribute("aria-pressed",String(button.dataset.readerMode===mode));
    }
    syncRailVisibility(root);
    if(typeof onPresentationModeChange==="function") onPresentationModeChange(mode,prepared);
    return mode;
  }

  function closeSectionMenu(){
    const menu=root.querySelector('[data-role="section-menu"]');
    const jump=root.querySelector('[data-role="section-jump"]');
    if(menu)menu.hidden=true;
    jump?.setAttribute?.("aria-expanded","false");
  }

  function setPreferencesOpen(open){
    const panel=root.querySelector('[data-role="mass-preferences"]');
    const button=root.querySelector('[data-reader-preferences]');
    if(panel)panel.dataset.open=String(Boolean(open));
    button?.setAttribute?.("aria-expanded",String(Boolean(open)));
    return Boolean(open);
  }

  function syncProgress(){
    const track=root.querySelector('[data-role="progress-track"]');
    if(!track)return;
    const match=String(current?.progress??"").match(/(\d+)\s*\/\s*(\d+)/);
    const pct=match ? Math.max(0,Math.min(100,(Number(match[1])/Math.max(1,Number(match[2])))*100)) : 0;
    track.style.width=pct+"%";
  }

  function displayBell(nextBell){
    if(nextBell){
      heldBell=nextBell;
      const hold=Math.max(0,Number(nextBell.presentationHoldMs)||0);
      bellHoldUntil=hold ? Date.now()+hold : 0;
      if(bellHoldTimer)clearTimeout(bellHoldTimer);
      if(hold){
        bellHoldTimer=setTimeout(()=>{
          bellHoldTimer=0;
          if(!current?.bell && Date.now()>=bellHoldUntil){
            heldBell=null;bellHoldUntil=0;
            setText(root,"bell",null);
            setChannel(root,"bell",null);
            const rail=root.querySelector('[data-channel="bell"]');
            if(rail)rail.dataset.major="false";
          }
        },hold+35);
      }
      return nextBell;
    }
    if(heldBell && bellHoldUntil>Date.now())return heldBell;
    heldBell=null;bellHoldUntil=0;
    return null;
  }

  function scholaWindow(){
    return root?.ownerDocument?.defaultView ?? globalThis;
  }

  function loadScholaSpeed(){
    const win=scholaWindow();
    try{return normalizeScholaSpeed(win?.localStorage?.getItem?.(SCHOLA_SPEED_STORAGE_KEY))}
    catch{return DEFAULT_SCHOLA_SPEED}
  }

  function storeScholaSpeed(){
    const win=scholaWindow();
    try{win?.localStorage?.setItem?.(SCHOLA_SPEED_STORAGE_KEY,String(scholaSpeed))}catch{}
  }

  function scholaTitle(trackId){
    return ({
      INTROIT:"INTROIT",
      KYRIE:"KYRIE",
      GLORIA:"GLORIA",
      GRADUAL:"GRADUAL",
      ALLELUIA_TRACT_SEQUENCE:"ALLELUIA / TRACT / SEQUENCE",
      CREDO:"CREDO",
      OFFERTORY:"OFFERTORY CHANT",
      SANCTUS_BENEDICTUS:"SANCTUS / BENEDICTUS",
      AGNUS_DEI:"AGNUS DEI",
      COMMUNION:"COMMUNION HYMN",
    })[String(trackId??"")] ?? "SCHOLA";
  }

  function cancelScholaTicker({clearIdentity=false}={}){
    const win=scholaWindow();
    if(scholaAnimation){
      try{scholaAnimation.onfinish=null;scholaAnimation.cancel?.()}catch{}
      scholaAnimation=null;
    }
    if(scholaProgressRaf){
      try{win?.cancelAnimationFrame?.(scholaProgressRaf)}catch{}
      scholaProgressRaf=0;
    }
    if(scholaFallbackTimer){
      try{(win?.clearTimeout??globalThis.clearTimeout)?.call?.(win,scholaFallbackTimer)}catch{clearTimeout(scholaFallbackTimer)}
      scholaFallbackTimer=0;
    }
    if(clearIdentity)scholaTickerIdentity=null;
  }

  function syncScholaControls(){
    const speedNode=root.querySelector('[data-role="schola-speed"]');
    if(speedNode)speedNode.textContent=scholaSpeed.toFixed(2)+"×";
    const pause=root.querySelector('[data-schola-pause]');
    if(pause){
      pause.textContent=scholaPaused?"RESUME":"PAUSE";
      pause.setAttribute?.("aria-pressed",String(scholaPaused));
      pause.setAttribute?.("aria-label",scholaPaused?"Resume Schola text":"Pause Schola text");
    }
  }

  function scholaProgressLoop(){
    const progress=root.querySelector('[data-role="schola-progress"]');
    const win=scholaWindow();
    if(!scholaAnimation||scholaPaused||!progress){scholaProgressRaf=0;return}
    const duration=Math.max(1,Number(scholaAnimation.effect?.getTiming?.().duration)||1);
    const elapsed=Math.max(0,Number(scholaAnimation.currentTime)||0);
    progress.style.width=Math.max(0,Math.min(100,(elapsed/duration)*100))+"%";
    if(elapsed<duration)scholaProgressRaf=win?.requestAnimationFrame?.(scholaProgressLoop)??0;
    else scholaProgressRaf=0;
  }

  function finishScholaTicker(identity){
    const progress=root.querySelector('[data-role="schola-progress"]');
    if(progress)progress.style.width="100%";
    scholaAnimation=null;scholaProgressRaf=0;scholaFallbackTimer=0;
    if(scholaPaused||identity!==scholaTickerIdentity)return;
    if(typeof onScholaAdvance==="function"){
      const before=current?.schola;
      const next=onScholaAdvance(before,current,prepared);
      if(next?.schola?.segmentId===before?.segmentId && next?.complete){
        scholaTickerIdentity=identity;
      }
    }
  }

  function startScholaTicker({force=false}={}){
    const schola=current?.scholaVisible ? current.schola : null;
    const dock=root.querySelector(".ao-schola-dock");
    const line=root.querySelector('[data-role="schola"]');
    const viewport=root.querySelector(".ao-schola-main");
    const progress=root.querySelector('[data-role="schola-progress"]');
    if(!schola||!dock||dock.dataset.active!=="true"||!line||!viewport){
      cancelScholaTicker({clearIdentity:true});
      if(progress)progress.style.width="0%";
      return false;
    }
    const identity=[schola.trackId,schola.segmentId,schola.cueId].filter(Boolean).join("|");
    if(schola.complete){
      cancelScholaTicker();
      scholaTickerIdentity=identity;
      if(progress)progress.style.width="100%";
      return false;
    }
    if(!force && scholaTickerIdentity===identity && scholaAnimation)return true;
    cancelScholaTicker();
    scholaTickerIdentity=identity;
    if(progress)progress.style.width="0%";
    line.style.transform="";
    if(scholaPaused||scholaTranslationVisible)return false;

    const win=scholaWindow();
    const vw=Math.max(0,Number(viewport.clientWidth)||0);
    const lw=Math.max(0,Number(line.scrollWidth)||0);
    if(!vw||!lw)return false;
    const duration=scholaTickerDuration({
      viewportWidth:vw,lineWidth:lw,speed:scholaSpeed,
      isMobile:Number(win?.innerWidth||0)<760,
    });
    const visibleLead=Math.min(lw,Math.max(92,vw*.30));
    const from=Math.max(0,vw-visibleLead),to=-(lw+24);

    if(typeof line.animate==="function"){
      scholaAnimation=line.animate([
        {transform:"translate3d("+from+"px,0,0)"},
        {transform:"translate3d("+to+"px,0,0)"},
      ],{duration,easing:"linear",fill:"forwards"});
      scholaAnimation.onfinish=()=>{
        const finished=scholaAnimation;
        scholaAnimation=null;
        try{finished?.cancel?.()}catch{}
        line.style.transform="translate3d(0,0,0)";
        finishScholaTicker(identity);
      };
      scholaProgressRaf=win?.requestAnimationFrame?.(scholaProgressLoop)??0;
      return true;
    }

    const set=win?.setTimeout??globalThis.setTimeout;
    scholaFallbackTimer=set?.call?.(win,()=>finishScholaTicker(identity),duration)??0;
    return true;
  }

  function setScholaPaused(paused,{user=false}={}){
    if(user)scholaUserPaused=Boolean(paused);
    scholaPaused=Boolean(paused);
    if(scholaAnimation){
      try{scholaPaused?scholaAnimation.pause?.():scholaAnimation.play?.()}catch{}
      if(!scholaPaused && !scholaProgressRaf){
        scholaProgressRaf=scholaWindow()?.requestAnimationFrame?.(scholaProgressLoop)??0;
      }
    }else if(!scholaPaused && !scholaTranslationVisible){
      startScholaTicker({force:true});
    }
    syncScholaControls();
    return scholaPaused;
  }

  function changeScholaSpeed(delta){
    const currentIndex=Math.max(0,SCHOLA_SPEEDS.indexOf(scholaSpeed));
    const nextIndex=Math.max(0,Math.min(SCHOLA_SPEEDS.length-1,currentIndex+Number(delta||0)));
    const next=SCHOLA_SPEEDS[nextIndex];
    if(next===scholaSpeed)return scholaSpeed;
    scholaSpeed=next;
    storeScholaSpeed();
    syncScholaControls();
    if(!scholaPaused&&!scholaTranslationVisible)startScholaTicker({force:true});
    return scholaSpeed;
  }

  function syncScholaContent(){
    const dock=root.querySelector(".ao-schola-dock");
    if(!dock)return;
    const schola=current?.scholaVisible ? current.schola : null;
    const identity=schola ? [schola.trackId,schola.segmentId,schola.cueId].filter(Boolean).join("|") : null;
    const changed=identity!==scholaIdentity;
    if(changed){
      scholaIdentity=identity;
      scholaTranslationVisible=false;
      cancelScholaTicker({clearIdentity:true});
    }
    dock.dataset.showTranslation=String(Boolean(scholaTranslationVisible && schola?.english));
    const title=root.querySelector(".ao-schola-kicker");
    if(title)title.textContent=schola ? scholaTitle(schola.trackId) : "SCHOLA";
    setText(root,"schola",schola ? (schola.latin??textValue(schola)) : null);
    setText(root,"schola-translation",schola?.english??null);
    const page=root.querySelector('[data-role="schola-page"]');
    if(page)page.textContent=schola?.total ? String((Number(schola.index)||0)+1)+" / "+String(schola.total) : "";
    const progress=root.querySelector('[data-role="schola-progress"]');
    if(!schola){
      if(progress)progress.style.width="0%";
      cancelScholaTicker({clearIdentity:true});
      return;
    }
    if(schola.complete){
      if(progress)progress.style.width="100%";
      cancelScholaTicker();
      scholaTickerIdentity=identity;
      return;
    }
    const win=scholaWindow();
    const request=win?.requestAnimationFrame;
    if(changed){
      if(typeof request==="function")request.call(win,()=>startScholaTicker({force:true}));
      else startScholaTicker({force:true});
    }else if(!scholaAnimation&&!scholaPaused&&!scholaTranslationVisible){
      if(typeof request==="function")request.call(win,()=>startScholaTicker());
      else startScholaTicker();
    }
  }

  function syncScholaChrome(){
    const dock=root.querySelector(".ao-schola-dock");
    if(!dock)return;
    dock.dataset.collapsed=String(scholaCollapsed);
    dock.style.setProperty?.("--ao-schola-height",scholaHeight+"px");
    const shell=root.querySelector("[data-ao-reader-shell]");
    const scholaActive=dock.dataset.active==="true";
    const scholaRelevant=Boolean(textValue(current?.schola)) && current?.scholaShared!==true;
    const reserve=(scholaActive||scholaRelevant) ? (scholaCollapsed ? 32 : scholaHeight) : 0;
    if(shell){
      shell.dataset.scholaVisible=String(scholaActive);
      shell.dataset.scholaRelevant=String(scholaRelevant);
      shell.style.setProperty?.("--ao-schola-reserve",reserve+"px");
    }
    const toggle=dock.querySelector?.("[data-schola-toggle]");
    if(toggle){
      toggle.textContent=scholaCollapsed?"SHOW":"HIDE";
      toggle.setAttribute?.("aria-label",scholaCollapsed?"Show Schola":"Hide Schola");
    }
  }

  function populateSections(){
    const menu=root.querySelector('[data-role="section-menu"]');
    const jump=root.querySelector('[data-role="section-jump"]');
    if(!menu||!jump)return;
    menu.replaceChildren?.();
    const values=sectionItems.filter(x=>x?.id&&x?.label);
    jump.disabled=values.length===0;
    const doc=menu.ownerDocument??globalThis.document;
    if(!doc?.createElement)return;
    for(const item of values){
      const button=doc.createElement("button");
      button.type="button";
      button.dataset.readerSection=String(item.id);
      button.textContent=String(item.label);
      menu.append(button);
    }
  }

  function activeScrollCard(){return root.querySelector?.(".ao-prayer-card")??null;}
  function edgeZone(card){return Math.max(20,(Number(card?.clientHeight)||0)*.025);}
  function atCardEdge(card,dir){
    if(!card)return false;
    if(dir<0)return (Number(card.scrollTop)||0)<=edgeZone(card);
    const remaining=Math.max(0,(Number(card.scrollHeight)||0)-(Number(card.clientHeight)||0)-(Number(card.scrollTop)||0));
    return remaining<=edgeZone(card);
  }
  function setHandoff(dir,on=true){
    const shell=root.querySelector("[data-ao-reader-shell]");if(!shell)return;
    shell.dataset.handoff=on?(dir>0?"next":"previous"):"";
  }
  function animateCardArrival(dir){
    const card=activeScrollCard();if(!card)return;
    card.dataset.cardArrival=dir>0?"next":"previous";
    const win=scholaWindow();
    (win?.setTimeout??setTimeout)(()=>{if(card)delete card.dataset.cardArrival;},380);
  }
  function navigateBy(dir,input="unknown"){
    const now=Date.now(),continuous=/^(?:swipe|wheel-edge)$/.test(String(input));
    if(continuous&&now<navCooldownUntil)return null;
    if(continuous)navCooldownUntil=now+360;
    setHandoff(dir,false);wheelIntent={dir:0,amount:0,last:0};
    root.dataset.aoLastNavInput=input+":"+(dir>0?"next":"previous");
    const result=dir>0?onNext?.(current,prepared):onPrevious?.(current,prepared);
    root.dataset.aoLastNavResult=result?.sectionId??result?.id??"none";
    if(result)animateCardArrival(dir);
    return result;
  }

  function bind(){
    if(bound) return;
    bound=true;
    root.addEventListener?.("click", event => {
      const homeButton=event.target?.closest?.("[data-reader-home]");
      if(homeButton){onHome?.(current,prepared);return;}
      const preferencesButton=event.target?.closest?.("[data-reader-preferences]");
      if(preferencesButton){
        const panel=root.querySelector('[data-role="mass-preferences"]');
        setPreferencesOpen(panel?.dataset?.open!=="true");
        closeSectionMenu();
        return;
      }
      const preferencesClose=event.target?.closest?.("[data-reader-preferences-close]");
      if(preferencesClose){setPreferencesOpen(false);return;}
      const parametersButton=event.target?.closest?.("[data-reader-parameters]");
      if(parametersButton){setPreferencesOpen(false);onParameters?.(current,prepared);return;}
      const sectionJump=event.target?.closest?.('[data-role="section-jump"]');
      if(sectionJump && !sectionJump.disabled){
        const menu=root.querySelector('[data-role="section-menu"]');
        if(menu){menu.hidden=!menu.hidden;sectionJump.setAttribute("aria-expanded",String(!menu.hidden));}
        setPreferencesOpen(false);
        return;
      }
      const sectionButton=event.target?.closest?.("[data-reader-section]");
      if(sectionButton){
        onSectionSelect?.(sectionButton.dataset.readerSection,current,prepared);
        closeSectionMenu();
        return;
      }
      const scholaToggle=event.target?.closest?.("[data-schola-toggle]");
      if(scholaToggle){
        scholaCollapsed=!scholaCollapsed;
        syncScholaChrome();
        return;
      }
      const scholaSlower=event.target?.closest?.("[data-schola-slower]");
      if(scholaSlower){changeScholaSpeed(-1);return;}
      const scholaFaster=event.target?.closest?.("[data-schola-faster]");
      if(scholaFaster){changeScholaSpeed(1);return;}
      const scholaPause=event.target?.closest?.("[data-schola-pause]");
      if(scholaPause){setScholaPaused(!scholaUserPaused,{user:true});return;}
      const scholaTranslate=event.target?.closest?.("[data-schola-translate]");
      if(scholaTranslate && current?.schola?.english){
        const opening=!scholaTranslationVisible;
        if(opening){
          scholaPausedBeforeTranslation=scholaPaused;
          scholaTranslationVisible=true;
          setScholaPaused(true);
        }else{
          scholaTranslationVisible=false;
          if(!scholaPausedBeforeTranslation&&!scholaUserPaused)setScholaPaused(false);
        }
        syncScholaContent();
        return;
      }
      const nav=event.target?.closest?.("[data-reader-nav]");
      if(nav && Date.now()<suppressNavClickUntil && nav.dataset.readerNav===suppressNavClickDirection){return;}
      if(nav?.dataset.readerNav==="previous"){
        navigateBy(-1,"click");
        return;
      }
      if(nav?.dataset.readerNav==="next"){
        navigateBy(1,"click");
        return;
      }
      const translatable=event.target?.closest?.('[data-translate-toggle="true"]');
      if(translatable){
        const primary=translatable.querySelector?.(".ao-line-primary");
        if(primary){
          const showingAlt=translatable.dataset.showingAlt === "true";
          const nextText=showingAlt ? translatable.dataset.primaryText : translatable.dataset.altText;
          const nextShowingAlt=!showingAlt;
          renderReaderText(primary,nextText,{
            anchor:translatable.dataset.ritualAnchor??null,
            active:translatable.dataset.ritualCueActive==="true",
          });
          translatable.dataset.showingAlt=String(nextShowingAlt);
        }
        return;
      }
      const guideClose=event.target?.closest?.("[data-guide-close]");
      if(guideClose){const pop=root.querySelector('[data-role="guide-popover"]');if(pop){pop.hidden=true;pop.replaceChildren?.();}return;}
      const guideBackdrop=event.target?.closest?.('[data-role="guide-popover"]');
      if(guideBackdrop && event.target===guideBackdrop){guideBackdrop.hidden=true;guideBackdrop.replaceChildren?.();return;}
      const guideButton=event.target?.closest?.('[data-role="guide-button"]');
      if(guideButton && !guideButton.disabled && current?.guide){
        const pop=root.querySelector('[data-role="guide-popover"]');
        if(pop){
          if(pop.hidden){renderGuideSheet(pop,current.guide);pop.hidden=false;}
          else{pop.hidden=true;pop.replaceChildren?.();}
        }
        onGuide?.(current.guide,current,prepared);
        return;
      }
      const rubric=event.target?.closest?.('.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]');
      if(rubric){rubric.dataset.expanded=String(rubric.dataset.expanded!=="true");return;}
    });
    // The donor edge arrows are real phone controls. Own touch navigation on
    // pointerdown: Playwright/Chromium and physical touchscreens both dispatch
    // this before the compatibility click, so the latter can be suppressed
    // deterministically without risking a lost touchend after card repaint.
    for(const navButton of root.querySelectorAll?.("[data-reader-nav]") ?? []){
      navButton.addEventListener?.("pointerdown",event=>{
        if(event.pointerType!=="touch")return;
        event.preventDefault?.();
        event.stopPropagation?.();
        suppressNavClickUntil=Date.now()+650;
        suppressNavClickDirection=navButton.dataset.readerNav??null;
        if(navButton.dataset.readerNav==="previous"){
          navigateBy(-1,"pointer");
        }else if(navButton.dataset.readerNav==="next"){
          navigateBy(1,"pointer");
        }
      });
    }
    const scrollCard=activeScrollCard();
    if(scrollCard?.addEventListener){
      scrollCard.addEventListener("scroll",()=>{
        setHandoff(1,atCardEdge(scrollCard,1));
      },{passive:true});
      scrollCard.addEventListener("wheel",event=>{
        if(!event.deltaY)return;
        const dir=event.deltaY>0?1:-1;
        if(!atCardEdge(scrollCard,dir)){wheelIntent={dir:0,amount:0,last:0};setHandoff(dir,false);return;}
        event.preventDefault?.();
        const now=Date.now();
        if(wheelIntent.dir!==dir||now-wheelIntent.last>260)wheelIntent={dir,amount:0,last:now};
        wheelIntent.last=now;wheelIntent.amount+=Math.min(140,Math.abs(Number(event.deltaY)||0));
        setHandoff(dir,true);
        if(wheelIntent.amount>=105)navigateBy(dir,"wheel-edge");
      },{passive:false});
      scrollCard.addEventListener("touchstart",event=>{
        const t=event.touches?.[0];swipeStart=t?{x:t.clientX,y:t.clientY,time:Date.now()}:null;
      },{passive:true});
      scrollCard.addEventListener("touchend",event=>{
        if(!swipeStart)return;
        const t=event.changedTouches?.[0],start=swipeStart;swipeStart=null;if(!t)return;
        const dx=t.clientX-start.x,dy=t.clientY-start.y;
        if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.25){
          event.preventDefault?.();navigateBy(dx<0?1:-1,"swipe");
        }
      },{passive:false});
    }
    root.addEventListener?.("keydown",event=>{
      const tag=String(event.target?.tagName??"").toUpperCase();if(["INPUT","SELECT","TEXTAREA"].includes(tag))return;
      if(event.key==="ArrowRight"){event.preventDefault?.();navigateBy(1,"keyboard");}
      else if(event.key==="ArrowLeft"){event.preventDefault?.();navigateBy(-1,"keyboard");}
    });
    // v1.80 Mass-preferences mode controls own touch on pointerdown for the
    // same reason as the edge arrows: a physical tap must commit the switch
    // even while the reader rebuilds beneath the preferences sheet.
    for(const modeButton of root.querySelectorAll?.("[data-reader-mode]") ?? []){
      modeButton.addEventListener?.("pointerdown",event=>{
        if(event.pointerType!=="touch")return;
        event.preventDefault?.();
        event.stopPropagation?.();
        suppressModeClickUntil=Date.now()+650;
        setMode(modeButton.dataset.readerMode);
      });
      modeButton.addEventListener?.("click",event=>{
        event.preventDefault?.();
        event.stopPropagation?.();
        if(Date.now()<suppressModeClickUntil)return;
        setMode(modeButton.dataset.readerMode);
      });
    }
    const resize=root.querySelector?.("[data-schola-resize]");
    if(resize?.addEventListener){
      let pointerId=null,startY=0,startHeight=scholaHeight;
      resize.addEventListener("pointerdown",event=>{
        pointerId=event.pointerId;startY=event.clientY;startHeight=scholaCollapsed?52:scholaHeight;
        resize.setPointerCapture?.(pointerId);event.preventDefault?.();
      });
      resize.addEventListener("pointermove",event=>{
        if(pointerId==null||event.pointerId!==pointerId)return;
        const next=Math.max(32,Math.min(180,startHeight+(startY-event.clientY)));
        scholaCollapsed=next<44;
        scholaHeight=scholaCollapsed?32:next;
        syncScholaChrome();
      });
      const finish=event=>{
        if(pointerId==null||event.pointerId!==pointerId)return;
        resize.releasePointerCapture?.(pointerId);pointerId=null;
      };
      resize.addEventListener("pointerup",finish);
      resize.addEventListener("pointercancel",finish);
    }
  }

  function mount(nextPrepared){
    if(!nextPrepared?.session?.resolvedMass) throw new TypeError("Prepared Mass session required");
    prepared=nextPrepared;
    mode=normalizePresentationMode(prepared.readerPreferences?.mode ?? prepared.session.resolvedMass.presentationMode);
    root.innerHTML=buildReaderShellMarkup(prepared);
    const shell=root.querySelector("[data-ao-reader-shell]");
    if(shell)shell.dataset.modeSwitchLocked=String(!allowPresentationModeSwitch);
    if(!allowPresentationModeSwitch){
      for(const button of root.querySelectorAll?.("[data-reader-mode]") ?? []){
        button.disabled=true;
        button.title="Mode switching is locked until v1.83 reader parity is certified";
      }
    }
    populateSections();
    setPreferencesOpen(false);
    scholaSpeed=loadScholaSpeed();
    scholaPaused=scholaUserPaused;
    syncScholaControls();
    syncScholaChrome();
    syncScholaContent();
    syncRailVisibility(root);
    bound=false;
    bind();
    return prepared;
  }

  function renderMoment(moment){
    if(!prepared) throw new Error("Reader shell must be mounted before rendering moments");
    current=normalizeReaderMoment(moment,current ?? {});
    setText(root,"section-title",current.sectionTitle);
    for(const button of root.querySelectorAll?.("[data-reader-section]")??[]){
      const active=button.dataset.readerSection===current.id;
      if(active)button.setAttribute("aria-current","true");else button.removeAttribute?.("aria-current");
    }
    setText(root,"card-title",current.cardTitle);
    setText(root,"progress",current.progress);
    setText(root,"priest-position",textValue(current.priestPosition));
    setText(root,"priest-action",textValue(current.priestAction));
    setText(root,"posture",textValue(current.posture));
    setText(root,"gesture",textValue(current.gesture));
    setText(root,"response",textValue(current.response));
    const visibleBell=displayBell(current.bell);
    setText(root,"bell",visibleBell ? [textValue(visibleBell),visibleBell.detail].filter(Boolean).join(" · ") : null);
    setText(root,"priest-voice",textValue(current.priestVoice));
    setText(root,"schola",current.scholaVisible ? textValue(current.schola) : null);
    const titleNode=root.querySelector('[data-role="card-title"]');
    if(titleNode)titleNode.hidden=true;
    const guideShort=root.querySelector('[data-role="guide-short"]');
    if(guideShort){
      guideShort.hidden=false;
      guideShort.textContent=current.guide?.moment ? "OPEN" : "RUBRICS";
    }

    setChannel(root,"posture",current.posture);
    setChannel(root,"priest-action",current.priestAction);
    setChannel(root,"gesture",current.gesture);
    setChannel(root,"response",current.response);
    setChannel(root,"bell",visibleBell);
    setChannel(root,"priest-voice",current.priestVoice);
    setChannel(root,"schola-shared",current.scholaShared ? current.schola : null);
    setChannel(root,"schola",current.scholaVisible ? current.schola : null);
    syncScholaChrome();
    syncScholaContent();
    syncProgress();
    syncRailVisibility(root);

    applyIcon(root,"priest-position",current.priestPositionIconKey,iconResolver);
    applyIcon(root,"posture-top",current.postureIconKey,iconResolver);
    applyIcon(root,"posture",current.postureIconKey,iconResolver);
    applyIcon(root,"gesture",current.gestureIconKey,iconResolver);
    applyIcon(root,"response",current.responseIconKey,iconResolver);
    applyIcon(root,"priest-voice",current.priestVoiceIconKey,iconResolver);
    applyIcon(root,"priest-action",current.priestActionIconKey,iconResolver);
    applyIcon(root,"priest-action-top",current.priestActionIconKey,iconResolver);
    applyIcon(root,"bell",visibleBell ? (current.bellIconKey??"bells") : null,iconResolver);
    applyIcon(root,"schola-shared",current.scholaShared ? current.scholaIconKey : null,iconResolver);
    applyIcon(root,"schola",current.scholaIconKey,iconResolver);

    const actionBadge=root.querySelector('[data-role="priest-action-badge"]');
    const actionRail=root.querySelector('[data-channel="priest-action"]');
    const majorCue=new Set(["AO.SM.C0161","AO.SM.C0174","AO.SM.C0181","AO.SM.C0225","AO.SM.C0265","AO.SM.C0273"]);
    const activeCue=current.cinematic?.cueId ?? current.bell?.cueId ?? current.priestAction?.cueId ?? null;
    const actionActive=Boolean(textValue(current.priestAction) && current.priestActionIconKey);
    if(actionBadge){actionBadge.dataset.active=String(actionActive);actionBadge.dataset.major=String(Boolean(actionActive&&majorCue.has(activeCue)));}
    if(actionRail)actionRail.dataset.major=String(Boolean(actionActive&&majorCue.has(activeCue)));
    const bellRail=root.querySelector('[data-channel="bell"]');
    if(bellRail)bellRail.dataset.major=String(Boolean(visibleBell&&majorCue.has(visibleBell.cueId??activeCue)));

    const cinematic=root.querySelector('[data-role="cinematic"]');
    if(cinematic){
      const visible=Boolean(current.cinematic);
      const kind=visible ? String(current.cinematic.kind??"TRANSIENT") : "";
      cinematic.hidden=!visible;
      cinematic.dataset.kind=kind;
      setText(root,"cinematic-title",visible ? current.cinematic.title : null);
      setText(root,"cinematic-sub",visible ? current.cinematic.subtitle : null);
      applyIcon(root,"cinematic",visible && kind==="ELEVATION" ? current.priestActionIconKey : null,iconResolver);
    }

    const guideButton=root.querySelector('[data-role="guide-button"]');
    if(guideButton){
      guideButton.disabled=!current.guide;
      guideButton.title=current.guide?.text??"Guide";
    }
    const pop=root.querySelector('[data-role="guide-popover"]');
    if(pop){pop.hidden=true;pop.replaceChildren?.();}

    const body=root.querySelector('[data-role="paragraphs"]');
    if(body && current.cardUpdate){
      body.replaceChildren();
      const doc=body.ownerDocument ?? globalThis.document;
      if(doc?.createElement){
        for(const p of current.paragraphs){
          const node=doc.createElement("p");
          node.className="ao-reader-paragraph";
          node.dataset.kind=p.kind;
          node.dataset.active=String(p.active);
          if(p.kind==="RUBRIC"){
            const rubricText=stripRubricBrackets(p.primary);
            node.dataset.stateDuplicate=String(rubricIsStateDuplicate(rubricText));
            node.dataset.rubricExpandable=String(rubricText.length>180);
            node.dataset.expanded="false";
          }
          if(p.sourceCueIds?.length) node.dataset.sourceCueIds=p.sourceCueIds.join(" ");
          const exactCueIds=(p.sourceCueIds??[]).filter(id=>/^AO\.SM\.C\d{4}$/.test(String(id)));
          if(exactCueIds.length===1) node.dataset.cueId=exactCueIds[0];
          if(p.replaceOnToggle && p.alternate){
            node.dataset.translateToggle="true";
            node.dataset.primaryText=p.primary;
            node.dataset.altText=p.alternate;
            node.dataset.showingAlt="false";
            node.tabIndex=0;
          }
          const primary=doc.createElement("span");
          primary.className="ao-line-primary";
          const gestureCueId=String(current.gesture?.canonicalCueId??current.gesture?.cueId??"");
          const ritualCueActive=Boolean(
            p.active &&
            current.gesture?.anchorLat &&
            gestureCueId &&
            exactCueIds.includes(gestureCueId)
          );
          if(ritualCueActive){
            node.dataset.ritualAnchor=String(current.gesture.anchorLat);
            node.dataset.ritualCueActive="true";
          }
          renderReaderText(primary,p.kind==="RUBRIC"?stripRubricBrackets(p.primary):p.primary,{
            anchor:ritualCueActive ? current.gesture.anchorLat : null,
            active:ritualCueActive,
          });
          node.append(primary);
          if(p.secondary){
            const secondary=doc.createElement("span");
            secondary.className="ao-line-secondary";
            secondary.textContent=p.secondary;
            node.append(secondary);
          }
          body.append(node);
        }
      }
    }
    return current;
  }

  function setSections(nextSections=[]){
    sectionItems=Array.isArray(nextSections)?[...nextSections]:[];
    populateSections();
    return Object.freeze([...sectionItems]);
  }

  function destroy(){
    if(bellHoldTimer)clearTimeout(bellHoldTimer);
    cancelScholaTicker({clearIdentity:true});
    bellHoldTimer=0;heldBell=null;bellHoldUntil=0;
    scholaPaused=false;scholaUserPaused=false;scholaTranslationVisible=false;
    prepared=null;current=null;bound=false;sectionItems=[];root.innerHTML="";
  }

  return Object.freeze({
    mount,renderMoment,setMode,setSections,destroy,
    getState:()=>current,
    getMode:()=>mode,
    canSwitchPresentationMode:()=>allowPresentationModeSwitch,
  });
}
