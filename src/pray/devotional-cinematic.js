/**
 * Cinematic presentation for the shared two-axis devotional card reader.
 * Non-owning: does not advance canonical text, beads, or ritual state.
 * Approved Angelus artwork/shot metadata recovered from PR #1015.
 */
import {TANNER_ANGELUS_MASTER,tannerScene} from "./angelus-tanner-storyboard.js";
import {approvedOpeningArtworkPool,selectSessionArtwork} from "./devotional-action-cinematics.js";
import "./devotional-cinematic-styles.js";
export const DEVOTIONAL_CINEMATIC_VERSION="devotional-card-interstitial-v1";
const shotId=Object.freeze({announcement:"annunciation",fiat:"fiat",incarnation:"incarnation",intercession:"collect"});
const timers=new WeakMap();
const shown=new WeakSet();
export function resetDevotionalOpening(doc=globalThis.document){
 const sheet=doc?.querySelector?.("#aoPray435930 .aoP435930Sheet");
 if(sheet){
  shown.delete(sheet);
  const prev=timers.get(sheet);
  if(prev){sheet.ownerDocument.defaultView?.clearTimeout?.(prev.timer);prev.node?.remove();}
  timers.delete(sheet);
 }
 doc?.body?.querySelectorAll?.(":scope > .aoDevoCinematicInterstitial")
   .forEach(x=>x.remove());
}
function reduced(win){
 return !!(win?.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches||
  win?.AO_CINEMATIC_V4312?.isReducedMotion?.()||
  win?.AO_RUNTIME_V8?.store?.getState?.()?.settings?.reducedMotion);
}
export function devotionalInterludePlan({form="angelus",card}={}){
 if(!card?.id||!card?.title)return null;
 const shot=form==="angelus"?tannerScene(shotId[card.id]||""):null;
 return Object.freeze({id:card.id,title:card.title,latin:card.latin||"",
  image:shot?TANNER_ANGELUS_MASTER.localPath:null,
  shot:shot?Object.freeze({focus:shot.focus,begin:shot.begin,effect:shot.effect}):null,
  durationMs:shot?Math.max(1900,shot.durationMs):1100});
}
function create(doc,tag,cls,text){
 const el=doc.createElement(tag);el.className=cls;
 if(text!==undefined)el.textContent=text;
 return el;
}
export function showDevotionalInterlude({mount,form="angelus",card,language="en",win=globalThis}={}){
 const scene=devotionalInterludePlan({form,card});
 const sheet=mount?.closest?.("#aoPray435930")?.querySelector?.(".aoP435930Sheet");
 // Art is a one-time opening tableau, not a four-part repeating
 // Annunciation/Tanner film. Never replay it on fiat or Incarnation.
 if(!sheet||!scene||form!=="angelus"||card?.id!=="announcement"||shown.has(sheet))return false;
 const approved=approvedOpeningArtworkPool(win?.AO_SACRED_ART_APPROVED??[],"ANNUNCIATION");
 let previousId=null;
 try{previousId=win?.sessionStorage?.getItem?.("ao-angelus-last-approved-art")??null}catch{}
 const selected=selectSessionArtwork(approved,previousId,()=>win?.Math?.random?.()??Math.random());
 // A blank full-screen art panel would be more distracting than prayer.
 // Fail closed until the independently curated approved art records arrive.
 if(!selected)return false;
 shown.add(sheet);
 try{win?.sessionStorage?.setItem?.("ao-angelus-last-approved-art",selected.id)}catch{}
 const previous=timers.get(sheet);
 if(previous){win.clearTimeout(previous.timer);previous.node.remove();}
 sheet.ownerDocument.body.querySelectorAll(":scope > .aoDevoCinematicInterstitial").forEach(n=>n.remove());
 const doc=sheet.ownerDocument;
 const sceneNode=create(doc,"section","aoDevoCinematicInterstitial");
 sceneNode.dataset.aoDevotionalScene=scene.id;
 sceneNode.dataset.aoSceneArt=selected?"approved-opening-art":"text";
 sceneNode.dataset.aoMotion=reduced(win)?"static":"standard";
 sceneNode.setAttribute("aria-hidden","true");
 sceneNode.style.setProperty("--ao-devo-duration",scene.durationMs+"ms");
 const imageZone=create(doc,"div","aoDevoCinematicImageZone");
 if(selected){
  const img=create(doc,"img","aoDevoCinematicArtwork");
  img.alt="";img.setAttribute("aria-hidden","true");
  img.src=selected.localPath;img.decoding="async";img.loading="eager";
  // No forced camera pan/crop over previously approved artwork.
  img.style.setProperty("--ao-devo-x","50%");
  img.style.setProperty("--ao-devo-y","50%");
  img.style.setProperty("--ao-devo-scale","1");
  img.addEventListener("error",()=>{imageZone.dataset.aoArtFailed="true";img.remove();},{once:true});
  imageZone.append(img);
 }else imageZone.dataset.aoArtAbsent="true";
 const heading=create(doc,"div","aoDevoCinematicHeading");
 heading.append(create(doc,"small","",language==="fr"?"PRIÈRE MARIALE":"MARIAN PRAYER"),
  create(doc,"h2","",scene.title),create(doc,"p","",scene.latin));
 if(selected)
  heading.append(create(doc,"small","aoDevoCinematicCredit",
   selected.artist+" · "+selected.title));
 sceneNode.append(imageZone,heading);
 doc.body.append(sceneNode);
 const timer=win.setTimeout(()=>{
  if(timers.get(sheet)?.node!==sceneNode)return;
  timers.delete(sheet);sceneNode.remove();
 },reduced(win)?1600:2200);
 timers.set(sheet,{node:sceneNode,timer});
 return true;
}
export function showDevotionalParagraphCue({mount,cue}={}){
 const card=mount?.querySelector?.(".aoDevoCard:not([hidden])");
 if(!card)return false;
 card.removeAttribute("data-ao-gesture-cinematic");
 if(cue!=="profound-bow")return true;
 const win=card.ownerDocument.defaultView;
 if(reduced(win))return true;
 card.dataset.aoGestureCinematic="profound-bow";
 return true;
}
