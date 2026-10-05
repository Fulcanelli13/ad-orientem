import { normalizePresentationMode } from "./session-engine.js";

const SHELL_STYLE = `
.ao-reader-shell{--ao-bg:#080c12;--ao-panel:#0d1218;--ao-line:rgba(189,161,108,.20);--ao-muted:#9a948c;--ao-text:#eee8de;--ao-accent:#bda16c;--ao-schola-height:52px;box-sizing:border-box;position:relative;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto auto;height:100%;min-height:0;background:var(--ao-bg);color:var(--ao-text);font-family:Georgia,"Times New Roman",serif;overflow:hidden}
.ao-reader-shell *{box-sizing:border-box}
.ao-reader-top-ribbon{display:grid;grid-template-columns:48px minmax(0,1fr) 48px;align-items:stretch;min-height:64px;border-bottom:1px solid var(--ao-line);background:#0a0f15}
.ao-reader-top-action{appearance:none;border:0;background:transparent;color:#cfc6ba;display:grid;place-items:center;min-width:48px;padding:0}
.ao-reader-top-action:first-child{border-right:1px solid rgba(189,161,108,.10)}
.ao-reader-top-action:last-child{border-left:1px solid rgba(189,161,108,.10)}
.ao-reader-top-action .ao-reader-top-copy{font:700 .54rem/1 system-ui,sans-serif;letter-spacing:.075em;color:#cfc6ba}
.ao-reader-top-main{min-width:0;display:grid;grid-template-rows:34px 30px}
.ao-mode-ribbon{display:grid;grid-template-columns:repeat(3,1fr);background:transparent}
.ao-mode-ribbon button{appearance:none;border:0;border-right:1px solid rgba(189,161,108,.08);background:transparent;color:var(--ao-muted);min-height:34px;padding:.38rem .3rem;font:600 .66rem/1 system-ui,sans-serif;letter-spacing:.11em}
.ao-mode-ribbon button:last-child{border-right:0}
.ao-mode-ribbon button[aria-pressed="true"]{color:var(--ao-text);background:rgba(189,161,108,.07);box-shadow:inset 0 -2px 0 var(--ao-accent)}
.ao-section-jump{appearance:none;border:0;border-top:1px solid rgba(189,161,108,.08);background:transparent;color:#e8e1d8;min-width:0;padding:.18rem .5rem;display:flex;align-items:center;justify-content:center;gap:.36rem;font:600 .69rem/1.05 system-ui,sans-serif}
.ao-section-jump [data-role="section-title"]{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ao-section-jump:disabled{cursor:default}
.ao-section-caret{font-size:.72rem;color:var(--ao-muted)}
.ao-section-menu{position:absolute;z-index:7;top:64px;left:52px;right:52px;max-height:min(52vh,430px);overflow:auto;padding:.42rem;border:1px solid var(--ao-line);border-radius:0 0 12px 12px;background:#0d141c;box-shadow:0 18px 34px rgba(0,0,0,.48)}
.ao-section-menu[hidden]{display:none}
.ao-section-menu button{appearance:none;width:100%;border:0;border-bottom:1px solid rgba(189,161,108,.08);background:transparent;color:#c9c1b7;padding:.66rem .72rem;text-align:left;font:500 .72rem/1.25 system-ui,sans-serif}
.ao-section-menu button:last-child{border-bottom:0}
.ao-section-menu button[aria-current="true"]{color:#fff5e6;background:rgba(189,161,108,.08)}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button{cursor:default}
.ao-reader-shell[data-mode-switch-locked="true"] .ao-mode-ribbon button:not([aria-pressed="true"]){opacity:.34}
.ao-state-ribbon{display:grid;grid-template-columns:88px minmax(0,1fr) 88px;min-height:52px;border-bottom:1px solid var(--ao-line);background:#0b1016}
.ao-state-cell[data-side]{flex-direction:column;justify-content:center;gap:.16rem;padding:.28rem .35rem;text-align:center}
.ao-state-cell[data-side="faithful"]{border-right:1px solid rgba(189,161,108,.10)}
.ao-state-cell[data-side="priest"]{border-left:1px solid rgba(189,161,108,.10)}
.ao-state-cell[data-side] .ao-state-label{font-size:.55rem;line-height:1.08;white-space:normal;text-transform:uppercase;letter-spacing:.035em}
.ao-state-center{min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:.26rem .4rem;text-align:center;gap:.16rem}
.ao-guide-short{display:block;max-width:100%;margin-top:.16rem;font:500 .54rem/1.08 system-ui,sans-serif;color:var(--ao-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.ao-guide-short[hidden]{display:none}
.ao-state-cell{min-width:0;display:flex;align-items:center;gap:.45rem;padding:.38rem .55rem;border-right:1px solid rgba(189,161,108,.10)}
.ao-state-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 .68rem/1.2 system-ui,sans-serif;color:#d8d0c6}
.ao-state-guide{appearance:none;border:0;background:transparent;color:var(--ao-accent);font:700 .59rem/1 system-ui,sans-serif;letter-spacing:.08em;padding:.1rem .25rem}
.ao-state-guide:disabled{opacity:.28}
.ao-icon-mask{width:22px;height:22px;flex:0 0 22px;background:currentColor;mask-repeat:no-repeat;mask-position:center;mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain}
.ao-reader-stage{min-height:0;display:grid;grid-template-columns:minmax(0,1fr)}
.ao-reader-stage[data-left-rail="true"][data-right-rail="false"]{grid-template-columns:58px minmax(0,1fr)}
.ao-reader-stage[data-left-rail="false"][data-right-rail="true"]{grid-template-columns:minmax(0,1fr) 58px}
.ao-reader-stage[data-left-rail="true"][data-right-rail="true"]{grid-template-columns:58px minmax(0,1fr) 58px}
.ao-rail[data-visible="false"]{display:none}
.ao-rail{min-height:0;display:flex;flex-direction:column;gap:.35rem;padding:.5rem .3rem;background:#090e14}
.ao-rail-left{border-right:1px solid var(--ao-line)}
.ao-rail-right{border-left:1px solid var(--ao-line)}
.ao-rail-item{min-height:0;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:.28rem;text-align:center;color:var(--ao-muted)}
.ao-rail-item[data-active="true"]{color:var(--ao-text)}
.ao-rail-copy{font:600 .56rem/1.15 system-ui,sans-serif;letter-spacing:.02em;overflow-wrap:anywhere}
.ao-card-viewport{min-width:0;min-height:0;padding:.58rem;background:linear-gradient(180deg,#090e14,#080c12)}
.ao-prayer-card{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:clamp(.9rem,3vw,1.35rem);border:1px solid var(--ao-line);border-radius:14px;background:linear-gradient(180deg,#10161d,#0d1218);box-shadow:0 12px 34px rgba(0,0,0,.22)}
.ao-prayer-title{margin:0 0 .85rem;font-size:clamp(1.14rem,4.3vw,1.55rem);line-height:1.08;font-weight:600;letter-spacing:.01em;color:#f4eee4}
.ao-prayer-title[hidden]{display:none}
.ao-prayer-body{display:flex;flex-direction:column;gap:.82rem;padding-bottom:42vh}
.ao-reader-paragraph{margin:0;font-size:clamp(1.02rem,3.7vw,1.28rem);line-height:1.52;color:#e8e1d8}
.ao-reader-paragraph[data-active="true"]{color:#fffaf1}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph{opacity:.2;transition:opacity .22s ease,color .22s ease}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"]{opacity:1}
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph[data-active="true"] + .ao-reader-paragraph,
.ao-prayer-body:has(.ao-reader-paragraph[data-active="true"]) .ao-reader-paragraph:has(+ .ao-reader-paragraph[data-active="true"]){opacity:.58}
.ao-reader-paragraph[data-kind="RUBRIC"]{margin:.15rem 0;padding:.55rem .65rem;border-left:1px solid rgba(189,161,108,.45);font:italic 500 .76rem/1.42 system-ui,sans-serif;color:#9f988f}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"]{margin:.25rem 0;padding:.72rem .25rem;text-align:center;font-size:clamp(1.28rem,4.8vw,1.62rem);line-height:1.34;letter-spacing:.035em;color:#fff8eb}
.ao-reader-paragraph[data-kind="CONSECRATION_WORDS"] .ao-line-secondary{margin-top:.45rem;font-size:.62em;color:#aaa39a}
.ao-reader-paragraph[data-kind="RESPONSE"]{padding-left:.72rem;border-left:2px solid var(--ao-accent)}
.ao-reader-paragraph[data-translate-toggle="true"]{cursor:pointer}
.ao-reader-paragraph[data-translate-toggle="true"]:focus-visible{outline:1px solid var(--ao-accent);outline-offset:4px;border-radius:4px}
.ao-line-primary{display:block}
.ao-line-secondary{display:block;margin-top:.2rem;font:400 .78em/1.35 system-ui,sans-serif;color:#aaa39a}
.ao-schola-dock{position:relative;height:var(--ao-schola-height);min-height:32px;max-height:180px;display:grid;grid-template-columns:auto auto minmax(0,1fr) auto;align-items:center;gap:.5rem;padding:.48rem .65rem .38rem;border-top:1px solid var(--ao-line);background:#0b1117;color:#ddd6cb;overflow:hidden}
.ao-schola-dock[data-active="false"]{display:none}
.ao-schola-dock[data-collapsed="true"]{height:32px!important;min-height:32px;padding-top:.28rem;padding-bottom:.24rem}
.ao-schola-dock[data-collapsed="true"] [data-role="schola"],.ao-schola-dock[data-collapsed="true"] [data-icon-slot="schola"]{display:none}
.ao-schola-resize{position:absolute;top:0;left:25%;right:25%;height:10px;cursor:ns-resize;touch-action:none}
.ao-schola-resize:before{content:"";position:absolute;left:50%;top:3px;width:34px;height:2px;border-radius:2px;background:rgba(189,161,108,.25);transform:translateX(-50%)}
.ao-schola-dock .ao-schola-kicker{font:700 .56rem/1 system-ui,sans-serif;letter-spacing:.11em;color:var(--ao-accent)}
.ao-schola-dock [data-role="schola"]{min-width:0;overflow:auto;white-space:normal;font:500 .72rem/1.28 Georgia,"Times New Roman",serif}
.ao-schola-toggle{appearance:none;border:0;background:transparent;color:var(--ao-muted);font:700 .54rem/1 system-ui,sans-serif;letter-spacing:.06em;padding:.35rem .2rem}
.ao-reader-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;min-height:46px;border-top:1px solid var(--ao-line);background:#0a0f15}
.ao-reader-nav button{appearance:none;border:0;background:transparent;color:#d8d0c6;min-height:46px;padding:.72rem .8rem;font:600 .72rem/1 system-ui,sans-serif}
.ao-reader-nav button:last-child{text-align:right}
.ao-reader-progress{font:600 .64rem/1 system-ui,sans-serif;color:var(--ao-muted)}
.ao-cinematic{position:absolute;inset:0;z-index:8;display:grid;place-items:center;background:rgba(8,12,18,.88);pointer-events:none;text-align:center;padding:2rem}
.ao-cinematic[hidden]{display:none}
.ao-cinematic-inner{display:grid;gap:.55rem;justify-items:center;max-width:88%}
.ao-cinematic-mark{font-size:1.25rem;color:var(--ao-accent)}
.ao-cinematic-title{font:600 clamp(1.05rem,4vw,1.7rem)/1.15 Georgia,"Times New Roman",serif;letter-spacing:.08em}
.ao-cinematic-sub{font:600 .66rem/1.3 system-ui,sans-serif;letter-spacing:.08em;color:var(--ao-muted)}
.ao-guide-popover{position:absolute;inset:auto 10px 56px 10px;z-index:3;max-height:42%;overflow:auto;padding:.8rem 1rem;border:1px solid var(--ao-line);border-radius:12px;background:#111820;box-shadow:0 14px 34px rgba(0,0,0,.45);font:500 .82rem/1.42 system-ui,sans-serif;color:#ddd6cd}
.ao-guide-popover[hidden]{display:none}
@media (min-width:700px){.ao-reader-stage[data-left-rail="true"][data-right-rail="false"]{grid-template-columns:76px minmax(0,1fr)}.ao-reader-stage[data-left-rail="false"][data-right-rail="true"]{grid-template-columns:minmax(0,1fr) 76px}.ao-reader-stage[data-left-rail="true"][data-right-rail="true"]{grid-template-columns:76px minmax(0,1fr) 76px}.ao-card-viewport{padding:.8rem}.ao-rail-copy{font-size:.62rem}}
`;

function esc(value){
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
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
    <button class="ao-reader-top-action" type="button" data-reader-home data-ao-asset-id="ao-nav-home" data-ao-asset-renderer="pending-externalization" aria-label="Home"><span class="ao-reader-top-copy">HOME</span></button>
    <div class="ao-reader-top-main">
      <nav class="ao-mode-ribbon" aria-label="Reader mode">
        ${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}">${m}</button>`).join("")}
      </nav>
      <button class="ao-section-jump" type="button" data-role="section-jump" aria-expanded="false" disabled><span data-role="section-title">${section}</span><span class="ao-section-caret" aria-hidden="true">⌄</span></button>
    </div>
    <button class="ao-reader-top-action" type="button" data-reader-parameters data-ao-asset-id="ao-nav-settings" data-ao-asset-renderer="pending-externalization" aria-label="Mass settings"><span class="ao-reader-top-copy">PARAMS</span></button>
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
    const values=Array.isArray(sections)?sections.filter(x=>x?.id&&x?.label):[];
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

  function destroy(){
    prepared=null;current=null;bound=false;root.innerHTML="";
  }

  return Object.freeze({
    mount,renderMoment,setMode,destroy,
    getState:()=>current,
    getMode:()=>mode,
    canSwitchPresentationMode:()=>allowPresentationModeSwitch,
  });
}
