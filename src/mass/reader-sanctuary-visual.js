import {isExplicitRequiemMass} from "./reader-requiem-conditions.js";
import {SEDILIA_REVERENCE_EVENTS} from "./reader-sedilia-reverence.js";
// Source-linked visual receiver for the owner-supplied 65-scene sanctuary.
// NO new Mass timer, rubric owner, priest observation, chant selection, or
// reconstruction of the original 3D artwork is introduced here.
export const SANCTUARY_PROTOCOL="AO_SANCTUARY_CUE_V1";
const FORMS=new Set(["LOW","MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);
const NOOP=Object.freeze({active:false,project:()=>false,destroy:()=>{}});
const ASPERGES_STAGE_RECORDS=Object.freeze({
 "ASP-R01":["ASP-010"],"ASP-R02":["ASP-020","ASP-030"],
 "ASP-R03":["ASP-040"],"ASP-R04":["ASP-050"],"ASP-R05":["ASP-060"]
});
const SAME=(a,b)=>Array.isArray(a)&&a.length===b.length&&
 a.every((value,i)=>value===b[i]);
// The native R20 rite owns all five stage IDs and source records. This is
// only a stage-specific illustration; ASP-030 (chant) is not a physical
// priest-motion clock, and ASP-040 is a personal observed response, not a
// license to start an inferred nave procession.
export function sanctuaryAspergesProjection({aspergesState,form,mode="LIVE"}={}){
 if(String(mode).toUpperCase()!=="LIVE"||
    !["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"].includes(form)||
    aspergesState?.schema!=="ao-r20-asperges-reader-state-v1"||
    aspergesState?.supported!==true)return null;
 const id=String(aspergesState.card?.id??"");
 const ids=ASPERGES_STAGE_RECORDS[id];
 if(!ids||!SAME(aspergesState.card?.sourceRecordIds,ids)||
   !["ORDINARY","PASCHAL"].includes(aspergesState.formulaState?.formula))
   return null;
 const sprinkled=id==="ASP-R03"&&
   aspergesState.personalTriggerActive===true&&
   aspergesState.faithfulGesture==="MAKE_FULL_SIGN_OF_CROSS";
 return Object.freeze({
  type:SANCTUARY_PROTOCOL,version:1,form,
  sourceRiteId:"ASPERGES",riteStageId:id,
  sourceRecordIds:Object.freeze([...ids]),
  // Only the existing explicit R20 user observation can produce droplets.
  // NEVER infer it from the Schola's Asperges/Vidi aquam chant.
  observedSprinkled:sprinkled,
  scholaOnly:false,
 });
}

export function sanctuaryCueProjection({card,state,aspergesState=null,prepared=null,form,mode="LIVE"}={}){
 if(aspergesState)return sanctuaryAspergesProjection({aspergesState,form,mode});
 if(String(mode).toUpperCase()!=="LIVE"||!FORMS.has(form)||
     !card?.sectionId||!String(card.title??"").trim()||
     card.stateOnly===true)return null;
 const candidate=String(state?.nativeCueId??"");
 const sourceCueId=/^AO\.SM\.C\d{4}$/.test(candidate)?candidate:null;
 const sourceSectionId=String(card.sourceSectionId??card.sectionId);
 // The canonical MC event graph has distinct physical states for faithful
 // Communion: MC-COM-300 distribution begins, -310 continues, and -320
 // priest returns (all tier A, source moment E64). This is NEVER inferred
 // from C0246 text, the separate Schola MC-COM-305 or card scrolling.
 // The current reader projects event IDs only from objective runtime
 // ownership; unavailable events remain null rather than synthesized.
 const observed=state?.observedCommunionReturn;
 const verifiedObservedReturn=sourceSectionId==="AO.CARD.025"&&
   ["LOW","SOLEMN"].includes(form)&&
   card.sectionId==="AO.LIVECURATED.AO.CARD.025.1"&&
   observed?.eventId==="MC-COM-320"&&
   observed?.nativeCardId===card.sectionId&&
   observed?.sourceSectionId===sourceSectionId&&
   observed?.actor==="PRIEST"&&observed?.observed===true&&
   observed?.action==="RETURN_TO_ALTAR"&&
   observed?.owner==="EXPLICIT_PRIEST_COMMUNION_OBSERVATION";
 // The explicit cancellation overrides a possibly stale legacy pointer.
 // It is not a source event and must never be routed as a Schola action.
 const communionReturnCancelled=sourceSectionId==="AO.CARD.025"&&
   ["LOW","SOLEMN"].includes(form)&&state?.communionReturnCancelled===true;
 const eventId=verifiedObservedReturn?"MC-COM-320":
   String(state?.nativeEventId??"");
 const communionEventId=!communionReturnCancelled&&
   sourceSectionId==="AO.CARD.025"&&
   ["LOW","SOLEMN"].includes(form)&&
   ["MC-COM-300","MC-COM-310","MC-COM-320"].includes(eventId)
   ?eventId:null;
 const sed=state?.observedSediliaReverence;
 const spec=SEDILIA_REVERENCE_EVENTS[sed?.eventId];
 const verifiedSed=Boolean(spec&&sed?.observed===true&&
   sed?.owner==="EXPLICIT_SEDILIA_GESTURE_OBSERVATION"&&
   sed.nativeCardId===card.sectionId&&
   sed.sourceSectionId===sourceSectionId&&spec.section===sourceSectionId&&
   spec.card===card.title&&["BEGIN","END"].includes(sed.phase)&&
   (!prepared||!isExplicitRequiemMass(prepared)));
 return Object.freeze({
  type:SANCTUARY_PROTOCOL,version:1,form,
  seatedReverenceObservation:verifiedSed?sed:null,
  incarnatusKneelException:state?.incarnatusKneelException===true,
  sediliaReverenceCancelled:state?.sediliaReverenceCancelled===true,
  sourceSectionId,
  cardTitle:String(card.title).trim(),
  sourceCueId,certifiedSourceFocus:Boolean(sourceCueId),
  canonicalCommunionEventId:communionEventId,
  communionReturnCancelled,
  // Solemn Requiem has specific ceremonial omissions at Gospel/Offertory.
  // The established resolved-Mass predicate, never a date/title guess, owns this.
  requiem:prepared?isExplicitRequiemMass(prepared):false,
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
 display:block;width:100%;height:100%;border:0;pointer-events:auto;background:#090b10
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
 /* A short landscape viewport cannot stack a 110px stage over both
    ribbon rows and still leave a readable canonical Mass prayer pane.
    Use a side-by-side stage, preserving the original animated artwork. */
 .ao-reader-shell.ao-sanctuary-preview{
  --ao-sanctuary-width:clamp(160px,34vw,340px);
  grid-template-columns:var(--ao-sanctuary-width) minmax(0,1fr);
  grid-template-rows:auto auto minmax(0,1fr)
 }
 .ao-sanctuary-preview > .ao-reader-top-ribbon,
 .ao-sanctuary-preview > .ao-state-ribbon{grid-column:1/-1}
 .ao-sanctuary-preview .ao-sanctuary-window{
  grid-column:1;grid-row:3;min-width:0;height:100%
 }
 .ao-sanctuary-preview .ao-reader-stage{
  grid-column:2;grid-row:3;min-width:0;min-height:0
 }
 /* The native curated LIVE scroller normally has a viewport-based
    dock avoidance height (100dvh - reserve - 168px). In this compact
    side-by-side row the header is already outside our content height,
    so applying the 168px deduction again leaves just 90px of prayer
    even though the actual reader stage has 270px available.
    Retain the canonical Schola reserve in the existing card viewport;
    let the scroll child fill the remaining content box, not the whole
    window. Other LIVE, MISSAL, portrait and special-rite layouts retain
    their original dock geometry and rubrical scroll owners. */
 #ao-r17-native-reader-preview[data-r17-curated-review="true"]
   .ao-reader-shell.ao-sanctuary-preview[data-schola-visible="true"]
   .ao-prayer-card{
    height:100%!important
 }
 .ao-sanctuary-preview .ao-sanctuary-resize{
  /* The floating Schola dock occupies the lower half of this stage.
     A full-height divider's midpoint receives its pointer events instead.
     Leave the draggable tab at the unobstructed top, without raising the
     entire sanctuary above the Schola or intercepting its controls. */
  left:auto;right:0;top:0;bottom:auto;width:16px;height:82px;
  max-height:36%;cursor:ew-resize
 }
 .ao-sanctuary-preview .ao-sanctuary-resize:before{
  width:3px;height:38px
 }
}`;
export function createReaderSanctuaryPreview({root,win=root?.ownerDocument?.defaultView,
 src=new URL("../../assets/mass/live-sanctuary/index.html?aoSanctuary=1",import.meta.url).href,enabled=false}={}){
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
 const clear=()=>send({type:"AO_SANCTUARY_CLEAR_V1",version:1});
 const receive=e=>{
  if(destroyed||e.origin!==win.location.origin||e.source!==frame.contentWindow)return;
  if(e.data?.type==="AO_SANCTUARY_READY_V1"&&e.data?.version===1&&
     e.data?.originalCards===65){ready=true;send(pending)}
 };
 win.addEventListener("message",receive);
 const compactLandscape=()=>win.matchMedia?.(
  "(orientation: landscape) and (max-height: 540px)")?.matches===true;
 const syncGripOrientation=()=>grip.setAttribute("aria-orientation",
  compactLandscape()?"vertical":"horizontal");
 syncGripOrientation();
 win.addEventListener?.("resize",syncGripOrientation);
 const height=()=>Math.max(80,Math.min(win.innerHeight*.65,
   parseFloat(win.getComputedStyle(region).height)||230));
 const width=()=>Math.max(120,region.getBoundingClientRect?.().width||210);
 const setHeight=h=>shell.style.setProperty("--ao-sanctuary-height",
  Math.max(80,Math.min(Math.round(win.innerHeight*.65),Math.round(h)))+"px");
 const setWidth=w=>shell.style.setProperty("--ao-sanctuary-width",
  Math.max(150,Math.min(Math.round(win.innerWidth*.58),Math.round(w)))+"px");
 const down=e=>{drag={x:e.clientX,y:e.clientY,w:width(),h:height(),
   landscape:compactLandscape()};grip.setPointerCapture?.(e.pointerId);
  e.preventDefault?.()};
 const move=e=>{if(drag){
  if(drag.landscape)setWidth(drag.w+e.clientX-drag.x);
  else setHeight(drag.h+e.clientY-drag.y)
 }};
 const up=()=>{drag=null};
 const key=e=>{
  if(compactLandscape()){
   if(e.key==="ArrowLeft"||e.key==="ArrowRight"){
    e.preventDefault();setWidth(width()+(e.key==="ArrowRight"?24:-24))
   }
  }else if(e.key==="ArrowUp"||e.key==="ArrowDown"){
   e.preventDefault();setHeight(height()+(e.key==="ArrowDown"?24:-24))
  }
 };
 grip.addEventListener("pointerdown",down);
 grip.addEventListener("pointermove",move);
 grip.addEventListener("pointerup",up);
 grip.addEventListener("pointercancel",up);
 grip.addEventListener("keydown",key);
 const project=input=>{
  if(destroyed)return false;
  const p=sanctuaryCueProjection(input);
  if(!p){
    // A LIVE→MISSAL switch, omitted source-only card or unsupported rite
    // cannot leave a stale visual action covering the canonical reader.
    clear();
    region.hidden=true;shell.classList.remove("ao-sanctuary-preview");
    pending=null;previous=null;
    return false;
  }
  region.hidden=false;shell.classList.add("ao-sanctuary-preview");
  const k=JSON.stringify(p);
  if(k===previous)return true;
  previous=k;pending=p;send(p);return true;
 };
 const destroy=()=>{
  if(destroyed)return;clear();destroyed=true;
  win.removeEventListener("message",receive);
  win.removeEventListener?.("resize",syncGripOrientation);
  grip.removeEventListener("pointerdown",down);
  grip.removeEventListener("pointermove",move);
  grip.removeEventListener("pointerup",up);
  grip.removeEventListener("pointercancel",up);
  grip.removeEventListener("keydown",key);
  region.remove();css.remove();shell.classList.remove("ao-sanctuary-preview");
  shell.style.removeProperty("--ao-sanctuary-height");
  shell.style.removeProperty("--ao-sanctuary-width");
 };
 return Object.freeze({active:true,project,destroy,
  inspect:()=>Object.freeze({ready,destroyed,pending:pending?.cardTitle??null})});
}
