/**
 * Rosary presentation adapter. The historical player remains the sole owner of
 * mysteries, canonical prayers, bead cursor, methods, and fifteen-decade route.
 * This module provides a chapter timeline and card-local reading focus only.
 */
import "./rosary-dual-axis-styles.js";
export const ROSARY_DUAL_AXIS_SCHEMA="rosary-source-owned-dual-axis-v1";

const TITLES=Object.freeze({
 joy:[["The Annunciation","L’Annonciation"],["The Visitation","La Visitation"],["The Nativity","La Nativité"],["The Presentation","La Présentation"],["The Finding in the Temple","Le Recouvrement au Temple"]],
 sor:[["The Agony in the Garden","L’Agonie au Jardin"],["The Scourging","La Flagellation"],["The Crowning with Thorns","Le Couronnement d’épines"],["The Carrying of the Cross","Le Portement de Croix"],["The Crucifixion","La Crucifixion"]],
 glo:[["The Resurrection","La Résurrection"],["The Ascension","L’Ascension"],["Pentecost","La Pentecôte"],["The Assumption","L’Assomption"],["The Coronation of Mary","Le Couronnement de Marie"]],
 lum:[["The Baptism of Jesus","Le Baptême de Jésus"],["The Wedding at Cana","Les Noces de Cana"],["The Proclamation of the Kingdom","L’Annonce du Royaume"],["The Transfiguration","La Transfiguration"],["The Institution of the Eucharist","L’Institution de l’Eucharistie"]]
});
const node=(doc,tag,cls,txt)=>{
 const el=doc.createElement(tag);el.className=cls;
 if(txt!==undefined)el.textContent=txt;
 return el;
};
const visible=el=>el&&el.getClientRects().length>0&&!el.closest("[hidden],details:not([open])");

export function rosarySourceChapters(steps,{french=false}={}){
 if(!Array.isArray(steps)||!steps.length)return Object.freeze([]);
 const mystery=steps.map((step,index)=>({step,index})).filter(x=>x.step?.kind==="mystery"&&x.step?.phase==="decade");
 const chapters=[];
 if(mystery.length&&mystery[0].index>0)
  chapters.push({id:"opening",title:french?"Prières initiales":"Opening prayers",start:0});
 for(const [number,{step,index}] of mystery.entries()){
  const prefix=String(step?.id||"").slice(0,3);
  const ordinal=Number(String(step?.id||"").match(/(\d+)$/)?.[1])||(Number.isInteger(step?.mi)?step.mi+1:number+1);
  const pair=TITLES[prefix]?.[ordinal-1];
  const title=pair?.[french?1:0]||(french?"Mystère ":"Mystery ")+ordinal;
  chapters.push({id:"mystery-"+String(step?.id||number+1),title,start:index,mysteryId:String(step?.id||"")});
 }
 if(!chapters.length)return Object.freeze([]);
 const lastDecade=steps.findLastIndex(x=>x?.phase==="decade");
 if(lastDecade>=0&&lastDecade<steps.length-1)
  chapters.push({id:"closing",title:french?"Prières finales":"Closing prayers",start:lastDecade+1});
 return Object.freeze(chapters.map(c=>Object.freeze(c)));
}

export function installRosaryDualAxisReader({
 root,steps,currentStep=0,french=false,onChapter=()=>{}
}={}){
 const shell=root?.querySelector?.(".pbShell");
 const kind=steps?.[Number(currentStep)||0]?.kind;
 // The donor's mystery is a contemplation panel, not a prayer sheet.
 // Both are first-class canonical stages of the same Rosary chapter.
 const sheet=kind==="mystery"?
  (shell?.querySelector?.(".lab-contemplation")||shell?.querySelector?.(".lab-prayer-sheet")):
  (shell?.querySelector?.(".lab-prayer-sheet")||shell?.querySelector?.(".lab-contemplation"));
 if(!shell||!sheet||!shell.querySelector("[data-lab-rosary-next]"))return null;
 const chapters=rosarySourceChapters(steps,{french});if(!chapters.length)return null;
 const doc=sheet.ownerDocument;
 const step=Math.max(0,Math.min(steps.length-1,Number(currentStep)||0));
 let selected=0;
 for(let i=0;i<chapters.length;i++)if(chapters[i].start<=step)selected=i;
 const chapter=chapters[selected];
 // The canonically rendered prayer element is never cloned or replaced.
 sheet.classList.add("aoRosaryCardScroll");
 // The archived donor sets overflow:visible with a high-priority inline rule.
 // Local scroll must win without moving, cloning or modifying prayer content.
 sheet.style.setProperty("overflow-y","auto","important");
 sheet.style.setProperty("overflow-x","hidden","important");
 sheet.style.setProperty("height","min(52dvh,520px)","important");
 sheet.dataset.aoRosaryCard=chapter.id;
 sheet.dataset.aoRosarySourceStep=String(step);
 let timeline=shell.querySelector("[data-ao-rosary-timeline]");
 if(!timeline){
  timeline=node(doc,"nav","aoRosaryChapterTimeline aoDevoSequenceTimeline");
  timeline.dataset.aoRosaryTimeline=ROSARY_DUAL_AXIS_SCHEMA;
  timeline.setAttribute("aria-label",french?"Parcours des mystères":"Mystery and prayer timeline");
 }
 let header=shell.querySelector("[data-ao-rosary-card-header]");
 if(!header){
  header=node(doc,"header","aoRosaryCardHead");
  header.dataset.aoRosaryCardHeader="";
  header.append(node(doc,"small","aoRosaryCardNumber"),node(doc,"h2","aoRosaryCardTitle"));
 }
 // A source repaint may have moved the sheet; re-anchor presentation nodes.
 if(timeline.nextElementSibling!==header||header.nextElementSibling!==sheet){
  sheet.parentElement.insertBefore(timeline,sheet);
  sheet.parentElement.insertBefore(header,sheet);
 }
 const number=header.querySelector(".aoRosaryCardNumber");
 const title=header.querySelector(".aoRosaryCardTitle");
 if(number)number.textContent=String(selected+1).padStart(2,"0")+" / "+String(chapters.length).padStart(2,"0");
 if(title)title.textContent=chapter.title;
 const signature=chapters.map(x=>x.id+"@"+x.start).join("|")+(french?":fr":":en");
 if(timeline.dataset.aoRosaryTimelineSignature!==signature){
  timeline.dataset.aoRosaryTimelineSignature=signature;
  const previous=node(doc,"button","aoRosaryChapterArrow","←");
  const next=node(doc,"button","aoRosaryChapterArrow","→");
  previous.type=next.type="button";
  previous.dataset.aoRosaryMove="-1";next.dataset.aoRosaryMove="1";
  previous.setAttribute("aria-label",french?"Prière précédente":"Previous prayer card");
  next.setAttribute("aria-label",french?"Prière suivante":"Next prayer card");
  const stops=node(doc,"div","aoRosaryChapterStops");
  chapters.forEach((c,i)=>{
   const b=node(doc,"button","aoRosaryChapterStop");b.type="button";
   b.dataset.aoRosaryChapter=String(i);
   b.append(node(doc,"span","aoRosaryStopNumber",String(i+1).padStart(2,"0")),
            node(doc,"span","aoRosaryStopTitle",c.title));
   stops.append(b);
  });
  timeline.replaceChildren(previous,stops,next);
 }
 const stops=[...timeline.querySelectorAll("[data-ao-rosary-chapter]")];
 stops.forEach((b,i)=>{
  b.classList.toggle("active",i===selected);
  b.setAttribute("aria-current",i===selected?"step":"false");
 });
 const left=timeline.querySelector('[data-ao-rosary-move="-1"]');
 const right=timeline.querySelector('[data-ao-rosary-move="1"]');
 if(left)left.disabled=selected===0;
 if(right)right.disabled=selected===chapters.length-1;
 const track=timeline.querySelector(".aoRosaryChapterStops"),selectedStop=stops[selected];
 if(track&&selectedStop)
  track.scrollLeft=Math.max(0,selectedStop.offsetLeft-track.offsetLeft-
   (track.clientWidth-selectedStop.clientWidth)/2);

 const jump=index=>{
  if(!Number.isInteger(index)||index<0||index>=chapters.length||index===Number(timeline._aoRosaryCurrent))return false;
  // A chapter click delegates to the canonical bead API. No alternative
  // prayer state, navigation history or progress registry is created.
  if(onChapter(chapters[index].start,chapters[index],index)===false)return false;
  // The native player may repaint asynchronously. Update only the visual
  // projection immediately; the canonical cursor remains authoritative.
  timeline._aoRosaryCurrent=index;
  const labels=timeline.querySelectorAll("[data-ao-rosary-chapter]");
  labels.forEach((label,i)=>{
   label.classList.toggle("active",i===index);
   label.setAttribute("aria-current",i===index?"step":"false");
  });
  if(number)number.textContent=String(index+1).padStart(2,"0")+" / "+String(chapters.length).padStart(2,"0");
  if(title)title.textContent=chapters[index].title;
  if(left)left.disabled=index===0;
  if(right)right.disabled=index===chapters.length-1;
  return true;
 };
 // Refresh the per-mount handler: the native donor may replace its entire
 // sheet between canonical beads while retaining our timeline node.
 timeline._aoRosaryJump=jump;
 timeline._aoRosaryCurrent=selected;
 const win=doc.defaultView;
 // The archived player captures clicks high in the tree. Delegate named-card
 // selection at window capture and stop only a matched timeline control.
 if(!win.__aoRosaryChapterCaptureBound){
  win.__aoRosaryChapterCaptureBound=true;
  win.addEventListener("click",event=>{
   const button=event.target.closest?.("#aoPrayerBookRoot.open [data-ao-rosary-chapter],#aoPrayerBookRoot.open [data-ao-rosary-move]");
   if(!button)return;
   const host=button.closest("[data-ao-rosary-timeline]");
   if(!host)return;
   event.preventDefault();event.stopImmediatePropagation();
   const next=button.dataset.aoRosaryChapter!==undefined?
    Number(button.dataset.aoRosaryChapter):
    Number(host._aoRosaryCurrent)+Number(button.dataset.aoRosaryMove);
   host._aoRosaryJump?.(next);
  },true);
 }
 const focus=()=>{
  const all=[...sheet.querySelectorAll("[data-pb-vern],[data-pb-latin],p,blockquote")]
   .filter(visible).filter(x=>!x.closest(".lab-prayer-count,.lab-prayer-rubric"));
  // Prefer actual prayer faces; do not treat the whole ritual shell as text.
  const faces=all.filter(x=>x.matches("[data-pb-vern],[data-pb-latin]"));
  const rows=faces.length?faces:all.filter(x=>!faces.some(y=>y.contains(x)));
  if(!rows.length)return;
  const r=sheet.getBoundingClientRect(),y=r.top+r.height*.4;
  let active=0,best=Infinity;
  rows.forEach((x,i)=>{
   const b=x.getBoundingClientRect();
   const d=y<b.top?b.top-y:y>b.bottom?y-b.bottom:0;
   if(d<best){best=d;active=i}
  });
  rows.forEach((x,i)=>{
   x.classList.add("aoRosaryParagraph");
   x.dataset.aoDevoActive=i===active?"true":"false";
   x.style.setProperty("--ao-devo-focus",i===active?"1":".45");
  });
 };
 let frame=0;
 const schedule=()=>{if(!frame)frame=doc.defaultView.requestAnimationFrame(()=>{frame=0;focus()})};
 if(sheet.dataset.aoRosaryTouchBound!=="1"){
  sheet.dataset.aoRosaryTouchBound="1";
  let touch=null;
  sheet.addEventListener("touchstart",e=>{
   if(e.touches.length!==1||e.target.closest("button,a,summary,input,textarea,select")){touch=null;return}
   touch={x:e.touches[0].clientX,y:e.touches[0].clientY,at:Date.now()};
  },{passive:true});
  sheet.addEventListener("touchcancel",()=>touch=null,{passive:true});
  sheet.addEventListener("touchend",e=>{
   if(!touch)return;
   const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
   const elapsed=Date.now()-touch.at;touch=null;
   if(elapsed<=1300&&Math.abs(dx)>=72&&Math.abs(dx)>Math.abs(dy)*1.35){
    e.stopPropagation();
    const now=timeline._aoRosaryCurrent??selected;
    timeline._aoRosaryJump?.(now+(dx<0?1:-1));
   }
  },{passive:true});
  sheet.addEventListener("scroll",schedule,{passive:true});
 }
 schedule();
 return Object.freeze({schema:ROSARY_DUAL_AXIS_SCHEMA,chapters,current:selected,focus:schedule});
}
