import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { normalizePresentationMode } from "./session-engine.js";

const SHELL_STYLE = `
.ao-reader-shell{
  --ao-bg:#0d120f;--ao-panel:#141c17;--ao-panel2:#19231d;
  --ao-line:rgba(238,241,233,.13);--ao-muted:#a9afa7;--ao-dim:#6f766f;
  --ao-text:#eef1e9;--ao-accent:#6d9575;--ao-warm:#d6caa6;--ao-response:#c8d9e9;
  --ao-rail:62px;--ao-content-max:820px;--ao-schola-height:100px;
  box-sizing:border-box;position:relative;display:grid;grid-template-rows:auto auto minmax(0,1fr);
  width:100%;height:100%;min-height:0;overflow:hidden;
  background:linear-gradient(180deg,#0c120e 0,#101711 100%);color:var(--ao-text);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif
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
.ao-reader-top-action .ao-reader-top-copy{font:700 .52rem/1 system-ui,sans-serif;letter-spacing:.08em}
.ao-reader-top-icon{display:block;width:29px;height:29px;background:currentColor}
.ao-section-jump{
  appearance:none;border:0;background:transparent;color:#f1f3ee;min-width:0;height:46px;padding:0 8px;
  display:flex;align-items:center;justify-content:center;gap:8px;cursor:pointer;
  font:600 15px/1.1 Georgia,"Times New Roman",serif;letter-spacing:.015em;
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
.ao-section-jump [data-role="section-title"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ao-section-caret{font:500 16px/1 system-ui,sans-serif;color:#78867b}

.ao-mass-prefs{
  position:absolute;z-index:34;top:58px;right:8px;width:min(310px,calc(100% - 16px));
  padding:13px;border:1px solid rgba(255,255,255,.075);border-radius:14px;
  background:rgba(8,13,10,.985);box-shadow:0 18px 60px rgba(0,0,0,.5);
  opacity:0;visibility:hidden;pointer-events:none;transform:translateY(-8px);transition:.18s ease
}
.ao-mass-prefs[data-open="true"]{opacity:1;visibility:visible;pointer-events:auto;transform:none}
.ao-mass-prefs-head{display:flex;justify-content:space-between;align-items:center;color:#e3e8e3;font:600 15px Georgia,serif}
.ao-mass-prefs-close{appearance:none;border:0;background:transparent;color:#89958c;font-size:22px;line-height:1;padding:3px 5px}
.ao-mass-prefs-group{margin-top:14px}
.ao-mass-prefs-group>small{display:block;margin-bottom:7px;color:#6e7a72;font:700 8px/1 system-ui,sans-serif;letter-spacing:.12em;text-transform:uppercase}
.ao-mode-ribbon{display:grid;grid-template-columns:repeat(3,1fr);gap:5px}
.ao-mode-ribbon button{
  appearance:none;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.025);color:#929a93;
  min-width:0;height:36px;padding:0 7px;border-radius:9px;font:700 8px/1 system-ui,sans-serif;letter-spacing:.09em
}
.ao-mode-ribbon button[aria-pressed="true"]{background:#26342b;color:#fbfbf5;border-color:rgba(140,174,149,.22)}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button{cursor:default}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button:not([aria-pressed="true"]){opacity:.34}
.ao-mass-prefs-more{
  width:100%;margin-top:12px;min-height:36px;border:1px solid rgba(255,255,255,.07);border-radius:9px;
  background:#0d130f;color:#c4ccc5;font:700 8px/1 system-ui,sans-serif;letter-spacing:.09em;text-transform:uppercase
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
.ao-state-kicker{font:700 7px/1 system-ui,sans-serif;letter-spacing:.12em;color:#657268}
.ao-state-copy{min-width:0;display:flex;flex-direction:column}
.ao-state-label{
  max-width:132px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:600 10px/1.15 system-ui,sans-serif;letter-spacing:.045em;color:#c9d1ca
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
.ao-guide-copy small{font:700 7px/1 system-ui,sans-serif;letter-spacing:.11em;color:#77847a}
.ao-guide-short{display:block;max-width:92px;font:600 8px/1.05 system-ui,sans-serif;letter-spacing:.045em;color:#d5ddd6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
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
  font:500 .69rem/1.25 system-ui,sans-serif
}
.ao-section-menu button:last-child{border-bottom:0}
.ao-section-menu button[aria-current="true"]{color:#f3f4ee;background:rgba(80,120,91,.14)}

.ao-reader-stage{min-height:0;position:relative;isolation:isolate;overflow:hidden}
.ao-card-viewport{
  width:100%;height:100%;min-width:0;min-height:0;margin:0;padding:0 calc(var(--ao-rail) + 8px);background:transparent
}
.ao-prayer-card{
  width:100%;height:100%;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;
  scrollbar-width:none;scroll-behavior:auto;scroll-padding-top:clamp(44px,8vh,82px);
  padding:clamp(28px,4.5vh,48px) max(18px,calc((100% - 790px)/2)) max(42vh,250px);
  border:0;border-radius:0;background:transparent;box-shadow:none
}
.ao-prayer-card::-webkit-scrollbar{display:none}
.ao-prayer-title{
  margin:0 auto 26px;max-width:760px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,.045);
  font:400 clamp(1.15rem,2.3vw,1.55rem)/1.18 Georgia,"Times New Roman",serif;
  letter-spacing:.018em;color:#e7ebe5
}
.ao-prayer-title[hidden]{display:none}
.ao-prayer-body{max-width:790px;margin:0 auto;display:flex;flex-direction:column;gap:4px}
.ao-reader-paragraph{
  position:relative;margin:0 0 2px;padding:2px 0;border-radius:6px;
  font:400 clamp(1.18rem,2.45vw,1.68rem)/1.69 Georgia,"Times New Roman",serif;
  color:var(--ao-text);opacity:.43;font-kerning:normal;font-variant-ligatures:common-ligatures contextual;text-rendering:optimizeLegibility;
  -webkit-font-smoothing:antialiased;transition:opacity .28s ease,transform .28s cubic-bezier(.16,.72,.18,1),color .16s ease,text-shadow .28s ease,filter .28s ease
}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph{opacity:.43}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"]{opacity:1;color:#f7f8f4;transform:translateX(2px);text-shadow:0 0 26px rgba(225,238,228,.065)}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph,
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.70}
.ao-reader-paragraph[data-kind="RUBRIC"]{
  margin:10px 0;padding:8px 10px;border-left:2px solid #65756a;
  background:rgba(255,255,255,.022);font:italic 500 .74rem/1.45 system-ui,sans-serif;
  letter-spacing:.01em;color:#aab0a9
}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{
  margin:14px 0;padding:14px 8px;text-align:center;
  font-size:clamp(1.45rem,3.8vw,2rem);line-height:1.34;letter-spacing:.035em;color:#fff
}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"] .ao-line-secondary{margin-top:8px;font-size:.60em;color:#b8c2b9}
.ao-reader-paragraph[data-kind="RESPONSE"]{padding-left:14px;border-left:2px solid rgba(200,217,233,.50);color:#dbe5ee}
.ao-reader-paragraph[data-translate-toggle="true"]{cursor:pointer}
.ao-reader-paragraph[data-translate-toggle="true"]:focus-visible{outline:1px solid rgba(109,149,117,.7);outline-offset:4px}
.ao-line-primary{display:block}
.ao-line-secondary{
  display:block;margin-top:4px;padding:4px 0 8px 12px;border-left:1px solid rgba(255,255,255,.09);
  font:400 .67em/1.5 system-ui,sans-serif;color:#b8c2b9
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
.ao-rail .ao-icon-mask{width:36px;height:36px}

.ao-schola-dock{
  position:absolute;z-index:9;left:50%;bottom:max(9px,env(safe-area-inset-bottom));transform:translateX(-50%);
  width:min(940px,calc(100% - 170px));height:var(--ao-schola-height);min-height:100px;max-height:180px;
  display:grid;grid-template-columns:auto minmax(0,1fr) auto;grid-template-rows:auto minmax(42px,auto) auto;
  align-items:center;gap:6px 10px;padding:11px 16px 13px;
  border:1px solid rgba(109,149,117,.38);border-radius:16px;background:rgba(17,25,20,.968);
  box-shadow:0 15px 46px rgba(0,0,0,.34);color:#f0f1eb;overflow:hidden
}
.ao-schola-dock[data-active="false"]{display:none}
.ao-schola-dock[data-collapsed="true"]{min-height:32px;height:32px;padding-top:4px;padding-bottom:4px}
.ao-schola-dock[data-collapsed="true"] .ao-schola-main,
.ao-schola-dock[data-collapsed="true"] .ao-schola-meta{display:none}
.ao-schola-resize{position:absolute;top:0;left:25%;right:25%;height:10px;cursor:ns-resize;touch-action:none}
.ao-schola-resize:before{content:"";position:absolute;left:50%;top:3px;width:34px;height:2px;border-radius:2px;background:rgba(109,149,117,.28);transform:translateX(-50%)}
.ao-schola-title{display:flex;align-items:center;gap:7px;grid-column:1/3;min-height:24px}
.ao-schola-title .ao-icon-mask{width:22px;height:22px;color:#a9c6b0}
.ao-schola-kicker{font:700 8.5px/1 system-ui,sans-serif;letter-spacing:.13em;text-transform:uppercase;color:#99b6a0}
.ao-schola-page{font:700 8px/1 system-ui,sans-serif;letter-spacing:.12em;color:#6f8175}
.ao-schola-main{grid-column:1/4;min-width:0;border-top:1px solid rgba(255,255,255,.045);border-bottom:1px solid rgba(255,255,255,.045);padding:10px 0;cursor:pointer}
.ao-schola-dock [data-role="schola"]{display:block;min-width:0;font:500 17px/1.3 Georgia,"Times New Roman",serif;color:#f2f3ed;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ao-schola-translation{display:none;margin-top:7px;padding:8px 10px;border-radius:9px;background:rgba(255,255,255,.035);border:1px solid rgba(255,255,255,.05);font:400 14px/1.42 Georgia,"Times New Roman",serif;color:#d8dfd8}
.ao-schola-dock[data-show-translation="true"] .ao-schola-translation{display:block}
.ao-schola-meta{grid-column:1/3;display:flex;align-items:center;gap:8px}
.ao-schola-progress{height:2px;flex:1;background:rgba(255,255,255,.07);overflow:hidden;border-radius:99px}
.ao-schola-progress>span{display:block;height:100%;width:0;background:#8eae96;transition:width .18s linear}
.ao-schola-toggle{grid-column:3;grid-row:1;appearance:none;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.035);color:#9eada2;border-radius:7px;min-height:28px;padding:4px 8px;font:700 8px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase}

.ao-reader-nav{position:absolute;z-index:5;inset:0;pointer-events:none}
.ao-reader-nav button{
  position:absolute;top:52%;width:44px;height:44px;border:0;border-radius:999px;
  background:transparent;color:#828d85;cursor:pointer;pointer-events:auto;
  font:400 1.55rem/1 Georgia,serif;opacity:.10;
  transition:opacity .2s ease,transform .24s cubic-bezier(.22,.72,.22,1),color .2s ease
}
.ao-reader-nav button::before{
  content:"";position:absolute;inset:3px;border-radius:999px;background:rgba(15,23,17,.70);
  box-shadow:0 9px 28px rgba(0,0,0,.18);backdrop-filter:blur(12px);pointer-events:none
}
.ao-reader-nav button:hover,.ao-reader-nav button:focus-visible{opacity:.92;background:rgba(23,32,26,.90);color:#e8ece7;outline:none}
.ao-reader-nav button[data-reader-nav="previous"]{left:max(49px,calc((100% - 1120px)/2 + 52px))}
.ao-reader-nav button[data-reader-nav="next"]{right:max(49px,calc((100% - 1120px)/2 + 52px))}
.ao-reader-progress{display:none}

.ao-cinematic{
  position:absolute;inset:0;z-index:22;display:grid;place-items:center;pointer-events:none;text-align:center;padding:2rem;
  opacity:1;visibility:visible;background:rgba(7,11,8,.93)
}
.ao-cinematic[hidden]{display:none}
.ao-cinematic-inner{display:grid;gap:9px;justify-items:center;max-width:88%}
.ao-cinematic-mark{font:400 1.35rem/1 Georgia,serif;color:var(--ao-warm)}
.ao-cinematic-title{font:400 clamp(1.2rem,4vw,2rem)/1.15 Georgia,"Times New Roman",serif;letter-spacing:.08em;color:#f0f1e9}
.ao-cinematic-sub{font:600 .63rem/1.3 system-ui,sans-serif;letter-spacing:.11em;color:#89928a}
.ao-cinematic[data-kind="ELEVATION"]{background:radial-gradient(circle at center,rgba(226,211,158,.075),rgba(3,7,5,0) 43%)}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner{
  position:relative;width:min(43vw,210px);aspect-ratio:1;border-radius:50%;display:grid;place-items:center;
  background:radial-gradient(circle,rgba(239,233,210,.12),rgba(20,27,22,.44) 48%,rgba(7,10,8,.15) 70%,transparent 72%);
  filter:drop-shadow(0 0 28px rgba(230,214,157,.14));animation:aoElevation 3.35s cubic-bezier(.18,.72,.22,1) both
}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-mark{font-size:clamp(2.4rem,10vw,5.6rem);color:#efe9d2}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-title{display:none}
.ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-sub{
  position:absolute;top:calc(100% + 14px);white-space:nowrap;font:600 10px/1.2 Cinzel,Georgia,serif;
  letter-spacing:.14em;text-transform:uppercase;color:rgba(238,235,217,.74)
}
@keyframes aoElevation{0%{opacity:0;transform:translateY(28px) scale(.72)}16%{opacity:1;transform:translateY(0) scale(1.03)}72%{opacity:1;transform:translateY(-5px) scale(1)}100%{opacity:0;transform:translateY(-16px) scale(.96)}}

.ao-guide-popover{
  position:absolute;z-index:30;left:50%;bottom:0;transform:translateX(-50%);
  width:min(760px,100%);max-height:min(84vh,860px);overflow:auto;
  padding:18px 18px 34px;border:1px solid rgba(218,225,218,.10);border-bottom:0;border-radius:18px 18px 0 0;
  background:#0c120e;box-shadow:0 -22px 60px rgba(0,0,0,.44);
  font:400 14px/1.62 Georgia,"Times New Roman",serif;color:#c4c8c2
}
.ao-guide-popover[hidden]{display:none}

@media(max-width:760px){
  .ao-reader-shell{--ao-rail:48px}
  .ao-reader-top-ribbon{grid-template-columns:56px minmax(0,1fr) 56px;height:56px;min-height:56px;padding:4px 5px}
  .ao-reader-top-action{width:44px;height:44px}.ao-reader-top-icon{width:28px;height:28px}
  .ao-section-jump{font-size:14px}
  .ao-state-ribbon{grid-template-columns:minmax(0,1fr) 80px minmax(0,1fr);height:64px;min-height:64px}
  .ao-state-cell{gap:7px;padding:5px 6px}
  .ao-state-cell>.ao-icon-mask{width:46px;height:46px;flex-basis:46px}
  .ao-state-label{font-size:9px;max-width:102px}
  .ao-guide-icon{width:29px;height:29px;flex-basis:29px}.ao-guide-icon svg{width:26px;height:26px}
  .ao-guide-copy{gap:1px}.ao-guide-copy small{font-size:5.8px}.ao-guide-short{font-size:6.6px;max-width:38px}
  .ao-progress-track{top:120px}
  .ao-section-menu{top:58px;width:min(92vw,440px)}
  .ao-mass-prefs{top:58px;right:8px;width:min(310px,calc(100% - 16px))}
  .ao-card-viewport{width:100%;padding:0 61px}
  .ao-prayer-card{padding:22px 12px max(42vh,240px)}
  .ao-reader-paragraph{font-size:19px;line-height:1.55}
  .ao-rail{top:8px;bottom:20px;width:48px;gap:6px}
  .ao-rail-left{left:5px}.ao-rail-right{right:5px}
  .ao-rail-item{width:48px;height:48px;min-height:48px}
  .ao-rail-item[data-major="true"]{width:58px;height:58px;min-height:58px}
  .ao-rail .ao-icon-mask{width:34px;height:34px}
  .ao-schola-dock{width:calc(100% - 124px);min-height:100px;padding:9px 11px 11px}
  .ao-schola-dock [data-role="schola"]{font-size:14px}.ao-schola-translation{font-size:12px;padding:7px 8px}
  .ao-reader-nav button{top:auto;bottom:15px;width:34px;height:34px;border-radius:50%;font-size:20px;opacity:.34;background:rgba(11,16,13,.38)}
  .ao-reader-nav button[data-reader-nav="previous"]{left:67px}.ao-reader-nav button[data-reader-nav="next"]{right:67px}
  .ao-guide-popover{width:100%;max-height:89vh;border-radius:16px 16px 0 0;padding:15px 14px 28px}
  .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner{width:min(48vw,190px)}
}
@media(prefers-reduced-motion:reduce){
  .ao-reader-paragraph,.ao-rail-item,.ao-reader-nav button{transition:none!important}
  .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner{animation:none!important}
}
`;

function esc(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}

function topAssetMask(assetId,fallback){
  const url=resolveCanonicalAssetUrl(assetId);
  if(!url)return `<span class="ao-reader-top-copy">${esc(fallback)}</span>`;
  return `<span class="ao-reader-top-icon" data-ao-asset-id="${esc(assetId)}" data-ao-asset-renderer="mask" aria-hidden="true" style="-webkit-mask:url('${esc(url)}') center/contain no-repeat;mask:url('${esc(url)}') center/contain no-repeat"></span>`;
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
    ? Object.freeze({text:String(moment.guide.text),detail:moment.guide.detail == null ? null : String(moment.guide.detail)})
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
    scholaVisible:!sharedTextWithSchola && Boolean(textValue(schola)),
    guide,
    priestPositionIconKey:moment.priestPositionIconKey ?? moment.priestActionIconKey ?? null,
    priestActionIconKey:moment.priestActionIconKey ?? null,
    postureIconKey:moment.postureIconKey ?? null,
    gestureIconKey:moment.gestureIconKey ?? null,
    responseIconKey:moment.responseIconKey ?? null,
    priestVoiceIconKey:moment.priestVoiceIconKey ?? null,
    scholaIconKey:moment.scholaIconKey ?? null,
  });
}

export function buildReaderShellMarkup(prepared = {}) {
  const mode = normalizePresentationMode(prepared?.readerPreferences?.mode ?? prepared?.session?.resolvedMass?.presentationMode ?? "LIVE");
  const section = esc(prepared?.session?.resolvedMass?.actualCelebration?.title ?? "Mass");
  return `<style data-ao-reader-shell-style>${SHELL_STYLE}</style>
<section class="ao-reader-shell" data-ao-reader-shell data-mode="${mode}">
  <header class="ao-reader-top-ribbon" aria-label="Mass navigation">
    <button class="ao-reader-top-action" type="button" data-reader-home data-ao-asset-id="ao-nav-home" data-ao-asset-renderer="mask" aria-label="Back to Ad Orientem home">${topAssetMask("ao-nav-home","HOME")}</button>
    <button class="ao-section-jump" type="button" data-role="section-jump" aria-expanded="false" disabled><span data-role="section-title">${section}</span><span class="ao-section-caret" aria-hidden="true">⌄</span></button>
    <button class="ao-reader-top-action" type="button" data-reader-preferences data-ao-asset-id="ao-nav-settings" data-ao-asset-renderer="mask" aria-label="Mass preferences" aria-expanded="false">${topAssetMask("ao-nav-settings","PARAMS")}</button>
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
    <div class="ao-mass-prefs-group"><small>Reader mode</small><nav class="ao-mode-ribbon" aria-label="Reader mode">${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}">${m}</button>`).join("")}</nav></div>
    <button class="ao-mass-prefs-more" type="button" data-reader-parameters>App settings</button>
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

    <aside class="ao-rail ao-rail-right" data-visible="true" aria-label="Priest and bell cues">
      <div class="ao-rail-item" data-channel="priest-voice" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-voice" hidden></span><span class="ao-rail-copy" data-role="priest-voice">—</span></div>
      <div class="ao-rail-item" data-channel="priest-action" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-action" hidden></span><span class="ao-rail-copy" data-role="priest-action">—</span></div>
      <div class="ao-rail-item" data-channel="bell" data-active="false"><span class="ao-rail-copy" data-role="bell">—</span></div>
    </aside>
  </div>

  <div class="ao-schola-dock" data-channel="schola" data-active="false" data-collapsed="false" data-show-translation="false">
    <span class="ao-schola-resize" data-schola-resize aria-hidden="true"></span>
    <div class="ao-schola-title"><span class="ao-icon-mask" data-icon-slot="schola" hidden></span><span class="ao-schola-kicker">SCHOLA</span><span class="ao-schola-page" data-role="schola-page"></span></div>
    <button class="ao-schola-toggle" type="button" data-schola-toggle aria-label="Hide Schola">HIDE</button>
    <div class="ao-schola-main" data-schola-translate title="Tap to show translation"><span data-role="schola">—</span><span class="ao-schola-translation" data-role="schola-translation"></span></div>
    <div class="ao-schola-meta"><span class="ao-schola-progress"><span data-role="schola-progress"></span></span></div>
  </div>

  <div class="ao-cinematic" data-role="cinematic" aria-live="polite" hidden>
    <div class="ao-cinematic-inner"><div class="ao-cinematic-mark">✠</div><div class="ao-cinematic-title" data-role="cinematic-title"></div><div class="ao-cinematic-sub" data-role="cinematic-sub"></div></div>
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
  const src = key && typeof iconResolver === "function" ? iconResolver(key) : null;
  if(!src){el.hidden=true;el.style.maskImage="";el.style.webkitMaskImage="";return;}
  el.hidden=false;
  const css=`url("${String(src).replace(/"/g,'\\\"')}")`;
  el.style.maskImage=css;
  el.style.webkitMaskImage=css;
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
  let scholaHeight=100;
  let scholaTranslationVisible=false;
  let scholaIdentity=null;
  let heldBell=null;
  let bellHoldUntil=0;
  let bellHoldTimer=0;

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

  function syncScholaContent(){
    const dock=root.querySelector(".ao-schola-dock");
    if(!dock)return;
    const schola=current?.scholaVisible ? current.schola : null;
    const identity=schola ? [schola.trackId,schola.segmentId,schola.cueId].filter(Boolean).join("|") : null;
    if(identity!==scholaIdentity){scholaIdentity=identity;scholaTranslationVisible=false;}
    dock.dataset.showTranslation=String(Boolean(scholaTranslationVisible && schola?.english));
    setText(root,"schola",schola ? (schola.latin??textValue(schola)) : null);
    setText(root,"schola-translation",schola?.english??null);
    const page=root.querySelector('[data-role="schola-page"]');
    if(page)page.textContent=schola?.total ? String((Number(schola.index)||0)+1)+" / "+String(schola.total) : "";
    const progress=root.querySelector('[data-role="schola-progress"]');
    if(progress){
      const total=Math.max(1,Number(schola?.total)||1);
      const index=Math.max(0,Number(schola?.index)||0);
      progress.style.width=schola ? String(Math.min(100,((index+1)/total)*100))+"%" : "0%";
    }
  }

  function syncScholaChrome(){
    const dock=root.querySelector(".ao-schola-dock");
    if(!dock)return;
    dock.dataset.collapsed=String(scholaCollapsed);
    dock.style.setProperty?.("--ao-schola-height",scholaHeight+"px");
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
      const scholaTranslate=event.target?.closest?.("[data-schola-translate]");
      if(scholaTranslate && current?.schola?.english){
        scholaTranslationVisible=!scholaTranslationVisible;
        syncScholaContent();
        return;
      }
      const modeButton=event.target?.closest?.("[data-reader-mode]");
      if(modeButton){setMode(modeButton.dataset.readerMode);return;}
      const nav=event.target?.closest?.("[data-reader-nav]");
      if(nav?.dataset.readerNav==="previous"){onPrevious?.(current,prepared);return;}
      if(nav?.dataset.readerNav==="next"){onNext?.(current,prepared);return;}
      const translatable=event.target?.closest?.('[data-translate-toggle="true"]');
      if(translatable){
        const primary=translatable.querySelector?.(".ao-line-primary");
        if(primary){
          const showingAlt=translatable.dataset.showingAlt === "true";
          primary.textContent=showingAlt ? translatable.dataset.primaryText : translatable.dataset.altText;
          translatable.dataset.showingAlt=String(!showingAlt);
        }
        return;
      }
      const guideButton=event.target?.closest?.('[data-role="guide-button"]');
      if(guideButton && !guideButton.disabled && current?.guide){
        const pop=root.querySelector('[data-role="guide-popover"]');
        if(pop){
          const wasHidden=pop.hidden;
          pop.hidden=!wasHidden;
          if(wasHidden) pop.textContent=current.guide.detail ?? current.guide.text;
        }
        onGuide?.(current.guide,current,prepared);
      }
    });
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
      guideShort.textContent=current.guide?.text ? "OPEN" : "RUBRICS";
    }

    setChannel(root,"posture",current.posture);
    setChannel(root,"priest-action",current.priestAction);
    setChannel(root,"gesture",current.gesture);
    setChannel(root,"response",current.response);
    setChannel(root,"bell",visibleBell);
    setChannel(root,"priest-voice",current.priestVoice);
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
      cinematic.hidden=!visible;
      cinematic.dataset.kind=visible ? String(current.cinematic.kind??"TRANSIENT") : "";
      setText(root,"cinematic-title",visible ? current.cinematic.title : null);
      setText(root,"cinematic-sub",visible ? current.cinematic.subtitle : null);
    }

    const guideButton=root.querySelector('[data-role="guide-button"]');
    if(guideButton){
      guideButton.disabled=!current.guide;
      guideButton.title=current.guide?.text??"Guide";
    }
    const pop=root.querySelector('[data-role="guide-popover"]');
    if(pop){pop.hidden=true;pop.textContent="";}

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
          primary.textContent=p.primary;
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
    bellHoldTimer=0;heldBell=null;bellHoldUntil=0;
    prepared=null;current=null;bound=false;sectionItems=[];root.innerHTML="";
  }

  return Object.freeze({
    mount,renderMoment,setMode,setSections,destroy,
    getState:()=>current,
    getMode:()=>mode,
    canSwitchPresentationMode:()=>allowPresentationModeSwitch,
  });
}
