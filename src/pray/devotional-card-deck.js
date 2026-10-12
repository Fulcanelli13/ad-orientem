/**
 * Dual-axis devotional reader: one horizontally navigable named prayer card,
 * many vertically scrollable lit/muted paragraphs. Presentation only.
 * Canonical PRAY owner remains responsible for all texts and form selection.
 */
import "./devotional-card-deck-styles.js";
export const DEVOTIONAL_CARD_SCHEMA="dual-axis-devotional-cards-v1";
const DATA={
 angelus:[
  ["announcement","The Announcement","L’Annonce","Angelus Domini",[0,1]],
  ["fiat","Mary’s Fiat","Le Fiat de Marie","Ecce ancilla Domini",[2,3]],
  ["incarnation","The Incarnation","L’Incarnation","Et Verbum caro factum est",[4,5]],
  ["intercession","Intercession and Collect","Intercession et oraison","Ora pro nobis / Oremus",[6,7]]
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
 if(form==="angelus"&&historicalConclusion)
  APPENDIX.forEach(([id,en,titleFr,latin,i])=>items.push(Object.freeze({
   id,title:fr?titleFr:en,latin,unitIndices:Object.freeze([]),appendixIndex:i,ritual:null
  })));
 return Object.freeze(items);
}
function create(doc,tag,className,value){
 const x=doc.createElement(tag);x.className=className||"";
 if(value!==undefined)x.textContent=value;return x;
}
function formattedFace(doc,text){
 const el=create(doc,"span","aoDevoAppendixFace");
 for(const line of String(text||"").split("\n").filter(x=>x.trim())){
  const pair=line.match(/^\s*(?:℣|V|℟|R)\.\s*(.*)$/);
  const role=/^\s*(?:℟|R)\./.test(line)?"response":"leader";
  if(pair){
   const row=create(doc,"span","aoAngelusDialogueLine "+role);
   row.dataset.aoAngelusVoice=role;
   const sig=create(doc,"span","ao-liturgical-speaker",role==="response"?"℟.":"℣.");
   sig.dataset.aoSpeakerRole=role==="response"?"response":"versicle";
   row.append(sig,create(doc,"span","",pair[1]));el.append(row);
  }else el.append(create(doc,"span","aoDevoAppendixLine",line));
 }
 return el;
}
function appendixUnit(doc,v,l,language){
 const el=create(doc,"article","aoP435930LitCard aoP435930PrayerUnit aoDevoAppendixUnit");
 el.dataset.aoAngelusUnit="appendix";
 const b=create(doc,"button","");b.type="button";b.dataset.p435930CardFlip="";
 b.setAttribute("aria-label",language==="fr"?"Changer la langue de la prière":"Switch prayer language");
 const vern=create(doc,"span",""),lat=create(doc,"span","");
 vern.dataset.faceV="";lat.dataset.faceLa="";lat.hidden=true;
 vern.append(formattedFace(doc,v));lat.append(formattedFace(doc,l));
 b.append(vern,lat);el.append(b);
 return el;
}
function collectParagraphs(body,id){
 const all=[];
 for(const unit of body.querySelectorAll(".aoP435930PrayerUnit")){
  const voice=[...unit.querySelectorAll('[data-face-v] [data-ao-angelus-voice]')];
  const paragraphs=voice.length?voice:[unit];
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
 historicalConclusion=false,appendixText,initialIndex=0,onCardChange=()=>{},onCue=()=>{}}={}){
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
 const previous=create(doc,"button","aoDevoNavArrow","←");
 previous.type="button";previous.dataset.aoDevoMove="-1";
 previous.setAttribute("aria-label",language==="fr"?"Carte précédente":"Previous card");
 const next=create(doc,"button","aoDevoNavArrow","→");
 next.type="button";next.dataset.aoDevoMove="1";
 next.setAttribute("aria-label",language==="fr"?"Carte suivante":"Next card");
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
  const body=create(doc,"div","aoDevoCardScroll");body.dataset.aoDevoScroll="";
  body.setAttribute("role","region");body.setAttribute("aria-label",entry.title);
  entry.unitIndices.forEach(j=>body.append(units[j]));
  if(entry.appendixIndex!==null)body.append(appendixUnit(doc,parts.v[entry.appendixIndex],
   parts.l[entry.appendixIndex],language));
  collectParagraphs(body,entry.id);
  card.append(header,body);viewport.append(card);cards.push(card);
 });
 timeline.append(previous,stops,next);
 host.replaceChildren(timeline,viewport);host.dataset.aoDevotionalDeck="v1";
 host.classList.add("aoDevoDeck");
 originalAppendix?.remove();
 let index=0,lastParagraph=null,lastCue=null,raf=0;
 function focus(){
  raf=0;const body=cards[index]?.querySelector(".aoDevoCardScroll");
  if(!visible(body))return;
  const all=[...body.querySelectorAll(".aoDevoParagraph")].filter(visible);
  if(!all.length)return;
  const r=body.getBoundingClientRect(),y=r.top+r.height*.41;
  let active=0,best=Infinity;
  all.forEach((p,i)=>{
   const rect=p.getBoundingClientRect();
   const distance=y<rect.top?rect.top-y:y>rect.bottom?y-rect.bottom:0;
   if(distance<best){active=i;best=distance}
  });
  all.forEach((p,i)=>{
   p.style.setProperty("--ao-devo-focus",i===active?"1":Math.abs(i-active)===1?".56":".30");
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
  cards.forEach((x,i)=>{x.hidden=i!==index;x.setAttribute("aria-hidden",i===index?"false":"true")});
  [...stops.children].forEach((x,i)=>{
   x.classList.toggle("active",i===index);
   x.setAttribute("aria-current",i===index?"step":"false");
  });
  previous.disabled=index===0;next.disabled=index===plan.length-1;
  // Keep timeline item visible without scrolling the vertical Prayer mount.
  const button=stops.children[index],rail=stops;
  rail.scrollLeft=Math.max(0,button.offsetLeft-rail.offsetLeft-(rail.clientWidth-button.clientWidth)/2);
  queue();
  if(!initial)onCardChange(plan[index],index);
  return true;
 }
 let touch=null;
 host.addEventListener("touchstart",e=>{
  if(e.touches.length!==1||e.target.closest("button,a,input,summary")){touch=null;return}
  touch={x:e.touches[0].clientX,y:e.touches[0].clientY,at:Date.now()};
 },{passive:true});
 host.addEventListener("touchend",e=>{
  if(!touch)return;
  const dx=e.changedTouches[0].clientX-touch.x,dy=e.changedTouches[0].clientY-touch.y;
  const elapsed=Date.now()-touch.at;touch=null;
  if(elapsed<=1300&&Math.abs(dx)>=72&&Math.abs(dx)>Math.abs(dy)*1.35)
   go(index+(dx<0?1:-1));
 },{passive:true});
 host.addEventListener("click",e=>{
  const b=e.target.closest("[data-ao-devo-jump],[data-ao-devo-move]");
  if(!b)return;e.preventDefault();e.stopPropagation();
  if(b.dataset.aoDevoJump!==undefined)go(+b.dataset.aoDevoJump);
  else go(index+Number(b.dataset.aoDevoMove||0));
 });
 cards.forEach(card=>card.querySelector(".aoDevoCardScroll")?.addEventListener("scroll",queue,{passive:true}));
 doc.defaultView?.addEventListener("resize",queue,{passive:true});
 go(initialIndex,{initial:true});
 const api=Object.freeze({schema:DEVOTIONAL_CARD_SCHEMA,plan,current:()=>index,go,cards:()=>cards.length,sync:queue});
 host.__aoDevotionalDeck=api;
 return api;
}
