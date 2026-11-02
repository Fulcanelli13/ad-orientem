import {createOfflineChantEngraver} from "./reader-chant-engraver.js";
import {APPROVED_MASS_INLINE_GABC} from "./reader-inline-chant-approved.js";
import {selectApprovedInlineScore} from "./reader-inline-chant-selector.js";
export {selectApprovedInlineScore, INLINE_CHANT_SCHEMA} from "./reader-inline-chant-selector.js";

// A + C: night-ink, inline-staff LIVE; traditional red margin marker.
// Never insert a score as a Schola dock track or a new prayer card.
// Score eligibility now lives in the universal source/setting matcher.
const cleanText=text=>String(text??"").normalize("NFD")
 .replace(/[\\u0300-\\u036f]/g,"").replace(/[℣℟]/g,"")
 .toLowerCase().replace(/[^a-z]+/g," ").trim();
const SUNG=new Set(["MISSA_CANTATA_SIMPLE","MISSA_CANTATA_INCENSE","SOLEMN"]);

// No parallel floating panel, cream paper, redundant title, or in-card
// navigation. The letter is *beside* the full-width score, not inside it.
export const INLINE_CHANT_CSS=String.raw`
/* Preserve the existing LIVE side-rail clearance at every viewport width.
   Full width means the full SAFE prayer column, never beneath gesture rails. */
.ao-reader-paragraph[data-inline-chant-status="ready"]{
  position:relative;display:grid;grid-template-columns:24px minmax(0,1fr);
  column-gap:6px;row-gap:3px;margin:9px 0 18px;
  padding:10px 0 13px;border-radius:0;border-top:1px solid rgba(206,190,220,.11);
  opacity:.73
}
.ao-reader-paragraph[data-inline-chant-status="ready"][data-active="true"]{opacity:1}
.ao-reader-paragraph[data-inline-chant-status="ready"][data-active="true"]::before{
  content:"";position:absolute;left:-7px;top:12px;bottom:13px;width:2px;
  background:var(--ao-mass-accent);border-radius:2px
}
.ao-reader-paragraph[data-inline-chant-status="ready"]>.ao-line-primary{
  grid-column:2;font-size:clamp(1.35rem,3vw,1.8rem)
}
.ao-reader-paragraph[data-inline-chant-status="ready"][data-inline-chant-view="notation"]>.ao-line-primary,
.ao-reader-paragraph[data-inline-chant-status="ready"][data-inline-chant-view="notation"]>.ao-line-secondary{
 display:none!important
}
.ao-reader-paragraph[data-inline-chant-status="ready"]>.ao-line-secondary{
  grid-column:2;display:block;font:italic 400 clamp(.9rem,2.3vw,1.04rem)/1.45
   var(--ao-font-liturgical,Georgia,serif);color:var(--ao-muted)
}
.ao-inline-chant-translation{display:none;grid-column:2;grid-row:2;
 font:italic 400 clamp(.9rem,2.3vw,1.04rem)/1.45 var(--ao-font-liturgical,Georgia,serif);
 color:var(--ao-muted)}
.ao-reader-paragraph[data-inline-chant-view="notation"]>.ao-inline-chant-translation{display:block}
.ao-inline-chant-mark{grid-column:1;grid-row:1;
 color:#d58a80;font:500 23px/1.5 var(--ao-font-liturgical,Georgia,serif)}
.ao-inline-chant-main{grid-column:2;grid-row:1;display:block;min-width:0}
.ao-inline-chant-score{display:block;width:100%;min-width:0;min-height:54px;
 color:var(--ao-text,#eee4d8);cursor:zoom-in}
.ao-inline-chant-score svg{display:block;max-width:100%;height:auto;color:inherit}
.ao-inline-chant-score svg :is(path,polygon,polyline,line,text){
  fill:currentColor
}
.ao-inline-chant-control{display:flex;gap:12px;justify-content:flex-end;margin-top:2px}
.ao-inline-chant-control button{border:0;background:none;padding:4px 5px;color:var(--ao-muted);
 font:600 11px/1.4 var(--ao-font-ui,system-ui,sans-serif);cursor:pointer}
.ao-inline-chant-control button:focus-visible{outline:2px solid var(--ao-mass-accent)}
.ao-reader-paragraph[data-inline-chant-view="text"] .ao-inline-chant-score{display:none}
.ao-reader-paragraph[data-inline-chant-view="text"]>.ao-line-primary{grid-row:1}
.ao-reader-paragraph[data-inline-chant-view="text"] .ao-inline-chant-main{grid-row:2}
.ao-reader-paragraph[data-inline-chant-view="text"]>.ao-line-secondary{grid-row:3}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-inline-chant-status="ready"]{
 display:grid;grid-template-columns:24px minmax(0,1fr);column-gap:6px;
 border-top:1px solid rgba(165,61,42,.24);
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-inline-chant-status="ready"]>.ao-line-primary,
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-inline-chant-status="ready"]>.ao-line-secondary{
 grid-column:2!important;grid-row:auto!important
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-inline-chant-view="notation"]>.ao-line-primary,
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-inline-chant-view="notation"]>.ao-line-secondary{
 display:none!important
}
.ao-reader-shell[data-mode="MISSAL"] .ao-reader-paragraph[data-inline-chant-view="notation"]>.ao-inline-chant-translation{
 display:block;grid-column:2;grid-row:2
}
.ao-reader-shell[data-mode="MISSAL"] .ao-inline-chant-mark{color:#a3271b}
.ao-reader-shell[data-mode="MISSAL"] .ao-inline-chant-score{color:#33281c}
.ao-inline-score-zoom{border:0;width:min(96vw,1100px);max-width:none;max-height:94dvh;
 padding:0;background:#0c111a;color:#eee8dc;border-radius:12px}
.ao-inline-score-zoom::backdrop{background:rgba(0,0,0,.88)}
.ao-inline-score-zoom header{display:flex;align-items:center;justify-content:space-between;
 padding:12px 16px;border-bottom:1px solid #ffffff24;font:500 15px Georgia,serif}
.ao-inline-score-zoom button{border:0;background:transparent;color:inherit;
 min-width:44px;min-height:44px;font:22px Georgia,serif}
.ao-inline-score-zoom .ao-inline-score-scroll{max-height:73dvh;overflow:auto}
.ao-inline-score-zoom .ao-inline-score-wide{width:max(860px,100%);padding:15px;
 color:#eee8dc}
.ao-inline-score-zoom .ao-inline-score-wide svg :is(path,polygon,polyline,line,text){fill:currentColor}
.ao-inline-score-zoom .ao-inline-score-wide svg{height:auto}
@media(max-width:480px){
 /* Phone railway margins stay owned by reader-dom.js (56px on narrow screens). */
 .ao-reader-paragraph[data-inline-chant-status="ready"]{grid-template-columns:20px minmax(0,1fr);column-gap:3px}
 .ao-inline-chant-mark{font-size:20px}
 .ao-inline-chant-control button{min-height:40px}
 .ao-inline-score-zoom{width:100vw;height:100dvh;max-height:none;border-radius:0}
 .ao-inline-score-zoom .ao-inline-score-wide{width:max(760px,100%)}
}
@media(prefers-reduced-motion:reduce){
 .ao-reader-paragraph[data-inline-chant-status="ready"]{transition:none}
}`;

/**
 * DOM enhancement only. It changes neither the original Latin rows nor
 * canonical source cues / progress / gestures / Schola clock.
 * If Exsurge is unavailable or a score is unapproved, native text survives.
 */
export function createInlineChantController({
 root,approvedScores=APPROVED_MASS_INLINE_GABC,
 engraverFactory=createOfflineChantEngraver
}={}){
 if(!root?.querySelectorAll)throw new TypeError("Reader root required");
 const doc=root.ownerDocument??globalThis.document;
 let entries=[],generation=0,modal=null,modalEngraver=null,lastTrigger=null;
 const shell=()=>root.querySelector("[data-ao-reader-shell]");
 function closeZoom(){
  if(modal?.open)modal.close();
  modalEngraver?.destroy();modalEngraver=null;
  modal?.remove();modal=null;
  if(lastTrigger?.isConnected)lastTrigger.focus?.();
  lastTrigger=null;
 }
 function clear(){
  ++generation;
  for(const e of entries){
   e.engraver?.destroy();
   e.marker?.remove();e.wrapper?.remove();e.translationNode?.remove();
   if(e.node?.dataset){delete e.node.dataset.inlineChantStatus;delete e.node.dataset.inlineChantView;}
  }
  entries=[];closeZoom();
  const host=shell();if(host)host.dataset.inlineChant="false";
 }
 async function zoom(entry,trigger){
  closeZoom();lastTrigger=trigger;
  modal=doc.createElement("dialog");modal.className="ao-inline-score-zoom";
  const head=doc.createElement("header");
  const title=doc.createElement("span");title.textContent=entry.score.sourceLatin;
  const closer=doc.createElement("button");closer.type="button";closer.textContent="×";
  closer.setAttribute("aria-label","Close enlarged Gregorian notation");
  closer.addEventListener("click",closeZoom);
  head.append(title,closer);
  const wide=doc.createElement("div");wide.className="ao-inline-score-wide";
  wide.setAttribute("role","img");wide.setAttribute("aria-label",entry.score.sourceLatin);
  const scroll=doc.createElement("div");scroll.className="ao-inline-score-scroll";
  scroll.append(wide);modal.append(head,scroll);doc.body.append(modal);
  modal.addEventListener("cancel",e=>{e.preventDefault();closeZoom()});
  modal.addEventListener("click",e=>{if(e.target===modal)closeZoom()});
  modal.showModal?.();closer.focus();
  // Never substitute a raster enlargement. The same trusted GABC is
  // laid out again as a fresh full-size vector source.
  modalEngraver=engraverFactory({viewport:wide,document:doc});
  modalEngraver.observe?.();
  try{await modalEngraver.engrave(entry.score.gabc)}
  catch{closeZoom()}
 }
 function handleClick(event){
  const toggle=event.target?.closest?.("[data-inline-chant-toggle]");
  if(toggle){
   const row=toggle.closest(".ao-reader-paragraph");
   if(row?.dataset?.inlineChantStatus!=="ready")return true;
   const text=row.dataset.inlineChantView==="notation";
   row.dataset.inlineChantView=text?"text":"notation";
   toggle.textContent=text?"♫ Notation":"Aa Latin";
   toggle.setAttribute("aria-label",text?"Show Gregorian notation":"Show Latin text");
   return true;
  }
  const open=event.target?.closest?.("[data-inline-chant-open]");
  if(open){
   const match=entries.find(e=>e.button===open&&e.node?.isConnected);
   if(match){void zoom(match,open)}
   return true;
  }
  return false;
 }
 function render({mode="LIVE",form,settingId="",selectedSettings={},resolvedMass=null,paragraphs=[]}={}){
  clear();
  if(!SUNG.has(String(form??"").toUpperCase())||
     !["LIVE","MISSAL"].includes(mode))return 0;
  const unique=new Map(),byCue=new Map(),ambiguous=new Set();
  for(const p of paragraphs){
   if(p.id!=null){
    const id=String(p.id);
    if(unique.has(id))ambiguous.add(id);
    else unique.set(id,p);
   }
   const cues=Array.isArray(p.sourceCueIds)?p.sourceCueIds:[];
   if(cues.length){
    const id=String(cues[0]);
    if(byCue.has(id))ambiguous.add("CUE:"+id);
    else byCue.set(id,p);
   }
  }
  const g=generation;
  for(const node of root.querySelectorAll(".ao-reader-paragraph[data-paragraph-id],.ao-reader-paragraph[data-cue-id]")){
   const id=node.dataset.paragraphId;
   const cueId=node.dataset.cueId??null;
   if(id&&ambiguous.has(id)||cueId&&ambiguous.has("CUE:"+cueId))continue;
   const paragraph=(id&&unique.get(id))||(cueId&&byCue.get(cueId))||null;
   const score=selectApprovedInlineScore({
    cueId,paragraph,form,settingId,selectedSettings,resolvedMass,approvedScores
   });
   if(!score)continue;
   const primary=node.querySelector(".ao-line-primary");
   if(!primary)continue;
   const wrapper=doc.createElement("span");wrapper.className="ao-inline-chant-main";
   const staff=doc.createElement("span");staff.className="ao-inline-chant-score";
   staff.setAttribute("role","img");staff.setAttribute("aria-label",score.sourceLatin);
   const open=doc.createElement("button");open.type="button";
   open.dataset.inlineChantOpen="true";open.className="ao-inline-chant-score-button";
   open.style.cssText="display:block;width:100%;padding:0;border:0;background:none;color:inherit;text-align:left";
   open.setAttribute("aria-label","Enlarge Gregorian notation for "+score.sourceLatin);
   open.append(staff);
   const controls=doc.createElement("span");controls.className="ao-inline-chant-control";
   const switcher=doc.createElement("button");switcher.type="button";
   switcher.dataset.inlineChantToggle="true";switcher.textContent="Aa Latin";
   switcher.setAttribute("aria-label","Show Latin text");
   controls.append(switcher);wrapper.append(open,controls);
   const marker=doc.createElement("span");marker.className="ao-inline-chant-mark";
   marker.textContent=/^\s*℟/.test(score.sourceLatin)?"℟":
     /^\s*℣/.test(score.sourceLatin)?"℣":"♫";
   marker.setAttribute("aria-hidden","true");
   // Keep the actual original source Latin in primary. It remains
   // immediately accessible if SVG layout fails or Aa is selected.
   node.insertBefore(marker,primary);
   node.insertBefore(wrapper,primary.nextSibling);
   node.dataset.inlineChantStatus="loading";
   node.dataset.inlineChantView="text";
   const translationNode=doc.createElement("span");
   translationNode.className="ao-inline-chant-translation";
   // Show the actual vernacular even if a bilingual donor originally placed
   // Latin in the secondary column. Never repeat Latin as its translation.
   const same=cleanText(score.sourceLatin);
   translationNode.textContent=[paragraph.secondary,paragraph.alternate,paragraph.primary]
    .find(text=>typeof text==="string"&&text.trim()&&cleanText(text)!==same)??"";
   node.append(translationNode);
   const entry={node,score,button:open,wrapper,marker,translationNode,engraver:null};entries.push(entry);
   try{
    const engraver=engraverFactory({viewport:staff,document:doc});
    entry.engraver=engraver;engraver.observe?.();
    void engraver.engrave(score.gabc).then(ok=>{
     if(g!==generation||!node.isConnected)return;
     if(ok){
      node.dataset.inlineChantStatus="ready";
      node.dataset.inlineChantView="notation";
      const host=shell();if(host)host.dataset.inlineChant="true";
     }else{
      node.dataset.inlineChantStatus="failed";
      marker.remove();wrapper.remove();
     }
    }).catch(()=>{
      if(g===generation){node.dataset.inlineChantStatus="failed";marker.remove();wrapper.remove()}
    });
   }catch{
    node.dataset.inlineChantStatus="failed";marker.remove();wrapper.remove();
   }
  }
  return entries.length;
 }
 return Object.freeze({render,handleClick,clear,destroy:clear,
   state:()=>Object.freeze({mounted:entries.length,rendered:
     entries.filter(e=>e.node?.dataset?.inlineChantStatus==="ready").length})});
}
