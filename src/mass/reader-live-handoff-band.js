// Owner LIVE handoff Stage B: opt-in shell only. This module never owns the
// Mass sequence, actual Schola progression, rubrics or ceremonial animations.
import {resolveLiveHandoffSourceCrosswalk} from "./reader-live-handoff-source-crosswalk.js";
import {LIVE_HANDOFF_SOURCE_POINTS,projectLiveHandoffPlanPosition} from "./reader-live-handoff-geometry.js";

export const LIVE_BAND_PREVIEW_PARAM="aoLiveBandPreview";
export const LIVE_BAND_STORAGE_KEY="ao-live-band-height-v1";
export const LIVE_BAND_SNAP_HEIGHTS=Object.freeze([96,230,340,460]);
export const LIVE_BAND_ACTION_REFERENCES=Object.freeze(["C05","C13","C14","C24","C36","C38","C56","C57","C63"]);
const ACTION=new Set(LIVE_BAND_ACTION_REFERENCES);
const NAMES=["Sanctuary","Timeline","Whole-Mass wheel"];
const freeze=Object.freeze;
const bound=(value,lo,hi)=>Math.max(lo,Math.min(hi,value));

export function snapLiveBandHeight(value){
  const n=Number(value);
  if(!Number.isFinite(n))return 230;
  return LIVE_BAND_SNAP_HEIGHTS.reduce((best,item)=>
    Math.abs(item-n)<Math.abs(best-n)?item:best,LIVE_BAND_SNAP_HEIGHTS[0]);
}
export function normalizeLiveBandPreference(value){
  if(value==null||value===""||value==="adaptive")return null;
  const n=Number(value);
  return LIVE_BAND_SNAP_HEIGHTS.includes(n)?n:null;
}
export function liveBandHeightForReference(referenceId,preference=null){
  return normalizeLiveBandPreference(preference) ??
    (ACTION.has(String(referenceId))?420:230);
}
export function liveBandSourceGate({model,currentCard,mode}={}){
  if(String(mode??model?.presentationMode??"").toUpperCase()!=="LIVE")
    return freeze({ok:false,reason:"NOT_LIVE_MODE",crosswalk:null,reference:null});
  if(!currentCard?.sectionId)
    return freeze({ok:false,reason:"NATIVE_CURRENT_CARD_REQUIRED",crosswalk:null,reference:null});
  const crosswalk=resolveLiveHandoffSourceCrosswalk({model,form:model?.corpusFamily});
  if(crosswalk.status!=="EXACT_NATIVE_65_CROSSWALK")
    return freeze({ok:false,reason:crosswalk.status,crosswalk,reference:null});
  const reference=crosswalk.mappings.find(item=>
    item.nativeCardId===currentCard.sectionId && item.status==="MATCHED_SOURCE_CARD")??null;
  return freeze({ok:Boolean(reference),
    reason:reference?null:"NATIVE_CARD_OUTSIDE_SOURCE_CROSSWALK",crosswalk,reference});
}
export function approvedStageBPlanSvg(){
  // Static architecture only. Exact coordinates are imported from the
  // approved geometry; no priest, ministers or invented movements.
  const pos=id=>projectLiveHandoffPlanPosition(LIVE_HANDOFF_SOURCE_POINTS[id]);
  const foot=pos("FOOT"),rail=pos("RAIL"),gospel=pos("GOSPEL"),epistle=pos("EPISTLE");
  const line=(x1,y1,x2,y2,kind)=>'<line x1="'+x1+'" y1="'+y1+'" x2="'+x2+'" y2="'+y2+'" class="'+kind+'"/>';
  return '<svg viewBox="0 0 600 600" class="ao-lb-plan" role="img" aria-label="Source-approved sanctuary orientation; altar right, Gospel side top">'
    +'<rect class="ao-lb-floor" x="60" y="80" width="480" height="440" rx="6"/>'
    +'<rect class="ao-lb-altar" x="'+(foot.x+42).toFixed(1)+'" y="'+(gospel.y-35).toFixed(1)
    +'" width="98" height="'+(epistle.y-gospel.y+70).toFixed(1)+'" rx="4"/>'
    +line(rail.x.toFixed(1),85,rail.x.toFixed(1),268,"ao-lb-rail")
    +line(rail.x.toFixed(1),332,rail.x.toFixed(1),515,"ao-lb-rail")
    +[120,160,200,240].map(x=>line(x,100,x,250,"ao-lb-pew")+line(x,350,x,500,"ao-lb-pew")).join("")
    +'</svg>';
}
const CSS=[
".ao-reader-shell.ao-live-band-enabled{grid-template-rows:56px 64px minmax(96px,min(var(--ao-live-band-height,230px),calc(100dvh - 380px))) minmax(0,1fr);transition:grid-template-rows .24s ease}",
".ao-live-band[hidden]{display:none!important}",
".ao-live-band{position:relative;min-height:0;overflow:hidden;background:linear-gradient(145deg,#111b1c,#192322 55%,#121a1a);border-bottom:1px solid rgba(225,205,148,.24)}",
".ao-lb-window{height:calc(100% - 31px);overflow:hidden;touch-action:pan-y}",
".ao-lb-pages{height:100%;display:flex;transition:transform .22s ease}",
".ao-lb-page{flex:0 0 100%;height:100%;width:100%;min-width:0;display:grid;place-items:center}",
".ao-lb-page:not([data-active='true']){visibility:hidden}",
".ao-lb-plan{display:block;height:100%;width:100%;max-width:640px;opacity:.8}",
".ao-lb-floor{fill:rgba(190,195,178,.045);stroke:rgba(230,221,183,.21);stroke-width:1.5}",
".ao-lb-altar{fill:rgba(224,211,167,.16);stroke:rgba(232,219,178,.75);stroke-width:2}",
".ao-lb-rail{stroke:rgba(226,215,178,.72);stroke-width:4}",
".ao-lb-pew{stroke:rgba(199,207,193,.24);stroke-width:11;stroke-linecap:round}",
".ao-lb-sequence{display:flex;gap:2px;align-items:center;width:91%;max-width:670px;height:95%}",
".ao-lb-tick{flex:1 1 0;min-width:1px;height:14%;border-radius:2px;background:rgba(223,217,190,.25)}",
".ao-lb-tick[data-current='true']{height:73%;background:var(--ao-mass-accent,#d6caa6)}",
".ao-lb-wheel{height:95%;max-width:90%;overflow:visible}",
".ao-lb-wheel .track{fill:none;stroke:rgba(234,220,183,.18);stroke-width:16}",
".ao-lb-wheel .progress{fill:none;stroke:var(--ao-mass-accent,#d6caa6);stroke-width:16;transform:rotate(-90deg);transform-origin:100px 100px}",
".ao-lb-wheel .hand{stroke:#f2e1ad;stroke-width:3;stroke-linecap:round;transform-origin:100px 100px}",
".ao-lb-controls{position:absolute;inset:auto 0 0;height:31px;display:grid;place-items:center}",
".ao-lb-dots{display:flex;gap:11px;align-items:center}",
".ao-lb-dot{width:28px;height:28px;border:0;background:transparent;display:grid;place-items:center;cursor:pointer}",
".ao-lb-dot::after{content:'';width:6px;height:6px;border-radius:50%;background:rgba(245,240,220,.4)}",
".ao-lb-dot[aria-pressed='true']::after{width:16px;border-radius:7px;background:#dfc890}",
".ao-lb-handle{position:absolute;right:8px;bottom:0;width:48px;height:31px;border:0;background:transparent;cursor:ns-resize;touch-action:none}",
".ao-lb-handle::after{content:'';display:block;width:27px;height:4px;margin:auto;border-radius:7px;background:rgba(233,217,174,.7)}",
".ao-lb-dot:focus-visible,.ao-lb-handle:focus-visible{outline:2px solid #e6cb87;outline-offset:-3px}",
".ao-live-band[data-collapsed='true'] .ao-lb-window{display:none}",
"@media(orientation:landscape) and (max-height:650px){",
".ao-reader-shell.ao-live-band-enabled{grid-template-columns:minmax(0,42%) minmax(0,58%);grid-template-rows:56px 64px minmax(0,1fr)}",
".ao-reader-shell.ao-live-band-enabled>.ao-reader-top-ribbon,.ao-reader-shell.ao-live-band-enabled>.ao-state-ribbon{grid-column:1/-1}",
".ao-reader-shell.ao-live-band-enabled>.ao-live-band{grid-column:1;grid-row:3;height:100%;border-right:1px solid rgba(225,205,148,.24);border-bottom:0}",
".ao-reader-shell.ao-live-band-enabled>.ao-reader-stage{grid-column:2;grid-row:3}",
"}",
"@media(prefers-reduced-motion:reduce){.ao-lb-pages{transition:none}}"
].join("\n");

export function mountLiveHandoffBand({preview,doc=globalThis.document,
  win=globalThis,storage=win?.localStorage,enabled=null}={}){
  const requested=enabled===null
    ?new URLSearchParams(win?.location?.search??"").get(LIVE_BAND_PREVIEW_PARAM)==="1"
    :enabled===true;
  if(!requested)return freeze({mounted:false,reason:"PREVIEW_NOT_REQUESTED",dispose(){}});
  const shell=preview?.root?.querySelector?.("[data-ao-reader-shell]");
  const stage=shell?.querySelector?.(".ao-reader-stage");
  if(!stage||!doc?.createElement||!preview?.getCurrentCard)
    return freeze({mounted:false,reason:"NATIVE_READER_SHELL_REQUIRED",dispose(){}});
  if(shell.querySelector("[data-ao-live-band]"))
    return freeze({mounted:false,reason:"ALREADY_MOUNTED",dispose(){}});
  const style=doc.createElement("style");
  style.dataset.aoLiveBandStyle="stage-b";style.textContent=CSS;
  const band=doc.createElement("section");band.className="ao-live-band";
  band.dataset.aoLiveBand="stage-b";band.hidden=true;
  band.setAttribute("aria-label","LIVE visual band preview");
  band.innerHTML='<div class="ao-lb-window" data-lb-swipe><div class="ao-lb-pages">'
    +'<div class="ao-lb-page" data-active="true" aria-label="Sanctuary">'+approvedStageBPlanSvg()+'</div>'
    +'<div class="ao-lb-page" data-active="false" aria-label="Native card sequence">'
    +'<div class="ao-lb-sequence" data-lb-sequence role="img" aria-label="Card ordinal, not a time estimate"></div></div>'
    +'<div class="ao-lb-page" data-active="false" aria-label="Whole-Mass wheel">'
    +'<svg class="ao-lb-wheel" viewBox="0 0 200 200" role="img" aria-label="Card ordinal, not a time estimate">'
    +'<circle class="track" cx="100" cy="100" r="72"/>'
    +'<circle class="progress" data-lb-progress cx="100" cy="100" r="72"/>'
    +'<line class="hand" data-lb-hand x1="100" y1="100" x2="100" y2="35"/></svg></div>'
    +'</div></div><div class="ao-lb-controls"><div class="ao-lb-dots" role="group" aria-label="Band page">'
    +NAMES.map((name,i)=>'<button type="button" class="ao-lb-dot" data-lb-page="'+i+'" aria-label="'+name
      +'" aria-pressed="'+(i===0)+'"></button>').join("")
    +'</div><button type="button" class="ao-lb-handle" data-lb-handle aria-label="Resize band; double tap for adaptive height"></button></div>';
  shell.insertBefore(style,stage);shell.insertBefore(band,stage);
  let preference=null;
  try{preference=normalizeLiveBandPreference(storage?.getItem(LIVE_BAND_STORAGE_KEY));}catch{}
  let page=0,disposed=false,lastModel=null,lastCrosswalk=null,lastId=null,drag=null,swipe=null,lastTap=0;
  const pages=[...band.querySelectorAll(".ao-lb-page")];
  const dots=[...band.querySelectorAll("[data-lb-page]")];
  const frame=band.querySelector(".ao-lb-pages");
  const ticks=band.querySelector("[data-lb-sequence]");
  const progress=band.querySelector("[data-lb-progress]");
  const hand=band.querySelector("[data-lb-hand]");
  const circumference=2*Math.PI*72;
  function setPage(index){
    page=bound(Number(index)||0,0,2);
    frame.style.transform="translateX(-"+(page*100)+"%)";
    pages.forEach((item,i)=>item.dataset.active=String(i===page));
    dots.forEach((item,i)=>item.setAttribute("aria-pressed",String(i===page)));
  }
  function persist(){
    try{if(preference===null)storage?.removeItem(LIVE_BAND_STORAGE_KEY);
      else storage?.setItem(LIVE_BAND_STORAGE_KEY,String(preference));}catch{}
  }
  function refresh(){
    if(disposed)return freeze({mounted:false,reason:"DISPOSED"});
    const model=preview.model,card=preview.getCurrentCard();
    const mode=preview.getPresentationMode?.()??model?.presentationMode;
    let result;
    if(model===lastModel&&lastCrosswalk&&String(mode).toUpperCase()==="LIVE"&&card?.sectionId){
      const ref=lastCrosswalk.status==="EXACT_NATIVE_65_CROSSWALK"
        ?lastCrosswalk.mappings.find(x=>x.nativeCardId===card.sectionId):null;
      result=freeze({ok:Boolean(ref),reason:ref?null:"NATIVE_CARD_OUTSIDE_SOURCE_CROSSWALK",
        crosswalk:lastCrosswalk,reference:ref});
    }else{
      result=liveBandSourceGate({model,currentCard:card,mode});
      lastModel=model;lastCrosswalk=result.crosswalk;
    }
    band.hidden=!result.ok;
    shell.classList.toggle("ao-live-band-enabled",result.ok);
    shell.dataset.aoLiveBandGate=result.reason??"EXACT_NATIVE_65_CROSSWALK";
    if(!result.ok)return freeze({mounted:true,visible:false,reason:result.reason});
    const ref=result.reference,sequence=Number(ref.nativeSequence);
    if(lastId!==ref.nativeCardId){
      if(ticks.childElementCount!==model.cards.length){
        ticks.replaceChildren(...model.cards.map(()=>{const el=doc.createElement("span");
          el.className="ao-lb-tick";el.setAttribute("aria-hidden","true");return el;}));
      }
      [...ticks.children].forEach((el,i)=>el.dataset.current=String(i+1===sequence));
      progress.style.strokeDasharray=String(circumference*sequence/model.cards.length)+" "+circumference;
      hand.style.transform="rotate("+(360*sequence/model.cards.length)+"deg)";
      lastId=ref.nativeCardId;
    }
    const height=liveBandHeightForReference(ref.referenceId,preference);
    shell.style.setProperty("--ao-live-band-height",height+"px");
    band.dataset.collapsed=String(height===96);band.dataset.height=String(height);
    band.dataset.heightMode=preference===null?"ADAPTIVE":"MANUAL";
    band.dataset.referenceId=ref.referenceId;band.dataset.nativeCardId=ref.nativeCardId;
    return freeze({mounted:true,visible:true,referenceId:ref.referenceId,height,page});
  }
  function setManualHeight(value){preference=snapLiveBandHeight(value);persist();return refresh();}
  function adaptive(){preference=null;persist();return refresh();}
  dots.forEach(dot=>dot.addEventListener("click",()=>setPage(dot.dataset.lbPage)));
  const viewport=band.querySelector("[data-lb-swipe]");
  viewport.addEventListener("touchstart",event=>{
    const p=event.touches?.[0];swipe=p?{x:p.clientX,y:p.clientY}:null;
  },{passive:true});
  viewport.addEventListener("touchend",event=>{
    if(!swipe)return;
    const p=event.changedTouches?.[0],start=swipe;swipe=null;if(!p)return;
    const dx=p.clientX-start.x,dy=p.clientY-start.y;
    if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.25)setPage(page+(dx<0?1:-1));
  },{passive:true});
  const handle=band.querySelector("[data-lb-handle]");
  handle.addEventListener("pointerdown",event=>{
    if(event.button!==0)return;
    drag={y:event.clientY,height:Number(band.dataset.height)||230};
    handle.setPointerCapture?.(event.pointerId);event.preventDefault();
  });
  handle.addEventListener("pointermove",event=>{
    if(!drag)return;
    const value=bound(drag.height+drag.y-event.clientY,96,460);
    shell.style.setProperty("--ao-live-band-height",value+"px");
    band.dataset.height=String(value);band.dataset.collapsed=String(value<=96);
  });
  handle.addEventListener("pointerup",event=>{
    if(!drag)return;
    const value=bound(drag.height+drag.y-event.clientY,96,460);drag=null;
    const now=Date.now();
    if(now-lastTap<340){lastTap=0;adaptive();return;}
    lastTap=now;setManualHeight(value);
  });
  handle.addEventListener("pointercancel",()=>{drag=null;refresh();});
  handle.addEventListener("dblclick",adaptive);
  const Observer=win?.MutationObserver;
  const observer=typeof Observer==="function"?new Observer(refresh):null;
  for(const selector of ['[data-role="card-title"]','[data-role="progress"]']){
    const target=shell.querySelector(selector);
    if(target)observer?.observe(target,{childList:true,characterData:true,subtree:true});
  }
  observer?.observe(preview.root,{attributes:true,
    attributeFilter:["data-r17-presentation-mode","data-r17-native-cue"]});
  setPage(0);refresh();
  return freeze({mounted:true,refresh,setPage,setManualHeight,adaptive,
    getState:()=>freeze({visible:!band.hidden,page,preference,
      nativeCardId:band.dataset.nativeCardId??null,reason:shell.dataset.aoLiveBandGate}),
    dispose(){if(disposed)return;disposed=true;observer?.disconnect();
      shell.classList.remove("ao-live-band-enabled");delete shell.dataset.aoLiveBandGate;
      shell.style.removeProperty("--ao-live-band-height");band.remove();style.remove();}
  });
}
