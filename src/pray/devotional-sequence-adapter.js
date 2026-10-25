/**
 * Shared dual-axis adapter for source-owned step readers (Stations and Mercy).
 * Does not own the prayer corpus or recitation sequence. Its only responsibilities:
 * title timeline, horizontal chapter gestures, card-local vertical focus.
 */
import {devotionalFocusIndex} from "./devotional-focus-geometry.js";

import {ensureDevotionalReadingRunway} from "./devotional-reading-runway.js";

import "./devotional-card-deck-styles.js";
import {updateDevotionalProgress} from "./devotional-progress.js";

export const SEQUENTIAL_DEVOTIONAL_SCHEMA = "dual-axis-sequential-devotional-v1";

/** The Novena stages are source-owned; this merely names their presentation. */
export function novenaStageChapters({pattern="STANDARD",sharedClosing=false}={}, {french=false}={}){
 const labels={
  prepare:["Recollection","Recueillement"],opening:["Opening prayer","Prière d’ouverture"],
  church:["Prayer of the Church","Prière de l’Église"],
  common:["Common prayers","Prières communes"],day:["Prayer of the day","Prière du jour"],
  invocation:["Invocation and prayers","Invocation et prières"],
  shared:["Closing prayer","Prière de conclusion"],
  close:["Conclusion","Conclusion"]
 };
 const keys=pattern==="HAMMER_MARIAN"
   ?["prepare","opening","church","day","invocation","close"]
   :pattern==="OPENING_DAY_COMMON_CLOSE"
   ?["prepare","opening","common","day","close"]
   :pattern==="COMMON_BEFORE_REPEAT"
   ?["prepare","common","day","close"]
   :sharedClosing?["prepare","day","common","shared","close"]
   :["prepare","day","common","close"];
 return Object.freeze(keys.map((id,i)=>Object.freeze({
  id,title:labels[id][french?1:0],start:i
 })));
}


const make=(doc,tag,klass,text)=>{
  const el=doc.createElement(tag);
  el.className=klass;
  if(text!==undefined)el.textContent=text;
  return el;
};
const visible=el=>Boolean(el?.getClientRects().length);

/** Group the canonical 62/63 bead events into seven/eight named prayer cards. */
export function mercyChapters(steps,{french=false}={}){
  if(!Array.isArray(steps)||!steps.length)return Object.freeze([]);
  const titles={
    opening:["Opening prayers","Prières initiales"],
    conclusion:["Closing invocations","Invocations finales"],
    "optional-conclusion":["Optional concluding prayer","Prière finale facultative"]
  };
  const chapters=[];
  steps.forEach((step,index)=>{
    const id=step.decade?"decade-"+step.decade:step.group;
    let chapter=chapters[chapters.length-1];
    if(!chapter||chapter.id!==id){
      const name=step.decade?
        (french?"Dizaine ":"Decade ")+step.decade:
        (titles[id]?.[french?1:0]||id);
      chapter={id,title:name,start:index,entries:[]};
      chapters.push(chapter);
    }
    chapter.entries.push({index,step});
  });
  return Object.freeze(chapters.map(chapter=>Object.freeze({
    id:chapter.id,title:chapter.title,start:chapter.start,
    entries:Object.freeze(chapter.entries.map(x=>Object.freeze(x)))
  })));
}


export function installSequentialDevotionalReader({
  mount,kind,chapters,activeIndex=0,onNavigate=()=>{},paragraphSelector,
  onFocus=()=>{},restoreStep=null,timelineLabel=null
}={}){
  const doc=mount?.ownerDocument;
  const card=mount?.querySelector(".aoDevoCard");
  const body=card?.querySelector(".aoDevoCardScroll");
  if(!doc||!card||!body||!Array.isArray(chapters)||!chapters.length)return null;
  if(!["stations","mercy","novena","library","daily","examen","benediction","adoration","confession","penitential","litany","sevenWords","fortyHours","meals","holyName","sacredHeart","communion","hymns","goodDeath","dyingCompanion"].includes(kind))throw new RangeError("Unexpected sequence owner");
  const index=Math.max(0,Math.min(chapters.length-1,Number(activeIndex)||0));
  body.tabIndex=0; // Vertical text scroll and horizontal card keys share one region.
  const parent=kind==="stations"?mount.querySelector(".aoP435930StationRail"):
    kind==="mercy"?mount.querySelector(".aoMercyReader"):
    kind==="novena"?mount.querySelector(".aoN1Reader"):
    ["daily","examen","meals","holyName","sacredHeart","communion","hymns","goodDeath","dyingCompanion"].includes(kind)?mount.querySelector(".aoTP381DonorBody"):
    kind==="benediction"?mount.querySelector(".aoP435930BenedictionReader"):
    kind==="adoration"?mount.querySelector(".aoP435930AdorationReader"):
    kind==="confession"?mount.querySelector(".aoP435930ConfessionReader"):
    ["penitential","litany","sevenWords","fortyHours"].includes(kind)?mount.querySelector(".aoP435930DevotionalGuidedReader"):
    mount.querySelector(".aoP435930LibraryReader");
  if(!parent)return null;
  let timeline;
  if(kind==="stations"){
    // Move the original canonical 14 step buttons; their native click owner stays.
    timeline=parent;
    const buttons=[...timeline.querySelectorAll("[data-p435930-station-step]")];
    if(buttons.length!==chapters.length)return null;
    const stops=make(doc,"div","aoDevoStops");
    for(const button of buttons){
      button.classList.add("aoDevoStop");
      button.querySelector("span")?.classList.add("aoDevoStopNumber");
      button.querySelector("b")?.classList.add("aoDevoStopTitle");
      stops.append(button);
    }
    timeline.replaceChildren(stops);
  }else{
    timeline=make(doc,"nav","aoDevoTimeline aoDevoSequenceTimeline");
    const stops=make(doc,"div","aoDevoStops");
    chapters.forEach((chapter,i)=>{
      const button=make(doc,"button","aoDevoStop");
      button.type="button";button.dataset.aoDevoChapter=String(i);
      button.append(make(doc,"span","aoDevoStopNumber",String(i+1).padStart(2,"0")),
        make(doc,"span","aoDevoStopTitle",chapter.title));
      stops.append(button);
    });
    timeline.append(stops);
    parent.insertBefore(timeline,card);
  }
  timeline.classList.add("aoDevoTimeline","aoDevoSequenceTimeline");
  timeline.dataset.aoDevotionalDeck=SEQUENTIAL_DEVOTIONAL_SCHEMA;
  timeline.setAttribute("aria-label",timelineLabel||(kind==="stations"?"Station timeline":"Prayer timeline"));
  const stops=timeline.querySelector(".aoDevoStops");
  updateDevotionalProgress(timeline,{index,total:chapters.length,
    language:doc.documentElement?.lang?.toLowerCase().startsWith("fr")?"fr":"en"});
  [...stops.children].forEach((b,i)=>{
    b.classList.toggle("active",i===index);
    b.setAttribute("aria-current",i===index?"step":"false");
  });
  const selected=stops.children[index];
  stops.scrollLeft=Math.max(0,selected.offsetLeft-stops.offsetLeft-
    (stops.clientWidth-selected.clientWidth)/2);
  card.dataset.aoDevoCard=chapters[index].id;
  card.dataset.aoDevoIndex=String(index);
  const selectParagraphs=()=>[...body.querySelectorAll(paragraphSelector)]
    .filter(el=>!el.closest("details:not([open])"))
    .filter(el=>!el.closest(".aoP435930VRLine")||el.classList.contains("aoP435930VRLine"))
    // Seven Words historical witness has an outer .aoP435930Text container
    // and separately identified .aoP435930WitnessParagraph children.
    // The container isn't a second prayer paragraph: registering both
    // gives them overlapping focus territories and leaves some words dim.
    .filter(el=>kind!=="sevenWords"||
      !el.classList.contains("aoP435930Text")||
      !el.querySelector(".aoP435930WitnessParagraph"));
  let paragraphs=selectParagraphs();
  paragraphs.forEach(p=>p.classList.add("aoDevoParagraph"));
  let last=null,frame=0,userScrolled=false;
  function focus(){
    frame=0;
    const shown=paragraphs.filter(visible);
    if(!shown.length)return;
    if(body.dataset.aoFocusRunway!=="1"){
      ensureDevotionalReadingRunway(body,shown,{ratio:.40});
      body.dataset.aoFocusRunway="1";
    }
    let found=devotionalFocusIndex(body,shown,{ratio:.40});
    // On initial mount the canonical bead cursor is authoritative. Moving
    // to the next bead must not be undone by the viewport focus heuristics.
    if(!userScrolled&&Number.isInteger(restoreStep)){
      const selected=shown.findIndex(p=>Number(p.dataset.aoMercyStep)===restoreStep);
      if(selected>=0)found=selected;
    }else if(body.scrollTop<2)found=0;
    shown.forEach((p,i)=>{
      // A liturgical prayer is never muted behind instructional focus cues.
      // Adoration/Benediction retain subtle focus only for their guidance.
      const canonicalPrayer=(kind==="adoration"||kind==="benediction")&&
        Boolean(p.closest(".aoP435930Prayer"));
      // The complete examination and preparation text must remain readable:
      // highlighting one question must not hide other possible sins to review.
      const confessionPrimary=kind==="confession"&&
        Boolean(p.closest(".aoP435930ConfOneCard,.aoP435930Prayer"));
      // Keep both halves of the public V./R. and St Alphonsus's prayer legible;
      // focus still determines when the actual user reaches each posture cue.
      const stationsPrayer=kind==="stations"&&
        Boolean(p.closest(".aoP435930VRLine,.aoP435930StationPrayer"));
      const power=canonicalPrayer||confessionPrimary||stationsPrayer?"1":i===found?"1":Math.abs(i-found)===1?".56":".30";
      p.style.setProperty("--ao-devo-focus",power);
      p.style.setProperty("opacity",power,"important");
      p.dataset.aoDevoActive=i===found?"true":"false";
    });
    if(last!==shown[found]){last=shown[found];if(userScrolled)onFocus(last)}
  }
  const queue=()=>{if(!frame)frame=doc.defaultView.requestAnimationFrame(focus)};
  if(Number.isInteger(restoreStep)&&restoreStep>=0){
    const target=paragraphs.find(x=>Number(x.dataset.aoMercyStep)===restoreStep);
    if(target)body.scrollTop=Math.max(0,target.offsetTop-body.offsetTop-body.clientHeight*.25);
  }
  function go(i){
    const n=Number(i);
    if(!Number.isInteger(n)||n<0||n>=chapters.length||n===index)return false;
    onNavigate(n,chapters[n]);
    return true;
  }
  timeline.addEventListener("click",e=>{
    const b=e.target.closest("[data-ao-devo-chapter]");
    if(!b)return;
    e.preventDefault();e.stopPropagation();
    go(Number(b.dataset.aoDevoChapter));
  });
  body.addEventListener("keydown",e=>{
    if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||!["ArrowLeft","ArrowRight"].includes(e.key)||
      e.target.closest("button,a,input,textarea,select,summary,[contenteditable]"))return;
    e.preventDefault();
    go(index+(e.key==="ArrowRight"?1:-1));
  });
  let touch=null,lastHorizontalSwipe=0;
  body.addEventListener("touchstart",e=>{
    if(e.touches.length!==1||e.target.closest("a,input,textarea,select,summary,[contenteditable],[data-ao-devo-no-swipe],button:not([data-p435930-card-flip]):not([data-tp381-flip]):not([data-p435930-flip])")){touch=null;return}
    touch={x:e.touches[0].clientX,y:e.touches[0].clientY,at:Date.now()};
  },{passive:true});
  body.addEventListener("click",e=>{
    if(Date.now()-lastHorizontalSwipe<450&&e.target.closest("[data-p435930-card-flip],[data-tp381-flip],[data-p435930-flip]")){
      e.preventDefault();e.stopImmediatePropagation();
    }
  },true);
  body.addEventListener("touchcancel",()=>{touch=null},{passive:true});
  body.addEventListener("touchend",e=>{
    if(!touch)return;
    const dx=e.changedTouches[0].clientX-touch.x;
    const dy=e.changedTouches[0].clientY-touch.y;
    const ms=Date.now()-touch.at;touch=null;
    if(ms<=1300&&Math.abs(dx)>=72&&Math.abs(dx)>Math.abs(dy)*1.35){
      lastHorizontalSwipe=Date.now();
      go(index+(dx<0?1:-1));
    }
  },{passive:true});
  body.addEventListener("scroll",()=>{userScrolled=true;queue()},{passive:true});
  doc.defaultView?.addEventListener("resize",()=>{
    if(!body.isConnected)return;
    delete body.dataset.aoFocusRunway;
    queue();
  },{passive:true});
  parent.addEventListener("click",event=>{
    if(event.target?.closest?.("[data-tp381-flip]")){
      delete body.dataset.aoFocusRunway;
      doc.defaultView?.queueMicrotask?.(queue);
    }
  });
  // The canonical Scripture service inserts real psalm/Gospel verses after
  // the shell has mounted. Reconcile only source-owned DOM additions; do not
  // synthesize verses or replace the Scripture text with a second copy.
  if(["penitential","sevenWords"].includes(kind)&&doc.defaultView?.MutationObserver){
    const observer=new doc.defaultView.MutationObserver(()=>{
      if(!card.isConnected){observer.disconnect();return}
      const current=selectParagraphs();
      if(current.length===paragraphs.length&&current.every((p,i)=>p===paragraphs[i]))return;
      paragraphs=current;
      delete body.dataset.aoFocusRunway;
      paragraphs.forEach(p=>p.classList.add("aoDevoParagraph"));
      queue();
    });
    observer.observe(body,{childList:true,subtree:true});
  }
  // The first Confession examination question must be active before the
  // initial phone frame; subsequent changes continue using scroll/rAF.
  if(["confession","meals","holyName","sacredHeart","communion","hymns","goodDeath","dyingCompanion"].includes(kind))focus();
  queue();
  return Object.freeze({
    schema:SEQUENTIAL_DEVOTIONAL_SCHEMA,kind,index,
    total:chapters.length,go,focus:queue
  });
}
