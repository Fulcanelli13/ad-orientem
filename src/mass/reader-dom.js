import { glossaryContextCapsule } from "../app/contextual-study.js";
import { decorateLiturgicalSpeaker } from "../app/liturgical-speakers.js";
import { insertChantPhraseBreaks } from "./reader-chant-line-layout.js";
import { missalSourceRubricCopy } from "./reader-missal-book-rubrics.js";
import { conciseMissalSourceRubric, conciseMissalInlineSequence } from "./reader-rubric-presentation.js";
import { R17_ICON_KEYS } from "./reader-icons.js";
import { normalizePresentationMode } from "./session-engine.js";
import { resolveMassLiturgicalTheme, massThemeCssVariables } from "./reader-liturgical-theme.js";
import { R17_DONOR_PNG_ICON_KEYS, R17_FROZEN_ACTIVE_ICON_ASSETS } from "./reader-icon-bank.js";
import { exactIconBackedRubric } from "./reader-icon-backed-rubrics.js";
import { approvedFingerRubricArt } from "./reader-approved-finger-art.js";
import { approvedPriestRubricGestureArt } from "./reader-approved-priest-gesture-art.js";
import { approvedPriestHeadBowRubricArt } from "./reader-approved-priest-head-bow.js";
import { actionMeaning } from "./reader-canonical-icons.js";
import { CUE_SURFACE, resolveCueSurface, sourceActionRubricLabel } from "./reader-cue-visual-policy.js";

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
  --ao-bg:var(--ao-mass-bg);--ao-panel:var(--ao-mass-panel);--ao-panel2:var(--ao-mass-top);
  --ao-line:rgba(238,241,233,.13);--ao-muted:#a9afa7;--ao-dim:#6f766f;
  --ao-text:#eef1e9;--ao-accent:var(--ao-mass-accent);--ao-warm:#d6caa6;--ao-response:#c8d9e9;
  --ao-rail:62px;--ao-content-max:820px;--ao-schola-height:150px;--ao-schola-reserve:0px;
  box-sizing:border-box;position:relative;display:grid;grid-template-rows:auto auto minmax(0,1fr);
  width:100%;height:100%;min-height:0;overflow:hidden;
  background:linear-gradient(180deg,var(--ao-mass-top),var(--ao-mass-bottom));color:var(--ao-text);
  font-family:var(--ao-font-ui,ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif)
}
.ao-reader-shell *{box-sizing:border-box}
.ao-reader-top-ribbon{
  position:relative;z-index:12;display:grid;grid-template-columns:56px minmax(0,1fr) 56px;align-items:center;
  height:56px;min-height:56px;gap:4px;padding:4px 6px;
  background:var(--ao-mass-top);border-bottom:1px solid rgba(255,255,255,.045)
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
  max-height:calc(100dvh - 72px);overflow-y:auto;overscroll-behavior:contain;
  padding:13px;border:1px solid rgba(255,255,255,.075);border-radius:14px;
  background:var(--ao-mass-panel);box-shadow:0 18px 60px rgba(0,0,0,.5);
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
.ao-mode-ribbon button[aria-pressed="true"]>span{background:color-mix(in srgb,var(--ao-mass-accent) 17%,var(--ao-mass-panel));color:#fbfbf5;border-color:color-mix(in srgb,var(--ao-mass-accent) 22%,transparent)}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button{cursor:default}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button:not([aria-pressed="true"]){opacity:.34}
.ao-mass-prefs-more{
  width:100%;margin-top:12px;min-height:36px;border:1px solid rgba(255,255,255,.07);border-radius:9px;
  background:var(--ao-mass-panel);color:#c4ccc5;font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.09em;text-transform:uppercase
}

.ao-state-ribbon{
  position:relative;z-index:11;display:grid;
  grid-template-columns:minmax(0,1fr) minmax(90px,.72fr) minmax(0,1fr);
  align-items:stretch;gap:1px;height:64px;min-height:64px;padding:0;
  background:rgba(255,255,255,.035);border:0
}
.ao-state-cell{
  position:relative;min-width:0;display:flex;align-items:center;justify-content:center;gap:10px;
  padding:5px 9px;background:var(--ao-mass-top);color:#9ca69e;overflow:visible
}
.ao-state-cell[data-side="faithful"]{justify-content:center}
.ao-state-cell[data-side="priest"]{justify-content:center;border-left:1px solid rgba(255,255,255,.035)}
.ao-state-cell[data-side="priest"] .ao-state-label{max-width:132px}
.ao-state-kicker{font:700 7px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--ao-mass-accent-text)}
.ao-state-copy{min-width:0;display:flex;flex-direction:column}
.ao-priest-book-context{
  max-width:142px;overflow:hidden;white-space:nowrap;text-overflow:ellipsis;
  font:500 8px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.015em;color:var(--ao-muted)
}
.ao-reader-shell[data-mode="MISSAL"] .ao-priest-book-context{display:none}

.ao-state-label{
  max-width:142px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:600 10px/1.15 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.045em;color:#c9d1ca
}
.ao-state-cell>.ao-icon-mask{width:52px;height:52px;flex:0 0 52px;color:#d6dfd7}
.ao-state-guide{
  appearance:none;border:0;border-left:1px solid rgba(255,255,255,.035);border-right:1px solid rgba(255,255,255,.035);
  background:var(--ao-mass-panel);color:#d6dfd7;display:flex;align-items:center;justify-content:center;gap:8px;
  min-width:0;padding:5px 8px;cursor:pointer;font:inherit;transition:background .18s ease,color .18s ease,box-shadow .18s ease
}
.ao-state-guide:hover,.ao-state-guide:focus-visible{background:var(--ao-mass-panel);color:#f2f4ef;outline:none;box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ao-mass-accent) 14%,transparent)}
.ao-state-guide:disabled{opacity:.34}
.ao-guide-icon{width:32px;height:32px;display:grid;place-items:center;flex:0 0 32px;color:currentColor}
.ao-guide-icon svg{width:29px;height:29px;display:block}
.ao-guide-copy{display:flex;min-width:0;flex-direction:column;align-items:flex-start;gap:2px;text-align:left}
.ao-guide-copy small{font:700 7px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;color:var(--ao-mass-accent-text)}
.ao-guide-short{display:block;max-width:92px;font:600 8px/1.05 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.045em;color:#d5ddd6;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ao-priest-action-badge{
  position:absolute;right:4px;top:3px;width:27px;height:27px;border-radius:50%;display:grid;place-items:center;
  background:rgba(10,15,12,.96);border:1px solid rgba(212,225,215,.20);box-shadow:0 4px 14px rgba(0,0,0,.28);
  opacity:0;transform:scale(.78);transition:opacity .16s ease,transform .18s ease,width .18s ease,height .18s ease;
  pointer-events:none;z-index:4;color:var(--ao-mass-accent-text)
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
.ao-progress-track>span{display:block;height:100%;width:0;background:var(--ao-mass-accent);transition:width .18s linear}

.ao-section-menu{
  position:absolute;z-index:33;top:58px;left:50%;transform:translateX(-50%);
  width:min(92vw,440px);max-height:min(70vh,560px);overflow:auto;
  padding:7px;border:1px solid rgba(238,241,233,.11);border-radius:12px;
  background:var(--ao-mass-panel);box-shadow:0 18px 42px rgba(0,0,0,.46)
}
.ao-section-menu[hidden]{display:none}
.ao-section-menu button{
  appearance:none;width:100%;border:0;border-bottom:1px solid rgba(238,241,233,.06);
  background:transparent;color:#bdc6be;padding:10px 11px;text-align:left;
  font:500 .69rem/1.25 var(--ao-font-ui,system-ui,sans-serif)
}
.ao-section-menu button:last-child{border-bottom:0}
.ao-section-menu button[aria-current="true"]{color:#f3f4ee;background:color-mix(in srgb,var(--ao-mass-accent) 14%,transparent)}

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

/* App-dark missal chrome with a liturgical accent rather than green ownership. */
.ao-reader-shell{--ao-missal-face:var(--ao-font-liturgical,"EB Garamond",Garamond,Baskerville,Georgia,serif);
  --ao-missal-display:var(--ao-font-brand,var(--font-display,Cinzel,Baskerville,Georgia,serif))}
.ao-reader-shell{background:linear-gradient(180deg,color-mix(in srgb,var(--ao-mass-top) 35%,#080c12),color-mix(in srgb,var(--ao-mass-bottom) 26%,#080c12))}
.ao-reader-shell .ao-reader-top-ribbon,.ao-reader-shell .ao-state-ribbon{background:color-mix(in srgb,var(--ao-mass-top) 40%,#080c12)}
.ao-reader-shell .ao-reader-paragraph,
.ao-reader-shell .ao-line-primary,.ao-reader-shell .ao-line-secondary,
.ao-reader-shell .ao-schola-main,.ao-reader-shell .ao-schola-translation,
.ao-reader-shell .ao-guide-summary,.ao-reader-shell .ao-guide-section p{font-family:var(--ao-missal-face)}
.ao-reader-shell .ao-line-secondary{font-size:.73em;line-height:1.5;font-style:italic}
.ao-reader-shell .ao-reader-paragraph[data-kind="RUBRIC"]{font-family:var(--ao-missal-face);font-style:italic;font-weight:400;
  border-left-color:color-mix(in srgb,var(--ao-mass-accent) 50%,transparent);background:color-mix(in srgb,var(--ao-mass-accent) 6%,transparent)}
.ao-reader-shell .ao-canon-inline-rubrics{
  display:block;margin:11px 0 2px;padding:8px 11px;
  border-left:1px solid color-mix(in srgb,var(--ao-mass-accent) 42%,transparent);
  color:#b7c2b9;background:color-mix(in srgb,var(--ao-mass-accent) 4%,transparent);
  font:500 11px/1.45 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.01em
}
.ao-canon-inline-heading{display:block;margin-bottom:3px;color:var(--ao-mass-accent-text);font:700 9px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.07em}
.ao-canon-inline-actions{display:block;white-space:normal}
.ao-canon-inline-source{display:inline-block;margin-top:4px;color:#aabdb0;text-underline-offset:3px;font:500 10px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.ao-reader-shell[data-mode="SIMPLE"] .ao-canon-inline-rubrics{font-size:10px}
.ao-reader-shell[data-canon-inline="true"] .ao-state-ribbon{grid-template-columns:minmax(0,1fr) auto;height:48px;min-height:48px;align-items:center}
.ao-reader-shell[data-canon-inline="true"] .ao-state-cell{display:none}
.ao-state-source{display:none}
.ao-reader-shell[data-canon-inline="true"] .ao-state-source{
  display:block;padding:0 14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  color:var(--ao-mass-accent-text);font:600 10px/1.4 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.06em
}
.ao-reader-shell[data-canon-inline="true"] .ao-state-guide{height:48px;border-left:1px solid rgba(255,255,255,.06)}
.ao-reader-shell[data-canon-inline="true"] .ao-progress-track{top:106px}
.ao-reader-paragraph[data-kind="RUBRIC"]::before{color:var(--ao-mass-accent-text)}
.ao-reader-shell .ao-prayer-title,.ao-reader-shell .ao-section-jump,
.ao-reader-shell .ao-cinematic-title{font-family:var(--ao-missal-display)}
.ao-reader-shell .ao-reader-paragraph[data-opening="true"] .ao-line-primary::first-letter{
  font-family:"UnifrakturCook","Old English Text MT",var(--ao-missal-display);font-size:1.35em;font-weight:600;color:var(--ao-mass-accent-text)}
.ao-customary-controls label{display:grid;gap:5px;margin:9px 0;color:var(--ao-text);font:400 13px/1.3 var(--ao-missal-face)}
.ao-customary-controls select{width:100%;min-height:44px;padding:7px;border-radius:8px;
  border:1px solid color-mix(in srgb,var(--ao-mass-accent) 30%,transparent);
  background:#10151c;color:var(--ao-text);font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.ao-customary-controls select:disabled{opacity:.45}
.ao-customary-controls [data-customary-cue-note]{font:italic 12px/1.4 var(--ao-missal-face);
  text-transform:none;letter-spacing:0;color:var(--ao-muted)}


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
/* Deliberate pause between distinct source prayers, not between lines of
   one prayer. Keep real text untouched so focus and icon cues remain tied
   to their exact source paragraphs; add only section-level whitespace. */
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body
  .ao-reader-paragraph[data-section-boundary="SOURCE_BLOCK"]{margin-block-start:18px}
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body
  .ao-reader-paragraph[data-section-boundary="ORATION_GROUP"]{margin-block-start:22px}
.ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph[data-live-invitation="true"]
  .ao-line-secondary{display:block;margin-top:2px;font-style:italic}

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
/* R20's three source-owned action-only screens have no prayer words.
   Center the existing participation guide like a restrained interlude,
   clearly distinct from liturgical Latin and without a fabricated cue. */
#ao-r17-native-reader-preview[data-r17-state-owner="R20_ASPERGES_NATIVE"]
  .ao-reader-paragraph[data-kind="RUBRIC"]:only-child{
  display:flex;flex-direction:column;align-items:center;justify-content:center;
  min-height:min(42vh,360px);max-width:36ch;margin:0 auto;padding:30px 18px;
  border:0;border-radius:0;background:transparent;text-align:center;
  color:var(--ao-text-primary,#e8dfcb);
  font:italic 500 clamp(1.05rem,4vw,1.35rem)/1.62 var(--ao-font-liturgical,Georgia,serif);
  letter-spacing:.015em;opacity:1
}
#ao-r17-native-reader-preview[data-r17-state-owner="R20_ASPERGES_NATIVE"]
  .ao-reader-paragraph[data-kind="RUBRIC"]:only-child::before{content:none}
.ao-reader-paragraph[data-kind="RUBRIC"][data-state-duplicate="true"]{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"][data-state-duplicate="true"]{display:block}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"] .ao-line-primary{
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:3;overflow:hidden
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]{
  cursor:pointer
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]:focus-visible{
  outline:2px solid rgba(157,191,166,.7);outline-offset:3px
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]::after{
  content:"READ FULL RUBRIC";display:block;margin-top:8px;font:700 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.065em;color:#aeb8af
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"][data-expanded="true"] .ao-line-primary{
  display:block;-webkit-line-clamp:unset;overflow:visible
}
.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"][data-expanded="true"]::after{content:"COLLAPSE RUBRIC"}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{
  margin:14px 0;padding:14px 8px;text-align:center;
  font-size:clamp(1.45rem,3.8vw,2rem);line-height:1.34;letter-spacing:.035em;color:#fff
}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"] .ao-line-secondary{margin-top:8px;font-size:.60em;color:#b8c2b9}
.ao-reader-paragraph[data-chant-phrased="true"] .ao-line-primary,
.ao-reader-paragraph[data-chant-phrased="true"] .ao-line-secondary{white-space:pre-line}
.ao-speaker-turn{display:block;margin:0 0 6px;font:650 9px/1.25 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.10em;text-transform:uppercase;color:var(--ao-mass-accent-text)}
.ao-oration-label{display:block;margin:0 0 7px;font:600 10px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.055em;color:var(--ao-mass-accent-text)}
.ao-reader-shell[data-mode="MISSAL"] .ao-oration-label{grid-column:1 / -1}
.ao-reader-shell:not([data-mode="LIVE"]) .ao-speaker-turn{display:none}
.ao-reader-paragraph[data-kind="RESPONSE"]{padding-left:14px;border-left:2px solid rgba(200,217,233,.50);color:#dbe5ee}
.ao-ritual-trigger{border-radius:.18em;background:linear-gradient(transparent 72%,color-mix(in srgb,var(--ao-mass-accent) 18%,transparent) 72%);box-decoration-break:clone;-webkit-box-decoration-break:clone}
.ao-ritual-trigger-live{background:linear-gradient(transparent 62%,color-mix(in srgb,var(--ao-mass-accent) 38%,transparent) 62%);text-shadow:0 0 12px color-mix(in srgb,var(--ao-mass-accent) 10%,transparent);animation:aoRitualWordCue 1.25s ease-out both}
@keyframes aoRitualWordCue{0%{background-color:color-mix(in srgb,var(--ao-mass-accent) 19%,transparent)}100%{background-color:transparent}}
.ao-ritual-cross-symbol{display:inline-block;margin:0 .06em;color:var(--ao-mass-accent-text);font-weight:700;transform:scale(1.08);text-shadow:0 0 11px color-mix(in srgb,var(--ao-mass-accent) 24%,transparent)}
.ao-ritual-cross-symbol.ao-ritual-trigger-live{animation:aoRitualCross 1.25s ease-out both}
@keyframes aoRitualCross{0%{transform:scale(.92);filter:brightness(.8)}35%{transform:scale(1.28);filter:brightness(1.35)}100%{transform:scale(1.08);filter:none}}
.ao-reader-paragraph[data-translate-toggle="true"]{cursor:pointer}
/* Gloria/Credo: keep source cue ownership, but use ordinary Mass
   paragraph geometry. Posture/gesture art is shown once in the persistent
   ribbon and exact-cue rails, never as duplicate buttons beside every line. */
.ao-reader-paragraph[data-faithful-cues="true"]{position:relative}
.ao-state-cell[data-faithful-icon-open]:focus-visible{
  outline:2px solid var(--ao-mass-accent-text);outline-offset:2px}
.ao-state-cell[data-faithful-icon-open]{cursor:pointer}
.ao-faithful-icon-picker{position:absolute;z-index:38;left:50%;bottom:max(8px,env(safe-area-inset-bottom));
  transform:translateX(-50%);width:min(370px,calc(100% - 24px));
  max-height:calc(100dvh - 110px);overflow-y:auto;overscroll-behavior:contain;
  padding:14px 16px 17px;background:var(--ao-mass-panel);border:1px solid var(--ao-mass-accent);
  border-radius:14px;box-shadow:0 16px 44px rgba(0,0,0,.63);color:var(--ao-text)}
.ao-faithful-icon-picker[hidden]{display:none}
.ao-faithful-icon-picker-header{display:flex;justify-content:space-between;align-items:center;gap:12px}
.ao-faithful-icon-picker h3{margin:0;font:600 17px/1.4 var(--ao-missal-display)}
.ao-faithful-icon-picker label{display:grid;gap:5px;margin-top:10px;font:400 14px/1.4 var(--ao-missal-face)}
.ao-faithful-icon-picker select{width:100%;min-height:44px;background:#10151c;
  color:var(--ao-text);border:1px solid color-mix(in srgb,var(--ao-mass-accent) 26%,transparent);
  border-radius:8px;padding:8px;font:500 13px/1.3 var(--ao-font-ui,system-ui,sans-serif)}
.ao-faithful-icon-picker small{display:block;margin-top:9px;color:var(--ao-muted);font:italic 12px/1.5 var(--ao-missal-face)}
.ao-faithful-icon-picker-header button{min-width:44px;min-height:44px;background:transparent;
  color:var(--ao-text);border:0;font-size:22px;cursor:pointer}
.ao-reader-paragraph[data-translate-toggle="true"]:focus-visible{outline:1px solid color-mix(in srgb,var(--ao-mass-accent) 70%,transparent);outline-offset:4px}
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
.ao-rail[data-visible="false"]{display:none}
/* Only currently applicable transient instructions occupy either LIVE rail.
   Persistent posture/position belong to the upper ribbon, not ghost rail boxes. */
.ao-rail .ao-rail-item[data-active="false"]{display:none}
.ao-reader-shell:not([data-mode="LIVE"]) .ao-rail{display:none}
.ao-rail-item{
  position:relative;flex:0 0 auto;width:52px;height:52px;min-height:52px;padding:0;
  display:grid;place-items:center;text-align:center;color:#8e978f;
  background:color-mix(in srgb,var(--ao-mass-panel) 82%,transparent);border:1px solid rgba(238,241,233,.105);border-radius:13px;box-shadow:none;
  opacity:.18;overflow:hidden;transition:opacity .22s ease,transform .28s ease,box-shadow .28s ease,border-color .22s ease,background .22s ease,visibility .22s
}
.ao-rail-item[data-channel="posture"],.ao-rail-item[data-channel="priest-voice"]{opacity:.88}
.ao-rail-item[data-active="true"]{opacity:1;color:#edf0e9}
.ao-rail-item[data-channel="gesture"][data-active="false"],
.ao-rail-item[data-channel="posture-change"][data-active="false"],
.ao-rail-item[data-channel="attention"][data-active="false"],
.ao-rail-item[data-channel="response"][data-active="false"],
.ao-rail-item[data-channel="priest-action"][data-active="false"],
.ao-rail-item[data-channel="bell"][data-active="false"]{display:none}
.ao-rail-item[data-channel="gesture"][data-active="true"],
.ao-rail-item[data-channel="posture-change"][data-active="true"],
.ao-rail-item[data-channel="attention"][data-active="true"],
.ao-rail-item[data-channel="response"][data-active="true"],
.ao-rail-item[data-channel="priest-action"][data-active="true"],
.ao-rail-item[data-channel="bell"][data-active="true"]{animation:aoCueIn .42s cubic-bezier(.18,.8,.22,1) both}
.ao-rail-item[data-channel="attention"][data-active="true"]{border-color:rgba(159,193,168,.38);background:rgba(28,43,33,.91)}
.ao-rail-item[data-channel="posture"][data-change="true"]{
  border-color:rgba(214,202,166,.48);box-shadow:0 0 0 2px rgba(214,202,166,.07)
}
.ao-rail-item[data-channel="response"][data-active="true"]{border-color:rgba(198,217,232,.48);background:rgba(28,43,54,.94);color:var(--ao-response)}
.ao-rail-item[data-channel="bell"][data-active="true"]{border-color:rgba(214,202,166,.45);background:rgba(49,43,29,.96)}
.ao-rail-item[data-major="true"]{width:64px;height:64px;min-height:64px;z-index:8;transform:scale(1.06)}
@keyframes aoCueIn{0%{opacity:0;transform:scale(.78)}55%{opacity:1;transform:scale(1.08)}100%{opacity:1;transform:scale(1)}}
.ao-rail-copy{display:none!important}
/* LIVE rails are graphic surfaces only. Missing artwork never becomes an
   uppercase miniature rubric inside a blank icon frame. The source-owned
   instruction remains inline with its original Mass paragraph. */
.ao-reader-shell[data-mode="LIVE"] .ao-rail .ao-rail-item[data-icon-visible="false"]{
  display:none!important;
}
.ao-reader-shell[data-mode="LIVE"] .ao-rail .ao-rail-item .ao-rail-copy{
  display:none!important;
}
.ao-reader-shell[data-mode="LIVE"] .ao-iconless-source-rubric{
  display:block;max-width:66ch;margin:5px 0 3px;padding:3px 0 3px 9px;
  border-left:1px solid color-mix(in srgb,var(--ao-mass-accent) 46%,transparent);
  font:italic 400 clamp(11px,1.04vw,13px)/1.38 var(--ao-missal-face,Georgia,serif);
  color:color-mix(in srgb,var(--ao-text-primary,#e8e2d5) 76%,transparent);
  text-align:left;
}
/* No new artwork/clock: one occasional Solemn minister *rubric*, not a
   claimed observation or a priest-action clone. Only certified existing
   sacredMinister states may populate this otherwise absent right-rail tile. */
.ao-reader-shell[data-mode="LIVE"] .ao-rail-item[data-channel="sacred-minister"][data-active="true"]{
  border-color:color-mix(in srgb,var(--ao-mass-accent) 34%,transparent);
  background:color-mix(in srgb,var(--ao-mass-panel) 92%,transparent);
  opacity:.91;padding:3px
}
.ao-reader-shell[data-mode="LIVE"] .ao-rail-item[data-channel="sacred-minister"] .ao-rail-copy{
  display:block!important;max-width:48px;font:600 7px/1.1 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.015em;text-transform:uppercase;color:#d6ddd3;text-align:center;
  overflow-wrap:break-word;display:-webkit-box!important;-webkit-box-orient:vertical;-webkit-line-clamp:5;overflow:hidden
}
.ao-reader-shell:not([data-mode="LIVE"]) [data-channel="sacred-minister"]{display:none!important}

.ao-rail .ao-icon-mask{width:38px;height:38px}
.ao-bell-icon{display:block;width:38px;height:38px;color:#d8c590}
.ao-bell-icon svg{display:block;width:100%;height:100%}
.ao-rail-item[data-channel="bell"][data-major="true"] .ao-bell-icon{
  animation:aoBellHold 3.4s ease-out both
}
.ao-rail-item[data-channel="schola-shared"][data-active="false"]{display:none}
.ao-rail-item[data-channel="schola-shared"][data-active="true"]{
  display:flex;opacity:1;border-color:color-mix(in srgb,var(--ao-mass-accent) 42%,transparent);background:color-mix(in srgb,var(--ao-mass-panel) 94%,transparent)
}
.ao-rail-item[data-channel="schola-shared"][data-active="true"] .ao-icon-mask{
  filter:drop-shadow(0 0 8px color-mix(in srgb,var(--ao-mass-accent) 18%,transparent))
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
  padding:11px 16px 13px;border:1px solid color-mix(in srgb,var(--ao-mass-accent) 38%,transparent);border-radius:16px;
  background:var(--ao-mass-panel);box-shadow:0 15px 46px rgba(0,0,0,.34);color:#f0f1eb;overflow:hidden
}
.ao-rite-music-note{
  display:block;margin:0 auto 9px;max-width:38em;text-align:center;
  font:600 9px/1.5 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.12em;color:var(--ao-mass-accent-text);
  text-transform:uppercase;opacity:.78
}
.ao-rite-music-note[hidden]{display:none!important}
.ao-organ-rule-note{
  display:block;margin:-2px auto 9px;max-width:44em;text-align:center;
  font:500 9px/1.5 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.085em;color:var(--ao-mass-accent-text);
  text-transform:uppercase;opacity:.52
}
.ao-organ-rule-note[hidden]{display:none!important}
/* One cue-owned priestly-quiet notice, distinct from the audible Schola. */
.ao-offertory-quiet-note{
  display:flex;align-items:center;justify-content:center;gap:7px;
  margin:1px auto 11px;max-width:40em;
  font:500 10px/1.55 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.075em;color:var(--ao-mass-accent-text);
  text-transform:uppercase;opacity:.87
}
.ao-offertory-quiet-note[hidden]{display:none!important}
.ao-offertory-quiet-note .ao-icon-mask{width:18px;height:18px;flex:0 0 18px}
.ao-schola-dock[data-active="false"]{display:none}
/* Retain the manually collapsed SHOW handle between audible Schola cues. */
.ao-schola-dock[data-active="false"][data-collapsed="true"]{display:block}
.ao-schola-dock[data-collapsed="true"]{min-height:32px;height:32px!important;padding-top:4px;padding-bottom:4px}
.ao-schola-dock[data-collapsed="true"] .ao-schola-main,
.ao-schola-dock[data-collapsed="true"] .ao-schola-translation,
.ao-schola-dock[data-collapsed="true"] .ao-schola-meta{display:none}
/* While central LIVE prayer already carries the sung words, keep Schola
   navigation accessible without repeating those words in a second surface. */
.ao-schola-dock[data-shared="true"]:not([data-collapsed="true"])[data-resized="false"]{
  height:132px!important;min-height:132px;padding-bottom:7px
}
.ao-schola-dock[data-shared="true"]:not([data-collapsed="true"])[data-resized="true"]{
  height:var(--ao-schola-height)!important;min-height:132px;padding-bottom:7px
}
.ao-schola-dock[data-shared="true"] .ao-schola-progress{display:none}
.ao-schola-dock[data-shared="true"] .ao-schola-main{
  height:38px;margin-top:2px;min-height:38px
}
.ao-schola-dock[data-shared="true"][data-show-translation="false"] [data-role="schola"]{
  visibility:hidden
}
.ao-schola-dock[data-shared="true"][data-show-translation="false"] .ao-schola-main::after{
  content:"TRANSLATE";position:absolute;left:4px;top:6px;
  font:600 9px/1 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.12em;color:var(--ao-mass-accent-text)
}
.ao-schola-dock[data-shared="true"][data-show-translation="true"] .ao-schola-main{
  height:46px;min-height:46px
}
.ao-schola-dock[data-shared="true"] .ao-schola-meta{margin-top:4px;gap:3px}
.ao-schola-resize{position:absolute;top:0;left:25%;right:25%;height:10px;cursor:ns-resize;touch-action:none}
.ao-schola-resize:before{content:"";position:absolute;left:50%;top:3px;width:34px;height:2px;border-radius:2px;background:color-mix(in srgb,var(--ao-mass-accent) 28%,transparent);transform:translateX(-50%)}
.ao-schola-title{display:flex;align-items:center;gap:8px;min-height:21px;padding-right:54px}
/* Schola uses approved sacred-art original. Give the figure the same
   perceptual area as other reader icons, not a tiny 22px dock stamp. */
.ao-schola-title .ao-icon-mask{width:34px;height:34px;flex:0 0 34px;color:var(--ao-mass-accent-text)}
.ao-schola-title{min-height:36px}
.ao-rail-item[data-channel="schola-shared"] .ao-icon-mask{
  width:42px;height:42px;flex:0 0 42px
}
.ao-schola-kicker{font:700 8.5px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;text-transform:uppercase;color:var(--ao-mass-accent-text)}
.ao-schola-page{font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.12em;color:var(--ao-mass-accent-text)}
.ao-schola-status{font:600 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.06em;color:#9aa79b}
.ao-schola-status[hidden]{display:none!important}
.ao-schola-main{
  position:relative;height:58px;margin-top:6px;overflow:hidden;border-top:1px solid rgba(255,255,255,.045);
  border-bottom:1px solid rgba(255,255,255,.045);cursor:pointer;display:flex;align-items:center
}
.ao-schola-dock [data-role="schola"]{
  display:inline-block;min-width:max-content;font:500 17px/1.25 var(--ao-font-liturgical,Georgia,"Times New Roman",serif);
  color:#f2f3ed;white-space:nowrap;will-change:transform;backface-visibility:hidden
}
.ao-schola-main[data-schola-translate]:focus-visible{
  outline:2px solid var(--ao-mass-accent-text);outline-offset:2px;
}
.ao-schola-dock[data-show-translation="true"] .ao-schola-main{
  align-items:flex-start;overflow-y:auto;overscroll-behavior:contain;
  scrollbar-width:thin;padding:7px 3px 5px
}
.ao-schola-dock[data-show-translation="true"] [data-role="schola"]{
  display:block;min-width:0;width:100%;white-space:normal;
  overflow-wrap:break-word;transform:none!important;
  font-style:italic;color:var(--ao-mass-accent-text)
}
.ao-schola-meta{display:grid;grid-template-columns:1fr;gap:8px;margin-top:8px;min-height:0}
.ao-schola-progress{grid-row:1;width:100%;height:2px;max-width:none;min-width:0;background:rgba(255,255,255,.07);overflow:hidden;border-radius:99px;opacity:.76}
.ao-schola-progress>span{display:block;height:100%;width:0;background:var(--ao-mass-accent);transition:none}
.ao-schola-controls{grid-row:2;width:100%;display:grid;grid-template-columns:38px 58px 38px minmax(72px,1fr);gap:6px;align-items:center;opacity:1;pointer-events:auto;overflow:visible}
.ao-schola-control{
  appearance:none;border:1px solid rgba(255,255,255,.065);background:rgba(255,255,255,.025);color:#9eada2;
  border-radius:7px;min-height:26px;padding:4px 7px;
  font:700 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.08em;text-transform:uppercase
}
button.ao-schola-control{cursor:pointer}
.ao-schola-control[data-schola-slower],.ao-schola-control[data-schola-faster]{min-width:0;height:34px;font-size:16px;line-height:1;color:#d7e2d9;background:rgba(115,151,123,.14);border-color:rgba(145,181,153,.28)}
.ao-schola-control[data-schola-previous],.ao-schola-control[data-schola-next]{
  min-width:0;height:34px;font:500 23px/1 Georgia,serif;color:var(--ao-mass-accent-text);
  background:rgba(255,255,255,.035);border-color:rgba(225,207,145,.18)
}
.ao-schola-control[data-schola-release]{grid-column:1/-1;min-height:36px;font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);color:var(--ao-mass-accent-text);border-color:color-mix(in srgb,var(--ao-mass-accent) 35%,transparent);letter-spacing:.04em}
.ao-schola-control[data-schola-release][hidden]{display:none!important}
.ao-schola-control[data-schola-previous]:disabled,.ao-schola-control[data-schola-next]:disabled{
  opacity:.25;cursor:default
}
/* Preserve the frozen 4-column donor geometry in SIMPLE and MISSAL.
   In LIVE only, expose explicit independent phrase correction at 320px+. */
.ao-reader-shell:not([data-mode="LIVE"]) .ao-schola-control[data-schola-previous],
.ao-reader-shell:not([data-mode="LIVE"]) .ao-schola-control[data-schola-next]{display:none!important}
.ao-reader-shell[data-mode="LIVE"] .ao-schola-controls{
  grid-template-columns:38px 38px 58px 38px 38px minmax(72px,1fr);gap:5px
}
.ao-reader-shell[data-mode="LIVE"] .ao-schola-speed,
.ao-reader-shell[data-mode="LIVE"] .ao-schola-control[data-schola-pause]{min-width:0}
@media(max-width:760px){
  .ao-reader-shell[data-mode="LIVE"] .ao-schola-controls{
    grid-template-columns:36px 36px 48px 36px 36px minmax(54px,1fr);gap:3px
  }
}
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
.ao-cinematic-fallback[hidden]{display:none!important}
.ao-cinematic-title{font:400 clamp(1.2rem,4vw,2rem)/1.15 var(--ao-font-display,Georgia,"Times New Roman",serif);letter-spacing:.08em;color:#f0f1e9}
.ao-cinematic-sub{font:600 .63rem/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.11em;color:#89928a}
.ao-cinematic[data-kind="ELEVATION"]{
  /* A solid backing is essential: the Host elevation must not compete
     with the underlying Consecration rubric or prayer paragraphs. */
  background:radial-gradient(circle at center,rgba(226,211,158,.075),rgba(3,7,5,0) 43%),#070b08
}
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

/* First-pass sacred LIVE cinematic language: retain the actual prayer in view.
   This is an atmospheric focus layer, NOT an observed priest-action animation.
   Icon emphasis reuses the existing R17 rail/asset-bank icon identity. */
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HOST_WORDS"] .ao-card-viewport,
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="CHALICE_WORDS"] .ao-card-viewport{
  background:radial-gradient(ellipse 54% 41% at 50% 43%,rgba(208,190,147,.065),transparent 78%);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HOST_ELEVATION"] .ao-card-viewport{
  background:radial-gradient(ellipse 45% 38% at 52% 43%,rgba(215,197,151,.11),transparent 84%);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="CHALICE_ELEVATION"] .ao-card-viewport{
  background:radial-gradient(ellipse 47% 40% at 52% 43%,rgba(176,170,145,.10),transparent 84%);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="INCARNATUS_GESTURE"] .ao-card-viewport{
  background:radial-gradient(ellipse 48% 35% at 50% 44%,rgba(190,170,133,.075),transparent 80%);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HOST_WORDS"] .ao-reader-paragraph[data-active="true"] .ao-line-primary,
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="CHALICE_WORDS"] .ao-reader-paragraph[data-active="true"] .ao-line-primary{
  color:#f4eedb;text-shadow:0 0 18px rgba(218,198,149,.19);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HOST_ELEVATION"] .ao-reader-paragraph[data-active="true"] .ao-line-primary,
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="CHALICE_ELEVATION"] .ao-reader-paragraph[data-active="true"] .ao-line-primary{
  color:#f7f0df;text-shadow:0 0 16px rgba(210,192,143,.12);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="INCARNATUS_GESTURE"] .ao-reader-paragraph[data-active="true"] .ao-line-primary{
  color:#f3ebd8;text-shadow:0 0 12px rgba(207,181,138,.10);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HOST_ELEVATION"] .ao-rail-right .ao-rail-item[data-channel="priest-action"][data-active="true"] .ao-icon-mask,
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="CHALICE_ELEVATION"] .ao-rail-right .ao-rail-item[data-channel="priest-action"][data-active="true"] .ao-icon-mask{
  transform-origin:50% 55%;animation:aoCinematicIconHold 3.35s ease-in-out both;
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="INCARNATUS_GESTURE"] .ao-rail-left .ao-rail-item[data-channel="gesture"][data-active="true"] .ao-icon-mask{
  transform-origin:50% 60%;animation:aoCinematicPostureCue .75s ease-out both;
}
/* Existing approved icon becomes an in-stage focus illustration only if
   a real unoccupied reading region is available. Otherwise retain rail art. */
.ao-reader-shell[data-mode="LIVE"][data-cinematic-visual="ICON"] .ao-cinematic[data-kind="ELEVATION"]{
  position:absolute;inset:auto 0 clamp(68px,9vh,82px);height:172px;
  display:grid;place-items:center;padding:0;z-index:17;
  background:transparent;box-shadow:none;pointer-events:none;
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-visual="ICON"] .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner{
  width:min(42vw,165px);height:auto;aspect-ratio:1;filter:none;
  background:radial-gradient(circle,rgba(208,192,151,.06),transparent 68%);
  animation:aoElevation 3.35s cubic-bezier(.18,.72,.22,1) both;
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-visual="ICON"] .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-icon{
  width:84%;height:84%;
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-visual="ICON"] .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-sub{
  top:calc(100% + 7px);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-visual="ICON"] .ao-rail-right .ao-rail-item[data-channel="priest-action"]{
  /* A visibility transition keeps both images on screen briefly. The
     in-stage icon must own this action exclusively from its first frame. */
  display:none!important;
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-visual="RAIL"] .ao-cinematic[data-kind="ELEVATION"]{
  display:none!important;
}
@keyframes aoCinematicIconHold{
  0%{opacity:.65;transform:translateY(3px) scale(.96)}
  20%{opacity:1;transform:translateY(-3px) scale(1.14)}
  78%{opacity:1;transform:translateY(-3px) scale(1.12)}
  100%{opacity:1;transform:none}
}
@keyframes aoCinematicPostureCue{
  0%{transform:translateY(-4px);opacity:.7}
  70%{transform:translateY(2px);opacity:1}
  100%{transform:none;opacity:1}
}

/* Second visual batch, using only certified cue ownership.
   Hanc igitur has no approved exact hands master: do not fabricate art. */
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HANC_IGITUR_HANDS"] .ao-card-viewport{
  background:radial-gradient(ellipse 43% 30% at 49% 37%,rgba(188,172,133,.065),transparent 78%);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HANC_IGITUR_HANDS"] .ao-reader-paragraph[data-active="true"]{
  border-left:1px solid rgba(202,189,147,.35);padding-left:11px;
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="HANC_IGITUR_HANDS"] .ao-reader-paragraph[data-active="true"] .ao-line-primary{
  color:#eee8db;text-shadow:0 0 11px rgba(204,186,145,.08);
}
/* Gospel: one source announcement, not three fake sequential cross events. */
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="GOSPEL_CROSSES"] .ao-card-viewport{
  background:radial-gradient(ellipse 40% 28% at 50% 39%,rgba(188,192,170,.065),transparent 82%);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="GOSPEL_CROSSES"] .ao-reader-paragraph[data-active="true"] .ao-line-primary{
  color:#f4f1e8;text-shadow:0 0 12px rgba(225,223,205,.09);
}
.ao-reader-shell[data-mode="LIVE"][data-cinematic-scene="GOSPEL_CROSSES"] .ao-rail-right .ao-rail-item[data-channel="priest-action"][data-active="true"] .ao-icon-mask{
  animation:aoGospelIconCue .85s ease-out both;transform-origin:center;
}
@keyframes aoGospelIconCue{
  0%{opacity:.68;transform:scale(.96)}
  40%{opacity:1;transform:scale(1.10)}
  100%{opacity:1;transform:none}
}
/* Good Friday is a distinct-rite R28 state, not an Ordinary Mass scene.
   No countdown: the faithful's deliberate Continue action ends the pause. */
.ao-reader-shell[data-cinematic-scene="PASSION_DEATH"] .ao-card-viewport{
  background:radial-gradient(ellipse 54% 40% at 50% 42%,rgba(153,141,131,.055),transparent 80%);
}
.ao-reader-shell[data-cinematic-scene="PASSION_DEATH"] .ao-reader-paragraph[data-cue-id="GF-PASS-320"] .ao-line-primary{
  color:#f3ede5;text-shadow:0 0 12px rgba(205,186,174,.09);
}
.ao-reader-shell[data-cinematic-scene="PASSION_DEATH"] .ao-state-cell[data-side="faithful"] [data-icon-slot="posture-top"]{
  filter:drop-shadow(0 0 6px rgba(202,188,172,.24));
}

@media(prefers-reduced-motion:reduce){
  .ao-reader-shell[data-cinematic-scene] .ao-rail-item .ao-icon-mask{animation:none!important;transform:none!important}
  .ao-reader-shell[data-cinematic-scene] .ao-card-viewport{animation:none!important}
}


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
  padding:18px 18px 14px;border-bottom:1px solid rgba(255,255,255,.06);background:var(--ao-mass-panel)
}
.ao-guide-kicker{
  font:760 8px/1 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.13em;text-transform:uppercase;
  color:var(--ao-mass-accent-text);margin-bottom:6px
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
.ao-guide-scope{margin:5px 0 0;color:var(--ao-muted);font:500 .73rem/1.4 var(--ao-font-ui,system-ui,sans-serif)}
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
  .ao-schola-title{padding-right:62px;gap:6px}
  .ao-schola-kicker{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
  .ao-schola-page{flex:0 0 auto}
  .ao-schola-toggle{position:absolute;top:3px;right:9px;left:auto;transform:none}
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

/* Mobile readability/accessibility layer. Retain the frozen v1.80 layout
   geometry above; improve controls without adding persistent interface chrome. */
@media(max-width:760px){
  .ao-mass-prefs-close{min-width:44px;min-height:44px;display:grid;place-items:center}
  .ao-mass-prefs-group>small{font-size:11px;letter-spacing:.08em}
  .ao-mode-ribbon button{font-size:11px;letter-spacing:.04em}
  .ao-mass-prefs-more{min-height:44px;padding:9px 11px;font-size:11px;line-height:1.3;letter-spacing:.04em}
  .ao-section-menu button{min-height:44px;font-size:13px;line-height:1.35}
  .ao-state-kicker{font-size:9px;letter-spacing:.07em}
  .ao-state-label{font-size:11px;letter-spacing:0}
  .ao-state-guide{flex-direction:column;gap:1px;padding:3px 4px}
  .ao-guide-icon{height:28px;min-height:28px}
  .ao-guide-copy{align-items:center}
  .ao-guide-copy small{font-size:10px;letter-spacing:.04em}
  .ao-guide-short{display:none}
  .ao-schola-title{min-height:32px}
  .ao-schola-kicker{font-size:10px}
  .ao-schola-page{font-size:10px}
  .ao-schola-controls{grid-template-columns:44px 54px 44px minmax(72px,1fr);gap:5px}
  .ao-schola-control{min-height:44px;padding:7px 6px;font-size:11px;line-height:1.2;letter-spacing:.03em}
  .ao-schola-control[data-schola-slower],.ao-schola-control[data-schola-faster]{height:44px;font-size:19px}
  .ao-schola-speed{height:44px}
  .ao-schola-control[data-schola-pause]{height:44px}
  .ao-schola-toggle{min-height:40px;min-width:48px;padding:6px 9px;font-size:10px}
  .ao-schola-resize{top:-6px;height:26px}
  .ao-schola-dock[data-collapsed="true"]{min-height:44px;height:44px!important;padding-top:7px;padding-bottom:5px}
  .ao-reader-nav button{opacity:.42}
}
/* Compact phones: keep the 48px transient cue rails and 19px liturgical
   text, reclaim only redundant inset space, and let live labels wrap. */
@media(max-width:760px){
  .ao-state-label{
    display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
    white-space:normal;text-overflow:clip;overflow:hidden;
    line-height:1.14;max-height:2.32em;overflow-wrap:break-word
  }
}
@media(max-width:360px){
  .ao-prayer-card{padding-left:0;padding-right:0}
  .ao-state-cell{gap:4px;padding-left:3px;padding-right:3px}
  .ao-state-cell>.ao-icon-mask{width:40px;height:40px;flex-basis:40px}
  .ao-state-label{
    -webkit-line-clamp:3;max-height:3.5em;font-size:10.5px;line-height:1.12
  }
}
/* LIVE hierarchy: a persistent state gets one visual owner. The top
   ribbon holds posture and priest position; rails hold transient cues and
   priest voice. Keep the corresponding DOM nodes for cue ownership/tests. */
.ao-reader-shell[data-mode="LIVE"] .ao-rail-left .ao-rail-item[data-channel="posture"],
.ao-reader-shell[data-mode="LIVE"] .ao-priest-action-badge{display:none}
/* When the section meaning occupies ribbon two, the posture is not there.
   Restore its existing left-rail icon, with no duplicate in other modes. */
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"]
.ao-rail-left .ao-rail-item[data-channel="posture"][data-active="true"]{display:grid!important}
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"]
.ao-rail-left .ao-rail-item[data-channel="posture"]:has(.ao-icon-mask[hidden]) .ao-rail-copy{
  display:block!important;max-width:49px;font:600 10px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  color:#e9dfcb;text-align:center;overflow-wrap:anywhere
}

/* Dedicated bilingual book view. This is intentionally scoped to
 * MISSAL, leaving LIVE gesture/cue and SIMPLE narration untouched. */
.ao-reader-shell[data-mode="MISSAL"]{
  --ao-missal-column-gap:clamp(16px,3.4vw,48px);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-schola-dock,
.ao-reader-shell[data-mode="MISSAL"] .ao-progress-track,
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-progress,
.ao-reader-shell[data-mode="MISSAL"] .ao-cinematic,
.ao-reader-shell[data-mode="MISSAL"] .ao-faithful-paragraph-icons{display:none!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-card-viewport{
  padding:0!important;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-prayer-card{
  padding:24px clamp(12px,4vw,50px) 72px!important;
  scroll-padding-top:20px;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-prayer-body{
  max-width:1120px;width:100%;gap:0;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-ribbon{
  grid-template-columns:minmax(0,1fr) minmax(0,1fr);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-guide{
  display:none!important;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="TEXT"],
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{
  border-bottom:1px solid color-mix(in srgb,var(--ao-text-primary,#e9e4d9) 7%,transparent);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph{
  display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  column-gap:var(--ao-missal-column-gap);
  align-items:start;margin:0;padding:10px 0;
  border:0;border-bottom:1px solid color-mix(in srgb,var(--ao-text-primary,#e9e4d9) 10%,transparent);
  border-radius:0;background:none;box-shadow:none;
  opacity:1!important;transform:none!important;filter:none!important;
  text-shadow:none!important;
  color:var(--ao-text-primary,#e9e4d9);
  font:400 clamp(15px,1.75vw,21px)/1.46 var(--ao-missal-face);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph .ao-line-primary,
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph .ao-line-secondary{
  display:block;min-width:0;width:auto;margin:0;padding:0;
  border:0;background:none;box-shadow:none;
  font:inherit!important;font-family:var(--ao-missal-face)!important;
  font-size:1em!important;line-height:1.46!important;
  font-style:normal!important;text-indent:0;
  white-space:pre-wrap;overflow-wrap:break-word;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph .ao-line-secondary{
  color:color-mix(in srgb,var(--ao-text-primary,#e9e4d9) 78%,var(--ao-bg-canvas,#080c12));
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-missal-primary-language="VERNACULAR"]>.ao-line-primary{grid-column:2;grid-row:1}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-missal-primary-language="VERNACULAR"]>.ao-line-secondary{grid-column:1;grid-row:1}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-missal-primary-language="LATIN"]>.ao-line-primary{grid-column:1;grid-row:1}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-missal-primary-language="LATIN"]>.ao-line-secondary{grid-column:2;grid-row:1}
.ao-reader-shell:not([data-mode="MISSAL"]) .ao-line-secondary[data-missal-only="true"]{display:none!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-translate-toggle="true"]{
  cursor:default;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"]{
  display:block;padding:7px 0;margin:4px 0;
  border-bottom:0;font-size:clamp(13px,1.48vw,16px)!important;
  font-family:var(--ao-missal-face)!important;
  font-style:italic!important;
  color:var(--ao-text-muted,#b5b8b4);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"]::before,
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"]::after{display:none!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"] .ao-line-primary{
  font-style:italic!important;font-size:.91em!important;line-height:1.45!important;
  color:var(--ao-text-muted,#b5b8b4);text-align:center;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="RUBRIC"] .ao-line-secondary{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{
  font-size:clamp(16px,1.9vw,23px)!important;
  text-align:left;background:none!important;
}
/* Liturgical serif for all translation text; menus use one legible UI scale
 * rather than 8px legacy labels and platform-dependent serif select fonts. */
.ao-reader-shell .ao-line-secondary{
  font-family:var(--ao-missal-face)!important;
  font-weight:400;
}
.ao-reader-shell:not([data-mode="MISSAL"]) .ao-line-secondary{
  font-size:.83em;line-height:1.55;
}
.ao-reader-shell .ao-section-menu button{
  min-height:44px;padding:10px 14px;
  font:500 15px/1.42 var(--ao-missal-face)!important;
  letter-spacing:0;
}
.ao-reader-shell .ao-mass-prefs-group>small{
  font:600 11px/1.35 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.065em;
}
.ao-reader-shell .ao-customary-controls label,
.ao-reader-shell .ao-faithful-icon-picker label{
  font:400 15px/1.4 var(--ao-missal-face);
}
.ao-reader-shell .ao-customary-controls select,
.ao-reader-shell .ao-faithful-icon-picker select{
  font:500 14px/1.35 var(--ao-font-ui,system-ui,sans-serif);
}
.ao-reader-shell .ao-mass-prefs-group option,
.ao-reader-shell .ao-faithful-icon-picker option{
  font:500 14px/1.4 var(--ao-font-ui,system-ui,sans-serif);
}
@media(max-width:560px){
  .ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph{
    font-size:clamp(13.5px,3.6vw,17px);
    line-height:1.35;
  }
  .ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph .ao-line-primary,
  .ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph .ao-line-secondary{
    line-height:1.38!important;
  }
  .ao-reader-shell[data-mode="MISSAL"] .ao-prayer-card{
    padding:18px 12px 64px!important;
  }
  .ao-reader-shell[data-mode="MISSAL"]{--ao-missal-column-gap:14px}
}
/* LIVE: one illuminated reading paragraph; adjacent passages recede to 38%
   and distant passages to 18%. Cue ownership is unchanged. */
.ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph{opacity:.18}
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph{opacity:.18}
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"]{opacity:1}
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph{opacity:.38}
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.38}
/* Fixed-height LIVE cards must have genuine paragraph runway, even when
   source text is shorter than the viewport. Percentage is relative to the
   scroller content box, not measured during transient ribbon/dock layout. */
.ao-reader-shell:is([data-mode="LIVE"],[data-mode="SIMPLE"]) .ao-prayer-card .ao-prayer-body[data-ao-reading-runway="true"]{
  min-height:calc(100% + var(--ao-min-reading-travel,72px));
}

/* One visible reading focus may be a Proper verse without a ceremonial
   cue. Keep gesture/cinematic source state entirely in data-active, while
   giving this uncued text a separate geometry-owned brightness channel. */
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body[data-ao-visual-focus="uncued"] .ao-reader-paragraph[data-active="true"]{
  opacity:.18;color:var(--ao-text);transform:none;text-shadow:none
}
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body[data-ao-visual-focus="uncued"] .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph,
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body[data-ao-visual-focus="uncued"] .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.18}
.ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph[data-reading-active="true"]{
  opacity:1!important;color:#f7f8f4;transform:translateX(2px);text-shadow:0 0 26px rgba(225,238,228,.065)
}

/* Rubrics are identifiable by their quiet inset and rule, not a repeated
   seven-pixel RUBRIC heading on every paragraph. Keep the complete source. */
.ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph[data-kind="RUBRIC"]{
  margin:8px 0 10px;padding:8px 10px;
  font-size:.78rem;line-height:1.5;font-weight:500
}
.ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph[data-kind="RUBRIC"]::before{display:none}
/* LIVE is an operational Mass companion, never an explanatory Guide.
   Keep the original posture/position ribbon; remove its centre Guide tile. */
.ao-reader-shell[data-mode="LIVE"] .ao-state-ribbon,
.ao-reader-shell[data-mode="SIMPLE"] .ao-state-ribbon{
  grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;
}
.ao-reader-shell .ao-state-guide,
.ao-reader-shell .ao-guide-popover{
  display:none!important;
}
/* The sole source-owned prayer title belongs in the top ribbon.
   Allow two-line names on phone rather than truncating to unnamed-looking
   'Words of...' fragments or adding another heading to the prayer card. */
.ao-reader-shell[data-mode="LIVE"] .ao-section-jump{
  white-space:normal;text-overflow:clip;overflow:hidden;
  font-size:clamp(12px,2.8vw,15px);line-height:1.16;
}
.ao-reader-shell[data-mode="LIVE"] .ao-section-jump [data-role="section-title"]{
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
  white-space:normal;overflow:hidden;text-overflow:clip;overflow-wrap:break-word;
}
/* A sourced ceremonial cue belongs directly to its original prayer row.
   The short rubric is legible without becoming a second Guide card. */
.ao-reader-shell[data-mode="LIVE"] .ao-live-inline-rubrics{
  display:block;max-width:66ch;margin:5px 0 3px;padding:3px 0 3px 9px;
  border-left:1px solid color-mix(in srgb,var(--ao-mass-accent) 46%,transparent);
  color:color-mix(in srgb,var(--ao-text-primary,#e8e2d5) 76%,transparent);
  font:italic 400 clamp(11px,1.04vw,13px)/1.38 var(--ao-missal-face,Georgia,serif);
  text-align:left;letter-spacing:0;
}
.ao-reader-shell[data-mode="LIVE"] .ao-live-rubric-action{
  display:block;margin:1px 0;
}
/* Four exact, current-actor, current-subaction icons may replace their
   duplicate short line in LIVE only. The complete sourced rubric remains
   in MISSAL and the same source-linked node remains in the LIVE DOM. */
.ao-reader-shell[data-mode="LIVE"] .ao-live-inline-rubrics[data-fully-icon-backed="true"]{
  position:absolute!important;width:1px;height:1px;padding:0!important;
  margin:-1px!important;overflow:hidden;clip:rect(0,0,0,0);
  white-space:nowrap;border:0!important
}
.ao-reader-shell[data-mode="LIVE"] .ao-live-rubric-action[data-icon-backed="true"]{
  position:absolute!important;width:1px;height:1px;padding:0!important;
  margin:-1px!important;overflow:hidden;clip:rect(0,0,0,0);
  white-space:nowrap;border:0!important
}
/* Exact approved icon-backed visibility remains owned by main's registry. */
.ao-reader-shell[data-mode="LIVE"] .ao-live-rubric-action[hidden],
.ao-reader-shell[data-mode="LIVE"] .ao-live-inline-rubrics[hidden]{display:none!important}
.ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph:not([data-active="true"])
  .ao-live-inline-rubrics{opacity:.93}
.ao-reader-shell[data-mode="LIVE"] .ao-live-inline-rubrics .ao-missal-ceremonial-state-detail
  summary{cursor:pointer;text-decoration:underline;text-decoration-style:dotted;text-underline-offset:3px}
.ao-reader-shell[data-mode="LIVE"] .ao-live-inline-rubrics .ao-missal-ceremonial-state-detail
  p{margin:5px 0;font:italic 400 12px/1.45 var(--ao-missal-face,Georgia,serif)}
/* Illustrate only source-certified priest finger STATE events with the
   existing 11 Oct approved artwork. Keep the printed rubric readable in
   MISSAL and LIVE; never place these persistent states in the action rail. */
.ao-reader-shell .ao-approved-finger-rubric-art,
.ao-reader-shell .ao-approved-priest-gesture-rubric-art,
.ao-reader-shell .ao-approved-priest-head-bow-rubric-art{
 display:inline-block;vertical-align:middle;flex:none;
 width:29px;height:29px;margin-inline-end:6px;
 background:var(--ao-warm,#d6caa6);
 -webkit-mask-repeat:no-repeat;mask-repeat:no-repeat;
 -webkit-mask-position:center;mask-position:center;
 -webkit-mask-size:contain;mask-size:contain;
}
.ao-reader-shell .ao-approved-finger-rubric-art[hidden]{display:none}
.ao-reader-shell .ao-approved-priest-gesture-rubric-art[hidden]{display:none}
.ao-reader-shell .ao-approved-priest-head-bow-rubric-art[hidden]{display:none}


.ao-reader-shell[data-mode="LIVE"] .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-kind="RUBRIC"]:not([data-active="true"]){opacity:.64}

/* Keep full-sized edge targets, but let prayer text rather than arrows own
   the resting state. Touch-focus/keyboard and edge-handoff remain salient. */
@media(max-width:760px){
  .ao-reader-shell[data-mode="LIVE"] .ao-reader-nav button{opacity:.25}
  .ao-reader-shell[data-mode="LIVE"] .ao-reader-nav button:hover,
  .ao-reader-shell[data-mode="LIVE"] .ao-reader-nav button:focus-visible{opacity:.92}
  .ao-reader-shell[data-mode="LIVE"][data-handoff="next"] .ao-reader-nav button[data-reader-nav="next"],
  .ao-reader-shell[data-mode="LIVE"][data-handoff="previous"] .ao-reader-nav button[data-reader-nav="previous"]{opacity:.56}
}
/* Only source cards too short to scroll between their distinct cues
   receive additional travel. Measured per card below; regular cards stay
   unchanged. Keep the frozen donor padding definitions intact above. */
.ao-reader-shell[data-mode="LIVE"] .ao-prayer-card{
  padding-bottom:calc(max(42vh,250px) + var(--ao-schola-reserve) + var(--ao-short-cue-tail,0px))
}
@media(max-width:760px){
  .ao-reader-shell[data-mode="LIVE"] .ao-prayer-card{
    padding-bottom:calc(max(42vh,240px) + var(--ao-schola-reserve) + var(--ao-short-cue-tail,0px))
  }
}
/* Rite-specific choice: show only while an individual is deciding whether
   to walk in the current Palm, Candlemas or burial procession. The choice
   lives above the prayer text and never occupies permanent Mass chrome. */
.ao-reader-stage[data-rite-choice="true"] .ao-prayer-card{padding-top:112px}
.ao-rite-choice{
  position:absolute;z-index:11;top:9px;left:50%;transform:translateX(-50%);
  width:min(305px,calc(100% - 112px));min-width:0;
  padding:8px 10px 9px;border:1px solid rgba(161,181,161,.24);border-radius:14px;
  background:#101813;color:#e3e9e1;box-shadow:0 9px 26px rgba(0,0,0,.32);
  display:flex;flex-direction:column;gap:6px;align-items:stretch;text-align:center
}
.ao-rite-choice[hidden]{display:none}
.ao-rite-choice-label{font:600 11px/1.3 var(--ao-font-ui,system-ui,sans-serif);letter-spacing:.02em}
.ao-rite-choice-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.ao-rite-choice button{
  appearance:none;border:1px solid rgba(185,203,188,.16);border-radius:8px;
  min-height:44px;padding:7px 5px;background:rgba(255,255,255,.025);color:#c1cbc2;
  font:600 11px/1.2 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer
}
.ao-rite-choice button[aria-pressed="true"]{
  background:rgba(123,156,126,.24);border-color:rgba(171,198,174,.48);color:#f4f8f0
}
.ao-rite-choice button:focus-visible{outline:2px solid #b4cbb6;outline-offset:2px}
@media(max-width:360px){.ao-rite-choice{width:calc(100% - 110px);padding:7px 5px}}
@media(prefers-reduced-motion:reduce){
  .ao-reader-paragraph,.ao-rail-item,.ao-reader-nav button{transition:none!important}.ao-prayer-card[data-card-arrival]{animation:none!important}
  .ao-cinematic[data-kind="ELEVATION"] .ao-cinematic-inner,.ao-rail-item[data-channel="bell"][data-major="true"] .ao-bell-icon{animation:none!important}
}
/* LIVE reading illumination. The current prayer is fully legible; the
   following prayer remains readable in anticipation, the previous paragraph
   recedes gently, and distant text never falls below 32% opacity.
   Position is assigned to EVERY readable paragraph by one shared geometry
   tracker. Ceremonial data-active only drives source-owned liturgical state. */
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"] .ao-reader-paragraph{
  opacity:.32
}
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-active="true"]:not([data-reading-position="current"]){
  opacity:.32;color:var(--ao-text);transform:none;text-shadow:none
}
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-reading-position="distant"]{opacity:.32}
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-reading-position="rubric"]{opacity:.64}
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-reading-position="previous"]{opacity:.55}
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-reading-position="next"]{opacity:.65}
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-reading-position="current"]{
  opacity:1;color:#f7f8f4;transform:translateX(1px);
  text-shadow:0 0 26px rgba(225,238,228,.04)
}
/* Preserve a visible floor for instructions that do not participate in
   reading focus, without giving them false source-event ownership. */
#ao-r17-native-reader-preview .ao-reader-shell[data-mode="LIVE"]
  .ao-reader-paragraph[data-kind="RUBRIC"]:not([data-reading-position="current"]){opacity:.64}

/* The persistent Schola panel may be resized/hidden, but it must not lie
   across prayer rows in the visual scroll window. Reserve real viewport
   space instead of only adding invisible content after the last paragraph. */
#ao-r17-native-reader-preview[data-r17-curated-review="true"] .ao-card-viewport{
  /* The 100%-high viewport was content-box: adding dock padding expanded
     it beneath the Schola. Include the reserved safe-area and dock INSIDE
     its own height so the reading scroller ends above the overlay. */
  box-sizing:border-box;
  /* Dock sits 9px above the safe-area edge; reserve that extra strip too. */
  padding-bottom:calc(var(--ao-schola-reserve) + max(12px,env(safe-area-inset-bottom)))
}
#ao-r17-native-reader-preview[data-r17-curated-review="true"] .ao-prayer-card{
  /* The viewport owns the visible height. Bottom cue-travel padding must
     remain INSIDE that box instead of expanding a 100%-high content-box
     beneath the persistent Schola dock. */
  box-sizing:border-box;
  height:100%;
  /* Preserve the native short-card cue-travel variable. The previous
     fixed clamp masked this inherited reserve and left short responses
     impossible to reach by scrolling (C0071). Keep actual scroll
     territory, not inflated prayer paragraph heights. */
  /* The Schola dock already shortens the reading viewport. A second
     42vh + 166px fixed padding forced the scroll box to expand to its
     510px padding minimum despite a smaller declared height. Keep the
     56px breathing strip and let ensureShortCardCueTravel calculate the
     remaining scroll distance from actual cue geometry. */
  padding-bottom:calc(56px + var(--ao-short-cue-tail,0px))
}

/* Dynamic Schola dock is independent of the reader. Reserve an
   actually shorter scrolling viewport while its separate panel is open;
   padding alone does not constrain the scroller's outer rectangle. */
#ao-r17-native-reader-preview[data-r17-curated-review="true"]
  .ao-reader-shell[data-schola-visible="true"] .ao-prayer-card{
  /* The parent viewport itself includes a larger top-ribbon/rail offset
     than its nominal 100% scroll-child containing block. Deduct a guarded
     88px as well as the live dock to keep the actual scroll rectangle
     above the panel; the extra height remains accessible by finger scroll. */
  /* Measured against the root's full-viewport fixed shell, not a
     percentage of the viewport's content box (whose intrinsic 100% child
     was 69px too tall on phone Chromium). Header/ribbon is 120px; the
     48px residual margin keeps the real scroller above the floating dock. */
  height:calc(100dvh - var(--ao-schola-reserve) - 168px)!important
}


/* Discoverable yet subdued horizontal prayer navigation. At .34 and .42
   opacity the real phone arrows/counter disappeared into the dark canvas.
   Scope to curated LIVE + prelude; MISSAL retains its book-specific chrome. */
#ao-r17-native-reader-preview[data-r17-curated-review="true"]
  .ao-reader-shell[data-mode="LIVE"] .ao-reader-nav button,
#ao-r17-native-reader-preview[data-r17-state-owner="R20_ASPERGES_NATIVE"]
  .ao-reader-shell .ao-reader-nav button{
  color:#c1bcaf;opacity:.60
}
#ao-r17-native-reader-preview[data-r17-curated-review="true"]
  .ao-reader-shell[data-mode="LIVE"] .ao-reader-progress,
#ao-r17-native-reader-preview[data-r17-state-owner="R20_ASPERGES_NATIVE"]
  .ao-reader-shell .ao-reader-progress{
  color:#c1b7a3;opacity:.80;font-size:10px
}



/* Missal retains the source-owned posture/gesture and priest position/action
   in one compact horizontal state ribbon, never the LIVE transient rails. */
.ao-reader-shell[data-mode="MISSAL"] .ao-state-ribbon{
  display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr);
  min-height:64px;height:64px;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell{gap:5px;padding:4px 6px}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell>.ao-icon-mask:not(.ao-missal-gesture-icon){
  width:35px;height:35px;flex:0 0 35px;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-label{
  max-width:120px;font-size:10px;line-height:1.17;
}
@media(max-width:360px){
  .ao-reader-shell[data-mode="MISSAL"] .ao-state-cell>.ao-icon-mask:not(.ao-missal-gesture-icon){
    width:29px;height:29px;flex:0 0 29px;
  }
  .ao-reader-shell[data-mode="MISSAL"] .ao-missal-gesture-icon{
    width:27px;height:27px;flex:0 0 27px;
  }
  .ao-reader-shell[data-mode="MISSAL"] .ao-state-cell{gap:3px;padding:3px}
}
/* The Canon's contextual source banner is a LIVE-specific chrome
   alternative. In Missal, rubrics remain inline and the gesture ribbon
   must never be replaced by a redundant source title. */
.ao-reader-shell[data-mode="MISSAL"] .ao-state-source{display:none!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell{display:flex!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-guide{height:64px}
/* In a 320px Missal, show one priest image: the current source action
   (if present) replaces the position pictogram; the position remains text.
   The LIVE floating action badge continues unchanged. */
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell[data-side="priest"]{
  justify-content:flex-start;gap:5px;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell[data-side="priest"]:has(.ao-priest-action-badge[data-active="true"])>
.ao-icon-mask[data-icon-slot="priest-position"]{display:none!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-priest-action-badge{
  position:static!important;right:auto!important;top:auto!important;
  width:31px!important;height:31px!important;flex:0 0 31px;
  order:-1;border-radius:7px;background:transparent;
  border:0;box-shadow:none;transform:none!important;
  transition:none;opacity:1;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-priest-action-badge[data-active="false"]{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell[data-side="priest"] .ao-state-copy{
  flex:1;min-width:0;align-items:flex-start;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell[data-side="priest"] .ao-state-label{
  white-space:normal;overflow:hidden;max-height:22px;
  font-size:9px;line-height:1.09;letter-spacing:0;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-state-cell[data-side="priest"] .ao-missal-state-detail{
  width:100%;font-size:8px;line-height:1.1;white-space:nowrap;
}
@media(max-width:360px){
  .ao-reader-shell[data-mode="MISSAL"] .ao-priest-action-badge{
    width:26px!important;height:26px!important;flex-basis:26px;
  }
}
/* A source rubric is a single understated italic line, NOT a card.
   The source, actor and date remain metadata, not repeated reading chrome. */
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-inline-rubrics{
  grid-column:1 / -1;grid-row:auto;display:block;
  margin:5px 0 0;padding:1px 0 0;
  border:0;background:transparent;text-align:center;
  color:var(--ao-text-muted,#b5b8b4);
  font:italic 400 clamp(.82rem,1.45vw,.98rem)/1.43 var(--ao-missal-face);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-inline-rubrics .ao-canon-inline-heading,
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-inline-rubrics .ao-canon-inline-source{display:none!important}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-inline-rubrics .ao-missal-rubric-action{
  display:block;font:inherit;color:inherit;margin:1px 0;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-ceremonial-state-detail{
  display:block;margin:0 auto;max-width:65ch;font:inherit;color:inherit;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-ceremonial-state-detail>summary{
  display:list-item;list-style-position:inside;cursor:pointer;
  width:fit-content;max-width:100%;padding:4px;margin:0 auto;
  text-align:center;font:inherit;color:inherit;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-ceremonial-state-detail>summary>.ao-missal-rubric-action{
  display:inline!important;font:inherit;color:inherit;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-ceremonial-state-detail>p{
  margin:3px auto 6px;max-width:62ch;text-align:center;font:inherit;
  line-height:1.52;color:var(--ao-text-muted,#b5b8b4);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-ceremonial-state-detail>a{
  display:inline-block;font:400 .68rem/1.5 var(--ao-font-ui,system-ui,sans-serif);
  color:var(--ao-mass-accent-text);text-underline-offset:3px;
}
/* Actual additional rubrical information exists at chalice preparation:
   the brief direction is visible and the form-specific action/exception is
   accessible on tap. Generic per-word "Placement and source" was removed. */
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-chalice-short{
  display:block;margin:6px auto 0;
  color:var(--ao-text-muted,#b5b8b4);
  font:italic 400 clamp(.8rem,1.25vw,.95rem)/1.4 var(--ao-missal-face);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-chalice-detail{
  display:block;margin:1px auto 0;max-width:60ch;
  color:var(--ao-text-muted,#b5b8b4);font:.76rem/1.5 var(--ao-font-ui,system-ui,sans-serif);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-chalice-detail>summary{
  cursor:pointer;display:list-item;list-style-position:inside;
  width:max-content;max-width:100%;margin:0 auto;
  padding:5px 7px;min-height:30px;
  color:var(--ao-mass-accent-text);font-size:.74rem;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-chalice-detail p{
  margin:5px 5px 7px;font:italic 400 clamp(.86rem,1.4vw,1rem)/1.5 var(--ao-missal-face);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-chalice-detail a{
  color:var(--ao-mass-accent-text);font-size:.72rem;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-prayer-heading{
  margin:15px 0 8px;padding:8px 0 4px;
  border-top:1px solid color-mix(in srgb,var(--ao-mass-accent) 28%,transparent);
  text-align:center;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-prayer-heading:first-child{
  margin-top:0;border-top:0;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-prayer-name{
  margin:0;font:500 clamp(1rem,2.2vw,1.3rem)/1.4 var(--ao-missal-display);
  color:var(--ao-text);letter-spacing:.015em;
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-prayer-description{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-state-detail{
  display:block;max-width:142px;margin-top:3px;overflow:hidden;
  text-overflow:ellipsis;white-space:nowrap;color:var(--ao-mass-accent-text);
  font:400 9px/1.2 var(--ao-font-ui,system-ui,sans-serif);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-gesture-icon{
  width:33px;height:33px;flex:0 0 33px;color:var(--ao-mass-accent-text);
}
.ao-reader-shell:not([data-mode="MISSAL"]) .ao-missal-gesture-icon{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-missal-state-detail[hidden]{display:none}
.ao-reader-shell[data-mode="MISSAL"] .ao-prayer-title{display:none}

/* Restrained source-cued meaning in LIVE, never an inherited Guide panel. */
.ao-reader-objective-context[hidden]{display:none!important}
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"]
  .ao-rail-item[data-channel="priest-position"]:has(.ao-icon-mask[hidden]) .ao-rail-copy{
  display:block!important;max-width:53px;font:600 8px/1.2 var(--ao-font-ui,system-ui,sans-serif);
  color:#d8d6ce;text-align:center;overflow-wrap:anywhere
}
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"] .ao-state-ribbon{
  grid-template-columns:minmax(0,1fr)!important;height:64px;min-height:64px;
}
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"] .ao-state-cell{display:none!important}
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"] .ao-state-source{display:none!important}
.ao-reader-shell[data-mode="LIVE"][data-objective-context="true"] .ao-reader-objective-context{
  grid-column:1/-1;min-width:0;display:flex;flex-direction:column;
  align-items:center;justify-content:center;gap:3px;padding:5px 12px;
  text-align:center;color:var(--ao-text-primary,#e8e2d5);
}
.ao-reader-objective-context small{
  display:block;font:600 8px/1.1 var(--ao-font-ui,system-ui,sans-serif);
  letter-spacing:.08em;text-transform:uppercase;color:var(--ao-mass-accent-text)
}
.ao-reader-objective-context [data-role="objective-context-text"]{
  font:italic 400 clamp(11px,2.3vw,13px)/1.27 var(--ao-missal-face,Georgia,serif);
  display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;
  overflow:hidden;max-width:75ch;
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

// Priest stations arrive as source codes (FOOT_CENTER, ALTAR_CENTER...).
// The reader shows words; unknown codes at least lose their underscores.
const PRIEST_STATION_LABELS=Object.freeze({
  FOOT_CENTER:["Foot of the altar","Au bas de l’autel"],
  ALTAR_STEPS_ASCENDING:["Going up to the altar","Monte à l’autel"],
  ALTAR_CENTER:["Centre of the altar","Milieu de l’autel"],
  ALTAR_EPISTLE_SIDE:["Epistle side","Côté de l’Épître"],
  ALTAR_EPISTLE_MISSAL:["Missal, Epistle side","Missel, côté de l’Épître"],
  ALTAR_GOSPEL_MISSAL:["Missal, Gospel side","Missel, côté de l’Évangile"],
  COMMUNION_RAIL:["Communion rail","Table de communion"],
  SEDILIA:["At the sedilia","À la banquette"],
});
function priestStationLabel(value,root){
  const text=textValue(value);
  if(typeof text!=="string")return text;
  const trimmed=text.trim();
  const pair=PRIEST_STATION_LABELS[trimmed.toUpperCase().replace(/\s+/g,"_")];
  if(!pair)return /^[A-Z0-9]+(?:[_ ][A-Z0-9]+)+$/.test(trimmed)?trimmed.replaceAll("_"," "):text;
  const lang=String(root?.ownerDocument?.documentElement?.lang??"en").toLowerCase();
  return lang.startsWith("fr")?pair[1]:pair[0];
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

// The 1962 Latin corpus and the historical gesture registers may disagree on
// accent placement or Iesu/Jesu orthography. Match conservatively inside the
// *already source-identified* cue paragraph, preserving offsets of the text.
function foldRitualText(value){
  let text="",offsets=[];
  const raw=String(value??"");
  for(let i=0;i<raw.length;){
    const char=String.fromCodePoint(raw.codePointAt(i));
    const folded=char.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/j/g,"i");
    for(const letter of folded){text+=letter;offsets.push(i);}
    i+=char.length;
  }
  offsets.push(raw.length);
  return {text,offsets};
}

function appendRitualFragment(target,text,doc,{active=false}={}){
  const pieces=String(text??"").split("✠");
  pieces.forEach((piece,index)=>{
    if(piece)target.append(doc.createTextNode(piece));
    if(index<pieces.length-1){
      const cross=doc.createElement("span");
      cross.className=active?"ao-ritual-cross-symbol ao-ritual-trigger-live":"ao-ritual-cross-symbol";
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
  if(!fragments.length){
    if(raw.includes("✠"))appendRitualFragment(target,raw,doc);
    else target.textContent=raw;
    decorateLiturgicalSpeaker(target,raw);return false;
  }

  const folded=foldRitualText(raw);
  let cursor=0,matched=false;
  for(const fragment of fragments){
    const needle=foldRitualText(fragment).text;
    if(needle.length<3)continue;
    const foldedStart=folded.offsets.findIndex(offset=>offset>=cursor);
    const at=folded.text.indexOf(needle,Math.max(0,foldedStart));
    if(at<0)continue;
    const index=folded.offsets[at],end=folded.offsets[at+needle.length];
    if(index<cursor||end<=index)continue;
    if(index>cursor)target.append(doc.createTextNode(raw.slice(cursor,index)));
    const span=doc.createElement("span");
    span.className="ao-ritual-trigger ao-ritual-trigger-live";
    appendRitualFragment(span,raw.slice(index,end),doc,{active:true});
    target.append(span);
    cursor=end;
    matched=true;
  }
  if(cursor<raw.length)target.append(doc.createTextNode(raw.slice(cursor)));
  if(!matched){
    target.replaceChildren();
    if(raw.includes("✠"))appendRitualFragment(target,raw,doc);
    else target.textContent=raw;
  }
  decorateLiturgicalSpeaker(target,raw);
  return matched;
}

// Cue changes update state chrome without rebuilding the prayer card.
// Update just the changed Latin anchor span so rails, focus, and the text cue
// remain driven by the same canonical AO.SM.C.... identity. Never replace
// the paragraph itself: that would reset translation/focus/scroll controls.
export function syncReaderRitualHighlights(root,gesture){
  const cueId=String(gesture?.canonicalCueId??gesture?.cueId??"");
  const anchors=[gesture?.anchorLat,gesture?.anchorEn,gesture?.anchorFr]
    .map(anchor=>String(anchor??"").trim()).filter(Boolean);
  let applied=0;
  for(const paragraph of root?.querySelectorAll?.(".ao-reader-paragraph[data-cue-id]")??[]){
    const primary=paragraph.querySelector?.(".ao-line-primary");
    if(!primary)continue;
    const intended=Boolean(cueId && anchors.length && paragraph.dataset?.cueId===cueId &&
      paragraph.dataset?.active==="true" && !paragraph.hidden);
    const oldActive=paragraph.dataset?.ritualCueActive==="true";
    const oldAnchor=paragraph.dataset?.ritualAnchor??"";
    if(!intended&&!oldActive)continue;
    if(intended&&oldActive&&anchors.includes(oldAnchor)){applied++;continue;}
    // Only the exact source-owned phrase is eligible, in whichever language
    // is already displayed. Do not infer ritual gestures from unrelated text
    // or switch a prayer's language as a side effect of scrolling.
    const displayed=primary.textContent??"";
    let matched=false,selected=null;
    if(intended){
      for(const anchor of anchors){
        if(renderReaderText(primary,displayed,{anchor,active:true})){
          matched=true;selected=anchor;break;
        }
      }
    }
    if(!matched)renderReaderText(primary,displayed);
    if(matched){
      paragraph.dataset.ritualAnchor=selected;
      paragraph.dataset.ritualCueActive="true";
      applied++;
    }else{
      delete paragraph.dataset.ritualAnchor;
      paragraph.dataset.ritualCueActive="false";
    }
  }
  return applied;
}

// Treat the existing 19 R18 Solemn source events as **rubrical expectations**.
// Their cue alignment is not evidence anyone independently observed a minister.
// Only the pre-certified form-state owner may supply this discrete LIVE label.
export function projectCertifiedSolemnMinisterRubric(value){
  if(!value||!["R18_SOLEMN_R04_MINISTER","R18_SOLEMN_PAX_PRIMARY_SOURCE"].includes(value.owner) ||
    !["RECOVERED_R04_CERTIFIED","CERTIFIED_PRIMARY_1962_RUBRIC"].includes(value.authorityStatus) ||
    !/^AO\.SM\.C\d{4}$/.test(String(value.cueId??"")) ||
    !String(value.actor??"").trim() || !String(value.labelShort??"").trim())return null;
  return Object.freeze({
    label:String(value.actor).trim()+" · "+String(value.labelShort).trim(),
    actor:value.actor,sourceCueId:value.cueId,observed:false,
    owner:"EXISTING_SOLEMN_MINISTER_RUBRIC_EXPECTED_ONLY",
  });
}

export function normalizeReaderMoment(moment = {}, previous = {}) {
  if (!moment || typeof moment !== "object") throw new TypeError("Reader moment must be an object");
  const momentTitle=String(moment.cardTitle ?? moment.sectionTitle ?? previous.cardTitle ?? "");
  // Both curated 65-card words/elevation titles are distinct from the
  // preparation cards. Consecratory Latin must remain prominent in both.
  const latinProminent=/Consecration of (?:the )?(?:Sacred )?(?:Host|Chalice)/i.test(momentTitle) ||
    /^Words of Consecration and Elevation\s*[·–—-]\s*(?:Host|Chalice)$/i.test(momentTitle);
  const paragraphs = Array.isArray(moment.paragraphs) ? moment.paragraphs.map((p, index) => {
    if (typeof p === "string") return Object.freeze({id:String(index),kind:"TEXT",primary:p,secondary:null,alternate:null,replaceOnToggle:false,active:false});
    let kind=String(p.kind ?? (p.response ? "RESPONSE" : "TEXT")).toUpperCase();
    let primary=String(p.primary ?? p.text ?? "");
    let secondary=p.secondary == null ? null : String(p.secondary);
    let alternate=p.alternate == null ? null : String(p.alternate);
    let replaceOnToggle=p.replaceOnToggle === true && p.alternate != null;
    const rubric=/^\s*\[[\s\S]+\]\s*$/.test(primary);
    if(rubric)kind="RUBRIC";
    // A sung-source paragraph may ALREADY have Latin in primary, with its
    // vernacular in alternate. Never reverse that source-owned order.
    if(latinProminent && alternate && kind!=="RUBRIC" &&
       String(p.displayLanguage??"").toUpperCase()!=="LATIN"){
      secondary=primary;
      primary=alternate;
      alternate=null;
      replaceOnToggle=false;
    }
    if(latinProminent && /\b(?:Hoc est enim Corpus meum|Hic est enim Calix)\b/i.test(primary))kind="CONSECRATION_WORDS";
    const cueIds=p.sourceCueIds??(p.id?[p.id]:[]);
    primary=insertChantPhraseBreaks(primary,cueIds);
    secondary=insertChantPhraseBreaks(secondary,cueIds);
    alternate=insertChantPhraseBreaks(alternate,cueIds);
    return Object.freeze({
      id:String(p.id ?? index),kind,primary,secondary,alternate,replaceOnToggle,
      displayLanguage:latinProminent&&secondary?"LATIN":p.displayLanguage??null,
      active:p.active === true,
      speakerRole:p.speakerRole??null,
      speakerEvidence:p.speakerEvidence??null,
      liturgicalGroup:p.liturgicalGroup??null,
      prayerRole:p.prayerRole??null,
      languageOwner:p.languageOwner??null,
      sourceBlockId:p.sourceBlockId??null,
      sectionBoundaryBefore:p.sectionBoundaryBefore??null,
      sourcePath:p.sourcePath??null,
      sourceAnchorCueId:p.sourceAnchorCueId??null,
      sourceCueIds:Object.freeze([...(p.sourceCueIds ?? (p.id ? [p.id] : []))].map(String)),
      publishedMissalRubrics:Object.freeze((Array.isArray(p.publishedMissalRubrics)?p.publishedMissalRubrics:[])
        .filter(event=>event?.observedNow===false &&
          typeof event.displayText==="string" && event.displayText.trim() &&
          (p.sourceCueIds??[]).includes(event.sourceCueId) &&
          ((event.review==="EXISTING_PUBLISHED_R17_1962_RUBRIC" &&
            event.owner==="PUBLISHED_R17_MISSAL_INLINE" &&
            event.actor==="PRIEST" && event.sourceId==="MR62_RITUS") ||
           (event.review==="EXISTING_CERTIFIED_R18_SOLEMN_MINISTER" &&
            event.owner==="R18_CERTIFIED_SOLEMN_MISSAL" &&
            typeof event.actor==="string" && event.actor.trim() &&
            /^SMIN-0(?:0[1-9]|1[0-9])$/.test(String(event.id)) &&
            event.sourceId==="R18_SOLEMN_FORM_STATE")))
        .map(event=>Object.freeze({
          id:String(event.id),displayText:event.displayText,actor:event.actor,
          shortAction:typeof event.shortAction==="string"?event.shortAction:null,
          sourceCueId:event.sourceCueId,sourceId:event.sourceId,
          owner:event.owner,review:event.review,
          kind:event.kind??"ACTION",
          latinTrigger:typeof event.latinTrigger==="string"?event.latinTrigger:null,
          order:Number.isInteger(event.order)?event.order:null,
          observedNow:false,
          sourceUrl:typeof event.sourceUrl==="string" &&
            event.sourceUrl.startsWith("https://") ? event.sourceUrl : null,
        }))),
      publishedCanonRubrics:Object.freeze((Array.isArray(p.publishedCanonRubrics)?p.publishedCanonRubrics:[])
        .filter(event=>event?.review==="EXISTING_PUBLISHED_R17_1962_RUBRIC" &&
          event.actor==="PRIEST" && event.sourceId==="MR62_RITUS" &&
          event.observedNow===false && typeof event.shortAction==="string" &&
          event.shortAction.trim() &&
          (p.sourceCueIds??[]).includes(event.sourceCueId))
        .map(event=>Object.freeze({
          id:String(event.id),shortAction:event.shortAction,
          sourceCueId:event.sourceCueId,observedNow:false,
          sourceUrl:typeof event.sourceUrl==="string" &&
            event.sourceUrl.startsWith("https://") ? event.sourceUrl : null,
        }))),
    });
  }) : (previous.paragraphs ?? Object.freeze([]));

  const schola = persist(moment.schola, previous.schola);
  // Special-rite musical metadata is separate from the ordinary Schola
  // performance clock. It never supplies lyrics, tempo, or inferred sound.
  // A distinct-rite step can change chant/silence without replacing its
  // current prayer surface (e.g. each Ecce lignum kneel/rise state).
  // Respect an explicitly supplied null even when cardUpdate is false.
  const riteMusic=Object.prototype.hasOwnProperty.call(moment,"riteMusic")
    ? (moment.riteMusic??null)
    : moment.cardUpdate===false ? (previous.riteMusic??null) : null;
  const organPermission=Object.prototype.hasOwnProperty.call(moment,"organPermission")
    ? (moment.organPermission??null)
    : moment.cardUpdate===false ? (previous.organPermission??null) : null;
  const priestQuietOffertory=Object.prototype.hasOwnProperty.call(moment,"priestQuietOffertory")
    ? (moment.priestQuietOffertory??null)
    : moment.cardUpdate===false ? (previous.priestQuietOffertory??null) : null;
  const sharedTextWithSchola = moment.sharedTextWithSchola === true;
  const sharedScholaControls=moment.sharedScholaControls===true ||
    (moment.cardUpdate===false && previous.sharedScholaControls===true);
  const guide = moment.guide?.registryAvailable === true && moment.guide?.text
    ? Object.freeze({
        text:String(moment.guide.text),
        detail:moment.guide.detail == null ? null : String(moment.guide.detail),
        moment:moment.guide.moment == null ? momentTitle : String(moment.guide.moment),
        sourceLine:moment.guide.sourceLine == null ? null : String(moment.guide.sourceLine),
        sourceLinks:moment.guide.sourceLinks == null ? null : String(moment.guide.sourceLinks),
        coverage:moment.guide.coverage == null ? null : String(moment.guide.coverage),
        sourceMoment:moment.guide.sourceMoment == null ? null : String(moment.guide.sourceMoment),
      })
    : null;

  return Object.freeze({
    id:String(moment.id ?? previous.id ?? ""),
    sectionTitle:String(moment.sectionTitle ?? previous.sectionTitle ?? ""),
    cardTitle:String(moment.cardUpdate === false ? (previous.cardTitle ?? "") : (moment.cardTitle ?? moment.sectionTitle ?? previous.cardTitle ?? "")),
    cardUpdate:moment.cardUpdate !== false,
    paragraphs,
    missalHeadings:moment.cardUpdate===false ? (previous.missalHeadings??[]) :
      Object.freeze([...(moment.missalHeadings??[])]),
    missalRubric:moment.cardUpdate===false ? (previous.missalRubric??null) :
      (moment.missalRubric??null),
    objectiveContext:Object.prototype.hasOwnProperty.call(moment,"objectiveContext")
      ? (moment.objectiveContext??null)
      : moment.cardUpdate===false?(previous.objectiveContext??null):null,
    progress:moment.progress == null ? previous.progress ?? null : String(moment.progress),
    customary:moment.customary??(moment.cardUpdate===false?previous.customary:null),
    paragraphCues:moment.paragraphCues??(moment.cardUpdate===false?previous.paragraphCues:Object.freeze({})),
    posture:persist(moment.posture, previous.posture),
    gesture:moment.gesture ?? null,
    response:moment.response ?? null,
    postureCue:moment.postureCue ?? null,
    attention:moment.attention ?? null,
    attentionIconKey:moment.attentionIconKey ?? null,
    bell:moment.bell ?? null,
    // A witnessed Canon substage takes priority over the generic source cue.
    // If the stage is the genuflection or the priest's elevation without a
    // separately witnessed server bell, do not retain the old bell hold.
    canonStageBellOverride:moment.canonStageBellOverride===true,
    cinematic:moment.cinematic ?? null,
    cinematicScene:moment.cinematicScene ?? null,
    priestPosition:persist(moment.priestPosition, previous.priestPosition),
    priestAction:moment.priestAction ?? null,
    sacredMinister:projectCertifiedSolemnMinisterRubric(moment.sacredMinister),
    priestVoice:persist(moment.priestVoice, previous.priestVoice),
    schola,
    riteMusic,
    organPermission,
    priestQuietOffertory,
    // Undefined means a caller did not supply a live source clock.
    // Explicit null means the native source cue was cleared on card change.
    nativeCueId:Object.prototype.hasOwnProperty.call(moment,"nativeCueId")
      ? (moment.nativeCueId??null)
      : moment.cardUpdate===false ? previous.nativeCueId : undefined,
    // An unresolved sung Benedictus requires a real visible action; never
    // suppress the control just because a *priest* paragraph contains the
    // same words as a Schola part that has NOT yet begun.
    scholaShared:sharedTextWithSchola && !schola?.benedictusHold && Boolean(textValue(schola)),
    sharedScholaControls,
    scholaVisible:(!sharedTextWithSchola || schola?.benedictusHold===true ||
      sharedScholaControls) && Boolean(textValue(schola)),
    guide,
    priestPositionIconKey:moment.priestPositionIconKey ?? null,
    priestActionIconKey:moment.priestActionIconKey ?? null,
    postureIconKey:moment.postureIconKey ?? null,
    postureChangeIconKey:moment.postureChangeIconKey ?? null,
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
function renderGuideSheet(pop,guide,language="en"){
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
  if(guide.coverage==="INHERITED_MACRO_CONTEXT"&&guide.sourceMoment){
    const scope=doc.createElement("p");scope.className="ao-guide-scope";
    scope.textContent=(String(language).toLowerCase().startsWith("fr")?"Partie de : ":"Part of: ")+guide.sourceMoment;
    intro.append(scope);
  }
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
  // The rubric link is contextual and keeps the current Mass card untouched.
  const glossary=doc.createElement("div");glossary.className="ao-guide-contextual-term";
  glossary.innerHTML=glossaryContextCapsule("G067");
  body.append(glossary);
  sheet.append(body);pop.append(sheet);
}

export function buildReaderShellMarkup(prepared = {}) {
  const mode = normalizePresentationMode(prepared?.readerPreferences?.mode ?? prepared?.session?.resolvedMass?.presentationMode ?? "LIVE");
  const section = esc(prepared?.session?.resolvedMass?.actualCelebration?.title ?? "Mass");
  const liturgicalTheme=resolveMassLiturgicalTheme(prepared);
  return `<style data-ao-reader-shell-style>${SHELL_STYLE}</style>
<section class="ao-reader-shell" data-ao-reader-shell data-mode="${mode}" data-liturgical-colour="${liturgicalTheme.key}" data-liturgical-source="${liturgicalTheme.source}" style="${massThemeCssVariables(liturgicalTheme)}">
  <header class="ao-reader-top-ribbon" aria-label="Mass navigation">
    <button class="ao-reader-top-action" type="button" data-reader-home aria-label="Back to Ad Orientem home">${topNavSvg("home")}</button>
    <button class="ao-section-jump" type="button" data-role="section-jump" aria-expanded="false" disabled><span data-role="section-title">${section}</span><span class="ao-section-caret" aria-hidden="true">⌄</span></button>
    <button class="ao-reader-top-action" type="button" data-reader-preferences aria-label="Mass preferences" aria-expanded="false">${topNavSvg("preferences")}</button>
  </header>

  <div class="ao-state-ribbon" aria-live="polite">
    <span class="ao-state-source" data-role="canon-source-summary">CANON · RITUS SERVANDUS (1962)</span>
    <div class="ao-reader-objective-context" data-role="objective-context" hidden aria-live="off">
      <small data-role="objective-context-kicker">About this part of Mass</small>
      <span data-role="objective-context-text"></span>
    </div>
    <div class="ao-state-cell" data-side="faithful" data-channel="posture" data-faithful-icon-open role="button" tabindex="0" aria-label="Customize current faithful posture or gesture">
      <span class="ao-icon-mask" data-icon-slot="posture-top" hidden></span>
      <span class="ao-icon-mask ao-missal-gesture-icon" data-icon-slot="faithful-gesture-top" hidden aria-hidden="true"></span>
      <span class="ao-state-copy"><span class="ao-state-kicker">YOU</span><span class="ao-state-label" data-role="posture">—</span><span class="ao-missal-state-detail" data-role="missal-faithful-gesture" hidden></span></span>
    </div>
    <button class="ao-state-guide" type="button" data-role="guide-button" disabled hidden aria-hidden="true" tabindex="-1" aria-label="Explanatory Guide removed from Mass reader">
      <span class="ao-guide-icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="M5 4.75h10.5A2.5 2.5 0 0 1 18 7.25v12H7.5A2.5 2.5 0 0 1 5 16.75z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 8h6.5M8 11h6.5M8 14h4.5" fill="none" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/></svg></span>
      <span class="ao-guide-copy"><small>GUIDE</small><b class="ao-guide-short" data-role="guide-short">RUBRICS</b></span>
    </button>
    <div class="ao-state-cell" data-side="priest">
      <span class="ao-icon-mask" data-icon-slot="priest-position" hidden></span>
      <span class="ao-state-copy"><span class="ao-state-kicker">PRIEST</span><span class="ao-state-label" data-role="priest-position">—</span><span class="ao-priest-book-context" data-role="priest-book-context" hidden></span><span class="ao-missal-state-detail" data-role="missal-priest-action" hidden></span></span>
      <span class="ao-priest-action-badge" data-role="priest-action-badge" data-active="false" data-major="false" aria-hidden="true"><span class="ao-icon-mask" data-icon-slot="priest-action-top" hidden></span></span>
    </div>
  </div>
  <div class="ao-progress-track" aria-hidden="true"><span data-role="progress-track"></span></div>

  <div class="ao-section-menu" data-role="section-menu" hidden></div>
  <aside class="ao-mass-prefs" data-role="mass-preferences" data-open="false" aria-label="Mass preferences">
    <div class="ao-mass-prefs-head"><b>Mass preferences</b><button class="ao-mass-prefs-close" type="button" data-reader-preferences-close aria-label="Close preferences">×</button></div>
    <div class="ao-mass-prefs-group"><small>Reader mode</small><nav class="ao-mode-ribbon" aria-label="Reader mode">${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}"><span>${m}</span></button>`).join("")}</nav></div>
    <div class="ao-mass-prefs-group ao-customary-controls" role="group" aria-label="Local Mass customs">
      <small>Local participation customs</small>
      <label>Posture tradition<select data-reader-customary="postureProfile" aria-label="Posture tradition">
        <option value="FOLLOW_CONGREGATION">Follow congregation</option>
        <option value="OCONNELL_1962_COMMUNITY">1962 guided</option>
        <option value="TRADITIONAL_WALSH">Traditional</option>
        <option value="MY_LOCAL">Only saved cues</option>
      </select></label>
      <label>Gesture guidance<select data-reader-customary="gestureProfile" aria-label="Gesture guidance">
        <option value="ESSENTIAL">Essential</option>
        <option value="GUIDED_1962">1962 guided</option>
        <option value="TRADITIONAL">Traditional customs</option>
      </select></label>
      <label>Local posture for this passage<select data-reader-customary="localPosture" aria-label="Local posture for this cue" disabled>
        <option value="DEFAULT">Use tradition</option>
        <option value="STAND">Stand</option>
        <option value="SIT">Sit</option>
        <option value="KNEEL">Kneel</option>
      </select></label>
      <small data-customary-cue-note>Open a passage of the Mass to set a local posture.</small>
      <label>Confiteor before Communion<select data-reader-customary="secondConfiteor" aria-label="Optional local Confiteor before Communion">
        <option value="false">1962 Missal — omitted before Communion</option>
        <option value="true">Observed local custom — include Confiteor, Misereatur and Indulgentiam</option>
      </select></label>
      <small>Local or older custom only; not prescribed by the 1962 Missal. The opening Confiteor at the foot of the altar is unchanged.</small>
      <label>Schola Sanctus setting<select data-reader-customary="sanctusPerformance" aria-label="Schola Sanctus and Benedictus performance">
        <option value="UNSPECIFIED">Not sure — confirm when Benedictus begins</option>
        <option value="GREGORIAN">Gregorian chant — continuous Sanctus and Benedictus</option>
        <option value="POLYPHONIC">Polyphonic — Benedictus after Consecration</option>
      </select></label>
      <small>In the 1962 Sung Mass the priest recites the whole Sanctus. The sung Benedictus timing follows the actual choir. For polyphony, release the sung Benedictus only after the Chalice Consecration and genuflection.</small>
    </div>
    <button class="ao-mass-prefs-more" type="button" data-reader-glossary>Terms & rubrics</button><button class="ao-mass-prefs-more" type="button" data-reader-parameters>App settings</button>
  </aside>

  <aside class="ao-faithful-icon-picker" data-role="faithful-icon-picker" role="dialog" aria-label="Customize faithful cue" hidden>
    <div class="ao-faithful-icon-picker-header">
      <h3>My gesture at this passage</h3>
      <button type="button" data-faithful-picker-close aria-label="Close customization">×</button>
    </div>
    <small data-role="faithful-picker-cue"></small>
    <label>Posture
      <select data-faithful-picker-posture aria-label="My posture">
        <option value="DEFAULT">Follow the customary guide</option>
        <option value="STAND">Stand</option><option value="SIT">Sit</option><option value="KNEEL">Kneel</option>
      </select>
    </label>
    <label>Gesture
      <select data-faithful-picker-gesture aria-label="My gesture">
        <option value="DEFAULT">Follow the customary guide</option><option value="NONE">No gesture</option>
        <option value="HEAD_BOW">Bow head</option><option value="PROFOUND_BOW">Profound bow</option>
        <option value="GENUFLECT">Genuflect</option><option value="KNEEL">Kneel</option>
        <option value="SIGN_OF_CROSS">Sign of the Cross</option>
      </select>
    </label>
    <label>When priest uses the sedilia
      <select data-faithful-picker-seating aria-label="Mirror priest sitting and standing">
        <option value="true">Mirror sitting and standing (customary)</option>
        <option value="false">Keep source standing unless I choose otherwise</option>
      </select>
    </label>
    <label>Credo sitting after the Incarnatus
      <select data-faithful-picker-credo-start aria-label="When to sit during the Credo">
        <option value="AO.SM.C0097">At Crucifixus etiam pro nobis (first paragraph)</option>
        <option value="AO.SM.C0098">At Et iterum venturus est (following paragraph)</option>
      </select>
    </label>
    <small>The priest's sedilia is a source-backed state, but these word-level sitting and rising cues follow local custom. They do not rewrite the Mass rubrics.</small>
  </aside>
  <div class="ao-reader-stage" data-left-rail="true" data-right-rail="true">
    <aside class="ao-rail ao-rail-left" data-visible="true" aria-label="Faithful cues">
      <div class="ao-rail-item" data-channel="posture" data-active="true"><span class="ao-icon-mask" data-icon-slot="posture" hidden></span><span class="ao-rail-copy" data-role="posture-left" aria-hidden="true">—</span></div>
      <div class="ao-rail-item" data-channel="posture-change" data-active="false" aria-label="Change posture"><span class="ao-icon-mask" data-icon-slot="posture-change" hidden></span></div>
      <div class="ao-rail-item" data-channel="attention" data-active="false" aria-label="Listen to priest"><span class="ao-icon-mask" data-icon-slot="attention" hidden></span></div>
      <div class="ao-rail-item" data-channel="gesture" data-active="false"><span class="ao-icon-mask" data-icon-slot="gesture" hidden></span><span class="ao-rail-copy" data-role="gesture">—</span></div>
      <div class="ao-rail-item" data-channel="response" data-active="false"><span class="ao-icon-mask" data-icon-slot="response" hidden></span><span class="ao-rail-copy" data-role="response">—</span></div>
    </aside>

    <main class="ao-card-viewport">
      <article class="ao-prayer-card" data-role="card" tabindex="0">
        <h1 class="ao-prayer-title" data-role="card-title">${section}</h1>
        <p class="ao-rite-music-note" data-role="rite-music" hidden aria-live="off"></p>
        <p class="ao-organ-rule-note" data-role="organ-permission" hidden aria-live="off"></p>
        <p class="ao-offertory-quiet-note" data-role="priest-quiet-offertory" hidden aria-live="off"><span class="ao-icon-mask" data-icon-slot="priest-quiet-offertory" hidden aria-hidden="true"></span><span data-role="priest-quiet-offertory-label"></span></p>
        <div class="ao-prayer-body" data-role="paragraphs"></div>
      </article>
    </main>

    <aside class="ao-rail ao-rail-right" data-visible="true" aria-label="Priest, ministers, bell, and shared Schola cues">
      <div class="ao-rail-item" data-channel="priest-position" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-position-rail" hidden></span><span class="ao-rail-copy" data-role="priest-position-rail">—</span></div>
      <div class="ao-rail-item" data-channel="priest-voice" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-voice" hidden></span><span class="ao-rail-copy" data-role="priest-voice">—</span></div>
      <div class="ao-rail-item" data-channel="priest-action" data-active="false"><span class="ao-icon-mask" data-icon-slot="priest-action" hidden></span><span class="ao-rail-copy" data-role="priest-action">—</span></div>
      <div class="ao-rail-item" data-channel="sacred-minister" data-active="false" aria-hidden="true"><span class="ao-rail-copy" data-role="sacred-minister">—</span></div>
      <div class="ao-rail-item" data-channel="bell" data-active="false"><span class="ao-icon-mask ao-bell-icon" data-icon-slot="bell" hidden aria-hidden="true"></span><span class="ao-rail-copy" data-role="bell">—</span></div>
      <div class="ao-rail-item" data-channel="schola-shared" data-active="false" aria-label="Schola shares the current text"><span class="ao-icon-mask" data-icon-slot="schola-shared" hidden></span><span class="ao-rail-copy" aria-hidden="true">—</span></div>
    </aside>
  </div>

  <div class="ao-schola-dock" data-channel="schola" data-active="false" data-collapsed="false" data-show-translation="false">
    <span class="ao-schola-resize" data-schola-resize aria-hidden="true"></span>
    <div class="ao-schola-title"><span class="ao-icon-mask" data-icon-slot="schola" hidden></span><span class="ao-schola-kicker">SCHOLA</span><span class="ao-schola-status" data-role="schola-status" hidden></span><span class="ao-schola-page" data-role="schola-page"></span></div>
    <button class="ao-schola-toggle" type="button" data-schola-toggle aria-label="Hide Schola">HIDE</button>
    <div class="ao-schola-main" data-schola-translate title="Tap to translate" role="button" tabindex="-1" aria-label="Translate Schola text in place" aria-pressed="false" aria-disabled="true"><span data-role="schola" aria-live="polite">—</span></div>
    <div class="ao-schola-meta">
      <span class="ao-schola-progress"><span data-role="schola-progress"></span></span>
      <div class="ao-schola-controls" aria-label="Schola text speed">
        <button type="button" class="ao-schola-control" data-schola-previous aria-label="Previous Schola phrase" title="Previous Schola phrase">‹</button>
        <button type="button" class="ao-schola-control" data-schola-slower aria-label="Slower Schola text">−</button>
        <span class="ao-schola-control ao-schola-speed" data-role="schola-speed" aria-label="Schola speed">0.45×</span>
        <button type="button" class="ao-schola-control" data-schola-faster aria-label="Faster Schola text">+</button>
        <button type="button" class="ao-schola-control" data-schola-next aria-label="Next Schola phrase" title="Next Schola phrase">›</button>
        <button type="button" class="ao-schola-control" data-schola-release hidden aria-label="Start sung Benedictus when actually heard">BEGIN SUNG BENEDICTUS</button>
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
  // The top state cell and its hidden persistent rail counterpart may share
  // a semantic channel. Update both states: the top cell remains the only
  // persistent visual owner, while transient rails have their own channel.
  const label=textValue(value);
  const active=Boolean(label);
  for(const item of root.querySelectorAll?.(`[data-channel="${channel}"]`)??[]){
    item.dataset.active=String(active);
    // The icons are intentionally label-free visually, but remain meaningful
    // for screen readers and for long-press/hover; never leave stale labels
    // on a later inactive cue or a different priest action.
    if(!item.classList?.contains("ao-rail-item"))continue;
    if(active){
      item.setAttribute("role","img");
      const accessibleLabel=channel==="sacred-minister"
        ? "Expected 1962 minister rubric (not independently observed): "+label
        : label;
      item.setAttribute("aria-label",accessibleLabel);
      item.removeAttribute("aria-hidden");
      item.title=accessibleLabel;
    }else{
      item.removeAttribute("role");
      item.removeAttribute("aria-label");
      item.setAttribute("aria-hidden","true");
      item.removeAttribute("title");
    }
  }
}

function syncRailVisibility(root){
  const stage=root.querySelector(".ao-reader-stage");
  if(!stage)return;
  const shell=root.querySelector("[data-ao-reader-shell]");
  const live=String(shell?.dataset?.mode??"LIVE").toUpperCase()==="LIVE";
  const left=root.querySelector(".ao-rail-left");
  const right=root.querySelector(".ao-rail-right");
  // The left persistent posture is already owned by the top ribbon; only
  // transient faithful cues count when deciding if the left rail exists.
  const contextActive=live&&shell?.dataset?.objectiveContext==="true";
  const hasVisibleCue=rail=>Boolean(rail?.querySelector?.(
    contextActive
      ?'.ao-rail-item[data-active="true"][data-icon-visible="true"]'
      :'.ao-rail-item[data-active="true"][data-icon-visible="true"]:not([data-channel="posture"])'
  ));
  const leftActive=live&&hasVisibleCue(left),rightActive=live&&hasVisibleCue(right);
  if(left)left.dataset.visible=String(leftActive);
  if(right)right.dataset.visible=String(rightActive);
  stage.dataset.leftRail=String(leftActive);
  stage.dataset.rightRail=String(rightActive);
}

// A rail tile is allowed to exist visually only when the exact approved art
// resolves. Text belongs in source rubrics, not in a 52px icon-shaped box.
function syncRailIconSurfaces(root){
  for(const item of root.querySelectorAll?.(".ao-rail .ao-rail-item")??[]){
    const icon=item.querySelector?.(".ao-icon-mask");
    const hasArt=Boolean(item.dataset.active==="true" && icon && !icon.hidden &&
      icon.__aoIconIdentity);
    // The two cinematic elevations historically forced a text-only tile
    // because their donor graphics sometimes painted blank. Preserve source
    // text inline instead of allowing the empty tile back.
    const forcedText=item.dataset.channel==="priest-action" &&
      item.dataset.actionTextFallback==="true";
    const blankVoice=item.dataset.channel==="priest-voice" &&
      item.dataset.voiceTextFallback==="true";
    const visual=hasArt&&!forcedText&&!blankVoice;
    item.dataset.iconVisible=String(visual);
    if(!visual){
      item.removeAttribute("role");
      item.setAttribute("aria-hidden","true");
    }
  }
  syncRailVisibility(root);
}
function syncIconlessSourceRubric(root,current,mode,iconResolver,form){
  for(const old of root.querySelectorAll?.("[data-ao-iconless-rubric]")??[])
    old.remove();
  if(mode!=="LIVE")return;
  const cueId=current?.nativeCueId??null;
  if(!/^AO\.SM\.C\d{4}$/.test(String(cueId??"")))return;
  const action=current?.priestAction;
  const sourceCueId=action?.cueId??null;
  const meaning=actionMeaning(action,{cueId,form});
  const iconKey=current?.priestActionIconKey??null;
  const tile=root.querySelector?.('.ao-rail-right [data-channel="priest-action"]');
  const iconUrl=tile?.dataset.iconVisible==="true" &&
    typeof iconResolver==="function" && iconKey ?iconResolver(iconKey):null;
  const rows=[...(root.querySelectorAll?.(".ao-reader-paragraph")??[])];
  const owner=rows.find(node=>node.dataset.cueId===cueId) ??
    rows.find(node=>String(node.dataset.sourceCueIds??"").split(/\s+/).includes(cueId));
  if(!owner)return;
  const printedRubric=owner.dataset.kind==="RUBRIC" ||
    /^\s*\[/.test(owner.querySelector?.(".ao-line-primary")?.textContent??"");
  const hasSourceRubric=Boolean(owner.querySelector?.(
    '.ao-live-inline-rubrics [data-source-cue-id="'+cueId+'"]'
  ));
  const decision=resolveCueSurface({mode,cueId,sourceCueId,
    actionMeaning:meaning,iconKey,iconUrl,hasSourceRubric,printedRubric});
  if(decision!==CUE_SURFACE.INLINE_RUBRIC)return;
  const label=sourceActionRubricLabel(action?.label??action?.action??action?.value,
    root.querySelector?.('[data-ao-reader-shell]')?.dataset?.language??"en");
  if(!label)return;
  const doc=owner.ownerDocument??globalThis.document;
  const note=doc.createElement("span");
  note.className="ao-iconless-source-rubric";
  note.dataset.aoIconlessRubric="true";
  note.dataset.sourceCueId=cueId;
  note.dataset.sourceMeaning=meaning;
  note.dataset.presentation="INLINE_RUBRIC";
  note.dataset.observedNow="false";
  note.textContent=label;
  owner.append(note);
}

// The v1.80 bank uses SVG transport wrappers for 57 PNG alpha payloads,
// including bells, Host elevation, breast strike and priest voice. Chromium
// can flatten those wrappers to opaque CSS masks; unwrap by exact key rather
// than checking the misleading _rich filename suffix.
export function extractDonorRichMaskUri(svg){
  const match=String(svg??"").match(/<image\b[^>]*\bhref=(["'])(data:image\/png;base64,[A-Za-z0-9+/=]+)\1/i);
  return match?.[2]??null;
}

export function createDonorRichMaskLoader(fetchAsset=globalThis.fetch?.bind(globalThis)){
  const entries=new Map();
  return function load(src){
    const url=String(src??"");
    if(entries.has(url))return entries.get(url);
    const entry={value:null,promise:null};
    entries.set(url,entry);
    entry.promise=Promise.resolve().then(async()=>{
      if(typeof fetchAsset!=="function" || !url)return null;
      const response=await fetchAsset(url,{credentials:"same-origin"});
      return response?.ok ? extractDonorRichMaskUri(await response.text()) : null;
    }).then(value=>{
      entry.value=value;
      return value;
    }).catch(()=>null);
    return entry;
  };
}

const loadDonorRichMask=createDonorRichMaskLoader();
// A canonical alias (e.g. "canon:faithful.posture.stand") can point at the same
// donor wrapper file as a donor key, so the unwrap decision follows the file.
const DONOR_PNG_WRAPPER_URLS=new Set(R17_DONOR_PNG_ICON_KEYS.map(k=>R17_FROZEN_ACTIVE_ICON_ASSETS[k]).filter(Boolean));
export function isDonorPngWrapper(id,src){
  return R17_DONOR_PNG_ICON_KEYS.includes(id) || DONOR_PNG_WRAPPER_URLS.has(String(src??""));
}

function applyIconNode(el,key,iconResolver){
  if(!el)return;
  const id=String(key??"").trim();
  const src=id && typeof iconResolver==="function" ? iconResolver(id) : null;
  // Guard against a stale rich-art fetch repainting a newer gesture.
  const identity=src ? id+"|"+src : null;
  el.__aoIconIdentity=identity;
  if(!src){
    el.hidden=true;
    el.classList?.remove?.("ao-icon-direct");
    el.style.maskImage="";el.style.webkitMaskImage="";
    el.style.backgroundImage="";
    return;
  }
  el.hidden=false;
  const cssUrl=value=>`url("${String(value).replace(/"/g,'\\\"')}")`;
  const showMask=uri=>{
    if(el.__aoIconIdentity!==identity)return;
    el.classList?.remove?.("ao-icon-direct");
    el.style.backgroundImage="";
    el.style.maskImage=cssUrl(uri);
    el.style.webkitMaskImage=cssUrl(uri);
  };
  if(!isDonorPngWrapper(id,src)){
    showMask(src);
    return;
  }
  const entry=loadDonorRichMask(src);
  if(entry.value){
    showMask(entry.value);
    return;
  }
  // Preserve visible donor art even before the local wrapper is unwrapped,
  // and if file-origin/CSP restrictions block the same-origin fetch.
  el.classList?.add?.("ao-icon-direct");
  el.style.maskImage="none";el.style.webkitMaskImage="none";
  el.style.backgroundImage=cssUrl(src);
  entry.promise.then(uri=>{
    if(uri && el.__aoIconIdentity===identity)showMask(uri);
  });
}
function applyIcon(root,slot,key,iconResolver){
  applyIconNode(root.querySelector(`[data-icon-slot="${slot}"]`),key,iconResolver);
}

function syncExactIconBackedRubrics(root,current,mode,iconResolver){
  // Never suppress a reading or historical rubric merely because a nearby
  // generic icon looks similar. Even the same source cue can contain
  // genuflection, elevation, replacement and finger discipline.
  const cueId=current?.nativeCueId??null;
  const key=current?.priestActionIconKey??null;
  const actionLabel=String(current?.priestAction?.label??current?.priestAction?.action??"").trim();
  const renderedIcon=root.querySelector?.('[data-icon-slot="priest-action"]');
  const fallbackTile=root.querySelector?.('[data-channel="priest-action"]');
  const imagePresent=Boolean(fallbackTile?.dataset.actionTextFallback!=="true"&&
    key&&renderedIcon&&!renderedIcon.hidden&&
    typeof iconResolver==="function"&&iconResolver(key));
  let covered=0;
  for(const item of root.querySelectorAll?.('.ao-live-inline-rubrics [data-rubric-id]')??[]){
    const match=exactIconBackedRubric(item.dataset.rubricId,{
      mode,cueId,priestActionIconKey:key,iconResolved:imagePresent,priestActionLabel:actionLabel
    });
    if(match){item.dataset.iconBacked="true";covered++;}
    else delete item.dataset.iconBacked;
  }
  for(const note of root.querySelectorAll?.('.ao-live-inline-rubrics')??[]){
    const actions=[...(note.querySelectorAll?.('.ao-live-rubric-action')??[])];
    note.dataset.fullyIconBacked=String(actions.length>0 &&
      actions.every(x=>x.dataset.iconBacked==="true") &&
      (note.querySelector?.("details")==null));
  }
  const actionRail=root.querySelector?.('[data-channel="priest-action"]');
  if(actionRail){
    // setChannel owns the accessible meaning and long-press title. Rubric
    // compaction may mark exact artwork provenance but must never erase or
    // replace the active cue's label (or restore one on an inactive cue).
    if(covered)actionRail.dataset.rubricSourceIcon="true";
    else delete actionRail.dataset.rubricSourceIcon;
  }
  return covered;
}


export function toggleReaderTranslation(node){
  if(node?.dataset?.translateToggle!=="true")return false;
  const primary=node.querySelector?.(".ao-line-primary");
  if(!primary)return false;
  const showingAlt=node.dataset.showingAlt==="true";
  const text=showingAlt ? node.dataset.primaryText : node.dataset.altText;
  if(text==null)return false;
  renderReaderText(primary,text,{
    anchor:node.dataset.ritualAnchor??null,
    active:node.dataset.ritualCueActive==="true",
  });
  node.dataset.showingAlt=String(!showingAlt);
  node.setAttribute?.("aria-pressed",String(!showingAlt));
  return true;
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
  onCustomaryChange = null,
  onScholaAdvance = null,
  onScholaPrevious = null,
  onScholaRelease = null,
  sections = [],
  onSectionSelect = null,
  allowPresentationModeSwitch = true,
} = {}) {
  if(!root || typeof root.querySelector !== "function") throw new TypeError("Reader root element required");

  let prepared=null;
  let current=null;
  let mode="LIVE";
  let bound=false;
  let rootClickListener=null;
  let rootChangeListener=null;
  let rootKeydownListener=null;
  let sectionItems=Array.isArray(sections)?[...sections]:[];
  let selectedFaithfulRowId=null;
  let scholaCollapsed=false;
  let scholaManuallyResized=false;
  let scholaHeight=(root.ownerDocument?.defaultView?.matchMedia?.("(max-width:760px)")?.matches ? 166 : 150);
  let scholaExpandedHeight=scholaHeight;
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
  let scholaTickerFinishedIdentity=null;
  let suppressNavClickUntil=0;
  let suppressNavClickDirection=null;
  let suppressModeClickUntil=0;
  let swipeStart=null;
  let wheelIntent={dir:0,amount:0,last:0};
  let navCooldownUntil=0;

  function setMode(next){
    const requested=normalizePresentationMode(next);
    if(!allowPresentationModeSwitch && requested!==mode)return mode;
    // Re-selecting a mode must not rebuild the 48-card reader or reset the cue.
    if(requested===mode)return mode;
    const previous=mode;
    const applyChrome=()=>{
      const shell=root.querySelector("[data-ao-reader-shell]");
      if(shell)shell.dataset.mode=mode;
      for(const button of root.querySelectorAll?.("[data-reader-mode]")??[]){
        button.setAttribute("aria-pressed",String(button.dataset.readerMode===mode));
      }
      const button=root.querySelector('[data-role="guide-button"]');
      const pop=root.querySelector('[data-role="guide-popover"]');
      if(button){
        button.hidden=true;
        button.disabled=true;
        button.tabIndex=-1;
        button.setAttribute("aria-hidden","true");
      }
      if(pop){pop.hidden=true;pop.replaceChildren?.();}
      syncRailVisibility(root);
    };
    mode=requested;
    applyChrome();
    try{
      onPresentationModeChange?.(mode,prepared);
      root.querySelector?.(".aoMassModeError")?.remove?.();
    }catch(error){
      mode=previous;
      applyChrome();
      const panel=root.querySelector?.('[data-role="mass-preferences"]');
      const doc=panel?.ownerDocument;
      panel?.querySelector?.(".aoMassModeError")?.remove?.();
      if(doc?.createElement){
        const warning=doc.createElement("p");
        warning.className="aoMassModeError";
        warning.setAttribute("role","alert");
        warning.textContent="Reader mode could not change. Current position retained.";
        warning.style.cssText="font:500 12px/1.5 var(--ao-font-ui,system-ui,sans-serif);color:#e5c8ab;margin:8px 0";
        panel.append(warning);
      }
      console.error("R17 Mass mode switch failed",error);
    }
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
    // A separately witnessed Canon stage is not a new bell observation.
    // Clear any prior bell hold immediately on genuflection/replacement,
    // even though the underlying C0174/C0181 textual cue has not changed.
    if(current?.canonStageBellOverride===true && !nextBell){
      heldBell=null;bellHoldUntil=0;
      if(bellHoldTimer){clearTimeout(bellHoldTimer);bellHoldTimer=0;}
      return null;
    }
    // Never carry a bell icon across a changed source cue. A bell may
    // have a visual hold, but that hold is NOT evidence it was heard.
    if(heldBell && current?.nativeCueId!==undefined &&
      heldBell.cueId!==current.nativeCueId){
      heldBell=null;bellHoldUntil=0;
      if(bellHoldTimer){clearTimeout(bellHoldTimer);bellHoldTimer=0;}
    }
    if(nextBell && current?.nativeCueId!==undefined &&
      nextBell.cueId!==current.nativeCueId)return null;
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
      SANCTUS_BENEDICTUS:"SANCTUS",
      AGNUS_DEI:"AGNUS DEI",
      COMMUNION:"COMMUNION ANTIPHON",
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
    const source=current?.scholaVisible ? current.schola : null;
    const previous=root.querySelector("[data-schola-previous]");
    const next=root.querySelector("[data-schola-next]");
    if(previous)previous.disabled=!source || Number(source.index)<=0;
    if(next)next.disabled=!source || Boolean(source.complete) ||
      Boolean(source.benedictusHold) || Number(source.index)>=Number(source.total)-1;
    const release=root.querySelector("[data-schola-release]");
    if(release){
      release.hidden=!source?.benedictusHold || source?.benedictusReleaseAllowed!==true;
      release.textContent=source?.sanctusPerformance==="POLYPHONIC"
        ? "BEGIN BENEDICTUS · AFTER CHALICE" : "BEGIN BENEDICTUS · WHEN HEARD";
    }
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
    if(identity!==scholaTickerIdentity)return;
    scholaTickerFinishedIdentity=identity;
    const progress=root.querySelector('[data-role="schola-progress"]');
    if(progress)progress.style.width="100%";
    // This is the end of a *text animation*, not the end of singing.
    // Never call onScholaAdvance here. Only the Schola's explicit previous/
    // next controls may move its phrase, independently of priestly scroll.
    scholaAnimation=null;scholaProgressRaf=0;scholaFallbackTimer=0;
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
    if(!force && scholaTickerFinishedIdentity===identity)return false;
    if(!force && scholaTickerIdentity===identity && scholaAnimation)return true;
    cancelScholaTicker();
    scholaTickerIdentity=identity;
    scholaTickerFinishedIdentity=null;
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
    const oldSpeed=scholaSpeed;
    scholaSpeed=next;
    storeScholaSpeed();
    syncScholaControls();
    if(scholaAnimation){
      // Change the running or paused WAAPI clock without losing reading position.
      const viewport=root.querySelector(".ao-schola-main");
      const line=root.querySelector('[data-role="schola"]');
      const measures={
        viewportWidth:viewport?.clientWidth??0,
        lineWidth:line?.scrollWidth??0,
        isMobile:Number(scholaWindow()?.innerWidth||0)<760,
      };
      const before=scholaTickerDuration({...measures,speed:oldSpeed});
      const after=scholaTickerDuration({...measures,speed:next});
      const rate=Number(scholaAnimation.playbackRate)||1;
      scholaAnimation.playbackRate=rate*(before/after);
    }else if(!scholaPaused&&!scholaTranslationVisible && scholaTickerFinishedIdentity!==scholaTickerIdentity){
      startScholaTicker({force:true});
    }
    return scholaSpeed;
  }

  function syncScholaContent(){
    const dock=root.querySelector(".ao-schola-dock");
    if(!dock)return;
    syncScholaControls();
    const schola=current?.scholaVisible ? current.schola : null;
    const identity=schola ? [schola.trackId,schola.segmentId,schola.cueId].filter(Boolean).join("|") : null;
    const changed=identity!==scholaIdentity;
    if(changed){
      const restoringFromTranslation=scholaTranslationVisible &&
        !scholaPausedBeforeTranslation && !scholaUserPaused;
      scholaIdentity=identity;
      scholaTickerFinishedIdentity=null;
      scholaTranslationVisible=false;
      cancelScholaTicker({clearIdentity:true});
      // A new independent chant returns to Latin and resumes only if
      // translation (not a user pause) was what stopped the clock.
      if(restoringFromTranslation){scholaPaused=false;syncScholaControls();}
    }
    dock.dataset.showTranslation=String(Boolean(scholaTranslationVisible && schola?.english));
    const translationTrigger=root.querySelector("[data-schola-translate]");
    if(translationTrigger){
      translationTrigger.setAttribute?.("aria-pressed",String(Boolean(scholaTranslationVisible && schola?.english)));
      translationTrigger.setAttribute?.("aria-disabled",String(!schola?.english));
      translationTrigger.setAttribute?.("aria-label",scholaTranslationVisible?"Restore Latin Schola text":"Translate Schola text in place");
      translationTrigger.tabIndex=schola?.english?0:-1;
    }
    const title=root.querySelector(".ao-schola-kicker");
    if(title){
      // The source-authenticated B022 subcard gives a precise chant title.
      // Do not repeat the generic three-chant heading over a 320px phone.
      const exactPreGospel=/^(?:Gradual|Alleluia|Tract|Sequence)$/.test(
        String(current?.cardTitle??""))?String(current.cardTitle):null;
      title.textContent=schola
        ? (schola.trackId==="ALLELUIA_TRACT_SEQUENCE"&&exactPreGospel
          ? exactPreGospel.toUpperCase():scholaTitle(schola.trackId))
        : "SCHOLA";
    }
    setText(root,"schola",schola
      ? (scholaTranslationVisible && schola.english
          ? schola.english
          : (schola.latin??textValue(schola)))
      : null);
    const status=root.querySelector('[data-role="schola-status"]');
    if(status){
      status.textContent=schola ? "EXPECTED" : "";
      status.hidden=!schola;
      status.setAttribute?.("aria-label","Schola text expected; actual singing not detected");
    }
    dock.dataset.musicStatus=schola?.musicStatus??"NOT_ACTIVE";
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
    dock.dataset.shared=String(current?.scholaShared===true && current?.sharedScholaControls===true);
    dock.dataset.resized=String(scholaManuallyResized);
    dock.style.setProperty?.("--ao-schola-height",scholaHeight+"px");
    const shell=root.querySelector("[data-ao-reader-shell]");
    const scholaActive=dock.dataset.active==="true";
    const scholaRelevant=Boolean(textValue(current?.schola)) && current?.scholaShared!==true;
    const reserve=(scholaActive||scholaRelevant||scholaCollapsed)
      ? (scholaCollapsed ? 44 :
          dock.dataset.shared==="true" && !scholaManuallyResized ? 132 : scholaHeight) : 0;
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

  function closeGuide(){
    const pop=root.querySelector?.('[data-role="guide-popover"]');
    if(!pop || pop.hidden)return false;
    pop.hidden=true;pop.replaceChildren?.();
    root.querySelector?.('[data-role="guide-button"]')?.focus?.();
    return true;
  }

  function toggleScholaTranslation(){
    if(!current?.schola?.english)return false;
    const opening=!scholaTranslationVisible;
    if(opening){
      scholaPausedBeforeTranslation=scholaPaused;
      scholaTranslationVisible=true;
      setScholaPaused(true);
      cancelScholaTicker({clearIdentity:true});
      const line=root.querySelector('[data-role="schola"]');
      if(line?.style)line.style.transform="";
      syncScholaContent();
    }else{
      scholaTranslationVisible=false;
      syncScholaContent();
      if(!scholaPausedBeforeTranslation&&!scholaUserPaused)setScholaPaused(false);
    }
    return true;
  }

  function toggleRubric(rubric){
    if(!rubric || rubric.dataset?.rubricExpandable!=="true")return false;
    const expanded=rubric.dataset.expanded!=="true";
    rubric.dataset.expanded=String(expanded);
    rubric.setAttribute?.("aria-expanded",String(expanded));
    return true;
  }

  function unbind(){
    if(rootClickListener)root.removeEventListener?.("click",rootClickListener);
    if(rootChangeListener)root.removeEventListener?.("change",rootChangeListener);
    if(rootKeydownListener)root.removeEventListener?.("keydown",rootKeydownListener);
    rootClickListener=null;
    rootChangeListener=null;
    rootKeydownListener=null;
    bound=false;
  }

  function bind(){
    if(bound) return;
    bound=true;
    rootChangeListener=event=>{
      const picker=root.querySelector('[data-role="faithful-icon-picker"]');
      if(picker && !picker.hidden){
        const cueId=picker.dataset.cueId;
        if(event.target?.matches?.("[data-faithful-picker-posture]")){
          onCustomaryChange?.({kind:"localPosture",value:event.target.value,cueId});return;
        }
        if(event.target?.matches?.("[data-faithful-picker-gesture]")){
          onCustomaryChange?.({kind:"localGesture",value:event.target.value,cueId});return;
        }
        if(event.target?.matches?.("[data-faithful-picker-seating]")){
          onCustomaryChange?.({kind:"followPriestSeating",value:event.target.value==="true"});return;
        }
        if(event.target?.matches?.("[data-faithful-picker-credo-start]")){
          onCustomaryChange?.({kind:"credoSitStart",value:event.target.value});return;
        }
      }
      const select=event.target?.closest?.("[data-reader-customary]");
      if(!select||select.disabled||!current?.customary)return;
      const kind=select.dataset.readerCustomary;
      if(!["postureProfile","gestureProfile","localPosture","secondConfiteor","sanctusPerformance"].includes(kind))return;
      onCustomaryChange?.({kind,value:select.value,cueId:current.customary.cueId});
    };
    root.addEventListener?.("change",rootChangeListener);
    rootClickListener=event => {
      const iconPick=event.target?.closest?.("[data-faithful-icon-open]");
      if(iconPick){
        const id=iconPick.dataset.faithfulIconOpen;
        openFaithfulPicker(id??null);
        return;
      }
      if(event.target?.closest?.("[data-faithful-picker-close]")){
        closeFaithfulPicker();return;
      }
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
        // Choosing the current section must not return the text to its first line.
        if(sectionButton.dataset.readerSection!==current?.id){
          onSectionSelect?.(sectionButton.dataset.readerSection,current,prepared);
        }
        closeSectionMenu();
        return;
      }
      const scholaToggle=event.target?.closest?.("[data-schola-toggle]");
      if(scholaToggle){
        scholaCollapsed=!scholaCollapsed;
        if(!scholaCollapsed)scholaHeight=scholaExpandedHeight;
        syncScholaChrome();
        ensureShortCardCueTravel();
        return;
      }
      const scholaPrevious=event.target?.closest?.("[data-schola-previous]");
      if(scholaPrevious){
        if(!scholaPrevious.disabled && current?.scholaVisible && typeof onScholaPrevious==="function")
          onScholaPrevious(current?.schola,current,prepared);
        return;
      }
      const scholaRelease=event.target?.closest?.("[data-schola-release]");
      if(scholaRelease){
        if(!scholaRelease.hidden && current?.scholaVisible && typeof onScholaRelease==="function")
          onScholaRelease(current.schola,current,prepared);
        return;
      }
      const scholaNext=event.target?.closest?.("[data-schola-next]");
      if(scholaNext){
        if(!scholaNext.disabled && current?.scholaVisible && typeof onScholaAdvance==="function")
          onScholaAdvance(current?.schola,current,prepared);
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
        toggleScholaTranslation();
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
      if(event.target?.closest?.('[data-rubric-source-link="true"]'))return;
      const translatable=event.target?.closest?.('[data-translate-toggle="true"]');
      if(translatable && mode!=="MISSAL"){
        toggleReaderTranslation(translatable);
        translatable.dataset.ritualCueActive="false";
        syncReaderRitualHighlights(root,current?.gesture);
        return;
      }
      // The Guide is no longer a Mass-reader interaction. Its separate
      // educational corpus remains available outside the ritual player.
      if(event.target?.closest?.('[data-role="guide-button"],[data-role="guide-popover"]'))return;
      const rubric=event.target?.closest?.('.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]');
      if(rubric){toggleRubric(rubric);return;}
    };
    root.addEventListener?.("click",rootClickListener);
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
    rootKeydownListener=event=>{
      if(event.key==="Escape" && !root.querySelector('[data-role="faithful-icon-picker"]')?.hidden){
        closeFaithfulPicker();event.preventDefault?.();return;
      }
      if((event.key==="Enter"||event.key===" ") &&
        event.target?.matches?.("[data-faithful-icon-open]")){
        event.preventDefault?.();openFaithfulPicker(event.target.dataset.faithfulIconOpen??null);return;
      }
      const key=event.key;
      const pop=root.querySelector?.('[data-role="guide-popover"]');
      const sectionMenu=root.querySelector?.('[data-role="section-menu"]');
      const prefs=root.querySelector?.('[data-role="mass-preferences"]');
      if(key==="Escape"){
        if(pop?.hidden===false){event.preventDefault?.();closeGuide();return;}
        if(sectionMenu?.hidden===false){
          event.preventDefault?.();
          closeSectionMenu();
          root.querySelector?.('[data-role="section-jump"]')?.focus?.();
          return;
        }
        if(prefs?.dataset?.open==="true"){
          event.preventDefault?.();
          setPreferencesOpen(false);
          root.querySelector?.("[data-reader-preferences]")?.focus?.();
          return;
        }
      }
      const tag=String(event.target?.tagName??"").toUpperCase();
      if(key==="Enter"||key===" "){
        const translatable=event.target?.closest?.('[data-translate-toggle="true"]');
        if(translatable && mode!=="MISSAL"){
          event.preventDefault?.();
          toggleReaderTranslation(translatable);
          translatable.dataset.ritualCueActive="false";
          syncReaderRitualHighlights(root,current?.gesture);
          return;
        }
        const scholaTranslate=event.target?.closest?.("[data-schola-translate]");
        if(scholaTranslate && current?.schola?.english){
          event.preventDefault?.();toggleScholaTranslation();return;
        }
        const rubric=event.target?.closest?.('.ao-reader-paragraph[data-kind="RUBRIC"][data-rubric-expandable="true"]');
        if(rubric){event.preventDefault?.();toggleRubric(rubric);return;}
      }
      if(["INPUT","SELECT","TEXTAREA"].includes(tag))return;
      if(event.target?.isContentEditable)return;
      if(pop?.hidden===false || sectionMenu?.hidden===false || prefs?.dataset?.open==="true")return;
      // Arrow keys inside controls belong to those controls, not Mass navigation.
      if(["BUTTON","A"].includes(tag) || event.target?.closest?.("button,a,[role=button]"))return;
      if(key==="ArrowRight"){event.preventDefault?.();navigateBy(1,"keyboard");}
      else if(key==="ArrowLeft"){event.preventDefault?.();navigateBy(-1,"keyboard");}
    };
    root.addEventListener?.("keydown",rootKeydownListener);
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
        const next=Math.max(44,Math.min(180,startHeight+(startY-event.clientY)));
        scholaManuallyResized=true;
        const mobile=Boolean(root.ownerDocument?.defaultView?.matchMedia?.("(max-width:760px)")?.matches);
        const expandedMinimum=mobile?158:128;
        scholaCollapsed=next<expandedMinimum-16;
        if(scholaCollapsed)scholaHeight=44;
        else{
          scholaHeight=Math.max(expandedMinimum,next);
          scholaExpandedHeight=scholaHeight;
        }
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
    // The root survives innerHTML replacement; old delegated handlers do too unless removed.
    unbind();
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
    bind();
    return prepared;
  }

  function ensureShortCardCueTravel(){
    const card=root.querySelector?.(".ao-prayer-card");
    const body=root.querySelector?.('[data-role="paragraphs"]');
    if(!card?.getBoundingClientRect || !body?.getBoundingClientRect ||
       !card?.style?.setProperty || !card?.ownerDocument?.defaultView?.getComputedStyle)return;
    // Recompute from the original fixed layout every time, not from the
    // previously extended size. This also handles Schola collapse/expansion.
    card.style.setProperty("--ao-short-cue-tail","0px");
    const cueCount=body.querySelectorAll?.(".ao-reader-paragraph[data-cue-id]")?.length??0;
    const readingCount=body.querySelectorAll?.('.ao-reader-paragraph:not([data-kind="RUBRIC"])')?.length??0;
    const focusCount=Math.max(cueCount,readingCount);
    if(focusCount<2){
      delete body.dataset.aoReadingRunway;
      body.style.removeProperty("--ao-min-reading-travel");
      return;
    }
    // Let CSS enforce a scrollable reading region independent of a transient
    // JS layout measurement. This does not enlarge any paragraph itself.
    body.dataset.aoReadingRunway="true";
    body.style.setProperty("--ao-min-reading-travel",
      Math.min(640,Math.max(72,(focusCount-1)*58))+"px");
    const viewport=Math.max(0,card.clientHeight||0);
    if(!viewport)return;
    const win=card.ownerDocument.defaultView;
    const basePadding=Number.parseFloat(win.getComputedStyle(card).paddingBottom)||0;
    const contentBottom=body.getBoundingClientRect().bottom-card.getBoundingClientRect().top+
      (Number(card.scrollTop)||0);
    // Allow at least one meaningful scroll interval per distinct cue, capped
    // at 240px on longer devices. Never modify individual prayer line heights.
    // Gloria and Credo end with two distinct word-owned events:
    // rise at Cum Sancto Spiritu / Et vitam, then the concluding Amen.
    // The last-cue edge guard must not swallow the penultimate cue.
    // Give those dense Ordinary cards extra end scroll *territory*,
    // without stretching prayer paragraphs or moving their text anchors.
    const closingOrdinary=/\b(?:Gloria|Credo)\b/i.test(current?.sectionTitle??"");
    const travel=Math.min(closingOrdinary?340:240,Math.max(68,(focusCount-1)*56));
    const extra=Math.max(0,Math.ceil(viewport+travel-contentBottom-basePadding));
    // On naturally long Ordinary cards, extra can be zero even though the
    // source-backed penultimate doxology is swallowed by the hard last-cue
    // scroll edge. Reserve precisely enough additional scroll to place
    // that cue on the 39% focus line *before* the final-cue edge zone.
    let closingExtra=0;
    // The penultimate cue must have reading territory BEFORE the hard
    // final-cue edge guard. This applies to the Confiteor, altar ascent,
    // responses and Offertory as well as the Gloria/Credo doxologies.
    // Only the source cue's geometric position determines the tail.
    const cues=[...(body.querySelectorAll?.(".ao-reader-paragraph[data-cue-id]")??[])];
    const penultimate=cues.at(-2);
    if(penultimate){
      const cr=card.getBoundingClientRect(),pr=penultimate.getBoundingClientRect();
      const center=pr.top-cr.top+card.scrollTop+pr.height/2;
      const requiredScroll=center-viewport*.39+24;
      // CSS min-height provides real scroll travel relative to the settled
      // viewport. Make that travel large enough to center the penultimate
      // event, not merely proportional to the number of paragraphs; a
      // one-line response near the bottom otherwise loses its entire turn.
      const baseline=Math.min(640,Math.max(72,(focusCount-1)*58));
      const first=cues[0]?.getBoundingClientRect?.();
      const firstCenter=first
        ? Math.max(24,first.top-cr.top+card.scrollTop+first.height/2)
        :24;
      // The cue-focus owner ramps its reading line from the opening cue
      // using an offset of firstCenter + .8*scrollTop, so its early focus
      // coordinate advances at 1.8x scroll. Short concluding responses
      // can otherwise be bypassed by the terminal-cue edge rule before
      // the focus line ever reaches them (Pater noster C0210).
      const openingTravel=Math.max(0,(center-firstCenter)/1.8)+64;
      // Long composite Simple cards can place the penultimate cue beyond
      // 1800px; the former cap made C0199 (Per quem) unreachable.
      const guaranteed=Math.min(3600,Math.max(baseline,
        Math.ceil(requiredScroll+28),Math.ceil(openingTravel)));
      body.style.setProperty("--ao-min-reading-travel",guaranteed+"px");
      const availableScroll=Math.max(0,card.scrollHeight-viewport);
      closingExtra=Math.max(0,Math.ceil(requiredScroll-availableScroll));
    }
    let tail=Math.max(extra,closingExtra);
    if(tail)card.style.setProperty("--ao-short-cue-tail",tail+"px");
    // Verify actual scroll travel, rather than deriving it from content
    // bottom/padding (which can be wrong in the curated fixed-height stage).
    // Dense short cards such as Kyrie, Gloria doxology, Credo and Agnus Dei
    // previously had 0-38px of movement for 3-9 distinct source cues.
    // Allocate a bounded reading runway WITHOUT stretching prayer rows.
    const actualMax=Math.max(0,card.scrollHeight-card.clientHeight);
    const minimumTravel=Math.min(640,Math.max(72,(focusCount-1)*58));
    if(actualMax+1<minimumTravel){
      // scrollHeight is clamped to clientHeight when content is shorter than
      // the viewport. Adding only (minimumTravel - actualMax) misses the
      // invisible *empty-space deficit*: a 120px prayer inside a 450px
      // viewport can absorb 300px of tail without scrolling at all.
      // Measure the true last content edge plus the CURRENT CSS padding.
      const cardRect=card.getBoundingClientRect();
      const bodyRect=body.getBoundingClientRect();
      const padding=Number.parseFloat(win.getComputedStyle(card).paddingBottom)||0;
      const contentExtent=Math.max(0,
        bodyRect.bottom-cardRect.top+(Number(card.scrollTop)||0)+padding);
      const neededExtent=viewport+minimumTravel;
      const deficit=Math.max(0,Math.ceil(neededExtent-contentExtent));
      tail+=Math.max(deficit,Math.ceil(minimumTravel-actualMax));
      card.style.setProperty("--ao-short-cue-tail",tail+"px");
    }
  }

  function closeFaithfulPicker(){
    const picker=root.querySelector('[data-role="faithful-icon-picker"]');
    if(picker)picker.hidden=true;
    selectedFaithfulRowId=null;
  }
  function openFaithfulPicker(rowId=null){
    const entries=Object.entries(current?.paragraphCues??{});
    const chosen=entries.find(([key,value])=>key===rowId||value.cueId===rowId) ??
      entries.find(([,value])=>value.cueId===current?.customary?.cueId) ??
      entries[0];
    if(!chosen)return false;
    selectedFaithfulRowId=chosen[0];
    const picker=root.querySelector('[data-role="faithful-icon-picker"]');
    if(!picker)return false;
    picker.hidden=false;
    syncFaithfulPicker();
    picker.querySelector('[data-faithful-picker-posture]')?.focus?.();
    return true;
  }
  function syncFaithfulPicker(){
    const picker=root.querySelector('[data-role="faithful-icon-picker"]');
    if(!picker||picker.hidden||!selectedFaithfulRowId)return;
    const row=current?.paragraphCues?.[selectedFaithfulRowId];
    if(!row){closeFaithfulPicker();return;}
    picker.dataset.cueId=row.cueId;
    const note=picker.querySelector('[data-role="faithful-picker-cue"]');
    if(note)note.textContent=row.phase+" · "+row.cueId+
      (row.conditionalSedilia?" · Priest seated (customary projection)":"");
    const posture=picker.querySelector('[data-faithful-picker-posture]');
    if(posture){
      posture.value=current?.customary?.localPostures?.[row.cueId]??
        row.savedPosture??"DEFAULT";
      posture.disabled=row.fixedSourcePosture;
    }
    const gesture=picker.querySelector('[data-faithful-picker-gesture]');
    if(gesture)gesture.value=row.savedGesture??"DEFAULT";
    const seating=picker.querySelector('[data-faithful-picker-seating]');
    if(seating)seating.value=String(current?.customary?.followPriestSeating!==false);
    const credoStart=picker.querySelector("[data-faithful-picker-credo-start]");
    if(credoStart){
      credoStart.value=current?.customary?.credoSitStart??"AO.SM.C0097";
      credoStart.parentElement.hidden=row.phase!=="CREDO";
    }
  }
  function syncFaithfulParagraphIcons(){
    // Gloria and Credo retain editable source-cue preferences, but their
    // gestures and posture are displayed exclusively in the common state
    // ribbon / exact-cue rails. There is no inline art or per-line tap target.
    for(const node of root.querySelectorAll?.('.ao-reader-paragraph[data-faithful-row-id]')??[]){
      const row=current?.paragraphCues?.[node.dataset.faithfulRowId];
      if(row)node.dataset.faithfulPosture=row.posture;
    }
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
    const shellContext=root.querySelector("[data-ao-reader-shell]");
    const copy=current.objectiveContext;
    const showContext=mode==="LIVE"&&
      copy?.owner==="MASS_READER_OBJECTIVE_CONTEXT_V1"&&
      copy?.status==="SOURCE_GROUNDED_EDITORIAL_SHORT"&&
      copy?.cueId===current.nativeCueId&&
      /^AO\.SM\.B\d{3}$/.test(String(copy.blockId??""))&&
      typeof copy.text==="string"&&copy.text.length>0;
    if(shellContext)shellContext.dataset.objectiveContext=String(showContext);
    const contextNode=root.querySelector('[data-role="objective-context"]');
    if(contextNode){
      contextNode.hidden=!showContext;
      contextNode.dataset.blockId=showContext?copy.blockId:"";
    }
    const contextText=root.querySelector('[data-role="objective-context-text"]');
    if(contextText)contextText.textContent=showContext?copy.text:"";
    const contextKicker=root.querySelector('[data-role="objective-context-kicker"]');
    if(contextKicker)contextKicker.textContent=showContext&&copy.language==="fr"
      ?"CE MOMENT DE LA MESSE":"ABOUT THIS PART OF MASS";
    const musicNote=root.querySelector('[data-role="rite-music"]');
    if(musicNote){
      const metadata=current.riteMusic?.musicStatus==="EXPECTED_NOT_OBSERVED"
        ? current.riteMusic : null;
      musicNote.hidden=!metadata;
      musicNote.textContent=metadata?.label??"";
      musicNote.dataset.musicOwner=metadata?.sourceOwner??"NONE";
      musicNote.dataset.musicEventIds=metadata?.eventIds?.join(" ")??"";
      musicNote.setAttribute?.("aria-label",metadata
        ? metadata.label+". "+metadata.description : "No indexed music event");
    }
    const organNote=root.querySelector('[data-role="organ-permission"]');
    if(organNote){
      const norm=current.organPermission?.notAnObservation===true &&
        current.organPermission?.actuallyPlaying==="UNKNOWN"
        ? current.organPermission : null;
      organNote.hidden=!norm;
      organNote.textContent=norm?.label??"";
      organNote.dataset.organNorm=norm?.status??"UNRESOLVED";
      organNote.dataset.organObserved="UNKNOWN";
      organNote.setAttribute?.("aria-label",norm
        ? norm.label+". "+norm.description : "Organ norm unavailable");
    }
    const quietNote=root.querySelector('[data-role="priest-quiet-offertory"]');
    if(quietNote){
      const quiet=current.priestQuietOffertory?.sourceOwner==="SUNG_CORPUS_PRIEST_PRIVATE" &&
        current.priestQuietOffertory?.cueId===current.nativeCueId &&
        current.priestQuietOffertory?.notAnObservation===true
          ? current.priestQuietOffertory:null;
      quietNote.hidden=!quiet;
      setText(root,"priest-quiet-offertory-label",quiet?.label??"");
      quietNote.dataset.sourceCueId=quiet?.cueId??"";
      quietNote.setAttribute?.("aria-label",quiet ? quiet.description : "No private Offertory cue");
      applyIcon(root,"priest-quiet-offertory",quiet?.iconKey??null,iconResolver);
    }
    setText(root,"progress",current.progress);
    setText(root,"priest-position",priestStationLabel(mode==="MISSAL" ? (current.missalRubric?.priestPosition??current.priestPosition) : current.priestPosition,root));
    const bookContext=root.querySelector?.('[data-role="priest-book-context"]');
    if(bookContext){
      const side=mode==="LIVE" ? current.priestPosition?.missalLocation : null;
      const text=side==="EPISTLE_SIDE"?"Missal · Epistle side":
        side==="GOSPEL_SIDE"?"Missal · Gospel side":null;
      bookContext.hidden=!text;
      bookContext.textContent=text??"";
      bookContext.title=text??"";
    }
    setText(root,"priest-action",textValue(current.priestAction));
    setText(root,"sacred-minister",textValue(current.sacredMinister));
    setText(root,"posture",textValue(current.posture));
    setText(root,"gesture",textValue(current.gesture));
    // In Missal the upper ribbon is the only persistent faithful/priest
    // gestural reference; LIVE keeps its vertical-rail behaviour unchanged.
    const missalChrome=mode==="MISSAL";
    for(const [role,value] of [
      ["missal-faithful-gesture",current.missalRubric?.faithfulGesture??current.gesture],
      ["missal-priest-action",current.missalRubric?.priestAction??current.priestAction],
    ]){
      const label=textValue(value);
      const node=root.querySelector('[data-role="'+role+'"]');
      if(node){node.hidden=!missalChrome||!label;node.textContent=missalChrome&&label?label:"";}
    }
    setText(root,"response",textValue(current.response));
    const visibleBell=displayBell(current.bell);
    setText(root,"bell",visibleBell ? [textValue(visibleBell),visibleBell.detail].filter(Boolean).join(" · ") : null);
    setText(root,"priest-voice",textValue(current.priestVoice));
    setText(root,"schola",current.scholaVisible ? textValue(current.schola) : null);
    syncFaithfulPicker();
    syncFaithfulParagraphIcons();
    if(current.customary){
      for(const kind of ["postureProfile","gestureProfile","localPosture"]){
        const select=root.querySelector('[data-reader-customary="'+kind+'"]');
        if(select)select.value=current.customary[kind]??"DEFAULT";
        if(select&&kind==="localPosture")select.disabled=!current.customary.localPostureEditable;
      }
      const communionConfiteor=root.querySelector('[data-reader-customary="secondConfiteor"]');
      if(communionConfiteor)communionConfiteor.value=String(current.customary.secondConfiteor===true);
      const performance=root.querySelector('[data-reader-customary="sanctusPerformance"]');
      if(performance)performance.value=current.customary.sanctusPerformance??"UNSPECIFIED";
      const note=root.querySelector("[data-customary-cue-note]");
      if(note)note.textContent=current.customary.cueId
        ? current.customary.localPostureEditable
          ? "Applies only to the passage on screen."
          : "This passage has a fixed posture."
        : "Open a passage of the Mass to set a local posture.";
    }else{
      const select=root.querySelector('[data-reader-customary="localPosture"]');
      if(select)select.disabled=true;
      const note=root.querySelector("[data-customary-cue-note]");
      if(note)note.textContent="Local postures apply to individual passages of the Mass.";
    }
    const titleNode=root.querySelector('[data-role="card-title"]');
    // One prayer name on one surface: use the legible top-ribbon heading.
    // Never duplicate the same name as a large in-card heading.
    if(titleNode)titleNode.hidden=true;
    // Explanatory Guide belongs outside LIVE. It remains available to the
    // independent educational module, and the older Simple presentation
    // alone can display its existing button.
    const guideControl=root.querySelector('[data-role="guide-button"]');
    if(guideControl){
      guideControl.hidden=true;
      guideControl.disabled=true;
      guideControl.setAttribute("aria-hidden","true");
      guideControl.tabIndex=-1;
    }
    const guideShort=root.querySelector('[data-role="guide-short"]');
    if(guideShort){
      guideShort.hidden=true;
      guideShort.textContent=current.guide?.moment ? "OPEN" : "RUBRICS";
    }

    setChannel(root,"posture",current.posture);
    setText(root,"posture-left",textValue(current.posture));
    // Canonical R17 cue projection already distinguishes a true posture
    // transition from a repeated source marker (e.g. Collect STAND after
    // Gloria STAND). The DOM only guards against a conflicting local profile;
    // navigating backward/forward must never redefine the source sequence.
    const postureChangeVisible=Boolean(current.postureCue && current.posture &&
      textValue(current.postureCue)===textValue(current.posture));
    setChannel(root,"posture-change",postureChangeVisible ? current.postureCue : null);
    const postureRail=root.querySelector('.ao-rail-left [data-channel="posture"]');
    if(postureRail)postureRail.dataset.change=String(postureChangeVisible);
    setChannel(root,"attention",current.attention);
    // Keep priest-action semantics on the rail even when reviewed artwork is
    // withheld. Phone cinematic and accessible cue owners depend on it.
    setChannel(root,"priest-action",current.priestAction);
    const sourceActionTile=root.querySelector('.ao-rail-right [data-channel="priest-action"]');
    if(sourceActionTile){
      const sourceAction=textValue(current.priestAction);
      const fallback=showContext&&Boolean(sourceAction)&&
        ["AO.SM.C0174","AO.SM.C0181"].includes(current.nativeCueId);
      sourceActionTile.dataset.actionTextFallback=String(fallback);
      setText(root,"priest-action",sourceAction);
    }
    setChannel(root,"sacred-minister",mode==="LIVE"?current.sacredMinister:null);
    setChannel(root,"gesture",current.gesture);
    setChannel(root,"response",current.response);
    setChannel(root,"bell",visibleBell);
    setChannel(root,"priest-voice",current.priestVoice);
    const voiceTile=root.querySelector('.ao-rail-right [data-channel="priest-voice"]');
    if(voiceTile){
      const voiceText=textValue(current.priestVoice);
      voiceTile.dataset.voiceTextFallback=String(showContext&&Boolean(voiceText)&&
        ["AO.SM.B052","AO.SM.B053"].includes(copy.blockId));
      setText(root,"priest-voice",voiceText);
    }
    setChannel(root,"priest-position",showContext?current.priestPosition:null);
    setText(root,"priest-position-rail",priestStationLabel(showContext
      ? current.priestPosition:null,root));
    setChannel(root,"schola-shared",current.scholaShared ? current.schola : null);
    setChannel(root,"schola",current.scholaVisible ? current.schola : null);
    syncScholaChrome();
    syncScholaContent();
    syncProgress();

    applyIcon(root,"priest-position-rail",showContext
      ? current.priestPositionIconKey:null,iconResolver);
    applyIcon(root,"priest-position",mode==="MISSAL" ? (current.missalRubric?.priestPosition?.iconKey??current.priestPositionIconKey) : current.priestPositionIconKey,iconResolver);
    applyIcon(root,"posture-top",current.postureIconKey,iconResolver);
    applyIcon(root,"faithful-gesture-top",mode==="MISSAL"?(current.missalRubric?.faithfulGesture?.iconKey??current.gestureIconKey):null,iconResolver);
    // Existing reviewed posture artwork is valid for exact, source-owned
    // KNEEL/STAND/SIT/GENUFLECT labels. This only fills an absent LIVE rail
    // icon while context replaces the top owner; unfamiliar/local labels
    // retain readable text instead of acquiring guessed artwork.
    const exactPosture=String(textValue(current.posture)??"").trim().toUpperCase();
    const contextualPostureIcon=showContext&&
      Object.prototype.hasOwnProperty.call(R17_ICON_KEYS.posture,exactPosture)
      ? R17_ICON_KEYS.posture[exactPosture] : null;
    applyIcon(root,"posture",current.postureIconKey??contextualPostureIcon,iconResolver);
    applyIcon(root,"posture-change",postureChangeVisible ? (current.postureChangeIconKey??current.postureIconKey) : null,iconResolver);
    applyIcon(root,"attention",current.attentionIconKey??current.attention?.iconKey,iconResolver);
    applyIcon(root,"gesture",current.gestureIconKey,iconResolver);
    applyIcon(root,"response",current.responseIconKey,iconResolver);
    applyIcon(root,"priest-voice",current.priestVoiceIconKey,iconResolver);
    applyIcon(root,"priest-action",current.priestActionIconKey,iconResolver);
    applyIcon(root,"priest-action-top",mode==="MISSAL" ? (current.missalRubric?.priestAction?.iconKey??current.priestActionIconKey) : current.priestActionIconKey,iconResolver);
    applyIcon(root,"bell",visibleBell ? (current.bellIconKey??"bells") : null,iconResolver);
    applyIcon(root,"schola-shared",current.scholaShared ? current.scholaIconKey : null,iconResolver);
    applyIcon(root,"schola",current.scholaIconKey,iconResolver);
    syncRailIconSurfaces(root);

    const actionBadge=root.querySelector('[data-role="priest-action-badge"]');
    const actionRail=root.querySelector('[data-channel="priest-action"]');
    const majorCue=new Set(["AO.SM.C0161","AO.SM.C0174","AO.SM.C0181","AO.SM.C0225","AO.SM.C0265","AO.SM.C0273"]);
    const activeCue=current.cinematic?.cueId ?? current.bell?.cueId ?? current.priestAction?.cueId ?? null;
    const missalAction=mode==="MISSAL"?current.missalRubric?.priestAction:null;
    const actionActive=Boolean(
      textValue(missalAction??current.priestAction) &&
      (missalAction?.iconKey??current.priestActionIconKey)
    );
    if(actionBadge){actionBadge.dataset.active=String(actionActive);actionBadge.dataset.major=String(Boolean(actionActive&&majorCue.has(activeCue)));}
    if(actionRail)actionRail.dataset.major=String(Boolean(actionActive&&majorCue.has(activeCue)));
    const bellRail=root.querySelector('[data-channel="bell"]');
    if(bellRail){
      bellRail.dataset.major=String(Boolean(visibleBell&&majorCue.has(visibleBell.cueId??activeCue)));
      // A focused source paragraph is never a microphone recording.
      // Separately witnessed Canon server bells have their own state owner.
      const witnessed=visibleBell?.observedNow===true &&
        visibleBell?.owner==="INDEPENDENT_CANON_SERVER_OBSERVATION";
      bellRail.dataset.soundState=visibleBell
        ? (witnessed?"EXPLICITLY_OBSERVED":"EXPECTED_NOT_OBSERVED") : "NONE";
      bellRail.dataset.timingPrecision=visibleBell?.sourceTiming?.timingPrecision??"UNRESOLVED";
      if(visibleBell){
        const aria=(witnessed?"Observed server bell: ":"Expected altar-bell moment, not detected: ")+
          [textValue(visibleBell),visibleBell.detail].filter(Boolean).join(" · ");
        bellRail.setAttribute("aria-label",aria);
        bellRail.title=aria;
      }
    }

    const sceneId=String(current.cinematicScene?.id??"NONE");
    const sceneShell=root.querySelector("[data-ao-reader-shell]");
    if(sceneShell)sceneShell.dataset.cinematicScene=sceneId;
    const cinematic=root.querySelector('[data-role="cinematic"]');
    if(cinematic){
      const visible=Boolean(current.cinematic);
      const kind=visible ? String(current.cinematic.kind??"TRANSIENT") : "";
      // Major Elevations illuminate the existing reader rather than blacking
      // out the Latin Consecration and gesture rails.
      const focusElevation=sceneId==="HOST_ELEVATION"||sceneId==="CHALICE_ELEVATION";
      // Final visibility is settled after paragraph layout. Keep the source
      // prayer measurable before deciding whether spare space permits big art.
      // A transient part-curtain must not obscure an already focused,
      // independently source-owned Hanc, Gospel or Passion cue.
      const sourceQuietScene=["HANC_IGITUR_HANDS","GOSPEL_CROSSES","PASSION_DEATH"].includes(sceneId);
      cinematic.hidden=!visible||sourceQuietScene;
      cinematic.setAttribute?.("aria-hidden",String(!visible||focusElevation||sourceQuietScene));
      cinematic.dataset.kind=kind;
      setText(root,"cinematic-title",visible ? current.cinematic.title : null);
      setText(root,"cinematic-sub",visible ? current.cinematic.subtitle : null);
      // Bell cinematics use the APPROVED bell asset, never the default
      // decorative cross. They belong only to an exact native sound cue.
      applyIcon(root,"cinematic",visible && kind==="BELL" ? "bells" :
        visible && kind==="ELEVATION" ? current.priestActionIconKey : null,iconResolver);
      const fallback=cinematic.querySelector?.(".ao-cinematic-fallback");
      if(fallback)fallback.hidden=visible && (kind==="BELL"||kind==="ELEVATION");
    }

    // The old Guide update used to resurrect the centre tile after each
    // cue projection. Mass now owns only practical, source-backed rubrics.
    const guideButton=root.querySelector('[data-role="guide-button"]');
    if(guideButton){
      guideButton.disabled=true;
      guideButton.hidden=true;
      guideButton.tabIndex=-1;
      guideButton.setAttribute("aria-hidden","true");
      guideButton.title="";
    }
    const pop=root.querySelector('[data-role="guide-popover"]');
    // Preserve an open Guide during in-card gesture, posture and Schola updates.
    // Only a genuine card transition invalidates its contextual content.
    if(pop && current.cardUpdate){pop.hidden=true;pop.replaceChildren?.();}

    const shell=root.querySelector("[data-ao-reader-shell]");
    // Inline rubrics must not replace LIVE's persistent YOU/PRIEST ribbon
    // with a source-banner or collapse the two rails. Source provenance is
    // retained on each inline action, never as an extra toolbar.
    if(shell && current.cardUpdate)shell.dataset.canonInline="false";
    const body=root.querySelector('[data-role="paragraphs"]');
    if(body && current.cardUpdate){
      body.replaceChildren();
      const doc=body.ownerDocument ?? globalThis.document;
      if(doc?.createElement){
        let openingSet=false;
        let previousSpeakerRole=null;
        const multiOration=current.paragraphs.filter(p=>p.prayerRole=== "PRINCIPAL_ORATION"||
          p.prayerRole==="FIRST_COMMEMORATION"||p.prayerRole==="SECOND_COMMEMORATION"||
          p.prayerRole==="ADDITIONAL_ORATION"||p.prayerRole==="ORATION_UNDER_ONE_CONCLUSION").length>1;
        const frenchReader=String(prepared?.readerPreferences?.language??"en").toLowerCase().startsWith("fr");
        const orationLabels={
          PRINCIPAL_ORATION:frenchReader?"Oraison principale":"Principal prayer",
          ADDITIONAL_ORATION:frenchReader?"Commémoraison":"Commemoration",
          FIRST_COMMEMORATION:frenchReader?"Première commémoraison":"First commemoration",
          SECOND_COMMEMORATION:frenchReader?"Deuxième commémoraison":"Second commemoration",
          ORATION_UNDER_ONE_CONCLUSION:frenchReader?"Oraison à conclusion commune":"Prayer under one conclusion",
        };
        const decorateThisSection=/\b(Introit|Gloria|Credo|Preface|Canon|Consecration|Last Gospel)\b/i.test(current.sectionTitle);
        for(const [paragraphIndex,p] of current.paragraphs.entries()){
          if(mode==="MISSAL"){
            // Source-block headings are distinct from spoken Latin and from
            // rubrics. They never acquire a ritual cue or trigger gesture.
            for(const heading of (current.missalHeadings??[]).filter(h=>
              h.paragraphIndex===paragraphIndex)){
              const headingNode=doc.createElement("div");
              headingNode.className="ao-missal-prayer-heading";
              headingNode.dataset.sourceBlockId=heading.blockId;
              const title=doc.createElement("h2");
              title.className="ao-missal-prayer-name";
              title.textContent=heading.title;
              headingNode.append(title);
              // All generic descriptions merely restate the title and
              // belong to Guide/Formation, not underneath each prayer name.
              // B032 alone has *material* form-specific rubrical detail.
              if(heading.blockId==="AO.SM.B032" && heading.description){
                const short=doc.createElement("span");
                short.className="ao-missal-chalice-short";
                short.textContent=frenchReader
                  ?"Le vin et l’eau sont préparés dans le calice."
                  :"The wine and water are prepared in the chalice.";
                const extended=doc.createElement("details");
                extended.className="ao-missal-chalice-detail";
                extended.dataset.sourceBlockId=heading.blockId;
                const trigger=doc.createElement("summary");
                trigger.textContent=frenchReader?"Précision de la rubrique":"Ceremonial detail";
                const bodyText=doc.createElement("p");
                bodyText.textContent=heading.description;
                const witness=doc.createElement("a");
                witness.href="https://www.intratext.com/IXT/LAT0820/_PI.HTM";
                witness.target="_blank";
                witness.rel="noopener noreferrer";
                witness.textContent=frenchReader?"Ritus servandus · 1962":"Ritus servandus · 1962";
                extended.append(trigger,bodyText,witness);
                headingNode.append(short,extended);
              }
              body.append(headingNode);
            }
          }
          const node=doc.createElement(mode==="MISSAL"?"div":"p");
          node.className="ao-reader-paragraph";
          node.dataset.kind=p.kind;
          if(p.speakerRole)node.dataset.speakerRole=p.speakerRole;
          if(p.liturgicalGroup)node.dataset.liturgicalGroup=p.liturgicalGroup;
          if(p.prayerRole)node.dataset.prayerRole=p.prayerRole;
          if(p.sourceBlockId)node.dataset.sourceBlockId=p.sourceBlockId;
          if(p.sectionBoundaryBefore)node.dataset.sectionBoundary=p.sectionBoundaryBefore;
          if(p.languageOwner==="SOURCE_PUBLIC_LIVE_INVITATION")
            node.dataset.liveInvitation="true";
          if(p.sourceAnchorCueId)node.dataset.sourceAnchorCueId=p.sourceAnchorCueId;
          if([p.primary,p.secondary,p.alternate].some(value=>String(value??"").includes("\n")))
            node.dataset.chantPhrased="true";
          if(decorateThisSection&&!openingSet&&p.kind==="TEXT"&&/^\s*\p{L}/u.test(p.primary)){
            node.dataset.opening="true";openingSet=true;
          }
          node.dataset.active=String(p.active);
          node.dataset.paragraphId=p.id;
          if(p.kind==="RUBRIC"){
            const rubricText=stripRubricBrackets(p.primary);
            node.dataset.stateDuplicate=String(rubricIsStateDuplicate(rubricText));
            const canExpand=mode!=="MISSAL" && rubricText.length>180;
            node.dataset.rubricExpandable=String(canExpand);
            node.dataset.expanded="false";
            if(canExpand){
              node.tabIndex=0;
              node.setAttribute("role","button");
              node.setAttribute("aria-expanded","false");
            }
          }
          // A role-change caption is shown only in LIVE, and only when the
          // liturgical source has not already supplied S., M., V. or R.
          // Do not label action-only or rubric paragraphs as spoken prayers.
          const speakerRole=String(p.speakerRole??"");
          // Retain the verified actor on its rendered prayer paragraph.
          // This is presentation metadata, not a second liturgical owner.
          if(speakerRole)node.dataset.speakerRole=speakerRole;
          const ownerLabels=String(prepared?.readerPreferences?.language??"en").toLowerCase().startsWith("fr")
            ? {PRIEST:"Prêtre",MINISTERS:"Servants",RESPONDERS:"Réponse",SCHOLA:"Schola",
               GOSPEL_PROCLAIMER:"Ministre de l'Évangile",DISMISSAL_MINISTER:"Ministre du renvoi"}
            : {PRIEST:"Priest",MINISTERS:"Servers",RESPONDERS:"Response",SCHOLA:"Schola",
               GOSPEL_PROCLAIMER:"Gospel minister",DISMISSAL_MINISTER:"Dismissal minister"};
          // Source-backed oration roles, not the card title, distinguish
          // principal and additional prayers without repeating a large heading.
          // A single unsupplemented prayer already has its card heading.
          let orationCaption=null;
          if(orationLabels[p.prayerRole] && (multiOration ||
             p.prayerRole!=="PRINCIPAL_ORATION")){
            orationCaption=doc.createElement("small");
            orationCaption.className="ao-oration-label";
            orationCaption.textContent=p.prayerRole==="ORATION_UNDER_ONE_CONCLUSION"&&
              String(p.id).endsWith(".MISSION")
                ?(frenchReader?"Pour les Missions · même conclusion":"For the Missions · one shared conclusion")
                :orationLabels[p.prayerRole];
            node.append(orationCaption);
          }
          if(!orationCaption && speakerRole && speakerRole!==previousSpeakerRole && ownerLabels[speakerRole] &&
             p.kind!=="RUBRIC" && !/^(?:[SMVR]\.|℣\.|℟\.)\s*/u.test(String(p.primary??""))){
            const speakerTag=doc.createElement("small");
            speakerTag.className="ao-speaker-turn";
            speakerTag.textContent=ownerLabels[speakerRole];
            node.append(speakerTag);
          }
          if(speakerRole&&speakerRole!=="PRIEST_ACTION"&&speakerRole!=="EDITORIAL_GUIDE")
            previousSpeakerRole=speakerRole;
          if(p.sourceCueIds?.length) node.dataset.sourceCueIds=p.sourceCueIds.join(" ");
          const exactCueIds=(p.sourceCueIds??[]).filter(id=>
            /^(?:AO\.SM\.C\d{4}|GF-SOP-\d\d-[KR]|GF-X-52[123])$/.test(String(id)));
          // In distinct Good Friday only the explicit formula line may own
          // its source-record cue; other GF records must never acquire an
          // identity from a shared card's source list.
          if(exactCueIds.length===1) node.dataset.cueId=exactCueIds[0];
          // Sung Gloria and Credo intonations pair a canonical incipit cue
          // with its priestly completion on one legible paragraph. Both
          // source IDs remain on data-source-cue-ids; the opening cue owns
          // focus while this visual composite is active. Without this
          // explicit two-pair bridge, neither celebrant intonation receives
          // any LIVE cue focus, voice or cue-scoped rubric projection.
          if(exactCueIds.length===2 && (
            (exactCueIds[0]==="AO.SM.C0053" && exactCueIds[1]==="AO.SM.C0054") ||
            (exactCueIds[0]==="AO.SM.C0089" && exactCueIds[1]==="AO.SM.C0090")
          )) node.dataset.cueId=exactCueIds[0];
          // The Passion death rubric is tied to the final Latin words,
          // rather than to the long Good Friday Passion card as a whole.
          // This cue identity is inherited from source GF-PASS-320 and
          // never inferred as a new liturgical event.
          if(p.sourceCueIds?.includes("GF-PASS-320") &&
             /tradidit spiritum\s*\.?\s*$/i.test(String(p.primary??"")))
            node.dataset.cueId="GF-PASS-320";
          // PALM-GSP-010 has four distinct reader rows. Only its opening
          // proclamation heading can own the faithful's Gospel crosses.
          if(p.id==="PALM-R03-01" && p.sourceCueIds?.includes("PALM-GSP-010"))
            node.dataset.cueId="PALM-R03-01";
          if(mode!=="MISSAL" && p.replaceOnToggle && p.alternate){
            node.dataset.translateToggle="true";
            node.dataset.primaryText=p.primary;
            node.dataset.altText=p.alternate;
            node.dataset.showingAlt="false";
            node.tabIndex=0;
            node.setAttribute("role","button");
            node.setAttribute("aria-label","Toggle Latin and vernacular text");
            node.setAttribute("aria-pressed","false");
          }
          const own=current.paragraphCues?.[p.id];
          if(own){
            // Gloria and Credo have the same single, source-owned posture and
            // gesture surface as every other Mass part: the faithful ribbon
            // and LIVE gesture rail. The editorial cue remains attached to
            // this paragraph; no second tiny editable icon per sentence.
            node.dataset.faithfulCues="true";
            node.dataset.faithfulRowId=p.id;
          }
          // MISSAL never uses tap-to-replace as its primary reading
          // experience. Source-projected Latin and vernacular are rendered
          // together in the same physical row, regardless of which language
          // owns the LIVE/SIMPLE text. No fallback translation is fabricated.
          const hasParallelText=Boolean(p.secondary||p.alternate);
          if(hasParallelText&&p.kind!=="RUBRIC"){
            const known=p.displayLanguage;
            const primaryLanguage=known==="LATIN"||known==="VERNACULAR"
              ?known:(p.secondary||p.kind==="RESPONSE"||p.kind==="CONSECRATION_WORDS"?"LATIN":"VERNACULAR");
            node.dataset.missalPrimaryLanguage=primaryLanguage;
            node.dataset.missalPaired="true";
          }
          const primary=doc.createElement("span");
          primary.className="ao-line-primary";
          // The initial paragraph.active state is not authoritative after
          // native scroll tracking starts. Cue highlighting follows the live
          // DOM focus and the *same* projected gesture as the rail below.
          const bookRubric=mode==="MISSAL" && p.kind==="RUBRIC"
            ? missalSourceRubricCopy(p,{language:frenchReader?"fr":"en"}):null;
          // Only shorten complete, certified action sequences; never change
          // the original Latin/prayer row or expose editorial research drafts.
          const conciseSource=bookRubric ? conciseMissalSourceRubric(p,{
            form:prepared?.session?.resolvedMass?.form,
            language:frenchReader?"fr":"en",
          }):null;
          renderReaderText(primary,conciseSource?.text??bookRubric?.text ??
            (p.kind==="RUBRIC"?stripRubricBrackets(p.primary):p.primary));
          if(bookRubric){
            node.dataset.missalRubricLanguage=bookRubric.requestedLanguage;
            node.dataset.sourceRubricWitness=bookRubric.owner;
          }
          if(conciseSource){
            // Distinguish the existing original witness from the concise
            // editorial presentation; retain every underlying published ID.
            node.dataset.rubricPresentationOwner=conciseSource.owner;
            node.dataset.rubricSourceEventIds=conciseSource.eventIds.join(" ");
          }
          node.append(primary);
          const parallel=mode==="MISSAL"&&p.kind==="RUBRIC"
            ? null:(p.kind==="RUBRIC"?p.secondary:(p.secondary??p.alternate));
          if(parallel){
            const secondary=doc.createElement("span");
            secondary.className="ao-line-secondary";
            if(!p.secondary)secondary.dataset.missalOnly="true";
            secondary.textContent=parallel;
            decorateLiturgicalSpeaker(secondary,parallel);
            node.append(secondary);
          }
          const inlineRubrics=mode==="MISSAL"||mode==="LIVE"
            ? p.publishedMissalRubrics : p.publishedCanonRubrics;
          // Existing bracketed directions are already rubrics in the
          // Missal's source text. Never print a second paraphrase below them.
          const alreadyPrintedRubric=(mode==="MISSAL"||mode==="LIVE") &&
            (p.kind==="RUBRIC" || /^\s*\[/.test(String(p.primary??"")));
          // Exact source-printed rubric wins. The only exception is a
          // separately approved persistent priest state: not another action.
          const shortRubrics=alreadyPrintedRubric
            ? inlineRubrics.filter(event=>event.kind==="STATE")
            : inlineRubrics;
          if(shortRubrics?.length){
            const note=doc.createElement(mode==="MISSAL"?"div":"span");
            note.className=mode==="MISSAL"?"ao-missal-inline-rubrics"
              : mode==="LIVE"?"ao-live-inline-rubrics":"ao-canon-inline-rubrics";
            note.dataset.sourceAuthority="MR62_RITUS";
            note.dataset.observedNow="false";
            const actions=doc.createElement(mode==="MISSAL"?"div":"span");
            actions.className="ao-canon-inline-actions";
            if(mode==="MISSAL"||mode==="LIVE"){
              const condensed=mode==="MISSAL"?conciseMissalInlineSequence(shortRubrics,{
                form:prepared?.session?.resolvedMass?.form,
                language:frenchReader?"fr":"en",
              }):null;
              if(condensed){
                // Keep both event IDs on the one printed sentence.
                const line=doc.createElement("span");
                line.className="ao-missal-rubric-action";
                line.dataset.rubricIds=condensed.eventIds.join(" ");
                line.dataset.sourceCueId=condensed.sourceCueId;
                line.textContent=condensed.text;
                actions.append(line);
              }
              for(const event of (condensed?[]:shortRubrics)){
                // Only two separately approved persistent states exist.
                // A full C0174.06 paragraph would overwhelm the Consecration;
                // preserve its exception and duration in a real, optional
                // extension rather than a fake four-step action list.
                const isFingerStart=event.kind==="STATE" &&
                  event.id==="AO.RUB.C0174.06";
                const isFingerEnd=event.kind==="STATE" &&
                  event.id==="AO.RUB.C0248.01";
                const short=isFingerStart
                  ? (frenchReader
                    ?"Le prêtre garde les pouces et les index joints."
                    :"The priest keeps his thumbs and forefingers joined.")
                  : isFingerEnd
                    ? (frenchReader
                      ?"Le prêtre cesse de tenir les doigts joints après les ablutions."
                      :"The priest releases his joined fingers after the ablutions.")
                    : event.displayText;
                const text=doc.createElement("span");
                text.className=mode==="LIVE"?"ao-live-rubric-action":"ao-missal-rubric-action";
                text.dataset.rubricId=event.id;
                text.dataset.sourceCueId=event.sourceCueId;
                text.textContent=short;
                const approvedArt=approvedFingerRubricArt(event);
                const approvedGestureArt=approvedPriestRubricGestureArt(event);
                const approvedHeadBowArt=approvedPriestHeadBowRubricArt(event);
                if(approvedArt||approvedGestureArt||approvedHeadBowArt){
                  // Keep each source-owned gesture/state tied to its exact
                  // published 1962 rubric: no action-rail or timing mutation.
                  const art=approvedArt??approvedGestureArt??approvedHeadBowArt;
                  const icon=doc.createElement("span");
                  icon.className=approvedArt
                    ?"ao-approved-finger-rubric-art"
                    :approvedGestureArt
                      ?"ao-approved-priest-gesture-rubric-art"
                      :"ao-approved-priest-head-bow-rubric-art";
                  if(approvedArt)icon.dataset.approvedFingerEvent=event.id;
                  if(approvedGestureArt)icon.dataset.approvedPriestGestureEvent=event.id;
                  if(approvedHeadBowArt)icon.dataset.approvedPriestHeadBowEvent=event.id;
                  icon.dataset.approvedAsset=art.assetId??art.assetUserKey;
                  icon.setAttribute("aria-hidden","true");
                  icon.style.webkitMaskImage=`url("${art.imageUrl}")`;
                  icon.style.maskImage=`url("${art.imageUrl}")`;
                  text.prepend(icon);
                }
                if(isFingerStart && event.sourceUrl){
                  const detail=doc.createElement("details");
                  detail.className="ao-missal-ceremonial-state-detail";
                  detail.dataset.rubricStateId=event.id;
                  const toggle=doc.createElement("summary");
                  toggle.append(text);
                  const full=doc.createElement("p");
                  full.textContent=event.displayText;
                  const source=doc.createElement("a");
                  source.href=event.sourceUrl;
                  source.target="_blank";
                  source.rel="noopener noreferrer";
                  source.textContent="Ritus servandus · 1962";
                  detail.append(toggle,full,source);
                  actions.append(detail);
                }else actions.append(text);
              }
            }else{
              actions.textContent=shortRubrics.map(event=>event.shortAction).join(" · ");
            }
            note.append(actions);
            node.append(note);
          }
          // Existing "long" registry data contains only the SAME short
          // actions again. No fake detail buttons, source-link repetition
          // or secondary guide panels inside the Mass text.
          body.append(node);
        }
      }
    }
    // Recalculate scroll travel only when the paragraph card is replaced;
    // doing so during a cue-only state update would briefly clamp scrollTop
    // and prevent short cards from ever reaching their next invocation.
    if(current.cardUpdate){
      ensureShortCardCueTravel();
      // The fixed-height LIVE stage can settle a frame after renderMoment
      // (rail dimensions, Schola reserve and host shell are projected in
      // separate owners). The first measurement can therefore see a 450px
      // viewport that is actually 712px once the stage settles. Re-measure
      // after layout, never on ordinary scroll, so no liturgical cue is
      // disturbed and the padding does not clamp ongoing reading.
      const cardElement=root.querySelector(".ao-prayer-card");
      const firstParagraph=body?.firstElementChild;
      const win=cardElement?.ownerDocument?.defaultView;
      const raf=win?.requestAnimationFrame?.bind(win);
      if(raf)raf(()=>raf(()=>{
        if(!cardElement?.isConnected||
          root.querySelector(".ao-prayer-card")!==cardElement||
          body?.firstElementChild!==firstParagraph)return;
        ensureShortCardCueTravel();
      }));
    }
    // Never cover the missal to dramatize an Elevation. A source-first
    // 48-card elevation action often leaves genuine empty space below
    // its rubric; only use that space if measured geometry permits it.
    const scene=current.cinematicScene?.id??null;
    const majorScene=scene==="HOST_ELEVATION"||scene==="CHALICE_ELEVATION";
    const stageCinema=root.querySelector('[data-role="cinematic"]');
    const stageShell=root.querySelector("[data-ao-reader-shell]");
    if(stageShell)stageShell.dataset.cinematicVisual="NONE";
    if(majorScene && stageCinema){
      const scroller=root.querySelector(".ao-prayer-card");
      const bounds=scroller?.getBoundingClientRect?.();
      const rows=[...(scroller?.querySelectorAll?.(".ao-reader-paragraph")??[])];
      const lastTextBottom=rows.length
        ? Math.max(...rows.filter(row=>!row.hidden).map(row=>row.getBoundingClientRect().bottom))
        : bounds?.bottom??Infinity;
      const schola=root.querySelector(".ao-schola-dock");
      const dockBounds=schola?.getBoundingClientRect?.();
      const visibleBottom=schola?.dataset?.active==="true" && dockBounds?.height>0
        ? Math.min(bounds?.bottom??Infinity,dockBounds.top)
        : bounds?.bottom??-Infinity;
      const room=visibleBottom-lastTextBottom;
      const iconAvailable=Boolean(current.priestActionIconKey &&
        current.cinematic?.kind==="ELEVATION");
      const canIllustrate=iconAvailable && room>=272 && bounds?.height>=420;
      stageCinema.hidden=!canIllustrate;
      stageCinema.setAttribute?.("aria-hidden","true");
      if(stageShell)stageShell.dataset.cinematicVisual=canIllustrate?"ICON":"RAIL";
    }
    syncReaderRitualHighlights(root,current.gesture);
    syncExactIconBackedRubrics(root,current,mode,iconResolver);
    syncIconlessSourceRubric(root,current,mode,iconResolver,
      prepared?.session?.resolvedMass?.form??null);
    syncFaithfulParagraphIcons();
    return current;
  }

  function setSections(nextSections=[]){
    sectionItems=Array.isArray(nextSections)?[...nextSections]:[];
    populateSections();
    return Object.freeze([...sectionItems]);
  }

  function destroy(){
    unbind();
    if(bellHoldTimer)clearTimeout(bellHoldTimer);
    cancelScholaTicker({clearIdentity:true});
    bellHoldTimer=0;heldBell=null;bellHoldUntil=0;
    scholaTickerFinishedIdentity=null;
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
