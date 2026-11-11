// Source-linked visual receiver for the owner-supplied 65-scene sanctuary.
// NO new Mass timer, rubric owner, priest observation, chant selection, or
// reconstruction of the original 3D artwork is introduced here.
export const SANCTUARY_PROTOCOL="AO_SANCTUARY_CUE_V1";
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const NOOP=Object.freeze({active:false,project:()=>false,destroy:()=>{}});
export function sanctuaryCueProjection({card,state,form,mode="LIVE"}={}){
 if(String(mode).toUpperCase()!=="LIVE"||!FORMS.has(form)||
    !card?.sectionId||!String(card.title??"").trim()||
    card.stateOnly===true)return null;
 const candidate=String(state?.nativeCueId??"");
 const sourceCueId=/^AO\.SM\.C\d{4}$/.test(candidate)?candidate:null;
 return Object.freeze({
  type:SANCTUARY_PROTOCOL,version:1,form,
  sourceSectionId:String(card.sourceSectionId??card.sectionId),
  cardTitle:String(card.title).trim(),
  sourceCueId,certifiedSourceFocus:Boolean(sourceCueId),
  scholaOnly:false,
 });
}
const CSS=String.raw`
.ao-reader-shell.ao-sanctuary-preview{
 --ao-sanctuary-height:clamp(130px,29vh,330px);
 grid-template-rows:auto auto var(--ao-sanctuary-height) minmax(0,1fr)
}
.ao-sanctuary-preview .ao-sanctuary-window{
 position:relative;min-height:0;height:100%;overflow:hidden;z-index:4;background:#0b0d12
}
.ao-sanctuary-preview .ao-sanctuary-window iframe{
 display:block;width:100%;height:100%;border:0;pointer-events:none;background:#090b10
}
.ao-sanctuary-preview .ao-sanctuary-resize{
 position:absolute;bottom:0;left:0;right:0;height:16px;touch-action:none;
 cursor:ns-resize;z-index:1;display:grid;place-items:center
}
.ao-sanctuary-preview .ao-sanctuary-resize:before{
 content:"";width:38px;height:3px;border-radius:9px;
 background:rgba(230,218,182,.55);box-shadow:0 0 7px #0009
}
.ao-sanctuary-preview .ao-reader-stage{grid-row:4;min-height:0}
.ao-sanctuary-preview .ao-prayer-card{height:100%;min-height:0}
@media(orientation:landscape) and (max-height:540px){
 .ao-reader-shell.ao-sanctuary-preview{--ao-sanctuary-height:110px}
}`;
export function createReaderSanctuaryPreview({root,win=root?.ownerDocument?.defaultView,
 src="./assets/mass/live-sanctuary/index.html?aoSanctuary=1",enabled=false}={}){
 if(!enabled||!root?.querySelector||!win?.location)return NOOP;
 const shell=root.querySelector(".ao-reader-shell");
 const stage=shell?.querySelector(".ao-reader-stage");
 if(!stage)return NOOP;
 const url=new URL(src,win.location.href);
 if(url.origin!==win.location.origin ||
    !url.pathname.endsWith("/assets/mass/live-sanctuary/index.html"))return NOOP;
 const doc=root.ownerDocument;
 const css=doc.createElement("style");css.textContent=CSS;doc.head.append(css);
 const region=doc.createElement("section");region.className="ao-sanctuary-window";
 region.setAttribute("aria-label","Source-linked animated sanctuary visualisation");
 const frame=doc.createElement("iframe");frame.src=url.href;
 frame.title="Animated sanctuary illustration of the selected Mass cue";
 frame.setAttribute("sandbox","allow-scripts allow-same-origin");
 frame.setAttribute("referrerpolicy","same-origin");
 const grip=doc.createElement("div");grip.className="ao-sanctuary-resize";
 grip.tabIndex=0;grip.setAttribute("role","separator");
 grip.setAttribute("aria-label","Resize the animated sanctuary");
 grip.setAttribute("aria-orientation","horizontal");
 region.append(frame,grip);shell.insertBefore(region,stage);
 shell.classList.add("ao-sanctuary-preview");
 let ready=false,destroyed=false,pending=null,previous=null,drag=null;
 const send=p=>{if(!ready||!frame.contentWindow||!p)return false;
  frame.contentWindow.postMessage(p,win.location.origin);return true};
 const receive=e=>{
  if(destroyed||e.origin!==win.location.origin||e.source!==frame.contentWindow)return;
  if(e.data?.type==="AO_SANCTUARY_READY_V1"&&e.data?.version===1&&
     e.data?.originalCards===65){ready=true;send(pending)}
 };
 win.addEventListener("message",receive);
 const height=()=>Math.max(80,Math.min(win.innerHeight*.65,
   parseFloat(win.getComputedStyle(region).height)||230));
 const setHeight=h=>shell.style.setProperty("--ao-sanctuary-height",
  Math.max(80,Math.min(Math.round(win.innerHeight*.65),Math.round(h)))+"px");
 const down=e=>{drag={y:e.clientY,h:height()};grip.setPointerCapture?.(e.pointerId);
  e.preventDefault?.()};
 const move=e=>{if(drag)setHeight(drag.h+e.clientY-drag.y)};
 const up=()=>{drag=null};
 const key=e=>{if(e.key==="ArrowUp"||e.key==="ArrowDown"){
  e.preventDefault();setHeight(height()+(e.key==="ArrowDown"?24:-24))}};
 grip.addEventListener("pointerdown",down);
 grip.addEventListener("pointermove",move);
 grip.addEventListener("pointerup",up);
 grip.addEventListener("pointercancel",up);
 grip.addEventListener("keydown",key);
 const project=input=>{
  if(destroyed)return false;
  const p=sanctuaryCueProjection(input);
  if(!p)return false;
  const k=JSON.stringify(p);
  if(k===previous)return true;
  previous=k;pending=p;send(p);return true;
 };
 const destroy=()=>{
  if(destroyed)return;destroyed=true;
  win.removeEventListener("message",receive);
  grip.removeEventListener("pointerdown",down);
  grip.removeEventListener("pointermove",move);
  grip.removeEventListener("pointerup",up);
  grip.removeEventListener("pointercancel",up);
  grip.removeEventListener("keydown",key);
  region.remove();css.remove();shell.classList.remove("ao-sanctuary-preview");
  shell.style.removeProperty("--ao-sanctuary-height");
 };
 return Object.freeze({active:true,project,destroy,
  inspect:()=>Object.freeze({ready,destroyed,pending:pending?.cardTitle??null})});
}
