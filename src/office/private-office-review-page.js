/**
 * DOM-only presentation of a private research reader.
 * No innerHTML from source, no printed-edition or public Hour claim.
 * This is used solely by previews/private-divine-office.html.
 */
import {assemblePrivateOfficeReview} from "./private-office-review.js";
const TITLES={la:"Latine",en:"English",fr:"Français"};
const KIND={
 OPENING:"Opening",PSALM:"Psalm",PSALM_PORTION:"Psalm",ANTIPHON:"Antiphon",
 HYMN:"Hymn",CHAPTER:"Chapter",SHORT_RESPONSORY:"Short responsory",
 MAGNIFICAT:"Magnificat",CANTICLE:"Canticle",COLLECT:"Collect",
 MARIAN_ANTIPHON:"Marian antiphon",MARIAN_COLLECT:"Marian collect",
 CONCLUSION:"Conclusion",DOXOLOGY:"Gloria Patri",GLORIA:"Gloria Patri",
 VERSICLE:"Versicle",DISMISSAL:"Dismissal",RESEARCH_CALENDAR_NOTICE:"Source note"
};
const el=(d,t,c)=>{let n=d.createElement(t);if(c)n.className=c;return n;};
function txt(d,tag,value,klass){const n=el(d,tag,klass);n.textContent=value;return n;}
function renderFrame(d,host,frame,position,total,mode){
 host.replaceChildren();
 const top=el(d,"div","aoOfFrameTop");
 top.append(txt(d,"span",(KIND[frame.kind]||frame.kind.replaceAll("_"," ").toLowerCase())+
  (frame.label?" · "+frame.label:""),"aoOfEvent"));
 top.append(txt(d,"small",(position+1)+" / "+total,"aoOfOrdinal"));
 host.append(top);
 const langs=mode==="la"?["la"]:mode==="lafr"?["la","fr"]:["la","en"];
 const columns=el(d,"div","aoOfColumns");
 for(const lang of langs){
  const col=el(d,"section","aoOfLanguage");
  col.setAttribute("lang",lang);
  col.append(txt(d,"h3",TITLES[lang]));
  for(const line of frame.texts[lang]||[])
   col.append(txt(d,"p",line,"aoOfSourceLine"));
  columns.append(col);
 }
 host.append(columns);
 host.append(txt(d,"small",frame.sourceId||"Editorial research note · no original text witness","aoOfProvenance"));
}
export function mountPrivateOfficeReview(root,{win=globalThis,fetchSource=win.fetch?.bind(win),
 readUniversalWitness=null,initialHour="COMPLINE",initialDate="2026-11-28"}={}){
 if(!root||typeof fetchSource!=="function")throw Error("OFFICE_PRIVATE_PREVIEW_ROOT_REQUIRED");
 const d=root.ownerDocument;
 const chooser=el(d,"div","aoOfOptions");
 const hours=el(d,"select");
 for(const [value,title] of [["COMPLINE","Compline · 28 Nov–5 Dec"],["VESPERS","First Vespers · 28 Nov"]]){
  let o=el(d,"option");o.value=value;o.textContent=title;hours.append(o);
 }
 hours.value=initialHour==="VESPERS"?"VESPERS":"COMPLINE";
 const date=el(d,"input");date.type="date";
 date.value=/^2026-(?:11-(?:28|29|30)|12-0[1-5])$/.test(initialDate)?
  initialDate:"2026-11-28";
 date.min="2026-11-28";date.max="2026-12-05";
 if(hours.value==="VESPERS")date.value="2026-11-28";
 const mode=el(d,"select");
 for(const [value,title] of [["laen","Latin / English"],["lafr","Latin / Français"],["la","Latin only"]]){
  let o=el(d,"option");o.value=value;o.textContent=title;mode.append(o);
 }
 const load=txt(d,"button","Read source preview");load.type="button";
 chooser.append(hours,date,mode,load);root.append(chooser);
 const state=txt(d,"p","Select a date and Hour to load pinned source text.","aoOfReadiness");
 state.setAttribute("aria-live","polite");root.append(state);
 const section=el(d,"article","aoOfFrame");
 root.append(section);
 const controls=el(d,"nav","aoOfFrameControls");
 const previous=txt(d,"button","Previous");previous.type="button";
 const next=txt(d,"button","Next");next.type="button";
 const progress=el(d,"span");controls.append(previous,progress,next);
 root.append(controls);
 const meta=txt(d,"p","Private review · Sources are not approved for public reading.","aoOfFootnote");
 root.append(meta);
 let active=null,index=0,serial=0;
 function show(){
  if(!active)return;
  const frames=active.frames;index=Math.max(0,Math.min(index,frames.length-1));
  renderFrame(d,section,frames[index],index,frames.length,mode.value);
  previous.disabled=index===0;next.disabled=index===frames.length-1;
  progress.textContent="Reading step "+(index+1)+" of "+frames.length;
 }
 function invalidate(){
  serial++;active=null;section.replaceChildren();previous.disabled=next.disabled=true;
  load.disabled=false;
 }
 async function loadPreview(){
  invalidate();let token=serial;load.disabled=true;
  state.textContent="Reading exact pinned source sections…";
  try{
   const universalWitness=hours.value==="VESPERS"
    ?await readUniversalWitness?.():null;
   const result=await assemblePrivateOfficeReview({
    hour:hours.value,date:date.value,fetchSource,universalWitness,
    languageMode:hours.value==="COMPLINE"&&mode.value==="la"?"latin":"trilingual"
   });
   if(token!==serial)return;
   if(result.status!=="PRIVATE_SOURCE_TEXT_REVIEW"){
    state.textContent="Source preview withheld: "+result.reason;
    return;
   }
   active=result;index=0;
   state.textContent=result.hour+" · civil "+result.civilDate+
    " · Office "+result.officeDate+" · "+result.eventCount+
    " source events · trilingual preview · NOT certified for public prayer";
   show();
  }catch(err){if(token===serial)state.textContent="Source unavailable: "+String(err?.message??err)}
  finally{if(token===serial)load.disabled=false}
 }
 load.addEventListener("click",loadPreview);
 hours.addEventListener("change",()=>{invalidate();
  if(hours.value==="VESPERS")date.value="2026-11-28";
  state.textContent="Load the selected private source preview";
 });
 date.addEventListener("change",()=>{invalidate();state.textContent="Load the selected private source preview"});
 mode.addEventListener("change",()=>{
  if(active?.hour==="COMPLINE"&&active.availableLanguages?.length===1&&mode.value!=="la"){
   // A Latin source session never silently inherits a cached English/French
   // witness. Reload the separately sourced three-language review explicitly.
   void loadPreview();
  }else if(active)show();
 });
 previous.addEventListener("click",()=>{if(active){index--;show()}});
 next.addEventListener("click",()=>{if(active){index++;show()}});
 invalidate();
 return Object.freeze({load:loadPreview,current:()=>active,dispose:()=>{serial++;root.replaceChildren()}});
}
