// Feature-gated R17 reader preview.
// This deliberately mirrors the already-running legacy reader instead of
// taking canonical text ownership. It lets us prove layout/navigation/state
// parity without deleting or mutating the rollback reader.

const STYLE_ID="ao-r17-reader-preview-style";
const ROOT_ID="ao-r17-reader-preview";

function textOf(doc,selector,fallback="—"){
  const value=doc.querySelector(selector)?.textContent?.trim();
  return value||fallback;
}

function sanitizeClone(node){
  const clone=node.cloneNode(true);
  const all=[clone,...clone.querySelectorAll("*")];
  for(const el of all){
    el.removeAttribute?.("id");
    el.removeAttribute?.("autofocus");
    el.removeAttribute?.("contenteditable");
    if("disabled" in el)try{el.disabled=true}catch{}
    if(el.matches?.("button,a,input,select,textarea,[role=button],[tabindex]")){
      el.setAttribute("tabindex","-1");
      el.setAttribute("aria-hidden","true");
      el.style.pointerEvents="none";
    }
  }
  clone.setAttribute?.("inert","");
  return clone;
}

function ensureStyle(doc){
  if(doc.getElementById(STYLE_ID))return;
  const style=doc.createElement("style");
  style.id=STYLE_ID;
  style.textContent=`
#${ROOT_ID}{position:fixed;inset:0;z-index:2147483000;background:#080c12;color:#ece8df;font-family:Georgia,serif;display:grid;grid-template-rows:auto auto 1fr auto;overflow:hidden}
#${ROOT_ID} *{box-sizing:border-box}
#${ROOT_ID} .r17modes{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;padding:calc(env(safe-area-inset-top,0px) + 8px) 58px 8px;background:#0b1118;border-bottom:1px solid rgba(255,255,255,.08)}
#${ROOT_ID} .r17modes button{min-height:44px;border:1px solid rgba(255,255,255,.11);border-radius:10px;background:#0d141c;color:#aaa;font:600 11px/1.1 system-ui;letter-spacing:.12em}
#${ROOT_ID} .r17modes button.active{color:#f1eadb;border-color:rgba(204,184,132,.42);background:rgba(204,184,132,.07)}
#${ROOT_ID} .r17state{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.35fr) minmax(0,1fr);gap:6px;padding:7px 58px;border-bottom:1px solid rgba(255,255,255,.06);background:#090e14;font:600 10px/1.2 system-ui;letter-spacing:.04em;color:#b7b2a8}
#${ROOT_ID} .r17state span:nth-child(2){text-align:center;color:#e8e1d4}
#${ROOT_ID} .r17state span:last-child{text-align:right}
#${ROOT_ID} .r17stage{position:relative;min-height:0;overflow:hidden}
#${ROOT_ID} .r17reader{position:absolute;inset:0 52px;overflow:auto;padding:22px 10px 84px;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}
#${ROOT_ID} .r17mirror{max-width:790px;margin:0 auto}
#${ROOT_ID} .r17rail{position:absolute;top:16px;width:42px;display:grid;gap:7px}
#${ROOT_ID} .r17rail.left{left:5px}.r17rail.right{right:5px}
#${ROOT_ID} .r17cue{min-height:42px;border:1px solid rgba(255,255,255,.09);border-radius:11px;background:#0c131b;display:grid;place-items:center;text-align:center;padding:4px;color:#c8c1b3;font:600 8px/1.05 system-ui;letter-spacing:.04em}
#${ROOT_ID} .r17cue.live{border-color:rgba(204,184,132,.35);color:#e4d4aa}
#${ROOT_ID} .r17schola{display:none;position:absolute;left:56px;right:56px;bottom:8px;max-height:32%;overflow:auto;border:1px solid rgba(204,184,132,.22);border-radius:14px;background:rgba(7,12,18,.96);padding:10px 12px;box-shadow:0 16px 40px rgba(0,0,0,.35)}
#${ROOT_ID} .r17schola.show{display:block}
#${ROOT_ID} .r17schola b{display:block;font:600 9px/1 system-ui;letter-spacing:.14em;color:#c6b47f;margin-bottom:6px}
#${ROOT_ID} .r17schola p{margin:0;font-size:16px;line-height:1.35}
#${ROOT_ID} .r17nav{display:grid;grid-template-columns:54px 1fr 54px;align-items:center;gap:8px;padding:8px max(8px,env(safe-area-inset-right,0px)) calc(env(safe-area-inset-bottom,0px) + 8px) max(8px,env(safe-area-inset-left,0px));background:#090e14;border-top:1px solid rgba(255,255,255,.07)}
#${ROOT_ID} .r17nav button{min-width:44px;min-height:44px;border:1px solid rgba(255,255,255,.1);border-radius:12px;background:#0d141c;color:#eee;font-size:20px}
#${ROOT_ID} .r17meta{text-align:center;font:600 9px/1.2 system-ui;letter-spacing:.08em;color:#8f948f}
#${ROOT_ID} .r17close{position:absolute;top:calc(env(safe-area-inset-top,0px) + 8px);right:8px;z-index:3;width:44px;height:44px;border:1px solid rgba(255,255,255,.11);border-radius:12px;background:#0d141c;color:#ddd;font:600 18px/1 system-ui}
#${ROOT_ID} .r17badge{position:absolute;top:calc(env(safe-area-inset-top,0px) + 13px);left:8px;z-index:3;color:#8e958f;font:700 8px/1 system-ui;letter-spacing:.12em;writing-mode:vertical-rl}
@media(max-width:520px){#${ROOT_ID} .r17modes,#${ROOT_ID} .r17state{padding-left:50px;padding-right:50px}#${ROOT_ID} .r17reader{inset-left:46px;inset-right:46px}}
`;
  doc.head.appendChild(style);
}

function modeButton(doc,mode,label){
  const b=doc.createElement("button");
  b.type="button";b.dataset.r17Mode=mode;b.textContent=label;
  return b;
}

export function mountReaderPreview({doc=globalThis.document,prepared=null,onClose=null}={}){
  if(!doc?.body)throw new TypeError("Document/body required");
  doc.getElementById(ROOT_ID)?.remove();
  ensureStyle(doc);

  const root=doc.createElement("section");
  root.id=ROOT_ID;
  root.setAttribute("aria-label","R17 Mass reader preview");
  root.innerHTML=`
    <div class="r17modes"></div>
    <div class="r17state"><span data-r17-station>—</span><span data-r17-guide>—</span><span data-r17-action>—</span></div>
    <div class="r17stage">
      <aside class="r17rail left">
        <div class="r17cue" data-r17-posture>—</div>
        <div class="r17cue live" data-r17-gesture>—</div>
        <div class="r17cue live" data-r17-response>—</div>
      </aside>
      <main class="r17reader"><div class="r17mirror"></div></main>
      <aside class="r17rail right">
        <div class="r17cue" data-r17-voice>—</div>
        <div class="r17cue live" data-r17-bell>—</div>
      </aside>
      <div class="r17schola"><b>SCHOLA</b><p data-r17-schola></p><p data-r17-schola-translation></p></div>
    </div>
    <div class="r17nav"><button type="button" data-r17-prev aria-label="Previous">‹</button><div class="r17meta"></div><button type="button" data-r17-next aria-label="Next">›</button></div>
    <button type="button" class="r17close" data-r17-close aria-label="Close R17 preview">×</button>
    <span class="r17badge">R17 PREVIEW</span>`;

  const modes=root.querySelector(".r17modes");
  for(const [mode,label] of [["read","MISSAL"],["simple","SIMPLE"],["live","LIVE"]])modes.appendChild(modeButton(doc,mode,label));
  doc.body.appendChild(root);

  const legacyReader=doc.querySelector("#reader");
  if(!legacyReader)throw new Error("Legacy reader DOM unavailable for preview mirroring");

  let observer=null,raf=0;
  function queue(){if(!raf)raf=requestAnimationFrame(sync)}
  function sync(){
    raf=0;
    const mirror=root.querySelector(".r17mirror");
    mirror.replaceChildren(...[...legacyReader.children].map(sanitizeClone));

    root.querySelector("[data-r17-station]").textContent=textOf(doc,"#stationText");
    root.querySelector("[data-r17-guide]").textContent=textOf(doc,"#guideCopy");
    root.querySelector("[data-r17-action]").textContent=textOf(doc,"#actionDisplay");
    root.querySelector("[data-r17-posture]").textContent=textOf(doc,"#postureText");
    root.querySelector("[data-r17-gesture]").textContent=textOf(doc,"#gestureText");
    root.querySelector("[data-r17-response]").textContent=textOf(doc,"#responseText");
    root.querySelector("[data-r17-voice]").textContent=textOf(doc,"#voiceText");
    root.querySelector("[data-r17-bell]").textContent=textOf(doc,"#bellText");

    const schola=doc.querySelector("#scholaDock");
    const scholaBox=root.querySelector(".r17schola");
    scholaBox.classList.toggle("show",Boolean(schola?.classList.contains("show")));
    root.querySelector("[data-r17-schola]").textContent=textOf(doc,"#scholaStreamLine","");
    root.querySelector("[data-r17-schola-translation]").textContent=textOf(doc,"#scholaStreamTranslation","");

    const active=doc.querySelector("[data-mode-btn].active")?.dataset.modeBtn
      ?? String(prepared?.readerPreferences?.mode??"LIVE").toLowerCase().replace("missal","read");
    root.querySelectorAll("[data-r17-mode]").forEach(b=>b.classList.toggle("active",b.dataset.r17Mode===active));

    root.querySelector(".r17meta").textContent=[
      prepared?.session?.resolvedMass?.form??"MASS",
      doc.querySelector("#cardCounter")?.textContent?.trim()||""
    ].filter(Boolean).join(" · ");
  }

  root.addEventListener("click",e=>{
    const mode=e.target.closest?.("[data-r17-mode]")?.dataset.r17Mode;
    if(mode){doc.querySelector(`[data-mode-btn="${mode}"]`)?.click();setTimeout(queue,0);return}
    if(e.target.closest?.("[data-r17-prev]")){doc.querySelector("#cardPrev")?.click();setTimeout(queue,0);return}
    if(e.target.closest?.("[data-r17-next]")){doc.querySelector("#cardNext")?.click();setTimeout(queue,0);return}
    if(e.target.closest?.("[data-r17-close]")){destroy();onClose?.();return}
  });

  observer=new MutationObserver(queue);
  const watchTargets=[
    legacyReader,
    "#stationText","#guideCopy","#actionDisplay",
    "#postureText","#gestureText","#responseText",
    "#voiceText","#bellText","#scholaDock",
    "#scholaStreamLine","#scholaStreamTranslation",
    "#cardCounter"
  ].map(x=>typeof x==="string"?doc.querySelector(x):x).filter(Boolean);
  for(const target of watchTargets){
    observer.observe(target,{subtree:true,childList:true,characterData:true,attributes:true,attributeFilter:["class","aria-hidden"]});
  }
  legacyReader.addEventListener("scroll",queue,{passive:true});
  sync();

  function destroy(){
    observer?.disconnect();observer=null;
    if(raf)cancelAnimationFrame(raf);
    root.remove();
  }

  globalThis.AO_R17_READER_PREVIEW=Object.freeze({destroy,sync:queue,root});
  return globalThis.AO_R17_READER_PREVIEW;
}
