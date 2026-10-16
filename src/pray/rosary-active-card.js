/**
 * Rosary active-card presentation, over the canonical PrayerBook donor.
 * Never copies prayer text or mutates beads/mysteries/translation state.
 */
import {rosaryCurrentChapter} from "./rosary-card-chapters.js";

const mounted=new WeakMap();
const visible=node=>{
 if(!node||node.hidden||node.closest("[hidden]"))return false;
 const style=node.ownerDocument.defaultView.getComputedStyle(node);
 return style.display!=="none"&&style.visibility!=="hidden"&&node.getClientRects().length>0;
};

export function rosaryAdjacentChapter(chapters,index,direction){
 if(!Array.isArray(chapters)||!chapters.length||!Number.isInteger(index))return null;
 if(direction!==1&&direction!==-1)return null;
 const current=rosaryCurrentChapter(chapters,index);
 return chapters[current+direction]||null;
}

function visibleParagraphs(scroll){
 const faces=[...scroll.querySelectorAll("[data-pb-vern],[data-pb-latin]")].filter(visible);
 const scopes=faces.length?faces:[scroll];
 const nodes=scopes.flatMap(face=>{
  const candidates=[...face.querySelectorAll(
   "p,li,.aoPrayerDialogueLine,.aoCustomaryLeader,.aoCustomaryResponse,.aoLitanyLine"
  )].filter(visible);
  // Select terminal units, not both the dialogue row and its children.
  const terminal=candidates.filter(x=>!candidates.some(other=>other!==x&&x.contains(other)));
  return terminal.length?terminal:[face];
 });
 return [...new Set(nodes)].filter(visible);
}

export function installRosaryActiveCard({root,stepIndex,chapters,navigate}={}){
 const shell=root?.querySelector(".pbShell");
 const prayer= shell?.querySelector(".lab-prayer-sheet");
 const prayerFlip=prayer?.querySelector(".lab-prayer-flip[data-pb-flip]");
 // Mystery introductions use the source-owned contemplation surface; there
 // is deliberately no flip or prayer sheet on those steps.
 const sheet=prayerFlip?prayer:shell?.querySelector(".lab-contemplation");
 const flip=prayerFlip||sheet;
 if(!sheet||!flip||!Array.isArray(chapters)||!chapters.length||
    typeof navigate!=="function")return null;
 const chapter=chapters[rosaryCurrentChapter(chapters,stepIndex)];
 if(!chapter)return null;
 sheet.classList.add("aoDevoCard","aoRosaryActiveCard");
 sheet.dataset.aoDevoCard=chapter.id;
 sheet.dataset.aoRosaryCanonicalStep=String(stepIndex);
 sheet.dataset.aoRosaryDualAxis="v1";
 // Keep the donor's existing H2, prayer-flip, and native Previous/Next controls.
 const title=sheet.querySelector("h2");
 sheet.dataset.aoRosaryCardKind=prayerFlip?"prayer":"contemplation";
 if(title){title.classList.add("aoDevoCardTitle");title.dataset.aoRosaryPrayerTitle="1";}
 flip.classList.add("aoDevoCardScroll","aoRosaryPrayerScroll");
 flip.dataset.aoRosaryPrayerScroll="1";
 const state=mounted.get(flip)||{frame:0,touch:null,paragraphs:[]};
 state.chapters=chapters;state.stepIndex=stepIndex;state.navigate=navigate;
 function focus(){
  state.frame=0;
  const paragraphs=visibleParagraphs(flip);
  const viewport=flip.getBoundingClientRect(),anchor=viewport.top+viewport.height*.39;
  let best=Infinity,chosen=0;
  paragraphs.forEach((node,i)=>{
   const rect=node.getBoundingClientRect();
   const distance=anchor<rect.top?rect.top-anchor:anchor>rect.bottom?anchor-rect.bottom:0;
   if(distance<best){best=distance;chosen=i;}
  });
  if(flip.scrollTop<=2)chosen=0;
  state.paragraphs.forEach(el=>{
   if(!paragraphs.includes(el)){el.classList.remove("aoDevoParagraph");delete el.dataset.aoDevoActive;}
  });
  paragraphs.forEach((el,i)=>{
   el.classList.add("aoDevoParagraph");
   el.dataset.aoDevoActive=String(i===chosen);
  });
  state.paragraphs=paragraphs;
  sheet.dataset.aoRosaryFocusCount=String(paragraphs.length);
  sheet.dataset.aoRosaryFocused=String(paragraphs.length?1:0);
 }
 const queue=()=>{
  if(!state.frame)state.frame=flip.ownerDocument.defaultView.requestAnimationFrame(focus);
 };
 if(!mounted.has(flip)){
  flip.addEventListener("scroll",queue,{passive:true});
  // A native Latin/vernacular toggle hides one face and reveals another
  // without scrolling. Refresh the lit passage without changing prayer text.
  const faces=flip.querySelectorAll("[data-pb-vern],[data-pb-latin]");
  if(faces.length&&typeof MutationObserver==="function"){
   const observer=new MutationObserver(queue);
   faces.forEach(face=>observer.observe(face,{attributes:true,attributeFilter:["hidden","style","class"]}));
   state.faceObserver=observer;
  }
  flip.addEventListener("touchstart",event=>{
   const control=event.target.closest?.("button,a,summary");
   if(event.touches.length!==1||(control&&control!==flip)){
    state.touch=null;return;
   }
   state.touch={x:event.touches[0].clientX,y:event.touches[0].clientY};
  },{capture:true,passive:true});
  flip.addEventListener("touchmove",event=>{
   if(!state.touch||event.touches.length!==1)return;
   const dx=event.touches[0].clientX-state.touch.x;
   const dy=event.touches[0].clientY-state.touch.y;
   if(Math.abs(dx)>35&&Math.abs(dx)>Math.abs(dy)*1.4&&event.cancelable)
     event.preventDefault();
  },{capture:true,passive:false});
  flip.addEventListener("touchend",event=>{
   const touch=state.touch;state.touch=null;
   if(!touch||event.changedTouches.length!==1)return;
   const dx=event.changedTouches[0].clientX-touch.x;
   const dy=event.changedTouches[0].clientY-touch.y;
   if(Math.abs(dx)<72||Math.abs(dx)<=Math.abs(dy)*1.4)return;
   const chapter=rosaryAdjacentChapter(state.chapters,state.stepIndex,dx<0?1:-1);
   if(!chapter)return;
   if(event.cancelable)event.preventDefault();
   event.stopImmediatePropagation();
   state.navigate(chapter.start);
  },{capture:true,passive:false});
  flip.addEventListener("touchcancel",()=>{state.touch=null},{passive:true});
  mounted.set(flip,state);
 }
 // Source-owned language toggles may reveal different semantic paragraphs
 // without replacing the shell or changing the current Rosary bead.
 queue();
 return {chapter:chapter.id,stepIndex,focus:queue};
}
