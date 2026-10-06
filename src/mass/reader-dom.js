import { resolveCanonicalAssetUrl } from "../assets/asset-registry.js";
import { normalizePresentationMode } from "./session-engine.js";

const SHELL_STYLE = `
.ao-reader-shell{
  --ao-bg:#0d120f;--ao-panel:#141c17;--ao-panel2:#19231d;
  --ao-line:rgba(238,241,233,.13);--ao-muted:#a9afa7;--ao-dim:#6f766f;
  --ao-text:#eef1e9;--ao-accent:#6d9575;--ao-warm:#d6caa6;--ao-response:#c8d9e9;
  --ao-rail:62px;--ao-content-max:820px;--ao-schola-height:72px;
  box-sizing:border-box;position:relative;display:grid;grid-template-rows:auto auto minmax(0,1fr);
  width:100%;height:100%;min-height:0;overflow:hidden;
  background:linear-gradient(180deg,#0c120e 0,#101711 100%);color:var(--ao-text);
  font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",sans-serif
}
.ao-reader-shell *{box-sizing:border-box}
.ao-reader-top-ribbon{
  position:relative;z-index:10;display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:center;
  height:44px;min-height:44px;padding:3px 8px 0;
  background:linear-gradient(180deg,rgba(8,13,9,.94),rgba(8,13,9,.76));
  backdrop-filter:blur(16px) saturate(112%);border:0
}
.ao-reader-top-action{
  appearance:none;border:0;background:transparent;color:#bdc6be;display:grid;place-items:center;
  width:48px;height:44px;padding:0;border-radius:12px;opacity:.72
}
.ao-reader-top-action:hover,.ao-reader-top-action:focus-visible{opacity:1;background:rgba(255,255,255,.035);outline:none}
.ao-reader-top-action .ao-reader-top-copy{font:700 .52rem/1 system-ui,sans-serif;letter-spacing:.08em}
.ao-reader-top-icon{display:block;width:27px;height:27px;background:currentColor}
.ao-reader-top-main{min-width:0;display:flex;align-items:center;justify-content:center}
.ao-mode-ribbon{
  display:inline-flex;align-items:center;justify-content:center;gap:1px;padding:2px;
  border:1px solid rgba(221,234,224,.09);border-radius:999px;
  background:rgba(16,24,18,.62);box-shadow:0 8px 30px rgba(0,0,0,.12);
  transition:opacity .28s ease,transform .28s cubic-bezier(.22,.72,.22,1)
}
.ao-mode-ribbon button{
  appearance:none;border:0;background:transparent;color:#77827a;
  min-width:66px;min-height:28px;padding:4px 10px;border-radius:999px;
  font:700 8px/1 system-ui,sans-serif;letter-spacing:.11em;
  transition:background .18s ease,color .18s ease,transform .18s ease
}
.ao-mode-ribbon button[aria-pressed="true"]{background:rgba(82,111,90,.26);color:#edf1eb;box-shadow:inset 0 0 0 1px rgba(162,190,169,.08)}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button{cursor:default}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button:not([aria-pressed="true"]){opacity:.34}

.ao-state-ribbon{
  position:relative;z-index:9;display:grid;grid-template-columns:minmax(126px,210px) minmax(0,1fr) minmax(0,210px);
  align-items:center;gap:10px;height:44px;min-height:44px;padding:3px max(12px,calc((100vw - 1120px)/2));
  background:transparent;border:0;backdrop-filter:none
}
.ao-state-cell{
  width:max-content;max-width:210px;min-width:0;min-height:0;display:flex;flex-direction:row;align-items:center;justify-content:flex-start;
  gap:5px;padding:4px 8px;text-align:left;border:1px solid transparent;border-radius:999px;color:#9ca69e;
  background:transparent;overflow:hidden;transition:opacity .25s ease,background .25s ease,border-color .25s ease,transform .25s cubic-bezier(.22,.72,.22,1)
}
.ao-state-kicker{display:none!important}
.ao-state-cell[data-side="priest"]{justify-self:start}
.ao-state-cell[data-side="action"]{justify-self:end;text-align:right}
.ao-state-cell[data-side="action"][data-active="false"]{visibility:hidden;opacity:0}
.ao-state-cell[data-side="action"][data-active="true"]{visibility:visible;opacity:1;background:rgba(20,29,22,.44);border-color:rgba(216,228,219,.07)}
.ao-state-label{
  max-width:150px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
  font:600 8px/1.12 system-ui,sans-serif;letter-spacing:.055em;text-transform:uppercase;color:#8f9b92
}
.ao-state-center{min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;padding:0 8px;text-align:center}
.ao-section-jump{
  appearance:none;border:0;background:transparent;color:#eef1ec;min-width:0;max-width:100%;padding:1px 7px;
  display:flex;align-items:center;justify-content:center;gap:5px;
  font:400 clamp(13px,1.5vw,16px)/1.12 Georgia,"Times New Roman",serif;
  letter-spacing:.018em;text-shadow:0 1px 20px rgba(0,0,0,.34)
}
.ao-section-jump [data-role="section-title"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ao-section-caret{font:500 .66rem/1 system-ui,sans-serif;color:#7f8a81}
.ao-guide-short{
  display:block;max-width:min(560px,100%);font:500 .53rem/1.15 system-ui,sans-serif;
  color:#8f9991;white-space:nowrap;overflow:hidden;text-overflow:ellipsis
}
.ao-guide-short[hidden]{display:none}
.ao-state-guide{
  appearance:none;border:0;background:transparent;color:#94a098;
  font:700 .47rem/1 system-ui,sans-serif;letter-spacing:.11em;padding:2px 5px
}
.ao-state-guide:disabled{opacity:.20}
.ao-icon-mask{
  width:24px;height:24px;flex:0 0 24px;background:currentColor;
  mask-repeat:no-repeat;mask-position:center;mask-size:contain;
  -webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain
}

.ao-section-menu{
  position:absolute;z-index:30;top:120px;left:50%;transform:translateX(-50%);
  width:min(720px,calc(100% - 120px));max-height:min(54vh,440px);overflow:auto;
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
  position:absolute;z-index:4;top:14px;bottom:22px;width:44px;
  display:flex;flex-direction:column;gap:9px;padding:0;background:transparent;box-shadow:none;overflow:visible;
  pointer-events:none
}
.ao-rail-left{left:max(8px,calc((100% - 1120px)/2))}
.ao-rail-right{right:max(8px,calc((100% - 1120px)/2))}
.ao-rail[data-visible="false"]{display:flex}
.ao-reader-shell:not([data-mode="LIVE"]) .ao-rail{display:none}
.ao-rail-item{
  position:relative;flex:0 0 auto;width:42px;min-height:42px;padding:5px;display:flex;flex-direction:column;align-items:center;justify-content:center;
  gap:0;text-align:center;color:#8e978f;background:transparent;border:1px solid transparent;border-radius:14px;box-shadow:none;
  opacity:.62;transition:opacity .22s ease,transform .25s cubic-bezier(.22,.72,.22,1),background .22s ease,border-color .22s ease,visibility .22s
}
.ao-rail-item[data-channel="posture"]{opacity:.42}
.ao-rail-item[data-channel="priest-voice"]{opacity:.26}
.ao-rail-item[data-channel="gesture"][data-active="false"],
.ao-rail-item[data-channel="response"][data-active="false"],
.ao-rail-item[data-channel="bell"][data-active="false"]{opacity:0;visibility:hidden;transform:scale(.76)}
.ao-rail-item[data-channel="gesture"][data-active="true"],
.ao-rail-item[data-channel="response"][data-active="true"],
.ao-rail-item[data-channel="bell"][data-active="true"]{opacity:1;visibility:visible;transform:scale(1.04);background:rgba(28,40,30,.80);border-color:rgba(190,211,196,.15);box-shadow:0 10px 30px rgba(0,0,0,.20);color:#e8ebe4}
.ao-rail-item[data-channel="response"][data-active="true"]{background:rgba(29,42,51,.82);border-color:rgba(192,216,233,.20);color:var(--ao-response)}
.ao-rail-item[data-channel="bell"][data-active="true"]{background:rgba(48,42,27,.84);border-color:rgba(220,201,146,.23)}
.ao-rail-copy{
  position:absolute;top:50%;left:49px;transform:translateY(-50%) translateX(-5px);z-index:3;width:max-content;max-width:190px;
  padding:6px 9px;border:1px solid rgba(227,236,229,.09);border-radius:10px;background:rgba(11,18,13,.94);box-shadow:0 10px 30px rgba(0,0,0,.26);
  color:#c8d1ca;font:600 8px/1.25 system-ui,sans-serif;letter-spacing:.045em;text-transform:uppercase;opacity:0;visibility:hidden
}
.ao-rail-right .ao-rail-copy{left:auto;right:49px;transform:translateY(-50%) translateX(5px)}
.ao-rail-item[data-channel="gesture"][data-active="true"] .ao-rail-copy,
.ao-rail-item[data-channel="response"][data-active="true"] .ao-rail-copy,
.ao-rail-item[data-channel="bell"][data-active="true"] .ao-rail-copy{opacity:1;visibility:visible;transform:translateY(-50%) translateX(0)}
.ao-rail-item[data-channel="posture"] .ao-rail-copy{display:none}
.ao-rail .ao-icon-mask{width:28px;height:28px}

.ao-schola-dock{
  position:absolute;z-index:7;left:50%;bottom:16px;transform:translateX(-50%);
  width:min(720px,calc(100% - 120px));height:var(--ao-schola-height);min-height:42px;max-height:180px;
  display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:8px;
  padding:10px 13px 9px;border:1px solid rgba(166,197,175,.15);border-radius:16px;
  background:rgba(13,20,15,.91);box-shadow:0 20px 70px rgba(0,0,0,.34);backdrop-filter:blur(18px) saturate(110%);color:#f0f1eb;overflow:hidden
}
.ao-schola-dock[data-active="false"]{display:none}
.ao-schola-dock[data-collapsed="true"]{height:32px!important;min-height:32px;padding-top:4px;padding-bottom:4px}
.ao-schola-dock[data-collapsed="true"] [data-role="schola"],.ao-schola-dock[data-collapsed="true"] [data-icon-slot="schola"]{display:none}
.ao-schola-resize{position:absolute;top:0;left:25%;right:25%;height:10px;cursor:ns-resize;touch-action:none}
.ao-schola-resize:before{content:"";position:absolute;left:50%;top:3px;width:34px;height:2px;border-radius:2px;background:rgba(109,149,117,.28);transform:translateX(-50%)}
.ao-schola-dock .ao-schola-kicker{font:700 .54rem/1 system-ui,sans-serif;letter-spacing:.11em;color:#94b29b}
.ao-schola-dock [data-role="schola"]{min-width:0;overflow:auto;font:500 .82rem/1.38 Georgia,"Times New Roman",serif}
.ao-schola-toggle{appearance:none;border:0;background:transparent;color:#89918b;font:700 .49rem/1 system-ui,sans-serif;letter-spacing:.08em;padding:6px}

.ao-reader-nav{position:absolute;z-index:5;inset:0;pointer-events:none}
.ao-reader-nav button{
  position:absolute;top:52%;width:38px;height:38px;border:0;border-radius:999px;
  background:rgba(15,23,17,.70);color:#828d85;cursor:pointer;pointer-events:auto;backdrop-filter:blur(12px);
  font:400 1.55rem/1 Georgia,serif;opacity:.10;box-shadow:0 9px 28px rgba(0,0,0,.18);
  transition:opacity .2s ease,transform .24s cubic-bezier(.22,.72,.22,1),background .2s ease
}
.ao-reader-nav button:hover,.ao-reader-nav button:focus-visible{opacity:.92;background:rgba(23,32,26,.90);color:#e8ece7;outline:none}
.ao-reader-nav button[data-reader-nav="previous"]{left:max(49px,calc((100% - 1120px)/2 + 52px))}
.ao-reader-nav button[data-reader-nav="next"]{right:max(49px,calc((100% - 1120px)/2 + 52px))}
.ao-reader-progress{display:none}

.ao-cinematic{
  position:absolute;inset:0;z-index:20;display:grid;place-items:center;
  background:rgba(7,11,8,.93);pointer-events:none;text-align:center;padding:2rem
}
.ao-cinematic[hidden]{display:none}
.ao-cinematic-inner{display:grid;gap:9px;justify-items:center;max-width:88%}
.ao-cinematic-mark{font:400 1.35rem/1 Georgia,serif;color:var(--ao-warm)}
.ao-cinematic-title{font:400 clamp(1.2rem,4vw,2rem)/1.15 Georgia,"Times New Roman",serif;letter-spacing:.08em;color:#f0f1e9}
.ao-cinematic-sub{font:600 .63rem/1.3 system-ui,sans-serif;letter-spacing:.11em;color:#89928a}

.ao-guide-popover{
  position:absolute;z-index:25;left:50%;bottom:76px;transform:translateX(-50%);
  width:min(720px,calc(100% - 110px));max-height:42%;overflow:auto;
  padding:13px 16px;border:1px solid rgba(238,241,233,.11);border-radius:12px;
  background:rgba(14,21,17,.985);box-shadow:0 14px 34px rgba(0,0,0,.45);
  font:500 .82rem/1.42 system-ui,sans-serif;color:#dde3dc
}
.ao-guide-popover[hidden]{display:none}

@media(max-width:760px){
  .ao-reader-shell{--ao-rail:48px}
  .ao-reader-top-ribbon{grid-template-columns:44px minmax(0,1fr) 44px;height:44px;min-height:44px;padding:3px 5px 0}
  .ao-reader-top-action{width:44px;height:44px}
  .ao-reader-top-icon{width:25px;height:25px}
  .ao-mode-ribbon button{min-width:58px;min-height:28px;padding:4px 7px;font-size:7px}
  .ao-state-ribbon{grid-template-columns:86px minmax(0,1fr) 86px;height:41px;min-height:41px;padding:2px 5px;gap:3px}
  .ao-state-cell{min-height:0;padding:3px 5px;max-width:86px}
  .ao-state-label{font-size:6.8px;max-width:57px}
  .ao-section-jump{font-size:11.5px}
  .ao-guide-short{font-size:7px;max-width:180px}
  .ao-section-menu{top:120px;width:calc(100% - 24px)}
  .ao-card-viewport{width:100%;padding:0 46px}
  .ao-prayer-card{padding:24px 12px max(42vh,240px)}
  .ao-reader-paragraph{font-size:clamp(19px,4.85vw,23px);line-height:1.66;opacity:.48}
  .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph{opacity:.48}
  .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph,
  .ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.74}
  .ao-rail{top:10px;bottom:18px;width:38px;gap:6px}
  .ao-rail-left{left:4px}.ao-rail-right{right:4px}
  .ao-rail-item{width:37px;min-height:38px;padding:4px;border-radius:14px}
  .ao-rail-copy{left:42px;max-width:145px;font-size:7px}
  .ao-rail-right .ao-rail-copy{right:42px}
  .ao-rail .ao-icon-mask{width:25px;height:25px}
  .ao-schola-dock{left:47px;right:47px;bottom:12px;transform:none;width:auto;padding:8px 10px;border-radius:14px}
  .ao-schola-dock [data-role="schola"]{font-size:14px;line-height:1.42}
  .ao-reader-nav{z-index:8}
  .ao-reader-nav button{top:52%;bottom:auto;width:34px;height:34px;border-radius:999px;font-size:1.25rem;opacity:.12}
  .ao-reader-nav button[data-reader-nav="previous"]{left:49px}
  .ao-reader-nav button[data-reader-nav="next"]{right:49px}
  .ao-guide-popover{bottom:68px;width:calc(100% - 24px)}
}
@media(prefers-reduced-motion:reduce){
  .ao-reader-paragraph,.ao-rail-item,.ao-reader-nav button{transition:none!important}
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
  <header class="ao-reader-top-ribbon">
    <button class="ao-reader-top-action" type="button" data-reader-home data-ao-asset-id="ao-nav-home" data-ao-asset-renderer="mask" aria-label="Home">${topAssetMask("ao-nav-home","HOME")}</button>
    <div class="ao-reader-top-main">
      <nav class="ao-mode-ribbon" aria-label="Reader mode">
        ${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}">${m}</button>`).join("")}
      </nav>
    </div>
    <button class="ao-reader-top-action" type="button" data-reader-parameters data-ao-asset-id="ao-nav-settings" data-ao-asset-renderer="mask" aria-label="Mass settings">${topAssetMask("ao-nav-settings","PARAMS")}</button>
  </header>

  <div class="ao-state-ribbon" aria-live="polite">
    <div class="ao-state-cell" data-side="priest">
      <span class="ao-icon-mask" data-icon-slot="priest-position" hidden></span>
      <span class="ao-state-kicker">PRIEST</span>
      <span class="ao-state-label" data-role="priest-position">—</span>
    </div>
    <div class="ao-state-center">
      <button class="ao-section-jump" type="button" data-role="section-jump" aria-expanded="false" disabled>
        <span data-role="section-title">${section}</span><span class="ao-section-caret" aria-hidden="true">⌄</span>
      </button>
      <span class="ao-guide-short" data-role="guide-short" hidden></span>
      <button class="ao-state-guide" type="button" data-role="guide-button" disabled>GUIDE</button>
    </div>
    <div class="ao-state-cell" data-side="action" data-channel="priest-action">
      <span class="ao-state-kicker">ACTION</span>
      <span class="ao-state-label" data-role="priest-action">—</span>
    </div>
  </div>

  <div class="ao-section-menu" data-role="section-menu" hidden></div>

  <div class="ao-reader-stage" data-left-rail="true" data-right-rail="true">
    <aside class="ao-rail ao-rail-left" data-visible="true" aria-label="Faithful state">
      <div class="ao-rail-item" data-channel="posture"><span class="ao-icon-mask" data-icon-slot="posture" hidden></span><span class="ao-rail-copy" data-role="posture">—</span></div>
      <div class="ao-rail-item" data-channel="gesture"><span class="ao-icon-mask" data-icon-slot="gesture" hidden></span><span class="ao-rail-copy" data-role="gesture">—</span></div>
      <div class="ao-rail-item" data-channel="response"><span class="ao-icon-mask" data-icon-slot="response" hidden></span><span class="ao-rail-copy" data-role="response">—</span></div>
    </aside>

    <main class="ao-card-viewport">
      <article class="ao-prayer-card" data-role="card" tabindex="0">
        <h1 class="ao-prayer-title" data-role="card-title">${section}</h1>
        <div class="ao-prayer-body" data-role="paragraphs"></div>
      </article>
    </main>

    <aside class="ao-rail ao-rail-right" data-visible="true" aria-label="Live audio state">
      <div class="ao-rail-item" data-channel="priest-voice"><span class="ao-icon-mask" data-icon-slot="priest-voice" hidden></span><span class="ao-rail-copy" data-role="priest-voice">—</span></div>
      <div class="ao-rail-item" data-channel="bell"><span class="ao-rail-copy" data-role="bell">—</span></div>
    </aside>
  </div>

  <div class="ao-schola-dock" data-channel="schola" data-active="false" data-collapsed="false">
    <span class="ao-schola-resize" data-schola-resize aria-hidden="true"></span>
    <span class="ao-icon-mask" data-icon-slot="schola" hidden></span>
    <span class="ao-schola-kicker">SCHOLA LIVE</span>
    <span data-role="schola">—</span>
    <button class="ao-schola-toggle" type="button" data-schola-toggle aria-label="Hide Schola">HIDE</button>
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
    setChannel(root,"priest-action",current.priestAction);
    setChannel(root,"gesture",current.gesture);
    setChannel(root,"response",current.response);
    setChannel(root,"bell",current.bell);
    setChannel(root,"priest-voice",current.priestVoice);
    setChannel(root,"schola",current.scholaVisible ? current.schola : null);
    syncScholaChrome();
    syncRailVisibility(root);

    applyIcon(root,"priest-position",current.priestPositionIconKey,iconResolver);
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
