/**
 * Non-owning Rosary cinematic timeline.
 * Uses only the canonical AO_ROSARY_V381 steps/state and existing donor artwork.
 * Does not create a new bead state machine, progress counter or prayer corpus.
 */
import "./rosary-cinematic-styles.js";
import {antwerpPackReady,antwerpEntryFor} from "./rosary-antwerp-cycle.js";
import {ANTWERP_IMAGE_PACK_V1} from "./rosary-antwerp-licences.v1.js";

export const ROSARY_CINEMATIC_VERSION="rosary-cinematic-v1";
export const ROSARY_MYSTERY_SETS=Object.freeze({
 joyful:Object.freeze([
  ["joy1","Annunciation","Annonciation"],["joy2","Visitation","Visitation"],
  ["joy3","Nativity","Nativité"],["joy4","Presentation","Présentation"],
  ["joy5","Finding in the Temple","Recouvrement au Temple"]
 ]),
 sorrowful:Object.freeze([
  ["sor1","Agony in the Garden","Agonie au Jardin"],["sor2","Scourging","Flagellation"],
  ["sor3","Crowning with Thorns","Couronnement d’épines"],["sor4","Carrying the Cross","Portement de Croix"],
  ["sor5","Crucifixion","Crucifixion"]
 ]),
 glorious:Object.freeze([
  ["glo1","Resurrection","Résurrection"],["glo2","Ascension","Ascension"],
  ["glo3","Descent of the Holy Ghost","Descente du Saint-Esprit"],["glo4","Assumption","Assomption"],
  ["glo5","Coronation of Our Lady","Couronnement de Notre-Dame"]
 ]),
 luminous:Object.freeze([
  ["lum1","Baptism in the Jordan","Baptême au Jourdain"],["lum2","Wedding at Cana","Noces de Cana"],
  ["lum3","Proclamation of the Kingdom","Annonce du Royaume"],["lum4","Transfiguration","Transfiguration"],
  ["lum5","Institution of the Eucharist","Institution de l’Eucharistie"]
 ])
});
export const ROSARY_CINEMATIC_SHOTS=Object.freeze({
 joyful:Object.freeze(["threshold-light","meeting","birth-stillness","temple-light","temple-distance"]),
 sorrowful:Object.freeze(["night-vigil","stripped-light","shadow","processional-travel","absolute-stillness"]),
 glorious:Object.freeze(["dawn-reveal","vertical-ascension","radiance","vertical-ascension","radiance"]),
 luminous:Object.freeze(["water-light","table-reveal","landscape-travel","radiance","sacramental-stillness"])
});
const ROMAN=Object.freeze(["I","II","III","IV","V"]);
const clamp=n=>Math.max(0,Math.min(4,Number(n)||0));
const txt=(en,fr,lang)=>lang==="fr"?fr:en;

/** The first exact canonical 'mystery' step is the only jump target. */
export function rosaryCinematicMilestones(steps,set){
 const defs=ROSARY_MYSTERY_SETS[set];
 if(!defs||!Array.isArray(steps))return [];
 return defs.map(([id,en,fr],mi)=>{
  const index=steps.findIndex(step=>step?.kind==="mystery"&&step?.mi===mi);
  return Object.freeze({id,mi,index,en,fr,effect:ROSARY_CINEMATIC_SHOTS[set][mi]});
 });
}
export function rosaryCinematicCurrent(info){
 const set=String(info?.set||info?.state?.set||"");
 if(!ROSARY_MYSTERY_SETS[set])return null;
 const mi=info?.mi;
 if(!Number.isInteger(mi)||mi<0||mi>4)return null;
 return {set,mi,id:ROSARY_MYSTERY_SETS[set][mi][0]};
}
export function rosaryCinematicArtSource(root,info,win=globalThis){
 if(!root||!rosaryCinematicCurrent(info))return "";
 // Only mirror the already approved donor source, never retrieve external art
 // dynamically. Gallery acquisition and rights review remain separate.
 const image=root.querySelector?.(
  ".aoV401RosaryHero img,.lab-contemplation img,[data-ao-rosary-art] img,.r23-mystery-art,img[data-mystery-art]"
 );
 const src=image?.currentSrc||image?.getAttribute?.("src")||"";
 if(src&& !/^(?:javascript|data|blob):/i.test(src))return src;
 const preview=win?.AO_ROSARY_V401?.preview?.(info.set,info.mi)
    ||win?.AO_ROSARY_V41?.preview?.(info.set,info.mi);
 if(typeof preview==="string"&&!/^(?:javascript|data|blob):/i.test(preview))return preview;
 return "";
}
const reduceMotion=win=>!!win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
const E=(doc,tag,className,textContent)=>{
 const e=doc.createElement(tag);e.className=className;
 if(textContent)e.textContent=textContent;
 return e;
};
/**
 * The preserved PrayerBook installs capture handlers that can stop propagation
 * before a navigation click reaches an inserted nav element. A narrowly-scoped
 * window capture listener hands only cinematic buttons to the canonical bridge.
 * It never handles the donor's Next/Prev, prayer cards, beads or preference UI.
 */
export function bindRosaryCinematicCapture(win=globalThis){
 if(!win?.document||!win.addEventListener)return false;
 if(win.__aoRosaryCinematicCaptureV1)return true;
 win.addEventListener("click",event=>{
  const changeButton=event.target?.closest?.("[data-lab-rosary-change],[data-pb-rosary-change]");
  if(changeButton?.closest?.("#aoPrayerBookRoot.open") &&
      typeof win.AO_ROSARY_V381?.changeSet==="function"){
   event.preventDefault();event.stopImmediatePropagation();
   win.AO_ROSARY_V381.changeSet();
   return;
  }
  const collectionButton=event.target?.closest?.("[data-ao-rosary-art-collection]");
  const artHost=collectionButton?.closest?.(".aoRosaryCinema[data-ao-rosary-cinema-owner='v1']");
  if(artHost?.closest?.("#aoPrayerBookRoot.open") && typeof artHost.__aoRosaryCinemaSetCollection==="function"){
   event.preventDefault();event.stopPropagation();
   artHost.__aoRosaryCinemaSetCollection(collectionButton.dataset.aoRosaryArtCollection);
   return;
  }
  const button=event.target?.closest?.(".aoRosaryCinemaStop[data-ao-rosary-cinema-jump]");
  const host=button?.closest?.(".aoRosaryCinema[data-ao-rosary-cinema-owner='v1']");
  const root=host?.closest?.("#aoPrayerBookRoot.open");
  if(!button||!host||!root||typeof host.__aoRosaryCinemaOnJump!=="function")return;
  const target=Number(button.dataset.aoRosaryCinemaJump);
  if(!Number.isSafeInteger(target)||target<0)return;
  event.preventDefault();
  event.stopPropagation();
  host.__aoRosaryCinemaOnJump(target);
 },true);
 win.__aoRosaryCinematicCaptureV1=true;
 return true;
}
/**
 * Progressive enhancement: one visual surface, one horizontal chapter strip.
 * No mutation or re-parenting of native prayers, beads, donor controls.
 * The caller exclusively owns the actual state transition via onJump().
 */
export function syncRosaryCinematic({root,info,win=globalThis,language="en",onJump=()=>false}={}){
 const doc=win?.document,owner=root?.querySelector?.('.pbShell[data-ao-rosary-exact-donor="v3.4.14"]');
 if(!doc||!owner||!root.classList?.contains("open")||!info?.state)return false;
 const defs=ROSARY_MYSTERY_SETS[info.set];if(!defs)return false;
 const milestones=rosaryCinematicMilestones(info.steps,info.set);
 if(milestones.length!==5||milestones.some(m=>m.index<0))return false;
 let host=root.querySelector('.aoRosaryCinema[data-ao-rosary-cinema-owner="v1"]');
 if(host?.dataset.aoCinemaSet!==info.set||host?.dataset.aoCinemaLanguage!==language){
  host?.remove();host=null;
 }
 if(!host){
  host=E(doc,"section","aoRosaryCinema");
  host.dataset.aoRosaryCinemaOwner="v1";
  host.dataset.aoCinemaSet=info.set;
  host.dataset.aoCinemaLanguage=language;
  const nav=E(doc,"nav","aoRosaryCinemaTimeline");
  nav.setAttribute("aria-label",txt("Mystery timeline","Chronologie des mystères",language));
  milestones.forEach(({id,mi,en,fr,index})=>{
   const button=E(doc,"button","aoRosaryCinemaStop");
   button.type="button";button.dataset.aoRosaryCinemaJump=String(index);
   button.dataset.aoRosaryCinemaId=id;
   button.dataset.aoRosaryCinemaMi=String(mi);
   button.setAttribute("aria-label",ROMAN[mi]+". "+txt(en,fr,language));
   const number=E(doc,"span","aoRosaryCinemaNumber",ROMAN[mi]);
   const name=E(doc,"span","aoRosaryCinemaName",txt(en,fr,language));
   button.append(number,name);
   nav.append(button);
  });
  const stage=E(doc,"div","aoRosaryCinemaStage");
  stage.setAttribute("role","group");
  stage.setAttribute("aria-label",txt("Sacred artwork between mysteries","Art sacré entre les mystères",language));
  const image=E(doc,"img","aoRosaryCinemaImage");
  image.setAttribute("alt","");
  image.setAttribute("aria-hidden","true");
  image.setAttribute("decoding","async");
  image.setAttribute("loading","eager");
  const shade=E(doc,"div","aoRosaryCinemaShade");
  shade.setAttribute("aria-hidden","true");
  const copy=E(doc,"div","aoRosaryCinemaCopy");
  const index=E(doc,"span","aoRosaryCinemaKicker",txt("MYSTERY","MYSTÈRE",language));
  const title=E(doc,"h2","aoRosaryCinemaTitle");
  const caption=E(doc,"p","aoRosaryCinemaCaption",txt("Remain with the mystery.","Demeurez avec le mystère.",language));
  copy.append(index,title,caption);
  stage.append(image,shade,copy);
  const artMode=E(doc,"div","aoRosaryCinemaArtModes");
  artMode.dataset.aoRosaryArtModes="";
  artMode.setAttribute("role","group");
  artMode.setAttribute("aria-label",txt("Art collection","Collection d’œuvres",language));
  for(const [key,en,fr] of [["existing","Current","Actuel"],["antwerp","Antwerp","Anvers"]]){
   const button=E(doc,"button","aoRosaryCinemaArtMode",txt(en,fr,language));
   button.type="button";button.dataset.aoRosaryArtCollection=key;
   artMode.append(button);
  }
  const artCredit=E(doc,"p","aoRosaryCinemaArtCredit");
  artCredit.setAttribute("aria-live","off");
  stage.append(artMode,artCredit);
  host.append(nav,stage);
  const bar=root.querySelector(".aoP435930RosaryBar");
  if(bar)bar.insertAdjacentElement("afterend",host);
  else owner.querySelector(".lab-view-head,.pbTop,.pbHead,header")?.insertAdjacentElement("afterend",host);
  // onerror is assigned for each selected painting, so a failed museum image
  // can fall back to the existing art without two competing error handlers.
 }
 host.__aoRosaryCinemaOnJump=onJump;
 const artPack=ANTWERP_IMAGE_PACK_V1;
 const hasAntwerp=info.set!=="luminous"&&antwerpPackReady(artPack);
 const artModes=host.querySelector(".aoRosaryCinemaArtModes");
 if(artModes)artModes.hidden=!hasAntwerp;
 if(!hasAntwerp)root.dataset.aoRosaryArtCollection="existing";
 const collection=hasAntwerp&&root.dataset.aoRosaryArtCollection==="antwerp"?"antwerp":"existing";
 host.dataset.aoArtCollection=collection;
 host.__aoRosaryCinemaSetCollection=key=>{
  if(key!=="existing"&&!(key==="antwerp"&&hasAntwerp))return false;
  root.dataset.aoRosaryArtCollection=key;
  return syncRosaryCinematic({root,info,win,language,onJump});
 };
 artModes?.querySelectorAll("[data-ao-rosary-art-collection]").forEach(button=>{
  button.setAttribute("aria-pressed",String(button.dataset.aoRosaryArtCollection===collection));
 });
 bindRosaryCinematicCapture(win);
 const stage=host.querySelector(".aoRosaryCinemaStage");
 const image=stage.querySelector(".aoRosaryCinemaImage");
 const current=rosaryCinematicCurrent(info),mi=current?.mi??null;
 host.dataset.aoCinemaPhase=current?"decade":"preparation";
 const updated=host.dataset.aoCinemaMystery!==String(mi);
 host.dataset.aoCinemaMystery=String(mi);
 host.querySelectorAll(".aoRosaryCinemaStop").forEach((button,i)=>{
  const active=i===mi;
  button.classList.toggle("active",active);
  if(active)button.setAttribute("aria-current","step");
  else button.removeAttribute("aria-current");
 });
 if(!current){
  stage.hidden=true;return true;
 }
 stage.hidden=false;
 const m=milestones[mi];
 const title=stage.querySelector(".aoRosaryCinemaTitle");
 const kicker=stage.querySelector(".aoRosaryCinemaKicker");
 title.textContent=txt(m.en,m.fr,language);
 kicker.textContent=ROMAN[mi]+" / V · "+txt("MYSTERY","MYSTÈRE",language);
 stage.dataset.effect=m.effect;
 const originalArt=rosaryCinematicArtSource(root,info,win);
 const selectedArt=collection==="antwerp"?antwerpEntryFor(artPack,current.id):null;
 const art=selectedArt?.src||originalArt;
 const credit=stage.querySelector(".aoRosaryCinemaArtCredit");
 if(credit){
  credit.hidden=!selectedArt;
  credit.textContent=selectedArt?selectedArt.artist+" · Saint Paul’s Church, Antwerp · "+selectedArt.photographerCredit:"";
 }
 stage.dataset.aoOriginalAvailable=originalArt?"true":"false";
 if(art){
  if(image.getAttribute("src")!==art){
   stage.dataset.artwork="loading";
   image.onload=()=>{stage.dataset.artwork="ready"};
   image.onerror=()=>{
    if(selectedArt&&originalArt&&image.getAttribute("src")!==originalArt){
     stage.dataset.artwork="fallback";image.src=originalArt;
    }else{stage.dataset.artwork="unavailable";image.removeAttribute("src");}
   };
   image.src=art;
   if(image.complete&&image.naturalWidth>0)stage.dataset.artwork="ready";
  }
 }else{
  image.removeAttribute("src");stage.dataset.artwork="unselected";
 }
 if(updated&&!reduceMotion(win)){
  stage.classList.remove("aoRosaryCinemaEnter");
  void stage.offsetWidth;
  stage.classList.add("aoRosaryCinemaEnter");
 }
 if(updated){
  const button=host.querySelector(".aoRosaryCinemaStop.active");
  const nav=host.querySelector(".aoRosaryCinemaTimeline");
  if(button&&nav&&nav.scrollTo){
   nav.scrollTo({left:Math.max(0,button.offsetLeft-(nav.clientWidth-button.clientWidth)/2),
     behavior:reduceMotion(win)?"auto":"smooth"});
  }
 }
 root.dataset.aoRosaryCinemaActive="true";
 return true;
}
