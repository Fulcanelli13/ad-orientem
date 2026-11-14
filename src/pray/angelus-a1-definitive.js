/**
 * Angelus / Regina Cæli A1 definitive presentation adapter.
 * Preserves canonical text, seasonal form, recitation, local ritual cues,
 * app navigation, and the existing devotional card deck.
 * Owner-selected prayer distinction: Caption (no style switch).
 */
import "./angelus-a1-definitive-styles.js";
import {RELEASED_MODULE_PAINTINGS} from "../art/released-module-paintings.v1.js";

export const ANGELUS_A1_VERSION="angelus-a1-three-bells-caption-v1";
export const ANGELUS_A1_TREATMENT="caption";
const CAMERA=Object.freeze({
 angelus:{a:[.68,.22,1.55],b:[.22,.38,1.6],c:[.42,.17,1.22],w:[.46,.34,1]},
 regina:{a:[.55,.12,1.6],b:[.52,.3,1.15],c:[.3,.74,1.35],w:[.5,.4,1]},
 cavallino:{a:[.37,.08,1.55],b:[.38,.33,1.5],c:[.26,.56,1.6],w:[.4,.42,1]}
});
const STAGE_FRAMES={angelus:["a","b","c","w","w"],regina:["a","b","c","w"]};
const STAGE_TITLES={
 angelus:["Angelus Domini","Ecce ancilla","Et Verbum caro","Oremus","Conclusio"],
 regina:["Regina cæli","Resurrexit","Gaude et lætare","Conclusio"]
};
const LABELS={hail:"Ave Maria",collect:"Oratio"};
/**
 * Gate strictly to released exact photographs. Candidate ratings, museum URLs,
 * and the globally rejected Bouts photograph never authorize a live painting.
 */
export function angelusA1Painting({form="angelus",dateKey=""}={}){
 const christmas=form==="angelus"&&/^\d{4}-(?:12-(?:2[5-9]|3[01])|01-(?:0[1-9]|1[0-3]))$/.test(String(dateKey));
 const id=form==="regina"?"regina":christmas?"cavallino":"angelus";
 const art=RELEASED_MODULE_PAINTINGS[id];
 if(!art?.image)return null;
 return Object.freeze({
  id,src:new URL("../../"+art.image,import.meta.url).href,
  artist:art.artist,title:art.title,source:art.source,camera:CAMERA[id]
 });
}
export function angelusA1StagePlan(form="angelus",historicalConclusion=true){
 const stages=form==="regina"?STAGE_TITLES.regina:STAGE_TITLES.angelus;
 return historicalConclusion?stages:stages.slice(0,-1);
}
function camera(view,index=0,instant=false){
 if(!view?.isConnected)return;
 const img=view.querySelector(".aoA1Painting"),scene=view.querySelector(".aoA1Scene");
 const art=view.__aoA1Artwork;
 if(!img?.naturalWidth||!img.naturalHeight||!scene||!art)return;
 const W=scene.clientWidth,H=scene.clientHeight;
 if(!W||!H)return;
 const role=STAGE_FRAMES[view.dataset.aoA1Form]?.[index]||"w";
 const [fx,fy,z]=art.camera[role];
 const c=Math.max(W/img.naturalWidth,H/img.naturalHeight);
 const dw=img.naturalWidth*c*z,dh=img.naturalHeight*c*z;
 let x=.5*W-fx*dw,y=.27*H-fy*dh;
 x=Math.min(0,Math.max(W-dw,x));
 y=Math.min(0,Math.max(H-dh,y));
 if(instant)img.style.transition="none";
 img.style.width=img.naturalWidth*c+"px";
 img.style.height=img.naturalHeight*c+"px";
 img.style.transform="translate("+x+"px,"+y+"px) scale("+z+")";
 if(instant){void img.offsetWidth;img.style.transition=""}
}
export function syncAngelusA1(mount,index=0){
 const view=mount?.querySelector(".aoA1Definitive");
 if(!view)return false;
 const step=Math.max(0,Math.min(view.querySelectorAll(".aoA1Dots button").length-1,Number(index)||0));
 view.dataset.aoA1Stage=String(step);
 view.querySelectorAll(".aoA1Dots button").forEach((b,i)=>b.setAttribute("aria-current",i===step?"step":"false"));
 view.querySelectorAll(".aoA1BellGroup").forEach((group,i)=>group.classList.toggle("is-lit",i<=Math.min(3,step)));
 camera(view,step);
 return true;
}
function labelPrayerUnits(root){
 for(const unit of root.querySelectorAll(".aoDevoCard .aoP435930PrayerUnit")){
  const text=LABELS[unit.dataset.aoAngelusUnit];
  if(!text||unit.querySelector(".aoA1Caption"))continue;
  const label=root.ownerDocument.createElement("div");
  label.className="aoA1Caption";label.setAttribute("aria-label",text);
  const span=root.ownerDocument.createElement("span");
  span.textContent=text;label.append(span);
  unit.insertBefore(label,unit.firstChild);
 }
 for(const heading of root.querySelectorAll(".aoFolioConclusionPart .aoFolioConclusionHeading")){
  if(heading.parentElement?.dataset.aoConclusionPart==="doxology")heading.textContent="Gloria Patri";
 }
}
function titleStageCards(host,plan){
 for(const [index,card] of [...host.querySelectorAll(".aoDevoCard")].entries()){
  const title=card.querySelector(".aoDevoCardTitle");
  if(!title||!plan[index])continue;
  const eyebrow=card.ownerDocument.createElement("span");
  eyebrow.className="aoA1Eyebrow";
  eyebrow.textContent=plan[index].title;
  title.parentElement.insertBefore(eyebrow,title);
  title.textContent=plan[index].latin;
 }
}
function anchorRitualIcon(card,markup){
 if(!markup)return;
 const first=card.querySelector(".aoP435930PrayerUnit");
 if(!first)return;
 for(const face of first.querySelectorAll("[data-face-v],[data-face-la]")){
  const paragraph=face.querySelector(".aoAngelusDialogueLine");
  if(paragraph?.querySelector(".aoA1IconSlot"))continue;
  const slot=card.ownerDocument.createElement("span");
  slot.className="aoA1IconSlot";slot.setAttribute("aria-hidden","true");
  slot.innerHTML=markup;
  if(paragraph){paragraph.insertBefore(slot,paragraph.firstChild);continue}
  // In individual recitation the first Gloria is a continuous line.
  // Keep its posture icon in THAT line's scrolling row, not a fixed rail.
  const line=face.querySelector(".aoFolioGloria .aoDevoAppendixLine");
  if(!line)continue;
  const text=card.ownerDocument.createElement("span");
  text.className="aoA1AppendixText";text.textContent=line.textContent;
  line.classList.add("aoA1AppendixIconRow");
  line.replaceChildren(slot,text);
 }
}
let current=null;
export function decorateAngelusA1({mount,form="angelus",language="en",dateKey="",
 postureMarkup="",gestureMarkup="",cardDeck=null}={}){
 const view=mount?.querySelector(".aoP435930AngelusReader"),
  host=view?.querySelector(".aoP435930AngelusSequence");
 if(!view||!host||!cardDeck||!host.querySelector(".aoDevoCard"))return false;
 const art=angelusA1Painting({form,dateKey});
 if(!art)return false;
 view.classList.add("aoA1Definitive");
 view.dataset.aoA1Form=form;
 view.dataset.aoA1Treatment=ANGELUS_A1_TREATMENT;
 view.__aoA1Artwork=art;
 const doc=view.ownerDocument;
 const scene=doc.createElement("div");scene.className="aoA1Scene";
 scene.setAttribute("aria-hidden","true");
 const img=doc.createElement("img");
 img.className="aoA1Painting";img.alt="";img.decoding="async";img.src=art.src;
 const scrim=doc.createElement("div");scrim.className="aoA1Scrim";
 const credit=doc.createElement("span");credit.className="aoA1ArtworkCredit";
 credit.textContent=art.artist+" · "+art.title;
 scene.append(img,scrim,credit);
 view.insertBefore(scene,view.firstChild);
 const dots=doc.createElement("nav");dots.className="aoA1Dots";
 dots.setAttribute("aria-label",language==="fr"?"Étapes de la prière":"Prayer stages");
 angelusA1StagePlan(form,cardDeck.plan.some(item=>item.id==="conclusion")).forEach((title,index)=>{
  const b=doc.createElement("button");b.type="button";
  b.dataset.aoA1Step=String(index);
  b.setAttribute("aria-label",String(index+1)+". "+title);
  const mark=doc.createElement("i");mark.setAttribute("aria-hidden","true");
  b.append(mark);dots.append(b);
 });
 dots.addEventListener("click",event=>{
  const b=event.target.closest("[data-ao-a1-step]");
  if(b)cardDeck.go(Number(b.dataset.aoA1Step));
 });
 view.append(dots);
 if(form==="angelus"){
  const bells=doc.createElement("div");bells.className="aoA1Bells";
  bells.setAttribute("aria-hidden","true");
  for(const count of [3,3,3,9]){
   const group=doc.createElement("span");group.className="aoA1BellGroup";
   for(let n=0;n<count;n++)group.append(doc.createElement("i"));
   bells.append(group);
  }
  view.append(bells);
 }
 labelPrayerUnits(view);
 titleStageCards(host,cardDeck.plan);
 for(const card of host.querySelectorAll(".aoDevoCard")){
  const gesture=form==="angelus"&&card.dataset.aoDevoCard==="incarnation";
  anchorRitualIcon(card,gesture?gestureMarkup:postureMarkup);
 }
 img.addEventListener("load",()=>camera(view,cardDeck.current(),true),{once:true});
 syncAngelusA1(mount,cardDeck.current());
 current=view;
 if(!globalThis.__aoA1ResizeBound&&typeof globalThis.addEventListener==="function"){
  globalThis.__aoA1ResizeBound=true;
  globalThis.addEventListener("resize",()=>{
   if(current?.isConnected)camera(current,Number(current.dataset.aoA1Stage)||0,true);
  },{passive:true});
 }
 return true;
}
