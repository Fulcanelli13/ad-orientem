import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { normalizePresentationMode } from "./session-engine.js";

const SHELL_STYLE = `
.ao-reader-shell{
  --ao-bg:#080c0a;
  --ao-panel:#0d1410;
  --ao-line:rgba(157,183,164,.14);
  --ao-muted:rgba(238,233,223,.58);
  --ao-muted-soft:rgba(238,233,223,.38);
  --ao-text:#eee9df;
  --ao-accent:var(--liturgical,#6f9278);
  --ao-gold:#c7ae6d;
  --ao-schola-height:58px;
  box-sizing:border-box;position:relative;
  width:min(100%,820px);height:100%;min-height:0;margin:0 auto;
  display:grid;grid-template-rows:auto auto minmax(0,1fr) auto auto;
  overflow:hidden;
  background:radial-gradient(circle at 50% 38%,color-mix(in srgb,var(--ao-accent) 6%,transparent),transparent 28rem),linear-gradient(180deg,#0a100c 0%,var(--ao-bg) 66%,#060907 100%);
  color:var(--ao-text);
  font-family:"EB Garamond",Garamond,Georgia,"Times New Roman",serif;
  box-shadow:0 0 0 1px rgba(255,255,255,.025),0 0 54px rgba(0,0,0,.26)
}
.ao-reader-shell *{box-sizing:border-box}
.ao-reader-top-ribbon{
  display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:stretch;
  min-height:72px;padding:5px 8px 4px;
  border-bottom:1px solid rgba(255,255,255,.045);
  background:rgba(7,11,8,.985);backdrop-filter:blur(18px)
}
.ao-reader-top-action{
  appearance:none;border:0;background:transparent;color:var(--ao-muted);
  display:grid;place-items:center;min-width:44px;padding:0;border-radius:12px
}
.ao-reader-top-action:hover,.ao-reader-top-action:focus-visible{color:var(--ao-text);background:rgba(255,255,255,.03)}
.ao-reader-top-action .ao-reader-top-copy{font:700 .5rem/1 system-ui,sans-serif;letter-spacing:.075em;color:inherit}
.ao-reader-top-icon{display:block;width:27px;height:27px;background:currentColor}
.ao-reader-top-main{min-width:0;display:grid;grid-template-rows:40px 27px}
.ao-mode-ribbon{
  display:flex;align-items:center;justify-content:center;gap:6px;
  min-width:0;padding:2px 6px
}
.ao-mode-ribbon button{
  appearance:none;border:0;background:transparent;color:var(--ao-muted-soft);
  flex:1 1 0;max-width:150px;min-height:34px;padding:.38rem .48rem;border-radius:12px;
  font:600 .61rem/1 "Cinzel",Georgia,serif;letter-spacing:.11em
}
.ao-mode-ribbon button[aria-pressed="true"]{
  color:var(--ao-text);background:color-mix(in srgb,var(--ao-accent) 25%,transparent);
  box-shadow:inset 0 0 0 1px color-mix(in srgb,var(--ao-accent) 25%,transparent)
}
.ao-section-jump{
  appearance:none;border:0;background:transparent;color:#f1f4ef;min-width:0;
  padding:.1rem .45rem;display:flex;align-items:center;justify-content:center;gap:.35rem;
  font:600 .86rem/1.05 "EB Garamond",Garamond,Georgia,serif
}
.ao-section-jump [data-role="section-title"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ao-section-jump:disabled{cursor:default}
.ao-section-caret{font-size:.68rem;color:var(--ao-muted-soft)}
.ao-section-menu{
  position:absolute;z-index:12;top:72px;left:58px;right:58px;max-height:min(52vh,430px);
  overflow:auto;padding:.42rem;border:1px solid var(--ao-line);border-radius:0 0 16px 16px;
  background:rgba(13,20,16,.985);box-shadow:0 18px 38px rgba(0,0,0,.5);backdrop-filter:blur(18px)
}
.ao-section-menu[hidden]{display:none}
.ao-section-menu button{
  appearance:none;width:100%;border:0;border-bottom:1px solid rgba(255,255,255,.055);
  background:transparent;color:#c9c1b7;padding:.68rem .72rem;text-align:left;
  font:500 .82rem/1.2 "EB Garamond",Garamond,Georgia,serif
}
.ao-section-menu button:last-child{border-bottom:0}
.ao-section-menu button[aria-current="true"]{color:#f7f4ed;background:color-mix(in srgb,var(--ao-accent) 12%,transparent)}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button{cursor:default}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button:not([aria-pressed="true"]){opacity:.34}

.ao-state-ribbon{
  display:grid;grid-template-columns:78px minmax(0,1fr) 78px;align-items:center;
  min-height:64px;padding:5px 8px;
  border-bottom:1px solid rgba(255,255,255,.05);
  background:linear-gradient(180deg,rgba(15,22,17,.96),rgba(10,16,12,.97))
}
.ao-state-cell{min-width:0;display:flex;align-items:center}
.ao-state-cell[data-side]{
  min-height:52px;flex-direction:column;justify-content:center;gap:.2rem;padding:.24rem .25rem;
  text-align:center;border:1px solid rgba(255,255,255,.05);border-radius:15px;background:rgba(255,255,255,.014)
}
.ao-state-cell[data-side="faithful"]{border-right-color:rgba(255,255,255,.05)}
.ao-state-cell[data-side="priest"]{border-left-color:rgba(255,255,255,.05)}
.ao-state-cell[data-side] .ao-state-label{
  max-width:100%;font:600 .47rem/1.06 "Cinzel",Georgia,serif;white-space:normal;
  text-transform:uppercase;letter-spacing:.035em;color:var(--ao-muted)
}
.ao-state-center{
  min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;
  padding:.22rem .5rem;text-align:center;gap:.18rem
}
.ao-guide-short{
  display:block;max-width:min(100%,540px);font:500 .69rem/1.2 "EB Garamond",Garamond,Georgia,serif;
  color:var(--ao-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
.ao-guide-short[hidden]{display:none}
.ao-state-guide{
  appearance:none;border:0;background:transparent;color:var(--ao-accent);
  font:600 .48rem/1 "Cinzel",Georgia,serif;letter-spacing:.11em;padding:.12rem .28rem
}
.ao-state-guide:disabled{opacity:.25}
.ao-state-label{min-width:0;overflow:hidden;text-overflow:ellipsis}
.ao-icon-mask{
  width:31px;height:31px;flex:0 0 31px;background:var(--ao-accent);
  mask-repeat:no-repeat;mask-position:center;mask-size:contain;
  -webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain
}

.ao-reader-stage{min-height:0;display:grid;grid-template-columns:minmax(0,1fr);position:relative;isolation:isolate}
.ao-rail[data-visible="false"]{display:none}
.ao-rail{
  position:absolute;top:50%;bottom:auto;z-index:6;width:58px;min-height:0;
  display:flex;flex-direction:column;gap:.38rem;padding:0;background:transparent;
  transform:translateY(-50%);pointer-events:none
}
.ao-rail-left{left:8px}
.ao-rail-right{right:8px}
.ao-rail-item{
  min-height:54px;width:54px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:.18rem;padding:6px;text-align:center;color:var(--ao-muted);
  border:1px solid rgba(255,255,255,.055);border-radius:17px;
  background:rgba(14,21,17,.92);box-shadow:0 10px 28px rgba(0,0,0,.32);backdrop-filter:blur(16px)
}
.ao-rail-item:not([data-active="true"]){display:none}
.ao-rail-item[data-active="true"]{color:var(--ao-text);border-color:color-mix(in srgb,var(--ao-accent) 28%,rgba(255,255,255,.06))}
.ao-rail-item .ao-icon-mask{width:32px;height:32px;flex-basis:32px;background:#e8e1d8}
.ao-state-cell[data-side] .ao-icon-mask{background:#e8e1d8}
.ao-rail-copy{
  max-width:48px;font:600 .43rem/1.08 "Cinzel",Georgia,serif;letter-spacing:.025em;
  overflow-wrap:anywhere;text-transform:uppercase;color:inherit
}
.ao-rail-item:has(.ao-icon-mask:not([hidden])) .ao-rail-copy{display:none}

.ao-card-viewport{min-width:0;min-height:0;padding:0;background:transparent}
.ao-prayer-card{
  height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;
  padding:clamp(34px,7vh,70px) max(22px,calc((100% - 720px)/2)) 38vh;
  border:0;border-radius:0;background:radial-gradient(circle at 50% 42%,color-mix(in srgb,var(--ao-accent) 5%,transparent),transparent 42%);
  box-shadow:none
}
.ao-prayer-card::-webkit-scrollbar{display:none}
.ao-prayer-title{
  width:min(100%,690px);margin:0 auto .95rem;
  font:600 clamp(1.08rem,3.2vw,1.34rem)/1.12 "Cinzel",Georgia,serif;
  letter-spacing:.035em;color:var(--ao-accent)
}
.ao-prayer-title[hidden]{display:none}
.ao-prayer-body{
  width:min(100%,690px);margin:0 auto;display:flex;flex-direction:column;gap:.9rem;
  padding-bottom:6vh
}
.ao-reader-paragraph{
  margin:0;padding:.18rem .22rem;border-radius:6px;
  font:500 clamp(1.14rem,3.6vw,1.34rem)/1.55 "EB Garamond",Garamond,Georgia,"Times New Roman",serif;
  color:#e8e1d8;transition:opacity .18s linear,color .18s linear,background .18s linear,box-shadow .18s linear
}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph{opacity:.34}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"]{
  opacity:1;color:#fffaf1;
  background:linear-gradient(90deg,color-mix(in srgb,var(--ao-accent) 10%,transparent),transparent 72%);
  box-shadow:inset 2px 0 0 color-mix(in srgb,var(--ao-accent) 55%,transparent)
}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph{opacity:.62}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph + .ao-reader-paragraph{opacity:.43}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.47}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph + .ao-reader-paragraph[data-active="true"]){opacity:.36}
.ao-reader-paragraph[data-kind="RUBRIC"]{
  margin:.12rem 0;padding:.52rem .68rem;border-left:2px solid rgba(184,91,88,.62);
  border-radius:0 8px 8px 0;background:rgba(184,91,88,.07);
  font:italic 500 .82rem/1.38 "EB Garamond",Garamond,Georgia,serif;color:#c6aaa6
}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{
  margin:.32rem 0;padding:.82rem .35rem;text-align:center;
  font-size:clamp(1.42rem,4.4vw,1.72rem);line-height:1.32;letter-spacing:.04em;color:#fff8eb
}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"] .ao-line-secondary{margin-top:.5rem;font-size:.6em;color:var(--ao-muted)}
.ao-reader-paragraph[data-kind="RESPONSE"]{padding-left:.72rem;box-shadow:inset 2px 0 0 rgba(151,92,108,.7)}
.ao-reader-paragraph[data-translate-toggle="true"]{cursor:pointer}
.ao-reader-paragraph[data-translate-toggle="true"]:focus-visible{outline:1px solid var(--ao-accent);outline-offset:4px}
.ao-line-primary{display:block}
.ao-line-secondary{
  display:block;margin-top:.24rem;font:400 .77em/1.38 "EB Garamond",Garamond,Georgia,serif;
  color:var(--ao-muted)
}

.ao-schola-dock{
  position:absolute;z-index:9;left:50%;right:auto;bottom:62px;transform:translateX(-50%);
  width:min(calc(100% - 28px),620px);height:var(--ao-schola-height);min-height:42px;max-height:180px;
  display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:.55rem;
  padding:.6rem .75rem .48rem;border:1px solid color-mix(in srgb,var(--ao-accent) 28%,rgba(255,255,255,.06));
  border-radius:15px;background:rgba(10,16,12,.97);color:#ddd6cb;
  box-shadow:0 14px 48px rgba(0,0,0,.42);backdrop-filter:blur(18px);overflow:hidden
}
.ao-schola-dock[data-active="false"]{display:none}
.ao-schola-dock[data-collapsed="true"]{height:36px!important;min-height:36px;padding-top:.32rem;padding-bottom:.28rem}
.ao-schola-dock[data-collapsed="true"] [data-role="schola"],.ao-schola-dock[data-collapsed="true"] [data-icon-slot="schola"]{display:none}
.ao-schola-resize{position:absolute;top:0;left:25%;right:25%;height:10px;cursor:ns-resize;touch-action:none}
.ao-schola-resize:before{
  content:"";position:absolute;left:50%;top:3px;width:34px;height:2px;border-radius:2px;
  background:color-mix(in srgb,var(--ao-accent) 34%,transparent);transform:translateX(-50%)
}
.ao-schola-dock .ao-schola-kicker{font:600 .5rem/1 "Cinzel",Georgia,serif;letter-spacing:.14em;color:var(--ao-accent)}
.ao-schola-dock [data-role="schola"]{
  min-width:0;overflow:auto;white-space:normal;
  font:500 .9rem/1.28 "EB Garamond",Garamond,Georgia,serif;color:var(--ao-text)
}
.ao-schola-toggle{
  appearance:none;border:0;background:transparent;color:var(--ao-muted);
  font:600 .48rem/1 "Cinzel",Georgia,serif;letter-spacing:.07em;padding:.4rem .22rem
}

.ao-reader-nav{
  width:min(calc(100% - 20px),520px);justify-self:center;
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center;min-height:54px;
  margin:8px 10px 10px;border:1px solid rgba(154,181,162,.12);border-radius:20px;
  background:rgba(10,16,12,.96);box-shadow:0 10px 34px rgba(0,0,0,.34);backdrop-filter:blur(18px)
}
.ao-reader-nav button{
  appearance:none;border:0;background:transparent;color:#d8d0c6;min-height:50px;padding:.7rem .9rem;
  font:600 .82rem/1 "EB Garamond",Garamond,Georgia,serif
}
.ao-reader-nav button:last-child{text-align:right;color:var(--ao-accent)}
.ao-reader-progress{font:600 .58rem/1 "Cinzel",Georgia,serif;color:var(--ao-muted);letter-spacing:.04em}

.ao-cinematic{
  position:absolute;inset:0;z-index:14;display:grid;place-items:center;
  background:rgba(8,12,10,.91);pointer-events:none;text-align:center;padding:2rem
}
.ao-cinematic[hidden]{display:none}
.ao-cinematic-inner{display:grid;gap:.6rem;justify-items:center;max-width:88%}
.ao-cinematic-mark{font-size:1.5rem;color:var(--ao-accent)}
.ao-cinematic-title{font:600 clamp(1.1rem,4vw,1.8rem)/1.15 "Cinzel",Georgia,serif;letter-spacing:.08em}
.ao-cinematic-sub{font:500 .72rem/1.3 "Cinzel",Georgia,serif;letter-spacing:.09em;color:var(--ao-muted)}

.ao-guide-popover{
  position:absolute;z-index:13;left:50%;bottom:66px;transform:translateX(-50%);
  width:min(calc(100% - 24px),620px);max-height:42%;overflow:auto;
  padding:.9rem 1rem;border:1px solid var(--ao-line);border-radius:15px;
  background:rgba(15,22,17,.985);box-shadow:0 14px 40px rgba(0,0,0,.46);
  font:500 .9rem/1.42 "EB Garamond",Garamond,Georgia,serif;color:#ddd6cd
}
.ao-guide-popover[hidden]{display:none}

@media (max-width:620px){
  .ao-reader-top-ribbon{grid-template-columns:44px minmax(0,1fr) 44px;min-height:68px;padding-left:5px;padding-right:5px}
  .ao-reader-top-main{grid-template-rows:38px 25px}
  .ao-mode-ribbon{gap:3px;padding-left:2px;padding-right:2px}
  .ao-mode-ribbon button{font-size:.54rem;padding-left:.25rem;padding-right:.25rem}
  .ao-state-ribbon{grid-template-columns:66px minmax(0,1fr) 66px;min-height:58px;padding:4px 5px}
  .ao-state-cell[data-side]{min-height:48px;border-radius:13px}
  .ao-icon-mask{width:28px;height:28px;flex-basis:28px}
  .ao-guide-short{font-size:.62rem}
  .ao-prayer-card{padding:clamp(28px,6vh,50px) 14px 42vh}
  .ao-prayer-body{gap:.8rem}
  .ao-reader-paragraph{font-size:1.18rem;line-height:1.53}
  .ao-rail{width:50px}
  .ao-rail-left{left:4px}.ao-rail-right{right:4px}
  .ao-rail-item{width:48px;min-height:48px;padding:5px;border-radius:15px}
  .ao-rail-item .ao-icon-mask{width:29px;height:29px;flex-basis:29px}
  .ao-rail-copy{font-size:.39rem;max-width:43px}
  .ao-schola-dock{bottom:60px;width:min(calc(100% - 18px),620px)}
  .ao-reader-nav{width:calc(100% - 14px);margin-left:7px;margin-right:7px;margin-bottom:7px;border-radius:17px}
}
@media (prefers-reduced-motion:reduce){
  .ao-reader-paragraph,.ao-mode-ribbon button{transition:none!important}
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
    priestVoice:persist(moment.priestVoice, previous.priestVoice),
    schola,
    scholaVisible:!sharedTextWithSchola && Boolean(textValue(schola)),
    guide,
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
  <header class="ao-reader-top-ribbon">
    <button class="ao-reader-top-action" type="button" data-reader-home data-ao-asset-id="ao-nav-home" data-ao-asset-renderer="mask" aria-label="Home">${topAssetMask("ao-nav-home","HOME")}</button>
    <div class="ao-reader-top-main">
      <nav class="ao-mode-ribbon" aria-label="Reader mode">
        ${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}">${m}</button>`).join("")}
      </nav>
      <button class="ao-section-jump" type="button" data-role="section-jump" aria-expanded="false" disabled><span data-role="section-title">${section}</span><span class="ao-section-caret" aria-hidden="true">⌄</span></button>
    </div>
    <button class="ao-reader-top-action" type="button" data-reader-parameters data-ao-asset-id="ao-nav-settings" data-ao-asset-renderer="mask" aria-label="Mass settings">${topAssetMask("ao-nav-settings","PARAMS")}</button>
  </header>
  <div class="ao-section-menu" data-role="section-menu" hidden></div>
  <div class="ao-state-ribbon">
    <div class="ao-state-cell" data-side="faithful" data-channel="posture"><span class="ao-icon-mask" data-icon-slot="posture" hidden></span><span class="ao-state-label" data-role="posture">—</span></div>
    <div class="ao-state-center"><span class="ao-guide-short" data-role="guide-short" hidden></span><button class="ao-state-guide" type="button" data-role="guide-button" disabled>GUIDE</button></div>
    <div class="ao-state-cell" data-side="priest"><span class="ao-icon-mask" data-icon-slot="priest-action" hidden></span><span class="ao-state-label" data-role="priest-position">—</span></div>
  </div>
  <div class="ao-reader-stage" data-left-rail="false" data-right-rail="false">
    <aside class="ao-rail ao-rail-left" data-visible="false" aria-label="Faithful cues">
      <div class="ao-rail-item" data-channel="gesture"><span class="ao-icon-mask" data-icon-slot="gesture" hidden></span><span class="ao-rail-copy" data-role="gesture">—</span></div>
      <div class="ao-rail-item" data-channel="response"><span class="ao-icon-mask" data-icon-slot="response" hidden></span><span class="ao-rail-copy" data-role="response">—</span></div>
    </aside>
    <main class="ao-card-viewport">
      <article class="ao-prayer-card" data-role="card" tabindex="0">
        <h1 class="ao-prayer-title" data-role="card-title">${section}</h1>
        <div class="ao-prayer-body" data-role="paragraphs"></div>
      </article>
    </main>
    <aside class="ao-rail ao-rail-right" data-visible="false" aria-label="Priest and bells">
      <div class="ao-rail-item" data-channel="priest-voice"><span class="ao-icon-mask" data-icon-slot="priest-voice" hidden></span><span class="ao-rail-copy" data-role="priest-voice">—</span></div>
      <div class="ao-rail-item" data-channel="bell"><span class="ao-rail-copy" data-role="bell">—</span></div>
    </aside>
  </div>
  <div class="ao-schola-dock" data-channel="schola" data-active="false" data-collapsed="false"><span class="ao-schola-resize" data-schola-resize aria-hidden="true"></span><span class="ao-icon-mask" data-icon-slot="schola" hidden></span><span class="ao-schola-kicker">SCHOLA</span><span data-role="schola">—</span><button class="ao-schola-toggle" type="button" data-schola-toggle aria-label="Hide Schola">HIDE</button></div>
  <div class="ao-cinematic" data-role="cinematic" aria-live="polite" hidden>
    <div class="ao-cinematic-inner"><div class="ao-cinematic-mark">✠</div><div class="ao-cinematic-title" data-role="cinematic-title"></div><div class="ao-cinematic-sub" data-role="cinematic-sub"></div></div>
  </div>
  <nav class="ao-reader-nav" aria-label="Prayer card navigation">
    <button type="button" data-reader-nav="previous">Back</button>
    <span class="ao-reader-progress" data-role="progress">—</span>
    <button type="button" data-reader-nav="next">Next</button>
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
  const left=root.querySelector(".ao-rail-left");
  const right=root.querySelector(".ao-rail-right");
  const leftActive=Boolean(left?.querySelector('[data-active="true"]'));
  const rightActive=Boolean(right?.querySelector('[data-active="true"]'));
  if(left)left.dataset.visible=String(leftActive);
  if(right)right.dataset.visible=String(rightActive);
  stage.dataset.leftRail=String(leftActive);
  stage.dataset.rightRail=String(rightActive);
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
  let scholaHeight=52;

  function setMode(next){
    const requested=normalizePresentationMode(next);
    if(!allowPresentationModeSwitch && requested!==mode) return mode;
    mode=requested;
    const shell=root.querySelector("[data-ao-reader-shell]");
    if(shell) shell.dataset.mode=mode;
    for(const button of root.querySelectorAll?.("[data-reader-mode]") ?? []){
      button.setAttribute("aria-pressed",String(button.dataset.readerMode===mode));
    }
    if(typeof onPresentationModeChange==="function") onPresentationModeChange(mode,prepared);
    return mode;
  }

  function closeSectionMenu(){
    const menu=root.querySelector('[data-role="section-menu"]');
    const jump=root.querySelector('[data-role="section-jump"]');
    if(menu)menu.hidden=true;
    jump?.setAttribute?.("aria-expanded","false");
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
      const parametersButton=event.target?.closest?.("[data-reader-parameters]");
      if(parametersButton){onParameters?.(current,prepared);return;}
      const sectionJump=event.target?.closest?.('[data-role="section-jump"]');
      if(sectionJump && !sectionJump.disabled){
        const menu=root.querySelector('[data-role="section-menu"]');
        if(menu){menu.hidden=!menu.hidden;sectionJump.setAttribute("aria-expanded",String(!menu.hidden));}
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
    syncScholaChrome();
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
    setText(root,"posture",textValue(current.posture));
    setText(root,"gesture",textValue(current.gesture));
    setText(root,"response",textValue(current.response));
    setText(root,"bell",current.bell ? [textValue(current.bell),current.bell.detail].filter(Boolean).join(" · ") : null);
    setText(root,"priest-voice",textValue(current.priestVoice));
    setText(root,"schola",current.scholaVisible ? textValue(current.schola) : null);
    const titleNode=root.querySelector('[data-role="card-title"]');
    if(titleNode)titleNode.hidden=Boolean(current.cardTitle && current.cardTitle===current.sectionTitle);
    const guideShort=root.querySelector('[data-role="guide-short"]');
    if(guideShort){
      guideShort.hidden=!current.guide?.text;
      guideShort.textContent=current.guide?.text??"";
    }

    setChannel(root,"posture",current.posture);
    setChannel(root,"gesture",current.gesture);
    setChannel(root,"response",current.response);
    setChannel(root,"bell",current.bell);
    setChannel(root,"priest-voice",current.priestVoice);
    setChannel(root,"schola",current.scholaVisible ? current.schola : null);
    syncScholaChrome();
    syncRailVisibility(root);

    applyIcon(root,"priest-action",current.priestActionIconKey,iconResolver);
    applyIcon(root,"posture",current.postureIconKey,iconResolver);
    applyIcon(root,"gesture",current.gestureIconKey,iconResolver);
    applyIcon(root,"response",current.responseIconKey,iconResolver);
    applyIcon(root,"priest-voice",current.priestVoiceIconKey,iconResolver);
    applyIcon(root,"schola",current.scholaIconKey,iconResolver);

    const cinematic=root.querySelector('[data-role="cinematic"]');
    if(cinematic){
      const visible=Boolean(current.cinematic);
      cinematic.hidden=!visible;
      cinematic.dataset.kind=visible ? String(current.cinematic.kind??"TRANSIENT") : "";
      setText(root,"cinematic-title",visible ? current.cinematic.title : null);
      setText(root,"cinematic-sub",visible ? current.cinematic.subtitle : null);
    }

    const guideButton=root.querySelector('[data-role="guide-button"]');
    if(guideButton) guideButton.disabled=!current.guide;
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
    prepared=null;current=null;bound=false;sectionItems=[];root.innerHTML="";
  }

  return Object.freeze({
    mount,renderMoment,setMode,setSections,destroy,
    getState:()=>current,
    getMode:()=>mode,
    canSwitchPresentationMode:()=>allowPresentationModeSwitch,
  });
}
