/**
 * DOM-only presentation of a private research reader.
 * No innerHTML from source, no printed-edition or public Hour claim.
 * This is used solely by previews/private-divine-office.html.
 */
import {assemblePrivateOfficeReview,assembleChristmas2026PrivateOfficeResearchReview,
 assembleDec28Jan03PrivateOfficeResearchReview,
 assembleJan04_10PrivateOfficeResearchReview,
 assembleJan11_17PrivateOfficeResearchReview}
 from "./private-office-review.js";
import {COMPLINE_CONTEXT,COMPLINE_MINISTER,projectComplineRecitation}
 from "./compline-recitation-projection.js";
const TITLES={la:"Latine",en:"English",fr:"Français"};
const KIND={
 OPENING:"Opening",PSALM:"Psalm",PSALM_PORTION:"Psalm",ANTIPHON:"Antiphon",
 HYMN:"Hymn",CHAPTER:"Chapter",SHORT_RESPONSORY:"Short responsory",
 MAGNIFICAT:"Magnificat",CANTICLE:"Canticle",COLLECT:"Collect",
 MARIAN_ANTIPHON:"Marian antiphon",MARIAN_COLLECT:"Marian collect",
 CONCLUSION:"Conclusion",DOXOLOGY:"Gloria Patri",GLORIA:"Gloria Patri",
 VERSICLE:"Versicle",DISMISSAL:"Dismissal",EXAMINATION:"Examination of conscience",RESEARCH_CALENDAR_NOTICE:"Source note"
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
  if(frame.gestureRubrics?.[lang])
   col.append(txt(d,"small",frame.gestureRubrics[lang],"aoOfEditorialNote"));
  for(const line of frame.texts[lang]||[])
   col.append(txt(d,"p",line,"aoOfSourceLine"));
  columns.append(col);
 }
 host.append(columns);
 if(frame.editorialRubric)host.append(txt(d,"small","Editorial rubric · this is a pause, not a liturgical prayer text","aoOfEditorialNote"));
 host.append(txt(d,"small",frame.sourceId||"Editorial research note · no original text witness","aoOfProvenance"));
}
export function mountPrivateOfficeReview(root,{win=globalThis,fetchSource=win.fetch?.bind(win),
 readUniversalWitness=null,initialHour="COMPLINE",initialDate="2026-11-28"}={}){
 if(!root||typeof fetchSource!=="function")throw Error("OFFICE_PRIVATE_PREVIEW_ROOT_REQUIRED");
 const d=root.ownerDocument;
 const chooser=el(d,"div","aoOfOptions");
 const hours=el(d,"select");
 for(const [value,title] of [["COMPLINE","Compline · 28 Nov–17 Jan (private research)"],["VESPERS","First Vespers · 28 Nov"]]){
  let o=el(d,"option");o.value=value;o.textContent=title;hours.append(o);
 }
 hours.value=initialHour==="VESPERS"?"VESPERS":"COMPLINE";
 const date=el(d,"input");date.type="date";
 date.value=/^(?:2026-(?:11-(?:28|29|30)|12-(?:0[1-9]|[12][0-9]|3[01]))|2027-01-(?:0[1-9]|1[0-7]))$/.test(initialDate)?
  initialDate:"2026-11-28";
 date.min="2026-11-28";date.max="2027-01-17";
 if(hours.value==="VESPERS")date.value="2026-11-28";
 const mode=el(d,"select");
 for(const [value,title] of [["laen","Latin / English"],["lafr","Latin / Français"],["la","Latin only"]]){
  let o=el(d,"option");o.value=value;o.textContent=title;mode.append(o);
 }
 const recitation=el(d,"select");
 for(const [value,title] of [
  [COMPLINE_CONTEXT.FINAL_PRAYER,"Compline as final prayer of the day"],
  [COMPLINE_CONTEXT.OTHER_TIME,"Compline at another time"]
 ]){
  const option=el(d,"option");option.value=value;option.textContent=title;recitation.append(option);
 }
 recitation.value=COMPLINE_CONTEXT.FINAL_PRAYER;
 recitation.setAttribute("aria-label","Compline recitation context");
 const presider=el(d,"select");
 for(const [value,title] of [
  [COMPLINE_MINISTER.NON_PRIEST,"Solo or lay-led — Dómine exáudi"],
  [COMPLINE_MINISTER.PRIEST,"Priest presiding — Dóminus vobíscum"]
 ]){
  const option=el(d,"option");option.value=value;option.textContent=title;
  presider.append(option);
 }
 presider.value=COMPLINE_MINISTER.NON_PRIEST;
 presider.setAttribute("aria-label","Compline presiding minister");
 const load=txt(d,"button","Read source preview");load.type="button";
 chooser.append(hours,date,mode,recitation,presider,load);root.append(chooser);
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
  root.removeAttribute("data-office-marian-source");
  load.disabled=false;
 }
 async function loadPreview(){
  invalidate();let token=serial;load.disabled=true;
  state.textContent="Reading exact pinned source sections…";
  try{
   const universalWitness=hours.value==="VESPERS"
    ?await readUniversalWitness?.():null;
   const christmasPrivate=hours.value==="COMPLINE"&&
    date.value>="2026-12-21"&&date.value<="2026-12-27";
   const yearBoundaryPrivate=hours.value==="COMPLINE"&&
    date.value>="2026-12-28"&&date.value<="2027-01-03";
   const epiphanyPrivate=hours.value==="COMPLINE"&&
    date.value>="2027-01-04"&&date.value<="2027-01-10";
   const postEpiphanyPrivate=hours.value==="COMPLINE"&&
    date.value>="2027-01-11"&&date.value<="2027-01-17";
   if((christmasPrivate||yearBoundaryPrivate||epiphanyPrivate||
     postEpiphanyPrivate)&&mode.value!=="la"){
    state.textContent="Christmas octave private source preview is Latin only.";
    return;
   }
   const source=postEpiphanyPrivate?
    await assembleJan11_17PrivateOfficeResearchReview({
     date:date.value,fetchSource
    }):
    epiphanyPrivate?
    await assembleJan04_10PrivateOfficeResearchReview({
     date:date.value,fetchSource
    }):
    yearBoundaryPrivate?
    await assembleDec28Jan03PrivateOfficeResearchReview({
     date:date.value,fetchSource
    }):
    christmasPrivate?
    await assembleChristmas2026PrivateOfficeResearchReview({
     date:date.value,fetchSource
    }):
    await assemblePrivateOfficeReview({
     hour:hours.value,date:date.value,fetchSource,universalWitness,
     languageMode:hours.value==="COMPLINE"&&mode.value==="la"?"latin":"trilingual"
    });
   if(token!==serial)return;
   const result=source.hour==="COMPLINE"&&source.status==="PRIVATE_SOURCE_TEXT_REVIEW"?
    projectComplineRecitation(source,{
     context:recitation.value,minister:presider.value
    }):source;
   if(result.status!=="PRIVATE_SOURCE_TEXT_REVIEW"){
    state.textContent="Source preview withheld: "+result.reason;
    return;
   }
   active=result;index=0;
   root.setAttribute("data-office-marian-source",
    result.events.find(e=>e.kind==="MARIAN_ANTIPHON")?.sourceId??"");
   state.textContent=result.hour+" · civil "+result.civilDate+
    " · Office "+result.officeDate+" · "+
    (result.readingEventCount?result.readingEventCount+" printed-ordinary moments · ":"")+
    result.eventCount+" source events · "+
    (result.openingPaterOmitted?"last-prayer examen":"recitation as selected")+
    (result.presidingMinister?" · "+result.presidingMinister.toLowerCase().replaceAll("_"," "):"")+
    " · NOT certified for public prayer";
   show();
  }catch(err){if(token===serial)state.textContent="Source unavailable: "+String(err?.message??err)}
  finally{if(token===serial)load.disabled=false}
 }
 load.addEventListener("click",loadPreview);
 hours.addEventListener("change",()=>{invalidate();
  recitation.disabled=hours.value!=="COMPLINE";
  presider.disabled=hours.value!=="COMPLINE";
  if(hours.value==="VESPERS")date.value="2026-11-28";
  state.textContent="Load the selected private source preview";
 });
 date.addEventListener("change",()=>{
  invalidate();
  if(date.value>="2026-12-21"&&date.value<="2027-01-17")mode.value="la";
  state.textContent="Load the selected private source preview";
 });
 recitation.addEventListener("change",()=>{if(active?.hour==="COMPLINE")void loadPreview()});
 presider.addEventListener("change",()=>{if(active?.hour==="COMPLINE")void loadPreview()});
 mode.addEventListener("change",()=>{
  if(active?.hour==="COMPLINE"&&active.availableLanguages?.length===1&&mode.value!=="la"){
   // A Latin source session never silently inherits a cached English/French
   // witness. Reload the separately sourced three-language review explicitly.
   void loadPreview();
  }else if(active)show();
 });
 recitation.disabled=hours.value!=="COMPLINE";
 presider.disabled=hours.value!=="COMPLINE";
 previous.addEventListener("click",()=>{if(active){index--;show()}});
 next.addEventListener("click",()=>{if(active){index++;show()}});
 invalidate();
 return Object.freeze({load:loadPreview,current:()=>active,dispose:()=>{serial++;root.replaceChildren()}});
}
