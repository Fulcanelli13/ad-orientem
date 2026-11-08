/**
 * Native, Latin-only public reading presentation.
 * This module is only imported from a certification-gated Office route.
 * Source-originated text always enters through textContent.
 */
import {COMPLINE_CONTEXT,COMPLINE_MINISTER} from "./compline-recitation-projection.js";
import {loadPublishedLatinCompline}
 from "./latin-compline-public-release.js";

const create=(d,tag,cls,text)=>{
 const node=d.createElement(tag);
 if(cls)node.className=cls;
 if(text!==undefined)node.textContent=text;
 return node;
};
export function mountPublishedLatinCompline(root,{
 win=globalThis,date="2026-11-28",fetchSource=win?.fetch?.bind(win)
}={}){
 if(!root?.ownerDocument)throw Error("LATIN_COMPLINE_PUBLIC_MOUNT_REQUIRED");
 const d=root.ownerDocument;
 const section=create(d,"section","aoOfPublishedLatin");
 const title=create(d,"h2",null,"Completorium · Latine");
 const note=create(d,"p",null,
  "Breviarium Romanum · Compline · Saturday, 28 November 2026");
 const contextLabel=create(d,"label",null,"Recitation: ");
 const contextSelect=create(d,"select");
 for(const [id,name] of [
  [COMPLINE_CONTEXT.FINAL_PRAYER,"Final prayer of the day — examination of conscience"],
  [COMPLINE_CONTEXT.OTHER_TIME,"At another time — introductory Pater noster"]
 ]){
  const opt=create(d,"option",null,name);opt.value=id;contextSelect.append(opt);
 }
 contextSelect.value=COMPLINE_CONTEXT.FINAL_PRAYER;
 contextLabel.append(contextSelect);
 const ministerLabel=create(d,"label",null,"Presiding minister: ");
 const ministerSelect=create(d,"select");
 for(const [id,title] of [
  [COMPLINE_MINISTER.NON_PRIEST,"Solo or lay-led — Dómine exáudi"],
  [COMPLINE_MINISTER.PRIEST,"Priest presiding — Dóminus vobíscum"]
 ]){
  const option=create(d,"option",null,title);option.value=id;ministerSelect.append(option);
 }
 ministerSelect.value=COMPLINE_MINISTER.NON_PRIEST;
 ministerLabel.append(ministerSelect);
 const status=create(d,"p","aoOfPublishedStatus","Preparing Latin Compline");
 status.setAttribute("aria-live","polite");
 const frame=create(d,"article","aoOfFrame");
 const navigation=create(d,"nav","aoOfFrameControls");
 const previous=create(d,"button",null,"Previous");
 const count=create(d,"span");
 const next=create(d,"button",null,"Next");
 previous.type=next.type="button";
 navigation.append(previous,count,next);
 const provenance=create(d,"small","aoOfProvenance",
  "Roman Breviary, 1960 rubrics · Latin only · source references shown for each moment.");
 const sourceNotice=create(d,"a","aoOfProvenance","Divinum Officium Latin source · MIT licence and attribution");
 sourceNotice.href=new URL("src/office/LICENSE-DIVINUM-OFFICIUM-MIT.txt",win.location.href).href;
 sourceNotice.rel="noopener noreferrer";
 section.append(title,note,contextLabel,ministerLabel,status,frame,navigation,provenance,sourceNotice);
 root.replaceChildren(section);
 let active=null,index=0,sequence=0,disposed=false;
 function render(){
  if(!active)return;
  index=Math.max(0,Math.min(index,active.frames.length-1));
  const item=active.frames[index];
  frame.replaceChildren();
  frame.append(create(d,"small","aoOfEvent",
   item.kind.replaceAll("_"," ")+(item.label?" · "+item.label:"")));
  if(item.gestureRubrics?.la)frame.append(create(d,"small","aoOfEditorialNote","Rubrica · "+item.gestureRubrics.la));
  for(const line of item.texts.la||[])
   frame.append(create(d,"p","aoOfSourceLine",line));
  if(item.editorialRubric)frame.append(create(d,"small","aoOfEditorialNote",
   "Rubric — pause for an examination of conscience, not a spoken prayer"));
  frame.append(create(d,"small","aoOfProvenance",item.sourceId));
  count.textContent=(index+1)+" / "+active.frames.length;
  previous.disabled=index===0;
  next.disabled=index===active.frames.length-1;
 }
 async function load(){
  const token=++sequence;
  active=null;frame.replaceChildren();previous.disabled=next.disabled=true;
  status.textContent="Loading Latin Compline";
  try{
   const result=await loadPublishedLatinCompline({
    date,context:contextSelect.value,minister:ministerSelect.value,fetchSource
   });
   if(disposed||token!==sequence)return;
   if(result.status!=="PUBLIC_LATIN_COMPLINE"){
    status.textContent="Latin Compline not released: "+result.reason;
    return;
   }
   active=result;index=0;
   status.textContent="Latin Compline · "+result.readingEventCount+
    " reading moments · "+result.sourceFrameCount+" source frames";
   render();
  }catch(error){
   if(!disposed&&token===sequence)
    status.textContent="Latin Compline unavailable: "+String(error?.message??error);
  }
 }
 previous.addEventListener("click",()=>{if(active){index--;render()}});
 next.addEventListener("click",()=>{if(active){index++;render()}});
 contextSelect.addEventListener("change",()=>{void load()});
 ministerSelect.addEventListener("change",()=>{void load()});
 void load();
 return Object.freeze({dispose(){
  disposed=true;sequence++;root.replaceChildren();
 }});
}