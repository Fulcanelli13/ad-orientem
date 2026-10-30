/**
 * Dual-axis devotional reader: one horizontally navigable named prayer card,
 * many vertically scrollable lit/muted paragraphs. Presentation only.
 * Canonical PRAY owner remains responsible for all texts and form selection.
 */
import {devotionalFocusIndex} from "./devotional-focus-geometry.js";

import {ensureDevotionalReadingRunway} from "./devotional-reading-runway.js";

import "./devotional-card-deck-styles.js";
import {updateDevotionalProgress} from "./devotional-progress.js";
import {angelusCommunalParts,stripGloriaRepetition} from "./angelus-folio-recitation.js";
export const DEVOTIONAL_CARD_SCHEMA="dual-axis-devotional-cards-v1";
const DATA={
 angelus:[
  ["announcement","The Announcement","L’Annonce","Angelus Domini",[0,1]],
  ["fiat","Mary’s Fiat","Le Fiat de Marie","Ecce ancilla Domini",[2,3]],
  ["incarnation","The Incarnation","L’Incarnation","Et Verbum caro factum est",[4,5]],
  ["intercession","Intercession","Intercession","Ora pro nobis",[6]],
  ["collect","The Collect","L’Oraison","Oremus",[7]]
 ],
 regina:[
  ["rejoice","Rejoice, O Queen of Heaven","Réjouissez-vous, Reine du ciel","Regina cæli",[0]],
  ["resurrection","He Is Risen","Il est ressuscité","Resurrexit",[1]],
  ["intercession","Pray for Us","Priez pour nous","Gaude et lætare",[2]],
  ["collect","Concluding Collect","Oraison finale","Oremus",[3]]
 ]
};
const APPENDIX=[
 ["doxology","Doxology","Doxologie","Gloria Patri",0],
 ["faithful-departed","For the Faithful Departed","Pour les fidèles défunts","Fidelium animæ",1],
 ["divine-assistance","Divine Assistance","Secours divin","Divinum auxilium",2]
];
export function angelusCardPlan({form="angelus",language="en",historicalConclusion=false}={}){
 if(!Object.hasOwn(DATA,form))throw new RangeError("Unknown canonical Marian form");
 const fr=language==="fr";
 const items=DATA[form].map(([id,en,titleFr,latin,indices])=>Object.freeze({
  id,title:fr?titleFr:en,latin,unitIndices:Object.freeze([...indices]),
  appendixIndex:null,ritual:id==="incarnation"?"profound-bow":null
 }));
 // The customary conclusion belongs on the Collect card, never extra cards.
 return Object.freeze(items);
}
function create(doc,tag,className,value){
 const x=doc.createElement(tag);x.className=className||"";
 if(value!==undefined)x.textContent=value;return x;
}
function voiceLine(doc,role,value){
 const row=create(doc,"span","aoAngelusDialogueLine "+role+" aoDevoParagraph");
 row.dataset.aoAngelusVoice=role;
 const sign=create(doc,"span","ao-liturgical-speaker",role==="response"?"℟.":"℣.");
 sign.dataset.aoSpeakerRole=role==="response"?"response":"versicle";
 row.append(sign,create(doc,"span","",value));return row;
}
function formattedFace(doc,text,recitationMode="individual",appendixIndex=0){
 const el=create(doc,"span","aoDevoAppendixFace");
 const lines=String(text||"").split("\n").filter(x=>x.trim());
 lines.forEach(line=>{
  const pair=line.match(/^\s*(?:℣|V|℟|R)\.\s*(.*)$/);
  const role=/^\s*(?:℟|R)\./.test(line)?"response":"leader";
  if(pair){el.append(voiceLine(doc,role,pair[1]));return}
  if(appendixIndex===0){
   // The canonical Appendix says "three times", but its text is not copied
   // three times in the data owner. Expand the three repetitions in the view.
   const prayer=stripGloriaRepetition(line);
   for(let i=0;i<3;i++){
    const repeat=create(doc,"span","aoFolioGloria");
    repeat.dataset.aoGloriaRepeat=String(i+1);
    const parts=recitationMode==="group"?angelusCommunalParts(prayer,"doxology"):null;
    if(parts)parts.forEach(p=>repeat.append(voiceLine(doc,p.role,p.text)));
    else repeat.append(create(doc,"span","aoDevoAppendixLine",prayer));
    el.append(repeat);
   }
   return;
  }
  el.append(create(doc,"span","aoDevoAppendixLine",line));
 });
 return el;
}
function appendixUnit(doc,v,l,language,recitationMode,appendixIndex){
 const el=create(doc,"article","aoP435930LitCard aoP435930PrayerUnit aoDevoAppendixUnit");
 el.dataset.aoAngelusUnit="appendix";
 el.dataset.aoAppendixIndex=String(appendixIndex);
 const b=create(doc,"button","");b.type="button";b.dataset.p435930CardFlip="";
 b.setAttribute("aria-label",language==="fr"?"Changer la langue de la prière":"Switch prayer language");
 const vern=create(doc,"span",""),lat=create(doc,"span","");
 vern.dataset.faceV="";lat.dataset.faceLa="";lat.hidden=true;
 vern.append(formattedFace(doc,v,recitationMode,appendixIndex));
 lat.append(formattedFace(doc,l,recitationMode,appendixIndex));
 b.append(vern,lat);el.append(b);
 return el;
}
function collectParagraphs(body,id){
 const all=[];
 for(const unit of body.querySelectorAll(".aoP435930PrayerUnit")){
  const voice=[...unit.querySelectorAll('[data-face-v] [data-ao-angelus-voice]')];
  const latin=[...unit.querySelectorAll('[data-face-la] [data-ao-angelus-voice]')];
  const repeated=[...unit.querySelectorAll("[data-face-v] .aoFolioGloria")];
  const paragraphs=voice.length?voice:repeated.length?repeated:[unit];
  // Individual Mode keeps a continuous V/R text block. The canonical first
  // Incarnation unit must still own the scroll-triggered gesture cue.
  if(id==="incarnation"&&!voice.length&&unit.dataset.aoAngelusUnit==="vr")
   unit.dataset.aoDevoCue="profound-bow";
  // Focus the actual visible translation, not only the vernacular face.
  latin.forEach((line,i)=>{line.classList.add("aoDevoParagraph");
   line.dataset.aoDevoParagraph=String(all.length+i);
   if(id==="incarnation"&&i===0)line.dataset.aoDevoCue="profound-bow";
  });
  for(let i=0;i<paragraphs.length;i++){
   const p=paragraphs[i];
   p.classList.add("aoDevoParagraph");
   p.dataset.aoDevoParagraph=String(all.length);
   if(id==="incarnation"&&i===0&&voice.length)p.dataset.aoDevoCue="profound-bow";
   all.push(p);
  }
 }
 return all;
}
function visible(el){return Boolean(el&&el.getClientRects().length)}
/**
 * Relocate the canonical Angelus DOM units; do not duplicate the prayer corpus,
 * recitation role markup, language flip handlers, or seasonal posture resolver.
 */
export function installAngelusCardDeck({mount,form="angelus",language="en",
 historicalConclusion=false,appendixText,recitationMode="individual",guided=false,initialIndex=0,onCardChange=()=>{},onCue=()=>{}}={}){
 const doc=mount?.ownerDocument,host=mount?.querySelector(".aoP435930AngelusSequence");
 if(!doc||!host)return null;
 if(host.dataset.aoDevotionalDeck==="v1")return host.__aoDevotionalDeck||null;
 const plan=angelusCardPlan({form,language,historicalConclusion});
 const units=[...host.querySelectorAll(":scope > .aoP435930PrayerUnit")];
 if(units.length!==(form==="angelus"?8:4))return null;
 const originalAppendix=mount.querySelector(".aoP435930Appendix");
 if(historicalConclusion&&(!appendixText?.vern||!appendixText?.latin||!originalAppendix))return null;
 const parts=historicalConclusion?{
  v:String(appendixText.vern).split(/\n\s*\n/),
  l:String(appendixText.latin).split(/\n\s*\n/)
 }:null;
 if(parts&&(parts.v.length!==3||parts.l.length!==3))return null;
 const timeline=create(doc,"nav","aoDevoTimeline");
 timeline.setAttribute("aria-label",language==="fr"?"Chronologie des prières":"Prayer timeline");
 const stops=create(doc,"div","aoDevoStops"),viewport=create(doc,"div","aoDevoCardViewport");
 const cards=[];
 plan.forEach((entry,i)=>{
  const stop=create(doc,"button","aoDevoStop");stop.type="button";stop.dataset.aoDevoJump=String(i);
  stop.setAttribute("aria-label",String(i+1)+": "+entry.title);
  stop.append(create(doc,"span","aoDevoStopNumber",String(i+1).padStart(2,"0")),
   create(doc,"span","aoDevoStopTitle",entry.title));
  stops.append(stop);
  const card=create(doc,"section","aoDevoCard");
  card.dataset.aoDevoCard=entry.id;card.dataset.aoDevoIndex=String(i);
  card.setAttribute("aria-label",entry.title);
  const header=create(doc,"header","aoDevoCardHead");
  header.append(create(doc,"small","aoDevoCardNumber",String(i+1)+" / "+plan.length),
   create(doc,"h2","aoDevoCardTitle",entry.title),
   create(doc,"p","aoDevoCardLatin",entry.latin));
  if(guided){
   const hints=form==="angelus"?{
    announcement:["The angel announces the Incarnation to Mary.","L’ange annonce à Marie l’Incarnation."],
    fiat:["Mary consents freely to the word of God.","Marie consent librement à la parole de Dieu."],
    incarnation:["The eternal Word truly assumed human nature.","Le Verbe éternel a véritablement assumé la nature humaine."],
    intercession:["Ask the Mother of God to pray for us.","Demandez à la Mère de Dieu d’intercéder pour nous."],
    collect:["The prayer joins the Incarnation to the Passion and Resurrection.","La prière unit l’Incarnation à la Passion et à la Résurrection."]
   }:null;
   const hint=hints?.[entry.id];
   if(hint)header.append(create(doc,"p","aoFolioGuidedHint",language==="fr"?hint[1]:hint[0]));
  }
  const body=create(doc,"div","aoDevoCardScroll");body.dataset.aoDevoScroll="";
  body.setAttribute("role","region");body.setAttribute("aria-label",entry.title);
  body.tabIndex=0; // Keyboard users can focus the scroll region and switch cards.
  entry.unitIndices.forEach(j=>body.append(units[j]));
  if(form==="angelus"&&entry.id==="collect"&&parts){
   APPENDIX.forEach(([id,en,titleFr,latin,appendixIndex])=>{
    const group=create(doc,"section","aoFolioConclusionPart");
    group.dataset.aoConclusionPart=id;
    group.append(create(doc,"h3","aoFolioConclusionHeading",language==="fr"?titleFr:en));
    group.append(appendixUnit(doc,parts.v[appendixIndex],parts.l[appendixIndex],language,recitationMode,appendixIndex));
    body.append(group);
   });
  }
  collectParagraphs(body,entry.id);
  card.append(header,body);viewport.append(card);cards.push(card);
 });
 timeline.append(stops);
 host.replaceChildren(timeline,viewport);host.dataset.aoDevotionalDeck="v1";
 // F04 bottom navigation is one more view of this SAME source-owned go()
 // cursor. No duplicate card index, liturgical text or completion state.
 const f04=mount.matches('[data-ao-f04-timeline="segments"]');
 const dock=f04?create(doc,"nav","aoDevoF04Dock"):null;
 const previous=dock?create(doc,"button","aoDevoF04Previous","‹"):null;
 const position=dock?create(doc,"span","aoDevoF04Position"):null;
 const next=dock?create(doc,"button","aoDevoF04Next",language==="fr"?"Suivant ›":"Next ›"):null;
 if(dock){
  dock.setAttribute("aria-label",language==="fr"?"Navigation des moments":"Prayer moment navigation");
  previous.type="button";previous.dataset.aoF04Previous="";
  previous.setAttribute("aria-label",language==="fr"?"Moment précédent":"Previous moment");
  next.type="button";next.dataset.aoF04Next="";
  next.setAttribute("aria-label",language==="fr"?"Moment suivant":"Next moment");
  dock.append(previous,position,next);host.append(dock);
 }
 host.classList.add("aoDevoDeck");
 originalAppendix?.remove();
 let index=0,lastParagraph=null,lastCue=null,raf=0;
 function focus(){
  raf=0;const body=cards[index]?.querySelector(".aoDevoCardScroll");
  if(!visible(body))return;
  const all=[...body.querySelectorAll(".aoDevoParagraph")].filter(visible);
  if(!all.length)return;
  if(body.dataset.aoFocusRunway!=="1"){
   ensureDevotionalReadingRunway(body,all,{ratio:.41});
   body.dataset.aoFocusRunway="1";
  }
  const active=devotionalFocusIndex(body,all,{ratio:.41});
  all.forEach((p,i)=>{
   // Nearby and passed lines remain readable in the Angelus; the current
   // prayer line alone receives full emphasis (editorial review 30 Oct).
   const strength=i===active?"1":Math.abs(i-active)===1?".45":".40";
   p.style.setProperty("--ao-devo-focus",strength);
   // Legacy Angelus styles contain important whole-unit opacity declarations.
   // The shared card paragraph controller is the single active focus owner.
   p.style.setProperty("opacity",strength,"important");
   p.dataset.aoDevoActive=i===active?"true":"false";
  });
  const current=all[active],cue=current.dataset.aoDevoCue||null;
  if(current!==lastParagraph){lastParagraph=current;
   if(cue!==lastCue){lastCue=cue;onCue(cue,{card:plan[index],paragraph:current})}
  }
 }
 const queue=()=>{if(!raf)raf=requestAnimationFrame(focus)};
 function go(target,{initial=false}={}){
  const nextIndex=Math.max(0,Math.min(cards.length-1,Number(target)||0));
  if(!initial&&nextIndex===index)return false;
  index=nextIndex;lastParagraph=null;lastCue=null;
  // A transient Incarnation bow cannot leak into the next prayer card.
  onCue(null,{card:plan[index],paragraph:null});
  cards.forEach((x,i)=>{x.hidden=i!==index;x.setAttribute("aria-hidden",i===index?"false":"true")});
  [...stops.children].forEach((x,i)=>{
   x.classList.toggle("active",i===index);
   x.setAttribute("aria-current",i===index?"step":"false");
  });
  updateDevotionalProgress(timeline,{index,total:plan.length,language});
  if(dock){
   previous.disabled=index===0;next.disabled=index===plan.length-1;
   position.textContent=language==="fr"?"Moment "+(index+1)+" sur "+plan.length:
    "Moment "+(index+1)+" of "+plan.length;
  }
  // Keep timeline item visible without scrolling the vertical Prayer mount.
  const button=stops.children[index],rail=stops;
  rail.scrollLeft=Math.max(0,button.offsetLeft-rail.offsetLeft-(rail.clientWidth-button.clientWidth)/2);
  queue();
  if(!initial)onCardChange(plan[index],index);
  return true;
 }
 let touch=null,lastHorizontalSwipe=0;
 host.addEventListener("touchstart",e=>{
  if(e.touches.length!==1||e.target.closest(".aoDevoTimeline,a,input,textarea,select,summary,[contenteditable],[data-ao-devo-no-swipe],button:not([data-p435930-card-flip])")){
   touch=null;return;
  }
  touch={x:e.touches[0].clientX,y:e.touches[0].clientY,at:Date.now()};
 },{passive:true});
 host.addEventListener("touchcancel",()=>{touch=null},{passive:true});
 host.addEventListener("touchend",e=>{
  if(!touch||e.changedTouches.length!==1)return;
  const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
  const elapsed=Date.now()-touch.at;touch=null;
  if(elapsed<=1300&&Math.abs(dx)>=72&&Math.abs(dx)>Math.abs(dy)*1.35){
   lastHorizontalSwipe=Date.now();
   go(index+(dx<0?1:-1));
  }
 },{passive:true});
 // Text faces are language-flip buttons. A horizontal swipe over their text
 // changes cards, never accidentally flips the language on synthetic click.
 host.addEventListener("click",e=>{
  if(Date.now()-lastHorizontalSwipe<450&&e.target.closest("[data-p435930-card-flip]")){
   e.preventDefault();e.stopImmediatePropagation();
  }
 },true);
 host.addEventListener("keydown",e=>{
  if(e.altKey||e.ctrlKey||e.metaKey||e.shiftKey||!["ArrowLeft","ArrowRight"].includes(e.key)||
   e.target.closest("button,a,input,textarea,select,summary,[contenteditable]"))return;
  e.preventDefault();
  go(index+(e.key==="ArrowRight"?1:-1));
 });
 host.addEventListener("click",e=>{
  const previousClick=e.target.closest("[data-ao-f04-previous]");
  const nextClick=e.target.closest("[data-ao-f04-next]");
  if(previousClick||nextClick){
   e.preventDefault();go(index+(nextClick?1:-1));return;
  }
  if(e.target.closest("[data-p435930-card-flip]")){
   const currentBody=cards[index]?.querySelector(".aoDevoCardScroll");
   if(currentBody)delete currentBody.dataset.aoFocusRunway;
   queueMicrotask(queue);
  }
  const b=e.target.closest("[data-ao-devo-jump]");
  if(!b)return;e.preventDefault();e.stopPropagation();
  go(+b.dataset.aoDevoJump);
 });
 cards.forEach(card=>card.querySelector(".aoDevoCardScroll")?.addEventListener("scroll",queue,{passive:true}));
 doc.defaultView?.addEventListener("resize",()=>{
  cards.forEach(c=>{const body=c.querySelector(".aoDevoCardScroll");if(body)delete body.dataset.aoFocusRunway});
  queue();
 },{passive:true});
 go(initialIndex,{initial:true});
 const api=Object.freeze({schema:DEVOTIONAL_CARD_SCHEMA,plan,current:()=>index,go,cards:()=>cards.length,sync:queue});
 host.__aoDevotionalDeck=api;
 return api;
}
