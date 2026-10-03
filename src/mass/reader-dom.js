import { normalizePresentationMode } from "./session-engine.js";

const SHELL_STYLE = `
.ao-reader-shell{--ao-bg:#080c12;--ao-panel:#0d1218;--ao-line:rgba(189,161,108,.20);--ao-muted:#9a948c;--ao-text:#eee8de;--ao-accent:#bda16c;box-sizing:border-box;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;height:100%;min-height:0;background:var(--ao-bg);color:var(--ao-text);font-family:Georgia,"Times New Roman",serif;overflow:hidden}
.ao-reader-shell *{box-sizing:border-box}
.ao-mode-ribbon{display:grid;grid-template-columns:repeat(3,1fr);border-bottom:1px solid var(--ao-line);background:#0a0f15}
.ao-mode-ribbon button{appearance:none;border:0;border-right:1px solid rgba(189,161,108,.10);background:transparent;color:var(--ao-muted);padding:.62rem .4rem;font:600 .72rem/1.1 system-ui,sans-serif;letter-spacing:.11em}
.ao-mode-ribbon button[aria-pressed="true"]{color:var(--ao-text);background:rgba(189,161,108,.07);box-shadow:inset 0 -2px 0 var(--ao-accent)}
.ao-state-ribbon{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.4fr) 54px;min-height:46px;border-bottom:1px solid var(--ao-line);background:#0b1016}
.ao-state-cell{min-width:0;display:flex;align-items:center;gap:.45rem;padding:.38rem .55rem;border-right:1px solid rgba(189,161,108,.10)}
.ao-state-label{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font:600 .68rem/1.2 system-ui,sans-serif;color:#d8d0c6}
.ao-state-guide{appearance:none;border:0;background:transparent;color:var(--ao-accent);font:700 .67rem/1 system-ui,sans-serif;letter-spacing:.04em}
.ao-state-guide:disabled{opacity:.34}
.ao-icon-mask{width:22px;height:22px;flex:0 0 22px;background:currentColor;mask-repeat:no-repeat;mask-position:center;mask-size:contain;-webkit-mask-repeat:no-repeat;-webkit-mask-position:center;-webkit-mask-size:contain}
.ao-reader-stage{min-height:0;display:grid;grid-template-columns:58px minmax(0,1fr) 58px}
.ao-rail{min-height:0;display:flex;flex-direction:column;gap:.35rem;padding:.5rem .3rem;background:#090e14}
.ao-rail-left{border-right:1px solid var(--ao-line)}
.ao-rail-right{border-left:1px solid var(--ao-line)}
.ao-rail-item{min-height:0;display:flex;flex:1;flex-direction:column;align-items:center;justify-content:center;gap:.28rem;text-align:center;color:var(--ao-muted)}
.ao-rail-item[data-active="true"]{color:var(--ao-text)}
.ao-rail-copy{font:600 .56rem/1.15 system-ui,sans-serif;letter-spacing:.02em;overflow-wrap:anywhere}
.ao-card-viewport{min-width:0;min-height:0;padding:.58rem;background:linear-gradient(180deg,#090e14,#080c12)}
.ao-prayer-card{height:100%;min-height:0;overflow-y:auto;overscroll-behavior:contain;padding:clamp(.9rem,3vw,1.35rem);border:1px solid var(--ao-line);border-radius:14px;background:linear-gradient(180deg,#10161d,#0d1218);box-shadow:0 12px 34px rgba(0,0,0,.22)}
.ao-prayer-title{margin:0 0 .85rem;font-size:clamp(1.14rem,4.3vw,1.55rem);line-height:1.08;font-weight:600;letter-spacing:.01em;color:#f4eee4}
.ao-prayer-body{display:flex;flex-direction:column;gap:.82rem;padding-bottom:28vh}
.ao-reader-paragraph{margin:0;font-size:clamp(1.02rem,3.7vw,1.28rem);line-height:1.52;color:#e8e1d8}
.ao-reader-paragraph[data-active="true"]{color:#fffaf1}
.ao-reader-paragraph[data-kind="RESPONSE"]{padding-left:.72rem;border-left:2px solid var(--ao-accent)}
.ao-reader-paragraph[data-translate-toggle="true"]{cursor:pointer}
.ao-reader-paragraph[data-translate-toggle="true"]:focus-visible{outline:1px solid var(--ao-accent);outline-offset:4px;border-radius:4px}
.ao-line-primary{display:block}
.ao-line-secondary{display:block;margin-top:.2rem;font:400 .78em/1.35 system-ui,sans-serif;color:#aaa39a}
.ao-reader-nav{display:grid;grid-template-columns:1fr auto 1fr;align-items:center;min-height:46px;border-top:1px solid var(--ao-line);background:#0a0f15}
.ao-reader-nav button{appearance:none;border:0;background:transparent;color:#d8d0c6;padding:.72rem .8rem;font:600 .72rem/1 system-ui,sans-serif}
.ao-reader-nav button:last-child{text-align:right}
.ao-reader-progress{font:600 .64rem/1 system-ui,sans-serif;color:var(--ao-muted)}
.ao-guide-popover{position:absolute;inset:auto 10px 56px 10px;z-index:3;max-height:42%;overflow:auto;padding:.8rem 1rem;border:1px solid var(--ao-line);border-radius:12px;background:#111820;box-shadow:0 14px 34px rgba(0,0,0,.45);font:500 .82rem/1.42 system-ui,sans-serif;color:#ddd6cd}
.ao-guide-popover[hidden]{display:none}
@media (min-width:700px){.ao-reader-stage{grid-template-columns:76px minmax(0,1fr) 76px}.ao-card-viewport{padding:.8rem}.ao-rail-copy{font-size:.62rem}}
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
  const paragraphs = Array.isArray(moment.paragraphs) ? moment.paragraphs.map((p, index) => {
    if (typeof p === "string") return Object.freeze({id:String(index),kind:"TEXT",primary:p,secondary:null,alternate:null,replaceOnToggle:false,active:false});
    return Object.freeze({
      id:String(p.id ?? index),
      kind:String(p.kind ?? (p.response ? "RESPONSE" : "TEXT")).toUpperCase(),
      primary:String(p.primary ?? p.text ?? ""),
      secondary:p.secondary == null ? null : String(p.secondary),
      alternate:p.alternate == null ? null : String(p.alternate),
      replaceOnToggle:p.replaceOnToggle === true && p.alternate != null,
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
  <nav class="ao-mode-ribbon" aria-label="Reader mode">
    ${["MISSAL","SIMPLE","LIVE"].map(m => `<button type="button" data-reader-mode="${m}" aria-pressed="${String(m===mode)}">${m}</button>`).join("")}
  </nav>
  <div class="ao-state-ribbon">
    <div class="ao-state-cell"><span class="ao-icon-mask" data-icon-slot="priest-action" hidden></span><span class="ao-state-label" data-role="priest-position">PRIEST POSITION</span></div>
    <div class="ao-state-cell"><span class="ao-state-label" data-role="section-title">${section}</span></div>
    <button class="ao-state-guide" type="button" data-role="guide-button" disabled>GUIDE</button>
  </div>
  <div class="ao-reader-stage">
    <aside class="ao-rail ao-rail-left" aria-label="Faithful">
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
    <aside class="ao-rail ao-rail-right" aria-label="Audio">
      <div class="ao-rail-item" data-channel="priest-voice"><span class="ao-icon-mask" data-icon-slot="priest-voice" hidden></span><span class="ao-rail-copy" data-role="priest-voice">—</span></div>
      <div class="ao-rail-item" data-channel="schola"><span class="ao-icon-mask" data-icon-slot="schola" hidden></span><span class="ao-rail-copy" data-role="schola">—</span></div>
    </aside>
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
} = {}) {
  if(!root || typeof root.querySelector !== "function") throw new TypeError("Reader root element required");

  let prepared=null;
  let current=null;
  let mode="LIVE";
  let bound=false;

  function setMode(next){
    mode=normalizePresentationMode(next);
    const shell=root.querySelector("[data-ao-reader-shell]");
    if(shell) shell.dataset.mode=mode;
    for(const button of root.querySelectorAll?.("[data-reader-mode]") ?? []){
      button.setAttribute("aria-pressed",String(button.dataset.readerMode===mode));
    }
    if(typeof onPresentationModeChange==="function") onPresentationModeChange(mode,prepared);
    return mode;
  }

  function bind(){
    if(bound) return;
    bound=true;
    root.addEventListener?.("click", event => {
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
  }

  function mount(nextPrepared){
    if(!nextPrepared?.session?.resolvedMass) throw new TypeError("Prepared Mass session required");
    prepared=nextPrepared;
    mode=normalizePresentationMode(prepared.readerPreferences?.mode ?? prepared.session.resolvedMass.presentationMode);
    root.innerHTML=buildReaderShellMarkup(prepared);
    bound=false;
    bind();
    return prepared;
  }

  function renderMoment(moment){
    if(!prepared) throw new Error("Reader shell must be mounted before rendering moments");
    current=normalizeReaderMoment(moment,current ?? {});
    setText(root,"section-title",current.sectionTitle);
    setText(root,"card-title",current.cardTitle);
    setText(root,"progress",current.progress);
    setText(root,"priest-position",textValue(current.priestPosition));
    setText(root,"posture",textValue(current.posture));
    setText(root,"gesture",textValue(current.gesture));
    setText(root,"response",textValue(current.response));
    setText(root,"priest-voice",textValue(current.priestVoice));
    setText(root,"schola",current.scholaVisible ? textValue(current.schola) : null);

    setChannel(root,"posture",current.posture);
    setChannel(root,"gesture",current.gesture);
    setChannel(root,"response",current.response);
    setChannel(root,"priest-voice",current.priestVoice);
    setChannel(root,"schola",current.scholaVisible ? current.schola : null);

    applyIcon(root,"priest-action",current.priestActionIconKey,iconResolver);
    applyIcon(root,"posture",current.postureIconKey,iconResolver);
    applyIcon(root,"gesture",current.gestureIconKey,iconResolver);
    applyIcon(root,"response",current.responseIconKey,iconResolver);
    applyIcon(root,"priest-voice",current.priestVoiceIconKey,iconResolver);
    applyIcon(root,"schola",current.scholaIconKey,iconResolver);

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
          const exactCueIds=(p.sourceCueIds??[]).filter(id=>/^AO\\.SM\\.C\\d{4}$/.test(String(id)));
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

  return Object.freeze({mount,renderMoment,setMode,destroy,getState:()=>current,getMode:()=>mode});
}
