/**
 * Cinematic presentation for the shared two-axis devotional card reader.
 * Non-owning: does not advance canonical text, beads, or ritual state.
 * Approved Angelus artwork/shot metadata recovered from PR #1015.
 */
import {TANNER_ANGELUS_MASTER,tannerScene} from "./angelus-tanner-storyboard.js";
import "./devotional-cinematic-styles.js";
export const DEVOTIONAL_CINEMATIC_VERSION="devotional-card-interstitial-v1";
const shotId=Object.freeze({announcement:"annunciation",fiat:"fiat",incarnation:"incarnation",intercession:"collect"});
const timers=new WeakMap();
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
 if(!sheet||!scene||reduced(win))return false;
 const previous=timers.get(sheet);
 if(previous){win.clearTimeout(previous.timer);previous.node.remove();}
 sheet.ownerDocument.body.querySelectorAll(":scope > .aoDevoCinematicInterstitial").forEach(n=>n.remove());
 const doc=sheet.ownerDocument;
 const sceneNode=create(doc,"section","aoDevoCinematicInterstitial");
 sceneNode.dataset.aoDevotionalScene=scene.id;
 sceneNode.dataset.aoSceneArt=scene.image?"tanner":"text";
 sceneNode.setAttribute("aria-hidden","true");
 sceneNode.style.setProperty("--ao-devo-duration",scene.durationMs+"ms");
 const imageZone=create(doc,"div","aoDevoCinematicImageZone");
 if(scene.image){
  const img=create(doc,"img","aoDevoCinematicArtwork");
  img.alt="";img.setAttribute("aria-hidden","true");
  img.src=scene.image;img.decoding="async";img.loading="eager";
  const focal=scene.shot.focus;
  img.style.setProperty("--ao-devo-x",focal.x+"%");
  img.style.setProperty("--ao-devo-y",focal.y+"%");
  img.style.setProperty("--ao-devo-scale",String(focal.scale));
  img.addEventListener("error",()=>{imageZone.dataset.aoArtFailed="true";img.remove();},{once:true});
  imageZone.append(img);
 }else imageZone.dataset.aoArtAbsent="true";
 const heading=create(doc,"div","aoDevoCinematicHeading");
 heading.append(create(doc,"small","",language==="fr"?"PRIÈRE MARIALE":"MARIAN PRAYER"),
  create(doc,"h2","",scene.title),create(doc,"p","",scene.latin));
 if(scene.image)
  heading.append(create(doc,"small","aoDevoCinematicCredit",
   "Henry Ossawa Tanner · The Annunciation (1898) · Philadelphia Museum of Art"));
 sceneNode.append(imageZone,heading);
 doc.body.append(sceneNode);
 const timer=win.setTimeout(()=>{
  if(timers.get(sheet)?.node!==sceneNode)return;
  timers.delete(sheet);sceneNode.remove();
 },scene.durationMs+80);
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
